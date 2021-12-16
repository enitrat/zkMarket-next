import {SearchIcon} from "@chakra-ui/icons";
import {
    Box,
    Button,
    chakra,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Heading,
    Input,
    Text
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import {NextPage} from "next";
import {useRouter} from 'next/router'
import {router} from "next/client";


export const Explore: NextPage = () => {

    const [invalidInput, setInvalidInput] = useState<boolean>();

    const handleSubmit = (event: any) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const content = data.get("content") as string
        console.log(content);
        if (ethers.utils.isAddress(content)) {
            router.push(`/address/${content}`)
        } else {
            if (isNaN(parseInt(content))) {
                console.log("not a number")
                setInvalidInput(true);
            } else {
                router.push(`/nft/${content}`)
            }
        }
    }

    return (
        <>
            <Flex
                flexDir={"column"}
                justifyContent={"center"}
                alignItems={"center"}
                height={"calc(100vh - 72px)"}
                width={"100%"}
            >
                <Text
                    color={"grey"}
                    fontSize={['small', 'medium', 'xl', 'xl']}
                    textAlign={"center"}
                >
                    <span>Explore&nbsp;</span>
                    <chakra.span
                        bgGradient='linear(to-r, #F0C3EC, #7F6AFF)'
                        bgClip='text'
                    >
                        zkSync
                    </chakra.span>
                    <span>&nbsp;NFTs</span>
                </Text>


                <Flex
                    width={"50%"}
                    marginTop={"10px"}

                >
                    <form
                        style={{"width": "100%"}}
                        onSubmit={handleSubmit}>
                        <Flex
                            flexDir={"column"}
                        >
                            <Flex
                                justifyContent={"center"}
                                alignItems={"center"}
                                minW={"150px"}
                            >
                                <SearchIcon
                                    marginRight={"10px"}
                                />
                                <Input placeholder='TokenId id of address'
                                       size={'sm'}
                                       borderRadius="xl"
                                       focusBorderColor={"rgba(127, 106, 255, 0.55)"}
                                       name={"content"}
                                />
                            </Flex>
                            {invalidInput &&
                            <Text
                                color={"red"}
                                alignSelf={"center"}
                                fontSize={["x-small", "small", "medium", "large"]}>
                                invalid input
                            </Text>
                            }
                            <Button
                                mt={4}
                                colorScheme='teal'
                                type='submit'
                                width={"100px"}
                                alignSelf={"center"}
                            >
                                Submit
                            </Button>
                        </Flex>
                    </form>

                </Flex>

            </Flex>

        </>
    );
}

export default Explore;