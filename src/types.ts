export interface StorageOptions {
  sas: string;
  accountName: string;
  accountKey: string;
  containerName: string;
  componentsDir: string;
}

export interface RegistryConfig {
  baseUrl: string;
  port: number;
  storage: StorageOptions;
  env: Record<string, string>;
  prefix: string;
  tempDir: string;
  verbosity: number;
  discovery: boolean;
  pollingInterval: number;
  fallbackRegistryUrl?: string;
  timeout: number;
}

export interface RegistryOptions extends Partial<RegistryConfig> {
  baseUrl: string;
}
