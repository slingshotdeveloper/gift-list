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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [email, setEmail] = useState<string | null>(
    localStorage.getItem("userEmail")
  );
  const isMobile = useMediaQuery({ "max-width": 840 });
  const [onList, setOnList] = useState<boolean>(() => {
    const storedOnList = sessionStorage.getItem("onList");
    return storedOnList ? JSON.parse(storedOnList) : false;
  });

  useEffect(() => {
    sessionStorage.setItem("onList", JSON.stringify(onList));
  }, [onList]);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", String(isAuthenticated));
  }, [isAuthenticated]);

  const handleLogin = (email: string) => {
    setEmail(email);
    localStorage.setItem("userEmail", email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setEmail(null);
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
  };

  return (
    <Router basename="/gift-list">
      {isAuthenticated && !isMobile && (
        <Navbar setOnList={setOnList} onLogout={handleLogout} />
      )}
      {""}
      {isAuthenticated && isMobile && (
        <MobileNavbar setOnList={setOnList} onLogout={handleLogout} />
      )}
      {""}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/my-list" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/my-list"
          element={
            isAuthenticated ? <MyList email={email} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/family-lists"
          element={
            isAuthenticated ? (
              <FamilyPage
                onList={onList}
                setOnList={setOnList}
                loggedInEmail={email}
              />
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
