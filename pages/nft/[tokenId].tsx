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
import {Box, Flex, Image, Input, Text, Button, Heading, Link, Grid} from "@chakra-ui/react";
import {Table, Thead, Tbody, Tr, Th, Td, chakra} from '@chakra-ui/react'
import {TriangleDownIcon, TriangleUpIcon} from '@chakra-ui/icons'

// @ts-ignore
import {NotificationContainer, NotificationManager} from 'react-notifications';
// @ts-ignore
import {useTable, useSortBy} from 'react-table';

import 'react-notifications/lib/notifications.css';

import {BigNumber, ethers} from "ethers";
import axios, {AxiosRequestConfig} from "axios";
import {utils} from "zksync";

interface storedOrder extends Order {
    _id: string
}

const FALLBACK_IMAGE =
    "https://www.kindacode.com/wp-content/uploads/2021/08/oops.png";

const NftView = ({
                     zkSyncConnection,
                     setZkSyncConnection
                 }: { zkSyncConnection: ZkSyncConnection | undefined, setZkSyncConnection: any }) => {

    const router = useRouter();
    let tokenId = router.query.tokenId as string;
    const [nftInfo, setNftInfo] = useState<FetchedNFT>();
    const [error, setError] = useState<boolean>(false);
    const [invalidInput, setInvalidInput] = useState<boolean>()
    const [orders, setOrders] = useState<Array<storedOrder>>([]);
    const syncWallet = zkSyncConnection?.syncWallet;
    const syncProvider = zkSyncConnection?.syncProvider;
    const [owner, setOwner] = useState<boolean>();
    const [network, setNetwork] = useState<string>();

    useEffect(() => {

        const search = async () => {
            let network_name = await chainConnection();
            setNetwork(network_name)
            if (network_name) {
                const response = await fetchNFTInfo(parseInt(tokenId)) as any;
                console.log(response);
                const orders = await fetchNFTOrders(tokenId) as Array<storedOrder>;
                setNftInfo(response);
                console.log(response);
                setOrders(orders);
            } else {
                setError(true);
            }
        }
        if (tokenId !== undefined) {
            search();
        }
    }, [tokenId])

    useEffect(() => {
        if (orders.length !== 0 && zkSyncConnection) {
            console.log(orders);
            orders.map(async (order) => {
                const submitter = order.recipient;
                const orderNonce = order.nonce;
                const submitterState = await zkSyncConnection?.syncProvider.getState(submitter);
                const submitterNonce = submitterState?.committed.nonce;
                if (submitterNonce !== orderNonce) {
                    const payload = {
                        _id: order._id
                    }
                    await axios.delete('/api/orders',
                        {
                            params: payload
                        })
                    const newOrders = await fetchNFTOrders(tokenId);
                    setOrders(newOrders);
                }
            })
        }
    }, [zkSyncConnection, orders])

    useEffect(() => {

        const checkOwner = async () => {
            const accountState = await zkSyncConnection?.syncWallet.getAccountState();
            console.log(accountState);
            Object.values(accountState!.committed.nfts).forEach((nft: NFT) => {
                if (nft.id === parseInt(tokenId)) {
                    setOwner(true);
                }
            })

        }
        if (zkSyncConnection) {
            checkOwner();
        }
    }, [zkSyncConnection])


    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const content = data.get("ethPrice") as string
        if (isNaN(parseInt(content))) {
            setInvalidInput(true);
        } else {
            const payload = await prepareBuyOrder(nftInfo!.nft, content, syncWallet!);
            let response: any = await axios.post('/api/orders',
                {
                    body: payload
                }
            );
            if (response.data.result === "success") {
                console.log("success")
                NotificationManager.success("You will receive the NFT once the owner accepts your offer", 'Offer sent', 5000)
                const orders = await fetchNFTOrders(tokenId);
                setOrders(orders);
            } else {
                console.log("failure")
            }
        }
    }

    const acceptOffer = async (order: Order) => {
        const txHash = await prepareSellOrder(order, syncWallet!);
        if (txHash) {
            NotificationManager.success("Click here to open zkscan", 'Transaction sent', 5000, () => checkExplorer(network as string, txHash))
        } else {
            NotificationManager.error("There was an error with the offer", 'Error')

        }
    }

    const checkExplorer = async (network: string, txHash: string) => {
        console.log(network);
        if (network === "rinkeby") {
            window.open(`https://rinkeby.zkscan.io/explorer/transactions/${txHash}`, "_blank")
        } else {
            window.open(`https://zkscan.io/explorer/transactions/${txHash}`, "_blank")
        }
    }


    return (
        <>
            {nftInfo &&
            <Box width={"90%"}
                 marginX={"auto"}
            >
                <Flex
                    justifyContent={"left"}
                >
                    <Heading
                    >
                        {nftInfo.metadata.name}
                    </Heading>
                </Flex>
                <Grid
                    gridTemplateColumns={"1fr 1fr 1fr"}
                    columnGap={"100px"}
                    justifyContent={"center"}
                    marginTop={"10"}
                >
                    <Flex
                        flexDir={"column"} padding={"10px"}>
                        <Flex marginBottom={"10px"}>
                            <p>{nftInfo.metadata.description}</p>
                        </Flex>
                        <p>Created by  <Link
                            href={`/address/${nftInfo.nft.creatorAddress}`}>{nftInfo.nft.creatorAddress.slice(0, 6)}</Link>
                        </p>
                        ID : {nftInfo.nft.id}
                        <Flex marginTop="40px" justifyContent={"center"} flexDir={"column"}
                              alignItems={"flex-start"}>

                            {zkSyncConnection && !owner &&
                            <>
                                Make an offer in ETH
                                <form onSubmit={handleSubmit}>
                                    <Flex flexDir="column" alignItems={"center"}>
                                        <Input maxWidth={"150px"}
                                               type={"text"}
                                               name={"ethPrice"}/>
                                        <Button type={"submit"}>Submit</Button>
                                    </Flex>
                                </form>
                            </>
                            }
                            {zkSyncConnection && owner && <>You own this NFT</>}
                            {!zkSyncConnection &&
                            <>
                                Connect your wallet to make an offer
                            </>
                            }
                        </Flex>
                    </Flex>
                    <Flex
                        flexDir={"column"}
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

                </Grid>
                <Flex>
                    <Flex
                        justifyContent={"center"}
                        alignItems={"center"}
                        height={"100%"}
                        width={"100%"}
                        flexDir={"column"}
                        marginTop={"10px"}
                    >
                        <div>
                            <Heading>Offers : </Heading>
                        </div>
                        {orders.length !== 0 &&
                        orders.map((order) => {
                                return (
                                    <>
                                        <Button
                                            marginBottom={"15px"}
                                            padding={"30px"}
                                            disabled={zkSyncConnection === undefined || !owner}
                                            onClick={() => acceptOffer(order) as any}>
                                            {ethers.utils.formatEther(order.ratio[0])}ETH <br/>
                                            from {order.recipient}
                                        </Button>

                                    </>
                                )
                            }
                        )
                        }
                        {orders.length === 0 &&
                        <Text marginTop={"30px"}>
                            There are no offers for this NFT
                        </Text>
                        }
                    </Flex>


                </Flex>

            </Box>
            }
            {!nftInfo && <> NFT doesn't exist or is not hosted on IPFS</>}
            <NotificationContainer/>

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