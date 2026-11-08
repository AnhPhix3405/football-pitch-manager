import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocalImageStorageService {
  private readonly directory = resolve('.local-uploads');

  constructor(private readonly config: ConfigService) {}

  get enabled(): boolean {
    return (
      this.config.get('app.environment') === 'development' &&
      (!this.config.get('storage.supabaseUrl') ||
        !this.config.get('storage.supabaseKey'))
    );
  }

  async save(buffer: Buffer, mimeType: string) {
    const extension = mimeType.slice('image/'.length);
    const name = `${randomUUID()}.${extension}`;
    await mkdir(this.directory, { recursive: true });
    await writeFile(resolve(this.directory, name), buffer, { flag: 'wx' });

    const prefix = this.config.get<string>('app.apiPrefix');
    const path = [prefix, 'upload', 'local', name].filter(Boolean).join('/');
    const port = this.config.getOrThrow<number>('app.port');
    return { path, url: `http://127.0.0.1:${port}/${path}` };
  }

  async read(name: string) {
    const match = /^[a-f0-9-]{36}\.(jpeg|png|webp|gif)$/.exec(name);
    if (!this.enabled || !match) {
      throw new NotFoundException();
    }

    try {
      const buffer = await readFile(resolve(this.directory, name));
      return { buffer, mimeType: `image/${match[1]}` };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new NotFoundException();
      }
      throw error;
    }
  }
}
