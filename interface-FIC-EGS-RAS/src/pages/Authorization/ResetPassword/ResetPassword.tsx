import './ResetPassword.scss';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Button from '@components/Button/Button.tsx';
import authService from '@services/authService.ts';

interface RequestResetForm {
  email: string;
}

interface ConfirmResetForm {
  password: string;
  password2: string;
}

function ResetPassword() {
  // Берём параметры из пути (для ссылок вида /reset-password-confirm/uid/token)
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const requestForm = useForm<RequestResetForm>();
  const confirmForm = useForm<ConfirmResetForm>();

  const onRequestReset = async (data: RequestResetForm) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await authService.requestPasswordReset({ email: data.email });
      setSubmitSuccess('Инструкции по восстановлению пароля отправлены на вашу почту');
    } catch {
      setSubmitError('Не удалось отправить запрос на восстановление пароля');
    }
  };

  const onConfirmReset = async (data: ConfirmResetForm) => {
    if (!uid || !token) return;

    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await authService.confirmPasswordReset({
        uid,          // ← передаём uid
        token,        // ← передаём token
        new_password: data.password,
        confirm_password: data.password2,
      });
      setSubmitSuccess('Пароль успешно изменён');
      setTimeout(() => navigate('/Login', { replace: true }), 2000);
    } catch {
      setSubmitError('Ошибка сброса пароля. Ссылка может быть недействительной или устаревшей');
    }
  };

  // Если есть uid и token – показываем форму смены пароля
  if (uid && token) {
    const passwordError = confirmForm.formState.errors.password;
    const password2Error = confirmForm.formState.errors.password2;

    return (
      <section className='reset'>
        <div className='reset__container'>
          <h2 className='reset__title'>Новый пароль</h2>
          <form
            id='reset-confirm__form'
            className='reset__form'
            onSubmit={confirmForm.handleSubmit(onConfirmReset)}
          >
            <input
              {...confirmForm.register('password', {
                required: 'Пароль обязателен',
                minLength: { value: 8, message: 'Минимум 8 символов' },
              })}
              type='password'
              className='reset__form-input'
              placeholder='Новый пароль'
            />
            {passwordError && <p className='reset__form-error'>{passwordError.message}</p>}

            <input
              {...confirmForm.register('password2', {
                required: 'Подтверждение пароля обязательно',
                validate: (value) =>
                  value === confirmForm.getValues('password') || 'Пароли не совпадают',
              })}
              type='password'
              className='reset__form-input'
              placeholder='Повторите пароль'
            />
            {password2Error && <p className='reset__form-error'>{password2Error.message}</p>}

            {submitError && <p className='reset__form-error'>{submitError}</p>}
            {submitSuccess && <p className='reset__form-success'>{submitSuccess}</p>}
          </form>
          <Button form='reset-confirm__form' type='submit' aim='reset' content='Сохранить пароль' />
          <p className='reset__text'>
            <Link to='/Login' className='reset__link'>
              Вернуться ко входу
            </Link>
          </p>
        </div>
      </section>
    );
  }

  // Иначе – форма запроса сброса (без параметров)
  const emailError = requestForm.formState.errors.email;

  return (
    <section className='reset'>
      <div className='reset__container'>
        <h2 className='reset__title'>Восстановление пароля</h2>
        <form
          id='reset-request__form'
          className='reset__form'
          onSubmit={requestForm.handleSubmit(onRequestReset)}
        >
          <input
            {...requestForm.register('email', {
              required: 'Почта обязательна',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Некорректный формат почты',
              },
            })}
            type='email'
            className='reset__form-input'
            placeholder='Почта'
          />
          {emailError && <p className='reset__form-error'>{emailError.message}</p>}

          {submitError && <p className='reset__form-error'>{submitError}</p>}
          {submitSuccess && <p className='reset__form-success'>{submitSuccess}</p>}
        </form>
        <Button form='reset-request__form' type='submit' aim='reset' content='Отправить' />
        <p className='reset__text'>
          <Link to='/Login' className='reset__link'>
            Вернуться ко входу
          </Link>
        </p>
      </div>
    </section>
  );
}

export default ResetPassword;
