import { join, copy } from '../../deps.ts';

export default async function initTemplate({
  componentPath,
}: {
  componentPath: string;
}): Promise<void> {
  const __dirname = new URL('.', import.meta.url).pathname;
  const scaffoldPath = join(__dirname, 'scaffold');

  await copy(scaffoldPath, componentPath);
}
