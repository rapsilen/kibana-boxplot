# boxplot
**[Notice Before Use]:**
1. This plugin need modify a src file of Kibana:  src/ui/public/agg_types/index.js 

import { bucketMaxMetricAgg } from './metrics/bucket_max';  
import { boxplotMetricAgg } from './metrics/boxplot';

const aggs = {  
   metrics: [  
@@ -74,7 +75,8 @@ const aggs = {  
bucketMinMetricAgg,
bucketMaxMetricAgg,
  geoBoundsMetricAgg,
  geoCentroidMetricAgg,
     boxplotMetricAgg  
   ],  
   buckets: [  
    dateHistogramBucketAgg,  

2. Add boxplot.js in 'src/ui/public/agg_types/metrics/'  
  import { ordinalSuffix } from '../../utils/ordinal_suffix';  
import '../../number_list';  
import { MetricAggType } from './metric_agg_type';  
import { getResponseAggConfigClass } from './get_response_agg_config_class';  
import { getPercentileValue } from './percentiles_get_value';
 const valueProps = {  
   makeLabel: function () {  
     const label = this.params.customLabel || this.getFieldDisplayName();  
     return ordinalSuffix(this.key) + ' percentile of ' + label;  
   }  
 };  
 export const boxplotMetricAgg = new MetricAggType({  
   name: 'boxplot',  
   dslName: 'percentiles',  
   title: 'BoxPlot',  
   makeLabel: function (agg) {  
     return 'BP of ' + agg.getFieldDisplayName();  
   },  
   params: [  
     {  
       name: 'field',  
       filterFieldTypes: 'number'  
     },  
     {  
       name: 'percents',  
       default: [0, 25, 50, 75, 100]  
     },  
     {  
       name: 'tdigest',  
       default: { compression: 2000 }  
     },  
     {  
       write(agg, output) {  
         output.params.keyed = false;  
       }  
     }  
   ],  
   getResponseAggs: function (agg) {  
     const ValueAggConfig = getResponseAggConfigClass(agg, valueProps);  
     return agg.params.percents.map(function (percent) {  
       return new ValueAggConfig(percent);  
     });  
   },  
   getValue: getPercentileValue  
});  

It will be great appreciate if some one might tell me how the register a metrics aggregation without modify the source code.




> boxplot

---

## development

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) for instructions setting up your development environment. Once you have completed that, use the following yarn scripts.

  - `yarn kbn bootstrap`

    Install dependencies and crosslink Kibana and all projects/plugins.

    > ***IMPORTANT:*** Use this script instead of `yarn` to install dependencies when switching branches, and re-run it whenever your dependencies change.

  - `yarn start`

    Start kibana and have it include this plugin. You can pass any arguments that you would normally send to `bin/kibana`

      ```
      yarn start --elasticsearch.url http://localhost:9220
      ```

  - `yarn build`

    Build a distributable archive of your plugin.

  - `yarn test:browser`

    Run the browser tests in a real web browser.

  - `yarn test:server`

    Run the server tests using mocha.

For more information about any of these commands run `yarn ${task} --help`. For a full list of tasks checkout the `package.json` file, or run `yarn run`.
