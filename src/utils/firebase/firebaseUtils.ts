import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase"; // Adjust the path to match your firebase config
import { Item, UserInfo, PersonInfo } from "../types";

/**
 * Fetches the user info for a specific user from Firestore.
 * @param groupId - The groupId of the user's group.
 * @param uid - The uid of the user.
 * @returns A promise that resolves to the list of items.
 */
export const fetchUserInfo = async (
  groupId: string,
  uid: string
): Promise<UserInfo> => {
  try {
    const listRef = doc(db, "groups", groupId, "userInfo", uid);
    const listSnap = await getDoc(listRef);

    if (listSnap.exists()) {
      const data = listSnap.data();

      const user: UserInfo = {
        name: data.name,
        email: data.email,
        spouseUid: data.spouseUid,
        kids: data.kids,
        currSecretSanta: data.currSecretSanta,
        inSecretSanta: data.inSecretSanta,
      };

      return user;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (err) {
    console.error("Error fetching user list:", err);
    throw new Error("Failed to fetch the list.");
  }
};

/**
 * Fetches the list for a specific user from Firestore.
 * @param groupId - The groupId of the user's group.
 * @param uid - The uid of the user.
 * @returns A promise that resolves to the list of items.
 */
export const fetchUserList = async (
  groupId: string,
  uid: string
): Promise<Item[]> => {
  try {
    const listRef = doc(db, "groups", groupId, "lists", uid);
    const listSnap = await getDoc(listRef);

    if (listSnap.exists()) {
      const data = listSnap.data();
      return data.items || []; // Return the items array or an empty array if not found
    } else {
      console.log("No such document!");
      return [];
    }
  } catch (err) {
    console.error("Error fetching user list:", err);
    throw new Error("Failed to fetch the list.");
  }
};

/**
 * Adds a new item to the user's list in Firestore.
 * @param groupId - The groupId of the user's group.
 * @param uid - The uid of the user.
 * @param newItem - The item to be added.
 * @returns A promise that resolves to the list of items.
 */
export const addItemToList = async (
  groupId: string,
  uid: string,
  newItem: Item
): Promise<void> => {
  console.log(uid);
  try {
    const userListRef = doc(db, "groups", groupId, "lists", uid);

    const userListDoc = await getDoc(userListRef);

    if (userListDoc.exists()) {
      await updateDoc(userListRef, {
        items: arrayUnion(newItem),
      });
    } else {
      await setDoc(userListRef, {
        items: [newItem],
      });
    }
  } catch (error) {
    console.error("Error adding item to list:", error);
    throw new Error("Failed to add item to the list");
  }
};

/**
 * Updates an existing item to the user's list in Firestore.
 * @param groupId - The groupId of the user's group.
 * @param uid - The uid of the user.
 * @param updatedtem - The item to be updated.
 * @returns A promise that resolves to the list of items.
 */
export const updateItemInDatabase = async (
  groupId: string,
  uid: string,
  updatedItem: Item
): Promise<boolean> => {
  try {
    const docRef = doc(db, "groups", groupId, "lists", uid); // Reference to the user's list document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const listData = docSnap.data();
      const items: Item[] = listData.items; // Get the 'items' array

      // Find the item to update based on its ID
      const updatedItems = items.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      );

      // Update the document with the new items array (with the updated item)
      await updateDoc(docRef, {
        items: updatedItems,
      });

      return true; // Successfully updated item
    } else {
      console.error("No such document!");
      return false; // Document doesn't exist
    }
  } catch (error) {
    console.error("Error updating item:", error);
    return false; // Return false on error
  }
};

/**
 * Deletes an existing item from the user's list in Firestore.
 * @param groupId - The groupId of the user's group.
 * @param uid - The uid of the user.
 * @param itemId - The item to be deleted.
 * @returns A promise that resolves to the list of items.
 */
export const deleteItemFromDatabase = async (
  groupId: string,
  uid: string,
  itemId: string
): Promise<boolean> => {
  try {
    const docRef = doc(db, "groups", groupId, "lists", uid); // Reference to the user's list document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const listData = docSnap.data();
      const items: Item[] = listData.items; // Get the 'items' array

      // Filter out the item with the matching id
      const updatedItems = items.filter((item) => item.id !== itemId);

      // Update the document with the new items array (without the deleted item)
      await updateDoc(docRef, {
        items: updatedItems,
      });

      return true; // Successfully deleted item
    } else {
      console.error("No such document!");
      return false; // Document doesn't exist
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    return false; // Return false on error
  }
};

