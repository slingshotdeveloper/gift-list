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
  const [swipedIndex, setSwipedIndex] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const isMobile = useMediaQuery({ "max-width": 840 });
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const touchStartX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    touchStartX.current = e.touches[0].clientX;

    if (openRow !== index) {
      setOpenRow(null);
      setSwipeOffset(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const maxSwipe = -0.26 * rect.width; // -26% of row width

    if (deltaX < 0) {
      // swiping left only
      const newOffset = Math.max(deltaX, maxSwipe);
      setOpenRow(index);
      setSwipeOffset(newOffset);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, index: number) => {
  const deltaX = e.changedTouches[0].clientX - touchStartX.current;
  const rect = e.currentTarget.getBoundingClientRect();
  const maxSwipe = -0.26 * rect.width;

  // If swiped more than halfway, snap open, else snap closed
  if (deltaX < maxSwipe / 2) {
    setOpenRow(index);
    setSwipeOffset(maxSwipe);
  } else {
    setOpenRow(null);
    setSwipeOffset(0);
  }
};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target as Node) &&
        isMobile
      ) {
        setActiveIndex(null);
        setSwipedIndex(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobile]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItemFromDatabase(identifier, itemToDelete);
      closeDeleteModal();
      fetchItems(identifier);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDeleteMobile = async (itemId: string) => {
    if (!itemId) return;
    try {
      setSwipedIndex(null);
      setOpenRow(null);
      await deleteItemFromDatabase(identifier, itemId);
      fetchItems(identifier);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleItemEdited = async (item: Item) => {
    if (!item) return;
    try {
      await updateItemInDatabase(identifier, item);
      closeEditModal();
      fetchItems(identifier);
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
    setSwipedIndex(null);
    setOpenRow(null);
    setIsEditModalOpen(false);
  };

  return (
    <div className={styles.gift_list}>
      <div className={styles.gift_table_wrapper}>
        {items.length > 0 ? (
          isMobile ? (
            <div className={styles.mobile_table}>
              <div className={styles.mobile_table_header}>
                <div
                  className={
                    personal ? styles.item_name_personal : styles.item_name
                  }
                >
                  Item Name
                </div>
                <div
                  className={
                    personal ? styles.item_price_personal : styles.item_price
                  }
                >
                  Price
                </div>
                {!personal && (
                  <span className={styles.item_bought}>Bought?</span>
                )}
              </div>
              {items.map((item, index) => (
                <div key={index} className={styles.gift_row}>
                  {personal && (
                    <div className={styles.row_actions}>
                      <div className={styles.edit_icon}>
                        <FaEdit onClick={() => openEditModal(item)} />
                      </div>
                      <div className={styles.delete_icon}>
                        <FaTrashAlt
                          onClick={() => handleDeleteMobile(item.id)}
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={`${styles.gift_row_content} ${
                      swipedIndex === index ? styles.swiped : ""
                    }`}
                    style={{
                      transform: openRow === index ? `translateX(${swipeOffset}px)` : 'translateX(0)',
                      transition: 'transform 0.2 ease-out'
                    }}
                    onTouchStart={
                      personal ? (e) => handleTouchStart(e, index) : undefined
                    }
                    onTouchMove={
                      personal ? (e) => handleTouchMove(e, index) : undefined
                    }
                    onTouchEnd={
                      personal ? (e) => handleTouchEnd(e, index) : undefined
                    }
                  >
                    {item.link ? (
                      <div
                        className={
                          personal
                            ? styles.item_name_personal
                            : styles.item_name
                        }
                      >
                        <a
                          href={
                            item.link?.startsWith("http")
                              ? item.link
                              : `https://${item.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.name}
                        </a>
                      </div>
                    ) : (
                      <div
                        className={
                          personal
                            ? styles.item_name_personal
                            : styles.item_name
                        }
                      >
                        <span>{item.name}</span>
                      </div>
                    )}
                    <div
                      className={
                        personal
                          ? styles.item_price_personal
                          : styles.item_price
                      }
                    >
                      {item.price}
                    </div>
                    {!personal && (
                      <input
                        type="checkbox"
                        className={`${styles.checkbox} ${styles.item_bought}`}
                        checked={item.bought || false}
                        onChange={() => handleBoughtChange(item)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table ref={tableRef} className={styles.gift_table}>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Price</th>
                  {!personal && <th>Bought?</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {item.link ? (
                      <td>
                        <a
                          href={
                            item.link?.startsWith("http")
                              ? item.link
                              : `https://${item.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.name}
                        </a>
                      </td>
                    ) : (
                      <td>{item.name} </td>
                    )}
                    <td>{item.price}</td>
                    {!personal && (
                      <td>
                        <input
                          type="checkbox"
                          className={`${styles.checkbox} ${styles.item_bought}`}
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
                            onClick={() => openEditModal(item)}
                          />
                          <FaTrashAlt
                            className={styles.delete_icon}
                            onClick={() => openDeleteModal(item.id)}
                          />
                        </div>
                      )}
                  </tr>
                ))}
              </tbody>
            </table>
          )
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
