import { dirname, basename, fromFileUrl, join } from '../../deps.ts';
import { Logger } from '../logger.ts';
import { Storage } from '../../types.ts';
import { Local } from '../domain/local.ts';
import { Registry } from '../../registry/registry.ts';

async function watchFiles(folderPath: string, rebuild: () => Promise<void>) {
  const watcher = Deno.watchFs(folderPath);
  const packagePath = join(folderPath, '_package');

  for await (const event of watcher) {
    if (event.kind === 'create' || event.kind === 'modify' || event.kind === 'remove') {
      if (event.paths.every((path) => !path.startsWith(packagePath))) {
        console.log('Rebuilding...');
        await rebuild();
      }
    }
  }
}
export default async function cliDev({ baseUrl }: { baseUrl: string; logger?: Logger }) {
  const dir = dirname(fromFileUrl(baseUrl));
  const componentName = basename(dir);
  const local = Local();

  const devStorage: Storage = {
    getList: () => Promise.resolve([`components/${componentName}/1.0.0/`]),
    getJson: () => Promise.resolve({}),
    getFilePath: () => '',
    putFile: async () => {},
  };

  const registry = Registry(devStorage, { baseUrl });
  const { rebuild } = await local.package({ componentPath: dir, minify: false, production: false });

  return Promise.all([watchFiles(dir, rebuild), registry.start()]);
}
