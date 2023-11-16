
import express from 'express';
import queueEvent from '../kafka/queueEvent';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


const app = express();

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





export default app