import { esbuild, checksum, denoPlugin, toFileUrl, join, ensureDir } from '../../deps.ts';
import reactWrapper from './reactWrapper.ts';
import serverWrapper from './serverTemplate.ts';
import viewTemplate from './viewTemplate.ts';

const hashPlaceholder = '__OC_DENO_HASH--PLACEHOLDER__';
const bundleName = 'react-component';

interface BuildBundle {
  content: Uint8Array;
  bundleHash: string;
}

type EsbuildResult = esbuild.BuildResult & { outputFiles: esbuild.OutputFile[] };

function tryRemove(path: string) {
  return Deno.remove(path).catch(() => {});
}

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

async function buildClient({
  wrapperFilePath,
  componentPath,
  entrypoint,
  dev,
}: {
  wrapperFilePath: string;
  componentPath: string;
  entrypoint: string;
  dev: boolean;
}): Promise<EsbuildResult> {
  await Deno.writeTextFile(wrapperFilePath, reactWrapper(join(componentPath, entrypoint)));

  const bundle = await esbuild.build({
    absWorkingDir: componentPath,
    bundle: true,
    incremental: dev,
    entryPoints: [wrapperFilePath],
    format: 'iife',
    globalName: `oc.reactComponents["${hashPlaceholder}"]`,
    minify: !dev,
    outfile: '',
    platform: 'neutral',
    plugins: [denoPlugin({ importMapURL: await getImportMapURL() })],
    target: ['chrome99', 'firefox99', 'safari15'],
    treeShaking: true,
    write: false,
  });

  return bundle;
}

async function wrapClient(client: EsbuildResult, packageDir: string): Promise<BuildBundle> {
  const code = new TextDecoder().decode(client.outputFiles[0].contents);
  const bundleHash = hashBuilder(code);

  const templateString = viewTemplate({
    bundleHash,
    reactRoot: 'rooty',
    bundleName,
  });
  const templateHash = hashBuilder(templateString);
  const content = new TextEncoder().encode(code);

  await Promise.all([
    Deno.writeTextFile(join(packageDir, 'template.js'), viewWrapper(templateHash, templateString)),
    Deno.writeFile(join(packageDir, `${bundleName}.js`), content),
  ]);

  return { content, bundleHash };
}

async function buildServer({
  wrapperFilePath,
  componentPath,
  entrypoint,
  dev,
}: {
  wrapperFilePath: string;
  componentPath: string;
  entrypoint: string;
  dev: boolean;
}): Promise<EsbuildResult> {
  await Deno.writeTextFile(
    wrapperFilePath,
    serverWrapper({
      entry: join(componentPath, entrypoint),
      componentName: 'mycomp',
      componentVersion: '1.2.3',
    })
  );

  const bundle = await esbuild.build({
    absWorkingDir: componentPath,
    bundle: true,
    incremental: dev,
    entryPoints: [wrapperFilePath],
    format: 'esm',
    minify: !dev,
    outfile: '',
    platform: 'neutral',
    plugins: [denoPlugin({ importMapURL: await getImportMapURL() })],
    treeShaking: true,
    write: false,
  });

  return bundle;
}

async function wrapServer(server: EsbuildResult, packageDir: string): Promise<BuildBundle> {
  let code = new TextDecoder().decode(server.outputFiles[0].contents);
  const bundleHash = hashBuilder(code);
  code = code.replace(hashPlaceholder, bundleHash);
  const content = new TextEncoder().encode(code);

  await Deno.writeFile(join(packageDir, 'server.js'), content);

  return { content, bundleHash };
}

export async function compile(
  componentPath: string,
  opts: {
    dev: boolean;
    clientEntrypoint: string;
    serverEntrypoint: string;
  }
) {
  const packageDir = join(componentPath, '_package');
  await ensureDir(packageDir);
  await ensureEsbuildInitialized();
  const clientWrapperFilePath = await Deno.makeTempFile({ suffix: '.tsx' });
  const serverWrapperFilePath = await Deno.makeTempFile({ suffix: '.ts' });
  const cleanTempFiles = () =>
    Promise.all([tryRemove(clientWrapperFilePath), tryRemove(serverWrapperFilePath)]);

  const [client, server] = await Promise.all([
    buildClient({
      componentPath,
      entrypoint: opts.clientEntrypoint,
      dev: opts.dev,
      wrapperFilePath: clientWrapperFilePath,
    }),
    buildServer({
      componentPath,
      entrypoint: opts.serverEntrypoint,
      dev: opts.dev,
      wrapperFilePath: serverWrapperFilePath,
    }),
  ]);
  const rebuild = async () => {
    if (client.rebuild && server.rebuild) {
      const [clientRebuild, serverRebuild] = await Promise.all([
        client.rebuild(),
        server.rebuild(),
      ]);
      await Promise.all([
        wrapClient(clientRebuild as EsbuildResult, packageDir),
        wrapServer(serverRebuild as EsbuildResult, packageDir),
      ]);
    }
  };
  if (!opts.dev) {
    esbuild.stop();
    await cleanTempFiles();
  }
  Deno.addSignalListener('SIGINT', async () => {
    esbuild.stop();
    await cleanTempFiles();
    Deno.exit(0);
  });

  await Promise.all([wrapClient(client, packageDir), wrapServer(server, packageDir)]);

  return { rebuild };
}
