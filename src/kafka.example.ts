require('dotenv').config();
import * as kafkajs from 'kafkajs';

const kafka = new kafkajs.Kafka({
    clientId: 'my-app',
    brokers: ['179.222.233.122:9092'],
    sasl: {
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
        mechanism: 'plain',
        rejectUnauthorized: true,
    } as any,
    ssl: false,
});

const consumer = kafka.consumer({
    groupId: 'test-group',
});

const run = async () => {
    const admin = kafka.admin();
    await admin.connect();
    await admin.fetchTopicMetadata(); // Atualiza os metadados

    await admin.createTopics({
        topics: [
            {
                topic: 'test-topic',
                numPartitions: 5,
                replicationFactor: 1,
            },
        ],
    });

    await consumer.connect();
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value.toString(),
            });
        },
    });
};

run().then(() => console.log('Ok')).catch(console.error);
