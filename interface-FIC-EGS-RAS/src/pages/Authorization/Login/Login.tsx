// src/pages/Authorization/Login/Login.tsx
import Button from '@components/Button/Button.tsx'
import './Login.scss'
import { useForm } from 'react-hook-form';
import { useAuth } from '@contexts/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  'email': string,
  'password': string
}

function Login() {
  const {register, handleSubmit, formState} = useForm<LoginProps>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Если уже авторизован, перенаправляем
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const onSubmit = async (data: LoginProps) => {
    setSubmitError(null);
    setIsLoading(true);
    
    try {
      await login(data.email, data.password);
      navigate('/'); // Перенаправление после успешного логина
    } catch (err) {
      setSubmitError('Неверная почта или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  const loginError = formState.errors.email;
  const passwordError = formState.errors.password;

  return(
    <section className='login'>
      <div className='login__container'>
        <h2 className='login__title'>Вход</h2>
        <form id='login__form' className='login__form' onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('email', {
              required: 'Почта обязательная',
            })}
            type='text'
            className='login__form-input'
            placeholder='Почта'
            disabled={isLoading}
          />
          {loginError && <p className='login__form-error'>{loginError.message}</p>}
          <input
            {...register('password', {
              required: 'Пароль обязательный',
              minLength: {value: 8, message: 'Минимум 8 символов'},
            })}
            type='password'
            className='login__form-input'
            placeholder='Пароль'
            disabled={isLoading}
          />
          {passwordError && <p className='login__form-error'>{passwordError.message}</p>}
          {submitError && <p className='login__form-error'>{submitError}</p>}
        </form>
        <Button 
          form='login__form' 
          type='submit' 
          aim='login' 
          content={isLoading ? 'Вход...' : 'Войти'}
          disabled={isLoading}
        />
      </div>
    </section>
  );
}

export default Login;
