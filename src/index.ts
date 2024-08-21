#!/usr/bin/env node

require('dotenv').config();

import KafkaCertificateManager from './KafkaCertificateManager';

const PASSWORD = process.env.KAFKA_PASSWORD;
const VALIDITY_IN_DAYS = 3650;
const USERNAME = process.env.KAFKA_USERNAME;
const HOSTS = ['kafka-0', 'kafka-1', 'kafka-2', 'kafka-3'];

if (!PASSWORD || !USERNAME) {
    console.error('Please provide KAFKA_PASSWORD and KAFKA_USERNAME in .env file');
    process.exit(1);
}

const manager = new KafkaCertificateManager(
    VALIDITY_IN_DAYS, PASSWORD, USERNAME, HOSTS
);

manager.generateCertificates();
