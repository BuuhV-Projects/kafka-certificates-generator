import { execSync } from 'child_process';
import { FileUtils } from './utils/FileUtils';

export class CertificateAuthority {
    private keyFile: string;
    private certFile: string;
    private validityInDays: number;
    private cn: string;

    constructor(workingDirectory: string, validityInDays: number, cn: string) {
        this.keyFile = `${workingDirectory}/ca-key.pem`;
        this.certFile = `${workingDirectory}/ca-cert.pem`;
        this.validityInDays = validityInDays;
        this.cn = cn;

        FileUtils.createDirectory(workingDirectory);
    }

    public generate() {
        if (FileUtils.exists(this.keyFile) && FileUtils.exists(this.certFile)) {
            console.log("Using existing CA key and certificate...");
        } else {
            console.log("Generating CA key and certificate...");
            execSync(`openssl req -new -newkey rsa:4096 -days ${this.validityInDays} -x509 -subj "/CN=${this.cn}" -keyout ${this.keyFile} -out ${this.certFile} -nodes`);
        }
    }

    public getKeyFile() {
        return this.keyFile;
    }

    public getCertFile() {
        return this.certFile;
    }
}
