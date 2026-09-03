import threading
import hashlib
import json
from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
import requests as http_requests
from django.conf import settings

from .models import Category, Product, Cart, CartItem, Order, OrderItem, Review, UserProfile
from .serializers import (
    RegisterSerializer, UserSerializer,
    CategorySerializer, ProductSerializer,
    ProductDetailSerializer, ReviewSerializer,
    CartSerializer, AddToCartSerializer,
    OrderSerializer, UserProfileSerializer,
)
from .emails import (
    send_welcome_email,
    send_new_user_notification,
    send_contact_email,
    send_order_confirmation,
    send_order_notification_admin,
)


# ─── AUTH ──────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        phone = request.data.get('phone', '')
        email = request.data.get('email', '')
        if phone:
            profile.phone = phone
            profile.save()
        if email:
            request.user.email = email
            request.user.save()
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')
        if not request.user.check_password(old_password):
            return Response({'error': 'Ancien mot de passe incorrect.'}, status=400)
        if len(new_password) < 6:
            return Response({'error': 'Le mot de passe doit faire au moins 6 caractères.'}, status=400)
        request.user.set_password(new_password)
        request.user.save()
        return Response({'message': 'Mot de passe modifié avec succès.'})


# ─── CATEGORIES ────────────────────────────────────────
class CategoryListView(generics.ListAPIView):
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [permissions.AllowAny]


# ─── PRODUITS ──────────────────────────────────────────
class ProductListView(generics.ListAPIView):
    serializer_class   = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class FeaturedProductsView(generics.ListAPIView):
    serializer_class   = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(is_active=True, is_featured=True)[:8]


class ProductDetailView(generics.RetrieveAPIView):
    queryset           = Product.objects.filter(is_active=True)
    serializer_class   = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field       = 'slug'


class ReviewView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, slug):
        try:
            product = Product.objects.get(slug=slug)
            reviews = product.reviews.all().order_by('-created_at')
            return Response(ReviewSerializer(reviews, many=True).data)
        except Product.DoesNotExist:
            return Response({'error': 'Produit introuvable.'}, status=404)

    def post(self, request, slug):
        try:
            product = Product.objects.get(slug=slug)
        except Product.DoesNotExist:
            return Response({'error': 'Produit introuvable.'}, status=404)

        if Review.objects.filter(product=product, user=request.user).exists():
            return Response({'error': 'Vous avez déjà laissé un avis.'}, status=400)

        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, product=product)
        return Response(serializer.data, status=201)


# ─── PANIER ────────────────────────────────────────────
class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data['product_id']
        size       = serializer.validated_data['size']
        quantity   = serializer.validated_data['quantity']

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Produit introuvable.'}, status=404)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product, size=size)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()
        return Response(CartSerializer(cart).data)

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({'message': 'Panier vidé.'})


class CartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id, cart__user=request.user)
            item.delete()
            return Response({'message': 'Article supprimé.'})
        except CartItem.DoesNotExist:
            return Response({'error': 'Article introuvable.'}, status=404)

    def patch(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id, cart__user=request.user)
            qty = request.data.get('quantity', 1)
            if int(qty) < 1:
                item.delete()
            else:
                item.quantity = int(qty)
                item.save()
            cart = Cart.objects.get(user=request.user)
            return Response(CartSerializer(cart).data)
        except CartItem.DoesNotExist:
            return Response({'error': 'Article introuvable.'}, status=404)


# ─── COMMANDES ─────────────────────────────────────────
class OrderListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Panier vide.'}, status=400)

        if not cart.items.exists():
            return Response({'error': 'Panier vide.'}, status=400)

        address = request.data.get('address', '')
        order   = Order.objects.create(
            user=request.user,
            total=cart.total,
            address=address,
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                size=item.size,
                quantity=item.quantity,
                price=item.product.price,
            )

        cart.items.all().delete()

        def send_emails():
            try:
                send_order_confirmation(order)
                send_order_notification_admin(order)
            except Exception:
                pass
        threading.Thread(target=send_emails, daemon=True).start()

        return Response(OrderSerializer(order).data, status=201)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


