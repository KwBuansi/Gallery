import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase-client";

const PrivateRoute = ({ children }) => {
  const { session } = UserAuth();

  if (session === undefined) {
    return <div>Loading...</div>;
  }

  return <div>{session ? <>{children}</> : <Navigate to="/signup" />}</div>;
};

export default PrivateRoute;