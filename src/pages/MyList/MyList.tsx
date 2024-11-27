import React, { useEffect, useState } from "react";
import styles from "./MyList.module.less";
import GiftList from "../../components/GiftList/GiftList";
import AddItemModal from "../../components/AddItemModal/AddItemModal";
import {
  fetchKidsByParentEmail,
  fetchUserList,
} from "../../utils/firebase/firebaseUtils";

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
        const kidsWithItems = await Promise.all(kidsList.map(async (kid) => {
          const kidItems = await fetchUserList(kid.name); // Assuming items are fetched by kid's name
          return {
            ...kid,
            items: kidItems,
          };
        }));
  
        setKids(kidsWithItems);  // Set kids with their items
  
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
  }

  const closeNewItemModal = () => {
    setSelectedKid(null);
    setIsModalOpen(false);
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
    } catch (err) {
      console.error("Error fetching items:", err);
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
        <button className={styles.add_item} onClick={openNewItemModal}>Add Item</button>
      </div>
      {kids.length > 0 && (
      <div>
        {kids.map((kid, index) => (
          <div key={index} className={styles.gift_list_wrapper}>
            <h2>{kid.name}'s Gift List</h2> {/* Ensure you reference kid.name here */}
            <GiftList
              identifier={kid.name}
              personal={true}  
              items={kid.items}
              fetchItems={fetchItems}
            />
            <button className={styles.add_item} onClick={() => openNewItemModalForKid(kid.name)}>Add Item for {kid.name}</button>
          </div>
        ))}
      </div>
    )}

      {isModalOpen && (
        <AddItemModal
          identifier={selectedKid || email}
          handleItemAdded={fetchItems}
          closeModal={closeNewItemModal}
        />
      )}
    </div>
  );
};

export default MyList;
