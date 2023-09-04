from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import *
from .forms import PostForm
from django.http import HttpResponse


@login_required
def delete_post(request, id):
    queryset = Post.objects.filter(author=request.user)
    post = get_object_or_404(queryset, pk=id)
    context = {'post': post}

    if request.method == 'GET':
        return render(request, 'game/post_confirm_delete.html', context)
    elif request.method == 'POST':
        post.delete()
        messages.success(request,  'The post has been deleted successfully.')
        return redirect('posts')


@login_required
def edit_post(request, id):
    queryset = Post.objects.filter(author=request.user)
    post = get_object_or_404(queryset, pk=id)

    if request.method == 'GET':
        context = {'form': PostForm(instance=post), 'id': id}
        return render(request, 'game/post_form.html', context)

    elif request.method == 'POST':
        form = PostForm(request.POST, instance=post)
        if form.is_valid():
            user = form.save(commit=False)
            user.author = request.user
            user.save()
            messages.success(
                request, 'The post has been updated successfully.')
            return redirect('posts')
        else:
            messages.error(request, 'Please correct the following errors:')
            return render(request, 'game/post_form.html', {'form': form})


@login_required
def create_post(request):
    if request.method == 'GET':
        context = {'form': PostForm()}
        return render(request, 'game/post_form.html', context)
    elif request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(
                request, 'The post has been created successfully.')
            return redirect('posts')
        else:
            messages.error(request, 'Please correct the following errors:')
            return render(request, 'game/post_form.html', {'form': form})

@login_required
def home(request):
    posts = Post.objects.all()
    context = {'posts': posts}
    return render(request, 'game/index.html', context)


def view_profile(request):
    game_profile = GameProfile.objects.get(user=request.user)
    # return render(request, 'game/profile.html', {'game_profile': game_profile})

# def about(request):
#     return render(request, 'geme/about.html')

def game_onegame(request):
    return render(request, "game/index.html")
    
     