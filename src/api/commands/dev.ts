import { dirname, basename, fromFileUrl, delay } from '../../deps.ts';
import { Logger } from '../logger.ts';
import { Storage } from '../../types.ts';
import { Local } from '../domain/local.ts';
import { Registry } from '../../registry/registry.ts';

async function watchFiles(folderPath: string) {
  const local = Local();
  const watcher = Deno.watchFs(folderPath);
  let packaging = false;

  for await (const event of watcher) {
    if (
      !packaging &&
      (event.kind === 'create' || event.kind === 'modify' || event.kind === 'remove')
    ) {
      console.log('Packaging...');
      packaging = true;
      await local.package({ componentPath: folderPath, minify: false, production: false });
      console.log('OK');
      await delay(5000);
      packaging = false;
    }
  }
}

export default function cliDev({ baseUrl }: { baseUrl: string; logger?: Logger }) {
  const dir = dirname(fromFileUrl(baseUrl));
  const componentName = basename(dir);

  const devStorage: Storage = {
    getList: () => Promise.resolve([`components/${componentName}/1.0.0/`]),
    getJson: () => Promise.resolve({}),
    getFilePath: () => '',
    putFile: async () => {},
  };

  const registry = Registry(devStorage, { baseUrl });

  return Promise.all([watchFiles(dir), registry.start()]);
}
