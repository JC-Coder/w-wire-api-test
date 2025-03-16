import * as bcrypt from 'bcrypt';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ENVIRONMENT_VARIABLES } from '../../configs/environment';

const encryptionKeyFromEnv = ENVIRONMENT_VARIABLES.APP_ENCRYPTION_KEY;

export class BaseHelper {
  static generateRandomString(length = 8) {
    return randomBytes(length).toString('hex');
  }

  static async hashData(data: string): Promise<string> {
    return await bcrypt.hash(data, 12);
  }

  static async compareHashedData(data: string, hashed: string) {
    return await bcrypt.compare(data, hashed);
  }

  static encryptData(data: string, encryptionKey: string): string {
    if (encryptionKeyFromEnv) {
      encryptionKey = encryptionKeyFromEnv;
    }

    if (!encryptionKey) throw new Error('Encryption key is not set');

    const iv = randomBytes(16); // Generate a 16-byte IV
    const cipher = createCipheriv(
      'aes-256-ctr',
      Buffer.from(encryptionKey),
      iv,
    );

    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return iv.toString('hex') + ':' + encryptedData;
  }

  static decryptData(encryptedData: string, encryptionKey: string): string {
    if (encryptionKeyFromEnv) {
      encryptionKey = encryptionKeyFromEnv;
    }

    if (!encryptionKey) throw new Error('Encryption key is not set');

    const parts = encryptedData.split(':');
    const ivPart = parts.shift();
    if (!ivPart) throw new Error('Invalid encrypted data format');
    const iv = Buffer.from(ivPart, 'hex');
    const encryptedText = parts.join(':');
    const decipher = createDecipheriv(
      'aes-256-ctr',
      Buffer.from(encryptionKey),
      iv,
    );
    let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
  }

  /**
   * Generate 32 bytes (256 bits) of random data for AES-256 encryption
   *
   * @return {string} hexadecimal string representing the encryption key
   */
  static generateEncryptionKey(): string {
    const keyBytes = randomBytes(16);
    // Convert the random bytes to a hexadecimal string
    return keyBytes.toString('hex');
  }
}
