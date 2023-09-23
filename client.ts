interface OcData {
  template: string;
  data: Record<string, unknown>;
}

interface Template {
  render: (element: Element) => Promise<void>;
}

declare global {
  interface Window {
    oc: {
      render: (elementOrSelector: string | Element) => void;
      getFromUrl: (url: string) => Promise<OcData>;
    };
  }
}

async function getFromUrl(url: string) {
  const response = await fetch(url);
  const data: OcData = await response.json();

  return data;
}

async function render(elementOrSelector: string | Element) {
  const element =
    typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;

  if (!element) {
    throw new Error('Element does not exist');
  }
  const href = element.getAttribute('href');

  const data = await getFromUrl(href!);
  const template: Template = await import(data.template);

  await template.render(element);
}

window.oc = {
  getFromUrl,
  render,
};
