
import { WebSocketServer } from 'ws';
import socketEventHandler from "./socketEventHandler.js";
import debouncedRemoveClient from "./debouncedRemoveClient.js"
import Store from '../tools/Store.js';

const client = Store.getStores()
console.log(client)
const {clients} = client


const wss = new WebSocketServer({ noServer: true })

wss.on("close", (event) => console.log("server close", event))
wss.on("error", (event) => console.log("error", event))

wss.on("connection", async (socket, req) => {


    let ip = req.socket.remoteAddress

    socket.onclose = (event) => console.log("onclose")
    socket.onerror = (event) => console.log("onerror", event)
    socket.once = (event) => console.log("What does this do")
    socket.onmessage = (msg) => socketEventHandler(msg, socket)
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

 // socket.on("error", (error) => {
    //     console.log("Error", error)

    //     const clientKey = Object.keys(clients).find(key => key.split('&')[1] === ip)
    //     if (clientKey) delete clients[clientKey]

    //     clearInterval(socket.timer);
    //     socket.terminate()
    // })

export default wss