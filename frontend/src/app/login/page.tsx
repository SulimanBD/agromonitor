"use client"; // This tells Next.js this file is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {

  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true); // Prevent UI from flickering

  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem("access_token");

    if (token) {
      router.replace("/");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) return null;

  return (
    <main className="p-8 max-w-3xl mx-auto bg-[#f4f4f4] dark:bg-[#1e1e1e] rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-[#264653] dark:text-[#e0e0e0] mb-6">Login</h1>
      <LoginForm />
    </main>
  );
};

export default LoginPage;