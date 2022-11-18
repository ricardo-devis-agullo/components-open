import { Request } from 'oak/mod.ts';
import { StorageOptions } from '../types.ts';

export async function run(options: {
  storage: StorageOptions;
  componentName: string;
  componentVersion: string;
  request: Request;
}) {
  const { data } = await import(
    `https://${options.storage.accountName}.blob.core.windows.net/${options.storage.containerName}/${options.storage.componentsDir}/${options.componentName}/${options.componentVersion}/server.ts${options.storage.sas}`
  );
  const response = await data({
    baseUrl: '',
    env: {},
    params: {},
    plugins: {},
    request: options.request,
    staticPath: '/',
  });

  return response;
}
