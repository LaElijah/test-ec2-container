import express from 'express';
const app = express();

import { WebSocketServer } from 'ws';
import ws from 'ws';
import { Kafka } from 'kafkajs';
import eventType from './_utils/eventType.js';
import privateMessage from './_utils/privateMessage.js';
import queueMessage from './_utils/queueMessage.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


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





import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 4000
const clients = {}
const groups = {} 

app.use(express.json())


app.post('/create', async (req, res) => {

    try {

        const body = req.body 
     
        const event = {
            message: req.body.payload.message,
            groupId: req.body.payload.groupId,
            username:  req.body.payload.username,
        }

        await queueMessage(event);

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

const consumer = kafka.consumer({ groupId: 'kafka' })

consumer.connect()

consumer.subscribe({ topic: 'messaging-service', fromBeginning: true })









wsServer.on("connection", (socket) => {
    let username
    let groupId




    // Unique group ids are stored in a hash table
    // this is an example of how to use a hash table
    // to store data that can be accessed by all clients
    // connected to the server
    // EX: groups["group1"] = [client1, client2, client3]
    // this means that all clients in group1 can access
    // the clients in group1 by using the group id as the key



  

    socket.on("message", (msg) => {
 
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
                    }))
                }
            })
        }


        if (decodedMessage.type === "private") {
            privateMessage(decodedMessage.id, decodedMessage.msg, clients)
        }

        // wsServer.clients.forEach((client) => {

        //     if (client != socket && client.readyState === ws.OPEN) {
        //         client.send("msg")
        //     }
        // })


    })


    socket.on("close", () => {
        delete clients[id]
        console.log(Object.keys(clients))
    })
}
)

consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        console.log(message.value.toString())
        let event = eventType.fromBuffer(message.value);
        let group = groups[event.groupId]

        if (group) {

            group.forEach((client) => {
                if (client != clients[event.username]) {
                    client.send(JSON.stringify({
                        type: "message",
                        payload: event
                    }))
                }
            })
        }
    },
})




httpServer.on("upgrade", (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, (socket) => {
        wsServer.emit("connection", socket, req)
    })
}
)
