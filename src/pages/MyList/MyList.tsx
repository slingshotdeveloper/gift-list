import React, { useEffect, useState } from "react";
import styles from "./MyList.module.less";
import GiftList from "../../components/GiftList/GiftList";
import AddItemModal from "../../components/AddItemModal/AddItemModal";
import { FaInfoCircle, FaPlus } from "react-icons/fa";
import {
  fetchUserInfo,
  fetchUserList,
  shuffleSecretSantaForCouples,
} from "../../utils/firebase/firebaseUtils";
import SpreadsheetUploader from "../../components/SpreadsheetUploader/SpreadsheetUploader";
import RefreshBoughtItemsModal from "../../components/RefreshBoughtItemsModal/RefreshBoughtItemsModal";
import ExportDataModal from "../../components/ExportDataModal/ExportDataModal";
import { Kid, Item, UserInfo } from "../../utils/types";
import { useUser } from "../../context/UserContext";
import SecretSantaBadge from "../../components/SecretSantaBadge/SecretSantaBadge";
import ShuffleSecretSantaModal from "../../components/ShuffleSecretSantaModal/ShuffleSecretSantaModal";

const MyList: React.FC = () => {
  const { uid, groupId } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]); // Items state
  const [loading, setLoading] = useState<boolean>(true);
  const [secretSantaLoading, setSecretSantaLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<string>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isRefreshBoughtItemsOpen, setIsRefreshBoughtItemsOpen] = useState(false);
  const [isExportDataModalOpen, setIsExportDataModalOpen] = useState(false);
  const [isShuffleSecretSantaModalOpen, setIsShuffleSecretSantaModalOpen] = useState(false);
  const [activeUid, setActiveUid] = useState<string>(uid);
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  console.log(isShuffleSecretSantaModalOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userInfo = await fetchUserInfo(groupId, uid);
        setUserInfo(userInfo);
        const userItems = await fetchUserList(groupId, uid);
        setItems(userItems);

        if (userInfo?.kids?.length > 0) {
          const kidsWithItems = await Promise.all(
          userInfo?.kids?.map(async (kid) => {
            const kidItems = await fetchUserList(groupId, kid.uid);
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
  }, [uid]);

  if (loading)
    return <div className={styles.gift_list_wrapper}>Loading...</div>;
  if (error) return <div className={styles.gift_list_wrapper}>{error}</div>;

  const openNewItemModal = () => {
    setIsModalOpen(true);
  };

  const openNewItemModalForKid = (activeUid: string) => {
    setActiveUid(activeUid);
    setIsModalOpen(true);
  };

  const closeNewItemModal = () => {
    setSelectedKid(null);
    setIsModalOpen(false);
  };

  const openUploaderModal = () => {
    setActiveUid(uid);
    setIsUploaderOpen(true);
  };

  const openUploaderModalForKid = (activeUid: string) => {
    setActiveUid(activeUid);
    setIsUploaderOpen(true);
  };

  const closeUploaderModal = () => {
    setIsUploaderOpen(false);
  };

  const openRefreshBoughtItemsModal = () => {
    setActiveUid(uid);
    setIsRefreshBoughtItemsOpen(true);
  };

  const closeRefreshBoughtItemsModal = () => {
    setIsRefreshBoughtItemsOpen(false);
  };

  const openRefreshBoughtItemsModalForKid = (activeUid: string) => {
    setActiveUid(activeUid);
    setIsRefreshBoughtItemsOpen(true);
  };

  const openExportDataModal = () => {
    setActiveUid(uid);
    setIsExportDataModalOpen(true);
  };

  const closeExportDataModal = () => {
    setIsExportDataModalOpen(false);
  };

  const openExportDataModalForKid = (kid: Kid) => {
    setActiveUid(kid?.uid);
    setSelectedKid(kid?.name);
    setIsExportDataModalOpen(true);
  };

  const openShuffleSecretSantaModal = () => {
    setIsShuffleSecretSantaModalOpen(true);
  }

  const closeShuffleSecretSantaModal = () => {
    setIsShuffleSecretSantaModalOpen(false);
  }

  const fetchItems = async (identifier: string) => {
    try {
      const fetchedItems = await fetchUserList(groupId, identifier);

      if (identifier === uid) {
        // If the identifier is the parent, set the parent's items
        setItems(fetchedItems);
      } else {
        // If the identifier is a kid, find the kid and set their items
        setKids((prevKids) =>
          prevKids.map((kid) =>
            kid.uid === identifier ? { ...kid, items: fetchedItems } : kid
          )
        );
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
    
  };

  const shuffleSecretSanta = async () => {
    setSecretSantaLoading(true);
    await shuffleSecretSantaForCouples("davis-j9ms");

    const updatedData = await fetchUserInfo(groupId, uid);
    setUserInfo((prev) => ({
      ...prev,
      currSecretSanta: updatedData.currSecretSanta || [],
    }))
    closeShuffleSecretSantaModal();
    setSecretSantaLoading(false);
  };

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.gift_list_wrapper}>
        <div className={styles.title_container}>
          <SecretSantaBadge secretSanta={userInfo?.currSecretSanta} openModal={openShuffleSecretSantaModal} isLoading={secretSantaLoading} isAdmin={userInfo?.isAdmin}/>
          <h1 className={styles.title}>My Gift List</h1>
          {userInfo?.currSecretSanta?.length > 0 && (
            <div className={styles.empty_div} />
          )}
        </div>
        <GiftList
          identifier={uid}
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
                identifier={kid.uid}
                personal={true}
                items={kid.items}
                fetchItems={fetchItems}
              />
              <div
                className={styles.plus_container}
                onClick={() => openNewItemModalForKid(kid.uid)}
              >
                <p>Add Item</p>
                <FaPlus className={styles.plus_icon} />
              </div>
              <div className={styles.button_container}>
                <button
                  className={styles.add_item}
                  onClick={() => openUploaderModalForKid(kid.uid)}
                >
                  Upload Data
                </button>
                <button
                  className={styles.add_item}
                  onClick={() => openExportDataModalForKid(kid)}
                >
                  Export Data
                </button>
              </div>
              <div className={styles.refresh_button_container}>
                <div
                  className={styles.refresh_button}
                  onClick={() => openRefreshBoughtItemsModalForKid(kid.uid)}
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
          identifier={activeUid}
          fetchItems={fetchItems}
          closeModal={closeNewItemModal}
        />
      )}

      {isUploaderOpen && (
        <SpreadsheetUploader
          identifier={activeUid}
          fetchItems={fetchItems}
          closeModal={closeUploaderModal}
        />
      )}

      {isRefreshBoughtItemsOpen && (
        <RefreshBoughtItemsModal
          identifier={activeUid}
          fetchItems={fetchItems}
          closeModal={closeRefreshBoughtItemsModal}
        />
      )}
      {isExportDataModalOpen && (
        <ExportDataModal
          kidName={activeUid !== uid ? selectedKid : null}
          items={
            activeUid === uid ? items : kids.find((kid) => kid.uid === activeUid).items || []
          }
          closeModal={closeExportDataModal}
        />
      )}
      {isShuffleSecretSantaModalOpen && (
        <ShuffleSecretSantaModal
          onShuffle={shuffleSecretSanta}
          closeModal={closeShuffleSecretSantaModal}
        />
      )}
    </div>
  );
};

export default MyList;