import './Login.scss';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '@components/Button/Button.tsx';
import authService from '@services/authService.ts';
import { useAuth } from '@context/AuthContext.tsx';

interface LoginProps {
  email: string;
  password: string;
}

function Login() {
  const { register, handleSubmit, formState } = useForm<LoginProps>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/Access';

  const onSubmit = async (data: LoginProps) => {
    setSubmitError(null);

    try {
      const response = await authService.login({ email: data.email, password: data.password });
      setUser(response.user);
      navigate(from, { replace: true });
    } catch {
      setSubmitError('Неверная почта или пароль');
    }
  };

  const loginError = formState.errors.email;
  const passwordError = formState.errors.password;

  return (
    <section className='login'>
      <div className='login__container'>
        <h2 className='login__title'>Вход</h2>
        <form id='login__form' className='login__form' onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('email', {
              required: 'Почта обязательна',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Некорректный формат почты',
              },
            })}
            type='email'
            className='login__form-input'
            placeholder='Почта'
          />
          {loginError && <p className='login__form-error'>{loginError.message}</p>}
          <input
            {...register('password', {
              required: 'Пароль обязательный',
              minLength: { value: 8, message: 'Минимум 8 символов' },
            })}
            type='password'
            className='login__form-input'
            placeholder='Пароль'
          />
          {passwordError && <p className='login__form-error'>{passwordError.message}</p>}
          {submitError && <p className='login__form-error'>{submitError}</p>}
        </form>
        <Button form='login__form' type='submit' aim='login' content={'Войти'}></Button>
        <p className='login__text'>
            <a href='/ResetPassword' className='login__link'>
              Забыли пароль?
          </a>
        </p>
        <p className='login__text'>
          У вас нет аккаунта?{' '}
          <a href='/Registration' className='login__link'>
            Зарегистрируйтесь
          </a>
        </p>
      </div>
    </section>
  );
}

export default Login;
