from django.shortcuts import render, redirect
from django.utils.text import slugify
from django.contrib import messages
from django.contrib.auth.hashers import make_password
from django.http import HttpResponse
from .models import Product, User
import random
import string

#Generate unique slug
def generate_unique_slug(name, max_attempts=10):
    slug = slugify(name)
    unique_slug = slug
    counter = 1
    while Product.objects.filter(slug=unique_slug).first():
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
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
        hashed_password = make_password(password)  # Hash the password before saving
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
        return redirect('/signin')  # 'login' is the URL name of your login view
    return render(request, 'core/signup.html')

# [GET] /signin
def signin(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        try:
            # Tìm kiếm người dùng theo email
            user = User.objects.get(email=email)
            
            # Kiểm tra mật khẩu
            if user.password == password:
                # Mật khẩu đúng, đăng nhập thành công
                # Lưu thông tin người dùng vào session
                request.session['user_id'] = str(user.id)
                request.session['username'] = user.username
                # Hoặc bạn có thể sử dụng request.session['user'] = user để lưu toàn bộ đối tượng user
                messages.success(request, 'Đăng nhập thành công.')
                return render(request, 'core/index.html')
            else:
                # Mật khẩu không đúng, đăng nhập thất bại
                messages.error(request, 'Mật khẩu không đúng.')
                return render(request, 'core/signin.html')
        except User.DoesNotExist:
            # Người dùng không tồn tại, đăng nhập thất bại
            messages.error(request, 'Người dùng không tồn tại.')
            return render(request, 'core/signin.html')

    return render(request, 'core/signin.html')

# [GET] /cart/:user
def cart(request):
    return render(request, 'core/cart.html')

# [GET] /product
def product(request):
    product = Product.objects.all()
    kind = Product.objects.distinct('kind')
    sorted_kind = sorted(kind, key=lambda x: x.lower())
    return render(request, 'core/product.html', {
        'product':product,
        'kind': sorted_kind,
        })

# [GET] /product/:slug
def product_details(request, product_slug):
    try:
        product = Product.objects.get(slug=product_slug)
    except Product.DoesNotExist:
        return redirect('/product')
    
    return render(request, 'core/product_detail.html', {'product': product})

# [GET] /product/:slug
def checkout_product(request, product_slug):
    try:
        product = Product.objects.get(slug=product_slug)
    except Product.DoesNotExist:
        return redirect('/product')
    
    return render(request, 'core/checkout.html', {'product': product})

# [GET] /adm/product
def product_management(request):
    product = Product.objects.all()

    return render(request, 'admin_core/product.html', {'product':product})

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

def admin(request):
    return render(request, 'admin_core/dashboard.html')
