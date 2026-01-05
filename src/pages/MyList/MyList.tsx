import React, { useEffect, useState, useRef } from "react";
import styles from "./MyList.module.less";
import GiftList from "../../components/GiftList/GiftList";
import AddItemModal from "../../components/AddItemModal/AddItemModal";
import { FaChevronDown, FaInfoCircle, FaPlus } from "react-icons/fa";
import {
  fetchUserInfo,
  fetchUserList,
  shuffleSecretSantaForCouples,
  shuffleSecretSantaForKids,
} from "../../utils/firebase/firebaseUtils";
import SpreadsheetUploader from "../../components/SpreadsheetUploader/SpreadsheetUploader";
import RefreshBoughtItemsModal from "../../components/RefreshBoughtItemsModal/RefreshBoughtItemsModal";
import ExportDataModal from "../../components/ExportDataModal/ExportDataModal";
import { Item, UserInfo, PersonInfo, List } from "../../utils/types";
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
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isRefreshBoughtItemsOpen, setIsRefreshBoughtItemsOpen] =
    useState(false);
  const [isExportDataModalOpen, setIsExportDataModalOpen] = useState(false);
  const [isShuffleSecretSantaModalOpen, setIsShuffleSecretSantaModalOpen] =
    useState(false);
  const [itemsLoading, setItemsLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [userLists, setUserLists] = useState<PersonInfo[]>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeList, setActiveList] = useState<List>(null);

  useEffect(() => {
    if (!uid || !groupId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setItemsLoading(true);
        const userInfo = await fetchUserInfo(groupId, uid);
        setUserInfo(userInfo);
        setActiveList({
          uid: uid,
          name: "My Gift List",
          currSecretSanta:
            userInfo?.currSecretSanta === undefined
              ? null
              : Array.isArray(userInfo.currSecretSanta)
                ? userInfo.currSecretSanta
                : null,
        });
        const userItems = await fetchUserList(groupId, uid);
        setItems(userItems);
        setItemsLoading(false);
        let lists: PersonInfo[] = [
          { uid: userInfo?.uid, name: "My Gift List" },
        ];
        if (userInfo?.kids?.length > 0) {
          userInfo?.kids?.map((kid) => {
            lists.push({ uid: kid?.uid, name: kid?.name });
          });
        }
        setUserLists(lists);
      } catch (err) {
        console.error(err);
        setError("Failed to load your list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid, groupId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  if (loading)
    return <div className={styles.gift_list_wrapper}>Loading...</div>;
  if (error) return <div className={styles.gift_list_wrapper}>{error}</div>;

  const openNewItemModal = () => {
    setIsModalOpen(true);
  };

  const closeNewItemModal = () => {
    setIsModalOpen(false);
  };

  const openUploaderModal = () => {
    setIsUploaderOpen(true);
  };

  const closeUploaderModal = () => {
    setIsUploaderOpen(false);
  };

  const openRefreshBoughtItemsModal = () => {
    setIsRefreshBoughtItemsOpen(true);
  };

  const closeRefreshBoughtItemsModal = () => {
    setIsRefreshBoughtItemsOpen(false);
  };

  const openExportDataModal = () => {
    setIsExportDataModalOpen(true);
  };

  const closeExportDataModal = () => {
    setIsExportDataModalOpen(false);
  };

  const openShuffleSecretSantaModal = () => {
    setIsShuffleSecretSantaModalOpen(true);
  };

  const closeShuffleSecretSantaModal = () => {
    setIsShuffleSecretSantaModalOpen(false);
  };

  const fetchItems = async (activeUid: string) => {
    try {
      const fetchedItems = await fetchUserList(groupId, activeUid);
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleListChange = async (list: PersonInfo) => {
    setDropdownOpen(false);
    try {
      setItemsLoading(true);
      setActiveList(list);
      const userItems = await fetchUserList(groupId, list?.uid);
      setItems(userItems);
      const userInfo = await fetchUserInfo(groupId, list?.uid);
      setActiveList({
        uid: list?.uid,
        name: list?.name,
        currSecretSanta:
          userInfo?.currSecretSanta === undefined
            ? null
            : Array.isArray(userInfo.currSecretSanta)
              ? userInfo.currSecretSanta
              : null,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to change lists. Please try again later.");
    } finally {
      setItemsLoading(false);
    }
  };

  const shuffleSecretSanta = async () => {
    setSecretSantaLoading(true);
    if (activeList?.uid === uid) {
      await shuffleSecretSantaForCouples(groupId);
    } else {
      await shuffleSecretSantaForKids(groupId);
    }
    const updatedData = await fetchUserInfo(groupId, activeList?.uid);
    setActiveList((prev) => ({
      ...prev,
      currSecretSanta:
        updatedData?.currSecretSanta === undefined
          ? null
          : Array.isArray(updatedData.currSecretSanta)
            ? updatedData.currSecretSanta
            : null,
    }));
    closeShuffleSecretSantaModal();
    setSecretSantaLoading(false);
  };

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.gift_list_wrapper}>
        <div className={styles.title_container}>
          <SecretSantaBadge
            secretSanta={activeList?.currSecretSanta}
            openModal={openShuffleSecretSantaModal}
            isLoading={secretSantaLoading}
            isAdmin={userInfo?.isAdmin}
          />

          <div className={styles.dropdown_container} ref={dropdownRef}>
            <h1
              className={
                userLists?.length > 1 ? styles.list_title : styles.title
              }
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {activeList?.name === "My Gift List"
                ? "My Gift List"
                : `${activeList?.name}'s List`}
              {userLists?.length > 1 && (
                <FaChevronDown
                  className={`${styles.arrow} ${dropdownOpen ? styles.open : ""}`}
                />
              )}
            </h1>

            {dropdownOpen && userLists?.length > 1 && (
              <div className={styles.dropdown_menu}>
                {userLists.map((list) => (
                  <div
                    key={list.uid}
                    className={styles.dropdown_item}
                    onClick={() => {
                      handleListChange(list);
                    }}
                  >
                    {list.name === "My Gift List"
                      ? "My Gift List"
                      : `${list.name}'s List`}
                  </div>
                ))}
              </div>
            )}
          </div>
          {!loading && (
            <div className={styles.empty_div} />
          )}
        </div>
        <GiftList
          identifier={activeList?.uid}
          personal={true}
          items={items}
          fetchItems={fetchItems}
          loading={itemsLoading}
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

      {isModalOpen && (
        <AddItemModal
          identifier={activeList?.uid}
          fetchItems={fetchItems}
          closeModal={closeNewItemModal}
        />
      )}

      {isUploaderOpen && (
        <SpreadsheetUploader
          identifier={activeList?.uid}
          fetchItems={fetchItems}
          closeModal={closeUploaderModal}
        />
      )}

      {isRefreshBoughtItemsOpen && (
        <RefreshBoughtItemsModal
          identifier={activeList?.uid}
          fetchItems={fetchItems}
          closeModal={closeRefreshBoughtItemsModal}
        />
      )}
      {isExportDataModalOpen && (
        <ExportDataModal
          name={activeList?.name}
          items={items}
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
