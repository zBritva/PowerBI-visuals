module powerbi.extensibility.visual {
    let legendValues: {};
    legendValues = {};
    let legendValuesTorender: {};
    legendValuesTorender = {};
    let brickChartDefaultLegendFontSize: number;
    brickChartDefaultLegendFontSize = 8;
    let brickChartDefaultLegendShow: boolean;
    brickChartDefaultLegendShow = true;
    let brickChartLegendShowProp: DataViewObjectPropertyIdentifier;
    brickChartLegendShowProp = { objectName: 'legend', propertyName: 'show' };
    let brickChartGeneralFormatStringProp: DataViewObjectPropertyIdentifier;
    brickChartGeneralFormatStringProp = { objectName: 'general', propertyName: 'formatString' };
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import legendPosition = powerbi.extensibility.utils.chart.legend.position;
    import legend = powerbi.extensibility.utils.chart.legend;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import legendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import SelectionId = powerbi.visuals.ISelectionId;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import DataViewObjects = powerbi.DataViewObjects;
    import ISelectionManager = powerbi.extensibility.ISelectionManager;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import tooltip = powerbi.extensibility.utils.tooltip;
    import dataLabelUtils = powerbi.extensibility.utils.chart.dataLabel.utils;
    import IColorPalette = powerbi.extensibility.IColorPalette;

    const colonLiteral: string = ':';
    const custLegIndLiteral: string = 'cust_leg_ind';
    const custLegNameLiteral: string = 'cust_leg_name';
    const custLegValLiteral: string = 'cust_leg_val';
    const nullLiteral: string = '';

    //property to show or hide legend
    interface IBrickChartPlotSettings {
        showLegend: boolean;
    }

    //Data points for legend generation
    interface IBrickChartDataPoint {
        color: string;
        label: string;
        value: number;
        selector: SelectionId;
        tooltipInfo: ITooltipDataItem[];
    }

    interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }

    interface ITooltipDataItem {
        displayName: string;
        value: string;
    }

    interface IBrickChartData {
        categories: {};
        borderColor: string;
        randColor: {};
        toolTipInfo: ITooltipDataItem[];
        dataPoints: IBrickChartDataPoint[];
        legendData: LegendData;
        valueFormatter: IValueFormatter;
        settings: IBrickChartPlotSettings;
    }

    function getCategoricalObjectValue<T>(category: DataViewCategoryColumn, index: number, objectName: string, propertyName: string, defaultValue: T): T {
        let categoryObjects = category.objects;

        if (categoryObjects) {
            let categoryObject: DataViewObject = categoryObjects[index];
            if (categoryObject) {
                let object = categoryObject[objectName];
                if (object) {
                    let property: T = object[propertyName];
                    if (property !== undefined) {
                        return property;
                    }
                }
            }
        }
        return defaultValue;
    }

    export class BrickChart implements IVisual {
        //Variables
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        public host: IVisualHost;
        private svg: d3.Selection<SVGElement>;
        public data: IBrickChartData;
        public dataView: DataView;
        public groupLegends: d3.Selection<SVGElement>;
        public matrix: d3.Selection<SVGElement>;
        public root: d3.Selection<SVGElement>;
        public rootElement: d3.Selection<SVGElement>;
        public errorDiv: d3.Selection<SVGElement>;
        public svgs: {};
        // tslint:disable-next-line:no-any
        public zoom: any;
        // tslint:disable-next-line:no-any
        public toolTipInfo: any = {};
        public myStyles: d3.Selection<SVGElement>;
        public randColor: [string];
        private currentViewport: IViewport;
        private legend: ILegend;
        private legendObjectProperties: DataViewObject;

        public selectionManager: ISelectionManager;
        public static getDefaultData(): IBrickChartData {
            return {
                categories: {}
                , borderColor: '#555'
                , randColor: ['']
                , dataPoints: null
                , toolTipInfo: []
                , legendData: null
                , settings: { showLegend: brickChartDefaultLegendShow }
                , valueFormatter: null
            };
        }

        /** This is called once when the visual is initialially created */
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.root = d3.select(options.element);
            this.rootElement = d3.select(options.element)
                .append('div')
                .classed('brickchart_topContainer', true);
            let oElement: JQuery;
            oElement = $('div');
            this.legend = createLegend(oElement, false, null, true);
            this.initMatrix(options);
            this.toolTipInfo = [{ displayName: '', value: '' }];
        }

        public initMatrix(options: VisualConstructorOptions): void {
            let self: this;
            self = this;
            //Making the div for Square grid
            this.matrix = this.rootElement
                .append('div')
                .classed('matrix', true);

            this.svg = this.matrix
                .append('svg')
                .classed('svg', true)
                .attr('width', 211)
                .attr('height', 211);
        }

        // tslint:disable-next-line:no-any
        public static numberWithCommas(x: any): string {
            let numeric: number;
            numeric = parseInt(x, 10);
            let decimal: string;
            decimal = (x + nullLiteral).split('.')[1];
            if (decimal) {
                return `${numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimal.slice(0, 2)}`;
            } else {
                return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        }

        public updateStyleColor(): void {
            if (!this.myStyles) {
                this.myStyles = this.rootElement
                    .append('style')
                    .attr('id', 'legends_clr');
            }

            //  setting the boxes color
            let style: string;
            style = '';
            let index: number;
            for (index = 1; index <= this.data.dataPoints.length; index++) {
                let color: string;
                color = this.data.dataPoints[index-1].color;
                style += `.brickchart_topContainer .category-clr${index}{fill:${color};background:${color};}`;
            }

            //setting the stroke color
            style += '.brickchart_topContainer svg>rect{stroke:' + '#555' + ' ;}';

            this.myStyles.html(style);
        }

        // Calculate and return the sums
        // tslint:disable-next-line:no-any
        public calculateSum(dataSet: any): number {
            let sum: number;
            let index: number;
            sum = 0, index = 1;

            let sDataSetKey: string;
            for (sDataSetKey in dataSet) {
                if (parseFloat(dataSet[sDataSetKey].value) > 0) {
                    sum += dataSet[sDataSetKey].value;
                }
            }

            return sum;
        }

        //Convertor Function
        public static converter(dataView: DataView, host: IVisualHost): IBrickChartData {
            let data: IBrickChartData;
            data = BrickChart.getDefaultData();
            data.dataPoints = [];
          
            if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.values) {
                // tslint:disable-next-line:no-any
                const legends: any = dataView.categorical.categories[0].values;
                // tslint:disable-next-line:no-any
                const values: any = dataView.categorical.values[0].values;
                //creating colorePallete object
                let colorPalette: powerbi.extensibility.IColorPalette = host.colorPalette;
                const categorySourceFormatString: string = valueFormatter.getFormatString(
                    dataView.categorical.categories[0].source, brickChartGeneralFormatStringProp);
                let dataSet: {};
                dataSet = {};
                // add random color
                let categorical = dataView.categorical;
                let category = categorical.categories[0];
                let dataValue = categorical.values[0];
                let formatter: IValueFormatter;
                formatter = ValueFormatter.create({ format: 'dddd\, MMMM %d\, yyyy' });
                let iCounter: number;
                for (iCounter = 0; iCounter < legends.length; iCounter++) {
                    if(values[iCounter] <= 0) {
                        continue;
                    }
                    let defaultColor: Fill = {
                        solid: {
                            color: colorPalette.getColor(<string>category.values[iCounter]).value
                        }
                    };
                    dataSet[legends[iCounter]] = {};
                    const valueLiteral: string = 'value';
                    dataSet[legends[iCounter]][valueLiteral] = values[iCounter];

                    let formattedCategoryValue: string;
                    formattedCategoryValue = valueFormatter.format(legends[iCounter], categorySourceFormatString);
                    let tooltipInfo: ITooltipDataItem[];
                    tooltipInfo = [];
                    if (Date.parse(legends[iCounter]) && (formatter.format(legends[iCounter]) !== 'dddd MMMM %d yyyy')) {
                        data.dataPoints.push({
                            label: legends[iCounter],
                            value: values[iCounter],
                            color: getCategoricalObjectValue<Fill>(category, iCounter, 'colorSelector', 'fill', defaultColor).solid.color,
                            selector: host.createSelectionIdBuilder().withCategory(
                                dataView.categorical.categories[0], iCounter).createSelectionId(),
                            tooltipInfo: tooltipInfo
                        });
                    } else {
                        data.dataPoints.push({
                            label: legends[iCounter],
                            value: values[iCounter],
                            color: getCategoricalObjectValue<Fill>(category, iCounter, 'colorSelector', 'fill', defaultColor).solid.color,
                            selector: host.createSelectionIdBuilder().withCategory(
                                dataView.categorical.categories[0], iCounter).createSelectionId(),
                            tooltipInfo: tooltipInfo
                        });
                    }
                }
                data.categories = dataSet;
            }
            data.legendData = BrickChart.getLegendData(dataView, data.dataPoints, host);
            data.settings = BrickChart.parseLegendSettings(dataView);

            return data;
        }

        private static getLegendData(dataView: DataView, brickChartDataPoints: IBrickChartDataPoint[], host: IVisualHost): LegendData {
            let sTitle: string;
            sTitle = '';
            if (dataView && dataView.categorical && dataView.categorical.categories
                && dataView.categorical.categories[0] && dataView.categorical.categories[0].source) {
                sTitle = dataView.categorical.categories[0].source.displayName;
            }
            let legendData: LegendData;
            legendData = {
                fontSize: brickChartDefaultLegendFontSize,
                dataPoints: [],
                title: sTitle
            };
            let iCount: number;
            for (iCount = 0; iCount < brickChartDataPoints.length; ++iCount) {

                if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[0]) {
                    if (brickChartDataPoints[iCount].label === null) {
                        brickChartDataPoints[iCount].label = '(Blank)';
                    }
                    legendData.dataPoints.push({
                        label: brickChartDataPoints[iCount].label,
                        color: brickChartDataPoints[iCount].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        selected: false,
                        identity: host.createSelectionIdBuilder().withCategory(
                            dataView.categorical.categories[0], iCount).createSelectionId()
                    });
                }
                legendValues[iCount] = brickChartDataPoints[iCount].value;
            }

            return legendData;
        }

        private static parseLegendSettings(dataView: DataView): IBrickChartPlotSettings {
            let objects: DataViewObjects;
            if (!dataView) {
                objects = null;
            } else if (dataView && dataView.metadata) {
                objects = dataView.metadata.objects;
            }

            return {
                showLegend: powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, brickChartLegendShowProp, brickChartDefaultLegendShow)
            };
        }

        //Updates the zoom
        // tslint:disable-next-line:no-any
        public updateZoom(options: any): void {
            let WIDTH: number;
            WIDTH = 211;
            let HEIGHT: number;
            HEIGHT = 211;
            // tslint:disable-next-line:no-any
            let viewport: IViewport;
            viewport = options.viewport;
            let orient: legend.LegendPosition;
            orient = this.legend.getOrientation();
            let legendHeight: number;
            let legendWidth: number;
            legendHeight = this.legend.getMargins().height;
            legendWidth = this.legend.getMargins().width;
            let legendHeightForZoom: number;
            let legendWidthForZoom: number;
            legendHeightForZoom = ((this.legend.getMargins().height) * HEIGHT) / viewport.height;
            legendWidthForZoom = (this.legend.getMargins().width) * WIDTH / viewport.width;
            switch (orient) {
                case 0:
                case 5:
                case 1:
                case 4:
                case 6: {
                    this.rootElement.style('width', '98%');
                    break;
                }
                case 7:
                case 8:
                case 2:
                case 3: {
                    let customWidth: number;
                    customWidth = viewport.width - legendWidth;
                    let pxLiteral: string;
                    pxLiteral = 'px';
                    this.rootElement.style('width', customWidth + pxLiteral);
                    WIDTH += legendWidthForZoom + 22;
                    break;
                }
                default:
                    break;
            }
            let height: number;
            let width: number;
            height = viewport.height - legendHeight;
            width = viewport.width - legendHeight;
            this.zoom = Math.min(width / WIDTH, height / HEIGHT) - 0.03;

            if (navigator.userAgent.indexOf('Firefox/') > 0) {
                this.matrix.style('transform', `Scale(${this.zoom})`);
            }
            if (navigator.userAgent.indexOf('Edge/') > 0) {
                this.matrix.style('transform', `Scale(${this.zoom})`);
                if (this.zoom < 1) {
                    this.matrix.style('zoom', this.zoom);
                }
            } else {
                this.matrix.style('zoom', this.zoom);
            }

            if (this.zoom < 0.1) {
                this.root.select('.legend').style('display', 'none');
            } else {
                this.root.select('.legend').style('display', 'inherit');
            }
            if (this.zoom < 0.06) {
                this.root.select('.matrix').style('display', 'none');
            } else {
                this.root.select('.matrix').style('display', 'inline-block');
            }

        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions): void {
       
            let dataView: DataView;
            dataView = this.dataView = options.dataViews[0];
            this.data = BrickChart.converter(dataView, this.host);
            let format: string;
            format = '0';
            let formatter: IValueFormatter;
            if (dataView && dataView.categorical && dataView.categorical.values &&
                dataView.categorical.values[0] && dataView.categorical.values[0].source) {
                format = dataView.categorical.values[0].source.format;
                formatter = valueFormatter.create({ format: format, precision: 2, allowFormatBeautification: true });
            } else {
                formatter = valueFormatter.create({ value: 0, precision: 2, allowFormatBeautification: true });
            }
            let dataSet: {};
            dataSet = {};
            dataSet = this.data.categories;
            let sum: number;
            sum = this.calculateSum(dataSet);

            const visualContext: this = this;

            this.currentViewport = {
                height: Math.max(0, options.viewport.height),
                width: Math.max(0, options.viewport.width)
            };
         

            this.svg.selectAll('rect').remove();
            this.svgs = {};
            //Making squares
            let iRow: number;
            let iColumn: number;
            for (iRow = 0; iRow < 10; iRow++) {
                for (iColumn = 0; iColumn < 10; iColumn++) {
                    let svg: d3.Selection<SVGElement>;
                    svg = this.svg
                        .append('rect')
                        .attr('x', (21 * iColumn))
                        .attr('y', (21 * iRow))
                        .attr('width', 21)
                        .attr('height', 21)
                        .attr('fill', 'none')
                        .classed('linearSVG', true);
                    const custIdLiteral: string = 'cust_id';
                    svg[0][0][custIdLiteral] = iRow + colonLiteral + iColumn;
                    this.svgs[iRow + colonLiteral + iColumn] = svg[0][0];
                    this.svgs[iRow + colonLiteral + iColumn].setAttribute('class', 'linearSVG category-clr');
                    this.svgs[iRow + colonLiteral + iColumn][custLegIndLiteral] = '';
                    this.svgs[iRow + colonLiteral + iColumn][custLegNameLiteral] = '';
                    this.svgs[iRow + colonLiteral + iColumn][custLegValLiteral] = '';
                }
            }
            
            let last: number;
            let category: number;
            last = 0, category = 0;
            //Assigning css color class to the squares
            if (this.data.dataPoints.length) {
                let k1: number;
                for (k1 = 0; k1 < this.data.dataPoints.length; k1++) {
                    if (this.data.dataPoints[k1].value > 0) {
                        let cnt: number;
                        cnt = Math.round(100 * (this.data.dataPoints[k1].value / sum));
                        if (cnt > 0) {
                            category++;
                            let index: number;
                            for (index = 0; index < cnt; index++) {
                                if (index >= 100) {
                                    break;
                                }
                                let row: number;
                                let col: number;
                                row = Math.floor((last + index) / 10);
                                col = (last + index) % 10;
                                if (!this.svgs[col + colonLiteral + row]) { break; }
                                this.svgs[col + colonLiteral + row].setAttribute('class', `linearSVG category-clr${category}`);
                                this.svgs[col + colonLiteral + row][custLegIndLiteral] = category;
                                this.svgs[col + colonLiteral + row][custLegNameLiteral] = this.data.dataPoints[k1].label;
                                this.svgs[col + colonLiteral + row][custLegValLiteral] = this.data.dataPoints[k1].value;
                                let toolTipInfo: ITooltipDataItem[];
                                toolTipInfo = [];
                                toolTipInfo.push({
                                    displayName: dataView.categorical.categories[0].source.displayName,
                                    value: this.data.dataPoints[k1].label + nullLiteral
                                });
                                toolTipInfo.push({
                                    displayName: dataView.categorical.values[0].source.displayName,
                                    value: formatter.format(this.data.dataPoints[k1].value)
                                });
                                this.svgs[col + colonLiteral + row]['cust-tooltip'] = toolTipInfo;
                                this.toolTipInfo[k1] = toolTipInfo;
                            }
                            last += cnt;
                        }
                    }
                }
            }
           
            let objects: DataViewObjects;
            objects = null;
            if (options.dataViews && options.dataViews[0] && options.dataViews[0].metadata && options.dataViews[0].metadata.objects) {
                objects = options.dataViews[0].metadata.objects;
                this.data.settings.showLegend = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, { objectName: 'legend', propertyName: 'show' }, this.data.settings.showLegend);
                this.data.borderColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                    objects, { objectName: 'general', propertyName: 'borderColor' }, this.data.borderColor);
                this.data.legendData.title = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, { objectName: 'legend', propertyName: 'titleText' }, this.data.legendData.title);

                this.rootElement.select('svg.svg')
                    .selectAll('rect')
                    .style('stroke', this.data.borderColor);

                let ind: number;
                ind = 0;
                let k1: number;
                for (k1 = 0; k1 < _.keys(this.data.categories).length; k1++) {
                    let clr: string;
                    clr = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                        objects,
                        { objectName: `dataPoint_${ind}`, propertyName: _.keys(this.data.categories)[k1] }, '');
                    ind++;
                }
            }
            this.renderLegend(this.data, sum);
            this.updateStyleColor();
            this.tooltipServiceWrapper.addTooltip(
                d3.selectAll('svg>*'), (tooltipEvent: TooltipEventArgs<number>) => {
                    return tooltipEvent.context['cust-tooltip'];
                },
                (tooltipEvent: TooltipEventArgs<number>) => null, true);
            this.updateZoom(options);
        }

        private renderLegend(brickChartData: IBrickChartData, sum: number): void {
            if (!brickChartData || !brickChartData.legendData) {
                return;
            }

            if (this.dataView && this.dataView.metadata) {
                this.legendObjectProperties = powerbi.extensibility.utils.dataview.DataViewObjects.getObject(
                    this.dataView.metadata.objects, 'legend', {});
            }

            let legendData: LegendData;
            legendData = brickChartData.legendData;

            let legendDataTorender: LegendData;
            legendDataTorender = {
                fontSize: brickChartDefaultLegendFontSize,
                dataPoints: [],
                title: legendData.title
            };
        
            let j: number;
            for (j = 0; j < legendData.dataPoints.length; j++) {
                let cnt: number;
                cnt = Math.round(100 * ((legendValues[j]) / sum));
                if (cnt > 0) {
                    if (legendData.dataPoints[j].label === null) {
                        legendData.dataPoints[j].label = '(Blank)';
                    }
                    legendDataTorender.dataPoints.push({
                        label: legendData.dataPoints[j].label,
                        color: legendData.dataPoints[j].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        selected: false,
                        identity: legendData.dataPoints[j].identity
                    });
                    legendValuesTorender[j] = legendValues[j];
                }
            }

            let iIterator: number;
            iIterator = 0;
            legendDataTorender.dataPoints.forEach(function (ele: legend.LegendDataPoint): void { ele.color = brickChartData.dataPoints[iIterator++].color; });
            if (this.legendObjectProperties) {
                powerbi.extensibility.utils.chart.legend.data.update(legendDataTorender, this.legendObjectProperties);
                let position: string;
                position = <string>this.legendObjectProperties[powerbi.extensibility.utils.chart.legend.legendProps.position];

                if (position) {
                    this.legend.changeOrientation(LegendPosition[position]);
                }
            }

            this.legend.drawLegend(legendDataTorender, _.clone(this.currentViewport));
            powerbi.extensibility.utils.chart.legend.positionChartArea(this.rootElement, this.legend);

        }
        //public specificColorchoice()
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
          
            let enumeration: VisualObjectInstance[];
            enumeration = [];
            if (!this.data) {
                this.data = BrickChart.getDefaultData();
            }

            switch (options.objectName) {
                case 'general':
                    enumeration.push({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            borderColor: this.data.borderColor
                        }
                    });
                    break;

                case 'legend':
                    enumeration.push({
                        objectName: 'legend',
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            show: this.data.settings.showLegend,
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: powerbi.extensibility.utils.dataview.DataViewObject.getValue(
                                this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.showTitle, true),
                            titleText: this.data.legendData ? this.data.legendData.title : '',
                            labelColor: powerbi.extensibility.utils.dataview.DataViewObject.getValue(
                                this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.labelColor, null),
                            fontSize: powerbi.extensibility.utils.dataview.DataViewObject.getValue(
                                this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.fontSize,
                                brickChartDefaultLegendFontSize)
                        }
                    });
                    break;

                case 'colorSelector':
                    for (let dataPoints of this.data.dataPoints) {
                        if(dataPoints.value > 0) {
                            enumeration.push({
                                objectName: 'Color',
                                displayName: dataPoints.label,
                                properties: {
                                    fill: {
                                        solid: {
                                            color: dataPoints.color
                                        }
                                    }
                                },
                                selector: dataPoints.selector.getSelector()
    
                            });    
                        } 
                    }
                    break;
                default:
            }

            return enumeration;
        }
    }
}
