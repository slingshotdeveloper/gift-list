import React, { useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import styles from "./Login.module.less";
import SignUpModal from "../../components/SignUpModal/SignUpModal";

const Login: React.FC = () => {
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

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

  const handleSignUp = () => {
    setIsSignUpModalOpen(true);
  };

  const closeSignUpModal = () => {
    setIsSignUpModalOpen(false);
  }

  return (
    <>
    <div className={styles.login_container}>
      <h1>GIFT LISTS</h1>
      <div className={styles.button_container}>
        <button className={styles.login_button} onClick={handleLogin}>
          Login
        </button>
        <button className={styles.login_button} onClick={handleSignUp}> Sign Up</button>
      </div>
    </div>
    {isSignUpModalOpen && <SignUpModal closeModal={closeSignUpModal}/>}
    </>
    
  );
};

export default Login;
