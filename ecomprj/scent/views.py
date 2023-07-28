from django.shortcuts import render
from django.http import HttpResponse
from .models import Product
# Create your views here.
def index(request):
    return render(request, 'core/index.html')

def product(request):

    product = Product.objects.all()
    return render(request, 'core/product.html', {'product':product})
