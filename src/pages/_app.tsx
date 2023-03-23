import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState, createContext } from "react";
import { useRouter } from "next/router";
import DemanderLayout from '@/layouts/DemanderLayout';
import LabelerDeploy from '@/layouts/LabelerLayout';
import LoginScreen from '.';
import NotFound from '@/components/NotFound';

export const UserIdContext = createContext<number>(-1);
const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  const [UserId, setUserId] = useState<number>(-1);
  const [LoginStatus, setLoginStatus] = useState<string>('waiting');
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      // 未登录
      setLoginStatus("notLogin")
    } else {
      // 已登录
      const user_id = localStorage.getItem("user_id")
      setUserId(parseInt(user_id ? user_id : "-1"))
      if (localStorage.getItem("role") == "demander") {
        setLoginStatus("demanderAlreadyLogin")
      } else if (localStorage.getItem("role") == "labeler") {
        setLoginStatus("labelerAlreadyLogin")
      }
    }
  }, [router])
  if (router.pathname.startsWith("/demander/")) {
    return (
      <UserIdContext.Provider value={UserId}>
        <DemanderLayout loginStatus={LoginStatus} setLoginStatus={setLoginStatus}>
          <Component {...pageProps} />
        </DemanderLayout>
      </UserIdContext.Provider>
    )
  } else if (router.pathname.startsWith("/labeler/")) {
    return (
      <UserIdContext.Provider value={UserId}>
        <LabelerDeploy loginStatus={LoginStatus} setLoginStatus={setLoginStatus}>
          <Component {...pageProps} />
        </LabelerDeploy>
      </UserIdContext.Provider>
    )
  } else if (router.pathname.startsWith("/register")) {
    // register, no deploy
    return (
      <Component {...pageProps} />
    )
  } else if (router.pathname === '/') {
    // login
    return (
      <LoginScreen setLoginStatus={setLoginStatus} setUserId={setUserId} />
    )
  } else {
    // other interface
    return <NotFound />
  }
}

export default App;