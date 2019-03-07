import * as timeFormat from 'd3-time-format';
import BoxPlot from './BoxPlotElement';
import chart from 'echarts';
import Series from './SeriesElement';
import Category from './CategoryElement';
import './theme/vintage';
import './theme/dark';
import './theme/roma';
import './theme/shine';
import './theme/infographic';
import './theme/macarons';


export class BoxPlotVisualization {

  constructor(node, vis) {

    this._vis = vis;
    this._dom = node;
    this._mychart = chart.init(this._dom, this.getThemeStyle());
    this._option = {};


  }

  async render(data, status) {

    this._isEmptyData = !(data && data.tables.length);

    if ((!this._isEmptyData)) {
      if (status.data || status.resize || status.params) {
        if (status.data) {
          this.generate(data);
        }
        if (status.params) {
          this.updateTheme();
        }
        // console.log(JSON.stringify(this._option));
        this._mychart.setOption(this._option);
        this._mychart.resize();
      }
    }

  }


  updateTheme() {
    this.destroy();
    this._mychart = chart.init(this._dom, this.getThemeStyle());
  }

  generate(RawData) {
    this._mychart.clear();
    this.initOptionSet();

    const level = this._vis.aggs.raw.length - 1;
    const table = RawData.tables[0];
    this._option.xAxis.name = getTitle(RawData.tables[0].columns[0]);


    switch (level) {
      case 1:
        const seriesData = new Series();
        table.rows.forEach(function (d) {
          console.log(d, RawData.tables[0].columns[0]);
          const seriesKey = getString(d[0], RawData.tables[0].columns[0]);
          const box = new BoxPlot(d[1], d[2], d[3], d[4], d[5]);
          seriesData.setAxisData(seriesKey);
          seriesData.setBoxData(box.getBoxplotData());
          box.getOutlierData().forEach(function (outlier) {
            if (outlier !== null) {
              seriesData.setOutLiers(seriesKey, outlier);
            }
          });
        });
        this._option.xAxis.data = seriesData.getAxisData();
        this._option.series = [
          {
            type: 'boxplot',
            data: seriesData.getBoxData(),
            tooltip: { formatter: formatter }
          },
          {
            type: 'pictorialBar',
            symbolPosition: 'end',
            symbolSize: 8,
            symbolOffset: [0, '-50%'],
            barGap: '35%',
            data: seriesData.getOutLiers()
          }
        ];
        break;
      case 2:
        const category = [];
        const legendName = getTitle(RawData.tables[0].columns[1]);

        // loading raw data
        table.rows.forEach(function (d) {
          const seriesKey = getString(d[0], RawData.tables[0].columns[0]);
          const categoryKey = getString(d[1], RawData.tables[0].columns[1]);
          const box = new BoxPlot(d[2], d[3], d[4], d[5], d[6]);

          if (category.length === 0) {
            const seriesData = new Series();
            const categoryData = new Category();
            seriesData.setAxisData(seriesKey);
            seriesData.setBoxData(box.getBoxplotData());
            box.getOutlierData().forEach(function (outlier) {
              if (outlier !== null) {
                seriesData.setOutLiers(seriesKey, outlier);
              }
            });
            categoryData.setValue(categoryKey, seriesData);
            category.push(categoryData);
          } else {
            const cIndex = getCategoryIndex(category, categoryKey);
            if (cIndex === -1) {
              const seriesData = new Series();
              const categoryData = new Category();
              seriesData.setAxisData(seriesKey);
              seriesData.setBoxData(box.getBoxplotData());
              box.getOutlierData().forEach(function (outlier) {
                if (outlier !== null) {
                  seriesData.setOutLiers(seriesKey, outlier);
                }
              });
              categoryData.setValue(categoryKey, seriesData);
              category.push(categoryData);
            } else {
              const seriesData = category[cIndex].getSeriesDatas();
              seriesData.setAxisData(seriesKey);
              seriesData.setBoxData(box.getBoxplotData());
              box.getOutlierData().forEach(function (outlier) {
                if (outlier !== null) {
                  seriesData.setOutLiers(seriesKey, outlier);
                }
              });
              category[cIndex].setSeriesValue(seriesData);
            }
          }
        });
        // prepare data
        this.prepareData(category);

        // need sort raw data in case the category value is date
        if (RawData.tables[0].columns[1].aggConfig.__type.name === 'date_histogram') {
          category.sort(function (a, b) {
            return (new Date(a.getCategoryName()) - new Date(b.getCategoryName()));
          });
        }

        // plot chart
        // init XAxis data
        this._option.xAxis.data = category[0].getSeriesDatas().getAxisData();

        // init boxplot data
        category.forEach(function (c) {
          this._option.series.push(
            {
              name: c.getCategoryName(),
              type: 'boxplot',
              data: c.getSeriesDatas().getBoxData(),
              tooltip: { formatter: formatter }
            }
          );
        }, this);

        // init outlier data
        category.forEach(function (c) {
          this._option.series.push({
            name: c.getCategoryName(),
            type: 'pictorialBar',
            symbolPosition: 'end',
            symbolOffset: [0, '-50%'],
            symbolSize: 8,
            barGap: '35%',
            data: c.getSeriesDatas().getOutLiers()
          });
        }, this);

        // init legend data
        this._option.legend.data = category.map(function (c) {
          return c.getCategoryName();
        });
        this._option.legend.formatter = legendName + ': {name}';
        break;
    }
  }

