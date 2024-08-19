import { execSync } from 'child_process';
import { FileUtils } from './utils/FileUtils';

export class TrustStore {
  private workingDirectory: string;
  private password: string;

  constructor(workingDirectory: string, password: string) {
    this.workingDirectory = workingDirectory;
    this.password = password;

    FileUtils.createDirectory(workingDirectory);
  }

  public generateTrustStore(caCertFile: string) {
    const trustStoreFileName = `${this.workingDirectory}/kafka.truststore.jks`;
    console.log(`Generating truststore...`);

    // Excluir truststore existente
    if (FileUtils.exists(trustStoreFileName)) {
      console.log(`Truststore ${trustStoreFileName} já existe. Excluindo...`);
      FileUtils.deleteFile(trustStoreFileName);
    }

    execSync(`keytool -keystore ${trustStoreFileName} -alias CARoot -import -file ${caCertFile} -noprompt -storepass ${this.password}`);
  }
}
