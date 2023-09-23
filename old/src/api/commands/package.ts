import { resolve } from '../../deps.ts';
import { Logger } from '../logger.ts';
import type { Local } from '../domain/local.ts';

const cliPackage =
  ({ local, logger }: { local: Local; logger: Logger }) =>
  async (opts: { componentPath: string; compress?: boolean }): Promise<Component> => {
    const componentPath = opts.componentPath;
    const packageDir = resolve(componentPath, '_package');
    const compressedPackagePath = resolve(componentPath, 'package.tar.gz');

    logger.warn(`Packaging -> ${packageDir}`);
    try {
      const packageOptions = {
        production: true,
        componentPath: resolve(componentPath),
      };

      const component = await local.package(packageOptions).catch((err) => {
        logger.err(`An error happened when creating the package: ${String(err)}`);
        return Promise.reject(err);
      });

      logger.ok(`Packaged -> ${packageDir}`);

      if (opts.compress) {
        logger.warn(`Compressing -> ${compressedPackagePath}`);

        await local.compress(packageDir, compressedPackagePath).catch((err) => {
          logger.err(`An error happened when creating the package: ${String(err)}`);
          return Promise.reject(err);
        });

        logger.ok(`Compressed -> ${compressedPackagePath}`);

        return component;
      } else {
        return component;
      }
    } catch (err) {
      logger.err(String(err));
      throw err;
    }
  };

export default cliPackage;
