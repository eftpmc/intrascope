// utils/auth.ts
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Error during Google sign-in:", error.message);
    return null;
  }

  if (data?.url) {
    window.location.href = data.url;
  }
};

// Function to check the current session
export const checkSession = async () => {
  const { data: session } = await supabase.auth.getSession();
  return session;
};

// Function to get the current user profile information
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`full_name, avatar_url`)
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error.message);
    return null;
  }

  return data;
};

// Function to handle sign out
export const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error during sign out:", error.message);
  } else {
    window.location.href = "/"; // Redirect after signing out
  }
};
