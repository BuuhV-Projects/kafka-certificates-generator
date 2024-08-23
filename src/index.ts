#!/usr/bin/env node

require('dotenv').config();

import KafkaCertificateManager from './KafkaCertificateManager';

const PASSWORD = process.env.KAFKA_PASSWORD;
const VALIDITY_IN_DAYS = 3650;
const USERNAME = process.env.KAFKA_USERNAME;
const HOSTS = process.env.HOSTS.split(',');

if (!PASSWORD || !USERNAME || !HOSTS?.length) {
    console.error('Please provide KAFKA_PASSWORD, KAFKA_USERNAME and HOSTS in .env file');
    process.exit(1);
}

const manager = new KafkaCertificateManager(
    VALIDITY_IN_DAYS, PASSWORD, USERNAME, HOSTS
);

manager.generateCertificates();
