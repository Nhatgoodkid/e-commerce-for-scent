from django.urls import path
from scent.views import index
from scent import views
app_name = 'spray'

urlpatterns = [
    path("", views.index),
    path("product", views.product),
    path("product/<slug:product_slug>", views.product_details),
    path("product/<slug:product_slug>/check-out", views.checkout_product),
    path("adm/product", views.product_management),
    path("adm/add/product", views.add_product),
    path("adm/edit/product/<str:product_id>", views.edit_product),
    path("adm/delete/product/<str:product_id>", views.delete_product),
    path("adm", views.admin),
]