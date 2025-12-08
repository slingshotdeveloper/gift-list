import React, { ReactElement, useState } from "react";
import styles from "./DeleteItemsModal.module.less";
import { deleteAllItemsForUser } from "../../utils/firebase/firebaseUtils";
import { useUser } from "../../context/UserContext";

interface DeleteItemsModalProps {
  closeModal: () => void;
  fetchItems: (identifier: string) => void;
  identifier: string;
}

const DeleteItemsModal = ({
  closeModal,
  fetchItems,
  identifier
}: DeleteItemsModalProps): ReactElement => {
  const { groupId } = useUser();
  const [isClearing, setIsClearing] = useState(false);

  const handleDelete = async (identifier: string) => {
    try {
      setIsClearing(true);
      await deleteAllItemsForUser(groupId, identifier);
      fetchItems(identifier);
      closeModal();
    } catch (error) {
      console.error("Error clearing all items:", error);
    }
  }

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal}>
        <h2>Clear Items</h2>
        <p>Are you sure you want to clear all items?</p>
        <p style={{fontSize: '18px'}}>(If anyone has already marked an item bought this will erase it.)</p>
        <button className={styles.close_button} onClick={closeModal}>
          X
        </button>
        <div className={styles.confirm_buttons}>
          <button onClick={closeModal}>
            Cancel
          </button>
          <button onClick={() => handleDelete(identifier)} disabled={isClearing}>{!isClearing ? 'Confirm' : 'Clearing...'}</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteItemsModal;