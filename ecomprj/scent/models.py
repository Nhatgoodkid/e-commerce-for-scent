from django.db import models
from mongoengine import * 

# Create your models here.
class Product(Document):
    name = StringField(required=True)
    price = IntField(required=True)
    size = IntField()
    quantity = IntField()
    kind = StringField()
    description = StringField()
    image_url = StringField()
