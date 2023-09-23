export default function viewTemplate({
  reactRoot,
  bundleHash,
  bundleName,
}: {
  reactRoot: string;
  bundleHash: string;
  bundleName: string;
}) {
  return `function(model){
  var staticPath = model.reactComponent.props._staticPath;
  var props = JSON.stringify(model.reactComponent.props);
  window.oc = window.oc || {};
  window.oc.__typescriptReactTemplate = window.oc.__typescriptReactTemplate || { count: 0 };
  var count = window.oc.__typescriptReactTemplate.count;
  var templateId = "${reactRoot}-" + count;
  window.oc.__typescriptReactTemplate.count++;
  return '<div id="' + templateId + '" class="${reactRoot}"></div>' +
    '<script>' +
    'window.oc = window.oc || {};' +
    'oc.cmd = oc.cmd || [];' +
    'oc.cmd.push(function (oc) {' +
      'oc.require(' +
        '["oc", "reactComponents", "${bundleHash}"],' + 
        '"' + staticPath + '${bundleName}.js",' +
        'function(ReactComponent){' +
          'var targetNode = document.getElementById("' + templateId + '");' +
          'targetNode.setAttribute("id","");' +
          'ReactDOM.render(React.createElement(ReactComponent,' +  props + '),targetNode);' +
        '}' +
      ');' +
    '});' +
  '</script>'
}`;
}
