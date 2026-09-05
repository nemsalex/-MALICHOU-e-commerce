import threading
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category, Product, Cart, CartItem, Order, OrderItem, Review, UserProfile
from .emails import send_welcome_email, send_new_user_notification


# ─── AUTH ──────────────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)
    phone     = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model  = User
        fields = ('username', 'email', 'password', 'password2', 'phone')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        phone = validated_data.pop('phone', '')
        user  = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, phone=phone)

        def send_emails():
            try:
                send_welcome_email(user)
                send_new_user_notification(user)
            except Exception:
                pass
        threading.Thread(target=send_emails, daemon=True).start()
        return user


class UserSerializer(serializers.ModelSerializer):
    phone = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ('id', 'username', 'email', 'phone')

    def get_phone(self, obj):
        try:
            return obj.profile.phone
        except Exception:
            return ''


# ─── CATEGORIES ────────────────────────────────────────
class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model  = Category
        fields = ('id', 'name', 'slug', 'image')

    def get_image(self, obj):
        product = obj.products.filter(is_active=True).exclude(image='').first()
        if product and product.image:
            return product.image.url
        return None


# ─── PRODUITS ──────────────────────────────────────────
class ProductSerializer(serializers.ModelSerializer):
    category  = CategorySerializer(read_only=True)
    size_type = serializers.CharField()
    materials = serializers.JSONField()

    class Meta:
        model  = Product
        fields = (
            'id', 'name', 'slug', 'description',
            'price', 'old_price', 'image', 'size_type',
            'sizes', 'colors', 'materials', 'stock',
            'is_active', 'is_featured', 'tag', 'category'
        )


# ─── PANIER ────────────────────────────────────────────
class CartItemSerializer(serializers.ModelSerializer):
    product  = ProductSerializer(read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model  = CartItem
        fields = ('id', 'product', 'size', 'quantity', 'subtotal')


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()

    class Meta:
        model  = Cart
        fields = ('id', 'items', 'total')


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    size       = serializers.CharField(max_length=10)
    quantity   = serializers.IntegerField(default=1, min_value=1)


# ─── COMMANDES ─────────────────────────────────────────
class OrderItemSerializer(serializers.ModelSerializer):
    product  = ProductSerializer(read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model  = OrderItem
        fields = ('id', 'product', 'size', 'quantity', 'price', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model  = Order
        fields = ('id', 'status', 'payment_method', 'payment_status',
                  'total', 'address', 'items', 'created_at')


# ─── AVIS ──────────────────────────────────────────────
class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model  = Review
        fields = ('id', 'username', 'rating', 'comment', 'created_at')
        read_only_fields = ('user',)


# ─── PRODUIT DÉTAIL ────────────────────────────────────
class ProductDetailSerializer(serializers.ModelSerializer):
    category     = CategorySerializer(read_only=True)
    reviews      = ReviewSerializer(many=True, read_only=True)
    avg_rating   = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = (
            'id', 'name', 'slug', 'description',
            'price', 'old_price', 'image', 'size_type',
            'sizes', 'colors', 'materials', 'stock',
            'is_active', 'is_featured', 'tag', 'category',
            'reviews', 'avg_rating', 'review_count'
        )

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return 0
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_review_count(self, obj):
        return obj.reviews.count()


# ─── PROFIL ────────────────────────────────────────────
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = UserProfile
        fields = ('phone',)