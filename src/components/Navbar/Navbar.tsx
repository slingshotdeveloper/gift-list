import React, { ReactElement } from "react";
import styles from "./Navbar.module.less";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import GroupDropdown from "../GroupDropdown/GroupDropdown";

const Navbar = (): ReactElement => {
  const { logout, setOnList, groups } = useUser();

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navItems}>
        <div className={styles.leftNav}>
          <li>
            <Link onClick={() => setOnList(false)} to="/my-list">
              My List
            </Link>
          </li>
          <li>
            <Link onClick={() => setOnList(false)} to="/group-lists">
              Group Lists
            </Link>
          </li>
          {groups.length > 1 && <GroupDropdown />}
        </div>
        <div className={styles.rightNav}>
          <li onClick={logout}>Logout</li>
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;
