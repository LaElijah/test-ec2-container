import { Kafka } from "kafkajs";
import os from "os"
const kafka = new Kafka({
    clientId: `SOCKET_HANDLER~${process.pid}`,
    brokers: ['kafka:9092'],
})


const admin = kafka.admin()

// await admin.connect()
// await admin.createPartitions({
//     topicPartitions: [{
//         topic: "messaging-service",
//         count: "3"
//     }]
// })

// await admin.disconnect()

const producer = kafka.producer({
    groupId: "SOCKET_HANDLERS",
});

await producer.connect();


export default producer