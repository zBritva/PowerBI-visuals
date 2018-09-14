/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ''Software''), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import legend = powerbi.extensibility.utils.chart.legend;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import position = powerbi.extensibility.utils.chart.legend.positionChartArea;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import legendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    const rangeLiteral: string = `range s`;
    let legendData: LegendData;
    // flag to check whether categorical data exists or not
    let categoryFlag: number = 0;
    // to check drill mode
    let prevFlag: number;
    prevFlag = 0;
    // to display data of particular region
    let tooltipFLag: number;
    tooltipFLag = 0;
    let individualFlag: number;
    individualFlag = 0;
    let selectedKey: string = '';
    // selectionId to render visual according to selection
    let tempSelectionId: powerbi.extensibility.ISelectionId;
    tempSelectionId = null;
    let uniqueValuesLegend: PrimitiveValue[];
    let dataPoints: IDataPoints[];
    let staticHost: IVisualHost;
    let legendLength: number;
    legendLength = 0;
    let actualValue: number[];
    actualValue = [];
    let categoryLegend: ICategorySettings[];
    let linearDataPoint: ILinearDataPoint[];
    let tooltip : ITooltip[];
    tooltip = [];
    let tooltipPoint: ITooltipData[];
    tooltipPoint = [];
    // objects to handle showtrend toggle
    let showTrendStatus: boolean = true;
    let trendLabelFlag: boolean = false;
    // objects to store height of htmlelements
    let trendLabelHeight: number;
    let targetLabelHeight: number;
    export interface ILinearGauge {
        states: number[];
        value: number;
        target: number;
        actual: number;
        scale: number[];
        min: number;
        minFlag: boolean;
        minColName: string;
        minFormat: string;
        max: number;
        maxFlag: boolean;
        maxColName: string;
        maxFormat: string;
        trendValueOne: number;
        trendValueTwo: number;
        actualFormat: string;
        scaleFormat: string;
        targetFormat: string;
        trend1Format: string;
        trend2Format: string;
        targetSet: boolean;
        trend1Exists: boolean;
        trend2Exists: boolean;
        actualExists: boolean;
        targetExists: boolean;
        actualColName: string;
        targetColName: string;
        trend1ColName: string;
        trend2ColName: string;
        best: number;
        bestSet: boolean;
        bestFormat: string;
        bestColName: string;
    }
    interface ITooltip {
        tooltipDataPoint: ITooltipData[];
    }
    interface ITooltipData {
        displayName: string;
        value: string;
    }

    interface ICategorySettings {
        key: string;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
    }

    interface IDataPoints {
        flag: number;
        key: string;
        selector: powerbi.visuals.ISelectionId;
    }
    interface ILinearDataPoint {
        key: string;
        targetValue: number;
        actualValue: number;
        minValue: number;
        maxValue: number;
        trendOne: number;
        trendTwo: number;
        BestValue: number;
        selectionId: powerbi.extensibility.ISelectionId;
    }
    export class LinearGauge implements IVisual {
        private host: IVisualHost;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private prevDataViewObjects: DataViewObjects = {};
        // tslint:disable-next-line:no-any
        private settings: any;
        private svg: d3.Selection<SVGElement>;
        // tslint:disable-next-line:no-any
        private rootElement: any;
        private svgLinear: d3.Selection<SVGElement>;
        private svgLinearNext: d3.Selection<SVGElement>;
        private actual: d3.Selection<SVGElement>;
        private percentage: d3.Selection<SVGElement>;
        private dataView: DataView;
        private data: ILinearGauge;
        private trendValue1: d3.Selection<SVGElement>;
        private trendValue2: d3.Selection<SVGElement>;
        private bestLegend: d3.Selection<SVGElement>;
        private targetLegend: d3.Selection<SVGElement>;
        private colorsGlobal: string[];
        private legend: ILegend;
        private selectionManager: ISelectionManager;
        // flag to determine a selection is set from bookmark or not
        private roscCallFlag: boolean = false;
        private visualOptions: VisualUpdateOptions;

        //private categoryLegend: ICategorySettings[];
        public static getDefaultData(): ILinearGauge {
            return {
                states: [],
                min: null,
                minFlag: false,
                minColName: '',
                minFormat: '',
                max: null,
                maxFlag: false,
                maxColName: '',
                maxFormat: '',
                value: 0,
                target: null,
                actual: null,
                scale: [],
                trendValueOne: 0,
                trendValueTwo: 0,
                actualFormat: ``,
                scaleFormat: ``,
                targetFormat: ``,
                trend1Format: ``,
                trend2Format: ``,
                targetSet: false,
                trend1Exists: false,
                trend2Exists: false,
                actualExists: false,
                targetExists: false,
                trend1ColName: '',
                trend2ColName: '',
                actualColName: '',
                targetColName: '',
                best: null,
                bestSet: false,
                bestFormat: '',
                bestColName: ''
            };
        }
        public static getDefaultDataPoint(): ILinearDataPoint {
            return {
                key: '',
                targetValue: 0,
                actualValue: 0,
                minValue: 0,
                maxValue: 0,
                trendOne: 0,
                trendTwo: 0,
                BestValue: 0,
                selectionId: null
            };
        }
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            staticHost = options.host;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.legend = createLegend(options.element, false, null, true);
            this.selectionManager = options.host.createSelectionManager();
            // function used when bookmark is clicked
            this.selectionManager.registerOnSelectCallback(() => {
                this.roscCallFlag = true;
                this.update(this.visualOptions);
            });
            d3.select(options.element)
                .style({
                    cursor: 'default'
                });
            this.rootElement = d3.select(options.element);
            this.svg = d3.select(options.element)
                .append(`div`)
                .classed(`lg_legend_tab`, true);
            this.targetLegend = this.svg
                .append(`div`)
                .classed(`lg_legend_target`, true);
            this.bestLegend = this.svg
                .append(`div`)
                .classed(`lg_legend_best`, true);

            this.svg = d3.select(options.element)
                .append(`div`)
                .classed(`lg_imagetab`, true);
            this.svgLinear = this.svg
                .append(`div`);
            this.svgLinearNext = this.svg
                .append(`div`);
            this.trendValue1 = this.svgLinear
                .append(`div`)
                .classed(`lg_trendvalue1`, true);
            this.trendValue2 = this.svgLinearNext
                .append(`div`)
                .classed(`lg_trendvalue2`, true);

            this.svg = d3.select(options.element)
                .append(`div`)
                .classed(`lg_data_tab`, true);
            this.actual = this.svg
                .append(`text`)
                .classed(`lg_data_total`, true)
                .text(``);
            this.percentage = this.svg
                .append(`text`)
                .classed(`lg_data_percentage`, true)
                .text(``);
            this.svg = d3.select(options.element)
                .append(`svg`)
                .classed(`linearSVG`, true);
            this.svgLinear = this.svg
                .append(`g`)
                .classed('lg_visual', true);
        }
        //Convert the this.dataViews into its view model
        //All the variable will be populated with the value we have passed
        // tslint:disable-next-line:cyclomatic-complexity
        public converter(dataView: DataView, options: VisualUpdateOptions): ILinearGauge {
            let $this: this;
            // flag used to clear selections if drill used
            let clearFlag: boolean = true;
            $this = this;
            tooltipFLag = 0;
            let data: ILinearGauge;
            data = LinearGauge.getDefaultData();
            linearDataPoint = [];
            $this.getSettings(this.dataView.metadata.objects);
            dataPoints = [];
            if (!dataView || !dataView.categorical || dataView.categorical.values === undefined) {
                return;
            }
            let actualFlag: boolean;
            actualFlag = false;
            let values: DataViewValueColumns;
            values = dataView.categorical.values;
            if (dataView.categorical.categories) {
                categoryFlag = 1;
            } else {
                categoryFlag = 0;
            }
            tooltip = [];
            // array to retain the selected selection ids
            const selectedArray: powerbi.extensibility.ISelectionId[] = $this.selectionManager.getSelectionIds();
            for (let step: number = 0; step < dataView.categorical.values[0].values.length; step++) {
                let tempKey: string = '';
                let tempActual: number = null;
                let tempTarget: number = null;
                let tempMin: number = null;
                let tempMax: number = null;
                let temptrendOne: number = null;
                let temptrendtwo: number = null;
                let tempBest: number = null;
                tooltipPoint = [];
                if ( categoryFlag === 1 ) {
                    tempKey = <string>dataView.categorical.categories[0].values[step];
                    tooltipPoint.push({
                        displayName: options.dataViews[0].categorical.categories[0].source.displayName,
                        value: tempKey
                    });
                }
                for (let iterator: number = 0; iterator < dataView.categorical.values.length; iterator++) {
                    let col: DataViewMetadataColumn;
                    col = dataView.categorical.values[iterator].source;
                    if ( col.roles[`Y`] ) {
                        tempActual = <number>dataView.categorical.values[iterator].values[step];
                        tooltipPoint.push({
                            displayName: col.displayName,
                            value: this.getFormattedTooltipData(col.format, tempActual)
                        });
                    } else if ( col.roles[`TargetValue`] ) {
                        tempTarget = <number>dataView.categorical.values[iterator].values[step];
                        tooltipPoint.push({
                            displayName: col.displayName,
                            value: this.getFormattedTooltipData(col.format, tempTarget)
                        });
                    } else if ( col.roles[`MinValue`] ) {
                        tempMin = <number>dataView.categorical.values[iterator].values[step];
                        tooltipPoint.push({
                            displayName: col.displayName,
                            value: this.getFormattedTooltipData(col.format, tempMin)
                        });
                    } else if ( col.roles[`MaxValue`] ) {
                        tempMax = <number>dataView.categorical.values[iterator].values[step];
                        tooltipPoint.push({
                            displayName: col.displayName,
                            value: this.getFormattedTooltipData(col.format, tempMax)
                        });
                    } else if ( col.roles[`QualitativeState1Value`] ) {
                        temptrendOne = <number>dataView.categorical.values[iterator].values[step];
                        tooltipPoint.push({
                            displayName: col.displayName,
                            value: this.getFormattedTooltipData(col.format, temptrendOne)
                        });
                    } else if ( col.roles[`QualitativeState2Value`] ) {
                        temptrendtwo = <number>dataView.categorical.values[iterator].values[step];
                        tooltipPoint.push({
                            displayName: col.displayName,
                            value: this.getFormattedTooltipData(col.format, temptrendtwo)
                        });
                    } else if ( col.roles[`BestValue`] ) {
                        tempBest = <number>dataView.categorical.values[iterator].values[step];
                        tooltipPoint.push({
                            displayName: col.displayName,
                            value: this.getFormattedTooltipData(col.format, tempBest)
                        });
                    }
                }
                // datapoint to be pushed
                let dataPoint: ILinearDataPoint;
                dataPoint = {
                    key: tempKey,
                    targetValue: tempTarget,
                    actualValue: tempActual,
                    minValue: tempMin,
                    maxValue: tempMax,
                    trendOne: temptrendOne,
                    trendTwo: temptrendtwo,
                    BestValue: tempBest,
                    selectionId: categoryFlag === 1 ? staticHost.createSelectionIdBuilder()
                        .withCategory(dataView.categorical.categories[0], step)
                        .createSelectionId() : null
                };
                if (selectedArray.length && (selectedArray[0][`key`] === dataPoint.selectionId[`key`])) {
                    clearFlag = false;
                }
                if (this.roscCallFlag) {
                    if ((selectedArray.length) && (selectedArray[0][`key`] === dataPoint.selectionId[`key`])) {
                        tempSelectionId = dataPoint.selectionId;
                    } else if (!selectedArray.length) {
                        tempSelectionId = null;
                    }
                }
                linearDataPoint.push(dataPoint);
                if ( tempSelectionId !== null && prevFlag === options.dataViews[0].categorical.categories[0].values.length ) {
                    if ( linearDataPoint[step].selectionId[`key`] === tempSelectionId[`key`] ) {
                        tooltip.push({
                            tooltipDataPoint: tooltipPoint
                        });
                        tooltipFLag = 1;
                    }
                } else {
                    tooltip.push({
                        tooltipDataPoint: tooltipPoint
                    });
                }
            }
            if (clearFlag) {
                tempSelectionId = null;
            } else {
                if (selectedArray.length) {
                    tempSelectionId = selectedArray[0];
                }
            }
            if ( categoryFlag === 1 ) {
                //let catColumn: DataViewCategoryColumn;
                let categoryCol: string;
                categoryCol = dataView.categorical.categories[0].source.displayName;
                //catColumn = dataView.categorical.categories[0];
                let length: number;
                length = linearDataPoint.length;
                for (let index: number = 0; index < length; index++) {
                    let category: PrimitiveValue;
                    category = linearDataPoint[index].key;
                    categoryLegend.push({
                        key: category.toString(),
                        color: getCategoricalObjectValue<Fill>(dataView.categorical.categories[0],
                                                               index, `colors`, 'fillColor', {
                                solid: {
                                    color: staticHost.colorPalette.getColor(<string>dataView.categorical.categories[0].values[index])
                                        .value
                                }
                            }).solid.color,
                        selectionId: staticHost.createSelectionIdBuilder()
                                .withCategory(dataView.categorical.categories[0], index)
                                .createSelectionId()
                    });
                    dataPoints.push({
                        flag: index + 1,
                        key: category.toString(),
                        selector: staticHost.createSelectionIdBuilder()
                                .withCategory(dataView.categorical.categories[0], index)
                                .createSelectionId()
                    });
                }
                uniqueValuesLegend = dataView.categorical.categories[0].values
                    .filter(function (e: PrimitiveValue, i: number, arr: PrimitiveValue[]): boolean {
                        return arr.lastIndexOf(e) === i;
                    });
                categoryFlag = 1;
                legendData = {
                    title: $this.settings.categoryTitle ? dataView.categorical.categories[0].source.displayName ?
                        categoryCol : 'NULL' : '',
                    dataPoints: [],
                    labelColor: $this.settings.legendTextColor,
                    fontSize: $this.settings.categoryFontSize
                };
                options.viewport.width = options.viewport.width - 20;
                for (let index: number = 0; index < uniqueValuesLegend.length; index++) {
                    legendData.dataPoints.push({
                        label: linearDataPoint[index].key,
                        color: staticHost.colorPalette.getColor(<string>dataView.categorical.categories[0].values[index])
                            .value, //color of the icon
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        selected: false,
                        identity: linearDataPoint[index].selectionId
                    });
                }
                for (let index: number = 0; index < categoryLegend.length; index++) {
                    if (categoryLegend[index].key === legendData.dataPoints[index].label) {
                        legendData.dataPoints[index].color = categoryLegend[index].color;
                    }
                }
                if (this.settings.legendPos === 'Top') {
                    this.legend.changeOrientation(LegendPosition.Top);
                } else if (this.settings.legendPos === 'Top center') {
                    this.legend.changeOrientation(LegendPosition.TopCenter);
                } else if (this.settings.legendPos === 'Bottom') {
                    this.legend.changeOrientation(LegendPosition.Bottom);
                } else if (this.settings.legendPos === 'Bottom center') {
                    this.legend.changeOrientation(LegendPosition.BottomCenter);
                } else if (this.settings.legendPos === 'Left center') {
                    this.legend.changeOrientation(LegendPosition.LeftCenter);
                } else if (this.settings.legendPos === 'Right') {
                    this.legend.changeOrientation(LegendPosition.Right);
                } else if (this.settings.legendPos === 'Right center') {
                    this.legend.changeOrientation(LegendPosition.RightCenter);
                } else {
                    this.legend.changeOrientation(LegendPosition.Left);
                }
                this.legend.drawLegend(legendData, options.viewport);
                legendLength = legendData.dataPoints.length;
                options.viewport.width = options.viewport.width + 20;
            }
            actualValue = [];
            for (let i: number = 0; i < values.length; i++) {
                let col: DataViewMetadataColumn;
                col = dataView.categorical.values[i].source;
                let value: number;
                value = null;
                let pos: number = 0;
                if (col.roles[`Y`]) { // we are matching the role and populating value
                    data.actualFormat = col.format;
                    for (let j: number = 0; j < linearDataPoint.length; j++) {
                        if (  tempSelectionId !== null && linearDataPoint[j].selectionId[`key`] === tempSelectionId[`key`] ) {
                            value = value + <number>linearDataPoint[j].actualValue;
                            selectedKey = linearDataPoint[j].key;
                            if (individualFlag === 0) {
                                actualValue[pos] = value;
                                pos++;
                            }
                        } else if ( tempSelectionId === null ) {
                            value = value + <number>linearDataPoint[j].actualValue;
                            if (individualFlag === 0) {
                                actualValue[j] = value;
                            }
                        }
                    }
                    data.actual = value;
                    actualFlag = true;
                    data.actualExists = true;
                    data.actualColName = col.displayName;
                }
                if (col.roles[`MinValue`]) {
                    data.minFlag = true;
                    value = <number>values[i].values[0];
                    for (let j: number = 0; j < linearDataPoint.length; j++) {
                        if ( tempSelectionId !== null && linearDataPoint[j].selectionId[`key`] === tempSelectionId[`key`] ) {
                            value = <number>linearDataPoint[j].minValue;
                        } else if ( tempSelectionId === null && value > <number>linearDataPoint[j].minValue) {
                                value = <number>linearDataPoint[j].minValue;
                        }
                    }
                    data.min = value;
                    data.minColName = col.displayName;
                    data.minFormat = col.format;
                }
                if (col.roles[`MaxValue`]) {
                    data.maxFlag = true;
                    value = null;
                    for (let j: number = 0; j < linearDataPoint.length; j++) {
                        if ( tempSelectionId !== null && linearDataPoint[j].selectionId[`key`] === tempSelectionId[`key`] ) {
                            value  = <number>linearDataPoint[j].maxValue;
                        } else if ( tempSelectionId === null ) {
                            value  = value + <number>linearDataPoint[j].maxValue;
                        }
                    }
                    data.max = value;
                    data.maxColName = col.displayName;
                    data.maxFormat = col.format;
                }
                if (col.roles[`TargetValue`]) {
                    data.targetSet = true;
                    data.targetFormat = col.format;
                    value = null;
                    for (let j: number = 0; j < linearDataPoint.length; j++) {
                        if ( tempSelectionId !== null && linearDataPoint[j].selectionId[`key`] === tempSelectionId[`key`] ) {
                            value  = <number>linearDataPoint[j].targetValue;
                        } else if ( tempSelectionId === null ) {
                            value  = value + <number>linearDataPoint[j].targetValue;
                        }
                    }
                    data.target = value;
                    data.targetExists = true;
                    data.targetColName = col.displayName;
                }
                if (col.roles[`QualitativeState1Value`]) {
                    value = null;
                    for (let j: number = 0; j < linearDataPoint.length; j++) {
                        if ( tempSelectionId !== null && linearDataPoint[j].selectionId[`key`] === tempSelectionId[`key`] ) {
                            value  = <number>linearDataPoint[j].trendOne;
                        } else if ( tempSelectionId === null ) {
                            value  = value + <number>linearDataPoint[j].trendOne;
                        }
                    }
                    data.trendValueOne = value;
                    data.trend1Format = col.format;
                    data.trend1Exists = true;
                    data.trend1ColName = col.displayName;
                }
                if (col.roles[`QualitativeState2Value`]) {
                    value = null;
                    for (let j: number = 0; j < linearDataPoint.length; j++) {
                        if ( tempSelectionId !== null && linearDataPoint[j].selectionId[`key`] === tempSelectionId[`key`] ) {
                            value  = <number>linearDataPoint[j].trendTwo;
                        } else if ( tempSelectionId === null ) {
                            value  = value + <number>linearDataPoint[j].trendTwo;
                        }
                    }
                    data.trendValueTwo = value;
                    data.trend2Format = col.format;
                    data.trend2Exists = true;
                    data.trend2ColName = col.displayName;
                }
                if (col.roles[`BestValue`]) {
                    value = null;
                    for (let j: number = 0; j < linearDataPoint.length; j++) {
                        if ( tempSelectionId !== null && linearDataPoint[j].selectionId[`key`] === tempSelectionId[`key`] ) {
                            value  = <number>linearDataPoint[j].BestValue;
                        } else if ( tempSelectionId === null ) {
                            value  = value + <number>linearDataPoint[j].BestValue;
                        }
                    }
                    data.best = value;
                    data.bestFormat = col.format;
                    data.bestSet = true;
                    data.bestColName = col.displayName;
                }
            }
            if (categoryFlag === 1) {
                d3.selectAll('.measure').data(legendData.dataPoints);
                d3.selectAll('.legendItem')
                    // tslint:disable-next-line:no-any
                    .on('click', function (d: any, i: number): void {
                        $this.selectionManager.select(d.identity).then((ids: ISelectionId[]) => {
                            tempSelectionId = d.identity;
                            $this.roscCallFlag = false;
                            $this.update(options);
                        });
                        (<Event>d3.event).stopPropagation();
                    });
                $('.navArrow').click(function (): void {
                    d3.selectAll('.legendItem').style('cursor', 'pointer');
                    // tslint:disable-next-line:no-any
                    d3.selectAll('.legendItem').on('click', function (d: any, i: number): void {
                        $this.selectionManager.select(d.identity).then((ids: ISelectionId[]) => {
                            tempSelectionId = d.identity;
                            $this.roscCallFlag = false;
                            $this.update(options);
                        });
                        (<Event>d3.event).stopPropagation();
                    });
                });
                d3.select('html').on('click', function (): void {
                    $this.selectionManager.clear();
                    if ( tempSelectionId !== null ) {
                        tempSelectionId = null;
                        $this.roscCallFlag = false;
                        $this.update(options);
                    }
                });
            }
            if (this.settings.Orientation === 'Vertical' && (this.settings.legendPos === 'Bottom' ||
                this.settings.legendPos === 'Bottom center')) {
                d3.select('svg.legend').style('bottom', '0px');
            }
            if (this.settings.Orientation === 'Vertical' && (this.settings.legendPos === 'Top' ||
                this.settings.legendPos === 'Top center')) {
                d3.select('svg.legend').style('top', '0px');
            }
            // If max is not present or max precedes actual value
            if ((!data.maxFlag && actualFlag) || data.max < data.actual) {
                if (data.actual > 0) {
                    data.max = data.actual * 2;
                } else if (data.actual < 0) {
                    data.max = data.actual / 2;
                }
            }
            // If min is not present or min exceeds actual value
            if ((!data.minFlag && actualFlag) || data.min > data.actual) {
                if (data.actual > 0) {
                    data.min = data.actual / 2;
                } else if (data.actual < 0) {
                    data.min = data.actual * 2;
                }
            }
            // if target value precedes min or exceeds max
            if (data.targetExists && data.target < data.min && !data.minFlag && actualFlag) {
                data.min = data.target;
            }
            if (data.targetExists && data.target > data.max && !data.maxFlag && actualFlag) {
                data.max = data.target;
            }
            // if best value precedes min or exceeds max
            if (data.bestSet && data.best < data.min && !data.minFlag && actualFlag) {
                data.min = data.best;
            }
            if (data.bestSet && data.best > data.max && !data.maxFlag && actualFlag) {
                data.max = data.best;
            }
            // If min is the same as max or exceeds max
            if (data.min >= data.max) {
                if (data.actual > 0) {
                    data.min = data.actual / 2;
                    data.max = data.actual * 2;
                } else if (data.actual < 0) {
                    data.min = data.actual * 2;
                    data.max = data.actual / 2;
                }
            }

            return data; //Data object we are returning here to the update function
        }

        private getFormattedData(value: number, displayUnits: number, precision: number, format: string): string {

            let formattedData: string;
            let formatterVal: number = displayUnits;

            if (value === null) {
                value = 0;
            }

            if (displayUnits === 0) {
                let alternateFormatter: number;
                alternateFormatter = parseInt(value.toString(), 10).toString().length;
                if (alternateFormatter > 9) {
                    formatterVal = 1e9;
                } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                    formatterVal = 1e6;
                } else if (alternateFormatter <= 6 && alternateFormatter >= 4) {
                    formatterVal = 1e3;
                } else {
                    formatterVal = 10;
                }
            }
            if (!format) {
                format = ValueFormatter.DefaultNumericFormat;
            }
            precision = precision === null ? 0 : precision;
            let formatter: IValueFormatter;
            formatter = ValueFormatter.create({
                value: formatterVal,
                precision: precision,
                format: format
            });
            formattedData = formatter.format(value);

            return formattedData;
        }

        public getDarkShade(colorHEX: string, opacity: number): string {
            colorHEX = String(colorHEX).replace(/[^0-9a-f]/gi, '');
            if (colorHEX.length < 6) {
                colorHEX = colorHEX[0] + colorHEX[0] + colorHEX[1] + colorHEX[1] + colorHEX[2] + colorHEX[2];
            }
            opacity = opacity || 0;

            let rgb: string;
            rgb = '#';
            // tslint:disable-next-line:no-any
            let c: any;
            for (let iCounter: number = 0; iCounter < 3; iCounter++) {
                c = parseInt(colorHEX.substr(iCounter * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * opacity)), 255)).toString(16);
                rgb += (`00${c}`).substr(c.length);
            }

            return rgb;
        }

        private getFormattedTooltipData(format: string, value: number): string {
            let formattedData: string;
            let formatter: IValueFormatter;
            if (format === '') {
                format = ValueFormatter.DefaultNumericFormat;
            }
            formatter = ValueFormatter.create({
                format: format
            });
            formattedData = formatter.format(value);

            return formattedData;
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public getSettings(objects: DataViewObjects): void {

            this.colorsGlobal = [];
            if ((JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {

                const minValue: number = getValue<number>(objects, `TargetRange`, `MinRangeValue`, null);
                const maxValue: number = getValue<number>(objects, `TargetRange`, `MaxRangeValue`, null);
                const range1Val: number = getValue<number>(objects, `colorSelector`, `range1`, null);
                const range2Val: number = getValue<number>(objects, `colorSelector`, `range2`, null);
                const range3Val: number = getValue<number>(objects, `colorSelector`, `range3`, null);
                const range4Val: number = getValue<number>(objects, `colorSelector`, `range4`, null);
                const percentageVal1: number = getValue<number>(objects, `colorSelector`, `percentage1`, 20);
                const percentageVal2: number = getValue<number>(objects, `colorSelector`, `percentage2`, 60);
                const percentageVal3: number = getValue<number>(objects, `colorSelector`, `percentage3`, 20);
                let dataDecimal: number = getValue<number>(objects, `labels`, `markerWidth`, null);
                let trendDecimal: number = getValue<number>(objects, `trendLabels`, `lineWidth`, null);
                let scaleDecimalPlaces: number = getValue<number>(objects, `ScaleSettings`, `decimalPlaces`, null);
                let legendDecimalPlaces: number = getValue<number>(objects, `legendSettings`, `decimalPlaces`, null);
                dataDecimal = dataDecimal === null ? null : dataDecimal <= 0
                    ? null : (dataDecimal <= 4) ? dataDecimal : 4;
                trendDecimal = trendDecimal === null ? null : trendDecimal <= 0
                    ? null : (trendDecimal <= 4) ? trendDecimal : 4;
                scaleDecimalPlaces = scaleDecimalPlaces === null ? null : scaleDecimalPlaces <= 0
                    ? null : (scaleDecimalPlaces <= 4) ? scaleDecimalPlaces : 4;
                legendDecimalPlaces = legendDecimalPlaces === null ? null : legendDecimalPlaces <= 0
                    ? null : (legendDecimalPlaces <= 4) ? legendDecimalPlaces : 4;
                this.settings = {
                    ComparisonFillColor: getValue<Fill>(objects, `general`, `ComparisonFillColor`, {
                        solid: {
                            color: '#E0E0E0'
                        }
                    }).solid.color,
                    ActualFillColor: getValue<Fill>(objects, `general`, `ActualFillColor`, {
                        solid: {
                            color: `#FF8F00 `
                        }
                    }).solid.color,
                    ActualFillColorGreater: getValue<Fill>(objects, `general`, `ActualFillColorGreater`, {
                        solid: {
                            color: `#8AD4EB `
                        }
                    }).solid.color,
                    DataColor: getValue<Fill>(objects, `labels`, `DataColor`, {
                        solid: {
                            color: '#000'
                        }
                    }).solid.color,
                    showlabel: getValue<number>(objects, `labels`, `show`, 0) === 0 ? true : getValue<number>(objects, `labels`, `show`, 0),
                    fontSize: getValue<number>(objects, `labels`, `fontSize`, 0) <= 0 ? 25 :
                        getValue<number>(objects, `labels`, `fontSize`, 0),
                    fontFamily: getValue<number>(objects, `labels`, `fontFamily`, 0) <= 0 ? `Segoe UI` :
                        getValue<number>(objects, `labels`, `fontFamily`, 0),
                    labelDisplayUnits: getValue<number>(objects, `labels`, `labelDisplayUnits`, 0),
                    markerWidth: dataDecimal,
                    trendColor: getValue<Fill>(objects, `trendLabels`, `trendColor`, {
                        solid: {
                            color: '#000'
                        }
                    }).solid.color,
                    showTrend: getValue<number>(objects, `trendLabels`, `show`, 0) === 0 ? true :
                        getValue<number>(objects, `trendLabels`, `show`, 0),
                    trendfontSize: getValue<number>(objects, `trendLabels`, `fontSize`, 0) <= 0 ? 15 :
                        getValue<number>(objects, `trendLabels`, `fontSize`, 0),
                    trendfontFamily: getValue<number>(objects, `trendLabels`, `fontFamily`, 0) <= 0 ? `Segoe UI` :
                        getValue<number>(objects, `trendLabels`, `fontFamily`, 0),
                    trendDisplayUnits: getValue<number>(objects, `trendLabels`, `trendDisplayUnits`, 0),
                    lineWidth: trendDecimal,
                    showPercentage: getValue<number>(objects, `PercentageDatalabels`, `show`, 0) === 0 ? true :
                        getValue<number>(objects, `PercentageDatalabels`, `show`, 0),
                    showRemainingPercentage: getValue<boolean>(objects, `PercentageDatalabels`, `showRemaining`, false),
                    PercentageDataColor: getValue<Fill>(objects, `PercentageDatalabels`, `PercentageDataColor`, {
                        solid: {
                            color: '#000'
                        }
                    }).solid.color,
                    percentagefontSize: getValue<number>(objects, `PercentageDatalabels`, `fontSize`, 0) <= 0 ? 15 :
                        getValue<number>(objects, `PercentageDatalabels`, `fontSize`, 0),
                    percentagefontFamily: getValue<number>(objects, `PercentageDatalabels`, `fontFamily`, 0) <= 0 ? `Segoe UI` :
                        getValue<number>(objects, `PercentageDatalabels`, `fontFamily`, 0),
                    Orientation: getValue<number>(objects, `ChartOrientation`, `Orientation`, 0) <= 0 ? `Horizontal` :
                        getValue<number>(objects, `ChartOrientation`, `Orientation`, 0),
                    showColor: getValue<number>(objects, `colorSelector`, `show`, 0) <= 0 ? false :
                        getValue<number>(objects, `colorSelector`, `show`, 0),
                    fillOption: getValue<string>(objects, `colorSelector`, `fillOption`, `value`),
                    Zone1: getValue<Fill>(objects, `colorSelector`, `Zone1`, {
                        solid: {
                            color: '#01B8AA'
                        }
                    }).solid.color,
                    Zone2: getValue<Fill>(objects, `colorSelector`, `Zone2`, {
                        solid: {
                            color: '#0051FF'
                        }
                    }).solid.color,
                    Zone3: getValue<Fill>(objects, `colorSelector`, `Zone3`, {
                        solid: {
                            color: '#7FBA00'
                        }
                    }).solid.color,
                    Zone4: getValue<Fill>(objects, `colorSelector`, `Zone4`, {
                        solid: {
                            color: '#F9B700'
                        }
                    }).solid.color,
                    area1: getValue<Fill>(objects, `colorSelector`, `area1`, {
                        solid: {
                            color: '#01B8AA'
                        }
                    }).solid.color,
                    area2: getValue<Fill>(objects, `colorSelector`, `area2`, {
                        solid: {
                            color: '#0051FF'
                        }
                    }).solid.color,
                    area3: getValue<Fill>(objects, `colorSelector`, `area3`, {
                        solid: {
                            color: '#7FBA00'
                        }
                    }).solid.color,
                    range1: range1Val,
                    range2: range2Val,
                    range3: range3Val,
                    range4: range4Val,
                    percentageVal1: Number(percentageVal1),
                    percentageVal2: Number(percentageVal2),
                    percentageVal3: Number(percentageVal3),
                    showScale: getValue<number>(objects, `ScaleSettings`, `show`, 0) === 0 ? true :
                        getValue<number>(objects, `ScaleSettings`, `show`, 0),
                    scaleColor: getValue<Fill>(objects, `ScaleSettings`, `color`, {
                        solid: {
                            color: '#000000'
                        }
                    }).solid.color,
                    scaleFontSize: getValue<number>(objects, `ScaleSettings`, `fontSize`, 9),
                    scaleFontFamily: getValue<string>(objects, `ScaleSettings`, `fontFamily`, 'Segoe UI'),
                    scaleDisplayUnits: getValue<number>(objects, `ScaleSettings`, `displayUnits`, 0),
                    scaleDecimalPlaces: scaleDecimalPlaces,
                    legendShow: getValue<boolean>(objects, `legendSettings`, `show`, true),
                    legendNewPosition: getValue<string>(objects, `legendSettings`, `position`, "topLeft"),
                    legendColor: getValue<Fill>(objects, `legendSettings`, `fill`, {
                        solid: {
                            color: '#000'
                        }
                    }).solid.color,
                    legendFontSize: getValue<number>(objects, `legendSettings`, `fontSize`, 15),
                    legendFontFamily: getValue<string>(objects, `legendSettings`, `fontFamily`, 'Segoe UI'),
                    legendDisplayUnits: getValue<number>(objects, `legendSettings`, `displayUnits`, 0),
                    legendDecimalPlaces: legendDecimalPlaces,
                    showRange: getValue<number>(objects, `TargetRange`, `show`, 0) <= 0 ? false :
                        getValue<number>(objects, `TargetRange`, `show`, 0),
                    MinRangeValue: minValue,
                    MaxRangeValue: maxValue,
                    RangeTicksColor: getValue<Fill>(objects, `TargetRange`, `RangeTicksColor`, {
                        solid: {
                            color: '#FD625E'
                        }
                    }).solid.color,
                    rangeWidth: getValue<number>(objects, `TargetRange`, `rangeWidth`, 3) <= 0 ? 1 :
                        getValue<number>(objects, `TargetRange`, `rangeWidth`, 3),
                    rangeStyle: getValue<string>(objects, `TargetRange`, `rangeStyle`, 'solid'),
                    Indicator1: getValue<Fill>(objects, `Indicator`, `Indicator1`, {
                        solid: {
                            color: 'grey'
                        }
                    }).solid.color,
                    Indicator2: getValue<Fill>(objects, `Indicator`, `Indicator2`, {
                        solid: {
                            color: 'grey'
                        }
                    }).solid.color,
                    categoryFontSize: getValue<number>(objects, `categorySettings`, `fontSize`, 12),
                    categoryTitle: getValue<boolean>(objects, `categorySettings`, `title`, false),
                    legendPos: getValue<string>(objects, 'categorySettings', 'position', 'Bottom center'),
                    legendTextColor: getValue<Fill>(objects, `categorySettings`, `color`, {
                        solid: {
                            color: 'black'
                        }
                    }).solid.color,
                    animationToggle: getValue<boolean>(objects, `animationEffect`, `show`, false),
                    animationTime: getValue<number>(objects, `animationEffect`, `animationTime`, 0)
                };
            }
            this.prevDataViewObjects = objects;
            this.colorsGlobal.push(this.settings.ComparisonFillColor);
            if (this.settings.fillOption === `value`) {
                this.colorsGlobal.push(this.settings.Zone4);
                this.colorsGlobal.push(this.settings.Zone3);
                this.colorsGlobal.push(this.settings.Zone2);
                this.colorsGlobal.push(this.settings.Zone1);
            } else {
                this.colorsGlobal.push(this.settings.area3);
                this.colorsGlobal.push(this.settings.area2);
                this.colorsGlobal.push(this.settings.area1);
            }
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            let $this: this;
            $this = this;
            $this.visualOptions = options;
            let vMarker: number;
            categoryLegend = [];
            let gradient: d3.Selection<SVGElement>;
            d3.selectAll('.gradientSVG').remove();
            d3.selectAll('.markerTriangle').remove();
            this.rootElement.selectAll(`.lg_ErrorMessage`).remove();
            this.svg.selectAll(`.linearSVG`).remove();
            this.svgLinear.selectAll(`rect.range`).remove();
            this.svgLinear.selectAll(`rect.rectRange`).remove();
            this.svgLinear.selectAll(`rect.measure`).remove();
            this.svg.selectAll('.lg_xLabels,.lg_yLabels').remove();
            this.svgLinear.selectAll(`line.marker, line.markerTilt`).remove();
            this.svgLinear.selectAll(`line.markermax, line.markermin`).remove();
            d3.selectAll('.LG_verticalDataLabel').remove();
            $('.lg_data_total').hide();
            $('.lg_data_percentage').hide();
            $('.lg_trendvalue1,.lg_trendvalue2').hide();
            this.svg.style('margin-left', 0);
            this.svg.style('margin-top', 0);
            this.dataView = options.dataViews[0];
            if (!options.dataViews || !this.dataView || !this.dataView.metadata) {
                return;
            }
            this.data = this.converter(this.dataView, options); //calling Converter function
            if (categoryFlag !== 1) {
                $('.legend').hide();
            } else {
                $(`.legend`).show();
            }
            let viewport: IViewport;
            viewport = options.viewport;
            if (viewport.width < 60 || viewport.height < 50) {
                return;
            }
            if ((this.settings.Orientation === `Horizontal`)
                && (this.settings.legendPos === 'Top' || this.settings.legendPos === 'Top center')) {
                if ((viewport.height / 2) - this.legend.getMargins().height < trendLabelHeight + targetLabelHeight) {
                    if (!trendLabelFlag) {
                        showTrendStatus = this.settings.showTrend;
                        trendLabelFlag = true;
                        if (this.settings.legendNewPosition === "topLeft") {
                            $('.lg_legend_tab').hide();
                        }
                    }
                    this.settings.showTrend = false;
                } else {
                    if ( trendLabelFlag ) {
                        this.settings.showTrend = showTrendStatus;
                        trendLabelFlag = false;
                        $('.lg_legend_tab').show();
                    }
                }
                if (((viewport.height / 2) - 50 < this.legend.getMargins().height + targetLabelHeight)) {
                    $('.lg_legend_tab').hide();
                } else {
                    $('.lg_legend_tab').show();
                }
                if (((viewport.height / 2) - 50 < this.legend.getMargins().height)) {
                    $('.lg_data_tab').hide();
                } else {
                    $('.lg_data_tab').show();
                }
            } else if (this.settings.Orientation === `Horizontal`) {
                if ((viewport.height / 2) < trendLabelHeight + targetLabelHeight) {
                    if (!trendLabelFlag) {
                        showTrendStatus = this.settings.showTrend;
                        trendLabelFlag = true;
                        if (this.settings.legendNewPosition === "topLeft") {
                            $('.lg_legend_tab').hide();
                        }
                    }
                    this.settings.showTrend = false;
                } else {
                    if ( trendLabelFlag ) {
                        this.settings.showTrend = showTrendStatus;
                        trendLabelFlag = false;
                        $('.lg_legend_tab').show();
                    }
                }
            }
            if (!this.data.actualExists) {
                const message: string = 'Please add "Actual value" field';
                this.rootElement
                    .append('div')
                    .classed('lg_ErrorMessage', true)
                    .text(message)
                    .attr('title', message);

                return;
            }

            if (this.data.actual === null) {
                return;
            }
            // Get settings
            this.getSettings(this.dataView.metadata.objects);
            // conditions to disable the zone if category exists
            if (categoryFlag === 1) {
                this.settings.showColor = false;
            } else {
                this.settings.showColor = getValue<number>(this.dataView.metadata.objects, `colorSelector`, `show`, 0) <= 0 ? false :
                    getValue<number>(this.dataView.metadata.objects, `colorSelector`, `show`, 0);
            }
            if (this.settings.animationTime > 6) {
                this.settings.animationTime = 6;
            } else if (this.settings.animationTime < 0) {
                this.settings.animationTime = 0;
            }
            // setting upperbound to rangetick width
            if (this.settings.rangeWidth > 8) {
                this.settings.rangeWidth = 8;
            }
            let legendHeight: IViewport;
            legendHeight = this.legend.getMargins();
            if (categoryFlag === 1 && this.settings.Orientation === `Vertical` &&
                (this.settings.legendPos === 'Bottom' || this.settings.legendPos === 'Bottom center' ||
                    this.settings.legendPos === 'Top' || this.settings.legendPos === 'Top center')) {
                viewport.height = viewport.height - legendHeight.height;
            } else if (categoryFlag === 1 && this.settings.Orientation === `Horizontal` &&
                (this.settings.legendPos === 'Right' || this.settings.legendPos === 'Right center' ||
                    this.settings.legendPos === 'Left' || this.settings.legendPos === 'Left center')) {
                viewport.width = viewport.width - legendHeight.width - 15;
            } else if (categoryFlag === 1 && this.settings.Orientation === `Horizontal` &&
                (this.settings.legendPos === 'Bottom' || this.settings.legendPos === 'Bottom center')) {
                viewport.height = viewport.height - legendHeight.height;
            }
            let rightMargin: number;
            d3.selectAll('.legendItem').style('cursor', 'pointer');
            d3.selectAll('.navArrow').style('cursor', 'pointer');
            if (categoryFlag === 1 && this.settings.Orientation === `Horizontal`) {
                if (this.settings.legendPos === 'Top' || this.settings.legendPos === 'Top center') {
                    d3.selectAll('.lg_imagetab').style('margin-top', `${legendHeight.height}px`);
                    d3.selectAll('.lg_data_tab').style('margin-left', `${this.settings.fontSize / 2.0}px`);
                    d3.selectAll('.linearSVG').style('margin-left', `0px`);
                } else if (this.settings.legendPos === 'Left' || this.settings.legendPos === 'Left center') {
                    if (this.settings.legendNewPosition === "topLeft") {
                        d3.selectAll('.lg_legend_tab').style('margin-left', `${legendHeight.width}px`);
                    }
                    d3.selectAll('.lg_imagetab').style('margin-top', `0px`);
                    d3.selectAll('.lg_data_tab').style('margin-left', `${legendHeight.width + (this.settings.fontSize / 2.0)}px`);
                    d3.selectAll('.linearSVG').style('margin-left', `${legendHeight.width}px`);
                } else {
                    d3.selectAll('.lg_imagetab').style('margin-top', `0px`);
                    d3.selectAll('.lg_data_tab').style('margin-left', `${this.settings.fontSize / 2.0}px`);
                    d3.selectAll('.linearSVG').style('margin-left', `0px`);
                }
                if (this.settings.legendPos === 'Right' || this.settings.legendPos === 'Right center') {
                    rightMargin = legendHeight.width;
                } else {
                    rightMargin = 0;
                }
            } else if (categoryFlag === 1 && this.settings.Orientation === `Vertical`) {
                if (this.settings.legendPos === 'Top' || this.settings.legendPos === 'Top center') {
                    d3.selectAll('.lg_imagetab').style('margin-top', `${legendHeight.height}px`)
                        .style('margin-left', `${this.settings.fontSize / 2.0}px`);
                    d3.selectAll('.linearSVG').style('margin-top', `${legendHeight.height}px`);
                } else if (this.settings.legendPos === 'Left' || this.settings.legendPos === 'Left center') {
                    d3.selectAll('.lg_imagetab').style('margin-top', `0px`)
                        .style('margin-left', `${legendHeight.width + (this.settings.fontSize / 2.0)}px`);
                } else {
                    d3.selectAll('.lg_imagetab').style('margin-top', `0px`)
                        .style('margin-left', `${this.settings.fontSize / 2.0}px`);
                    d3.selectAll('.linearSVG').style('margin-top', `0px`);
                }
            } else {
                d3.selectAll('.lg_imagetab').style('margin-top', `10px`);
            }
            if (this.data.states.length === 0) {
                if (categoryFlag === 0 && this.settings.showColor) {
                    this.data.states.push(this.data.max);
                    this.data.states.push(this.settings.range4);
                    this.data.states.push(this.settings.range3);
                    this.data.states.push(this.settings.range2);
                    this.data.states.push(this.settings.range1);
                } else {
                    this.data.states.push(this.data.max);
                }
            }
            let legendColor: string[];
            legendColor = [];
            let sortedRanges: number[];
            sortedRanges = this.data.states;
            let percentageVal: PrimitiveValue;
            let actualVal: string;
            let trend1Val: string;
            let trend2Val: string;
            let width: number;
            let height: number;
            let modHeight: number;
            const svgheight: number = viewport.height;
            if (individualFlag !== 0) {
                legendColor[0] = categoryLegend[individualFlag - 1].color;
            } else {
                let colorIndex : number = 0;
                for (let index: number = 0; index < categoryLegend.length; index++) {
                    if ( tempSelectionId !== null && categoryLegend[index].key === selectedKey) {
                        legendColor[colorIndex] = categoryLegend[index].color;
                        colorIndex++;
                    } else {
                        legendColor[index] = categoryLegend[categoryLegend.length - index - 1].color;
                    }
                }
            }
            let axisFormatter: IValueFormatter;
            axisFormatter = ValueFormatter.create({
                format: this.data.actualFormat, precision: this.settings.scaleDecimalPlaces, value: this.settings.scaleDisplayUnits === 0 ?
                    this.getValueUpdated(this.data.max) : this.settings.scaleDisplayUnits
            });
            let textProperties: TextProperties;
            textProperties = {
                fontFamily: `${this.settings.scaleFontFamily}`,
                fontSize: `${this.settings.scaleFontSize}px`,
                text: axisFormatter.format(this.data.max)
            };
            let maxFormattedDataWidth: number;
            let halfMaxFormattedDataWidth: number;
            maxFormattedDataWidth = textMeasurementService.measureSvgTextWidth(textProperties);
            halfMaxFormattedDataWidth = maxFormattedDataWidth / 2;
            if (this.settings.Orientation === `Horizontal`) {
                $('.lg_imagetab').css('left', 'auto');
                if (categoryFlag === 0) {
                    $('.lg_imagetab').css('right', 0);
                } else {
                    $('.lg_imagetab').css('right', `${legendHeight.width + (this.settings.fontSize / 2.0)}px`);
                }
                height = viewport.height;
                width = viewport.width - halfMaxFormattedDataWidth;
                modHeight = viewport.height / 12;
                this.svg
                    .attr({
                        height: viewport.height,
                        width: viewport.width
                    }).style('margin-top', `${(viewport.height / 2)}px`);
                d3.select('.lg_data_tab').style('margin-top', `${(viewport.height / 2) - 50}px`);
                this.svgLinear.attr(`transform`, `translate(0,5)`);
            } else {
                $('.lg_imagetab').css('right', 'auto');
                $('.lg_imagetab').css('left', 0);
                width = viewport.height;
                height = viewport.width - 20;
                modHeight = width / 12;
                this.svg
                    .attr({
                        width: viewport.height / 11,
                        height: '100%'
                    }).style('margin-left', `${(viewport.width / 2) - (modHeight / 2)}px`);
                this.svgLinear.attr(`transform`, `translate(5,0)`);
            }

            if (this.data.target) {
                if (!this.settings.showRemainingPercentage) {
                    if (this.data.actual < 0 && this.data.target < 0) {
                        percentageVal = (this.data.actual * 100) / this.data.target;
                        percentageVal = 200 - percentageVal;
                        percentageVal = parseFloat(Number(percentageVal).toFixed(2));
                    } else {
                        percentageVal = (this.data.actual * 100) / this.data.target;
                        percentageVal = parseFloat(Number(percentageVal).toFixed(2));
                    }
                } else {
                    if (this.data.actual < 0 && this.data.target < 0) {
                        percentageVal = -((this.data.target - this.data.actual) / this.data.target) * 100;
                        if (this.data.actual > this.data.target) {
                            percentageVal = 0;
                        }
                        percentageVal = parseFloat(Number(percentageVal).toFixed(2));
                    } else {
                        percentageVal = (this.data.actual * 100) / this.data.target;
                        percentageVal = 100 - percentageVal < 0 ? 0 : 100 - percentageVal;
                        percentageVal = parseFloat(Number(percentageVal).toFixed(2));
                    }
                }
            } else {
                percentageVal = 100;
            }
            let minRangeValue: number;
            let maxRangeValue: number;
            let vDataLabel: d3.Selection<SVGElement>;
            let upArrow: string;
            upArrow = `&#8599`;
            let percentageFont: number;
            percentageFont = this.settings.fontSize / 2.0;
            let percentageFontTrend: number;
            percentageFontTrend = this.settings.trendfontSize / 2.5;
            let range: d3.selection.Update<number>;
            let measure: d3.Selection<SVGElement>;
            let measure2: d3.selection.Update<number>;
            let xScale: d3.scale.Linear<number, number>;
            xScale = d3.scale.linear()
                .domain([this.data.min, this.data.max])
                .range([30, viewport.width]).nice();
            let yScale: d3.scale.Linear<number, number>;
            yScale = d3.scale.linear()
                .domain([this.data.min, this.data.max])
                .range([viewport.height - 15, 15]).nice();
            let xAxis: d3.svg.Axis;
            const precisionValue: number = this.settings.markerWidth;
            const precisionValueTrend: number = this.settings.lineWidth;

            actualVal = this.getFormattedData(this.data.actual, this.settings.labelDisplayUnits, precisionValue, this.data.actualFormat);
            trend1Val = this.getFormattedData(
                this.data.trendValueOne, this.settings.trendDisplayUnits, precisionValueTrend, this.data.trend1Format);
            trend2Val = this.getFormattedData(
                this.data.trendValueTwo, this.settings.trendDisplayUnits, precisionValueTrend, this.data.trend2Format);

            const textProps: TextProperties = {
                fontSize: `${this.settings.fontSize}px`,
                fontFamily: this.settings.fontFamily,
                text: actualVal
            };
            const horizontalWidth: number = (this.settings.showPercentage) ?
                (options.viewport.width / 2.1) - 20 : options.viewport.width - 30;
            let updatedText: string;
            updatedText = textMeasurementService.getTailoredTextOrDefault(textProps, horizontalWidth);

            const actualTooltip: string = this.getFormattedTooltipData(this.data.actualFormat, this.data.actual);
            this.actual.text(updatedText)
                .attr('title', actualTooltip)
                .style(`font-size`, `${this.settings.fontSize}px`)
                .style(`font-family`, this.settings.fontFamily)
                .style(`color`, this.settings.DataColor)
                .style(`margin-right`, `${percentageFont}px`);

            const textPropspercent: TextProperties = {
                fontSize: `${this.settings.percentagefontSize}px`,
                fontFamily: this.settings.percentagefontFamily,
                text: `${percentageVal}%`
            };

            const dataWidth: number = $('.lg_data_total').width();

            let updatedTextpercent: string;
            updatedTextpercent = textMeasurementService.getTailoredTextOrDefault(textPropspercent, options.viewport.width - dataWidth - 70);

            this.percentage.text(updatedTextpercent)
                .attr('title', `${percentageVal}%`)
                .style(`font-size`, `${this.settings.percentagefontSize}px`)
                .style(`color`, this.settings.PercentageDataColor)
                .style(`font-Family`, this.settings.percentagefontFamily); //Using values which are stored in data object

            let actualFormatter: IValueFormatter;
            actualFormatter = ValueFormatter.create({
                format: this.data.actualFormat
            });
            let className: string;
            let translateVal: string;
            let axisFunction: d3.svg.Axis;
            if (categoryFlag === 0 && this.settings.Orientation === 'Horizontal' ) {
                if (this.settings.legendNewPosition === "aboveMarker") {
                    d3.selectAll('.lg_legend_tab').style('margin-top', `${((viewport.height / 2) - 38)}px`);
                } else {
                    d3.selectAll('.lg_legend_tab').style('margin-top', `0px`);
                }
            } else if (categoryFlag === 0 && this.settings.Orientation === 'Vertical')  {
                if (this.settings.legendNewPosition === "aboveMarker") {
                    d3.selectAll('.lg_legend_tab').style('margin-top', `${yScale(this.data.target) - 13}px`);
                } else {
                    d3.selectAll('.lg_legend_tab').style('margin-top', `${((viewport.height / 2))}px`);
                }
            } else if (categoryFlag === 1 && this.settings.Orientation === `Horizontal`) {
                if (this.settings.legendPos === 'Top' || this.settings.legendPos === 'Top center') {
                    if (this.settings.legendNewPosition === "aboveMarker") {
                        d3.selectAll('.lg_legend_tab').style('margin-top', `${(viewport.height / 2) - 38}px`);
                    } else {
                        d3.selectAll('.lg_legend_tab').style('margin-top', `${legendHeight.height}px`);
                    }
                } else {
                    if (this.settings.legendNewPosition === "aboveMarker") {
                        d3.selectAll('.lg_legend_tab').style('margin-top', `${((viewport.height / 2) - 38)}px`);
                    } else {
                        d3.selectAll('.lg_legend_tab').style('margin-top', `0px`);
                    }
                }
            } else if (categoryFlag === 1 && this.settings.Orientation === `Vertical`) {
                if (this.settings.legendPos === 'Top' || this.settings.legendPos === 'Top center') {
                    if (this.settings.legendNewPosition === "aboveMarker") {
                        d3.selectAll('.lg_legend_tab').style('margin-top', `${yScale(this.data.target) + legendHeight.height - 15}px`);
                    } else {
                        d3.selectAll('.lg_legend_tab').style('margin-top', `${((viewport.height / 2) + legendHeight.height)}px`);
                    }
                } else {
                    if (this.settings.legendNewPosition === "aboveMarker") {
                        d3.selectAll('.lg_legend_tab').style('margin-top', `${yScale(this.data.target) - 15}px`);
                    } else {
                        d3.selectAll('.lg_legend_tab').style('margin-top', `${((viewport.height / 2) - legendHeight.height)}px`);
                    }
                }
            }
            if (this.settings.Orientation === `Horizontal`) {
                this.svgLinear.selectAll(`rect.range`).remove();
                this.svgLinear.selectAll(`.rectRange`).remove();
                this.svgLinear.selectAll(`rect.measure`).remove();
                $('.lg_data_total').hide();
                if (this.settings.showlabel) {
                    $('.lg_data_total').show();
                }
                if (this.settings.showPercentage) {
                    $('.lg_data_percentage').show();
                } else {
                    $('.lg_data_percentage').hide();
                }
                this.trendValue1.style(`text-align`, `right`);
                this.trendValue2.style(`text-align`, `right`);
                this.data.min = xScale.domain()[0];
                this.data.max = xScale.domain()[1];
                // to adjust the xScale range according to the new data max
                let xTextProperties: TextProperties;
                xTextProperties = {
                    fontFamily: `${this.settings.scaleFontFamily}`,
                    fontSize: `${this.settings.scaleFontSize}px`,
                    text: axisFormatter.format(this.data.max)
                };
                let xMaxFormattedDataWidth: number;
                xMaxFormattedDataWidth = textMeasurementService.measureSvgTextWidth(xTextProperties);
                let xHalfMaxFormattedDataWidth: number;
                xHalfMaxFormattedDataWidth = maxFormattedDataWidth / 2;

                xScale.range([xHalfMaxFormattedDataWidth, viewport.width - xHalfMaxFormattedDataWidth]);

                xAxis = d3.svg.axis().scale(xScale)
                    .tickFormat(actualFormatter.format)
                    .orient('down');
                minRangeValue = (this.settings.MinRangeValue === null
                    || this.settings.MinRangeValue < this.data.min
                    || this.settings.MinRangeValue > this.data.max) ? this.data.min : this.settings.MinRangeValue;
                maxRangeValue = (this.settings.MaxRangeValue === null
                    || this.settings.MaxRangeValue < this.data.min
                    || this.settings.MaxRangeValue > this.data.max) ? this.data.max : this.settings.MaxRangeValue;
            } else {
                this.trendValue1.style(`text-align`, `left`);
                this.trendValue2.style(`text-align`, `left`);

                $('.data_percentagev').hide();
                $('.data_totalv').hide();
                $(`.trendtext1v`).hide();
                $(`.trendtext2v`).hide();
                vDataLabel = d3.select('.linearSVG').append('g').classed('LG_verticalDataLabel', true);
                let difference: number;
                if (this.settings.labelDisplayUnits === 1) {
                    difference = 150 + this.data.actual.toString().length * 6;
                } else {
                    difference = 150;
                }

                let availableWidth: number;
                availableWidth = parseInt($('.linearSVG').css('marginLeft').toString(), 10);
                if (this.settings.showlabel) {
                    const textPropsv: TextProperties = {
                        fontSize: `${this.settings.fontSize}px`,
                        fontFamily: this.settings.fontFamily,
                        text: actualVal
                    };
                    let updatedTextv: string;
                    updatedTextv = textMeasurementService.getTailoredTextOrDefault(textPropsv, availableWidth * 0.5);

                    vDataLabel.append('text')
                        .classed('data_totalv', true)
                        .attr(`transform`, `${`translate(`}${(modHeight - difference)}${`,`}${(svgheight - 20)} )`)
                        .style(`fill`, this.settings.DataColor)
                        .style(`font-family`, this.settings.fontFamily)
                        .style(`font-size`, `${this.settings.fontSize}px`)
                        .text(updatedTextv).attr('title', actualTooltip);
                } else {
                    $('.data_totalv').hide();
                }
                if (this.settings.showPercentage) {
                    const textPropspercen: TextProperties = {
                        fontSize: `${this.settings.fontSize}px`,
                        fontFamily: this.settings.fontFamily,
                        text: `${percentageVal.toString()}%`
                    };
                    let updatedTextpercen: string;
                    updatedTextpercen = textMeasurementService.getTailoredTextOrDefault(textPropspercen, availableWidth * 0.5);
                    vDataLabel.append('text').text(updatedTextpercen)
                        .classed('data_percentagev', true)
                        .attr(`transform`, `translate(${(modHeight - difference)}${`,`}${(svgheight - 50)} )`)
                        .style(`fill`, this.settings.PercentageDataColor)
                        .style(`font-family`, this.settings.percentagefontFamily)
                        .style(`font-size`, `${this.settings.percentagefontSize}px`)
                        .attr('title', updatedTextpercen);
                } else {
                    $('.data_percentagev').hide();
                }
            }

            let colors: string[];
            colors = [];
            let offSetValue: number[];
            offSetValue = [];
            this.svgLinear.selectAll(`line.marker`).remove();
            this.svgLinear.selectAll(`line.bestMarker`).remove();
            this.svgLinear.selectAll(`line.markermin`).remove();
            this.svgLinear.selectAll(`line.markermax`).remove();

            let measureColor: string = this.settings.ActualFillColor;
            if (this.data.target !== null) {
                if (this.data.actual > this.data.target) {
                    measureColor = this.settings.ActualFillColorGreater;
                }
            }

            if (this.settings.Orientation === `Horizontal`) {
                let margin1: number;
                let margin2: number;
                let margin3: number;
                let margin4: number;
                this.data.max = xScale.domain()[1];
                if (this.settings.fillOption === `value`) {
                    const range12Max: number = Math.max(this.settings.range1, this.settings.range2);
                    const range123Max: number = Math.max(this.settings.range1, this.settings.range2, this.settings.range3);
                    this.settings.range1 = this.settings.range1 === null ? null
                        : this.settings.range1 < this.data.min ? null
                            : this.settings.range1 > this.data.max ? null : this.settings.range1;
                    this.settings.range2 = this.settings.range2 === null ? null
                        : this.settings.range2 < this.settings.range1 ? this.settings.range1
                            : this.settings.range2 > this.data.max ? null : this.settings.range2;
                    this.settings.range3 = this.settings.range3 === null ? null
                        : this.settings.range3 < range12Max ? range12Max
                            : this.settings.range3 > this.data.max ? null : this.settings.range3;
                    this.settings.range4 = this.settings.range4 === null ? null
                        : this.settings.range4 < range123Max ?
                            range123Max : this.settings.range4 > this.data.max ? null : this.settings.range4;
                    margin1 = this.settings.range1;
                    margin2 = this.settings.range2;
                    margin3 = this.settings.range3;
                    margin4 = this.settings.range4;
                } else {
                    if (this.settings.percentageVal1 > 100) {
                        this.settings.percentageVal1 = 100;
                        this.settings.percentageVal2 = 0;
                        this.settings.percentageVal3 = 0;
                    } else {
                        if (this.settings.percentageVal2 > (100 - this.settings.percentageVal1)) {
                            this.settings.percentageVal2 = 100 - this.settings.percentageVal1;
                            this.settings.percentageVal3 = 0;
                        } else {
                            if (this.settings.percentageVal3 > (100 - this.settings.percentageVal1 - this.settings.percentageVal2)) {
                                this.settings.percentageVal3 = 100 - this.settings.percentageVal1 - this.settings.percentageVal2;
                            }
                        }
                    }
                    margin1 = this.settings.percentageVal1;
                    margin2 = margin1 + this.settings.percentageVal2;
                    margin3 = margin2 + this.settings.percentageVal3;
                }
                this.data.states = [];
                let sortedMeasure: number[];
                sortedMeasure = [];
                for (let iterator: number = 0; iterator < actualValue.length; iterator++) {
                    sortedMeasure[iterator] = actualValue[actualValue.length - iterator - 1];
                }
                if (categoryFlag === 0 && this.settings.showColor) {
                    this.data.states.push(this.data.max);
                    if (this.settings.fillOption === `value`) {
                        this.data.states.push(margin4);
                    }
                    this.data.states.push(margin3);
                    this.data.states.push(margin2);
                    this.data.states.push(margin1);
                } else {
                    this.data.states.push(this.data.max);
                }
                sortedRanges = this.data.states;
                if (this.settings.fillOption === `value`) {
                    range = this.svgLinear.selectAll(`rect.range`)
                        .data(sortedRanges);
                    range.enter()
                        .append(`rect`)
                        .attr(`class`, function (d: number, i: number): string {
                            return rangeLiteral + i;
                        });
                } else {
                    if (this.settings.Orientation === `Horizontal`) {
                        range = this.svgLinear.append(`rect`)
                            .classed(`rectRange`, true)
                            .data(sortedRanges);
                        range.enter()
                            .append('rect');
                    }
                }
                let measureHeight: number;
                let measureYPos: number;

                if (categoryFlag === 0 && this.settings.showColor) {
                    const zoneLen: number = this.colorsGlobal.length;
                    for (let index: number = 0; index < zoneLen; index++) {
                        colors.push(this.colorsGlobal[index]);
                        offSetValue.push(this.data.states[index]);
                    }
                    if (this.settings.fillOption === `value`) {
                        const constID: number = 3;
                        const context: this = this;
                        range.style(`fill`, function (d: number, i: number): string {
                            gradient = context.svgLinear.append('svg:linearGradient');
                            gradient.attr('id', `gradient${(constID + i)}`)
                                .classed('gradientSVG', true)
                                .attr('x1', '100%')
                                .attr('y1', '0%')
                                .attr('x2', '100%')
                                .attr('y2', '100%')
                                .attr('spreadMethod', 'pad');
                            gradient.append('stop').attr('offset', '0%')
                                .attr('stop-color', context.getDarkShade(colors[i], 0.5)).attr('stop-opacity', 1);
                            gradient.append('stop').attr('offset', '100%')
                                .attr('stop-color', colors[i]).attr('stop-opacity', 1);

                            return `url(#gradient${(constID + i)})`;
                        });
                    } else {
                        let context: this;
                        context = this;
                        range.style('fill', function (): string {
                            gradient = context.svgLinear.append('svg:linearGradient');
                            gradient.attr('id', `gradient1`)
                                .classed('gradientSVG', true)
                                .attr('spreadMethod', 'pad');
                            gradient.append('stop')
                                .attr('offset', `${offSetValue[3]}%`)
                                .attr('stop-color', colors[3])
                                .attr('stop-opacity', 1);
                            gradient.append('stop')
                                .attr('offset', `${offSetValue[2]}%`)
                                .attr('stop-color', colors[2])
                                .attr('stop-opacity', 1);
                            gradient.append('stop')
                                .attr('offset', `${offSetValue[1]}%`)
                                .attr('stop-color', colors[1])
                                .attr('stop-opacity', 1);

                            return `url(#gradient1)`;
                        });
                    }
                    measureHeight = modHeight / 2;
                    measureYPos = modHeight / 4;

                } else {
                    gradient = this.svgLinear.append('svg:linearGradient');

                    gradient.attr('id', 'gradient2')
                        .classed('gradientSVG', true)
                        .attr('x1', '100%')
                        .attr('y1', '0%')
                        .attr('x2', '100%')
                        .attr('y2', '100%')
                        .attr('spreadMethod', 'pad');
                    gradient.append('stop').attr('offset', '0%')
                        .attr('stop-color', this.getDarkShade(this.settings.ComparisonFillColor, 0.5)).attr('stop-opacity', 1);
                    gradient.append('stop').attr('offset', '100%')
                        .attr('stop-color', this.settings.ComparisonFillColor).attr('stop-opacity', 1);

                    range.style(`fill`, 'url(#gradient2)');
                    measureHeight = modHeight;
                    measureYPos = 0;
                }
                range
                    .attr(`x`, xScale(xScale.domain()[0]))
                    .attr(`width`, function (d: number): number {

                        let width3: number;
                        width3 = (xScale(d) - xScale(xScale.domain()[0])) < 0 ? 0 : (xScale(d) - xScale(xScale.domain()[0]));

                        return width3;
                    })
                    .attr(`height`, modHeight);

                gradient = this.svgLinear.append('svg:linearGradient');

                gradient.attr('id', 'gradient')
                    .classed('gradientSVG', true)
                    .attr('x1', '100%')
                    .attr('y1', '0%')
                    .attr('x2', '100%')
                    .attr('y2', '100%')
                    .attr('spreadMethod', 'pad');
                gradient.append('stop').attr('offset', '0%')
                    .attr('stop-color', this.getDarkShade(measureColor, 0.5)).attr('stop-opacity', 1);
                gradient.append('stop').attr('offset', '100%')
                    .attr('stop-color', measureColor).attr('stop-opacity', 1);

                //Main measure
                if (categoryFlag === 0) {
                    measure = this.svgLinear
                        .append(`rect`)
                        .classed(`measure`, true)
                        .style(`fill`, 'url(#gradient)');
                    measure.attr(`height`, measureHeight)
                        .attr(`x`, xScale(xScale.domain()[0]))
                        .attr(`y`, measureYPos);
                    if (this.settings.animationToggle) {
                        measure.attr('width', 0)
                            .transition().duration(this.settings.animationTime * 1000)
                            .attr(`width`, xScale(this.data.actual) - xScale(xScale.domain()[0]) < 0 ?
                                0 : xScale(this.data.actual) - xScale(xScale.domain()[0]));
                    } else {
                        measure.attr(`width`, xScale(this.data.actual) - xScale(xScale.domain()[0]) < 0 ?
                            0 : xScale(this.data.actual) - xScale(xScale.domain()[0]));
                    }
                } else if (categoryFlag === 1) {
                    measure2 = this.svgLinear.selectAll(`rect.measure`)
                        .data(sortedMeasure);
                    measure2.enter()
                        .append(`rect`)
                        .attr('class', 'measure')
                        .attr(`id`, function (d: number, index: number): string {
                            return `measureId${index}`;
                        });
                    const constID: number = 3;
                    const context: this = this;
                    measureYPos = modHeight / 4;
                    measure2.style(`fill`, function (d: number, index: number): string {
                        gradient = context.svgLinear.append('svg:linearGradient');
                        gradient.attr('id', `gradientM${(constID + index)}`)
                            .classed('gradientSVG', true)
                            .attr('x1', '100%')
                            .attr('y1', '0%')
                            .attr('x2', '100%')
                            .attr('y2', '100%')
                            .attr('spreadMethod', 'pad');
                        gradient.append('stop').attr('offset', '0%')
                            .attr('stop-color', context.getDarkShade(
                                legendColor[index], 0.5)).attr('stop-opacity', 1);
                        gradient.append('stop').attr('offset', '100%')
                            .attr('stop-color', legendColor[index]).attr('stop-opacity', 1);

                        return `url(#gradientM${(constID + index)})`;
                    });
                    measure2
                        .attr(`height`, function (d: number, index: number): number {

                            return measureHeight / (index / legendLength + 1);
                        })
                        .attr('y', function (d: number, index: number): number {

                            return (measureYPos + (2 * measureYPos - (measureHeight / (index / legendLength + 1))) / 2);
                        })
                        .attr(`x`, xScale(xScale.domain()[0]));
                    if (this.settings.animationToggle) {
                        measure2.attr('width', function (d: number, index: number): number {
                            return 0;
                        })
                            .transition().duration(this.settings.animationTime * 1000)
                            .attr(`width`, function (d: number, index: number): number {
                                let width2: number;
                                width2 = xScale(d) - xScale(xScale.domain()[0]) < 0 ?
                                    0 : xScale(d) - xScale(xScale.domain()[0]);

                                return width2;
                            });
                    } else {
                        measure2.attr(`width`, function (d: number, index: number): number {
                            let width2: number;
                            width2 = xScale(d) - xScale(xScale.domain()[0]) < 0 ?
                                0 : xScale(d) - xScale(xScale.domain()[0]);

                            return width2;
                        });
                    }
                }
                if (this.data.max <= this.data.min) {
                    measure.style(`display`, `none`);
                }

                let hMarker: number;
                let hMarkerMin: number;
                let hMarkerMax: number;
                hMarker = xScale(this.data.target);
                hMarkerMin = xScale(minRangeValue);
                hMarkerMax = xScale(maxRangeValue);
                let markerLine: d3.Selection<SVGElement>;
                markerLine = this.svgLinear
                    .append(`line`)
                    .classed(`marker`, true)
                    .style(`stroke`, `brown`)
                    .attr({
                        x1: hMarker,
                        y1: 0,
                        x2: hMarker,
                        y2: modHeight
                    });
                markerLine.on('mouseover', function(): void {
                    d3.select('.marker').attr('stroke-width', '5');
                });
                markerLine.on('mouseout', function(): void {
                    d3.select('.marker').attr('stroke-width', '1');
                });
                /* Marker code starts here */
                if (this.settings.legendNewPosition === "aboveMarker") {
                    let targetMarker: d3.Selection<SVGElement>;
                    if ( categoryFlag === 1 ) {
                        targetMarker = this.svg.append('polygon')
                            .classed('markerTriangle', true)
                            .attr({
                                points: `${hMarker - 4},${-8} ${hMarker + 4},${-8} ${hMarker}, ${-2}`
                            }).style('fill', 'brown')
                            .attr('stroke', 'brown')
                            .attr('stroke-width', 3);
                    } else {
                        targetMarker = this.svg.append('polygon')
                            .classed('markerTriangle', true)
                            .attr({
                                points: `${hMarker - 4},${-(8)} ${hMarker + 4},
                                ${-(8)} ${hMarker}, ${ - 2}`
                            }).style('fill', 'brown')
                            .attr('stroke', 'brown')
                            .attr('stroke-width', 3);
                    }
                    targetMarker.on('mouseover', function(): void {
                        d3.select('.markerTriangle').attr('stroke-width', 5);
                        d3.select('.marker').attr('stroke-width', '5');
                    });
                    targetMarker.on('mouseout', function(): void {
                        d3.select('.markerTriangle').attr('stroke-width', '3');
                        d3.select('.marker').attr('stroke-width', '1');
                    });
                    markerLine.on('mouseover', function(): void {
                        d3.select('.markerTriangle').attr('stroke-width', 5);
                        d3.select('.marker').attr('stroke-width', '5');
                    });
                    markerLine.on('mouseout', function(): void {
                        d3.select('.markerTriangle').attr('stroke-width', '3');
                        d3.select('.marker').attr('stroke-width', '1');
                    });
                }
                /* Marker code ends here */
                this.svgLinear.selectAll(`line.markerTilt`).remove();
                // best in class
                if (this.data.bestSet) {
                    const bestMarker: number = xScale(this.data.best);
                    this.svgLinear
                        .append(`line`)
                        .classed(`bestMarker`, true)
                        .style('stroke-dasharray', '5, 2')
                        .style(`stroke`, `#000`)
                        .attr({
                            x1: bestMarker,
                            y1: 0,
                            x2: bestMarker,
                            y2: modHeight
                        });
                    // best marker small tick
                    if (this.settings.showScale) {
                        this.svgLinear
                            .append(`line`)
                            .classed(`markerTilt`, true)
                            .style('stroke-dasharray', '5, 2')
                            .style(`stroke`, `#000`)
                            .attr({
                                x1: bestMarker,
                                y1: modHeight,
                                x2: bestMarker,
                                y2: (modHeight + 10)
                            });
                    }
                }

                if (this.settings.showScale) {
                    this.svgLinear
                        .append(`line`)
                        .classed(`markerTilt`, true)
                        .style(`stroke`, `#000`)
                        .attr({
                            x1: hMarker,
                            y1: modHeight,
                            x2: hMarker,
                            y2: (modHeight + 10)
                        });
                }

                if (this.settings.showRange) {
                    let strokeColor: string;
                    strokeColor = this.settings.RangeTicksColor;

                    this.svgLinear
                        .append(`line`)
                        .classed(`markermin`, true)
                        .style(`stroke`, strokeColor)
                        .style('stroke-width', `${this.settings.rangeWidth}px`)
                        .attr({
                            x1: hMarkerMin,
                            y1: 0,
                            x2: hMarkerMin,
                            y2: modHeight
                        })
                        .append('title')
                        .text(minRangeValue);
                    this.svgLinear
                        .append(`line`)
                        .classed(`markermax`, true)
                        .style(`stroke`, strokeColor)
                        .style('stroke-width', `${this.settings.rangeWidth}px`)
                        .attr({
                            x1: hMarkerMax,
                            y1: 0,
                            x2: hMarkerMax,
                            y2: modHeight
                        })
                        .append('title')
                        .text(maxRangeValue);
                    if (this.settings.rangeStyle === 'dotted') {
                        this.svgLinear.selectAll('.markermin, .markermax')
                            .style('stroke-dasharray', ('1, 5'));

                    } else if (this.settings.rangeStyle === 'dashed') {
                        this.svgLinear.selectAll('.markermin, .markermax')
                            .style('stroke-dasharray', ('3, 3'));
                    } else {
                        this.svgLinear.selectAll('.markermin, .markermax')
                            .style('stroke-dasharray', (''));
                    }
                }

                translateVal = `translate(0,${(modHeight + 15)} )`;
                axisFunction = xAxis;
                className = 'lg_xLabels';
            } else {
                offSetValue = [];
                let margin1: number;
                let margin2: number;
                let margin3: number;
                let margin4: number;
                this.data.min = yScale.domain()[0];
                this.data.max = yScale.domain()[1];
                minRangeValue = (this.settings.MinRangeValue === null
                    || this.settings.MinRangeValue < this.data.min
                    || this.settings.MinRangeValue > this.data.max) ? this.data.min : this.settings.MinRangeValue;
                maxRangeValue = (this.settings.MaxRangeValue === null
                    || this.settings.MaxRangeValue < this.data.min
                    || this.settings.MaxRangeValue > this.data.max) ? this.data.max : this.settings.MaxRangeValue;
                let yAxis: d3.svg.Axis;
                yAxis = d3.svg.axis().scale(yScale)
                    .tickFormat(actualFormatter.format)
                    .orient('right');
                const leftPos: number = -(viewport.height / 11);
                let measureLeftPos: number;
                let measureWidth: number;
                let comparsionWidth: number;
                this.svgLinear.selectAll(`rect.range`).remove();
                this.data.max = yScale.domain()[1];

                if (this.settings.fillOption === `value`) {
                    const range12Max: number = Math.max(this.settings.range1, this.settings.range2);
                    const range123Max: number = Math.max(this.settings.range1, this.settings.range2, this.settings.range3);
                    this.settings.range1 = this.settings.range1 === null ? null
                        : this.settings.range1 < this.data.min ? null
                            : this.settings.range1 > this.data.max ? null : this.settings.range1;
                    this.settings.range2 = this.settings.range2 === null ? null
                        : this.settings.range2 < this.settings.range1 ? this.settings.range1
                            : this.settings.range2 > this.data.max ? null : this.settings.range2;
                    this.settings.range3 = this.settings.range3 === null ? null
                        : this.settings.range3 < range12Max ? range12Max
                            : this.settings.range3 > this.data.max ? null : this.settings.range3;
                    this.settings.range4 = this.settings.range4 === null ? null
                        : this.settings.range4 < range123Max ?
                            range123Max : this.settings.range4 > this.data.max ? null : this.settings.range4;
                    margin1 = this.settings.range1;
                    margin2 = this.settings.range2;
                    margin3 = this.settings.range3;
                    margin4 = this.settings.range4;
                } else {
                    if (this.settings.percentageVal1 > 100) {
                        this.settings.percentageVal1 = 100;
                        this.settings.percentageVal2 = 0;
                        this.settings.percentageVal3 = 0;
                    } else {
                        if (this.settings.percentageVal2 > (100 - this.settings.percentageVal1)) {
                            this.settings.percentageVal2 = 100 - this.settings.percentageVal1;
                            this.settings.percentageVal3 = 0;
                        } else {
                            if (this.settings.percentageVal3 > (100 - this.settings.percentageVal1 - this.settings.percentageVal2)) {
                                this.settings.percentageVal3 = 100 - this.settings.percentageVal1 - this.settings.percentageVal2;
                            }
                        }
                    }
                    margin1 = this.settings.percentageVal1;
                    margin2 = margin1 + this.settings.percentageVal2;
                    margin3 = margin2 + this.settings.percentageVal3;
                }
                this.data.states = [];
                if (categoryFlag === 0 && this.settings.showColor) {
                    this.data.states.push(this.data.max);
                    if (this.settings.fillOption === `value`) {
                        this.data.states.push(margin4);
                    }
                    this.data.states.push(margin3);
                    this.data.states.push(margin2);
                    this.data.states.push(margin1);
                } else {
                    this.data.states.push(this.data.max);
                }
                sortedRanges = this.data.states;
                let sortedMeasure2: number[];
                sortedMeasure2 = [];
                for (let index: number = 0; index < actualValue.length; index++) {
                    sortedMeasure2[index] = actualValue[actualValue.length - index - 1];
                }
                if (this.settings.fillOption === 'value') {
                    range = this.svgLinear.selectAll(`rect.range`)
                        .data(sortedRanges);
                    range.enter()
                        .append(`rect`)
                        .attr(`class`, function (d: number, i: number): string {
                            return rangeLiteral + i;
                        });
                } else {
                    range = this.svgLinear.append(`rect`)
                        .classed(`rectRange`, true)
                        .data(sortedRanges);
                    range.enter()
                        .append('rect');
                }
                if (this.settings.showColor) {
                    const zoneLen: number = this.colorsGlobal.length;
                    for (let index: number = 0; index < zoneLen; index++) {
                        colors.push(this.colorsGlobal[index]);
                        offSetValue.push(this.data.states[index]);
                    }
                    if (this.settings.fillOption === `value`) {
                        const constID: number = 3;
                        const context: this = this;
                        range.style(`fill`, function (d: number, index: number): string {
                            gradient = context.svgLinear.append('svg:linearGradient');
                            gradient.attr('id', `gradient${(constID + index)}`)
                                .classed('gradientSVG', true)
                                .attr('x1', '100%')
                                .attr('y1', '100%')
                                .attr('x2', '0%')
                                .attr('y2', '100%')
                                .attr('spreadMethod', 'pad');
                            gradient.append('stop').attr('offset', '0%')
                                .attr('stop-color', context.getDarkShade(context.colorsGlobal[index], 0.5)).attr('stop-opacity', 1);
                            gradient.append('stop').attr('offset', '100%')
                                .attr('stop-color', context.colorsGlobal[index]).attr('stop-opacity', 1);

                            return `url(#gradient${(constID + index)})`;
                        });
                    } else {
                        let context: this;
                        context = this;
                        range.style('fill', function (d: number, index: number): string {

                            if (index === 0) {
                                gradient = context.svgLinear.append('svg:linearGradient');
                                gradient.attr('id', `gradient1`)
                                    .classed('gradientSVG', true)
                                    .attr('x1', '100%')
                                    .attr('y1', '0%')
                                    .attr('x2', '100%')
                                    .attr('y2', '100%')
                                    .attr('spreadMethod', 'pad');
                            } else {
                                gradient.append('stop')
                                    .attr('offset', `${offSetValue[4 - index]}%`)
                                    .attr('stop-color', context.colorsGlobal[4 - index])
                                    .attr('stop-opacity', 1);
                            }

                            return `url(#gradient1)`;
                        });
                    }
                    measureLeftPos = leftPos + modHeight / 4;
                    measureWidth = modHeight / 2;
                    comparsionWidth = modHeight / 6;
                } else {
                    gradient = this.svgLinear.append('svg:linearGradient');

                    gradient.attr('id', 'gradient2')
                        .classed('gradientSVG', true)
                        .attr('x1', '100%')
                        .attr('y1', '100%')
                        .attr('x2', '0%')
                        .attr('y2', '100%')
                        .attr('spreadMethod', 'pad');
                    gradient.append('stop').attr('offset', '0%')
                        .attr('stop-color', this.getDarkShade(this.settings.ComparisonFillColor, 0.5)).attr('stop-opacity', 1);
                    gradient.append('stop').attr('offset', '100%')
                        .attr('stop-color', this.settings.ComparisonFillColor).attr('stop-opacity', 1);

                    range.style(`fill`, 'url(#gradient2)');
                    measureLeftPos = leftPos;
                    measureWidth = modHeight;
                    comparsionWidth = modHeight / 3;
                }
                const visualContext: this = this;
                range.attr(`width`, modHeight)
                    .attr(`height`, function (d: number): number {
                        return (yScale(yScale.domain()[0]) - yScale(d)) < 0
                            ? 0 : (yScale(yScale.domain()[0]) - yScale(d));
                    })
                    .attr(`x`, leftPos)
                    .attr(`y`, -yScale(yScale.domain()[0]))
                    .attr(`transform`, 'rotate(180)');

                gradient = this.svgLinear.append('svg:linearGradient');

                gradient.attr('id', 'gradient')
                    .classed('gradientSVG', true)
                    .attr('x1', '100%')
                    .attr('y1', '100%')
                    .attr('x2', '0%')
                    .attr('y2', '100%')
                    .attr('spreadMethod', 'pad');
                gradient.append('stop').attr('offset', '0%')
                    .attr('stop-color', this.getDarkShade(measureColor, 0.5)).attr('stop-opacity', 1);
                gradient.append('stop').attr('offset', '100%').attr('stop-color', measureColor).attr('stop-opacity', 1);
                //Main measure
                if (categoryFlag === 0) {
                    measure = this.svgLinear
                        .append(`rect`)
                        .classed(`measure`, true)
                        .style(`fill`, 'url(#gradient)')
                        .attr(`transform`, 'rotate(180)');
                    measure
                        .attr(`width`, measureWidth)
                        .attr(`x`, measureLeftPos)
                        .attr(`y`, -yScale(yScale.domain()[0]));
                    if (this.settings.animationToggle) {
                        measure.attr(`height`, 0)
                            .transition().duration(this.settings.animationTime * 1000)
                            .attr(`height`, yScale(yScale.domain()[0]) - yScale(this.data.actual));
                    } else {
                        measure.attr(`height`, yScale(yScale.domain()[0]) - yScale(this.data.actual));
                    }
                } else {
                    measure2 = this.svgLinear.selectAll(`rect.measure`)
                        .data(sortedMeasure2);
                    measure2.enter()
                        .append(`rect`)
                        .attr('class', 'measure')
                        .attr(`id`, function (d: number, index: number): string {
                            return `measureId${index}`;
                        });
                    const constID: number = 3;
                    const context: this = this;
                    measure2.style(`fill`, function (d: number, index: number): string {
                        gradient = context.svgLinear.append('svg:linearGradient');
                        gradient.attr('id', `gradientM${(constID + index)}`)
                            .classed('gradientSVG', true)
                            .attr('x1', '100%')
                            .attr('y1', '100%')
                            .attr('x2', '0%')
                            .attr('y2', '100%')
                            .attr('spreadMethod', 'pad');
                        gradient.append('stop').attr('offset', '0%')
                            .attr('stop-color', context.getDarkShade(
                                legendColor[index], 0.5)).attr('stop-opacity', 1);
                        gradient.append('stop').attr('offset', '100%')
                            .attr('stop-color', legendColor[index]).attr('stop-opacity', 1);

                        return `url(#gradientM${(constID + index)})`;
                    });
                    measure2.attr(`width`, function (d: number, index: number): number {
                        return measureWidth / (index / legendLength + 1);
                    })
                        .attr(`x`, function (d: number, index: number): number {

                            return ((1.085 * measureLeftPos - (measureWidth / (index / legendLength + 1))) / 2);
                        })
                        .attr(`y`, -yScale(yScale.domain()[0]))
                        .attr(`transform`, 'rotate(180)');
                    if (this.settings.animationToggle) {
                        measure2.attr(`height`, function (d: number): number {
                            return 0;
                        })
                            .transition().duration(this.settings.animationTime * 1000)
                            .attr(`height`, function (d: number): number {
                                return (yScale(yScale.domain()[0]) - yScale(d)) < 0
                                    ? 0 : (yScale(yScale.domain()[0]) - yScale(d));
                            });
                    } else {
                        measure2.attr(`height`, function (d: number): number {
                            return (yScale(yScale.domain()[0]) - yScale(d)) < 0
                                ? 0 : (yScale(yScale.domain()[0]) - yScale(d));
                        });
                    }
                }
                if (this.data.max <= this.data.min) {
                    measure.style(`display`, `none`);
                }
                // Remove the Actual value data label if it is going beyond DOM
                const eleLabel: JQuery = $('.LG_verticalDataLabel');
                const eleTrend: JQuery = $('.lg_imagetab');
                if (eleLabel && eleLabel.length && eleLabel[0]) {
                    // tslint:disable-next-line:no-any
                    const domPositionLabel: any = eleLabel[0].getBoundingClientRect();
                    if (domPositionLabel.x < 0) {
                        $('.LG_verticalDataLabel text').remove();
                    }
                }

                let vMarkerMin: number;
                let vMarkerMax: number;
                vMarker = yScale(this.data.target);
                vMarkerMin = yScale(minRangeValue);
                vMarkerMax = yScale(maxRangeValue);
                let markerLine: d3.Selection<SVGElement>;
                markerLine = this.svgLinear
                    .append(`line`)
                    .classed(`marker`, true)
                    .style(`stroke`, `brown`)
                    .attr({
                        x1: 3,
                        y1: vMarker,
                        x2: modHeight + 3,
                        y2: vMarker
                    });
                markerLine.on('mouseover', function(): void {
                    d3.select('.marker').attr('stroke-width', '5');
                });
                markerLine.on('mouseout', function(): void {
                    d3.select('.marker').attr('stroke-width', '1');
                });
                /* Marker Code Starts here */
                if (this.settings.legendNewPosition === "aboveMarker") {
                    let targetMarker: d3.Selection<SVGElement>;
                    targetMarker = this.svg.append('polygon')
                        .classed('markerTriangle', true)
                        .attr({
                            points: `${-5},${vMarker - 4} ${-5},${vMarker + 4} ${3}, ${vMarker}`
                        }).style('fill', 'brown')
                        .attr('stroke', 'brown')
                        .attr('stroke-width', 3);
                    targetMarker.on('mouseover', function(): void {
                        d3.select('.markerTriangle').attr('stroke-width', 5);
                        d3.select('.marker').attr('stroke-width', '5');
                    });
                    targetMarker.on('mouseout', function(): void {
                        d3.select('.markerTriangle').attr('stroke-width', '3');
                        d3.select('.marker').attr('stroke-width', '1');
                    });
                    markerLine.on('mouseover', function(): void {
                        d3.select('.markerTriangle').attr('stroke-width', 5);
                        d3.select('.marker').attr('stroke-width', '5');
                    });
                    markerLine.on('mouseout', function(): void {
                        d3.select('.markerTriangle').attr('stroke-width', '3');
                        d3.select('.marker').attr('stroke-width', '1');
                    });
                }
                /* Marker Code ends here */
                this.svgLinear.selectAll(`line.markerTilt`).remove();
                // best in class
                if (this.data.bestSet) {
                    const bestMarker: number = yScale(this.data.best);
                    this.svgLinear
                        .append(`line`)
                        .classed(`bestMarker`, true)
                        .style('stroke-dasharray', '5, 5')
                        .style(`stroke`, `#000`)
                        .attr({
                            x1: 3,
                            y1: bestMarker,
                            x2: modHeight + 3,
                            y2: bestMarker
                        });
                    if (this.settings.showScale) {
                        this.svgLinear
                            .append(`line`)
                            .classed(`markerTilt`, true)
                            .style('stroke-dasharray', '5, 5')
                            .style(`stroke`, `#000`)
                            .attr({
                                x1: modHeight + 3,
                                y1: bestMarker,
                                x2: modHeight + 10,
                                y2: bestMarker
                            });
                    }
                }

                if (this.settings.showScale) {
                    this.svgLinear
                        .append(`line`)
                        .classed(`markerTilt`, true)
                        .style(`stroke`, `#000`)
                        .attr({
                            x1: modHeight + 3,
                            y1: vMarker,
                            x2: modHeight + 10,
                            y2: vMarker
                        });
                }
                if (this.settings.showRange) {
                    let strokeColor: string;
                    strokeColor = this.settings.RangeTicksColor;
                    this.svgLinear
                        .append(`line`)
                        .classed(`markermin`, true)
                        .style(`stroke`, strokeColor)
                        .style('stroke-width', `${this.settings.rangeWidth}px`)
                        .attr({
                            x1: 3,
                            y1: vMarkerMin,
                            x2: modHeight + 3,
                            y2: vMarkerMin
                        });

                    this.svgLinear
                        .append(`line`)
                        .classed(`markermax`, true)
                        .style(`stroke`, strokeColor)
                        .style('stroke-width', `${this.settings.rangeWidth}px`)
                        .attr({
                            x1: 3,
                            y1: vMarkerMax,
                            x2: modHeight + 3,
                            y2: vMarkerMax
                        });
                    if (this.settings.rangeStyle === 'dotted') {
                        this.svgLinear.selectAll('.markermin, .markermax')
                            .style('stroke-dasharray', ('1, 5'));

                    } else if (this.settings.rangeStyle === 'dashed') {
                        this.svgLinear.selectAll('.markermin, .markermax')
                            .style('stroke-dasharray', ('3, 3'));
                    } else {
                        this.svgLinear.selectAll('.markermin, .markermax')
                            .style('stroke-dasharray', (''));
                    }
                }

                translateVal = `${`translate(`}${(modHeight + 15)}${`,`}${(0)})`;
                axisFunction = yAxis;
                className = 'lg_yLabels';
            }

            let availablewidth: number;
            availablewidth = parseInt($('.linearSVG').css('marginLeft').toString(), 10) - $('.linearSVG').width();

            this.targetLegend.select(`.targetLabel`).remove();
            if (this.settings.legendShow) {
                if (this.data.target) {
                    let targetFormatter: IValueFormatter;
                    targetFormatter = ValueFormatter.create({
                        format: this.data.targetFormat, precision: this.settings.legendDecimalPlaces,
                        value: this.settings.legendDisplayUnits === 0 ?
                            this.getValueUpdated(this.data.target) : this.settings.legendDisplayUnits
                    });
                    let legendTextProperties: TextProperties;
                    legendTextProperties = {
                        fontFamily: `${this.settings.legendFontFamily}`,
                        fontSize: `${this.settings.legendFontSize}px`,
                        text: `${targetFormatter.format(this.data.target)} ${this.data.targetColName}`
                    };
                    if (this.settings.legendNewPosition === "topLeft") {
                        legendTextProperties.text = `| ${targetFormatter.format(this.data.target)} ${this.data.targetColName}`;
                    }
                    const legendHorizontalWidth: number = (this.data.trend1Exists || this.data.trend2Exists) ?
                        (options.viewport.width / 2.5) - 20 : options.viewport.width - 20;
                    const targetTooltip: string = this.getFormattedTooltipData(this.data.targetFormat, this.data.target);
                    if (this.settings.Orientation === 'Horizontal') {
                        updatedText = textMeasurementService.getTailoredTextOrDefault(legendTextProperties, legendHorizontalWidth);
                    } else {
                        updatedText = textMeasurementService.getTailoredTextOrDefault(legendTextProperties, availablewidth * 0.8);
                    }

                    this.targetLegend.append(`span`)
                        .classed(`targetLabel`, true)
                        .text(updatedText)
                        .style({
                            'font-size': `${this.settings.legendFontSize}px`,
                            'font-family': this.settings.legendFontFamily
                        }).style('color', this.settings.legendColor)
                        .attr('title', `${targetTooltip} ${this.data.targetColName}`);
                    let divWidth: number;
                    if ( this.rootElement.select('.lg_legend_tab') ) {
                        divWidth = parseFloat(d3.select('.lg_legend_tab').style('width'));
                    }
                    if ( categoryFlag === 0 && this.settings.Orientation === 'Vertical' ) {
                        if (this.settings.legendNewPosition === "aboveMarker") {
                            d3.selectAll('.lg_legend_tab')
                            .style('margin-left', `${(viewport.width / 2) - (modHeight / 2) - divWidth - 10}px`);
                        } else {
                            d3.selectAll('.lg_legend_tab')
                            .style('margin-left', `20px`);
                        }
                        //$('.lg_legend_tab').css('left', 'auto').css('bottom', viewport.height / 2 + 'px');
                    } else if (categoryFlag === 1 && this.settings.Orientation === 'Vertical') {
                        if (this.settings.legendPos === 'Left' || this.settings.legendPos === 'Left center') {
                            if (this.settings.legendNewPosition === "aboveMarker") {
                                d3.selectAll('.lg_legend_tab')
                                .style('margin-left', `${(viewport.width / 2) - (modHeight / 2) - divWidth - 10}px`);
                            } else {
                                d3.selectAll('.lg_legend_tab')
                                .style('margin-left', `${legendHeight.width + 20}px`);
                            }
                        } else {
                            if (this.settings.legendNewPosition === "aboveMarker") {
                                d3.selectAll('.lg_legend_tab')
                                .style('margin-left', `${(viewport.width / 2) - (modHeight / 2) - divWidth - 10}px`);
                            } else {
                                d3.selectAll('.lg_legend_tab')
                                .style('margin-left', `20px`);
                            }
                        }
                    }
                    if (categoryFlag === 0 && this.settings.Orientation === 'Horizontal' ) {
                        if (this.settings.legendNewPosition === "aboveMarker") {
                            d3.selectAll('.lg_legend_tab').style('margin-left', `${xScale(this.data.target) - (divWidth / 2)}px`);
                        } else {
                            d3.selectAll('.lg_legend_tab').style('margin-left', `${legendHeight.width + 20}px`);
                        }
                    } else if (categoryFlag === 1 && this.settings.Orientation === `Horizontal`) {
                        if (this.settings.legendPos === 'Left' || this.settings.legendPos === 'Left center') {
                            if (this.settings.legendNewPosition === "aboveMarker") {
                                d3.selectAll('.lg_legend_tab').style('margin-left', `${xScale(this.data.target) -
                                    (divWidth / 2) + legendHeight.width}px`);
                            } else {
                                d3.selectAll('.lg_legend_tab').style('margin-left', `${legendHeight.width + 20}px`);
                            }
                        } else {
                            if (this.settings.legendNewPosition === "aboveMarker") {
                                d3.selectAll('.lg_legend_tab').style('margin-left', `${xScale(this.data.target) - (divWidth / 2)}px`);
                            } else {
                                d3.selectAll('.lg_legend_tab').style('margin-left', `${20}px`);
                            }
                        }
                    }
                }

                this.bestLegend.selectAll(`.bestLabel`).remove();
                if (this.data.best && this.settings.legendShow) {
                    let bestFormatter: IValueFormatter;
                    bestFormatter = ValueFormatter.create({
                        format: this.data.bestFormat, precision: this.settings.legendDecimalPlaces,
                        value: this.settings.legendDisplayUnits === 0 ?
                            this.getValueUpdated(this.data.best) : this.settings.legendDisplayUnits
                    });
                    const legendProperties: TextProperties = {
                        fontFamily: `${this.settings.legendFontFamily}`,
                        fontSize: `${this.settings.legendFontSize}px`,
                        text: `${bestFormatter.format(this.data.best)} ${this.data.bestColName}`
                    };
                    const hWidth: number = (this.data.trend1Exists || this.data.trend2Exists) ?
                        (options.viewport.width / 2.5) - 20 : options.viewport.width - 20;
                    const bestTooltip: string = this.getFormattedTooltipData(this.data.bestFormat, this.data.best);
                    if (this.settings.Orientation === 'Horizontal') {
                        updatedText = textMeasurementService.getTailoredTextOrDefault(legendProperties, hWidth);
                    } else {
                        updatedText = textMeasurementService.getTailoredTextOrDefault(legendProperties, availablewidth * 0.8);
                    }

                    this.bestLegend.append(`span`)
                        .classed(`bestLabel`, true)
                        .html('&#9478')
                        .style({
                            'margin-left': `${-this.settings.legendFontSize / 3}px`,
                            'font-size': `${this.settings.legendFontSize}px`
                        }).style('color', this.settings.legendColor)
                        .attr('title', `${bestTooltip} ${this.data.bestColName}`);

                    this.bestLegend.append(`span`)
                        .classed(`bestLabel`, true)
                        .text(updatedText)
                        .style({
                            'font-size': `${this.settings.legendFontSize}px`,
                            'font-family': this.settings.legendFontFamily
                        }).style('color', this.settings.legendColor);
                }
            } else {
                this.targetLegend.selectAll('*').remove();
                this.bestLegend.selectAll('*').remove();
            }

            if (this.settings.showTrend) {
                //$('.lg_imagetab').css('display', 'block');

                let updatedText1: string;
                let updatedText2: string;
                const arrowColorI1: string = this.settings.Indicator1;
                const arrowColorI2: string = this.settings.Indicator2;

                if (this.data.trend1Exists) {
                    const trend1ValText: string = this.data.trend1ColName;
                    const textProps1: TextProperties = {
                        fontSize: `${this.settings.trendfontSize}px`,
                        fontFamily: this.settings.trendfontFamily,
                        text: `${trend1Val} ${trend1ValText}`
                    };
                    if (this.settings.Orientation === 'Horizontal') {
                        updatedText1 = textMeasurementService.getTailoredTextOrDefault(textProps1, (options.viewport.width / 2.1) - 20);
                    } else {
                        updatedText1 = textMeasurementService.getTailoredTextOrDefault(textProps1, availablewidth * 0.8);
                    }
                    this.trendValue1.style(`display`, `inline`);
                    this.trendValue1.select(`span.trendvalue1arrow`).remove();
                    this.trendValue1.select(`span`).remove();
                    this.trendValue1.append(`span`)
                        .classed(`trendvalue1arrow`, true)
                        .html(upArrow)
                        .style({
                            color: arrowColorI1,
                            'font-size': `${percentageFontTrend + 6}px`,
                            'font-family': this.settings.trendfontFamily
                        });

                    const trend1Tooltip: string = this.getFormattedTooltipData(this.data.trend1Format, this.data.trendValueOne);
                    this.trendValue1.append(`span`).classed(`trendvalue1text`, true)
                        .text(updatedText1)
                        .style({
                            color: this.settings.trendColor,
                            'font-size': `${this.settings.trendfontSize}px`,
                            'font-family': this.settings.trendfontFamily
                        })
                        .attr('title', `${trend1Tooltip} ${trend1ValText}`);

                    if (this.data.trendValueOne < 0) {
                        $('.trendvalue1arrow').css({
                            transform: 'rotate(90deg)',
                            display: 'inline-block'
                        });
                    }
                } else {
                    this.trendValue1.style(`display`, `none`);
                }

                if (this.data.trend2Exists) {
                    const trend2ValText: string = this.data.trend2ColName;
                    const textProps2: TextProperties = {
                        fontSize: `${this.settings.trendfontSize}px`,
                        fontFamily: this.settings.trendfontFamily,
                        text: `${trend2Val} ${trend2ValText}`
                    };
                    if (this.settings.Orientation === 'Horizontal') {
                        updatedText2 = textMeasurementService.getTailoredTextOrDefault(textProps2, (options.viewport.width / 2.1) - 20);
                    } else {
                        updatedText2 = textMeasurementService.getTailoredTextOrDefault(textProps2, availablewidth * 0.8);
                    }

                    this.trendValue2.style(`display`, `inline`);
                    this.trendValue2.select(`span.trendvalue2arrow`).remove();
                    this.trendValue2.select(`span`).remove();

                    this.trendValue2.append(`span`)
                        .classed(`trendvalue2arrow`, true)
                        .html(upArrow)
                        .style({
                            color: arrowColorI2,
                            'font-size': `${percentageFontTrend + 6}px`,
                            'font-family': this.settings.trendfontFamily
                        });
                    const trend2Tooltip: string = this.getFormattedTooltipData(this.data.trend2Format, this.data.trendValueTwo);
                    this.trendValue2.append(`span`).classed(`trendvalue2text`, true)
                        .text(updatedText2)
                        .style({
                            color: this.settings.trendColor,
                            'font-size': `${this.settings.trendfontSize}px`,
                            'font-family': this.settings.trendfontFamily
                        })
                        .attr('title', `${trend2Tooltip} ${trend2ValText} `);
                    if (this.data.trendValueTwo < 0) {
                        $('.trendvalue2arrow').css({
                            transform: 'rotate(90deg)',
                            display: 'inline-block'
                        });
                    }
                } else {
                    this.trendValue2.style(`display`, `none`);
                }
                trendLabelHeight = $('.lg_imagetab').innerHeight();
                targetLabelHeight = $('.lg_legend_target').height();
                const eleLabel: JQuery = this.settings.Orientation === 'Horizontal' ? $('.lg_data_tab') : $('.LG_verticalDataLabel');
                const eleTrend: JQuery = $('.lg_imagetab');
                const eleLegend: JQuery = $('.lg_legend_tab');

                // tslint:disable-next-line:no-any
                const domPositonLegend: any = eleLegend[0].getBoundingClientRect();
                // tslint:disable-next-line:no-any
                const domPositonTrend: any = eleTrend[0].getBoundingClientRect();
                const overlap: boolean = !(domPositonTrend.right < domPositonLegend.left ||
                    domPositonTrend.left > domPositonLegend.right ||
                    domPositonTrend.bottom < domPositonLegend.top ||
                    domPositonTrend.top > domPositonLegend.bottom);
                if (overlap) {
                    $('.lg_legend_tab span').remove();
                }
                if (eleLabel && eleLabel.length && eleLabel[0]) {
                    // tslint:disable-next-line:no-any
                    const domPositonLabel: any = eleLabel[0].getBoundingClientRect();
                    const overlap1: boolean = !(domPositonLabel.right < domPositonTrend.left ||
                        domPositonLabel.left > domPositonTrend.right ||
                        domPositonLabel.bottom < domPositonTrend.top ||
                        domPositonLabel.top > domPositonTrend.bottom);
                    const overlap2: boolean = !(domPositonLabel.right < domPositonLegend.left ||
                        domPositonLabel.left > domPositonLegend.right ||
                        domPositonLabel.bottom < domPositonLegend.top ||
                        domPositonLabel.top > domPositonLegend.bottom);
                    if (overlap1) {
                        this.settings.Orientation === 'Horizontal' ? $('.lg_imagetab span')
                            .remove() : $('.LG_verticalDataLabel text').remove();
                    }
                    if (overlap2) {
                        this.settings.Orientation === 'Horizontal' ? $('.lg_legend_tab span')
                            .remove() : $('.LG_verticalDataLabel text').remove();
                    }
                }
            }

            if (this.settings.showScale) {
                let markings: d3.Selection<SVGElement>;
                markings = this.svg.append('g').classed(`${className}`, true);
                markings
                    .attr(`transform`, translateVal)
                    .style({
                        'font-family': `${this.settings.scaleFontFamily}`,
                        'font-size': `${this.settings.scaleFontSize}px`,
                        stroke: `none`,
                        fill: this.settings.scaleColor
                    })
                    .call(axisFunction);

                d3.selectAll('g.tick title').remove();
                const THIS: this = this;
                d3.selectAll('g.tick')
                    .append('title')
                    .text(function (d: number): string {
                        const val: string = THIS.getFormattedTooltipData(THIS.data.actualFormat, d);

                        return val;
                    });

                if (height) {
                    markings.selectAll(`path,line`).style({
                        stroke: this.settings.scaleColor,
                        fill: `none`
                    });
                }

                if (this.settings.Orientation === 'Horizontal') {
                    let totalTicks: number;
                    totalTicks = d3.selectAll('.lg_xLabels g.tick text')[0].length;
                    d3.selectAll('.lg_xLabels g.tick text')
                        .text(function (d: string): string {
                            const tickProperty: TextProperties = {
                                fontFamily: `${$this.settings.scaleFontFamily}`,
                                fontSize: `${$this.settings.scaleFontSize}px`,
                                text: axisFormatter.format(d)
                            };
                            const tickAvailWidth: number = textMeasurementService.measureSvgTextWidth(tickProperty) + 1;

                            return textMeasurementService.getTailoredTextOrDefault(tickProperty, (options.viewport.width -
                                halfMaxFormattedDataWidth) / totalTicks);
                        });
                    const ticks: JQuery = $('.lg_xLabels g.tick');
                    // tslint:disable-next-line:no-any
                    const domPositonTick1: any = ticks[0].getBoundingClientRect();
                    const tickLen: number = !!d3.selectAll('.lg_xLabels g.tick') ? d3.selectAll('.lg_xLabels g.tick')[0].length : 1;
                    // tslint:disable-next-line:no-any
                    const domPositonTick2: any = ticks[tickLen - 1].getBoundingClientRect();
                    const precede: boolean = !(domPositonTick1.right < domPositonTick2.left);
                    if (precede) {
                        this.svg.selectAll('.lg_xLabels').remove();
                        this.svg.selectAll('.marker, .markermax, .markermin, .bestMarker, .markerTilt').remove();
                    }
                } else {
                    let totalTicks: number;
                    totalTicks = d3.selectAll('.lg_yLabels g.tick text')[0].length;
                    d3.selectAll('.lg_yLabels g.tick text')
                        .text(function (d: string): string {
                            const tickProperties: TextProperties = {
                                fontFamily: `${$this.settings.scaleFontFamily}`,
                                fontSize: `${$this.settings.scaleFontSize}px`,
                                text: axisFormatter.format(d)
                            };
                            const tickAvailWidth: number = textMeasurementService.measureSvgTextWidth(tickProperties) + 1;

                            return textMeasurementService.getTailoredTextOrDefault(tickProperties, (options.viewport.width -
                                halfMaxFormattedDataWidth) / totalTicks);
                        });
                    const tickLen: number = !!d3.selectAll('.lg_yLabels g.tick') ? d3.selectAll('.lg_yLabels g.tick')[0].length : 1;
                    if ($('.tick')[tickLen - 1].getBoundingClientRect().right > viewport.width) {
                        this.svg.selectAll('.lg_yLabels').remove();
                        this.svgLinear.selectAll(`line.markerTilt`).remove();
                    }
                    const ticks: JQuery = $('.lg_yLabels g.tick');
                    // tslint:disable-next-line:no-any
                    const domPositonTick1: any = ticks[0].getBoundingClientRect();
                    // tslint:disable-next-line:no-any
                    const domPositonTick2: any = ticks[1].getBoundingClientRect();
                    const overlap: boolean = !(domPositonTick1.right < domPositonTick2.left ||
                        domPositonTick1.left > domPositonTick2.right ||
                        domPositonTick1.bottom < domPositonTick2.top ||
                        domPositonTick1.top > domPositonTick2.bottom);
                    if (overlap) {
                        this.svg.selectAll('.lg_yLabels').remove();
                    }
                }
            }

            if (this.data.target < this.data.min || !(this.data.targetSet) || this.data.target > this.data.max) {
                this.svgLinear.selectAll(`line.marker`).remove();
                this.svgLinear.selectAll(`line.markerTilt`).remove();
            } else {
                this.svgLinear.selectAll(`.marker`).style(`display`, `block`);
                this.svgLinear.selectAll(`line.markerTilt`).style(`display`, `block`);
            }
            if (categoryFlag === 1) {
                prevFlag = options.dataViews[0].categorical.categories[0].values.length;
            }
            if (categoryFlag === 1 && this.settings.Orientation === `Vertical` &&
                (this.settings.legendPos === 'Bottom' || this.settings.legendPos === 'Bottom center' ||
                    this.settings.legendPos === 'Top' || this.settings.legendPos === 'Top center')) {
                viewport.height = viewport.height + legendHeight.height;
            } else if (categoryFlag === 1 && this.settings.Orientation === `Horizontal` &&
                (this.settings.legendPos === 'Right' || this.settings.legendPos === 'Right center' ||
                    this.settings.legendPos === 'Left' || this.settings.legendPos === 'Left center')) {
                viewport.width = viewport.width + legendHeight.width + 15;
            } else if (categoryFlag === 1 && this.settings.Orientation === `Horizontal` &&
                (this.settings.legendPos === 'Bottom' || this.settings.legendPos === 'Bottom center')) {
                viewport.height = viewport.height + legendHeight.height;
            }
            // Remove elements if width not available
            const eleWidth: number = $('.lg_data_tab').width() + $('.lg_imagetab').width() + 20;

            const actualTooltipVal: string = this.getFormattedTooltipData(this.data.actualFormat, this.data.actual);
            let tooltipData: ITooltipData[];
            tooltipData = [];
            tooltipData.push({
                displayName: this.data.actualColName,
                value: actualTooltipVal
            });
            if (this.data.targetExists) {
                const targetTooltipVal: string = this.getFormattedTooltipData(this.data.targetFormat, this.data.target);
                tooltipData.push({
                    displayName: this.data.targetColName,
                    value: targetTooltipVal
                });
            }
            if (this.data.min && this.data.minFlag) {
                const minTooltipVal: string = this.getFormattedTooltipData(this.data.minFormat, this.data.min);
                tooltipData.push({
                    displayName: this.data.minColName,
                    value: minTooltipVal
                });
            }
            if (this.data.max && this.data.maxFlag) {
                const maxTooltipVal: string = this.getFormattedTooltipData(this.data.maxFormat, this.data.max);
                tooltipData.push({
                    displayName: this.data.maxColName,
                    value: maxTooltipVal
                });
            }
            if (this.data.best) {
                const bestTooltipVal: string = this.getFormattedTooltipData(this.data.bestFormat, this.data.best);
                tooltipData.push({
                    displayName: this.data.bestColName,
                    value: bestTooltipVal
                });
            }
            this.tooltipServiceWrapper.addTooltip(
                this.svgLinear.selectAll('rect.range,rect.rectRange'),
                (tooltipEvent: TooltipEventArgs<number>) => tooltipData,
                (tooltipEvent: TooltipEventArgs<number>) => null);
            if ( categoryFlag === 0 ) {
                this.tooltipServiceWrapper.addTooltip(
                    this.svgLinear.selectAll('rect.measure,rect.range,rect.rectRange'),
                    (tooltipEvent: TooltipEventArgs<number>) => tooltipData,
                    (tooltipEvent: TooltipEventArgs<number>) => null);
            }
            if ( tooltipFLag === 0 ) {
                for ( let index: number = 0; index < linearDataPoint.length; index++ ) {
                    this.tooltipServiceWrapper.addTooltip(
                        this.svgLinear.selectAll(`rect#measureId${linearDataPoint.length - index - 1}`),
                        (tooltipEvent: TooltipEventArgs<number>) => tooltip[index].tooltipDataPoint,
                        (tooltipEvent: TooltipEventArgs<number>) => null);
                }
            } else {
                this.tooltipServiceWrapper.addTooltip(
                    this.svgLinear.selectAll(`rect#measureId0`),
                    (tooltipEvent: TooltipEventArgs<number>) => tooltip[0].tooltipDataPoint,
                    (tooltipEvent: TooltipEventArgs<number>) => null);
            }
        }

        public getValueUpdated(d: number): number {
            let primaryFormatterVal: number = 0;
            const alternateFormatter: number = parseInt(d.toString(), 10).toString().length;
            if (alternateFormatter > 9) {
                primaryFormatterVal = 1e9;
            } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                primaryFormatterVal = 1e6;
            } else if (alternateFormatter <= 6 && alternateFormatter > 4) {
                primaryFormatterVal = 1e3;
            } else {
                primaryFormatterVal = 10;
            }

            return primaryFormatterVal;
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName: string;
            objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[];
            objectEnumeration = [];
            if (!this.data) {
                this.data = LinearGauge.getDefaultData();
            }
            switch (options.objectName) {
                case `ChartOrientation`:
                    objectEnumeration.push({
                        objectName: objectName,
                        selector: null,
                        properties: {
                            Orientation: this.settings.Orientation
                        }
                    });
                    break;
                case `legendSettings`:
                    objectEnumeration.push({
                        objectName: objectName,
                        selector: null,
                        properties: {
                            show: this.settings.legendShow,
                            position: this.settings.legendNewPosition,
                            fill: this.settings.legendColor,
                            fontSize: this.settings.legendFontSize,
                            fontFamily: this.settings.legendFontFamily,
                            displayUnits: this.settings.legendDisplayUnits,
                            decimalPlaces: this.settings.legendDecimalPlaces
                        }
                    });
                    break;
                case 'categorySettings':
                    if (categoryFlag === 1) {
                        objectEnumeration.push({
                            objectName: objectName,
                            selector: null,
                            properties: {
                                fontSize: this.settings.categoryFontSize,
                                title: this.settings.categoryTitle,
                                color: this.settings.legendTextColor,
                                position: this.settings.legendPos
                            }
                        });
                    }
                    break;
                case 'colors':
                    if (categoryFlag === 1) {
                        for (let index: number = 0; index < categoryLegend.length; index++) {
                            objectEnumeration.push({
                                objectName: objectName,
                                displayName: categoryLegend[index].key,
                                properties: {
                                    fillColor: {
                                        solid: {
                                            color: categoryLegend[index].color
                                        }
                                    }
                                },
                                selector: categoryLegend[index].selectionId.getSelector()
                            });
                        }
                    }
                    break;
                case 'animationEffect':
                    objectEnumeration.push({
                        objectName: objectName,
                        selector: null,
                        properties: {
                            show: this.settings.animationToggle,
                            animationTime: this.settings.animationTime
                        }
                    });
                    break;
                case `colorSelector`:
                    if (categoryFlag === 0) {
                        if (this.settings.fillOption === `value`) {
                            objectEnumeration.push({
                                objectName: objectName,
                                selector: null,
                                properties: {
                                    show: this.settings.showColor,
                                    fillOption: this.settings.fillOption,
                                    range1: this.settings.range1,
                                    Zone1: this.settings.Zone1,
                                    range2: this.settings.range2,
                                    Zone2: this.settings.Zone2,
                                    range3: this.settings.range3,
                                    Zone3: this.settings.Zone3,
                                    range4: this.settings.range4,
                                    Zone4: this.settings.Zone4
                                }
                            });
                        } else {
                            objectEnumeration.push({
                                objectName: objectName,
                                selector: null,
                                properties: {
                                    show: this.settings.showColor,
                                    fillOption: this.settings.fillOption,
                                    percentage1: this.settings.percentageVal1,
                                    area1: this.settings.area1,
                                    percentage2: this.settings.percentageVal2,
                                    area2: this.settings.area2,
                                    percentage3: this.settings.percentageVal3,
                                    area3: this.settings.area3
                                }
                            });
                        }
                    }
                    break;
                case `ScaleSettings`:
                    objectEnumeration.push({
                        objectName: objectName,
                        selector: null,
                        properties: {
                            show: this.settings.showScale,
                            color: this.settings.scaleColor,
                            fontSize: this.settings.scaleFontSize,
                            fontFamily: this.settings.scaleFontFamily,
                            displayUnits: this.settings.scaleDisplayUnits,
                            decimalPlaces: this.settings.scaleDecimalPlaces
                        }
                    });
                    break;
                case `TargetRange`:
                    objectEnumeration.push({
                        objectName: objectName,
                        selector: null,
                        properties: {
                            show: this.settings.showRange,
                            MinRangeValue: this.settings.MinRangeValue,
                            MaxRangeValue: this.settings.MaxRangeValue,
                            RangeTicksColor: this.settings.RangeTicksColor,
                            rangeWidth: this.settings.rangeWidth,
                            rangeStyle: this.settings.rangeStyle
                        }
                    });
                    break;
                case `Indicator`:
                    if (this.data.trendValueOne || this.data.trendValueTwo) {
                        let props: {};
                        props = {};
                        if (this.data.trendValueOne) {
                            props[`Indicator1`] = this.settings.Indicator1;
                        }
                        if (this.data.trendValueTwo) {
                            props[`Indicator2`] = this.settings.Indicator2;
                        }
                        objectEnumeration.push({
                            objectName: objectName,
                            selector: null,
                            properties: props
                        });
                    }
                    break;
                case `general`:
                    objectEnumeration.push({
                        objectName: `general`,
                        selector: null,
                        properties: {
                            ActualFillColor: {
                                solid: {
                                    color: this.settings.ActualFillColor
                                }
                            },
                            ActualFillColorGreater: {
                                solid: {
                                    color: this.settings.ActualFillColorGreater
                                }
                            },
                            ComparisonFillColor: {
                                solid: {
                                    color: this.settings.ComparisonFillColor
                                }
                            }
                        }
                    });
                    break;
                case `labels`:
                    objectEnumeration.push({
                        objectName: `labels`,
                        selector: null,
                        properties: {
                            show: this.settings.showlabel,
                            DataColor: {
                                solid: {
                                    color: this.settings.DataColor
                                }
                            },
                            fontSize: this.settings.fontSize,
                            fontFamily: this.settings.fontFamily,
                            labelDisplayUnits: this.settings.labelDisplayUnits,
                            markerWidth: this.settings.markerWidth
                        }
                    });
                    break;
                case `trendLabels`:
                    if (this.data.trendValueOne || this.data.trendValueTwo) {
                        let props: {} = { show: this.settings.showTrend };
                        if (this.settings.showTrend) {
                            props = {
                                show: this.settings.showTrend,
                                trendColor: {
                                    solid: {
                                        color: this.settings.trendColor
                                    }
                                },
                                fontSize: this.settings.trendfontSize,
                                fontFamily: this.settings.trendfontFamily,
                                trendDisplayUnits: this.settings.trendDisplayUnits,
                                lineWidth: this.settings.lineWidth
                            };
                        }
                        objectEnumeration.push({
                            objectName: objectName,
                            selector: null,
                            properties: props
                        });
                    }
                    break;
                case `PercentageDatalabels`:
                    objectEnumeration.push({
                        objectName: `PercentageDataLabels`,
                        selector: null,
                        properties: {
                            show: this.settings.showPercentage,
                            showRemaining: this.settings.showRemainingPercentage,
                            PercentageDataColor: {
                                solid: {
                                    color: this.settings.PercentageDataColor
                                }
                            },
                            fontSize: this.settings.percentagefontSize,
                            fontFamily: this.settings.percentagefontFamily

                        }
                    });
                    break;
                default:
                    break;
            }

            return objectEnumeration;
        }
    }
}
