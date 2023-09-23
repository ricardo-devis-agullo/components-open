import { Repository } from './repository.ts';

export const ComponentRenderer =
  (repository: Repository) => async (name: string, version: string) => {
    const versions = repository.getVersions(name);
    const url = './server.ts';
    const fn = await import(url).then((x) => x.default);
    const context = {};

    const result = await fn(context);

    return result;
  };
