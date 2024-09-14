"use client"

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { checkSession } from '@/auth';
import {DocumentsLayout} from '@/layouts/Documents'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const checkUserSession = async () => {
      const sessionData = await checkSession();
      const session = sessionData.session;
      if (session) {
        router.push("/dashboard")
      }
    };

    checkUserSession();
  }, []);

  return (
<DocumentsLayout filter="all" />
  );
}
