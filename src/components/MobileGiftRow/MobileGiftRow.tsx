import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaEdit, FaTrashAlt, FaGripLines } from "react-icons/fa";
import styles from "./MobileGiftRow.module.less";
import React from "react";

interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
}

interface MobileGiftRowProps {
  item: Item;
  index: number;
  openRow: string | null;
  setOpenRow: (id: string | null) => void;
  swipedIndex: number | null;
  swipeOffset: number;
  handleTouchStart: (
    e: React.TouchEvent,
    id: string,
    fromHandle: boolean
  ) => void;
  handleTouchMove: (e: React.TouchEvent, id: string) => void;
  handleTouchEnd: (e: React.TouchEvent, id: string) => void;
  openEditModal: (item: Item) => void;
  handleDeleteMobile: (id: string) => void;
}

export const MobileGiftRow = ({
  item,
  index,
  openRow,
  setOpenRow,
  swipedIndex,
  swipeOffset,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  openEditModal,
  handleDeleteMobile,
}: MobileGiftRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.gift_row}>
      <div className={styles.row_actions}>
        <div className={styles.edit_icon}>
          <FaEdit onClick={() => openEditModal(item)} />
        </div>
        <div className={styles.delete_icon}>
          <FaTrashAlt onClick={() => handleDeleteMobile(item.id)} />
        </div>
      </div>
      <div
        className={`${styles.gift_row_content} ${
          swipedIndex === index ? styles.swiped : ""
        }`}
        style={{
          transform:
            openRow === item.id
              ? `translateX(${swipeOffset}px)`
              : "translateX(0)",
          transition: "transform 0.2s ease-out",
        }}
        onTouchStart={(e) => handleTouchStart(e, item.id, false)}
        onTouchMove={(e) => handleTouchMove(e, item.id)}
        onTouchEnd={(e) => handleTouchEnd(e, item.id)}
      >
        {item.link ? (
          <div className={styles.item_name_personal}>
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
          <div className={styles.item_name_personal}>
            <span>{item.name}</span>
          </div>
        )}
        <div className={styles.item_price_personal}>{item.price}</div>
        <div
          className={styles.drag_mobile}
          {...attributes}
          {...listeners}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <FaGripLines />
        </div>
      </div>
    </div>
  );
};
