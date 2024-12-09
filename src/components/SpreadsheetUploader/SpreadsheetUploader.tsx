import React, { ReactElement, useState } from "react";
import { addItemToList } from "../../utils/firebase/firebaseUtils";
import { v4 as uuidv4 } from 'uuid'; // Import UUID
import styles from './SpreadsheetUploader.module.less';

interface SpreadsheetUploaderProps {
  identifier: string;
  fetchItems: (identifier: string) => void;
  closeModal: () => void;
}

interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

const SpreadsheetUploader = ({ identifier, fetchItems, closeModal }: SpreadsheetUploaderProps): ReactElement => {
  const [inputValue, setInputValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsUploading(true);
      const lines = inputValue.trim().split("\n");

      const headers = ["item", "price", "link"];

      const parsedRows = lines.map((line) => {
        const cells = line.split("\t"); 
        return headers.reduce((acc, header, index) => {
          acc[header] = cells[index]?.trim() || null; 
          return acc;
        }, {} as Record<string, string | null>);
      });

      console.log("Parsed Rows:", parsedRows);

      for (const row of parsedRows) {
        if (!row.item) {
          console.warn("Skipping row due to missing required fields:", row);
          continue;
        }

        const newItem: Item = {
          id: uuidv4(),
          name: row.item!,
          price: row.price || '',
          link: row.link || '',
          bought: false,
        };

        await addItemToList(identifier, newItem);
      }

      fetchItems(identifier);
      closeModal();
      setIsUploading(false);
      setInputValue("");
    } catch (error) {
      console.error("Failed to update Firestore:", error);
    }
  };

  return ( 
    <div className={styles.modal_overlay}>
    <div className={styles.modal}>
      <h2>Upload Data</h2>
      <button className={styles.close_button} onClick={closeModal}>
        X
      </button>
      <form onSubmit={handleSubmit}>
         <textarea
          className={styles.data_input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Paste your spreadsheet data in format (item name, price, link)"
        />
        <div className={styles.confirm_buttons}>
          <button type="button" onClick={closeModal}>
            Cancel
          </button>
          <button type="submit" disabled={isUploading}>{!isUploading ? 'Confirm' : 'Uploading...'}</button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default SpreadsheetUploader;