# ─── CONTACT ───────────────────────────────────────────
class ContactView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name    = request.data.get('name', '')
        email   = request.data.get('email', '')
        subject = request.data.get('subject', '')
        message = request.data.get('message', '')

        if not all([name, email, subject, message]):
            return Response({'error': 'Tous les champs sont requis.'}, status=400)

        def send_emails():
            try:
                send_contact_email(name, email, subject, message)
            except Exception:
                pass
        threading.Thread(target=send_emails, daemon=True).start()

        return Response({'message': 'Message envoyé avec succès.'})


# ─── PAIEMENT ──────────────────────────────────────────
def _create_order_from_cart(user, address, payment_method, clear_cart=True):
    """clear_cart=False laisse le panier intact : utile quand la création de
    la commande n'est qu'une étape préalable à un appel externe (PayDunya) qui
    peut encore échouer — on ne veut pas vider le panier du client pour rien."""
    cart  = Cart.objects.get(user=user)
    order = Order.objects.create(
        user=user,
        total=cart.total,
        address=address,
        status='pending',
        payment_method=payment_method,
    )
    for item in cart.items.all():
        OrderItem.objects.create(
            order=order,
            product=item.product,
            size=item.size,
            quantity=item.quantity,
            price=item.product.price,
        )
    if clear_cart:
        cart.items.all().delete()
    return order


def _send_order_emails(order):
    def send_emails():
        try:
            send_order_confirmation(order)
            send_order_notification_admin(order)
        except Exception:
            pass
    threading.Thread(target=send_emails, daemon=True).start()


class CreateCashOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Panier vide.'}, status=400)

        if not cart.items.exists():
            return Response({'error': 'Panier vide.'}, status=400)

        address = request.data.get('address', '')
        order   = _create_order_from_cart(request.user, address, payment_method='cash')
        _send_order_emails(order)

        return Response(OrderSerializer(order).data, status=201)


# ─── PAYDUNYA (Mobile Money / carte — Burkina Faso & Afrique de l'Ouest) ──
def paydunya_base_url():
    if settings.PAYDUNYA_MODE == 'live':
        return "https://app.paydunya.com/api/v1"
    return "https://app.paydunya.com/sandbox-api/v1"


def paydunya_headers():
    return {
        "Content-Type":         "application/json",
        "PAYDUNYA-MASTER-KEY":  settings.PAYDUNYA_MASTER_KEY,
        "PAYDUNYA-PRIVATE-KEY": settings.PAYDUNYA_PRIVATE_KEY,
        "PAYDUNYA-PUBLIC-KEY":  settings.PAYDUNYA_PUBLIC_KEY,
        "PAYDUNYA-TOKEN":       settings.PAYDUNYA_TOKEN,
    }


def _apply_paydunya_status(order, result):
    """Met à jour la commande à partir d'une réponse confirm() de PayDunya.
    On ne fait jamais confiance à un statut reçu sans l'avoir revérifié auprès
    de l'API PayDunya elle-même (hash + montant), pour éviter qu'un tiers ne
    forge une notification de paiement."""
    if result.get('response_code') != '00':
        return order

    expected_hash = hashlib.sha512(settings.PAYDUNYA_MASTER_KEY.encode()).hexdigest()
    if result.get('hash') != expected_hash:
        return order

    invoice = result.get('invoice') or {}
    try:
        if int(float(invoice.get('total_amount', 0))) != int(order.total):
            return order
    except (TypeError, ValueError):
        return order

    status = result.get('status')
    if status == 'completed' and order.payment_status != 'paid':
        order.payment_status = 'paid'
        order.status         = 'confirmed'
        order.save(update_fields=['payment_status', 'status'])
        _send_order_emails(order)
    elif status in ('cancelled', 'failed') and order.status == 'pending':
        order.status = 'cancelled'
        order.save(update_fields=['status'])

    return order


class PayDunyaInitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Panier vide.'}, status=400)

        if not cart.items.exists():
            return Response({'error': 'Panier vide.'}, status=400)

        address = request.data.get('address', '')
        phone   = request.data.get('phone', '')

        order = _create_order_from_cart(request.user, address, payment_method='online', clear_cart=False)

        payload = {
            "invoice": {
                "total_amount": int(order.total),
                "description":  f"Commande MALICHOU #{order.id}",
                "customer": {
                    "name":  request.user.username,
                    "email": request.user.email,
                    "phone": phone,
                },
            },
            "store": {
                "name": "MALICHOU",
            },
            "custom_data": {
                "order_id": order.id,
            },
            "actions": {
                "cancel_url":   f"{settings.FRONTEND_URL}/checkout?cancelled=1",
                "return_url":   f"{settings.FRONTEND_URL}/checkout/confirmation/{order.id}",
                "callback_url": f"{settings.BACKEND_URL}/api/payment/paydunya/notify/",
            },
        }

        try:
            res  = http_requests.post(
                f"{paydunya_base_url()}/checkout-invoice/create",
                json=payload, headers=paydunya_headers(), timeout=15,
            )
            data = res.json()
        except Exception as e:
            order.delete()
            return Response({'error': f"Impossible de contacter PayDunya : {e}"}, status=502)

        if data.get('response_code') == '00':
            order.payment_ref = data.get('token', '')
            order.save(update_fields=['payment_ref'])
            cart.items.all().delete()
            return Response({
                'payment_url': data.get('response_text'),
                'order_id':    order.id,
            })
        else:
            order.delete()
            return Response({'error': data.get('response_text', 'Erreur PayDunya')}, status=400)


class PayDunyaConfirmView(APIView):
    """Appelée par le frontend au retour de la page de paiement PayDunya
    (return_url). On revérifie toujours le paiement en direct auprès de
    PayDunya — jamais via les paramètres de l'URL de retour, qui pourraient
    être falsifiés par le client."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            order = Order.objects.get(id=request.data.get('order_id'), user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Commande introuvable.'}, status=404)

        if not order.payment_ref:
            return Response({'error': "Cette commande n'a pas de paiement en ligne associé."}, status=400)

        try:
            res    = http_requests.get(
                f"{paydunya_base_url()}/checkout-invoice/confirm/{order.payment_ref}",
                headers=paydunya_headers(), timeout=15,
            )
            result = res.json()
        except Exception as e:
            return Response({'error': f"Impossible de vérifier le paiement : {e}"}, status=502)

        order = _apply_paydunya_status(order, result)
        return Response(OrderSerializer(order).data)


class PayDunyaNotifyView(APIView):
    """IPN PayDunya : filet de sécurité si le client ne revient jamais sur le
    site après avoir payé (ex: paiement Mobile Money validé plus tard par
    USSD). On ne se sert du contenu du POST que pour retrouver le token de
    la facture, puis on revérifie tout auprès de l'API confirm() PayDunya."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = (
            request.POST.get('data[invoice][token]')
            or request.POST.get('token')
            or (request.data.get('token') if hasattr(request.data, 'get') else None)
        )
        if not token:
            raw = request.POST.get('data')
            if raw:
                try:
                    parsed = json.loads(raw)
                    token  = (parsed.get('invoice') or {}).get('token') or parsed.get('token')
                except (ValueError, AttributeError):
                    token = None

        if not token:
            return Response({'message': 'OK'})

        try:
            order = Order.objects.get(payment_ref=token)
        except Order.DoesNotExist:
            return Response({'message': 'OK'})

        try:
            res    = http_requests.get(
                f"{paydunya_base_url()}/checkout-invoice/confirm/{token}",
                headers=paydunya_headers(), timeout=15,
            )
            result = res.json()
            _apply_paydunya_status(order, result)
        except Exception:
            pass

        return Response({'message': 'OK'})