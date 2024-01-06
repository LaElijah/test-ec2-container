import messageType from "../types/messageType.js";
import notificationType from "../types/notificationType.js";
import producer from "./producer.js";
const getBufferType = (topic) => {
    switch (topic) {
        case "messaging-service":
            return messageType;
        case "notification-service":
            return notificationType;
    }
};
export default async function queueEvent(event, topic) {
    var _a;
    const value = (_a = getBufferType(topic)) === null || _a === void 0 ? void 0 : _a.toBuffer(Object.assign({}, event));
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
        }
        else {
            console.log("Message queue failed");
        }
    }
}
