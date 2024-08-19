# Kafka Certificates Generator

The **Kafka Certificates Generator** is a simple and efficient tool for generating authentication SSL certificates for Kafka clusters. With it, you can configure the security of your Kafka connections using username and password in a practical way.

## Requirements

   Before using the **Kafka Certificates Generator**, make sure you have the following requirements installed on your machine:

   - **Java Keytool**: Required to generate certificates. Keytool is usually included in the JDK (Java Development Kit) installation.
   - **`.env` file**: The `.env` file must be located in the folder where you want to generate the certificates. This file must contain the following environment variables:

   ```env
   KAFKA_USERNAME=your_kafka_username
   KAFKA_PASSWORD=your_kafka_password
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
   KAFKA_USERNAME=your_kafka_username
   KAFKA_PASSWORD=your_kafka_password
   ```
3. **Generate the Certificates**:

   Navigate to the folder where the `.env` file is located and run the following command:

   ```bash
   kafka-certificates-generator
   ```
4. **Test the certificates**:

   To test the generated certificates, use keytool to view the contents of the `.jks` file:

   ```bash
   keytool -list -v -keystore keystore/kafka.server.keystore.jks
   ```

   ```bash
   keytool -list -v -keystore truststore/kafka.truststore.jks
   ```