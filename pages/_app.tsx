import '../styles/globals.css'
import type {AppProps} from 'next/app'
import {useState} from "react";
import {ZkSyncConnection} from "../types/interfaces";
import theme from '../styles/Theme'
import Navbar from "../components/Navbar";
import {ChakraProvider} from "@chakra-ui/react";

function MyApp({Component, pageProps}: AppProps) {
    const [zkSyncConnection, setZkSyncConnection] = useState<ZkSyncConnection>();
    return (
        <>
            <ChakraProvider theme={theme}>
                <Navbar zkSyncConnection={zkSyncConnection}
                        setZkSyncConnection={setZkSyncConnection}/>
                <Component {...pageProps} zkSyncConnection={zkSyncConnection}
                           setZkSyncConnection={setZkSyncConnection}/>
            </ChakraProvider>
        </>);
}

export default MyApp
