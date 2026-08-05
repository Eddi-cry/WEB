import './UserProfile.scss';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Button from '@components/Button/Button.tsx';
import authService, { type UserProfile as UserProfileData } from '@services/authService.ts';
import { useAuth } from '@context/AuthContext.tsx';

interface ProfileForm {
  surname: string;
  'first-name': string;
  patronymic: string;
  email: string;
  phone: string;
  organization: string;
  department: string;
  position: string;
}

const emptyProfile: UserProfileData = {
  email: '',
  user_name: '',
  organization: '',
  is_active: false,
  is_staff: false,
};

function mapProfileToForm(profile: UserProfileData): ProfileForm {
  return {
    surname: profile.last_name ?? '',
    'first-name': profile.first_name ?? '',
    patronymic: profile.patronymic ?? '',
    email: profile.email,
    phone: profile.phone ?? '',
    organization: profile.organization,
    department: profile.department ?? '',
    position: profile.position ?? '',
  };
}

function UserProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileData>(user ?? emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState } = useForm<ProfileForm>();

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await authService.getProfile();
        setProfile(data);
        setUser(data);
        reset(mapProfileToForm(data));
      } catch {
        const stored = authService.getStoredUser();
        if (stored) {
          setProfile(stored);
          reset(mapProfileToForm(stored));
        } else {
          setLoadError('Не удалось загрузить профиль');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [reset, setUser]);

  const onSubmit = async (data: ProfileForm) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    const userName = [data.surname, data['first-name'], data.patronymic].filter(Boolean).join(' ');

    try {
      const updated = await authService.updateProfile({
        email: data.email,
        user_name: userName,
        last_name: data.surname,
        first_name: data['first-name'],
        patronymic: data.patronymic,
        phone: data.phone,
        organization: data.organization,
        department: data.department,
        position: data.position,
      });

      setProfile(updated);
      setUser(updated);
      setIsEditing(false);
      setSubmitSuccess('Профиль успешно обновлён');
    } catch {
      setSubmitError('Не удалось сохранить изменения');
    }
  };

  const handleCancel = () => {
    reset(mapProfileToForm(profile));
    setIsEditing(false);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  if (isLoading) {
    return (
      <section className='profile'>
        <div className='profile__container'>
          <h2 className='profile__title'>Профиль</h2>
          <p className='profile__status'>Загрузка...</p>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className='profile'>
        <div className='profile__container'>
          <h2 className='profile__title'>Профиль</h2>
          <p className='profile__form-error'>{loadError}</p>
        </div>
      </section>
    );
  }

  if (isEditing) {
    const surnameError = formState.errors.surname;
    const firstNameError = formState.errors['first-name'];
    const emailError = formState.errors.email;
    const phoneError = formState.errors.phone;
    const organizationError = formState.errors.organization;

    return (
      <section className='profile'>
        <div className='profile__container'>
          <h2 className='profile__title'>Редактирование профиля</h2>
          <form
            id='profile__form'
            className='profile__form'
            onSubmit={handleSubmit(onSubmit)}
          >
            <input
              {...register('surname', { required: 'Фамилия обязательна' })}
              type='text'
              className='profile__form-input'
              placeholder='Фамилия'
            />
            {surnameError && <p className='profile__form-error'>{surnameError.message}</p>}

            <input
              {...register('first-name', { required: 'Имя обязательно' })}
              type='text'
              className='profile__form-input'
              placeholder='Имя'
            />
            {firstNameError && <p className='profile__form-error'>{firstNameError.message}</p>}

            <input
              {...register('patronymic', {
                required: 'Отчество обязательно',
                validate: (value) => value.trim().length > 0 || 'Отчество не может быть пустым',
              })}
              type='text'
              className='profile__form-input'
              placeholder='Отчество'
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
              className='profile__form-input'
              placeholder='Почта'
            />
            {emailError && <p className='profile__form-error'>{emailError.message}</p>}

            <input
              {...register('phone', {
                required: 'Телефон обязателен',
                validate: (value) => {
                  if (!value.trim()) return 'Телефон обязателен';
                  const phoneNumber = parsePhoneNumberFromString(value);
                  if (phoneNumber && phoneNumber.isValid()) return true;
                  return 'Некорректный номер телефона';
                },
              })}
              type='tel'
              className='profile__form-input'
              placeholder='Телефон (в международном формате)'
            />
            {phoneError && <p className='profile__form-error'>{phoneError.message}</p>}

            <input
              {...register('organization', { required: 'Организация обязательна' })}
              type='text'
              className='profile__form-input'
              placeholder='Организация'
            />
            {organizationError && (
              <p className='profile__form-error'>{organizationError.message}</p>
            )}

            <input
              {...register('department', {
                required: 'Подразделение обязательно',
                validate: (value) => value.trim().length > 0 || 'Подразделение не может быть пустым',
              })}
              type='text'
              className='profile__form-input'
              placeholder='Подразделение'
            />

            <input
              {...register('position', {
                required: 'Должность обязательна',
                validate: (value) => value.trim().length > 0 || 'Должность не может быть пустой',
              })}
              type='text'
              className='profile__form-input'
              placeholder='Должность'
            />

            {submitError && <p className='profile__form-error'>{submitError}</p>}
            {submitSuccess && <p className='profile__form-success'>{submitSuccess}</p>}
          </form>
          <div className='profile__actions'>
            <Button form='profile__form' type='submit' aim='profile' content='Сохранить' />
            <Button aim='profile' type='button' content='Отмена' onClick={handleCancel} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='profile'>
      <div className='profile__container'>
        <h2 className='profile__title'>Профиль</h2>
        <div className='profile__info'>
          <div className='profile__field'>
            <span className='profile__label'>ФИО</span>
            <span className='profile__value'>{profile.user_name || '—'}</span>
          </div>
          <div className='profile__field'>
            <span className='profile__label'>Почта</span>
            <span className='profile__value'>{profile.email || '—'}</span>
          </div>
          <div className='profile__field'>
            <span className='profile__label'>Телефон</span>
            <span className='profile__value'>{profile.phone || '—'}</span>
          </div>
          <div className='profile__field'>
            <span className='profile__label'>Организация</span>
            <span className='profile__value'>{profile.organization || '—'}</span>
          </div>
          <div className='profile__field'>
            <span className='profile__label'>Подразделение</span>
            <span className='profile__value'>{profile.department || '—'}</span>
          </div>
          <div className='profile__field'>
            <span className='profile__label'>Должность</span>
            <span className='profile__value'>{profile.position || '—'}</span>
          </div>
          <div className='profile__field'>
            <span className='profile__label'>Статус</span>
            <span className='profile__value'>
              {profile.is_active ? 'Активен' : 'Не активен'}
            </span>
          </div>
          <div className='profile__field'>
            <span className='profile__label'>Роль</span>
            <span className='profile__value'>
              {profile.is_staff ? 'Администратор' : 'Пользователь'}
            </span>
          </div>
        </div>
        {submitSuccess && <p className='profile__form-success'>{submitSuccess}</p>}
        <Button aim='profile' type='button' content='Редактировать' onClick={() => setIsEditing(true)} />
      </div>
    </section>
  );
}

export default UserProfile;
