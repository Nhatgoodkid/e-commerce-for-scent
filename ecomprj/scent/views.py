from django.shortcuts import render
from django.http import HttpResponse
from .models import Product
# Create your views here.
def index(request):
    return render(request, 'core/index.html')

def product(request):

    product = Product.objects.all()
    kind = Product.objects.distinct('kind')
    sorted_kind = sorted(kind, key=lambda x: x.lower())
    return render(request, 'core/product.html', {
        'product':product,
        'kind': sorted_kind,
        })
