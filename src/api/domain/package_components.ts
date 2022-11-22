import { basename, join, emptyDir } from '../../deps.ts';
import { compile } from './compile_component.ts';

export interface PackageOptions {
  componentPath: string;
  minify?: boolean;
  verbose?: boolean;
  production?: boolean;
}

export function validateComponentName(componentName: string): boolean {
  return !/[^a-zA-Z0-9\-_]/.test(componentName) && componentName !== '_package';
}

async function packageComponents(options: PackageOptions) {
  const production = !!options.production;
  const componentPath = options.componentPath;
  const minify = options.minify === true;
  const verbose = options.verbose === true;
  const publishPath = join(componentPath, '_package');
  const componentName = basename(componentPath);

  await emptyDir(publishPath);

  if (!validateComponentName(componentName)) {
    throw new Error('name not valid');
  }

  const compileOptions = {
    publishPath,
    componentPath,
    minify,
    verbose,
    production,
  };

  return compile(compileOptions);
}

export default packageComponents;
