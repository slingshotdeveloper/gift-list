import React, { ReactElement, useEffect, useState } from "react";
import GroupLists from "../GroupLists/GroupLists";
import GiftList from "../../components/GiftList/GiftList"; // Assuming you have a GiftList component to show the person's gift list
import styles from "./GroupPage.module.less";
import { Item, PersonInfo } from "../../utils/types";
import {
  fetchUserList,
  updateItemInDatabase,
} from "../../utils/firebase/firebaseUtils";
import { useUser } from "../../context/UserContext";

const GroupPage = (): ReactElement => {
  const { uid, onList, setOnList, groupId } = useUser();
  const loggedInUid = uid;
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

  const handleSelectPerson = (uid: string, name: string) => {
    const person = { uid, name };
    setSelectedPerson(person);
    sessionStorage.setItem("selectedPerson", JSON.stringify(person)); // Store in sessionStorage
  };

  useEffect(() => {
    if (!selectedPerson) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        if (selectedPerson?.uid) {
          const userItems = await fetchUserList(groupId, selectedPerson.uid);
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

    const fetchedItems = await fetchUserList(groupId, selectedPerson.uid);

    setItems(fetchedItems);
  };

  const handleBoughtChange = (item: Item) => {
    const updatedItem: Item = {
      ...item, // Keep the other fields unchanged
      bought: !item.bought, // Toggle the `bought` field
    };

    if (selectedPerson) {
      updateItemInDatabase(groupId, selectedPerson.uid, updatedItem);
    }

    setItems((prevItems) =>
      prevItems.map((prevItem) =>
        prevItem.id === item.id
          ? { ...prevItem, bought: updatedItem.bought }
          : prevItem
      )
    );
  };

  if (error) return <div className={styles.group_lists_wrapper}>{error}</div>;

  return (
    <div className={styles.group_lists_container}>
      <div className={styles.group_lists_wrapper}>
        <h1
          className={`${styles.title} ${
            !selectedPerson || !onList
              ? styles.group_list_title
              : styles.gift_list_title
          }`}
        >
          {!selectedPerson || !onList
            ? "Group Lists"
            : `${selectedPerson?.name}'s List`}
        </h1>
        {loading ? (
          <div className={styles.group_lists_wrapper}>Loading...</div>
        ) : !selectedPerson || !onList ? (
          <GroupLists
            setOnList={setOnList}
            onSelectPerson={handleSelectPerson}
            loggedInUid={loggedInUid}
          />
        ) : (
          <GiftList
            identifier={selectedPerson.uid}
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

export default GroupPage;
