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
import { UserProvider, useUser } from "./context/UserContext";

const AppContent: React.FC = () => {
  const { user, email, uid, loadingUser, logout, onList, setOnList } = useUser();
  const isMobile = useMediaQuery({ "max-width": 840 });

  if (loadingUser) {
    return <div></div>;
  }

  return (
    <div>
      <Router basename="/gift-list">
        {user && !isMobile && (
          <Navbar setOnList={setOnList} onLogout={logout} />
        )}
        {user && isMobile && (
          <MobileNavbar setOnList={setOnList} onLogout={logout} />
        )}
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/my-list" /> : <Login />
            }
          />
          <Route
            path="/my-list"
            element={
              user ? (
                <MyList uid={uid} email={email} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/family-lists"
            element={
              user ? (
                <FamilyPage
                  onList={onList}
                  setOnList={setOnList}
                  loggedInEmail={email}
                  loggedInUid={user?.uid}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
