# users/utils.py
from functools import wraps
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions

def dummy_get_response(request):
    return None

def enforce_csrf(func):
    """
    Декоратор для принудительной проверки CSRF.
    """
    @wraps(func)
    def wrapped_view(request, *args, **kwargs):
        check = CSRFCheck(dummy_get_response)
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            raise exceptions.PermissionDenied('CSRF Failed: %s' % reason) 
        return func(request, *args, **kwargs)
    return wrapped_view

def set_jwt_cookies(response, access_token, refresh_token):
    response.set_cookie(
        'access_token',
        access_token,
        max_age=60 * 60,  # 60 минут
        httponly=True,
        secure=False,  # True для production
        samesite='Strict'
    )
    response.set_cookie(
        'refresh_token',
        refresh_token,
        max_age=7 * 24 * 60 * 60,  # 7 дней
        httponly=True,
        secure=False,
        samesite='Strict'
    )
    return response
