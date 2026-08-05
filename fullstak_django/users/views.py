from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .serializers import UserSerializer, RegisterSerializer
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()

def send_registration_email(user):
    """Отправляет письмо с данными нового пользователя администратору"""
    subject = "Новый пользователь зарегистрировался"
    message = f"""
    Зарегистрирован новый пользователь:

    Email: {user.email}
    Имя пользователя: {user.user_name}
    Имя: {user.first_name}
    Фамилия: {user.last_name}
    Отчество: {user.patronymic}
    Телефон: {user.phone}
    Организация: {user.organization}
    Подразделение: {user.department}
    Должность: {user.position}
    Дата регистрации: {user.start_date}
    Активен: {"Да" if user.is_active else "Нет"}
    Администратор: {"Да" if user.is_staff else "Нет"}
    """
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        ['maksim.volichev@yandex.ru'],
        fail_silently=False,
    )

# 1. Регистрация
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        send_registration_email(user)
        return Response({
            "message": "User created successfully",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 3. Список всех пользователей (только для админов)
class UserListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


# 4. Детали пользователя по ID (только для админов)
class UserDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)






from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .serializers import CookieTokenObtainPairSerializer, CookieTokenRefreshSerializer
from .utils import set_jwt_cookies, enforce_csrf
from django.utils.decorators import method_decorator

# CSRF token endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf(request):
    response = JsonResponse({'detail': 'CSRF cookie set'})
    response['X-CSRFToken'] = get_token(request)
    return response

# Custom Token Obtain View
class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = CookieTokenObtainPairSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)

    # @method_decorator(enforce_csrf)
    def post(self, request: Request, *args, **kwargs) -> Response:
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')

            if access_token and refresh_token:
                response = set_jwt_cookies(response, access_token, refresh_token)
                response.data = {
                    'access': access_token,  # ← ДОБАВИТЬ
                    'refresh': refresh_token,  # ← ДОБАВИТЬ
                    'user': response.data.get('user'),
                    'user_status': response.data.get('user_status')
                }

        return response

# Custom Token Refresh View
class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = CookieTokenRefreshSerializer
    permission_classes = (AllowAny,)

    @method_decorator(enforce_csrf)
    def post(self, request: Request, *args, **kwargs) -> Response:
        raw_refresh_token = request.COOKIES.get('refresh_token') or None
        
        if not raw_refresh_token:
            return Response({'error': 'Refresh token not found'}, status=status.HTTP_400_BAD_REQUEST)

        data = {'refresh': raw_refresh_token}

        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        
        access_token = response.data.get('access')
        refresh_token = response.data.get('refresh')

        if access_token and refresh_token:
            response = set_jwt_cookies(response, access_token, refresh_token)
            del response.data['access']
            if 'refresh' in response.data:
                del response.data['refresh']

        return response


from .serializers import PasswordResetSerializer, PasswordResetConfirmSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Письмо со ссылкой для сброса отправлено."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Пароль успешно изменён."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
