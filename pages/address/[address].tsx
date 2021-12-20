import React, {useEffect, useState} from "react";
import {fetchAddressState, fetchNFTFromState} from "../../utils/api";
import {AccountState} from "zksync/build/types";
import {FetchedNFT} from "../../types/interfaces";
import Collection from "../../components/Collection";
import {Box, Flex, Heading} from "@chakra-ui/react";
import {ethers} from "ethers";
import chainConnection from "../../utils/chainConnection";
import {useRouter} from "next/router";

export default function Address() {

    const router = useRouter();
    console.log(router.query.address);
    // const address ="hello";
    let address = router.query.address as string;
    const [nftArray, setNftArray] = useState<Array<FetchedNFT>>();
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {

        const search = async () => {
            let network_name = await chainConnection();
            if (network_name) {
                const addressState: AccountState = await fetchAddressState(address!, network_name);
                const temp_array: Array<FetchedNFT> | undefined = await fetchNFTFromState(addressState);
                setNftArray(temp_array);
            } else {
                setError(true);
            }
        }
        if (address != undefined) {
            search();
        }
    }, [address])
    return (
        <>
            {!error && address &&
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
                            {address!.slice(0, 6)}'s collection
                        </Heading>
                    </Box>
                </Flex>
                {nftArray?.length === 0 ?
                    <Flex
                        justifyContent={"center"}
                        alignItems={"center"}
                        height={"100"}
                    >
                        <Heading

                        >
                            This account doesn't own NFTs
                        </Heading>
                    </Flex> :
                    <Flex
                        alignItems={"center"}
                        height={"fit-content"}
                        width={"100%"}
                        justifyContent={"center"}
                        flexWrap={"wrap"}
                    >

                        <Collection nftArray={nftArray}/>
                    </Flex>
                }
            </>}
            {error &&
            <Flex alignItems={"center"} justifyContent={"center"} height={"fit-content"}
            >
                Please get metamask
            </Flex>
            }
        </>
    );
}