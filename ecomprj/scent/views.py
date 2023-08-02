from django.shortcuts import render, redirect
from django.utils.text import slugify
from django.http import HttpResponse
from .models import Product
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
