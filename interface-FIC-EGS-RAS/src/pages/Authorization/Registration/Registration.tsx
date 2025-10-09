import Button from '@components/Button/Button.tsx'
import './Registration.scss'
import { useForm } from 'react-hook-form'
import authService from '@services/authService.ts'
import { useState } from 'react'

interface RegistrationProps {
  'name': string,
  'email': string,
  'organization': string,
  'password': string,
  'confirm-password': string,
}

function Registration() {
  const {register, handleSubmit, formState, watch} = useForm<RegistrationProps>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const onSubmit = async (data: RegistrationProps) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const payload = {
        email: data.email,
        user_name: data.name,
        organization: data.organization,
        password: data.password,
        password2: data['confirm-password'],
      };
      await authService.register(payload);
      setSubmitSuccess('Пользователь успешно создан');
      // window.location.href = '/Login';
    } catch (err) {
      setSubmitError('Не удалось зарегистрироваться');
    }
  };

  const nameError = formState.errors.name;
  const emailError = formState.errors.email;
  const organizationError = formState.errors.organization;
  const passwordError = formState.errors.password;
  const confirmPasswordError = formState.errors['confirm-password'];

  return (
    <section className='reg'>
      <div className='reg__container'>
        <h2 className='reg__title'>Регистрация</h2>
        <form id='reg__form' className='reg__form' onSubmit={handleSubmit(onSubmit)}>
          <input 
            {...register('name', {
              required: 'Имя пользователя обязательное',
            })} 
            type='text' 
            className='reg__form-input' 
            placeholder='Имя пользователя'
          />
          {nameError && <p className='reg__form-error'>{nameError.message}</p>}
          <input 
            {...register('email', {
              required: 'Почта обязательная',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                message: 'Некорректная почта'
              },
            })} 
            type='text' 
            className='reg__form-input' 
            placeholder='Почта'
          />
          {emailError && <p className='reg__form-error'>{emailError.message}</p>}
          <input 
            {...register('organization', {
              required: 'Организация обязательная',
            })} 
            type='text' 
            className='reg__form-input' 
            placeholder='Организация'
          />
          {organizationError && <p className='reg__form-error'>{organizationError.message}</p>}
          <input 
            {...register('password', {
              required: 'Пароль обязательный',
              minLength: {value: 8, message: 'Минимум 8 символов'},
            })} 
            type='password' 
            className='reg__form-input' 
            placeholder='Пароль'
          />
          {passwordError && <p className='reg__form-error'>{passwordError.message}</p>}
          <input 
            {...register('confirm-password', {
              required: 'Пароль обязательный',
              minLength: {value: 8, message: 'Минимум 8 символов'},
              validate: (value) => value === watch('password') || 'Пароли не совпадают',
            })}
            type='password' 
            className='reg__form-input' 
            placeholder='Подтверждение пароля'
          />
          {confirmPasswordError && <p className='reg__form-error'>{confirmPasswordError.message}</p>}
          {submitError && <p className='reg__form-error'>{submitError}</p>}
          {submitSuccess && <p className='reg__form-success'>{submitSuccess}</p>}
        </form>
        <Button form='reg__form' type='submit' aim='reg' content={'Зарегистрироваться'}></Button>
      </div>
    </section>
  );
}

export default Registration;