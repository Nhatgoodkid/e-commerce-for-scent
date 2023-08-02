from django.urls import path
from scent.views import index
from scent import views
app_name = 'spray'

urlpatterns = [
    path("", views.index),
    path("product", views.product),
    path("signin", views.signin),
    path("signup", views.signup),
    path("cart", views.cart),
    path("check-out", views.checkout_product),
    path("product/<slug:product_slug>", views.product_details),
    path("adm/product", views.product_management),
    path("adm/add/product", views.add_product),
    path("adm/edit/product/<str:product_id>", views.edit_product),
    path("adm/delete/product/<str:product_id>", views.delete_product),
    path("adm", views.admin),
]