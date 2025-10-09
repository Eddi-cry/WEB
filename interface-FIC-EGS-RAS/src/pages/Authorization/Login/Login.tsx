import Button from '@components/Button/Button.tsx'
import './Login.scss'
import { useForm } from 'react-hook-form';
import authService from '@services/authService.ts';
import { useState } from 'react';

interface LoginProps {
  'email': string,
  'password': string
}

function Login() {
  const {register, handleSubmit, formState} = useForm<LoginProps>();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: LoginProps) => {
    setSubmitError(null);
    try {
      await authService.login({ email: data.email, password: data.password });
      // success: tokens saved by service; redirect if needed
      // window.location.href = '/Access';
    } catch (err) {
      setSubmitError('Неверная почта или пароль');
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
          />
          {passwordError && <p className='login__form-error'>{passwordError.message}</p>}
          {submitError && <p className='login__form-error'>{submitError}</p>}
        </form>
        <Button form='login__form' type='submit' aim='login' content={'Войти'}></Button>
      </div>
    </section>
  );
}

export default Login;