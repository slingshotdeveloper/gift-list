import React, { ReactElement, useState } from 'react';
import styles from './MobileNavbar.module.less';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import GroupDropdown from '../GroupDropdown/GroupDropdown';

export const MobileNavbar = (): ReactElement => {
  const { logout, setOnList } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenuOpen = () => {
    setIsMenuOpen((prev) => {
      let newState = !prev;

      if (newState) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return newState;
  });
  };

  const handleListClick = () => {
    setOnList(false);
    toggleMenuOpen();
  }

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
              onClick={handleListClick}
              to="/"
            >
              My List
            </Link>
          </div>
          <div className={styles.nav_link}>
            <Link
              className={styles.link}
              onClick={handleListClick}
              to="/group-lists"
            >
              Group Lists
            </Link>
          </div>
          <GroupDropdown/>
          <div className={styles.nav_link}>
            <Link
              className={styles.link}
              to="/"
              onClick={logout}
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
