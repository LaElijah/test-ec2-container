import app from "./_utils/config/appConfig.js"
import consumer from "./_utils/kafka/consumer.js"
import consumerHandler from "./_utils/kafka/consumerHandler.js"
import dbConnection from './_utils/db/dbConnection.js';
import dotenv from 'dotenv';
import wss from "./_utils/sockets/wss.js"
//
 
dotenv.config();
const port = process.env.PORT || 8080

consumer.run({ eachMessage: consumerHandler })

const httpServer = app.listen(port, async () => {
    await dbConnection()
    console.log(`Server is running at ${port}`)
})

// TODO: Update this to run on routes for seperation of notifications and messages sockets

httpServer.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, async (socket) => {
        wss.emit("connection", socket, req)
    })
})

