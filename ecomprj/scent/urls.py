from django.urls import path
from scent.views import index
from scent import views
app_name = 'spray'

urlpatterns = [
    path("", views.index),
    path("product/", views.product),
    path("signin", views.signin),
    path("signup", views.signup),
    path("logout", views.logout_view),
    path("cart/", views.cart),
    path("add-to-cart/<slug:product_slug>/<str:action>", views.add_to_cart),
    path("check-out/", views.checkout_product),
    path("result/place_order", views.order_result),
    path("add/order", views.place_order),
    path("product/<slug:product_slug>", views.product_details),
    path("adm/delete/customer/<str:user_id>", views.delete_customer),
    path("adm/customers", views.customers_management),
    path("adm/delete/order/<str:order_id>", views.delete_order),
    path("adm/orders", views.order_management),
    path("adm/product", views.product_management),
    path("adm/add/product", views.add_product),
    path("adm/edit/product/<str:product_id>", views.edit_product),
    path("adm/delete/product/<str:product_id>", views.delete_product),
    path("adm", views.admin),
]