"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, getUserProfile } from "@/auth";

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = await getUser();  // Fetch user directly
      if (user) {
        const profile = await getUserProfile(user.id);
        if (!profile || profile.role !== 'admin') {
          router.push("/");  // Redirect if not admin
        } else {
          setIsAdmin(true);
        }
      } else {
        router.push("/");  // Redirect if no user
      }
    };

    fetchProfile();
  }, [router]);

  if (!isAdmin) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Add admin controls here */}
    </div>
  );
};

export default AdminDashboard;
