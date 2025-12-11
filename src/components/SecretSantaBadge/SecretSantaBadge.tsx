import React, { ReactElement, useState } from "react";
import styles from "./SecretSantaBadge.module.less"; 
import { BeatLoader } from "react-spinners";
import { useMediaQuery } from "../../utils/useMediaQuery";

interface SecretSanta {
  name: string;
  uid: string;
}

interface SecretSantaBadgeProps {
  secretSanta: SecretSanta[];
  isLoading?: boolean;
  openModal: () => void;
  isAdmin: boolean;
}

const SecretSantaBadge = ({ secretSanta, isLoading, openModal, isAdmin }: SecretSantaBadgeProps): ReactElement | null => {
  const [hovered, setHovered] = useState(false);
  const isMobile = useMediaQuery({ "max-width": 840 });  

  if (!secretSanta || secretSanta.length === 0) return <div className={styles.empty_div}/>;

  const currentYear = new Date().getFullYear();
  const title = secretSanta.length > 1 ? `${currentYear} Secret Santa:` : `${currentYear} Secret Santa:`;
  const names = secretSanta.length === 1 ? secretSanta[0].name : `${secretSanta[0].name} & ${secretSanta[1].name}`

  const containerProps = isAdmin
    ? isMobile 
      ? {
          onClick: openModal,
          className: styles.secret_santa_container,
        }
      : {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onTouchStart: () => setHovered(true),
        onTouchEnd: () => setHovered(false),
        onClick: openModal,
        className: `${styles.secret_santa_container} ${hovered ? styles.hovered : ""}`,
      }
    : {
        className: styles.secret_santa_container,
      };

  return (
    <div {...containerProps}>
      <h5 className={styles.secret_santa_title}>{title}</h5>
      {isLoading ? (
        <BeatLoader size={10} className={styles.secret_santa_spinner} />
      ) : (
        <h4 className={styles.secret_santa_name}>{names}</h4>
      )}

      {isAdmin && (
        <div className={styles.secret_santa_overlay}>
          <span>Shuffle</span>
        </div>
      )}
    </div>
  );
}

export default SecretSantaBadge;