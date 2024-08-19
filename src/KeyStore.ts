import { existsSync, unlinkSync } from 'fs';
import { FileUtils } from './utils/FileUtils';
import { execSync } from 'child_process';

export class KeyStore {
    private workingDirectory: string;
    private password: string;
    private validityInDays: number;

    constructor(workingDirectory: string, password: string, validityInDays: number) {
        this.workingDirectory = workingDirectory;
        this.password = password;
        this.validityInDays = validityInDays;

        FileUtils.createDirectory(workingDirectory);
    }

    public generateKeyStore(host: string, isServer: boolean = true) {
        const suffix = isServer ? "server" : "client";
        const alias = `localhost_${host}`;
        const keyStoreFileName = `${this.workingDirectory}/${host}.${suffix}.keystore.jks`;

        // Excluir keystore existente
        if (existsSync(keyStoreFileName)) {
            console.log(`Keystore ${keyStoreFileName} já existe. Excluindo...`);
            unlinkSync(keyStoreFileName);
        }

        console.log(`Generating keystore for ${host}...`);
        execSync(`keytool -genkey -keystore ${keyStoreFileName} -alias ${alias} -validity ${this.validityInDays} -keyalg RSA -noprompt -dname "CN=${host}" -keypass ${this.password} -storepass ${this.password}`);

        return { keyStoreFileName, alias };
    }
}
