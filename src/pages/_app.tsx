import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from "next/router";
import DemanderLayout from '@/layouts/DemanderLayout';
import AnnotaterDeploy from '@/layouts/AnnotaterLayout';

const App = ({ Component, pageProps }: AppProps) => {
    const router = useRouter()
    if(router.pathname.startsWith("/demander")) {
        // demander deploy
        return (
        <DemanderLayout> 
            <Component {...pageProps} />
        </DemanderLayout>)
    } else if(router.pathname.startsWith("/annotater")) {
        // annotater deploy
        return (
            <AnnotaterDeploy>
                <Component {...pageProps} />
            </AnnotaterDeploy>
        )
    } else {
        // login or register, no deploy
    }
    return <Component {...pageProps} />
}

export default App;