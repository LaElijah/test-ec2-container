import messageType from "./messageType.js";
import { Kafka } from 'kafkajs';
import notificationType from "./notificationType.js"



export default async function queueEvent(event, topic) {
    let getBufferType = (topic) => {
        switch (topic) {
            case "messaging-service":
                return messageType
            case "notification-service":
                return notificationType
        }
    }

    const bufferType = getBufferType(topic)



    const kafka = new Kafka({
        clientId: 'my-app',
        brokers: ['kafka:9092'],
    })


    const producer = kafka.producer({
        groupId: 'kafka'
    });

    await producer.connect();



    const success = await producer.send({
        topic,
        messages: [
            { value: bufferType.toBuffer({ ...event }) }
        ]
    });

    if (success) {
        console.log("Message queued successfully");
    } else {
        console.log("Message queue failed");
    }
}
