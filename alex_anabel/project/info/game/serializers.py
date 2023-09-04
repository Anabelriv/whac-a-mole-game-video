from .models import *
from rest_framework import serializers

class InfomatoinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Infomatoin
        fields = ['id', 'userName', 'password', 'score']