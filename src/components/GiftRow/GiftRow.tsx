import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { ReactElement } from "react";
import styles from "./GiftRow.module.less";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { useMediaQuery } from "../../utils/useMediaQuery";
import { Item } from '../../utils/types';

interface GiftRowProps {
  item: Item;
  index: number;
  personal: boolean;
  hoveredIndex?: number | null;
  activeIndex?: number | null;
  setHoveredIndex?: (i: number | null) => void;
  openEditModal: (item: Item) => void;
  openDeleteModal?: (id: string) => void;
  handleBoughtChange?: (item: Item) => void;

  openRow?: string | null;
  setOpenRow?: (index: string | null) => void;
  swipeOffset?: number;
  setSwipeOffset?: (offset: number) => void;
  touchStartX?: React.MutableRefObject<number>;
}

const GiftRow = ({
  item,
  index,
  personal,
  hoveredIndex,
  activeIndex,
  setHoveredIndex,
  openEditModal,
  openDeleteModal,
  handleBoughtChange,

  openRow,
  setOpenRow,
  swipeOffset,
  setSwipeOffset,
  touchStartX,
}: GiftRowProps): ReactElement => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const isMobile = useMediaQuery({ "max-width": 840 });

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    if (openRow !== item.id) {
      setOpenRow(null);
      setSwipeOffset(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const maxSwipe = -0.26 * (e.currentTarget as HTMLDivElement).offsetWidth;
    if (deltaX < 0) setSwipeOffset(Math.max(deltaX, maxSwipe));
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const maxSwipe = -0.26 * (e.currentTarget as HTMLDivElement).offsetWidth;
    if (deltaX < maxSwipe / 2) setOpenRow(item.id);
    else setOpenRow(null);
  };

  const mobileStyle = {
    transform: isDragging
      ? CSS.Transform.toString(transform)
      : openRow === item.id
        ? `translateX(${swipeOffset}px)`
        : "translateX(0)",
    transition: isDragging ? transition : "transform 0.2s ease-out",
    zIndex: isDragging ? 100 : "auto", // ensures dragged item is on top
  };

  const desktopStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      {isMobile ? (
        <div
          ref={setNodeRef}
          style={mobileStyle}
          {...attributes}
          {...listeners}
          className={styles.gift_row}
        >
          <div
            className={styles.gift_row_content}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {item.link ? (
              <div
                className={
                  personal ? styles.item_name_personal : styles.item_name
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
                  personal ? styles.item_name_personal : styles.item_name
                }
              >
                {item.name}
              </div>
            )}
            <div
              className={
                personal ? styles.item_price_personal : styles.item_price
              }
            >
              {item.price}
            </div>
            {!personal && (
              <div>
                <input
                  type="checkbox"
                  className={`${styles.checkbox} ${styles.item_bought}`}
                  checked={item.bought || false}
                  onChange={() => handleBoughtChange?.(item)}
                />
              </div>
            )}
            {personal && (hoveredIndex === index || activeIndex === index) && (
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
          </div>
        </div>
      ) : (
        <div
          ref={setNodeRef}
          style={desktopStyle}
          {...attributes}
          {...listeners}
          className={styles.gift_row}
        >
          <div
            className={styles.gift_row_content}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {item.link ? (
              <div
                className={
                  personal ? styles.item_name_personal : styles.item_name
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
                  personal ? styles.item_name_personal : styles.item_name
                }
              >
                {item.name}
              </div>
            )}
            <div
              className={
                personal ? styles.item_price_personal : styles.item_price
              }
            >
              {item.price}
            </div>
            {!personal && (
              <div>
                <input
                  type="checkbox"
                  className={`${styles.checkbox} ${styles.item_bought}`}
                  checked={item.bought || false}
                  onChange={() => handleBoughtChange?.(item)}
                />
              </div>
            )}
            {personal && (hoveredIndex === index || activeIndex === index) && (
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
          </div>
        </div>
      )}
    </>
  );
};

export default GiftRow;
