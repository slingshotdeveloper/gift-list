import React, { ReactElement, useState } from "react";
import styles from "./SignUpModal.module.less";
import NewGroupForm from "../NewGroupForm/NewGroupForm";
import JoinGroupForm from "../JoinGroupForm/JoinGroupForm";

interface SignUpModalProps {
  closeModal: () => void;
}

type SignupStep = "signup" | "new-group" | "join-group";

const SignUpModal = ({ closeModal }: SignUpModalProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>("signup");

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal}>
        <div className={styles.modal_header}>
          <span className={styles.header_spacer}></span>
          <button
            className={styles.close_button}
            onClick={() => {
              setSignupStep("signup");
              closeModal();
            }}
          >
            X
          </button>
        </div>
        {signupStep === "signup" && (
          <div className={styles.signup_buttons}>
            <button onClick={() => setSignupStep("new-group")}>
              Create Group
            </button>
            <hr className={styles.separator} />
            <button onClick={() => setSignupStep("join-group")}>
              Join Group
            </button>
          </div>
        )}
        {signupStep === "new-group" && <NewGroupForm/>}
        {signupStep === "join-group" && <JoinGroupForm/>}
      </div>
    </div>
  );
};

export default SignUpModal;
