declare const dataProvider: any;
declare const componentName: string;
declare const componentVersion: string;

export default function wrapper({
  entry,
  componentName,
  componentVersion,
}: {
  entry: URL;
  componentName: string;
  componentVersion: string;
}) {
  return `
    import { data as dataProvider } from "${entry.href}";

    const componentName = '${componentName}';
    const componentVersion = '${componentVersion}';

    export ${data.toString()}
  `;
}

async function data(context: any) {
  const model = await dataProvider(context);

  const props = Object.assign({}, model, {
    _staticPath: context.staticPath,
    _baseUrl: context.baseUrl,
    _componentName: componentName,
    _componentVersion: componentVersion,
  });

  const srcPathHasProtocol = context.staticPath.indexOf('http') === 0;
  const srcPath = srcPathHasProtocol ? context.staticPath : 'https:' + context.staticPath;
  return {
    reactComponent: {
      key: 'HASH-KEY',
      src: srcPath + 'react-component.js',
      props,
    },
  };
}
