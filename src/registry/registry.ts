import { Application } from 'oak/mod.ts';
import { Repository } from './repository.ts';
import { create } from './router.ts';
import { Storage, RegistryOptions } from '../types.ts';
import optionsSanitiser from './options-sanitiser.ts';

export function Registry(storage: Storage, inputOptions: RegistryOptions) {
  const options = optionsSanitiser(inputOptions);

  return {
    start(): Promise<void> {
      const repository = Repository(storage);
      const app = new Application();
      const router = create(repository);
      app.use(router.routes());
      app.use(router.allowedMethods());

      console.log(`HTTP webserver running. Access it at: http://localhost:${options.port}/`);

      return app.listen({ port: 8080 });
    },
  };
}
