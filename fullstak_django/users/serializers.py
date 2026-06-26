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
