import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login/Login";
import MyList from "./pages/MyList/MyList";
import Navbar from "./components/Navbar/Navbar";
import FamilyPage from "./pages/FamilyPage/FamilyPage";
import { useMediaQuery } from "./utils/useMediaQuery";
import { MobileNavbar } from "./components/MobileNavbar/MobileNavbar";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const App: React.FC = () => {
  const auth = getAuth();
  const db = getFirestore();
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [onList, setOnList] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isMobile = useMediaQuery({ "max-width": 840 });

  // useEffect(() => {
  //   const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
  //   const isHolidaySeason = month === 8 || month === 11; // Nov (10), Dec (11)

  //   if (isHolidaySeason) {
  //     document.body.classList.add('holiday-font');
  //     document.body.classList.remove('normal-font');
  //   } else {
  //     document.body.classList.add('normal-font');
  //     document.body.classList.remove('holiday-font');
  //   }
  // }, []);

  useEffect(() => {
    const storedOnList = sessionStorage.getItem("onList");
    if (storedOnList) setOnList(JSON.parse(storedOnList));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("onList", JSON.stringify(onList));
  }, [onList]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userEmail = firebaseUser.email;
        setEmail(userEmail);

        const allowedRef = doc(db, "users", userEmail?.toLowerCase() || "");
        const docSnap = await getDoc(allowedRef);

        if (docSnap.exists()) {
          setUser(firebaseUser);
        } else {
          setUser(null);
          signOut(auth);
          alert("Your email is not on the allowed list.");
        }
      } else {
        setUser(null);
        setEmail(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    setOnList(false);
    sessionStorage.removeItem("onList");
  };

  if (isLoading) {
    return <div></div>;
  }

  return (
    <Router basename="/gift-list">
      {user && !isMobile && (
        <Navbar setOnList={setOnList} onLogout={handleLogout} />
      )}
      {user && isMobile && (
        <MobileNavbar setOnList={setOnList} onLogout={handleLogout} />
      )}
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/my-list" /> : <Login onLogin={() => {}} />}
        />
        <Route
          path="/my-list"
          element={user ? <MyList email={email} /> : <Navigate to="/" />}
        />
        <Route
          path="/family-lists"
          element={
            user ? (
              <FamilyPage onList={onList} setOnList={setOnList} loggedInEmail={email} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;