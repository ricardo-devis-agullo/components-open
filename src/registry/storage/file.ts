import { walk } from '../../deps.ts';
import { Storage } from '../../types.ts';

export interface FileStorageOptions {
  componentsPath: URL;
}

export function FileStorage({ componentsPath }: FileStorageOptions): Storage {
  const getFilePath = (path: string) => path;

  return {
    async getList() {
      const list: string[] = [];
      for await (const entry of walk(componentsPath, {
        includeFiles: true,
        includeDirs: false,
        followSymlinks: false,
        skip: [/_package/],
      })) {
        list.push(entry.path);
      }

      return list;
    },
    async putFile(path: string, data: string) {
      await Deno.writeTextFile(path, data);
    },
    async getJson(path: string) {
      const data = await Deno.readTextFile(path);

      return JSON.parse(data);
    },
    getFilePath,
  };
}
