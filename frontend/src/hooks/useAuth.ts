import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      // Redirect to login if no token is found
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  return isAuthenticated;
};

export default useAuth;
