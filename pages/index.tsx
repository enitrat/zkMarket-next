import React from "react";
import {Box, Flex, Text, chakra, ButtonGroup, Button, Heading} from "@chakra-ui/react";
import {NextPage} from "next";
import Link from 'next/link'


interface Props {

}

const Home: NextPage = () => {

    return (
        <>
            <Flex
                justifyContent={"center"}
                alignItems={"center"}
                height={"calc(100vh - 72px)"}
                flexDirection={"column"}
            >
                <Flex>
                    <Heading
                        as={"h1"}
                        bgGradient='linear(to-r, #F0C3EC, #7F6AFF)'
                        bgClip='text'
                        fontSize={['6xl', '7xl', '8xl', '8xl']}
                        fontWeight='extrabold'
                        isTruncated
                    >
                        zkMarket
                    </Heading>
                </Flex>
                <Flex
                    justify={"center"}
                    align={"center"}
                    marginBottom={"5px"}>
                    <Heading
                        bgClip={"text"}
                        color={"white"}
                        fontSize={['l', 'xl', '2xl', '2xl']}
                        textAlign={"center"}

                    >
                        Explore, create and trade digital collectibles
                    </Heading>
                </Flex>
                <Flex
                    justify={"center"}
                    align={"center"}
                    marginBottom={"5px"}
                >
                    <Text
                        color={"grey"}
                        fontSize={['small', 'medium', 'xl', 'xl']}
                        textAlign={"center"}
                    >
                        Fast, cheap and secure transactions powered by&nbsp;
                        <chakra.span
                            bgGradient='linear(to-r, #F0C3EC, #7F6AFF)'
                            bgClip='text'
                        >
                            zkSync
                        </chakra.span>
                        ’s zk-rollup technology
                    </Text>
                </Flex>
                <Flex
                    justifyContent={"space-between"}
                    width={"50%"}
                    marginTop={"50px"}
                >
                    <Link
                        href={"/explore"} passHref
                    >
                        <Button
                            background='transparent'
                            width={"125px"}
                            height='60px'
                            borderRadius='35px'
                            border='1px'
                            borderColor='#FFFF'
                            _hover={{bgGradient: 'linear(to-r, #F0C3EC, #7F6AFF)'}}
                        >
                            Explore
                        </Button>
                    </Link>

                    <Link href={"/create"} passHref>
                        <Button
                            bg='transparent'
                            width={"125px"}
                            height='60px'
                            borderRadius='35px'
                            border='1px'
                            borderColor='#FFFF'
                            _hover={{bgGradient: 'linear(to-l, #F0C3EC, #7F6AFF)'}}
                        >
                            Create

                        </Button>
                    </Link>
                </Flex>
            </Flex>
        </>
    );
}

export default Home;