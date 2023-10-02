

/**  I could implement the queue pattern here
 i could implement an array that stores the messages
 and then in each individual cluster, somehow theres an
 event listener that listens for a message in the queue
 then the function that fufills the event listener callback
 will get the keys from that clusters clients object
 and then it will use that to filter out the messages stored
 in the array and then send the messages to the clients
 the cluster should have a matching fufillment of 
 messages to cluster clients and vice versa
 i will have two arrays, one for group messages
 and one for private messages
 the private messages will be stored in an array
 that is stored in a hash table that uses the username
 as the key
 the group messages will be stored in an array
 that is stored in a hash table that uses the group id
 as the key
 the hash table for
*/


import express from 'express';
import { WebSocketServer } from 'ws';
import ws from 'ws';
import { Kafka } from 'kafkajs';
import eventType from './_utils/eventType.js';
import privateMessage from './_utils/privateMessage.js';
import queueMessage from './_utils/queueMessage.js';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import cluster from 'cluster';
import dotenv from 'dotenv';

cluster.schedulingPolicy = cluster.SCHED_RR;
dotenv.config();


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 4000

console.log("Booting up server")
setTimeout(() => {
    console.log("Waiting for kafka to start")
}, 5000)

setTimeout(() => {

    

    const app = express();

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

    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(eventType.fromBuffer(message.value))
            wsServer.emit("message", message.value)
        },
    })


    app.use(express.json())


    app.post('/create', async (req, res) => {

        try {
            console.log(req.body)
            const { message, groupId, username, type } = req.body.payload

            const event = {
                message: message,
                groupId: groupId,
                username: username,
                type: type
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



    const clients = {}
    const groups = {}


    const httpServer = app.listen(port, () => {
        console.log(`Server is running at ${port}`)
    })

    const wsServer = new WebSocketServer({ noServer: true })


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


            switch (decodedMessage.type) {
                case "handshake":
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

                    break;

                case "private":
                    privateMessage(decodedMessage.id, decodedMessage.msg, clients)
                    break;

                case "group":
                    let group = groups[decodedMessage.groupId]

                    if (group) {
                        group.forEach((client) => {
                            if (client != clients[decodedMessage.username]) {
                                clients[client].send(JSON.stringify({
                                    type: "message",
                                    payload: decodedMessage
                                }))
                            }
                        })
                    }
                    break;
            }

        })


        socket.on("close", () => {
            delete clients[id]
            console.log(Object.keys(clients))
        })
    })



    httpServer.on("upgrade", (req, socket, head) => {
        wsServer.handleUpgrade(req, socket, head, (socket) => {
            wsServer.emit("connection", socket, req)
        })
    }
    )
}, 10000)
