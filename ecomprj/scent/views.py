from django.shortcuts import render, redirect
from django.utils.text import slugify
from django.contrib import messages
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import logout
from django.http import JsonResponse
from .models import Product, User, CartItem
import random
import string

# Generate unique slug


def generate_unique_slug(name, max_attempts=10):
    slug = slugify(name)
    unique_slug = slug
    counter = 1
    while Product.objects.filter(slug=unique_slug).first():
        random_string = ''.join(random.choices(
            string.ascii_lowercase + string.digits, k=6))
        unique_slug = f"{slug}-{random_string}"
        counter += 1
        if counter > max_attempts:
            raise ValueError("Failed to generate a unique slug.")
    return unique_slug

# [GET] /


def index(request):

    return render(request, 'core/index.html')

# [GET] /signup


def signup(request):
    if request.method == 'POST':
        # Get data from the form
        firstname = request.POST.get('firstname')
        lastname = request.POST.get('lastname')
        username = request.POST.get('username')
        phone = request.POST.get('phone')
        email = request.POST.get('email')
        city_address = request.POST.get('city_address')
        district_address = request.POST.get('district_address')
        street_address = request.POST.get('street_address')
        password = request.POST.get('password')
        confirm_pwd = request.POST.get('confirmPassword')

        # Confirm Password
        if password != confirm_pwd:
            messages.error(request, 'Mật khẩu xác nhận không trùng khớp.')
            return render(request, 'core/signup.html')

        # Check if the username or email already exists in the database
        if User.objects.filter(username=username).count() > 0 or User.objects.filter(email=email).count() > 0:
            messages.error(request, 'Tên người dùng hoặc email đã tồn tại.')
            return render(request, 'core/signup.html')

        # Create a new User object and save it to the database
        # Hash the password before saving
        hashed_password = make_password(password)
        user = User(
            firstname=firstname,
            lastname=lastname,
            username=username,
            phone=phone,
            email=email,
            city_address=city_address,
            district_address=district_address,
            street_address=street_address,
            password=hashed_password,
        )
        user.save()

        # Show success message and redirect to login page
        messages.success(request, 'Đăng ký thành công. Vui lòng đăng nhập.')
        # 'login' is the URL name of your login view
        return redirect('/signin')
    return render(request, 'core/signup.html')

# [GET] /signin


