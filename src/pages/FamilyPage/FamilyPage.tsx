import React, { ReactElement, useEffect, useState } from "react";
import FamilyLists from "../FamilyLists/FamilyLists";
import GiftList from "../../components/GiftList/GiftList"; // Assuming you have a GiftList component to show the person's gift list
import styles from "./FamilyPage.module.less";
import {
  fetchUserList,
  updateItemInDatabase,
} from "../../utils/firebase/firebaseUtils";

interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

interface FamilyPageProps {
  loggedInEmail: string;
  onList: boolean;
  setOnList: (value: boolean) => void;
}

interface Kid {
  parentEmail: string; // Email of the parent
  name: string; // Name of the kid
}

interface Person {
  email: string;
  name: string;
}

type SelectedPerson = Person | Kid;

const FamilyPage = ({
  loggedInEmail,
  onList,
  setOnList,
}: FamilyPageProps): ReactElement => {
  const [selectedPerson, setSelectedPerson] = useState<
    SelectedPerson | Kid | null
  >(null);
  const [items, setItems] = useState<Item[]>([]); // Items state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedPerson = sessionStorage.getItem("selectedPerson");
    if (storedPerson) {
      setSelectedPerson(JSON.parse(storedPerson)); // Parse and set if present in sessionStorage
    }
  }, []);

  const handleSelectPerson = (email: string, name: string) => {
    const person = email
      ? { email, name } // SelectedPerson
      : { name }; // Kid
    setSelectedPerson(person as SelectedPerson | Kid);
    sessionStorage.setItem("selectedPerson", JSON.stringify(person)); // Store in sessionStorage
  };

  const isPerson = (person: SelectedPerson): person is Person => {
    return (person as Person).email !== undefined;
  };

  useEffect(() => {
    if (!selectedPerson) return;
  
    const fetchData = async () => {
      try {
        setLoading(true);
  
        if (isPerson(selectedPerson)) {
          // If it's a Person, use email to fetch items
          const userItems = await fetchUserList(selectedPerson.email);
          setItems(userItems);
        } else {
          // If it's a Kid, use name to fetch items
          const kidItems = await fetchUserList(selectedPerson.name);
          setItems(kidItems);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load your list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [selectedPerson]); // Depend on selectedPerson to track changes
  
  
  const fetchItems = async () => {
    if (!selectedPerson) return;  // Guard clause to ensure selectedPerson is not null
  
    const fetchedItems = await fetchUserList(
      isPerson(selectedPerson) ? selectedPerson.email : selectedPerson.name
    );

    console.log(fetchedItems);
    setItems(fetchedItems);
  };

  const handleBackToAllLists = () => {
    setOnList(false);
    setSelectedPerson(null);
    sessionStorage.removeItem("selectedPerson");
  };

  const handleBoughtChange = (item: Item) => {
    const updatedItem: Item = {
      ...item, // Keep the other fields unchanged
      bought: !item.bought, // Toggle the `bought` field
    };
  
    // Check if the selectedPerson is a Person or Kid and call update accordingly
    if (selectedPerson) {
      const identifier = 'email' in selectedPerson ? selectedPerson.email : selectedPerson.name; // Determine identifier
      updateItemInDatabase(identifier, updatedItem); // Pass email for Person or name for Kid
    }
  
    // Optionally update the state immediately to reflect the change
    setItems((prevItems) =>
      prevItems.map((prevItem) =>
        prevItem.id === item.id
          ? { ...prevItem, bought: updatedItem.bought }
          : prevItem
      )
    );
  };

  if (loading)
    return <div className={styles.family_lists_wrapper}>Loading...</div>;
  if (error) return <div className={styles.family_lists_wrapper}>{error}</div>;

  return (
    <div className={styles.family_lists_container}>
    <div className={styles.family_lists_wrapper}>
      <h1 className={`${styles.title} ${
        (!selectedPerson || !onList) ? styles.family_list_title : styles.gift_list_title
      }`}>
        {!selectedPerson || !onList
          ? "Family Lists"
          : `${selectedPerson?.name}'s List`}
      </h1>
      {selectedPerson && onList && (
        <button onClick={handleBackToAllLists} className={styles.backButton}>
          Back to All Lists
        </button>
      )}

      {!selectedPerson || !onList ? (
        <FamilyLists
          setOnList={setOnList}
          onSelectPerson={handleSelectPerson}
          loggedInEmail={loggedInEmail}
        />
      ) : (
        <GiftList
          identifier={'email' in selectedPerson ? selectedPerson.email : selectedPerson.name} // Send email if available
          items={items}
          fetchItems={fetchItems}
          personal={false}
          handleBoughtChange={handleBoughtChange}
        />
      )}
    </div>
  </div>
  );
};

export default FamilyPage;
