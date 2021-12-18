const { connectToDatabase } = require('../../lib/mongodb');
const ObjectId = require('mongodb').ObjectId;

export default async function handler(req: any, res: any) {
    // switch the methods
    switch (req.method) {
        case 'GET': {
            return getOrders(req, res);
        }

        case 'POST': {
            return addOrder(req, res);
        }

        case 'DELETE': {
            return deleteOrder(req, res);
        }
    }
}

const getOrders = async (req: any, res: any) => {
    let {db} = await connectToDatabase();
    const {query} = req;
    const tokenId = query.tokenId
    const filter = {
        tokenBuy: parseInt(tokenId)
    }
    const orders = await db.collection("orders")
        .find(filter,{projection : {_id:0}})
        .limit(20)
        .toArray();
    res.status(200).json(orders);
};

export const addOrder = async (req: any, res: any) => {
    console.log("post")
    let {db} = await connectToDatabase();
    const {body} = req;
    const payload = body.body;
    console.log(payload);
    try {
        const insert = await db.collection("orders").insertOne(payload);
        res.status(200).json({result: "success"});
    } catch (e) {
        console.log(e);
        res.status(500).json({result: "failure"})
    }
}

export const deleteOrder = async (req: any, res: any) => {
    let {db} = await connectToDatabase();
    const {body} = req;
    const {payload} = body;
    console.log(payload);
    try {
        await db.collection("orders").deleteOne(payload);
        res.status(200).json({result: "success"});
    } catch (e) {
        console.log(e);
        res.status(500).json({result: "failure"})
    }
}