/**
 * Fetches all other users for group lists in Firestore.
 * @param groupId - The groupId of the user's group.
 * @param loggedInUid - The uid of the logged in user.
 * @returns A promise that resolves to an array of users info excluding the logged in user.
 */
export const fetchPeople = async (
  groupId: string,
  loggedInUid: string
): Promise<PersonInfo[]> => {
  try {
    const usersCollection = collection(db, "groups", groupId, "userInfo");
    const snapshot = await getDocs(usersCollection);

    const peopleData: PersonInfo[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return { uid: doc.id, name: data.name, email: data.email ?? null };
      })
      .filter((person) => person.uid !== loggedInUid); // Exclude logged-in user

    return peopleData;
  } catch (error) {
    console.error("Error fetching people data:", error);
    return [];
  }
};

/**
 * Imports a spreadsheet list to the user's list in Firestore.
 * @param groupId - The groupId of the user's group.
 * @param uid - The uid of the user.
 * @param itemData - The spreadsheet list to be imported.
 * @returns A promise that resolves to the list of items.
 */
export const importSpreadsheetToFirestore = async (
  groupId: string,
  uid: string,
  itemData: { item: string; price?: string; link?: string }
): Promise<void> => {
  try {
    if (!uid || !itemData.item) {
      throw new Error("Missing required fields: uid or item");
    }

    const userListRef = doc(db, "groups", groupId, "lists", uid);
    await updateDoc(userListRef, { items: arrayUnion(itemData) }).catch(
      async () => {
        // If the document doesn't exist, create it
        await setDoc(userListRef, { items: [itemData] });
      }
    );
  } catch (error) {
    console.error("Error updating Firestore:", error);
    throw error;
  }
};

/**
 * Deletes all items for a specific user in Firestore.
 * @param groupId - The groupId of the user's group.
 * @param uid - The uid of the user.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export const deleteAllItemsForUser = async (
  groupId: string,
  uid: string
): Promise<void> => {
  try {
    const userRef = doc(db, "groups", groupId, "lists", uid);
    await updateDoc(userRef, {
      items: [],
    });

    console.log(`All items deleted for user: ${uid}`);
  } catch (error) {
    console.error("Error deleting all items for user:", error);
    throw new Error("Failed to delete all items for the user.");
  }
};

/**
 * Resets all bought items for a specific user in Firestore.
 * @param groupId - The groupId of the user's group.
 * @param uid - The uid of the user.
 * @returns - A promise that resolves when the operation is complete.
 */
export const RefreshBoughtItemsForUser = async (
  groupId: string,
  uid: string
): Promise<Boolean> => {
  try {
    const docRef = doc(db, "groups", groupId, "lists", uid); // Reference to the user's list document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const listData = docSnap.data();
      const items: Item[] = listData.items; // Get the 'items' array

      const updatedItems = items.map((item) => ({
        ...item,
        bought: false,
      }));

      // Update the document with the new items array
      await updateDoc(docRef, {
        items: updatedItems,
      });

      return true; // Successfully reset bought items
    } else {
      console.error("No such document!");
      return false; // Document doesn't exist
    }
  } catch (error) {
    console.error("Error refreshing bought items:", error);
    return false; // Return false on error
  }
};

/**
 * Sorts items in a user's list in Firestore.
 * @param groupId - The groupId of the user's group.
 * @param uid - The uid of the user.
 * @param sortedItems - The array of items to be updated in Firestore.
 * @returns A promise that resolves to the list of items.
 */
export const sortItemsInDatabase = async (
  groupId: string,
  uid: string,
  sortedItems: Item[]
): Promise<boolean> => {
  try {
    const docRef = doc(db, "groups", groupId, "lists", uid); // Reference to the user's list document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Update the document with the new sorted items array
      if (sortedItems.length > 0) {
        await updateDoc(docRef, { items: sortedItems });
      } else {
        console.log("No items to update");
        return false;
      }

      return true; // Successfully updated item
    } else {
      console.error("No such documents!");
      return false; // Document doesn't exist
    }
  } catch (error) {
    console.error("Error sorting items:", error);
    return false; // Return false on error
  }
};
