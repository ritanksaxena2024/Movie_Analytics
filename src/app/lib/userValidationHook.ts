import { useEffect, useState } from "react";

export function useCheckUserExists(email: string) {
  const [userExists, setUserExists] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    if (!email) return;

    const reqData = async () => {
      setChecking(true);
      try {
        const res = await fetch("/api/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        setUserExists(!!data.exists);
      } catch (err) {
        console.error(err);
        setUserExists(false);
      }
      setChecking(false);
    };

    reqData();
  }, [email]);

  return { userExists, checking };
}
