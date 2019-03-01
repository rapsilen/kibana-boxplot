class SeriesElement {
  constructor() {
    this.axisData = [];
    this.boxData = [];
    this.outliers = [];
  }

  setAxisData(seriesName) {
    this.axisData.push(seriesName);
  }

  setBoxData(boxData) {
    this.boxData.push(boxData);
  }

  setOutLiers(AxisLabel, outLiers) {
    this.outliers.push([AxisLabel, outLiers]);
  }

  getAxisData() {
    return this.axisData;
  }

  getBoxData() {
    return this.boxData;
  }

  getOutLiers() {
    return this.outliers;
  }

}

export default SeriesElement;
