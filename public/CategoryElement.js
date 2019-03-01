import Series from './SeriesElement';

class CategoryElement {
  constructor() {
    this.categoryName = null;
    this.seriesDatas = null;
  }

  setValue(CategroyName, SeriesData) {
    this.categoryName = CategroyName;
    this.seriesDatas = SeriesData;
  }

  setSeriesValue(SeriesData) {
    this.seriesDatas = SeriesData;
  }

  getCategoryName() {
    return this.categoryName;
  }

  getSeriesDatas() {
    return this.seriesDatas;
  }
}

export default CategoryElement;
