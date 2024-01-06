import dbConnection from './_utils/global/dbConnection.js';
import dotenv from 'dotenv';
import wss from "./_utils/sockets/wss.js"
import app from "./appConfig.js"
import consumerHandler from "./_utils/kafka/consumerHandler.js"
import os from "os"
import cluster from "cluster";
import getStores from "./_utils/global/store.js";
import bootConsumer from './_utils/kafka/bootConsumer.js';
import { IncomingMessage } from 'http';
import authenticate from './_utils/sockets/authenticate.js';
import { Duplex } from 'stream';
dotenv.config();


if (cluster.isPrimary) {
    for (let i = 0; i < os.cpus().length; i++) { cluster.fork() }

    cluster.on('exit', (worker, code, signal) => {
        console.error(`Worker ${worker.process.pid} died with code: ${code}, signal: ${signal}`);
        cluster.fork();
    });

    cluster.on('error', (error) => {
        console.error(`Worker error: ${error.message}`);
    });

    getStores({
        redisWorkers: ["groups"]
    })

    bootConsumer(['messaging-service', 'notification-service'])

}

else {

    const port = process.env.PORT || 8080

    getStores({
        redisWorkers: ["groups"],
        localStores: ["clients", "groups", "subscribers"]
    })


    process.on("message", ({ message }) => consumerHandler(message))


    const httpServer = app.listen(port, async () => {
        await dbConnection()
        console.log(`PROCESS: ${process.pid} Server is running at ${port}`)
    })

    // TODO: Update this to run on routes for seperation of notifications and messages sockets

    httpServer.on("upgrade", (req: IncomingMessage, socket: Duplex, head: any) => {
        const upgradeURL = new URL(req.url || "", `http://${req.headers.host}`)
        const pathname = upgradeURL.pathname.split("?")[0]

        console.log(pathname, "PATH")

        if (pathname === '/live') {

           


            // authenticate(req, (error, client) => {
            //     if (error || !client) {
            //         socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
            //         socket.destroy();
            //         return;
            //     }

            //     socket.removeListener("error", console.log)

            // })

            wss.handleUpgrade(req, socket, head, async (socket: any) => {

                wss.emit("connection", socket, req)  //, client)
            })

        }
        // socket.destroy
        // for if the socket couldnt successfully pass my algorithm
    })

}