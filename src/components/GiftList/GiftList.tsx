import React, { ReactElement, useEffect, useRef, useState } from "react";
import styles from "./GiftList.module.less";
import {
  deleteItemFromDatabase,
  sortItemsInDatabase,
  updateItemInDatabase,
} from "../../utils/firebase/firebaseUtils";
import DeleteModal from "../DeleteModal/DeleteModal";
import EditItemModal from "../EditItemModal/EditItemModal";
import { useMediaQuery } from "../../utils/useMediaQuery";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import GiftRow from "../GiftRow/GiftRow";
import { MobileGiftRow } from "../MobileGiftRow/MobileGiftRow";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Item } from '../../utils/types';

interface GiftListProps {
  identifier: string;
  personal: boolean;
  items: Item[];
  fetchItems: (identifier: string) => void;
  handleBoughtChange?: (item: Item) => void;
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
  const [openRow, setOpenRow] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [orderedItems, setOrderedItems] = useState<Item[]>(items);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleTouchStart = (
    e: React.TouchEvent,
    index: string,
    fromHandle = false
  ) => {
    if (fromHandle) return;
    touchStartX.current = e.touches[0].clientX;

    if (openRow !== index) {
      setOpenRow(null);
      setSwipeOffset(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent, index: string) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current; // ✅ add this
    const rect = e.currentTarget.getBoundingClientRect();
    const maxSwipe = -0.285 * rect.width; // -28.5% of row width

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }

    if (deltaX < 0) {
      const newOffset = Math.max(deltaX, maxSwipe);
      setOpenRow(index);
      setSwipeOffset(newOffset);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, index: string) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const maxSwipe = -0.285 * rect.width;

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
    setOrderedItems(items);
  }, [items]);

  const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }),
);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    // Only proceed if the item was dropped over a different item
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }
    const oldIndex = orderedItems.findIndex((i) => i.id === active.id);
    const newIndex = orderedItems.findIndex((i) => i.id === over.id);
    // Only update if the position actually changed
    if (oldIndex !== newIndex) {
      const newItems = arrayMove(orderedItems, oldIndex, newIndex);
      setOrderedItems(newItems);
      await sortItemsInDatabase(identifier, newItems);
    }
    setActiveId(null);
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
            // mobile
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
                {personal && isMobile && (
                  <span className={styles.drag_mobile}></span>
                )}
                {!personal && (
                  <span className={styles.item_bought}>Bought</span>
                )}
              </div>
              {!personal ? (
                // family list view mobile
                items.map((item, index) => (
                  <div key={index} className={styles.gift_row}>
                    <div className={styles.gift_row_content}>
                      {item.link ? (
                        <div className={styles.item_name}>
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
                        <div className={styles.item_name}>
                          <span>{item.name}</span>
                        </div>
                      )}
                      <div className={styles.item_price}>{item.price}</div>
                      <div className={styles.item_bought}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={item.bought || false}
                          onChange={() => handleBoughtChange(item)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // personal list view mobile
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={orderedItems.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {orderedItems.map((item, index) => (
                      <MobileGiftRow
                        key={item.id}
                        item={item}
                        index={index}
                        openRow={openRow}
                        setOpenRow={setOpenRow}
                        swipedIndex={swipedIndex}
                        swipeOffset={swipeOffset}
                        handleTouchStart={handleTouchStart}
                        handleTouchMove={handleTouchMove}
                        handleTouchEnd={handleTouchEnd}
                        openEditModal={openEditModal}
                        handleDeleteMobile={handleDeleteMobile}
                      />
                    ))}
                  </SortableContext>
                  <DragOverlay>
                    {activeId
                      ? (() => {
                          const activeItem = orderedItems.find(
                            (i) => i.id === activeId
                          );
                          if (!activeItem) return null;

                          return (
                            <div className={styles.gift_row_overlay}>
                              <div className={styles.gift_row_content}>
                                <div
                                  className={
                                    personal
                                      ? styles.item_name_personal
                                      : styles.item_name
                                  }
                                >
                                  {activeItem.name}
                                </div>
                                <div
                                  className={
                                    personal
                                      ? styles.item_price_personal
                                      : styles.item_price
                                  }
                                >
                                  {activeItem.price}
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          ) : (
            // desktop
            <div ref={tableRef} className={styles.gift_table}>
              <div className={styles.table_header}>
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
                  <span className={styles.item_bought}>Bought</span>
                )}
              </div>
              {!personal ? (
                // family list view desktop
                items.map((item, index) => (
                  <div key={index} className={styles.gift_row}>
                    <div className={styles.gift_row_content}>
                      {item.link ? (
                        <div className={styles.item_name}>
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
                        <div className={styles.item_name}>{item.name}</div>
                      )}
                      <div className={styles.item_price}>{item.price}</div>
                      <div className={styles.item_bought}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={item.bought || false}
                          onChange={() => handleBoughtChange(item)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // personal list view desktop
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={orderedItems.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {orderedItems.map((item, index) => (
                      <GiftRow
                        key={item.id}
                        item={item}
                        index={index}
                        personal={personal}
                        hoveredIndex={hoveredIndex}
                        activeIndex={activeIndex}
                        setHoveredIndex={setHoveredIndex}
                        openEditModal={openEditModal}
                        openDeleteModal={openDeleteModal}
                        handleBoughtChange={handleBoughtChange}
                      />
                    ))}
                  </SortableContext>
                  <DragOverlay>
                    {activeId
                      ? (() => {
                          const activeItem = orderedItems.find(
                            (i) => i.id === activeId
                          );
                          if (!activeItem) return null;

                          return (
                            <div className={styles.gift_row_overlay}>
                              <div className={styles.gift_row_content}>
                                <div
                                  className={
                                    personal
                                      ? styles.item_name_personal
                                      : styles.item_name
                                  }
                                >
                                  {activeItem.name}
                                </div>
                                <div
                                  className={
                                    personal
                                      ? styles.item_price_personal
                                      : styles.item_price
                                  }
                                >
                                  {activeItem.price}
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
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
