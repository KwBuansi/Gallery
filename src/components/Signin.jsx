import { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { UserAuth } from "../context/AuthContext";

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState('')

  const { signInUser } = UserAuth();
  const navigate = useNavigate();

  const TIMEOUT_MILLISECONDS = 3000;

  console.log(email, password)

  const handleSignIn = async (e) => {
      e.preventDefault();
      const { session, error } = await signInUser(email, password); // Use the signIn function

      if (error) {
          setError(error); // Set error message if signin fails

          // Set a timeout to clear the error message after a certain duration
          setTimeout(() => {
              setError("");
          }, TIMEOUT_MILLISECONDS);
      } else {
          //Redirect
          navigate("/dashboard");
      }

      if (session) {
          closeModal();
          setError(""); // Reset the error when there's a session
      }
    };


  return (
    <div>
      <form onSubmit={handleSignIn} className="max-w-md m-auto pt-24">
        <h2 className="font-bold pb-2">Log in</h2>
        <p>
          Don't have an account? <Link to="/signup" className="underline text-blue-500">Sign up</Link>
        </p>
        <div className="flex flex-col py-4">
          {/* <label htmlFor="Email">Email</label> */}
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 mt-2"
            type="email"
            name="email"
            id="email"
            placeholder="Email"
          />
        </div>
        <div className="flex flex-col py-4">
          {/* <label htmlFor="Password">Password</label> */}
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 mt-2"
            type="password"
            name="password"
            id="password"
            placeholder="Password"
          />
        </div>
        <button type="submit" disabled={loading} className="border mt-4 hover:cursor-pointer px-4 py-3 mt-4">
          Log In
        </button>
        {error && <p className="text-red-600 text-center pt-4">{error}</p>}
      </form>
    </div>
  );
};

export default SignIn;