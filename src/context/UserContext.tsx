import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

interface UserProviderProps {
  children: React.ReactNode;
}

const UserContext = createContext(null);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const auth = getAuth();
  const db = getFirestore();

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [families, setFamilies] = useState<string[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [onList, setOnList] = useState<boolean>(() => {
    const stored = sessionStorage.getItem("onList");
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    sessionStorage.setItem("onList", JSON.stringify(onList));
  }, [onList]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setEmail(null);
        setUid(null);
        setFamilies([]);
        setFamilyId(null);
        setLoadingUser(false);
        setOnList(false);
        return;
      }

      const userRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser(firebaseUser);
        setUid(firebaseUser.uid);
        setEmail(firebaseUser.email);
        
        const familyList = data.families || [];
        setFamilies(familyList);

        if (!familyId && familyList.length > 0) {
          setFamilyId(familyList[0]);
        }
      } else {
        signOut(auth);
        alert("Your email is not on the allowed list.");
      }

      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    signOut(auth);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        uid,
        email,
        families,
        familyId,
        setFamilyId,
        loadingUser,
        logout,
        onList,
        setOnList
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
