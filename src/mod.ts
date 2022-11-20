import { runCli } from './api/cli.ts';

export { Registry } from './registry/registry.ts';
export { AzureStorage } from './registry/storage/azure.ts';
export type { RegistryOptions, Storage } from './types.ts';

if (import.meta.main) {
  runCli();
}
