import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka:9092'],
    connectionTimeout: 15000,
    requestTimeout: 15000,
    retry: {
        initialRetryTime: 5000,
        retries: 10
    }
})
const consumer = kafka.consumer({ groupId: 'kafka' })

consumer.connect()
consumer.subscribe({ topic: 'messaging-service', fromBeginning: true })
consumer.subscribe({ topic: 'notification-service', fromBeginning: true })



export default consumer