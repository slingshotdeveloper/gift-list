import React, { useEffect, useState } from "react";
import styles from "./MyList.module.less";
import GiftList from "../../components/GiftList/GiftList";
import AddItemModal from "../../components/AddItemModal/AddItemModal";
import { FaInfoCircle, FaPlus } from "react-icons/fa";
import {
  fetchUserInfo,
  fetchUserList,
} from "../../utils/firebase/firebaseUtils";
import SpreadsheetUploader from "../../components/SpreadsheetUploader/SpreadsheetUploader";
import RefreshBoughtItemsModal from "../../components/RefreshBoughtItemsModal/RefreshBoughtItemsModal";
import ExportDataModal from "../../components/ExportDataModal/ExportDataModal";
import { Kid, Item, UserInfo } from "../../utils/types";

interface MyListProps {
  uid: string;
  email: string;
}

const MyList: React.FC<MyListProps> = ({ uid, email }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]); // Items state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<string>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isRefreshBoughtItemsOpen, setIsRefreshBoughtItemsOpen] =
    useState(false);
  const [isExportDataModalOpen, setIsExportDataModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userInfo = await fetchUserInfo(uid);
        setUserInfo(userInfo);
        // Fetch items for the parent
        const userItems = await fetchUserList(email);
        setItems(userItems);

        if (userInfo?.kids?.length > 0) {
          const kidsWithItems = await Promise.all(
          userInfo?.kids?.map(async (kid) => {
            const kidItems = await fetchUserList(kid.name); // Assuming items are fetched by kid's name
            return {
              ...kid,
              items: kidItems,
            };
          })
        );
          setKids(kidsWithItems);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load your list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid, email]);

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
    setSelectedKid(null);
    setIsRefreshBoughtItemsOpen(false);
  };

  const openRefreshBoughtItemsModalForKid = (kidName: string) => {
    setSelectedKid(kidName);
    setIsRefreshBoughtItemsOpen(true);
  };

  const openExportDataModal = () => {
    setIsExportDataModalOpen(true);
  };

  const closeExportDataModal = () => {
    setSelectedKid(null);
    setIsExportDataModalOpen(false);
  };

  const openExportDataModalForKid = (kidName: string) => {
    setSelectedKid(kidName);
    setIsExportDataModalOpen(true);
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
        <div className={styles.title_container}>
          {userInfo?.currSecretSanta?.length > 0 && (
            <div style={{ width: "25%" }} />
          )}
          <h1 className={styles.title}>My Gift List</h1>
          {userInfo?.currSecretSanta?.length > 0 && (
            <div className={styles.secret_santa_container}>
              <h5 className={styles.secret_santa_title}>
                {userInfo.currSecretSanta?.length > 1
                  ? "Secret Santa Recipients:"
                  : "Secret Santa Recipient:"}
              </h5>
              <h4 className={styles.secret_santa_name}>
                {userInfo.currSecretSanta?.length === 1
                  ? userInfo.currSecretSanta[0].name
                  : `${userInfo.currSecretSanta[0].name} & ${userInfo.currSecretSanta[1].name}`}
              </h4>
            </div>
          )}
        </div>
        <GiftList
          identifier={email}
          personal={true}
          items={items}
          fetchItems={fetchItems}
        />
        <div className={styles.plus_container} onClick={openNewItemModal}>
          <p>Add Item</p>
          <FaPlus className={styles.plus_icon} />
        </div>
        <div className={styles.button_container}>
          <button className={styles.add_item} onClick={openUploaderModal}>
            Import Data
          </button>
          <button className={styles.add_item} onClick={openExportDataModal}>
            Export Data
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
              <div
                className={styles.plus_container}
                onClick={() => openNewItemModalForKid(kid.name)}
              >
                <p>Add Item</p>
                <FaPlus className={styles.plus_icon} />
              </div>
              <div className={styles.button_container}>
                <button
                  className={styles.add_item}
                  onClick={() => openUploaderModalForKid(kid.name)}
                >
                  Upload Data
                </button>
                <button
                  className={styles.add_item}
                  onClick={() => openExportDataModalForKid(kid.name)}
                >
                  Export Data
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
      {isExportDataModalOpen && (
        <ExportDataModal
          kidName={selectedKid ? selectedKid : null}
          items={
            selectedKid
              ? kids.find((kid) => kid.name === selectedKid).items || []
              : items
          }
          closeModal={closeExportDataModal}
        />
      )}
    </div>
  );
};

export default MyList;