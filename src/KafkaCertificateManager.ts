import { FileUtils } from "./utils/FileUtils";

class KafkaCertificateManager {
    private readonly directory = process.cwd();

    constructor(
        private readonly validityInDays: number,
        private readonly password: string,
        private readonly username: string
    ) { }

    private buildPath = (subDir: string, fileName: string) => {
        const finalDir = `${this.directory}/${subDir}`;
        FileUtils.createDirectory(finalDir);
        return `${finalDir}/${fileName}`;
    }

    generateCertificates = async () => {
        console.log('Generating certificates...');
        try {
            //remove the existing certs
            await FileUtils.execAsync(`rm -rf ${this.buildPath('certs', '*')}`);

            const caKeyPath = this.buildPath('certs', 'ca-key.pem');
            const caCertPath = this.buildPath('certs', 'ca-cert.pem');
            const serverKeystorePath = this.buildPath('certs', 'kafka.keystore.jks');
            const serverCsrPath = this.buildPath('certs', 'kafka.csr.pem');
            const serverCertPath = this.buildPath('certs', 'kafka.crt.pem');
            const serverTruststorePath = this.buildPath('certs', 'kafka.truststore.jks');

            //certs client
            const clientKeystorePath = this.buildPath('certs', 'kafka.client.keystore.jks');
            const clientCsrPath = this.buildPath('certs', 'client.csr.pem');
            const clientCertPath = this.buildPath('certs', 'client.crt.pem');
            const clientTruststorePath = this.buildPath('certs', 'kafka.client.truststore.jks');
            const clientPropertiesPath = this.buildPath('certs', 'client.properties');

            // 1. Generate CA key and certificate
            await FileUtils.execAsync(`openssl req -new -x509 -keyout ${caKeyPath} -out ${caCertPath} -days ${this.validityInDays} -passout pass:${this.password} -subj "/CN=Kafka-CA"`);

            // 2. Create a new Java KeyStore (JKS) for Kafka broker
            await FileUtils.execAsync(`keytool -keystore ${serverKeystorePath} -alias kafka-server -validity ${this.validityInDays} -genkey -keyalg RSA -storepass ${this.password} -keypass ${this.password} -dname "CN=kafka-server"`);

            // 3. Generate a CSR from the keystore
            await FileUtils.execAsync(`keytool -keystore ${serverKeystorePath} -alias kafka-server -certreq -file ${serverCsrPath} -storepass ${this.password} -keypass ${this.password}`);

            // 4. Sign the CSR with the CA to produce a server certificate
            await FileUtils.execAsync(`openssl x509 -req -CA ${caCertPath} -CAkey ${caKeyPath} -in ${serverCsrPath} -out ${serverCertPath} -days ${this.validityInDays} -CAcreateserial -passin pass:${this.password}`);

            // 5. Import the CA certificate into the truststore
            await FileUtils.execAsync(`keytool -keystore ${serverTruststorePath} -alias CARoot -import -file ${caCertPath} -storepass ${this.password} -noprompt`);

            // 6. Import the CA certificate and the signed server certificate into the keystore
            await FileUtils.execAsync(`keytool -keystore ${serverKeystorePath} -alias CARoot -import -file ${caCertPath} -storepass ${this.password} -noprompt`);
            await FileUtils.execAsync(`keytool -keystore ${serverKeystorePath} -alias kafka-server -import -file ${serverCertPath} -storepass ${this.password} -noprompt`);

            // 7. Create a new Java KeyStore (JKS) for the client
            await FileUtils.execAsync(`keytool -keystore ${clientKeystorePath} -alias kafka-client -validity ${this.validityInDays} -genkey -keyalg RSA -storepass ${this.password} -keypass ${this.password} -dname "CN=kafka-client"`);

            // 8. Generate a CSR from the keystore
            await FileUtils.execAsync(`keytool -keystore ${clientKeystorePath} -alias kafka-client -certreq -file ${clientCsrPath} -storepass ${this.password} -keypass ${this.password}`);

            // 9. Sign the CSR with the CA to produce a client certificate
            await FileUtils.execAsync(`openssl x509 -req -CA ${caCertPath} -CAkey ${caKeyPath} -in ${clientCsrPath} -out ${clientCertPath} -days ${this.validityInDays} -CAcreateserial -passin pass:${this.password}`);

            // 10. Import the CA certificate into the truststore
            await FileUtils.execAsync(`keytool -keystore ${clientTruststorePath} -alias CARoot -import -file ${caCertPath} -storepass ${this.password} -noprompt`);

            // 11. Import the CA certificate and the signed client certificate into the keystore
            await FileUtils.execAsync(`keytool -keystore ${clientKeystorePath} -alias CARoot -import -file ${caCertPath} -storepass ${this.password} -noprompt`);
            await FileUtils.execAsync(`keytool -keystore ${clientKeystorePath} -alias kafka-client -import -file ${clientCertPath} -storepass ${this.password} -noprompt`);

            // 12. Generate client.properties file
            this.generateClientProperties(clientKeystorePath, clientTruststorePath, clientPropertiesPath);

            console.log('Certificates generated successfully');
        } catch (error) {
            console.error('Error generating certificates', error);
            process.exit(1);
        }
    }
    private generateClientProperties = (keystorePath: string, truststorePath: string, propertiesPath: string) => {
        const content = `
security.protocol=SSL
ssl.keystore.location=${keystorePath}
ssl.keystore.password=${this.password}
ssl.truststore.location=${truststorePath}
ssl.truststore.password=${this.password}
ssl.key.password=${this.password}
sasl.mechanism=PLAIN
sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required username="${this.username}" password="${this.password}";
        `.trim();

        FileUtils.writeFileSync(propertiesPath, content);
        console.log(`Generated client.properties at ${propertiesPath}`);
    }
}

export default KafkaCertificateManager;