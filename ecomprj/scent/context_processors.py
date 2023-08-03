from .models import CartItem

def cart_quantity(request):
    cart_items = CartItem.objects.all()
    total_quantity = sum(cart_item.quantity for cart_item in cart_items)
    return {'total_quantity': total_quantity}
