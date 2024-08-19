import { execSync } from 'child_process';
import { FileUtils } from './utils/FileUtils';

export class PemGenerator {
    private pemDirectory: string;
    private password: string;

    constructor(pemDirectory: string, password: string) {
        this.pemDirectory = pemDirectory;
        this.password = password;

        FileUtils.createDirectory(pemDirectory);
    }

    public generatePemFiles(keyStoreFile: string, alias: string) {
        const clientCertificate = `${this.pemDirectory}/client-certificate.pem`;
        const privateKey = `${this.pemDirectory}/client-private-key.pem`;

        console.log("Generating PEM files...");
        execSync(`keytool -exportcert -alias ${alias} -keystore ${keyStoreFile} -rfc -file ${clientCertificate} -storepass ${this.password}`);
        execSync(`keytool -importkeystore -srcalias ${alias} -srckeystore ${keyStoreFile} -destkeystore cert_and_key.p12 -deststoretype PKCS12 -srcstorepass ${this.password} -deststorepass ${this.password}`);
        execSync(`openssl pkcs12 -in cert_and_key.p12 -nocerts -nodes -password pass:${this.password} | awk '/-----BEGIN PRIVATE KEY-----/,/-----END PRIVATE KEY-----/' > ${privateKey}`);

        FileUtils.deleteFile('cert_and_key.p12');
    }
}
