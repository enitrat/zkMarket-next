import {Box, Flex, Grid, Heading, Image} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import ConnectWallet from "../components/ConnectWallet";
import {ethers} from "ethers";
import * as zksync from "zksync";
import {Wallet} from "zksync";
import {AccountState, NFT} from "zksync/build/types";
import {FetchedNFT, Metadata, ZkSyncConnection} from "../types/interfaces";
import axios from "axios";
import Collection from "../components/Collection";
import {fetchNFTFromState} from "../utils/api";



const Account = ({zkSyncConnection, setZkSyncConnection} : {zkSyncConnection : ZkSyncConnection|undefined, setZkSyncConnection:any}) => {

    const [accountState, setAccountState] = useState<AccountState>()
    const [nftArray, setNftArray] = useState<Array<FetchedNFT>>();

    const syncWallet=zkSyncConnection?.syncWallet;
    const syncProvider=zkSyncConnection?.syncProvider;

    useEffect(() => {

        const loadState = async () => {
            const state = await syncWallet!.getAccountState()
            setAccountState(state);
        }

        if (syncWallet !== undefined) {
            loadState();
        }

    }, [syncWallet]);

    useEffect(() => {

        const loadNFTs = async () => {
            const temp_array : Array<FetchedNFT>|undefined= await fetchNFTFromState(accountState!);
            setNftArray(temp_array);
        }
        if (accountState !== undefined) {
            console.log(syncWallet);
            loadNFTs();
        }
    }, [accountState]);

    const render = () => {
        return (
            <>
                <Flex
                    alignItems={"center"}
                    height={"fit-content"}
                    width={"100%"}
                    justifyContent={"center"}
                    flexWrap={"wrap"}

                >
                    <Box>
                        <Heading
                            bgGradient='linear(to-r, #F0C3EC, #7F6AFF)'
                            bgClip='text'
                        >
                            Your collection
                        </Heading>
                    </Box>
                    <Collection nftArray={nftArray}/>

                </Flex>
            </>
        )
    }


    return (
        <>
            {syncWallet === undefined ?
                <ConnectWallet zkSyncConnection={zkSyncConnection} setZkSyncConnection={setZkSyncConnection}/>
                : render()}
        </>
    )
}

export default Account;