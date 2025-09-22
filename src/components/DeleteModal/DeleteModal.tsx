import React, { ReactElement, useState } from "react";
import styles from "./DeleteModal.module.less";

interface DeleteModalProps {
  closeModal: () => void;
  handleDelete: () => void;
}

const DeleteModal = ({
  closeModal,
  handleDelete,
}: DeleteModalProps): ReactElement => {
  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal}>
        <div className={styles.modal_header}>
          <span className={styles.header_spacer}></span>
          <h2>Delete Item</h2>
          <button className={styles.close_button} onClick={closeModal}>
            X
          </button>
        </div>
        <p>Are you sure you want to delete item?</p>
        <div className={styles.confirm_buttons}>
          <button onClick={closeModal}>
            Cancel
          </button>
          <button onClick={handleDelete}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
