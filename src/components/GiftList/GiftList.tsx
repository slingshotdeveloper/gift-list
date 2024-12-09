import React, { ReactElement, useEffect, useRef, useState } from "react";
import styles from "./GiftList.module.less";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import {
  deleteItemFromDatabase,
  updateItemInDatabase,
} from "../../utils/firebase/firebaseUtils";
import DeleteModal from "../DeleteModal/DeleteModal";
import EditItemModal from "../EditItemModal/EditItemModal";
import { useMediaQuery } from "../../utils/useMediaQuery";

interface GiftListProps {
  identifier: string;
  personal: boolean;
  items: Item[];
  fetchItems: (identifier: string) => void;
  handleBoughtChange?: (item: Item) => void;
}

interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

const GiftList = ({
  identifier,
  personal,
  items,
  fetchItems,
  handleBoughtChange,
}: GiftListProps): ReactElement => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const isMobile = useMediaQuery({ "max-width": 840 });
  const tableRef = useRef<HTMLTableElement | null>(null);

  const handleRowClick = (index: number) => {
    if (isMobile) {
      setActiveIndex((prevIndex) => (prevIndex === index ? null : index)); // Toggle active index
    } else {
      setActiveIndex(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target as Node) &&
        isMobile
      ) {
        setActiveIndex(null); // Reset active index
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside); // Cleanup listener
    };
  }, [isMobile]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItemFromDatabase(identifier, itemToDelete); // Delete the item from the database
      closeDeleteModal();
      fetchItems(identifier); // Refresh the items list
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleItemEdited = async (item: Item) => {
    if (!item) return;
    try {
      await updateItemInDatabase(identifier, item); // Edit the item from the database
      closeEditModal();
      fetchItems(identifier); // Refresh the items list
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
          <table ref={tableRef} className={styles.gift_table}>
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
                  onClick={() => handleRowClick(index)} // Click for mobile
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
                  {personal &&
                    (hoveredIndex === index || activeIndex === index) && (
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
            <p>
              {personal
                ? "No items in your list yet."
                : "No items in their list yet."}
            </p>
          </div>
        )}
      </div>
      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={closeDeleteModal}
          handleDelete={handleDelete}
        />
      )}
      {isEditModalOpen && (
        <EditItemModal
          itemToEdit={itemToEdit}
          setItemToEdit={setItemToEdit}
          closeModal={closeEditModal}
          handleItemEdited={handleItemEdited}
        />
      )}
    </div>
  );
};

export default GiftList;
