from .models import CartItem


def cart_quantity(request):
    cart_items = CartItem.objects.all()
    total_quantity = sum(cart_item.quantity for cart_item in cart_items)
    return {'total_quantity': total_quantity}


def user_firstname(request):
    user = request.session.get('user_id')
    user_firstname = request.session.get('user_firstname')
    user_lastname = request.session.get('user_lastname')
    return {'user_firstname': user_firstname,
            'user_lastname': user_lastname,
            'user': user}
