from django.contrib import admin
from .models import Category, Product, Cart, CartItem, Order, OrderItem
from .models import Review
from .models import UserProfile

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display   = ('name', 'category', 'price', 'size_type', 'stock', 'is_active', 'is_featured', 'tag')
    list_filter    = ('category', 'is_active', 'is_featured', 'size_type')
    search_fields  = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    list_editable  = ('is_active', 'is_featured', 'stock')

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    inlines      = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ('id', 'user', 'status', 'total', 'created_at')
    list_filter   = ('status',)
    inlines       = [OrderItemInline] 

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'rating', 'created_at')
    list_filter  = ('rating',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone')    