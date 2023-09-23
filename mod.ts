import { runCli } from './api/cli.ts';

export { Registry } from './registry.ts';
export { AzureStorage } from './registry/storage/azure.ts';
export type { RegistryOptions, Storage } from './types.ts';
export { default as dev } from './api/commands/dev.ts';

if (import.meta.main) {
  runCli();
}
