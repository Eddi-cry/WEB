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


    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        # Если user_name не передан, формируем его из имени и отчества или используем email
        if not user.user_name:
            if user.first_name and user.patronymic:
                user.user_name = f"{user.first_name} {user.patronymic}"
            else:
                user.user_name = email
        user.set_password(password)
        user.save(using=self._db)
        return user


class NewUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField('email address', unique=True)
    user_name = models.CharField(max_length=150, blank=True)  # убрали unique=True, добавили blank=True
    # Новые поля
    last_name = models.CharField(max_length=150, blank=True, verbose_name='Фамилия')
    first_name = models.CharField(max_length=150, blank=True, verbose_name='Имя')
    patronymic = models.CharField(max_length=150, blank=True, verbose_name='Отчество')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    organization = models.CharField(max_length=200, blank=True, null=True)
    department = models.CharField(max_length=200, blank=True, verbose_name='Подразделение')
    position = models.CharField(max_length=200, blank=True, verbose_name='Должность')
    # Остальные поля оставляем
    start_date = models.DateTimeField(default=timezone.now, null=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)

    objects = CustomAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # теперь user_name не обязателен

    def __str__(self):
        # Возвращаем ФИО или email, если ФИО нет
        if self.last_name or self.first_name or self.patronymic:
            return f"{self.last_name} {self.first_name} {self.patronymic}".strip()
        return self.email
