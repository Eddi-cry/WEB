from django.urls import path
from . import views
from .views import CookieTokenObtainPairView, CookieTokenRefreshView, get_csrf

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('me/', views.MeView.as_view(), name='me'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('csrf/', get_csrf, name='get_csrf'),
]
