import express from "express"
import getStores from "../_utils/global/store.js"
import { IncomingMessage, ServerResponse } from "http"
import parseQueryParams from "../_utils/tools/parseQueryParams.js"
import queueEvent from "../_utils/kafka/queueEvent.js"
import eventWriter from "../_utils/events/eventWriter.js"


const { Router } = express

const router = Router()



const handleSubscription = (res: ServerResponse, params: URLSearchParams, map: Map<string, ServerResponse>) => {
    map.set(`${params.get("username")}&${params.get("id")}`, res)
}

function clientSubscriber(
    req: IncomingMessage,
    res: ServerResponse,
    cb = (res: ServerResponse, params: URLSearchParams, map: Map<string, ServerResponse>) => { }
) {

    const { localStores: { subscribers } } = getStores()

    res.writeHead(200,
        {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            "access-control-allow-origin": 'http://localhost:3000'
        }
    )

    res.flushHeaders()
    // Learn more about flush headers
    // i presume it has to do with skipping an optimization step that
    // only usually happens when res.end is called.
    // but because this is a continuous server side event it cant do that yet



    //setInterval(() => eventWriter({message: "hi"}, (data) => [res, data]), 5000)

    const params = parseQueryParams(req)

    console.log(params)
    const key = `${params.get("username")}&${params.get("id")}`
    console.log("SUBSCRIPTION KEY", key)
    
    subscribers.set(key, res)

    console.log("connection")

    req.on('close', () => {
        res.end()
        subscribers.delete(key)
    })

    cb(res, params, subscribers)

}



interface IncomingMessageJson extends IncomingMessage {
    body: any 
}

const handleNotification = async (req: IncomingMessageJson, res: ServerResponse) => {

    
    const event = req.body
    console.log(event)
    
    await queueEvent(event, "notification-service")

    res.end(JSON.stringify({
        status: "success"
    }))

}


router.get("/events", (req, res) => clientSubscriber(req, res, handleSubscription))


router.post("/notify", handleNotification)

export default router