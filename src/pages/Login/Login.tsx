import React from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import styles from './Login.module.less';

interface LoginProps {
  onLogin: (email: string, uid: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleLogin = async () => {
    const auth = getAuth();
    const db = getFirestore();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;

      console.log(email, ' / user: ', user);

      if (!email) {
        alert("Could not retrieve email. Please try again.");
        return;
      }

      // Verify if user email exists in the Firestore `users` collection
      const userDoc = doc(db, "users", email.toLowerCase());
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        // User is authorized; proceed to login
        onLogin(email, user.uid);
      } else {
        // User is not authorized; log them out and show an error
        alert("You are not authorized to access this app.");
        await signOut(auth);
      }
    } catch (error) {
    }
  };

  return (
    <div className={styles.login_container}>
      <h1 className={styles.title}>FAMILY CHRISTMAS LISTS</h1>
      <p>Please sign in with your Gmail account.</p>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;


// import React, { useState, useEffect } from 'react';
// import { db, auth } from '../../utils/firebase/firebase'; // Import Firestore and Firebase Auth instance
// import { signInWithEmailAndPassword } from 'firebase/auth'; // Firebase Auth method
// import { collection, getDocs } from 'firebase/firestore'; // Firestore functions

// interface LoginProps {
//   onLogin: (name: string) => void;
// }

// const Login: React.FC<LoginProps> = ({ onLogin }) => {
//   const [users, setUsers] = useState<{ name: string; userId: string }[]>([]); // Usernames and IDs
//   const [selectedUser, setSelectedUser] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [error, setError] = useState<string>('');

//   // Fetch users from Firestore when the component mounts
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const usersSnapshot = await getDocs(collection(db, 'users'));
//         const usersList = usersSnapshot.docs.map(doc => ({
//           name: doc.data().name,
//           userId: doc.id,
//         }));
//         console.log(usersList);
//         setUsers(usersList);
//       } catch (error) {
//         console.error('Error fetching users:', error);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const handleLogin = async () => {
//     if (!selectedUser || !password) {
//       setError('Please select a user and enter a password.');
//       return;
//     }

//     try {
//       const user = users.find(u => u.name === selectedUser);
//       if (!user) {
//         setError('User not found.');
//         return;
//       }

//       // Now we authenticate the user with Firebase Authentication
//       await signInWithEmailAndPassword(auth, user.name, password);
//       onLogin(user.name); // Pass the username to App.tsx once login is successful
//       setError('');
//     } catch (error) {
//       setError('Login failed. Incorrect password or username.');
//     }
//   };

//   return (
//     <div>
//       <h1>Login</h1>
//       <select
//         value={selectedUser}
//         onChange={(e) => setSelectedUser(e.target.value)}
//       >
//         <option value="">Select User</option>
//         {users.map((user) => (
//           <option key={user.userId} value={user.name}>
//             {user.name}
//           </option>
//         ))}
//       </select>
//       <br />
//       <input
//         type="password"
//         placeholder="Enter password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <br />
//       <button onClick={handleLogin}>Login</button>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//     </div>
//   );
// };

// export default Login;
