import initTemplate from './init_template.ts';
import packageComponents from './package_components.ts';
import { Logger } from '../logger.ts';

export function validateComponentName(componentName: string): boolean {
  return !/[^a-zA-Z0-9\-_]/.test(componentName) && componentName !== '_package';
}

export function Local() {
  return {
    cleanup(compressedPackagePath: string): Promise<void> {
      return Deno.remove(compressedPackagePath, { recursive: true });
    },
    async init(options: {
      componentName: string;
      logger: Logger;
      componentPath: string;
    }): Promise<void> {
      const { componentName } = options;
      if (!validateComponentName(componentName)) {
        throw 'name not valid';
      }

      await initTemplate(options);
    },
    package: packageComponents,
  };
}

export type Local = ReturnType<typeof Local>;
