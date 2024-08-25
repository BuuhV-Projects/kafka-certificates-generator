require('dotenv').config();
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import fs from 'fs';
import { Kafka, Partitioners } from 'kafkajs';
import path from 'path';

const brokers = process.env.KAFKA_JS_HOSTS.split(',');

// Carregando os certificados e as chaves necessárias
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: brokers,  // Endereço e porta do broker conforme configurado no docker-compose
    ssl: {
        rejectUnauthorized: false,  // Não recomendado em produção, pois desativa a verificação do hostname
        ca: [fs.readFileSync(path.resolve(process.cwd(), 'certs/ca-cert.pem'), 'utf-8')], // Certificado da CA
        key: fs.readFileSync(path.resolve(process.cwd(), 'certs/client.key.pem'), 'utf-8'), // Chave privada do cliente
        cert: fs.readFileSync(path.resolve(process.cwd(), 'certs/client.crt.pem'), 'utf-8'), // Certificado do cliente
    },
});

const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
const consumer = kafka.consumer({ groupId: 'test-group' });

const registry = new SchemaRegistry({ host: `http://${process.env.SCHEMA_REGISTRY_HOST_NAME}:8081`, auth: {
    password: process.env.KAFKA_PASSWORD,
    username: process.env.KAFKA_USERNAME,
},  });

const run = async () => {
    const admin = kafka.admin();

    // Conectando o Admin
    await admin.connect();

    // Criando um tópico
    await admin.createTopics({
        topics: [{ topic: 'test-topic', numPartitions: 5, replicationFactor: 2 }],
        waitForLeaders: true,
    });

    // Conectando o Producer
    await producer.connect();
    // Conectando o Consumer
    await consumer.connect();

    // Consumir uma mensagem
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic: _, partition, message }) => {
            const decodedValue = await registry.decode(message.value);
            console.log({
                partition,
                offset: message.offset,
                value: decodedValue,
            });
        },
    });

    // Obtendo o ID 1 do esquema
    const schemaId = 1;
    // Produzir uma mensagem
    const encodedValue = await registry.encode(schemaId, { message: 'Hello KafkaJS user!' });

    await producer.send({
        topic: 'test-topic',
        messages: [
            { value: encodedValue },
        ],
    });
};

run().catch(console.error);
