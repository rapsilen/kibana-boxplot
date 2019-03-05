import { uiModules } from 'ui/modules';
import boxPlotVisParamsTemplate from './boxplot_vis_params.html';

uiModules.get('kibana/table_vis')
  .directive('boxplotVisParams', function () {
    return {
      restrict: 'E',
      template: boxPlotVisParamsTemplate,
      link: function ($scope, $element) {
        $scope.config = $scope.vis.type.editorConfig;
      }
    };
  });
