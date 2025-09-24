import React, { ReactElement, useState } from "react";
import styles from "./RefreshBoughtItemsModal.module.less";
import { RefreshBoughtItemsForUser } from "../../utils/firebase/firebaseUtils";

interface RefreshBoughtItemsModalProps {
  closeModal: () => void;
  fetchItems: (identifier: string) => void;
  identifier: string;
}

const RefreshBoughtItemsModal = ({
  closeModal,
  fetchItems,
  identifier,
}: RefreshBoughtItemsModalProps): ReactElement => {
  const [isRefreshing, setisRefreshing] = useState(false);

  const handleRefresh = async (identifier: string) => {
    try {
      setisRefreshing(true);
      await RefreshBoughtItemsForUser(identifier);
      fetchItems(identifier);
      closeModal();
    } catch (error) {
      console.error("Error refreshing bought items:", error);
    }
  };

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal}>
        <div className={styles.modal_header}>
          <span className={styles.header_spacer}></span>
          <h2>Refresh Bought Items</h2>
          <button className={styles.close_button} onClick={closeModal}>
            X
          </button>
        </div>
        <p>Are you sure you want to refresh all bought items?</p>
        <p className={styles.small_text}>
          (If anyone has already marked an item bought this will reset it.)
        </p>
        <div className={styles.confirm_buttons}>
          <button onClick={closeModal}>Cancel</button>
          <button
            onClick={() => handleRefresh(identifier)}
            disabled={isRefreshing}
          >
            {!isRefreshing ? "Confirm" : "Refreshing..."}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefreshBoughtItemsModal;
