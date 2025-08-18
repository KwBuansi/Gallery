import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabase-client";

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined);

    // Sign up
    const signUpNewUser = async (email, password, username) => {
        const { data, error } = await supabase.auth.signUp({
            email: email.toLowerCase(),
            password: password,
            options: {
                data: {
                    display_name: username,
                },
            },
        });

        if (error) {
            console.error("there was a problem signing up:", error);
            return { success: false, error };
        }
        return { success: true, data };
    };

    // Sign in
    const signInUser = async ( email, password ) => {
        try {
            const  { data, error} = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: password,
            });

            if (error) {
                console.error("sign in error occured: ", error);
                return { success: false, error: error.message };
            }

            console.log("sign-in success: ", data);
            return { success: true, data };
        } catch (error) {
            console.error("an error occured: ", err.message);
            return {
                success: false,
                error: "An unexpected error occured. Please try again.",
            };
        }
    };
    
    useEffect(() => {
        supabase.auth.getSession().then(({data: { session } }) => {
            setSession(session);
        }) 

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, [])

    // Sign out
    async function signOut () {
        const {error} = await supabase.auth.signOut();
        if (error){
            console.error("there was an error", error);
        }
    }

    return (
        <AuthContext.Provider value={{ signUpNewUser, signInUser, session, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext);
};