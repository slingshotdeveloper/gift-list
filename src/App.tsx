import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login/Login";
import MyList from "./pages/MyList/MyList";
import Navbar from "./components/Navbar/Navbar";
import GroupPage from "./pages/GroupPage/GroupPage";
import { useMediaQuery } from "./utils/useMediaQuery";
import { MobileNavbar } from "./components/MobileNavbar/MobileNavbar";
import { UserProvider, useUser } from "./context/UserContext";

const AppContent: React.FC = () => {
  const { user, loadingUser } = useUser();
  const isMobile = useMediaQuery({ "max-width": 840 });

  if (loadingUser) {
    return <div></div>;
  }

  return (
    <div>
      <Router basename="/gift-list">
        {user && !isMobile && <Navbar />}
        {user && isMobile && <MobileNavbar />}
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/my-list" /> : <Login />}
          />
          <Route
            path="/my-list"
            element={user ? <MyList /> : <Navigate to="/" />}
          />
          <Route
            path="/group-lists"
            element={user ? <GroupPage /> : <Navigate to="/" />}
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
