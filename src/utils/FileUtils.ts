import {
    exec
} from 'shelljs';
import * as fs from 'fs';

export class FileUtils {
    public static createDirectory(directory: string) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
    }

    public static exists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    public static deleteFile(filePath: string) {
        if (this.exists(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    public static writeFileSync(filePath: string, data: string) {
        fs.writeFileSync(filePath, data, 'utf8');
    }
    public static async execAsync(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(command, { silent: true }, (code, stdout, stderr) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    console.error('Error executing command', command, stdout);
                    reject(stderr);
                }
            });
        });
    }
}