def signin(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

       # Retrieve the user from the database by their username
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # User not found, handle the error accordingly
            # (You can show an error message or redirect to a signup page)
            messages.error(request, 'Invalid email')
            return redirect('/signin')

        # Check if the provided password matches the hashed password in the database
        if check_password(password, user.password):
            # Password matches, user authenticated successfully
            # Perform login actions and redirect to the desired page
            # (e.g., set session variables, redirect to the dashboard, etc.)
            # Save user information to the session
            request.session['user_id'] = user.id
            request.session['user_firstname'] = user.firstname
            request.session['user_lastname'] = user.lastname
            messages.success(request, 'Đăng nhập thành công.')
            return redirect('/')  # Replace with your desired URL
        else:
            # Password does not match, handle the authentication failure
            # (You can show an error message or redirect back to the login page)
            messages.error(request, 'Invalid credentials')
            return redirect('/signin')  # Replace with your desired URL

    return render(request, 'core/signin.html')

# [POST] /logout


def logout_view(request):
    logout(request)
    return redirect('/')

# [GET] /cart/:user


def cart(request):
    # Truy vấn CartItem từ database
    user_id = request.session.get('user_id')
    if user_id:
        cart_items = CartItem.objects.filter(user_id=str(user_id))
    else:
        cart_items = CartItem.objects.filter(
            session_key=request.session.session_key)

    if not user_id and not request.session.session_key:
        cart_items = {}

    # List to store CartItems with related Product data
    cart_items_with_product = []

    total_price = sum(item.product.price *
                      item.quantity for item in cart_items)
    # Fetch the related Product data for each CartItem
    for cart_item in cart_items:
        product_id = str(cart_item.product.id)  # Get the ObjectId as a string
        product = Product.objects.filter(id=product_id).first()
        if product:
            cart_item.product = product
            cart_items_with_product.append(cart_item)

    # Truyền danh sách cart_items_with_product vào context để sử dụng trong template
    context = {
        'cart_items': cart_items_with_product,
        'total_price': total_price
    }

    return render(request, 'core/cart.html', context)

# [POST] /add-to-cart


def add_to_cart(request, product_slug):
    user_id = request.session.get('user_id')

    try:
        product = Product.objects.get(slug=product_slug)
        if (user_id):
            user_id = str(user_id)
            cart_item = CartItem.objects(
                user_id=user_id, product=product).first()
        else:
            session_key = request.session.session_key
            if not session_key:
                # If session_key is not available, create a new session
                request.session.create()
                session_key = request.session.session_key
            cart_item = CartItem.objects(
                session_key=session_key, product=product).first()

        if cart_item:
            cart_item.update(inc__quantity=1)
        else:
            if user_id:
                cart_item = CartItem(
                    user_id=user_id, product=product, quantity=1)
            else:
                cart_item = CartItem(
                    session_key=session_key, product=product, quantity=1)
            cart_item.save()

        if user_id:
            cart_items = CartItem.objects.filter(user_id=user_id)
        else:
            cart_items = CartItem.objects.filter(session_key=session_key)

        total_quantity = sum(cart.quantity for cart in cart_items)
        return JsonResponse({'message': 'Product added to cart successfully.', 'total_quantity': total_quantity})
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found.'})

# [GET] /product


def product(request):
    product = Product.objects.all()
    kind = Product.objects.distinct('kind')
    sorted_kind = sorted(kind, key=lambda x: x.lower())
    return render(request, 'core/product.html', {
        'product': product,
        'kind': sorted_kind,
    })

# [GET] /product/:slug


def product_details(request, product_slug):
    try:
        product = Product.objects.get(slug=product_slug)
    except Product.DoesNotExist:
        return redirect('/product')

    return render(request, 'core/product_detail.html', {'product': product})

# [GET] /checkout/:slug


def checkout_product(request):

    return render(request, 'core/checkout.html')

# [GET] /adm/product


def product_management(request):
    product = Product.objects.all()

    return render(request, 'admin_core/product.html', {'product': product})

# [POST] /adm/add/product


def add_product(request):
    if request.method == 'POST':
        # Get data from the form
        name = request.POST.get('name')
        kind = request.POST.get('kind')
        quantity = int(request.POST.get('quantity', 0))
        size = int(request.POST.get('size', 0))
        description = request.POST.get('description', '')
        price = int(request.POST.get('price', 0))
        image_url = request.POST.get('image_url')
        # Generate the slug from the name/title
        slug = generate_unique_slug(name)
        # Create and save the Product document
        product = Product(
            name=name,
            kind=kind,
            quantity=quantity,
            size=size,
            description=description,
            price=price,
            image_url=image_url,
            slug=slug,
        )
        product.save()

    # Redirect to product management
    return redirect('/adm/product')

# [PUT] /adm/edit/product


def edit_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return redirect('/adm/product')

    if request.method == 'POST':
        # If the _method is "PUT", treat it as a PUT request
        if request.POST.get('_method') == 'PUT':
            # Get data from the form
            name = request.POST.get('name')
            kind = request.POST.get('kind')
            quantity = int(request.POST.get('quantity', 0))
            size = int(request.POST.get('size', 0))
            description = request.POST.get('description', '')
            price = int(request.POST.get('price', 0))
            image_url = request.POST.get('image_url')

            # Update the product fields with the new data
            product.name = name
            product.kind = kind
            product.quantity = quantity
            product.size = size
            product.description = description
            product.price = price
            product.image_url = image_url

            # Save the updated product
            product.save()

    # Redirect to product management
    return redirect('/adm/product')

# [DELETE] /adm/delete/product


def delete_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return redirect('/adm/product')

    if request.method == 'POST':
        # If the _method is "PUT", treat it as a PUT request
        if request.POST.get('_method') == 'DELETE':
            # Delete the product
            product.delete()

    # Redirect to product management
    return redirect('/adm/product')

# [GET] /adm


def admin(request):
    return render(request, 'admin_core/dashboard.html')
