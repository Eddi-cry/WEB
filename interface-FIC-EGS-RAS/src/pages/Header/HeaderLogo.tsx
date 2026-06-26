import logo320 from '@assets/logo/header-logo-320.svg';
import logo575 from '@assets/logo/header-logo-575.svg';
import logo767 from '@assets/logo/header-logo-767.svg';
import logo992 from '@assets/logo/header-logo-992.svg';
import logo1600 from '@assets/logo/header-logo-1600.svg';

function HeaderLogo() {
  return (
    <div className='header__logo-container'>
      <a className='header__logo-link' href='http://www.gsras.ru'>
        <picture className='header__picture'>
          <source srcSet={logo320} media='(max-width: 320px)' />
          <source srcSet={logo575} media='(max-width: 575px)' />
          <source srcSet={logo767} media='(max-width: 767px)' />
          <source srcSet={logo992} media='(max-width: 992px)' />
          <img
            src={logo1600}
            alt='Федеральный исследовательский центр – Единая геофизическая служба РАН'
            className='header__logo'
          />
        </picture>
      </a>
    </div>
  );
}

export default HeaderLogo;
