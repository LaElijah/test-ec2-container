import messageHandler from "../sockets/messageHandler.js";
import eventHandler from "../events/eventHandler.js";
export default async function consumerHandler({ event, partition }) {
    switch (event.type) {
        case "message":
            messageHandler(event);
            break;
        case "event":
            eventHandler(event);
            break;
    }
}
