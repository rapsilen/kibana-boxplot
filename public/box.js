import boxPlot from './BoxPlotElement';
import d3 from "d3";

export default (function () {

// Inspired by http://informationandvisualization.de/blog/box-plot
  d3.box = function () {
    let width = 1,
      height = 1,
      domain = null,
      value = Number,
      showLabels = null, // whether or not to show text labels
      tickFormat = null,
      toolTips = null
    ;


    // For each small multiple…
    function box(g) {
      g.each(function (data, i) {

        let n = data.length, g = d3.select(this);

        let boxValue = new boxPlot(data[n - 5], data[n - 4], data[n - 3], data[n - 2], data[n - 1]);
        let min = boxValue.MIN, max = boxValue.MAX;

        // Compute the new x-scale.
        let x1 = d3.scale.linear()
          .domain(domain && domain.call(this, data, i) || [min, max])
          .range([height, 0]);


        // Note: the box, median, and box tick elements are fixed in number,
        // so we only have to handle enter and update. In contrast, the outliers
        // and other elements are letiable, so we need to exit them! letiable
        // elements also fade in and out.
        // Update center line: the vertical line spanning the whiskers.
        let center = g.selectAll("line.center")
          .data([boxValue.getWhiskerData()]);

        //vertical line
        center.enter().insert("line", "rect")
          .attr("class", "center")
          .attr("x1", width / 2)
          .attr("y1", function (d) {
            return x1(d[0]);
          })
          .attr("x2", width / 2)
          .attr("y2", function (d) {
            return x1(d[1]);
          })
          .style("opacity", 1)
        ;


        // Update innerquartile box.
        let box = g.selectAll("rect.box")
          .data([boxValue.getQuartileData()]);

        box.enter().append("rect")
          .attr("class", "box")
          .attr("x", 0)
          .attr("y", function (d) {
            return x1(d[2]);
          })
          .attr("width", width)
          .attr("height", function (d) {
            return x1(d[0]) - x1(d[2]);
          })
        ;


        // Update median line.
        let medianLine = g.selectAll("line.median")
          .data([boxValue.MEDIAN]);

        medianLine.enter().append("line")
          .attr("class", "median")
          .attr("x1", 0)
          .attr("y1", x1)
          .attr("x2", width)
          .attr("y2", x1)
        ;

        // Update whiskers line.
        let whisker = g.selectAll("line.whisker")
          .data(boxValue.getWhiskerData());

        whisker.enter().insert("line", "circle, text")
          .attr("class", "whisker")
          .attr("x1", 0)
          .attr("y1", x1)
          .attr("x2", width)
          .attr("y2", x1)
          .style("opacity", 0.6)
        ;



        // Update box ticks.
        let boxTick = g.selectAll("text.box")
          .data(boxValue.getQuartileData());

        if (showLabels === true) {
          boxTick.enter().append("text")
            .attr("class", "box")
            .attr("dy", ".4em")
            .attr("dx", function (d, i) {
              return i & 1 ? 8 : -8
            })
            .attr("x", function (d, i) {
              return i & 1 ? +width : 0
            })
            .attr("text-anchor", function (d, i) {
              return i & 1 ? "start" : "end";
            })
            .text(function (d) {
              return formatNum(d);
            })
            .attr("y", x1);
        }


        // Update whisker ticks. These are handled separately from the box
        // ticks because they may or may not exist, and we want don't want
        // to join box ticks pre-transition with whisker ticks post-.
        let whiskerTick = g.selectAll("text.whisker")
          .data(boxValue.getWhiskerData() || []);
        if (showLabels === true) {
          whiskerTick.enter().append("text")
            .attr("class", "whisker")
            .attr("dy", ".4em")
            .attr("dx", 6)
            .attr("x", width)
            .attr("y", x1)
            .text(function (d) {
              return formatNum(d);
            })
            .style("opacity", 1)
          ;
        }


        // Update outliers.
        let outlier = g.selectAll("circle.outlier")
          .data(boxValue.getOutlierData());
        outlier.enter().insert("circle", "text")
          .attr("class", "outlier")
          .attr("r", 4)
          .attr("cx", width / 2)
          .attr("cy", x1)
          .style("opacity", function (i) {
            if (i !== null) {
              return 1;
            } else {
              return 0;
            }
          });


        let outlierTick = g.selectAll("text.outlier")
          .data(boxValue.getOutlierData());
        if (showLabels === true) {
          outlierTick.enter().append("text")
            .attr("class", "outlier")
            .attr("dy", ".4em")
            .attr("dx", 6)
            .attr("x", width)
            .text(function (d) {
              return formatNum(d);
            })
            .attr("y", x1)
            .style("opacity", function (i) {
              if (i !== null) {
                return 1;
              } else {
                return 0;
              }
            });
        }


      });
      d3.timer.flush();
    }

    box.width = function (x) {
      if (!arguments.length) return width;
      width = x;
      return box;
    };

    box.height = function (x) {
      if (!arguments.length) return height;
      height = x;
      return box;
    };

    box.tickFormat = function (x) {
      if (!arguments.length) return tickFormat;
      tickFormat = x;
      return box;
    };

    box.domain = function (x) {
      if (!arguments.length) return domain;
      domain = x == null ? x : d3.functor(x);
      return box;
    };

    box.value = function (x) {
      if (!arguments.length) return value;
      value = x;
      return box;
    };

    box.SetShowLabels = function (x) {
      if (!arguments.length) return showLabels;
      showLabels = x;
      return box;
    };

    box.toolTips = function (x) {
      if (!arguments.length) return toolTips;
      toolTips = x;
      return box;
    };

    return box;
  };

})();

function formatNum(num) {
  if (num !== null) {
    if ((Math.abs(num) * 1000000 >= 0.001 && Math.abs(num) * 1000000 <= 1000) || Math.abs(num) >= 1000) {
      return num.toExponential(4);
    } else {
      return Math.round(num) === num ? num : num.toFixed(4);
    }
  }
}
