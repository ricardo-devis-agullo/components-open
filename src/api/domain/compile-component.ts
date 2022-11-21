interface CompileOptions {
  publishPath: string;
  componentPath: string;
  minify: boolean;
  verbose: boolean;
  production: boolean;
}

export function compile(_options: CompileOptions) {
  throw new Error('Not implemented');
}
