import { Application } from 'oak/mod.ts';
import { Repository } from './repository.ts';
import { create } from './router.ts';
import { Options } from '../types.ts';

export function Registry(options: Options) {
  return {
    start(): Promise<void> {
      const repository = Repository({
        accountName: options.accountName,
        accountKey: options.accountKey,
        sas: options.sas,
      });
      const app = new Application();
      const router = create({ sas: options.sas, storage: options.storage }, repository);
      app.use(router.routes());
      app.use(router.allowedMethods());

      console.log(`HTTP webserver running. Access it at: http://localhost:${options.port}/`);

      return app.listen({ port: 8080 });
    },
  };
}
