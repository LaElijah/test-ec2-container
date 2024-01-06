import messageType from "../types/messageType.js";
import notificationType from "../types/notificationType.js"
import producer from "./producer.js";


const getBufferType = (topic: string) => {
    switch (topic) {
        case "messaging-service":
            return messageType
        case "notification-service":
            return notificationType
    }
}



export default async function queueEvent(event: { message: any; groupId: any; username: any; type: any; }, topic: string) {

    const value = getBufferType(topic)?.toBuffer({ ...event })

    if (value) {

        const success = await producer.send({
            topic,
            messages: [
                {
                    key: `${process.pid}`,
                    value
                }
            ],

        });

        if (success) {
            console.log(`PROCESS: ${process.pid}`, "Message queued successfully");
        } else {
            console.log("Message queue failed");
        }
    }
}
