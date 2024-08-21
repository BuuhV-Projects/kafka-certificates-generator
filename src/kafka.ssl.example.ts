import { Kafka } from 'kafkajs';
import fs from 'fs';
import path from 'path';

// Carregando os certificados e as chaves necessárias
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:29092', 'localhost:29093'],  // Endereço e porta do broker conforme configurado no docker-compose
    ssl: {
        rejectUnauthorized: false,  // Não recomendado em produção, pois desativa a verificação do hostname
        ca: [fs.readFileSync(path.resolve(process.cwd(), 'certs/ca-cert.pem'), 'utf-8')], // Certificado da CA
        key: fs.readFileSync(path.resolve(process.cwd(), 'certs/client.key.pem'), 'utf-8'), // Chave privada do cliente
        cert: fs.readFileSync(path.resolve(process.cwd(), 'certs/client.crt.pem'), 'utf-8'), // Certificado do cliente
    },
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'test-group' });

const run = async () => {
    const admin = kafka.admin();

    // Conectando o Admin
    await admin.connect();

    // Criando um tópico
    await admin.createTopics({
        topics: [{ topic: 'test-topic', numPartitions: 5, replicationFactor: 2 }],
    });

    // Conectando o Producer
    await producer.connect();
    // Conectando o Consumer
    await consumer.connect();

    // Consumir uma mensagem
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                partition,
                offset: message.offset,
                value: message.value.toString(),
            });
        },
    });

    // Produzir uma mensagem
    await producer.send({
        topic: 'test-topic',
        messages: [
            { value: 'Hello KafkaJS user!' },
        ],
    });
};

run().catch(console.error);
