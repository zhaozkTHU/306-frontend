import type { AppProps } from "next/app";
import { useEffect, useState, createContext } from "react";
import { useRouter } from "next/router";
import DemanderLayout from "@/layouts/DemanderLayout";
import LabelerDeploy from "@/layouts/LabelerLayout";
import LoginScreen from ".";
import NotFound from "@/components/NotFound";
import "@/styles/globals.css";

export const TokenContext = createContext<string | null>(null);
const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const [Token, setToken] = useState<string | null>(null);
  const [LoginStatus, setLoginStatus] = useState<string>("waiting");
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (!localStorage.getItem("token")) {
      // 未登录
      setToken(null);
      setLoginStatus("notLogin");
    } else {
      // 已登录
      setToken(localStorage.getItem("token"));
      if (localStorage.getItem("role") === "demander") {
        setLoginStatus("demanderAlreadyLogin");
      } else if (localStorage.getItem("role") === "labeler") {
        setLoginStatus("labelerAlreadyLogin");
      }
    }
  }, [router]);
  if (!router.isReady) {
    return;
  }
  if (router.pathname.startsWith("/demander/")) {
    return (
      <TokenContext.Provider value={Token}>
        <DemanderLayout loginStatus={LoginStatus} setLoginStatus={setLoginStatus}>
          <Component {...pageProps} />
        </DemanderLayout>
      </TokenContext.Provider>
    );
  } else if (router.pathname.startsWith("/labeler/")) {
    return (
      <TokenContext.Provider value={Token}>
        <LabelerDeploy loginStatus={LoginStatus} setLoginStatus={setLoginStatus}>
          <Component {...pageProps} />
        </LabelerDeploy>
      </TokenContext.Provider>
    );
  } else if (router.pathname.startsWith("/register")) {
    // register, no deploy
    return <Component {...pageProps} />;
  } else if (router.pathname === "/") {
    // login
    return (
      <div
        style={{
          background: "red",
        }}
      >
        <LoginScreen setLoginStatus={setLoginStatus} setToken={setToken} />
      </div>
    );
  } else {
    // other interface
    return <NotFound />;
  }
};

export default App;
