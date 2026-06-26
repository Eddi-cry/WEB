import { Link } from 'react-router-dom';

function HeaderNav() {
  return (
    <div className='header__nav-container'>
      <nav className='header__nav'>
        <Link to='/Map' className='header__link'>
          Карта
        </Link>
        <Link to='/Reports' className='header__link'>
          Данные
        </Link>
        <Link to='/Stations' className='header__link'>
          Станции
        </Link>
        <Link to='/Access' className='header__link'>
          Доступ к данным
        </Link>
      </nav>
      <div className='header__auth'>
        <Link to='/Login' className='header__auth-link'>
          Вход
        </Link>
        <span className='header__auth-slash'>/</span>
        <Link to='/Registration' className='header__auth-link'>
          Регистрация
        </Link>
      </div>
    </div>
  );
}

export default HeaderNav;
