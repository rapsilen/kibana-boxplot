export default function (kibana) {

  return new kibana.Plugin({
    name: 'boxplot',
    uiExports: {
      visTypes: ['plugins/boxplot/boxplot_vis']
    }
  });
}
