import queueEvent from '../kafka/queueEvent.js';
import handleHandshake from './handleHandshake.js';
import * as uuid from "uuid"

export default async function socketEventHandler(msg, socket, ip) {

    const decodedMessage = JSON.parse(msg.data.toString())
    const { type, groupId, sender } = decodedMessage 
    
    console.log(`PROCESS: ${process.pid}`, "GOT MESSAGE")

    switch (type) {
        case "handshake":
            await handleHandshake({
                sender,
                groupId,
                socket,
                ip,
            })
            break;

        case "message":
            await queueEvent({...decodedMessage, UUID: uuid.v4()}, "messaging-service")
            break;
    }

}