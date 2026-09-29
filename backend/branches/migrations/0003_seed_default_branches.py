from django.db import migrations


def ensure_default_branches(apps, schema_editor):
    Branch = apps.get_model('branches', 'Branch')
    Branch.objects.get_or_create(code='baliuag', defaults={'name': 'Baliuag'})
    Branch.objects.get_or_create(code='tangos', defaults={'name': 'Tangos'})


class Migration(migrations.Migration):
    dependencies = [
        ('branches', '0002_rename_tangos_baliuag'),
    ]

    operations = [
        migrations.RunPython(ensure_default_branches, migrations.RunPython.noop),
    ]