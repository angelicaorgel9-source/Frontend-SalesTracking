from django.db import models


class Branch(models.Model):
    """One of MJ Prints' physical shop locations (Baliuag or Tangos)."""

    name = models.CharField(max_length=150, unique=True)
    code = models.SlugField(max_length=30, unique=True, help_text='Short identifier, e.g. "baliuag"')
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
