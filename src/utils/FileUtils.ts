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
}
