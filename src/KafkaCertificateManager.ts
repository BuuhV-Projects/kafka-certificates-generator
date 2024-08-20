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
        await FileUtils.execAsync(`openssl req -new -newkey rsa:4096 -days ${this.validityInDays} -x509 -subj "CN=${this.username}" -keyout ${this.buildPath('certificate-authority', 'ca-key')} -out ${this.buildPath('certificate-authority', 'ca-cert')} -nodes`)
    }

    private createKafkaServerCertificate = async () => {
        console.log('2. Create Kafka Server Certificate and store in KeyStore');
        await FileUtils.execAsync(`keytool -genkey -keystore ${this.buildPath('keystore', 'kafka.server.keystore.jks')} -validity ${this.validityInDays} -storepass ${this.password} -keypass ${this.password} -dname "/CN=${this.username}" -storetype pkcs12`)
    }

    private createCertificateSignedRequest = async () => {
        console.log('3. Create Certificate signed request (CSR)');
        await FileUtils.execAsync(`keytool -keystore kafka.server.keystore.jks -certreq -file cert-file -storepass ${this.password} -keypass ${this.password}`)
    }

    private signCertificateRequest = async () => {
        console.log('4. Get CSR Signed with the CA');
        await FileUtils.execAsync(`openssl x509 -req -CA ca-cert -CAkey ca-key -in cert-file -out cert-file-signed -days ${this.validityInDays} -CAcreateserial -passin pass:${this.password}`)
    }

    private importCertificateInKeyStore = async () => {
        console.log('5. Import CA certificate in KeyStore');
        await FileUtils.execAsync(`keytool -keystore kafka.server.keystore.jks -alias CARoot -import -file ca-cert -storepass ${this.password} -keypass ${this.password} -noprompt`)
    }

    private importSignedCertificateInKeyStore = async () => {
        console.log('6. Import Signed CSR In KeyStore');
        await FileUtils.execAsync(`keytool -keystore kafka.server.keystore.jks -import -file cert-file-signed -storepass ${this.password} -keypass ${this.password} -noprompt`)
    }

    private importCertificateInTrustStore = async () => {
        console.log('7. Import CA certificate In TrustStore');
        await FileUtils.execAsync(`keytool -keystore kafka.server.truststore.jks -alias CARoot -import -file ca-cert -storepass ${this.password} -keypass ${this.password} -noprompt`)
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
            console.log('Certificates generated successfully');
        } catch (error) {
            console.error('Error generating certificates', error);
            process.exit(1);
        }
    }
}
export default KafkaCertificateManager
