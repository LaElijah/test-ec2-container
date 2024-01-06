import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: `SOCKET_HANDLER~${process.pid}`,
    brokers: ['kafka:9092'],
})


const producer = kafka.producer();

await producer.connect();


export default producer



// const admin = kafka.admin()

// await admin.connect()
// await admin.createPartitions({
//     topicPartitions: [{
//         topic: "messaging-service",
//         count: "3"
//     }]
// })

// await admin.disconnect()