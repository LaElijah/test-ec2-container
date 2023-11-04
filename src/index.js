import express from 'express';
import { WebSocketServer } from 'ws';
import ws from 'ws';
import { Kafka } from 'kafkajs';
import eventType from './_utils/messageType.js';
import privateMessage from './_utils/privateMessage.js';
import queueEvent from './_utils/queueEvent.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 8080

console.log("Booting up server")

const clients = {}
const groups = {}

const app = express();


setTimeout(() => {
    console.log("Waiting for kafka to start")
}, 5000)

setTimeout(() => {


    const kafka = new Kafka({
        clientId: 'my-app',
        brokers: ['kafka:9092'],
        connectionTimeout: 15000,
        requestTimeout: 15000,
        retry: {
            initialRetryTime: 5000,
            retries: 10
        }
    })

    const consumer = kafka.consumer({ groupId: 'kafka' })

    consumer.connect()
    console.log("Kafka started")


    consumer.subscribe({ topic: 'messaging-service', fromBeginning: true })
    consumer.subscribe({ topic: 'notification-service', fromBeginning: true })

    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = eventType.fromBuffer(message.value)

            switch (event.type) {

                case "message":

                // if client is found i can do this by splitting of the username and checking if its a key within the clients object
                const clientNames = Object.keys(clients).map(key => key.split('&')[0])

                if (clientNames.find((name) => name === event.receiver)) // If the server finds the receiver on the clients map
                    groups[event.groupId].forEach((client) => {
                        

                        // change this back to a not equal check
                        
                        
                        if (client.split('&')[0] !== event.sender) {
                            console.log("sending")
                            if (clients[client]?.readyState === ws.OPEN) {
                            clients[client].send(JSON.stringify({
                            type: "message",
                            payload: event
                        }))}
                    })
                // To let the user know their message was a suuccess, might be better off sending a notification eevnt 
                // clients[event.username].send(JSON.stringify({
                //     type: 'status',
                //     payload: {
                //         status: 'success'
                //     }
                // }))
            }
        }
    })


    app.use(express.json())

    app.post('/create', async (req, res) => {

        try {
            console.log("now on service", req.body)
            const { message, groupId, username, type } = req.body.payload

            const event = {
                message: message,
                groupId: groupId,
                username: username,
                type: type
            }

            await queueEvent(event, "messaging-service");

            res.json({
                status: "success",
                message: "Message queued successfully"
            })

        } catch (error) {
            res.json({
                status: "error",
                message: "Message queue failed"
            })
            console.log(error)
        }
    })



    app.get("/", (req, res) => {
        res.sendFile(__dirname + "/index.html")
    })

    const httpServer = app.listen(port, () => {
        console.log(`Server is running at ${port}`)
    })





    const wsServer = new WebSocketServer({ noServer: true })




    wsServer.on("connection", async (socket, req) => {
        let ip = req.socket.remoteAddress


        socket.on("message", async (msg) => {
            const decodedMessage = JSON.parse(msg.toString())
            console.log("message here", decodedMessage.sender)

            if (decodedMessage.payload.type === "handshake") {

                let sender = decodedMessage.payload.sender
                let groupId = decodedMessage.payload.groupId

                clients[`${sender}&${ip}`] = socket
               
                if (groups[groupId] && groups[groupId].indexOf(`${sender}&${ip}`) === -1) groups[groupId] = [...groups[groupId], `${sender}&${ip}`]
                else if (!groups[groupId]) groups[groupId] = [`${sender}&${ip}`]
                console.log(groups)
                


                // Implementing this to get benifits from horizontal scaling
                // Needs sticky sessions to get benifits


                // tells client whos in the group right now
                groups[groupId].forEach((client) => {
                    // add a notification function here for if the client ready state is closed so make it an else statement
                    if (clients[client]?.readyState === ws.OPEN) {
                        clients[client].send(JSON.stringify({
                            type: "clients",
                            payload: groups[groupId]
                        })
                        )
                    }
                })
            }

            if (decodedMessage.payload.type === "message") await queueEvent(decodedMessage.payload, "messaging-service")
            // if the reciver is not on the server, send the event to the notification bus too 
            // if (!clients[decodedMessage.payload.receiver]) await queueEvent(decodedMessage.payload, "notification-service")

        })


        socket.on("close", () => {
            console.log("client disconnected")
            const clientKey = Object.keys(clients).find(key => key.split('&')[1] === ip)
            console.log(clientKey)
            if (clientKey) delete clients[clientKey]
            
            socket.terminate()
        })

    })




    httpServer.on("upgrade", (req, socket, head) => {
        wsServer.handleUpgrade(req, socket, head, (socket) => {
            wsServer.emit("connection", socket, req)
        })
    }
    )
}, 20000)