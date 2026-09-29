from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0004_user_branch'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='notifications_read_ids',
            field=models.JSONField(blank=True, default=list),
        ),
    ]