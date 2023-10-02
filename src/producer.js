
import { Kafka } from 'kafkajs';
import eventType from './_utils/eventType.js';



const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka:9092'],
    connectionTimeout: 15000,
    requestTimeout: 15000,
    retry: {
        initialRetryTime: 5000,
        retries: 10
    },
    authenticationTimeout: 10000,
    enforceRequestTimeout: true,
})

const producer = kafka.producer({
    groupId: 'kafka'
});


setTimeout(() => {
    producer.connect();



setInterval( () => {
    const event = {
        message: "Hello world",
        groupId: "123",
        username: "test"
    }
    const test = async () => {
        await producer.send({
            topic: 'messaging-service',
            messages: [
                {value: eventType.toBuffer({...event})}
            ]
        });
    }
    test();
}, 1000);
}
, 5000);