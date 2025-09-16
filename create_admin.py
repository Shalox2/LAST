#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'weshop.settings')
django.setup()

from users.models import User

# Create admin user
admin_user = User.objects.create_user(
    username='admin',
    email='admin@weshop.com',
    password='admin123',
    role='admin',
    is_staff=True,
    is_superuser=True
)

print(f"Admin user created successfully!")
print(f"Username: admin")
print(f"Password: admin123")
print(f"Access Django Admin at: http://127.0.0.1:8000/admin/")
