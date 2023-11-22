import { WebSocketServer } from 'ws';
import socketEventHandler from "./socketEventHandler.js";
import debouncedRemoveClient from "./debouncedRemoveClient.js"
import getStores from '../globals/store.js';



const wss = new WebSocketServer({ noServer: true })


wss.on("close", (event) => console.log("server close", event))
wss.on("error", (event) => console.log("error", event))

wss.on("connection", async (socket, req) => {
    const {localStores: {clients}} = getStores() 
    
    const ip = req.socket.remoteAddress


    socket.onclose = (event) => console.log("onclose")
    socket.onerror = (event) => console.log("onerror", event)
    socket.once = (event) => console.log("What does this do")
    socket.onmessage = (msg) => socketEventHandler(msg, socket, ip)

    socket.on("pong", (data) => "")
    socket.timer = setInterval(() => {
        socket.ping()
    }, 30000)

    socket.on("unexpected-response", (req, res) => {
        console.log("unexpected", req, res)
    })
    socket.on("upgrade", (req) => {
        console.log("upgrade", req)
    })

    socket.on("close", () => debouncedRemoveClient(
        Array
            .from(clients.keys())
            .find(key => key.split('&')[1] === ip)
        , socket)
    )

    
})

export default wss