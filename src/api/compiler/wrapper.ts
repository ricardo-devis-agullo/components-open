const TEMPLATE_PLACEHOLDER = 'TEMPLATE_PLACEHOLDER';

interface OcProps {
  _staticPath: string;
  _baseUrl: string;
  _componentName: string;
  _componentVersion: string;
  [key: string]: any;
}

export default function wrapper(entry: URL) {
  return `
    import App from "${entry.href}";

    export default ${Bundle.toString().replace(TEMPLATE_PLACEHOLDER, '<App {...rest} />')}
  `;
}

function Bundle(props: OcProps) {
  const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;
  (window as any).oc.events.fire('oc:componentDidMount', rest);

  function getData(
    providerProps: any,
    parameters: any,
    cb: (error: any, parameters?: any, props?: any) => void
  ) {
    return (window as any).oc.getData(
      {
        name: providerProps._componentName,
        version: providerProps._componentVersion,
        baseUrl: providerProps._baseUrl,
        parameters,
      },
      (err: any, data: { reactComponent: { props: OcProps } }) => {
        if (err) {
          return cb(err);
        }
        const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } =
          data.reactComponent.props;
        cb(null, rest, data.reactComponent.props);
      }
    );
  }

  rest.getData = (parameters: any, cb: (error: any, parameters?: any, props?: any) => void) =>
    getData(props, parameters, cb);
  return TEMPLATE_PLACEHOLDER;
}
