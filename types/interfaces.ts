import {NFT} from "zksync/build/types";
import {SyncProvider, Wallet} from "zksync";


export interface Attributes {
    [index: string]: string;
    trait_type: string
    value: string
}

export interface Metadata {
    name:string;
    description:string;
    external_url:string;
    image:string;
    attributes: Attributes[];
}

export interface FetchedNFT {
    nft:NFT;
    metadata:Metadata;
}

export interface ZkSyncConnection{
    syncWallet:Wallet,
    syncProvider:SyncProvider,
}