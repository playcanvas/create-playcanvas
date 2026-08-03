import { promises as fs } from 'fs';
import path from 'path';

/**
 * Convert JSON metadata into a .env file format asynchronously.
 * @param {Record<string, unknown>} data - The metadata JSON object.
 * @param {string} outputPath - The directory where the .env file should be saved.
 * @param {string} [prefix='VITE_'] - The prefix to add to environment variables.
 * @returns {Promise<void>}
 */
export const createEnvFile = async (data: Record<string, unknown>, outputPath: string, prefix = 'VITE_') => {
    const envContent = Object.entries(data)
        .map(([key, value]) => `${prefix}${key.toUpperCase()}=${JSON.stringify(value)}`)
        .join('\n');

    const envPath = path.join(outputPath, '.env');

    await fs.writeFile(envPath, envContent, 'utf8');
};
