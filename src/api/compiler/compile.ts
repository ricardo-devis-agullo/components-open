import {
  esbuild,
  checksum,
  denoPlugin,
  toFileUrl,
  fromFileUrl,
  join,
  ensureDir,
} from '../../deps.ts';
import reactWrapper from './reactWrapper.ts';
import serverWrapper from './serverTemplate.ts';
import viewTemplate from './viewTemplate.ts';

const hashPlaceholder = '__OC_DENO_HASH--PLACEHOLDER__';
const bundleName = 'react-component';

function hashBuilder(content: string) {
  return new checksum.Hash('sha1').digest(checksum.encode(content)).hex();
}

function viewWrapper(hash: string, content: string) {
  const nameSpace = 'oc';
  return `var ${nameSpace}=${nameSpace}||{};${nameSpace}.components=${nameSpace}.components||{};${nameSpace}.components['${hash}']=${content}`;
}

async function getImportMapURL() {
  try {
    const denoJson = JSON.parse(await Deno.readTextFile(join(Deno.cwd(), 'deno.json')));
    if ('importMap' in denoJson) {
      const importMapURL = toFileUrl(join(Deno.cwd(), denoJson['importMap']));

      return importMapURL;
    }
  } catch {}
}

let esbuildInitialized = false;
async function ensureEsbuildInitialized() {
  if (!esbuildInitialized) {
    await esbuild.initialize({});
    esbuildInitialized = true;
  }
}

export async function compileClient({ base, entrypoint }: { base: string; entrypoint: string }) {
  let wrapperFilePath = '';

  try {
    wrapperFilePath = await Deno.makeTempFile({ suffix: '.tsx' });

    await Deno.writeTextFile(wrapperFilePath, reactWrapper(new URL(entrypoint, base)));

    const bundle = await esbuild.build({
      absWorkingDir: fromFileUrl(base),
      bundle: true,
      entryPoints: [wrapperFilePath],
      format: 'iife',
      globalName: `oc.reactComponents["${hashPlaceholder}"]`,
      minify: true,
      outfile: '',
      platform: 'neutral',
      plugins: [denoPlugin({ importMapURL: await getImportMapURL() })],
      target: ['chrome99', 'firefox99', 'safari15'],
      treeShaking: true,
      write: false,
    });

    const code = new TextDecoder().decode(bundle.outputFiles[0].contents);
    const bundleHash = hashBuilder(code);

    return { content: new TextEncoder().encode(code), bundleHash };
  } finally {
    if (wrapperFilePath) {
      Deno.removeSync(wrapperFilePath);
    }
  }
}

export async function compileServer({ base, entrypoint }: { base: string; entrypoint: string }) {
  let wrapperFilePath = '';

  try {
    wrapperFilePath = await Deno.makeTempFile({ suffix: '.ts' });

    await Deno.writeTextFile(
      wrapperFilePath,
      serverWrapper({
        entry: new URL(entrypoint, base),
        componentName: 'mycomp',
        componentVersion: '1.2.3',
      })
    );

    const bundle = await esbuild.build({
      absWorkingDir: fromFileUrl(base),
      bundle: true,
      entryPoints: [wrapperFilePath],
      format: 'esm',
      minify: true,
      outfile: '',
      platform: 'neutral',
      plugins: [denoPlugin({ importMapURL: await getImportMapURL() })],
      treeShaking: true,
      write: false,
    });

    let code = new TextDecoder().decode(bundle.outputFiles[0].contents);
    const bundleHash = hashBuilder(code);
    code = code.replace(hashPlaceholder, bundleHash);

    return { content: new TextEncoder().encode(code), bundleHash };
  } finally {
    if (wrapperFilePath) {
      Deno.removeSync(wrapperFilePath);
    }
  }
}

export async function compile(
  base: string,
  opts: {
    clientEntrypoint: string;
    serverEntrypoint: string;
  }
) {
  const packageDir = fromFileUrl(new URL('_package', base).href);
  await ensureDir(packageDir);
  await ensureEsbuildInitialized();

  const [client, server] = await Promise.all([
    compileClient({
      base,
      entrypoint: opts.clientEntrypoint,
    }),
    compileServer({ base, entrypoint: opts.serverEntrypoint }),
  ]);
  esbuild.stop();

  const templateString = viewTemplate({
    bundleHash: client.bundleHash,
    reactRoot: 'rooty',
    bundleName,
  });
  const templateHash = hashBuilder(templateString);

  await Promise.all([
    Deno.writeTextFile(join(packageDir, 'template.js'), viewWrapper(templateHash, templateString)),
    Deno.writeFile(join(packageDir, `${bundleName}.js`), client.content),
    Deno.writeFile(join(packageDir, 'server.js'), server.content),
  ]);
}
