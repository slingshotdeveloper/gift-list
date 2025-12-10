import React, { ReactElement } from "react";
import styles from "./SecretSantaBadge.module.less"; 

interface SecretSanta {
  name: string;
  uid: string;
}

interface SecretSantaBadgeProps {
  secretSanta: SecretSanta[];
}

const SecretSantaBadge = ({ secretSanta }: SecretSantaBadgeProps): ReactElement | null => {
  if (!secretSanta || secretSanta.length === 0) return <div style={{width: '25%'}}/>;
  const currentYear = new Date().getFullYear();
  const title = secretSanta.length > 1 ? `${currentYear} Secret Santa:` : `${currentYear} Secret Santa:`;
  const names = secretSanta.length === 1 ? secretSanta[0].name : `${secretSanta[0].name} & ${secretSanta[1].name}`

  return (
    <div className={styles.secret_santa_container}>
      <h5 className={styles.secret_santa_title}>{title}</h5>
      <h4 className={styles.secret_santa_name}>{names}</h4>
    </div>
  );
}

export default SecretSantaBadge;