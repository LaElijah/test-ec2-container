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
const port = process.env.PORT || 4000

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
            console.log("about to emit", event)

            switch (event.type) {
                case "private":
                    privateMessage(event.id, event.msg, clients)
                    break;

                case "group":
                    let group = groups[event.groupId]

                    if (group) {
                        group.forEach((client) => {
                            if (client != clients[event.username]) {
                                clients[client].send(JSON.stringify({
                                    type: "message",
                                    payload: event
                                }))

                            }
                            
                        })
                        // To let the user know their message was a suuccess, might be better off sending a notification eevnt 
                        // clients[event.username].send(JSON.stringify({
                        //     type: 'status',
                        //     payload: {
                        //         status: 'success'
                        //     }
                        // }))
                    }
                    break;

                case "notification":
                    handleNotification(event, clients)
                default: break;
            }


        },
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




    wsServer.on("connection", async (socket) => {
        let username
        let groupId


        socket.on("message", async (msg) => {
            const decodedMessage = JSON.parse(msg.toString())

            if (decodedMessage.type === "handshake") {

                username = decodedMessage.payload.username
                clients[username] = socket

                groupId = decodedMessage.payload.groupId
                groups[groupId] = groups[groupId] || []
                groups[groupId].push(username)

                wsServer.clients.forEach((client) => {
                    if (client.readyState === ws.OPEN) {
                        let clientList = []
                        Object.keys(clients).forEach((key) => {
                            clientList.push(key)
                        })

                        client.send(JSON.stringify({
                            type: "clients",
                            payload: clientList
                        })
                        )
                    }
                })
                return;
            }

                await queueEvent(decodedMessage.payload, "messaging-service")
           

        })


        socket.on("close", () => {
            console.log("client disconnected")
            socket.terminate()

            // Broken removal process
            // console.log(groups[groupId][groups[groupId].indexOf(username)])

            const currentClient = Object.keys(clients).find(key => clients[key] === socket)
            delete clients[currentClient]
            console.log(Object.keys(clients))
        })

    })




    httpServer.on("upgrade", (req, socket, head) => {
        wsServer.handleUpgrade(req, socket, head, (socket) => {
            wsServer.emit("connection", socket, req)
        })
    }
    )
}, 20000)