import React from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import styles from './Login.module.less';

const Login: React.FC = () => {
  const handleLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login error:", error);
      alert(`Login failed: ${error.message || "Please try again."}`);
    }
  };

  return (
    <div className={styles.login_container}>
      <h1>FAMILY CHRISTMAS LISTS</h1>
      <button className={styles.login_button} onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Login;