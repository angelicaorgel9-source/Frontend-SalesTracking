from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('accounts', '0002_user_two_factor_enabled')]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('ADMIN', 'Admin'),
                    ('EMPLOYEE', 'Employee'),
                    ('CUSTOMER', 'Customer'),
                ],
                default='EMPLOYEE',
                max_length=10,
            ),
        ),
    ]
