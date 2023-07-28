from django.shortcuts import render
from django.http import HttpResponse
from .models import Product
# Create your views here.
def index(request):
    return render(request, 'core/index.html')

def product(request):

    new_person = Product(name="John", price=30)

    # Lưu đối tượng vào cơ sở dữ liệu MongoDB
    new_person.save()
    return render(request, 'core/product.html')
