import { Storage } from '../types.ts';

const FILE_MATCH = /components\/(?<componentName>[\w.-]+)\/(?<componentVersion>[\w.-]+)\//;

export function Repository(storage: Storage) {
  return {
    async getComponents() {
      const fileList = await storage.getList();
      const componentList = new Map<string, string[]>();

      for (const file of fileList) {
        const fileMatch = FILE_MATCH.exec(file);
        if (fileMatch && fileMatch.groups) {
          const { componentName, componentVersion } = fileMatch.groups;
          const list = componentList.get(componentName) ?? [];
          componentList.set(componentName, [...list, componentVersion]);
        }
      }

      return componentList;
    },
    getServerPath(componentName: string, componentVersion: string) {
      return storage.getFilePath(`${componentName}/${componentVersion}/server.ts`);
    },
  };
}

export type Repository = ReturnType<typeof Repository>;
