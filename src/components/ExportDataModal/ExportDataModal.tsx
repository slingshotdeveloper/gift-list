import React, { ReactElement, useState } from "react";
import styles from "./ExportDataModal.module.less";
import { Item } from "../../utils/types";

interface ExportDataModalProps {
  name: string;
  items: Item[];
  closeModal: () => void;
}

const ExportDataModal = ({
  name,
  items,
  closeModal,
}: ExportDataModalProps): ReactElement => {

  const exportData = () => {
    if (!items || items.length === 0) return;

    const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const headers = ["Item", "Price", "Link"];
    const rows = items.map(item => [
      escapeCSV(item.name),
      escapeCSV(item.price || ""),
      escapeCSV(item.link || "")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const fileName = name === 'My List' ? "gift-list.csv" : `${name?.toLowerCase()}-gift-list.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    closeModal();
  };

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal}>
        <div className={styles.modal_header}>
          <span className={styles.header_spacer}></span>
          <h2>Export Data</h2>
          <button className={styles.close_button} onClick={closeModal}>
            X
          </button>
        </div>
        <p>Would you like to download a CSV file of your gift list?</p>
        <div className={styles.confirm_buttons}>
          <button onClick={closeModal}>
            Cancel
          </button>
          <button onClick={exportData}>Download</button>
        </div>
      </div>
    </div>
  );
};

export default ExportDataModal;
