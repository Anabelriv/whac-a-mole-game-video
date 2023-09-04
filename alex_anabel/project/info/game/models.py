from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone



class GameProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    score = models.IntegerField(null=True)
    
    
    
    
    
# Create your models here.
class Infomatoin(models.Model):
    userName = models.CharField(max_length=50)
    password = models.CharField(max_length=50)
    score = models.IntegerField(null=True)
    # user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    
class Post(models.Model):
    title = models.CharField(max_length=120)
    content = models.TextField(null=True)
    score = models.IntegerField(null=True)
    published_at = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.title
            
    class Meta:
        ordering = ['-published_at']