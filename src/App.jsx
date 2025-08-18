import { Routes, Route, Navigate } from "react-router-dom";
import { UserAuth } from "./context/AuthContext";
import SignIn from "./components/SignIn";
import Dashboard from "./components/Dashboard";
import Posts from "./components/Posts";

function App() {
  const { session } = UserAuth();

  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/dashboard"
        element={session ? <Dashboard /> : <Navigate to="/signin" />}
      />
      <Route
        path="/posts"
        element={session ? <Posts /> : <Navigate to="/signin" />}
      />
      {/* Default route → always go to /signin */}
      <Route path="*" element={<Navigate to="/signin" />} />
    </Routes>
  );
}

export default App;
