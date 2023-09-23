import { RegistryOptions, RegistryConfig } from './types.ts';

export default function optionsSanitiser(
  options: RegistryOptions
): RegistryConfig {
  let baseUrl = options.baseUrl;
  const hasTrailingPrefix = new RegExp(options.prefix + '$');
  if (!options.baseUrl.match(hasTrailingPrefix)) {
    baseUrl = options.baseUrl.replace(/\/$/, '') + options.prefix;
  }

  let fallbackRegistryUrl = options.fallbackRegistryUrl;
  if (
    typeof fallbackRegistryUrl !== 'undefined' &&
    !fallbackRegistryUrl.endsWith('/')
  ) {
    fallbackRegistryUrl += '/';
  }

  return {
    baseUrl,
    prefix: options.prefix ?? '/',
    tempDir: options.tempDir ?? './temp/',
    verbosity: options.verbosity ?? 0,
    discovery:
      typeof options.discovery === 'boolean' ? options.discovery : true,
    pollingInterval:
      typeof options.pollingInterval !== 'undefined'
        ? options.pollingInterval
        : 5,
    env: options.env ?? {},
    timeout: options.timeout || 1000 * 60 * 2,
    port: options.port || Number(Deno.env.get('PORT')) || 3000,
    fallbackRegistryUrl,
  };
}
