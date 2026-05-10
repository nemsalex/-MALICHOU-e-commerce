import threading
from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
import stripe
import requests as http_requests
from django.conf import settings
stripe.api_key = settings.STRIPE_SECRET_KEY

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
class CreatePaymentIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Panier vide.'}, status=400)

        if not cart.items.exists():
            return Response({'error': 'Panier vide.'}, status=400)

        amount = int(cart.total * 100)
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='xof',
            metadata={
                'user_id':  request.user.id,
                'username': request.user.username,
            }
        )

        return Response({
            'client_secret':   intent.client_secret,
            'amount':          amount,
            'publishable_key': settings.STRIPE_PUBLISHABLE_KEY,
        })


class CreateCashOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Panier vide.'}, status=400)

        if not cart.items.exists():
            return Response({'error': 'Panier vide.'}, status=400)

        address        = request.data.get('address', '')
        payment_method = request.data.get('payment_method', 'cash')

        order = Order.objects.create(
            user=request.user,
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

        cart.items.all().delete()

        def send_emails():
            try:
                send_order_confirmation(order)
                send_order_notification_admin(order)
            except Exception:
                pass
        threading.Thread(target=send_emails, daemon=True).start()

        return Response(OrderSerializer(order).data, status=201)


class CinetPayInitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Panier vide.'}, status=400)

        if not cart.items.exists():
            return Response({'error': 'Panier vide.'}, status=400)

        address        = request.data.get('address', '')
        transaction_id = f"MALICHOU-{request.user.id}-{int(__import__('time').time())}"
        amount         = int(cart.total)

        payload = {
            "apikey":         settings.CINETPAY_API_KEY,
            "site_id":        settings.CINETPAY_SITE_ID,
            "transaction_id": transaction_id,
            "amount":         amount,
            "currency":       "XOF",
            "description":    "Commande MALICHOU",
            "return_url":     "https://malichou-e-commerce.vercel.app/checkout/success",
            "notify_url":     "https://malichou-e-commerce-production.up.railway.app/api/payment/cinetpay/notify/",
            "customer_name":  request.user.username,
            "customer_email": request.user.email,
        }

        try:
            res = http_requests.post(
                "https://api-checkout.cinetpay.com/v2/payment",
                json=payload
            )
            data = res.json()

            if data.get('code') == '201':
                request.session['cinetpay_transaction_id'] = transaction_id
                request.session['cinetpay_address']        = address
                return Response({
                    'payment_url':    data['data']['payment_url'],
                    'transaction_id': transaction_id,
                })
            else:
                return Response({'error': data.get('message', 'Erreur CinetPay')}, status=400)

        except Exception as e:
            return Response({'error': str(e)}, status=500)


class CinetPayNotifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        transaction_id = request.data.get('cpm_trans_id')
        status         = request.data.get('cpm_result')

        if status == '00':
            try:
                user_id = transaction_id.split('-')[1]
                user    = User.objects.get(id=user_id)
                cart    = Cart.objects.get(user=user)

                order = Order.objects.create(
                    user=user,
                    total=cart.total,
                    address='',
                    payment_method='mobile',
                    payment_status='paid',
                    status='confirmed',
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

            except Exception as e:
                return Response({'error': str(e)}, status=500)

        return Response({'message': 'OK'})