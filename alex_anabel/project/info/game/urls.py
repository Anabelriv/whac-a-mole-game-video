from django.urls import path
from .views import *
urlpatterns = [
   # path('register/',create_post, name='register'),
   path('', home, name='posts'),
   path('post/create', create_post, name='post-create'),
   path('onegame/', game_onegame, name='onegame'),
]