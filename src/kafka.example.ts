import * as kafkajs from 'kafkajs';

const kafka = new kafkajs.Kafka({
    clientId: 'my-app',
    brokers: ['localhost:29092'],
    sasl: {
        username: 'c3RlcmxpbmctY29yZ2ktODM0MSQ0Je0',
        password: 'ZDhjZDliYTctZTI1OS00MDc3LThhYTAtZTlkOWRkZTNlZGNk',
        mechanism: 'plain'
    },
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
