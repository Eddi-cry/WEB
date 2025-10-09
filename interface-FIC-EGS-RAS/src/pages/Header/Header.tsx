import { Link } from 'react-router-dom'
import './Header.scss'
import logo320 from '@assets/logo/header-logo-320.svg'
import logo575 from '@assets/logo/header-logo-575.svg'
import logo767 from '@assets/logo/header-logo-767.svg'
import logo992 from '@assets/logo/header-logo-992.svg'
import logo1600 from '@assets/logo/header-logo-1600.svg'
import LinkOrganization from '@/components/LinkOrganization/LinkOrganization'

function Header() {
  return (
    <header className='header'>
      <div className='header__container'>
        <div className='header__logo-container'>
          <a className='header__logo-link' href="http://www.gsras.ru">
            <picture className='header__picture'>
              <source 
                srcSet={logo320} 
                media='(max-width: 320px)' 
              />
              <source 
                srcSet={logo575} 
                media='(max-width: 575px)' 
              />
              <source 
                srcSet={logo767} 
                media='(max-width: 767px)' 
              />
              <source 
                srcSet={logo992} 
                media='(max-width: 992px)' 
              />
              <img 
                src={logo1600} 
                alt='Федеральный исследовательский центр – Единая геофизическая служба РАН' 
                className='header__logo' 
              />
            </picture>
          </a>
        </div>
        <LinkOrganization classNamePart='header-organization' />
        <div className='header__nav-container'>
          <nav className='header__nav'>
            <Link to='/Information' className='header__link'>Информация</Link>
            <Link to='/Stations' className='header__link'>Станции</Link>
            <Link to='/Access' className='header__link'>Доступ к данным</Link>
          </nav>
          <div className='header__auth'>
            <Link to='/Login' className='header__auth-link'>Вход</Link>
            <span className='header__auth-slash'>/</span>
            <Link to='/Registration' className='header__auth-link'>Регистрация</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
