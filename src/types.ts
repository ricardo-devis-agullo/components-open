export interface Storage {
  getList(): Promise<string[]>;
  getJson(path: string): Promise<any>;
  getFilePath(path: string): string;
}

export interface RegistryConfig {
  baseUrl: string;
  port: number;
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
