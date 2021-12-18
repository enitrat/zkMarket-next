import axios from "axios";
import * as process from "process";
import * as zksync from "zksync";
import {ethers} from "ethers";
import {AccountState, NFT, Order} from "zksync/build/types";
import {FetchedNFT, Metadata} from "../types/interfaces";
import sync from "framesync";
import {utils, Wallet} from "zksync";

const bs58 = require('bs58');
const contentHash = require("content-hash");


export const pinJSONToIPFS = (JSONBody: string) => {
    let pinataApiKey: string = "eabfdb3dfc37b2ff40dc";
    let pinataSecretApiKey: string = "9d9f6adbae06b536181e195e3121810afcafd9abc14f5842e2c6e97e7c1c57de";

    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    return axios
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        })
        .then(function (response) {
            return response.data.IpfsHash;
        })
        .catch(function (error) {
            return null;
        });
};

export const mintNFT = async (JSONBody: any, syncWallet: any, syncProvider: any) => {

    console.log(JSONBody);
    const ipfsHash = await pinJSONToIPFS(JSONBody);
    console.log(ipfsHash);
    const contentHash = getBytes32FromIpfsHash(ipfsHash);
    const {totalFee: fee} = await syncProvider.getTransactionFee("MintNFT", syncWallet.address(), "ETH");
    const nft = await syncWallet.mintNFT({
        recipient: syncWallet.address(),
        contentHash,
        feeToken: "ETH",
        fee,
    });
    console.log(nft);

}

async function fetchDefaultWallet() {
    console.log("search");
    const {ethereum} = window as any;
    const chainId = await ethereum.request({method: 'eth_chainId'});
    console.log(chainId);
    const network_info = ethers.providers.getNetwork(parseInt(chainId, 16)) as any;
    if (chainId === "0x1") {
        network_info.name = "mainnet"
    }
    const ethersProvider = ethers.getDefaultProvider(network_info.name);
    const syncProvider = await zksync.getDefaultProvider(network_info.name);
    const ethWallet = ethers.Wallet.createRandom().connect(ethersProvider);
    const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);
    return {syncProvider, syncWallet};
}

export const fetchAddressState = async (address: string, networkName: string) => {
    const {syncProvider} = await fetchDefaultWallet();
    const state = await syncProvider.getState(address);
    return (state)
}

export const fetchNFTFromState = async (accountState: AccountState) => {
    let temp_array: Array<FetchedNFT> = [];
    try {
        await Promise.allSettled(Object.values(accountState!.committed.nfts).map(async (nft) => {
            let content: string = nft.contentHash;
            content = content.replace("0x", "e30101701220");
            let ipfsHash: string = contentHash.decode(content);
            let response: any = await axios.get(`http://ipfs.io/ipfs/${ipfsHash}`);
            let metadata: Metadata = response.data;
            let fetchedNFT: FetchedNFT = {
                nft: nft,
                metadata: metadata
            }
            temp_array.push(fetchedNFT);
        }));
        return (temp_array)
    } catch (err) {
        console.log(err);
    }
}

function getBytes32FromIpfsHash(ipfsHash: string) {
    return "0x" + bs58.decode(ipfsHash).slice(2).toString('hex')
}

export const fetchNFTInfo = async (tokenId: number) => {
    let res: FetchedNFT;
    try {
        const {syncProvider} = await fetchDefaultWallet();
        const nft = await syncProvider.getNFT(tokenId)
        let content: string = nft.contentHash;
        content = content.replace("0x", "e30101701220");
        let ipfsHash: string = contentHash.decode(content);
        let response: any = await axios.get(`http://ipfs.io/ipfs/${ipfsHash}`);
        let metadata: Metadata = response.data;
        let fetchedNFT: FetchedNFT = {
            nft: nft,
            metadata: metadata
        }
        console.log(fetchedNFT);
        return fetchedNFT;
    } catch (error) {
        console.log(error);
    }
}

export const prepareBuyOrder = async (nft: NFT, price: string, syncWallet: Wallet) => {
    const {syncProvider} = await fetchDefaultWallet();
    console.log("prepareBuy")
    let payload = {
        tokenBuy: nft.id,
        tokenSell: 'ETH',
        amount: ethers.utils.parseEther(price).toString(),
        ratio: utils.tokenRatio({
            [nft.id]: 1,
            ETH: ethers.utils.parseEther(price).toString()
        })
    };
    console.log(payload);
    try {
        const orderA = await syncWallet.getOrder(payload);
        console.log(orderA);
        return orderA;
    }catch(err){
        console.log(err);
    }
}

export const prepareSellOrder = async (order: Order, syncWallet: Wallet) => {
    const {syncProvider} = await fetchDefaultWallet();
    let payload = {
        tokenSell: order.tokenBuy,
        tokenBuy: 'ETH',
        amount: 1,
        ratio: utils.tokenRatio({
            ETH: ethers.utils.formatEther(order.amount),
            [order.tokenBuy]: 1
        })
    };
    console.log(payload);
    const orderB = await syncWallet.getOrder(payload);
    console.log(orderB);
    const swap = await syncWallet.syncSwap({
        orders: [order, orderB],
        feeToken: 'ETH'
    });
    console.log(swap);
}


export const fetchNFTOrders = async (tokenId: string) => {
    let response: any = await axios.get('/api/orders',
        {
            params: {
                tokenId: tokenId
            },
        }
    );
    return response.data;
}
