import React, { ReactElement, useEffect, useState } from "react";
import styles from "./GiftList.module.less";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { deleteItemFromDatabase, getItemById, updateItemInDatabase } from "../../utils/firebase/firebaseUtils";
import DeleteModal from "../DeleteModal/DeleteModal";
import EditItemModal from "../EditItemModal/EditItemModal";

interface GiftListProps {
  email: string;
  personal: boolean;
  items: Item[];
  fetchItems: () => void;
  handleBoughtChange?: (item: Item) => void;
}

interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

const GiftList = ({ email, personal, items, fetchItems, handleBoughtChange }: GiftListProps): ReactElement => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItemFromDatabase(email, itemToDelete); // Delete the item from the database
      closeDeleteModal();
      fetchItems(); // Refresh the items list
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleItemEdited = async (item: Item) => {
    if (!item) return;
    try {
      await updateItemInDatabase(email, item); // Edit the item from the database
      closeEditModal();
      fetchItems(); // Refresh the items list
    } catch (error) {
      console.error("Error editing item:", error);
    }
  };

  const openDeleteModal = (itemId: string) => {
    setItemToDelete(itemId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const openEditModal = (item: Item) => {
    setItemToEdit(item);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setItemToEdit(null);
    setIsEditModalOpen(false);
  };
  
  return (
    <div className={styles.gift_list}>
      <div className={styles.gift_table_wrapper}>
        {items.length > 0 ? (
          <table className={styles.gift_table}>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Price</th>
                <th>Link</th>
                {!personal && <th>Bought?</th>} 
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  onMouseEnter={() => setHoveredIndex(index)} // Set hover state
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>
                    <a
                      className={styles.link}
                      href={
                        item.link.startsWith("http")
                          ? item.link
                          : `https://${item.link}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.link !== "" && "View Item"}
                    </a>
                  </td>
                  {!personal && (
                    <td>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={item.bought || false}
                        onChange={() => handleBoughtChange(item)}
                      />
                    </td>
                  )}
                  {personal && hoveredIndex === index && (
                    <div className={styles.actions_wrapper}>
                      <FaEdit
                        className={styles.edit_icon}
                        onClick={() => openEditModal(item)} // Pass item id to edit function
                      />
                      <FaTrashAlt
                        className={styles.delete_icon}
                        onClick={() => openDeleteModal(item.id)} // Pass item id to delete function
                      />
                    </div>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.empty_list}>
            <p>{personal ? 'No items in your list yet.' : 'No items in their list yet.'}</p>
            </div>
          
        )}
      </div>
      {isDeleteModalOpen && <DeleteModal closeModal={closeDeleteModal} handleDelete={handleDelete}/>}
      {isEditModalOpen && <EditItemModal itemToEdit={itemToEdit} setItemToEdit={setItemToEdit} closeModal={closeEditModal} handleItemEdited={handleItemEdited}/>}
    </div>
  );
};

export default GiftList;
