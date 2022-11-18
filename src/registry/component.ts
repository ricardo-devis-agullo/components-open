import { Request } from 'oak/mod.ts';

export async function run(options: {
  storage: string;
  componentName: string;
  componentVersion: string;
  sas: string;
  request: Request;
}) {
  const { data } = await import(
    `${options.storage}/${options.componentName}/${options.componentVersion}/server.ts${options.sas}`
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
