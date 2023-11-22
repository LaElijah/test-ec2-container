import consumer from "./_utils/kafka/consumer.js"
import dbConnection from './_utils/globals/dbConnection.js';
import dotenv from 'dotenv';
import wss from "./_utils/sockets/wss.js"
import app from "./appConfig.js"
import consumerHandler from "./_utils/kafka/consumerHandler.js"
import os from "os"
import cluster from "cluster";
import getStores from "./_utils/globals/store.js";
import RedisWorker from "./_utils/tools/RedisWorker.js";
import messageType from "./_utils/types/messageType.js";



if (cluster.isPrimary) {
    const numCPUs = os.cpus().length
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.error(`Worker ${worker.process.pid} died with code: ${code}, signal: ${signal}`);
        cluster.fork();
    });

    cluster.on('error', (error) => {
        console.error(`Worker error: ${error.message}`);
    });



    await consumer.connect()
    await consumer.subscribe({ topics: ['messaging-service', 'notification-service'] })


    await consumer.run({
        eachMessage: async ({ message, partition }) => {
            console.log("")
            for (const id in cluster.workers) {
                cluster.workers[id].send(
                    {
                        type: "message",
                        message: {
                            message: messageType.fromBuffer(message.value),
                            partition
                        }
                    })
            }
        }
    }
    )

}

else {
    const { redisWorkers: { groups } } = getStores({
        redisWorkers: ["groups"],
        localStores: ["clients", "groups"]
    })




    dotenv.config();
    const port = process.env.PORT || 8080



    process.on("message", ({ message }) => consumerHandler(message))

    const httpServer = app.listen(port, async () => {
        await dbConnection()

        console.log(`PROCESS: ${process.pid} Server is running at ${port}`)
    })

    // TODO: Update this to run on routes for seperation of notifications and messages sockets

    httpServer.on("upgrade", (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, async (socket) => {
            wss.emit("connection", socket, req)
        })
    })

}