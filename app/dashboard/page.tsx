"use client"

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { getUserProfile, getUser } from '@/auth';
import { DocumentsLayout } from '@/layouts/Documents'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const user = await getUser();
      if (user) {
        const profile = await getUserProfile(user.id);  // Use user id from getUser
        if (profile && profile.role != 'admin') {
          router.push("/dashboard")
        }
      }
    };

    fetchProfile();
  }, []);

  return (
    <DocumentsLayout filter="all" />
  );
}
