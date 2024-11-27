import React, { ReactElement, useState } from 'react';
import styles from './MobileNavbar.module.less';
import { Link } from 'react-router-dom';

interface MobileNavbarProps {
  onLogout: () => void;
}

export const MobileNavbar = ({
  onLogout
}: MobileNavbarProps): ReactElement => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenuOpen = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    path: string,
  ) => {
    e.preventDefault();
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_container}>
        <div className={styles.logo_and_menu}>
          <Link
            to="/"
            className={styles.logo}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
          </Link>
          <div
            className={`${styles.hamburger_menu} ${isMenuOpen && styles.expanded}`}
            onClick={toggleMenuOpen}
          >
            <div className={styles.hamburger_menu_line} />
            <div className={styles.hamburger_menu_line} />
            <div className={styles.hamburger_menu_line} />
          </div>
        </div>
        <div className={`${styles.nav_links} ${isMenuOpen && styles.expanded}`}>
          <div className={styles.nav_link}>
            <Link
              className={styles.link}
              to="/"
            >
              My List
            </Link>
          </div>
          <div className={styles.nav_link}>
            <Link
              className={styles.link}
              to="/family-lists"
            >
              Family Lists
            </Link>
          </div>
          <div className={styles.nav_link}>
            <Link
              className={styles.link}
              to="/"
              onClick={() => onLogout()}
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
