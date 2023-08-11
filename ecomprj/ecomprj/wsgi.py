"""
WSGI config for ecomprj project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from mongoengine import connect

from django.core.wsgi import get_wsgi_application


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecomprj.settings')

# Kết nối tới MongoDB
connect(host='mongodb+srv://teky:C41jumox6pvNgtI8@note-page.vj9hypl.mongodb.net/')

application = get_wsgi_application()

app = application
