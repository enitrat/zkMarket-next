import {Grid} from "@chakra-ui/react";
import NFTCard from "./NFTCard";
import React from "react";
import {FetchedNFT} from "../types/interfaces";


const Collection = ({nftArray}:{nftArray:FetchedNFT[]|undefined}) => {
    return (
        <>
            <Grid
                gridTemplateColumns={"repeat(auto-fit, minmax(300px, 1fr))"}
                gridGap={"20px"}
                width={"90%"}
            >
                {nftArray !== undefined && nftArray!.map((elem) => {
                    return (
                        <NFTCard elem={elem}/>
                    )
                })}
            </Grid>
        </>)
        ;
}
export default Collection;