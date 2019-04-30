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

// tslint:disable-next-line: no-namespace tslint:disable-next-line: no-internal-module
module powerbi.extensibility.visual {
    // color
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    // tooltip
    import TextMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import ISelectionManager = powerbi.extensibility.ISelectionManager;
    import IVisual = powerbi.extensibility.visual.IVisual;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
    import SelectionManager = powerbi.extensibility.ISelectionManager;
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
    import ISelectionId = powerbi.visuals.ISelectionId;
    import tooltip = powerbi.extensibility.utils.tooltip;
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;
    // tooltip
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    // color
    import IDataColorPalette = powerbi.extensibility.IColorPalette;
    import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;
    // label
    import dataLabelUtils = powerbi.extensibility.utils.chart.dataLabel.utils;
    import DataLabelObject = powerbi.extensibility.utils.chart.dataLabel.DataLabelObject;

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
    const cardProps: any = {
        categoryLabels: {
            color: {
                objectName: "categoryLabels",
                propertyName: "color"} as DataViewObjectPropertyIdentifier,
            fontSize: {
                objectName: "categoryLabels",
                propertyName: "fontSize"} as DataViewObjectPropertyIdentifier,
            show: {
                    objectName: "categoryLabels",
                    propertyName: "show"} as DataViewObjectPropertyIdentifier},
        labels: {
            color: {
                objectName: "labels",
                propertyName: "color"} as DataViewObjectPropertyIdentifier,
            fontSize: {
                    objectName: "labels",
                    propertyName: "fontSize"} as DataViewObjectPropertyIdentifier,
            labelDisplayUnits: {
                        objectName: "labels",
                        propertyName: "labelDisplayUnits"} as DataViewObjectPropertyIdentifier,
            labelPrecision: {
                objectName: "labels",
                propertyName: "labelPrecision"} as DataViewObjectPropertyIdentifier,
        },
        trendlabels: {
            color: {
                objectName: "trendlabels",
                propertyName: "color"} as DataViewObjectPropertyIdentifier,
            fontSize: {
                    objectName: "trendlabels",
                    propertyName: "fontSize"} as DataViewObjectPropertyIdentifier,
            labelDisplayUnits: {
                        objectName: "trendlabels",
                        propertyName: "labelDisplayUnits"} as DataViewObjectPropertyIdentifier,
            labelPrecision: {
                objectName: "trendlabels",
                propertyName: "labelPrecision"} as DataViewObjectPropertyIdentifier,
        },
        wordWrap: {
            show: {
                objectName: "wordWrap",
                propertyName: "show"} as DataViewObjectPropertyIdentifier}};
    interface ITooltipDataPoints {
        name: string;
        value: string;
        formatter: string;
    }

    interface ILabelSettings {
        color: string;
        displayUnits: number;
        decimalPlaces: number;
        fontSize: number;
    }

    interface IFunnelTitle {
        show: boolean;
        titleText: string;
        tooltipText: string;
        color: string;
        bkColor: string;
        fontSize: number;
    }

    interface ISortSettings {
        sortBy: string;
        orderBy: string;
    }
    interface IShowConnectorsSettings {
        show: boolean;
    }
    interface IShowLegendSettings {
        show: boolean;
    }
    interface ICardFormatSetting {
        showTitle: boolean;
        textSize: number;
        labelSettings: any; // VisualDataLabelsSettings;
        wordWrap: boolean;
    }
    interface IFunnelViewModel {
        primaryColumn?: string;
        secondaryColumn?: string;
        count?: number;
        toolTipInfo?: ITooltipDataItem[];
        categories?: ICategoryViewModel[];
        values?: IValueViewModel[];
        identity?: ISelectionId;
    }
    interface ICategoryViewModel {
        value: string;
        color: string;
        identity?: ISelectionId;
    }
    interface IValueViewModel {
        // tslint:disable-next-line:no-any
        values: any;
    }
    // tslint:disable-next-line:no-any
    const horizontalFunnelProps: any = {
        LabelSettings: {
            color: { objectName: "labels", propertyName: "color" } as DataViewObjectPropertyIdentifier,
            fontSize: { objectName: "labels", propertyName: "fontSize" } as DataViewObjectPropertyIdentifier,
            labelDisplayUnits: {
                objectName: "labels",
                propertyName: "labelDisplayUnits"
            } as DataViewObjectPropertyIdentifier,
            labelPrecision: {
                objectName: "labels",
                propertyName: "labelPrecision"
            } as DataViewObjectPropertyIdentifier
        },
        ShowConnectors: {
            show: { objectName: "ShowConnectors", propertyName: "show" } as DataViewObjectPropertyIdentifier
        },
        ShowLegend: {
            show: { objectName: "ShowLegend", propertyName: "show" } as DataViewObjectPropertyIdentifier
        },
        dataPoint: {
            defaultColor: {
                objectName: "dataPoint",
                propertyName: "defaultColor"
            } as DataViewObjectPropertyIdentifier,
            fill: {
                objectName: "dataPoint",
                propertyName: "fill"
            } as DataViewObjectPropertyIdentifier
        },
        funnelTitle: {
            show: { objectName: "FunnelTitle", propertyName: "show" } as DataViewObjectPropertyIdentifier,
            titleBackgroundColor: { objectName: "FunnelTitle", propertyName: "backgroundColor" },
            titleFill: { objectName: "FunnelTitle", propertyName: "fill1" },
            titleFontSize: { objectName: "FunnelTitle", propertyName: "fontSize" },
            titleText: { objectName: "FunnelTitle", propertyName: "titleText" } as DataViewObjectPropertyIdentifier,
            tooltipText: { objectName: "FunnelTitle", propertyName: "tooltipText" }
        },
        show: { objectName: "FunnelTitle", propertyName: "show" },
        sort: {
            OrderBy: { objectName: "Sort", propertyName: "OrderBy" } as DataViewObjectPropertyIdentifier,
            SortBy: { objectName: "Sort", propertyName: "SortBy" } as DataViewObjectPropertyIdentifier,
            orderBy: { objectName: "Sort", propertyName: "OrderBy" } as DataViewObjectPropertyIdentifier,
            sortBy: { objectName: "Sort", propertyName: "SortBy" } as DataViewObjectPropertyIdentifier,
        },
        titleBackgroundColor: { objectName: "FunnelTitle", propertyName: "backgroundColor" },
        titleFill: { objectName: "FunnelTitle", propertyName: "fill1" },
        titleFontSize: { objectName: "FunnelTitle", propertyName: "fontSize" },
        titleText: { objectName: "FunnelTitle", propertyName: "titleText" },
        tooltipText: { objectName: "FunnelTitle", propertyName: "tooltipText" },

    };
    // tslint:disable-next-line:no-any
    const sortType: any = [
        { value: "Auto", displayName: "Auto" },
        { value: "Series", displayName: "Series" },
        { value: "PrimaryMeasure", displayName: "Primary Measure" },
        { value: "SecondaryMeasure", displayName: "Secondary Measure" }];
    // tslint:disable-next-line:no-any
    const orderType: any = [
        { value: "ascending", displayName: "Ascending", description: "Ascending" },
        { value: "descending", displayName: "Descending", description: "Descending" }];

