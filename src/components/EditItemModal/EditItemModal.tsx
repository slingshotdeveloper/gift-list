import React, { ReactElement, useState } from "react";
import styles from "./EditItemModal.module.less";
import { addItemToList } from "../../utils/firebase/firebaseUtils";

interface EditItemModalProps {
  closeModal: () => void;
  itemToEdit: Item;
  setItemToEdit: (item: Item) => void;
  handleItemEdited: (item: Item) => void;
}

interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

const EditItemModal = ({
  itemToEdit,
  setItemToEdit,
  closeModal,
  handleItemEdited,
}: EditItemModalProps): ReactElement => {
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const updatedItem: Item = {
      ...itemToEdit,
      [name]: value
    }
  
    setItemToEdit(updatedItem);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission behavior

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const link = formData.get("link") as string;

    if (!name.trim()) {
      alert("Item Name is required.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    const editedItem: Item = {
      ...itemToEdit,
      name: name.trim(),
      price: price?.trim() || "", // Default to empty string if not provided
      link: link?.trim() || "", // Default to empty string if not provided
    };
    
    try {
      await handleItemEdited(editedItem);
    } catch (error) {
      console.error("Error editing item: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal}>
        <h2>Edit Item</h2>
        <button className={styles.close_button} onClick={closeModal}>
          X
        </button>
        <form onSubmit={handleFormSubmit}>
          <div>
            <label htmlFor="name">Item Name</label>
            <input
              id="name"
              name="name"
              required
              type="text"
              value={itemToEdit.name}
              onChange={handleInputChange}
              placeholder="Enter item name"
            />
          </div>
          <div>
            <label htmlFor="price">Price (optional)</label>
            <input
              id="price"
              name="price"
              type="text"
              value={itemToEdit.price}
              onChange={handleInputChange}
              placeholder="Enter item price"
            />
          </div>
          <div>
            <label htmlFor="link">Link (optional)</label>
            <input
              id="link"
              name="link"
              type="text"
              value={itemToEdit.link}
              onChange={handleInputChange}
              placeholder="Enter item link"
            />
          </div>
          <div className={styles.confirm_buttons}>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
