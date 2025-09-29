import React, { useEffect, useState } from "react";
import styles from "./MyList.module.less";
import GiftList from "../../components/GiftList/GiftList";
import AddItemModal from "../../components/AddItemModal/AddItemModal";
import { FaInfoCircle } from "react-icons/fa";
import {
  fetchKidsByParentEmail,
  fetchUserList,
} from "../../utils/firebase/firebaseUtils";
import SpreadsheetUploader from "../../components/SpreadsheetUploader/SpreadsheetUploader";
import RefreshBoughtItemsModal from "../../components/RefreshBoughtItemsModal/RefreshBoughtItemsModal";

interface MyListProps {
  email: string;
}

interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

interface Kid {
  parentEmail: string;
  name: string;
  items: Item[];
}

const MyList: React.FC<MyListProps> = ({ email }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]); // Items state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<string>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isRefreshBoughtItemsOpen, setIsRefreshBoughtItemsOpen] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch items for the parent
        const userItems = await fetchUserList(email);
        setItems(userItems);

        // Fetch the list of kids
        const kidsList = await fetchKidsByParentEmail(email);

        // For each kid, fetch their items and assign it to the kid object
        const kidsWithItems = await Promise.all(
          kidsList.map(async (kid) => {
            const kidItems = await fetchUserList(kid.name); // Assuming items are fetched by kid's name
            return {
              ...kid,
              items: kidItems,
            };
          })
        );

        setKids(kidsWithItems); // Set kids with their items
      } catch (err) {
        console.error(err);
        setError("Failed to load your list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  if (loading)
    return <div className={styles.gift_list_wrapper}>Loading...</div>;
  if (error) return <div className={styles.gift_list_wrapper}>{error}</div>;

  const openNewItemModal = () => {
    setIsModalOpen(true);
  };

  const openNewItemModalForKid = (kidName: string) => {
    setSelectedKid(kidName);
    setIsModalOpen(true);
  };

  const closeNewItemModal = () => {
    setSelectedKid(null);
    setIsModalOpen(false);
  };

  const openUploaderModal = () => {
    setIsUploaderOpen(true);
  };

  const openUploaderModalForKid = (kidName: string) => {
    setSelectedKid(kidName);
    setIsUploaderOpen(true);
  };

  const closeUploaderModal = () => {
    setSelectedKid(null);
    setIsUploaderOpen(false);
  };

  const openRefreshBoughtItemsModal = () => {
    setIsRefreshBoughtItemsOpen(true);
  };
  const closeRefreshBoughtItemsModal = () => {
    setIsRefreshBoughtItemsOpen(false);
  };

  const openRefreshBoughtItemsModalForKid = (kidName: string) => {
    setSelectedKid(kidName);
    setIsRefreshBoughtItemsOpen(true);
  };

  const fetchItems = async (identifier: string) => {
    try {
      const fetchedItems = await fetchUserList(identifier);

      if (identifier === email) {
        // If the identifier is the parent's email, set the parent's items
        setItems(fetchedItems);
      } else {
        // If the identifier is a kid's name, find the kid and set their items
        setKids((prevKids) =>
          prevKids.map((kid) =>
            kid.name === identifier ? { ...kid, items: fetchedItems } : kid
          )
        );
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.gift_list_wrapper}>
        <h1 className={styles.title}>My Gift List</h1>
        <GiftList
          identifier={email}
          personal={true}
          items={items}
          fetchItems={fetchItems}
        />
        <div className={styles.button_container}>
          <button className={styles.add_item} onClick={openUploaderModal}>
            Upload Data
          </button>
          <button className={styles.add_item} onClick={openNewItemModal}>
            Add Item
          </button>
        </div>
        <div className={styles.refresh_button_container}>
          <div
            className={styles.refresh_button}
            onClick={() => openRefreshBoughtItemsModal()}
          >
            Refresh all bought items
          </div>
          <span
            className={styles.tooltip_icon}
            data-tooltip="Clear all checkboxes marking items as 'bought' on your list so others won't think they're already bought."
          >
            <FaInfoCircle />
          </span>
        </div>
      </div>
      {kids.length > 0 && (
        <div>
          {kids.map((kid, index) => (
            <div key={index} className={styles.gift_list_wrapper}>
              <div className={styles.separator} />
              <h1 className={styles.kid_title}>{kid.name}'s Gift List</h1>
              <GiftList
                identifier={kid.name}
                personal={true}
                items={kid.items}
                fetchItems={fetchItems}
              />
              <div className={styles.button_container}>
                <button
                  className={styles.add_item}
                  onClick={() => openUploaderModalForKid(kid.name)}
                >
                  Upload Data
                </button>
                <button
                  className={styles.add_item}
                  onClick={() => openNewItemModalForKid(kid.name)}
                >
                  Add Item
                </button>
              </div>
              <div className={styles.refresh_button_container}>
                <div
                  className={styles.refresh_button}
                  onClick={() => openRefreshBoughtItemsModalForKid(kid.name)}
                >
                  Refresh all bought items
                </div>
                <span
                  className={styles.tooltip_icon}
                  data-tooltip="Clear all checkboxes marking items as 'bought' on your list so others won't think they're already bought."
                >
                  <FaInfoCircle />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddItemModal
          identifier={selectedKid || email}
          fetchItems={fetchItems}
          closeModal={closeNewItemModal}
        />
      )}

      {isUploaderOpen && (
        <SpreadsheetUploader
          identifier={selectedKid || email}
          fetchItems={fetchItems}
          closeModal={closeUploaderModal}
        />
      )}

      {isRefreshBoughtItemsOpen && (
        <RefreshBoughtItemsModal
          identifier={selectedKid || email}
          fetchItems={fetchItems}
          closeModal={closeRefreshBoughtItemsModal}
        />
      )}
    </div>
  );
};

export default MyList;
