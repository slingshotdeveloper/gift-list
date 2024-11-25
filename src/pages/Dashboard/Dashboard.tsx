import React, { useState, useEffect } from "react";
import { saveUserList, fetchUserList } from "../../utils/firebase/firebaseUtils";

interface DashboardProps {
  userId: string; // User ID that uniquely identifies the user
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userId, onLogout }) => {
  const [list, setList] = useState<string[]>([]); // Array of strings representing the user's list

  // Fetch the user's list from Firestore and set up real-time listener
  useEffect(() => {
    const unsubscribe = fetchUserList(userId, setList);
    return () => unsubscribe(); // Cleanup listener when the component unmounts
  }, [userId]);

  // Function to update the list and save it to Firestore
  const updateList = async (newItem: string) => {
    const updatedList = [...list, newItem];
    setList(updatedList);
    await saveUserList(userId, updatedList); // Save the updated list to Firestore
  };

  return (
    <div>
      <h1>My List</h1>
      <ul>
        {list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <button onClick={() => updateList("New Item")}>Add Item</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
