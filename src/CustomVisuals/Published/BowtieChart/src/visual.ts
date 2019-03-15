module powerbi.extensibility.visual {
    import IVisual = powerbi.extensibility.visual.IVisual;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

    import SelectionManager = powerbi.extensibility.ISelectionManager;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import SelectionId = powerbi.visuals.ISelectionId;
    import IDataColorPalette = powerbi.extensibility.IColorPalette;
    import IDataLabelSettings = powerbi.extensibility.utils.chart.dataLabel.IDataLabelSettings;
    import VisualDataLabelsSettings = powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettings;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
    //tooltip
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import tooltip = powerbi.extensibility.utils.tooltip;
    import dataLabelUtils = powerbi.extensibility.utils.chart.dataLabel.utils;
    import TextMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import ISelectionManager = powerbi.extensibility.ISelectionManager;

    // tslint:disable-next-line:no-any
    export let bowtieProps: any = {
        general: {
            ArcFillColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'ArcFillColor' }
        },
        show: { objectName: 'GMODonutTitle', propertyName: 'show' },
        titleText: { objectName: 'GMODonutTitle', propertyName: 'titleText' },
        titleFill: { objectName: 'GMODonutTitle', propertyName: 'fill1' },
        titleBackgroundColor: { objectName: 'GMODonutTitle', propertyName: 'backgroundColor' },
        titleFontSize: { objectName: 'GMODonutTitle', propertyName: 'fontSize' },
        tooltipText: { objectName: 'GMODonutTitle', propertyName: 'tooltipText' },
        labels: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'color' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'displayUnits' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'textPrecision' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'fontSize' }
        },
        Aggregatelabels: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'color' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'displayUnits' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'textPrecision' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'fontSize' },
            Indicator: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'Indicator' },
            signIndicator: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'signIndicator' },
            Threshold: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'Threshold' }
        }
    };

    interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }
    export interface ITooltipDataItem {
        displayName: string;
        value: string;
    }

    export interface IBowtieData {
        dataPoints: IBowtieDataPoint[];
        valueFormatter: IValueFormatter;
        legendObjectProps: DataViewObject;
        labelSettings: VisualDataLabelsSettings;
        AggregatelabelSettings: IAggregatelabelSettings;
        chartType: string;
        aggregatedSum: number;
        ArcFillColor: string;
    }

    export interface IBowtieDataPoint {
        color: string;
        DestCategoryLabel: string;
        SourceCategoryLabel: string;
        selector: SelectionId;
        value: number;
        SourceArcWidth: number;
        DestCatArcWidth: number;
        srcValue: number;
        selectionId: ISelectionId[];
    }

    export interface IAggregatelabelSettings {
        color: string;
        displayUnits: number;
        textPrecision: number;
        Indicator: boolean;
        fontSize: number;
        Threshold: number;
        signIndicator: boolean;
    }
    export class BowtieChart implements IVisual {
        public host: IVisualHost;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private svg: d3.Selection<SVGElement>;
        private bowtieMainContainer: d3.Selection<SVGElement>;
        private bowtieChartAggregated: d3.Selection<SVGElement>;
        private bowtieChartDestination: d3.Selection<SVGElement>;
        private bowtieChartSVGDestination: d3.Selection<SVGElement>;
        private bowtieChartSVGSource: d3.Selection<SVGElement>;
        private bowtieChartSource: d3.Selection<SVGElement>;
        private bowtieChartError: d3.Selection<SVGElement>;
        private mainGroupElement: d3.Selection<SVGElement>;
        private bowtieChartHeadings: d3.Selection<SVGElement>;
        private centerText: d3.Selection<SVGElement>;
        private colors: IDataColorPalette;
        private selectionManager: ISelectionManager;
        private dataView: DataView;
        private dataViews: DataView[];
        private legend: ILegend;
        private data: IBowtieData;
        private currentViewport: IViewport;
        private convertedData: IBowtieData;
        private metricName: string;
        private sourceName: string;
        private destinationName: string;
        private root: d3.Selection<SVGElement>;
        private titleSize: number = 12;
        private updateCount: number = 0;
        private prevIndicator: boolean = false;
        private isNegative: boolean = false;
        private formatString: string = '0';
        // tslint:disable-next-line:no-any
        public thisObj: any;
        public flagliteral: number;
        public categoryLabel: string;
        public flag: boolean = true;
        public maxValNew: number;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.root = d3.select(options.element);
            this.selectionManager = options.host.createSelectionManager();
            let container: d3.Selection<SVGElement>;
            container = this.bowtieMainContainer = d3.select(options.element)
                .append('div')
                .classed('BowtieMainContainer', true)
                .style('cursor', 'default');

            container
                .append('div')
                .classed('Title_Div_Text', true)
                .style({ width: '100%', display: 'inline-block' })
                .append('div')
                .classed('GMODonutTitleDiv', true)
                .style({ 'max-width': '80%', display: 'inline-block' })
                .append('span')
                .classed('GMODonutTitleIcon', true)
                .style({ width: '2%', display: 'none', cursor: 'pointer', 'white-space': 'pre' });

            let bowtieChartError: d3.Selection<SVGElement>;
            bowtieChartError = this.bowtieChartError = container
                .append('div')
                .classed('BowtieChartError', true);

            let bowtieChartHeadings: d3.Selection<SVGElement>;
            bowtieChartHeadings = this.bowtieChartHeadings = container
                .append('div')
                .classed('BowtieChartHeadings', true);

            let bowtieChartSource: d3.Selection<SVGElement>;
            bowtieChartSource = this.bowtieChartSource = container
                .append('div')
                .classed('BowtieChartSource', true);

            let bowtieChartSVGSource: d3.Selection<SVGElement>;
            bowtieChartSVGSource = this.bowtieChartSVGSource = container
                .append('div')
                .classed('BowtieChartSVGSource', true);

            let bowtieChartAggregated: d3.Selection<SVGElement>;
            bowtieChartAggregated = this.bowtieChartAggregated = container
                .append('div')
                .classed('BowtieChartAggregated', true);

            let bowtieChartSVGDestination: d3.Selection<SVGElement>;
            bowtieChartSVGDestination = this.bowtieChartSVGDestination = container
                .append('div')
                .classed('BowtieChartSVGDestination', true);

            let bowtieChartDestination: d3.Selection<SVGElement>;
            bowtieChartDestination = this.bowtieChartDestination = container
                .append('div')
                .classed('BowtieChartDestination', true);
        }

        private getDefaultBowtieData(): IBowtieData {
            return <IBowtieData>{
                dataPoints: [],
                legendObjectProps: {},
                valueFormatter: null,
                labelSettings: dataLabelUtils.getDefaultLabelSettings(),
                AggregatelabelSettings: this.getDefaultAggregateLabelSettings(),
                chartType: 'HalfBowtie',
                aggregatedSum: 0,
                ArcFillColor: '#0099FF'
            };
        }

        public getDefaultAggregateLabelSettings(): IAggregatelabelSettings {
            return {
                Indicator: false,
                color: 'black',
                displayUnits: 0,
                textPrecision: 0,
                fontSize: 9,
                Threshold: 0,
                signIndicator: false
            };
        }

        private getLabelSettings(dataView: DataView, labelSettings: VisualDataLabelsSettings): VisualDataLabelsSettings {
            let objects: DataViewObjects = null;
            if (!dataView.metadata || !dataView.metadata.objects) {
                return labelSettings;
            }

            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            let asterPlotLabelsProperties: any;
            asterPlotLabelsProperties = bowtieProps;

            labelSettings.precision = DataViewObjects.getValue(
                objects, asterPlotLabelsProperties.labels.textPrecision, labelSettings.precision);
            labelSettings.precision = labelSettings.precision < 0 ? 0 : (labelSettings.precision > 4 ? 4 : labelSettings.precision);
            labelSettings.fontSize = DataViewObjects.getValue(objects, asterPlotLabelsProperties.labels.fontSize, labelSettings.fontSize);
            labelSettings.displayUnits = DataViewObjects.getValue(
                objects, asterPlotLabelsProperties.labels.displayUnits, labelSettings.displayUnits);
            labelSettings.labelColor = DataViewObjects.getFillColor(
                objects, asterPlotLabelsProperties.labels.color, labelSettings.labelColor);

            return labelSettings;
        }

        private getAggregateLabelSettings(dataView: DataView): IAggregatelabelSettings {
            let objects: DataViewObjects = null;
            let labelSettings: IAggregatelabelSettings;
            labelSettings = this.getDefaultAggregateLabelSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return this.getDefaultAggregateLabelSettings();
            }

            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            let asterPlotLabelsProperties: any;
            asterPlotLabelsProperties = bowtieProps;

            labelSettings.textPrecision = DataViewObjects.getValue(
                objects, asterPlotLabelsProperties.Aggregatelabels.textPrecision, labelSettings.textPrecision);
            labelSettings.textPrecision = labelSettings.textPrecision < 0 ? 0 :
                (labelSettings.textPrecision > 4 ? 4 : labelSettings.textPrecision);
            labelSettings.fontSize = DataViewObjects.getValue(
                objects, asterPlotLabelsProperties.Aggregatelabels.fontSize, labelSettings.fontSize);
            labelSettings.displayUnits = DataViewObjects.getValue(
                objects, asterPlotLabelsProperties.Aggregatelabels.displayUnits, labelSettings.displayUnits);
            labelSettings.color = DataViewObjects.getFillColor(
                objects, asterPlotLabelsProperties.Aggregatelabels.color, labelSettings.color);
            labelSettings.Indicator = DataViewObjects.getValue(
                objects, asterPlotLabelsProperties.Aggregatelabels.Indicator, labelSettings.Indicator);
            labelSettings.signIndicator = DataViewObjects.getValue(
                objects, asterPlotLabelsProperties.Aggregatelabels.signIndicator, labelSettings.signIndicator);
            labelSettings.Threshold = DataViewObjects.getValue(
                objects, asterPlotLabelsProperties.Aggregatelabels.Threshold, labelSettings.Threshold);

            return labelSettings;
        }

        // tslint:disable-next-line:no-any
        private static getTooltipData(value: any): VisualTooltipDataItem[] {
            return [{
                displayName: value[0].displayName.toString(),
                value: value[0].value.toString()
            },
            {
                displayName: value[1].displayName.toString(),
                value: value[1].value.toString()
            }];
        }
        // tslint:disable-next-line:cyclomatic-complexity
        public converter(dataView: DataView, colors: IDataColorPalette, host: IVisualHost): IBowtieData {
            let asterDataResult: IBowtieData;
            asterDataResult = this.getDefaultBowtieData();
            let isHalfBowtie: boolean;
            let isFullBowtie: boolean;
            if (!this.dataViewContainsCategory(dataView) || dataView.categorical.categories.length < 1) {
                return asterDataResult;
            } else if (dataView.categorical.categories.length === 1) {
                isHalfBowtie = true;
            } else if (dataView.categorical.categories.length === 2) {
                isFullBowtie = true;
            }
            let k: number;
            k = 0;
            let cat: PrimitiveValue;
            let catDv: DataViewCategorical;
            catDv = dataView && dataView.categorical;
            let catDestination: DataViewCategoryColumn;
            catDestination = catDv && catDv.categories && catDv.categories[0];
            let catSource: DataViewCategoryColumn;
            if (isFullBowtie) {
                catSource = catDv && catDv.categories && catDv.categories[1];
            }

            let catDestValues: PrimitiveValue[];
            catDestValues = catDestination && catDestination.values;
            let catSourceValues: PrimitiveValue[];
            catSourceValues = catSource ? catSource.values : null;
            let values: DataViewValueColumns;
            values = catDv && catDv.values;

            if (values) {
                this.formatString = values[0].source.format;
            }

            this.metricName = values && values[0] && values[0].source.displayName;
            this.destinationName = catDestination && catDestination.source && catDestination.source.displayName;
            this.sourceName = catSource ? catSource.source.displayName : '';

            let aggregatedSum: number = 0;
            if (values && values[0]) {
                aggregatedSum = d3.sum(values[0].values, function (d: number): number {
                    if (d && d > 0) {
                        return d;
                    } else {
                        return 0;
                    }
                });
            }
            asterDataResult.labelSettings.precision = 0;
            asterDataResult.labelSettings = this.getLabelSettings(dataView, asterDataResult.labelSettings);
            asterDataResult.AggregatelabelSettings = this.getAggregateLabelSettings(dataView);
            asterDataResult.chartType = isFullBowtie ? 'FullBowtie' : isHalfBowtie ? 'HalfBowtie' : null;
            asterDataResult.aggregatedSum = aggregatedSum;

            if (!catDestValues || catDestValues.length < 1 || !values || values.length < 1 || !asterDataResult.chartType) {
                this.isNegative = false;

                return asterDataResult;
            }

            let formatter: IValueFormatter;
            formatter = ValueFormatter.create({ format: 'dddd\, MMMM %d\, yyyy' });
            // Populating source and destination values and their aggregations
            // Destination
            let arrDestination: PrimitiveValue[];
            arrDestination = [];
            let i: number;
            let length: number;
            let category: PrimitiveValue;
            for (i = 0, length = catDestValues.length; i < length; i++) {
                if (values[0] && values[0].values && values[0].values.length > 0) {
                    category = catDestValues[i];
                    category = category ? category : '(Blank)';
                    let sCategory: string;
                    sCategory = '';
                    let destArcWidth: number = 0;
                    let destCatSum: number;
                    destCatSum = 0;
                    for (let j: number = 0; j < length; j++) {
                        // tslint:disable-next-line:no-any
                        let value: any;
                        value = values[0].values[j];
                        if (value < 0) {
                            this.isNegative = true;

                            return;
                        }
                        let innerCat: PrimitiveValue = catDestValues[j];
                        innerCat = (innerCat ? catDestValues[j] : '(Blank)');
                        if (innerCat === category) {
                            destCatSum += value;
                        }
                    }
                    if (aggregatedSum > 0) {
                        destArcWidth = destCatSum / aggregatedSum;
                    }

                    if (arrDestination.indexOf(category) === -1 && destCatSum !== 0) {
                        if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                            asterDataResult.dataPoints.push({
                                DestCategoryLabel: formatter.format(category),
                                SourceCategoryLabel: null,
                                DestCatArcWidth: destArcWidth,
                                SourceArcWidth: null,
                                color: '',
                                selector: host.createSelectionIdBuilder().withCategory(catDestination, i).createSelectionId(),
                                value: destCatSum,
                                srcValue: 0,
                                selectionId: []
                            });
                        } else {
                            asterDataResult.dataPoints.push({
                                DestCategoryLabel: category.toString(),
                                SourceCategoryLabel: null,
                                DestCatArcWidth: destArcWidth,
                                SourceArcWidth: null,
                                color: '',
                                selector: host.createSelectionIdBuilder().withCategory(catDestination, i).createSelectionId(),
                                value: destCatSum,
                                srcValue: 0,
                                selectionId: []
                            });
                        }
                        asterDataResult.dataPoints[k].selectionId.push(asterDataResult.dataPoints[k].selector);
                        arrDestination.push(category);
                        k++;
                    } else if (arrDestination.indexOf(category) !== -1) {
                        if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                            cat = formatter.format(category);
                        } else {
                            cat = category.toString();
                        }
                        asterDataResult.dataPoints.forEach(function (d: IBowtieDataPoint): void {
                            if (d.DestCategoryLabel === cat) {
                                d.selectionId.push(host.createSelectionIdBuilder().withCategory(catDestination, i).createSelectionId());
                            }
                        });
                    }
                }
            }

            if (asterDataResult.chartType === 'FullBowtie') {
                let arrSource: PrimitiveValue[];
                arrSource = [];
                let srcLength: number;
                for (i = 0, srcLength = catSourceValues && catSourceValues.length; i < length; i++) {
                    let currentValue: PrimitiveValue;
                    currentValue = values[0].values[i];
                    category = catSourceValues[i];
                    let destArcWidth: number = 0;
                    let destCatSum: number;
                    destCatSum = 0;
                    category = category ? category : '(Blank)';
                    for (let j: number = 0; j < srcLength; j++) {
                        // tslint:disable-next-line:no-any
                        let value: any;
                        value = values[0].values[j];
                        if (value < 0) {
                            this.isNegative = true;

                            return;
                        }
                        let innerCat: string | number | boolean | Date = catSourceValues[j];
                        innerCat = (innerCat ? catSourceValues[j] : '(Blank)');
                        if (innerCat === category) {
                            destCatSum += value;
                        }
                    }
                    if (aggregatedSum > 0) {
                        destArcWidth = destCatSum / aggregatedSum;
                    }

                    if (arrSource.indexOf(category) === -1 && destCatSum !== 0) {
                        if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                            asterDataResult.dataPoints.push({
                                DestCategoryLabel: null,
                                SourceCategoryLabel: formatter.format(category),
                                DestCatArcWidth: null,
                                SourceArcWidth: destArcWidth,
                                color: '',
                                selector: host.createSelectionIdBuilder().withCategory(catSource, i).createSelectionId(),
                                value: 0,
                                srcValue: destCatSum,
                                selectionId: []
                            });
                        } else {
                            asterDataResult.dataPoints.push({
                                DestCategoryLabel: null,
                                SourceCategoryLabel: category.toString(),
                                DestCatArcWidth: null,
                                SourceArcWidth: destArcWidth,
                                color: '',
                                selector: host.createSelectionIdBuilder().withCategory(catSource, i).createSelectionId(),
                                value: 0,
                                srcValue: destCatSum,
                                selectionId: []
                            });
                        }
                        asterDataResult.dataPoints[k].selectionId.push(asterDataResult.dataPoints[k].selector);
                        arrSource.push(category);
                        k++;
                    } else if (arrSource.indexOf(category) !== -1) {
                        if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                            cat = formatter.format(category);
                        } else {
                            cat = category.toString();
                        }
                        asterDataResult.dataPoints.forEach(function (d: IBowtieDataPoint): void {
                            if (d.SourceCategoryLabel === cat) {
                                d.selectionId.push(host.createSelectionIdBuilder().withCategory(catSource, i).createSelectionId());
                            }
                        });
                    }
                }
            }

            return asterDataResult;
        }
        // tslint:disable-next-line:cyclomatic-complexity
        public newConverter(dataView: DataView, colors: IDataColorPalette,
            // tslint:disable-next-line:no-any
                            host: IVisualHost, label: any, sumvalue: any, type: any): IBowtieData {

            let asterDataResult: IBowtieData;
            asterDataResult = this.getDefaultBowtieData();
            let isHalfBowtie: boolean;
            let isFullBowtie: boolean;
            if (!this.dataViewContainsCategory(dataView) || dataView.categorical.categories.length < 1) {
                return asterDataResult;
            } else if (dataView.categorical.categories.length === 1) {
                isHalfBowtie = true;
            } else if (dataView.categorical.categories.length === 2) {
                isFullBowtie = true;
            }
            let k: number;
            k = 0;
            let cat: PrimitiveValue;
            let catDv: DataViewCategorical;
            catDv = dataView && dataView.categorical;
            let catDestination: DataViewCategoryColumn;
            catDestination = catDv && catDv.categories && catDv.categories[0];
            let catSource: DataViewCategoryColumn;
            if (isFullBowtie) {
                catSource = catDv && catDv.categories && catDv.categories[1];
            }

            let catDestValues: PrimitiveValue[];
            catDestValues = catDestination && catDestination.values;
            let catSourceValues: PrimitiveValue[];
            catSourceValues = catSource ? catSource.values : null;
            let values: DataViewValueColumns;
            values = catDv && catDv.values;

            if (values) {
                this.formatString = values[0].source.format;
            }

            this.metricName = values && values[0] && values[0].source.displayName;
            this.destinationName = catDestination && catDestination.source && catDestination.source.displayName;
            this.sourceName = catSource ? catSource.source.displayName : '';

            let aggregatedSum: number = 0;
            let aggregatedSum1: number = 0;
            if (values && values[0]) {
                aggregatedSum1 = d3.sum(values[0].values, function (d: number): number {
                    if (d && d > 0) {
                        return d;
                    } else {
                        return 0;
                    }
                });
            }

            aggregatedSum = sumvalue;
            asterDataResult.labelSettings.precision = 0;
            asterDataResult.labelSettings = this.getLabelSettings(dataView, asterDataResult.labelSettings);
            asterDataResult.AggregatelabelSettings = this.getAggregateLabelSettings(dataView);
            asterDataResult.chartType = isFullBowtie ? 'FullBowtie' : isHalfBowtie ? 'HalfBowtie' : null;
            asterDataResult.aggregatedSum = aggregatedSum;

            if (!catDestValues || catDestValues.length < 1 || !values || values.length < 1 || !asterDataResult.chartType) {
                this.isNegative = false;

                return asterDataResult;
            }

            let formatter: IValueFormatter;
            formatter = ValueFormatter.create({ format: 'dddd\, MMMM %d\, yyyy' });
            // Populating source and destination values and their aggregations
            // Destination
            let arrDestination: PrimitiveValue[];
            arrDestination = [];
            let i: number;
            let length: number;
            let category: PrimitiveValue;
            for (i = 0, length = catDestValues.length; i < length; i++) {
                if (values[0] && values[0].values && values[0].values.length > 0) {
                    category = catDestValues[i];
                    category = category ? category : '(Blank)';
                    let sCategory: string;
                    sCategory = '';
                    let destArcWidth: number = 0;
                    let destCatSum: number;
                    destCatSum = 0;
                    let destCatSum1: number;
                    destCatSum1 = 0;
                    for (let j: number = 0; j < length; j++) {
                        // tslint:disable-next-line:no-any
                        let value: any;
                        value = values[0].values[j];
                        if (value < 0) {
                            this.isNegative = true;

                            return;
                        }
                        let innerCat: PrimitiveValue = catDestValues[j];
                        innerCat = (innerCat ? catDestValues[j] : '(Blank)');
                        if (type === 'source') {
                            if (catSourceValues[j] === null) {
                                catSourceValues[j] = '';
                            }
                            if (innerCat === category && String(catSourceValues[j]) === label) {
                                destCatSum += value;
                            }
                            if (innerCat === category) {
                                destCatSum1 += value;
                            }
                        }
                        if (type === 'destination') {
                            if (catDestValues[j] === null) {
                                catDestValues[j] = ' ';
                            }
                            if (innerCat === category && String(catDestValues[j]) === label) {
                                destCatSum += value;
                            }
                            if (innerCat === category) {
                                destCatSum1 += value;
                            }

                        }
                    }
                    if (aggregatedSum1 > 0) {
                        destArcWidth = destCatSum1 / aggregatedSum1;
                    }

                    if (type === 'destination') {
                        if (arrDestination.indexOf(category) === -1 && destCatSum1 !== 0) {
                            if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                                asterDataResult.dataPoints.push({
                                    DestCategoryLabel: formatter.format(category),
                                    SourceCategoryLabel: null,
                                    DestCatArcWidth: destArcWidth,
                                    SourceArcWidth: null,
                                    color: '',
                                    selector: host.createSelectionIdBuilder().withCategory(catDestination, i).createSelectionId(),
                                    value: destCatSum1,
                                    srcValue: 0,
                                    selectionId: []
                                });
                            } else {
                                asterDataResult.dataPoints.push({
                                    DestCategoryLabel: category.toString(),
                                    SourceCategoryLabel: null,
                                    DestCatArcWidth: destArcWidth,
                                    SourceArcWidth: null,
                                    color: '',
                                    selector: host.createSelectionIdBuilder().withCategory(catDestination, i).createSelectionId(),
                                    value: destCatSum1,
                                    srcValue: 0,
                                    selectionId: []
                                });
                            }
                            asterDataResult.dataPoints[k].selectionId.push(asterDataResult.dataPoints[k].selector);
                            arrDestination.push(category);
                            k++;
                        } else if (arrDestination.indexOf(category) !== -1) {
                            if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                                cat = formatter.format(category);
                            } else {
                                cat = category.toString();
                            }
                            asterDataResult.dataPoints.forEach(function (d: IBowtieDataPoint): void {
                                if (d.DestCategoryLabel === cat) {
                                    d.selectionId.push(host.createSelectionIdBuilder().withCategory(catDestination, i).createSelectionId());
                                }
                            });
                        }

                    } else {
                        if (arrDestination.indexOf(category) === -1 && destCatSum !== 0) {
                            if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                                asterDataResult.dataPoints.push({
                                    DestCategoryLabel: formatter.format(category),
                                    SourceCategoryLabel: null,
                                    DestCatArcWidth: destArcWidth,
                                    SourceArcWidth: null,
                                    color: '',
                                    selector: host.createSelectionIdBuilder().withCategory(catDestination, i).createSelectionId(),
                                    value: destCatSum,
                                    srcValue: 0,
                                    selectionId: []
                                });
                            } else {
                                asterDataResult.dataPoints.push({
                                    DestCategoryLabel: category.toString(),
                                    SourceCategoryLabel: null,
                                    DestCatArcWidth: destArcWidth,
                                    SourceArcWidth: null,
                                    color: '',
                                    selector: host.createSelectionIdBuilder().withCategory(catDestination, i).createSelectionId(),
                                    value: destCatSum,
                                    srcValue: 0,
                                    selectionId: []
                                });
                            }
                            asterDataResult.dataPoints[k].selectionId.push(asterDataResult.dataPoints[k].selector);
                            arrDestination.push(category);
                            k++;
                        } else if (arrDestination.indexOf(category) !== -1) {
                            if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                                cat = formatter.format(category);
                            } else {
                                cat = category.toString();
                            }
                            asterDataResult.dataPoints.forEach(function (d: IBowtieDataPoint): void {
                                if (d.DestCategoryLabel === cat) {
                                    d.selectionId.push(host.createSelectionIdBuilder().withCategory(catDestination, i).createSelectionId());
                                }
                            });
                        }

                    }

                }
            }

            if (asterDataResult.chartType === 'FullBowtie') {
                let arrSource: PrimitiveValue[];
                arrSource = [];
                let srcLength: number;

                for (i = 0, srcLength = catSourceValues && catSourceValues.length; i < length; i++) {
                    let currentValue: PrimitiveValue;
                    currentValue = values[0].values[i];
                    category = catSourceValues[i];
                    let destArcWidth: number = 0;
                    let destCatSum: number;
                    let destCatSum2: number;
                    destCatSum = 0;
                    destCatSum2 = 0;
                    category = category ? category : '(Blank)';
                    for (let j: number = 0; j < srcLength; j++) {
                        // tslint:disable-next-line:no-any
                        let value: any;
                        value = values[0].values[j];
                        if (value < 0) {
                            this.isNegative = true;

                            return;
                        }
                        let innerCat: string | number | boolean | Date = catSourceValues[j];
                        innerCat = (innerCat ? catSourceValues[j] : '(Blank)');
                        if (type === 'source') {

                            if (innerCat === category) {
                                destCatSum += value;
                            }
                            if (innerCat === category) {
                                destCatSum2 += value;
                            }
                        }
                        if (type === 'destination') {

                            if (catDestValues[j] === null) {
                                catDestValues[j] = ' ';
                            }
                            if (innerCat === category && catDestValues[j].toString() === label) {
                                destCatSum += value;
                            }
                            if (innerCat === category) {
                                destCatSum2 += value;
                            }

                        }

                    }
                    aggregatedSum = sumvalue;

                    if (aggregatedSum1 > 0) {
                        destArcWidth = destCatSum2 / aggregatedSum1;
                    }
                    if (type === 'source') {
                        if (arrSource.indexOf(category) === -1 && destCatSum2 !== 0) {
                            if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                                asterDataResult.dataPoints.push({
                                    DestCategoryLabel: null,
                                    SourceCategoryLabel: formatter.format(category),
                                    DestCatArcWidth: null,
                                    SourceArcWidth: destArcWidth,
                                    color: '',
                                    selector: host.createSelectionIdBuilder().withCategory(catSource, i).createSelectionId(),
                                    value: 0,
                                    srcValue: destCatSum,
                                    selectionId: []
                                });
                            } else {
                                asterDataResult.dataPoints.push({
                                    DestCategoryLabel: null,
                                    SourceCategoryLabel: category.toString(),
                                    DestCatArcWidth: null,
                                    SourceArcWidth: destArcWidth,
                                    color: '',
                                    selector: host.createSelectionIdBuilder().withCategory(catSource, i).createSelectionId(),
                                    value: 0,
                                    srcValue: destCatSum,
                                    selectionId: []
                                });
                            }
                            asterDataResult.dataPoints[k].selectionId.push(asterDataResult.dataPoints[k].selector);
                            arrSource.push(category);
                            k++;
                        } else if (arrSource.indexOf(category) !== -1) {
                            if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                                cat = formatter.format(category);
                            } else {
                                cat = category.toString();
                            }
                            asterDataResult.dataPoints.forEach(function (d: IBowtieDataPoint): void {
                                if (d.SourceCategoryLabel === cat) {
                                    d.selectionId.push(host.createSelectionIdBuilder().withCategory(catSource, i).createSelectionId());
                                }
                            });
                        }

                    } else {
                        if (arrSource.indexOf(category) === -1 && destCatSum !== 0) {
                            if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                                asterDataResult.dataPoints.push({
                                    DestCategoryLabel: null,
                                    SourceCategoryLabel: formatter.format(category),
                                    DestCatArcWidth: null,
                                    SourceArcWidth: destArcWidth,
                                    color: '',
                                    selector: host.createSelectionIdBuilder().withCategory(catSource, i).createSelectionId(),
                                    value: 0,
                                    srcValue: destCatSum,
                                    selectionId: []
                                });
                            } else {
                                asterDataResult.dataPoints.push({
                                    DestCategoryLabel: null,
                                    SourceCategoryLabel: category.toString(),
                                    DestCatArcWidth: null,
                                    SourceArcWidth: destArcWidth,
                                    color: '',
                                    selector: host.createSelectionIdBuilder().withCategory(catSource, i).createSelectionId(),
                                    value: 0,
                                    srcValue: destCatSum,
                                    selectionId: []
                                });
                            }
                            asterDataResult.dataPoints[k].selectionId.push(asterDataResult.dataPoints[k].selector);
                            arrSource.push(category);
                            k++;
                        } else if (arrSource.indexOf(category) !== -1) {
                            if (Date.parse(category.toString()) && (formatter.format(category) !== 'dddd MMMM %d yyyy')) {
                                cat = formatter.format(category);
                            } else {
                                cat = category.toString();
                            }
                            asterDataResult.dataPoints.forEach(function (d: IBowtieDataPoint): void {
                                if (d.SourceCategoryLabel === cat) {
                                    d.selectionId.push(host.createSelectionIdBuilder().withCategory(catSource, i).createSelectionId());
                                }
                            });
                        }

                    }

                }
            }
            this.thisObj.flag = false;

            return asterDataResult;
        }

        private clearData(isLargeDataSet: boolean): void {
            // Headings
            this.bowtieChartHeadings.selectAll('div').remove();

            // Aggregated Sum settings
            this.bowtieChartAggregated.select('div').remove();
            this.bowtieChartSVGDestination.selectAll('svg').remove();
            this.bowtieChartSVGSource.selectAll('svg').remove();

            // Destination Settings
            this.bowtieChartDestination.selectAll('div').remove();

            // Source Settings
            this.bowtieChartSource.selectAll('div').remove();

            // Show Error Message
            this.bowtieChartError.selectAll('span').remove();
            this.bowtieMainContainer.style('width', PixelConverter.toString(this.currentViewport.width));
            this.bowtieMainContainer.style('height', PixelConverter.toString(this.currentViewport.height));

            let errorMessage: string;
            errorMessage = '';
            let errorMessageWidth: number;
            errorMessageWidth = 0;
            if (!this.isNegative) {
                errorMessage = 'Please select non-empty \'Value\', \'Source\', and/or \'Destination\'.';
                errorMessageWidth = 335;
            } else {
                errorMessage = 'Negative values are not supported.';
                errorMessageWidth = 195;
            }

            if (isLargeDataSet) {
                errorMessage = 'Too many values. Try selecting more filters and/or increasing size of the visual.';
                errorMessageWidth = 565;
            }

            this.bowtieChartError.append('span')
                .text(errorMessage)
                .style('font-size', '12px')
                .style({ display: 'block' })
                .style('height', this.currentViewport.height - 20)
                .style('line-height', PixelConverter.toString(this.currentViewport.height - 20))
                .style('margin', '0 auto')
                .style('width', PixelConverter.toString(errorMessageWidth));
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            let percentageLiteral: string;
            let numberOfValues: number;
            let numberOfValuesHeight: number;
            let divisionHeight: number;
            let aggregatedValue: d3.Selection<SVGElement>;
            let fBranchHeight: number;
            let fBranchHeight1: number;
            let fStartY: number;
            let fEndX: number;
            let fEndY: number;
            let fCurveFactor: number;
            let svg: d3.Selection<SVGElement>;
            let textPropertiesForLabel: TextProperties;
            let category: string;
            let maxValue: number;
            let dataLength: number;
            let displayUnit: number;
            let aggregatedUnit: number;
            let sum: number;
            sum = 0;
            this.flagliteral = 0;
            this.categoryLabel = '';
            let selectionManager: ISelectionManager;
            selectionManager = this.selectionManager;
            percentageLiteral = '%';
            this.updateCount++;
            if (!options.dataViews || !options.dataViews[0]) {
                return;
            }

            this.currentViewport = {
                height: Math.max(0, options.viewport.height),
                width: Math.max(0, options.viewport.width)
            };

            let dataView1: DataView;
            this.thisObj = this;
            dataView1 = this.dataView = options.dataViews[0];
            this.dataViews = options.dataViews;
            // tslint:disable-next-line:prefer-const
            let label: string;
            // tslint:disable-next-line:prefer-const
            let sumvalue: number;
            updateInternal(dataView1, this.colors, this.host, this.data, this, label, sumvalue, '');

            // tslint:disable-next-line:no-any      // tslint:disable-next-line:typedef
            function updateInternal(dataView: any, colorsUpdate: any, hostUpdate: any, dataUpdate: any,
                // tslint:disable-next-line:no-any
                                    thisObjNew: any, labelNew: any, sumValue: any, type: any): any {

                let convertedData: IBowtieData;
                if (thisObjNew.flagliteral === 0) {
                    convertedData = dataUpdate = thisObjNew.converter(dataView, colorsUpdate, hostUpdate);

                } else {
                    // tslint:disable-next-line:max-line-length
                    convertedData = dataUpdate = thisObjNew.newConverter(dataView, colorsUpdate, hostUpdate, labelNew, sumValue, type);
                }

                let destinationData: IBowtieData;
                destinationData = thisObjNew.getDefaultBowtieData();
                let sourceData: IBowtieData;
                sourceData = thisObjNew.getDefaultBowtieData();
                if (!convertedData || !convertedData.dataPoints || convertedData.dataPoints.length === 0) {
                    thisObjNew.clearData(false);

                    return;
                } else {
                    thisObjNew.bowtieChartError.selectAll('span').style('display', 'none');
                }

                // Custom Tooltip Code
                let viewport: IViewport;
                viewport = options.viewport;
                thisObjNew.root.select('.errorMessage').style({ display: 'none' });
                thisObjNew.root.select('.donutChartGMO').style({ display: '' });
                let gmoDonutTitleOnOffStatus: boolean;
                gmoDonutTitleOnOffStatus = false;
                let titleText: string; titleText = '';
                let tooltiptext: string;
                tooltiptext = '';
                // tslint:disable-next-line:no-any
                let titlefontsize: any;
                let titleHeight: number;
                let titlecolor: string;
                let titlebgcolor: string;

                if (thisObjNew.getShowTitle(dataView)) {
                    gmoDonutTitleOnOffStatus = true;
                }
                if (thisObjNew.getTitleText(dataView)) {
                    titleText = String(thisObjNew.getTitleText(dataView));
                }
                if (thisObjNew.getTooltipText(dataView)) {
                    tooltiptext = String(thisObjNew.getTooltipText(dataView));
                }
                titlefontsize = thisObjNew.getTitleSize(dataView);
                if (!titlefontsize) {
                    titlefontsize = 12;
                }
                thisObjNew.titleSize = titlefontsize;
                if (gmoDonutTitleOnOffStatus && (titleText || tooltiptext)) {
                    titleHeight = titlefontsize;
                } else { titleHeight = 0; }

                if (thisObjNew.getTitleFill(dataView)) {
                    titlecolor = thisObjNew.getTitleFill(dataView).solid.color;
                }
                if (thisObjNew.getTitleBgcolor(dataView)) {
                    titlebgcolor = thisObjNew.getTitleBgcolor(thisObjNew.dataView).solid.color;
                    if ('none' === titlebgcolor) {
                        titlebgcolor = '#ffffff';
                    }
                }
                if (!gmoDonutTitleOnOffStatus) {
                    thisObjNew.root.select('.Title_Div_Text').style({ display: 'none' });
                } else {
                    thisObjNew.root.select('.Title_Div_Text')
                        .style({
                            display: 'inline-block',
                            'background-color': titlebgcolor,
                            'font-size': PixelConverter.toString(PixelConverter.fromPointToPixel(titlefontsize)),
                            color: titlecolor
                        });
                }

                thisObjNew.root.select('.GMODonutTitleDiv')
                    .text(titleText);

                thisObjNew.root.select('.GMODonutTitleIcon').style({ display: 'none' });

                if ('' !== tooltiptext && (1 !== thisObjNew.updateCount || '' !== titleText)) {
                    thisObjNew.root.select('.GMODonutTitleIcon')
                        .style({ display: 'inline-block' })
                        .attr('title', tooltiptext);
                }
                maxValue = <number>dataView.categorical.values[0].maxLocal;
                dataLength = String(d3.round(maxValue, 0)).length;
                if (dataLength > 12) {
                    displayUnit = 1e12;
                } else if (dataLength > 9 && dataLength <= 12) {
                    displayUnit = 1e9;
                } else if (dataLength <= 9 && dataLength > 6) {
                    displayUnit = 1e6;
                } else if (dataLength <= 6 && dataLength >= 4) {
                    displayUnit = 1e3;
                } else {
                    displayUnit = 10;
                }
                let formatter: IValueFormatter;
                formatter = valueFormatter.create({
                    format: thisObjNew.formatString,
                    value: convertedData.labelSettings.displayUnits === 0 ? displayUnit :
                        convertedData.labelSettings.displayUnits, precision: convertedData.labelSettings.precision
                });
                for (let i: number = 0; i < dataView.categorical.values.length; i++) {
                    sum = sum + <number>dataView.categorical.values[0].values[i];
                }

                dataLength = String(d3.round(sum, 0)).length;
                if (dataLength > 12) {
                    aggregatedUnit = 1e12;
                } else if (dataLength > 9 && dataLength <= 12) {
                    aggregatedUnit = 1e9;
                } else if (dataLength <= 9 && dataLength > 6) {
                    aggregatedUnit = 1e6;
                } else if (dataLength <= 6 && dataLength >= 4) {
                    aggregatedUnit = 1e3;
                } else {
                    aggregatedUnit = 10;
                }
                let aggregateFormatter: IValueFormatter;
                aggregateFormatter = valueFormatter.create({
                    format: thisObjNew.formatString,
                    value: convertedData.AggregatelabelSettings.displayUnits === 0 ? aggregatedUnit :
                        convertedData.AggregatelabelSettings.displayUnits, precision: convertedData.AggregatelabelSettings.textPrecision
                });

                dataUpdate.ArcFillColor = DataViewObjects.getFillColor(
                    thisObjNew.dataView.metadata.objects,
                    bowtieProps.general.ArcFillColor, dataUpdate.ArcFillColor);

                let heightOfTitle: number = 0;
                if (thisObjNew.root.select('.GMODonutTitleDiv')) {
                    heightOfTitle = isNaN(parseFloat(
                        thisObjNew.root.select('.GMODonutTitleDiv').style('height'))) ? 0 :
                        parseFloat(thisObjNew.root.select('.GMODonutTitleDiv').style('height'));
                }
                let bowtieChartAggregatedWidthPercentage: number = 12;
                let bowtieChartSVGDestinationWidthPercentage: number = 60;
                let bowtieChartDestinationWidthPercentage: number = 26;
                let fontSize: string;
                fontSize = PixelConverter.toString(PixelConverter.fromPointToPixel(convertedData.labelSettings.fontSize));
                let aggregateFontSize: string;
                aggregateFontSize = PixelConverter.toString(PixelConverter.fromPointToPixel(convertedData.AggregatelabelSettings.fontSize));
                let showHeading: boolean = true;
                let fStartX: number;
                fStartX = 0;

                if (convertedData.chartType === 'HalfBowtie') {

                    thisObjNew.bowtieChartSource.style('display', 'none');
                    thisObjNew.bowtieChartSVGSource.style('display', 'none');
                    thisObjNew.bowtieMainContainer.style('width', PixelConverter.toString(thisObjNew.currentViewport.width));
                    thisObjNew.bowtieMainContainer.style('height', PixelConverter.toString(thisObjNew.currentViewport.height));
                    thisObjNew.bowtieChartAggregated.style('width', bowtieChartAggregatedWidthPercentage + percentageLiteral);
                    thisObjNew.bowtieChartAggregated.style('margin-right', '1%');
                    thisObjNew.bowtieChartSVGDestination.style('width', bowtieChartSVGDestinationWidthPercentage + percentageLiteral);
                    thisObjNew.bowtieChartSVGDestination.style('margin-right', '1%');
                    thisObjNew.bowtieChartDestination.style('width', bowtieChartDestinationWidthPercentage + percentageLiteral);

                    // Chart Headings
                    let textPropertiesDestSourceName: TextProperties;
                    textPropertiesDestSourceName = {
                        text: thisObjNew.destinationName,
                        fontFamily: 'Segoe UI',
                        fontSize: fontSize
                    };

                    let textPropertiesDestSourceValue: TextProperties;
                    textPropertiesDestSourceValue = {
                        text: thisObjNew.metricName,
                        fontFamily: 'Segoe UI',
                        fontSize: fontSize
                    };

                    thisObjNew.bowtieChartHeadings.selectAll('div').remove();

                    thisObjNew.bowtieChartHeadings.append('div')
                        .style('width', (bowtieChartDestinationWidthPercentage / 2 - 1) + percentageLiteral)
                        .style('margin-right', '1%')
                        .style('float', 'left')
                        .style('font-size', fontSize)
                        .attr('id', 'HalfBowtieDestSourceName')
                        .style(
                            'margin-left',
                            (bowtieChartSVGDestinationWidthPercentage + bowtieChartAggregatedWidthPercentage + 2) + percentageLiteral)
                        .append('span')
                        .attr('title', thisObjNew.destinationName)
                        .text(TextMeasurementService.getTailoredTextOrDefault(
                            textPropertiesDestSourceName,
                            (thisObjNew.currentViewport.width * (bowtieChartDestinationWidthPercentage / 2 - 1)) / 100));

                    thisObjNew.bowtieChartHeadings.append('div')
                        .style('width', (bowtieChartDestinationWidthPercentage / 2) + percentageLiteral)
                        .style('float', 'left')
                        .style('font-size', fontSize)
                        .attr('id', 'HalfBowtieDestSourceVal')
                        .append('span')
                        .attr('title', thisObjNew.metricName)
                        .text(TextMeasurementService.getTailoredTextOrDefault(
                            textPropertiesDestSourceValue,
                            (thisObjNew.currentViewport.width * (bowtieChartDestinationWidthPercentage / 2)) / 100));

                    //updated
                    let heightOfHeadings: number;
                    heightOfHeadings = 0;
                    if (thisObjNew.root.select('.BowtieChartHeadings')) {
                        heightOfHeadings = parseFloat(thisObjNew.root.select('.BowtieChartHeadings').style('height'));
                    }

                    numberOfValues = convertedData.dataPoints.length;
                    let avaialableHeight: number;
                    avaialableHeight = thisObjNew.currentViewport.height - heightOfHeadings - heightOfTitle - 15;
                    category = convertedData.dataPoints[0].DestCategoryLabel;

                    textPropertiesForLabel = {
                        text: category,
                        fontFamily: 'Segoe UI',
                        fontSize: fontSize
                    };

                    numberOfValuesHeight = TextMeasurementService.measureSvgTextHeight(textPropertiesForLabel) * numberOfValues;
                    if (numberOfValuesHeight > avaialableHeight) {
                        avaialableHeight = numberOfValuesHeight;
                        thisObjNew.root.select('.BowtieMainContainer').style('overflow-y', 'auto');
                    } else {
                        thisObjNew.root.select('.BowtieMainContainer').style('overflow-y', 'hidden');
                    }
                    thisObjNew.root.select('.BowtieMainContainer').style('overflow-x', 'hidden');
                    //updated

                    divisionHeight = avaialableHeight / numberOfValues;

                    thisObjNew.bowtieChartAggregated.style('height', PixelConverter.toString(avaialableHeight));
                    thisObjNew.bowtieChartSVGDestination.style('height', PixelConverter.toString(avaialableHeight));
                    thisObjNew.bowtieChartDestination.style('height', PixelConverter.toString(avaialableHeight));

                    // Aggregated Sum settings
                    thisObjNew.bowtieChartAggregated.select('div').remove();
                    thisObjNew.bowtieChartSVGDestination.selectAll('svg').remove();
                    thisObjNew.bowtieChartSVGSource.selectAll('svg').remove();

                    let textPropertiesAggregateValue: TextProperties;
                    textPropertiesAggregateValue = {
                        text: aggregateFormatter.format(convertedData.aggregatedSum),
                        fontFamily: 'Segoe UI',
                        fontSize: aggregateFontSize
                    };

                    let textPropertiesMetricName: TextProperties;
                    textPropertiesMetricName = {
                        text: thisObjNew.metricName,
                        fontFamily: 'Segoe UI',
                        fontSize: aggregateFontSize
                    };

                    let aggregatedSum: d3.Selection<SVGElement>;

                    aggregatedSum =
                        thisObjNew.bowtieChartAggregated.append('div')
                            .attr('id', 'divAggregatedSum')
                            .style('float', 'right')
                            .style('text-align', 'right');

                    aggregatedSum.append('div').append('span')
                        .attr('title', thisObjNew.metricName)
                        .text(TextMeasurementService.getTailoredTextOrDefault(
                            textPropertiesMetricName, (thisObjNew.currentViewport.width * bowtieChartAggregatedWidthPercentage) / 100));

                    aggregatedValue = aggregatedSum.append('div');
                    aggregatedValue.append('span')
                        .attr('title', aggregateFormatter.format(convertedData.aggregatedSum))
                        .text(TextMeasurementService.getTailoredTextOrDefault(
                            textPropertiesAggregateValue,
                            ((thisObjNew.currentViewport.width * bowtieChartAggregatedWidthPercentage) / 100) -
                            PixelConverter.fromPointToPixel(convertedData.AggregatelabelSettings.fontSize) - 2));
                    aggregatedSum
                        .style('font-size', aggregateFontSize)
                        .style('color', convertedData.AggregatelabelSettings.color);

                    // Indicator logic
                    let color: string;
                    color = 'green';
                    if (thisObjNew.prevIndicator === false && convertedData.AggregatelabelSettings.Indicator) {
                        convertedData.AggregatelabelSettings.signIndicator = true;
                    } else if (convertedData.AggregatelabelSettings.Indicator === false) {
                        convertedData.AggregatelabelSettings.signIndicator = false;
                    }

                    if (convertedData.AggregatelabelSettings.signIndicator) {
                        convertedData.AggregatelabelSettings.Threshold = 0;
                    }

                    if (convertedData.AggregatelabelSettings.Indicator) {
                        if (convertedData.AggregatelabelSettings.signIndicator) {
                            color = convertedData.aggregatedSum > 0 ? 'green' : 'red';
                        } else {
                            color = convertedData.aggregatedSum >= convertedData.AggregatelabelSettings.Threshold ? 'green' : 'red';
                        }
                        aggregatedValue.append('span')
                            .style('color', color)
                            .style('font-size', aggregateFontSize)
                            .style('margin-left', '2px')
                            .style('margin-bottom', '-1px')
                            .attr('id', 'indicator')
                            .text('▲');
                    } else {
                        aggregatedValue.select('span#indicator').remove();
                    }
                    thisObjNew.prevIndicator = convertedData.AggregatelabelSettings.Indicator;

                    let divHeight: number;
                    divHeight = 0;
                    if (thisObjNew.root.select('#divAggregatedSum')) {
                        divHeight = parseFloat(thisObjNew.root.select('#divAggregatedSum').style('height'));
                    }
                    aggregatedSum.style('margin-top', PixelConverter.toString(avaialableHeight / 2 - divHeight / 2));

                    // Destination Settings
                    thisObjNew.bowtieChartDestination.selectAll('div').remove();
                    numberOfValues = convertedData.dataPoints.length;
                    divisionHeight = avaialableHeight / numberOfValues;
                    fBranchHeight = avaialableHeight / 12;
                    fBranchHeight1 = avaialableHeight / 12;

                    // checking for large datasets
                    for (let iDiv: number = 0; iDiv < numberOfValues; iDiv++) {
                        if ((convertedData.dataPoints[iDiv].DestCatArcWidth * fBranchHeight) < 1) {
                            fBranchHeight1 = fBranchHeight1 + 0.25;
                        }
                    }

                    if (fBranchHeight1 > avaialableHeight) {
                        thisObjNew.clearData(true);

                        return;
                    }

                    fStartX = 0;
                    fStartY = avaialableHeight / 2 - fBranchHeight1 / 2;
                    fEndX = (thisObjNew.currentViewport.width * bowtieChartSVGDestinationWidthPercentage) / 100;
                    fEndY = 0;
                    fCurveFactor = 0.65;
                    svg = thisObjNew.bowtieChartSVGDestination
                        .append('svg')
                        .style('height', PixelConverter.toString(avaialableHeight));

                    for (let iDiv: number = 0; iDiv < numberOfValues; iDiv++) {
                        category = convertedData.dataPoints[iDiv].DestCategoryLabel;
                        let value: string;
                        value = formatter.format(convertedData.dataPoints[iDiv].value);

                        let oDiv: d3.Selection<SVGElement>;
                        let spanDiv: d3.Selection<SVGElement>;
                        oDiv = thisObjNew.bowtieChartDestination
                            .append('div')
                            .classed('alignment', true)
                            .style('line-height', PixelConverter.toString(divisionHeight))
                            .style('margin-right', '1%')
                            .style('width', '49%');
                        let oDiv1: d3.Selection<SVGElement>;
                        let spanDiv1: d3.Selection<SVGElement>;
                        oDiv1 = thisObjNew.bowtieChartDestination
                            .append('div')
                            .classed('alignment', true)
                            .style('line-height', PixelConverter.toString(divisionHeight))
                            .style('width', '50%');

                        textPropertiesForLabel = {
                            text: category,
                            fontFamily: 'Segoe UI',
                            fontSize: fontSize
                        };

                        let textPropertiesForValue: TextProperties;
                        textPropertiesForValue = {
                            text: value,
                            fontFamily: 'Segoe UI',
                            fontSize: fontSize
                        };
                        showHeading = true;
                        thisObjNew.bowtieChartDestination.style('display', 'block');

                        spanDiv = oDiv.append('span')
                            .classed(`index${iDiv}`, true)
                            .attr('title', convertedData.dataPoints[iDiv].DestCategoryLabel)
                            .style('float', 'left')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor);

                        spanDiv.append('text')
                            .classed(`span1`, true)
                            .text(TextMeasurementService.getTailoredTextOrDefault(
                                textPropertiesForLabel, (thisObjNew.currentViewport.width *
                                    (bowtieChartDestinationWidthPercentage / 2 - 1)) / 100))
                            .style('cursor', 'pointer');

                        spanDiv1 = oDiv1.append('span')
                            .classed(`index${iDiv}`, true)
                            .attr('title', formatter.format(convertedData.dataPoints[iDiv].value))
                            .style('float', 'left')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor);

                        spanDiv1.append('text')
                            .classed('span2', true)
                            .text(TextMeasurementService.getTailoredTextOrDefault(
                                textPropertiesForValue, (thisObjNew.currentViewport.width *
                                     (bowtieChartDestinationWidthPercentage / 2)) / 100))
                            .style('cursor', 'pointer');
                        let percentage: number;
                        percentage = convertedData.dataPoints[iDiv].value / convertedData.aggregatedSum;
                        fEndY = iDiv * (avaialableHeight / numberOfValues) + divisionHeight / 2;
                        let fPipeArea: number;
                        fPipeArea = Math.abs(fEndX - fStartX);
                        let height: number;
                        height = convertedData.dataPoints[iDiv].DestCatArcWidth * fBranchHeight;
                        height = height < 1 ? 1 : height;
                        fStartY += (height / 2);
                        if (iDiv > 0) {
                            if ((convertedData.dataPoints[iDiv - 1].DestCatArcWidth * fBranchHeight) > 1) {
                                fStartY += ((convertedData.dataPoints[iDiv - 1].DestCatArcWidth * fBranchHeight) / 2);
                            } else {
                                fStartY += 0.5;
                            }
                        }

                        let d: string = '';
                        d = 'M ';
                        d += fStartX;
                        d += ' ';
                        d += fStartY;
                        d += ' C ';
                        d += (fStartX + (fPipeArea * fCurveFactor));
                        d += ' ';
                        d += fStartY;
                        d += ' ';
                        d += (fEndX - fPipeArea * fCurveFactor);
                        d += ' ';
                        d += fEndY;
                        d += ' ';
                        d += fEndX;
                        d += ' ';
                        d += fEndY;

                        let path: d3.Selection<SVGElement>;

                        path = svg
                            .append('path')
                            .classed(`index${iDiv}`, true)
                            .attr('d', d)
                            .attr('stroke', dataUpdate.ArcFillColor)
                            .attr('fill', 'none')
                            .attr('stroke-width', height)
                            .style('cursor', 'pointer');

                        let toolTipInfo: ITooltipDataItem[];
                        toolTipInfo = [];
                        toolTipInfo.push({
                            displayName: category,
                            value: value
                        });

                        path[0][0]['cust-tooltip'] = toolTipInfo;
                    }
                    d3.selectAll('path').data(convertedData.dataPoints)
                        .on('click', function (d: IBowtieDataPoint, i: number): void {
                            selectionManager.select(d.selector).then((ids: ISelectionId[]) => {
                                d3.selectAll('path').style('opacity', ids.length > 0 ? 0.5 : 1);
                                d3.selectAll('span').style('opacity', ids.length > 0 ? 0.5 : 1);
                                d3.selectAll(`.index${i}`).style('opacity', 1);
                            });
                            (<Event>d3.event).stopPropagation();
                        });
                    d3.selectAll('.span1').data(convertedData.dataPoints)
                        .on('click', function (d: IBowtieDataPoint, i: number): void {
                            selectionManager.select(d.selector).then((ids: ISelectionId[]) => {
                                d3.selectAll('path').style('opacity', ids.length > 0 ? 0.5 : 1);
                                d3.selectAll('span').style('opacity', ids.length > 0 ? 0.5 : 1);
                                d3.selectAll(`.index${i}`).style('opacity', 1);
                            });
                            (<Event>d3.event).stopPropagation();
                        });
                    d3.selectAll('.span2').data(convertedData.dataPoints)
                        .on('click', function (d: IBowtieDataPoint, i: number): void {
                            selectionManager.select(d.selector).then((ids: ISelectionId[]) => {
                                d3.selectAll('path').style('opacity', ids.length > 0 ? 0.5 : 1);
                                d3.selectAll('span').style('opacity', ids.length > 0 ? 0.5 : 1);
                                d3.selectAll(`.index${i}`).style('opacity', 1);
                            });
                            (<Event>d3.event).stopPropagation();
                        });
                    d3.select('html').on('click', function (): void {
                        if (selectionManager[`selectedIds`].length) {
                            thisObjNew.flagliteral = 0;
                            updateInternal(dataView, thisObjNew.colors, thisObjNew.host, dataUpdate, thisObjNew, '',
                                           '', '');
                            selectionManager.clear();
                            d3.selectAll('path').style('opacity', 1);
                            d3.selectAll('span').style('opacity', 1);
                            d3.selectAll('#SpanText1').style('opacity', 1);
                            d3.selectAll('#SpanText').style('opacity', 1);
                            selectionManager.clear();
                        }
                    });
                    if (!showHeading) {
                        thisObjNew.bowtieChartHeadings.selectAll('div').remove();
                    }
                } else {
                    bowtieChartAggregatedWidthPercentage = 9;
                    bowtieChartSVGDestinationWidthPercentage = 25;
                    bowtieChartDestinationWidthPercentage = 19;
                    thisObjNew.bowtieChartSource.style('display', 'block');
                    thisObjNew.bowtieChartSVGSource.style('display', 'block');
                    thisObjNew.bowtieMainContainer.style('width', PixelConverter.toString(thisObjNew.currentViewport.width));
                    thisObjNew.bowtieMainContainer.style('height', PixelConverter.toString(thisObjNew.currentViewport.height));
                    thisObjNew.bowtieMainContainer.style('float', 'left');
                    thisObjNew.bowtieChartAggregated.style('width', bowtieChartAggregatedWidthPercentage + percentageLiteral);
                    thisObjNew.bowtieChartAggregated.style('margin-right', '0%');
                    thisObjNew.bowtieChartSVGDestination.style('width', bowtieChartSVGDestinationWidthPercentage + percentageLiteral);
                    thisObjNew.bowtieChartSVGDestination.style('margin-right', '1%');
                    thisObjNew.bowtieChartDestination.style('width', bowtieChartDestinationWidthPercentage + percentageLiteral);
                    thisObjNew.bowtieChartSVGSource.style('width', bowtieChartSVGDestinationWidthPercentage + percentageLiteral);
                    thisObjNew.bowtieChartSVGSource.style('margin-left', '1%');
                    thisObjNew.bowtieChartSource.style('width', bowtieChartDestinationWidthPercentage + percentageLiteral);
                    thisObjNew.bowtieChartSource.style('margin-left', '1%');
                    // Chart Headings
                    let textPropertiesDestSourceName: TextProperties;
                    textPropertiesDestSourceName = {
                        text: thisObjNew.destinationName,
                        fontFamily: 'Segoe UI',
                        fontSize: fontSize
                    };

                    let textPropertiesDestSourceValue: TextProperties;
                    textPropertiesDestSourceValue = {
                        text: thisObjNew.metricName,
                        fontFamily: 'Segoe UI',
                        fontSize: fontSize
                    };

                    let textPropertiesSourceName: TextProperties;
                    textPropertiesSourceName = {
                        text: thisObjNew.sourceName,
                        fontFamily: 'Segoe UI',
                        fontSize: fontSize
                    };
                    thisObjNew.bowtieChartHeadings.selectAll('div').remove();
                    thisObjNew.bowtieChartHeadings.append('div')
                        .style('width', (bowtieChartDestinationWidthPercentage / 2) + percentageLiteral)
                        .style('margin-left', '1%')
                        .style('float', 'left')
                        .style('font-size', fontSize)
                        .attr('id', 'FullBowtieDestSourceName')
                        .append('span')
                        .attr('title', thisObjNew.sourceName)
                        .text(TextMeasurementService.getTailoredTextOrDefault(
                            textPropertiesSourceName,
                            (thisObjNew.currentViewport.width * (bowtieChartDestinationWidthPercentage / 2)) / 100));

                    thisObjNew.bowtieChartHeadings
                        .append('div')
                        .style('width', (bowtieChartDestinationWidthPercentage / 2 - 1) + percentageLiteral)
                        .style('float', 'left')
                        .style('text-align', 'left')
                        .style('font-size', fontSize)
                        .attr('id', 'FullBowtieDestSourceValue')
                        .append('span')
                        .attr('title', thisObjNew.metricName)
                        .text(TextMeasurementService.getTailoredTextOrDefault(
                            textPropertiesDestSourceValue,
                            (thisObjNew.currentViewport.width * (bowtieChartDestinationWidthPercentage / 2 - 1)) / 100));

                    let margin: number;
                    margin = bowtieChartSVGDestinationWidthPercentage * 2 + bowtieChartAggregatedWidthPercentage + 3;
                    thisObjNew.bowtieChartHeadings.append('div')
                        .style('width', (bowtieChartDestinationWidthPercentage / 2) + percentageLiteral)
                        .style('float', 'left')
                        .style('margin-left', margin + percentageLiteral)
                        .style('font-size', fontSize)
                        .attr('id', 'FullBowtieSourceName')
                        .attr('title', thisObjNew.destinationName)
                        .append('span').text(TextMeasurementService.getTailoredTextOrDefault(
                            textPropertiesDestSourceName, (thisObjNew.currentViewport.width *
                                (bowtieChartDestinationWidthPercentage / 2)) / 100));

                    thisObjNew.bowtieChartHeadings.append('div')
                        .style('width', (bowtieChartDestinationWidthPercentage / 2 - 1) + percentageLiteral)
                        .style('float', 'left')
                        .style('font-size', fontSize)
                        .attr('id', 'FullBowtieSourceValue')
                        .append('span')
                        .attr('title', thisObjNew.metricName)
                        .text(TextMeasurementService.getTailoredTextOrDefault(
                            textPropertiesDestSourceValue,
                            (thisObjNew.currentViewport.width * (bowtieChartDestinationWidthPercentage / 2 - 1)) / 100));

                    let heightOfHeadings: number;
                    heightOfHeadings = 0;
                    if (thisObjNew.root.select('.BowtieChartHeadings')) {
                        heightOfHeadings = parseFloat(thisObjNew.root.select('.BowtieChartHeadings').style('height'));
                    }
                    let avaialableHeight: number;
                    avaialableHeight = thisObjNew.currentViewport.height - heightOfHeadings - heightOfTitle - 10;

                    // Checking whether height is increased or not
                    numberOfValues = 0;
                    let numberOfValuesSource: number;
                    numberOfValuesSource = 0;
                    for (let k: number = 0; k < convertedData.dataPoints.length; k++) {
                        if (convertedData.dataPoints[k].DestCategoryLabel != null) {
                            destinationData.dataPoints.push(convertedData.dataPoints[k]);
                            numberOfValues++;
                        }
                        if (convertedData.dataPoints[k].SourceCategoryLabel != null) {
                            sourceData.dataPoints.push(convertedData.dataPoints[k]);
                            numberOfValuesSource++;
                        }
                    }

                    category = convertedData.dataPoints[0].DestCategoryLabel;
                    textPropertiesForLabel = {
                        text: category,
                        fontFamily: 'Segoe UI',
                        fontSize: fontSize
                    };

                    numberOfValuesHeight = TextMeasurementService.measureSvgTextHeight(
                        textPropertiesForLabel) * (numberOfValues > numberOfValuesSource ? numberOfValues : numberOfValuesSource);

                    if (numberOfValuesHeight > avaialableHeight) {
                        avaialableHeight = numberOfValuesHeight;
                        thisObjNew.root.select('.BowtieMainContainer').style('overflow-y', 'auto');
                    } else {
                        thisObjNew.root.select('.BowtieMainContainer').style('overflow-y', 'hidden');
                    }
                    thisObjNew.root.select('.BowtieMainContainer').style('overflow-x', 'hidden');

                    // Checking whether height is increased or not
                    divisionHeight = avaialableHeight / (convertedData.dataPoints.length - numberOfValues);

                    category = convertedData.dataPoints[numberOfValues].SourceCategoryLabel;
                    textPropertiesForLabel = {
                        text: category,
                        fontFamily: 'Segoe UI',
                        fontSize: fontSize
                    };

                    thisObjNew.bowtieChartAggregated.style('height', PixelConverter.toString(avaialableHeight));
                    thisObjNew.bowtieChartSVGDestination.style('height', PixelConverter.toString(avaialableHeight));
                    thisObjNew.bowtieChartDestination.style('height', PixelConverter.toString(avaialableHeight));
                    thisObjNew.bowtieChartSVGSource.style('height', PixelConverter.toString(avaialableHeight));
                    thisObjNew.bowtieChartSource.style('height', PixelConverter.toString(avaialableHeight));

                    // Aggregated Sum settings
                    thisObjNew.bowtieChartAggregated.select('div').remove();
                    thisObjNew.bowtieChartSVGDestination.selectAll('svg').remove();
                    thisObjNew.bowtieChartSVGSource.selectAll('svg').remove();

                    let textPropertiesAggregateValue: TextProperties;
                    textPropertiesAggregateValue = {
                        text: aggregateFormatter.format(convertedData.aggregatedSum),
                        fontFamily: 'Segoe UI',
                        fontSize: aggregateFontSize
                    };

                    let textPropertiesMetricName: TextProperties;
                    textPropertiesMetricName = {
                        text: thisObjNew.metricName,
                        fontFamily: 'Segoe UI',
                        fontSize: aggregateFontSize
                    };

                    let textWidth: number;
                    textWidth = TextMeasurementService.measureSvgTextWidth(textPropertiesAggregateValue);
                    let aggregatedSum: d3.Selection<SVGElement>;

                    aggregatedSum =
                        thisObjNew.bowtieChartAggregated.append('div')
                            .attr('id', 'divAggregatedSum')
                            // tslint:disable-next-line:max-line-length
                            .style('width', PixelConverter.toString((thisObjNew.currentViewport.width * bowtieChartAggregatedWidthPercentage) / 100))
                            .style('text-align', 'center');
                    aggregatedSum.append('div').append('span')
                        .attr('title', thisObjNew.metricName)
                        .text(TextMeasurementService.getTailoredTextOrDefault(
                            textPropertiesMetricName, (thisObjNew.currentViewport.width * bowtieChartAggregatedWidthPercentage) / 100));
                    aggregatedValue = aggregatedSum.append('div');

                    aggregatedValue.append('span')
                        .attr('title', aggregateFormatter.format(convertedData.aggregatedSum))
                        .text(TextMeasurementService.getTailoredTextOrDefault(
                            textPropertiesAggregateValue,
                            ((thisObjNew.currentViewport.width * bowtieChartAggregatedWidthPercentage) / 100) -
                            PixelConverter.fromPointToPixel(convertedData.AggregatelabelSettings.fontSize) - 2));

                    aggregatedSum
                        .style('font-size', aggregateFontSize)
                        .style('color', convertedData.AggregatelabelSettings.color);

                    // Indicator logic
                    let color: string = 'green';
                    if (thisObjNew.prevIndicator === false && convertedData.AggregatelabelSettings.Indicator) {
                        convertedData.AggregatelabelSettings.signIndicator = true;
                    } else if (convertedData.AggregatelabelSettings.Indicator === false) {
                        convertedData.AggregatelabelSettings.signIndicator = false;
                    }

                    if (convertedData.AggregatelabelSettings.signIndicator) {
                        convertedData.AggregatelabelSettings.Threshold = 0;
                    }

                    if (convertedData.AggregatelabelSettings.Indicator) {
                        if (convertedData.AggregatelabelSettings.signIndicator) {
                            color = convertedData.aggregatedSum > 0 ? 'green' : 'red';
                        } else {
                            color = convertedData.aggregatedSum >= convertedData.AggregatelabelSettings.Threshold ? 'green' : 'red';
                        }
                        aggregatedValue.append('span')
                            .style('color', color)
                            .style('font-size', aggregateFontSize)
                            .style('margin-left', '2px')
                            .style('margin-bottom', '-1px')
                            .attr('id', 'indicator')
                            .text('▲');
                    } else {
                        aggregatedValue.select('span#indicator').remove();
                    }
                    thisObjNew.prevIndicator = convertedData.AggregatelabelSettings.Indicator;

                    let divHeight: number = 0;
                    if (thisObjNew.root.select('#divAggregatedSum')) {
                        divHeight = parseFloat(thisObjNew.root.select('#divAggregatedSum').style('height'));
                    }
                    aggregatedSum.style('margin-top', PixelConverter.toString((avaialableHeight / 2 - divHeight / 2)));

                    // Destination Settings
                    thisObjNew.bowtieChartDestination.selectAll('div').remove();
                    numberOfValues = 0;

                    for (let k: number = 0; k < convertedData.dataPoints.length; k++) {
                        if (convertedData.dataPoints[k].DestCategoryLabel != null) {
                            numberOfValues++;
                        }
                    }
                    divisionHeight = avaialableHeight / numberOfValues;
                    fBranchHeight = avaialableHeight / 12;
                    fBranchHeight1 = avaialableHeight / 12;

                    // checking for large datasets
                    for (let iDiv: number = numberOfValues; iDiv < (convertedData.dataPoints.length); iDiv++) {
                        if ((convertedData.dataPoints[iDiv].DestCatArcWidth * fBranchHeight) < 1) {
                            fBranchHeight1 = fBranchHeight1 + 0.25;
                        }
                    }

                    if (fBranchHeight1 > avaialableHeight) {
                        thisObjNew.clearData(true);

                        return;
                    }

                    fStartX = 0;
                    fStartY = avaialableHeight / 2 - fBranchHeight1 / 2;
                    fEndX = (thisObjNew.currentViewport.width * bowtieChartSVGDestinationWidthPercentage) / 100;
                    fEndY = 0;
                    fCurveFactor = 0.65;
                    svg = thisObjNew.bowtieChartSVGDestination
                        .append('svg')
                        .style('height', PixelConverter.toString(avaialableHeight));

                    for (let iDiv: number = 0; iDiv < numberOfValues; iDiv++) {
                        category = convertedData.dataPoints[iDiv].DestCategoryLabel;
                        let value: string;
                        value = formatter.format(convertedData.dataPoints[iDiv].value);
                        let oDiv: d3.Selection<SVGElement>;
                        let spanDiv: d3.Selection<SVGElement>;
                        oDiv = thisObjNew.bowtieChartDestination
                            .append('div')
                            .classed('alignment', true)
                            .style('line-height', PixelConverter.toString(divisionHeight))
                            .style('width', '50%')
                            .style('margin-right', '1%');

                        let oDiv1: d3.Selection<SVGElement>;
                        let spanDiv1: d3.Selection<SVGElement>;
                        oDiv1 = thisObjNew.bowtieChartDestination
                            .append('div')
                            .classed('alignment', true)
                            .style('line-height', PixelConverter.toString(divisionHeight))
                            .style('width', '30%');

                        textPropertiesForLabel = {
                            text: convertedData.dataPoints[iDiv].DestCategoryLabel === ' ' ? '(Blank)' :
                             convertedData.dataPoints[iDiv].DestCategoryLabel,
                            fontFamily: 'Segoe UI',
                            fontSize: fontSize
                        };

                        let textPropertiesForValue: TextProperties;
                        textPropertiesForValue = {
                            text: formatter.format(convertedData.dataPoints[iDiv].value),
                            fontFamily: 'Segoe UI',
                            fontSize: fontSize
                        };

                        thisObjNew.bowtieChartDestination.style('display', 'block');

                        spanDiv = oDiv.append('span')
                            .classed(`index${iDiv}`, true)
                            .attr('title', convertedData.dataPoints[iDiv].DestCategoryLabel === ' ' ? '(Blank)' :
                            convertedData.dataPoints[iDiv].DestCategoryLabel)
                            .style('float', 'left')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor);

                        spanDiv.append('text')
                            .classed('destinationSpan1', true)
                            .attr('id', 'SpanText')
                            .classed(`index${iDiv}`, true)
                            .text(TextMeasurementService.getTailoredTextOrDefault(
                                // tslint:disable-next-line:max-line-length
                                textPropertiesForLabel, (thisObjNew.currentViewport.width * (bowtieChartDestinationWidthPercentage / 2 - 1)) / 100))
                            .style('cursor', 'pointer');

                        spanDiv1 = oDiv1.append('span')
                            .classed(`index${iDiv}`, true)
                            .attr('title', formatter.format(convertedData.dataPoints[iDiv].value))
                            .style('float', 'left')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor);

                        spanDiv1.append('text')
                            .classed('destinationSpan2', true)
                            .attr('id', 'SpanText1')
                            .classed(`index${iDiv}`, true)
                            .text(TextMeasurementService.getTailoredTextOrDefault(
                                textPropertiesForValue, (thisObjNew.currentViewport.width *
                                    (bowtieChartDestinationWidthPercentage / 2 - 1)) / 100))
                            .style('cursor', 'pointer');
                        let percentage: number;
                        percentage = convertedData.dataPoints[iDiv].value / convertedData.aggregatedSum;
                        fEndY = iDiv * (avaialableHeight / numberOfValues) + divisionHeight / 2;
                        let fPipeArea: number;
                        fPipeArea = Math.abs(fEndX - fStartX);
                        let height: number;
                        height = convertedData.dataPoints[iDiv].DestCatArcWidth * fBranchHeight > 1 ?
                            convertedData.dataPoints[iDiv].DestCatArcWidth * fBranchHeight : 1;
                        fStartY += (height / 2);
                        if (iDiv > 0) {
                            if ((convertedData.dataPoints[iDiv - 1].DestCatArcWidth * fBranchHeight) > 1) {
                                fStartY += ((convertedData.dataPoints[iDiv - 1].DestCatArcWidth * fBranchHeight) / 2);
                            } else {
                                fStartY += 0.5;
                            }
                        }
                        let d: string;
                        d = 'M ';
                        d += fStartX;
                        d += ' ';
                        d += fStartY;
                        d += ' C ';
                        d += (fStartX + (fPipeArea * fCurveFactor));
                        d += ' ';
                        d += fStartY;
                        d += ' ';
                        d += (fEndX - fPipeArea * fCurveFactor);
                        d += ' ';
                        d += fEndY;
                        d += ' ';
                        d += fEndX;
                        d += ' ';
                        d += fEndY;

                        let path: d3.Selection<SVGElement>;
                        path = svg
                            .append('path')
                            .classed(`index${iDiv}`, true)
                            .classed('destination', true)
                            .attr('id', 'DestPath')
                            .attr('d', d)
                            .attr('stroke', dataUpdate.ArcFillColor)
                            .attr('fill', 'none')
                            .attr('stroke-width', height)
                            .style('cursor', 'pointer');

                        let toolTipInfo: ITooltipDataItem[];
                        toolTipInfo = [];
                        toolTipInfo.push({
                            displayName: category,
                            value: value
                        });

                        path[0][0]['cust-tooltip'] = toolTipInfo;
                    }
                    d3.selectAll('.destination').data(destinationData.dataPoints)
                        .on('click', function (d: IBowtieDataPoint, i: number): void {
                            if (thisObjNew.categoryLabel === d.DestCategoryLabel) {
                                if (thisObjNew.flagliteral) {
                                        thisObjNew.flagliteral = 0;

                                        selectionManager.clear();
                           } else {
                                        thisObjNew.flagliteral = 1;
                                    }

                            } else {
                                thisObjNew.flagliteral = 1;
                            }
                            thisObjNew.categoryLabel = d.DestCategoryLabel;

                            updateInternal(dataView, thisObjNew.colors, thisObjNew.host, dataUpdate, thisObjNew, d.DestCategoryLabel,
                                           d.value, 'destination');

                            if (thisObjNew.flagliteral === 1) {

                                selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                                    d3.selectAll('#DestPath').style('opacity', 0.5);
                                    d3.selectAll(`.index${i}`).style('opacity', 1);
                                    d3.selectAll('#SpanText').style('opacity', 0.5);
                                    d3.selectAll(`.index${i}`).style('opacity', 1);
                                    d3.selectAll('#SpanText1').style('opacity', 0.5);
                                    d3.selectAll(`.index${i}`).style('opacity', 1);
                                });
                            } else {
                                selectionManager.clear();

                            }

                            (<Event>d3.event).stopPropagation();
                        });
                    d3.selectAll('.destinationSpan1').data(destinationData.dataPoints)
                        .on('click', function (d: IBowtieDataPoint, i: number): void {
                            if (thisObjNew.categoryLabel === d.DestCategoryLabel) {
                                if (thisObjNew.flagliteral) {
                                        thisObjNew.flagliteral = 0;

                                        selectionManager.clear();
                           } else {
                                        thisObjNew.flagliteral = 1;
                                    }

                            } else {
                                thisObjNew.flagliteral = 1;
                            }
                            updateInternal(dataView, thisObjNew.colors, thisObjNew.host, dataUpdate, thisObjNew, d.DestCategoryLabel,
                                           d.value, 'destination');
                            thisObjNew.categoryLabel = d.DestCategoryLabel;
                            if (thisObjNew.flagliteral === 1) {

                                selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                                    d3.selectAll('#DestPath').style('opacity', 0.5);
                                    d3.selectAll(`.index${i}`).style('opacity', 1);
                                    d3.selectAll('#SpanText').style('opacity', 0.5);
                                    d3.selectAll(`.index${i}`).style('opacity', 1);
                                    d3.selectAll('#SpanText1').style('opacity', 0.5);
                                    d3.selectAll(`.index${i}`).style('opacity', 1);
                                });
                            } else {
                                selectionManager.clear();
                            }

                            (<Event>d3.event).stopPropagation();
                        });
                    d3.selectAll('.destinationSpan2').data(destinationData.dataPoints)
                        .on('click', function (d: IBowtieDataPoint, i: number): void {
                            if (thisObjNew.categoryLabel === d.DestCategoryLabel) {
                                if (thisObjNew.flagliteral) {
                                        thisObjNew.flagliteral = 0;

                                        selectionManager.clear();
                           } else {
                                        thisObjNew.flagliteral = 1;
                                    }

                            } else {
                                thisObjNew.flagliteral = 1;
                            }
                            updateInternal(dataView, thisObjNew.colors, thisObjNew.host, dataUpdate, thisObjNew, d.DestCategoryLabel,
                                           d.value, 'destination');
                            thisObjNew.categoryLabel = d.DestCategoryLabel;

                            if (thisObjNew.flagliteral === 1) {

                                selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                                    d3.selectAll('#DestPath').style('opacity', 0.5);
                                    d3.selectAll(`.index${i}`).style('opacity', 1);
                                    d3.selectAll('#SpanText').style('opacity', 0.5);
                                    d3.selectAll(`.index${i}`).style('opacity', 1);
                                    d3.selectAll('#SpanText1').style('opacity', 0.5);
                                    d3.selectAll(`.index${i}`).style('opacity', 1);

                                });
                            } else {
                                selectionManager.clear();
                            }

                            (<Event>d3.event).stopPropagation();
                        });
                    // Source Settings
                    thisObjNew.bowtieChartSource.selectAll('div').remove();
                    fBranchHeight = avaialableHeight / 12;
                    fBranchHeight1 = avaialableHeight / 12;

                    // checking for large datasets
                    for (let iDiv: number = numberOfValues; iDiv < (convertedData.dataPoints.length); iDiv++) {
                        if ((convertedData.dataPoints[iDiv].SourceArcWidth * fBranchHeight) < 1) {
                            fBranchHeight1 = fBranchHeight1 + 0.25;
                        }
                    }

                    if (fBranchHeight1 > avaialableHeight) {
                        thisObjNew.clearData(true);

                        return;
                    }

                    fStartX = 0;
                    fStartY = 0;
                    fEndX = (thisObjNew.currentViewport.width * bowtieChartSVGDestinationWidthPercentage) / 100;
                    fEndY = avaialableHeight / 2 - fBranchHeight1 / 2;
                    fCurveFactor = 0.25;

                    divisionHeight = avaialableHeight / (convertedData.dataPoints.length - numberOfValues);
                    svg = thisObjNew.bowtieChartSVGSource
                        .append('svg')
                        .style('height', PixelConverter.toString(avaialableHeight));

                    for (let iDiv: number = numberOfValues; iDiv < (convertedData.dataPoints.length); iDiv++) {
                        category = convertedData.dataPoints[iDiv].SourceCategoryLabel;
                        let value: string;
                        value = formatter.format(convertedData.dataPoints[iDiv].srcValue);
                        let oDiv: d3.Selection<SVGElement>;
                        let spanDiv: d3.Selection<SVGElement>;
                        oDiv = thisObjNew.bowtieChartSource
                            .append('div')
                            .classed('alignment', true)
                            .style('line-height', PixelConverter.toString(divisionHeight))
                            .style('width', '50%')
                            .style('margin-right', '1%');

                        let oDiv1: d3.Selection<SVGElement>;
                        let spanDiv1: d3.Selection<SVGElement>;
                        oDiv1 = thisObjNew.bowtieChartSource
                            .append('div')
                            .classed('alignment', true)
                            .style('line-height', PixelConverter.toString(divisionHeight))
                            .style('width', '30%');

                        textPropertiesForLabel = {
                            text: category,
                            fontFamily: 'Segoe UI',
                            fontSize: fontSize
                        };

                        let textPropertiesForValue: TextProperties;
                        textPropertiesForValue = {
                            text: value,
                            fontFamily: 'Segoe UI',
                            fontSize: fontSize
                        };

                        thisObjNew.bowtieChartSource.style('display', 'block');

                        spanDiv = oDiv.append('span')
                            .classed(`indexClass${iDiv - numberOfValues}`, true)
                            .attr('title', convertedData.dataPoints[iDiv].SourceCategoryLabel)
                            .style('float', 'left')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor);

                        spanDiv.append('text')
                            .classed('sourceSpan1', true)
                            .classed(`indexClass${iDiv - numberOfValues}`, true)
                            .attr('id', 'SourceText')
                            .text(TextMeasurementService.getTailoredTextOrDefault(
                                textPropertiesForLabel,
                                (thisObjNew.currentViewport.width * (bowtieChartDestinationWidthPercentage / 2 - 1)) / 100))
                            .style('cursor', 'pointer');

                        spanDiv1 = oDiv1.append('span')
                            .classed(`indexClass${iDiv - numberOfValues}`, true)
                            .attr('title', formatter.format(convertedData.dataPoints[iDiv].srcValue))
                            .style('float', 'left')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor);

                        spanDiv1
                            .append('text')
                            .classed('sourceSpan2', true)
                            .attr('id', 'SourceText1')
                            .classed(`indexClass${iDiv - numberOfValues}`, true)
                            .text(TextMeasurementService.getTailoredTextOrDefault(
                                textPropertiesForValue, (thisObjNew.currentViewport.width *
                                    (bowtieChartDestinationWidthPercentage / 2 - 1)) / 100))
                            .style('cursor', 'pointer');

                        // Code for SVG Path
                        let percentage: number;
                        percentage = convertedData.dataPoints[iDiv].srcValue / convertedData.aggregatedSum;
                        fStartY = ((iDiv - numberOfValues) * divisionHeight) + divisionHeight / 2;
                        let fPipeArea: number;
                        fPipeArea = Math.abs(fStartX - fEndX);

                        let height: number = (convertedData.dataPoints[iDiv].SourceArcWidth * fBranchHeight);
                        height = height > 1 ? height : 1;
                        fEndY += (height / 2);

                        if (iDiv > numberOfValues) {
                            if ((convertedData.dataPoints[iDiv - 1].SourceArcWidth * fBranchHeight) > 1) {
                                fEndY += ((convertedData.dataPoints[iDiv - 1].SourceArcWidth * fBranchHeight) / 2);
                            } else {
                                fEndY += 0.5;
                            }
                        }
                        let d: string = '';
                        d = 'M ';
                        d += fStartX;
                        d += ' ';
                        d += fStartY;
                        d += ' C ';
                        d += (fEndX - (fPipeArea * fCurveFactor));
                        d += ' ';
                        d += fStartY;
                        d += ' ';
                        d += (fStartX + (fPipeArea * fCurveFactor));
                        d += ' ';
                        d += fEndY;
                        d += ' ';
                        d += fEndX;
                        d += ' ';
                        d += fEndY;

                        let path: d3.Selection<SVGElement>;
                        path = svg
                            .append('path')
                            .classed(`indexClass${iDiv - numberOfValues}`, true)
                            .classed('source', true)
                            .attr('d', d)
                            .attr('stroke', dataUpdate.ArcFillColor)
                            .attr('fill', 'none')
                            .attr('stroke-width', height)
                            .style('cursor', 'pointer');

                        let toolTipInfo: ITooltipDataItem[];
                        toolTipInfo = [];
                        toolTipInfo.push({
                            displayName: category,
                            value: value
                        });

                        path[0][0]['cust-tooltip'] = toolTipInfo;
                    }

                    d3.selectAll('.source').data(sourceData.dataPoints)
                        .on('click', function (d: IBowtieDataPoint, i: number): void {
                            if (thisObjNew.categoryLabel === d.SourceCategoryLabel) {
                                if (thisObjNew.flagliteral) {
                                        thisObjNew.flagliteral = 0;

                                        selectionManager.clear();
                           } else {
                                        thisObjNew.flagliteral = 1;
                                    }

                            } else {
                                thisObjNew.flagliteral = 1;
                            }
                            updateInternal(dataView, thisObjNew.colors, thisObjNew.host, dataUpdate, thisObjNew, d.SourceCategoryLabel,
                                           d.srcValue, 'source');
                            thisObjNew.categoryLabel = d.SourceCategoryLabel;
                            if (thisObjNew.flagliteral === 1) {

                                selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                                    d3.selectAll('path').style('opacity', ids.length > 0 ? 0.5 : 1);
                                    d3.selectAll('path.destination').style('opacity', 1);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);
                                    d3.selectAll('#SourceText').style('opacity', 0.5);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);
                                    d3.selectAll('#SourceText1').style('opacity', 0.5);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);
                                });
                            } else {
                                selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                                    d3.selectAll('path').style('opacity', 1);
                                    d3.selectAll('span').style('opacity', 1);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);

                                });
                                selectionManager.clear();

                            }

                            (<Event>d3.event).stopPropagation();
                        });
                    d3.selectAll('.sourceSpan1').data(sourceData.dataPoints)
                        .on('click', function (d: IBowtieDataPoint, i: number): void {
                            if (thisObjNew.categoryLabel === d.SourceCategoryLabel) {
                                if (thisObjNew.flagliteral) {
                                        thisObjNew.flagliteral = 0;

                                        selectionManager.clear();
                           } else {
                                        thisObjNew.flagliteral = 1;
                                    }

                            } else {
                                thisObjNew.flagliteral = 1;
                            }

                            updateInternal(dataView, thisObjNew.colors, thisObjNew.host, dataUpdate, thisObjNew, d.SourceCategoryLabel,
                                           d.srcValue, 'source');
                            thisObjNew.categoryLabel = d.SourceCategoryLabel;
                            if (thisObjNew.flagliteral === 1) {

                                selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                                    d3.selectAll('path').style('opacity', ids.length > 0 ? 0.5 : 1);
                                    d3.selectAll('path.destination').style('opacity', 1);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);
                                    d3.selectAll('#SourceText').style('opacity', 0.5);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);
                                    d3.selectAll('#SourceText1').style('opacity', 0.5);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);

                                });
                            } else {
                                selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                                    d3.selectAll('path').style('opacity', 1);

                                    d3.selectAll('span').style('opacity', 1);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);

                                });
                                selectionManager.clear();

                            }

                            (<Event>d3.event).stopPropagation();
                        });
                    d3.selectAll('.sourceSpan2').data(sourceData.dataPoints)
                        .on('click', function (d: IBowtieDataPoint, i: number): void {
                            if (thisObjNew.categoryLabel === d.SourceCategoryLabel) {
                                if (thisObjNew.flagliteral) {
                                        thisObjNew.flagliteral = 0;

                                        selectionManager.clear();
                           } else {
                                        thisObjNew.flagliteral = 1;
                                    }

                            } else {
                                thisObjNew.flagliteral = 1;
                            }
                            updateInternal(dataView, thisObjNew.colors, thisObjNew.host, dataUpdate, thisObjNew, d.SourceCategoryLabel,
                                           d.srcValue, 'source');
                            thisObjNew.categoryLabel = d.SourceCategoryLabel;
                            if (thisObjNew.flagliteral === 1) {

                                selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                                    d3.selectAll('path').style('opacity', ids.length > 0 ? 0.5 : 1);
                                    d3.selectAll('path.destination').style('opacity', 1);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);
                                    d3.selectAll('#SourceText').style('opacity', 0.5);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);
                                    d3.selectAll('#SourceText1').style('opacity', 0.5);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);
                                });
                            } else {
                                selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                                    d3.selectAll('path').style('opacity', 1);

                                    d3.selectAll('span').style('opacity', 1);
                                    d3.selectAll(`.indexClass${i}`).style('opacity', 1);

                                });
                                selectionManager.clear();

                            }

                            (<Event>d3.event).stopPropagation();
                        });
                    d3.select('html').on('click', function (): void {
                        if (selectionManager[`selectedIds`].length) {
                            thisObjNew.flagliteral = 0;
                            updateInternal(dataView, thisObjNew.colors, thisObjNew.host, dataUpdate, thisObjNew, '',
                                           '', '');
                            selectionManager.clear();
                            d3.selectAll('path').style('opacity', 1);
                            d3.selectAll('span').style('opacity', 1);
                            d3.selectAll('#SourceText1').style('opacity', 1);
                            d3.selectAll('#SourceText').style('opacity', 1);
                            selectionManager.clear();
                        }
                    });
                }

                // Adding the tooltip for each path

                thisObjNew.tooltipServiceWrapper.addTooltip(
                    d3.selectAll('svg>*'), (
                        tooltipEvent: TooltipEventArgs<number>) => {
                        return tooltipEvent.context['cust-tooltip'];
                    },
                    (
                        tooltipEvent: TooltipEventArgs<number>) => null,
                    true);
                // tslint:disable-next-line:cyclomatic-complexity
                thisObjNew.data = dataUpdate;
            }

        }
        private dataViewContainsCategory(dataView: DataView): DataViewCategoryColumn {
            return dataView &&
                dataView.categorical &&
                dataView.categorical.categories &&
                dataView.categorical.categories[0];
        }

        // This function returns on/off status of the funnel title properties
        private getShowTitle(dataView: DataView): IDataLabelSettings {
            const gmoDonutTitle: string = 'GMODonutTitle';
            const showLiteral: string = 'show';
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    const showTitle: DataViewObject = dataView.metadata.objects[gmoDonutTitle];
                    if (dataView.metadata.objects && showTitle.hasOwnProperty('show')) {
                        return <IDataLabelSettings>showTitle[showLiteral];
                    }
                } else {
                    return <IDataLabelSettings>true;
                }
            }

            return <IDataLabelSettings>true;
        }

        /* This function returns the title text given for the title in the format window */
        // tslint:disable-next-line:no-any
        private getTitleText(dataView: DataView): string {
            let returnTitleValues: string;
            let returnTitleLegend: string;
            let returnTitleDetails: string;
            let returnTitle: string;
            let tempTitle: string;
            let gmoDonutTitle: string;
            let titleTextLiteral: string;

            gmoDonutTitle = 'GMODonutTitle';
            titleTextLiteral = 'titleText';
            returnTitleValues = '';
            returnTitleLegend = '';
            returnTitleDetails = '';
            returnTitle = '';
            tempTitle = '';
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    const titletext: DataViewObject = dataView.metadata.objects[gmoDonutTitle];
                    if (titletext && titletext.hasOwnProperty('titleText')) {
                        return titletext[titleTextLiteral].toString();
                    }
                }
            }

            let iLength: number = 0;
            if (dataView && dataView.categorical && dataView.categorical.values) {
                for (iLength = 0; iLength < dataView.categorical.values.length; iLength++) {
                    if (dataView.categorical.values[iLength].source && dataView.categorical.values[iLength].source.roles &&
                        dataView.categorical.values[iLength].source.roles.hasOwnProperty('Value')) {
                        if (dataView.categorical.values[iLength].source.displayName) {
                            returnTitleValues = dataView.categorical.values[iLength].source.displayName;
                            break;
                        }
                    }
                }
            }

            returnTitleLegend = this.getLegendTitle(dataView);

            returnTitleDetails = this.getTitleDetails(dataView);

            if ('' !== returnTitleValues) {
                tempTitle = ' by ';
            }
            if ('' !== returnTitleLegend && '' !== returnTitleDetails) {
                tempTitle = tempTitle;
                tempTitle += returnTitleLegend;
                tempTitle += ' and ';
                tempTitle += returnTitleDetails;
            } else if ('' === returnTitleLegend && '' === returnTitleDetails) {
                tempTitle = '';
            } else {
                // means one in empty and other is non empty
                tempTitle = tempTitle + returnTitleLegend + returnTitleDetails;
            }

            returnTitle = returnTitleValues + tempTitle;

            return returnTitle;
        }

        private getTitleDetails(dataView: DataView): string {
            let returnTitleDetails: string;
            returnTitleDetails = '';
            if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[1]) {
                returnTitleDetails = dataView.categorical.categories[1].source.displayName;
            }

            return returnTitleDetails;
        }

        private getLegendTitle(dataView: DataView): string {
            let legendTitle: string;
            legendTitle = '';
            if (dataView && dataView.categorical && dataView.categorical.categories) {
                legendTitle = dataView.categorical.categories[0].source.displayName;
            }

            return legendTitle;
        }

        // This function returns the tool tip text given for the tooltip in the format window
        private getTooltipText(dataView: DataView): IDataLabelSettings {
            let gmoDonutTitle: string;
            let tooltipTextLiteral: string;
            gmoDonutTitle = 'GMODonutTitle';
            tooltipTextLiteral = 'tooltipText';

            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    const tooltiptext: DataViewObject = dataView.metadata.objects[gmoDonutTitle];
                    if (tooltiptext && tooltiptext.hasOwnProperty('tooltipText')) {
                        return <IDataLabelSettings>tooltiptext[tooltipTextLiteral];
                    }
                } else {
                    return <IDataLabelSettings>'Your tooltip text goes here';
                }
            }

            return <IDataLabelSettings>'Your tooltip text goes here';
        }

        // This function returns the font colot selected for the title in the format window
        private getTitleFill(dataView: DataView): Fill {
            let gmoDonutTitle: string;
            let fill1Literal: string;
            gmoDonutTitle = 'GMODonutTitle';
            fill1Literal = 'fill1';

            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    const fTitle: DataViewObject = dataView.metadata.objects[gmoDonutTitle];
                    if (fTitle && fTitle.hasOwnProperty('fill1')) {
                        return <Fill>fTitle[fill1Literal];
                    }
                } else {
                    return dataView && dataView.metadata && DataViewObjects.getValue(
                        dataView.metadata.objects, bowtieProps.titleFill, { solid: { color: '#333333' } });
                }
            }

            return dataView && dataView.metadata && DataViewObjects.getValue(
                dataView.metadata.objects, bowtieProps.titleFill, { solid: { color: '#333333' } });
        }

        // This function returns the background color selected for the title in the format window
        private getTitleBgcolor(dataView: DataView): Fill {
            let gmoDonutTitle: string;
            let backgroundColorLiteral: string;
            gmoDonutTitle = 'GMODonutTitle';
            backgroundColorLiteral = 'backgroundColor';

            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    const fTitle: DataViewObject = dataView.metadata.objects[gmoDonutTitle];
                    if (fTitle && fTitle.hasOwnProperty('backgroundColor')) {
                        return <Fill>fTitle[backgroundColorLiteral];
                    }
                } else {
                    return dataView && dataView.metadata && DataViewObjects.getValue(
                        dataView.metadata.objects, bowtieProps.titleBackgroundColor, { solid: { color: 'none' } });
                }
            }

            return dataView && dataView.metadata && DataViewObjects.getValue(
                dataView.metadata.objects, bowtieProps.titleBackgroundColor, { solid: { color: 'none' } });
        }

        // This function returns the funnel title font size selected for the title in the format window
        // tslint:disable-next-line:no-any
        private getTitleSize(dataView: DataView): number {
            let gmoDonutTitle: string;
            let fontSizeLiteral: string;
            gmoDonutTitle = 'GMODonutTitle';
            fontSizeLiteral = 'fontSize';

            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    const fTitle: DataViewObject = dataView.metadata.objects[gmoDonutTitle];
                    if (fTitle && fTitle.hasOwnProperty('fontSize')) {
                        return parseInt(fTitle[fontSizeLiteral].toString(), 10);
                    }
                } else {
                    return 9;
                }
            }

            return 9;
        }

        // This function retruns the values to be displayed in the property pane for each object.
        // Usually it is a bind pass of what the property pane gave you, but sometimes you may want to do
        // validation and return other values/defaults
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {

            let enumeration: VisualObjectInstance[];
            enumeration = [];
            switch (options.objectName) {
                case 'general':
                    enumeration.push({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            ArcFillColor: this.data.ArcFillColor
                        }
                    });
                    break;
                case 'GMODonutTitle':
                    enumeration.push({
                        objectName: 'GMODonutTitle',
                        displayName: 'Bowtie title',
                        selector: null,
                        properties: {
                            show: this.getShowTitle(this.dataViews[0]),
                            titleText: this.getTitleText(this.dataViews[0]),
                            tooltipText: this.getTooltipText(this.dataViews[0]),
                            fill1: this.getTitleFill(this.dataViews[0]),
                            backgroundColor: this.getTitleBgcolor(this.dataViews[0]),
                            fontSize: this.getTitleSize(this.dataViews[0])
                        }
                    });
                    break;
                case 'labels':
                    enumeration.push({
                        objectName: 'labels',
                        displayName: 'Data Labels',
                        selector: null,
                        properties: {
                            color: this.data.labelSettings.labelColor,
                            displayUnits: this.data.labelSettings.displayUnits,
                            textPrecision: this.data.labelSettings.precision,
                            fontSize: this.data.labelSettings.fontSize
                        }
                    });
                    break;
                case 'Aggregatelabels':
                    enumeration.push({
                        objectName: 'Aggregatelabels',
                        displayName: 'Summary Label Settings',
                        selector: null,
                        properties: {
                            color: this.data.AggregatelabelSettings.color,
                            displayUnits: this.data.AggregatelabelSettings.displayUnits,
                            textPrecision: this.data.AggregatelabelSettings.textPrecision,
                            fontSize: this.data.AggregatelabelSettings.fontSize,
                            Indicator: this.data.AggregatelabelSettings.Indicator,
                            signIndicator: this.data.AggregatelabelSettings.signIndicator,
                            Threshold: this.data.AggregatelabelSettings.Threshold
                        }
                    });
                    break;
                default:
                    break;
            }

            return enumeration;
        }
    }
}
