# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from .models import NewUser


class NewUserAdmin(UserAdmin):
    # Поля, отображаемые в списке пользователей
    list_display = (
        'email',
        'user_name',
        'last_name',
        'first_name',
        'phone',
        'department',
        'organization',
        'is_active',
        'is_staff',
        'start_date'
    )

    # Ссылки для перехода в редактирование
    list_display_links = ('email', 'user_name')

    # Фильтры (справа)
    list_filter = ('is_staff', 'is_active', 'start_date', 'department')

    # Поля для поиска
    search_fields = (
        'email',
        'user_name',
        'last_name',
        'first_name',
        'patronymic',
        'phone',
        'organization',
        'department',
        'position'
    )

    # Редактируемые прямо из списка (быстрое изменение)
    list_editable = ('is_active', 'is_staff')

    # Поля и группы при редактировании пользователя
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {
            'fields': (
                'user_name',
                'last_name',
                'first_name',
                'patronymic',
                'phone',
                'organization',
                'department',
                'position'
            )
        }),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('start_date', 'last_login')}),
    )

    # Поля при создании нового пользователя (через админку)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'user_name',
                'last_name',
                'first_name',
                'patronymic',
                'phone',
                'organization',
                'department',
                'position',
                'password1',
                'password2',
                'is_active',
                'is_staff'
            ),
        }),
    )

    ordering = ('email',)


admin.site.register(NewUser, NewUserAdmin)
admin.site.unregister(Group)  # убираем стандартную группу, если не нужна
