from .models import CartItem


def cart_quantity(request):
    user = request.session.get('user_id')
    if user:
        cart_items = CartItem.objects(user_id=str(user))
    else:
        session_key = request.session.session_key
        cart_items = CartItem.objects(session_key=session_key)
    #Check if user and session is available
    if not user and not request.session.session_key:
        total_quantity = 0
    else:
        total_quantity = sum(cart_item.quantity for cart_item in cart_items)
    return {'total_quantity': total_quantity}


def user_firstname(request):
    user = request.session.get('user_id')
    user_firstname = request.session.get('user_firstname')
    user_lastname = request.session.get('user_lastname')
    return {'user_firstname': user_firstname,
            'user_lastname': user_lastname,
            'user': user}
