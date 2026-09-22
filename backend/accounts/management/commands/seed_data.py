from django.core.management.base import BaseCommand

from accounts.models import User
from products.models import Product


class Command(BaseCommand):
    help = 'Creates a starter admin account and a few sample products for testing.'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                password='admin123',
                role=User.ADMIN,
                name='Admin User',
            )
            self.stdout.write(self.style.SUCCESS('Created admin account -> username: admin / password: admin123'))
        else:
            self.stdout.write('Admin account already exists, skipping.')

        sample_products = [
            {'name': 'T-Shirt Printing (Plain)', 'category': 'T-Shirts', 'price': 250, 'stock': 100},
            {'name': 'Tarpaulin (per sq ft)', 'category': 'Tarpaulin', 'price': 25, 'stock': 500},
            {'name': 'Wedding Invitation (set of 50)', 'category': 'Invitations', 'price': 1200, 'stock': 20},
            {'name': 'Sticker Sheet (A4)', 'category': 'Stickers', 'price': 50, 'stock': 200},
            {'name': 'Souvenir Mug (Sublimation)', 'category': 'Souvenirs', 'price': 180, 'stock': 60},
        ]
        for data in sample_products:
            _, created = Product.objects.get_or_create(name=data['name'], defaults=data)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created product: {data['name']}"))

        self.stdout.write(self.style.SUCCESS('Seeding complete.'))
