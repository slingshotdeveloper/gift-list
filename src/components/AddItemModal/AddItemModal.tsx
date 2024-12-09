import React, { ReactElement, useState } from "react";
import styles from "./AddItemModal.module.less";
import { addItemToList } from "../../utils/firebase/firebaseUtils";
import { v4 as uuidv4 } from 'uuid'; // Import UUID

interface AddItemModalProps {
  closeModal: () => void;
  identifier: string;
  fetchItems: (identifier: string) => void;
}

interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

const AddItemModal = ({ identifier, closeModal, fetchItems }: AddItemModalProps): ReactElement => {
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission


  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission behavior
  
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const link = formData.get('link') as string;
  
    if (!name.trim()) {
      alert('Item Name is required.');
      return;
    }
    
    if (isSubmitting) return;

    setIsSubmitting(true);
  
    const newItem: Item = {
      id: uuidv4(),
      name: name.trim(),
      price: price?.trim() || '', // Default to empty string if not provided
      link: link?.trim() || '',  // Default to empty string if not provided
      bought: false,             // Default value for "bought"
    };
  
    try {
      await addItemToList(identifier, newItem); // Replace `email` with the user's email from props or context
      fetchItems(identifier);
      console.log('Item added successfully', newItem);
      closeModal(); // Close the modal after successfully adding the item
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item. Please try again later.');
    }
  };
  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal}>
        <h2>New Item</h2>
        <button className={styles.close_button} onClick={closeModal}>
          X
        </button>
        <form
          onSubmit={handleFormSubmit}
        >
          <div>
            <label htmlFor="name">Item Name</label>
            <input
              id="name"
              name="name"
              required
              type="text"
              placeholder="Enter item name"
            />
          </div>
          <div>
            <label htmlFor="price">Price (optional)</label>
            <input
              id="price"
              name="price"
              type="text"
              placeholder="Enter item price"
            />
          </div>
          <div>
            <label htmlFor="link">Link (optional)</label>
            <input
              id="link"
              name="link"
              type="text"
              placeholder="Enter item link"
            />
          </div>
          <div className={styles.confirm_buttons}>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>{!isSubmitting ? 'Confirm' : 'Submitting'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
