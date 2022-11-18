import { Storage } from './storage.ts';

const FILE_MATCH = /components\/(?<componentName>[\w.-]+)\/(?<componentVersion>[\w.-]+)\//;

export function Repository(opts: { accountName: string; accountKey: string; sas: string }) {
  const storage = Storage({
    accountName: opts.accountName,
    accountKey: opts.accountKey,
    sas: opts.sas,
  });

  return {
    async getComponents() {
      const fileList = (await storage.getList()).map((x) => x.Name);
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
  };
}

export type Repository = ReturnType<typeof Repository>;
