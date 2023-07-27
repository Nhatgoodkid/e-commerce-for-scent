from django.urls import path
from scent.views import index
from scent import views
app_name = 'spray'

urlpatterns = [
    path("", views.index),
]