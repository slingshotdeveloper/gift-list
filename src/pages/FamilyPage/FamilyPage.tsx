import React, { ReactElement, useEffect, useState } from "react";
import FamilyLists from "../FamilyLists/FamilyLists";
import GiftList from "../../components/GiftList/GiftList"; // Assuming you have a GiftList component to show the person's gift list
import styles from './FamilyPage.module.less'
import { fetchUserList, updateItemInDatabase } from "../../utils/firebase/firebaseUtils";

interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

interface FamilyPageProps {
  loggedInEmail: string;
}

interface SelectedPerson {
  email: string;
  name: string;
}

const FamilyPage = ({ loggedInEmail }: FamilyPageProps): ReactElement => {
  const [selectedPerson, setSelectedPerson] = useState<SelectedPerson | null>(
    null
  );
  const [items, setItems] = useState<Item[]>([]);  // Items state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  console.log(selectedPerson);

  useEffect(() => {
    const storedPerson = sessionStorage.getItem('selectedPerson');
    if (storedPerson) {
      setSelectedPerson(JSON.parse(storedPerson)); // Parse and set if present in sessionStorage
    }
  }, []);

  const handleSelectPerson = (email: string, name: string) => {
    const person: SelectedPerson = {
      email: email,
      name: name
    }
    setSelectedPerson(person);
    sessionStorage.setItem('selectedPerson', JSON.stringify(person)); // Store in sessionStorage
  };

  useEffect(() => {
    if (selectedPerson?.email === undefined) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const userItems = await fetchUserList(selectedPerson?.email);
        setItems(userItems);
      } catch (err) {
        console.error(err);
        setError("Failed to load your list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPerson?.email]);

  const fetchItems = async () => {
    const fetchedItems = await fetchUserList(selectedPerson?.email);
    setItems(fetchedItems); 
  };

  const handleBackToAllLists = () => {
    setSelectedPerson(null);
    sessionStorage.removeItem('selectedPerson');
  };

  const handleBoughtChange = (item: Item) => {
    const updatedItem: Item = {
      ...item,  // Keep the other fields unchanged
      bought: !item.bought  // Toggle the `bought` field
    };
    console.log(selectedPerson?.email);
    console.log(updatedItem);
    // Call updateItemInDatabase to update just the `bought` field
    updateItemInDatabase(selectedPerson?.email, updatedItem);
  
    // Optionally update the state immediately to reflect the change
    setItems(prevItems =>
      prevItems.map((prevItem) =>
        prevItem.id === item.id ? { ...prevItem, bought: updatedItem.bought } : prevItem
      )
    );
  };
  

  if (loading)
    return <div className={styles.family_lists_wrapper}>Loading...</div>;
  if (error) return <div className={styles.family_lists_wrapper}>{error}</div>;

  return (
    <div className={styles.family_lists_container}>
      <div className={styles.family_lists_wrapper}>
        <h1 className={styles.title}>{!selectedPerson ? 'Family Lists' : `${selectedPerson?.name}'s List`}</h1>
        {selectedPerson?.email && (
          <button
            onClick={handleBackToAllLists}
            className={styles.backButton}
          >
           Back to All Lists
          </button>
        )}
        {!selectedPerson?.email ? (
          <FamilyLists
            onSelectPerson={handleSelectPerson}
            loggedInEmail={loggedInEmail}
          />
        ) : (
          <GiftList email={selectedPerson?.email} items={items} fetchItems={fetchItems} personal={false} handleBoughtChange={handleBoughtChange} />
        )}
      </div>
    </div>
  );
};

export default FamilyPage;
