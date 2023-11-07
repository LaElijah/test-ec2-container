import express from 'express';
import { WebSocketServer } from 'ws';
import ws from 'ws';
import User from './_utils/models/user.js';
import Group from './_utils/models/group.js';
import { Kafka } from 'kafkajs';
import eventType from './_utils/messageType.js';
import queueEvent from './_utils/queueEvent.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dbConnection from './_utils/db/dbConnection.js';
import dotenv from 'dotenv';
dotenv.config();


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 8080

const clients = new Map()
const groups = new Map()

const app = express();




// Kafka event starting
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
consumer.subscribe({ topic: 'messaging-service', fromBeginning: true })
consumer.subscribe({ topic: 'notification-service', fromBeginning: true })

consumer.run({
    eachMessage: async ({ topic, partition, message }) => {

        const event = eventType.fromBuffer(message.value)

        switch (event.type) {

            case "message":
                // const hostUser = await User.find({ username: event.sender })
                // const receiverUser = await User.find({ username: event.receiver })
                const dbGroup = await Group.findById(event.groupId)

                // if client is found i can do this by splitting of the username and checking if its a key within the clients object
                const clientNames = clients.keys().map(key => key.split('&')[0])

                console.log(clientNames)

                if (groups.get(event.groupId)) {
                    groups.get(event.groupId).forEach(async (client) => {

                        if (client.split('&')[0] !== event.sender
                            && clients.get(client)?.readyState === ws.OPEN
                        ) {
                            console.log("sending")
                            clients.get(client).send(JSON.stringify({
                                type: "message",
                                payload: event
                            }))
                        }
                    })
                }

                // Update user history here
                console.log("Updating history")
                dbGroup.messages.push({ ...event })
                await dbGroup.save()
        }

    }
})

// To let the user know their message was a suuccess, might be better off sending a notification eevnt 
// clients[event.username].send(JSON.stringify({
//     type: 'status',
//     payload: {
//         status: 'success'
//     }
// }))

// Express app setup 
app.use(express.json())

app.post('/create', async (req, res) => {

    try {
        console.log("now on service", req.body)
        const { message, groupId, username, type } = req.body

        // TODO: Update this to the current messages schema 
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

const httpServer = app.listen(port, async () => {
    await dbConnection()
    console.log(`Server is running at ${port}`)
})




// TODO: Update this to run on routes for seperation of notifications and messages sockets
const wsServer = new WebSocketServer({ noServer: true })


wsServer.on("connection", async (socket, req) => {
    let ip = req.socket.remoteAddress


    socket.on("message", async (msg) => {

        const decodedMessage = JSON.parse(msg.toString())
        let { sender, type } = decodedMessage
        console.log("message here", sender)

        switch (type) {
            case "handshake":
                {
                    let { sender, groupId } = decodedMessage
                    if (groupId !== "none") {
                        const key = `${sender}&${ip}`

                        
                        console.log("past", clients)

                        clients.set(key, socket)

                        console.log("now", clients)

                        if (groups.get(groupId)) groups.set(groupId, new Set([...Array.from(groups.get(groupId)), key]))
                        else groups.set(groupId, new Set([key]))



                        // Implementing this to get benifits from horizontal scaling
                        // Needs sticky sessions to get benifits


                        // tells client whos in the group right now
                        groups.get(groupId).forEach((client) => {

                            // add a notification function here for if the client ready state is closed so make it an else statement
                            if (clients.get(client)?.readyState === ws.OPEN) {
                                console.log("sender", clients.get(client))
                                clients.get(client).send(JSON.stringify({
                                    type: "members",
                                    members: groups.get(groupId)
                                }))
                            }
                        })

                    }


                }
                break;

            case "message":
                {
                    await queueEvent(decodedMessage, "messaging-service")
                }
                break;
            // if the reciver is not on the server, send the event to the notification bus too 
            // if (!clients[decodedMessage.payload.receiver]) await queueEvent(decodedMessage.payload, "notification-service")
        }
    })


    let processedDisconnect = false

    socket.on("close", () => {
        
        console.log("Client disconnected")
        console.log("pre delete", clients.keys())
        if (!processedDisconnect) { 
        const clientKey = Array.from(clients.keys()).find(key => key.split('&')[1] === ip)
        if (clientKey) clients.delete(clientKey)
        clearInterval(socket.timer);
        console.log("post delete", clients.keys())
        socket.terminate()
        }

        processedDisconnect = true

        setTimeout(() => {
            processedDisconnect = false
        }, 1000)
    })

    // socket.on("error", (error) => {
    //     console.log("Error", error)

    //     const clientKey = Object.keys(clients).find(key => key.split('&')[1] === ip)
    //     if (clientKey) delete clients[clientKey]

    //     clearInterval(socket.timer);
    //     socket.terminate()
    // })

    socket.timer = setInterval(() => {
        console.log("pinging")
        socket.ping()
    }, 30000)




})


httpServer.on("upgrade", (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, async (socket) => {
        wsServer.emit("connection", socket, req)
    })
})

