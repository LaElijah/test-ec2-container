import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: `SOCKET_HANDLER~${process.pid}`,
    brokers: ['kafka:9092'],
    connectionTimeout: 1000,
    requestTimeout: 1000,
    retry: {
        initialRetryTime: 3000,
        retries: 3
    }
})
const consumer = kafka.consumer({ groupId: "SOCKET_HANDLERS" })



export default consumer