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

    await ensureEsbuildInitialized();
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
    esbuild.stop();

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

export async function compileServer(entrypoint: URL) {
  const proc = Deno.run({
    cmd: [Deno.execPath(), 'bundle', '--quiet', fromFileUrl(entrypoint)],
    cwd: Deno.cwd(),
    stdout: 'piped',
  });
  const raw = await proc.output();
  const status = await proc.status();
  if (!status.success) {
    throw new Error(`Failed to call 'deno build' on folder'`);
  }

  return raw;
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

  const [client, server] = await Promise.all([
    compileClient({
      base,
      entrypoint: opts.clientEntrypoint,
    }),
    compileServer(new URL(opts.serverEntrypoint, base)),
  ]);

  const templateString = viewTemplate({
    bundleHash: client.bundleHash,
    reactRoot: 'rooty',
    bundleName,
  });
  const templateHash = hashBuilder(templateString);

  await Promise.all([
    Deno.writeTextFile(join(packageDir, 'template.js'), viewWrapper(templateHash, templateString)),
    Deno.writeFile(join(packageDir, `${bundleName}.js`), client.content),
    Deno.writeFile(join(packageDir, 'server.js'), server),
  ]);
}
