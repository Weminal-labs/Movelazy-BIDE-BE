// src/services/compiler.service.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { docker } from '../config/docker.config';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);
let isImageLoaded = false;

export async function loadCompilerImage() {
  if (isImageLoaded) return;

  try {
    console.log('Loading compiler image...');
    const imageFile = fs.createReadStream('./docker-images/aptosimage.tar');
    await new Promise((resolve, reject) => {
      docker.loadImage(imageFile, (err, stream) => {
        if (err) return reject(err);
        if (!stream) return reject(new Error('Stream is undefined'));

        // Theo dõi tiến trình
        stream.on('data', (chunk) => {
          console.log('Loading image:', chunk.toString());
        });

        stream.on('end', () => {
          console.log('Image loaded successfully');
          resolve(true);
        });

        stream.on('error', (error) => {
          console.error('Error loading image:', error);
          reject(error);
        });
      });
    });
    console.log('Compiler image loaded successfully');
    isImageLoaded = true;
  } catch (error) {
    console.error('Failed to load compiler image:', error);
    throw error;
  }
}

export const compileCodeService = async (moveFile: string, tomlFile: string) => {
  try {
    await loadCompilerImage();

    const absoluteMoveFile = path.resolve(moveFile);
    const absoluteTomlFile = path.resolve(tomlFile);
    const absoluteTempDir = path.resolve(process.cwd(), 'temp');

    await fs.promises.access(absoluteMoveFile);
    await fs.promises.access(absoluteTomlFile);

    const container = await docker.createContainer({
      Image: 'ubuntu-aptos:',
      Cmd: ['sh', '-c', `
        cd /movement
        /root/.local/bin/aptos move compile && tar -czf /output/build.tar.gz build/
      `],
      Tty: false,
      HostConfig: {
        Binds: [
          `${absoluteMoveFile}:/movement/sources/${path.basename(moveFile)}`,
          `${absoluteTomlFile}:/movement/${path.basename(tomlFile)}`,
          `${absoluteTempDir}:/output`
        ],
      },
    });

    await container.start();

    const logs = await container.logs({ stdout: true, stderr: true, follow: true });
    logs.on('data', (chunk) => {
      console.log('Container log:', chunk.toString());
    });

    const result = await container.wait();

    if (result.StatusCode !== 0) {
      throw new Error('Compilation failed');
    }

    await container.remove();

    return `${absoluteTempDir}/build.tar.gz`;
  } catch (error) {
    console.error('Error during compilation:', error);
    throw error;
  }
};
