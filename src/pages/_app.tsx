import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoginScreen from ".";
import NotFound from "@/components/NotFound";
import "@/styles/globals.css";
import MyLayout from "@/layouts/layout";

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (localStorage.getItem("role")) {
      setRole(localStorage.getItem("role"));
    }
  }, [router]);
  if (!router.isReady) {
    return;
  }
  if (
    router.pathname.startsWith("/demander/") ||
    router.pathname.startsWith("/labeler/") ||
    router.pathname.startsWith("/administrator/")
  ) {
    return (
      // <RoleContext.Provider value={role}>
      <MyLayout role={role}>
        <Component {...pageProps} />
      </MyLayout>
      // </RoleContext.Provider>
    );
  } else if (router.pathname === "/") {
    // login
    return <LoginScreen setRole={setRole} />;
  } else {
    // other interface
    return <NotFound />;
  }
};

export default App;
