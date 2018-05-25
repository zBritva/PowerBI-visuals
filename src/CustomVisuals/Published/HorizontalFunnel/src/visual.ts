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
    //color
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    //tooltip
    import TextMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import ISelectionManager = powerbi.extensibility.ISelectionManager;
    import IVisual = powerbi.extensibility.visual.IVisual;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
    import SelectionManager = powerbi.extensibility.ISelectionManager;
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
    import pixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import SelectionId = powerbi.visuals.ISelectionId;
    //tooltip
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import tooltip = powerbi.extensibility.utils.tooltip;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    //color
    import IDataColorPalette = powerbi.extensibility.IColorPalette;
    import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;
    import IDataLabelSettings = powerbi.extensibility.utils.chart.dataLabel.IDataLabelSettings;
    //label
    import dataLabelUtils = powerbi.extensibility.utils.chart.dataLabel.utils;
    import DataLabelObject = powerbi.extensibility.utils.chart.dataLabel.DataLabelObject;
    import VisualDataLabelsSettingsOptions = powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettingsOptions;

    export interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }
    export interface ITooltipDataItem {
        displayName: string;
        value: string;
    }
    // tslint:disable-next-line:no-any
    export let cardProps: any = {
        categoryLabels: {
            show: <DataViewObjectPropertyIdentifier>{
                objectName: 'categoryLabels',
                propertyName: 'show'
            },
            color: <DataViewObjectPropertyIdentifier>{
                objectName: 'categoryLabels',
                propertyName: 'color'
            },
            fontSize: <DataViewObjectPropertyIdentifier>{
                objectName: 'categoryLabels',
                propertyName: 'fontSize'
            }
        },
        labels: {
            color: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'color'
            },
            labelPrecision: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'labelPrecision'
            },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'labelDisplayUnits'
            },
            fontSize: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'fontSize'
            }

        },
        trendlabels: {
            color: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'color'
            },
            labelPrecision: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'labelPrecision'
            },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'labelDisplayUnits'
            },
            fontSize: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'fontSize'
            }
        },
        wordWrap: {
            show: <DataViewObjectPropertyIdentifier>{
                objectName: 'wordWrap',
                propertyName: 'show'
            }
        }
    };
    export interface ITooltipDataPoints {
        name: string;
        value: string;
        formatter: string;
    }

    export interface ILabelSettings {
        color: string;
        displayUnits: number;
        decimalPlaces: number;
        fontSize: number;
    }

    export interface IFunnelTitle {
        show: boolean;
        titleText: string;
        tooltipText: string;
        color: string;
        bkColor: string;
        fontSize: number;
    }

    export interface ISortSettings {
        sortBy: string;
        orderBy: string;
    }
    export interface IShowConnectorsSettings {
        show: boolean;
    }
    export interface IShowLegendSettings {
        show: boolean;
    }
    export interface ICardFormatSetting {
        showTitle: boolean;
        textSize: number;
        // tslint:disable-next-line:no-any
        labelSettings: any; // VisualDataLabelsSettings;
        wordWrap: boolean;
    }
    export interface IFunnelViewModel {
        primaryColumn?: string;
        secondaryColumn?: string;
        count?: number;
        toolTipInfo?: ITooltipDataItem[];
        categories?: ICategoryViewModel[];
        values?: IValueViewModel[];
        identity?: SelectionId;
    }
    export interface ICategoryViewModel {
        value: string;
        color: string;
        identity?: SelectionId;
    }
    export interface IValueViewModel {
        // tslint:disable-next-line:no-any
        values: any;
    }
    // tslint:disable-next-line:no-any
    export let horizontalFunnelProps: any = {
        dataPoint: {
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' },
            defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'defaultColor' }
        },
        funnelTitle: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'FunnelTitle', propertyName: 'show' },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'FunnelTitle', propertyName: 'titleText' },
            titleFill: { objectName: 'FunnelTitle', propertyName: 'fill1' },
            titleBackgroundColor: { objectName: 'FunnelTitle', propertyName: 'backgroundColor' },
            titleFontSize: { objectName: 'FunnelTitle', propertyName: 'fontSize' },
            tooltipText: { objectName: 'FunnelTitle', propertyName: 'tooltipText' }
        },
        sort: {
            sortBy: <DataViewObjectPropertyIdentifier>{ objectName: 'Sort', propertyName: 'SortBy' },
            orderBy: <DataViewObjectPropertyIdentifier>{ objectName: 'Sort', propertyName: 'OrderBy' }
        },
        show: { objectName: 'FunnelTitle', propertyName: 'show' },
        titleText: { objectName: 'FunnelTitle', propertyName: 'titleText' },
        titleFill: { objectName: 'FunnelTitle', propertyName: 'fill1' },
        titleBackgroundColor: { objectName: 'FunnelTitle', propertyName: 'backgroundColor' },
        titleFontSize: { objectName: 'FunnelTitle', propertyName: 'fontSize' },
        tooltipText: { objectName: 'FunnelTitle', propertyName: 'tooltipText' },
        SortBy: {
            SortBy: <DataViewObjectPropertyIdentifier>{ objectName: 'Sort', propertyName: 'SortBy' },
            OrderBy: <DataViewObjectPropertyIdentifier>{ objectName: 'Sort', propertyName: 'OrderBy' }
        },
        ShowLegend: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'ShowLegend', propertyName: 'show' }
        },
        ShowConnectors: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'ShowConnectors', propertyName: 'show' }
        },
        LabelSettings: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'color' },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelDisplayUnits' },
            labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelPrecision' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'fontSize' }
        }
    };
    // tslint:disable-next-line:no-any
    export let sortType: any = [
        { value: 'Auto', displayName: 'Auto' },
        { value: 'Series', displayName: 'Series' },
        { value: 'PrimaryMeasure', displayName: 'Primary Measure' },
        { value: 'SecondaryMeasure', displayName: 'Secondary Measure' }
    ];
    // tslint:disable-next-line:no-any
    export let orderType: any = [
        { value: 'ascending', displayName: 'Ascending', description: 'Ascending' },
        { value: 'descending', displayName: 'Descending', description: 'Descending' }
    ];

    export function getCategoricalObjectValue<T>(
        category: DataViewCategoryColumn, index: number, objectName: string, propertyName: string, defaultValue: T): T {
        let categoryObjects:  DataViewObjects[];
        categoryObjects = category.objects;
        if (categoryObjects) {
            const categoryObject: DataViewObject = categoryObjects[index];
            if (categoryObject) {
                let object: DataViewPropertyValue;
                object = categoryObject[objectName];
                if (object) {
                    let property: T;
                    property = object[propertyName];
                    if (property !== undefined) {
                        return property;
                    }
                }
            }
        }

        return defaultValue;
    }

    export class HorizontalFunnel implements IVisual {
        private static minOpacity: number = 0.3;
        private static maxOpacity: number = 1;
        public host: IVisualHost;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private root: d3.Selection<SVGElement>;
        private dataView: DataView;
        // tslint:disable-next-line:no-any
        private style: any; // IVisualStyle;
        private colors: IDataColorPalette;
        private cardFormatSetting: ICardFormatSetting;
        private durationAnimations: number = 200;
        private selectionManager: SelectionManager;
        // tslint:disable-next-line:no-any
        private defaultDataPointColor: any = undefined;
        private tooltipInfoValue: string;
        // tslint:disable-next-line:no-any
        private viewModel: any = undefined;
        // tslint:disable-next-line:no-any
        private static cPalette: any;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.root = d3.select(options.element).style('cursor', 'default');
            this.style = options.element.style;
            // tslint:disable-next-line:no-any
            horizontalFunnelProps.cPalette = options.host.colorPalette;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.selectionManager = options.host.createSelectionManager();
        }

        public static getDefaultData(): IFunnelViewModel {
            return {
                count: 0,
                categories: [],
                values: [],
                primaryColumn: '',
                secondaryColumn: '',
                toolTipInfo: [],
                identity: null
            };
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public static converter(
            dataView: DataView,
            colors: IDataColorPalette,
            sort: string,
            order: string,
            host: IVisualHost): IFunnelViewModel[] {
            let viewModel: IFunnelViewModel[];
            viewModel = [];
            viewModel.push(HorizontalFunnel.getDefaultData());
            if (dataView) {
                let objects: DataViewObjects = dataView.metadata.objects;
                let targetvalueIndex: number;
                let yvalueIndex: number;
                if (!dataView || !dataView.categorical || !dataView.categorical.values || !dataView.categorical.categories) {
                    viewModel[0].count = -1;

                    return viewModel;
                }
                for (let iLoop: number = 0; iLoop < dataView.categorical.values.length; iLoop++) {
                    if (dataView.categorical.values[iLoop].source.roles
                        && dataView.categorical.values[iLoop].source.roles.hasOwnProperty('primaryMeasure')) {
                        targetvalueIndex = iLoop;
                        viewModel[0].primaryColumn = dataView.categorical.values[iLoop].source.displayName;
                    } else if (dataView.categorical.values[iLoop].source.roles
                        && dataView.categorical.values[iLoop].source.roles.hasOwnProperty('secondaryMeasure')) {
                        yvalueIndex = iLoop;
                        viewModel[0].secondaryColumn = dataView.categorical.values[iLoop].source.displayName;
                    }
                }
                if (targetvalueIndex !== undefined) {
                    let categorical: DataViewCategorical;
                    categorical = dataView.categorical;
                    if (categorical) {
                        // tslint:disable-next-line:no-any
                        let unsortcategoriesvalues : any;
                        unsortcategoriesvalues = JSON.parse(JSON.stringify(categorical.categories[0].values));
                        // tslint:disable-next-line:no-any
                        let unsortcategories: any;
                        unsortcategories = categorical.categories[0];
                        // tslint:disable-next-line:no-any
                        let unsorttargetvalues: any;
                        unsorttargetvalues = JSON.parse(JSON.stringify(categorical.values[targetvalueIndex].values));
                        let unsortindex: number;
                        // tslint:disable-next-line:no-any
                        let unsortsecondaryvalues: any;
                        // tslint:disable-next-line:no-any
                        let yAxis1SortedValues: any = [];
                        // tslint:disable-next-line:no-any
                        let yAxis2SortedValues: any = [];
                        // tslint:disable-next-line:no-any
                        let xAxisSortedValues: any = [];
                        if (viewModel[0].secondaryColumn) {
                            unsortsecondaryvalues = JSON.parse(JSON.stringify(categorical.values[yvalueIndex].values));
                        }
                        switch (sort) {
                            case 'Auto':
                                // tslint:disable-next-line:no-any
                                let arrValuesToBeSorted : any;
                                arrValuesToBeSorted = [];
                                let iSmallestValue: string;
                                let iIndex: number = 0;
                                let arrTempXAxisValues: PrimitiveValue[];
                                arrTempXAxisValues = categorical.categories[0].values;
                                let arrTempYAxisValues1: PrimitiveValue[];
                                arrTempYAxisValues1 = categorical.values[0].values;
                                // tslint:disable-next-line:no-any
                                let arrTempYAxisValues2 : any = [];
                                // tslint:disable-next-line:no-any
                                let iValueToBeSorted: any;
                                // tslint:disable-next-line:no-any
                                let arrIntegerValuesSortIndexes : any;
                                arrIntegerValuesSortIndexes = [];
                                // tslint:disable-next-line:no-any
                                let arrTextValuesSortIndexes : any;
                                arrTextValuesSortIndexes = {
                                    textValue: [],
                                    textIndex: []
                                };
                                // tslint:disable-next-line:no-any
                                let yAxisAutoSort: any;
                                yAxisAutoSort = [];
                                // tslint:disable-next-line:no-any
                                let yAxis1AutoSort: any;
                                yAxis1AutoSort = [];
                                // tslint:disable-next-line:no-any
                                let xAxisSortedIntegerValues: any;
                                xAxisSortedIntegerValues = [];
                                let iTotalXAxisNumericValues: number = 0;
                                if (2 === categorical.values.length) {
                                    arrTempYAxisValues2 = categorical.values[1].values;
                                }
                                /*****************************CREATE ARRAY FOR VALUES TO BE SORTED******************************/
                                /* Change of value*/
                                // tslint:disable-next-line:no-any
                                let value: any;
                                for (let iCount: number = 0; iCount < categorical.categories[0].values.length; iCount++) {
                                    value = categorical.categories[0].values[iCount];
                                    if (isNaN(value)) {
                                        iValueToBeSorted = categorical.categories[0].values[iCount].toString().match(/-?\d+\.?\d*/);
                                        if (null !== iValueToBeSorted) {
                                            arrValuesToBeSorted.push(parseFloat(iValueToBeSorted[0]));
                                            iTotalXAxisNumericValues++;
                                        } else {
                                            arrValuesToBeSorted.push(value);
                                        }
                                    } else {
                                        value = categorical.categories[0].values[iCount];
                                        if (isNaN(parseFloat(value))) {
                                            arrValuesToBeSorted.push(value);
                                        } else {
                                            arrValuesToBeSorted.push(parseFloat(value));
                                        }
                                        iTotalXAxisNumericValues++;
                                    }
                                }

                                /*****************************END create array for values to be sorted*****************************/
                                if (iTotalXAxisNumericValues) {
                                    for (let iCounter: number = 0; iCounter < arrValuesToBeSorted.length; iCounter++) {
                                        if (-1 === arrIntegerValuesSortIndexes.indexOf(iCounter)
                                            && -1 === arrTextValuesSortIndexes.textIndex.indexOf(iCounter)) {
                                            iSmallestValue = arrValuesToBeSorted[iCounter];
                                            iIndex = iCounter;
                                            if (isNaN(parseFloat(iSmallestValue))) {
                                                arrTextValuesSortIndexes.textValue.push(iSmallestValue);
                                                arrTextValuesSortIndexes.textIndex.push(iCounter);
                                                continue;
                                            } else {
                                                for (let iInnerCount: number = iCounter + 1;
                                                    iInnerCount < arrValuesToBeSorted.length; iInnerCount++) {
                                                    if (!isNaN(arrValuesToBeSorted[iInnerCount])
                                                        && -1 === arrIntegerValuesSortIndexes.indexOf(iInnerCount)
                                                        && null !== arrValuesToBeSorted[iInnerCount]) {
                                                        if (arrValuesToBeSorted[iInnerCount] < iSmallestValue) {
                                                            iIndex = iInnerCount;
                                                            iSmallestValue = arrValuesToBeSorted[iInnerCount];
                                                        }
                                                    }
                                                }
                                                arrIntegerValuesSortIndexes.push(iIndex);
                                            }
                                            if (-1 === arrIntegerValuesSortIndexes.indexOf(iCounter)) {
                                                iCounter--;
                                            }
                                        }
                                    }
                                    for (let iLoop: number = 0; iLoop < arrIntegerValuesSortIndexes.length; iLoop++) {
                                        xAxisSortedIntegerValues.push(arrTempXAxisValues[arrIntegerValuesSortIndexes[iLoop]]);
                                        for (let iNumberOfYAxisParameters: number = 0;
                                            iNumberOfYAxisParameters < categorical.values.length; iNumberOfYAxisParameters++) {
                                            if (0 === iNumberOfYAxisParameters) {
                                                yAxisAutoSort.push(arrTempYAxisValues1[arrIntegerValuesSortIndexes[iLoop]]);
                                            } else if (1 === iNumberOfYAxisParameters) {
                                                yAxis1AutoSort.push(arrTempYAxisValues2[arrIntegerValuesSortIndexes[iLoop]]);
                                            }
                                        }
                                    }
                                    for (let iLoop: number = 0; iLoop < arrTextValuesSortIndexes.textValue.length; iLoop++) {
                                        xAxisSortedIntegerValues.push(arrTempXAxisValues[arrTextValuesSortIndexes.textIndex[iLoop]]);
                                        for (let iNumberOfYAxisParameters: number = 0;
                                            iNumberOfYAxisParameters < categorical.values.length; iNumberOfYAxisParameters++) {
                                            if (0 === iNumberOfYAxisParameters) {
                                                yAxisAutoSort.push(arrTempYAxisValues1[arrTextValuesSortIndexes.textIndex[iLoop]]);
                                            } else if (1 === iNumberOfYAxisParameters) {
                                                yAxis1AutoSort.push(arrTempYAxisValues2[arrTextValuesSortIndexes.textIndex[iLoop]]);
                                            }
                                        }
                                    }
                                } else {
                                    xAxisSortedIntegerValues = JSON.parse(JSON.stringify(unsortcategoriesvalues));
                                    yAxisAutoSort = JSON.parse(JSON.stringify(unsorttargetvalues));
                                    if (viewModel[0].secondaryColumn) {
                                        yAxis1AutoSort = JSON.parse(JSON.stringify(unsortsecondaryvalues));
                                    }
                                }
                                if (order === 'descending') {
                                    for (let iCount: number = xAxisSortedIntegerValues.length - 1; iCount >= 0; iCount--) {
                                        xAxisSortedValues.push(xAxisSortedIntegerValues[iCount]);
                                        yAxis1SortedValues.push(yAxisAutoSort[iCount]);
                                        if (viewModel[0].secondaryColumn) {
                                            yAxis2SortedValues.push(yAxis1AutoSort[iCount]);
                                        }
                                    }
                                } else {
                                    xAxisSortedValues = JSON.parse(JSON.stringify(xAxisSortedIntegerValues));
                                    yAxis1SortedValues = JSON.parse(JSON.stringify(yAxisAutoSort));
                                    yAxis2SortedValues = JSON.parse(JSON.stringify(yAxis1AutoSort));
                                }
                                break;

                            case 'Series':
                                let index: number = 0;
                                if (order === 'ascending') {
                                    xAxisSortedValues = categorical.categories[0].values.sort(d3.ascending);
                                } else {
                                    xAxisSortedValues = categorical.categories[0].values.sort(d3.descending);
                                }
                                for (let iCount: number = 0; iCount < xAxisSortedValues.length; iCount++) {
                                    // tslint:disable-next-line:no-any
                                    let temp: any;
                                    temp = xAxisSortedValues[iCount];
                                    for (index = 0; index < unsortcategoriesvalues.length; index++) {
                                        if (temp === unsortcategoriesvalues[index]) {
                                            yAxis1SortedValues.push(categorical.values[targetvalueIndex].values[index]);
                                            if (viewModel[0].secondaryColumn) {
                                                yAxis2SortedValues.push(categorical.values[yvalueIndex].values[index]);
                                            }
                                            break;
                                        }
                                    }
                                }
                                break;

                            case 'PrimaryMeasure':
                                if (order === 'ascending') {
                                    yAxis1SortedValues = unsorttargetvalues.sort(d3.ascending);
                                } else {
                                    yAxis1SortedValues = unsorttargetvalues.sort(d3.descending);
                                }
                                for (let iCount: number = 0; iCount < yAxis1SortedValues.length; iCount++) {
                                    // tslint:disable-next-line:no-any
                                    let temp: any;
                                    temp = yAxis1SortedValues[iCount];
                                    for (index = 0; index < categorical.values[targetvalueIndex].values.length; index++) {
                                        if (temp === categorical.values[targetvalueIndex].values[index]) {
                                            if (xAxisSortedValues.indexOf(unsortcategoriesvalues[index]) > -1) {
                                                continue;
                                            } else {
                                                xAxisSortedValues.push(unsortcategoriesvalues[index]);
                                                if (viewModel[0].secondaryColumn) {
                                                    yAxis2SortedValues.push(unsortsecondaryvalues[index]);
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                                break;

                            case 'SecondaryMeasure':
                                if (order === 'ascending') {
                                    yAxis2SortedValues = unsortsecondaryvalues.sort(d3.ascending);
                                } else {
                                    yAxis2SortedValues = unsortsecondaryvalues.sort(d3.descending);
                                }
                                for (let iCount: number = 0; iCount < yAxis2SortedValues.length; iCount++) {
                                    // tslint:disable-next-line:no-any
                                    let temp: any;
                                    temp = yAxis2SortedValues[iCount];
                                    for (index = 0; index < categorical.values[yvalueIndex].values.length; index++) {
                                        if (temp === categorical.values[yvalueIndex].values[index]) {
                                            if (xAxisSortedValues.indexOf(unsortcategoriesvalues[index]) > -1) {
                                                continue;
                                            } else {
                                                xAxisSortedValues.push(unsortcategoriesvalues[index]);
                                                if (viewModel[0].primaryColumn) {
                                                    yAxis1SortedValues.push(unsorttargetvalues[index]);
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                                break;

                            default:
                                break;
                        }

                        let categories: DataViewCategoryColumn[];
                        categories = categorical.categories;
                        let series: DataViewValueColumns;
                        series = categorical.values;
                        let catDv: DataViewCategorical;
                        catDv = dataView.categorical;
                        let cat : DataViewCategoryColumn;
                        cat = catDv.categories[0];
                        let values : DataViewValueColumns;
                        values = catDv.values;
                        let formatStringProp: DataViewObjectPropertyIdentifier;
                        formatStringProp = <DataViewObjectPropertyIdentifier>{
                            objectName: 'general',
                            propertyName: 'formatString'
                        };
                        if (categories && series && categories.length > 0 && series.length > 0) {
                            let categorySourceFormatString: string;
                            categorySourceFormatString = ValueFormatter.getFormatString(cat.source, formatStringProp);
                            // tslint:disable-next-line:no-any
                            let toolTipItems: any;
                            toolTipItems = [];
                            // tslint:disable-next-line:no-any
                            let formattedCategoryValue : any;
                            // tslint:disable-next-line:no-any
                            let value : any;
                            let categoryColumn: DataViewCategoryColumn;
                            categoryColumn = categorical.categories[0];
                            let catLength: number;
                            catLength = xAxisSortedValues.length;
                            for (let iLoop: number = 0; iLoop < catLength; iLoop++) {

                                toolTipItems = [];
                                if (iLoop !== 0) {
                                    viewModel.push({ toolTipInfo: [] });
                                }

                                viewModel[0].categories.push({
                                    value: xAxisSortedValues[iLoop],
                                    color: '' // colors.getColorByIndex(colorIndex).value
                                });
                                let decimalPlaces: number = HorizontalFunnel.getDecimalPlacesCount(yAxis1SortedValues[iLoop]);
                                decimalPlaces = decimalPlaces > 4 ? 4 : decimalPlaces;
                                let primaryFormat: string;
                                primaryFormat = series && series[0] && series[0].source && series[0].source.format ?
                                    series[0].source.format : '';
                                let formatter: IValueFormatter;
                                formatter = ValueFormatter.create({
                                    format: primaryFormat,
                                    precision: decimalPlaces,
                                    value: 0
                                });
                                formattedCategoryValue = ValueFormatter.format(xAxisSortedValues[iLoop], categorySourceFormatString);
                                let tooltipInfo: ITooltipDataItem[];
                                tooltipInfo = [];
                                let tooltipItem1: ITooltipDataItem;
                                tooltipItem1 = { displayName: '', value: '' };
                                let tooltipItem2: ITooltipDataItem;
                                tooltipItem2 = { displayName: '', value: '' };
                                tooltipItem1.displayName = catDv.categories['0'].source.displayName;
                                tooltipItem1.value = formattedCategoryValue;
                                tooltipInfo.push(tooltipItem1);
                                tooltipItem2.displayName = catDv.values['0'].source.displayName;
                                let formattedTooltip: string;
                                formattedTooltip = formatter.format(Math.round(yAxis1SortedValues[iLoop] * 100) / 100);
                                tooltipItem2.value = formattedTooltip;
                                tooltipInfo.push(tooltipItem2);

                                value = Math.round(yAxis1SortedValues[iLoop] * 100) / 100;
                                viewModel[0].values.push({ values: [] });
                                viewModel[0].values[iLoop].values.push(value);
                                if (yvalueIndex !== undefined) {
                                    value = yAxis2SortedValues[iLoop];
                                    viewModel[0].values[iLoop].values.push(value);
                                }
                                viewModel[iLoop].toolTipInfo = tooltipInfo;

                                // tslint:disable-next-line:no-any
                                let x: any;
                                x = viewModel[0].values[iLoop];
                                x.toolTipInfo = tooltipInfo;

                            }

                            let colorPalette: IColorPalette;
                            colorPalette = host.colorPalette;
                            // create object for colors
                            let colorObj : {};
                            colorObj = {};
                            for (let i: number = 0; i < catLength; i++) {
                                let currentElement: string;
                                currentElement = categoryColumn.values[i].toString();
                                let defaultColor: Fill;
                                defaultColor = {
                                    solid: {
                                        color: colorPalette.getColor(currentElement).value
                                    }
                                };
                                colorObj[currentElement] = getCategoricalObjectValue<Fill>(
                                    categoryColumn, i, 'dataPoint', 'fill', defaultColor).solid.color;
                            }
                            for (let iLoop: number = 0; iLoop < catLength; iLoop++) {
                                for (let unLoop : number = 0; unLoop < catLength; unLoop++) {
                                    if (unsortcategoriesvalues[unLoop] === xAxisSortedValues[iLoop]) {
                                        objects = categoryColumn.objects && categoryColumn.objects[unLoop];
                                        // tslint:disable-next-line:no-any
                                        let dataPointObject : any;
                                        if (objects) {
                                            dataPointObject = categoryColumn.objects[unLoop];
                                        }
                                        // tslint:disable-next-line:no-any
                                        let color : any;
                                        //checks whether any of the color is changed from format pane
                                        if (objects && dataPointObject
                                            && dataPointObject.dataPoint &&
                                            dataPointObject.dataPoint.fill && dataPointObject.dataPoint.fill.solid.color) {
                                            color = { value: dataPointObject.dataPoint.fill.solid.color };
                                        } else {
                                            let currentElement: string;
                                            // tslint:disable-next-line:no-any
                                            const colorPlt: any = colorPalette;
                                            currentElement = categoryColumn.values[iLoop].toString();
                                            color = colorPlt.colorPalette[currentElement];
                                        }
                                        unsortindex = unLoop;
                                        let categorySelectionId : SelectionId;
                                        categorySelectionId = host.createSelectionIdBuilder()
                                            .withCategory(unsortcategories, unsortindex)
                                            .createSelectionId();
                                        viewModel[iLoop].identity = categorySelectionId;
                                        viewModel[0].categories[iLoop].identity = categorySelectionId;
                                        viewModel[0].categories[iLoop].color = color;
                                        break;
                                    }
                                }
                            }
                            viewModel[0].count = catLength;
                        }
                    }
                }
            }

            return viewModel;
        }

        public static getDecimalPlacesCount(value: number): number {
            let decimalPlaces: number = 0;
            let splitArr: string[];
            splitArr = value ? value.toString().split('.') : [];
            if (splitArr[1]) {
                decimalPlaces = splitArr[1].length;
            }

            return decimalPlaces;
        }

        // tslint:disable-next-line:no-any
        private static getTooltipData(value : any): VisualTooltipDataItem[] {
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
        public update(options: VisualUpdateOptions) : void {
            let host: IVisualHost;
            host = this.host;
            if (!options.dataViews || (options.dataViews.length < 1) || !options.dataViews[0] || !options.dataViews[0].categorical) {
                return;
            }

            let dataView : DataView ;
            dataView = this.dataView = options.dataViews[0];
            let ymax: number;
            let ytot: number = 0;
            let precisionValue: number = 0;
            let displayunitValue: number = 0;
            let displayunitValue2: number = 0;
            let maxLabel: number = 0;
            // tslint:disable-next-line:no-any
            let yarr: any;
            yarr = [];
            let index: number = 0;
            // tslint:disable-next-line:no-any
            let percentageVal: any;
            percentageVal = [];
            let legendpos: number = 0;
            // tslint:disable-next-line:no-any
            let labelSettings: any;
            labelSettings = null;
            // tslint:disable-next-line:no-any
            let sKMBValueY1Axis: any;
            // tslint:disable-next-line:no-any
            let sKMBValueY2Axis: any;
            let displayValue: string;
            let title: string = '';
            let dimension: string;
            // tslint:disable-next-line:no-any
            let color: any;
            let fontsize : number;
            // tslint:disable-next-line:no-any
            let titlecolor: any;
            let titlefontsize: number;
            // tslint:disable-next-line:no-any
            let titlebgcolor: any;
            // tslint:disable-next-line:no-any
            let titleText: any;
            // tslint:disable-next-line:no-any
            let tooltiptext: any;
            let funnelTitleOnOffStatus: boolean;
            let defaultText: d3.Selection<SVGElement>;
            let parentDiv: d3.Selection<SVGElement>;
            let showDefaultText: number;
            let viewport: IViewport;
            // tslint:disable-next-line:no-any
            let dataPoints : any;
            let catLength: number;
            let parentWidth: number;
            let parentHeight: number;
            let width: number;
            let height: number;
            let element: d3.Selection<SVGElement>;
            let classname: string;
            let legendvalue: d3.Selection<SVGElement>;
            let oddsvg: d3.Selection<SVGElement>;
            let y: number;
            let val: number = 1;
            let evensvg: d3.Selection<SVGElement>;
            // tslint:disable-next-line:no-any
            let selection : any;
            let nextyheight: number;
            let prevyheight: number;
            // tslint:disable-next-line:no-any
            let areafillheight: any;
            areafillheight = [];
            let visualHeight: number;
            let titleHeight: number;
            let textHeight: number;
            let titlemargin: number;

            this.cardFormatSetting = this.getDefaultFormatSettings();
            defaultText = this.root.select('.hf_defaultText');
            let dataViewMetadata: DataViewMetadata;
            dataViewMetadata = dataView.metadata;
            // tslint:disable-next-line:no-any
            let defaultDataPointColor: any;
            if (dataViewMetadata) {
                let objects: DataViewObjects;
                objects = dataViewMetadata.objects;
                if (objects) {
                    const labelString : string = 'labels';
                    labelSettings = this.cardFormatSetting.labelSettings;
                    labelSettings.labelColor = DataViewObjects.getFillColor(objects, cardProps.labels.color, labelSettings.labelColor);
                    labelSettings.precision = DataViewObjects.getValue(objects, cardProps.labels.labelPrecision, labelSettings.precision);
                    // The precision can't go below 0
                    if (labelSettings.precision) {
                        labelSettings.precision = (labelSettings.precision >= 0) ?
                            ((labelSettings.precision <= 4) ? labelSettings.precision : 4) : 0;
                        precisionValue = labelSettings.precision;
                    }
                    defaultDataPointColor = DataViewObjects.getFillColor(objects, horizontalFunnelProps.dataPoint.defaultColor);
                    labelSettings.displayUnits = DataViewObjects.getValue(
                        objects, cardProps.labels.labelDisplayUnits, labelSettings.displayUnits);
                    let labelsObj: DataLabelObject;
                    labelsObj = <DataLabelObject>dataView.metadata.objects[labelString];
                    dataLabelUtils.updateLabelSettingsFromLabelsObject(labelsObj, labelSettings);
                }
            }
            let showLegendProp: IShowLegendSettings;
            showLegendProp = this.getLegendSettings(this.dataView);
            let funnelTitleSettings: IFunnelTitle;
            funnelTitleSettings = this.getFunnelTitleSettings(this.dataView);
            let showConnectorsProp : IShowConnectorsSettings;
            showConnectorsProp = this.getConnectorsSettings(this.dataView);
            let props : utils.chart.dataLabel.VisualDataLabelsSettings;
            props = dataLabelUtils.getDefaultColumnLabelSettings(false);
            let dataLabelSettings: ILabelSettings;
            dataLabelSettings = this.getDataLabelSettings(this.dataView);
            let sortSettings: ISortSettings;
            sortSettings = this.getSortSettings(this.dataView);
            this.defaultDataPointColor = defaultDataPointColor;
            viewport = options.viewport;
            this.root.selectAll('div').remove();
            dataPoints = HorizontalFunnel.converter(dataView, horizontalFunnelProps.cPalette,
                                                    sortSettings.sortBy, sortSettings.orderBy, this.host);
            this.viewModel = dataPoints[0];
            catLength = this.viewModel.categories.length;
            parentWidth = viewport.width;
            parentHeight = viewport.height;
            width = parentWidth / (1.4 * catLength);
            if (!showConnectorsProp.show) {
                width = width + (((width / 4) * (catLength - 1)) / catLength);
            }

            //changed now
            if (parentHeight >= 65) {
                visualHeight = parentHeight - 65 + 40;
            } else {
                visualHeight = 65 - parentHeight;
            }

            //find max y value
            for (let iLoop : number = 0; iLoop < this.viewModel.categories.length; iLoop++) {
                yarr.push(this.viewModel.values[iLoop].values[0]);
                ytot += this.viewModel.values[iLoop].values[0];
                ymax = Math.max.apply(Math, yarr);
            }
            funnelTitleOnOffStatus = funnelTitleSettings.show;
            titleText = funnelTitleSettings.titleText;
            tooltiptext = funnelTitleSettings.tooltipText;
            titlefontsize = funnelTitleSettings.fontSize;
            if (!titlefontsize) {
                titlefontsize = 12;
            }
            if (funnelTitleOnOffStatus && (titleText || tooltiptext)) {
                let titleTextProperties: TextProperties;
                titleTextProperties = {
                    fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                    fontSize: `${titlefontsize}pt`,
                    text: titleText.toString()
                };
                titleHeight = TextMeasurementService.measureSvgTextHeight(titleTextProperties);
            } else {
                titleHeight = 0;
            }

            fontsize = dataLabelSettings.fontSize;
            let textProperties: TextProperties = {
                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                fontSize: `${fontsize}pt`,
                text: 'MAQ Software'
            };
            textHeight = TextMeasurementService.measureSvgTextHeight(textProperties);
            let totalTextHeight: number;
            totalTextHeight = titleHeight + textHeight * 2;
            if (totalTextHeight > visualHeight) {
                height = totalTextHeight - (visualHeight);
            } else {
                height = visualHeight - (totalTextHeight);
            }
            if (!this.viewModel.secondaryColumn) {
                height += (1.4 * fontsize);
            }
            titlemargin = titleHeight;
            if (titleHeight !== 0) {
                this.root.append('div')
                    .style({
                        height: `${titleHeight}px`,
                        width: '100%'
                    })
                    .classed('hf_Title_Div', true);
                this.root.select('.hf_Title_Div')
                    .append('div')
                    .style({
                        width: '100%'
                    })
                    .classed('hf_Title_Div_Text', true);
                this.root.select('.hf_Title_Div_Text').classed('hf_title', true).style({ display: 'inline-block' });
                this.root.select('.hf_Title_Div_Text').classed('hf_title', true).style({ display: 'inline-block' });
            }
            this.root.append('div')
                .style({
                    width: `${parentWidth}px`,
                    height: `${height + 60}px`,
                    'margin-bottom': '5px'
                })
                .classed('hf_parentdiv', true);
            element = this.root.select('.hf_parentdiv')
                .append('div').classed('hf_svg hf_parentElement', true);
            parentDiv = this.root.select('.hf_parentdiv');
            showDefaultText = 1;
            if (dataView && dataView.categorical && dataView.categorical.values) {
                for (let i: number = 0; i < dataView.categorical.values.length; i++) {
                    if (dataView.categorical.values[i].source.roles
                        && dataView.categorical.values[i].source.roles.hasOwnProperty('primaryMeasure')) {
                        showDefaultText = 0;
                    }
                }
            }
            if (!dataView.categorical.categories || 1 === showDefaultText) {
                let message: string;
                message = 'Please select "Series" and "Primary Measure" values';
                parentDiv
                    .append('div')
                    .text(message)
                    .attr('title', message)
                    .classed('hf_defaultText', true)
                    .style({
                        top: `${height / 2.5}px`
                    });
            }
            if (labelSettings !== undefined && labelSettings !== null) {
                displayunitValue = (labelSettings.displayUnits ? labelSettings.displayUnits : 0);
                displayunitValue2 = (labelSettings.displayUnits ? labelSettings.displayUnits : 0);
                color = labelSettings.labelColor;
                fontsize = labelSettings.fontSize;
            }

            titlecolor = funnelTitleSettings.color;

            titlebgcolor = funnelTitleSettings.bkColor;
            if (titleHeight !== 0) {
                let totalWidth: number;
                totalWidth = viewport.width;
                let textProps: TextProperties;
                textProps = {
                    text: ' (?)',
                    fontFamily: 'Segoe UI',
                    fontSize: `${titlefontsize}pt`
                };
                let occupiedWidth: number;
                occupiedWidth = TextMeasurementService.measureSvgTextWidth(textProps);
                const maxWidth : string = `${totalWidth - occupiedWidth}px`;
                if (!titleText) {
                    let titleDiv: d3.Selection<SVGElement>;
                    titleDiv = this.root.select('.hf_Title_Div_Text');
                    titleDiv
                        .append('div')
                        .classed('hf_Title_Div_Text_Span', true)
                        .style({
                            'max-width': maxWidth,
                            display: 'inline-block',
                            visibility: 'hidden'
                        })
                        .text('.');

                    titleDiv
                        .append('span')
                        .classed('hf_infoImage hf_icon', true)
                        .style({
                            width: '2%',
                            display: 'inline-block',
                            position: 'absolute',
                            'margin-left': '3px'
                        })
                        .text('(?)')
                        .attr('title', tooltiptext);
                } else {
                    let titleTextDiv : d3.Selection<SVGElement>;
                    titleTextDiv = this.root.select('.hf_Title_Div_Text');

                    titleTextDiv
                        .append('div')
                        .classed('hf_Title_Div_Text_Span', true)
                        .style({
                            'max-width': maxWidth,
                            display: 'inline-block'
                        })
                        .text(titleText.toString())
                        .attr('title', titleText.toString());

                    titleTextDiv
                        .append('span')
                        .classed('hf_infoImage hf_icon', true)
                        .text(' (?)')
                        .style({
                            width: '2%',
                            display: 'inline-block',
                            position: 'absolute',
                            'margin-left': '3px'
                        })
                        .attr('title', tooltiptext);
                }
                if (!tooltiptext) {
                    this.root.select('.hf_infoImage').style({
                        display: 'none'
                    });
                } else {
                    this.root.select('.hf_infoImage').attr('title', tooltiptext);
                }

                if (titlecolor) {
                    this.root.select('.hf_Title_Div').style({
                        color: titlecolor,
                        'font-size': `${titlefontsize}pt`
                    });
                } else {
                    this.root.select('.hf_Title_Div').style({
                        color: '#333333',
                        'font-size': `${titlefontsize}pt`
                    });
                }

                if (titlebgcolor) {
                    this.root.select('.hf_Title_Div').style({ 'background-color': titlebgcolor });
                    this.root.select('.hf_Title_Div_Text').style({ 'background-color': titlebgcolor });
                    this.root.select('.hf_infoImage').style({ 'background-color': titlebgcolor });
                } else {
                    this.root.select('.hf_Title_Div').style({ 'background-color': 'none' });
                }

                if (funnelTitleOnOffStatus) {
                    this.root.select('.hf_Title_Div').classed('hf_show_inline', true);
                } else {
                    this.root.select('.hf_Title_Div').classed('hf_hide', true);
                }
            }
            if (showLegendProp.show) {
                element
                    .style({
                        'vertical-align': 'top',
                        width: `${(parentWidth - width) / (1.8 * catLength)}px`
                    });
                element
                    .append('div')
                    .style({
                        color: color,
                        width: `${(parentWidth - width) / (1.8 * catLength)}px`,
                        'font-size': `${fontsize}px`,
                        visibility: 'hidden'
                    })
                    .classed('hf_legend_item', true)
                    .text('s');

                let textSize : number = parseInt(fontsize.toString(), 10);

                let length : number = ((textSize * (this.viewModel.primaryColumn.length)) /
                ((parentWidth - width) / (1.8 * catLength))) * 100;
                // ellipses for overflow text
                textProperties = {
                    text: this.viewModel.primaryColumn,
                    fontFamily: 'sans-serif',
                    fontSize: `${fontsize}px`
                };

                let availableWidth: number;
                availableWidth = (parentWidth - width) / (1.8 * catLength);
                let primaryColumn: string;
                primaryColumn = TextMeasurementService.getTailoredTextOrDefault(textProperties, availableWidth);

                if (availableWidth < 60 || height < 100) {
                    element
                        .append('div')
                        .style({
                            overflow: 'hidden',
                            position: 'absolute',
                            'font-size': `${fontsize}px`,
                            color: color,
                            width: `${availableWidth}px`,
                            'padding-right': '10px',
                            'margin-left': '0',
                            'word-break': 'keep-all'
                        })
                        .attr({
                            title: this.viewModel.primaryColumn
                        })
                        .text(this.trimString(primaryColumn, availableWidth / textSize))
                        .classed('hf_primary_measure', true);
                } else {
                    element
                        .append('div')
                        .style({
                            overflow: 'hidden',
                            color: color,
                            'font-size': `${fontsize}px`,
                            position: 'absolute',
                            width: `${availableWidth}px`,
                            'padding-right': '10px',
                            'word-break': 'keep-all'
                        })
                        .classed('hf_primary_measure', true)
                        .attr({ title: this.viewModel.primaryColumn })
                        .text(this.viewModel.primaryColumn);
                }
                if (catLength > 0) {
                    element
                        .append('svg')
                        .attr({
                            height: height,
                            width: (parentWidth - width) / (1.8 * catLength),
                            fill: 'white'
                        });
                }
                if (this.viewModel.secondaryColumn !== '') {
                    //ellipses for overflow text
                    textProperties = {
                        text: this.viewModel.secondaryColumn,
                        fontFamily: 'sans-serif',
                        fontSize: `${fontsize}px`
                    };

                    let secondaryColumn: string;
                    secondaryColumn = TextMeasurementService.getTailoredTextOrDefault(
                        textProperties, (parentWidth - width) / (1.8 * catLength));
                    element
                        .append('div')
                        .style({
                            color: color,
                            width: `${(parentWidth - width) / (1.8 * catLength)}px`,
                            'font-size': `${fontsize}px`,
                            visibility: 'hidden'
                        })
                        .classed('hf_legend_item', true)
                        .text('s');

                    textSize = parseInt(fontsize.toString(), 10);
                    //check whether text fits or append ellipses
                    length = ((textSize * (this.viewModel.secondaryColumn.length)) / ((parentWidth - width) / (1.8 * catLength))) * 100;
                    if ((((parentWidth - width) / (1.8 * catLength)) < 60) || (height < 100)) {
                        element.append('div')
                            .style({
                                overflow: 'hidden',
                                position: 'absolute',
                                'font-size': `${fontsize}px`,
                                color: color,
                                width: `${(parentWidth - width) / (1.8 * catLength)}px`,
                                'padding-right': '10px',
                                //'padding-left': '3px',
                                'margin-top': '5px',
                                'margin-left': '0',
                                'word-break': 'keep-all',
                                'white-space': 'normal'
                            })
                            .attr({ title: this.viewModel.secondaryColumn })
                            .text(this.trimString(secondaryColumn, ((parentWidth - width) / (1.8 * catLength)) / textSize))
                            .classed('hf_yaxis2', true);
                    } else {
                        element.append('div')
                            .style({
                                overflow: 'hidden',
                                position: 'absolute',
                                'font-size': `${fontsize}px`,
                                color: color,
                                width: `${(parentWidth - width) / (1.8 * catLength)}px`,
                                'padding-right': '10px',
                                'margin-left': '0',
                                'margin-top': '5px',
                                'word-break': 'keep-all',
                                'white-space': 'normal'
                            })
                            .attr({ title: this.viewModel.secondaryColumn })
                            .text(secondaryColumn).classed('hf_yaxis2', true);
                    }
                }
            }

            for (let i: number = 0; i < (2 * catLength - 1); i++) {
                if (!showLegendProp.show) {
                    let constantMultiplier: number = 1;
                    if (catLength > 0) {
                        constantMultiplier = 4 / (5 * catLength - 1); // dividing the available space into equal parts
                    }
                    width = (parentWidth - 10) * constantMultiplier; // remove 10 from total width as 10 is x displacement
                    if (!showConnectorsProp.show) {
                        width = (parentWidth - 10) / catLength;
                    }
                }
                element = this.root.select('.hf_parentdiv')
                    .append('div')
                    .style({
                        height: `${height}px`
                    })
                    .classed('hf_svg hf_parentElement', true);
                if (i % 2 === 0) {
                    classname = `hf_odd${i}`;
                    element
                        .append('div')
                        .style({
                            color: color,
                            'font-size': `${fontsize}px`,
                            width: `${(0.92 * width)}px`
                        })
                        .classed(`hf_legend_item${i} hf_xAxisLabels`, true)
                        .classed('hf_legend', true);
                    element.append('div')
                        .style({
                            color: color,
                            'font-size': `${fontsize}px`,
                            width: `${0.92 * width}px`
                        })
                        .classed(`hf_legend_value1${i}`, true)
                        .classed('hf_legend', true);
                    let displacement: number;
                    displacement = i === 0 ? 0 : 10;
                    element
                        .append('svg')
                        .attr({
                            id: i,
                            height: height,
                            width: width,
                            fill: '#FAFAFA',
                            overflow: 'hidden'
                        }).classed(classname, true)
                        .append('rect')
                        .attr({
                            x: 10,
                            y: 0,
                            height: height,
                            width: width
                        });
                    if (this.viewModel.secondaryColumn) {
                        element.append('div')
                            .style({
                                color: color,
                                width: `${0.92 * width}px`
                            })
                            .classed(`hf_legend_value2${i}`, true)
                            .style({ 'font-size': `${fontsize}px` })
                            .classed('hf_yaxis2', true);
                    }
                } else {
                    classname = `hf_even${i}`;
                    let disp: number;
                    disp = 10;
                    if (showConnectorsProp.show) {
                        element
                            .append('svg')
                            .attr({
                                id: i,
                                height: height,
                                width: width / 4,
                                fill: '#FAFAFA',
                                overflow: 'hidden'
                            })
                            .classed(classname, true)
                            .append('rect')
                            .attr({
                                x: disp,
                                y: 0,
                                height: height,
                                width: width / 4
                            });
                    }
                }
            }
            for (let i: number = 0; i < this.viewModel.categories.length; i++) {
                if (this.viewModel.values[i].values[0] === null || this.viewModel.values[i].values[0] === 0) {
                    percentageVal.push(-1);
                } else {
                    if (ymax - this.viewModel.values[i].values[0] > 0) {
                        percentageVal.push(((this.viewModel.values[i].values[0] * 100) / ymax).toFixed(2));
                    } else {
                        percentageVal.push(0);
                    }
                }
                legendvalue = this.root.select(`.hf_legend_item${legendpos}`);
                if (this.viewModel.categories[i].value !== null) {
                    title = dataPoints[i].toolTipInfo[0].value;
                    legendvalue.attr({ title: title }).text(title);
                } else {
                    legendvalue.attr({ title: '(Blank)' }).text('(Blank)');
                }
                if (this.viewModel.values[i].values[0] !== null) {
                    title = String(dataPoints[i].toolTipInfo[1].value);
                    precisionValue = precisionValue;
                    if (displayunitValue === 0) {    //auto option selected then
                        maxLabel = 0;
                        for (let j: number = 0; j < this.viewModel.values.length; j++) {
                            if (maxLabel < this.viewModel.values[j].values[0]) {
                                maxLabel = this.viewModel.values[j].values[0];
                            }
                        }
                        if (maxLabel > 1000000000000) {
                            displayunitValue = 1000000000000;
                        } else if (maxLabel > 1000000000) {
                            displayunitValue = 1000000000;
                        } else if (maxLabel > 1000000) {
                            displayunitValue = 1000000;
                        } else if (maxLabel > 1000) {
                            displayunitValue = 1000;
                        } else {
                            displayunitValue = 1;
                        }
                    }
                    sKMBValueY1Axis = this.format(
                        this.viewModel.values[i].values[0],
                        displayunitValue, precisionValue, this.dataView.categorical.values[0].source.format);
                    let decimalPlaces : number;
                    decimalPlaces = HorizontalFunnel.getDecimalPlacesCount(this.viewModel.values[i].values[0]);
                    // tooltip values
                    let sKMBValueY1AxisTooltip: string;
                    sKMBValueY1AxisTooltip = this.format(
                        this.viewModel.values[i].values[0],
                        1, decimalPlaces,
                        this.dataView.categorical.values[0].source.format);

                    displayValue = sKMBValueY1Axis;

                    //ellipses for overflow text
                    textProperties = {
                        text: displayValue,
                        fontFamily: 'sans-serif',
                        fontSize: `${fontsize}px`
                    };

                    displayValue = TextMeasurementService.getTailoredTextOrDefault(textProperties, width);
                    this.root.select(`.hf_legend_value1${legendpos}`).attr({
                        title: sKMBValueY1AxisTooltip
                    }).text(displayValue);
                } else {
                    displayValue = '(Blank)';
                    title = '(Blank)';
                    this.root.select(`.hf_legend_value1${legendpos}`)
                        .attr({
                            title: title
                        })
                        .text(this.trimString(title, width / 10));
                }
                if (this.viewModel.values[i].values.length > 1) {
                    let sKMBValueY2AxisTooltip : string;
                    if (this.viewModel.values[i].values[1] !== null) {
                        //let PM = [];
                        if (displayunitValue2 === 0) { //auto option selected then
                            maxLabel = 0;
                            for (let j: number = 0; j < this.viewModel.values.length; j++) {
                                if (maxLabel < this.viewModel.values[j].values[1]) {
                                    maxLabel = this.viewModel.values[j].values[1];
                                }
                            }
                            if (maxLabel > 1000000000000) {
                                displayunitValue2 = 1000000000000;
                            } else if (maxLabel > 1000000000) {
                                displayunitValue2 = 1000000000;
                            } else if (maxLabel > 1000000) {
                                displayunitValue2 = 1000000;
                            } else if (maxLabel > 1000) {
                                displayunitValue2 = 1000;
                            } else {
                                displayunitValue2 = 1;
                            }
                        }
                        sKMBValueY2Axis = this.format(
                            this.viewModel.values[i].values[1],
                            displayunitValue2, precisionValue, this.dataView.categorical.values[1].source.format);
                        let decimalPlaces: number;
                        decimalPlaces = HorizontalFunnel.getDecimalPlacesCount(this.viewModel.values[i].values[1]);
                        sKMBValueY2AxisTooltip = this.format(
                            this.viewModel.values[i].values[1], 1,
                            decimalPlaces, this.dataView.categorical.values[1].source.format);
                        if (dataPoints[i].toolTipInfo.length === 3) { // series,y1 and y2
                            title = dataPoints[i].toolTipInfo[2].value;
                            precisionValue = labelSettings.precision;
                            displayValue = sKMBValueY2Axis;
                        } else {
                            title = dataPoints[i].toolTipInfo[1].value;
                            precisionValue = precisionValue;
                            displayValue = sKMBValueY2Axis;
                        }
                        // ellipses for overflow text
                        textProperties = {
                            text: displayValue,
                            fontFamily: 'sans-serif',
                            fontSize: `${fontsize}px`
                        };

                        displayValue = TextMeasurementService.getTailoredTextOrDefault(textProperties, width);
                        this.root.select(`.hf_legend_value2${legendpos}`)
                            .attr({ title: sKMBValueY2AxisTooltip })
                            .text(displayValue);
                    } else {
                        displayValue = '(Blank)';
                        title = '(Blank)';
                        this.root.select(`.hf_legend_value2${legendpos}`)
                            .attr({ title: title })
                            .text(this.trimString(title, width / 10));
                    }

                }
                legendpos += 2;
            }

            for (let i: number = 0; i < (2 * catLength - 1); i++) {
                if (i % 2 === 0) {
                    classname = `hf_odd${i}`;
                    oddsvg = this.root.select(`.${classname}`);
                    if (percentageVal[index] !== 0 && percentageVal[index] !== -1) {
                        percentageVal[index] = parseFloat(percentageVal[index]);
                        y = 0;
                        y = ((height - (percentageVal[index] * height / 100)) / 2);
                        areafillheight.push(percentageVal[index] * height / 100);
                        let disp: number;
                        disp = 10;
                        oddsvg.append('rect')
                            .attr({
                                x: disp,
                                y: y,
                                height: areafillheight[index],
                                width: width
                            }).classed('hf_datapoint hf_dataColor', true);
                    } else {
                        let disp: number;
                        disp = 10;
                        if (percentageVal[index] === 0) {
                            oddsvg.append('rect')
                                .attr({
                                    x: disp,
                                    y: 0,
                                    height: height,
                                    width: width
                                }).classed('hf_datapoint hf_dataColor', true);
                        } else if (percentageVal[index] === -1) {
                            // showing dotted line if there is no data
                            y = ((height - (percentageVal[index] * height / 100)) / 2);
                            oddsvg.append('line')
                                .attr({
                                    x1: disp,
                                    y1: y,
                                    x2: width,
                                    y2: y,
                                    'stroke-width': 1
                                }).classed('hf_datapoint hf_dataColor', true)
                                .style('stroke-dasharray', '1,2');
                        }
                        areafillheight.push(0);
                    }
                    index++;
                }
            }
            let svgElement: d3.Selection<SVGAElement>;
            svgElement = d3.selectAll('.hf_datapoint.hf_dataColor');
            for (let i: number = 0; i < (catLength); i++) {
                svgElement[0][i]['cust-tooltip'] = this.viewModel.values[i].toolTipInfo;
            }
            for (let i: number = 0; i < percentageVal.length; i++) {
                let polygonColor : string;
                if (this.defaultDataPointColor) {
                    polygonColor = this.defaultDataPointColor;
                } else {
                    polygonColor = this.ColorLuminance(this.viewModel.categories[i].color.value);
                }
                classname = `.hf_even${val}`;
                evensvg = this.root.select(classname);
                if (percentageVal[i] === 0 && percentageVal[i + 1] === 0) {
                    evensvg.append('rect')
                        .attr({
                            x: 10,
                            y: 0,
                            height: height,
                            width: width / 4,
                            fill: polygonColor
                        });
                } else {
                    prevyheight = (height - areafillheight[i]) / 2;
                    nextyheight = (height - areafillheight[i + 1]) / 2;
                    let disp: number;
                    disp = 10;
                    if (percentageVal[i] && percentageVal[i + 1]) {
                        dimension = `${disp},${prevyheight} ${disp},${areafillheight[i] + prevyheight} ` +
                            `${width / 4},${areafillheight[i + 1] + nextyheight} ${width / 4},${nextyheight}`;
                    } else if (percentageVal[i] && !(percentageVal[i + 1])) {
                        dimension = `${disp},${prevyheight} ${disp},${areafillheight[i] + prevyheight} ` +
                            `${width / 4},${height} ${width / 4},0`;
                    } else if (!(percentageVal[i]) && percentageVal[i + 1]) {
                        dimension = `${disp},0 ${disp},${height} ${width / 4},${areafillheight[i + 1] + nextyheight} ` +
                            `${width / 4},${nextyheight}`;
                    }
                    evensvg
                        .append('polygon')
                        .attr('points', dimension)
                        .attr({ fill: polygonColor });
                }
                val += 2;
            }
            this.root.selectAll('.fillcolor').style('fill', (d: {}, i : number) => this.colors[i + 1].value);

            this.root.selectAll('.hf_dataColor').style('fill', (d: {}, i : number) => this.viewModel.categories[i].color.value);
            // This is for the dotted line
            this.root.selectAll('.hf_dataColor').style('stroke', (d: {}, i: number) => this.viewModel.categories[i].color.value);
            selection = this.root.selectAll('.hf_datapoint')
                .data(dataPoints, (d: {}, idx: number) => (dataPoints[idx] === 0) ? String(idx) : String(idx + 1));
            // tslint:disable-next-line:no-any
            let viewModel : any;
            viewModel = this.viewModel;
            this.tooltipServiceWrapper.addTooltip(
                d3.selectAll('.hf_datapoint'),
                (tooltipEvent: TooltipEventArgs<number>) => {
                    return tooltipEvent.context['cust-tooltip'];
                },
                (tooltipEvent: TooltipEventArgs<number>) => null, true);
            this.setSelectHandler(selection);
        }

        public getDefaultLegendSettings(): IShowLegendSettings {

            return {
                show: false
            };
        }

        public getLegendSettings(dataView: DataView): IShowLegendSettings {
            let objects: DataViewObjects = null;
            let legendSetting: IShowLegendSettings;
            legendSetting = this.getDefaultLegendSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return legendSetting;
            }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            const legendProperties : any = horizontalFunnelProps;
            legendSetting.show = DataViewObjects.getValue(objects, legendProperties.ShowLegend.show, legendSetting.show);

            return legendSetting;

        }

        public getDefaultConnectorsSettings(): IShowConnectorsSettings {
            return {
                show: true
            };
        }

        public getConnectorsSettings(dataView: DataView): IShowConnectorsSettings {
            let objects: DataViewObjects = null;
            let connectorsSetting: IShowConnectorsSettings;
            connectorsSetting = this.getDefaultConnectorsSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return connectorsSetting;
            }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            const showConnectorsProps : any = horizontalFunnelProps;
            connectorsSetting.show = DataViewObjects.getValue(objects, showConnectorsProps.ShowConnectors.show, connectorsSetting.show);

            return connectorsSetting;

        }

        public getDefaultDataLabelSettings(): ILabelSettings {
            return {
                color: '#333333',
                displayUnits: 0,
                decimalPlaces: 0,
                fontSize: 12
            };
        }

        public getDataLabelSettings(dataView: DataView): ILabelSettings {

            let objects: DataViewObjects = null;
            let dataLabelSetting: ILabelSettings;
            dataLabelSetting = this.getDefaultDataLabelSettings();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return dataLabelSetting;
            }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            const labelProperties : any = horizontalFunnelProps.LabelSettings;
            dataLabelSetting.color = DataViewObjects.getFillColor(objects, labelProperties.color, dataLabelSetting.color);
            dataLabelSetting.displayUnits = DataViewObjects.getValue(
                objects, labelProperties.labelDisplayUnits, dataLabelSetting.displayUnits);
            dataLabelSetting.decimalPlaces = DataViewObjects.getValue(
                objects, labelProperties.labelPrecision, dataLabelSetting.decimalPlaces);
            dataLabelSetting.decimalPlaces = dataLabelSetting.decimalPlaces < 0 ?
                0 : dataLabelSetting.decimalPlaces > 4 ? 4 : dataLabelSetting.decimalPlaces;
            dataLabelSetting.fontSize = DataViewObjects.getValue(objects, labelProperties.fontSize, dataLabelSetting.fontSize);

            return dataLabelSetting;
        }

        public getDefaultFunnelTitleSettings(dataView: DataView): IFunnelTitle {
            let titleText: string = '';
            if (dataView
                && dataView.categorical
                && dataView.categorical.categories
                && dataView.categorical.categories[0]
                && dataView.categorical.categories[0].source
                && dataView.categorical.categories[0].source.displayName
                && dataView.categorical.values
                && dataView.categorical.values[0]
                && dataView.categorical.values[0].source
                && dataView.categorical.values[0].source.displayName) {
                const measureName: string = dataView.categorical.values[0].source.displayName;
                const catName : string = dataView.categorical.categories[0].source.displayName;
                titleText = `${measureName} by ${catName} `;
            }

            return {
                show: true,
                titleText: titleText,
                tooltipText: 'Your tooltip text goes here',
                color: '#333333',
                bkColor: '#fff',
                fontSize: 12
            };
        }

        public getFunnelTitleSettings(dataView: DataView): IFunnelTitle {
            let objects: DataViewObjects = null;
            let fTitleSettings: IFunnelTitle;
            fTitleSettings = this.getDefaultFunnelTitleSettings(dataView);
            if (!dataView.metadata || !dataView.metadata.objects) {
                return fTitleSettings;
            }

            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            const titleProps : any = horizontalFunnelProps.funnelTitle;
            fTitleSettings.show = DataViewObjects.getValue(objects, titleProps.show, fTitleSettings.show);
            fTitleSettings.titleText = DataViewObjects.getValue(objects, titleProps.titleText, fTitleSettings.titleText);
            fTitleSettings.tooltipText = DataViewObjects.getValue(objects, titleProps.tooltipText, fTitleSettings.tooltipText);
            fTitleSettings.color = DataViewObjects.getFillColor(objects, titleProps.titleFill, fTitleSettings.color);
            fTitleSettings.bkColor = DataViewObjects.getFillColor(objects, titleProps.titleBackgroundColor, fTitleSettings.bkColor);
            fTitleSettings.fontSize = DataViewObjects.getValue(objects, titleProps.titleFontSize, fTitleSettings.fontSize);

            return fTitleSettings;
        }

        public getDefaultSortSettings(): ISortSettings {
            return {
                sortBy: 'Auto',
                orderBy: 'ascending'
            };
        }

        public getSortSettings(dataView: DataView): ISortSettings {
            let objects: DataViewObjects = null;
            let sortSettings: ISortSettings;
            sortSettings = this.getDefaultSortSettings();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return sortSettings;
            }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            const sortProps : any = horizontalFunnelProps.sort;
            sortSettings.sortBy = DataViewObjects.getValue(objects, sortProps.sortBy, sortSettings.sortBy);
            // Check if Secondary measure exists before selecting it
            // If exists sort by secondary measure, otherwise sort by 'Auto'
            if (sortSettings.sortBy === 'SecondaryMeasure') {
                if (dataView
                    && dataView.categorical
                    && dataView.categorical.values) {
                    let secondaryColumn: boolean = false;
                    for (let iLoop: number = 0; iLoop < dataView.categorical.values.length; iLoop++) {
                        if (dataView.categorical.values[iLoop].source
                            && dataView.categorical.values[iLoop].source.roles
                            && dataView.categorical.values[iLoop].source.roles.hasOwnProperty('secondaryMeasure')) {
                            secondaryColumn = true;
                        }
                    }
                    sortSettings.sortBy = secondaryColumn ? 'SecondaryMeasure' : 'Auto';
                }
            }
            sortSettings.orderBy = DataViewObjects.getValue(objects, sortProps.orderBy, sortSettings.orderBy);

            return sortSettings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let enumeration: VisualObjectInstance[];
            enumeration = [];
            let showLegendSettings: IShowLegendSettings;
            showLegendSettings = this.getLegendSettings(this.dataView);
            let showConnectorsSettings: IShowConnectorsSettings;
            showConnectorsSettings = this.getConnectorsSettings(this.dataView);
            let dataLabelSettings: ILabelSettings;
            dataLabelSettings = this.getDataLabelSettings(this.dataView);
            let funnelTitleSettings: IFunnelTitle;
            funnelTitleSettings = this.getFunnelTitleSettings(this.dataView);
            let sortSettings: ISortSettings;
            sortSettings = this.getSortSettings(this.dataView);

            switch (options.objectName) {
                case 'FunnelTitle':
                    enumeration.push({
                        objectName: 'FunnelTitle',
                        displayName: 'Funnel title',
                        selector: null,
                        properties: {
                            show: funnelTitleSettings.show,
                            titleText: funnelTitleSettings.titleText,
                            tooltipText: funnelTitleSettings.tooltipText,
                            fill1: funnelTitleSettings.color,
                            backgroundColor: funnelTitleSettings.bkColor,
                            fontSize: funnelTitleSettings.fontSize
                        }
                    });
                    break;

                case 'Sort':
                    enumeration.push({
                        objectName: 'Sort',
                        displayName: 'Sort',
                        selector: null,
                        properties: {
                            SortBy: sortSettings.sortBy,
                            OrderBy: sortSettings.orderBy
                        }
                    });
                    break;

                case 'labels':
                    enumeration.push({
                        objectName: options.objectName,
                        properties: {
                            color: dataLabelSettings.color,
                            labelDisplayUnits: dataLabelSettings.displayUnits,
                            labelPrecision: dataLabelSettings.decimalPlaces,
                            fontSize: dataLabelSettings.fontSize
                        },
                        selector: null
                    });
                    break;

                case 'dataPoint':
                    this.enumerateDataPoints(enumeration);
                    break;

                case 'ShowLegend':
                    enumeration.push({
                        objectName: 'ShowLegend',
                        displayName: 'Show Legend',
                        selector: null,
                        properties: {
                            show: showLegendSettings.show
                        }
                    });
                    break;

                case 'ShowConnectors':
                    enumeration.push({
                        objectName: 'ShowConnectors',
                        displayName: 'Show Connectors',
                        selector: null,
                        properties: {
                            show: showConnectorsSettings.show
                        }
                    });
                    break;

                default:
                    break;
            }

            return enumeration;
        }

        public getDefaultFormatSettings(): ICardFormatSetting {
            return {
                showTitle: true,
                textSize: 10,
                labelSettings: this.getDefaultLabelSettings(true, '#333333', undefined, undefined),
                wordWrap: false
            };
        }

        // tslint:disable-next-line:no-any
        public getDefaultLabelSettings(show : any , labelColor: any, labelPrecision : any, format : any):  {
            // tslint:disable-next-line:no-any
            show: any;
            position: number;
            displayUnits: number;
            precision: number;
            labelColor: {};
            formatterOptions: {};
            fontSize: number;
        } {
            //let defaultCountLabelPrecision: number;
            let defaultDecimalLabelPrecision: number;
            defaultDecimalLabelPrecision = 2;
            let defaultLabelColor: string;
            defaultLabelColor = '#333333';
            let precision : number = 0;
            if (precision > 4) {
                precision = 4;
            }
            if (show === void 0) { show = false; }
            if (format) {
                let hasDots: boolean;
                hasDots = true; // powerbi.NumberFormat.getCustomFormatMetadata(format).hasDots;
            }

            return {
                show: show,
                position: 0 /* Above */,
                displayUnits: 0,
                precision: precision,
                labelColor: labelColor || defaultLabelColor,
                formatterOptions: null,
                fontSize: 12
            };
        }

        // This function is to trim numbers if it exceeds number of digits.
        // tslint:disable-next-line:no-any
        public trimString(sValue : any, iNumberOfDigits : number) : string {
            if (null === sValue) {
                return 'null';
            }
            if (sValue.toString().length < iNumberOfDigits) {
                return sValue;
            } else {
                return (`${sValue.toString().substring(0, iNumberOfDigits)}...`);
            }
        }

        private ColorLuminance(hex : string) : string {
            let lum: number = 0.50;
            // validate hex string
            hex = String(hex).replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            lum = lum || 0;

            // convert to decimal and change luminosity
            let rgb: string = '#';
            // tslint:disable-next-line:no-any
            let c : any;
            let i : number;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substr(i * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += (`00${c}`).substr(c.length);
            }

            return rgb;
        }

        private enumerateDataPoints(enumeration: VisualObjectInstance[]) : void {
            // tslint:disable-next-line:no-any
            const data: any = this.viewModel.categories;
            if (!data) {
                return;
            }
            const dataPointsLength : number = data.length;

            const primaryValues : number = this.viewModel.values;
            for (let i: number = 0; i < dataPointsLength; i++) {
                if (primaryValues[i].values[0]) {
                    if (!data[i].color.value) {
                        data[i].color.value = '(Blank)';
                    }
                    enumeration.push({
                        objectName: 'dataPoint',
                        displayName: data[i].value,
                        selector: data[i].identity.getSelector(),
                        properties: {
                            fill: { solid: { color: data[i].color.value } }
                        }
                    });
                }
            }
            enumeration.push({
                objectName: 'dataPoint',
                selector: null,
                properties: {
                    defaultColor: { solid: { color: this.defaultDataPointColor } }
                }
            });
        }

        // This function returns the tool tip text given for the tooltip in the format window
        private getTooltipText(dataView: DataView): IDataLabelSettings {
            const funnelTitleString: string = 'FunnelTitle';
            const tooltipTextString : string = 'tooltipString';
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('FunnelTitle')) {
                    let tooltiptext : DataViewObject;
                    tooltiptext = dataView.metadata.objects[funnelTitleString];
                    if (tooltiptext && tooltiptext.hasOwnProperty(tooltipTextString)) {
                        return <IDataLabelSettings>tooltiptext[tooltipTextString];
                    }
                } else {
                    return <IDataLabelSettings>'Your tooltip text goes here';
                }
            }

            return <IDataLabelSettings>'Your tooltip text goes here';
        }

        // This function is to perform KMB formatting on values.
        private format(d: number, displayunitValue: number, precisionValue: number, format: string) : string {

            let displayUnits: number;
            displayUnits = displayunitValue;
            let primaryFormatterVal: number = 0;
            if (displayUnits === 0) {
                let alternateFormatter: number;
                alternateFormatter = d.toString().length;
                if (alternateFormatter > 9) {
                    primaryFormatterVal = 1e9;
                } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                    primaryFormatterVal = 1e6;
                } else if (alternateFormatter <= 6 && alternateFormatter >= 4) {
                    primaryFormatterVal = 1e3;
                } else {
                    primaryFormatterVal = 10;
                }
            }
            let formatter : IValueFormatter;
            if (format) {
                if (format.indexOf('%') >= 0) {
                    formatter = ValueFormatter.create({

                        precision: precisionValue,
                        format: format
                    });
                } else {
                    formatter = ValueFormatter.create({
                        value: displayUnits === 0 ? primaryFormatterVal : displayUnits,
                        precision: precisionValue,
                        format: format
                    });
                }
            } else {
                formatter = ValueFormatter.create({
                    value: displayUnits === 0 ? primaryFormatterVal : displayUnits,
                    precision: precisionValue
                });
            }

            let formattedValue: string;
            formattedValue = formatter.format(d);

            return formattedValue;
        }

        // tslint:disable-next-line:no-any
        private setSelectHandler(selection : any): void {
            this.setSelection(selection);
            selection.on('click', (data: IFunnelViewModel) => {
                // tslint:disable-next-line:no-any
                let ev: any;
                ev = d3.event;
                this.selectionManager.select(data.identity, ev.ctrlKey).then((selectionIds: SelectionId[]) => {
                    this.setSelection(selection, selectionIds);
                });
                ev.stopPropagation();
            });
            this.root.on('click', () => {
                this.selectionManager.clear();
                this.setSelection(selection);
            });
        }

        // tslint:disable-next-line:no-any
        private setSelection(selection : any, selectionIds?: SelectionId[]): void {
            selection.transition()
                .duration(this.durationAnimations)
                .style('fill-opacity', HorizontalFunnel.maxOpacity);
            if (!selectionIds || !selectionIds.length) {
                return;
            }
            selection
                .filter((selectionData: IFunnelViewModel) => {
                    return !selectionIds.some((selectionId: SelectionId) => { return selectionData.identity === selectionId; });
                })
                .transition()
                .duration(this.durationAnimations)
                .style('fill-opacity', HorizontalFunnel.minOpacity);
        }
    }
}
