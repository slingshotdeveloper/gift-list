import React, { ReactElement } from "react";
import styles from './Navbar.module.less';
import { Link } from "react-router-dom";

interface NavbarProps {
  onLogout: () => void;
}

const Navbar = ({ onLogout }: NavbarProps): ReactElement => {
  
  return (
    <nav className={styles.navbar}>
  <ul className={styles.navItems}>
    <div className={styles.leftNav}>
      <li>
        <Link to="/my-list">My List</Link>
      </li>
      <li>
        <Link to="/family-lists">Family Lists</Link>
      </li>
    </div>
    <div className={styles.rightNav}>
      <li onClick={onLogout}>
        Logout
      </li>
    </div>
  </ul>
</nav>
  );
}

export default Navbar;