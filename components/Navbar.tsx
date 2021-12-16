import {useState} from 'react'
import {
    useColorMode,
    Switch,
    Flex,
    Button,
    IconButton,
    Spacer, Box, Grid, Text, Input, List
} from '@chakra-ui/react'
import {HamburgerIcon, CloseIcon} from '@chakra-ui/icons'
import Link from "next/link";
import {SearchIcon} from '@chakra-ui/icons'
import {ethers} from "ethers";
import {useRouter} from 'next/router'


export default function Navbar() {
    const [display, changeDisplay] = useState('none')
    const {colorMode, toggleColorMode} = useColorMode();
    const router = useRouter();
    const [invalidInput, setInvalidInput] = useState<boolean>();

    const handleSubmit = (event: any) => {
        event.preventDefault();
        console.log("submit")
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
            <Box
                position="sticky"
                max-width={"100vw"}
                top={"0px"}
                height={"72px"}
                zIndex={"110"}
                align="center"
                bg="brand.navbar"
                color={"white"}
            >
                <Box
                    paddingLeft={"10px"}
                >

                    <Flex
                        justifyContent={"space-between"}
                        width={"100%"}
                        height={"100%"}
                        columnGap={"5px"}
                        alignItems={"center"}
                    >
                        <Box
                            marginLeft={"5px"}
                            display={['none', 'none', 'flex', 'flex']}
                            width={"300px"}
                            alignItems={"center"}
                            padding={"10px"}
                        >
                            <SearchIcon
                                marginRight={"10px"}
                            >
                            </SearchIcon>
                            <form
                                onSubmit={handleSubmit}
                            >
                                <Input placeholder='Search'
                                       size={'sm'}
                                       borderRadius="xl"
                                       focusBorderColor={"rgba(127, 106, 255, 0.55)"}
                                       name={"content"}
                                />
                            </form>
                        </Box>
                        <Box>
                            <Text
                                fontSize='3xl'
                                bgGradient='linear(to-r, #F0C3EC, #7F6AFF)'
                                bgClip='text'
                            >
                                zkMarket
                            </Text>
                        </Box>
                        {/* Desktop */}
                        <List>
                            <Flex
                                display={['none', 'none', 'flex', 'flex']}
                                justifyContent={"flex-end"}
                                width={"100%"}
                            >

                                <Button
                                    as="a"
                                    variant="ghost"
                                    aria-label="Home"
                                    w="100%"
                                >
                                    <Link href="/">
                                        Home
                                    </Link>

                                </Button>


                                <Button
                                    as="a"
                                    variant="ghost"
                                    aria-label="About"
                                    w="100%"
                                >

                                    <Link href="/account">
                                        My collection
                                    </Link>

                                </Button>


                                <Button
                                    as="a"
                                    variant="ghost"
                                    aria-label="Contact"
                                    w="100%"
                                >
                                    <Link href="/create">
                                        Create NFT
                                    </Link>

                                </Button>
                            </Flex>

                            {/* Mobile */}
                            <IconButton
                                aria-label="Open Menu"
                                size="lg"
                                mr={2}
                                icon={
                                    <HamburgerIcon/>
                                }
                                onClick={() => changeDisplay('flex')}
                                display={['flex', 'flex', 'none', 'none']}
                            />
                        </List>

                    </Flex>
                </Box>
            </Box>

            {/* Mobile Content */}
            <Flex
                w='100vw'
                display={display}
                bgColor="gray.50"
                zIndex={20}
                h="100vh"
                pos="fixed"
                top="0"
                left="0"
                flexDir="column"
                bg={"brand.navbar"}
                height={"fit-content"}

            >
                <Flex justify="flex-end">
                    <IconButton
                        mt={2}
                        mr={2}
                        aria-label="Open Menu"
                        size="lg"
                        icon={
                            <CloseIcon/>
                        }
                        onClick={() => changeDisplay('none')}
                    />
                </Flex>

                <Flex
                    flexDir="column"
                    align="center"
                >
                    <Box>
                        searchBar
                    </Box>

                    <Button
                        as="a"
                        variant="ghost"
                        aria-label="Home"
                        my={2}
                        w="100%"
                    >
                        <Link href="/">
                            Home
                        </Link>
                    </Button>


                    <Button
                        as="a"
                        variant="ghost"
                        aria-label="About"
                        my={2}
                        w="100%"
                    >
                        <Link href="/collection">
                            My collection
                        </Link>

                    </Button>


                    <Button as="a"
                            variant="ghost"
                            aria-label="Contact" my={2} w="100%"
                    >
                        <Link href="/create">
                            Create NFT
                        </Link>

                    </Button>
                </Flex>
            </Flex>
        </>
    )
}