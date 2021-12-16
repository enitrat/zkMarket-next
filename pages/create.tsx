import {Box, Button, Flex, FormControl, FormHelperText, FormLabel, Heading, Input, Spacer} from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import React, {useEffect, useState} from "react";
import * as events from "events";
import axios from "axios";
import {mintNFT, pinJSONToIPFS} from "../utils/api";
import * as zksync from "zksync";
import ConnectWallet from "../components/ConnectWallet";
import {ethers} from "ethers";
import {Attributes, Metadata, ZkSyncConnection} from "../types/interfaces";
import {Wallet} from "zksync";


const Create = ({zkSyncConnection, setZkSyncConnection} : {zkSyncConnection : ZkSyncConnection|undefined, setZkSyncConnection:any}) => {


    const [attributeList, setAttributeList] = useState<Array<Attributes>>([]);
    const syncWallet=zkSyncConnection?.syncWallet;
    const syncProvider=zkSyncConnection?.syncProvider;

    console.log(attributeList);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const {name, value} = e.target;
        const list = [...attributeList];
        list[index][name] = value;
        setAttributeList(list);
    };

    const handleRemoveClick = (index: number) => {
        const list = [...attributeList];
        list.splice(index, 1);
        setAttributeList(list);
    };


    const handleAddClick = () => {
        setAttributeList([...attributeList, {trait_type: "", value: ""}]);
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = data.get("name") as string;
        const description = data.get("description") as string;
        const external = data.get("external") as string;
        const image = data.get("image") as string;
        const attributes = attributeList;
        const metadata : Metadata = {
            name: name,
            description: description,
            external_url: external,
            image: image,
            attributes: attributes,
        };
        console.log(metadata);

        await mintNFT(metadata,syncWallet,syncProvider);

    }

    const render = () => {

        return (
            <>
                <Flex
                    width="full"
                    align="center"
                    height={"calc(100vh - 72px)"}
                    flexDirection={"column"}
                >
                    <Box
                    >
                        <Box>
                            <Heading
                                bgGradient='linear(to-r, #F0C3EC, #7F6AFF)'
                                bgClip='text'
                            >
                                Create your NFT
                            </Heading>
                        </Box>
                    </Box>
                    <Box width={"50%"}
                         marginTop={"50px"}
                    >
                        <form onSubmit={handleSubmit}>
                            <FormControl id='name'>
                                <FormLabel>Name</FormLabel>
                                <Input type='text'
                                       placeholder={"item name"}
                                       name={"name"}
                                />
                                <FormHelperText>Name of the item</FormHelperText>
                            </FormControl>
                            <br/>
                            <FormControl id='description'>
                                <FormLabel>Description</FormLabel>
                                <Input type='text'
                                       placeholder={"item description"}
                                       name={"description"}
                                />
                                <FormHelperText>A human readable description of the item
                                </FormHelperText>
                            </FormControl>
                            <br/>
                            <FormControl id='image'>
                                <FormLabel>Image URL</FormLabel>
                                <Input type='text'
                                       placeholder={"image url"}
                                       name={"image"}

                                />
                                <FormHelperText>This is the URL to the image of the item.
                                </FormHelperText>
                            </FormControl>
                            <br/>
                            <Box>
                                <FormControl>
                                    <FormLabel>Attributes</FormLabel>
                                    <FormHelperText>These are the properties of your NFT</FormHelperText>
                                    <br/>
                                    <Box>
                                        {attributeList.length === 0 &&
                                        <Button onClick={handleAddClick}>Add attribute</Button>}
                                    </Box>
                                    {attributeList.map((x, i) => {
                                        return (
                                            <>
                                                <Box>
                                                    <Input type='text'
                                                           placeholder={"Attribute name"}
                                                           onChange={e => handleInputChange(e, i)}
                                                           marginBottom={"5px"}
                                                           name={"trait_type"}
                                                    />
                                                    <Input type='text'
                                                           placeholder={"Attribute value"}
                                                           onChange={e => handleInputChange(e, i)}
                                                           name={"value"}
                                                           marginBottom={"5px"}/>
                                                </Box>
                                                <Flex width="100%"
                                                      justifyContent={"space-between"}
                                                      marginY={"10px"}
                                                >
                                                    {attributeList.length - 1 === i &&
                                                    <Button onClick={handleAddClick}>Add attribute</Button>}
                                                    {attributeList.length !== 0 && <Button
                                                        className="mr10"
                                                        onClick={() => handleRemoveClick(i)}>Remove</Button>}
                                                </Flex>

                                            </>
                                        )
                                            ;
                                    })
                                    }
                                </FormControl>
                            </Box>
                            <Box my={"10px"}>
                                <FormControl id='external'>
                                    <FormLabel>External URL</FormLabel>
                                    <Input type='text'
                                           placeholder={"external url"}
                                           name={"external"}

                                    />
                                    <FormHelperText>This is an external URL
                                    </FormHelperText>
                                </FormControl>
                            </Box>
                            <Button
                                mt={4}
                                colorScheme='teal'
                                type='submit'
                            >
                                Submit
                            </Button>
                        </form>
                    </Box>
                </Flex>
            </>

        );
    }

    return (
        <>
            {syncWallet === undefined ?
                <ConnectWallet zkSyncConnection={zkSyncConnection} setZkSyncConnection={setZkSyncConnection}/>
                : render()}
        </>
    )

}

export default Create;