import { runCli } from './src/api/cli.ts';

export { Registry } from './src/registry/registry.ts';
export { AzureStorage } from './src/registry/storage/azure.ts';
export type { RegistryOptions, Storage } from './src/types.ts';
export { default as dev } from './src/api/commands/dev.ts';

if (import.meta.main) {
  runCli();
}
