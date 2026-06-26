import './Registration.scss';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Button from '@components/Button/Button.tsx';
import authService from '@services/authService.ts';

interface RegistrationProps {
  surname: string;
  'first-name': string;
  patronymic: string;
  email: string;
  phone: string;
  organization: string;
  department: string;
  position: string;
  password: string;
}

function Registration() {
  const { register, handleSubmit, formState } = useForm<RegistrationProps>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const onSubmit = async (data: RegistrationProps) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const userName = [data.surname, data['first-name'], data.patronymic]
        .filter(Boolean)
        .join(' ');

      await authService.register({
        email: data.email,
        user_name: userName,
        last_name: data.surname,
        first_name: data['first-name'],
        patronymic: data.patronymic,
        phone: data.phone,
        organization: data.organization,
        department: data.department,
        position: data.position,
        password: data.password,
        password2: data.password,
      });

      setSubmitSuccess('Пользователь успешно создан');
    } catch {
      setSubmitError('Не удалось зарегистрироваться');
    }
  };

  const firstNameError = formState.errors['first-name'];
  const surnameError = formState.errors.surname;
  const emailError = formState.errors.email;
  const phoneError = formState.errors.phone;
  const organizationError = formState.errors.organization;
  const passwordError = formState.errors.password;

  return (
    <section className='reg'>
      <div className='reg__container'>
        <h2 className='reg__title'>Регистрация</h2>
        <form id='reg__form' className='reg__form' onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('surname', {
              required: 'Фамилия обязательна',
            })}
            type='text'
            className='reg__form-input'
            placeholder='Фамилия'
          />
          {surnameError && <p className='reg__form-error'>{surnameError.message}</p>}

          <input
            {...register('first-name', {
              required: 'Имя обязательно',
            })}
            type='text'
            className='reg__form-input'
            placeholder='Имя'
          />
          {firstNameError && <p className='reg__form-error'>{firstNameError.message}</p>}

          <input
            {...register('patronymic', {
              required: 'Отчество обязательно',
              validate: value => value.trim().length > 0 || 'Отчество не может быть пустым',
            })}
            type="text"
            className="reg__form-input"
            placeholder="Отчество"
          />

          <input
            {...register('email', {
              required: 'Почта обязательна',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Некорректный формат почты',
              },
            })}
            type='email'
            className='reg__form-input'
            placeholder='Почта'
          />
          {emailError && <p className='reg__form-error'>{emailError.message}</p>}

          <input
            {...register('phone', {
              required: 'Телефон обязателен',
              validate: (value) => {
                if (!value.trim()) return 'Телефон обязателен';
                const phoneNumber = parsePhoneNumberFromString(value);
                if (phoneNumber && phoneNumber.isValid()) {
                  return true;
                }
                return 'Некорректный номер телефона';
              },
            })}
            type="tel"
            className="reg__form-input"
            placeholder="Телефон (в международном формате)"
          />
          {phoneError && <p className='reg__form-error'>{phoneError.message}</p>}

          <input
            {...register('organization', {
              required: 'Организация обязательна',
            })}
            type='text'
            className='reg__form-input'
            placeholder='Организация'
          />
          {organizationError && <p className='reg__form-error'>{organizationError.message}</p>}

          <input
            {...register('department', {
              required: 'Подразделение обязательно',
              validate: value => value.trim().length > 0 || 'Подразделение не может быть пустым',
            })}
            type="text"
            className="reg__form-input"
            placeholder="Подразделение"
          />

          <input
            {...register('position', {
              required: 'Должность обязательна',
              validate: value => value.trim().length > 0 || 'Должность не может быть пустой',
            })}
            type="text"
            className="reg__form-input"
            placeholder="Должность"
          />

          <input
            {...register('password', {
              required: 'Пароль обязателен',
              minLength: { value: 8, message: 'Минимум 8 символов' },
            })}
            type='password'
            className='reg__form-input'
            placeholder='Пароль'
          />
          {passwordError && <p className='reg__form-error'>{passwordError.message}</p>}

          {submitError && <p className='reg__form-error'>{submitError}</p>}
          {submitSuccess && <p className='reg__form-success'>{submitSuccess}</p>}
        </form>
        <Button form='reg__form' type='submit' aim='reg' content={'Зарегистрироваться'}></Button>
      </div>
    </section>
  );
}

export default Registration;
