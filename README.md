# Kafka Certificates Generator

The **Kafka Certificates Generator** is a simple and efficient tool for generating authentication SSL certificates for Kafka clusters. With it, you can configure the security of your Kafka connections using username and password in a practical way.

## Requirements

   Before using the **Kafka Certificates Generator**, make sure you have the following requirements installed on your machine:

   - **Java Keytool**: Required to generate certificates. Keytool is usually included in the JDK 18.9 (Java Development Kit) installation.
   - **`.env` file**: The `.env` file must be located in the folder where you want to generate the certificates. This file must contain the following environment variables:

   ```env
   # 90 days
   KAFKA_CFG_LOG_RETENTION_MS=7776000000
   # 2MB
   KAFKA_CFG_MAX_REQUEST_SIZE=2097152
   # 2MB
   KAFKA_CFG_MESSAGE_MAX_BYTES=2097152
   KAFKA_HOST=localhost
   KAFKA_PASSWORD=1234567890
   KAFKA_UI_PASSWORD=1234567890
   KAFKA_UI_USERNAME=kafka-ui-test
   KAFKA_USERNAME=kafka_test
   ```

## How to Use

1. **Install Kafka Certificates Generator**:

   If you haven't installed the package yet, do so globally with npm:

   ```bash
   npm install -g kafka-certificates-generator
   ```

2. **Configure the `.env` File**:

   Create a `.env` file in the folder where you want to generate the certificates and add the following environment variables:

   ```env
   # 90 days
   KAFKA_CFG_LOG_RETENTION_MS=7776000000
   # 2MB
   KAFKA_CFG_MAX_REQUEST_SIZE=2097152
   # 2MB
   KAFKA_CFG_MESSAGE_MAX_BYTES=2097152
   KAFKA_HOST=localhost
   KAFKA_PASSWORD=1234567890
   KAFKA_UI_PASSWORD=1234567890
   KAFKA_UI_USERNAME=kafka-ui-test
   KAFKA_USERNAME=kafka_test
   ```
3. **Generate the Certificates**:

   Navigate to the folder where the `.env` file is located and run the following command:

   ```bash
   kafka-certificates-generator
   ```
4. **Test the certificates**:

   To test the generated certificates, use keytool to view the contents of the `.jks` file:

   ```bash
   keytool -list -v -keystore certs/kafka.client.keystore.jks
   ```

   ```bash
   keytool -list -v -keystore certs/kafka.client.truststore.jks
   ```

5. **Examples**
   Use .env.example file to create your .env file

   If you would like to see an example of how to use the Kafka Certificates Generator, check out the **docker-compose-ssl.yml** file

   Execute **kafka.ssl.example.ts** to see a example of integration with kafka using SSL

   Remember to create schema in your kafka cluster before execute the example