import Store from "../tools/Store.js"
import queueEvent from '../kafka/queueEvent.js';
import ws from "ws"


const { clients, groups } = Store //.getStores()

export default async function socketEventHandler(msg, socket, ip) {
    console.log(`PROCESS: ${process.pid}`, "GOT MESSAGE")

    const decodedMessage = JSON.parse(msg.data.toString())
    let { sender, type } = decodedMessage
    console.log("message sender: ", sender, 185)

    switch (type) {
        case "handshake":
            socket.isClosed = false

            let { sender, groupId } = decodedMessage
            if (groupId !== "none") {
                const key = `${sender}&${ip}`
                clients.set(key, socket)
                console.log(`PROCESS ${process.pid}`, clients, 23)
                console.log(sender, "connected", 195)

                if (groups.get(groupId)) groups.set(groupId, new Set([...Array.from(groups.get(groupId)), key]))
                else groups.set(groupId, new Set([key]))


                // Implementing this to get benifits from horizontal scaling
                // Needs sticky sessions to get benifits


                // tells client whos in the group right now
                groups.get(groupId).forEach((client) => {

                    // add a notification function here for if the client ready state is closed so make it an else statement
                    if (clients.get(client)?.readyState === ws.OPEN) {
                        clients.get(client).send(JSON.stringify({
                            type: "members",
                            members: groups.get(groupId)
                        }))
                    }
                })

            }



            break;

        case "message":

        console.log(`PROCESS ${process.pid}`, clients, 54)

            await queueEvent(decodedMessage, "messaging-service")

            break;
        // if the reciver is not on the server, send the event to the notification bus too 
        // if (!clients[decodedMessage.payload.receiver]) await queueEvent(decodedMessage.payload, "notification-service")
    }
}