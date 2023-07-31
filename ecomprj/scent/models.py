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