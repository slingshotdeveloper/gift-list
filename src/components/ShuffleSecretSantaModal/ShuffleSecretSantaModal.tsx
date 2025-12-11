import React, { ReactElement, useState } from "react";
import styles from "./ShuffleSecretSantaModal.module.less";
import { shuffleSecretSantaForCouples } from "../../utils/firebase/firebaseUtils";
import { useUser } from "../../context/UserContext";

interface ShuffleSecretSantaModalProps {
  onShuffle: () => void;
  closeModal: () => void;
}

const ShuffleSecretSantaModal = ({
  onShuffle,
  closeModal,
}: ShuffleSecretSantaModalProps): ReactElement => {
  const { groupId } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal}>
        <div className={styles.modal_header}>
          <span className={styles.header_spacer}></span>
          <h2>Reshuffle Secret Santas</h2>
          <button className={styles.close_button} onClick={closeModal}>
            X
          </button>
        </div>
        <p>Are you sure you want to reshuffle all secret santa recipients?</p>
        <p className={styles.small_text}>
          (This will reshuffle everyone's secret santa.)
        </p>
        <div className={styles.confirm_buttons}>
          <button onClick={closeModal}>Cancel</button>
          <button
            onClick={() => onShuffle()}
            disabled={isLoading}
          >
            {!isLoading ? "Confirm" : "Reshuffling..."}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShuffleSecretSantaModal;
