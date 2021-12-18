import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {Attributes, FetchedNFT, ZkSyncConnection} from "../../types/interfaces";
import chainConnection from "../../utils/chainConnection";
import {AccountState, NFT, Order, TokenRatio} from "zksync/build/types";
import {
    fetchAddressState,
    fetchNFTFromState,
    fetchNFTInfo,
    fetchNFTOrders,
    prepareBuyOrder,
    prepareSellOrder
} from "../../utils/api";
import {Box, Flex, Image, Input, Text, Button, Heading} from "@chakra-ui/react";
import {Table, Thead, Tbody, Tr, Th, Td, chakra} from '@chakra-ui/react'
import {TriangleDownIcon, TriangleUpIcon} from '@chakra-ui/icons'
// @ts-ignore
import {useTable, useSortBy} from 'react-table';
import {BigNumber, ethers} from "ethers";
import axios, {AxiosRequestConfig} from "axios";
import {utils} from "zksync";

const FALLBACK_IMAGE =
    "https://www.kindacode.com/wp-content/uploads/2021/08/oops.png";

const NftView = ({zkSyncConnection, setZkSyncConnection} : {zkSyncConnection : ZkSyncConnection|undefined, setZkSyncConnection:any}) => {

    const router = useRouter();
    let tokenId = router.query.tokenId as string;
    const [nftInfo, setNftInfo] = useState<FetchedNFT>();
    const [error, setError] = useState<boolean>(false);
    const [invalidInput, setInvalidInput] = useState<boolean>()
    const [orders, setOrders] = useState<Array<BuyOrder>>([]);
    const syncWallet=zkSyncConnection?.syncWallet;
    const syncProvider=zkSyncConnection?.syncProvider;
    console.log(syncWallet);

    useEffect(() => {

        const search = async () => {
            let network_name = await chainConnection();
            if (network_name) {
                const response = await fetchNFTInfo(parseInt(tokenId)) as any;
                const orders = await fetchNFTOrders(tokenId) as Array<Order>;
                setNftInfo(response);
                setOrders(orders);
            } else {
                setError(true);
            }
        }
        if (tokenId !== undefined) {
            console.log("token Id" + tokenId);
            search();
        }
    }, [tokenId])

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const content = data.get("ethPrice") as string
        console.log(content);
        if (isNaN(parseInt(content))) {
            console.log("not a number")
            setInvalidInput(true);
        } else {
            const payload = await prepareBuyOrder(nftInfo!.nft, content, syncWallet!);
            let response: any = await axios.post('/api/orders',
                {
                    body: payload
                }
            );
            console.log(response);
            if (response.data.result === "success") {
                console.log("success")
            } else {
                console.log("failure")
            }
        }
    }

    const acceptOffer = async (order:Order) => {
        console.log(order);
       const payload = await prepareSellOrder(order, syncWallet!);
    }

    return (
        <>
            {nftInfo &&
            <Box width={"95%"}>
                <Flex
                    justifyContent={"center"}
                >
                    <Flex
                        justifyContent={"center"}
                        flexDir={"row"}
                        width={"inherit"}
                    >

                        <Flex
                            alignItems="center"
                            justifyContent={"center"}
                            flexDir={"column"}
                            marginX={"200px"}

                        >
                            <Text
                            >
                                Attributes
                            </Text>
                            {<DataTable nftInfo={nftInfo}/>}
                        </Flex>
                        <Box>
                            {nftInfo.metadata.image ?
                                <Image
                                    maxHeight={"300px"}
                                    objectFit={"contain"}
                                    borderRadius={"15px"}
                                    src={nftInfo.metadata.image} onError={(e: any) => {
                                    e.target.onerror = null;
                                    e.target.src = FALLBACK_IMAGE;
                                }}/> : <span>NO IMAGE</span>
                            }

                        </Box>

                    </Flex>
                </Flex>
                <Flex
                    width={"100%"}
                    marginTop={"100px"}
                    justifyContent={"center"}>
                    <Flex
                        flexDir={"column"}
                        justifyContent={"center"}
                        alignItems={"center"}>
                        <Text
                        >
                            NFT Info
                        </Text>
                        <Flex
                            flexDir={"column"}
                        >
                            <p>ID : {nftInfo.nft.id}</p>
                            <p>Address : {nftInfo.nft.address}</p>
                            <p>Content Hash : {nftInfo.nft.contentHash}</p>
                            <p>Creator : {nftInfo.nft.creatorAddress}</p>
                        </Flex>
                    </Flex>

                </Flex>
                <Flex>
                    <Flex
                        flexDir={"column"}
                    >
                    <Heading>Offers : </Heading>
                        {orders.length !== 0 &&
                        orders.map((order) => {
                                return (
                                    <>
                                        <Button
                                            onClick = {() => acceptOffer(order) as any}>
                                        {order.ratio[0]*10**-18}
                                        </Button>
                                    </>
                                )
                            }
                        )
                        }
                    </Flex>


                    <form onSubmit={handleSubmit}>
                        <Input type={"text"} name={"ethPrice"}/>
                    </form>
                </Flex>

            </Box>
            }

        </>
    );
}

function DataTable({nftInfo}: { nftInfo: FetchedNFT }) {
    const attributes: Array<Attributes> = nftInfo.metadata.attributes;
    const data = React.useMemo<Array<Attributes>>(() => attributes, [attributes]);
    const columns = React.useMemo(
        () => [
            {
                Header: 'Trait type ',
                accessor: 'trait_type',
            },
            {
                Header: 'Value',
                accessor: 'value',
            },

        ],
        [],
    )

    const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} =
        useTable({columns, data}, useSortBy)

    return (
        <Table {...getTableProps()}>
            <Thead>
                {headerGroups.map((headerGroup: any) => (
                    <Tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column: any) => (
                            <Th
                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                isNumeric={column.isNumeric}
                            >
                                {column.render('Header')}
                                <chakra.span pl='4'>
                                    {column.isSorted ? (
                                        column.isSortedDesc ? (
                                            <TriangleDownIcon aria-label='sorted descending'/>
                                        ) : (
                                            <TriangleUpIcon aria-label='sorted ascending'/>
                                        )
                                    ) : null}
                                </chakra.span>
                            </Th>
                        ))}
                    </Tr>
                ))}
            </Thead>
            <Tbody {...getTableBodyProps()}>
                {rows.map((row: any) => {
                    prepareRow(row)
                    return (
                        <Tr {...row.getRowProps()}>
                            {row.cells.map((cell: any) => (
                                <Td {...cell.getCellProps()} isNumeric={cell.column.isNumeric}>
                                    {cell.render('Cell')}
                                </Td>
                            ))}
                        </Tr>
                    )
                })}
            </Tbody>
        </Table>
    )
}


export default NftView;