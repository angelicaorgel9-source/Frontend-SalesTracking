import secrets

from django.core.management.base import BaseCommand

from accounts.models import User
from branches.models import Branch


class Command(BaseCommand):
    help = (
        "Creates the 2 MJ Prints branches (Baliuag, Tangos) and "
        "employee accounts for Jaja, Irish, Ruzzel, Jhonpaul, and Julius, as "
        "requested by the client. Employees are created with no branch assigned "
        "-- an admin assigns that later from the admin panel or User Management "
        "screen. Prints each employee's temporary password once; it is not "
        "stored anywhere in plain text after this."
    )

    def handle(self, *args, **options):
        branches_data = [
            {'name': 'Baliuag', 'code': 'baliuag'},
            {'name': 'Tangos', 'code': 'tangos'},
        ]
        for data in branches_data:
            branch, created = Branch.objects.get_or_create(code=data['code'], defaults=data)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created branch: {branch.name}"))
            else:
                self.stdout.write(f"Branch already exists: {branch.name}")

        employee_names = ['Jaja', 'Irish', 'Ruzzel', 'Jhonpaul', 'Julius']
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Employee accounts (save these passwords now -- they will not be shown again):'))
        for name in employee_names:
            username = name.lower()
            if User.objects.filter(username=username).exists():
                self.stdout.write(f"  {name}: account already exists (username: {username}), skipped.")
                continue
            password = secrets.token_urlsafe(9)
            User.objects.create_user(
                username=username,
                password=password,
                name=name,
                role=User.EMPLOYEE,
                branch=None,
            )
            self.stdout.write(self.style.SUCCESS(f"  {name}: username = {username}, password = {password}"))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            'Done. Each employee can log in now with "Input Sales" (create orders) '
            'and "View sales" (daily/weekly totals) access -- that is what the '
            'EMPLOYEE role already allows. Assign each one to a branch from the '
            'Django admin (Accounts > Users) whenever that is decided.'
        ))
