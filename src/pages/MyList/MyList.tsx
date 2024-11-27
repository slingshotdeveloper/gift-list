import React, { useEffect, useState } from "react";
import styles from "./MyList.module.less";
import GiftList from "../../components/GiftList/GiftList";
import AddItemModal from "../../components/AddItemModal/AddItemModal";
import { fetchUserList } from "../../utils/firebase/firebaseUtils";

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

const MyList: React.FC<MyListProps> = ({ email}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);  // Items state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userItems = await fetchUserList(email);
        setItems(userItems);
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

  const closeNewItemModal = () => {
    setIsModalOpen(false);
  }

  const fetchItems = async () => {
    const fetchedItems = await fetchUserList(email);
    setItems(fetchedItems); 
  };

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.gift_list_wrapper}>
      <h1 className={styles.title}>My Gift List</h1>
      <GiftList email={email} personal={true} items={items} fetchItems={fetchItems}/>
      <button onClick={openNewItemModal}>Add Item</button>
      </div>
      {isModalOpen && (
        <AddItemModal email={email} handleItemAdded={fetchItems} closeModal={closeNewItemModal}/>
      )}
    </div>
  );
};

export default MyList;
