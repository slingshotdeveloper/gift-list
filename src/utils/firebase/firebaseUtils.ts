import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase"; // Adjust the path to match your firebase config

interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

interface Person {
  email: string;
  name: string;
}

/**
 * Fetches the list of items for a specific user from Firestore.
 * @param email - The email of the user (used as the document ID).
 * @returns A promise that resolves to the list of items.
 */
export const fetchUserList = async (email: string): Promise<Item[]> => {
  try {
    const listRef = doc(db, "lists", email.toLowerCase());
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
 * 
 * @param email - The email of the user.
 * @param item - The item object to add.
 * @returns A promise that resolves when the item is successfully added.
 */
export const addItemToList = async (email: string, newItem: Item): Promise<void> => {  
  try {
    // Reference to the user's list collection
    const userListRef = doc(db, 'lists', email.toLowerCase());

    const userListDoc = await getDoc(userListRef);

    if(userListDoc.exists()) {
      await updateDoc(userListRef, {
        items: arrayUnion(newItem),
      });
    } else {
      await setDoc(userListRef, {
        items: [newItem],
      })
    }

    console.log('Item added successfully');
  } catch (error) {
    console.error('Error adding item to list:', error);
    throw new Error('Failed to add item to the list');
  }
};

export const updateItemInDatabase = async (email: string, updatedItem: Item): Promise<boolean> => {
  try {
    const docRef = doc(db, "lists", email.toLowerCase());  // Reference to the user's list document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const listData = docSnap.data();
      const items: Item[] = listData.items;  // Get the 'items' array

      // Find the item to update based on its ID
      const updatedItems = items.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      );

      // Update the document with the new items array (with the updated item)
      await updateDoc(docRef, {
        items: updatedItems
      });

      console.log('Item updated successfully');
      return true;  // Successfully updated item
    } else {
      console.error('No such document!');
      return false;  // Document doesn't exist
    }
  } catch (error) {
    console.error('Error updating item:', error);
    return false;  // Return false on error
  }
};

export const deleteItemFromDatabase = async (email: string, itemId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, "lists", email.toLowerCase());  // Reference to the user's list document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const listData = docSnap.data();
      const items: Item[] = listData.items;  // Get the 'items' array

      // Filter out the item with the matching id
      const updatedItems = items.filter((item) => item.id !== itemId);

      // Update the document with the new items array (without the deleted item)
      await updateDoc(docRef, {
        items: updatedItems
      });

      console.log('Item deleted successfully');
      return true;  // Successfully deleted item
    } else {
      console.error('No such document!');
      return false;  // Document doesn't exist
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    return false;  // Return false on error
  }
};

export const getItemById = async (email: string, itemId: string): Promise<Item | null> => {
  try {
    const docRef = doc(db, "lists", email.toLowerCase());  // Reference to the user's list document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const listData = docSnap.data();
      const items: Item[] = listData.items;  // Get the 'items' array

      // Find the item by ID
      const item = items.find(item => item.id === itemId);

      if (item) {
        console.log(item);
        return item;  // Item found, return it
      } else {
        console.error('Item not found');
        return null;  // Item not found
      }
    } else {
      console.error('No such document!');
      return null;  // Document doesn't exist
    }
  } catch (error) {
    console.error('Error fetching item:', error);
    return null;  // Return null on error
  }
};

export const fetchPeople = async (loggedInEmail: string): Promise<Person[]> => {
  try {
    const usersCollection = collection(db, "users");
    const snapshot = await getDocs(usersCollection);
    
    // Extract the data for each person and filter out the logged-in user
    const peopleData: Person[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return { email: doc.id, name: data.name }; // Assuming the doc ID is the email
    });

    // Filter out the logged-in user
    return peopleData.filter((person) => person.email.toLowerCase() !== loggedInEmail.toLowerCase());
  } catch (error) {
    console.error("Error fetching people data:", error);
    return [];
  }
};
