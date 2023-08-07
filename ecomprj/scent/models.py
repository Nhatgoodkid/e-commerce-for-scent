from django.db import models
from mongoengine import * 
from django.utils.text import slugify

# Create your models here.
class Product(Document):
    name = StringField(required=True)
    price = IntField(required=True)
    size = IntField()
    quantity = IntField()
    kind = StringField()
    description = StringField()
    image_url = StringField()
    slug = StringField(unique=True)

    def save(self, *args, **kwargs):
    # Generate and set the slug before saving the object
        if not self.slug:
            self.slug = slugify(self.name)
        super(Product, self).save(*args, **kwargs)

class User(Document):
    username = StringField(required=True, unique=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    firstname = StringField()
    lastname = StringField()
    phone = StringField()
    street_address = StringField()
    city_address = StringField()
    district_address = StringField()
    password = StringField()

class CartItem(Document):
    product = ReferenceField(Product)
    quantity = IntField(default=0)

class Order(Document):
    cart_item = ReferenceField(CartItem)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    firstname = StringField()
    lastname = StringField()
    phone = StringField()
    street_address = StringField()
    city_address = StringField()
    district_address = StringField()
    pay_method = StringField()
    sub_total = IntField(default=0)

    
