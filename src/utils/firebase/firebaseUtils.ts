import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  query,
  where,
  orderBy
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
        uid: data.uid,
        name: data.name,
        email: data.email,
        spouseUid: data.spouseUid,
        kids: data.kids,
        currSecretSanta: data.currSecretSanta,
        isAdmin: data.isAdmin ?? false,
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

const derange = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  let isDeranged = false;

  while (!isDeranged) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Check that no one stays in their same position
    isDeranged = shuffled.every((item, idx) => item !== array[idx]);
  }

  return shuffled;
};

export const shuffleSecretSantaForCouples = async (groupId: string) => {
  try {
    const usersRef = collection(db, "groups", groupId, "userInfo");
    const q = query(usersRef, where("inSecretSanta", "==", true));
    const snap = await getDocs(q);
    
    const filteredDocs = snap.docs.filter(doc => doc.data().email);

    const users = filteredDocs.map((docSnap) => ({
      uid: docSnap.id,
      name: docSnap.data().name,
      spouseUid: docSnap.data().spouseUid || null,
      prevSecretSanta: docSnap.data().prevSecretSanta || [],
    }));

    if (users.length < 2) throw new Error("Need at least 2 participants");

    // --- Build couples ---
    const couples: Array<{
      members: { uid: string; name: string }[];
      prevAssigned: string[];
    }> = [];

    const seen = new Set<string>();

    users.forEach((u) => {
      if (seen.has(u.uid)) return;

      let spouse = null;
      if (u.spouseUid) spouse = users.find((x) => x.uid === u.spouseUid);

      if (spouse) {
        couples.push({
          members: [
            { uid: u.uid, name: u.name },
            { uid: spouse.uid, name: spouse.name },
          ],
          prevAssigned: Array.isArray(u.prevSecretSanta)
            ? u.prevSecretSanta.map((s: any) => (typeof s === "string" ? s : s.uid))
            : [],
        });
        seen.add(u.uid);
        seen.add(spouse.uid);
      } else {
        couples.push({
          members: [{ uid: u.uid, name: u.name }],
          prevAssigned: u.prevSecretSanta,
        });
        seen.add(u.uid);
      }
    });

    // --- Assign new pairings ---
    let success = false;
    let attempts = 0;
    let assignments: {
      giver: { uid: string; name: string }[];
      receiver: { uid: string; name: string }[];
    }[] = [];

    while (!success && attempts < 1000) {
      attempts++;
      const shuffled = derange(couples);
      success = true;

      assignments = couples.map((giver, i) => {
        const receiver = shuffled[i];
        const receiverUids = receiver.members.map((m) => m.uid);
        const prevSet = new Set(giver.prevAssigned);

        const overlapsLastYear = receiverUids.some((uid) => prevSet.has(uid));

        const isSelfAssignment = giver.members.some((gm) =>
          receiver.members.some((rm) => gm.uid === rm.uid)
        );

        if (overlapsLastYear || isSelfAssignment) {
          success = false;
        }

        return { giver: giver.members, receiver: receiver.members };
      });
    }

    if (!success) throw new Error("Could not generate Secret Santa.");

    // --- Save results ---
    const batch = writeBatch(db);
    assignments.forEach((a) => {
      a.giver.forEach((giverMember) => {
        const userRef = doc(db, "groups", groupId, "userInfo", giverMember.uid);
        batch.update(userRef, {
          currSecretSanta: a.receiver,
          // prevSecretSanta: a.receiver,
        });
      });
    });

    await batch.commit();

    console.log(`Secret Santa generated after ${attempts} attempts!`);
    return { success: true };
  } catch (error) {
    console.error("Error generating Secret Santa:", error);
    return { success: false, error };
  }
};

export const shuffleSecretSantaForKids = async (groupId: string) => {
  try {
    const usersRef = collection(db, "groups", groupId, "userInfo");
    const q = query(usersRef, where("inSecretSanta", "==", true));
    const snap = await getDocs(q);

    // Kids = all docs with NO email field
    const kidDocs = snap.docs.filter(doc => !doc.data().email);

    const kids = kidDocs.map(doc => ({
      uid: doc.id,
      name: doc.data().name,
      siblings: Array.isArray(doc.data().siblings)
        ? doc.data().siblings
        : [],
      prevSecretSanta: Array.isArray(doc.data().prevSecretSanta)
        ? doc.data().prevSecretSanta
        : [],
    }));

    if (kids.length < 2)
      throw new Error("Need at least 2 kids for Secret Santa");

    // --- Try generating valid assignments ---
    let attempts = 0;
    let success = false;

    let assignments: { giverUid: string; receiverUid: string }[] = [];

    while (!success && attempts < 1000) {
      attempts++;

      // Shuffle all kids
      const shuffled = [...kids].sort(() => Math.random() - 0.5);

      success = true;
      assignments = [];

      for (let i = 0; i < kids.length; i++) {
        const giver = kids[i];
        const receiver = shuffled[i];

        const isSelf = giver.uid === receiver.uid;
        const isSibling = giver.siblings.includes(receiver.uid);
        const isPrev = giver.prevSecretSanta.includes(receiver.uid);

        // Not allowed → retry
        if (isSelf || isSibling || isPrev) {
          success = false;
          break;
        }

        assignments.push({
          giverUid: giver.uid,
          receiverUid: receiver.uid
        });
      }
    }

    if (!success) throw new Error("Unable to generate valid Secret Santa draw for kids");

    // --- Save assignments ---
    const batch = writeBatch(db);

    assignments.forEach(a => {
      const giverRef = doc(db, "groups", groupId, "userInfo", a.giverUid);
      const receiverKid = kids.find(k => k.uid === a.receiverUid);

      batch.update(giverRef, {
        currSecretSanta: receiverKid
          ? [{ uid: receiverKid.uid, name: receiverKid.name }]
          : [],
      });
    });

    await batch.commit();

    console.log(`Kids Secret Santa generated in ${attempts} attempts`);
    return { success: true };

  } catch (error) {
    console.error("Error generating kids Secret Santa:", error);
    return { success: false, error };
  }
};
