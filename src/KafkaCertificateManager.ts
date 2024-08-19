import { CertificateAuthority } from './CertificateAuthority';
import { KeyStore } from './KeyStore';
import { TrustStore } from './TrustStore';
import { PemGenerator } from './PemGenerator';
import { ClientProperties } from './ClientProperties';
import * as path from 'path';

export class KafkaCertificateManager {
    private ca: CertificateAuthority;
    private keyStore: KeyStore;
    private trustStore: TrustStore;
    private pemGenerator: PemGenerator;
    private clientProperties: ClientProperties;

    constructor(
        caDirectory: string, keyStoreDirectory: string, trustStoreDirectory: string, pemDirectory: string,
        validityInDays: number, password: string, username: string
    ) {
        this.ca = new CertificateAuthority(path.join(process.cwd(), caDirectory), validityInDays, username);
        this.keyStore = new KeyStore(path.join(process.cwd(), keyStoreDirectory), password, validityInDays);
        this.trustStore = new TrustStore(path.join(process.cwd(), trustStoreDirectory), password);
        this.pemGenerator = new PemGenerator(path.join(process.cwd(), pemDirectory), password);
        this.clientProperties = new ClientProperties();
    }

    public generateCertificates(hosts: string[]) {
        this.ca.generate();

        hosts.forEach(host => {
            const { keyStoreFileName, alias } = this.keyStore.generateKeyStore(host);
            this.pemGenerator.generatePemFiles(keyStoreFileName, alias);
        });

        this.trustStore.generateTrustStore(this.ca.getCertFile());
        this.clientProperties.generateClientProperties();
    }
}
