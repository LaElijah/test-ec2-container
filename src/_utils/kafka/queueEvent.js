import messageType from "../types/messageType.js";
import notificationType from "../types/notificationType.js"
import producer from "./producer.js";


const getBufferType = (topic) => {
    switch (topic) {
        case "messaging-service":
            return messageType
        case "notification-service":
            return notificationType
    }
}



export default async function queueEvent(event, topic) {
    
    const success = await producer.send({
        topic,
        messages: [
            {
                value: getBufferType(topic)
                    .toBuffer({ ...event })
            }
        ]
    });

    if (success) {
        console.log(`PROCESS: ${process.pid}`,"Message queued successfully");
    } else {
        console.log("Message queue failed");
    }
}
