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

    private createOwnPrivateCertificateAuthority = async () => {
        console.log('1. Create own private Certificate Authority (CA)')
        await FileUtils.execAsync(`openssl req -new -newkey rsa:4096 -days ${this.validityInDays} -x509 -subj "/CN=${this.username}" -keyout ${this.buildPath('certificate-authority', 'ca-key')} -out ${this.buildPath('certificate-authority', 'ca-cert')} -nodes`)
    }

    private createKafkaServerCertificate = async () => {
        console.log('2. Create Kafka Server Certificate and store in KeyStore');
        if (FileUtils.exists(this.buildPath('keystore', 'kafka.server.keystore.jks'))) {
            FileUtils.deleteFile(this.buildPath('keystore', 'kafka.server.keystore.jks'));
        }
        await FileUtils.execAsync(`keytool -genkey -keyalg RSA -keystore ${this.buildPath('keystore', 'kafka.server.keystore.jks')} -validity ${this.validityInDays} -storepass ${this.password} -keypass ${this.password} -dname "CN=${this.username}" -storetype pkcs12`)
    }

    private createCertificateSignedRequest = async () => {
        console.log('3. Create Certificate signed request (CSR)');
        await FileUtils.execAsync(`keytool -keystore ${this.buildPath('keystore', 'kafka.server.keystore.jks')} -certreq -file ${this.buildPath('certificate-authority', 'cert-file')} -storepass ${this.password} -keypass ${this.password}`)
    }

    private signCertificateRequest = async () => {
        console.log('4. Get CSR Signed with the CA');
        await FileUtils.execAsync(`openssl x509 -req -CA ${this.buildPath('certificate-authority', 'ca-cert')} -CAkey ${this.buildPath('certificate-authority', 'ca-key')} -in ${this.buildPath('certificate-authority', 'cert-file')} -out ${this.buildPath('certificate-authority', 'cert-file-signed')} -days ${this.validityInDays} -CAcreateserial -passin pass:${this.password}`)
    }

    private importCertificateInKeyStore = async () => {
        console.log('5. Import CA certificate in KeyStore');
        await FileUtils.execAsync(`keytool -keystore ${this.buildPath('keystore', 'kafka.server.keystore.jks')} -alias CARoot -import -file ${this.buildPath('certificate-authority', 'ca-cert')} -storepass ${this.password} -keypass ${this.password} -noprompt`)
    }

    private importSignedCertificateInKeyStore = async () => {
        console.log('6. Import Signed CSR In KeyStore');
        await FileUtils.execAsync(`keytool -keystore ${this.buildPath('keystore', 'kafka.server.keystore.jks')} -import -file ${this.buildPath('certificate-authority', 'cert-file-signed')} -storepass ${this.password} -keypass ${this.password} -noprompt`)
    }

    private importCertificateInTrustStore = async () => {
        console.log('7. Import CA certificate In TrustStore');
        if (FileUtils.exists(this.buildPath('truststore', 'kafka.truststore.jks'))) {
            FileUtils.deleteFile(this.buildPath('truststore', 'kafka.truststore.jks'));
        }
        await FileUtils.execAsync(`keytool -keystore ${this.buildPath('truststore', 'kafka.truststore.jks')} -alias CARoot -import -file ${this.buildPath('certificate-authority', 'ca-cert')} -storepass ${this.password} -keypass ${this.password} -noprompt`)
    }

    private createClientCertificate = async () => {
        console.log('8. Create Client Certificate');
        if (FileUtils.exists(this.buildPath('keystore', 'kafka.client.keystore.jks'))) {
            FileUtils.deleteFile(this.buildPath('keystore', 'kafka.client.keystore.jks'));
        }
        await FileUtils.execAsync(`keytool -genkey -keyalg RSA  -keystore ${this.buildPath('keystore', 'kafka.client.keystore.jks')} -validity ${this.validityInDays} -storepass ${this.password} -keypass ${this.password} -dname "CN=${this.username}" -storetype pkcs12`)
    }

    private importClientCertificateInKeyStore = async () => {
        console.log('9. Import Client Certificate In KeyStore');
        await FileUtils.execAsync(`keytool -keystore ${this.buildPath('keystore', 'kafka.client.keystore.jks')} -alias CARoot -import -file ${this.buildPath('certificate-authority', 'ca-cert')} -storepass ${this.password} -keypass ${this.password} -noprompt`)
    }

    private createClientPropertiesFile = () => {
        console.log('10. Create Client Properties File');
        const clientProperties = {
            'security.protocol': 'SSL',
            'ssl.truststore.location': `/opt/bitnami/kafka/config/certs/kafka.truststore.jks`,
            'ssl.truststore.password': this.password,
            'ssl.keystore.location': `/opt/bitnami/kafka/config/certs/kafka.client.keystore.jks`,
            'ssl.keystore.password': this.password,
            'ssl.key.password': this.password,
            'ssl.endpoint.identification.algorithm': ''
        }
        const fileData = Object.keys(clientProperties).map(key => `${key}=${clientProperties[key]}`).join('\n');
        FileUtils.writeFileSync(`${this.directory}/client.properties`, fileData);
    }

    generateCertificates = async () => {
        console.log('Generating certificates...');
        try {
            await this.createOwnPrivateCertificateAuthority()
            await this.createKafkaServerCertificate()
            await this.createCertificateSignedRequest()
            await this.signCertificateRequest()
            await this.importCertificateInKeyStore()
            await this.importSignedCertificateInKeyStore()
            await this.importCertificateInTrustStore()
            await this.createClientCertificate()
            await this.importClientCertificateInKeyStore()
            this.createClientPropertiesFile();
            console.log('Certificates generated successfully');
        } catch (error) {
            console.error('Error generating certificates', error);
            process.exit(1);
        }
    }
}
export default KafkaCertificateManager
