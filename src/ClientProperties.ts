import { writeFileSync } from 'fs';

interface IProperties {
    'security.protocol': string;
    'ssl.keystore.location': string;
    'ssl.keystore.password': string;
    'ssl.key.password': string;
    'ssl.truststore.location': string;
    'ssl.truststore.password': string;
}

export class ClientProperties {
    private properties: IProperties;
    constructor() {
        this.properties = {
            'security.protocol': 'SSL',
            'ssl.keystore.location': `keystore/kafka.client.keystore.jks`,
            'ssl.keystore.password': process.env.KAFKA_PASSWORD || '',
            'ssl.key.password': process.env.KAFKA_PASSWORD || '',
            'ssl.truststore.location': `truststore/kafka.truststore.jks`,
            'ssl.truststore.password': process.env.KAFKA_PASSWORD || ''
        };
    }

    public generateClientProperties() {
        const filePath = `./client.properties`;
        let fileContent = '';
        Object.entries(this.properties).forEach(([key, value]) => {
            fileContent += `${key}=${value}\n`;
        });

        writeFileSync(filePath, fileContent);
        console.log(`Arquivo client.properties gerado em ${filePath}`);

        return filePath;
    }
}
