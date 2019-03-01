class BoxPlotElement {
  constructor(minV, q1V, medianV, q3V, maxV) {
    this.MIN = minV;
    this.MAX = maxV;
    this.Q1 = q1V;
    this.MEDIAN = medianV;
    this.Q3 = q3V;
    this.LIMIT = this.setLimit(1.5);
    this.OUTLIER = this.setOutlier();
    // this.LABEL = lableStr;
  }

// Returns a function to compute the interquartile range.
  setLimit(k) {
    let iqr = (this.Q3 - this.Q1) * k;
    return [Math.max(this.MIN, this.Q1 - iqr), Math.min(this.MAX, this.Q3 + iqr)];
  }

// Returns a function to compute the outlier range.
  setOutlier() {
    return [this.MIN < this.LIMIT[0] ? this.MIN : null,
      this.MAX > this.LIMIT[1] ? this.MAX : null];
  }

  getQuartileData() {
    return [this.Q1, this.MEDIAN, this.Q3];
  }

  getWhiskerData() {
    return this.LIMIT;
  }

  getOutlierData() {
    return this.OUTLIER;
  }

  getBoxplotData() {
    return [this.LIMIT[0], this.Q1, this.MEDIAN, this.Q3, this.LIMIT[1]];
  }

  getToolTipHtml() {
    let body = [];
    // body.push(this.LABEL);
    body.push("Max:\t" + this.formatNum(this.MAX));
    body.push("Outlier_H:\t" + this.formatNum(this.LIMIT[1]));
    body.push("Q3:\t" + this.formatNum(this.Q3));
    body.push("Median:\t" + this.formatNum(this.MEDIAN));
    body.push("Q1:\t" + this.formatNum(this.Q1));
    body.push("Outlier_L:\t" + this.formatNum(this.LIMIT[0]));
    body.push("Min:\t" + this.formatNum(this.MIN));
    return body.join("<br/>");
  }

  formatNum(num) {
    if (num !== null) {
      if ((Math.abs(num) * 1000000 >= 0.001 && Math.abs(num) * 1000000 <= 1000) || Math.abs(num) >= 1000) {
        return num.toExponential(4);
      } else {
        return Math.round(num) === num ? num : num.toFixed(4);
      }
    }
  }

}

export default BoxPlotElement
