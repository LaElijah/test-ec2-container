import Store from "./_utils/tools/Store.js"
import consumer from "./_utils/kafka/consumer.js"
import dbConnection from './_utils/db/dbConnection.js';
import dotenv from 'dotenv';
import wss from "./_utils/sockets/wss.js"
import app from "./appConfig.js"
import consumerHandler from "./_utils/kafka/consumerHandler.js"


dotenv.config();
const port = process.env.PORT || 8080

consumer.run({ eachMessage: consumerHandler })

const httpServer = app.listen(port, async () => {
    await dbConnection()
    Store.getStores()
    console.log(`Server is running at ${port}`)
})

// TODO: Update this to run on routes for seperation of notifications and messages sockets

httpServer.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, async (socket) => {
        wss.emit("connection", socket, req)
    })
})

