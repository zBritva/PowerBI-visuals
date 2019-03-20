module powerbi.extensibility.visual {
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    export interface IViewModel {
        value: number;
        targetValue?: number;
        color?: string;
        min?: number;
        max?: number;
        Greater?: number;
        Less?: number;
        drawTickBar?: boolean;
        targetRange?: boolean;
    }
    export interface ITooltipDataItem {
        displayName: string;
        value: number;
    }
    export interface IProgressIndicatorValues {
        value: number;
        targetValue: number;
        minValue: number;
        maxValue: number;
        toolTipInfo: ITooltipDataItem[];
    }
    export class CylindricalGauge implements IVisual {
        private static legendPropertyIdentifier: DataViewObjectPropertyIdentifier = {
            objectName: 'legend',
            propertyName: 'fill'
        };
        // tslint:disable-next-line:no-any
        private rootElement: any;
        private svg: d3.Selection<SVGElement>;
        private div: d3.Selection<SVGElement>;
        //public range: IRange;
        private host: IVisualHost;
        //private viewModel: ICylindricalGaugeViewModel;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        public toolTipData: ITooltipDataItem[];
        private topCircle: d3.Selection<SVGElement>;
        private bottomCircle: d3.Selection<SVGElement>;
        private targetCircle: d3.Selection<SVGElement>;
        private viewport: IViewport;
        private border: string;
        private backCircle: d3.Selection<SVGElement>;
        private backRect: d3.Selection<SVGElement>;
        private fillCircle: d3.Selection<SVGElement>;
        private greaterCircle: d3.Selection<SVGElement>;
        private lessCircle: d3.Selection<SVGElement>;
        private cylinder: d3.Selection<SVGElement>;
        private fillRect1: d3.Selection<SVGElement>;
        private fillRect2: d3.Selection<SVGElement>;
        private gradient: d3.Selection<SVGElement>;
        private gradient1: d3.Selection<SVGElement>;
        private gradient2: d3.Selection<SVGElement>;
        private gradient3: d3.Selection<SVGElement>;
        private gradient4: d3.Selection<SVGElement>;
        private zones: d3.Selection<SVGElement>;
        private zone1: d3.Selection<SVGElement>;
        private zone2: d3.Selection<SVGElement>;
        private zone3: d3.Selection<SVGElement>;
        private zone4: d3.Selection<SVGElement>;
        private zoneLines: d3.Selection<SVGElement>;
        private tempMarkings: d3.Selection<SVGElement>;
        private axisMarking: d3.Selection<SVGElement>;
        private highlight: boolean;
        private highlightCircle: d3.Selection<SVGElement>;
        public data: IProgressIndicatorValues;
        private text: d3.Selection<SVGElement>;
        private data1: IViewModel;
        public dataView: DataView;
        private textPosition: number;
        private enableAxis: boolean = true;
        private labelValueFormatter: utils.formatting.IValueFormatter;
        private tickValueFormatter: utils.formatting.IValueFormatter;
        private highlightValue: number = 0;
        private highlightTarget: number = 0;
        private isActual: boolean = false;
        private isMin: boolean = false;
        private isMax: boolean = false;
        private isTarget: boolean = false;
        private prevDataViewObjects: DataViewObjects = {};
        private toolTipInfo: VisualTooltipDataItem[] = [];
        private margins: {
            bottom: number;
            small: number;
            big: number;
        };
        private settings: {
            rectFill1: string;
            rectFill2: string;
            circleFill1: string;
            circleFill2: string;
            animationTime: number;
            borderColor: string;
            tarValue: number;
            targetColor: string;
            maxValue: number;
            minValue: number;
            Greater: number;
            GreaterColor: string;
            Less: number;
            LessColor: string;
            tickBar: boolean;
            targetRange: boolean;
            tickColor: string;
            labelPos: string;
            labelFontSize: number;
            dataColor: string;
            labelDisplayUnits: number;
            labelDecimalPlaces: number;
            labelFontFamily: string;
            showLabels: boolean;
            scalePosition: string;
            tickFontFamily: string;
            tickFontSize: number;
            tickDisplayUnits: number;
            tickDecimalPlaces: number;
            showZones: boolean;
            range1: number;
            Zone1: string;
            range2: number;
            Zone2: string;
            range3: number;
            Zone3: string;
            range4: number;
            Zone4: string;
        };

        //Convert the dataview into its view model
        //All the variable will be populated with the value we have passed
        public static converter1(dataView: DataView): IProgressIndicatorValues {
            const categoriesLength: number = dataView.categorical.values.length;
            const dataValues : number[] = [0, 0, 0, 0];
            let iCount: number;
            for (iCount = 0; iCount < categoriesLength; iCount++) {
                const index: number = dataView.categorical.values[iCount].source.index;
                dataValues[index] = <number>dataView.categorical.values[iCount].values[0];
            }
            const data: IProgressIndicatorValues = CylindricalGauge.getDefaultData();
            if (dataView && dataView.categorical) {
                let index: number;
                for (iCount = 0; iCount < categoriesLength; iCount++) {
                    index = dataView.categorical.values[iCount].source.index;
                    // tslint:disable-next-line:no-any
                    const dataViewSourceRole: any = dataView.categorical.values[iCount].source.roles;
                    if (dataViewSourceRole.hasOwnProperty('Values')) {
                        data.value = <number>dataValues[index];
                    }
                    if (dataViewSourceRole.hasOwnProperty('TargetValue')) {
                        data.targetValue = <number>dataValues[index];
                    }
                    if (dataViewSourceRole.hasOwnProperty('Min')) {
                        data.minValue = <number>dataValues[index];
                    }
                    if (dataViewSourceRole.hasOwnProperty('Max')) {
                        data.maxValue = <number>dataValues[index];
                    }
                }

            }

            return data; //Data object we are returning here to the update function
        }
        public static getDefaultData(): IProgressIndicatorValues {
            return {
                value: null,
                targetValue: null,
                minValue: null,
                maxValue: null,
                toolTipInfo: []
            };
        }

        public static converter(dataView: DataView, colors: IColorPalette): IViewModel {

            if (!dataView.categorical || !dataView.categorical.values) {
                return;
            }
            const series: DataViewValueColumns = dataView.categorical.values;
            if (series && series.length > 0) {
                return {
                    value: <number>series[0].values[series[0].values.length - 1]
                };
            }
        }
        public getSettings(objects: DataViewObjects): void {
            if (typeof this.settings === `undefined` || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                let animationTime: number = getValue<number>(objects, 'config', 'animationTime', null);
                if (animationTime > 6) {
                    animationTime = 6;
                } else if (animationTime < 0) {
                    animationTime = 0;
                }
                const minValue: number = getValue<number>(objects, 'config', 'min', null);
                const maxValue: number = getValue<number>(objects, 'config', 'max', null);
                const tarValue: number = getValue<number>(objects, 'config', 'target', null);
                const greater: number = getValue<number>(objects, 'config', 'Greater', null);
                const less: number = getValue<number>(objects, 'config', 'Less', null);
                let labelDecimalPlaces: number = getValue<number>(objects, 'labels', 'decimalValue', null);
                if (labelDecimalPlaces > 4) {
                    labelDecimalPlaces = 4;
                } else if (labelDecimalPlaces < 0) {
                    labelDecimalPlaces = 0;
                }
                let tickDecimalPlaces: number = getValue<number>(objects, 'config', 'decimalValue', null);
                if (tickDecimalPlaces > 4) {
                    tickDecimalPlaces = 4;
                } else if (tickDecimalPlaces < 0) {
                    tickDecimalPlaces = 0;
                }
                this.settings = {
                    rectFill1: getValue<Fill>(objects, 'config', 'rectFill1', {
                        solid: {
                            color: '#203DBD'
                        }
                    }).solid.color,
                    rectFill2: getValue<Fill>(objects, 'config', 'rectFill2', {
                        solid: {
                            color: '#00C6FB'
                        }
                    }).solid.color,
                    circleFill1: getValue<Fill>(objects, 'config', 'circleFill1', {
                        solid: {
                            color: '#0857B5'
                        }
                    }).solid.color,
                    circleFill2: getValue<Fill>(objects, 'config', 'circleFill2', {
                        solid: {
                            color: '#6AE3FF'
                        }
                    }).solid.color,
                    animationTime: animationTime,
                    borderColor: getValue<Fill>(objects, 'config', 'border', {
                        solid: {
                            color: '#F1F1F1'
                        }
                    }).solid.color,
                    tarValue: tarValue,
                    targetColor: getValue<Fill>(objects, 'config', 'targetColor', {
                        solid: {
                            color: 'red'
                        }
                    }).solid.color,
                    maxValue: maxValue,
                    minValue: minValue,
                    Greater: greater,
                    GreaterColor: getValue<Fill>(objects, 'config', 'GreaterColor', {
                        solid: {
                            color: 'red'
                        }
                    }).solid.color,
                    Less: less,
                    LessColor: getValue<Fill>(objects, 'config', 'LessColor', {
                        solid: {
                            color: 'red'
                        }
                    }).solid.color,
                    targetRange: getValue<boolean>(objects, 'config', 'targetRange', true),
                    tickBar: getValue<boolean>(objects, 'config', 'tickBar', true),
                    tickColor: getValue<Fill>(objects, 'config', 'tickColor', {
                        solid: {
                            color: '#000'
                        }
                    }).solid.color,
                    scalePosition: getValue<string>(objects, 'config', 'scalePos', 'right'),
                    tickFontFamily: getValue<string>(objects, 'config', 'tickFontFamily', 'Segoe UI'),
                    tickFontSize: getValue<number>(objects, 'config', 'fontSize', 14),
                    tickDisplayUnits: getValue<number>(objects, 'config', 'displayUnits', 0),
                    tickDecimalPlaces: tickDecimalPlaces,
                    labelPos: getValue<string>(objects, 'labels', 'labelPosition', 'out'),
                    labelFontSize: getValue<number>(objects, 'labels', 'fontSize', 25),
                    dataColor: getValue<Fill>(objects, 'labels', 'dataColor', {
                        solid: {
                            color: '#000'
                        }
                    }).solid.color,
                    labelDisplayUnits: getValue<number>(objects, 'labels', 'displayUnits', 0),
                    labelDecimalPlaces: labelDecimalPlaces,
                    labelFontFamily: getValue<string>(objects, 'labels', 'fontFamily', 'Segoe UI'),
                    showLabels: getValue<boolean>(objects, 'labels', 'show', true),
                    showZones: getValue<boolean>(objects, 'colorSelector', 'show', false),
                    range1: getValue<number>(objects, 'colorSelector', 'range1', null),
                    Zone1: getValue<Fill>(objects, `colorSelector`, `Zone1`, {
                        solid: {
                            color: '#DBEC9E'
                        }
                    }).solid.color,
                    range2: getValue<number>(objects, 'colorSelector', 'range2', null),
                    Zone2: getValue<Fill>(objects, `colorSelector`, `Zone2`, {
                        solid: {
                            color: '#F9811D'
                        }
                    }).solid.color,
                    range3: getValue<number>(objects, 'colorSelector', 'range3', null),
                    Zone3: getValue<Fill>(objects, `colorSelector`, `Zone3`, {
                        solid: {
                            color: '#FBA91C'
                        }
                    }).solid.color,
                    range4: getValue<number>(objects, 'colorSelector', 'range4', null),
                    Zone4: getValue<Fill>(objects, `colorSelector`, `Zone4`, {
                        solid: {
                            color: '#BE99BE'
                        }
                    }).solid.color
                };
            }
        }

        /** This is called once when the visual is initialially created */
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.div = d3.select(options.element).append('div').classed('cylindricalGaugeBody', true);
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.svg = this.div.append('svg').classed('CylindricalGauge', true);
            this.rootElement = d3.select(options.element);
            options.element.setAttribute('id', 'container');
        }

        /** Update is called for data updates, resizes & formatting changes */
        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            this.margins = {
                bottom: 30,
                small: 20,
                big: 0
            };
            this.svg.selectAll('.cylinder').remove();
            this.svg.selectAll('.yLabels').remove();
            this.svg.selectAll('line').remove();
            this.rootElement.selectAll('.ErrorMessage').remove();

            if (options.viewport.width <= 50) {
                return;
            }
            const mainGroup: d3.Selection<SVGElement> = this.svg.append('g').classed('cylinder', true);
            this.gradient = mainGroup.append('svg:linearGradient');
            this.gradient1 = mainGroup.append('svg:linearGradient');
            this.gradient2 = mainGroup.append('svg:linearGradient');
            this.gradient3 = mainGroup.append('svg:linearGradient');
            this.gradient4 = mainGroup.append('svg:linearGradient');
            this.backRect = mainGroup.append('rect');
            this.backCircle = mainGroup.append('ellipse');
            this.zones = mainGroup.append('g').classed('zones', true);
            this.zone1 = mainGroup.append('ellipse').classed('zone1', true);
            this.zone2 = mainGroup.append('ellipse').classed('zone2', true);
            this.zone3 = mainGroup.append('ellipse').classed('zone3', true);
            this.zone4 = mainGroup.append('ellipse').classed('zone4', true);
            this.topCircle = mainGroup.append('ellipse');
            this.fillRect1 = mainGroup.append('rect').classed('front_rect1', true);
            this.fillRect2 = mainGroup.append('rect').classed('front_rect2', true);
            this.fillCircle = mainGroup.append('ellipse').classed('top', true);
            this.highlightCircle = mainGroup.append('ellipse').classed('highlightCircle', true);
            this.tempMarkings = this.svg.append('g').attr('class', 'yLabels axis');
            this.axisMarking = this.svg.append('line').classed('highlight_line', true);
            this.bottomCircle = mainGroup.append('ellipse').classed('bottom', true);
            this.targetCircle = mainGroup.append('ellipse').classed('Target', true);
            //target range circles
            this.greaterCircle = mainGroup.append('ellipse').classed('targetcircle_greater', true);
            this.lessCircle = mainGroup.append('ellipse').classed('targetcircle_less', true);
            this.zoneLines = mainGroup.append('g').classed('zoneLines', true);
            this.text = mainGroup.append('text');
            this.viewport = options.viewport;
            this.isActual = false;
            this.isMin = false;
            this.isMax = false;
            this.isTarget = false;
             // tslint:disable-next-line:no-any
            const dataViewOptions: any = options.dataViews[0];
            // tslint:disable-next-line:no-any
            const dataViewOptionsCatValues: any = dataViewOptions.categorical.values;
            this.highlight = dataViewOptionsCatValues[0].highlights ? true : false;
            if (this.highlight) {
                this.highlightValue = dataViewOptionsCatValues[0].highlights[0] === null ? 0
                : <number>dataViewOptionsCatValues[0].highlights[0];
                if (this.isTarget) {
                    this.highlightTarget = <number>dataViewOptionsCatValues[1].highlights[0];
                }
            }
            for (let iCatValue: number = 0; iCatValue < dataViewOptionsCatValues.length; iCatValue++) {
                 // tslint:disable-next-line:no-any
                 const dataViewRole: any = dataViewOptionsCatValues[iCatValue].source.roles;
                 if (dataViewRole.hasOwnProperty('Values')) {
                    this.isActual = true;
                }
                 if (dataViewRole.hasOwnProperty('TargetValue')) {
                    this.isTarget = true;
                }
                 if (dataViewRole.hasOwnProperty('Min')) {
                    this.isMin = true;
                }
                 if (dataViewRole.hasOwnProperty('Max')) {
                    this.isMax = true;
                }
            }

            if (!options.dataViews || 0 === options.dataViews.length) {
                return;
            }
            if (!this.isActual) {
                const message: string = 'Please add "Actual Value" field';
                this.rootElement
                    .append('div')
                    .classed('ErrorMessage', true)
                    .text(message)
                    .attr('title', message);

                return;
            }

            const dataView: DataView = this.dataView = options.dataViews[0];
            this.data = null;
            this.data1 = null;
            this.data = CylindricalGauge.converter1(dataView);
            this.data1 = CylindricalGauge.converter(options.dataViews[0], null);
            if (!this.data) {
                return;
            }
            this.getSettings(dataView.metadata.objects);

            this.data1.max = this.data.maxValue || this.settings.maxValue;
            this.data1.Greater = this.settings.Greater;
            this.data1.Less = this.settings.Less;
            this.data1.min = this.data.minValue || this.settings.minValue;
            this.data1.drawTickBar = this.settings.tickBar;
            this.data1.targetRange = this.settings.targetRange;
            this.data1.targetValue = this.data.targetValue || this.settings.tarValue;

            // to handle invalid datatypes
            if (typeof (this.data1.value) === 'string' || typeof (this.data1.value) === 'object') {
                this.data1.value = 0;
            }
            // to handle value greater than max value
            if (this.data1.value > this.data1.max || this.data1.max === null) {
                if (this.data1.value >= 0) {
                    this.data1.max = this.data1.value * 2;
                } else {
                    this.data1.max = this.data1.value / 2;
                }
            }
            if (this.data1.value < this.data1.min || this.data1.min === null) {
                if (this.data1.value >= 0) {
                    this.data1.min = this.data1.value / 2;
                } else {
                    this.data1.min = this.data1.value * 2;
                }
            }
            if (this.data1.targetValue < this.data1.min && this.data1.targetValue !== null) {
                this.data1.min = this.data1.targetValue;
            }
            if (this.data1.targetValue > this.data1.max && this.data1.targetValue !== null) {
                this.data1.max = this.data1.targetValue;
            }

            if (this.data1.min > this.highlightValue && this.highlight) {
                this.data1.min = this.highlightValue;
            }

            // to handle extreme cases where min is greater than max
            if (this.data1.min >= this.data1.max) {
                this.data1.max = this.data1.min + 10;
            }

            if (this.data1.Less > this.data1.max || this.data1.Less < this.data1.min
                || this.data1.Less > this.data1.targetValue) {
                this.data1.Less = this.settings.Less = null;
            }
            if (this.data1.Greater > this.data1.max || this.data1.Greater < this.data1.min
                || this.data1.Greater < this.data1.targetValue) {
                this.data1.Greater = this.settings.Greater = null;
            }
            this.settings.minValue = this.data1.min;
            this.settings.maxValue = this.data1.max;

            if (this.settings.showZones) {
                const range12Max: number = Math.max(this.settings.range1, this.settings.range2);
                const range123Max: number = Math.max(this.settings.range1, this.settings.range2, this.settings.range3);
                this.settings.range1 = this.settings.range1 === null ? null
                    : this.settings.range1 < this.data1.min ? null
                    : this.settings.range1 > this.data1.max ? null : this.settings.range1;
                this.settings.range2 = this.settings.range2 === null ? null
                    : this.settings.range2 < this.settings.range1 ? this.settings.range1
                    : this.settings.range2 > this.data1.max ? null : this.settings.range2;
                this.settings.range3 = this.settings.range3 === null ? null
                    : this.settings.range3 < range12Max ? range12Max
                    : this.settings.range3 > this.data1.max ? null : this.settings.range3;
                this.settings.range4 = this.settings.range4 === null ? null
                    : this.settings.range4 < range123Max ?
                    range123Max : this.settings.range4 > this.data1.max ? null : this.settings.range4;
            }

            this.getFormatter(options);

            const viewport: IViewport = options.viewport;
            const height: number = viewport.height;
            const width: number = viewport.width;
            const visualheight: number = (height > 155 ? height - 5 : 150);
            const measureTextProperties: TextProperties = {
                text: 'ss',
                fontFamily: 'Segoe UI',
                fontSize: `${this.settings.labelFontSize}px`

            };
            let labelHeight: number = 0;
            labelHeight = textMeasurementService.measureSvgTextHeight(measureTextProperties);

            this.svg.attr({
                height: visualheight,
                width: width
            });

            this.div.style({
                height: `${height}px`,
                width: `${width}px`
            });

            let check: boolean;
            if (!this.isTarget && this.settings.tarValue === null) {
                check = false;
            } else {
                check = true;
            }

            if (this.settings.labelPos.toString() === 'in' || !this.settings.showLabels) {
                this.draw(width, visualheight, check);
            } else {
                this.draw(width, visualheight - labelHeight + 15, check);
            }

            this.renderTooltip();
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

        // tslint:disable-next-line:typedef
        private renderTooltip() {
            this.toolTipInfo = [];
            this.toolTipInfo.push({
                displayName: 'Actual Value',
                value: (this.highlight ? this.highlightValue : this.data1.value).toString()
            });
            if (this.isTarget) {
                this.toolTipInfo.push({
                    displayName: 'Target Value',
                    value: (this.highlight ? this.highlightTarget : this.data1.targetValue).toString()
                });
            }
            if (this.isMin) {
                this.toolTipInfo.push({
                    displayName: 'Min Value',
                    value: (this.data.minValue).toString()
                });
            }
            if (this.isMax) {
                this.toolTipInfo.push({
                    displayName: 'Max Value',
                    value: (this.data.maxValue).toString()
                });
            }

            //const tooltipbg = this.svg.selectAll('.cylinder').data(toolTipInfo);
            this.tooltipServiceWrapper.addTooltip(d3.selectAll('.cylinder'),
                                                  (tooltipEvent: TooltipEventArgs<number>) => this.toolTipInfo,
                                                  (tooltipEvent: TooltipEventArgs<number>) => null);

        }

        private getFormatter(options: VisualUpdateOptions): void {
            let displayVal: number = 0;
            const valLen: number = this.data1.max.toString().length;
            if (valLen > 9) {
                displayVal = 1e9;
            } else if (valLen <= 9 && valLen > 6) {
                displayVal = 1e6;
            } else if (valLen <= 6 && valLen >= 4) {
                displayVal = 1e3;
            } else {
                displayVal = 10;
            }
            if (options.dataViews[0].categorical.values[0].source.format &&
                options.dataViews[0].categorical.values[0].source.format.indexOf('%') !== -1) {
                displayVal = 0;
            }
            this.labelValueFormatter = ValueFormatter.create({
                format: options.dataViews[0].categorical.values[0].source.format,
                value: this.settings.labelDisplayUnits === 0 ? displayVal : this.settings.labelDisplayUnits,
                precision: this.settings.labelDecimalPlaces
            });
            this.tickValueFormatter = ValueFormatter.create({
                format: options.dataViews[0].categorical.values[0].source.format,
                value: this.settings.tickDisplayUnits === 0 ? displayVal : this.settings.tickDisplayUnits,
                precision: this.settings.tickDecimalPlaces
            });
        }

        public draw(width: number, height: number, check: boolean): void {
            const radius: number = 100;

            if (this.data1.drawTickBar && width > 230) {
                this.enableAxis = true;
                this.drawTicks(width, height, radius);
            } else {
                d3.select('.yLabels.axis').attr('visibility', 'hidden');
                this.enableAxis = false;
            }

            this.drawBack(width, height, radius);
            this.drawFill(width, height, radius, check);

            if (this.settings.showLabels) {
                this.drawText(width, height, radius);
            } else {
                $('.labeltext').text('');
            }
            d3.select('#yLabels axis').remove();
        }

        public drawBack(width: number, height: number, radius: number): void {
            const rectHeight: number = height - radius / 2;
            const fill: string = this.settings.borderColor;
            this.backCircle
                .attr({
                    cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                    cy: rectHeight,
                    rx: this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 : width / 2 - this.margins.small,
                    ry: 20
                })
                .style({
                    fill: fill,
                    stroke: this.shadeColor(fill, -20),
                    'stroke-width': '10px'
                });
            this.topCircle
                .attr({
                    cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                    cy: this.margins.bottom,
                    rx: this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 : width / 2 - this.margins.small,
                    ry: 20
                })
                .style({
                    fill: fill,
                    'stroke-width': 2,
                    stroke: this.shadeColor(fill, 15)
                });

            this.backRect
                .attr({
                    x: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ? this.margins.big + this.margins.small * 1.5
                                                                : this.margins.small / 2 : this.margins.small,
                    y: 27,
                    width: this.data1.drawTickBar ? width - 2 * this.margins.small - this.margins.big : width - 2 * this.margins.small,
                    height: rectHeight - 19
                })
                .style({
                    fill: fill
                });
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public drawFill(width: number, height: number, radius: number, check: boolean): void {
            const rectFill1: string = this.settings.rectFill1;
            const rectFill2: string = this.settings.rectFill2;
            const circleFill1: string = this.settings.circleFill1;
            const circleFill2: string = this.settings.circleFill2;
            const animationTime: number = this.settings.animationTime * 1000 < 0 ? 6000 : this.settings.animationTime * 1000;
            const targetFill: string = this.settings.targetColor;
            const greaterFill: string = this.settings.GreaterColor;
            const lessFill: string = this.settings.LessColor;
            const min: number = this.data1.min;
            const max: number = this.data1.max;
            const value: number = this.data1.value;
            const rectHeight: number = height - radius / 2;
            // 30 since we are providing value of cy for top circle as 30.
            const minMaxDiff: number = max - min === 0 ? 1 : max - min;
            const percentage: number = (rectHeight - this.margins.bottom) * ((value - min) / minMaxDiff);

            const yPos: number = rectHeight - percentage;
            // tslint:disable-next-line:no-any
            const yscale: any = d3.scale.linear()
                     .domain([this.data1.min, this.data1.max])
                     .range([rectHeight, this.margins.bottom]);

            this.gradient.attr('id', 'gradient')
                                    .attr('x1', '100%')
                                    .attr('y1', '0%')
                                    .attr('x2', '100%')
                                    .attr('y2', '100%')
                                    .attr('spreadMethod', 'pad');
            this.gradient.append('stop').attr('offset', '0%').attr('stop-color', this.settings.rectFill2).attr('stop-opacity', 1);
            this.gradient.append('stop').attr('offset', '100%').attr('stop-color', this.settings.rectFill1).attr('stop-opacity', 1);

            this.fillRect2
                .attr('y', yscale(this.data1.min))
                .attr('height', 0)
                .attr('width', width / 2)
                .style('fill', 'url(#gradient)')
                .attr({
                    x: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ? this.margins.big + this.margins.small * 1.5
                                                                : this.margins.small / 2 : this.margins.small,
                    width: this.data1.drawTickBar ? width - 2 * this.margins.small - this.margins.big : width - 2 * this.margins.small
                })
                .transition()
                    .duration(animationTime)
                    .attr('height', percentage - 5 < 0 ? 0 : percentage - 5)
                    .attr('y', yscale(this.data1.value) + 5)
                    .style('fill', 'url(#gradient)');

            //animation for cylinder
            if (this.highlight) {
                this.fillRect1
                    .attr('y', yscale(this.data1.min))
                    .attr('height', 0)
                    .style('fill', 'url(#gradient)')
                    .style('fill-opacity', 0.9)
                    .attr({
                        x: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ? this.margins.big + this.margins.small * 1.5
                                                                : this.margins.small / 2 : this.margins.small,
                        width: this.data1.drawTickBar ? width - 2 * this.margins.small - this.margins.big : width - 2 * this.margins.small
                    })
                    .transition()
                        .duration(animationTime)
                        .attr('height', yscale(this.highlightValue) > yscale(yscale.domain()[0]) ? 0 :
                         yscale(yscale.domain()[0]) - yscale(this.highlightValue))
                        .attr('y', yscale(this.highlightValue))
                        .style('fill', 'url(#gradient)');
                this.highlightCircle
                    .attr({
                        cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                        cy: yscale(this.data1.min),
                        rx: this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 : width / 2 - this.margins.small,
                        ry: 20
                    })
                    .style({
                        fill: circleFill2
                    })
                    // rising the fluid
                    .transition()
                        .duration(animationTime)
                        .attr('cy', yscale(this.highlightValue));
                this.fillRect2
                    .style('fill-opacity', 0.5);
            } else {
                this.fillRect2
                    .style('fill-opacity', 0.9);
            }

            if (this.settings.showZones) {
                const zoneValues: number[] = [];
                zoneValues.push(this.settings.range4);
                zoneValues.push(this.settings.range3);
                zoneValues.push(this.settings.range2);
                zoneValues.push(this.settings.range1);

                const colors: string[] = [];
                this.gradient1.attr('id', 'gradient1');
                this.gradient1.append('stop').attr('offset', '0%').attr('stop-color', this.settings.Zone4).attr('stop-opacity', 1);
                this.gradient1.append('stop').attr('offset', '100%').attr('stop-color', '#F1F1F1').attr('stop-opacity', 1);
                colors.push('url(#gradient1)');
                this.gradient2.attr('id', 'gradient2');
                this.gradient2.append('stop').attr('offset', '0%').attr('stop-color', this.settings.Zone3).attr('stop-opacity', 1);
                this.gradient2.append('stop').attr('offset', '100%').attr('stop-color', '#F1F1F1').attr('stop-opacity', 1);
                colors.push('url(#gradient2)');
                this.gradient3.attr('id', 'gradient3');
                this.gradient3.append('stop').attr('offset', '0%').attr('stop-color', this.settings.Zone2).attr('stop-opacity', 1);
                this.gradient3.append('stop').attr('offset', '100%').attr('stop-color', '#F1F1F1').attr('stop-opacity', 1);
                colors.push('url(#gradient3)');
                this.gradient4.attr('id', 'gradient4');
                this.gradient4.append('stop').attr('offset', '0%').attr('stop-color', this.settings.Zone1).attr('stop-opacity', 1);
                this.gradient4.append('stop').attr('offset', '100%').attr('stop-color', '#F1F1F1').attr('stop-opacity', 1);
                colors.push('url(#gradient4)');

                const zonesRect: d3.selection.Update<number> = this.zones.selectAll('zones_rect').data(zoneValues);
                zonesRect.enter().append('rect').classed('zones_rect', true);

                zonesRect.attr('height', 0)
                    .attr({
                        x: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ? this.margins.big + this.margins.small * 1.5
                                                                : this.margins.small / 2 : this.margins.small,
                        y: yscale,
                        // tslint:disable-next-line:typedef
                        height: (d): number => (yscale(yscale.domain()[0]) - yscale(d) < 0 ? 0
                                                : (yscale(yscale.domain()[0]) - yscale(d))),
                        width: this.data1.drawTickBar ? width - 2 * this.margins.small - this.margins.big : width - 2 * this.margins.small
                    })
                    // tslint:disable-next-line:typedef
                    .style('fill', (d, i): string => colors[i]);

                if (this.settings.range2) {
                    this.zone1.attr({
                            cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                        width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                        : width / 2 - this.margins.big / 2 - this.margins.small / 2 :
                                                                        width / 2,
                            cy: yscale(zoneValues[3]),
                            rx: this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 :
                             width / 2 - this.margins.small,
                            ry: 20
                        }).style({
                            fill: zoneValues[3] < this.data1.min ? 'none' : colors[2]
                        });
                }

                if (this.settings.range3) {
                    this.zone2.attr({
                            cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                    width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                    : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                            cy: yscale(zoneValues[2] || zoneValues[3]),
                            rx: this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2
                            : width / 2 - this.margins.small,
                            ry: 20
                        }).style({
                            fill: (zoneValues[3] < this.data1.min && zoneValues[2] < this.data1.min)
                                ? 'none' : colors[1]
                        });
                }

                if (this.settings.range4) {
                    this.zone3.attr({
                            cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                    width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                    : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                            cy: yscale(zoneValues[1] || zoneValues[2] || zoneValues[3]),
                            rx:
                            this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 : width / 2 - this.margins.small,
                            ry: 20
                        }).style({
                            fill: (zoneValues[3] < this.data1.min  && zoneValues[2] < this.data1.min && zoneValues[1] < this.data1.min)
                                ? 'none' : colors[0]
                        });
                }

                this.zone4.attr({
                        cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                    width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                    : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                        cy: yscale(zoneValues[0] || zoneValues[1] || zoneValues[2] || zoneValues[3]),
                        rx: this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 : width / 2 - this.margins.small,
                        ry: 20
                    }).style({
                        fill: (zoneValues[3] < this.data1.min && zoneValues[2] < this.data1.min
                            && zoneValues[1] < this.data1.min && zoneValues[0] < this.data1.min)
                            ? 'none' : this.settings.borderColor
                    });
            }

            this.fillCircle.attr({
                cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                cy: yscale(this.data1.min),
                rx: this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 : width / 2 - this.margins.small,
                ry: 20
            }).style({
                fill: circleFill1
            });

            //All Target circles
            if ((check)) {
                this.targetCircle.attr({
                    cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                    cy: yscale(this.highlight ? this.highlightTarget : this.data1.targetValue) + 5,
                    rx: this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 : width / 2 - this.margins.small,
                    ry: 20
                }).style({
                    fill: 'transparent',
                    'stroke-width':
                    this.highlight ? this.highlightTarget >= this.data1.min && this.highlightTarget <= this.data1.max ? 1 : 0 : 1,
                    stroke: targetFill
                });
            } else {
                this.targetCircle.style('stroke', 'transparent');
            }

            //target range circle which is less than targetcircle
            if (this.data1.targetRange === true && this.data1.Less) {
                this.lessCircle.attr({
                    cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                    cy: yscale(this.data1.Less) + 5,
                    rx: this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 : width / 2 - this.margins.small,
                    ry: 20
                }).style({
                    fill: 'transparent',
                    'stroke-width': 1,
                    stroke: lessFill,
                    'stroke-dasharray': '0 4',
                    'stroke-linecap': 'round'
                });
            } else {
                this.lessCircle.style('stroke', 'transparent');
            }

           //target range circle which is greater than targetcircle

            if (this.data1.targetRange === true && this.data1.Greater) {
                this.greaterCircle.attr({
                    cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                    cy: yscale(this.data1.Greater) + 5,
                    rx: this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 : width / 2 - this.margins.small,
                    ry: 20
                })
                .style({
                    fill: 'transparent',
                    'stroke-width': 1,
                    stroke: greaterFill,
                    'stroke-dasharray': '0 4',
                    'stroke-linecap': 'round'
                });
            } else {
                this.greaterCircle.style('stroke', 'transparent');
            }

            this.bottomCircle.attr({
                cx: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                                width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                                : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                cy: yscale(this.data1.value),
                rx: this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 : width / 2 - this.margins.small,
                ry: 20
            })
            .style({
                fill: circleFill2,
                'stroke-width': 2,
                stroke: this.shadeColor(circleFill2, 15)
            })
            // rising the fluid
            .attr('cy', rectHeight)
            .transition()
                .duration(animationTime)
                .attr('cy', percentage)
                .attr('cy', yscale(this.data1.value) + 5);

            if (this.settings.showZones) {
                if (this.highlight) {
                    this.highlightCircle.attr('rx', this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 - 5
                : width / 2 - this.margins.small - 5);
                }
                this.fillCircle.attr('rx', this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 - 5
                : width / 2 - this.margins.small - 5);
                this.bottomCircle.attr('rx', this.data1.drawTickBar ? width / 2 - this.margins.small - this.margins.big / 2 - 5
                 : width / 2 - this.margins.small - 5);
                this.fillRect1.attr({
                    x: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ? this.margins.big + this.margins.small * 1.5 + 5
                                                                : this.margins.small / 2 + 5 : this.margins.small + 5,
                    width
                    : this.data1.drawTickBar ? width - 2 * this.margins.small - this.margins.big - 10 : width - 2 * this.margins.small - 10
                });
                this.fillRect2.attr({
                    x: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ? this.margins.big + this.margins.small * 1.5 + 5
                                                                : this.margins.small / 2  + 5 : this.margins.small + 5,
                    width
                    : this.data1.drawTickBar ? width - 2 * this.margins.small - this.margins.big - 10 : width - 2 * this.margins.small - 10
                });
            }
        }

        private shadeColor(col: string, amt: number): string {
            let usePound: boolean = false;
            if (col[0] === '#') {
                col = col.slice(1);
                usePound = true;
            }
            const num: number = parseInt(col, 16);
            let r: number = (num >> 16) + amt;
            if (r > 255) {
                r = 255;
            } else if (r < 0) {
                r = 0;
            }

            let b: number = ((num >> 8) & 0x00FF) + amt;
            if (b > 255) {
                b = 255;
            } else if (b < 0) {
                b = 0;
            }

            let g: number = (num & 0x0000FF) + amt;
            if (g > 255) {
                g = 255;
            } else if (g < 0) {
                g = 0;
            }

            return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
        }

        private drawTicks(width: number, height: number, radius: number): void {
            const animationTime: number = this.settings.animationTime * 1000 < 0 ? 6000 : this.settings.animationTime * 1000;
            const min: number = this.data1.min;
            const max: number = this.data1.max;
            const value: number = this.data1.value;
            const minMaxDiff: number = max - min === 0 ? 1 : max - min;
            const rectHeight: number = height - radius / 2;
            const percentage: number = (rectHeight - this.margins.bottom) * ((value - min) / minMaxDiff);
            const yPos: number = rectHeight - percentage;
            d3.select('.yLabels.axis').attr('visibility', 'visible');
            // tslint:disable-next-line:no-any
            let y: any; let yAxis: any;
            const tickData: number[] = [];
            let icount: number;
            y = d3.scale.linear()
                .range([rectHeight, this.margins.bottom])
                .domain([this.data1.min, this.data1.max]);
            const interval: number = (this.data1.max - this.data1.min) / 4;

            tickData[0] = this.data1.min;
            for (icount = 1; icount < 5; icount++) {
                tickData[icount] = tickData[icount - 1] + interval;
            }

            let maxTickwidth: number = 0;
            let tickwidth: number = 0;
            // for calculating the position of the axis
            for (icount = 0; icount < 5; icount++) {
                const measureTextProperties: TextProperties = {
                    text: this.tickValueFormatter.format(tickData[icount]),
                    fontFamily: this.settings.tickFontFamily,
                    fontSize: `${this.settings.tickFontSize}px`
                };
                tickwidth = textMeasurementService.measureSvgTextWidth(measureTextProperties);
                maxTickwidth = (maxTickwidth < tickwidth ? tickwidth : maxTickwidth);
            }
            this.margins.big = maxTickwidth;

            yAxis = d3.svg.axis().scale(y)
                .ticks(4)
                .orient(this.settings.scalePosition)
                .tickValues(tickData)
                .tickFormat(this.tickValueFormatter.format);

            const translation: number = this.settings.scalePosition === 'left' ?
                                        this.margins.big + this.margins.small : width - this.margins.big - this.margins.small;
            const transformPos: string = `${'translate('}${translation}${', 2)'}`;
            this.tempMarkings
                .attr('transform', transformPos)
                .style({
                    'font-family': this.settings.tickFontFamily,
                    'font-size': `${this.settings.tickFontSize}px`,
                    stroke: 'none',
                    fill: this.settings.tickColor
                })
                .call(yAxis);

            if (height) {
                this.tempMarkings.selectAll('.axis line, .axis path').style({
                    stroke: this.settings.tickColor,
                    fill: 'none'
                });
            }
            if (this.data1.value) {
                this.axisMarking
                .attr({
                    stroke: this.settings.rectFill1,
                    'stroke-width' : 3,
                    x1: this.settings.scalePosition === 'left' ?
                            this.margins.big + this.margins.small : width - this.margins.big - this.margins.small,
                    y1: y(this.data1.min) + 2,
                    x2: this.settings.scalePosition === 'left' ?
                            this.margins.big + this.margins.small : width - this.margins.big - this.margins.small,
                    y2: y(this.data1.min) + 2
                })
                .transition().duration(animationTime)
                .attr({
                    y1: this.highlight ? y(this.highlightValue) : y(this.data1.value) + 2,
                    y2: y(this.data1.min) + 2
                });
            }
            //tooltip information adding
            const tooptipFormatter: utils.formatting.IValueFormatter = ValueFormatter.create({
                format: this.dataView.categorical.values[0].source.format
            });
            d3.selectAll('.yLabels.axis>.tick title').remove();
            d3.selectAll('.yLabels.axis>.tick')
                .append('title')
                .text(function (d: string): string {
                    return tooptipFormatter.format(d);
                });

            const ticks: JQuery = $('.yLabels.axis>.tick');
            // tslint:disable-next-line:no-any
            const domPositonTick1: any = ticks[0].getBoundingClientRect();
            // tslint:disable-next-line:no-any
            const domPositonTick2: any = ticks[1].getBoundingClientRect();
            const overlap : boolean = !(domPositonTick1.right < domPositonTick2.left ||
                domPositonTick1.left > domPositonTick2.right ||
                domPositonTick1.bottom < domPositonTick2.top ||
                domPositonTick1.top > domPositonTick2.bottom);
            if (overlap) {
                $('.yLabels.axis').remove();
                $('.highlight_line').remove();
            }
        }

        private drawText(width: number, height: number, radius: number): void {
           // const fill: string = this.settings.fillColor;
            const min: number = this.data1.min;
            const max: number = this.data1.max;
            const value: number = this.data1.value > max ? max : this.data1.value;
            const rectHeight: number = height - radius / 2;
            const minMaxDiff: number = max - min === 0 ? 1 : max - min;
            const percentage: number = (rectHeight - this.margins.bottom) * ((value - min) / minMaxDiff);
            const yPos: number = rectHeight - percentage;
            const finalText: string = this.getTMS(
                this.labelValueFormatter.format(this.highlight ? this.highlightValue : this.data1.value),
                this.settings.labelFontFamily, this.settings.labelFontSize, width / 2);
            this.text
                .classed('labeltext', true)
                .text(finalText)
                .style({
                    fill: this.settings.dataColor,
                    'text-anchor': 'middle',
                    'font-family': `${this.settings.labelFontFamily}`,
                    'font-size': `${this.settings.labelFontSize}px`
                });
            //tooltip information adding
            const tooptipFormatter: utils.formatting.IValueFormatter = ValueFormatter.create({
                format: this.dataView.categorical.values[0].source.format
            });
            this.text.append('title')
                .text(tooptipFormatter.format(this.data1.value > this.data1.max ? this.data1.max : this.data1.value));
            //label position in/out
            if (this.settings.labelPos.toString() === 'in') {
                d3.select('.labeltext')
                    .attr({
                        x: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                    width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                    : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                        y: yPos,
                        dy: '.35em'
                    });
            } else {
                if (this.settings.labelFontSize > 17) {
                    d3.select('.labeltext')
                        .attr({
                            x: this.data1.drawTickBar ? this.settings.scalePosition === 'left' ?
                                                    width / 2 + this.margins.big / 2 + this.margins.small / 2
                                                    : width / 2 - this.margins.big / 2 - this.margins.small / 2 : width / 2,
                            y: height,
                            dy: '.45em'

                        });
                } else {
                    d3.select('.labeltext')
                        .attr({
                            x: width / 2,
                            y: height - 5,
                            dy: '-.15em'

                        });
                }
            }
        }

        public getTMS(stringName: string, labelFontFamily: string, textSize: number, width: number): string {
            const measureTextProperties: TextProperties = {
                text: stringName,
                fontFamily: labelFontFamily,
                fontSize: `${textSize}px`
            };

            return textMeasurementService.getTailoredTextOrDefault(measureTextProperties, width);
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            // const instances: VisualObjectInstance[] = [];
            const dataView: DataView = this.dataView;
            const a: IProgressIndicatorValues = CylindricalGauge.getDefaultData();

            if (!this.data) {
                this.data = CylindricalGauge.getDefaultData();
            }
            let objectName: string;
            let objectEnum: VisualObjectInstance[];
            objectEnum = [];
            objectName = options.objectName;

            let props: { [propertyName: string]: DataViewPropertyValue; };
            switch (objectName) {
                case 'config':
                    props = {};
                    props.rectFill1 = this.settings.rectFill1;
                    props.rectFill2 = this.settings.rectFill2;
                    props.circleFill1 = this.settings.circleFill1;
                    props.circleFill2 = this.settings.circleFill2;
                    props.animationTime = this.settings.animationTime;
                    props.border = this.settings.borderColor;
                    if (!this.isMin) {
                        props.min = this.settings.minValue;
                    }
                    if (!this.isMax) {
                        props.max = this.settings.maxValue;
                    }
                    if (!this.isTarget) {
                        props.target = this.settings.tarValue;
                    }
                    props.targetColor = this.settings.targetColor;
                    props.targetRange = this.settings.targetRange;
                    if (this.settings.targetRange) {
                        props.Greater = this.settings.Greater;
                        props.GreaterColor = this.settings.GreaterColor;
                        props.Less = this.settings.Less;
                        props.LessColor = this.settings.LessColor;
                    }
                    props.tickBar = this.settings.tickBar;
                    if (this.settings.tickBar) {
                        props.tickColor = this.settings.tickColor;
                        props.scalePos = this.settings.scalePosition;
                        props.tickFontFamily = this.settings.tickFontFamily;
                        props.fontSize = this.settings.tickFontSize;
                        props.displayUnits = this.settings.tickDisplayUnits;
                        props.decimalValue = this.settings.tickDecimalPlaces;
                    }
                    objectEnum.push({
                        objectName: objectName,
                        properties: props,
                        selector: null
                    });
                    break;
                case 'colorSelector':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showZones,
                            range1: this.settings.range1,
                            Zone1: this.settings.Zone1,
                            range2: this.settings.range2,
                            Zone2: this.settings.Zone2,
                            range3: this.settings.range3,
                            Zone3: this.settings.Zone3,
                            range4: this.settings.range4,
                            Zone4: this.settings.Zone4
                        },
                        selector: null
                    });
                    break;
                case 'labels':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showLabels,
                            labelPosition: this.settings.labelPos,
                            fontFamily: this.settings.labelFontFamily,
                            fontSize: this.settings.labelFontSize,
                            dataColor: this.settings.dataColor,
                            displayUnits: this.settings.labelDisplayUnits,
                            decimalValue: this.settings.labelDecimalPlaces
                        },
                        selector: null
                    });
                    break;
                default:
                    break;
            }

            return objectEnum;
        }
    }
}
