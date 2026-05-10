from django.urls import path
from .views import (
    RegisterView, MeView, UpdateProfileView, ChangePasswordView,
    CategoryListView,
    ProductListView, FeaturedProductsView,
    ProductDetailView, ReviewView,
    CartView, CartItemView,
    OrderListView, OrderDetailView,
    ContactView,
    CreatePaymentIntentView, CreateCashOrderView,
    CinetPayInitView, CinetPayNotifyView,
)

from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings

def test_email(request):
    try:
        send_mail(
            'Test MALICHOU',
            'Email de test depuis Railway',
            settings.DEFAULT_FROM_EMAIL,
            [settings.ADMIN_EMAIL],
            fail_silently=False,
        )
        return JsonResponse({'status': 'Email envoyé !'})
    except Exception as e:
        return JsonResponse({'error': str(e)})









urlpatterns = [
    # Auth
    path('auth/register/',    RegisterView.as_view(),       name='register'),
    path('auth/me/',          MeView.as_view(),              name='me'),
    path('auth/profile/',     UpdateProfileView.as_view(),   name='profile'),
    path('auth/password/',    ChangePasswordView.as_view(),  name='change-password'),

    # Catégories
    path('categories/',       CategoryListView.as_view(),    name='categories'),

    # Produits
    path('products/',                     ProductListView.as_view(),     name='products'),
    path('products/featured/',            FeaturedProductsView.as_view(),name='featured'),
    path('products/<slug:slug>/',         ProductDetailView.as_view(),   name='product-detail'),
    path('products/<slug:slug>/reviews/', ReviewView.as_view(),          name='reviews'),

    # Panier
    path('cart/',               CartView.as_view(),      name='cart'),
    path('cart/<int:item_id>/', CartItemView.as_view(),  name='cart-item'),

    # Commandes
    path('orders/',          OrderListView.as_view(),    name='orders'),
    path('orders/<int:pk>/', OrderDetailView.as_view(),  name='order-detail'),

    # Contact
    path('contact/',         ContactView.as_view(),      name='contact'),

    # Paiement
    path('payment/intent/',          CreatePaymentIntentView.as_view(), name='payment-intent'),
    path('payment/cash/',            CreateCashOrderView.as_view(),     name='payment-cash'),
    path('payment/cinetpay/',        CinetPayInitView.as_view(),        name='cinetpay-init'),
    path('payment/cinetpay/notify/', CinetPayNotifyView.as_view(),      name='cinetpay-notify'),
    path('test-email/', test_email, name='test-email'),
]