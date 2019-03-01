import './boxplot.less';
import './boxplot_vis_params';
import {VisFactoryProvider} from 'ui/vis/vis_factory';
import {CATEGORY} from 'ui/vis/vis_category';
import {Schemas} from 'ui/vis/editors/default/schemas';
import {BoxPlotVisualization} from './boxplot_visualization';
import {VisTypesRegistryProvider} from 'ui/registry/vis_types';
import image from './images/icon_boxplot.svg';
import {Status} from 'ui/vis/update_status';

VisTypesRegistryProvider.register(function (Private) {

  const VisFactory = Private(VisFactoryProvider);

  return VisFactory.createBaseVisualization({
    name: 'boxplot',
    title: 'BoxPlot Chart',
    image,
    description: 'BoxPlot chart is a method for graphically depicting groups of numerical data through their quartiles',
    category: CATEGORY.BASIC,
    // stage: 'lab',
    visConfig: {
      defaults: {
        colorSchema: 'Default',
        reverseColor: false,
        addTooltip: false,
        showLabel: true,
        defaultOrder: true
      }
    },
    requiresUpdateStatus: [Status.PARAMS, Status.RESIZE, Status.DATA],
    visualization: BoxPlotVisualization,
    responseHandler: 'tabify',
    editorConfig: {
      collections: {
        colorSchemas: ['Default', 'Roma', 'Vintage', 'Dark', 'Infographic', 'Shine', 'Macarons'],
      },
      optionsTemplate: '<boxplot-vis-params></boxplot-vis-params>',
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'BoxPlotValue',
          min: 1,
          max: 1,
          aggFilter: ['boxplot'],
          defaults: [
            {schema: 'metric', type: 'boxplot'}
          ]
        },
        {
          group: 'buckets',
          name: 'x-coord',
          title: 'X-Coord',
          min: 1,
          max: 2,
          aggFilter: ['terms', 'date_histogram']
        },
      ])
    }
  });
});
