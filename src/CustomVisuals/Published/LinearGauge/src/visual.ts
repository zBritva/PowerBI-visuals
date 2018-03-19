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
    const rangeLiteral: string = `range s`;

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
        trendValue1: number;
        trendValue2: number;
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

    interface ITooltipData {
        displayName: string;
        value: string;
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
                trendValue1: 0,
                trendValue2: 0,
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

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);

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
        public static converter(dataView: DataView): ILinearGauge {
            let data: ILinearGauge;
            data = LinearGauge.getDefaultData();
            if (!dataView || !dataView.categorical || dataView.categorical.values === undefined) {
                return;
            }
            let actualFlag: boolean;
            actualFlag = false;
            let values: DataViewValueColumns;
            values = dataView.categorical.values;
            for (let i: number = 0; i < values.length; i++) {
                let col: DataViewMetadataColumn;
                col = dataView.categorical.values[i].source;
                let value: PrimitiveValue;
                value = values[i].values[0] || null;
                if (col.roles[`Y`]) { // we are matching the role and populating value
                    data.actualFormat = col.format;
                    data.actual = <number>value;
                    actualFlag = true;
                    data.actualExists = true;
                    data.actualColName = col.displayName;
                }
                if (col.roles[`MinValue`]) {
                    data.minFlag = true;
                    data.min = <number>value;
                    data.minColName = col.displayName;
                    data.minFormat = col.format;
                }
                if (col.roles[`MaxValue`]) {
                    data.maxFlag = true;
                    data.max = <number>value;
                    data.maxColName = col.displayName;
                    data.maxFormat = col.format;
                }
                if (col.roles[`TargetValue`]) {
                    data.targetSet = true;
                    data.targetFormat = col.format;
                    data.target = <number>value;
                    data.targetExists = true;
                    data.targetColName = col.displayName;
                }
                if (col.roles[`QualitativeState1Value`]) {
                    data.trendValue1 = <number>value;
                    data.trend1Format = col.format;
                    data.trend1Exists = true;
                    data.trend1ColName = col.displayName;
                }
                if (col.roles[`QualitativeState2Value`]) {
                    data.trendValue2 = <number>value;
                    data.trend2Format = col.format;
                    data.trend2Exists = true;
                    data.trend2ColName = col.displayName;
                }
                if (col.roles[`BestValue`]) {
                    data.best = <number>value;
                    data.bestFormat = col.format;
                    data.bestSet = true;
                    data.bestColName = col.displayName;
                }
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

        public getDarkShade(colorHEX, opacity) {
            colorHEX = String(colorHEX).replace(/[^0-9a-f]/gi, '');
            if (colorHEX.length < 6) {
                colorHEX = colorHEX[0] + colorHEX[0] + colorHEX[1] + colorHEX[1] + colorHEX[2] + colorHEX[2];
            }
            opacity = opacity || 0;

            var rgb = "#", c, iCounter;
            for (iCounter = 0; iCounter < 3; iCounter++) {
                c = parseInt(colorHEX.substr(iCounter * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * opacity)), 255)).toString(16);
                rgb += ("00" + c).substr(c.length);
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

                let minValue: number = getValue<number>(objects, `TargetRange`, `MinRangeValue`, null);
                let maxValue: number = getValue<number>(objects, `TargetRange`, `MaxRangeValue`, null);
                let range1Val: number = getValue<number>(objects, `colorSelector`, `range1`, null);
                let range2Val: number = getValue<number>(objects, `colorSelector`, `range2`, null);
                let range3Val: number = getValue<number>(objects, `colorSelector`, `range3`, null);
                let range4Val: number = getValue<number>(objects, `colorSelector`, `range4`, null);
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
                    range1: range1Val,
                    range2: range2Val,
                    range3: range3Val,
                    range4: range4Val,
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
                    rangeWidth: getValue<number>(objects, `TargetRange`, `rangeWidth`, 3) <= 0 ? null :
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
                };
            }
            this.prevDataViewObjects = objects;
            this.colorsGlobal.push(this.settings.ComparisonFillColor);
            this.colorsGlobal.push(this.settings.Zone4);
            this.colorsGlobal.push(this.settings.Zone3);
            this.colorsGlobal.push(this.settings.Zone2);
            this.colorsGlobal.push(this.settings.Zone1);
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            d3.selectAll('.gradientSVG').remove();
            this.rootElement.selectAll(`.lg_ErrorMessage`).remove();
            this.svg.selectAll(`.linearSVG`).remove();
            this.svgLinear.selectAll(`rect.range`).remove();
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

            this.data = LinearGauge.converter(this.dataView); //calling Converter function
            let viewport: IViewport;
            viewport = options.viewport;
            
            if (viewport.width < 60 || viewport.height < 30) {
                return;
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
            if (this.data.states.length === 0) {
                if (this.settings.showColor) {
                    this.data.states.push(this.data.max);
                    this.data.states.push(this.settings.range4);
                    this.data.states.push(this.settings.range3);
                    this.data.states.push(this.settings.range2);
                    this.data.states.push(this.settings.range1);
                } else {
                    this.data.states.push(this.data.max);
                }
            }

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

            let axisFormatter = ValueFormatter.create({
                format: this.data.actualFormat, precision: this.settings.scaleDecimalPlaces, value: this.settings.scaleDisplayUnits === 0 ?
                    this.getValueUpdated(this.data.max) : this.settings.scaleDisplayUnits
            });
            let textProperties = {
                fontFamily: `${this.settings.scaleFontFamily}`,
                fontSize: `${this.settings.scaleFontSize}px`,
                text: axisFormatter.format(this.data.max)
            };
            let maxFormattedDataWidth: number = textMeasurementService.measureSvgTextWidth(textProperties);
            let halfMaxFormattedDataWidth: number = maxFormattedDataWidth / 2;

            if (this.settings.Orientation === `Horizontal`) {
                $('.lg_imagetab').css('left', 'auto');
                $('.lg_imagetab').css('right', 0);
                $('.lg_legend_tab').css('left', 0).css('bottom', 'auto');
                height = viewport.height;
                width = viewport.width - halfMaxFormattedDataWidth;
                modHeight = height / 12;
                this.svg
                    .attr({
                        height: viewport.height,
                        width: viewport.width
                    }).style('margin-top', `${(viewport.height / 3) + 50}px`);
                d3.select('.lg_data_tab').style('margin-top', `${(viewport.height / 3)}px`);
                this.svgLinear.attr(`transform`, `translate(0,5)`);
            } else {
                $('.lg_imagetab').css('right', 'auto');
                $('.lg_imagetab').css('left', 0);
                $('.lg_legend_tab').css('left', 'auto').css('bottom', options.viewport.height / 2 + 'px');
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
            let actual: number;
            let minRangeValue: number;
            let maxRangeValue: number
            let vDataLabel: d3.Selection<SVGElement>;
            let upArrow: string;
            upArrow = `&#8599`;
            let percentageFont: number;
            percentageFont = this.settings.fontSize / 2.0;
            let percentageFontTrend: number;
            percentageFontTrend = this.settings.trendfontSize / 2.5;
            let range: d3.selection.Update<number>;
            let measure: d3.Selection<SVGElement>;
            let xScale: d3.scale.Linear<number, number>;
            let xAxis: d3.svg.Axis;
            const precisionValue: number = this.settings.markerWidth;
            const precisionValueTrend: number = this.settings.lineWidth;

            actualVal = this.getFormattedData(this.data.actual, this.settings.labelDisplayUnits, precisionValue, this.data.actualFormat);
            trend1Val = this.getFormattedData(
                this.data.trendValue1, this.settings.trendDisplayUnits, precisionValueTrend, this.data.trend1Format);
            trend2Val = this.getFormattedData(
                this.data.trendValue2, this.settings.trendDisplayUnits, precisionValueTrend, this.data.trend2Format);

            const textProps: TextProperties = {
                fontSize: this.settings.fontSize + 'px',
                fontFamily: this.settings.fontFamily,
                text: actualVal
            };

            const horizontalWidth : number = (this.settings.showPercentage) ?
                        (options.viewport.width / 2.1) - 20 : options.viewport.width - 30;
            let updatedText: string;
            updatedText = textMeasurementService.getTailoredTextOrDefault(textProps, horizontalWidth);

            const actualTooltip: string = this.getFormattedTooltipData(this.data.actualFormat, this.data.actual);
            this.actual.text(updatedText)
                .attr('title', actualTooltip)
                .style(`font-size`, `${this.settings.fontSize}px`)
                .style(`font-family`, this.settings.fontFamily)
                //.style(`padding-top`, `${(percentageFont + 5)}px`)
                .style(`color`, this.settings.DataColor)
                .style(`margin-right`, `${percentageFont}px`);

            const textPropspercent: TextProperties = {
                fontSize: this.settings.percentagefontSize + 'px',
                fontFamily: this.settings.percentagefontFamily,
                text: `${percentageVal}%`
            };

            const dataWidth: number = $('.lg_data_total').width();
 
            let updatedTextpercent: string;
            updatedTextpercent = textMeasurementService.getTailoredTextOrDefault(textPropspercent, options.viewport.width - dataWidth - 70);

            this.percentage.text(updatedTextpercent)
                .attr('title', `${percentageVal}%`)
                .style(`font-size`, `${this.settings.percentagefontSize}px`)
                //.style(`padding-top`, `${(percentageFont + 5)}px`)
                .style(`color`, this.settings.PercentageDataColor)
                .style(`font-Family`, this.settings.percentagefontFamily); //Using values which are stored in data object

            let actualFormatter: IValueFormatter;
            actualFormatter = ValueFormatter.create({
                format: this.data.actualFormat
            });
            let className: string;
            let translateVal: string;
            let axisFunction: d3.svg.Axis;

            if (this.settings.Orientation === `Horizontal`) {
                this.svgLinear.selectAll(`rect.range`).remove();
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
                xScale = d3.scale.linear()
                    .domain([this.data.min, this.data.max])
                    .range([30, viewport.width]).nice();
                this.data.min = xScale.domain()[0];
                this.data.max = xScale.domain()[1];

                // to adjust the xScale range according to the new data max
                let textProperties = {
                    fontFamily: `${this.settings.scaleFontFamily}`,
                    fontSize: `${this.settings.scaleFontSize}px`,
                    text: axisFormatter.format(this.data.max)
                };
                let maxFormattedDataWidth: number = textMeasurementService.measureSvgTextWidth(textProperties);
                let halfMaxFormattedDataWidth: number = maxFormattedDataWidth / 2;

                xScale.range([halfMaxFormattedDataWidth, viewport.width - halfMaxFormattedDataWidth]);

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

                let availablewidth: number;
                availablewidth = parseInt($('.linearSVG').css('marginLeft').toString(), 10);
                if (this.settings.showlabel) {
                    const textPropsv: TextProperties = {
                        fontSize: this.settings.fontSize + 'px',
                        fontFamily: this.settings.fontFamily,
                        text: actualVal
                    };
                    let updatedTextv: string;
                    updatedTextv = textMeasurementService.getTailoredTextOrDefault(textPropsv, availablewidth * 0.5);

                    vDataLabel.append('text')
                        .classed('data_totalv', true)
                        .attr(`transform`, `${`translate(`}${(modHeight - difference)}${`,`}${(svgheight - 20)} )`)
                        .style(`fill`, this.settings.DataColor)
                        .style(`font-family`, this.settings.fontFamily)
                        .style(`font-size`, this.settings.fontSize + 'px')
                        .text(updatedTextv).attr('title', actualTooltip);
                } else {
                    $('.data_totalv').hide();
                }
                if (this.settings.showPercentage) {
                    const textPropspercen: TextProperties = {
                        fontSize: this.settings.fontSize + 'px',
                        fontFamily: this.settings.fontFamily,
                        text: `${percentageVal.toString()}%`
                    };
                    let updatedTextpercen: string;
                    updatedTextpercen = textMeasurementService.getTailoredTextOrDefault(textPropspercen, availablewidth * 0.5);
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
                this.data.max = xScale.domain()[1];

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
                this.data.states = [];
                if (this.settings.showColor) {
                    this.data.states.push(this.data.max);
                    this.data.states.push(this.settings.range4);
                    this.data.states.push(this.settings.range3);
                    this.data.states.push(this.settings.range2);
                    this.data.states.push(this.settings.range1);
                } else {
                    this.data.states.push(this.data.max);
                }
                sortedRanges = this.data.states;

                range = this.svgLinear.selectAll(`rect.range`)
                    .data(sortedRanges);

                range.enter()
                    .append(`rect`)
                    .attr(`class`, function (d: number, i: number): string {
                        return rangeLiteral + i;
                    });

                let measureHeight: number;
                let measureYPos: number;

                if (this.settings.showColor) {
                    const zoneLen: number = this.colorsGlobal.length;
                    for (let i: number = 0; i < zoneLen; i++) {
                        colors.push(this.colorsGlobal[i]);
                    }


                    const constID = 3;
                    let context = this;
                    range.style(`fill`, function (d: number, i: number): string {
                        let gradient = context.svgLinear.append("svg:linearGradient");

                        gradient.attr("id", "gradient" + (constID + i))
                            .classed('gradientSVG', true)
                            .attr("x1", "100%")
                            .attr("y1", "0%")
                            .attr("x2", "100%")
                            .attr("y2", "100%")
                            .attr("spreadMethod", "pad");
                        gradient.append("stop").attr("offset", "0%").attr("stop-color", context.getDarkShade(colors[i], 0.5)).attr("stop-opacity", 1);
                        gradient.append("stop").attr("offset", "100%").attr("stop-color", colors[i]).attr("stop-opacity", 1);

                        return "url(#gradient" + (constID + i) + ")";
                    });
                    measureHeight = modHeight / 2;
                    measureYPos = modHeight / 4;

                } else {
                    let gradient = this.svgLinear.append("svg:linearGradient");

                    gradient.attr("id", "gradient2")
                        .classed('gradientSVG', true)
                        .attr("x1", "100%")
                        .attr("y1", "0%")
                        .attr("x2", "100%")
                        .attr("y2", "100%")
                        .attr("spreadMethod", "pad");
                    gradient.append("stop").attr("offset", "0%").attr("stop-color", this.getDarkShade(this.settings.ComparisonFillColor, 0.5)).attr("stop-opacity", 1);
                    gradient.append("stop").attr("offset", "100%").attr("stop-color", this.settings.ComparisonFillColor).attr("stop-opacity", 1);

                    range.style(`fill`, "url(#gradient2)");
                    measureHeight = modHeight;
                    measureYPos = 0;
                }
                range
                    .attr(`x`, xScale(xScale.domain()[0]))
                    .attr(`width`, function (d: number): number {
                        return (xScale(d) - xScale(xScale.domain()[0])) < 0 ? 0 : (xScale(d) - xScale(xScale.domain()[0]));
                    })
                    .attr(`height`, modHeight);

                let gradient = this.svgLinear.append("svg:linearGradient");

                gradient.attr("id", "gradient")
                    .classed('gradientSVG', true)
                    .attr("x1", "100%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "100%")
                    .attr("spreadMethod", "pad");
                gradient.append("stop").attr("offset", "0%").attr("stop-color", this.getDarkShade(measureColor, 0.5)).attr("stop-opacity", 1);
                gradient.append("stop").attr("offset", "100%").attr("stop-color", measureColor).attr("stop-opacity", 1);

                //Main measure
                measure = this.svgLinear
                    .append(`rect`)
                    .classed(`measure`, true)
                    .style(`fill`, "url(#gradient)");
                measure
                    .attr(`width`, xScale(this.data.actual) - xScale(xScale.domain()[0]) < 0 ?
                                    0 : xScale(this.data.actual) - xScale(xScale.domain()[0]))
                    .attr(`height`, measureHeight)
                    .attr(`x`, xScale(xScale.domain()[0]))
                    .attr(`y`, measureYPos);
                if (this.data.max <= this.data.min) {
                    measure.style(`display`, `none`);
                }

                let hMarker: number;
                let hMarkerMin: number;
                let hMarkerMax: number;
                hMarker = xScale(this.data.target);
                hMarkerMin = xScale(minRangeValue);
                hMarkerMax = xScale(maxRangeValue);
                this.svgLinear
                    .append(`line`)
                    .classed(`marker`, true)
                    .style(`stroke`, `#000`)
                    .attr({
                        x1: hMarker,
                        y1: 0,
                        x2: hMarker,
                        y2: modHeight
                    });

                this.svgLinear.selectAll(`line.markerTilt`).remove();
                // best in class
                if (this.data.bestSet) {
                    let bestMarker = xScale(this.data.best);
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
                            .style('stroke-dasharray', ('1, 5'))

                    } else if (this.settings.rangeStyle == 'dashed') {
                        this.svgLinear.selectAll('.markermin, .markermax')
                            .style('stroke-dasharray', ('3, 3'))
                    } else {
                        this.svgLinear.selectAll('.markermin, .markermax')
                            .style('stroke-dasharray', (''))
                    }
                }

                translateVal = `translate(0,${(modHeight + 15)} )`;
                axisFunction = xAxis;
                className = 'lg_xLabels';
            } else {
                let yScale: d3.scale.Linear<number, number>;
                yScale = d3.scale.linear()
                    .domain([this.data.min, this.data.max])
                    .range([viewport.height - 15, 15]).nice();
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
                this.data.states = [];
                if (this.settings.showColor) {
                    this.data.states.push(this.data.max);
                    this.data.states.push(this.settings.range4);
                    this.data.states.push(this.settings.range3);
                    this.data.states.push(this.settings.range2);
                    this.data.states.push(this.settings.range1);
                } else {
                    this.data.states.push(this.data.max);
                }
                sortedRanges = this.data.states;

                range = this.svgLinear.selectAll(`rect.range`)
                    .data(sortedRanges);

                range.enter()
                    .append(`rect`)
                    .attr(`class`, function (d: number, i: number): string {
                        return rangeLiteral + i;
                    });

                if (this.settings.showColor) {
                    const zoneLen: number = this.colorsGlobal.length;
                    for (let i: number = 0; i < zoneLen; i++) {
                        colors.push(this.colorsGlobal[i]);
                    }

                    const constID = 3;
                    let context = this;
                    range.style(`fill`, function (d: number, i: number): string {
                        let gradient = context.svgLinear.append("svg:linearGradient");

                        gradient.attr("id", "gradient" + (constID + i))
                            .classed('gradientSVG', true)
                            .attr("x1", "100%")
                            .attr("y1", "100%")
                            .attr("x2", "0%")
                            .attr("y2", "100%")
                            .attr("spreadMethod", "pad");
                        gradient.append("stop").attr("offset", "0%").attr("stop-color", context.getDarkShade(colors[i], 0.5)).attr("stop-opacity", 1);
                        gradient.append("stop").attr("offset", "100%").attr("stop-color", colors[i]).attr("stop-opacity", 1);

                        return "url(#gradient" + (constID + i) + ")";
                    });
                    measureLeftPos = leftPos + modHeight / 4;
                    measureWidth = modHeight / 2;
                    comparsionWidth = modHeight / 6;
                } else {
                    let gradient = this.svgLinear.append("svg:linearGradient");

                    gradient.attr("id", "gradient2")
                        .classed('gradientSVG', true)
                        .attr("x1", "100%")
                        .attr("y1", "100%")
                        .attr("x2", "0%")
                        .attr("y2", "100%")
                        .attr("spreadMethod", "pad");
                    gradient.append("stop").attr("offset", "0%").attr("stop-color", this.getDarkShade(this.settings.ComparisonFillColor, 0.5)).attr("stop-opacity", 1);
                    gradient.append("stop").attr("offset", "100%").attr("stop-color", this.settings.ComparisonFillColor).attr("stop-opacity", 1);

                    range.style(`fill`, "url(#gradient2)");
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

                let gradient = this.svgLinear.append("svg:linearGradient");

                gradient.attr("id", "gradient")
                    .classed('gradientSVG', true)
                    .attr("x1", "100%")
                    .attr("y1", "100%")
                    .attr("x2", "0%")
                    .attr("y2", "100%")
                    .attr("spreadMethod", "pad");
                gradient.append("stop").attr("offset", "0%").attr("stop-color", this.getDarkShade(measureColor, 0.5)).attr("stop-opacity", 1);
                gradient.append("stop").attr("offset", "100%").attr("stop-color", measureColor).attr("stop-opacity", 1);
                //Main measure
                measure = this.svgLinear
                    .append(`rect`)
                    .classed(`measure`, true)
                    .style(`fill`, "url(#gradient)")
                    .attr(`width`, measureWidth)
                    .attr(`height`, yScale(yScale.domain()[0]) - yScale(this.data.actual))
                    .attr(`x`, measureLeftPos)
                    .attr(`y`, -yScale(yScale.domain()[0]))
                    .attr(`transform`, 'rotate(180)');

                if (this.data.max <= this.data.min) {
                    measure.style(`display`, `none`);
                }
                // Remove the Actual value data label if it is going beyond DOM
                const ele_label: JQuery = $('.LG_verticalDataLabel');
                const ele_trend: JQuery = $('.lg_imagetab');
                if (ele_label && ele_label.length && ele_label[0]) {
                    // tslint:disable-next-line:no-any
                    const domPosition_label: any = ele_label[0].getBoundingClientRect();
                    if (domPosition_label.x < 0) {
                        $('.LG_verticalDataLabel text').remove();
                    }
                }

                let vMarker: number;
                let vMarkerMin: number;
                let vMarkerMax: number;
                vMarker = yScale(this.data.target);
                vMarkerMin = yScale(minRangeValue);
                vMarkerMax = yScale(maxRangeValue);

                this.svgLinear
                    .append(`line`)
                    .classed(`marker`, true)
                    .style(`stroke`, `#000`)
                    .attr({
                        x1: 3,
                        y1: vMarker,
                        x2: modHeight + 3,
                        y2: vMarker
                    });

                this.svgLinear.selectAll(`line.markerTilt`).remove();
                // best in class
                if (this.data.bestSet) {
                    let bestMarker = yScale(this.data.best);
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
                            .style('stroke-dasharray', ('1, 5'))

                    } else if (this.settings.rangeStyle == 'dashed') {
                        this.svgLinear.selectAll('.markermin, .markermax')
                            .style('stroke-dasharray', ('3, 3'))
                    } else {
                        this.svgLinear.selectAll('.markermin, .markermax')
                            .style('stroke-dasharray', (''))
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
                    let targetFormatter = ValueFormatter.create({
                        format: this.data.targetFormat, precision: this.settings.legendDecimalPlaces, value: this.settings.legendDisplayUnits === 0 ?
                            this.getValueUpdated(this.data.target) : this.settings.legendDisplayUnits
                    });
                    let textProperties = {
                        fontFamily: `${this.settings.legendFontFamily}`,
                        fontSize: `${this.settings.legendFontSize}px`,
                        text: '|  ' + targetFormatter.format(this.data.target) + ' ' + this.data.targetColName
                    };
                    const horizontalWidth : number = (this.data.trend1Exists || this.data.trend2Exists) ?
                        (options.viewport.width / 2.5) - 20 : options.viewport.width - 20;
                    const targetTooltip : string = this.getFormattedTooltipData(this.data.targetFormat, this.data.target);
                    if (this.settings.Orientation === 'Horizontal') {
                        updatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, horizontalWidth);
                    } else {
                        updatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, availablewidth * 0.8);
                    }

                    this.targetLegend.append(`span`)
                        .classed(`targetLabel`, true)
                        .text(updatedText)
                        .style({
                            'font-size': `${this.settings.legendFontSize}px`,
                            'font-family': this.settings.legendFontFamily,
                            'color': this.settings.legendColor
                        })
                        .attr('title', `${targetTooltip} ${this.data.targetColName}`);
                }

                this.bestLegend.selectAll(`.bestLabel`).remove();
                if (this.data.best && this.settings.legendShow) {
                    let bestFormatter = ValueFormatter.create({
                        format: this.data.bestFormat, precision: this.settings.legendDecimalPlaces, value: this.settings.legendDisplayUnits === 0 ?
                            this.getValueUpdated(this.data.best) : this.settings.legendDisplayUnits
                    });
                    let textProperties = {
                        fontFamily: `${this.settings.legendFontFamily}`,
                        fontSize: `${this.settings.legendFontSize}px`,
                        text: bestFormatter.format(this.data.best) + ' ' + this.data.bestColName
                    };
                    const horizontalWidth : number = (this.data.trend1Exists || this.data.trend2Exists) ? (options.viewport.width / 2.5) - 20 : options.viewport.width - 20
                    const bestTooltip : string = this.getFormattedTooltipData(this.data.bestFormat, this.data.best);
                    if (this.settings.Orientation === 'Horizontal') {
                        updatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, horizontalWidth);
                    } else {
                        updatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, availablewidth * 0.8);
                    }

                    this.bestLegend.append(`span`)
                        .classed(`bestLabel`, true)
                        .html("&#9478")
                        .style({
                            'margin-left': -this.settings.legendFontSize / 3 + 'px',
                            'font-size': `${this.settings.legendFontSize}px`,
                            'color': this.settings.legendColor
                        })
                        .attr('title', `${bestTooltip} ${this.data.bestColName}`);

                    this.bestLegend.append(`span`)
                        .classed(`bestLabel`, true)
                        .text(updatedText)
                        .style({
                            'font-size': `${this.settings.legendFontSize}px`,
                            'font-family': this.settings.legendFontFamily,
                            'color': this.settings.legendColor
                        });
                }
            } else {
                this.targetLegend.selectAll('*').remove();
                this.bestLegend.selectAll('*').remove();
            }

            if (this.settings.showTrend) {
                //$('.lg_imagetab').css('display', 'block');

                let updatedText1: string;
                let updatedText2: string;
                let arrowColorI1: string = this.settings.Indicator1;
                let arrowColorI2: string = this.settings.Indicator2;
                if (this.settings.Orientation === 'Horizontal') {
                    //$(`.lg_imagetab`).css('position', 'relative');
                } else {
                    //$(`.lg_imagetab`).css('position', 'absolute');
                }

                if (this.data.trend1Exists) {
                    const trend1ValText: string = this.data.trend1ColName;
                    const textProps1: TextProperties = {
                        fontSize: this.settings.trendfontSize + 'px',
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

                    const trend1Tooltip: string = this.getFormattedTooltipData(this.data.trend1Format, this.data.trendValue1);
                    this.trendValue1.append(`span`).classed(`trendvalue1text`, true)
                        .text(updatedText1)
                        .style({
                            color: this.settings.trendColor,
                            'font-size': `${this.settings.trendfontSize}px`,
                            'font-family': this.settings.trendfontFamily
                        })
                        .attr('title', `${trend1Tooltip} ${trend1ValText}`);

                    if (this.data.trendValue1 < 0) {
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
                        fontSize: this.settings.trendfontSize + 'px',
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
                    const trend2Tooltip: string = this.getFormattedTooltipData(this.data.trend2Format, this.data.trendValue2);
                    this.trendValue2.append(`span`).classed(`trendvalue2text`, true)
                        .text(updatedText2)
                        .style({
                            color: this.settings.trendColor,
                            'font-size': `${this.settings.trendfontSize}px`,
                            'font-family': this.settings.trendfontFamily
                        })
                        .attr('title', `${trend2Tooltip} ${trend2ValText} `);
                    if (this.data.trendValue2 < 0) {
                        $('.trendvalue2arrow').css({
                            transform: 'rotate(90deg)',
                            display: 'inline-block'
                        });
                    }
                } else {
                    this.trendValue2.style(`display`, `none`);
                }

                const ele_label: JQuery = this.settings.Orientation === 'Horizontal' ? $('.lg_data_tab') : $('.LG_verticalDataLabel');
                const ele_trend: JQuery = $('.lg_imagetab');
                const ele_legend: JQuery = $('.lg_legend_tab');

                // tslint:disable-next-line:no-any
                const domPositon_legend: any = ele_legend[0].getBoundingClientRect();
                // tslint:disable-next-line:no-any
                const domPositon_trend: any = ele_trend[0].getBoundingClientRect();
                const overlap: boolean = !(domPositon_trend.right < domPositon_legend.left ||
                    domPositon_trend.left > domPositon_legend.right ||
                    domPositon_trend.bottom < domPositon_legend.top ||
                    domPositon_trend.top > domPositon_legend.bottom)
                if (overlap) {
                    $('.lg_legend_tab span').remove();
                }
                if (ele_label && ele_label.length && ele_label[0]) {
                    // tslint:disable-next-line:no-any
                    const domPositon_label: any = ele_label[0].getBoundingClientRect();
                    // tslint:disable-next-line:no-any
                    const domPositon_legend: any = ele_legend[0].getBoundingClientRect();
                    // tslint:disable-next-line:no-any
                    const domPositon_trend: any = ele_trend[0].getBoundingClientRect();
                    const overlap: boolean = !(domPositon_label.right < domPositon_trend.left ||
                        domPositon_label.left > domPositon_trend.right ||
                        domPositon_label.bottom < domPositon_trend.top ||
                        domPositon_label.top > domPositon_trend.bottom)
                    const overlap1: boolean = !(domPositon_label.right < domPositon_legend.left ||
                        domPositon_label.left > domPositon_legend.right ||
                        domPositon_label.bottom < domPositon_legend.top ||
                        domPositon_label.top > domPositon_legend.bottom)
                    if (overlap) {
                        this.settings.Orientation === 'Horizontal' ? $('.lg_imagetab span').remove() : $('.LG_verticalDataLabel text').remove();
                    }
                    if (overlap1) {
                        this.settings.Orientation === 'Horizontal' ? $('.lg_legend_tab span').remove() : $('.LG_verticalDataLabel text').remove();
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
                    let This = this;
                    let totalTicks = d3.selectAll('.lg_xLabels g.tick text')[0].length;
                    d3.selectAll('.lg_xLabels g.tick text')
                        .text(function (d: string): string {
                            let textProperties = {
                                fontFamily: `${This.settings.scaleFontFamily}`,
                                fontSize: `${This.settings.scaleFontSize}px`,
                                text: axisFormatter.format(d)
                            };
                            const tickAvailWidth: number = textMeasurementService.measureSvgTextWidth(textProperties) + 1;

                            return textMeasurementService.getTailoredTextOrDefault(textProperties, (options.viewport.width - halfMaxFormattedDataWidth) / totalTicks);
                        });
                        const ticks: JQuery = $('.lg_xLabels g.tick');
                        // tslint:disable-next-line:no-any
                        const domPositon_tick1: any = ticks[0].getBoundingClientRect();
                        const tickLen: number = !!d3.selectAll('.lg_xLabels g.tick') ? d3.selectAll('.lg_xLabels g.tick')[0].length : 1;
                        // tslint:disable-next-line:no-any
                        const domPositon_tick2: any = ticks[tickLen - 1].getBoundingClientRect();
                        const precede : boolean = !(domPositon_tick1.right < domPositon_tick2.left)
                        if (precede) {
                            this.svg.selectAll('.lg_xLabels').remove();
                            this.svg.selectAll('.marker, .markermax, .markermin, .bestMarker, .markerTilt').remove();
                        }
                    } else {
                        const tickLen: number = !!d3.selectAll('.lg_yLabels g.tick') ? d3.selectAll('.lg_yLabels g.tick')[0].length : 1;
                        if ($('.tick')[tickLen - 1].getBoundingClientRect().right > viewport.width) {
                            this.svg.selectAll('.lg_yLabels').remove();
                            this.svgLinear.selectAll(`line.markerTilt`).remove();
                        }
                        const ticks: JQuery = $('.lg_yLabels g.tick');
                        // tslint:disable-next-line:no-any
                        const domPositon_tick1: any = ticks[0].getBoundingClientRect();
                        // tslint:disable-next-line:no-any
                        const domPositon_tick2: any = ticks[1].getBoundingClientRect();
                        const overlap : boolean = !(domPositon_tick1.right < domPositon_tick2.left ||
                            domPositon_tick1.left > domPositon_tick2.right ||
                            domPositon_tick1.bottom < domPositon_tick2.top ||
                            domPositon_tick1.top > domPositon_tick2.bottom)
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
                this.svgLinear.selectAll('rect.measure,rect.range'),
                (tooltipEvent: TooltipEventArgs<number>) => tooltipData,
                (tooltipEvent: TooltipEventArgs<number>) => null);
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
                            fill: this.settings.legendColor,
                            fontSize: this.settings.legendFontSize,
                            fontFamily: this.settings.legendFontFamily,
                            displayUnits: this.settings.legendDisplayUnits,
                            decimalPlaces: this.settings.legendDecimalPlaces
                        }
                    });
                    break;
                case `colorSelector`:
                    objectEnumeration.push({
                        objectName: objectName,
                        selector: null,
                        properties: {
                            show: this.settings.showColor,
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
                            decimalPlaces: this.settings.scaleDecimalPlaces,
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
                    if (this.data.trendValue1 || this.data.trendValue2)
                    {
                        let props: {} = {};
                        if (this.data.trendValue1)
                            props['Indicator1'] = this.settings.Indicator1;
                        if (this.data.trendValue2)
                            props['Indicator2'] = this.settings.Indicator2;
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
                    if (this.data.trendValue1 || this.data.trendValue2)
                    {
                            let props: {} = {show: this.settings.showTrend};
                            if(this.settings.showTrend) {
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
                                }
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
