import React, { ReactElement } from "react";
import styles from './Navbar.module.less';
import { Link } from "react-router-dom";

interface NavbarProps {
  setOnList: (condition: boolean) => void;
  onLogout: () => void;
}

const Navbar = ({ onLogout, setOnList }: NavbarProps): ReactElement => {
  
  return (
    <nav className={styles.navbar}>
  <ul className={styles.navItems}>
    <div className={styles.leftNav}>
      <li>
        <Link to="/my-list">My List</Link>
      </li>
      <li>
        <Link onClick={() => setOnList(false)} to="/family-lists">Family Lists</Link>
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