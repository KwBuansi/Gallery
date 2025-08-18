import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import SignIn from "./components/Signin";
import SignUp from "./components/Signup";
import Posts from "./components/Posts";
import Dashboard from "./components/Dashboard";
import Gallery from "./components/Gallery";
import ImagePage from "./components/ImagePage";
import PrivateRoute from "./components/PrivateRoute";

export const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/signup", element: <SignUp /> },
    { path: "/signin", element: <SignIn /> },
    { path: "/posts", element: <Posts /> },
    { path: "/gallery", element: <Gallery /> },
    { path: "/image/:id", element: <ImagePage /> },
    { 
        path: "/dashboard", 
        element: (
            <Dashboard />
        ),
    },
]);