import * as esbuild from 'esbuild/mod.js';
import { denoPlugin } from 'esbuild_deno_loader/mod.ts';
import wrapper from './wrapper.ts';

async function getImportMapURL() {
  try {
    const denoJson = JSON.parse(await Deno.readTextFile('./deno.json'));
    if ('importMap' in denoJson) {
      const importMapURL = new URL(denoJson['importMap'], import.meta.url);

      return importMapURL;
    }
  } catch {}
}

export async function compileClient({
  componentName,
  componentVersion,
}: {
  componentName: string;
  componentVersion: string;
}) {
  const absWorkingDir = Deno.cwd();
  const entryPoint = new URL('App.tsx', import.meta.url);
  let wrapperFilePath = '';

  try {
    wrapperFilePath = await Deno.makeTempFile({ suffix: '.tsx' });

    await Deno.writeTextFile(wrapperFilePath, wrapper(entryPoint));

    await esbuild.initialize({});
    const bundle = await esbuild.build({
      absWorkingDir,
      bundle: true,
      entryPoints: [wrapperFilePath],
      format: 'iife',
      globalName: `ocBuilds.${componentName}["${componentVersion}"]`,
      minify: true,
      outfile: '',
      platform: 'neutral',
      plugins: [denoPlugin({ importMapURL: await getImportMapURL() })],
      target: ['chrome99', 'firefox99', 'safari15'],
      treeShaking: true,
      write: false,
    });
    esbuild.stop();

    return bundle.outputFiles[0].contents;
  } finally {
    if (wrapperFilePath) {
      Deno.removeSync(wrapperFilePath);
    }
  }
}

export async function compileServer() {
  const proc = Deno.run({
    cmd: [Deno.execPath(), 'bundle', 'server.ts'],
    cwd: Deno.cwd(),
    stdout: 'piped',
  });
  const raw = await proc.output();
  const status = await proc.status();
  if (!status.success) {
    throw new Error(`Failed to call 'deno build' on folder'`);
  }

  const txt = new TextDecoder().decode(raw);

  return txt;
}
