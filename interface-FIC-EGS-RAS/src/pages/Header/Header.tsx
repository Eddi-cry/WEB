import './Header.scss';
// import LinkOrganization from '@/components/LinkOrganization/LinkOrganization.tsx'
import HeaderLogo from './HeaderLogo.tsx';
import HeaderNav from './HeaderNav.tsx';

function Header() {
  return (
    <header className='header'>
      <div className='header__container'>
        <HeaderLogo />
        {/* <LinkOrganization classNamePart='header-organization' /> */}
        <HeaderNav />
      </div>
    </header>
  );
}

export default Header;
