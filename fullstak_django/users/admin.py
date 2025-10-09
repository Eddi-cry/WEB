# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from .models import NewUser


# Настройка отображения в списке
class NewUserAdmin(UserAdmin):
    # Поля, которые будут отображаться в списке пользователей
    list_display = ('email', 'user_name', 'organization', 'is_active', 'is_staff', 'start_date')
    
    # Поля, по которым можно кликать для перехода в редактирование
    list_display_links = ('email', 'user_name')
    
    # Поля для фильтрации (справа)
    list_filter = ('is_staff', 'is_active', 'start_date')
    
    # Поля, по которым можно искать
    search_fields = ('email', 'user_name', 'organization')

    #Поля, по которые можно ихменить
    list_editable = ('is_active', 'is_staff')
    
    # Поля, которые будут отображаться при редактировании
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('user_name', 'organization')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('start_date', 'last_login')}),
    )
    
    # Поля при создании нового пользователя
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'user_name', 'organization', 'password1', 'password2', 'is_active', 'is_staff'),
        }),
    )
    
    # Сортировка по умолчанию
    ordering = ('email',)


# Зарегистрируй модель
admin.site.register(NewUser, NewUserAdmin)

# (Опционально) Убери стандартную группу из админки, если не нужна
admin.site.unregister(Group)