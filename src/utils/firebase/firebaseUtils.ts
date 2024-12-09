import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase"; // Adjust the path to match your firebase config
import * as XLSX from "xlsx";

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

export interface Kid {
  parentEmail: string; // Email of the parent
  name: string;        // Name of the kid
}

/**
 * Fetches the list of items for a specific user from Firestore.
 * @param email - The email of the user (used as the document ID).
 * @returns A promise that resolves to the list of items.
 */
export const fetchUserList = async (identifier: string): Promise<Item[]> => {
  try {
    const listRef = doc(db, "lists", identifier.toLowerCase());
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

export const updateItemInDatabase = async (identifier: string, updatedItem: Item): Promise<boolean> => {
  try {
    const docRef = doc(db, "lists", identifier.toLowerCase());  // Reference to the user's list document
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

export const deleteItemFromDatabase = async (identifier: string, itemId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, "lists", identifier.toLowerCase());  // Reference to the user's list document
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


export const fetchKids = async (): Promise<Kid[]> => {
  try {
    const usersCollection = collection(db, "users");
    const snapshot = await getDocs(usersCollection);

    const seenKidNames = new Set<string>(); // Set to track unique kid names

    // Extract kids for each user, filtering out duplicates
    const kidsData: Kid[] = snapshot.docs.flatMap((doc) => {
      const data = doc.data();
      const parentEmail = doc.id; // Assuming document ID is the user's email
      const kidsArray = data.kids || []; // Default to an empty array if 'kids' is missing

      // Map each kid to the required format and filter duplicates
      return kidsArray
        .filter((kid: { name: string }) => {
          // Filter out duplicates using the Set
          if (seenKidNames.has(kid.name)) {
            return false; // Skip this kid if their name has already been seen
          }
          seenKidNames.add(kid.name); // Add the kid's name to the Set
          return true;
        })
        .map((kid: { name: string }) => ({
          parentEmail,
          name: kid.name,
        }));
    });

    return kidsData.sort((a, b) => a.name.localeCompare(b.name));;
  } catch (error) {
    console.error("Error fetching kids data:", error);
    return [];
  }
};

export const fetchKidsByParentEmail = async (parentEmail: string): Promise<Kid[]> => {
  try {
    // Get the document reference using the parentEmail (which is the document ID)
    const userDocRef = doc(db, "users", parentEmail);

    // Fetch the document
    const docSnapshot = await getDoc(userDocRef);

    // Initialize the kids array
    const kids: Kid[] = [];

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

      // Check if the 'kids' field exists and is an array
      if (data?.kids && Array.isArray(data.kids)) {
        // Check if each kid in the 'kids' array is a string or an object with a name
        data.kids.forEach((kid: any) => {
          if (typeof kid === "string") {
            // If it's a string, directly push to the kids array
            kids.push({ name: kid, parentEmail: parentEmail });
          } else if (kid?.name) {
            // If it's an object with a name field, use that
            kids.push({ name: kid.name, parentEmail: parentEmail });
          }
        });
      }
    } else {
      console.log("No such document!");
    }

    return kids;
  } catch (error) {
    console.error("Error fetching kids:", error);
    return [];
  }
};

export const importSpreadsheetToFirestore = async (
  email: string,
  itemData: { item: string; price?: string; link?: string }
): Promise<void> => {
  try {
    if (!email || !itemData.item) {
      throw new Error("Missing required fields: email or item");
    }

    const userListRef = doc(db, "lists", email.toLowerCase());
    await updateDoc(userListRef, { items: arrayUnion(itemData) }).catch(async () => {
      // If the document doesn't exist, create it
      await setDoc(userListRef, { items: [itemData] });
    });

    console.log("Firestore updated successfully!");
  } catch (error) {
    console.error("Error updating Firestore:", error);
    throw error;
  }
};

/**
 * Deletes all items for a specific user in Firestore.
 *
 * @param {string} identifier - The identifier of the user.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export const deleteAllItemsForUser = async (identifier: string): Promise<void> => {
  try {
    const userRef = doc(db, 'lists', identifier.toLowerCase());
    await updateDoc(userRef, {
      items: [],
    });

    console.log(`All items deleted for user: ${identifier}`);
  } catch (error) {
    console.error('Error deleting all items for user:', error);
    throw new Error('Failed to delete all items for the user.');
  }
};

