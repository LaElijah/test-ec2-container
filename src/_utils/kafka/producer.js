import { Kafka } from "kafkajs";
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka:9092'],
})


const producer = kafka.producer({
    groupId: 'kafka'
});

await producer.connect();


export default producer