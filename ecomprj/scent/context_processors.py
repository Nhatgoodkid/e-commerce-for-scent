from .models import CartItem, User


def cart_quantity(request):
    user = request.session.get('user_id')
    if user:
        cart_items = CartItem.objects(user_id=str(user))
    else:
        session_key = request.session.session_key
        cart_items = CartItem.objects(session_key=session_key)
    # Check if user and session is available
    if not user and not request.session.session_key:
        total_quantity = 0
    else:
        total_quantity = sum(cart_item.quantity for cart_item in cart_items)
    return {'total_quantity': total_quantity}


def user_info(request):
    user_id = request.session.get('user_id')
    user = {}
    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            pass
    return {'user': user}

def shipping_price(request):
    inner_price = 45000
    outer_price = 60000
    return {'inner_price': inner_price,
            'outer_price': outer_price}
