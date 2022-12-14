import { oak } from '../deps.ts';
import { Repository } from './repository.ts';

export async function run(options: {
  repository: Repository;
  componentName: string;
  componentVersion: string;
  request: oak.Request;
}) {
  const { data } = await import(
    options.repository.getServerPath(options.componentName, options.componentVersion)
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
