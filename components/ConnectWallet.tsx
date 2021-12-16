import {Box, Button, chakra, Flex, Heading, Text} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import * as zksync from "zksync";
import {ZkSyncConnection} from "../types/interfaces";

const valid_networks = ["0x1", "0x3", "0x4"];

export default function ConnectWallet({zkSyncConnection, setZkSyncConnection}: any) {
    const [currentAccount, setCurrentAccount] = useState<string | undefined>();
    const [validChain, setValidChain] = useState<boolean>(true);

    function handleChainChanged(_chainId: any) {
        window.location.reload();
    }

    function handleAccountsChanged(accounts: any) {
        if (accounts.length === 0) {
            console.log('Please connect to MetaMask.');
        } else if (accounts[0] !== currentAccount) {
            console.log(accounts)
            setCurrentAccount(accounts[0]);
            setZkSyncConnection(undefined);
            // connectWalletAction();
        }
    }

    useEffect(() => {

        const checkChain = async () => {
            try {
                const {ethereum} = window as any;

                if (!ethereum) {
                    alert('Get MetaMask!');
                    return;
                }

                const chainRequest = await ethereum.request({method: 'eth_chainId'});
                ethereum.on('chainChanged', handleChainChanged);
               if(!valid_networks.includes(chainRequest)){setValidChain(false)}
            } catch (error) {
                console.log(error);
            }
        }
        checkChain();
    }, [])


    const metamaskConnection = async () => {
        try {
            const {ethereum} = window as any;

            if (!ethereum) {
                alert('Get MetaMask!');
                return;
            }

            const chainId = await ethereum.request({method: 'eth_chainId'});
            ethereum.on('chainChanged', handleChainChanged);

            let currentAccount = null;
            ethereum
                .request({method: 'eth_accounts'})
                .then(handleAccountsChanged)
                .catch((err: Error) => {
                    // Some unexpected error.
                    // For backwards compatibility reasons, if no accounts are available,
                    // eth_accounts will return an empty array.
                    console.error(err);
                });
            ethereum.on('accountsChanged', handleAccountsChanged);

            const accounts = await ethereum.request({
                method: 'eth_requestAccounts',
            });
        } catch (error) {
            console.log(error);
        }
    }

    const connectWalletAction = async () => {

        async function zkSyncConnection() {
            if (currentAccount !== "") {
                const {ethereum} = window as any;
                const provider = new ethers.providers.Web3Provider(ethereum);
                const chainId = await ethereum.request({method: 'eth_chainId'});
                console.log(chainId);
                const network_info = ethers.providers.getNetwork(parseInt(chainId, 16)) as any;
                if (chainId === "0x1") {
                    network_info.name = "mainnet"
                }
                console.log(network_info);
                const syncProvider = await zksync.getDefaultProvider(network_info.name);
                const ethWallet = provider.getSigner();
                const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);
                const connection_data: ZkSyncConnection = {
                    syncWallet: syncWallet,
                    syncProvider: syncProvider
                }
                setZkSyncConnection(connection_data);
            }
        }

        await metamaskConnection();
        await zkSyncConnection();
    }


    // useEffect(() => {
    //     //setIsLoading(true);
    //     const loadSyncWallet = async () => {
    //         if (currentAccount !== "") {
    //             const {ethereum} = window as any;
    //             const provider = new ethers.providers.Web3Provider(ethereum);
    //             const chainId = await ethereum.request({method: 'eth_chainId'});
    //             const network_info = ethers.providers.getNetwork(parseInt(chainId, 16)) as any;
    //             const syncProvider = await zksync.getDefaultProvider(network_info);
    //             const ethWallet = provider.getSigner();
    //             const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);
    //             const connection_data: ZkSyncConnection = {
    //                 syncWallet: syncWallet,
    //                 syncProvider: syncProvider
    //             }
    //             setZkSyncConnection(connection_data);
    //         }
    //     }
    //     if (currentAccount) {
    //         // loadSyncWallet();
    //     }
    // }, [, currentAccount]);

    const wrongChain = () => {
        return (
            <>Please connect to the Mainnet, Rinkeby or Ropsten networks</>
        )
    }

    const rightChain = () => {
        return (
            <>
                Connect your wallet to start
            </>
        )
    }


    return (
        <>
            <Flex
                justifyContent={"center"}
                alignItems={"center"}
                height={"100vh"}
                flexDirection={"column"}
            >
                <Flex>
                    <Heading
                        bgGradient='linear(to-r, #F0C3EC, #7F6AFF)'
                        bgClip='text'
                        fontSize='3xl'
                        fontWeight='extrabold'
                    >
                        {validChain ? rightChain() : wrongChain()}
                    </Heading>
                </Flex>
                <Flex
                    justifyContent={"center"}
                    width={"50%"}
                    marginTop={"50px"}
                >
                    <Button
                        bg='transparent'
                        width={"125px"}
                        height='60px'
                        borderRadius='35px'
                        border='1px'
                        borderColor='#FFFF'
                        _hover={{bgGradient: 'linear(to-r, #F0C3EC, #7F6AFF)'}}
                        onClick={connectWalletAction}

                    >
                        Connect
                    </Button>

                </Flex>
            </Flex>
        </>

    )
}
