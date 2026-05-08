from django.db import models
from django.contrib.auth.models import User


# ─── CATEGORIE ─────────────────────────────────────────
class Category(models.Model):
    name        = models.CharField(max_length=100)
    slug        = models.SlugField(unique=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


# ─── PRODUIT ───────────────────────────────────────────
class Product(models.Model):
    SIZE_TYPE_CHOICES = [
        ('bottom', 'Bas (XS/S/M/L/XL)'),
        ('top',    'Haut (85B/90C...)'),
        ('unique', 'Taille unique'),
    ]

    category    = models.ForeignKey(Category, on_delete=models.SET_NULL,
                                    null=True, related_name='products')
    name        = models.CharField(max_length=200)
    slug        = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    old_price   = models.DecimalField(max_digits=10, decimal_places=2,
                                      null=True, blank=True)
    image       = models.ImageField(upload_to='products/', null=True, blank=True)
    size_type   = models.CharField(max_length=10, choices=SIZE_TYPE_CHOICES,
                                   default='bottom')
    sizes       = models.JSONField(default=list)
    colors      = models.JSONField(default=list)
    materials   = models.JSONField(default=list)  # ex: ["Dentelle","Satin"]
    stock       = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)  # mis en avant sur la home
    tag         = models.CharField(max_length=50, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# ─── PANIER ────────────────────────────────────────────
class Cart(models.Model):
    user        = models.OneToOneField(User, on_delete=models.CASCADE,
                                       related_name='cart')
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Panier de {self.user.username}"

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    cart        = models.ForeignKey(Cart, on_delete=models.CASCADE,
                                    related_name='items')
    product     = models.ForeignKey(Product, on_delete=models.CASCADE)
    size        = models.CharField(max_length=10)
    quantity    = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} ({self.size})"

    @property
    def subtotal(self):
        return self.product.price * self.quantity


# ─── COMMANDE ──────────────────────────────────────────   
class Order(models.Model):
    PAYMENT_CHOICES = [
        ('cash',   'Espèces à la livraison'),
        ('card',   'Carte bancaire'),
        ('mobile', 'Mobile Money'),
    ]
    STATUS_CHOICES = [
        ('pending',    'En attente'),
        ('confirmed',  'Confirmée'),
        ('shipped',    'Expédiée'),
        ('delivered',  'Livrée'),
        ('cancelled',  'Annulée'),
    ]

    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method  = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='cash')
    payment_status  = models.CharField(max_length=20, default='unpaid')
    total           = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    address         = models.TextField(blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Commande #{self.id} — {self.user.username}"    


class OrderItem(models.Model):
    order       = models.ForeignKey(Order, on_delete=models.CASCADE,
                                    related_name='items')
    product     = models.ForeignKey(Product, on_delete=models.CASCADE)
    size        = models.CharField(max_length=10)
    quantity    = models.PositiveIntegerField()
    price       = models.DecimalField(max_digits=10, decimal_places=2)  # prix au moment de l'achat

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def subtotal(self):
        return self.price * self.quantity
    
    


class Review(models.Model):
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    rating     = models.PositiveSmallIntegerField(default=5)  # 1 à 5
    comment    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user')  # 1 avis par produit par utilisateur

    def __str__(self):
        return f"{self.user.username} — {self.product.name} ({self.rating}★)"   


class UserProfile(models.Model):
    user  = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"Profil de {self.user.username}"