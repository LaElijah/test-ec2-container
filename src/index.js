import consumer from "./_utils/kafka/consumer.js"
import dbConnection from './_utils/db/dbConnection.js';
import dotenv from 'dotenv';
import wss from "./_utils/sockets/wss.js"
import app from "./appConfig.js"
import consumerHandler from "./_utils/kafka/consumerHandler.js"
import os from "os"
import cluster from "cluster";

const cores = os.cpus().length







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

}

else {

    // TODO: I NEED TO USE REDIS TO HANDLE A GLOBAL STORE OF USERS AND IMPLEMENT IT 
    // SIMILAR TO A MAP TO INPUT USAGE BACK INTO FUNCTIONS 
    // REDIS ELIJAH REDIS, laugh at this when you see this love, youre doing okay
    // and youre doing cool things.



    // Core seperate
    dotenv.config();
    const port = process.env.PORT || 8080


    consumer.run({ eachMessage: consumerHandler })

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