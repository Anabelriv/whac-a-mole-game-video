from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import *

@receiver(post_save, sender=User)
def create_game_profile(sender, instance, created, **kwargs):
    if created:
        GameProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_game_profile(sender, instance, **kwargs):
    instance.gameprofile.save()
