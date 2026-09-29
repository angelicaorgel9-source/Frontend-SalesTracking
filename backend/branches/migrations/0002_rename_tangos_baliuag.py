from django.db import migrations


def rename_tangos_baliuag(apps, schema_editor):
    Branch = apps.get_model('branches', 'Branch')
    old_branch = Branch.objects.filter(code='tangos-baliuag').first()
    if old_branch is None:
        return

    tangos_branch = Branch.objects.filter(code='tangos').exclude(pk=old_branch.pk).first()
    if tangos_branch is not None:
        old_branch.is_active = False
        old_branch.save(update_fields=['is_active'])
        tangos_branch.is_active = True
        tangos_branch.save(update_fields=['is_active'])
        return

    old_branch.name = 'Tangos'
    old_branch.code = 'tangos'
    old_branch.is_active = True
    old_branch.save(update_fields=['name', 'code', 'is_active'])


def restore_tangos_baliuag(apps, schema_editor):
    Branch = apps.get_model('branches', 'Branch')
    tangos_branch = Branch.objects.filter(code='tangos').first()
    if tangos_branch is None:
        return

    legacy_branch = Branch.objects.filter(code='tangos-baliuag').exclude(pk=tangos_branch.pk).first()
    if legacy_branch is not None:
        legacy_branch.is_active = True
        legacy_branch.save(update_fields=['is_active'])
        return

    tangos_branch.name = 'Tangos-Baliuag'
    tangos_branch.code = 'tangos-baliuag'
    tangos_branch.save(update_fields=['name', 'code'])


class Migration(migrations.Migration):

    dependencies = [
        ('branches', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(rename_tangos_baliuag, restore_tangos_baliuag),
    ]