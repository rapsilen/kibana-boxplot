'use strict';
import React from 'react';
import d3 from "d3";
import boxPlot from './BoxPlotElement';
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
    // console.log(this._vis.params);
    this._mychart = chart.init(this._dom, this.getThemeStyle());
    this._opition = {};


  }

  async render(data, status) {

    this._isEmptyData = !(data && data.tables.length);

    // var echart_data = this.generate(data);

    this._tableCnt = data.tables.length;
    if ((!this._isEmptyData)) {
      if (status.params) {
        if (this._vis.params.defaultOrder) {
          this._vis.aggs.forEach(function (d) {
            if (d.__type.name === 'terms') {
              // default setting for terms
              d.params.order.val = 'desc';
              d.params.orderBy = '1.100';
            }
          })
        }
      }

      if (status.data || status.resize || status.params) {
        if (status.data) {
          this.generate(data);
        }
        if (status.params) {
          this.updateTheme();
        }
        this._mychart.setOption(this._opition);
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
    this.initOpitionSet();

    let level = this._vis.aggs.raw.length - 1;
    let dataConfig = this._vis.aggs.raw;
    let table = RawData.tables[0];

    switch (level) {
      case 1:
        let seriesData = new Series();
        table.rows.forEach(function (d) {
          let seriesKey = getString(d[0], dataConfig[1].__type.name);
          let box = new boxPlot(d[1], d[2], d[3], d[4], d[5]);
          seriesData.setAxisData(seriesKey);
          seriesData.setBoxData(box.getBoxplotData());
          box.getOutlierData().forEach(function (outlier) {
            if (outlier !== null) {
              seriesData.setOutLiers(seriesKey, outlier);
            }
          });
        });
        this._opition.xAxis.data = seriesData.getAxisData();
        this._opition.series = [
          {
            type: "boxplot",
            data: seriesData.getBoxData(),
            tooltip: {formatter: formatter}
          },
          {
            type: 'pictorialBar',
            symbolPosition: 'end',
            symbolSize: 8,
            barGap: '35%',
            data: seriesData.getOutLiers()
          }
        ];
        break;
      case 2:
        let category = [];


        table.rows.forEach(function (d) {
          let seriesKey = getString(d[0], dataConfig[1].__type.name);
          let categoryKey = getString(d[1], dataConfig[2].__type.name);
          let box = new boxPlot(d[2], d[3], d[4], d[5], d[6]);

          if (category.length === 0) {
            let seriesData = new Series();
            let categoryData = new Category();
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
            let c_index = getCategoryIndex(category, categoryKey);
            if (c_index === -1) {
              let seriesData = new Series();
              let categoryData = new Category();
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
              let seriesData = category[c_index].getSeriesDatas();
              seriesData.setAxisData(seriesKey);
              seriesData.setBoxData(box.getBoxplotData());
              box.getOutlierData().forEach(function (outlier) {
                if (outlier !== null) {
                  seriesData.setOutLiers(seriesKey, outlier);
                }
              });
              category[c_index].setSeriesValue(seriesData);
            }
          }
        });
        // prepare data
        this.prepareData(category);

        // plot chart
        // init XAxis data
        this._opition.xAxis.data = category[0].getSeriesDatas().getAxisData();

        // init boxplot data
        category.forEach(function (c) {
          this._opition.series.push(
            {
              name: c.getCategoryName(),
              type: "boxplot",
              data: c.getSeriesDatas().getBoxData(),
              tooltip: {formatter: formatter}
            }
          );
        }, this);

        // init outlier data
        category.forEach(function (c) {
          this._opition.series.push({
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
        this._opition.legend.data = category.map(function (c) {
          return c.getCategoryName();
        });
        break;
    }
  }

  prepareData(Category) {
    let axisDataMax = [], seriesDataCnt = 0;
    Category.forEach(function (c) {
      if (axisDataMax.length < c.getSeriesDatas().getAxisData().length) {
        axisDataMax = c.getSeriesDatas().getAxisData();
      }
      seriesDataCnt += c.getSeriesDatas().getAxisData().length;
    });
    if (Category.length * axisDataMax.length !== seriesDataCnt) {
      for (let c in Category) {
        if (axisDataMax.length !== Category[c].getSeriesDatas().getAxisData().length) {
          let MismatchedAxisData = Category[c].getSeriesDatas().getAxisData();
          let MismatchedBoxData = Category[c].getSeriesDatas().getBoxData();
          for (let d in axisDataMax) {
            if (MismatchedAxisData.indexOf(axisDataMax[d]) === -1) {
              // insert empty data & make sure series data is matched with axis data
              MismatchedAxisData.splice(d, 0, axisDataMax[d]);
              MismatchedBoxData.splice(d, 0, []);
            }
          }
        }
      }
    }
  }

  initOpitionSet() {
    this._opition = {
      title: [
        {
          // text: "Michelson-Morley Experiment",
          left: "auto"
        },
        {
          text: "upper: MIN [Q3 + 1.5 * IQR, MAXIMUM]; lower: MAX [Q1 - 1.5 * IQR, MINIMUM]",
          borderColor: "#999",
          borderWidth: 1,
          textStyle: {
            fontSize: 11
          },
          left: "10%",
          top: "95%"
        }],

      legend: {
        // y: '10%',
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
        trigger: "item",
        axisPointer: {
          type: "shadow"
        }
      },

      grid: {
        left: "10%",
        right: "10%",
        bottom: "15%",
        width: "auto",
        height: "auto"
      },

      yAxis: {
        type: "value",
      },

      xAxis: {
        type: "category",
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
        splitLine: {
          show: false
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
      case "Roma":
        return 'roma';
      case "Vintage":
        return 'vintage';
      case "Dark":
        return 'dark';
      case "Infographic":
        return 'infographic';
      case "Shine":
        return 'shine';
      case "Macarons":
        return 'Macarons';
      default:
        return '';
    }
  }
}

function getString(Str, StrType) {
  let format = d3.time.format("%Y-%m-%d %H:00");
  switch (StrType) {
    case "date_histogram":
      return format(new Date(Str));
    default:
      return Str;
  }
}


function formatter(param) {
  // console.log(param);
  if (param.seriesName.indexOf("series") === 0) {
    return [
      param.name + ": ",
      "upper: " + param.data[5],
      "Q3: " + param.data[4],
      "median: " + param.data[3],
      "Q1: " + param.data[2],
      "lower: " + param.data[1]
    ].join("<br/>");

  } else {
    return [
      param.seriesName + "",
      param.name + ": ",
      "upper: " + param.data[5],
      "Q3: " + param.data[4],
      "median: " + param.data[3],
      "Q1: " + param.data[2],
      "lower: " + param.data[1]
    ].join("<br/>");

  }
}

function getCategoryIndex(Category, CategoryName) {
  for (let c in Category) {
    if (Category[c].getCategoryName() === CategoryName) {
      return c;
    }
  }
  return -1;
}
