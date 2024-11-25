import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// Save the user's list to Firestore
export const saveUserList = async (userId, list) => {
  try {
    await updateDoc(doc(db, "lists", userId), {
      list: list,
    });
  } catch (error) {
    console.error("Error updating list: ", error);
  }
};

// Fetch the user's list and set up real-time updates
export const fetchUserList = (userId, setList) => {
  const docRef = doc(db, "lists", userId);

  // Real-time listener for updates to the user's list
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      setList(docSnap.data().list);
    }
  });

  return unsubscribe; // This will stop listening for updates when called
};
