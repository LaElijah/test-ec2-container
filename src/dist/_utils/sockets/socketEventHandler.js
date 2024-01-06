import queueEvent from '../kafka/queueEvent.js';
import handleConnection from './handleConnection.js';
import * as uuid from "uuid";
// beforeAll in a switch case? 
export default async function socketEventHandler(msg, socket, id) {
    const decodedMessage = JSON.parse(msg.data.toString());
    const { type, groupId, sender } = decodedMessage;
    switch (type) {
        case "connection":
            await handleConnection({
                sender,
                groupId,
                socket,
                id,
            });
            break;
        case "message":
            await queueEvent(Object.assign(Object.assign({}, decodedMessage), { UUID: uuid.v4() }), "messaging-service");
            break;
        case "notification":
            await queueEvent(Object.assign(Object.assign({}, decodedMessage), { UUID: uuid.v4() }), "notification-service");
            break;
    }
}
