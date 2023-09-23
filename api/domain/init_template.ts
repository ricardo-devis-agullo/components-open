import { join, copy, fromFileUrl } from '../../deps.ts';

export default async function initTemplate({
  componentPath,
}: {
  componentPath: string;
}): Promise<void> {
  const __dirname = fromFileUrl(new URL('.', import.meta.url));
  const scaffoldPath = join(__dirname, 'scaffold');

  await copy(scaffoldPath, componentPath);
}
