import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";

interface UserProviderProps {
  children: React.ReactNode;
}

type UserGroup = {
  id: string;
  name: string;
};

const UserContext = createContext(null);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const auth = getAuth();
  const db = getFirestore();

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [groupId, setGroupId] = useState<string | null>(() => {
    return sessionStorage.getItem("activeGroupId");
  });
  const [userGroups, setUserGroups] = useState<UserGroup[] | null>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  const [onList, setOnList] = useState<boolean>(() => {
    const stored = sessionStorage.getItem("onList");
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    sessionStorage.setItem("onList", JSON.stringify(onList));
  }, [onList]);

  useEffect(() => {
    if (groupId) {
      sessionStorage.setItem("activeGroupId", groupId);
    }
  }, [groupId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setEmail(null);
        setUid(null);
        setGroups([]);
        setUserGroups([]);
        setGroupId(null);
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

        const groupList = data.groups || [];
        setGroups(groupList);
      } else {
        signOut(auth);
        alert("Your email is not on the allowed list.");
      }

      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (groups.length <= 1) {
      setUserGroups([]);
      return;
    }

    const fetchUserGroups = async () => {
      try {
        const q = query(
          collection(db, "groups"),
          where(documentId(), "in", groups.slice(0, 10)) // safe default
        );

        const snap = await getDocs(q);

        const resolved = snap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().groupName,
        }));

        setUserGroups(resolved);
      } catch (err) {
        console.error("Error fetching group names:", err);
      }
    };

    fetchUserGroups();
  }, [groups]);

  useEffect(() => {
    if (!groupId && groups.length > 0) {
      setGroupId(groups[0]);
    }
  }, [groups, groupId]);

  const logout = () => {
    signOut(auth);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        uid,
        email,
        groups,
        groupId,
        userGroups,
        setGroupId,
        loadingUser,
        logout,
        onList,
        setOnList,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
