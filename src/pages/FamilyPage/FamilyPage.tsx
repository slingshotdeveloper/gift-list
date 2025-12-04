import React, { ReactElement, useEffect, useState } from "react";
import FamilyLists from "../FamilyLists/FamilyLists";
import GiftList from "../../components/GiftList/GiftList"; // Assuming you have a GiftList component to show the person's gift list
import styles from "./FamilyPage.module.less";
import { Item, PersonInfo } from "../../utils/types";
import {
  fetchUserList,
  updateItemInDatabase,
} from "../../utils/firebase/firebaseUtils";

interface FamilyPageProps {
  loggedInEmail: string;
  loggedInUid: string;
  onList: boolean;
  setOnList: (value: boolean) => void;
}

const FamilyPage = ({
  loggedInEmail,
  loggedInUid,
  onList,
  setOnList,
}: FamilyPageProps): ReactElement => {
  const [selectedPerson, setSelectedPerson] = useState<PersonInfo | null>(null);
  const [items, setItems] = useState<Item[]>([]); // Items state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedPerson = sessionStorage.getItem("selectedPerson");
    if (storedPerson) {
      setSelectedPerson(JSON.parse(storedPerson)); // Parse and set if present in sessionStorage
    }
  }, []);

  const handleSelectPerson = (uid: string, name: string, email: string) => {
    const person = {uid, name, email};
    setSelectedPerson(person);
    sessionStorage.setItem("selectedPerson", JSON.stringify(person)); // Store in sessionStorage
  };

  useEffect(() => {
    if (!selectedPerson) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        if (selectedPerson?.email) {
          const userItems = await fetchUserList(selectedPerson?.email);
          setItems(userItems);
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
    if (!selectedPerson) return; // Guard clause to ensure selectedPerson is not null

    const fetchedItems = await fetchUserList(selectedPerson?.uid);

    setItems(fetchedItems);
  };

  const handleBoughtChange = (item: Item) => {
    const updatedItem: Item = {
      ...item, // Keep the other fields unchanged
      bought: !item.bought, // Toggle the `bought` field
    };

    // Check if the selectedPerson is a Person or Kid and call update accordingly
    if (selectedPerson) {
      updateItemInDatabase(selectedPerson?.uid, updatedItem); // Pass email for Person or name for Kid
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
        <h1
          className={`${styles.title} ${
            !selectedPerson || !onList
              ? styles.family_list_title
              : styles.gift_list_title
          }`}
        >
          {!selectedPerson || !onList
            ? "Family Lists"
            : `${selectedPerson?.name}'s List`}
        </h1>

        {!selectedPerson || !onList ? (
          <FamilyLists
            setOnList={setOnList}
            onSelectPerson={handleSelectPerson}
            loggedInEmail={loggedInEmail}
            loggedInUid={loggedInUid}
          />
        ) : (
          <GiftList
            identifier={selectedPerson.uid} // Send email if available
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
