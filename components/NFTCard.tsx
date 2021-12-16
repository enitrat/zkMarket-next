import {FetchedNFT, Metadata} from "../types/interfaces";
import {Box, Flex, Grid, Image, chakra, Heading, Text} from "@chakra-ui/react";
import React from "react";
import {useRouter} from "next/router";


const FALLBACK_IMAGE =
    "https://www.kindacode.com/wp-content/uploads/2021/08/oops.png";


const NFTCard = ({elem}: { elem: FetchedNFT }) => {

    let {
        id,
        address,
        creatorAddress,
        contentHash
    }: { id: number, address: string, creatorAddress: string, contentHash: string } = elem.nft;
    let metadata: Metadata = elem.metadata;
    const router=useRouter();
    return (
        <>
            <Flex
                flexDir={"column"}
                // alignItems={"center"}
                justifyContent={"space-between"}
                border={"solid 1px grey"}
                marginY={"20px"}
                marginX={"30px"}
                borderRadius={"15px"}
                maxW={"500px"}
                cursor={"pointer"}
                onClick={() => router.push(`../nft/${id}`)}
            >
                <Box>
                    {metadata.image ?
                        <Image
                            objectFit={"contain"}
                            borderRadius={"15px"}
                            src={metadata.image} onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_IMAGE;
                        }}/> : <span>NO IMAGE</span>

                    }
                </Box>
                <Flex
                    paddingLeft={"5%"}
                    justifyContent={"flex-start"}
                    flexDir={"column"}
                >
                    <Box>
                        <chakra.span
                            color={"grey"}
                        >{id}</chakra.span>
                    </Box>
                    <Flex
                    justifyContent={"center"}>
                        <Text
                        fontSize={"l"}
                        fontWeight={"bold"}>
                            {metadata.name}
                        </Text>
                    </Flex>
                </Flex>
            </Flex>

        </>
    )
}
export default NFTCard;