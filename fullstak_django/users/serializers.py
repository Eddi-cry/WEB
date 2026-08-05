from rest_framework import serializers
from .models import NewUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewUser
        fields = ('email', 'user_name', 'last_name', 'first_name', 'patronymic',
                  'phone', 'organization', 'department', 'position',
                  'start_date', 'is_staff', 'is_active')
        read_only_fields = ('start_date', 'is_staff')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = NewUser
        fields = ('email', 'user_name', 'organization', 'password', 'password2',
                  'last_name', 'first_name', 'patronymic', 'phone', 'department', 'position')
        # extra_kwargs больше не нужны

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return NewUser.objects.create_user(**validated_data)

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer

class CookieTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = self.user.user_name
        data['user_status'] = "active"
        return data

class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    pass



from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.urls import reverse

User = get_user_model()

# Сериализатор для запроса восстановления (отправка email)
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email не найден.")
        return value

    def save(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Ссылка для фронтенда — замените домен и порт на свои
        reset_url = f"http://172.20.1.244:8080/reset-password-confirm/{uid}/{token}/"

        subject = "Восстановление пароля"
        message = f"""Для сброса пароля перейдите по ссылке:
{reset_url}

Если вы не запрашивали сброс, игнорируйте это письмо.
"""
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

# Сериализатор для подтверждения смены пароля
class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Пароли не совпадают.")
        return data

    def save(self):
        uid = self.validated_data['uid']
        token = self.validated_data['token']
        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid_decoded)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Неверный идентификатор пользователя.")

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError("Неверный или устаревший токен.")

        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
