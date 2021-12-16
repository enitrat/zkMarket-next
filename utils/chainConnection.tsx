import {ethers} from "ethers";

export default async function chainConnection() {

    function handleChainChanged(_chainId: any) {
        window.location.reload();
    }

    try {
        const {ethereum} = window as any;
        if (!ethereum) {
            return undefined;
        }
        const chainId = await ethereum.request({method: 'eth_chainId'});
        ethereum.on('chainChanged', handleChainChanged);
        console.log(chainId);
        const network_info = ethers.providers.getNetwork(parseInt(chainId, 16)) as any;
        if (chainId === "0x1") {
            network_info.name = "mainnet"
        }
        return(network_info.name)

    } catch (error: any) {
        console.log(error);
        return undefined;
    }

}