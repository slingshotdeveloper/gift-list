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
  const isMobile = useMediaQuery({ 'max-width': 840 });

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
    <Router>
      {isAuthenticated && !isMobile && <Navbar onLogout={handleLogout} />}{""}
      {isAuthenticated && isMobile && <MobileNavbar onLogout={handleLogout} />}{""}
      <Routes>
        {/* Login Route */}
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

        {/* MyList Route */}
        <Route
          path="/my-list"
          element={
            isAuthenticated ? (
              <MyList email={email} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* FamilyLists Route */}
        <Route
          path="/family-lists"
          element={isAuthenticated ? <FamilyPage loggedInEmail={email} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
