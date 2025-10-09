from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class CustomAccountManager(BaseUserManager):
    def create_superuser(self, email, user_name, password, **other_fields):
        other_fields.setdefault('is_staff', True)
        other_fields.setdefault('is_superuser', True)
        other_fields.setdefault('is_active', True)

        if not other_fields['is_staff']:
            raise ValueError('Superuser must have is_staff=True.')
        if not other_fields['is_superuser']:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, user_name, password, **other_fields)

    def create_user(self, email, user_name, password, **other_fields):
        if not email:
            raise ValueError('You must provide an email address')

        email = self.normalize_email(email)
        user = self.model(email=email, user_name=user_name, **other_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class NewUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField('email address', unique=True)
    user_name = models.CharField(max_length=150, unique=True)
    organization = models.CharField(max_length=200, blank=True, null=True)  # NULL в БД
    start_date = models.DateTimeField(default=timezone.now, null=False)  # NOT NULL
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    # is_superuser — уже есть из PermissionsMixin
    # last_login — уже есть в AbstractBaseUser

    objects = CustomAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_name']  # больше нет first_name

    def __str__(self):
        return self.user_name