  prepareData(Category) {
    const axisDataAll = [];
    let seriesDataCnt = 0;
    Category.forEach(function (c) {
      c.getSeriesDatas().getAxisData().forEach(function (d) {
        if (axisDataAll.indexOf(d) === -1) {
          axisDataAll.push(d);
        }
      });
      seriesDataCnt += c.getSeriesDatas().getAxisData().length;
    });
    if (Category.length * axisDataAll.length !== seriesDataCnt) {
      for (const c in Category) {
        if (axisDataAll.length !== Category[c].getSeriesDatas().getAxisData().length) {
          const MismatchedAxisData = Category[c].getSeriesDatas().getAxisData();
          const MismatchedBoxData = Category[c].getSeriesDatas().getBoxData();
          for (const d in axisDataAll) {
            if (MismatchedAxisData.indexOf(axisDataAll[d]) === -1) {
              // insert empty data & make sure series data is matched with axis data
              MismatchedAxisData.splice(d, 0, axisDataAll[d]);
              MismatchedBoxData.splice(d, 0, []);
            }
          }
        }
      }
    }
  }

  initOptionSet() {
    this._option = {
      title: [
        {
          left: 'auto'
        },
        {
          text: 'upper: MIN [Q3 + 1.5 * IQR, MAXIMUM]; lower: MAX [Q1 - 1.5 * IQR, MINIMUM]',
          borderColor: '#999',
          borderWidth: 1,
          textStyle: {
            fontSize: 11
          },
          left: '10%',
          top: '95%'
        }],

      legend: {
        left: '10%',
        width: '80%'
      },

      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          // dataView: {show: true, readOnly: true},
          restore: {},
          saveAsImage: {}
        }
      },

      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          realtime: false,
          start: 0,
          end: 50
        },
        {
          show: true,
          height: '5%',
          type: 'slider',
          top: '90%',
          xAxisIndex: 0,
          showDataShadow: 'auto',
          realtime: true,
          start: 0,
          end: 50
        }
      ],

      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      },

      grid: {
        left: '10%',
        right: '10%',
        top: '10%',
        bottom: '15%',
        width: 'auto',
        height: 'auto'
      },

      yAxis: {
        type: 'value',
      },

      xAxis: {
        type: 'category',
        data: [],
        boundaryGap: true,
        splitArea: {
          show: true,
          interval: 0
        },
        axisLabel: {
          formatter: function (value) {
            return value;
          },
          interval: 0
        },
        nameLocation: 'center',
        nameGap: 20,
        splitLine: {
          show: false
        },
        nameTextStyle: {
          fontSize: 16
        }
      },

      series: []
    };


  }

  destroy() {
    this._mychart.clear();
    this._mychart.dispose();
  }

  getThemeStyle() {
    switch (this._vis.params.colorSchema) {
      case 'Roma':
        return 'roma';
      case 'Vintage':
        return 'vintage';
      case 'Dark':
        return 'dark';
      case 'Infographic':
        return 'infographic';
      case 'Shine':
        return 'shine';
      case 'Macarons':
        return 'Macarons';
      default:
        return '';
    }
  }
}

function getString(Str, Obj) {
  let format = timeFormat.timeFormat('%Y-%m-%d %H:00');
  switch (Obj.aggConfig.__type.name) {
    case 'date_histogram':
      if (Obj.title.match('month')) {
        format = timeFormat.timeFormat('%YM%m');
        return format(new Date(Str));
      } else {
        if (Obj.title.match('week')) {
          const weekNum = timeFormat.timeFormat('%V')(new Date(Str));
          console.log(weekNum, 'by week');
          format = timeFormat.timeFormat('%YWW' + weekNum);
          return format(new Date(Str));
        } else {
          if (Obj.title.match('day')) {
            format = timeFormat.timeFormat('%Y-%m-%d');
            return format(new Date(Str));
          } else {
            return format(new Date(Str));
          }
        }
      }
    default:
      return Str;
  }
}

function getTitle(Obj) {
  const objType = Obj.aggConfig.__type.name;
  switch (objType) {
    case 'date_histogram':
      return Obj.title.split(' ')[0];
    default:
      return Obj.title.split(':')[0];
  }
}

function formatter(param) {
  // console.log(param);
  if (param.seriesName.indexOf('series') === 0) {
    return [
      param.name + ': ',
      'upper: ' + param.data[5],
      'Q3: ' + param.data[4],
      'median: ' + param.data[3],
      'Q1: ' + param.data[2],
      'lower: ' + param.data[1]
    ].join('<br/>');

  } else {
    return [
      param.seriesName + '',
      param.name + ': ',
      'upper: ' + param.data[5],
      'Q3: ' + param.data[4],
      'median: ' + param.data[3],
      'Q1: ' + param.data[2],
      'lower: ' + param.data[1]
    ].join('<br/>');

  }
}

function getCategoryIndex(Category, CategoryName) {
  for (const c in Category) {
    if (Category[c].getCategoryName() === CategoryName) {
      return c;
    }
  }
  return -1;
}