    function getCategoricalObjectValue<T>(
        category: DataViewCategoryColumn, index: number, objectName: string, propertyName: string, defaultValue: T): T {
        let categoryObjects: DataViewObjects[];
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
    /**
     *  It is used to present the visual on screen
     */

    export class HorizontalFunnel implements IVisual {
        public static getDefaultData(): IFunnelViewModel {
            return {
                categories: [],
                count: 0,
                identity: null,
                primaryColumn: "",
                secondaryColumn: "",
                toolTipInfo: [],
                values: []
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
                if (!dataView || !dataView.categorical ||
                    !dataView.categorical.values || !dataView.categorical.categories) {
                    viewModel[0].count = -1;

                    return viewModel;
                }
                for (let iLoop: number = 0; iLoop < dataView.categorical.values.length; iLoop++) {
                    if (dataView.categorical.values[iLoop].source.roles
                        && dataView.categorical.values[iLoop].source.roles.hasOwnProperty("primaryMeasure")) {
                        targetvalueIndex = iLoop;
                        viewModel[0].primaryColumn = dataView.categorical.values[iLoop].source.displayName;
                    } else if (dataView.categorical.values[iLoop].source.roles
                        && dataView.categorical.values[iLoop].source.roles.hasOwnProperty("secondaryMeasure")) {
                        yvalueIndex = iLoop;
                        viewModel[0].secondaryColumn = dataView.categorical.values[iLoop].source.displayName;
                    }
                }
                if (targetvalueIndex !== undefined) {
                    let categorical: DataViewCategorical;
                    categorical = dataView.categorical;
                    if (categorical) {
                        // tslint:disable-next-line:no-any
                        let unsortcategoriesvalues: any;
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
                            case "Auto":
                                // tslint:disable-next-line:no-any
                                let arrValuesToBeSorted: any;
                                arrValuesToBeSorted = [];
                                let iSmallestValue: string;
                                let iIndex: number = 0;
                                let arrTempXAxisValues: PrimitiveValue[];
                                arrTempXAxisValues = categorical.categories[0].values;
                                let arrTempYAxisValues1: PrimitiveValue[];
                                arrTempYAxisValues1 = categorical.values[0].values;
                                // tslint:disable-next-line:no-any
                                let arrTempYAxisValues2: any = [];
                                // tslint:disable-next-line:no-any
                                let iValueToBeSorted: any;
                                // tslint:disable-next-line:no-any
                                let arrIntegerValuesSortIndexes: any;
                                arrIntegerValuesSortIndexes = [];
                                // tslint:disable-next-line:no-any
                                let arrTextValuesSortIndexes: any;
                                arrTextValuesSortIndexes = {
                                    textIndex: [],
                                    textValue: []
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
                                /*******************CREATE ARRAY FOR VALUES TO BE SORTED*****************/
                                /* Change of value*/
                                // tslint:disable-next-line:no-any
                                let value: any;
                                for (const iCount of categorical.categories[0].values) {
                                    value = iCount;
                                    if (isNaN(value)) {
                                        iValueToBeSorted =
                                        iCount.toString().match(/-?\d+\.?\d*/);
                                        if (null !== iValueToBeSorted) {
                                            arrValuesToBeSorted.push(parseFloat(iValueToBeSorted[0]));
                                            iTotalXAxisNumericValues++;
                                        } else {
                                            arrValuesToBeSorted.push(value);
                                        }
                                    } else {
                                        value = iCount;
                                        if (isNaN(parseFloat(value))) {
                                            arrValuesToBeSorted.push(value);
                                        } else {
                                            arrValuesToBeSorted.push(parseFloat(value));
                                        }
                                        iTotalXAxisNumericValues++;
                                    }
                                }

                                /***END create array for values to be sorted***/
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
                                    for (const iLoop of arrIntegerValuesSortIndexes) {
                                        xAxisSortedIntegerValues.push(
                                            arrTempXAxisValues[iLoop]);
                                        for (let iNumberOfYAxisParameters: number = 0;
                                            iNumberOfYAxisParameters < categorical.values.length;
                                            iNumberOfYAxisParameters++) {
                                            if (0 === iNumberOfYAxisParameters) {
                                                yAxisAutoSort.push(
                                                    arrTempYAxisValues1[iLoop]);
                                            } else if (1 === iNumberOfYAxisParameters) {
                                                yAxis1AutoSort.push(
                                                    arrTempYAxisValues2[iLoop]);
                                            }
                                        }
                                    }
                                    for (let iLoop: number = 0; iLoop < arrTextValuesSortIndexes.textValue.length;
                                        iLoop++) {
                                        xAxisSortedIntegerValues.push(
                                            arrTempXAxisValues[arrTextValuesSortIndexes.textIndex[iLoop]]);
                                        for (let iNumberOfYAxisParameters: number = 0;
                                            iNumberOfYAxisParameters < categorical.values.length;
                                            iNumberOfYAxisParameters++) {
                                            if (0 === iNumberOfYAxisParameters) {
                                                yAxisAutoSort.push(
                                                    arrTempYAxisValues1[arrTextValuesSortIndexes.textIndex[iLoop]]);
                                            } else if (1 === iNumberOfYAxisParameters) {
                                                yAxis1AutoSort.push(
                                                    arrTempYAxisValues2[arrTextValuesSortIndexes.textIndex[iLoop]]);
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
                                if (order === "descending") {
                                    for (let iCount: number = xAxisSortedIntegerValues.length - 1;
                                        iCount >= 0; iCount--) {
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

                            case "Series":
                                let index: number = 0;
                                if (order === "ascending") {
                                    xAxisSortedValues = categorical.categories[0].values.sort(d3.ascending);
                                } else {
                                    xAxisSortedValues = categorical.categories[0].values.sort(d3.descending);
                                }
                                for (const iCount of xAxisSortedValues) {
                                    const temp: any = iCount;
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

                            case "PrimaryMeasure":
                                if (order === "ascending") {
                                    yAxis1SortedValues = unsorttargetvalues.sort(d3.ascending);
                                } else {
                                    yAxis1SortedValues = unsorttargetvalues.sort(d3.descending);
                                }
                                for (const iCount of yAxis1SortedValues) {
                                    // tslint:disable-next-line:no-any
                                    const temp: any = iCount;
                                    for (index = 0;
                                        index < categorical.values[targetvalueIndex].values.length; index++) {
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

                            case "SecondaryMeasure":
                                if (order === "ascending") {
                                    yAxis2SortedValues = unsortsecondaryvalues.sort(d3.ascending);
                                } else {
                                    yAxis2SortedValues = unsortsecondaryvalues.sort(d3.descending);
                                }
                                for (const iCount of yAxis2SortedValues) {
                                    // tslint:disable-next-line:no-any
                                    let temp: any;
                                    temp = iCount;
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
                        let cat: DataViewCategoryColumn;
                        cat = catDv.categories[0];
                        let values: DataViewValueColumns;
                        values = catDv.values;
                        let formatStringProp: DataViewObjectPropertyIdentifier;
                        formatStringProp = {
                            objectName: "general",
                            propertyName: "formatString"
                        } as DataViewObjectPropertyIdentifier;
                        if (categories && series && categories.length > 0 && series.length > 0) {
                            let categorySourceFormatString: string;
                            categorySourceFormatString = ValueFormatter.getFormatString(cat.source, formatStringProp);
                            // tslint:disable-next-line:no-any
                            let toolTipItems: any;
                            toolTipItems = [];
                            // tslint:disable-next-line:no-any
                            let formattedCategoryValue: any;
                            // tslint:disable-next-line:no-any
                            let value: any;
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
                                    color: "" ,
                                    value: xAxisSortedValues[iLoop]
                                });
                                let decimalPlaces: number =
                                HorizontalFunnel.getDecimalPlacesCount(yAxis1SortedValues[iLoop]);
                                decimalPlaces = decimalPlaces > 4 ? 4 : decimalPlaces;
                                let primaryFormat: string;
                                primaryFormat = series && series[0] && series[0].source && series[0].source.format ?
                                    series[0].source.format : "";
                                let formatter: IValueFormatter;
                                formatter = ValueFormatter.create({
                                    format: primaryFormat,
                                    precision: decimalPlaces,
                                    value: 0
                                });
                                formattedCategoryValue =
                                ValueFormatter.format(xAxisSortedValues[iLoop], categorySourceFormatString);
                                let tooltipInfo: ITooltipDataItem[];
                                tooltipInfo = [];
                                let tooltipItem1: ITooltipDataItem;
                                tooltipItem1 = { displayName: "", value: "" };
                                let tooltipItem2: ITooltipDataItem;
                                tooltipItem2 = { displayName: "", value: "" };
                                tooltipItem1.displayName = catDv.categories["0"].source.displayName;
                                tooltipItem1.value = formattedCategoryValue;
                                tooltipInfo.push(tooltipItem1);
                                tooltipItem2.displayName = catDv.values["0"].source.displayName;
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
                            let colorObj: {};
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
                                    categoryColumn, i, "dataPoint", "fill", defaultColor).solid.color;
                            }
                            for (let iLoop: number = 0; iLoop < catLength; iLoop++) {
                                for (let unLoop: number = 0; unLoop < catLength; unLoop++) {
                                    if (unsortcategoriesvalues[unLoop] === xAxisSortedValues[iLoop]) {
                                        objects = categoryColumn.objects && categoryColumn.objects[unLoop];
                                        // tslint:disable-next-line:no-any
                                        let dataPointObject: any;
                                        if (objects) {
                                            dataPointObject = categoryColumn.objects[unLoop];
                                        }
                                        // tslint:disable-next-line:no-any
                                        let color: any;
                                        // checks whether any of the color is changed from format pane
                                        if (objects && dataPointObject
                                            && dataPointObject.dataPoint &&
                                            dataPointObject.dataPoint.fill &&
                                            dataPointObject.dataPoint.fill.solid.color) {
                                            color = { value: dataPointObject.dataPoint.fill.solid.color };
                                        } else {
                                            let currentElement: string;
                                            // tslint:disable-next-line:no-any
                                            const colorPlt: any = colorPalette;
                                            currentElement = categoryColumn.values[iLoop].toString();
                                            color = colorPlt.colorPalette[currentElement];
                                        }
                                        unsortindex = unLoop;
                                        let categorySelectionId: ISelectionId;
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
            splitArr = value ? value.toString().split(".") : [];
            if (splitArr[1]) {
                decimalPlaces = splitArr[1].length;
            }

            return decimalPlaces;
        }

        private static minOpacity: number = 0.3;
        private static maxOpacity: number = 1;

        public host: IVisualHost;
        private events: IVisualEventService ;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private root: d3.Selection<SVGElement>;
        private dataView: DataView;
        private colors: IDataColorPalette;
        private cardFormatSetting: ICardFormatSetting;
        private durationAnimations: number = 200;
        private selectionManager: SelectionManager;
        // tslint:disable-next-line:no-any
        private defaultDataPointColor: any = undefined;
        private tooltipInfoValue: string;
        // tslint:disable-next-line:no-any
        private viewModel: any = undefined;

        constructor(options: VisualConstructorOptions) {
            this.events = options.host.eventService;
            this.host = options.host;
            this.root = d3.select(options.element).style("cursor", "default");
            horizontalFunnelProps.cPalette = options.host.colorPalette;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.selectionManager = options.host.createSelectionManager();
            // function call to handle selections on bookmarks
            this.selectionManager.registerOnSelectCallback(() => {
                // tslint:disable-next-line:no-any
                const selection: any = this.root.selectAll(".hf_datapoint");
                this.syncSelectionState(selection, this.selectionManager.getSelectionIds() as ISelectionId[]);
            });
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            this.events.renderingStarted(options);
            let host: IVisualHost;
            host = this.host;
            if (!options.dataViews || (options.dataViews.length < 1) ||
            !options.dataViews[0] || !options.dataViews[0].categorical) {
                return;
            }

            let dataView: DataView;
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
            let title: string = "";
            let dimension: string;
            // tslint:disable-next-line:no-any
            let color: any;
            let fontsize: number;
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
            let dataPoints: any;
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
            let selection: any;
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
            defaultText = this.root.select(".hf_defaultText");
            let dataViewMetadata: DataViewMetadata;
            dataViewMetadata = dataView.metadata;
            // tslint:disable-next-line:no-any
            let defaultDataPointColor: any;
            if (dataViewMetadata) {
                let objects: DataViewObjects;
                objects = dataViewMetadata.objects;
                if (objects) {
                    const labelString: string = "labels";
                    labelSettings = this.cardFormatSetting.labelSettings;
                    labelSettings.labelColor =
                    DataViewObjects.getFillColor(objects, cardProps.labels.color, labelSettings.labelColor);
                    labelSettings.precision =
                    DataViewObjects.getValue(objects, cardProps.labels.labelPrecision, labelSettings.precision);
                    // The precision can't go below 0
                    if (labelSettings.precision) {
                        labelSettings.precision = (labelSettings.precision >= 0) ?
                            ((labelSettings.precision <= 4) ? labelSettings.precision : 4) : 0;
                        precisionValue = labelSettings.precision;
                    }
                    defaultDataPointColor =
                    DataViewObjects.getFillColor(objects, horizontalFunnelProps.dataPoint.defaultColor);
                    labelSettings.displayUnits = DataViewObjects.getValue(
                        objects, cardProps.labels.labelDisplayUnits, labelSettings.displayUnits);
                    let labelsObj: DataLabelObject;
                    labelsObj = dataView.metadata.objects[labelString] as DataLabelObject;
                    dataLabelUtils.updateLabelSettingsFromLabelsObject(labelsObj, labelSettings);
                }
            }
            let showLegendProp: IShowLegendSettings;
            showLegendProp = this.getLegendSettings(this.dataView);
            let funnelTitleSettings: IFunnelTitle;
            funnelTitleSettings = this.getFunnelTitleSettings(this.dataView);
            let showConnectorsProp: IShowConnectorsSettings;
            showConnectorsProp = this.getConnectorsSettings(this.dataView);
            let dataLabelSettings: ILabelSettings;
            dataLabelSettings = this.getDataLabelSettings(this.dataView);
            let sortSettings: ISortSettings;
            sortSettings = this.getSortSettings(this.dataView);
            this.defaultDataPointColor = defaultDataPointColor;
            viewport = options.viewport;
            this.root.selectAll("div").remove();
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

            // changed now
            if (parentHeight >= 65) {
                visualHeight = parentHeight - 65 + 40;
            } else {
                visualHeight = 65 - parentHeight;
            }

            // find max y value
            for (let iLoop: number = 0; iLoop < this.viewModel.categories.length; iLoop++) {
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
                    fontFamily: "Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif",
                    fontSize: `${titlefontsize}pt`,
                    text: titleText.toString()
                };
                titleHeight = TextMeasurementService.measureSvgTextHeight(titleTextProperties);
            } else {
                titleHeight = 0;
            }

            fontsize = dataLabelSettings.fontSize;
            let textProperties: TextProperties = {
                fontFamily: "Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif",
                fontSize: `${fontsize}pt`,
                text: "MAQ Software"
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
                this.root.append("div")
                    .style({
                        height: `${titleHeight}px`,
                        width: "100%"
                    })
                    .classed("hf_Title_Div", true);
                this.root.select(".hf_Title_Div")
                    .append("div")
                    .style({
                        width: "100%"
                    })
                    .classed("hf_Title_Div_Text", true);
                this.root.select(".hf_Title_Div_Text").classed("hf_title", true).style({ display: "inline-block" });
                this.root.select(".hf_Title_Div_Text").classed("hf_title", true).style({ display: "inline-block" });
            }
            this.root.append("div")
                .style({
                    "height": `${height + 60}px`,
                    "margin-bottom": "5px",
                    "width": `${parentWidth}px`,
                })
                .classed("hf_parentdiv", true);
            element = this.root.select(".hf_parentdiv")
                .append("div").classed("hf_svg hf_parentElement", true);
            parentDiv = this.root.select(".hf_parentdiv");
            showDefaultText = 1;
            if (dataView && dataView.categorical && dataView.categorical.values) {
                for (const iterator of dataView.categorical.values) {
                    if (iterator.source.roles
                        && iterator.source.roles.hasOwnProperty("primaryMeasure")) {
                        showDefaultText = 0;
                    }
                }
            }
            if (!dataView.categorical.categories || 1 === showDefaultText) {
                let message: string;
                message = 'Please select both "Series" and "Primary Measure" values';
                parentDiv
                    .append("div")
                    .text(message)
                    .attr("title", message)
                    .classed("hf_defaultText", true)
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
                    fontFamily: "Segoe UI",
                    fontSize: `${titlefontsize}pt`,
                    text: " (?)"
                };
                let occupiedWidth: number;
                occupiedWidth = TextMeasurementService.measureSvgTextWidth(textProps);
                const maxWidth: string = `${totalWidth - occupiedWidth}px`;
                if (!titleText) {
                    let titleDiv: d3.Selection<SVGElement>;
                    titleDiv = this.root.select(".hf_Title_Div_Text");
                    titleDiv
                        .append("div")
                        .classed("hf_Title_Div_Text_Span", true)
                        .style({
                            "display": "inline-block",
                            "max-width": maxWidth,
                            "visibility": "hidden"
                        })
                        .text(".");

                    titleDiv
                        .append("span")
                        .classed("hf_infoImage hf_icon", true)
                        .style({
                            "display": "inline-block",
                            "margin-left": "3px",
                            "position": "absolute",
                            "width": "2%",
                        })
                        .text("(?)")
                        .attr("title", tooltiptext);
                } else {
                    let titleTextDiv: d3.Selection<SVGElement>;
                    titleTextDiv = this.root.select(".hf_Title_Div_Text");

                    titleTextDiv
                        .append("div")
                        .classed("hf_Title_Div_Text_Span", true)
                        .style({
                            "display": "inline-block",
                            "max-width": maxWidth,
                        })
                        .text(titleText.toString())
                        .attr("title", titleText.toString());

                    titleTextDiv
                        .append("span")
                        .classed("hf_infoImage hf_icon", true)
                        .text(" (?)")
                        .style({
                            "display": "inline-block",
                            "margin-left": "3px",
                            "position": "absolute",
                            "width": "2%",
                        })
                        .attr("title", tooltiptext);
                }
                if (!tooltiptext) {
                    this.root.select(".hf_infoImage").style({
                        display: "none"
                    });
                } else {
                    this.root.select(".hf_infoImage").attr("title", tooltiptext);
                }

                if (titlecolor) {
                    this.root.select(".hf_Title_Div").style({
                        "color": titlecolor,
                        "font-size": `${titlefontsize}pt`
                    });
                } else {
                    this.root.select(".hf_Title_Div").style({
                        "color": "#333333",
                        "font-size": `${titlefontsize}pt`
                    });
                }

                if (titlebgcolor) {
                    this.root.select(".hf_Title_Div").style({ "background-color": titlebgcolor });
                    this.root.select(".hf_Title_Div_Text").style({ "background-color": titlebgcolor });
                    this.root.select(".hf_infoImage").style({ "background-color": titlebgcolor });
                } else {
                    this.root.select(".hf_Title_Div").style({ "background-color": "none" });
                }

                if (funnelTitleOnOffStatus) {
                    this.root.select(".hf_Title_Div").classed("hf_show_inline", true);
                } else {
                    this.root.select(".hf_Title_Div").classed("hf_hide", true);
                }
            }
            if (showLegendProp.show) {
                element
                    .style({
                        "vertical-align": "top",
                        "width": `${(parentWidth - width) / (1.8 * catLength)}px`
                    });
                element
                    .append("div")
                    .style({
                        color,
                        "font-size": `${fontsize}px`,
                        "visibility": "hidden",
                        "width": `${(parentWidth - width) / (1.8 * catLength)}px`
                    })
                    .classed("hf_legend_item", true)
                    .text("s");

                let textSize: number = parseInt(fontsize.toString(), 10);

                // ellipses for overflow text
                textProperties = {
                    fontFamily: "sans-serif",
                    fontSize: `${fontsize}px`,
                    text: this.viewModel.primaryColumn
                };

                let availableWidth: number;
                availableWidth = (parentWidth - width) / (1.8 * catLength);
                let primaryColumn: string;
                primaryColumn = TextMeasurementService.getTailoredTextOrDefault(textProperties, availableWidth);
                const maxWidth: number = 60;
                const maxHeight: number = 100;
                if (availableWidth < maxWidth || height < maxHeight) {
                    element
                        .append("div")
                        .style({
                            color,
                            "font-size": `${fontsize}px`,
                            "margin-left": "0",
                            "overflow": "hidden",
                            "padding-right": "10px",
                            "position": "absolute",
                            "width": `${availableWidth}px`,
                            "word-break": "keep-all"
                        })
                        .attr({
                            title: this.viewModel.primaryColumn
                        })
                        .text(this.trimString(primaryColumn, availableWidth / textSize))
                        .classed("hf_primary_measure", true);
                } else {
                    element
                        .append("div")
                        .style({
                            color,
                            "font-size": `${fontsize}px`,
                            "overflow": "hidden",
                            "padding-right": "10px",
                            "position": "absolute",
                            "width": `${availableWidth}px`,
                            "word-break": "keep-all"
                        })
                        .classed("hf_primary_measure", true)
                        .attr({ title: this.viewModel.primaryColumn })
                        .text(this.viewModel.primaryColumn);
                }
                if (catLength > 0) {
                    element
                        .append("svg")
                        .attr({
                            fill: "white",
                            height,
                            width: (parentWidth - width) / (1.8 * catLength)
                        });
                }
                if (this.viewModel.secondaryColumn !== "") {
                    // ellipses for overflow text
                    textProperties = {
                        fontFamily: "sans-serif",
                        fontSize: `${fontsize}px`,
                        text: this.viewModel.secondaryColumn
                    };

                    let secondaryColumn: string;
                    const catFactor: number = 1.8;
                    secondaryColumn = TextMeasurementService.getTailoredTextOrDefault(
                        textProperties, (parentWidth - width) / (catFactor * catLength));
                    element
                        .append("div")
                        .style({
                            color,
                            "font-size": `${fontsize}px`,
                            "visibility": "hidden",
                            "width": `${(parentWidth - width) / (catFactor * catLength)}px`,
                        })
                        .classed("hf_legend_item", true)
                        .text("s");

                    textSize = parseInt(fontsize.toString(), 10);
                    if ((((parentWidth - width) / (catFactor * catLength)) < maxWidth) || (height < maxHeight)) {
                        element.append("div")
                            .style({
                                color,
                                "font-size": `${fontsize}px`,
                                "margin-left": "0",
                                "margin-top": "5px",
                                "overflow": "hidden",
                                "padding-right": "10px",
                                "position": "absolute",
                                "white-space": "normal",
                                "width": `${(parentWidth - width) / (1.8 * catLength)}px`,
                                "word-break": "keep-all"
                            })
                            .attr({ title: this.viewModel.secondaryColumn })
                            .text(this.trimString(secondaryColumn,
                                ((parentWidth - width) / (catFactor * catLength)) / textSize))
                            .classed("hf_yaxis2", true);
                    } else {
                        element.append("div")
                            .style({
                                color,
                                "font-size": `${fontsize}px`,
                                "margin-left": "0",
                                "margin-top": "5px",
                                "overflow": "hidden",
                                "padding-right": "10px",
                                "position": "absolute",
                                "white-space": "normal",
                                "width": `${(parentWidth - width) / (catFactor * catLength)}px`,
                                "word-break": "keep-all"

                            })
                            .attr({ title: this.viewModel.secondaryColumn })
                            .text(secondaryColumn).classed("hf_yaxis2", true);
                    }
                }
            }
            for (let i: number = 0; i < (2 * catLength - 1); i++) {
                if (!showLegendProp.show) {
                    let constantMultiplier: number = 1;
                    const xDisplacement: number = 10;
                    if (catLength > 0) {
                        constantMultiplier = 4 / (5 * catLength - 1); // dividing the available space into equal parts
                    }
                    width = (parentWidth - xDisplacement) * constantMultiplier;
                    // remove 10 from total width as 10 is x displacement
                    if (!showConnectorsProp.show) {
                        width = (parentWidth - xDisplacement) / catLength;
                    }
                }
                element = this.root.select(".hf_parentdiv")
                    .append("div")
                    .style({
                        height: `${height}px`
                    })
                    .classed("hf_svg hf_parentElement", true);
                if (i % 2 === 0) {
                    classname = `hf_odd${i}`;
                    element
                        .append("div")
                        .style({
                            color,
                            "font-size": `${fontsize}px`,
                            "width": `${(0.92 * width)}px`
                        })
                        .classed(`hf_legend_item${i} hf_xAxisLabels`, true)
                        .classed("hf_legend", true);
                    element.append("div")
                        .style({
                            color,
                            "font-size": `${fontsize}px`,
                            "width": `${0.92 * width}px`
                        })
                        .classed(`hf_legend_value1${i}`, true)
                        .classed("hf_legend", true);
                    let displacement: number;
                    displacement = i === 0 ? 0 : 10;
                    element
                        .append("svg")
                        .attr({
                            fill: "#FAFAFA",
                            height,
                            id: i,
                            overflow: "hidden",
                            width
                        }).classed(classname, true)
                        .append("rect")
                        .attr({
                            height,
                            width,
                            x: 10,
                            y: 0
                        });
                    if (this.viewModel.secondaryColumn) {
                        element.append("div")
                            .style({
                                color,
                                width: `${0.92 * width}px`
                            })
                            .classed(`hf_legend_value2${i}`, true)
                            .style({ "font-size": `${fontsize}px` })
                            .classed("hf_yaxis2", true);
                    }
                } else {
                    classname = `hf_even${i}`;
                    let disp: number;
                    disp = 10;
                    if (showConnectorsProp.show) {
                        element
                            .append("svg")
                            .attr({
                                fill: "#FAFAFA",
                                height,
                                id: i,
                                overflow: "hidden",
                                width: width / 4,

                            })
                            .classed(classname, true)
                            .append("rect")
                            .attr({
                                height,
                                width: width / 4,
                                x: disp,
                                y: 0
                            });
                    }
                }
            }
            for (let i: number = 0; i < this.viewModel.categories.length; i++) {
                    const maxLabelValue1: number = 1000000000000;
                    const maxLabelValue2: number = 1000000000;
                    const maxLabelValue3: number = 1000000;
                    const maxLabelValue4: number = 1000;
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
                    if (this.viewModel.categories[i].value !== null && this.viewModel.categories[i].value !== "" ) {
                    title = dataPoints[i].toolTipInfo[0].value;
                    legendvalue.attr({ title }).text(title);
                } else {
                    legendvalue.attr({ title: "(Blank)" }).text("(Blank)");
                }
                    if (this.viewModel.values[i].values[0] !== null) {
                    title = String(dataPoints[i].toolTipInfo[1].value);
                    precisionValue = precisionValue;
                    if (displayunitValue === 0) {    // auto option selected then
                        maxLabel = 0;
                        for (const jIterator of this.viewModel.values) {
                            if (maxLabel < jIterator.values[0]) {
                                maxLabel = jIterator.values[0];
                            }
                        }
                        if (maxLabel > maxLabelValue1) {
                            displayunitValue = maxLabelValue1;
                        } else if (maxLabel > maxLabelValue2) {
                            displayunitValue = maxLabelValue2;
                        } else if (maxLabel > maxLabelValue3) {
                            displayunitValue = maxLabelValue3;
                        } else if (maxLabel > maxLabelValue4) {
                            displayunitValue = maxLabelValue4;
                        } else {
                            displayunitValue = 1;
                        }
                    }
                    sKMBValueY1Axis = this.format(
                        this.viewModel.values[i].values[0],
                        displayunitValue, precisionValue, this.dataView.categorical.values[0].source.format);
                    let decimalPlaces: number;
                    decimalPlaces = HorizontalFunnel.getDecimalPlacesCount(this.viewModel.values[i].values[0]);
                    // tooltip values
                    let sKMBValueY1AxisTooltip: string;
                    sKMBValueY1AxisTooltip = this.format(
                        this.viewModel.values[i].values[0],
                        1, decimalPlaces,
                        this.dataView.categorical.values[0].source.format);

                    displayValue = sKMBValueY1Axis;

                    // ellipses for overflow text
                    textProperties = {
                        fontFamily: "sans-serif",
                        fontSize: `${fontsize}px`,
                        text: displayValue,
                    };

                    displayValue = TextMeasurementService.getTailoredTextOrDefault(textProperties, width);
                    this.root.select(`.hf_legend_value1${legendpos}`).attr({
                        title: sKMBValueY1AxisTooltip
                    }).text(displayValue);
                } else {
                    displayValue = "(Blank)";
                    title = "(Blank)";
                    this.root.select(`.hf_legend_value1${legendpos}`)
                        .attr({
                            title
                        })
                        .text(this.trimString(title, width / 10));
                }
                    if (this.viewModel.values[i].values.length > 1) {
                    let sKMBValueY2AxisTooltip: string;
                    if (this.viewModel.values[i].values[1] !== null) {
                        if (displayunitValue2 === 0) { // auto option selected then
                            maxLabel = 0;
                            for (const jIterator of this.viewModel.values) {
                                if (maxLabel < jIterator.values[1]) {
                                    maxLabel = jIterator.values[1];
                                }
                            }
                            if (maxLabel > maxLabelValue1) {
                                displayunitValue2 = maxLabelValue1;
                            } else if (maxLabel > maxLabelValue2) {
                                displayunitValue2 = maxLabelValue2;
                            } else if (maxLabel > maxLabelValue3) {
                                displayunitValue2 = maxLabelValue3;
                            } else if (maxLabel > maxLabelValue4) {
                                displayunitValue2 = maxLabelValue4;
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
                            fontFamily: "sans-serif",
                            fontSize: `${fontsize}px`,
                            text: displayValue
                        };

                        displayValue = TextMeasurementService.getTailoredTextOrDefault(textProperties, width);
                        this.root.select(`.hf_legend_value2${legendpos}`)
                            .attr({ title: sKMBValueY2AxisTooltip })
                            .text(displayValue);
                    } else {
                        displayValue = "(Blank)";
                        title = "(Blank)";
                        this.root.select(`.hf_legend_value2${legendpos}`)
                            .attr({ title })
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
                        oddsvg.append("rect")
                            .attr({
                                height: areafillheight[index],
                                width,
                                x: disp,
                                y
                            }).classed("hf_datapoint hf_dataColor", true);
                    } else {
                        let disp: number;
                        disp = 10;
                        if (percentageVal[index] === 0) {
                            oddsvg.append("rect")
                                .attr({
                                    height,
                                    width,
                                    x: disp,
                                    y: 0,
                                }).classed("hf_datapoint hf_dataColor", true);
                        } else if (percentageVal[index] === -1) {
                            // showing dotted line if there is no data
                            y = ((height - (percentageVal[index] * height / 100)) / 2);
                            oddsvg.append("line")
                                .attr({
                                    "stroke-width": 1,
                                    "x1": disp,
                                    "x2": width,
                                    "y1": y,
                                    "y2": y
                                }).classed("hf_datapoint hf_dataColor", true)
                                .style("stroke-dasharray", "1,2");
                        }
                        areafillheight.push(0);
                    }
                    index++;
                }
            }
            let svgElement: d3.Selection<SVGAElement>;
            svgElement = d3.selectAll(".hf_datapoint.hf_dataColor");
            for (let i: number = 0; i < (catLength); i++) {
                svgElement[0][i]["cust-tooltip"] = this.viewModel.values[i].toolTipInfo;
            }
            for (let i: number = 0; i < percentageVal.length; i++) {
                let polygonColor: string;
                if (this.defaultDataPointColor) {
                    polygonColor = this.defaultDataPointColor;
                } else {
                    polygonColor = this.ColorLuminance(this.viewModel.categories[i].color.value);
                }
                classname = `.hf_even${val}`;
                evensvg = this.root.select(classname);
                if (percentageVal[i] === 0 && percentageVal[i + 1] === 0) {
                    evensvg.append("rect")
                        .attr({
                            fill: polygonColor,
                            height,
                            width: width / 4,
                            x: 10,
                            y: 0
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
                        .append("polygon")
                        .attr("points", dimension)
                        .attr({ fill: polygonColor });
                }
                val += 2;
            }
            this.root.selectAll(".fillcolor").style("fill", (d: {}, i: number) => this.colors[i + 1].value);

            this.root.selectAll(".hf_dataColor")
                     .style("fill", (d: {}, i: number) => this.viewModel.categories[i].color.value);
            // This is for the dotted line
            this.root.selectAll(".hf_dataColor")
                     .style("stroke", (d: {}, i: number) => this.viewModel.categories[i].color.value);
            selection = this.root.selectAll(".hf_datapoint")
                .data(dataPoints, (d: {}, idx: number) => (dataPoints[idx] === 0) ? String(idx) : String(idx + 1));
            // tslint:disable-next-line:no-any
            let viewModel: any;
            viewModel = this.viewModel;
            this.tooltipServiceWrapper.addTooltip(
                d3.selectAll(".hf_datapoint"),
                (tooltipEvent: TooltipEventArgs<number>) => {
                    return tooltipEvent.context["cust-tooltip"];
                },
                (tooltipEvent: TooltipEventArgs<number>) => null, true);
            selection.on("click", (data: IFunnelViewModel) => {
                // tslint:disable-next-line:no-any
                let ev: any;
                ev = d3.event;
                this.selectionManager.select(data.identity, ev.ctrlKey).then((selectionIds: ISelectionId[]) => {
                    this.syncSelectionState(selection, selectionIds);
                });
                ev.stopPropagation();
            });
            this.root.on("click", () => {
                this.selectionManager.clear();
                this.syncSelectionState(selection, this.selectionManager.getSelectionIds() as ISelectionId[]);
            });

            this.syncSelectionState(selection, this.selectionManager.getSelectionIds() as ISelectionId[]);
            d3.selectAll(".hf_parentdiv").on("contextmenu", () => {
                const mouseEvent: MouseEvent = d3.event as MouseEvent;
                const eventTarget: EventTarget = mouseEvent.target;
                // tslint:disable-next-line:no-any
                const dataPoint: any = d3.select(eventTarget).datum();
                if (dataPoint !== undefined) {
                    this.selectionManager.showContextMenu(dataPoint.identity , {
                        x: mouseEvent.clientX,
                        y: mouseEvent.clientY
                    });
                    mouseEvent.preventDefault();
                }
            });
            this.events.renderingFinished(options);
            this.events.renderingFailed(options);

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
            const legendProperties: any = horizontalFunnelProps;
            legendSetting.show =
            DataViewObjects.getValue(objects, legendProperties.ShowLegend.show, legendSetting.show);

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
            const showConnectorsProps: any = horizontalFunnelProps;
            connectorsSetting.show =
            DataViewObjects.getValue(objects, showConnectorsProps.ShowConnectors.show, connectorsSetting.show);

            return connectorsSetting;

        }

        public getDefaultDataLabelSettings(): ILabelSettings {
            return {
                color: "#333333",
                decimalPlaces: 0,
                displayUnits: 0,
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
            const labelProperties: any = horizontalFunnelProps.LabelSettings;
            dataLabelSetting.color =
            DataViewObjects.getFillColor(objects, labelProperties.color, dataLabelSetting.color);
            dataLabelSetting.displayUnits = DataViewObjects.getValue(
                objects, labelProperties.labelDisplayUnits, dataLabelSetting.displayUnits);
            dataLabelSetting.decimalPlaces = DataViewObjects.getValue(
                objects, labelProperties.labelPrecision, dataLabelSetting.decimalPlaces);
            dataLabelSetting.decimalPlaces = dataLabelSetting.decimalPlaces < 0 ?
                0 : dataLabelSetting.decimalPlaces > 4 ? 4 : dataLabelSetting.decimalPlaces;
            dataLabelSetting.fontSize =
            DataViewObjects.getValue(objects, labelProperties.fontSize, dataLabelSetting.fontSize);

            return dataLabelSetting;
        }

        public getDefaultFunnelTitleSettings(dataView: DataView): IFunnelTitle {
            let titleText: string = "";
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
                const catName: string = dataView.categorical.categories[0].source.displayName;
                titleText = `${measureName} by ${catName} `;
            }

            return {
                bkColor: "#fff",
                color: "#333333",
                fontSize: 12,
                show: true,
                titleText,
                tooltipText: "Your tooltip text goes here",
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
            const titleProps: any = horizontalFunnelProps.funnelTitle;
            fTitleSettings.show = DataViewObjects.getValue(objects, titleProps.show, fTitleSettings.show);
            fTitleSettings.titleText =
            DataViewObjects.getValue(objects, titleProps.titleText, fTitleSettings.titleText);
            fTitleSettings.tooltipText =
            DataViewObjects.getValue(objects, titleProps.tooltipText, fTitleSettings.tooltipText);
            fTitleSettings.color =
            DataViewObjects.getFillColor(objects, titleProps.titleFill, fTitleSettings.color);
            fTitleSettings.bkColor =
            DataViewObjects.getFillColor(objects, titleProps.titleBackgroundColor, fTitleSettings.bkColor);
            fTitleSettings.fontSize =
            DataViewObjects.getValue(objects, titleProps.titleFontSize, fTitleSettings.fontSize);

            return fTitleSettings;
        }

        public getDefaultSortSettings(): ISortSettings {
            return {
                orderBy: "ascending",
                sortBy: "Auto"
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
            const sortProps: any = horizontalFunnelProps.sort;
            sortSettings.sortBy = DataViewObjects.getValue(objects, sortProps.sortBy, sortSettings.sortBy);
            // Check if Secondary measure exists before selecting it
            // If exists sort by secondary measure, otherwise sort by 'Auto'
            if (sortSettings.sortBy === "SecondaryMeasure") {
                if (dataView
                    && dataView.categorical
                    && dataView.categorical.values) {
                    let secondaryColumn: boolean = false;
// tslint:disable-next-line: prefer-for-of
                    for (let iLoop: number = 0; iLoop < dataView.categorical.values.length; iLoop++) {
                        if (dataView.categorical.values[iLoop].source
                            && dataView.categorical.values[iLoop].source.roles
                            && dataView.categorical.values[iLoop].source.roles.hasOwnProperty("secondaryMeasure")) {
                            secondaryColumn = true;
                        }
                    }
                    sortSettings.sortBy = secondaryColumn ? "SecondaryMeasure" : "Auto";
                }
            }
            sortSettings.orderBy = DataViewObjects.getValue(objects, sortProps.orderBy, sortSettings.orderBy);

            return sortSettings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions):
        VisualObjectInstanceEnumeration {
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
                case "FunnelTitle":
                    enumeration.push({
                        displayName: "Funnel title",
                        objectName: "FunnelTitle",
                        properties: {
                            backgroundColor: funnelTitleSettings.bkColor,
                            fill1: funnelTitleSettings.color,
                            fontSize: funnelTitleSettings.fontSize,
                            show: funnelTitleSettings.show,
                            titleText: funnelTitleSettings.titleText,
                            tooltipText: funnelTitleSettings.tooltipText,
                        },
                        selector: null,
                    });
                    break;

                case "Sort":
                    enumeration.push({
                        displayName: "Sort",
                        objectName: "Sort",
                        properties: {
                            OrderBy: sortSettings.orderBy,
                            SortBy: sortSettings.sortBy
                        },
                        selector: null,
                    });
                    break;

                case "labels":
                    enumeration.push({
                        objectName: options.objectName,
                        properties: {
                            color: dataLabelSettings.color,
                            fontSize: dataLabelSettings.fontSize,
                            labelDisplayUnits: dataLabelSettings.displayUnits,
                            labelPrecision: dataLabelSettings.decimalPlaces
                        },
                        selector: null
                    });
                    break;

                case "dataPoint":
                    this.enumerateDataPoints(enumeration);
                    break;

                case "ShowLegend":
                    enumeration.push({
                        displayName: "Show Legend",
                        objectName: "ShowLegend",
                        properties: {
                            show: showLegendSettings.show
                        },
                        selector: null
                    });
                    break;

                case "ShowConnectors":
                    enumeration.push({
                        displayName: "Show Connectors",
                        objectName: "ShowConnectors",
                        properties: {
                            show: showConnectorsSettings.show
                        },
                        selector: null
                    });
                    break;

                default:
                    break;
            }

            return enumeration;
        }

        public getDefaultFormatSettings(): ICardFormatSetting {
            return {
                labelSettings: this.getDefaultLabelSettings(true, "#333333", undefined, undefined),
                showTitle: true,
                textSize: 10,
                wordWrap: false
            };
        }

        // tslint:disable-next-line:no-any
        public getDefaultLabelSettings(show: any, labelColor: any, labelPrecision: any, format: any): {
            // tslint:disable-next-line:no-any
            show: any;
            position: number;
            displayUnits: number;
            precision: number;
            labelColor: {};
            formatterOptions: {};
            fontSize: number;
        } {
            let defaultLabelColor: string;
            defaultLabelColor = "#333333";
            let precision: number = 0;
            if (precision > 4) {
                precision = 4;
            }
            if (show === void 0) { show = false; }
            if (format) {
                let hasDots: boolean;
                hasDots = true; // powerbi.NumberFormat.getCustomFormatMetadata(format).hasDots;
            }

            return {
                displayUnits: 0,
                fontSize: 12,
                formatterOptions: null,
                labelColor: labelColor || defaultLabelColor,
                position: 0 /* Above */,
                precision,
                show
            };
        }

        // This function is to trim numbers if it exceeds number of digits.
        // tslint:disable-next-line:no-any
        public trimString(sValue: any, iNumberOfDigits: number): string {
            if (null === sValue) {
                return "null";
            }
            if (sValue.toString().length < iNumberOfDigits) {
                return sValue;
            } else {
                return (`${sValue.toString().substring(0, iNumberOfDigits)}...`);
            }
        }

        private ColorLuminance(hex: string): string {
            let lum: number = 0.50;
            // validate hex string
            hex = String(hex).replace(/[^0-9a-f]/gi, "");
            if (hex.length < 6) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            lum = lum || 0;

            // convert to decimal and change luminosity
            let rgb: string = "#";
            // tslint:disable-next-line:no-any
            let c: any;
            let i: number;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substr(i * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += (`00${c}`).substr(c.length);
            }

            return rgb;
        }

        private enumerateDataPoints(enumeration: VisualObjectInstance[]): void {
            // tslint:disable-next-line:no-any
            const data: any = this.viewModel.categories;
            if (!data) {
                return;
            }
            const dataPointsLength: number = data.length;

            const primaryValues: number = this.viewModel.values;
            for (let i: number = 0; i < dataPointsLength; i++) {
                if (primaryValues[i].values[0]) {
                    if (!data[i].color.value) {
                        data[i].color.value = "(Blank)";
                    }
                    enumeration.push({
                        displayName: data[i].value,
                        objectName: "dataPoint",
                        properties: {
                            fill: { solid: { color: data[i].color.value } }
                        },
                        selector: data[i].identity.getSelector(),
                    });
                }
            }
            enumeration.push({
                objectName: "dataPoint",
                properties: {
                    defaultColor: { solid: { color: this.defaultDataPointColor } }
                },
                selector: null,
            });
        }

        // This function is to perform KMB formatting on values.
        private format(d: number, displayunitValue: number, precisionValue: number, format: string): string {

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
            let formatter: IValueFormatter;
            if (format) {
                if (format.indexOf("%") >= 0) {
                    formatter = ValueFormatter.create({
                        format,
                        precision: precisionValue
                    });
                } else {
                    formatter = ValueFormatter.create({
                        format,
                        precision: precisionValue,
                        value: displayUnits === 0 ? primaryFormatterVal : displayUnits
                    });
                }
            } else {
                formatter = ValueFormatter.create({
                    precision: precisionValue,
                    value: displayUnits === 0 ? primaryFormatterVal : displayUnits
                });
            }

            let formattedValue: string;
            formattedValue = formatter.format(d);

            return formattedValue;
        }

        // method to set opacity based on the selections in visual
        // tslint:disable-next-line:no-any
        private syncSelectionState(selection: any, selectionIds?: ISelectionId[]): void {
            const self: this = this;

            if (!selection || !selectionIds) {
                return;
            }

            if (!selectionIds.length) {
                selection.transition()
                .duration(this.durationAnimations)
                .style("fill-opacity", HorizontalFunnel.maxOpacity);

                return;
            }

            selection.each(function(dataPoint: IFunnelViewModel): void {
                const isSelected: boolean = self.isSelectionIdInArray(selectionIds, dataPoint.identity);

                d3.select(this).transition()
                    .duration(self.durationAnimations)
                    .style("fill-opacity", isSelected ? HorizontalFunnel.maxOpacity : HorizontalFunnel.minOpacity);
            });
        }

        // method to return boolean based on presence of value in array
        private isSelectionIdInArray(selectionIds: ISelectionId[], selectionId: ISelectionId): boolean {
            if (!selectionIds || !selectionId) {
                return false;
            }

            return selectionIds.some((currentSelectionId: ISelectionId) => {
                return currentSelectionId.includes(selectionId);
            });
        }
    }
}
