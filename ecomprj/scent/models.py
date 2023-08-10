from django.db import models
from mongoengine import *
from django.utils.text import slugify
import datetime
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
    created_at = DateTimeField()
    modified_at = DateTimeField()

    def save(self, *args, **kwargs):
        if not self.id:  # If the object is being created
            self.created_at = datetime.datetime.now()
        self.modified_at = datetime.datetime.now()
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
    user_id = StringField()
    session_key = StringField()
    product = ReferenceField(Product)
    quantity = IntField(default=0)
    meta = {
        'indexes': [
            # Index for user_id to speed up queries
            {'fields': ['user_id']},
            # Index for session_key to speed up queries
            {'fields': ['session_key']},
        ]
    }


class Order(Document):
    cart_items = ListField(ReferenceField(CartItem))
    email = EmailField(required=True)
    firstname = StringField()
    lastname = StringField()
    phone = StringField()
    street_address = StringField()
    city_address = StringField()
    district_address = StringField()
    pay_method = StringField()
    sub_total = IntField(default=0)
    created_at = DateTimeField()
    modified_at = DateTimeField()

    def save(self, *args, **kwargs):
        if not self.id:  # If the object is being created
            self.created_at = datetime.datetime.now()
        self.modified_at = datetime.datetime.now()

        super(Order, self).save(*args, **kwargs)
