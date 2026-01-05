import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import { UserGroup } from "../../utils/types";
import styles from "./GroupDropdown.module.less";
import { FaChevronDown } from "react-icons/fa";
import { useMediaQuery } from "../../utils/useMediaQuery";

const GroupDropdown = (): React.JSX.Element => {
  const { userGroups, groupId, setGroupId } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLLIElement | null>(null);
  const isMobile = useMediaQuery({ "max-width": 840 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.dropdown_container}>
      {isMobile ? (
        <div
          className={styles.mobile_group_text}
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          {userGroups?.find((g: UserGroup) => g.id === groupId)?.name}
          {userGroups?.length > 1 && (
            <FaChevronDown
              className={`${styles.arrow} ${dropdownOpen ? styles.open : ""}`}
            />
          )}
        </div>
      ) : (
        <li
          ref={dropdownRef}
          className={userGroups?.length > 1 ? styles.list_title : styles.title}
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          {userGroups?.find((g: UserGroup) => g.id === groupId)?.name}
          {userGroups?.length > 1 && (
            <FaChevronDown
              className={`${styles.arrow} ${dropdownOpen ? styles.open : ""}`}
            />
          )}
        </li>
      )}
      <div
        className={`${styles.dropdown_menu} ${dropdownOpen ? styles.open : ""}`}
      >
        <div className={styles.dropdown_inner}>
          {userGroups.map((group: UserGroup) => (
            <div
              key={group.id}
              className={styles.dropdown_item}
              onClick={() => {
                setGroupId(group.id);
                setDropdownOpen(false);
              }}
            >
              {group.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupDropdown;
