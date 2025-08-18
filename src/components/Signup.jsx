import { useState } from 'react'
import  { supabase } from "../supabase-client";
import { Link, useNavigate } from "react-router-dom"
import { UserAuth } from "../context/AuthContext";

const SignUp = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState('')
  const { signUpNewUser } = UserAuth();
  const navigate = useNavigate();

  // const addUsername = async (id, display_name) => {
  //   const { data, error } = await supabase
  //     .from("profile")
  //     .update({ display_name: username })
  //     .eq('id', id);

  //   if (error) {
  //     console.log('Error adding username', error);
  //   } else {
  //     const updatedProfile = profile.map((profile) => 
  //       profile.id === id ? {...profile, display_name: username} : profile
  //     );
  //     setProfile(updatedProfile);
  //   }
  // };

  console.log(username, email, password)

  const handleSignUp = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        const result = await signUpNewUser(email, password, username); // Call context function

        if (result.success) {
          // addUsername(); //set display_name in the profile table equal to username
          navigate("/dashboard"); // Navigate to dashboard on success
        } else {
          setError(result.error.message); // Show error message on failure
        }
      } catch (err) {
        setError("An unexpected error occurred."); // Catch unexpected errors
      } finally {
        setLoading(false); // End loading state
      }
    };


    return (
      <div>
        <form onSubmit={handleSignUp} className="max-w-md m-auto pt-24">
          <h2 className="font-bold pb-2">Sign up today!</h2>
          <p>
            Already have an account? <Link to="/signin" className="hover:cursor-pointer underline text-blue-500">Log in</Link>
          </p>
          <div className="flex flex-col py-4">
            {/* <label htmlFor="Username">Username</label> */}
            <input
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 mt-2"
              type="username"
              name="username"
              id="username"
              placeholder="Username"
            />
          </div>
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
          <button type="submit" disabled={loading} className="w-full mt-4">
            Sign Up
          </button>
          {error && <p className="text-red-600 text-center pt-4">{error}</p>}
        </form>
      </div>
  );
};

export default SignUp;