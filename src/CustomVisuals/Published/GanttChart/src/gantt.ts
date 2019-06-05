/*
 *  Power BI Visualizations
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
 *
 */
module powerbi.extensibility.visual {

    // d3
    import Selection = d3.Selection;
    import UpdateSelection = d3.selection.Update;

    // powerbi
    import DataView = powerbi.DataView;
    import IViewport = powerbi.IViewport;
    import DataViewObjects = powerbi.DataViewObjects;
    import DataViewValueColumn = powerbi.DataViewValueColumn;
    import VisualObjectInstance = powerbi.VisualObjectInstance;
    import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
    import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
    import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

    // powerbi.visuals
    import ISelectionId = powerbi.visuals.ISelectionId;
    let selectionIds: ISelectionId[];

    // powerbi.extensibility
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

    // powerbi.extensibility.visual
    import IVisual = powerbi.extensibility.visual.IVisual;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

    // powerbi.extensibility.utils.svg
    import SVGUtil = powerbi.extensibility.utils.svg;
    import IMargin = powerbi.extensibility.utils.svg.IMargin;
    import translate = powerbi.extensibility.utils.svg.translate;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;

    // powerbi.extensibility.utils.type
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import PrimitiveType = powerbi.extensibility.utils.type.PrimitiveType;
    import ValueType = powerbi.extensibility.utils.type.ValueType;

    // powerbi.extensibility.utils.formatting
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    // powerbi.extensibility.utils.interactivity
    import createInteractivityService = powerbi.extensibility.utils.interactivity.createInteractivitySelectionService;
    import SelectionDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import IBehaviorOptions = powerbi.extensibility.utils.interactivity.IBehaviorOptions;
    import InteractivitySelectionService = powerbi.extensibility.utils.interactivity.InteractivitySelectionService;
    import BaseDataPoint =  powerbi.extensibility.utils.interactivity.BaseDataPoint;
    import ISelectionHandler = powerbi.extensibility.utils.interactivity.ISelectionHandler;

    // powerbi.extensibility.utils.tooltip
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;

    // powerbi.extensibility.utils.chart
    import AxisHelper = powerbi.extensibility.utils.chart.axis;
    import axisScale = powerbi.extensibility.utils.chart.axis.scale;
    import IAxisProperties = powerbi.extensibility.utils.chart.axis.IAxisProperties;

    // powerbi.extensibility.utils.chart.legend
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import Legend = powerbi.extensibility.utils.chart.legend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import LegendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import position = powerbi.extensibility.utils.chart.legend.positionChartArea;

    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import DataViewTableRow = powerbi.DataViewTableRow;
    import timeScale = d3.time.Scale;
    // tslint:disable-next-line
    const dateFormat: RegExp = /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])(\D?([01]\d|2[0-3])\D?([0-5]\d)\D?([0-5]\d)?\D?(\d{3})?)?\D$/;
    let uniquelegend: PrimitiveValue[];
    // tslint:disable-next-line:no-any
    let uniqueColors: any;
    let iterator: number = 1;
    // tslint:disable-next-line:no-any
    let colorsPersistObject: any = {};
    let errorMessage: boolean = false;
    let legIndex: number;
    let r: number;
    let scrollWidth: number;
    let measureFormat: string;
    let legendData: LegendData;
    const tasks: ITask[] = [];
    // tslint:disable-next-line:no-any
    let uniquesColorsForLegends: any[] = [];
    // tslint:disable-next-line:prefer-const
    let resourcePresent: boolean = false;
    const legendIndex: number = -1;
    const transformRightValue: number = 18;
    const percentFormat: string = "0.00 %;-0.00 %;0.00 %";
    const millisecondsInADay: number = 24 * 60 * 60 * 1000;
    const millisecondsInWeek: number = 7 * millisecondsInADay;
    const millisecondsInAMonth: number = 30 * millisecondsInADay;
    const millisecondsInAQuarter: number = 92 * millisecondsInADay;
    const millisecondsInAYear: number = 365 * millisecondsInADay;
    const chartLineHeight: number = 25;
    const paddingTasks: number = 5;
    const numberFormat: string = "#";
    const dataformat: string = "$";
    const headerCellClassLiteral: string = ".headerCell";
    const nullStringLiteral: string = "";
    const taskColumnClassLiteral: string = ".task-column";
    const taskColumnLiteral: string = "task-column";
    const startDateLiteral: string = "StartDate";
    const endDateLiteral: string = "EndDate";
    const sortOrderLiteral: string = "sortOrder";
    const sortLevelLiteral: string = "sortLevel";
    const prevSortedColumnLiteral: string = "prevSortedColumn";
    const semiColonLiteral: string = ";";
    const verticalLineLiteral: string = "vertical-line";
    const zeroLiteral: string = "0";
    const slashLiteral: string = "/";
    const colonLiteral: string = ":";
    const spaceLiteral: string = " ";
    const horizontalLineClassLiteral: string = ".horizontalLine";
    const pxLiteral: string = "px";
    const categoryIdLiteral: string = "#gantt_category";
    const columnLiteral: string = "column";
    const legendLiteral: string = "legend";
    const clickedTypeLiteral: string = "clickedType";
    const phaseNamesLiteral: string = "phaseNames";
    const milestoneNamesLiteral: string = "milestoneNames";
    const stopPropagationLiteral: string = "stopPropagation";
    const categoryClassLiteral: string = ".gantt_category";
    const taskRowClassLiteral: string = ".task_row";
    const ellipsisLiteral: string = "...";
    const categoryLiteral: string = "gantt_category";
    const dotLiteral: string = ".";
    const headerCellLiteral: string = "headerCell";
    const verticalLineSimpleLiteral: string = "verticalLine";
    const taskRowLiteral: string = "task_row";
    const kpiClassLiteral: string = "gantt_kpiClass";
    const paranthesisStartLiteral: string = "(";
    const paranthesisEndLiteral: string = ")";
    const commaLiteral: string = ",";
    const xFactor: number = 5;
    // nav
    let singleCharacter: Selection<HTMLElement>;

    // tslint:disable-next-line:interface-name
    interface Line {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        tooltipInfo: VisualTooltipDataItem[];
    }

  // tslint:disable-next-line:interface-name
    export interface GanttCalculateScaleAndDomainOptions {
    viewport: IViewport;
    margin: IMargin;
    showCategoryAxisLabel: boolean;
    showValueAxisLabel: boolean;
    forceMerge: boolean;
    categoryAxisScaleType: string;
    valueAxisScaleType: string;
    trimOrdinalDataOnOverflow: boolean;
    forcedTickCount?: number;
    // tslint:disable-next-line:no-any
    forcedYDomain?: any[];
    // tslint:disable-next-line:no-any
    forcedXDomain?: any[];
    // tslint:disable-next-line:no-any
    ensureXDomain?: any;
    // tslint:disable-next-line:no-any
    ensureYDomain?: any;
    categoryAxisDisplayUnits?: number;
    categoryAxisPrecision?: number;
    valueAxisDisplayUnits?: number;
    valueAxisPrecision?: number;
}

    /**
     * Gets property value for a particular object.
     *
     * @function
     * @param {DataViewObjects} objects - Map of defined objects.
     * @param {string} objectName       - Name of desired object.
     * @param {string} propertyName     - Name of desired property.
     * @param {T} defaultValue          - Default value of desired property.
     */
    export function getValue<T>(objects: DataViewObjects,
                                objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            let object: DataViewObject;
            object = objects[objectName];
            if (object) {
                let property: T;
                property = object[propertyName] as T;
                if (property !== undefined) {
                    return property;
                }
            }
        }

        return defaultValue;
    }

    module Selectors {
        export const className: ClassAndSelector = createClassAndSelector("gantt");
        export const chart: ClassAndSelector = createClassAndSelector("gantt_chart");
        export const chartLine: ClassAndSelector = createClassAndSelector("gantt_chart-line");
        export const body: ClassAndSelector = createClassAndSelector("gantt-body");
        export const axisGroup: ClassAndSelector = createClassAndSelector("gantt_axis");
        export const domain: ClassAndSelector = createClassAndSelector("gantt_domain");
        export const axisTick: ClassAndSelector = createClassAndSelector("gantt_tick");
        // tslint:disable-next-line:no-shadowed-variable
        export const tasks: ClassAndSelector = createClassAndSelector("gantt_tasks");
        export const taskGroup: ClassAndSelector = createClassAndSelector("gantt_task-group");
        export const singleTask: ClassAndSelector = createClassAndSelector("gantt_task");
        export const singlePhase: ClassAndSelector = createClassAndSelector("gantt_phase");
        export const taskRect: ClassAndSelector = createClassAndSelector("gantt_task-rect");
        export const taskResource: ClassAndSelector = createClassAndSelector("gantt_task-resource");
        export const errorPanel: ClassAndSelector = createClassAndSelector("gantt_errorPanel");
        export const taskLines: ClassAndSelector = createClassAndSelector("gantt_task-lines");
        export const kpiLines: ClassAndSelector = createClassAndSelector("gantt_kpi-lines");
        export const label: ClassAndSelector = createClassAndSelector("gantt_label");
        export const legendItems: ClassAndSelector = createClassAndSelector("gantt_legendItem");
        export const legendTitle: ClassAndSelector = createClassAndSelector("gantt_legendTitle");
        export const toggleTask: ClassAndSelector = createClassAndSelector("gantt_toggle-task");
        export const toggleTaskGroup: ClassAndSelector = createClassAndSelector("gantt_toggle-task-group");
        export const barPanel: ClassAndSelector = createClassAndSelector("gantt_barPanel");
        export const taskPanel: ClassAndSelector = createClassAndSelector("gantt_taskPanel");
        export const kpiPanel: ClassAndSelector = createClassAndSelector("gantt_kpiPanel");
        export const timeLinePanel: ClassAndSelector = createClassAndSelector("gantt_timelinePanel");
        export const bottomPannel: ClassAndSelector = createClassAndSelector("gantt_bottomPanel");
        export const imagePanel: ClassAndSelector = createClassAndSelector("gantt_imagePanel");
        export const kpiImagePanel: ClassAndSelector = createClassAndSelector("gantt_kpiImagePanel");
        export const drillAllPanel: ClassAndSelector = createClassAndSelector("gantt_drillAllPanel");
        export const drillAllPanel2: ClassAndSelector = createClassAndSelector("gantt_drillAllPanel2");
        export const drillAllSvg: ClassAndSelector = createClassAndSelector("gantt_drillAllSvg");
        export const drillAllSvg2: ClassAndSelector = createClassAndSelector("gantt_drillAllSvg2");
        export const kpiTitlePanel: ClassAndSelector = createClassAndSelector("gantt_kpiTitlePanel");
        export const bottomMilestonePanel: ClassAndSelector = createClassAndSelector("gantt_bottomMilestonePanel");
        export const kpiSvg: ClassAndSelector = createClassAndSelector("gantt_kpiSvg");
        export const backgroundBoxSvg: ClassAndSelector = createClassAndSelector("gantt_backgroundBox");
        export const taskSvg: ClassAndSelector = createClassAndSelector("gantt_taskSvg");
        export const barSvg: ClassAndSelector = createClassAndSelector("gantt_barSvg");
        export const timeLineSvg: ClassAndSelector = createClassAndSelector("gantt_timelineSvg");
        export const imageSvg: ClassAndSelector = createClassAndSelector("gantt_imageSvg");
        export const bottomMilestoneSvg: ClassAndSelector = createClassAndSelector("gantt_bottomMilestoneSvg");
        export const bottomMilestoneGroup: ClassAndSelector = createClassAndSelector("gantt_bottom-milestone-group");
        export const bottomTaskDiv: ClassAndSelector = createClassAndSelector("gantt_bottomTaskDiv");
        export const bottomTaskSvg: ClassAndSelector = createClassAndSelector("gantt_bottomTaskSvg");
        export const gridGroup: ClassAndSelector = createClassAndSelector("gantt_grids");
        export const todayIndicator: ClassAndSelector = createClassAndSelector("gantt_today-indicator");
        export const todayText: ClassAndSelector = createClassAndSelector("gantt_today-text");
        export const todayGroup: ClassAndSelector = createClassAndSelector("gantt_today-group");
        export const legendPanel: ClassAndSelector = createClassAndSelector("gantt_legendPanel");
        export const legendSvg: ClassAndSelector = createClassAndSelector("gantt_legendSvg");
        export const legendGroup: ClassAndSelector = createClassAndSelector("gantt_legendGroup");
        export const legendText: ClassAndSelector = createClassAndSelector("gantt_legendText");
        export const legendIndicatorPanel: ClassAndSelector = createClassAndSelector("gantt_legendIndicatorPanel");
        export const legendIndicatorTitlePanel: ClassAndSelector
        = createClassAndSelector("gantt_legendIndicatorTitlePanel");
        export const legendIndicatorTitleSvg: ClassAndSelector
        = createClassAndSelector("gantt_legendIndicatorTitleSvg");
        export const kpiIndicatorPanel: ClassAndSelector
        = createClassAndSelector("gantt_kpiIndicatorPanel");
        export const kpiIndicatorSvg: ClassAndSelector = createClassAndSelector("gantt_kpiIndicatorSvg");
        export const milestoneIndicatorPanel: ClassAndSelector
         = createClassAndSelector("gantt_milestoneIndicatorPanel");
        export const milestoneIndicatorSvg: ClassAndSelector = createClassAndSelector("gantt_milestoneIndicatorSvg");
        export const phaseIndicatorPanel: ClassAndSelector = createClassAndSelector("gantt_phaseIndicatorPanel");
        export const phaseIndicatorSvg: ClassAndSelector = createClassAndSelector("gantt_phaseIndicatorSvg");
    }

    module GanttRoles {
        export const category: string = "Category";
        export const startDate: string = "StartDate";
        export const endDate: string = "EndDate";
        export const kpiValueBag: string = "KPIValueBag";
        export const resource: string = "Resource";
        export const tooltip: string = "Tooltip";
    }
    /**
     * export class Gantt implements IVisual
     */
    export class Gantt implements IVisual {
        public static defaultValues: any = {
            AxisTickSize: 6,
            DateFormatStrings: {
                Day: "MMM dd hh:mm tt",
                Month: "MMM yyyy",
                Quarter: "MMM yyyy",
                Week: "MMM dd",
                Year: "yyyy"
            },
            DefaultDateType: "Month",
            MaxTaskOpacity: 1,
            MinTaskOpacity: 0.4,
            ProgressBarHeight: 4,
            ResourceWidth: 100,
            TaskColor: "#00B099",
            TaskLineWidth: 15
        };
         private static tasknew: any[] = [];
         private static selectionIdHash: boolean[] = [];
         private static expandCollapseStates: {} = {};
         private static globalOptions: VisualUpdateOptions;
         private static previousSel: string;
         private static typeColors: string[] = ["#2c84c6", "#4c4d4e", "#4d4d00", "#cd6600", "#f08080",
             "#cea48b", "#8f4c65", "#af9768", "#42637f", "#491f1c", "#8e201f",
             "#20b2aa", "#999966", "#bd543f", "#996600"];
         private static axisHeight: number = 43;
         private static bottomMilestoneHeight: number = 23;
         private static scrollHeight: number = 17;
         private static defaultTicksLength: number = 45;
         private static defaultDuration: number = 250;
         private static taskLineCoordinateX: number = 15;
         private static axisLabelClip: number = 20;
         private static axisLabelStrokeWidth: number = 1;
         private static taskResourcePadding: number = 4;
         private static barHeightMargin: number = 5;
         private static chartLineHeightDivider: number = 4;
         private static resourceWidthPadding: number = 10;
         private static taskLabelsMarginTop: number = 15;
         private static complectionMax: number = 1;
         private static complectionMin: number = 0;
         private static complectionTotal: number = 100;
         private static minTasks: number = 1;
         private static chartLineProportion: number = 1.5;
         private static milestoneTop: number = 0;
         private static taskLabelWidth: number = 0;
         private static kpiLabelWidth: number;
         private static taskLabelWidthOriginal: number = 0;
         private static kpiLabelWidthOriginal: number = 0;
         private static visualWidth: number = 0;
         private static isPhaseHighlighted: boolean = false;
         private static isLegendHighlighted: boolean = false;
         private static xAxisPropertiesParamter: IAxisPropertiesParameter;
         private static visualCoordinates: IVisualProperty;
         private static earliestStartDate: Date = new Date();
         private static lastestEndDate: Date = new Date();
         private static maxSafeInteger: number = 9007199254740991;
         private static minSafeInteger: number = -9007199254740991;
         private static dataMIN: number = Gantt.maxSafeInteger;
         private static dataMAX: number = Gantt.minSafeInteger;
         private static drillLevelPadding: number = 10;
         private static colorsIndex: number = 0;
         private static totalTasksNumber: number = 0;
         private static currentTasksNumber: number = 0;
         private static minTasksNumber: number = 0;
         private static singleCharacterWidth: number = 0;
         private static maxTaskNameLength: number = 0;
         private static totalDrillLevel: number = 0;
         private static totalTicks: number = 0;
         private static isAllExpanded: boolean = true;
         private static isSubRegionFilteredData: boolean = false;
         private static isProjectFilteredData: boolean = false;
         private static isIncorrectHierarchy: boolean = false;
         private static isPlannedBarPresent: boolean = false;
         private static phaseNames: string[] = [];
         private static milestoneNames: string[] = [];
         private static milestoneShapes: string[] = ["circle", "diamond", "star", "triangle"];
         private static milestoneColor: string[] = ["#0000ff", "#cd00ff", "#78f4ff", "#ff0099"];
         private static milestoneSize: number[] = [20, 14, 18, 16];
         private static isScrolled: boolean = false;
         private static currentSelectionState: any = {};
         private static totalLegendSelected: number = 0;
         private static totalLegendPresent: number = 0;
         private static formatters: IGanttChartFormatters;
         private static multipleSelectFlag: boolean = false;
         private static prevSelectionCount: number = 0;
         private static isDateData: boolean = false;
         private static expandImage: string =
             "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsSAAALEgHS"
             + "3X78AAAA10lEQVQoz5WRwVHDUAxE3zfcyY0jdICpIM6NW9wBLiEd7GwH7gBTAaED04HpIOnAVPC5yJmPhwPoJD3NalZ"
             + "Syjnzn7i2vQGOUc9AB2yAYWGS2kVQSZqjuQX2QC/pFEO2wN72cBEASBqA12DPtg+S+hXrAFK5g+0JeIhyB0zAWLDHarV"
             + "TU+THsNsWbFwLDkU+/ML6iyXbLfAWjQ9JTfh+CfYuqU05Z2zX4fUGOAM1cF+wT6CRNF+llJY/3AFfwFP8YwRug7Vxaqr"
             + "C5y6mTMG6YHXBfp71L/EN44hU/TumF5gAAAAASUVORK5CYII=";
         private static collapseImage: string =
             "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBI"
             + "WXMAAAsSAAALEgHS3X78AAAA3ElEQVQoz5WSwVHDQAxF3xru5MYROkjowLlxdAcxHZgKfn4H7g"
             + "BTAaGD0IHTQejAVLBctDM7vkW3/yTtH0mbcs7cEve1sD0AXchR0sn2EWgLS8XBdgd8ReJHUmu7"
             + " Bz6CfUvqUs4Z2zvgDDwAv8AOeK7YBWglLXcppQ1wAp6AP+AVWKL4MVgn6QrQACOwDdujpBmY4g"
             + " GAIRh1Q4ne9mbFhnoxTXS/hd7Gds7Ae2G2p9oBSRPwGexge5A0rlgPkOrD2Z6refbAHMMX9tKs"
             + " DtlG4R64SlrikIUt6dav8Q99qlfX01xJpAAAAABJRU5ErkJggg==";
         private static drillDownImage: string =
             "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFW"
             + "HRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAA"
             + "AAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8"
             + "+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUC"
             + "BDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gP"
             + "HJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50"
             + "YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8"
             + "vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS"
             + "94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zV"
             + "HlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIw"
             + "MTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc3MkFFQkJBM0JFODExRTc"
             + "5NTJDOUZDRTZDOTFFRjQ4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjc3MkFFQkJCM0JFOD"
             + "ExRTc5NTJDOUZDRTZDOTFFRjQ4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlS"
             + "UQ9InhtcC5paWQ6NzcyQUVCQjgzQkU4MTFFNzk1MkM5RkNFNkM5MUVGNDgiIHN0UmVmOmRvY3Vt"
             + "ZW50SUQ9InhtcC5kaWQ6NzcyQUVCQjkzQkU4MTFFNzk1MkM5RkNFNkM5MUVGNDgiLz4gPC9yZGY"
             + "6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz"
             + "4K7pvnAAAAVklEQVR42mJMS0ubzsDAkMFAHJjBBCSyQAxiFIPUMp89e5bB2Nh4G5AjDsQm+BTPm"
             + "jXrPzOIR0ATXDGIwwwTxaEJRTEIMKLbDQwEkNg0KBdFMQgABBgAaoAhSxcNKH0AAAAASUVORK5CYII=";
         private static drillUpImage: string =
             "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFWH"
             + "RTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAA"
             + "AAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+ID"
             + "x4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3"
             + "JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZj"
             + "pSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbn"
             + "MjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYW"
             + "RvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS"
             + "4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZX"
             + "NvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbm"
             + "Rvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjREMjk2MDhDM0JFODExRTc4QTVFODdENT"
             + "ZDMzAyQjJEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjREMjk2MDhEM0JFODExRTc4QTVFOD"
             + "dENTZDMzAyQjJEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paW"
             + "Q6NEQyOTYwOEEzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC"
             + "5kaWQ6NEQyOTYwOEIzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiLz4gPC9yZGY6RGVzY3JpcHRpb2"
             + "4+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5N9DX0AAAATElEQV"
             + "R42mJkwALS0tI6gBQ/EGfNmjXrP7IcMw7F5UBsAsTixsbG286ePYtdA5JiGMDQxIxHMVZNjAQUI4"
             + "MZID+xEKkYBDJABECAAQB/1x1ybiu+cQAAAABJRU5ErkJggg==";
         private static drillDownAllImage: string =
             "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMA"
             + "AAsSAAALEgHS3X78AAAA00lEQVQoz22PUY0CQRBE3xH+QQIOwAFIwAGcAvYUVLcC1sHuOeAcIGElIG"
             + "EdNB/XkwwDnUwynaqamkdEYGadmZ0jgk/HzM5mZhHBgv9ZA4O79zTj7iMwlH3Z6Bd33wHH3O/AtjaU"
             + "hh74y/semIBHZf5ND18RUdcboKb1R1L/8qU0PiSZu0/AmPpR0t3dO2AtyRbVS4O7j5JuwC7PlNDXlq"
             + "HMKRvmCvpUG5YV9CbFbQIDrAq0JPsE3dX1Od+SCtNrIEMH4JbrQdJU62+BDG2AWdLcak/tkG3X3uJZ"
             + "XAAAAABJRU5ErkJggg==";
         private static drillUpAllImage: string =
             "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAA"
             + "AsSAAALEgHS3X78AAAA10lEQVQoz32Q0W3CUAxFD4j/dIRs0LJBOkGzQcMGdIIbb8AGfRuUTlA6QekG"
             + "ZQMygfnAAet91JIlyzr21b0LdyeXmT0AOwBJA1Ut8oGZPQEFeIzVL9BJOs/MMsE9cEgwMf/Fo/tBwB9"
             + "AE/sN8BZzA/wEc1OYP5yAtaQiaQc8A1NmVkn+G+hDcQ+cgW2A+9pDkdQBLXAEXoDX8ATQRRj3lMxsiD"
             + "ibKskJ6CUdsukBeA94CtObZPqrNt1WuRdJBVjXppdJ+jPg47yIuY1H13J3xnFs3Z3/emYuR+Rr0nbFP"
             + "j4AAAAASUVORK5CYII=";
         private static legendIcon: string =
             "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciI"
             + "HZpZXdCb3g9IjAgMCA1NC41IDQ2Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6Z3JheTt9PC9zdHls"
             + "ZT48L2RlZnM+PHRpdGxlPkFzc2V0IDI8L3RpdGxlPjxnIGlkPSJMYXllcl8yIiBkYXRhLW5hbWU9Ikx"
             + "heWVyIDIiPjxnIGlkPSJMYXllcl8xLTIiIGRhdGEtbmFtZT0iTGF5ZXIgMSI+PHJlY3QgY2xhc3M9Im"
             + "Nscy0xIiB3aWR0aD0iNTQuNSIgaGVpZ2h0PSI4LjMiLz48cmVjdCBjbGFzcz0iY2xzLTEiIHk9IjE4L"
             + "jg1IiB3aWR0aD0iNTQuNSIgaGVpZ2h0PSI4LjMiLz48cmVjdCBjbGFzcz0iY2xzLTEiIHk9IjM3Ljci"
             + "IHdpZHRoPSI1NC41IiBoZWlnaHQ9IjguMyIvPjwvZz48L2c+PC9zdmc+";

         private static plusIcon: string =
             "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAJUlEQVR42mNgAIL"
             + "y8vL/DLgASBKnApgkVgXIkhgKiNKJ005s4gDLbCZBiSxfygAAAABJRU5ErkJggg==";

         private static minusIcon: string =
             "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAG0lEQVR42mNg"
             + "wAfKy8v/48I4FeA0AacVDFQBAP9wJkE/KhUMAAAAAElFTkSuQmCC";
        private static updateCount: number = 0;
        private static isResizeStarted: boolean = false;
        private static stateValue: any = [];
        private static arrOptimized = [];
        private static oOptimizedObj: IShowData;
         private static columnHeaderBgColor: any;
         private static iHeaderSingleCharWidth: number = 4;
         private static iKPIHeaderSingleCharWidth: number = 4;
         private static categoriesTitle: string[] = [];
         private static columnWidth: number;
         private static categoryColumnsWidth: string;
         private static minDisplayRatio: number;
         private static currentDisplayRatio: number;
         private static prevDisplayRatio: number;
         private static numberOfCategories: number;
         private static isKpiPresent: boolean;
         private static viewModelNew: IGanttViewModel;
         private static sortLevel: number = 0;
         private static sortOrder: string = "asc";
         private static sortDescOrder: string =
             "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFWHRTb"
             + "2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/"
             + "eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1"
             + "ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMT"
             + "M4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6c"
             + "mRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNj"
             + "cmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjA"
             + "vIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZW"
             + "Y9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhd"
             + "G9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlE"
             + "PSJ4bXAuaWlkOjc3MkFFQkJBM0JFODExRTc5NTJDOUZDRTZDOTFFRjQ4IiB4bXBNTTpEb2N1bWVudEl"
             + "EPSJ4bXAuZGlkOjc3MkFFQkJCM0JFODExRTc5NTJDOUZDRTZDOTFFRjQ4Ij4gPHhtcE1NOkRlcml2ZW"
             + "RGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NzcyQUVCQjgzQkU4MTFFNzk1MkM5RkNFNkM5M"
             + "UVGNDgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzcyQUVCQjkzQkU4MTFFNzk1MkM5RkNFNkM5"
             + "MUVGNDgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2t"
             + "ldCBlbmQ9InIiPz4K7pvnAAAAVklEQVR42mJMS0ubzsDAkMFAHJjBBCSyQAxiFIPUMp89e5bB2Nh4G5"
             + "AjDsQm+BTPmjXrPzOIR0ATXDGIwwwTxaEJRTEIMKLbDQwEkNg0KBdFMQgABBgAaoAhSxcNKH0AAAAAS"
             + "UVORK5CYII=";
         private static sortAscOrder: string =
             "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFWHRTb2"
             + "Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eH"
             + "BhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldG"
             + "EgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4ID"
             + "c5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPS"
             + "JodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdG"
             + "lvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bW"
             + "xuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dH"
             + "A6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD"
             + "0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaW"
             + "lkOjREMjk2MDhDM0JFODExRTc4QTVFODdENTZDMzAyQjJEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZG"
             + "lkOjREMjk2MDhEM0JFODExRTc4QTVFODdENTZDMzAyQjJEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0Um"
             + "VmOmluc3RhbmNlSUQ9InhtcC5paWQ6NEQyOTYwOEEzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiIHN0Um"
             + "VmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NEQyOTYwOEIzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiLz4gPC"
             + "9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz"
             + "5N9DX0AAAATElEQVR42mJkwALS0tI6gBQ/EGfNmjXrP7IcMw7F5UBsAsTixsbG286ePYtdA5JiGMDQxI"
             + "xHMVZNjAQUI4MZID+xEKkYBDJABECAAQB/1x1ybiu+cQAAAABJRU5ErkJggg==";
         private static sortDefaultIcon: string = Gantt.sortAscOrder;
         private static prevSortedColumn: number = -1;
         private static legendWidth: number = 90;
         private static maximumNormalizedFontSize: number = 19;
         private static maximumFontSize: number = 40;
         private static isSelected: boolean = false;
         private static regionValueFormatter: IValueFormatter;
         private static datalabelValueFormatter: IValueFormatter;
         private static metroValueFormatter: IValueFormatter;
         private static projectValueFormatter: IValueFormatter;
         private static trancheValueFormatter: IValueFormatter;
         private static lastSelectedbar: number = null;
         private static categorylength: number = null;
         private static ganttDiv: Selection<HTMLElement>;
        // tslint:disable-next-line:typedef
        private static arrGantt = [];
        private static ganttLen: number = null;
        private static errorDiv: Selection<HTMLElement>;
        private static errorText: Selection<HTMLElement>;
        private static get DefaultMargin(): IMargin {
             return {
                 bottom: 40,
                 left: 20,
                 right: 40,
                 top: 50

             };
         }
         private static hasRole(column: DataViewMetadataColumn, name: string): boolean {
            // tslint:disable-next-line:no-any
            let roles: any;
            roles = column.roles;

            return roles && roles[name];
        }

        /**
         * Determines whether the actual date is forecast date or a past date
         * @param actualDate date which is actual date
         */
        private static isDateForecast(actualDate: Date): boolean {

            const todayDate: Date = new Date();

            return (todayDate < actualDate ? true : false);
        }

        /**
         * Get the tooltip info (data display names & formated values)
         * @param task All task attributes.
         * @param formatters Formatting options for gantt attributes.
         */
        // tslint:disable-next-line:cyclomatic-complexity
        private static getTooltipInfo(
            phase: ITask, formatters: IGanttChartFormatters,
            dataView: DataView, taskIndex: number, timeInterval: string = "Days"): VisualTooltipDataItem[] {
            let tooltipDataArray: VisualTooltipDataItem[] = [];
            let formattedDate: string = "";
            const formattedDataLabel: string = "";
            let prefixStartText: string;
            let prefixEndText: string;
            let prefixDurationText: string;
            let tooltipIndex: string[];
            let oColumns: DataViewMetadataColumn[];
            let categorical: DataViewCategorical;
            let displayName: string;
            // tslint:disable-next-line:no-any
            let oMap: any;
            prefixStartText = "Actual";
            prefixEndText = "Actual";
            prefixDurationText = "Forecast";
            tooltipIndex = [];
            categorical = dataView.categorical;
            oColumns = dataView.metadata.columns;
            oMap = {};
            let iColumnLength: number;
            iColumnLength = oColumns.length;
            taskIndex = phase.id;
            for (let iColumnCount: number = 0; iColumnCount < iColumnLength; iColumnCount++) {
                if (oColumns[iColumnCount].roles[GanttRoles.tooltip]) {
                    displayName = oColumns[iColumnCount].displayName;
                    if (!oMap[displayName]) {
                        tooltipIndex.push(displayName);
                        oMap[displayName] = 1;
                    }
                }
            }
            tooltipDataArray = [];
            let tooltipIndexLength: number;
            tooltipIndexLength = tooltipIndex.length;
            if (dataView.metadata.objects === undefined ||
                dataView.metadata.objects.taskLabels === undefined ||
                 !dataView.metadata.objects.taskLabels.isHierarchy) {
                for (let iTooltipIndexCount: number = 0; iTooltipIndexCount
                     < tooltipIndexLength; iTooltipIndexCount++) {
                    // tslint:disable-next-line:prefer-const
                    let iCatLength: number = categorical.categories.length;
                    for (let iCatCount: number = 0; iCatCount < iCatLength; iCatCount++) {
                        if (categorical.categories[iCatCount].source.displayName === tooltipIndex[iTooltipIndexCount]) {
                            if (categorical.categories[iCatCount].values[taskIndex] === null) {
                                categorical.categories[iCatCount].values[taskIndex] = "(Blank)";
                            }
                            if (categorical.categories[iCatCount].values[taskIndex]
                                && categorical.categories[iCatCount].values[taskIndex] !== null
                                && oMap[tooltipIndex[iTooltipIndexCount]] === 1) {
                                let iValueFormatter: IValueFormatter;
                                if (categorical.categories[iCatCount].source.format) {
                                    iValueFormatter = ValueFormatter.create({
                                        format: categorical.categories[iCatCount].source.format });
                                    const flag: boolean = dateFormat.test(
                                        categorical.categories[iCatCount].values[taskIndex].toString()) ?
                                        true : false;
                                    tooltipDataArray.push({
                                        displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                        value: flag ?
                                            iValueFormatter.format(new Date(
                                                categorical.categories[iCatCount].values[taskIndex].toString())) :
                                            iValueFormatter.format(categorical.categories[iCatCount].values[taskIndex])
                                    });
                                } else {
                                    tooltipDataArray.push({
                                        displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                        value: categorical.categories[iCatCount].values[taskIndex].toString()
                                    });
                                }
                                oMap[tooltipIndex[iTooltipIndexCount]] = 0;
                            }
                        }
                    }
                    const iValLength: number = categorical.values.length;
                    for (let iValCount: number = 0; iValCount < iValLength; iValCount++) {
                        if (categorical.values[iValCount].source.displayName === tooltipIndex[iTooltipIndexCount]) {
                            if (categorical.values[iValCount].values[taskIndex] === null) {
                                categorical.values[iValCount].values[taskIndex] = "(Blank)";
                            }
                            if (categorical.values[iValCount].values[taskIndex] &&
                                categorical.values[iValCount].values[taskIndex] !== null &&
                                oMap[tooltipIndex[iTooltipIndexCount]] === 1) {
                                let iValueFormatter: IValueFormatter;

                                if (categorical.values[iValCount].source.format) {
                                    iValueFormatter = ValueFormatter.create({
                                         format: categorical.values[iValCount].source.format });
                                    const flag: boolean = dateFormat.test
                                    (categorical.values[iValCount].values[taskIndex].toString()) ?
                                        true : false;
                                    tooltipDataArray.push({
                                        displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                        value: flag ?
                                            iValueFormatter.format(new Date
                                                (categorical.values[iValCount].values[taskIndex].toString())) :
                                            iValueFormatter.format(categorical.values[iValCount].values[taskIndex])
                                    });
                                } else {
                                    let tooltipValues: string;
                                    if (phase.tooltipInfo === null || phase.tooltipInfo.toString() === "") {
                                        tooltipValues =
                                        categorical.values[iValCount].values[taskIndex].toString();
                                        tooltipDataArray.push({
                                            displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                            value: tooltipValues
                                        });
                                    } else {
                                        // tslint:disable-next-line:no-any
                                        const tooltipvalue: any[] = [];
                                        for (let j: number = 0; j < phase.tooltipInfo.length; j++) {
                                            tooltipValues = phase.tooltipInfo[j].value;
                                            tooltipvalue[j] = tooltipValues;
                                        }
                                        tooltipDataArray.push({
                                            displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                            value: tooltipvalue[iTooltipIndexCount].toString()
                                        });
                                    }
                                }
                                oMap[tooltipIndex[iTooltipIndexCount]] = 0;
                            } else {
                                if (oMap[tooltipIndex[iTooltipIndexCount]] === 1) {
                                    tooltipDataArray.push({
                                        displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                        value: categorical.values[iValCount].values[taskIndex].toString()
                                    });
                                }
                            }
                        }
                    }
                }
            } else {
                for (const i of phase.tooltipValues) {
                    tooltipDataArray.push({
                        displayName: i.name.toString(),
                        value: i.value.toString()
                    });
                }
            }
            /** Added Date format */
            if (phase.start != null) {
                formattedDate = ValueFormatter.format(
                    new Date(phase.start.toString()),
                    dataView.categorical.values[0].source.format);
                tooltipDataArray.push({ displayName: "Start", value: formattedDate });

                formattedDate = ValueFormatter.format(
                    new Date(phase.end.toString()),
                    dataView.categorical.values[1].source.format);
                tooltipDataArray.push({ displayName: "End", value: formattedDate });
            } else if (phase.start === null) {
                tooltipDataArray.push({ displayName: "Start",
                 value: formatters.startDataFormatter.format(phase.numStart) });
                tooltipDataArray.push({ displayName: "End",
                 value: formatters.endDataFormatter.format(phase.numEnd) });
            }

            return tooltipDataArray;
        }

        /**
         * Check if task has data for task
         * @param dataView
         */
        private static isChartHasTask(dataView: DataView): boolean {
            if (dataView.metadata &&
                dataView.metadata.columns) {
                let column: DataViewMetadataColumn;
                column = null;
                for (column of dataView.metadata.columns) {
                    if (Gantt.hasRole(column, GanttRoles.category)) {
                        return true;
                    }
                }
            }

            return false;
        }

        /**
         * Check if task has data for data labels
         * @param dataView
         */
        private static isChartHasDataLabels(dataView: DataView): boolean {
            if (dataView.metadata &&
                dataView.metadata.columns) {
                let column: DataViewMetadataColumn;
                column = null;
                for (column of dataView.metadata.columns) {
                    if (Gantt.hasRole(column, GanttRoles.resource)) {
                        return true;
                    }
                }
            }

            return false;
        }

        /**
         * Returns the chart formatters
         * @param dataView The data Model
         */
        private static getFormatters(dataView: DataView): IGanttChartFormatters {
            const valuesdata: DataViewValueColumn[] = dataView.categorical.values;
            if (!dataView ||
                !dataView.metadata ||
                !dataView.metadata.columns) {
                return null;
            }

            let startDataFormat: string = "d";
            let endDataFormat: string = "d";

            if (valuesdata) {
                let dvValues: DataViewValueColumn;
                dvValues = null;
                for (dvValues of valuesdata) {
                    if (Gantt.hasRole(dvValues.source, GanttRoles.startDate)) {
                        startDataFormat = dvValues.source.format;
                    }
                    if (Gantt.hasRole(dvValues.source, GanttRoles.endDate)) {
                        endDataFormat = dvValues.source.format;
                    }
                }
            }
            let iCount: number;
            let dataValue: number = 999;
            const len: number = valuesdata.length;

            for (iCount = 0; iCount < len; iCount++) {
                if (valuesdata[iCount].source.roles.Resource) {
                    dataValue = iCount;
                    break;
                }
            }
            if (dataValue !== 999) {
                measureFormat = valuesdata[dataValue].source.format;
            }

            return {
                completionFormatter: ValueFormatter.create
                ({ format: percentFormat, value: 1, allowFormatBeautification: true }),
                durationFormatter:
                 ValueFormatter.create({ format: numberFormat }),
                endDataFormatter: ValueFormatter.create({ format: endDataFormat }),
                startDataFormatter: ValueFormatter.create({ format: startDataFormat })
            } as IGanttChartFormatters;
        }

        private static getCategoricalTaskProperty<T>(
            columnSource: DataViewMetadataColumn[],
            // tslint:disable-next-line:no-any
            child: any, propertyName: string, currentCounter: number, sortOrder: number = 0): T {
            if (!child ||
                !columnSource ||
                !(columnSource.length > 0) ||
                !columnSource[0].roles) {
                return null;
            }

            let finalIndex = child.indexOf(child.filter((x) => x.source.roles[propertyName])[0]);
            if (-1 !== sortOrder) {
                finalIndex = child
                .indexOf(child.filter((x) => x.source.roles[propertyName] && x.source.sortOrder === sortOrder)[0]);
            }
            if (finalIndex === -1) {
                return null;
            }

            let data: any;
            data = child[finalIndex].values[currentCounter];
            if (dateFormat.test(data)) {
                data = new Date(child[finalIndex].values[currentCounter]);
            }

            return data;
        }
        /**
         * Create task objects dataView
         * @param dataView The data Model.
         * @param formatters task attributes represented format.
         * @param series An array that holds the color data of different task groups.
         */
        private static createTasks(dataView: DataView, host: IVisualHost,
                                   formatters: IGanttChartFormatters, colorPalette: IColorPalette
            // tslint:disable-next-line
            , settings: IGanttSettings, barsLegend: ILegend, viewport: any): ITask[] {
            const metadataColumns: GanttColumns<DataViewMetadataColumn> = GanttColumns.getColumnSources(dataView);
            let columns: GanttColumns<GanttCategoricalColumns>;
            columns = GanttColumns.getCategoricalColumns(dataView);
            const columnSource: DataViewMetadataColumn[] = dataView.metadata.columns;
            // tslint:disable-next-line:no-any
            let categoriesdata: any;
            categoriesdata = dataView.categorical.categories;
            const iRow: number = 0;
            let valuesdata: DataViewValueColumn[];
            valuesdata = dataView.categorical.values;
            let kpiRoles: number[];
            kpiRoles = [];
            let tooltipRoles: number[];
            tooltipRoles = [];
            let categoryRoles: number[];
            categoryRoles = [];
            if (!categoriesdata || categoriesdata.length === 0) { return; }

            Gantt.categoriesTitle = [];
            // tslint:disable-next-line:no-shadowed-variable
            let tasks: ITask[] = [];
            let hashArr: ITask[];
            const kpiValuesNames: string[] = [];
            const tooltipValuesName: string[] = [];
            const categoryNames: string[] = [];

            // tslint:disable-next-line:no-any
            categoriesdata.map((child: any, index: number) => {
                // Logic to add roles
                if (child.source.roles[GanttRoles.category]) {
                    // If roles are are already present then not allowed to enter again
                    if (!(categoryNames.indexOf(categoriesdata[index].source.displayName) > -1)) {
                        categoryRoles.push(index);
                        Gantt.categoriesTitle.push(categoriesdata[index].source.displayName);
                        categoryNames.push(categoriesdata[index].source.displayName);
                    }

                }

                if (child.source.roles[GanttRoles.kpiValueBag]) {
                    // If roles are are already present then not allowed to enter again
                    if (!(kpiValuesNames.indexOf(categoriesdata[index].source.displayName) > -1)) {
                        kpiRoles.push(index);
                        kpiValuesNames.push(categoriesdata[index].source.displayName);

                    }
                }
                if (child.source.roles[GanttRoles.tooltip]) {
                    tooltipRoles.push(index);
                    tooltipValuesName.push(categoriesdata[index].source.displayName);
                }
            });

            if (kpiRoles && kpiRoles.length === 0) {
                Gantt.isKpiPresent = false;
            } else {
                Gantt.isKpiPresent = true;
            }

            let largest: number = 0;
            let firstVisit: number = 1;
            let orderOfSorting: string = Gantt.sortOrder;
            Gantt.totalTasksNumber = 0;
            Gantt.maxTaskNameLength = 0;
            Gantt.earliestStartDate = new Date();
            Gantt.lastestEndDate = new Date();
            const regionindex: number = -1;
            const subregionindex: number = -1;
            const projectindex: number = -1;
            const trancheIndex: number = -1;
            const phaseIndex: number = -1;

            // Bars Legend
            // tslint:disable-next-line: no-shadowed-variable
            let legendData: LegendData;
            legendData = {
                dataPoints: [],
                fontSize: 8,
                title: "Legend"
            };

            // tslint:disable-next-line:no-any
            const oUniquelegend: any = [];
            // tslint:disable-next-line:no-any
            const oUnique: any = [];
            Gantt.tasknew = [];
            let legendindex: number;
            const catlength: number = dataView.categorical.categories.length;
            for (let catindex: number = 0; catindex < catlength; catindex++) {
                if (dataView.categorical.categories[catindex].source.roles.hasOwnProperty("Legend")) {
                    legendindex = catindex;
                    break;
                }
            }

            // tslint:disable-next-line:cyclomatic-complexity no-any
            categoriesdata[0].values.map((child: any, index: number) => {
                // tslint:disable-next-line:no-use-before-declare
                legendIndex = -1;
                let startDate: Date = null;
                let endDate: Date = null;
                let datamin: number = null;
                let datamax: number = null;
                if ((Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.startDate, index, -1)
                    && typeof Gantt.getCategoricalTaskProperty<Date>
                        (columnSource, valuesdata, GanttRoles.startDate, index, -1)
                    === typeof this.earliestStartDate) ||
                    (Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.endDate, index, -1)
                        && typeof Gantt.getCategoricalTaskProperty<Date>
                            (columnSource, valuesdata, GanttRoles.endDate, index, -1)
                        === typeof this.earliestStartDate)) {

                    startDate = Gantt.getCategoricalTaskProperty<Date>
                        (columnSource, valuesdata, GanttRoles.startDate, index, -1);
                    endDate = Gantt.getCategoricalTaskProperty<Date>
                        (columnSource, valuesdata, GanttRoles.endDate, index, -1);

                    startDate = startDate ? startDate : new Date();
                    endDate = endDate ? endDate : new Date();
                    Gantt.isDateData = true;
                } else {
                    datamin = Gantt.getCategoricalTaskProperty<number>
                        (columnSource, valuesdata, GanttRoles.startDate, index, -1);
                    datamax = Gantt.getCategoricalTaskProperty<number>
                        (columnSource, valuesdata, GanttRoles.endDate, index, -1);
                    if (datamax == null || datamin > datamax) {
                        datamax = datamin;
                    }
                    if (datamin == null || datamin > datamax) {
                        datamin = datamax;
                    }
                    if (Gantt.getCategoricalTaskProperty<Date>
                        (columnSource, valuesdata, GanttRoles.startDate, index, -1)
                        || Gantt.getCategoricalTaskProperty<Date>
                            (columnSource, valuesdata, GanttRoles.endDate, index, -1)) {
                        Gantt.isDateData = false;
                    }
                }

                let resource: string;
                resource = Gantt.getCategoricalTaskProperty<string>
                    (columnSource, valuesdata, GanttRoles.resource, index, -1);
                let kpiValues: IKPIValues[];
                kpiValues = [];
                let tooltipValues: ITooltipDataValues[];
                tooltipValues = [];
                let taskValues: string[];
                taskValues = [];

                let duration: number = 0;

                for (let kpiValueCounter: number = 0; kpiValueCounter < categoryRoles.length; kpiValueCounter++) {
                    let value: string = "";
                    const maxLength = 15;
                    const minLength = 14;
                    value = categoriesdata[categoryRoles[kpiValueCounter]].values[index] as string;
                    if (value && value !== "0") {
                        value = value ? value : "";
                    } else if (parseInt(value, 10) === 0) {
                        value = "0";
                    } else {
                        value = value ? value : "";
                    }

                    if (kpiValueCounter === 0) {
                        Gantt.regionValueFormatter = ValueFormatter.create({
                            format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                        });
                    } else if (kpiValueCounter === 1) {
                        Gantt.metroValueFormatter = ValueFormatter.create({
                            format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                        });
                    } else if (kpiValueCounter === 2) {
                        Gantt.projectValueFormatter = ValueFormatter.create({
                            format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                        });
                    } else {
                        Gantt.trancheValueFormatter = ValueFormatter.create({
                            format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                        });
                    }
                    taskValues.push(value);
                    value = (value === "" ? "(Blank)" : value);

                    if (typeof (value) === "object" &&
                        categoriesdata[categoryRoles[kpiValueCounter]].values[index].toString().length
                        > Gantt.maxTaskNameLength) {
                        Gantt.maxTaskNameLength =
                            categoriesdata[categoryRoles[kpiValueCounter]].values[index].toString().length < maxLength ?
                                categoriesdata[categoryRoles[kpiValueCounter]].values[index]
                                .toString().length : minLength;
                    }

                    if (value.length > Gantt.maxTaskNameLength) {
                        Gantt.maxTaskNameLength = value.length < maxLength ? value.length : minLength;
                    }
                }

                const kpiRolesLength: number = kpiRoles.length;

                for (let kpiValueCounter: number = 0; kpiValueCounter < kpiRolesLength; kpiValueCounter++) {
                    const name: string = categoriesdata[kpiRoles[kpiValueCounter]].source.displayName as string;
                    const format: string = dataView.categorical.categories[kpiRoles[kpiValueCounter]].source.format;
                    let value: string = categoriesdata[kpiRoles[kpiValueCounter]].values[index] as string;

                    if (format !== undefined) {
                        if (dateFormat.test(value)) {
                            value = ValueFormatter.format(new Date(value.toString()), format);
                        } else {
                            value = ValueFormatter.format(value, format);
                        }
                    }
                    kpiValues.push({
                        name,
                        value
                    });
                }
                const tooltipRolesLength: number = tooltipRoles.length;

                for (let tooltipValueCounter: number = 0;
                    tooltipValueCounter < tooltipRolesLength; tooltipValueCounter++) {
                    let name: string;
                    name = categoriesdata[kpiRoles[tooltipValueCounter]].source.displayName as string;
                    let value: string;
                    value = categoriesdata[kpiRoles[tooltipValueCounter]].values[index] as string;
                    tooltipValues.push({
                        name,
                        value
                    });
                }

                if (startDate < Gantt.earliestStartDate && startDate !== null) {
                    Gantt.earliestStartDate = startDate;
                }
                if (endDate > Gantt.lastestEndDate && endDate !== null) {
                    Gantt.lastestEndDate = endDate;
                }

                if (datamin !== null && datamin < Gantt.dataMIN) {
                    Gantt.dataMIN = datamin;
                }
                if (datamax !== null && datamax > Gantt.dataMAX) {
                    Gantt.dataMAX = datamax;
                }

                if (startDate != null) {
                    let timeDiff: number;
                    timeDiff = endDate.getTime() - startDate.getTime();
                    duration = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (0 > duration) {
                        duration = 0;
                    } else if (0 === duration) {
                        duration = 1;
                    }

                } else if (datamin != null) {
                    let valuediffer: number;
                    valuediffer = datamax - datamin;
                    duration = valuediffer;
                }

                // tslint:disable-next-line:no-shadowed-variable
                const categories: DataViewCategoryColumn[] = dataView.categorical.categories;
                // tslint:disable-next-line:typedef
                categories.forEach((datum: DataViewCategoricalColumn, ka: number) => {
                    if (datum.source.roles.Legend) {
                        // tslint:disable-next-line:no-use-before-declare
                        legendIndex = ka;
                    }
                });
                // tslint:disable-next-line:no-any
                let legendUniqueValues: any[] = [];
                // tslint:disable-next-line
                if (legendIndex !== -1) {
                    // tslint:disable-next-line
                    legendUniqueValues = (dataView.categorical.categories[legendIndex].values).filter(function (e, i, arr) {
                        return arr.lastIndexOf(e) === i;
                    });
                }
                // tslint:disable-next-line
                const label: string = legendIndex !== -1 ? dataView.categorical.categories[legendIndex].values[index] === null ?
                    // tslint:disable-next-line:no-use-before-declare
                    "Null" : dataView.categorical.categories[legendIndex].values[index].toString() : "Null";
                const catPresent: boolean = label in colorsPersistObject;
                const defaultColor: Fill = {
                    solid: {
                        color: catPresent ? colorsPersistObject[label] : colorPalette.getColor(label).value
                    }
                };
                colorsPersistObject[label] = defaultColor.solid.color;
                // tslint:disable-next-line:no-any
                let taskColor: any;
                let cnt: number = 0;
                const length: number = taskValues.length;

                switch (length) {
                    case 1:
                        if (dataView.categorical.categories[1] !== undefined) {
                            if (dataView.categorical.categories[0].source.displayName
                                === dataView.categorical.categories[1].source.displayName) {
                                cnt = 0;
                            } else {
                                errorMessage = true;
                            }
                        }
                        break;
                    case 2:
                        if (dataView.categorical.categories[2] !== undefined) {
                            if (dataView.categorical.categories[0].source.displayName
                                === dataView.categorical.categories[2].source.displayName) {
                                cnt = 0;
                            } else if (dataView.categorical.categories[2] !== undefined &&
                                dataView.categorical.categories[1].source.displayName
                                === dataView.categorical.categories[2].source.displayName) {
                                cnt = 1;
                            } else {
                                errorMessage = true;
                            }
                        }
                        break;
                    case 3:
                        if (dataView.categorical.categories[3] !== undefined) {
                            if (dataView.categorical.categories[0].source.displayName
                                === dataView.categorical.categories[3].source.displayName) {
                                cnt = 0;
                            } else if (dataView.categorical.categories[3] !== undefined &&
                                dataView.categorical.categories[1].source.displayName
                                === dataView.categorical.categories[3].source.displayName) {
                                cnt = 1;
                            } else if (dataView.categorical.categories[3] !== undefined &&
                                dataView.categorical.categories[2].source.displayName
                                === dataView.categorical.categories[3].source.displayName) {
                                cnt = 2;
                            } else {
                                errorMessage = true;
                            }
                        }
                        break;
                    case 4:
                        if (dataView.categorical.categories[4] !== undefined) {
                            if (dataView.categorical.categories[0].source.displayName
                                === dataView.categorical.categories[4].source.displayName) {
                                cnt = 0;
                            } else if (dataView.categorical.categories[4] !== undefined &&
                                dataView.categorical.categories[1].source.displayName
                                === dataView.categorical.categories[4].source.displayName) {
                                cnt = 1;
                            } else if (dataView.categorical.categories[4] !== undefined &&
                                dataView.categorical.categories[2].source.displayName
                                === dataView.categorical.categories[4].source.displayName) {
                                cnt = 2;
                            } else if (dataView.categorical.categories[4] !== undefined &&
                                dataView.categorical.categories[3].source.displayName
                                === dataView.categorical.categories[4].source.displayName) {
                                cnt = 3;
                            } else {
                                errorMessage = true;
                            }
                        }
                        break;
                    default:
                        break;

                }
                if (errorMessage) {
                    Gantt.ganttDiv.classed("gantt_hidden", true);
                    Gantt.errorDiv.classed("gantt_hidden", false);
                    Gantt.errorText.text('Please select a field that is already present in "Category"');
                }
                for (const j of taskValues) {
                    for (const i of tasks) {
                        if (taskValues[cnt] === i.name[cnt]) {
                            taskColor = i.color;
                            break;
                        }
                    }
                }

                if (legendIndex === -1) {
                    taskColor = this.getCategoricalObjectValue<Fill>(dataView.categorical.categories[0],
                        index, "barColor", "fillColor", defaultColor).solid.color;
                }
                if (taskColor !== undefined) {
                    r = 1;
                    if (settings.barColor.showall) {

                        tasks.push({
                            KPIValues: kpiValues,
                            color: taskColor,
                            end: endDate,
                            expanded: null,
                            id: index,
                            identity: host.createSelectionIdBuilder()
                            .withCategory(dataView.categorical.categories[0], index)
                            .createSelectionId(),
                            isLeaf: null,
                            level: null,
                            name: taskValues,
                            numEnd: datamax,
                            numStart: datamin,
                            parentId: null,
                            repeat: r,
                            resource,
                            rowId: null,
                            selected: false,
                            selectionId: host.createSelectionIdBuilder()
                                .withCategory(dataView.categorical.categories[0], index)
                                .createSelectionId(),
                            start: startDate,
                            tooltipInfo: null,
                            tooltipValues

                        });
                    } else {

                        tasks.push({
                            KPIValues: kpiValues,
                            color: settings.barColor.defaultColor,
                            end: endDate,
                            expanded: null,
                            id: index,
                            identity: host.createSelectionIdBuilder()
                            .withCategory(dataView.categorical.categories[0], index)
                            .createSelectionId(),
                            isLeaf: null,
                            level: null,
                            name: taskValues,
                            numEnd: datamax,
                            numStart: datamin,
                            parentId: null,
                            repeat: r,
                            resource,
                            rowId: null,
                            selected: false,
                            selectionId: host.createSelectionIdBuilder()
                                .withCategory(dataView.categorical.categories[0], index)
                                .createSelectionId(),
                            start: startDate,
                            tooltipInfo: null,
                            tooltipValues
                        });
                    }
                } else {

                    r = 0;
                    if (settings.barColor.showall) {
                        // tslint:disable-next-line:no-use-before-declare
                        const labelCat: string = dataView.categorical.categories[legendIndex].values[index] === null ?
                            // tslint:disable-next-line:no-use-before-declare
                            "Null" : dataView.categorical.categories[legendIndex].values[index].toString();
                        colorsPersistObject[labelCat] =
                            this.getCategoricalObjectValue<Fill>(dataView.categorical.categories[0],
                                index, "barColor", "fillColor",
                                defaultColor).solid.color;
                        tasks.push({
                            KPIValues: kpiValues,
                            color: colorsPersistObject[labelCat],
                            end: endDate,
                            expanded: null,
                            id: index,
                            identity: host.createSelectionIdBuilder()
                            .withCategory(dataView.categorical.categories[0], index)
                            .createSelectionId(),
                            isLeaf: null,
                            level: null,
                            name: taskValues,
                            numEnd: datamax,
                            numStart: datamin,
                            parentId: null,
                            repeat: r,
                            resource,
                            rowId: null,
                            selected: false,
                            selectionId: host.createSelectionIdBuilder()
                            .withCategory(dataView.categorical.categories[0], index)
                            .createSelectionId(),
                            start: startDate,
                            tooltipInfo: null,
                            tooltipValues
                        });
                        const sel: string = tasks[index].name[legendindex];
                        // tslint:disable-next-line:no-any
                        const selection: any[] = [];
                        const catLabel: string = tasks[index].name[legendindex]
                            === "" ? "Null" : tasks[index].name[legendindex];
                        colorsPersistObject[catLabel]
                            = this.getCategoricalObjectValue<Fill>(dataView.categorical.categories[0], index,
                                "barColor", "fillColor", defaultColor)
                                .solid.color;
                        if (uniquesColorsForLegends.indexOf(sel) === -1) {
                            uniquesColorsForLegends.push({
                                color: colorsPersistObject[catLabel],
                                name: tasks[index].name[legendindex]
                            });
                            Gantt.tasknew.push({
                                color: tasks[index].color,
                                name: sel,
                                repeat: r,
                                selectionId: tasks[index].selectionId
                                                        });
                            oUniquelegend[index] = sel;
                        }
                    } else {
                        tasks.push({
                            KPIValues: kpiValues,
                            color: settings.barColor.defaultColor,
                            end: endDate,
                            expanded: null,
                            id: index,
                            identity: host.createSelectionIdBuilder()
                            .withCategory(dataView.categorical.categories[0], index)
                            .createSelectionId(),
                            isLeaf: null,
                            level: null,
                            name: taskValues,
                            numEnd: datamax,
                            numStart: datamin,
                            parentId: null,
                            repeat: r,
                            resource,
                            rowId: null,
                            selected: false,
                            selectionId: host.createSelectionIdBuilder()
                            .withCategory(dataView.categorical.categories[0], index)
                            .createSelectionId(),
                            start: startDate,
                            tooltipInfo: null,
                            tooltipValues
                        });
                        // tslint:disable-next-line:no-use-before-declare
                        const categoryLabel: string =
                            dataView.categorical.categories[legendIndex].values[index] === null ?
                                // tslint:disable-next-line:no-use-before-declare
                                "Null" : dataView.categorical.categories[legendIndex].values[index].toString();
                        colorsPersistObject[categoryLabel] =
                            this.getCategoricalObjectValue<Fill>(dataView.categorical.categories[0], index,
                                "barColor", "fillColor", defaultColor).solid.color;
                        uniquesColorsForLegends.push({
                            color: colorsPersistObject[categoryLabel]
                        });
                    }
                }

                Gantt.selectionIdHash[index] = false;
                // Non Hierarchy
                if (dataView.metadata.objects === undefined ||
                    dataView.metadata.objects.taskLabels ===
                    undefined || !dataView.metadata.objects.taskLabels.isHierarchy) {
                    tasks[index].tooltipInfo = Gantt.getTooltipInfo(tasks[index], formatters, dataView, index);
                }
                largest = index;
                // tslint:disable-next-line:no-use-before-declare
                if (legendIndex !== -1) {
                    // tslint:disable-next-line
                    uniquelegend = (dataView.categorical.categories[legendIndex].values).filter(function (e, i, arr) {
                        return arr.lastIndexOf(e) === i;
                    });
                }
                // tslint:disable-next-line:no-use-before-declare
                legIndex = legendIndex;
            });

            // tslint:disable-next-line:no-any
            oUniquelegend.forEach((key: any): any => {
                // tslint:disable-next-line:no-any
                let found: boolean = false;
                // tslint:disable-next-line:no-any
                uniquelegend = uniquelegend.filter((item: any): any => {
                    if (item === null) {
                        item = "";
                    }
                    if (!found && item === key) {
                        oUnique.push(item);
                        found = true;

                        return false;
                    } else {
                        return true;
                    }
                });
            });
            uniquelegend = oUnique;
            // tslint:disable-next-line
            let legendIndex = -1;
            const categories: DataViewCategoryColumn[] = dataView.categorical.categories;
            // tslint:disable-next-line:typedef
            categories.forEach((datum, a: number) => {
                if (datum.source.roles.Legend) {
                    legendIndex = a;
                }
            });
            uniqueColors = [];
            if (legendIndex !== -1) {
                uniquelegend.forEach((d: PrimitiveValue, i: number): void => {
                    legendData.dataPoints.push({
                        color: uniquesColorsForLegends[i].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box, // type of the legend icon,
                        identity: host.createSelectionIdBuilder()
                        .withMeasure(d.toString())
                        .createSelectionId() ,
                        label: d.toString() === "" ? "(Blank)" : d.toString(),  // name of the label
                        selected: false,  // indicates of the legend is selected or not
                    });
                    uniqueColors.push({
                        color: tasks[i].color,
                        name: d
                    });
                });
            }
            const legendSettings: ILegendSettings = settings.legend;
            if (legendIndex !== -1) {
                barsLegend.changeOrientation(LegendPosition.Top);
                barsLegend.drawLegend(legendData, viewport);
                position(d3.select(".gantt-body"), barsLegend);
            }

            let levelofSorting: number = Gantt.sortLevel;
            Gantt.numberOfCategories = categoryRoles.length;
            let iIterator: number = 0;

            while (iIterator < levelofSorting) {
                hashArr = [];
                const hyphenLiteral: string = "-";
                for (let index: number = 0; index <= largest; index++) {
                    if (hashArr[tasks[index].name[iIterator - 3]
                        + hyphenLiteral + tasks[index].name[iIterator - 2] + hyphenLiteral
                        + tasks[index].name[iIterator - 1]] === undefined) {
                        hashArr[tasks[index].name[iIterator - 3] + hyphenLiteral
                            + tasks[index].name[iIterator - 2] + hyphenLiteral + tasks[index].name[iIterator - 1]] = [];
                    }
                    hashArr[tasks[index].name[iIterator - 3]
                        + hyphenLiteral + tasks[index].name[iIterator - 2] + hyphenLiteral
                        + tasks[index].name[iIterator - 1]].push(tasks[index]);
                }

                Object.keys(hashArr).forEach((i: string): void => {
                    // tslint:disable-next-line:no-any
                    hashArr[i].sort((m: any, n: any): number => {
                        if (m.name[iIterator] === "") {
                            return -1;
                        } else if (n.name[iIterator] === "") {
                            return 1;
                        } else {
                            // tslint:disable-next-line:no-any
                            let mValue: any;
                            // tslint:disable-next-line:no-any
                            let nValue: any;
                            if (typeof m.name[iIterator] === "string" && typeof n.name[iIterator] === "string") {
                                mValue = m.name[iIterator].toLowerCase();
                                nValue = n.name[iIterator].toLowerCase();
                            } else {
                                mValue = m.name[iIterator];
                                nValue = n.name[iIterator];
                            }
                            if (mValue < nValue) { return -1; }
                            if (mValue > nValue) { return 1; }

                            return 0;
                        }
                    });
                });
                tasks = [];
                Object.keys(hashArr).forEach((i: string): void => {
                    Object.keys(hashArr[i]).forEach((j: string): void => {
                        tasks.push(hashArr[i][j]);
                    });
                });
                iIterator++;
            }

            while (levelofSorting < categoryRoles.length) {
                hashArr = [];
                const hyphenLiteral: string = "-";
                for (let index: number = 0; index <= largest; index++) {
                    if (hashArr[tasks[index].name[levelofSorting - 3] + hyphenLiteral
                        + tasks[index].name[levelofSorting - 2]
                        + hyphenLiteral + tasks[index].name[levelofSorting - 1]] === undefined) {
                        hashArr[tasks[index].name[levelofSorting - 3]
                            + hyphenLiteral + tasks[index].name[levelofSorting - 2]
                            + hyphenLiteral + tasks[index].name[levelofSorting - 1]] = [];
                    }
                    hashArr[tasks[index].name[levelofSorting - 3]
                        + hyphenLiteral + tasks[index].name[levelofSorting - 2]
                        + hyphenLiteral + tasks[index].name[levelofSorting - 1]].push(tasks[index]);
                }

                if (!firstVisit) {
                    orderOfSorting = "asc";
                }

                Object.keys(hashArr).forEach((i: string): void => {
                    // tslint:disable-next-line:no-any
                    hashArr[i].sort((m: any, n: any): number => {
                        if (orderOfSorting === "asc") {
                            if (m.name[levelofSorting] === "") {
                                return -1;
                            } else if (n.name[levelofSorting] === "") {
                                return 1;
                            } else {
                                // tslint:disable-next-line:no-any
                                let mValue: any;
                                // tslint:disable-next-line:no-any
                                let nValue: any;
                                if (typeof m.name[iIterator] === "string" && typeof n.name[iIterator] === "string") {
                                    mValue = m.name[iIterator].toLowerCase();
                                    nValue = n.name[iIterator].toLowerCase();
                                } else {
                                    mValue = m.name[iIterator];
                                    nValue = n.name[iIterator];
                                }
                                if (mValue < nValue) { return -1; }
                                if (mValue > nValue) { return 1; }

                                return 0;
                            }
                        } else {
                            if (m.name[levelofSorting] === "") {
                                return 1;
                            } else if (n.name[levelofSorting] === "") {
                                return -1;
                            } else {
                                // tslint:disable-next-line:no-any
                                let mValue: any;
                                // tslint:disable-next-line:no-any
                                let nValue: any;
                                if (typeof m.name[iIterator] === "string" && typeof n.name[iIterator] === "string") {
                                    mValue = m.name[iIterator].toLowerCase();
                                    nValue = n.name[iIterator].toLowerCase();
                                } else {
                                    mValue = m.name[iIterator];
                                    nValue = n.name[iIterator];
                                }
                                if (mValue > nValue) { return -1; }
                                if (mValue < nValue) { return 1; }

                                return 0;
                            }
                        }
                    });
                });
                if (firstVisit) { firstVisit = 0; }
                tasks = [];
                Object.keys(hashArr).forEach((i: string): void => {
                    Object.keys(hashArr[i]).forEach((j: string): void => {
                        tasks.push(hashArr[i][j]);
                    });
                });
                levelofSorting++;
            }
            selectionIds = [];
            for (let iCounter: number = 0; iCounter <= largest; iCounter++) {
                selectionIds.push(tasks[iCounter].selectionId);
            }

            return tasks;
        }
        private static getDateType(type: string): number {

            switch (type) {
                case "Day":
                    return millisecondsInADay;

                case "Week":
                    return millisecondsInWeek;

                case "Month":
                    return millisecondsInAMonth;

                case "Quarter":
                    return millisecondsInAQuarter;

                case "Year":
                    return millisecondsInAYear;

                default:
                    return millisecondsInWeek;
            }
        }

        private static getQuarterName(timeinmilliseconds: number): string {

            let date: Date;
            date = new Date(timeinmilliseconds);
            let month: number;
            month = date.getMonth() + 1;
            let year: number;
            year = date.getFullYear();
            let quarter: string = "";
            // Find quarter number of the date based on month number
            if (month <= 3) {
                quarter = "Q1";
            } else if (month <= 6) {
                quarter = "Q2";
            } else if (month <= 9) {
                quarter = "Q3";
            } else {
                quarter = "Q4";
            }

            return quarter + spaceLiteral + year;
        }
        // tslint:disable: object-literal-sort-keys
        private static enumerateTaskLabels(settings: IGanttSettings): VisualObjectInstance[] {
            const taskLabelsSettings: ITaskLabelsSettings = settings.taskLabels;
            const instances: VisualObjectInstance[] = [{
                displayName: "Category Labels",
                objectName: "taskLabels",
                properties: {
                    show: taskLabelsSettings.show,
                    fill: taskLabelsSettings.fill,
                    fontSize: taskLabelsSettings.fontSize > 20 ? 20 : taskLabelsSettings.fontSize,
                    fontFamily: taskLabelsSettings.fontFamily,
                    isExpanded: taskLabelsSettings.isExpanded,
                    isHierarchy: taskLabelsSettings.isHierarchy
                },
                selector: null
            }];

            instances[0].properties = {
                show: taskLabelsSettings.show,
                fill: taskLabelsSettings.fill,
                fontSize: taskLabelsSettings.fontSize > 20 ? 20 : taskLabelsSettings.fontSize,
                fontFamily: taskLabelsSettings.fontFamily,
                isExpanded: taskLabelsSettings.isExpanded,
                isHierarchy: taskLabelsSettings.isHierarchy
            };

            return instances;
        }

        private static enumerateColumnHeader(settings: IGanttSettings): VisualObjectInstance[] {
            const columnHeaderSettings: IColumnHeaderSettings = settings.columnHeader;
            const instances: VisualObjectInstance[] = [{
                displayName: "Column Header",
                objectName: "columnHeader",
                properties: {
                    fill: columnHeaderSettings.fill,
                    fill2: columnHeaderSettings.fill2,
                    columnOutline: columnHeaderSettings.columnOutline,
                    fontFamily: columnHeaderSettings.fontFamily,
                    fontSize: columnHeaderSettings.fontSize > 20 ? 20 : columnHeaderSettings.fontSize
                },
                selector: null
            }];

            return instances;
        }

        private static enumerateTaskResource(settings: IGanttSettings): VisualObjectInstance[] {
            const taskResourceSettings: ITaskResourceSettings = settings.taskResource;
            const instances: VisualObjectInstance[] = [{
                displayName: "Data Labels",
                objectName: "taskResource",
                properties: {
                    show: taskResourceSettings.show,
                    position: taskResourceSettings.position,
                    fill: taskResourceSettings.fill,
                    fontSize: taskResourceSettings.fontSize > 20 ? 20 : taskResourceSettings.fontSize,
                    fontFamily: taskResourceSettings.fontFamily
                },
                selector: null

            }];

            return instances;
        }

        private static enumerateTaskGridLines(settings: IGanttSettings): VisualObjectInstance[] {
            const taskGridLinesSettings: ITaskGridLinesSettings = settings.taskGridlines;
            const instances: VisualObjectInstance[] = [{
                displayName: "Grid Lines",
                objectName: "taskGridLines",
                properties: {
                    show: taskGridLinesSettings.show,
                    fill: taskGridLinesSettings.fill,
                    interval: taskGridLinesSettings.interval
                },
                selector: null
            }];

            return instances;
        }

        private static enumerateDateType(settings: IGanttSettings): VisualObjectInstance[] {
            const dateTypeSettings: IDateTypeSettings = settings.dateType;
            const instances: VisualObjectInstance[] = [{
                displayName: "Gantt Date Type",
                objectName: "dateType",
                properties: {
                    type: dateTypeSettings.type,
                    enableToday: dateTypeSettings.enableToday
                },
                selector: null

            }];

            return instances;
        }

        private static enumerateKPIColumnTypePosition(settings: IGanttSettings, kpiData:
            IKPIConfig[]): VisualObjectInstance[] {
            const kpiColumnTypeSettings: IKPIColumnTypeSettings = settings.kpiColumnType;
            const instances: VisualObjectInstance[] = [];
            let counter: number;
            for (counter = 0; counter < kpiData.length; counter++) {
                let inst: VisualObjectInstance;
                inst = {
                    displayName: kpiData[counter].name,
                    objectName: "kpiColumnType",
                    properties: {
                        type: kpiData[counter].type
                    },
                    selector: kpiData[counter].identity

                };
                instances.push(inst);
            }

            return instances;
        }

        private static enumerateScrollPosition(settings: IGanttSettings): VisualObjectInstance[] {
            const scrollPositionSettings: IScrollPositionSettings = settings.scrollPosition;
            const instances: VisualObjectInstance[] = [{
                displayName: "Position",
                objectName: "scrollPosition",
                properties: {
                },
                selector: null

            }];
            if (Gantt.isDateData) {
                instances[0].properties = {
                    position: scrollPositionSettings.position
                };
            } else {
                instances[0].properties = {
                    position2: scrollPositionSettings.position2
                };
            }

            return instances;
        }

        private static enumerateDisplayRatio(settings: IGanttSettings): VisualObjectInstance[] {
            const displayRatioSettings: IDisplayRatioSettings = settings.displayRatio;
            const instances: VisualObjectInstance[] = [{
                displayName: "ratio",

                objectName: "displayRatio",
                properties: {
                    ratio: displayRatioSettings.ratio
                },
                selector: null

            }];

            return instances;
        }

        private static enumerateLegend(settings: IGanttSettings): VisualObjectInstance[] {
            const legendSettings: ILegendSettings = settings.legend;
            const instances: VisualObjectInstance[] = [{
                displayName: "Legend",

                objectName: "legend",
                properties: {
                    show: legendSettings.show
                },
                selector: null

            }];

            return instances;
        }

        // tslint:disable-next-line:no-any
        private static enumerateBarColor(options: any, settings: IGanttSettings): VisualObjectInstance[] {
            const barSettings: IBarColor = settings.barColor;
            const limiter: number = this.viewModelNew.tasksNew.length;
            const legendLength: number = uniquelegend.length;
            const instances: VisualObjectInstance[] = [];
            let index: number = 0;
            instances.push({
                displayName: `Show All`,

                objectName: "barColor",
                properties: {
                    showall: settings.barColor.showall
                },
                selector: null
            });
            if (!settings.taskLabels.isHierarchy) {
                if (settings.barColor.showall) {
                    if (uniquelegend.length === 0) {
                        for (const iIterator of this.viewModelNew.tasksNew) {
                            if (iIterator.repeat === 1) {
                                instances.push({
                                    displayName: `Bars color ${index + 1}`,
                                    objectName: "barColor",
                                    properties: {
                                        fillColor: iIterator.color
                                    },
                                    selector: iIterator.selectionId.getSelector()
                                });
                                index++;
                            }
                        }
                    } else {
                        let categoryIndx: number = 0;
                        // tslint:disable-next-line:no-any
                        const categoryll: any = this.viewModelNew.dataView.categorical.categories;
                        for (let indx: number = 0; indx < categoryll.length; indx++) {
                            if (categoryll[indx].source.roles.hasOwnProperty("Legend")) {
                                categoryIndx = indx;
                                break;
                            }
                        }
                        for (const iIterator of this.viewModelNew.tasksNew) {
                            if (iIterator.repeat === 0) {
                                instances.push({
                                    displayName: iIterator.name[categoryIndx] === "" ?
                                        "(Blank)" : iIterator.name[categoryIndx],
                                    objectName: "barColor",

                                    properties: {
                                        fillColor: iIterator.color
                                    },
                                    selector: iIterator.selectionId.getSelector()
                                });
                            }
                        }
                    }
                } else {
                    instances.push({
                        displayName: `Default color`,

                        objectName: "barColor",
                        properties: {
                            defaultColor: settings.barColor.defaultColor
                        },
                        selector: null
                    });
                }
            } else {
                if (settings.barColor.showall) {
                    if (uniquelegend.length === 0) {
                        instances.push({
                            displayName: `Default color`,

                            objectName: "barColor",
                            properties: {
                                defaultColor: settings.barColor.defaultColor
                            },
                            selector: null
                        });
                    } else {
                        for (const iIterator of Gantt.tasknew) {
                            // tslint:disable-next-line:no-any
                            const displayName: any = iIterator.name;
                            // tslint:disable-next-line
                            let selectionId: any = iIterator.selectionId;
                            // tslint:disable-next-line:prefer-const
                            let selectionIdLen: number = selectionId.length;
                            if (uniquelegend.indexOf(displayName.toString()) !== -1 &&
                            iIterator.repeat === 0) {
                                instances.push({
                                    displayName: displayName.toString() === "" ? "(Blank)" : displayName.toString(),

                                    objectName: "barColor",
                                    properties: {
                                        fillColor: iIterator.color
                                    },
                                    selector: iIterator.selectionId.getSelector()
                                });
                            }
                            index++;
                        }
                        instances.push({
                            displayName: `Default color`,

                            objectName: "barColor",
                            properties: {
                                defaultColor: settings.barColor.defaultColor
                            },
                            selector: null
                        });

                    }
                } else {
                    instances.push({
                        displayName: `Default color`,

                        objectName: "barColor",
                        properties: {
                            defaultColor: settings.barColor.defaultColor
                        },
                        selector: null
                    });
                }
            }

            return instances;
        }
        // tslint:enable
        /**
         * Set the task progress bar in the gantt
         * @param lineNumber Line number that represents the task number
         */
        private static getBarYCoordinate(lineNumber: number): number {
            return (chartLineHeight * lineNumber) + (paddingTasks) - 3;
        }

        private static getBarHeight(): number {
            return chartLineHeight / Gantt.chartLineProportion + 8;
        }
        private static getMilestoneIcon(phaseName: string): number {
            let milestoneIndex: number = Gantt.milestoneNames.indexOf(phaseName);
            if (-1 === milestoneIndex || milestoneIndex >= Gantt.milestoneShapes.length) {
                milestoneIndex = 0;
            }

            return milestoneIndex;
        }

        private static isValidDate(date: Date): boolean {

            if (Object.prototype.toString.call(date) !== "[object Date]") {
                return false;
            }

            return !isNaN(date.getTime());
        }

        private static convertToDecimal(value: number): number {
            if (!((value >= Gantt.complectionMin) && (value <= Gantt.complectionMax))) {
                return (value / Gantt.complectionTotal);
            }

            return value;
        }

        private static getCategoricalObjectValue<T>(category: DataViewCategoryColumn, index: number,
                                                    objectName: string, propertyName: string, defaultValue: T): T {
            const categoryObjects: DataViewObjects[] = category.objects;
            if (categoryObjects) {
                const categoryObject: DataViewObject = categoryObjects[index];
                if (categoryObject) {
                    const object: DataViewPropertyValue = categoryObject[objectName];
                    if (object) {
                        const property: T = object[propertyName];
                        if (property !== undefined) {
                            return property;
                        }
                    }
                }
            }

            return defaultValue;
        }
       /**
        * Get task labels values
        * @param task current task
        * @param property : property name for which the value is required
        * @param width : number of characters to be displayed
        */
        private static getLabelValuesNew(value: string, property: string, width: number): string {

            const imageString: string = "";
            const classNAme: string = "";

            if (property === "text") {
                let taskName: string;
                taskName = value ? value : "";
                if (taskName.length > width) {
                    return taskName.substring(0, width) + ellipsisLiteral;
                }

                return taskName;
            }

            return value ? value : "";
        }

        /**
         * Get KPI labels values
         * @param task current task
         * @param property : property name for which the value is required
         * @param width : number of characters to be displayed
         */
        private static getKPIValues(kpiValue: IKPIValues, property: string): string {

            let singleTask: string = kpiValue.value ? kpiValue.value.toString() : "";
            if (property === "text") {
                if (singleTask.length > 8) {
                    singleTask = singleTask.substring(0, 8) + ellipsisLiteral;
                }

                return singleTask;
            } else if (property === "title") {
                return singleTask;
            } else {
                return "";
            }
        }

        /**
         * Get left padding for different levels
         * @param task current task
         * @param property : property name for which the value is required
         * @param width : number of characters to be displayed
         */
        private static getLeftPadding(iDrillLevel: number): number {
            let iCount: number;
            iCount = Gantt.totalDrillLevel;

            return (iDrillLevel - 1) * Gantt.drillLevelPadding;
        }

        public dataview: any;
        private viewport: IViewport;
        private colors: IColorPalette;
        private legend: ILegend;
        private barsLegend: ILegend;
        private interactiveBehavior?: IInteractiveBehavior;
        private persistExpandCollapseSettings: PersistExpandCollapseSettings;
        private textProperties: TextProperties = {
            fontFamily: "wf_segoe-ui_normal",
            fontSize: PixelConverter.toString(9)
        };
        private margin: IMargin = Gantt.DefaultMargin;
        private body: Selection<HTMLElement>;
        private ganttSvg: Selection<HTMLElement>;
        private viewModel: IGanttViewModel;
        private timeScale: timeScale<any, any>;
        private axisGroup: Selection<HTMLElement>;
        private timelineDiv: Selection<HTMLElement>;
        private taskDiv: Selection<HTMLElement>;
        private kpiDiv: Selection<HTMLElement>;
        private barDiv: Selection<HTMLElement>;
        private taskSvg: Selection<HTMLElement>;
        private kpiSvg: Selection<HTMLElement>;
        private timelineSvg: Selection<HTMLElement>;
        private bottomDiv: Selection<HTMLElement>;
        private imageDiv: Selection<HTMLElement>;
        private kpiImageDiv: Selection<HTMLElement>;
        private kpiTitleDiv: Selection<HTMLElement>;
        private drillAllDiv: Selection<HTMLElement>;
        private drillAllDiv2: Selection<HTMLElement>;
        private imageSvg: Selection<HTMLElement>;
        private kpiImageSvg: Selection<HTMLElement>;
        private drillAllSvg: Selection<HTMLElement>;
        private drillAllSvg2: Selection<HTMLElement>;
        private drillAllGroup: Selection<HTMLElement>;
        private kpiTitleSvg: Selection<HTMLElement>;
        private bottommilestoneDiv: Selection<HTMLElement>;
        private bottommilestoneSvg: Selection<HTMLElement>;
        private bottommilestoneGroup: Selection<HTMLElement>;
        private bottomTaskDiv: Selection<HTMLElement>;
        private bottomTaskSvg: Selection<HTMLElement>;
        private backgroundGroupTask: Selection<HTMLElement>;
        private backgroundGroupKPI: Selection<HTMLElement>;
        private backgroundGroupBar: Selection<HTMLElement>;
        private chartGroup: Selection<HTMLElement>;
        private taskGroup: Selection<HTMLElement>;
        private lineGroup: Selection<HTMLElement>;
        private kpiGroup: Selection<HTMLElement>;
        private kpiTitleGroup: Selection<HTMLElement>;
        private toggleTaskGroup: Selection<HTMLElement>;
        private legendDiv: Selection<HTMLElement>;
        private legendSvg: Selection<HTMLElement>;
        private legendGroup: Selection<HTMLElement>;
        private legendIndicatorDiv: Selection<HTMLElement>;
        private arrowDiv: Selection<HTMLElement>;
        private legendIndicatorTitleDiv: Selection<HTMLElement>;
        private legendIndicatorTitleSvg: Selection<HTMLElement>;
        private kpiIndicatorDiv: Selection<HTMLElement>;
        private eventService: IVisualEventService ;
        private kpiIndicatorSvg: Selection<HTMLElement>;
        private milestoneIndicatorDiv: Selection<HTMLElement>;
        private milestoneIndicatorSvg: Selection<HTMLElement>;
        private phaseIndicatorDiv: Selection<HTMLElement>;
        private phaseIndicatorSvg: Selection<HTMLElement>;
        private gridGroup: Selection<HTMLElement>;
        private gridRows: d3.selection.Update<DataViewTableRow>;
        private todayGroup: Selection<HTMLElement>;
        private todayindicator: Selection<HTMLElement>;
        private todayText: Selection<HTMLElement>;
        private selectionManager: ISelectionManager;
        private behavior: GanttChartBehavior;
        private interactivityService: IInteractivityService<SelectionDataPoint>;
        private interactivitySelectionService: InteractivitySelectionService;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private host: IVisualHost;
        private isInteractiveChart: boolean = false;
        private offset: number;
        private options: any;
        private bodyElement: any;
        private selectionHandler: ISelectionHandler;
        constructor(options: VisualConstructorOptions) {
            this.eventService = options.host.eventService;
            this.init(options);
        }
        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            try {
            this.eventService.renderingStarted(options);
            d3.selectAll(".legend").remove();
            d3.selectAll(".gantt_task-resource").remove();
            resourcePresent = false;
            uniquelegend = [];
            uniquesColorsForLegends = [];
            Gantt.arrGantt = [];
            Gantt.colorsIndex = 0;
            Gantt.kpiLabelWidth = 75;
            Gantt.globalOptions = options;
            Gantt.dataMAX = Gantt.minSafeInteger;
            // tslint:disable-next-line:no-any
            const categoriesArray: any = options.dataViews[0].categorical.categories;
            // tslint:disable-next-line:no-any
            const valuesArray: any = options.dataViews[0].categorical.values;
            const categoryLength: number = options.dataViews[0].categorical.categories.length;
            const valuesLength: number = options.dataViews[0].categorical.values.length;
            // tslint:disable-next-line:no-any
            this.dataview = options.dataViews[0];
            const valuesdata: DataViewValueColumn = this.dataview.categorical.values;
            for (let valueIterator: number = 0; valueIterator < valuesLength; valueIterator++) {
                if (valuesdata[valueIterator].source.roles.Resource) {
                    resourcePresent = true;
                    break;
                }
            }
            position(d3.select(".gantt-body"), this.barsLegend);
            if (!options.dataViews || !options.dataViews[0] ||
                options.dataViews[0].categorical.categories[0].values.length === 0) {
                this.clearViewport();
                Gantt.ganttDiv.classed("gantt_hidden", true);
                Gantt.errorDiv.classed("gantt_hidden", false);
                const errorStatement: string = "There is no data to display";
                Gantt.errorText.text(errorStatement);

                return;
            }

            let legendCategory: boolean = true;
            for (let index: number = 0; index < categoryLength; index++) {
                if (categoriesArray[index].source.roles.Legend) {
                    iterator = 1;
                    legendCategory = (categoriesArray[index].source.roles.Category) ? true : false;
                    break;
                }
            }
            if (iterator === 1) {
                this.barsLegend = createLegend(this.options.element,
                    false, this.interactivityService, true);
            }

            let hasStart: boolean = false;
            let hasEnd: boolean = false;
            if (valuesArray) {
                for (let iCounter: number = 0; iCounter < valuesLength; iCounter++) {
                    if (valuesArray[iCounter].source.roles[startDateLiteral]) {
                        hasStart = true;
                    }
                    if (valuesArray[iCounter].source.roles[endDateLiteral]) {
                        hasEnd = true;
                    }

                }
            }

            const objects: DataViewObjects = options.dataViews[0].metadata.objects;
            const colorsPersistedArray: string = getValue<string>(objects, "caption", "captionValue", "{}");
            // Retrieve persisted colors array value
            // tslint:disable-next-line:no-any
            const colorsParsedArray: any = JSON.parse(colorsPersistedArray);
            if (colorsPersistedArray !== "{}") {
                colorsPersistObject = colorsParsedArray;
            }
            let getJSONString1: string;
            getJSONString1 = getValue<string>(objects, "sortAttributes", "sortOrder", "asc");
            let getJSONString2: number;
            getJSONString2 = getValue<number>(objects, "sortAttributes", "sortLevel", 0);
            let getJSONString3: number;
            getJSONString3 = getValue<number>(objects, "sortAttributes", "prevSortedColumn", -1);
            Gantt.sortOrder = getJSONString1;
            Gantt.sortLevel = getJSONString2;
            Gantt.prevSortedColumn = getJSONString2;
            const thisObj: this = this;
            this.viewModel = Gantt.converter(this.dataview, this.host, this.colors, this.barsLegend, options.viewport);
            this.persistExpandCollapseSettings = this.viewModel.settings.persistExpandCollapseSettings;
            this.barsLegend.changeOrientation(LegendPosition.Top);
            Gantt.expandCollapseStates = JSON.parse(this.persistExpandCollapseSettings.expandCollapseState || "{}");
            Gantt.viewModelNew = this.viewModel;
            $(".gantt_errorPanel").remove();
            if (this.barDiv) {
                this.barDiv.remove();
                this.kpiDiv.remove();
                this.taskDiv.remove();
            }
            $(".gantt-body").remove();
            this.createViewport(this.bodyElement);
            this.clearViewport();
            Gantt.ganttDiv.classed("gantt_hidden", true);
            Gantt.errorDiv.classed("gantt_hidden", false);
            Gantt.errorText.text("");
            if (!this.viewModel || !this.viewModel.tasksNew) {
                this.clearViewport();
                Gantt.ganttDiv.classed("gantt_hidden", true);
                Gantt.errorDiv.classed("gantt_hidden", false);
                const errorStatement: string = "Please add data to the Category field to load the visual";
                Gantt.errorText.text(errorStatement);

                return;
            } else if (this.viewModel.tasksNew.length === 0) {
                this.clearViewport();
                Gantt.ganttDiv.classed("gantt_hidden", true);
                Gantt.errorDiv.classed("gantt_hidden", false);
                const errorStatement: string = "There is no data to display";
                Gantt.errorText.text(errorStatement);

                return;
            } else if (!hasStart && !hasEnd) {
                this.clearViewport();
                Gantt.ganttDiv.classed("gantt_hidden", true);
                Gantt.errorDiv.classed("gantt_hidden", false);
                const errorStatement: string = "Please add data to the Start and End field to load the visual";
                Gantt.errorText.text(errorStatement);

                return;
            } else if (!hasStart) {
                this.clearViewport();
                Gantt.ganttDiv.classed("gantt_hidden", true);
                Gantt.errorDiv.classed("gantt_hidden", false);
                const errorStatement: string = "Please add data to the Start field to load the visual";
                Gantt.errorText.text(errorStatement);

                return;
            } else if (!hasEnd) {
                this.clearViewport();
                Gantt.ganttDiv.classed("gantt_hidden", true);
                Gantt.errorDiv.classed("gantt_hidden", false);
                const errorStatement: string = "Please add data to the End field to load the visual";
                Gantt.errorText.text(errorStatement);

                return;
            } else if (!legendCategory) {
                this.clearViewport();
                Gantt.ganttDiv.classed("gantt_hidden", true);
                Gantt.errorDiv.classed("gantt_hidden", false);
                const errorStatement: string = 'Please select a field that is already present in "Category"';
                Gantt.errorText.text(errorStatement);

                return;
            } else {
                Gantt.errorDiv.classed("gantt_hidden", true);
                Gantt.ganttDiv.classed("gantt_hidden", false);
            }
            Gantt.isPhaseHighlighted = false;
            d3.selectAll(".tooltip-content-container").style("visibility", "hidden");
            const flagProject: boolean = false;
            const flagTranche: boolean = false;
            const flagSubregion: boolean = false;
            Gantt.milestoneNames = Gantt.milestoneNames.sort();
            Gantt.currentTasksNumber = Gantt.totalTasksNumber = this.viewModel.tasksNew.length;
            $("#gantt_DrillAll").show();
            let width: number = 0;
            let widthFromPercent: number = 0;
            const normalizer: number = this.viewModel.settings.taskLabels.fontSize;
            this.body.append("text")
                .text("M")
                .classed("singleCharacter", true)
                .style({
                    "font-family": "Segoe UI",
                    "font-size": normalizer + pxLiteral
                });

            singleCharacter = d3.selectAll(".singleCharacter");

            const taskLabelsFontSize: number = this.viewModel.settings.taskLabels.fontSize;
            const taskLabelsFontFamily: string = this.viewModel.settings.taskLabels.fontFamily;
            let iTextWidth: number = 0;
            let textProperties: TextProperties;
            textProperties = {
                fontFamily: taskLabelsFontFamily,
                fontSize: (taskLabelsFontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize + pxLiteral,
                text: "W"
            };
            const headerFontSize: number = this.viewModel.settings.columnHeader.fontSize;
            const headerFontFamily: string = this.viewModel.settings.columnHeader.fontFamily;
            let iHeaderWidth: number =  0;
            let headerProperties: TextProperties;
            headerProperties = {
                fontFamily: headerFontFamily,
                fontSize: headerFontSize + pxLiteral,
                text: "W"

            };

            iTextWidth = textMeasurementService.measureSvgTextWidth(textProperties);
            iHeaderWidth = textMeasurementService.measureSvgTextWidth(headerProperties);
            Gantt.iHeaderSingleCharWidth = iHeaderWidth * 0.8;
            Gantt.iKPIHeaderSingleCharWidth = iHeaderWidth * 0.8;
            Gantt.singleCharacterWidth = iTextWidth * 0.74;
            if (this.viewModel.settings.taskLabels.width <= 1) {
                Gantt.iHeaderSingleCharWidth = iHeaderWidth * 1.5;
            }
            if (this.viewModel.settings.taskLabels.width <= 5) {
                Gantt.singleCharacterWidth = iTextWidth * 0.8;
            }
            singleCharacter.remove();
            if (this.viewModel.settings.taskLabels.width < 0) {
                this.viewModel.settings.taskLabels.width = 0;
            } else if (this.viewModel.settings.taskLabels.width > Gantt.maxTaskNameLength) {
                this.viewModel.settings.taskLabels.width = Gantt.maxTaskNameLength;
            }

            if (isNaN(this.viewModel.settings.taskGridlines.interval) ||
                this.viewModel.settings.taskGridlines.interval.toString().length === 0 ||
                parseInt(this.viewModel.settings.taskGridlines.interval.toString(), 10) < 0) {
                this.viewModel.settings.taskGridlines.interval = 0;
            } else if (isNaN(this.viewModel.settings.taskGridlines.interval) ||
                this.viewModel.settings.taskGridlines.interval.toString().length === 0 ||
                parseInt(this.viewModel.settings.taskGridlines.interval.toString(), 10) > 100) {
                this.viewModel.settings.taskGridlines.interval = 100;
            }

            if (this.viewModel.tasksNew[0].name.length === 1) {
                width = Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width
                    * this.viewModel.tasksNew[0].name.length + 15;
            } else if (this.viewModel.tasksNew[0].name.length === 2) {
                width = Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width
                    * this.viewModel.tasksNew[0].name.length + 40;
            } else if (this.viewModel.tasksNew[0].name.length === 3) {
                width = Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width
                    * this.viewModel.tasksNew[0].name.length + 65;
            } else if (this.viewModel.tasksNew[0].name.length === 4) {
                width = Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width
                    * this.viewModel.tasksNew[0].name.length + 90;
            } else {
                width = Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width
                    * this.viewModel.tasksNew[0].name.length + 114;
            }

            Gantt.taskLabelWidthOriginal = width;
            this.viewport = _.clone(options.viewport);
            let viewportWidth: number;
            viewportWidth = this.viewport.width;
            Gantt.prevDisplayRatio = Gantt.currentDisplayRatio;
            Gantt.currentDisplayRatio = this.viewModel.settings.displayRatio.ratio;

            Gantt.kpiLabelWidthOriginal = Gantt.kpiLabelWidth * this.viewModel.kpiData.length;
            Gantt.kpiLabelWidth = Gantt.kpiLabelWidthOriginal;
            Gantt.taskLabelWidthOriginal = (this.viewport.width - Gantt.kpiLabelWidthOriginal)
                * Gantt.currentDisplayRatio / 100;
            Gantt.columnHeaderBgColor = this.viewModel.settings.columnHeader.fill2;
            Gantt.minDisplayRatio = Math.ceil((100 * ((0.01 * this.viewport.width)
                + Gantt.kpiLabelWidthOriginal)) / this.viewport.width);
            if (Gantt.currentDisplayRatio < Gantt.minDisplayRatio && Gantt.minDisplayRatio <= 80) {
                this.viewModel.settings.displayRatio.ratio = Gantt.minDisplayRatio;
            } else if (Gantt.currentDisplayRatio > 80 || Gantt.minDisplayRatio > 80) {
                this.viewModel.settings.displayRatio.ratio = 80;
            }
            Gantt.currentDisplayRatio = this.viewModel.settings.displayRatio.ratio;
            let defaultGanttRatio: number;
            defaultGanttRatio = Math.ceil((100 * (Gantt.taskLabelWidthOriginal
                + Gantt.kpiLabelWidthOriginal)) / this.viewport.width);
            if (Gantt.minDisplayRatio > Gantt.currentDisplayRatio) {
                Gantt.minDisplayRatio = 80;
            }
            Gantt.taskLabelWidthOriginal = (Gantt.currentDisplayRatio
                - Gantt.minDisplayRatio) * this.viewport.width / 100;

            if (options.type === 2) {
                if (this.viewModel.settings.taskLabels.isExpanded) {
                    d3.select(".gantt_task-lines").attr("visibility", "visible");
                    d3.select(".gantt_toggle-task-group").attr("visibility", "visible");
                    $(".gantt_bottomTaskDiv").show();
                    d3.select("#gantt_ToggleIcon").attr("href", Gantt.collapseImage);
                    d3.select("#gantt_ToggleIcon").classed("collapse", true);
                    d3.select("#gantt_ToggleIcon").classed("expand", false);
                    Gantt.taskLabelWidth = Gantt.taskLabelWidthOriginal;
                } else {
                    d3.select(".gantt_task-lines").attr("visibility", "hidden");
                    d3.select(".gantt_toggle-task-group").attr("visibility", "hidden");
                    $(".gantt_bottomTaskDiv").hide();
                    d3.select("#gantt_ToggleIcon").attr("href", Gantt.expandImage);
                    d3.select("#gantt_ToggleIcon").classed("collapse", false);
                    d3.select("#gantt_ToggleIcon").classed("expand", true);
                }
            }

            if (d3.select("#gantt_ToggleIcon").classed("collapse")) {
                Gantt.taskLabelWidth = width;
            } else {
                Gantt.taskLabelWidth = 20;
            }

            if (Gantt.kpiLabelWidth === 0) {
                $(".gantt_kpiImagePanel").hide();
            } else {
                if (d3.select("#gantt_KPIToggle").classed("expand")) {
                    Gantt.kpiLabelWidth = 20;
                }
                $(".gantt_kpiImagePanel").show();
            }
            Gantt.visualCoordinates = {
                height: this.viewport.height,
                width: this.viewport.width
            };

            if (this.viewModel.settings.taskLabels.show) {
                if (d3.select("#gantt_ToggleIcon").classed("collapse")) {
                    Gantt.taskLabelWidth = Gantt.taskLabelWidthOriginal;
                } else {
                    Gantt.taskLabelWidth = 0;
                }
                d3.selectAll(".gantt_timelinePanel, .gantt_barPanel").style({ "border-left-width": "1px" });
            } else {
                Gantt.taskLabelWidth = -20;
            }

            Gantt.visualWidth = this.viewport.width;

            if (this.viewport.width < Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 50) {
                Gantt.taskLabelWidth = -10;
                Gantt.kpiLabelWidth = 0;
                // tslint:disable-next-line:max-line-length
                $(".gantt_taskPanel, .gantt_imagePanel , .gantt_kpiPanel, .gantt_kpiTitlePanel, .gantt_kpiImagePanel, .gantt_bottomTaskDiv")
                    .hide();
            } else {
                $(".gantt_taskPanel, .gantt_imagePanel").show();
                if (!this.viewModel.settings.taskLabels.show) {
                    Gantt.taskLabelWidth = -20;
                }
                if (Gantt.kpiLabelWidth !== 0) {
                    $(".gantt_kpiPanel, .gantt_kpiTitlePanel, .gantt_kpiImagePanel, .gantt_bottomTaskDiv").show();
                }
            }
            if (d3.select("#gantt_ToggleIcon").classed("expand")) {
                $(".gantt_bottomTaskDiv").hide();
            }

            widthFromPercent = this.viewport.width * Gantt.currentDisplayRatio / 100;
            if (widthFromPercent > width) {
                this.offset = (widthFromPercent - width) / this.viewModel.dataView.categorical.categories.length;
            }

            this.margin = Gantt.DefaultMargin;
            if (this.viewModel.settings.dateType.enableToday) {
                Gantt.bottomMilestoneHeight = 23;
            } else {
                Gantt.bottomMilestoneHeight = 5;
            }

            const dateTypeMilliseconds: number = Gantt.getDateType(this.viewModel.settings.dateType.type);
            let startDate: Date;
            let endDate: Date;
            let ticks: number;
            let monthNum: number;
            let yearNum: number;
            let datamin: number;
            let datamax: number;
            let categoryLengthPrev: number;
            if (Gantt.dataMIN !== Gantt.maxSafeInteger) { datamin = Gantt.dataMIN; }
            if (Gantt.dataMAX !== Gantt.minSafeInteger) { datamax = Gantt.dataMAX; }
            startDate = Gantt.earliestStartDate;
            endDate = Gantt.lastestEndDate;
            categoryLengthPrev = getValue<number>(objects, "categoryColumnsWidth", "categoryLength", 0);

            if (datamax === undefined && !Gantt.isDateData) {
                datamin = 0;
                datamax = 1;
                ticks = 2;
                Gantt.totalTicks = ticks;
                let axisLength: number;
                axisLength = ticks * Gantt.defaultTicksLength;
                let rightSectionWidth: number;
                rightSectionWidth = Gantt.visualWidth - Gantt.taskLabelWidth
                    - this.margin.left - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
                if (rightSectionWidth > axisLength) {
                    axisLength = rightSectionWidth;
                }

                let viewportIn: IViewport;
                viewportIn = {
                    height: this.viewport.height,
                    width: axisLength
                };

                Gantt.xAxisPropertiesParamter = {
                    axisLength,
                    datamax,
                    datamin,
                    endDate,
                    startDate,
                    textProperties: this.textProperties,
                    ticks,
                    viewportIn
                };

                let xAxisProperties: IAxisProperties;
                xAxisProperties =
                    this.calculateAxes(viewportIn, this.textProperties, datamin,
                        datamax, null, null, axisLength, ticks, false);
                this.timeScale = xAxisProperties.scale as timeScale<number, number>;
                let ganttWidth: number;
                ganttWidth = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength
                    + Gantt.defaultValues.ResourceWidth;
                if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > this.viewport.width) {
                    Gantt.scrollHeight = 17;
                } else {
                    Gantt.scrollHeight = 0;
                }
                this.updateChartSize();
                this.renderCustomLegendIndicator();
                this.updateSvgSize(this, axisLength);
                this.renderAxis(xAxisProperties);
                this.rendergrids(xAxisProperties, Gantt.currentTasksNumber);
                if (Gantt.isDateData) {
                    this.createTodayLine(Gantt.currentTasksNumber);
                }

                let taskSvgWidth: number;
                taskSvgWidth = $(dotLiteral + Selectors.taskPanel.className).width();
                Gantt.columnWidth = taskSvgWidth / this.viewModel.tasksNew[0].name.length;

                if (categoryLengthPrev === 0 || categoryLengthPrev !== this.viewModel.tasksNew[0].name.length) {
                    this.resetResizeData(this.viewModel.tasksNew[0].name.length, this.viewModel);
                }

                this.updateTaskLabels(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width);
                this.updateElementsPositions(this.viewport, this.margin);

            } else if (datamax !== undefined && datamax !== null && datamax !== Gantt.minSafeInteger) {
                ticks = 15;
                if (datamin === datamax) {
                    datamax = datamin + 1;
                    ticks = 2;
                } else if (datamax > 1) {
                    ticks = Math.ceil(Math.round(datamax.valueOf() - datamin.valueOf()));
                    ticks = (ticks === 0 || ticks === 1) ? 2 : ticks;
                    if (ticks > 15) {
                        ticks = 15;
                    }
                } else if (datamax > 0 && datamax < 1) {
                    ticks = datamax.valueOf() - datamin.valueOf();
                    ticks = ticks * 10;
                }

                Gantt.totalTicks = ticks;
                let axisLength: number = ticks * Gantt.defaultTicksLength;
                let rightSectionWidth: number;
                rightSectionWidth = Gantt.visualWidth - Gantt.taskLabelWidth - this.margin.left
                    - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
                if (rightSectionWidth > axisLength) {
                    axisLength = rightSectionWidth;
                }

                let viewportIn: IViewport;
                viewportIn = {
                    height: this.viewport.height,
                    width: axisLength
                };

                Gantt.xAxisPropertiesParamter = {
                    axisLength,
                    datamax,
                    datamin,
                    endDate,
                    startDate,
                    textProperties: this.textProperties,
                    ticks,
                    viewportIn

                };

                let xAxisProperties: IAxisProperties;
                xAxisProperties =
                    this.calculateAxes(viewportIn, this.textProperties,
                        datamin, datamax, null, null, axisLength, ticks, false);
                this.timeScale = xAxisProperties.scale as timeScale<number, number>;
                const ganttWidth: number = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength
                    + Gantt.defaultValues.ResourceWidth;
                if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > this.viewport.width) {
                    Gantt.scrollHeight = 17;
                } else {
                    Gantt.scrollHeight = 0;
                }
                this.updateChartSize();
                this.renderCustomLegendIndicator();
                this.updateSvgSize(this, axisLength);
                this.renderAxis(xAxisProperties);
                this.rendergrids(xAxisProperties, Gantt.currentTasksNumber);
                if (Gantt.isDateData) {
                    this.createTodayLine(Gantt.currentTasksNumber);
                }

                let taskSvgWidth: number;
                taskSvgWidth = $(dotLiteral + Selectors.taskPanel.className).width();
                Gantt.columnWidth = taskSvgWidth / this.viewModel.tasksNew[0].name.length;
                if (categoryLengthPrev === 0 || categoryLengthPrev !== this.viewModel.tasksNew[0].name.length) {
                    this.resetResizeData(this.viewModel.tasksNew[0].name.length, this.viewModel);
                }
                this.updateTaskLabels(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width);
                this.updateElementsPositions(this.viewport, this.margin);
            } else if (startDate && Gantt.isDateData) {

                let startDate1: Date = new Date(startDate.toString());
                let endDate1: Date = new Date(endDate.toString());
                yearNum = 0;
                // Set both start and end dates for day
                if ("Day" === this.viewModel.settings.dateType.type) {
                    startDate1.setHours(0, 0, 0, 0);
                    endDate1.setDate(endDate1.getDate() + 1);
                    endDate1.setHours(0, 0, 0, 0);
                } else { // If type is not day
                    // handle start date for tick label
                    if ("Week" === this.viewModel.settings.dateType.type) {
                        startDate1.setHours(0, 0, 0, 0);
                        startDate1.setDate(startDate1.getDate() - 1);
                    } else {
                        monthNum = startDate1.getMonth();
                        if ("Year" === this.viewModel.settings.dateType.type) {
                            monthNum = 0;
                        } else if ("Quarter" === this.viewModel.settings.dateType.type) {
                            if (monthNum < 3) {
                                monthNum = 0;
                            } else if (monthNum < 6) {
                                monthNum = 3;
                            } else if (monthNum < 9) {
                                monthNum = 6;
                            } else {
                                monthNum = 9;
                            }
                        }
                        startDate1 = new Date(startDate1.getFullYear(), monthNum);
                    }
                    // handle end date for tick label
                    monthNum = endDate1.getMonth();

                    if ("Week" === this.viewModel.settings.dateType.type) {
                        endDate1.setHours(0, 0, 0, 0);
                        endDate1.setDate(endDate1.getDate() + 1);
                        let daysToAdd: number = 0;
                        daysToAdd = 7 - (Math.round(Math.abs((endDate1.getTime()
                            - startDate1.getTime()) / (24 * 60 * 60 * 1000)))) % 7;
                        endDate1.setDate(endDate1.getDate() + daysToAdd);
                    } else {
                        if ("Year" === this.viewModel.settings.dateType.type) {
                            monthNum = monthNum + 12;
                        } else if ("Quarter" === this.viewModel.settings.dateType.type) {
                            monthNum = monthNum + 3;
                            monthNum = monthNum - monthNum % 3;
                        } else if ("Month" === this.viewModel.settings.dateType.type) {
                            monthNum = monthNum + 1;
                        }
                        if (monthNum >= 12) {
                            yearNum = 1;
                            monthNum = 0;
                        }

                        endDate1 = new Date(endDate1.getFullYear() + yearNum, monthNum);
                    }
                }
                ticks = Math.ceil(Math.round(endDate1.valueOf() - startDate1.valueOf()) / dateTypeMilliseconds);
                ticks = (ticks === 0 || ticks === 1) ? 2 : ticks;
                Gantt.totalTicks = ticks;
                let axisLength: number = ticks * Gantt.defaultTicksLength;

                if (this.viewModel.settings.dateType.type === "Day") {

                    ticks = 2 * (Math.ceil(Math.round(endDate1.valueOf()
                        - startDate1.valueOf()) / dateTypeMilliseconds));
                    ticks = (ticks === 0 || ticks === 1) ? 2 : ticks;
                    axisLength = 2 * ticks * Gantt.defaultTicksLength;
                }

                let rightSectionWidth: number;
                rightSectionWidth = Gantt.visualWidth - Gantt.taskLabelWidth
                    - this.margin.left - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
                if (rightSectionWidth > axisLength) {
                    axisLength = rightSectionWidth;
                }

                let viewportIn: IViewport;
                viewportIn = {
                    height: this.viewport.height,
                    width: axisLength
                };

                Gantt.xAxisPropertiesParamter = {
                    axisLength,
                    datamax,
                    datamin,
                    endDate: endDate1,
                    startDate: startDate1,
                    textProperties: this.textProperties,
                    ticks,
                    viewportIn

                };

                let xAxisProperties: IAxisProperties;
                xAxisProperties =
                    this.calculateAxes(viewportIn, this.textProperties, datamin,
                        datamax, startDate1, endDate1, axisLength, ticks, false);
                this.timeScale = xAxisProperties.scale as timeScale<Date, Date>;
                let ganttWidth: number;
                ganttWidth = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength +
                    Gantt.defaultValues.ResourceWidth;
                if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > this.viewport.width) {
                    Gantt.scrollHeight = 17;
                } else {
                    Gantt.scrollHeight = 0;
                }
                this.updateChartSize();
                this.renderCustomLegendIndicator();
                this.updateSvgSize(this, axisLength);
                this.renderAxis(xAxisProperties);
                this.rendergrids(xAxisProperties, Gantt.currentTasksNumber);
                if (Gantt.isDateData) {
                    this.createTodayLine(Gantt.currentTasksNumber);
                }

                let taskSvgWidth: number;
                taskSvgWidth = $(dotLiteral + Selectors.taskPanel.className).width();
                Gantt.columnWidth = taskSvgWidth / this.viewModel.tasksNew[0].name.length;
                if (categoryLengthPrev === 0 || categoryLengthPrev !== this.viewModel.tasksNew[0].name.length) {
                    this.resetResizeData(this.viewModel.tasksNew[0].name.length, this.viewModel);
                }

                this.updateTaskLabels(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width);

                this.updateElementsPositions(this.viewport, this.margin);

            }
            this.adjustResizing(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width, this.viewModel);
            if ((this.viewModel.settings.legend.show
                && (this.viewport.width > $(".gantt_legendIndicatorPanel").innerWidth() + 100)
                && this.viewport.height > $(".gantt_legendIndicatorPanel").innerHeight() + 50
                && this.viewModel.kpiData.length > 0)
                && (parseFloat(d3.select(".gantt_legendPanel").style("left")) >
                    parseFloat(d3.select(".gantt_barPanel").style("left")))) {
                $(".gantt_legendPanel").show();
                if ($("#LegendToggleImage").hasClass("visible")) {
                    $(".gantt_legendIndicatorPanel").show();
                    $(".arrow").show();
                } else {
                    $(".gantt_legendIndicatorPanel").hide();
                    $(".arrow").hide();
                }
            } else {
                $(".arrow").hide();
                $(".gantt_legendPanel").hide();
                $(".gantt_legendIndicatorPanel").hide();
            }

            d3.selectAll(".legendItem").on("click", (d: SelectionDataPoint) => {
                // To disable opacity
            });
            if (this.interactivityService) {
                let behaviorOptions: any;
                behaviorOptions = {
                    behavior: this.behavior,
                    dataPoints: legendData,
                    interactivityService: this.interactivityService,
                    legendSelection: d3.selectAll(".legendItem"),
                    taskSelection: this.taskGroup.selectAll(Selectors.singlePhase.selectorName),
                };
                this.interactivityService.bind(behaviorOptions);
            }
            if (this.viewModel.settings.columnHeader.columnOutline === "leftOnly" ||
                this.viewModel.settings.columnHeader.columnOutline === "leftRight" ||
                this.viewModel.settings.columnHeader.columnOutline === "frame") {
                const drillAllPanelWidth: number = $(".gantt_drillAllPanel2").width();
                $(".gantt_drillAllPanel2").width((drillAllPanelWidth - 1) + pxLiteral);
            }
            this.sortCategories(this);
            if (d3.select("#gantt_ToggleIcon").classed("expand")) {
                $(".gantt_category0").hide();
            }
            // updating visual according to the selections
            this.syncSelectionState(

                d3.selectAll(dotLiteral + Selectors.taskRect.className),
                this.selectionManager.getSelectionIds()
            );

            // Persist colors array
            let properties: { [propertyName: string]: DataViewPropertyValue };
            properties = {};
            properties[`captionValue`] = JSON.stringify(colorsPersistObject);
            let caption1: VisualObjectInstancesToPersist;
            caption1 = {
                replace: [
                    {
                        objectName: "caption",
                        properties,
                        selector: null
                    }]
            };
            this.host.persistProperties(caption1);
            this.eventService.renderingFinished(options);
        } catch (exeption) {
                 this.eventService.renderingFailed(options, exeption);
            }

}

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions):
         VisualObjectInstanceEnumeration {
            if (!this.viewModel ||
                !this.viewModel.settings) {
                return [];
            }
            let settings: IGanttSettings;
            settings = this.viewModel.settings;
            switch (options.objectName) {
                case "legend": {
                    if (Gantt.isKpiPresent) {
                        return Gantt.enumerateLegend(settings);
                    } else {
                        return null;
                    }
                }
                case "taskLabels": {
                    return Gantt.enumerateTaskLabels(settings);
                }
                case "columnHeader": {
                    return Gantt.enumerateColumnHeader(settings);
                }
                case "taskResource": {
                    if (Gantt.isChartHasDataLabels(this.viewModel.dataView)) {
                        return Gantt.enumerateTaskResource(settings);
                    } else {
                        return null;
                    }
                }
                case "dateType": {
                    if (Gantt.isDateData) {
                        return Gantt.enumerateDateType(settings);
                    }

                    return null;
                }
                case "scrollPosition": {
                    return Gantt.enumerateScrollPosition(settings);
                }
                case "kpiColumnType": {
                    if (Gantt.isKpiPresent) {
                        return Gantt.enumerateKPIColumnTypePosition(settings, this.viewModel.kpiData);
                    } else {
                        return null;
                    }
                }
                case "taskGridlines": {
                    return Gantt.enumerateTaskGridLines(settings);
                }
                case "displayRatio": {
                    return Gantt.enumerateDisplayRatio(settings);
                }
                case "barColor": {
                    return Gantt.enumerateBarColor(options, settings);
                }
                default: {
                    return [];
                }
            }
        }

        public persistSortState(): void {
            let properties: { [propertyName: string]: DataViewPropertyValue };
            properties = {};
            properties[sortOrderLiteral] = Gantt.sortOrder;
            properties[sortLevelLiteral] = Gantt.sortLevel;
            properties[prevSortedColumnLiteral] = Gantt.prevSortedColumn;

            let persistSettings: VisualObjectInstancesToPersist;
            persistSettings = {
                replace: [
                    {
                        objectName: "sortAttributes",
                        properties,
                        selector: null
                    } as VisualObjectInstance]
            };
            this.host.persistProperties(persistSettings);
        }

        public persistResizeData(categoryLength: number, viewModel: IGanttViewModel): void {
            let properties: { [propertyName: string]: DataViewPropertyValue };
            properties = {};
            Gantt.categoryColumnsWidth = "";
            let iColumnWidth: number = 0;
            let objects: DataViewObjects;
            objects = this.viewModel.dataView.metadata.objects;
            let categoryLengthPrev: number;
            const hyphenX1Colon: string = "-x1:";
            const hyphenX2Colon: string = "-x2:";
            const hyphenX1Colon0SemiColon: string = "-x1:0;";
            const hyphenX2Colon0SemiColon: string = "-x2:0;";
            const hyphenX2Colon100SemiColon: string = "-x2:100;";
            let lastRectX: number;
            let barPanelLeft: number;
            let kpiPanelWidth: number;
            barPanelLeft = parseFloat(d3.select(".gantt_barPanel").style("left"));
            kpiPanelWidth = parseFloat(d3.select(".gantt_kpiPanel").style("left"));

            categoryLengthPrev = getValue<number>(objects, "categoryColumnsWidth", "categoryLength", 0);
            if (categoryLengthPrev && categoryLengthPrev !== 0 && categoryLengthPrev === categoryLength) {
                for (let iIterator: number = 0; iIterator < categoryLength; iIterator++) {
                    lastRectX = parseFloat($(headerCellClassLiteral + iIterator).attr("x"));
                    Gantt.categoryColumnsWidth += taskColumnLiteral + iIterator + colonLiteral
                        + d3.select(taskColumnClassLiteral + iIterator).attr("x") + semiColonLiteral;

                    if (iIterator === 0) {
                        if (categoryLength === 1) {
                            Gantt.categoryColumnsWidth += columnLiteral + iIterator + colonLiteral
                                + parseFloat($(".gantt_kpiPanel").css("left")) + semiColonLiteral;
                        } else {
                            Gantt.categoryColumnsWidth += columnLiteral + iIterator + colonLiteral
                                + parseFloat($(headerCellClassLiteral + (iIterator + 1)).attr("x")) + semiColonLiteral;
                        }
                    } else if (iIterator === categoryLength - 1) {
                        if ((kpiPanelWidth > 0 && lastRectX > kpiPanelWidth - 10) || lastRectX > barPanelLeft - 10) {
                            Gantt.categoryColumnsWidth +=
                             columnLiteral + iIterator + colonLiteral + 100 + semiColonLiteral;
                        } else {
                            if (kpiPanelWidth > 0) {
                                iColumnWidth = (parseFloat(d3.select(".gantt_kpiPanel").style("left"))
                                    - parseFloat($(headerCellClassLiteral + (iIterator)).attr("x")));
                            } else {
                                iColumnWidth =
                                 (this.viewport.width * this.viewModel.settings.displayRatio.ratio / 100) + 20
                                    - parseFloat($(headerCellClassLiteral + (iIterator)).attr("x"));
                            }

                            Gantt.categoryColumnsWidth +=
                             columnLiteral + iIterator + colonLiteral + iColumnWidth + semiColonLiteral;
                        }
                    } else {
                        iColumnWidth = parseFloat($(headerCellClassLiteral + (iIterator + 1)).attr("x"))
                            - parseFloat($(headerCellClassLiteral + (iIterator)).attr("x"));
                        Gantt.categoryColumnsWidth +=
                         columnLiteral + iIterator + colonLiteral + iColumnWidth + semiColonLiteral;
                    }
                }
                properties[ganttProperties.categoryColumnsWidth.categoryLength.propertyName]
                 = categoryLength.toString();
            }
            properties[ganttProperties.categoryColumnsWidth.width.propertyName]
             = JSON.stringify(Gantt.categoryColumnsWidth);

            let totalCategories: number;
            totalCategories = this.viewModel.tasksNew[0].name.length;
            let width: VisualObjectInstancesToPersist;
            width = {
                replace: [
                    {
                        objectName: ganttProperties.categoryColumnsWidth.width.objectName,
                        properties,
                        selector: null
                    } as VisualObjectInstance]
            };
            this.host.persistProperties(width);
        }

        // tslint:disable-next-line:no-any
        public persistExpandCollapseState(arrGantt: any): void {
            // ;
            const properties: { [propertyName: string]: DataViewPropertyValue } = {};
            properties[`expandCollapseState`] = JSON.stringify(arrGantt);
            const persistExpandCollapseSettings: VisualObjectInstancesToPersist = {
                replace: [
                    {
                        objectName: "persistExpandCollapseSettings",
                        properties,
                        selector: null
                    } as VisualObjectInstance]
            };
            this.host.persistProperties(persistExpandCollapseSettings);
        }

        public resetResizeData(categoryLength: number, viewModel: IGanttViewModel): void {
            // ;
            let properties: { [propertyName: string]: DataViewPropertyValue };
            properties = {};
            Gantt.categoryColumnsWidth = "";
            const taskSvgWidth: number = parseInt(this.taskSvg.attr("width"), 10);
            const singleColumnWidth: number = taskSvgWidth / categoryLength;
            const literalFifteen: string = "15";
            const literalFive: string = "5";
            let lastRectX: number;
            let barPanelLeft: number;
            let kpiPanelWidth: number;
            const hyphenX1Colon: string = "-x1:";
            const hyphenX2Colon: string = "-x2:";
            const hyphenX1Colon0SemiColon: string = "-x1:0;";
            const hyphenX2Colon0SemiColon: string = "-x2:0;";
            const hyphenX2Colon100SemiColon: string = "-x2:100;";
            barPanelLeft = parseFloat(d3.select(".gantt_barPanel").style("left"));
            kpiPanelWidth = parseFloat(d3.select(".gantt_kpiPanel").style("left"));
            lastRectX = (categoryLength - 1) * singleColumnWidth;
            for (let iIterator: number = 0; iIterator < categoryLength; iIterator++) {
                if (iIterator === 0) {
                    Gantt.categoryColumnsWidth += taskColumnLiteral + iIterator + colonLiteral
                        + literalFifteen + semiColonLiteral;
                } else {
                    Gantt.categoryColumnsWidth += taskColumnLiteral + iIterator + colonLiteral
                        + (iIterator * singleColumnWidth) + semiColonLiteral;
                }
                Gantt.categoryColumnsWidth +=
                 columnLiteral + iIterator + colonLiteral + singleColumnWidth + semiColonLiteral;
            }
            properties[ganttProperties.categoryColumnsWidth.categoryLength.propertyName] = categoryLength;

            properties[ganttProperties.categoryColumnsWidth.width.propertyName] =
             JSON.stringify(Gantt.categoryColumnsWidth);

            let totalCategories: number;
            totalCategories = this.viewModel.tasksNew[0].name.length;
            let width: VisualObjectInstancesToPersist;
            width = {
                replace: [
                    {
                        objectName: ganttProperties.categoryColumnsWidth.width.objectName,
                        properties,
                        selector: null
                    } as VisualObjectInstance]
            };
            this.host.persistProperties(width);
        }

        private init(options: VisualConstructorOptions): void {
            this.host = options.host;
            this.options = options;
            this.colors = options.host.colorPalette;
            this.selectionManager = options.host.createSelectionManager();
            this.selectionManager.registerOnSelectCallback(() => {
                this.syncSelectionState(
                    d3.selectAll(dotLiteral + Selectors.taskRect.className),
                    this.selectionManager.getSelectionIds()
                );
            });
            this.body = d3.select(options.element);
            this.tooltipServiceWrapper = createTooltipServiceWrapper(
                this.host.tooltipService,
                options.element);
            this.bodyElement = $(options.element);
            this.behavior = new GanttChartBehavior();
            this.interactivityService = createInteractivityService(this.host);
            this.interactivitySelectionService = new InteractivitySelectionService(options.host);
            this.createViewport(this.bodyElement);
            this.clearViewport();
            Gantt.ganttDiv.classed("gantt_hidden", true);
            Gantt.errorDiv.classed("gantt_hidden", false);
            Gantt.errorText.text("");
            this.barsLegend = createLegend(this.options.element,
               false, null, true);

        }

        /**
         * Create the viewport area of the gantt chart
         */
        private createViewport(element: JQuery): void {

            // create div container to the whole viewport area
            Gantt.errorDiv = this.body.append("div")
                .classed(Selectors.errorPanel.className, true)
                .classed("gantt_hidden", true);
            Gantt.errorText = Gantt.errorDiv.append("p");

            Gantt.ganttDiv = this.body.append("div")
                .classed(Selectors.body.className, true);

            this.legendDiv = Gantt.ganttDiv
                .append("div")
                .classed(Selectors.legendPanel.className, true);

            this.legendSvg = this.legendDiv
                .append("svg")
                .classed(Selectors.legendSvg.className, true);

            this.legendGroup = this.legendSvg
                .append("g")
                .classed(Selectors.legendGroup.className, true);

            this.legendGroup.append("image")
                .attr({
                    "class": "gantt_legendToggle",
                    "height": 13,
                    "width": 13,
                    "x": 0,
                    "xlink:href": Gantt.legendIcon
                });

            this.legendGroup
                .append("text")
                .attr({
                    "class": "gantt_legendToggle gantt_legendText",
                    "stroke": "#212121",
                    "stroke-width": 0.5,
                    "x": 18,
                    "y": 10
                })
                .text("Legend");

            this.legendGroup.append("image")
                .attr({
                    "class": "gantt_legendToggle notVisible",
                    "height": 12,
                    "id": "LegendToggleImage",
                    "width": 12,
                    "x": 62,
                    "xlink:href": Gantt.drillDownImage
                });

            this.addLegendHideShowEvents(this);

            this.arrowDiv = Gantt.ganttDiv
                .append("div")
                .attr({
                    class: "gantt_arrow-up arrow"
                });

            this.legendIndicatorDiv = Gantt.ganttDiv
                .append("div")
                .classed(Selectors.legendIndicatorPanel.className, true);

            this.legendIndicatorTitleDiv = this.legendIndicatorDiv
                .append("div")
                .classed(Selectors.legendIndicatorTitlePanel.className, true);

            this.legendIndicatorTitleSvg = this.legendIndicatorTitleDiv
                .append("svg")
                .classed(Selectors.legendIndicatorTitleSvg.className, true);

            this.kpiIndicatorDiv = this.legendIndicatorDiv
                .append("div")
                .classed(Selectors.kpiIndicatorPanel.className, true);

            this.kpiIndicatorSvg = this.kpiIndicatorDiv
                .append("svg")
                .classed(Selectors.kpiIndicatorSvg.className, true);

            this.milestoneIndicatorDiv = this.legendIndicatorDiv
                .append("div")
                .classed(Selectors.milestoneIndicatorPanel.className, true);

            this.milestoneIndicatorSvg = this.milestoneIndicatorDiv
                .append("svg")
                .classed(Selectors.milestoneIndicatorSvg.className, true);

            this.phaseIndicatorDiv = this.legendIndicatorDiv
                .append("div")
                .classed(Selectors.phaseIndicatorPanel.className, true);

            this.phaseIndicatorSvg = this.phaseIndicatorDiv
                .append("svg")
                .classed(Selectors.phaseIndicatorSvg.className, true);

            this.timelineDiv = Gantt.ganttDiv
                .append("div")
                .classed(Selectors.timeLinePanel.className, true);

            this.timelineSvg = this.timelineDiv
                .append("svg")
                .classed(Selectors.className.className, true);

            this.axisGroup = this.timelineSvg
                .append("g")
                .classed(Selectors.axisGroup.className, true);

            this.kpiTitleDiv = Gantt.ganttDiv
                .append("div")
                .classed(Selectors.kpiTitlePanel.className, true);

            this.kpiTitleSvg = this.kpiTitleDiv
                .append("svg");

            this.kpiTitleGroup = this.kpiTitleSvg
                .append("g")
                .classed(Selectors.kpiLines.className, true);

            this.drillAllDiv = Gantt.ganttDiv
                .append("div")
                .classed(Selectors.drillAllPanel.className, true);

            this.drillAllDiv2 = Gantt.ganttDiv
                .append("div")
                .classed(Selectors.drillAllPanel2.className, true);

            this.drillAllSvg = this.drillAllDiv
                .append("svg")
                .classed(Selectors.drillAllSvg.className, true);

            this.drillAllSvg2 = this.drillAllDiv2
                .append("svg")
                .classed(Selectors.drillAllSvg2.className, true);

            this.drillAllGroup = this.drillAllSvg2
                .append("g");

            this.imageDiv = Gantt.ganttDiv
                .append("div")
                .classed(Selectors.imagePanel.className, true);

            this.imageSvg = this.imageDiv
                .append("svg");

            this.imageSvg.append("image")
                .attr("id", "gantt_ToggleIcon")
                .attr("class", "collapse")
                .attr("xlink:href", Gantt.collapseImage)
                .attr("width", 12)
                .attr("height", 12);

            this.kpiImageDiv = Gantt.ganttDiv
                .append("div")
                .classed(Selectors.kpiImagePanel.className, true);

            this.kpiImageSvg = this.kpiImageDiv
                .append("svg");

            this.kpiImageSvg.append("image")
                .attr("id", "gantt_KPIToggle")
                .attr("class", "collapse")
                .attr("xlink:href", Gantt.collapseImage)
                .attr("width", 12)
                .attr("height", 12);

            this.addExpandCollapseEvent(this);

            this.bottomDiv = Gantt.ganttDiv
                .append("div")
                .classed(Selectors.bottomPannel.className, true);

            this.kpiDiv = this.bottomDiv
                .append("div")
                .classed(Selectors.kpiPanel.className, true);

            this.kpiSvg = this.kpiDiv
                .append("svg")
                .classed(Selectors.kpiSvg.className, true);

            this.backgroundGroupKPI = this.kpiSvg
                .append("g")
                .classed(Selectors.backgroundBoxSvg.className, true);

            this.kpiGroup = this.kpiSvg
                .append("g")
                .classed(Selectors.kpiLines.className, true);

            this.taskDiv = this.bottomDiv
                .append("div")
                .classed(Selectors.taskPanel.className, true);

            this.taskSvg = this.taskDiv
                .append("svg")
                .classed(Selectors.taskSvg.className, true);

            this.backgroundGroupTask = this.taskSvg
                .append("g")
                .classed(Selectors.backgroundBoxSvg.className, true);

            this.lineGroup = this.taskSvg
                .append("g")
                .classed(Selectors.taskLines.className, true);

            this.toggleTaskGroup = this.taskSvg
                .append("g")
                .classed(Selectors.toggleTaskGroup.className, true);

            this.barDiv = this.bottomDiv
                .append("div")
                .classed(Selectors.barPanel.className, true);

            this.ganttSvg = this.barDiv
                .append("svg")
                .classed(Selectors.barSvg.className, true);

            this.backgroundGroupBar = this.ganttSvg
                .append("g")
                .classed(Selectors.backgroundBoxSvg.className, true);

            this.gridGroup = this.ganttSvg
                .append("g")
                .classed(Selectors.gridGroup.className, true);

            this.chartGroup = this.ganttSvg
                .append("g")
                .classed(Selectors.chart.className, true);

            this.taskGroup = this.chartGroup
                .append("g")
                .classed(Selectors.tasks.className, true);

            this.bottommilestoneDiv = Gantt.ganttDiv
                .append("div")
                .classed(Selectors.bottomMilestonePanel.className, true);

            this.bottommilestoneSvg = this.bottommilestoneDiv
                .append("svg")
                .classed(Selectors.bottomMilestoneSvg.className, true);

            this.todayGroup = this.bottommilestoneSvg
                .append("g")
                .classed(Selectors.todayGroup.className, true);

            this.bottommilestoneGroup = this.bottommilestoneSvg
                .append("g")
                .classed(Selectors.bottomMilestoneGroup.className, true);

            this.bottomTaskDiv = Gantt.ganttDiv
                .append("div")
                .classed(Selectors.bottomTaskDiv.className, true);

            this.bottomTaskSvg = this.bottomTaskDiv
                .append("svg")
                .classed(Selectors.bottomTaskSvg.className, true);
        }

        /**
         * Clear the viewport area
         */
        private clearViewport(): void {

            this.body.selectAll(Selectors.legendItems.selectorName).remove();
            this.body.selectAll(Selectors.legendTitle.selectorName).remove();
            this.axisGroup.selectAll(Selectors.axisTick.selectorName).remove();
            this.axisGroup.selectAll(Selectors.domain.selectorName).remove();
            this.gridGroup.selectAll("*").remove();
            this.bottommilestoneGroup.selectAll("*").remove();
            this.lineGroup.selectAll("*").remove();
            this.kpiTitleGroup.selectAll("*").remove();
            this.kpiGroup.selectAll("*").remove();
            this.chartGroup.selectAll(Selectors.chartLine.selectorName).remove();
            this.chartGroup.selectAll(Selectors.taskGroup.selectorName).remove();
            this.chartGroup.selectAll(Selectors.singlePhase.selectorName).remove();
        }

        /**
         * Update div container size to the whole viewport area
         * @param viewport The vieport to change it size
         */
        private updateChartSize(): void {
            if (legendIndex !== -1) {
                position(d3.select(".gantt-body"), this.barsLegend);
            }

            this.viewport.width = Math.ceil(this.viewport.width);
            this.viewport.height = Math.ceil(this.viewport.height);
            const heightSize: number = 20;
            Gantt.ganttDiv.style({
                height: PixelConverter.toString(this.viewport.height - heightSize),
                width: PixelConverter.toString(this.viewport.width)
            });

            this.legendDiv.style({
                left: PixelConverter.toString(this.viewport.width - Gantt.legendWidth)
            });

            this.bottomDiv.style({
                top: PixelConverter.toString(Gantt.axisHeight),
                width: PixelConverter.toString(this.viewport.width)
            });

            this.taskDiv.style({
                width: PixelConverter.toString(Gantt.taskLabelWidth + heightSize)
            });

            this.kpiDiv.style({
                left: PixelConverter.toString(Gantt.taskLabelWidth + heightSize),
                width: PixelConverter.toString(Gantt.kpiLabelWidth)
            });

            this.kpiTitleDiv.style({
                "background-color": Gantt.columnHeaderBgColor,
                "height": PixelConverter.toString(23),
                "left": PixelConverter.toString(Gantt.taskLabelWidth + heightSize),
                "top": PixelConverter.toString(20),
                "width": PixelConverter.toString(Gantt.kpiLabelWidth)
            });

            this.barDiv.style({
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + heightSize),
                width: PixelConverter.toString(this.viewport.width - Gantt.taskLabelWidth - Gantt.kpiLabelWidth)
            });

            this.timelineDiv.style({
                height: PixelConverter.toString(Gantt.axisHeight),
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + heightSize),
                width: PixelConverter.toString(this.viewport.width
                     - Gantt.taskLabelWidth - Gantt.scrollHeight - Gantt.kpiLabelWidth)
            });

            this.imageDiv.style({
                height: PixelConverter.toString(21),
                left: PixelConverter.toString(Gantt.taskLabelWidth + 5),
                width: PixelConverter.toString(15)
            });

            this.kpiImageDiv.style({
                height: PixelConverter.toString(21),
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 5),
                width: PixelConverter.toString(15)
            });

            this.drillAllDiv.style({
                height: PixelConverter.toString(Gantt.axisHeight),
                top: PixelConverter.toString(0),
                width: PixelConverter.toString(Gantt.taskLabelWidth + heightSize)
            });

            this.bottommilestoneDiv.style({
                height: PixelConverter.toString(Gantt.bottomMilestoneHeight
                    + Gantt.scrollHeight),
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + heightSize),
                width: PixelConverter.toString(this.viewport.width
                     - Gantt.taskLabelWidth - Gantt.kpiLabelWidth - heightSize)
            });

            let thisObj: this;
            thisObj = this;
            this.bottommilestoneDiv.on("scroll", (): void => {
                let bottomMilestoneScrollPosition: number = 0;
                // tslint:disable-next-line:no-any
                let bottomMilestonePanel: any;
                bottomMilestonePanel = document.getElementsByClassName("gantt_bottomMilestonePanel");
                Gantt.isScrolled = true;
                if (bottomMilestonePanel) {
                    bottomMilestoneScrollPosition = bottomMilestonePanel[0].scrollLeft;
                    thisObj.setBottomScrollPosition(bottomMilestoneScrollPosition);
                }
            });
            let categoryWidth: number;
            let categoryWidthSvg: number;
            if (!this.viewModel.settings.taskLabels.isHierarchy) {
                categoryWidth = 700;
                categoryWidthSvg = 700;
            } else {
                // tslint:disable-next-line:no-any
                const divTask: any = this.taskDiv.append("div");
                categoryWidth = $($(divTask)[0]).parent().width();
                categoryWidthSvg = scrollWidth + 75;
            }

            this.bottomTaskDiv.style({
                "bottom": PixelConverter.toString(0),
                "height": PixelConverter.toString(28),
                "left": PixelConverter.toString(0),
                "overflow-x": "auto",
                "overflow-y": "hidden",
                "position": "absolute",
                "width": PixelConverter.toString(categoryWidth)

            }).on("scroll", (): void => {
                let bottomTaskScrollPosition: number = 0;
                // tslint:disable-next-line:no-any
                let bottomTaskDiv: any;
                bottomTaskDiv = document.getElementsByClassName("gantt_bottomTaskDiv");
                Gantt.isScrolled = true;
                if (bottomTaskDiv) {
                    bottomTaskScrollPosition = bottomTaskDiv[0].scrollLeft;
                    thisObj.setBottomTaskScrollPosition(bottomTaskScrollPosition);
                }
            });

            this.bottomTaskSvg.style({
                bottom: PixelConverter.toString(0),
                height: PixelConverter.toString(Gantt.scrollHeight + 10),
                left: PixelConverter.toString(0),
                position: "fixed",
                width: PixelConverter.toString(categoryWidthSvg)
            });
        }

        // tslint:disable-next-line:no-shadowed-variable
        private adjustResizing(tasks: ITask[], taskLabelwidth: number, viewModel: IGanttViewModel): void {
            let pressed: boolean;
            pressed = false;
            let moved: boolean;
            moved = false;
            let start: JQuery;
            start = undefined;
            let columnClass: string;
            let startX: number;
            let lastRectStartX: number;
            let startWidth: number;
            let xDiff: number;
            let calculateWidth: number;
            let calculatedLastRectX: number;
            let thisObj: this;
            thisObj = this;
            let columnNumber: number;
            columnNumber = 0;
            let categoriesLength: number;
            categoriesLength = tasks[0].name.length;
            const resizerClassLiteral: string = ".gantt_resizer";

            $(resizerClassLiteral).mousedown(function(e: JQueryMouseEventObject): void {
                Gantt.isResizeStarted = true;
                columnClass = this.getAttribute("columnId");
                start = $(dotLiteral + columnClass);
                pressed = true;
                startX = e.pageX;
                startWidth = this.x.animVal.value;
                lastRectStartX = parseFloat($(headerCellClassLiteral + (tasks[0].name.length - 1)).attr("x"));
            });

            let columnX: string[];
            columnX = [];
            let scrollerX: string[];
            scrollerX = [];
            let verticalLinesX1: string[];
            verticalLinesX1 = [];
            let horizontalLinesX1: string[];
            horizontalLinesX1 = [];
            let horizontalLinesX2: string[];
            horizontalLinesX2 = [];
            let kpiLeft: string;
            kpiLeft = d3.select(".gantt_kpiPanel").style("left");
            let barLeft: string;
            barLeft = d3.select(".gantt_barPanel").style("left");
            let scroller: number;
            if (!viewModel.settings.taskLabels.isHierarchy) {
                for (let iIterator: number = parseInt(columnNumber + nullStringLiteral, 10);
                    iIterator < tasks[0].name.length; iIterator++) {
                    columnX[iIterator] = d3.select(taskColumnClassLiteral + iIterator).attr("x");
                    if (iIterator !== 0) {
                        scrollerX[iIterator] = d3.select(headerCellClassLiteral + iIterator).attr("x");
                    }
                }
            }
            let highestLabelLength: number = 0;
            $(document).mousemove((e: JQueryMouseEventObject): void => {
                if (pressed) {
                    moved = true;
                    xDiff = (e.pageX - startX);
                    xDiff = xDiff < (-startWidth + 23) ? (-startWidth + 23) : xDiff;
                    calculateWidth = startWidth + xDiff;
                    calculatedLastRectX = lastRectStartX + xDiff;
                    columnNumber = parseInt(columnClass.substr(10, columnClass.length - 10), 10);

                    let columns: Selection<SVGAElement>;
                    columns = d3.selectAll(taskColumnClassLiteral + (columnNumber - 1));
                    let taskLabelsFontSize: number;
                    taskLabelsFontSize = viewModel.settings.taskLabels.fontSize;
                    let taskLabelsFontFamily: string;
                    taskLabelsFontFamily = viewModel.settings.taskLabels.fontFamily;
                    let reflectChange: boolean;
                    reflectChange = true;
                    let rightMovement: boolean;
                    rightMovement = true;
                    highestLabelLength = 0;
                    let lastRectX: number;
                    lastRectX = 0;
                    let allowLeftMove: boolean;
                    allowLeftMove = true;
                    let allowRightMove: boolean;
                    allowRightMove = true;
                    lastRectX = parseFloat(d3.select(headerCellClassLiteral + (categoriesLength - 1)).attr("x"));
                    let lastColumns: Selection<SVGAElement>;
                    lastColumns = d3.selectAll(taskColumnClassLiteral + (categoriesLength - 1));
                    columns.each(function(): void {

                        let prevColumnStart: number;
                        let currColumnStart: number;

                        if (columnNumber === 1) {
                            prevColumnStart = 15;
                        } else {
                            prevColumnStart =
                             parseFloat(d3.select(headerCellClassLiteral + (columnNumber - 1)).attr("x"));
                        }
                        currColumnStart = parseFloat(d3.select(headerCellClassLiteral + columnNumber).attr("x"));

                        let textProperties: TextProperties;
                        textProperties = {
                            fontFamily: taskLabelsFontFamily,
                            fontSize:
                             (taskLabelsFontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize + pxLiteral,
                            text: ""
                        };
                        this.textContent = textMeasurementService
                            .getTailoredTextOrDefault(textProperties, (currColumnStart - prevColumnStart));
                    });

                    scroller = parseInt(columnNumber + nullStringLiteral, 10);
                    let scrollAdd: number;
                    scroller++;
                    let previousColumnStart: number;
                    let currentColumnStart: number;

                    if (columnNumber === 1) {
                        previousColumnStart = 15;
                    } else {
                        previousColumnStart
                         = parseFloat(d3.select(headerCellClassLiteral + (columnNumber - 1)).attr("x"));
                    }
                    currentColumnStart = parseFloat(d3.select(headerCellClassLiteral + columnNumber).attr("x"));
                    if (reflectChange) {
                        if (calculateWidth >= previousColumnStart) {
                            d3.select(dotLiteral + columnClass).attr("x", calculateWidth);
                            for (let iIterator: number = scroller; iIterator < tasks[0].name.length; iIterator++) {
                                scrollAdd = parseFloat(scrollerX[iIterator]) + parseFloat(xDiff.toString());
                                d3.select(headerCellClassLiteral + iIterator).attr("x", scrollAdd);
                            }

                            let sum: number;
                            for (let iIterator: number = parseInt(columnNumber + nullStringLiteral, 10);
                                iIterator < tasks[0].name.length; iIterator++) {
                                sum = parseFloat(columnX[iIterator]) + parseFloat(xDiff.toString());
                                d3.selectAll(taskColumnClassLiteral + iIterator).attr("x", sum);
                                d3.selectAll(categoryIdLiteral + iIterator).attr("x", sum);
                            }
                        }
                    }
                }
            });

            $(document).mouseup((): void => {
                if (pressed) {
                    pressed = false;
                    thisObj.persistResizeData(tasks[0].name.length, viewModel);
                }
                if (moved && columnClass) {
                    columnClass = undefined;
                    moved = false;
                }
            });

            let taskSvgWidth: number;
            taskSvgWidth = $(dotLiteral + Selectors.taskPanel.className).width();
            Gantt.columnWidth = taskSvgWidth / tasks[0].name.length;
            let toggleTasks: Selection<SVGAElement>;
            toggleTasks = d3.selectAll(dotLiteral + Selectors.toggleTask.className);
        }

        public static converter(dataView: DataView, host: IVisualHost, colors: IColorPalette,
            // tslint:disable-next-line:typedef
                                barsLegend: ILegend, viewport): IGanttViewModel {
            if (!dataView
                || !dataView.categorical
                || !Gantt.isChartHasTask(dataView)) {
                return null;
            }
            let objects: DataViewObjects;
            objects = dataView.metadata.objects;
            Gantt.stateValue = getValue(objects, "persistExpandCollapseSettings", "expandCollapseState", "{}");
            // tslint:disable-next-line:typedef
            Gantt.arrGantt = JSON.parse(Gantt.stateValue);
            // tslint:disable-next-line:no-any
            let oOptimizedObj: any = {};
            // tslint:disable-next-line
            let arrOptimized = [];
            const settings: IGanttSettings = GanttSettings.parse(dataView.metadata.objects, colors);
            // tslint:disable-next-line:typedef
            $.map(Gantt.arrGantt, (sVal, iKey) => {
                if ("array" === $.type(sVal)) {
                    oOptimizedObj.sName = Object.keys(Gantt.arrGantt[iKey][0]).toString();
                    oOptimizedObj.sFlag = Gantt.arrGantt[iKey][0][oOptimizedObj.sName];
                    arrOptimized.push(oOptimizedObj);
                    oOptimizedObj = {};
                }
            });
            let metadata: DataViewMetadata;
            metadata = dataView.metadata;
            const colorPalette: IColorPalette = host.colorPalette;
            // tslint:disable-next-line
            let oMap: any = {};
            let displayName: string;
            let tooltipIndexNew: string[];
            tooltipIndexNew = [];
            let gColumns: DataViewMetadataColumn[];
            gColumns = dataView.metadata.columns;
            let iColumnLength: number;
            iColumnLength = gColumns.length;
            for (let iColumnCount: number = 0; iColumnCount < iColumnLength; iColumnCount++) {
                if (gColumns[iColumnCount].roles[GanttRoles.tooltip]) {
                    displayName = gColumns[iColumnCount].displayName;
                    if (!oMap[displayName]) {
                        tooltipIndexNew.push(displayName);
                        oMap[displayName] = 1;
                    }
                }
            }
            let tooltipIndexLength: number;
            tooltipIndexLength = tooltipIndexNew.length;

            let kpiData: IKPIConfig[];
            kpiData = [];
            // tslint:disable-next-line:no-any
            let resourceFeild: any = null;
            // tslint:disable-next-line:no-any
            let transformedArr: any;
            transformedArr = [];
            const metadataColumnsLength: number = metadata.columns.length;
            // tslint:disable-next-line:no-any
            const kpiCatData: any = dataView.categorical.categories;
            for (let iIterator: number = 0; iIterator < metadataColumnsLength; iIterator++) {
                if (metadata.columns[iIterator].roles[GanttRoles.kpiValueBag]) {
                    let currentColumn: DataViewMetadataColumn;
                    currentColumn = metadata.columns[iIterator];
                    kpiData.push({
                        identity: { metadata: currentColumn.queryName },
                        name: currentColumn.displayName,
                        type: getValue<string>(currentColumn.objects, "kpiColumnType", "type", "Value")
                    });
                }
                if (metadata.columns[iIterator].roles[GanttRoles.resource]) {
                    resourceFeild = metadata.columns[iIterator].displayName;
                }
            }
            // tslint:disable-next-line:no-any
            let newKpiData: any = [];
            // tslint:disable-next-line:no-any
            let sortKpiData: any = [];
            for (let i: number = kpiCatData.length - 1; i >= 0; i--) {
                for (let jIterator: number = kpiData.length - 1; jIterator >= 0; jIterator--) {
                    if (kpiCatData[i].source.displayName ===
                         kpiData[jIterator].name && newKpiData.indexOf(kpiData[jIterator], 0) === -1) {
                        newKpiData.push(kpiData[jIterator]);
                    }
                }
            }
            sortKpiData = newKpiData;
            newKpiData = [];
            for (let i: number = sortKpiData.length - 1; i >= 0; i--) {
                newKpiData.push(sortKpiData[i]);
            }
            while (kpiData.length !== 0) {
                kpiData.pop();
            }
            for (const slen of newKpiData) {
                kpiData.push(slen);
            }
            Gantt.formatters = this.getFormatters(dataView);

            const tasksNew: ITask[] = Gantt.createTasks(dataView,
                 host, Gantt.formatters, colorPalette, settings, barsLegend, viewport);
            // tslint:disable-next-line:no-any
            const rows1: any[] = [];

            let iRow: number;
            const len: number = dataView.categorical.categories[0].values.length;
            const cLength: number = dataView.metadata.columns.length;
            const mappingIndex: number[] = [];
            const categoriesLength: number = dataView.categorical.categories.length;
            const valuesLength: number = dataView.categorical.values.length;
            let valuesLengthCounter: number = 0;

            // tslint:disable-next-line
            let roleIndexArray: any[] = [];
            roleIndexArray[`Category`] = [];
            roleIndexArray[`Legend`] = [];
            roleIndexArray[`StartDate`] = [];
            roleIndexArray[`EndDate`] = [];
            roleIndexArray[`Resource`] = [];
            roleIndexArray[`KPIValueBag`] = [];
            roleIndexArray[`Tooltip`] = [];
            let combine: number[] = [];
            // tslint:disable-next-line
            let displayNameArray: any[] = [];
            for (let iCount: number = 0; iCount < categoriesLength; iCount++) {
                if (dataView.categorical.categories[iCount].source.roles.Category) {
                    roleIndexArray[`Category`].push(iCount);
                }
                if (dataView.categorical.categories[iCount].source.roles.Legend) {
                    roleIndexArray[`Legend`].push(iCount);
                }
                if (dataView.categorical.categories[iCount].source.roles.KPIValueBag) {
                    roleIndexArray[`KPIValueBag`].push(iCount);
                }
                if (dataView.categorical.categories[iCount].source.roles.Category &&
                    dataView.categorical.categories[iCount].source.roles.KPIValueBag) {
                    combine.push(iCount);
                }
            }

            const legendRoleLength: number = roleIndexArray[`Legend`].length;
            const kpiRoleLength: number = roleIndexArray[`KPIValueBag`].length;
            if (legendRoleLength !== 0 || kpiRoleLength !== 0) {
                if (roleIndexArray[`Legend`].length === 3) {
                    roleIndexArray[`Legend`].splice(2, 1);
                }
                if (roleIndexArray[`Legend`].length === 2) {
                    roleIndexArray[`Legend`].splice(0, 1);
                }
                const index: number = roleIndexArray[`Category`].indexOf(roleIndexArray[`Legend`][0]);
                if (index !== -1) {
                    roleIndexArray[`Category`].splice(index, 1);
                }
                const iIndex: number = roleIndexArray[`KPIValueBag`].indexOf(roleIndexArray[`Legend`][0]);
                if (iIndex !== -1) {
                    roleIndexArray[`KPIValueBag`].splice(iIndex, 1);
                }
                combine = combine.reverse();
                const combineLen: number = Math.floor(combine.length / 2);
                for (let iCat: number = 0; iCat < combineLen; iCat++) {
                    const index1: number = roleIndexArray[`Category`].indexOf(combine[iCat]);
                    const index2: number = roleIndexArray[`KPIValueBag`].indexOf(combine[iCat]);
                    roleIndexArray[`Category`].splice(index1, 1);
                    roleIndexArray[`KPIValueBag`].splice(index2, 1);
                }
            }
            // tslint:disable-next-line:no-any
            let valuesdata: any;
            valuesdata = dataView.categorical.values;
            for (let iCount: number = 0; iCount < valuesLength; iCount++) {
                if (valuesdata[iCount].source.roles.StartDate) {
                    roleIndexArray[`StartDate`].push(iCount);
                    valuesLengthCounter++;
                }
                if (valuesdata[iCount].source.roles.EndDate) {
                    roleIndexArray[`EndDate`].push(iCount);
                    valuesLengthCounter++;
                }
                if (valuesdata[iCount].source.roles.Resource) {
                    roleIndexArray[`Resource`].push(iCount);
                    valuesLengthCounter++;
                }
                if (valuesdata[iCount].source.roles.Tooltip) {
                    roleIndexArray[`Tooltip`].push(iCount);
                    valuesLengthCounter++;
                }
            }
            const totalLength: number = categoriesLength + valuesLengthCounter;
            let counter: number = 0;
            for (iRow = 0; iRow < len; iRow++) {
                rows1[iRow] = [];
                let iColumn: number = 0;
                for (const iCat of roleIndexArray[`Category`]) {
                    const format: string =
                     dataView.categorical.categories[iCat].source.format;
                    // tslint:disable-next-line:no-any
                    let value: any = dataView.categorical.categories[iCat].values[iRow];
                    if (format !== undefined) {
                        if (dateFormat.test(value)) {
                            value = ValueFormatter.format(new Date(value.toString()), format);
                        } else {
                            value = ValueFormatter.format(value, format);
                        }
                    }
                    rows1[iRow][iColumn] = value;

                    if (displayNameArray.length < totalLength) {
                        displayNameArray.
                        push(dataView.categorical.categories[iCat].source.displayName);
                    }
                    iColumn++;
                }
                let startDateFormat: boolean;
                // tslint:disable-next-line:no-any
                startDateFormat =
                 dateFormat.test(dataView.categorical.values[roleIndexArray[`StartDate`][0]].values[iRow] as any);
                rows1[iRow][iColumn] =
                 (startDateFormat) ? new Date(valuesdata[roleIndexArray[`StartDate`][0]].values[iRow].toString())
                    : dataView.categorical.values[roleIndexArray[`StartDate`][0]].values[iRow];
                if (displayNameArray.length < totalLength) {
                    displayNameArray.push(valuesdata[roleIndexArray[`StartDate`][0]].source.displayName);
                }

                iColumn++;
                // tslint:disable-next-line:no-any
                const endDateFormat: boolean =
                 dateFormat.test(dataView.categorical.values[roleIndexArray[`EndDate`][0]].values[iRow] as any);
                rows1[iRow][iColumn] =
                 (endDateFormat) ? new Date(valuesdata[roleIndexArray[`EndDate`][0]].values[iRow].toString())
                    : (dataView.categorical.values[roleIndexArray[`EndDate`][0]].values[iRow]);
                if (displayNameArray.length < totalLength) {
                    displayNameArray.push(valuesdata[roleIndexArray[`EndDate`][0]].source.displayName);
                }
                iColumn++;
                for (const iCat of roleIndexArray[`Resource`]) {
                    const flag: boolean = dateFormat.test(valuesdata[iCat].values[iRow]);
                    // tslint:disable-next-line:no-any
                    const value: any =
                     (flag) ? new Date(valuesdata[iCat].values[iRow].toString())
                        : valuesdata[iCat].values[iRow];
                    rows1[iRow][iColumn] = value;
                    if (displayNameArray.length < totalLength) {
                        displayNameArray.push(valuesdata[iCat].source.displayName);
                    }
                    iColumn++;
                }
                for (const iCat of roleIndexArray[`KPIValueBag`]) {
                    const format: string =
                     dataView.categorical.categories[iCat].source.format;
                    // tslint:disable-next-line:no-any
                    let value: any = dataView.categorical.categories[iCat].values[iRow];
                    if (format !== undefined) {
                        if (dateFormat.test(value)) {
                            value = ValueFormatter.format(new Date(value.toString()), format);
                        } else {
                            value = ValueFormatter.format(value, format);
                        }
                    }
                    rows1[iRow][iColumn] = value;
                    if (displayNameArray.length < totalLength) {
                        displayNameArray
                        .push(dataView.categorical.categories[iCat].source.displayName);
                    }
                    iColumn++;
                }
                for (const iCat of roleIndexArray[`Tooltip`]) {
                    const format: string = valuesdata[iCat].source.format;
                    // tslint:disable-next-line:no-any
                    let value: any = valuesdata[iCat].values[iRow];
                    if (format !== undefined) {
                        if (dateFormat.test(value)) {
                            value = ValueFormatter.format(new Date(value.toString()), format);
                        } else {
                            value = ValueFormatter.format(value, format);
                        }
                    }

                    rows1[iRow][iColumn] = value;
                    if (displayNameArray.length < totalLength) {
                        displayNameArray.push(valuesdata[iCat].source.displayName);
                    }
                    iColumn++;
                }
                displayNameArray.push("lastChildId");
                rows1[iRow][iColumn] = counter;
                counter++;
            }
            // tslint:disable-next-line:no-any
            let rows: any;
            rows = rows1;
            // tslint:disable-next-line:no-any
            let columns: any;
            columns = dataView.metadata.columns;
            // tslint:disable-next-line:no-any
            let columnMappings: any;
            // tslint:disable-next-line
            let categoriesdata: any[] = [];
            let categoriesdataLen: number = 0;
            for (const i of roleIndexArray[`Category`]) {
                categoriesdata.push(dataView.categorical.categories[i]);
            }

            let kpiLength: number;
            kpiLength = kpiData.length;
            categoriesdataLen = dataView.categorical.categories.length - (kpiLength + 1);

            columnMappings = dataView.metadata.columns;
            // tslint:disable-next-line:no-any
            let elementIterator: any;
            // tslint:disable-next-line:no-any
            const ganttValues: any = [];
            ganttValues.push(GanttRoles);
            // tslint:disable-next-line:no-any
            elementIterator = rows.map((ele: any, i: any): any => {
                // tslint:disable-next-line:no-any
                let obj: any;
                obj = {};

                // tslint:disable-next-line:no-any
                ele.forEach((e: any, ii: any): void => {
                    if (!obj[displayNameArray[ii]]) {
                        obj[displayNameArray[ii]] = e;
                    }
                });

                return obj;
            });
            // tslint:disable-next-line:no-any
            let categoryColumns: any;
            // tslint:disable-next-line:typedef
            categoryColumns = categoriesdata.filter((column) => {
                return !column.isMeasure || !kpiData;
            });
            // tslint:disable-next-line:prefer-const
            let categorylen: number = categoryColumns.length;
            let legendIndex1: number = -1;
            for (let i: number = 0; i < categoryColumns.length; i++) {
                if ((!categoryColumns[i].source.roles.Category || categoryColumns[i].source.roles.KPIValueBag) &&
                    (!categoryColumns[i].source.roles.Category || !categoryColumns[i].source.roles.KPIValueBag)) {
                    categoryColumns.splice(i, 1);
                    i--;
                }
                if (categoryColumns[i].source.roles.Legend) {
                    legendIndex1 = i;
                }
            }
            Gantt.categorylength = categoryColumns.length;
            // tslint:disable-next-line:no-any
            let categoryColumnsMappings: any;
            // tslint:disable-next-line:typedef
            categoryColumnsMappings = columnMappings.filter((column) => {
                return column.isMeasure;
            });
            for (let i: number = categoryColumns.length - 1; i >= 0; i--) {
                // tslint:disable-next-line:no-shadowed-variable
                for (const k of kpiData) {
                    if (categoryColumns[i] && (categoryColumns[i].displayName === k.name)) {
                        categoryColumns.splice(i, 1);
                    }
                }
            }
            // tslint:disable-next-line:no-any
            let startArr: any;
            startArr = [];
            // tslint:disable-next-line:no-any
            let endArr: any;
            endArr = [];
            let id: number;
            id = 0;
            // tslint:disable-next-line:no-any
            let name: any;
            name = " ";
            let start: Date;
            let end: Date;
            let numStart: number;
            numStart = null;
            let numEnd: number;
            numEnd = null;
            // tslint:disable-next-line:no-any
            let resource: any;
            resource = null;
            let color: string;
            color = " ";
            // tslint:disable-next-line:prefer-const
            let tooltipInfo: VisualTooltipDataItem[];
            // tslint:disable-next-line:prefer-const
            let selectionId: ISelectionId;
            let kpiValues: IKPIValues[];
            kpiValues = [];
            let tooltipValues: IKPIValues[];
            tooltipValues = [];
            // tslint:disable-next-line:no-any
            let startDisplayName: any;
            // tslint:disable-next-line:no-any
            let endDisplayName: any;
            let level: number;
            level = 0;
            let isLeaf: boolean;
            isLeaf = false;
            let rowId: number;
            let parentId: number;
            parentId = 0;
            let expanded: boolean;
            let repeat: number;
            repeat = 0;
            // tslint:disable-next-line:no-any
            const repeatValue: any = [];
            // tslint:disable-next-line:typedef
            $.map(arrOptimized, (e) => {
                if (name === e.sName) {
                    expanded = e.sFlag;
                }
            });
            if (expanded === undefined || null) {
                expanded = false;
            }
            // tslint:disable-next-line
            const hierarchicalData: any = {
                children: [],
                color,
                end,
                id,
                kpiMeasure: {},
                kpiValues: [],
                lastChildId: -1,
                measure: {},
                name: "Total",
                numEnd,
                resource,
                selectionId: [],
                start,
                tooltipInfo,
                tooltipValues: []
            },
                // tslint:disable-next-line:typedef
                levels = categoryColumns.map((a) =>  a.source.displayName );
            // tslint:disable-next-line:no-any
            categoryColumnsMappings.forEach((measureCol: any): void => {
                hierarchicalData.measure[measureCol.displayName] = 0;
            });

            // tslint:disable-next-line:no-any
            kpiData.forEach((kpimeasureCol: any): void  => {
                hierarchicalData.kpiMeasure[kpimeasureCol.name] = 0;
            });
            let kpiDataValues: IKPIValues[];
            kpiDataValues = [];

            // tslint:disable-next-line:no-any
            categoryColumnsMappings.forEach((measureCol: any): any => {
                if (measureCol.roles.StartDate) {
                    startDisplayName = measureCol.displayName;
                } else if (measureCol.roles.EndDate) {
                    endDisplayName = measureCol.displayName;
                } else {
                    return;
                }

            });

            // tslint:disable-next-line:no-any
            categoriesdata[0].values.map((child: any, index: number) => {
                let startDate: Date = null;
                let endDate: Date = null;
                let datamin: number = null;
                let datamax: number = null;

                if ((Gantt.getCategoricalTaskProperty<Date>(columns, valuesdata, GanttRoles.startDate, index, -1)
                    && typeof Gantt.getCategoricalTaskProperty<Date>
                    (columns, valuesdata, GanttRoles.startDate, index, -1)
                    === typeof this.earliestStartDate) ||
                    (Gantt.getCategoricalTaskProperty<Date>
                        (columns, valuesdata, GanttRoles.endDate, index, -1)
                        && typeof Gantt.getCategoricalTaskProperty<Date>
                        (columns, valuesdata, GanttRoles.endDate, index, -1)
                        === typeof this.earliestStartDate)) {
                    startDate = Gantt.getCategoricalTaskProperty<Date>
                    (columns, valuesdata, GanttRoles.startDate, index, -1);
                    endDate = Gantt.getCategoricalTaskProperty<Date>
                    (columns, valuesdata, GanttRoles.endDate, index, -1);

                    startDate = startDate ? startDate : new Date();
                    endDate = endDate ? endDate : new Date();
                    Gantt.isDateData = true;
                } else {
                    datamin = Gantt.getCategoricalTaskProperty<number>
                    (columns, valuesdata, GanttRoles.startDate, index, -1);
                    datamax = Gantt.getCategoricalTaskProperty<number>
                    (columns, valuesdata, GanttRoles.endDate, index, -1);
                    if (datamax == null || datamin > datamax) {
                        datamax = datamin;
                    }
                    if (datamin == null || datamin > datamax) {
                        datamin = datamax;
                    }
                    if (Gantt.getCategoricalTaskProperty<Date>(columns, valuesdata, GanttRoles.startDate, index, -1)
                        || Gantt.getCategoricalTaskProperty<Date>(columns, valuesdata, GanttRoles.endDate, index, -1)) {
                        Gantt.isDateData = false;
                    }
                }
            });

            if (settings.taskLabels.isHierarchy) {
                // tslint:disable-next-line:no-any
                elementIterator.forEach((d: any, i: any): any => {
                    // Keep this as a reference to the current level
                    // tslint:disable-next-line:no-any
                    let depthCursor: any = hierarchicalData.children;
                    // tslint:disable-next-line:no-shadowed-variable
                    let kpiValues: IKPIValues[];
                    kpiValues = [];
                    let lastChildId: number = -1;
                    // tslint:disable-next-line:no-shadowed-variable
                    let tooltipValues: ITooltipDataValues[];
                    tooltipValues = [];
                    // tslint:disable-next-line:no-any
                    const resourceValues: any = [];
                    // tslint:disable-next-line:no-any
                    const measure: any = [];
                    // Go down one level at a time
                    // tslint:disable-next-line:no-any
                    levels.forEach((property: any, depth: any): void => {
                        // Look to see if a branch has already been created
                        // tslint:disable-next-line:no-any
                        let index: any;
                        // tslint:disable-next-line:no-any
                        depthCursor.forEach((child: any, ind: any): void => {
                            if (child.children.length > 0) {
                                if (d[property] === child.name) { index = ind; }
                            }
                        });
                        // Add a branch if it isn't there

                        if (isNaN(index)) {
                            depthCursor.push({
                                children: [],
                                color,
                                kpiMeasure: {},
                                kpiValues: [],
                                lastChildId: -1,
                                measure: {},
                                name: d[property],
                                resource,
                                tooltipValues: []
                            });
                            index = depthCursor.length - 1;
                        }
                        // tslint:disable-next-line:no-any
                        const measures: any = {};
                        // tslint:disable-next-line:no-any
                        const kpiMeasures: any = {};
                        // if this is a leaf, add the measure values, else add 0 as the measure value
                        if (depth === levels.length - 1) {
                            kpiValues = [];
                            // tslint:disable-next-line:no-string-literal
                            lastChildId = d["lastChildId"];
                            // tslint:disable-next-line:no-any
                            kpiData.forEach((kpiMeasure: any): void => {
                                kpiValues.push({
                                    name: kpiMeasure.name,
                                    value: d[kpiMeasure.name]
                                });
                            });
                            // tslint:disable-next-line
                            let index: number = 0;
                            // tslint:disable-next-line:no-any
                            tooltipIndexNew.forEach((tooltipMeasure: any): void => {
                                tooltipValues.push({
                                    name: tooltipIndexNew[index],
                                    value: d[tooltipMeasure]
                                });

                                index++;
                            });
                            resource = d[resourceFeild] === undefined ? "" : d[resourceFeild];
                            if (typeof d[startDisplayName] !== "number") {
                                start = new Date(d[startDisplayName]);
                                end = new Date(d[endDisplayName]);
                            } else {
                                numStart = null === d[startDisplayName] ? d[endDisplayName] : d[startDisplayName];
                                numEnd = null === d[endDisplayName] ? d[startDisplayName] : d[endDisplayName];
                            }

                        } else {
                            kpiValues = [];
                            // tslint:disable-next-line:no-any
                            kpiData.forEach((kpiMeasure: any): void => {
                                kpiValues.push({
                                    name: kpiMeasure.name,
                                    value: null
                                });

                            });

                            resource = null;
                            tooltipInfo = null;
                            start = null;
                            end = null;
                            numStart = null;
                            numEnd = null;
                        }
                        depthCursor[index].kpiValues = kpiValues;
                        depthCursor[index].tooltipValues = tooltipValues;
                        depthCursor[index].resource = resource;
                        depthCursor[index].measure = measures;
                        depthCursor[index].start = start;
                        depthCursor[index].end = end;
                        depthCursor[index].numStart = numStart;
                        depthCursor[index].numEnd = numEnd;
                        depthCursor[index].lastChildId = lastChildId;

                        // Now reference the new child array as we go deeper into the tree
                        depthCursor = depthCursor[index].children;
                    });
                });
            }
            // tslint:disable-next-line:no-any
            const tasknewarray: any = [];
            let categorylenn: number = 0;
            categorylenn = tasksNew[0].name.length - 1;

            for (const index of tasksNew) {
                tasknewarray.push({
                    categories: index.name,
                    mapId: index.id,
                    name: index.name[categorylenn],
                    selectionId: index.selectionId
                });
            }
            if (settings.taskLabels.isHierarchy) {
                while (tasksNew.length) {
                    tasksNew.pop();
                }
            }
            const arrGanttLen: number = Object.keys(Gantt.arrGantt).length;
            // tslint:disable-next-line
            let protoObjecttoArray: any = $.map(Gantt.arrGantt, function (value, index) {
                return [value];
            });
            // tslint:disable-next-line:typedef
            const sumMeasures = (dest, src) => {
                dest = 0;
                // tslint:disable-next-line:typedef
                Object.keys(src).forEach((element) => {
                    dest += src[element];
                });
                if (dest === 0) {
                    return null;
                } else {
                    return dest;
                }
            };
            rowId = 0;
            legendData = {
                dataPoints: [],
                fontSize: 8,
                title: "Legend"
            };
            // tslint:disable-next-line:no-any
            const repeatedValues: any = [];
            let selectionidindex: number = 0;
            // tslint:disable-next-line:no-any
            let legenduniquecolors: any = [];
            let valuesdata1: DataViewValueColumn[];
            valuesdata1 = dataView.categorical.values;
            const columnSource: DataViewMetadataColumn[] = dataView.metadata.columns;
            // tslint:disable-next-line:typedef
            const toArray = (arr, level1, parentRowId): void => {
                // tslint:disable-next-line:no-shadowed-variable
                const resource: string = "(Blank)";
                if (!arr.children) { return; }
                level1++;
                rowId++;
                let currentId: number;
                currentId = rowId;
                // tslint:disable-next-line:no-any
                let children: any;
                children = arr.children.slice(0);
                for (const iIterator of children) {
                    toArray(iIterator, level1, currentId);
                }
                const label: string = currentId.toString();
                const catPresent: boolean = label in colorsPersistObject;
                const defaultColor: Fill = {
                    solid: {
                        color: catPresent ? colorsPersistObject[label] :
                        colorPalette.getColor(currentId.toString()).value
                    }
                };
                colorsPersistObject[currentId.toString()] = defaultColor.solid.color;
                const identity: string = null;
                let selected: boolean;
                selected = false;
                // tslint:disable-next-line
                let KPIValues: IKPIValues[];
                KPIValues = [];
                // tslint:disable-next-line
                let tooltipValues: IKPIValues[];

                // tslint:disable-next-line:typedef
                const row = {
                    KPIValues,
                    color,
                    end,
                    expanded,
                    id,
                    identity,
                    isLeaf,
                    lastChildId: -1,
                    level,
                    name,
                    numEnd,
                    numStart,
                    parentId,
                    repeat,
                    resource,
                    rowId,
                    selected,
                    selectionId,
                    start,
                    tooltipInfo,
                    tooltipValues
                };
                row.name = arr.name;
                repeatValue.push(row.name);

                let count: number = 0;

                for (const occur of repeatValue) {
                    if (row.name === occur) {
                        count++;

                    }
                }
                if (count > 1) {
                    row.repeat = 1;
                } else {
                    row.repeat = 0;
                }
                row.id = currentId;
                children = arr.children.slice(0);
                for (const iIterator of children) {
                    if (children.length === 1) {
                        row.start = new Date(iIterator.start);
                        row.end = new Date(iIterator.end);
                        arr.start = row.start;
                        arr.end = row.end;
                    } else {
                        startArr.push(new Date(iIterator.start));
                        endArr.push(new Date(iIterator.end));
                    }
                }
                if (startArr.length > 0) {
                    if (startArr[0] !== null) {
                        row.start = new Date(Math.min.apply(null, startArr));
                        row.end = new Date(Math.max.apply(null, endArr));
                        arr.start = row.start;
                        arr.end = row.end;
                    }
                    startArr = [];
                    endArr = [];
                }
                if (arr.start !== null && arr.end !== null) {
                    row.start = arr.start;
                    row.end = arr.end;
                }
                row.KPIValues = arr.kpiValues;
                row.tooltipValues = arr.tooltipValues;

                children = arr.children.slice(0);
                for (const iIterator of children) {
                    if (children.length === 1) {
                        row.numStart = iIterator.numStart;
                        row.numEnd = iIterator.numEnd;
                        arr.numStart = row.numStart;
                        arr.numEnd = row.numEnd;
                    } else {
                        startArr.push(iIterator.numStart);
                        endArr.push(iIterator.numEnd);
                    }
                }
                if (startArr.length > 0) {
                    if (startArr[0] !== null) {
                        row.numStart = Math.min.apply(null, startArr);
                        row.numEnd = Math.max.apply(null, endArr);
                        arr.numStart = row.numStart;
                        arr.numEnd = row.numEnd;
                    }
                    startArr = [];
                    endArr = [];
                }
                if (arr.numStart !== null && arr.numStart !== null) {
                    row.numStart = arr.numStart;
                    row.numEnd = arr.numEnd;
                }
                const categories: DataViewCategoryColumn[] = dataView.categorical.categories;
                // tslint:disable-next-line:no-any
                let cnt: number = 0;
                const length: number = levels.length;
                // tslint:disable-next-line:no-any
                const arrName: any[] = [];
                arrName.push(arr.name);
                // tslint:disable-next-line:no-any
                const arr1: any[] = [];
                arr1.push(arr);
                switch (length) {
                    case 1:
                        if (dataView.categorical.categories[1] !== undefined &&
                            dataView.categorical.categories[0].source.displayName
                            === dataView.categorical.categories[1].source.displayName) {
                            cnt = 0;
                        }
                        break;
                    case 2:
                        if (dataView.categorical.categories[2] !== undefined &&
                            dataView.categorical.categories[0].source.displayName
                            === dataView.categorical.categories[2].source.displayName) {
                            cnt = 0;
                        } else {
                            cnt = 1;
                        }
                        break;
                    case 3:
                        if (dataView.categorical.categories[3] !== undefined &&
                            dataView.categorical.categories[0].source.displayName
                            === dataView.categorical.categories[3].source.displayName) {
                            cnt = 0;
                        } else if (dataView.categorical.categories[3] !== undefined &&
                            dataView.categorical.categories[1].source.displayName
                            === dataView.categorical.categories[3].source.displayName) {
                            cnt = 1;
                        } else {
                            cnt = 2;
                        }
                        break;
                    case 4:
                        if (dataView.categorical.categories[4] !== undefined &&
                            dataView.categorical.categories[0].source.displayName
                            === dataView.categorical.categories[4].source.displayName) {
                            cnt = 0;
                        } else if (dataView.categorical.categories[4] !== undefined &&
                            dataView.categorical.categories[1].source.displayName
                            === dataView.categorical.categories[4].source.displayName) {
                            cnt = 1;
                        } else if (dataView.categorical.categories[4] !== undefined &&
                            dataView.categorical.categories[2].source.displayName
                            === dataView.categorical.categories[4].source.displayName) {
                            cnt = 2;
                        } else {
                            cnt = 3;
                        }
                        break;
                    default:
                        break;

                }
                row.numStart = arr.numStart;
                row.numEnd = arr.numEnd;
                row.identity = null;
                // tslint:disable-next-line:no-any
                let resData: any = [];
                // tslint:disable-next-line
                let tooltipData: any = [];

                for (let iIterator: number = 0; iIterator < children.length; iIterator++) {
                    if (children.length === 1) {
                        row.resource = children[iIterator].resource;
                    }
                    resData.push(children[iIterator].resource);
                    tooltipData.push(arr.children[iIterator].tooltipValues);
                }
                if (tooltipData.length > 0) {
                    row.tooltipValues = tooltipData[0];
                    arr.tooltipValues = row.tooltipValues;
                }

                if (resData.length > 0) {
                    for (let i: number = 0; i < resData.length; i++) {
                        if (resData[i] === "(Blank)") {
                            resData[i] = null;
                        }
                    }
                    if (typeof (resData[0]) === "number" || resData[0] == null) {
                        row.resource = sumMeasures(row.resource, resData);
                    } else {
                        row.resource = resData[0];
                    }
                    arr.resource = row.resource;
                    resData = [];
                }
                if (arr.resource !== null) {
                    row.resource = arr.resource;
                }
                row.level = level1;
                if (children.length === 0) {
                    row.isLeaf = true;
                    row.lastChildId = arr.lastChildId;
                    row.selectionId = host.createSelectionIdBuilder()
                        .withCategory(dataView.categorical.categories[0], selectionidindex)
                        .createSelectionId();
                    selectionidindex++;
                }
                if (uniquelegend.length === 0) {
                    row.color = settings.barColor.defaultColor;
                } else {
                    if (settings.barColor.showall) {
                        if (uniquelegend.indexOf(row.name) !== -1) {
                            for (let index: number = 0; index < uniquelegend.length; index++) {
                                if (row.name === legenduniquecolors[index].label) {
                                    row.color = legenduniquecolors[index].color;
                                    break;
                                }
                            }
                        } else {
                            row.color = settings.barColor.defaultColor;

                        }
                    } else {
                        row.color = settings.barColor.defaultColor;
                    }
                }

                row.rowId = currentId;
                row.parentId = parentRowId;
                if (arrGanttLen === 0) {
                    row.expanded = false;
                    Gantt.arrGantt[row.rowId] = false;
                    Gantt.ganttLen = categoryColumns.length;
                } else {
                    Gantt.ganttLen = categoryColumns.length;
                    row.expanded = Gantt.arrGantt[row.rowId] === true ? true : false;
                }
                transformedArr.push(row);
            };
            // tslint:disable-next-line
            uniquelegend.forEach(function (d: PrimitiveValue, ijk: number): void {
                legendData.dataPoints.push({
                    color: uniquesColorsForLegends[ijk].color,
                    icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box, // type of the legend icon,
                    identity: host.createSelectionIdBuilder()
                        .withMeasure(d.toString())
                        .createSelectionId(), // selectionId of the legend
                    label: d.toString(),  // name of the label
                    selected: false, // indicates of the legend is selected or not

                });
                uniqueColors.push({
                    color: uniquesColorsForLegends[ijk].color,
                    name: d
                });
            });
            legenduniquecolors = legendData.dataPoints;
            if (legendIndex !== -1) {
                barsLegend.changeOrientation(LegendPosition.Top);
                barsLegend.drawLegend(legendData, viewport);
                position(d3.select(".gantt-body"), barsLegend);
            }
            if (settings.taskLabels.isHierarchy) {
                toArray(hierarchicalData, -1, rowId);
                rows = transformedArr.reverse();
                rows.splice(0, 1);
                let rowindex: number = 0;
                tasknewarray.reverse();
                for (const index of rows) {
                    index.selectionId = [];
                    for (const i of tasknewarray) {
                        if (index.lastChildId.toString() === i.mapId.toString()) {
                            index.selectionId = i.selectionId;
                            rowindex++;
                        }
                    }
                }
                addSelection(rows);
                // tslint:disable-next-line:typedef
                transformedArr = transformedArr.sort((a, b) => {
                    return a.id > b.id ? 1 : a.id < b.id ? -1 : 0;
                });
                for (const i of transformedArr) {
                    // tslint:disable-next-line:no-shadowed-variable
                    for (let j: number = 0; j < uniquelegend.length; j++) {
                        if (i.name === uniquelegend[j]) {
                            legendData.dataPoints[j].color = i.color;
                        }
                    }
                }
                for (const index of transformedArr) {
                    tasksNew.push(index);
                }
            }
            // tslint:disable-next-line:typedef // tslint:disable-next-line:cyclomatic-complexity
            function addSelection(row: object) {
                const categoryLen: number = dataView.categorical.categories.length;
                let maxCategoryLen: number = 0;
                // tslint:disable-next-line:no-shadowed-variable
                for (let k: number = 0; k < categoryLen; k++) {
                    if (dataView.categorical.categories[k].source.roles.Category) {
                        maxCategoryLen++;
                        if (maxCategoryLen > 4) {
                            break;
                        }
                    }
                }
                let hashArr: {};
                hashArr = {};
                let catLength: number;
                catLength = categoryColumns.length;
                // tslint:disable-next-line:no-any
                let hierarchyArray: any[];
                hierarchyArray = [];
                for (const i of rows) {
                    if (hashArr[i[`parentId`]] === undefined) {
                        hashArr[i[`parentId`]] = [];
                    }
                    hashArr[i[`parentId`]].push(i);
                }

                // tslint:disable-next-line:prefer-const
                let selection: ISelectionId[];
                for (const yCounter of rows) {
                    if (yCounter.isLeaf !== true) {
                        yCounter[`selectionId`] = [];
                    }
                    yCounter.tooltipInfo = [];
                }
                let jCounter: number = 0;
                const rowslen: number = rows.length - 1;
                jCounter = maxCategoryLen - 1;
                jCounter = 0;
                for (let iCounter: number = rows.length - 1; iCounter > 0; iCounter--) {
                    hierarchyArray[rowslen - iCounter] = rows[iCounter][`parentId`];
                }
                // tslint:disable-next-line:no-any
                const uniqueElements: any = hierarchyArray.filter((item: any, pos: any): any => {
                    return hierarchyArray.indexOf(item) === pos;
                });
                // tslint:disable-next-line:typedef
                uniqueElements.sort((a, b) => {
                    return parseFloat(a) - parseFloat(b);
                });
                for (const iCounter of uniqueElements) {
                    for (const kCounter of hashArr[iCounter]) {
                        if (kCounter.isLeaf.toString() === "true") {
                            for (const lCounter of rows) {
                                if (lCounter.rowId === kCounter.parentId) {
                                    lCounter.selectionId
                                    .push(kCounter.selectionId);
                                    break;
                                }
                            }
                        }
                    }
                }
                if (catLength === 4) {
                    for (const iCounter of uniqueElements) {
                        if (hashArr[iCounter] !== undefined) {
                            for (const kCounter of hashArr[iCounter]) {
                                if (kCounter.level === 3) {
                                    for (const lCounter of
                                     rows) {
                                        if (lCounter.rowId ===
                                            kCounter.parentId) {
                                            if (kCounter.selectionId.length > 1) {
                                                for (let i: number = 0; i < kCounter
                                                    .selectionId.length; i++) {
                                                    lCounter.selectionId
                                                    .push(kCounter
                                                        .selectionId[i]);
                                                }
                                            } else {
                                                lCounter.selectionId
                                                .push(kCounter.selectionId[0]);
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (catLength >= 3) {
                    for (const iCounter of uniqueElements) {
                        if (hashArr[iCounter] !== undefined) {
                            for (const kCounter of hashArr[iCounter]) {
                                if (kCounter.level === 2) {
                                    for (const lCounter of rows) {
                                        if (lCounter.rowId ===
                                            kCounter.parentId) {
                                            if (kCounter.selectionId.length > 1) {
                                                for (let i: number = 0; i < kCounter
                                                    .selectionId.length; i++) {
                                                    lCounter.selectionId
                                                    .push(kCounter
                                                        .selectionId[i]);
                                                }
                                            } else {
                                                lCounter.selectionId
                                                .push(kCounter.selectionId[0]);
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            let rowIndex: number = 0;
            // tslint:disable-next-line:no-any
            let selobjchildrencncierarchy: any = [];
            // tslint:disable-next-line:typedef
            function getDirectChildInHierarchy(sRowID) {
                // tslint:disable-next-line:typedef
                $.map(tasksNew, (sObj) => {
                    if (sObj.parentId === sRowID) {
                        selobjchildrencncierarchy.push(sObj);
                        getDirectChildInHierarchy(sObj.rowId);
                    }
                });

                return selobjchildrencncierarchy;
            }
            let mycolor: string;
            for (let iIterator: number = 0; iIterator < tasksNew.length; iIterator++) {
                if (dataView.metadata.objects === undefined || dataView.metadata.objects.taskLabels === undefined ||
                    dataView.metadata.objects.taskLabels.isHierarchy) {
                    tasksNew[iIterator].tooltipInfo = Gantt.getTooltipInfo(tasksNew[iIterator],
                        this.formatters, dataView, iIterator);
                }
                for (const kIterator of legendData.dataPoints) {
                    // tslint:disable-next-line:no-any
                    const seltaskName: any = tasksNew[iIterator].name;
                    if (kIterator.label === seltaskName) {
                        rowIndex = tasksNew[iIterator].rowId;
                        mycolor = kIterator.color;

                        selobjchildrencncierarchy.push(tasksNew[iIterator]);
                        selobjchildrencncierarchy = getDirectChildInHierarchy(rowIndex);
                        for (const jIterator of selobjchildrencncierarchy) {
                            jIterator.color = mycolor;
                        }
                        selobjchildrencncierarchy = [];
                    }

                }
            }

            return {
                dataView,
                hierarchyArray: transformedArr,
                kpiData,
                settings,
                tasksNew
            };
        }

        /**
         * Called on data change or resizing
         * @param options The visual option that contains the dataview and the viewport
         */

        private syncSelectionState(
            // tslint:disable-next-line:no-any
            selection1: d3.Selection<any>,
            // tslint:disable-next-line:no-any
            selections: any
        ): void {
            const self: this = this;

            if (!selection1 || !selections || this.viewModel.settings.taskLabels.isHierarchy) {

                return;
            }

            if (!selections.length) {
                $(".gantt_task-rect").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                $(".gantt_toggle-task").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                $(".gantt_kpiClass").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                $(".gantt_task-resource").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                Gantt.isSelected = false;

                return;
            }

            $(".gantt_task-rect").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
            $(".gantt_toggle-task").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
            $(".gantt_kpiClass").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
            $(".gantt_task-resource").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");

            selection1.each(function(d: ITask): void {
                const isSelected: boolean = self.isSelectionIdInArray(selections, d.selectionId);
                if (isSelected) {
                    // tslint:disable-next-line:no-any
                    let sClass: any;
                    sClass = this.className;
                    let oSplittedClassNames: string[];
                    let rowNumber: string;
                    oSplittedClassNames = sClass.animVal.split(" ");
                    for (const iIterator of oSplittedClassNames) {
                        let className: string;
                        className = iIterator;
                        if (className.indexOf("task_row") !== -1) {
                            rowNumber = className.substr(8, className.length - 8);
                            $(taskRowClassLiteral + rowNumber)
                                .addClass("gantt_higheropacity").removeClass("gantt_loweropacity");
                        }
                    }

                    let sString: string;
                    sString = "";
                    let sStr: string;
                    sStr = "";
                    if ($(".gantt_task-rect").attr("trancheAttr")) {
                        sString = "trancheAttr";
                    } else if ($(".gantt_task-rect").attr("projectAttr")) {
                        sString = "projectAttr";
                    } else if ($(".gantt_task-rect").attr("metroAttr")) {
                        sString = "metroAttr";
                    } else if ($(".gantt_task-rect").attr("regionAttr")) {
                        sString = "regionAttr";
                    }
                    if (sString) {
                        sStr = $(this).attr(sString);
                    }
                    Gantt.isSelected = true;
                    let $LegendToggleImageId: JQuery;
                    $LegendToggleImageId = $("#LegendToggleImage");
                    if ($LegendToggleImageId.hasClass("visible")) {
                        $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                        $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                        $(".gantt_legendIndicatorPanel").hide();
                        $(".arrow").hide();
                    }
                }
            });
        }

        // method to return boolean based on presence of value in array
        private isSelectionIdInArray(selections: ISelectionId[], selectionId: ISelectionId): boolean {
            if (!selections || !selectionId) {
                return false;
            }

            return selections.some((currentSelectionId: ISelectionId) => {
                return currentSelectionId.includes(selectionId);
            });
        }

        private renderCustomLegendIndicator(): void {
            this.legendIndicatorTitleSvg.selectAll("*").remove();
            this.phaseIndicatorSvg.selectAll("*").remove();
            this.kpiIndicatorSvg.selectAll("*").remove();
            this.milestoneIndicatorSvg.selectAll("*").remove();
            let indicatorTitleGroup: Selection<HTMLElement>;
            let indicatorTitle: Selection<HTMLElement>;
            let kpiGroup: Selection<HTMLElement>;
            let eachKPI: Selection<HTMLElement>;
            let kpiCircle: Selection<HTMLElement>;
            let kpiCircleText: Selection<HTMLElement>;
            let kpiDescText: Selection<HTMLElement>;
            let milestoneGroup: Selection<HTMLElement>;
            let eachMilestone: Selection<HTMLElement>;
            let milestoneIcon: Selection<HTMLElement>;
            let milestoneDescText: Selection<HTMLElement>;
            let phaseGroup: Selection<HTMLElement>;
            let eachPhase: Selection<HTMLElement>;
            let phaseIcon: Selection<HTMLElement>;
            let phaseDescText: Selection<HTMLElement>;
            let rowCounter: number = 0;
            let indicatorTitleXCoordinate: number;
            indicatorTitleXCoordinate = 7;
            let indicatorTitleYCoordinate: number;
            indicatorTitleYCoordinate = 17;
            let indicatorTitleColor: string;
            indicatorTitleColor = "#404040";
            let eachIndicatorGroupStartYCoordinate: number;
            eachIndicatorGroupStartYCoordinate = 10;
            let eachIndiactorRowHeight: number;
            eachIndiactorRowHeight = 25;
            let descTextColor: string;
            descTextColor = "#8c8c8c";
            let descTextXCoordinate: number;
            descTextXCoordinate = 25;
            let kpiCircleXCoordinate: number;
            kpiCircleXCoordinate = 15;
            let kpiCircleRadius: number;
            kpiCircleRadius = 8;
            let kpiCircleTextXCoordinate: number;
            kpiCircleTextXCoordinate = 11;
            let milestoneIconDimension: number;
            milestoneIconDimension = 14;
            let milestoneIconXCoordinate: number;
            milestoneIconXCoordinate = 12;
            let phaseIconWidth: number;
            phaseIconWidth = 15;
            let phaseIconHeight: number;
            phaseIconHeight = 10;
            let phaseIconXCoordinate: number;
            phaseIconXCoordinate = 5;
            let legendIndicatorHeight: number;
            legendIndicatorHeight = 150;
            let totalKPIs: number;
            totalKPIs = this.viewModel.kpiData.length;
            let totalMilestones: number;
            totalMilestones = Gantt.milestoneNames.length;
            let totalPhases: number;
            totalPhases = Gantt.phaseNames.length;
            let kpiIndicatorWidth: number;
            kpiIndicatorWidth = totalKPIs !== 0 ? 75 : 0;
            let milestoneIndicatorWidth: number = totalMilestones !== 0 ? 120 : 0;
            let phaseIndicatorWidth: number = totalPhases !== 0 ? 120 : 0;
            let legendIndicatorTitleHeight: number;
            legendIndicatorTitleHeight = 25;
            let width: number = 0;

            if (totalMilestones > 0) {
                for (let iCount: number = 0; iCount < totalMilestones; iCount++) {
                    let textProperties: TextProperties;
                    textProperties = {
                        fontFamily: "Segoe UI",
                        fontSize: 12 + pxLiteral,
                        text: Gantt.milestoneNames[iCount]
                    };
                    width = Math.ceil(textMeasurementService.measureSvgTextWidth(textProperties)) + 40;
                    milestoneIndicatorWidth = width > milestoneIndicatorWidth ? width : milestoneIndicatorWidth;
                }
            }

            if (totalPhases > 0) {
                for (let iCount: number = 0; iCount < totalPhases; iCount++) {
                    let textProperties: TextProperties;
                    textProperties = {
                        fontFamily: "Segoe UI",
                        fontSize: 12 + pxLiteral,
                        text: Gantt.phaseNames[iCount]
                    };
                    width = Math.ceil(textMeasurementService.measureSvgTextWidth(textProperties)) + 60;
                    phaseIndicatorWidth = width > phaseIndicatorWidth ? width : phaseIndicatorWidth;
                }
            }

            let legendIndicatorWidth: number;
            legendIndicatorWidth = kpiIndicatorWidth + milestoneIndicatorWidth + phaseIndicatorWidth + 12;

            this.legendIndicatorDiv.style({
                height: PixelConverter.toString(legendIndicatorHeight),
                left: PixelConverter.toString(this.viewport.width - legendIndicatorWidth - 25),
                top: PixelConverter.toString(Gantt.axisHeight - 16),
                width: PixelConverter.toString(legendIndicatorWidth)

            });

            this.legendIndicatorTitleDiv.style({
                width: PixelConverter.toString(legendIndicatorWidth)
            });

            this.legendIndicatorTitleSvg
                .attr({
                    height: PixelConverter.toString(legendIndicatorTitleHeight),
                    width: PixelConverter.toString(legendIndicatorWidth)
                });

            this.arrowDiv.style({
                left: PixelConverter.toString(this.viewport.width - 60),
                top: PixelConverter.toString(Gantt.axisHeight - 1)
            });

            this.kpiIndicatorDiv.style({
                height: PixelConverter.toString(legendIndicatorHeight - legendIndicatorTitleHeight),
                width: PixelConverter.toString(kpiIndicatorWidth + 12)
            });

            this.kpiIndicatorSvg
                .attr({
                    height: PixelConverter.toString(4 * eachIndiactorRowHeight),
                    width: PixelConverter.toString(kpiIndicatorWidth + 12)
                });

            this.milestoneIndicatorDiv.style({
                height: PixelConverter.toString(legendIndicatorHeight - legendIndicatorTitleHeight),
                width: PixelConverter.toString(milestoneIndicatorWidth)
            });

            this.milestoneIndicatorSvg
                .attr({
                    height: PixelConverter.toString(totalMilestones * eachIndiactorRowHeight),
                    width: PixelConverter.toString(milestoneIndicatorWidth)
                });

            this.phaseIndicatorDiv.style({
                height: PixelConverter.toString(legendIndicatorHeight - legendIndicatorTitleHeight),
                width: PixelConverter.toString(phaseIndicatorWidth)
            });

            this.phaseIndicatorSvg
                .attr({
                    height: PixelConverter.toString(totalPhases * eachIndiactorRowHeight),
                    width: PixelConverter.toString(phaseIndicatorWidth)
                });

            indicatorTitleGroup = this.legendIndicatorTitleSvg
                .append("g")
                .classed("gantt_indicatorTitle", true);

            if (totalKPIs !== 0) {
                indicatorTitle = indicatorTitleGroup
                    .append("text")
                    .classed(Selectors.label.className, true)
                    .attr({
                        fill: indicatorTitleColor,
                        x: indicatorTitleXCoordinate,
                        y: indicatorTitleYCoordinate
                    })
                    .text("KPIs");

                kpiGroup = this.kpiIndicatorSvg
                    .append("g")
                    .classed("kpiIndicatorGroup", true);

                kpiGroup = this.kpiIndicatorSvg
                    .append("g")
                    .classed("kpiIndicatorGroup", true);

                eachKPI = kpiGroup
                    .append("g")
                    .classed("eachKPIRow", true);

                kpiCircle = eachKPI
                    .append("circle")
                    .classed("kpiCircle", true)
                    .attr({
                        "cx": kpiCircleXCoordinate,
                        "cy": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter,
                        "fill": "#116836",
                        "r": kpiCircleRadius,
                        "stroke-width": Gantt.axisLabelStrokeWidth
                    });

                kpiCircleText = eachKPI
                    .append("text")
                    .classed(Selectors.label.className, true)
                    .attr({
                        fill: "#fff",
                        x: kpiCircleTextXCoordinate - 0.5,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 4
                    })
                    .text("G");

                kpiDescText = eachKPI
                    .append("text")
                    .classed(Selectors.label.className, true)
                    .attr({
                        fill: descTextColor,
                        x: descTextXCoordinate,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5
                    })
                    .text("Green (4)");

                rowCounter++;

                eachKPI = kpiGroup
                    .append("g")
                    .classed("eachKPIRow", true);

                kpiCircle = eachKPI
                    .append("circle")
                    .classed("kpiCircle", true)
                    .attr({
                        "cx": kpiCircleXCoordinate,
                        "cy": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter,
                        "fill": "#ff9d00",
                        "r": kpiCircleRadius,
                        "stroke-width": Gantt.axisLabelStrokeWidth
                    });

                kpiCircleText = eachKPI
                    .append("text")
                    .classed(Selectors.label.className, true)
                    .attr({
                        fill: "#fff",
                        x: kpiCircleTextXCoordinate + 0.5,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5
                    })
                    .text("Y");

                kpiDescText = eachKPI
                    .append("text")
                    .classed(Selectors.label.className, true)
                    .attr({
                        "fill": descTextColor,
                        "stroke-width": 5,
                        "x": descTextXCoordinate,
                        "y": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5
                    })
                    .text("Yellow (3)");
                rowCounter++;

                eachKPI = kpiGroup
                    .append("g")
                    .classed("eachKPIRow", true);

                kpiCircle = eachKPI
                    .append("circle")
                    .classed("kpiCircle", true)
                    .attr({
                        "cx": kpiCircleXCoordinate,
                        "cy": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter,
                        "fill": "#d15d0d",
                        "r": kpiCircleRadius,
                        "stroke-width": Gantt.axisLabelStrokeWidth
                    });

                kpiCircleText = eachKPI
                    .append("text")
                    .classed(Selectors.label.className, true)
                    .attr({
                        fill: "#fff",
                        x: kpiCircleTextXCoordinate - 0.5,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5,
                    })
                    .text("O");

                kpiDescText = eachKPI
                    .append("text")
                    .classed(Selectors.label.className, true)
                    .attr({
                        fill: descTextColor,
                        x: descTextXCoordinate,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5
                    })
                    .text("Orange (2)");
                rowCounter++;

                eachKPI = kpiGroup
                    .append("g")
                    .classed("eachKPIRow", true);

                kpiCircle = eachKPI
                    .append("circle")
                    .classed("kpiCircle", true)
                    .attr({
                        "cx": kpiCircleXCoordinate,
                        "cy": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter,
                        "fill": "#ad1717",
                        "r": kpiCircleRadius,
                        "stroke-width": Gantt.axisLabelStrokeWidth
                    });

                kpiCircleText = eachKPI
                    .append("text")
                    .classed(Selectors.label.className, true)
                    .attr({
                        fill: "#fff",
                        x: kpiCircleTextXCoordinate,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5
                    })
                    .text("R");

                kpiDescText = eachKPI
                    .append("text")
                    .classed(Selectors.label.className, true)
                    .attr({
                        fill: descTextColor,
                        x: descTextXCoordinate,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5
                    })
                    .text("Red (1)");
            }

            if (0 !== totalMilestones) {
                indicatorTitle = indicatorTitleGroup
                    .append("text")
                    .classed(Selectors.label.className, true)
                    .attr({
                        fill: indicatorTitleColor,
                        x: kpiIndicatorWidth + indicatorTitleXCoordinate,
                        y: indicatorTitleYCoordinate
                    })
                    .text("Milestones");

                milestoneGroup = this.milestoneIndicatorSvg
                    .append("g")
                    .classed("milestoneIndicatorGroup", true);

                for (let milestoneCounter: number = 0; milestoneCounter < totalMilestones; milestoneCounter++) {
                    eachMilestone = milestoneGroup
                        .append("g")
                        .classed("eachMilestone", true);
                    milestoneIcon = eachMilestone;
                    this.drawMilestoneShape(
                        milestoneIcon, milestoneIconXCoordinate,
                        eachIndiactorRowHeight * milestoneCounter - 5, milestoneCounter, true);
                    milestoneDescText = eachMilestone
                        .append("text")
                        .attr({
                            "class": "gantt_milestoneLegend milestoneDescText",
                            "data-milestonenamelegend": Gantt.milestoneNames[milestoneCounter],
                            "fill": descTextColor,
                            "x": descTextXCoordinate,
                            "y": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * milestoneCounter + 5
                        })
                        .text(Gantt.milestoneNames[milestoneCounter]);
                    milestoneDescText.append("title").text(Gantt.milestoneNames[milestoneCounter]);
                }
            }
            if (0 !== totalPhases) {
                indicatorTitle = indicatorTitleGroup
                    .append("text")
                    .classed(Selectors.label.className, true)
                    .attr({
                        fill: indicatorTitleColor,
                        x: kpiIndicatorWidth + milestoneIndicatorWidth + indicatorTitleXCoordinate,
                        y: indicatorTitleYCoordinate
                    })
                    .text("Phases");

                phaseGroup = this.phaseIndicatorSvg
                    .append("g")
                    .classed("phaseIndicatorGroup", true);

                for (let phaseCounter: number = 0; phaseCounter < totalPhases; phaseCounter++) {
                    eachPhase = phaseGroup
                        .append("g")
                        .classed("eachPhase", true);
                    phaseIcon = eachPhase
                        .append("rect")
                        .attr({
                            "class": "gantt_phaseLegend phaseIcon",
                            "data-phasenamelegend": Gantt.phaseNames[phaseCounter],
                            "fill": Gantt.typeColors[phaseCounter % Gantt.typeColors.length],
                            "height": phaseIconHeight + pxLiteral,
                            "width": phaseIconWidth + pxLiteral,
                            "x": phaseIconXCoordinate,
                            "y": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * phaseCounter - 5

                        });

                    phaseDescText = eachPhase
                        .append("text")
                        .attr({
                            "class": "gantt_phaseLegend phaseDescText",
                            "data-phasenamelegend": Gantt.phaseNames[phaseCounter],
                            "fill": descTextColor,
                            "x": descTextXCoordinate,
                            "y": eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * phaseCounter + 5

                        })
                        .text(Gantt.phaseNames[phaseCounter]);

                    phaseDescText.append("title").text(Gantt.phaseNames[phaseCounter]);
                }
            }

            Gantt.totalLegendPresent = totalMilestones + totalPhases;
            this.addLegendInteractiveEvent(this);
        }

        private updateSvgSize(thisObj: Gantt, axisLength: number): void {
            if ((thisObj.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight)
                < (Gantt.currentTasksNumber * chartLineHeight + 20)) {
                axisLength -= 20;
            }

            thisObj.legendSvg
                .attr({
                    height: PixelConverter.toString(20),
                    width: PixelConverter.toString(75)
                });

            thisObj.ganttSvg
                .attr({
                    height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 8),
                    width: PixelConverter.toString(thisObj.margin.left + axisLength + Gantt.defaultValues.ResourceWidth)
                });

            thisObj.taskSvg
                .attr({
                    height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 8),
                    width: PixelConverter.toString(Gantt.taskLabelWidth + 20)
                });

            thisObj.kpiTitleSvg
                .attr({
                    height: 20,
                    width: PixelConverter.toString(Gantt.kpiLabelWidth)
                });

            thisObj.kpiSvg
                .attr({
                    height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 8),
                    width: PixelConverter.toString(Gantt.kpiLabelWidth)
                });

            if ((thisObj.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight)
                < (Gantt.currentTasksNumber * chartLineHeight + 20)) {
                thisObj.bottomDiv.style({
                    height: PixelConverter
                        .toString(thisObj.viewport.height - Gantt.axisHeight
                            - Gantt.bottomMilestoneHeight - Gantt.scrollHeight)
                });

                thisObj.bottommilestoneDiv.style({
                    bottom: PixelConverter.toString(0)
                });

                thisObj.bottomTaskDiv.style({
                    bottom: PixelConverter.toString(0)
                });

                thisObj.barDiv.style("height", "auto");
            } else {
                thisObj.bottomDiv.style({
                    height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 20)
                });

                this.bottommilestoneDiv.style({
                    bottom: PixelConverter
                        .toString(this.viewport.height - Gantt.axisHeight
                            - Gantt.bottomMilestoneHeight - Gantt.scrollHeight
                            - (Gantt.currentTasksNumber * chartLineHeight + 20))
                });

                this.bottomTaskDiv.style({
                    bottom: PixelConverter
                        .toString(this.viewport.height - Gantt.axisHeight
                            - Gantt.bottomMilestoneHeight - Gantt.scrollHeight
                            - (Gantt.currentTasksNumber * chartLineHeight + 20))
                });

                thisObj.barDiv.style("height", "100%");
            }

            thisObj.timelineSvg
                .attr({
                    height: PixelConverter.toString(Gantt.axisHeight),
                    width: PixelConverter.toString(this.margin.left + axisLength + Gantt.defaultValues.ResourceWidth)
                });

            thisObj.imageSvg
                .attr({
                    height: PixelConverter.toString(20),
                    width: PixelConverter.toString(20)
                });

            thisObj.kpiImageSvg
                .attr({
                    height: PixelConverter.toString(20),
                    width: PixelConverter.toString(20)
                });

            thisObj.drillAllSvg
                .attr({
                    height: 20,
                    width: PixelConverter.toString(Gantt.taskLabelWidth + 20)
                });

            thisObj.drillAllSvg2
                .attr({
                    height: 30,
                    width: PixelConverter.toString(Gantt.taskLabelWidth + 20)
                });

            d3.select(".hierarchyTitle")
                .attr({
                    width: PixelConverter.toString(Gantt.taskLabelWidth - 30)
                });

            thisObj.bottommilestoneSvg
                .attr({
                    height: PixelConverter.toString(Gantt.bottomMilestoneHeight),
                    width: PixelConverter.toString(this.margin.left + axisLength + Gantt.defaultValues.ResourceWidth)
                });

            if ($(".gantt_bottomPanel").innerHeight() < $(".gantt_barPanel").innerHeight()) {
                $(".gantt_barPanel").css("width", $(".gantt_barPanel").innerWidth() - 20);
            }
            let currentScrollPosition: string;
            if ($(".gantt_barPanel").innerWidth() < thisObj.margin.left
                + axisLength + Gantt.defaultValues.ResourceWidth) {
                let bottomMilestoneScrollPosition: number = 0;
                if (Gantt.isDateData) {
                    currentScrollPosition = thisObj.viewModel.settings.scrollPosition.position.toLowerCase();
                } else {
                    currentScrollPosition = thisObj.viewModel.settings.scrollPosition.position2.toLowerCase();
                }
                switch (currentScrollPosition) {
                    case "start":
                        bottomMilestoneScrollPosition = 0;
                        break;
                    case "today":
                        bottomMilestoneScrollPosition = thisObj.timeScale(new Date());
                        break;
                    case "end":
                        bottomMilestoneScrollPosition = $(".gantt_barSvg").innerWidth();
                        break;
                    default:
                }
                document.getElementsByClassName("gantt_bottomMilestonePanel")[0]
                    .scrollLeft = bottomMilestoneScrollPosition;
                this.setBottomScrollPosition(bottomMilestoneScrollPosition);
            }
        }
        private setBottomScrollPosition(bottomMilestoneScrollPosition: number): void {
            if (document.getElementsByClassName("gantt_barPanel")) {
                document.getElementsByClassName("gantt_barPanel")[0].scrollLeft = bottomMilestoneScrollPosition;
            }
            if (document.getElementsByClassName("gantt_timelinePanel")) {
                document.getElementsByClassName("gantt_timelinePanel")[0].scrollLeft = bottomMilestoneScrollPosition;
            }
            if (document.getElementsByClassName("gantt_barPanel")[1]) {
                document.getElementsByClassName("gantt_barPanel")[1].scrollLeft = bottomMilestoneScrollPosition;
            }
        }

        private setBottomTaskScrollPosition(bottomTaskScrollPosition: number): void {
            if (document.getElementsByClassName("gantt_taskPanel")) {
                document.getElementsByClassName("gantt_taskPanel")[0].scrollLeft = bottomTaskScrollPosition;
            }
            if (document.getElementsByClassName("gantt_drillAllPanel")) {
                document.getElementsByClassName("gantt_drillAllPanel")[0].scrollLeft = bottomTaskScrollPosition;
            }
            if (document.getElementsByClassName("gantt_drillAllPanel2")) {
                document.getElementsByClassName("gantt_drillAllPanel2")[0].scrollLeft = bottomTaskScrollPosition;
            }
        }

        private addLegendInteractiveEvent(thisObj: Gantt): void {
            $(".gantt_phaseLegend").on("click", function(event: JQueryMouseEventObject): void {
                event.stopPropagation();
                thisObj.legendSelection(this, thisObj, "data-phasename");
            });

            $(".gantt_milestoneLegend").on("click", function(event: JQueryMouseEventObject): void {
                event.stopPropagation();
                thisObj.legendSelection(this, thisObj, "data-milestonename");
            });
        }

        private legendSelection(thisCurrent: Gantt, thisGlobal: Gantt, dataAttribute: string): void {
            let legendDataAttrName: string;
            const legendEqualsQuote: string = 'legend="';
            const openingSquareBracket: string = "[";
            const quoteClosingSquareBracket: string = '"]';
            const equalsQuote: string = '="';

            legendDataAttrName = $(thisCurrent).attr(dataAttribute + legendLiteral);
            if ($(thisCurrent).parent().hasClass("activeLegend")) {
                Gantt.totalLegendSelected--;
                if (Gantt.totalLegendSelected === 0) {
                    Gantt.isLegendHighlighted = false;
                    thisGlobal.removeAllHighlight();
                } else {
                    $(thisCurrent).parent().removeClass("activeLegend");
                    $(openingSquareBracket + dataAttribute + legendEqualsQuote
                        + legendDataAttrName + quoteClosingSquareBracket)
                        .addClass("gantt_loweropacityLegend").removeClass("gantt_higheropacityLegend");
                    $(openingSquareBracket + dataAttribute + equalsQuote
                        + legendDataAttrName + quoteClosingSquareBracket)
                        .children().addClass("gantt_loweropacity").removeClass("gantt_higheropacity");
                    let index: number;
                    index = Gantt.currentSelectionState[milestoneNamesLiteral].indexOf(legendDataAttrName);
                    Gantt.currentSelectionState[milestoneNamesLiteral].splice(index, 1, 0);
                }
            } else {
                Gantt.isLegendHighlighted = true;
                if (Gantt.totalLegendSelected === 0) {
                    thisGlobal.moveAllTOBackground();
                    Gantt.currentSelectionState = {};
                    $(".gantt_phaseLegend, .gantt_milestoneLegend")
                        .removeClass("gantt_higheropacityLegend").addClass("gantt_loweropacityLegend");
                    Gantt.currentSelectionState[clickedTypeLiteral] = "legend";
                    Gantt.currentSelectionState[phaseNamesLiteral] = [];
                    Gantt.currentSelectionState[milestoneNamesLiteral] = [];
                }
                Gantt.totalLegendSelected++;
                if (Gantt.totalLegendSelected !== Gantt.totalLegendPresent) {
                    $(thisCurrent).parent().addClass("activeLegend");
                    $(openingSquareBracket + dataAttribute + legendEqualsQuote
                        + legendDataAttrName + quoteClosingSquareBracket)
                        .removeClass("gantt_loweropacityLegend").addClass("gantt_higheropacityLegend");
                    $(openingSquareBracket + dataAttribute + equalsQuote
                        + legendDataAttrName + quoteClosingSquareBracket)
                        .children().removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                    if (dataAttribute === "data-milestonename") {
                        Gantt.currentSelectionState[milestoneNamesLiteral].push(legendDataAttrName);
                    } else {
                        Gantt.currentSelectionState[phaseNamesLiteral].push(legendDataAttrName);
                    }
                } else {
                    Gantt.isLegendHighlighted = false;
                    thisGlobal.removeAllHighlight();
                }
            }
        }

        private addLegendHideShowEvents(thisObj: Gantt): void {
            let $LegendToggleImageId: JQuery;
            $LegendToggleImageId = $("#LegendToggleImage");
            $(".gantt_legendToggle").on("click", (event: JQueryMouseEventObject): void => {
                event.stopPropagation();
                if ($LegendToggleImageId.hasClass("notVisible")) {
                    $LegendToggleImageId.removeClass("notVisible").addClass("visible");
                    $LegendToggleImageId.attr("href", Gantt.drillUpImage);
                    $($(".gantt_legendIndicatorPanel")[0]).css("top", 49 + pxLiteral);
                    $(".gantt_legendIndicatorPanel").show();
                    $(".arrow").show();
                } else {
                    $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                    $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                    $(".gantt_legendIndicatorPanel").hide();
                    $(".arrow").hide();
                }
            });
        }

        private addExpandCollapseEvent(thisObj: Gantt): void {
            d3.selectAll("#gantt_ToggleIcon").on("click", (): void => {
                thisObj.expandCollapseTaskKPIPanel(thisObj, "#gantt_ToggleIcon",
                    ".gantt_task-lines", ".gantt_toggle-task-group", true);
                let $LegendToggleImageId: JQuery;
                $LegendToggleImageId = $("#LegendToggleImage");
                if ($LegendToggleImageId.hasClass("visible")) {
                    $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                    $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                    $(".gantt_legendIndicatorPanel").hide();
                    $(".arrow").hide();
                }
            });

            d3.selectAll("#gantt_KPIToggle").on("click", (): void => {
                thisObj.expandCollapseTaskKPIPanel(thisObj, "#gantt_KPIToggle",
                    ".gantt_kpi-lines", ".toggle-kpi-group", false);
                let $LegendToggleImageId: JQuery;
                $LegendToggleImageId = $("#LegendToggleImage");
                if ($LegendToggleImageId.hasClass("visible")) {
                    $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                    $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                    $(".gantt_legendIndicatorPanel").hide();
                    $(".arrow").hide();
                }
            });
        }

        private expandCollapseTaskKPIPanel(
            thisObj: Gantt, elementId: string, elementClass: string,
            elementGroupClass: string, isTaskLabel: boolean): void {
            $(".gantt_barPanel").not(":first").remove();
            let $LegendToggleImageId: JQuery;
            $LegendToggleImageId = $("#LegendToggleImage");
            if (!$LegendToggleImageId.hasClass("visible")) {
                $($(d3.selectAll(".gantt_barPanel")[0])[0]).attr("style",
                    `width:${this.viewport.width - 18}px; left: 18px`);
            }
            d3.event[stopPropagationLiteral]();
            let element: Selection<SVGAElement>;
            element = d3.select(elementId);
            if (element.classed("collapse")) {
                d3.selectAll(elementClass).attr("visibility", "hidden");
                element.attr("href", Gantt.expandImage);
                element.classed("collapse", false);
                element.classed("expand", true);
                if (elementId === "#gantt_ToggleIcon") {
                    $(".gantt_bottomTaskDiv").hide();
                }
                if (isTaskLabel) {
                    Gantt.taskLabelWidth = -4;
                } else {
                    Gantt.kpiLabelWidth = 20;
                }
            } else {
                d3.selectAll(elementClass).attr("visibility", "visible");
                d3.select(elementGroupClass).attr("visibility", "visible");
                element.attr("href", Gantt.collapseImage);
                element.classed("collapse", true);
                element.classed("expand", false);
                if (elementId === "#gantt_ToggleIcon") {
                    $(".gantt_bottomTaskDiv").show();
                }
                if (isTaskLabel) {
                    Gantt.taskLabelWidth = (Gantt.currentDisplayRatio - Gantt.minDisplayRatio)
                     * this.viewport.width / 100;
                } else {
                    Gantt.kpiLabelWidth = Gantt.kpiLabelWidthOriginal;
                }
            }
            thisObj.redrawChart(thisObj);
            if (d3.select("#gantt_ToggleIcon").classed("expand")) {
                $(".gantt_category0").hide();
                $(".gantt_bottomTaskDiv").hide();
            }
            if (d3.select(".gantt_drillAllPanel2")[0][0] &&
                d3.select(".gantt_taskPanel")[0][0] &&
                parseInt(d3.select(".gantt_taskPanel").style("width"), 10) >= 1) {
                d3.select(".gantt_drillAllPanel2").style("width", PixelConverter
                .toString($(".gantt_taskPanel").width() - 1));
            }
        }

        private sortCategories(thisObj: Gantt): void {
            for (let iCounter: number = 0; iCounter < Gantt.numberOfCategories; iCounter++) {
                $(categoryClassLiteral + iCounter).on("click", (event: JQueryMouseEventObject): void => {
                    let categoryId: Selection<SVGAElement>;
                    categoryId = d3.select(categoryIdLiteral + iCounter);
                    if (Gantt.prevSortedColumn === iCounter) {
                        Gantt.sortOrder = (Gantt.sortOrder === "asc" ? "desc" : "asc");
                    } else {
                        Gantt.sortOrder = "asc";
                    }
                    Gantt.sortLevel = iCounter;

                    for (let jCounter: number = 0; jCounter < Gantt.numberOfCategories; jCounter++) {
                        if (jCounter !== iCounter) {
                            d3.select(categoryIdLiteral + jCounter).attr("href", Gantt.sortAscOrder);
                        }
                    }
                    if (Gantt.sortOrder === "asc") {
                        categoryId.attr("href", Gantt.sortAscOrder);
                    } else {
                        categoryId.attr("href", Gantt.sortDescOrder);
                    }
                    thisObj.persistSortState();
                    Gantt.prevSortedColumn = iCounter;
                });
            }
        }

        private removeAllHighlight(): void {

            Gantt.totalLegendSelected = 0;
            Gantt.currentSelectionState = {};
            $(".milestoneHighlighted").removeClass("milestoneHighlighted");
            $(".phaseHighlighted").removeClass("phaseHighlighted");
            $(".activeLegend").removeClass("activeLegend");
            $(".gantt_task-rect").removeClass("gantt_loweropacity")
            .removeClass("gantt_higheropacity").removeClass("gantt_activeRect");
            $(".gantt_task-progress").removeClass("gantt_loweropacity")
                .removeClass("gantt_higheropacity").removeClass("gantt_activeProgress");
            $(".gantt_actual-milestone").removeClass("gantt_loweropacity")
                .removeClass("gantt_higheropacity").removeClass("gantt_activeMilestone");
            $(".gantt_phaseLegend, .gantt_milestoneLegend")
                .removeClass("gantt_higheropacityLegend").removeClass("gantt_loweropacityLegend");
        }

        private moveAllTOBackground(): void {

            Gantt.totalLegendSelected = 0;
            $(".milestoneHighlighted").removeClass("milestoneHighlighted");
            $(".phaseHighlighted").removeClass("phaseHighlighted");
            $(".activeLegend").removeClass("activeLegend");
            $(".gantt_task-rect").addClass("gantt_loweropacity")
            .removeClass("gantt_higheropacity").removeClass("gantt_activeRect");
            $(".gantt_task-progress").addClass("gantt_loweropacity")
            .removeClass("gantt_higheropacity").removeClass("gantt_activeProgress");
            $(".gantt_actual-milestone").addClass("gantt_loweropacity")
                .removeClass("gantt_higheropacity").removeClass("gantt_activeMilestone");
            $(".gantt_phaseLegend, .gantt_milestoneLegend")
                .removeClass("gantt_higheropacityLegend").removeClass("gantt_loweropacityLegend");
        }

        private redrawChart(thisObj: Gantt): void {

            let rightSectionWidth: number;
            rightSectionWidth = Gantt.visualWidth - Gantt.taskLabelWidth
                - Gantt.DefaultMargin.left - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
            let newAxisLength: number = Gantt.xAxisPropertiesParamter.axisLength;
            if (rightSectionWidth > newAxisLength) {
                newAxisLength = rightSectionWidth;
                Gantt.xAxisPropertiesParamter.axisLength = rightSectionWidth;
            }

            let ganttWidth: number;
            ganttWidth = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength
             + Gantt.defaultValues.ResourceWidth;
            if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > thisObj.viewport.width) {
                Gantt.scrollHeight = 17;
            } else {
                Gantt.scrollHeight = 0;
            }

            thisObj.updateChartSize();
            thisObj.updateSvgSize(thisObj, newAxisLength);
            let viewportIn: IViewport;
            viewportIn = {
                height: thisObj.viewport.height,
                width: newAxisLength
            };
            let xAxisProperties: IAxisProperties;
            xAxisProperties = thisObj.calculateAxes(
                viewportIn, Gantt.xAxisPropertiesParamter.textProperties,
                Gantt.xAxisPropertiesParamter.datamin, Gantt.xAxisPropertiesParamter.datamax,
                Gantt.xAxisPropertiesParamter.startDate, Gantt.xAxisPropertiesParamter.endDate,
                newAxisLength, Gantt.xAxisPropertiesParamter.ticks, false);
            thisObj.timeScale = xAxisProperties.scale as timeScale<number, number>;
            thisObj.renderAxis(xAxisProperties);
            thisObj.rendergrids(xAxisProperties, Gantt.currentTasksNumber);

            thisObj.updateTaskLabels(thisObj.viewModel.tasksNew, thisObj.viewModel.settings.taskLabels.width);
            if (Gantt.isDateData) {
                thisObj.createTodayLine(Gantt.currentTasksNumber);
            }
            thisObj.updateElementsPositions(thisObj.viewport, thisObj.margin);
            thisObj.adjustResizing(thisObj.viewModel.tasksNew,
                 thisObj.viewModel.settings.taskLabels.width, thisObj.viewModel);
            thisObj.sortCategories(thisObj);

        }

        private calculateAxes(
            viewportIn: IViewport,
            textProperties: TextProperties,
            datamin: number,
            datamax: number,
            startDate: Date,
            endDate: Date,
            axisLength: number,
            ticksCount: number,
            scrollbarVisible: boolean): IAxisProperties {
            if (datamax !== undefined && datamax !== null && datamax !== Gantt.minSafeInteger) {
                let dataTypeDatetime: ValueType;
                dataTypeDatetime = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Integer);
                let category: DataViewMetadataColumn;
                category = {
                    displayName: "Start Value",
                    index: 0,
                    queryName: GanttRoles.startDate,
                    type: dataTypeDatetime
                };

                let visualOptions: GanttCalculateScaleAndDomainOptions;
                visualOptions = {
                    categoryAxisDisplayUnits: 0,
                    categoryAxisScaleType: axisScale.linear,
                    forceMerge: false,
                    forcedTickCount: ticksCount,
                    forcedXDomain: [datamin, datamax],
                    margin: this.margin,
                    showCategoryAxisLabel: false,
                    showValueAxisLabel: false,
                    trimOrdinalDataOnOverflow: false,
                    valueAxisDisplayUnits: 0,
                    valueAxisScaleType: null,
                    viewport: viewportIn
                };
                const width: number = viewportIn.width;
                let axes: IAxisProperties;
                axes = this.calculateAxesProperties1(viewportIn, visualOptions, axisLength, category);
                axes.willLabelsFit = AxisHelper.LabelLayoutStrategy.willLabelsFit(
                    axes,
                    width,
                    textMeasurementService.measureSvgTextWidth,
                    textProperties);

                // If labels do not fit and we are not scrolling, try word breaking
                axes.willLabelsWordBreak = (!axes.willLabelsFit && !scrollbarVisible)
                 && AxisHelper.LabelLayoutStrategy.willLabelsWordBreak(
                    axes, this.margin, width, textMeasurementService.measureSvgTextWidth,
                    textMeasurementService.estimateSvgTextHeight, textMeasurementService.getTailoredTextOrDefault,
                    textProperties);

                return axes;

            } else if (startDate) {
                let dataTypeDatetime: ValueType;
                dataTypeDatetime = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.DateTime);
                let category: DataViewMetadataColumn;
                category = {
                    displayName: "Start Date",
                    index: 0,
                    queryName: GanttRoles.startDate,
                    type: dataTypeDatetime
                };

                let visualOptions: GanttCalculateScaleAndDomainOptions;
                visualOptions = {
                    categoryAxisDisplayUnits: 0,
                    categoryAxisScaleType: axisScale.linear,
                    forceMerge: false,
                    forcedTickCount: ticksCount,
                    forcedXDomain: [startDate, endDate],
                    margin: this.margin,
                    showCategoryAxisLabel: false,
                    showValueAxisLabel: false,
                    trimOrdinalDataOnOverflow: false,
                    valueAxisDisplayUnits: 0,
                    valueAxisScaleType: null,
                    viewport: viewportIn

                };
                const width: number = viewportIn.width;
                let axes: IAxisProperties;
                axes = this.calculateAxesProperties(viewportIn, visualOptions, axisLength, category);
                axes.willLabelsFit = AxisHelper.LabelLayoutStrategy.willLabelsFit(
                    axes,
                    width,
                    textMeasurementService.measureSvgTextWidth,
                    textProperties);

                // If labels do not fit and we are not scrolling, try word breaking
                axes.willLabelsWordBreak = (!axes.willLabelsFit && !scrollbarVisible)
                 && AxisHelper.LabelLayoutStrategy.willLabelsWordBreak(
                    axes, this.margin, width, textMeasurementService.measureSvgTextWidth,
                    textMeasurementService.estimateSvgTextHeight, textMeasurementService.getTailoredTextOrDefault,
                    textProperties);

                return axes;
            }
        }

        private calculateAxesProperties(
            viewportIn: IViewport, options: GanttCalculateScaleAndDomainOptions,
            axisLength: number, metaDataColumn: DataViewMetadataColumn): IAxisProperties {
            let xAxisProperties: IAxisProperties;
            xAxisProperties = AxisHelper.createAxis({
                axisDisplayUnits: options.categoryAxisDisplayUnits,
                dataDomain: options.forcedXDomain,
                forcedTickCount: options.forcedTickCount,
                formatString: Gantt.defaultValues.DateFormatStrings[this.viewModel.settings.dateType.type],
                getValueFn: (index, type) => {
                    let dateType: string;
                    dateType = this.viewModel.settings.dateType.type;
                    if (dateType === "Quarter") {
                        return Gantt.getQuarterName(index);
                    } else if (dateType === "Day" || dateType === "Week" ||
                     dateType === "Month" || dateType === "Year") {
                        return ValueFormatter.format(
                            new Date(index),
                            Gantt.defaultValues.DateFormatStrings[this.viewModel.settings.dateType.type]);
                    }
                },
                isCategoryAxis: true,
                isScalar: true,
                isVertical: false,
                metaDataColumn,
                outerPadding: 0,
                pixelSpan: viewportIn.width,
                scaleType: options.categoryAxisScaleType,
                useTickIntervalForDisplayUnits: true,
            });
            xAxisProperties.axisLabel = metaDataColumn.displayName;

            return xAxisProperties;
        }

        private calculateAxesProperties1(
            viewportIn: IViewport, options: GanttCalculateScaleAndDomainOptions, axisLength: number,
            metaDataColumn: DataViewMetadataColumn): IAxisProperties {
            let xAxisProperties1: IAxisProperties;
            xAxisProperties1 = AxisHelper.createAxis({
                axisDisplayUnits: options.categoryAxisDisplayUnits,
                dataDomain: options.forcedXDomain,
                forcedTickCount: options.forcedTickCount,
                formatString: this.viewModel.dataView.categorical.values[0].source.format,
                // tslint:disable-next-line:typedef
                getValueFn: (index, type) => {
                    let datatype: string;
                    datatype = this.viewModel.settings.datatype.type;
                    if (datatype === "Integer") {
                        return index;
                    }
                },
                isCategoryAxis: true,
                isScalar: true,
                isVertical: false,
                metaDataColumn,
                outerPadding: 0,
                pixelSpan: viewportIn.width,
                scaleType: options.categoryAxisScaleType,
                useTickIntervalForDisplayUnits: true
            });
            xAxisProperties1.axisLabel = metaDataColumn.displayName;

            return xAxisProperties1;
        }

        private renderAxis(xAxisProperties: IAxisProperties, duration: number = Gantt.defaultDuration): void {
            let xAxis: d3.svg.Axis;
            xAxis = xAxisProperties.axis;
            xAxis.orient("bottom");

            this.axisGroup
                .call(xAxis);
        }

        private rendergrids(xAxisProperties: IAxisProperties, totaltasks: number): void {
            let taskGridLinesShow: boolean;
            let taskGridLinesInterval: number;
            let taskGridLinesColor: string;
            taskGridLinesShow = this.viewModel.settings.taskGridlines.show;
            taskGridLinesInterval = this.viewModel.settings.taskGridlines.interval;
            taskGridLinesColor = this.viewModel.settings.taskGridlines.fill;
            this.gridGroup.selectAll("*").remove();
            $(".gantt_barPanel")
                .css("width", PixelConverter.toString(this.viewport.width
                     - Gantt.taskLabelWidth - Gantt.kpiLabelWidth - 20))
                .css("left", PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 20));
            $(".gantt_bottomTaskDiv")
                .css("width", PixelConverter.toString(Gantt.taskLabelWidth + 20));
            let xAxis: d3.svg.Axis;
            xAxis = xAxisProperties.axis;
            xAxis.tickSize(this.getTodayLineLength(totaltasks));

            if (taskGridLinesShow) {
                this.gridGroup
                    .call(xAxis);

                this.gridGroup.selectAll("line").style({ stroke: taskGridLinesColor });
                this.gridGroup.selectAll("text").remove();
                for (let i: number = 0; i < xAxisProperties.values.length; i++) {
                    if (i % taskGridLinesInterval !== 0) {
                        d3.select(this.gridGroup.selectAll("line")[0][i]).attr("visibility", "hidden");
                    }
                }
            }

            this.gridGroup.selectAll("line").attr({
                y1: -20   // to extend the line
            });
        }

        /**
         * Update task labels and add its tooltips
         * @param tasks All tasks array
         * @param width The task label width
         */
        // tslint:disable-next-line:no-shadowed-variable
        private updateTaskLabels(tasks: ITask[], width: number): void {
            let axisLabel: Selection<HTMLElement>;
            // tslint:disable-next-line:no-any
            const expandeditems: any = [];
            // tslint:disable-next-line:no-any
            let axisLabelImg: any;
            let columnHeaderColor: string;
            let columnHeaderBgColor: string;
            let columnHeaderFontSize: number;
            let columnHeaderFontFamily: string;
            let columnHeaderOutline: string;
            let dataLabelsFontFamily: string;
            let taskLabelsShow: boolean;
            let taskLabelsColor: string;
            let taskLabelsFontSize: number;
            let taskLabelsFontFamily: string;
            let totalKPIs: number;
            let totalCategories: number;
            let normalizer: number;
            let kpiFontSize: number;
            let kpiFontColor: string;
            let types: string[];
            let typeColor: string;
            let taskResourceShow: boolean;
            let taskResourceColor: string;
            let taskResourceFontSize: number;
            let valueKPI: string;
            let indicatorKPI: string;
            let taskGridLinesShow: boolean;
            let taskGridLinesColor: string;
            let taskGridLinesInterval: number;
            let isTaskLabelHierarchyView: boolean;
            let thisObj: Gantt;
            let barPanelLeft: number;
            let kpiPanelWidth: number;
            let lastRectX: number;
            thisObj = this;
            columnHeaderColor = this.viewModel.settings.columnHeader.fill;
            columnHeaderBgColor = this.viewModel.settings.columnHeader.fill2;
            columnHeaderFontSize = this.viewModel.settings.columnHeader.fontSize;
            columnHeaderFontFamily = this.viewModel.settings.columnHeader.fontFamily;
            columnHeaderOutline = this.viewModel.settings.columnHeader.columnOutline;
            dataLabelsFontFamily = this.viewModel.settings.taskResource.fontFamily;
            taskLabelsShow = this.viewModel.settings.taskLabels.show;
            taskLabelsColor = this.viewModel.settings.taskLabels.fill;
            taskLabelsFontSize = this.viewModel.settings.taskLabels.fontSize;
            taskLabelsFontFamily = this.viewModel.settings.taskLabels.fontFamily;
            totalKPIs = this.viewModel.kpiData.length;
            totalCategories = tasks[0].name.length;
            normalizer = (this.viewModel.settings.taskLabels.fontSize > 20)
             ? 20 : this.viewModel.settings.taskLabels.fontSize;
            kpiFontSize = 23 * Gantt.maximumNormalizedFontSize / Gantt.maximumFontSize;
            kpiFontColor = "#000";
            this.kpiTitleGroup.selectAll("*").remove();
            this.kpiGroup.selectAll("*").remove();
            this.lineGroup.selectAll("*").remove();
            this.drillAllGroup.selectAll("*").remove();
            this.toggleTaskGroup.selectAll("*").remove();
            this.taskGroup.selectAll("*").remove();
            this.backgroundGroupTask.selectAll("*").remove();
            this.backgroundGroupKPI.selectAll("*").remove();
            this.backgroundGroupBar.selectAll("*").remove();
            types = [];
            typeColor = "";
            taskResourceShow = this.viewModel.settings.taskResource.show;
            taskResourceColor = this.viewModel.settings.taskResource.fill;
            taskResourceFontSize = this.viewModel.settings.taskResource.fontSize;
            valueKPI = this.viewModel.settings.kpiColumnType.value;
            indicatorKPI = this.viewModel.settings.kpiColumnType.indicator;
            taskGridLinesShow = this.viewModel.settings.taskGridlines.show;
            taskGridLinesColor = this.viewModel.settings.taskGridlines.fill;
            taskGridLinesInterval = this.viewModel.settings.taskGridlines.interval;
            isTaskLabelHierarchyView = this.viewModel.settings.taskLabels.isHierarchy;

            let $DrillAllPanel2Class: JQuery;
            $DrillAllPanel2Class = $(".gantt_drillAllPanel2");
            let $KpiTitlePanelClass: JQuery;
            $KpiTitlePanelClass = $(".gantt_kpiTitlePanel");
            let $TaskSvg: JQuery;
            $TaskSvg = $(".gantt_taskSvg");
            $KpiTitlePanelClass.css("background-color", columnHeaderBgColor);
            $DrillAllPanel2Class.css("background-color", columnHeaderBgColor);

            if (columnHeaderOutline === "none") {
                $KpiTitlePanelClass.css("border-top", "solid white 0px");
                $DrillAllPanel2Class.css("border-top", "solid white 0px");
                $KpiTitlePanelClass.css("border-bottom", "solid white 0px");
                $DrillAllPanel2Class.css("border-bottom", "solid white 0px");
                $KpiTitlePanelClass.css("border-right", "solid white 0px");
                $DrillAllPanel2Class.css("border-left", "solid white 0px");
                $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                $TaskSvg.css("margin-left", "0px");
            } else if (columnHeaderOutline === "bottomOnly") {
                $KpiTitlePanelClass.css("border-top", "solid white 0px");
                $DrillAllPanel2Class.css("border-top", "solid white 0px");
                $KpiTitlePanelClass.css("border-bottom", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-bottom", "solid #02B8AB 1px");
                $KpiTitlePanelClass.css("border-right", "solid white 0px");
                $DrillAllPanel2Class.css("border-left", "solid white 0px");
                $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                $TaskSvg.css("margin-left", "0px");
            } else if (columnHeaderOutline === "topOnly") {
                $KpiTitlePanelClass.css("border-top", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-top", "solid #02B8AB 1px");
                $KpiTitlePanelClass.css("border-bottom", "solid white 0px");
                $DrillAllPanel2Class.css("border-bottom", "solid white 0px");
                $KpiTitlePanelClass.css("border-right", "solid white 0px");
                $DrillAllPanel2Class.css("border-left", "solid white 0px");
                $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                $TaskSvg.css("margin-left", "0px");
            } else if (columnHeaderOutline === "leftOnly") {
                $KpiTitlePanelClass.css("border-top", "solid white 0px");
                $DrillAllPanel2Class.css("border-top", "solid white 0px");
                $KpiTitlePanelClass.css("border-bottom", "solid white 0px");
                $DrillAllPanel2Class.css("border-bottom", "solid white 0px");
                $KpiTitlePanelClass.css("border-right", "solid white 0px");
                $DrillAllPanel2Class.css("border-left", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                $TaskSvg.css("margin-left", "1px");
            } else if (columnHeaderOutline === "rightOnly") {
                $KpiTitlePanelClass.css("border-top", "solid white 0px");
                $DrillAllPanel2Class.css("border-top", "solid white 0px");
                $KpiTitlePanelClass.css("border-bottom", "solid white 0px");
                $DrillAllPanel2Class.css("border-bottom", "solid white 0px");
                if (Gantt.isKpiPresent) {
                    $KpiTitlePanelClass.css("border-right", "solid #02B8AB 1px");
                    $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                } else {
                    $KpiTitlePanelClass.css("border-right", "solid white 0px");
                    $DrillAllPanel2Class.css("border-right", "solid #02B8AB 1px");
                }
                $DrillAllPanel2Class.css("border-left", "solid white 0px");
                $TaskSvg.css("margin-left", "0px");
            } else if (columnHeaderOutline === "leftRight") {
                $KpiTitlePanelClass.css("border-top", "solid white 0px");
                $DrillAllPanel2Class.css("border-top", "solid white 0px");
                $KpiTitlePanelClass.css("border-bottom", "solid white 0px");
                $DrillAllPanel2Class.css("border-bottom", "solid white 0px");
                $KpiTitlePanelClass.css("border-right", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-left", "solid #02B8AB 1px");
                if (Gantt.isKpiPresent) {
                    $KpiTitlePanelClass.css("border-right", "solid #02B8AB 1px");
                    $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                } else {
                    $KpiTitlePanelClass.css("border-right", "solid white 0px");
                    $DrillAllPanel2Class.css("border-right", "solid #02B8AB 1px");
                }
                $TaskSvg.css("margin-left", "1px");
            } else if (columnHeaderOutline === "frame") {
                $KpiTitlePanelClass.css("border-top", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-top", "solid #02B8AB 1px");
                $KpiTitlePanelClass.css("border-bottom", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-bottom", "solid #02B8AB 1px");
                $KpiTitlePanelClass.css("border-right", "solid #02B8AB 1px");
                $DrillAllPanel2Class.css("border-left", "solid #02B8AB 1px");
                if (Gantt.isKpiPresent) {
                    $KpiTitlePanelClass.css("border-right", "solid #02B8AB 1px");
                    $DrillAllPanel2Class.css("border-right", "solid grey 1px");
                } else {
                    $KpiTitlePanelClass.css("border-right", "solid white 0px");
                    $DrillAllPanel2Class.css("border-right", "solid #02B8AB 1px");
                }
                $TaskSvg.css("margin-left", "1px");
            }

            if (!isTaskLabelHierarchyView) {
                let objects: DataViewObjects = null;
                let getJSONString: string;
                let columnWidth: number;
                let columnWidthsArr: number[];
                let taskColumnArr: number[];
                let horizGridX1Arr: number[];
                let horizGridX2Arr: number[];
                let vertGridArr: number[];
                objects = this.viewModel.dataView.metadata.objects;
                columnWidth = 0;
                columnWidthsArr = [];
                taskColumnArr = [];
                horizGridX1Arr = [];
                horizGridX2Arr = [];
                vertGridArr = [];
                getJSONString = getValue<string>(objects, "categoryColumnsWidth", "width", "text");
                let numOfCharsAllowedHeader: number = 0;
                numOfCharsAllowedHeader = Gantt.taskLabelWidth /
                 (Gantt.iHeaderSingleCharWidth * this.viewModel.tasksNew[0].name.length);
                kpiPanelWidth = parseFloat(d3.select(".gantt_kpiPanel").style("left"));

                for (let iIterator: number = 0; iIterator <= 3; iIterator++) {
                    columnWidthsArr[iIterator] = 0;
                    taskColumnArr[iIterator] = 0;
                    horizGridX1Arr[iIterator] = 0;
                    horizGridX2Arr[iIterator] = 0;
                    vertGridArr[iIterator] = 0;
                }
                for (let jCount: number = 0; jCount < totalCategories; jCount++) {
                    objects = this.viewModel.dataView.metadata.objects;
                    getJSONString = getValue<string>(objects, "categoryColumnsWidth", "width", "text");
                    columnWidth = 0;
                    if (getJSONString && getJSONString.length !== 0 && getJSONString.indexOf("text") === -1) {
                        let splittedJSON: string[];
                        let columnName: string;
                        let taskColumnName: string;
                        let horizGridX1: string;
                        let horizGridX2: string;
                        let vertGrid: string;
                        let oSplittedLength: string[];
                        splittedJSON = getJSONString.split(";");
                        columnName = columnLiteral + jCount;
                        taskColumnName = taskColumnLiteral + jCount;
                        horizGridX1 = "horizontal-line";
                        horizGridX1 += jCount;
                        horizGridX1 += "-x1";
                        horizGridX2 = "horizontal-line";
                        horizGridX2 += jCount;
                        horizGridX2 += "-x2";
                        vertGrid = verticalLineLiteral + jCount;
                        for (const iIterator of splittedJSON) {
                            if (iIterator.indexOf(taskColumnName) !== -1) {
                                oSplittedLength = iIterator.split(":");
                                columnWidth = parseFloat(oSplittedLength[1]);
                                taskColumnArr[jCount] = columnWidth;
                            } else if (iIterator.indexOf(vertGrid) !== -1) {
                                oSplittedLength = iIterator.split(":");
                                columnWidth = parseFloat(oSplittedLength[1]);
                                vertGridArr[jCount] = columnWidth;
                            } else if (iIterator.indexOf(horizGridX1) !== -1) {
                                oSplittedLength = iIterator.split(":");
                                columnWidth = parseFloat(oSplittedLength[1]);
                                horizGridX1Arr[jCount] = columnWidth;
                            } else if (iIterator.indexOf(horizGridX2) !== -1) {
                                oSplittedLength = iIterator.split(":");
                                columnWidth = parseFloat(oSplittedLength[1]);
                                horizGridX2Arr[jCount] = columnWidth;
                            } else if (iIterator.indexOf(columnName) !== -1) {
                                oSplittedLength = iIterator.split(":");
                                columnWidth = parseFloat(oSplittedLength[1]);
                                columnWidthsArr[jCount] = columnWidth;
                            }
                        }
                    }

                    const textElement: Selection<HTMLElement> = this.drillAllGroup.append("text")
                        .attr("class", categoryLiteral + jCount + spaceLiteral + taskColumnLiteral + jCount)
                        .attr("x", 15)
                        .attr("y", 10);

                    const sortIconImage: Selection<HTMLElement> = this.drillAllGroup.append("image")
                        .attr("class", "sortAsc")
                        .attr("class", categoryLiteral + jCount)
                        .attr("id", categoryLiteral + jCount)
                        .attr("y", 10)
                        .attr("height", 7)
                        .attr("width", 7);
                    if (Gantt.numberOfCategories !== 1) {
                        if (jCount === 0) {
                            textElement.attr("x", 15);

                            if (Gantt.sortOrder === "asc" || Gantt.sortLevel !== jCount) {
                                sortIconImage
                                    .attr("x", 15)
                                    .attr("xlink:href", Gantt.sortAscOrder);
                            } else {
                                sortIconImage
                                    .attr("x", 15)
                                    .attr("xlink:href", Gantt.sortDescOrder);
                            }
                        } else {
                            textElement.attr("x", taskColumnArr[jCount]);

                            if (Gantt.sortOrder === "asc" || Gantt.sortLevel !== jCount) {
                                sortIconImage
                                    .attr("x", taskColumnArr[jCount])
                                    .attr("xlink:href", Gantt.sortAscOrder);
                            } else {
                                sortIconImage
                                    .attr("x", taskColumnArr[jCount])
                                    .attr("xlink:href", Gantt.sortDescOrder);
                            }
                        }
                    } else {
                        textElement.attr("x", taskColumnArr[jCount]);
                        if (Gantt.sortOrder === "asc" || Gantt.sortLevel !== jCount) {
                            sortIconImage
                                .attr("x", taskColumnArr[jCount])
                                .attr("xlink:href", Gantt.sortAscOrder);
                        } else {
                            sortIconImage
                                .attr("x", taskColumnArr[jCount])
                                .attr("xlink:href", Gantt.sortDescOrder);
                        }
                    }
                    if (jCount === totalCategories - 1) {
                        kpiPanelWidth = parseInt(d3.select(".gantt_kpiPanel").style("left"), 10);
                        lastRectX = parseInt(d3.select(categoryClassLiteral + jCount).attr("x"), 10);
                        if ((kpiPanelWidth > 0 && lastRectX > kpiPanelWidth - 1) || lastRectX > barPanelLeft - 1) {
                            d3.select(categoryClassLiteral + jCount)
                                .text(Gantt.categoriesTitle[jCount])
                                .style({
                                    "background-color": columnHeaderBgColor,
                                    "fill": columnHeaderColor,
                                    "font-family": columnHeaderFontFamily,
                                    "font-size": columnHeaderFontSize + pxLiteral

                                })
                                .call(
                                    AxisHelper.LabelLayoutStrategy.clip,
                                    100,
                                    textMeasurementService.svgEllipsis);
                        } else {
                            d3.select(categoryClassLiteral + jCount)
                                .text(Gantt.categoriesTitle[jCount])
                                .style({
                                    "background-color": columnHeaderBgColor,
                                    "fill": columnHeaderColor,
                                    "font-family": columnHeaderFontFamily,
                                    "font-size": columnHeaderFontSize + pxLiteral
                                })
                                .call(
                                    AxisHelper.LabelLayoutStrategy.clip,
                                    kpiPanelWidth -
                                    lastRectX,
                                    textMeasurementService.svgEllipsis);
                        }

                    } else {
                        if (jCount === 0) {
                            d3.select(categoryClassLiteral + jCount)
                                .text(Gantt.categoriesTitle[jCount])
                                .style({
                                    "background-color": columnHeaderBgColor,
                                    "fill": columnHeaderColor,
                                    "font-family": columnHeaderFontFamily,
                                    "font-size": columnHeaderFontSize + pxLiteral
                                })
                                .call(AxisHelper.LabelLayoutStrategy.clip, columnWidthsArr[jCount]
                                    // tslint:disable-next-line:align
                                    - 15, textMeasurementService.svgEllipsis);
                        } else {
                            d3.select(categoryClassLiteral + jCount)
                                .text(Gantt.categoriesTitle[jCount])
                                .style({
                                    "background-color": columnHeaderBgColor,
                                    "fill": columnHeaderColor,
                                    "font-family": columnHeaderFontFamily,
                                    "font-size": columnHeaderFontSize + pxLiteral

                                })
                                .call(AxisHelper.LabelLayoutStrategy.clip, columnWidthsArr[jCount]
                                    // tslint:disable-next-line:align
                                    - 10, textMeasurementService.svgEllipsis);
                        }

                    }
                    d3.select(categoryClassLiteral + jCount)
                        .append("title").text(Gantt.getLabelValuesNew
                            (Gantt.categoriesTitle[jCount].toString(), "text", 50));

                    if (jCount !== 0) {

                        let resizer: Selection<HTMLElement>;
                        resizer = this.drillAllGroup.append("rect")
                            .classed("gantt_resizer", true).classed(headerCellLiteral + jCount, true);
                        resizer.attr({
                            columnId: headerCellLiteral + jCount,
                            fill: columnHeaderBgColor,
                            height: "30px",
                            width: "5px",
                            x: taskColumnArr[jCount] - 10,
                            y: 0
                        });

                    }
                }

                for (let jCount: number = 0; jCount < totalKPIs; jCount++) {
                    let axisKPILabel: Selection<HTMLElement>;
                    axisKPILabel = this.kpiTitleGroup.append("text").classed(Selectors.label.className, true);
                    axisKPILabel.attr({
                        "background": columnHeaderBgColor,
                        "fill": columnHeaderColor,
                        "font-family": columnHeaderFontFamily,
                        "font-size": columnHeaderFontSize + pxLiteral,
                        "stroke-width": Gantt.axisLabelStrokeWidth,
                        "x": 3 + (Gantt.kpiLabelWidth / totalKPIs * jCount),
                        "y": 15

                    });
                    let sKPITitle: string;
                    sKPITitle = tasks[0].KPIValues[jCount].name;
                    let sFirstWord: string;
                    sFirstWord = sKPITitle.substr(0, sKPITitle.indexOf(" "));
                    switch (sFirstWord) {
                        case "First":
                        case "Last":
                        case "Earliest":
                        case "Latest":
                            sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 1, sKPITitle.length);
                            break;
                        case "Count":
                        case "Average":
                        case "Min":
                        case "Max":
                        case "Variance":
                        case "Median":
                            sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 4, sKPITitle.length);
                            break;
                        case "Standard":
                            sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 14, sKPITitle.length);
                        default:
                    }
                    let numberOfCharsAllowed: number;
                    numberOfCharsAllowed = 75 / (Gantt.iKPIHeaderSingleCharWidth);
                    axisKPILabel.text(Gantt.getLabelValuesNew(sKPITitle, "text", numberOfCharsAllowed));
                    axisKPILabel.append("title").text(sKPITitle);

                    if (jCount !== 0) {
                        let kpiTitleVerticleLine: Selection<HTMLElement>;
                        kpiTitleVerticleLine = this.kpiTitleGroup
                        .append("line").classed(verticalLineSimpleLiteral, true);
                        kpiTitleVerticleLine.attr({
                            stroke: "#f2f2f2",
                            x1: (Gantt.kpiLabelWidth / totalKPIs * jCount),
                            x2: (Gantt.kpiLabelWidth / totalKPIs * jCount),
                            y1: 0,
                            y2: 30
                        });

                        let kpiVerticleLine: Selection<HTMLElement>;
                        kpiVerticleLine = this.kpiGroup.append("line").classed(verticalLineSimpleLiteral, true);
                        kpiVerticleLine.attr({
                            stroke: "#f2f2f2",
                            x1: (Gantt.kpiLabelWidth / totalKPIs * jCount) - 1,
                            x2: (Gantt.kpiLabelWidth / totalKPIs * jCount) - 1,
                            y1: 0,
                            y2: Gantt.currentTasksNumber * chartLineHeight + 8
                        });
                    }
                }

                let categoryObject: string[];
                categoryObject = [];
                const tasksLength: number = tasks.length;
                let yVal: number = -1;
                let opacityValue: number = 0;
                const width1: number = $(".gantt_taskSvg").width();
                for (let tasknumber: number = 0; tasknumber < tasksLength; tasknumber++) {
                    const yCoordinate: number = thisObj.getTaskLabelCoordinateY(tasknumber);
                    const currentLevel: ITask = tasks[tasknumber];
                    thisObj = this;
                    let regionAttr: string = "";
                    let metroAttr: string = "";
                    let projectAttr: string = "";
                    let trancheAttr: string = "";
                    for (let jCount: number = 0; jCount < totalCategories; jCount++) {
                        let categoryLabel: string = tasks[tasknumber].name[jCount].toString();
                        // tslint:disable-next-line:no-any
                        const dataViewNew: any = this.dataview;
                        // tslint:disable-next-line:switch-default
                        switch (jCount) {
                            case 0: {
                                regionAttr = tasks[tasknumber].name[jCount];
                                if (dateFormat.test(tasks[tasknumber].name[jCount])) {
                                    categoryLabel = ValueFormatter
                                    .format(new Date(tasks[tasknumber].name[jCount].toString()),
                                        dataViewNew.categorical.categories[jCount].source.format);
                                } else {
                                    categoryLabel = Gantt.regionValueFormatter.format(tasks[tasknumber].name[jCount]);
                                }
                                break;
                            }
                            case 1: {
                                metroAttr = tasks[tasknumber].name[jCount];
                                if (dateFormat.test(tasks[tasknumber].name[jCount])) {
                                    categoryLabel = ValueFormatter
                                    .format(new Date(tasks[tasknumber].name[jCount].toString()),
                                        dataViewNew.categorical.categories[jCount].source.format);
                                } else {
                                    categoryLabel = Gantt.metroValueFormatter.format(tasks[tasknumber].name[jCount]);
                                }

                                break;
                            }
                            case 2: {
                                projectAttr = tasks[tasknumber].name[jCount];
                                if (dateFormat.test(tasks[tasknumber].name[jCount])) {
                                    categoryLabel = ValueFormatter
                                    .format(new Date(tasks[tasknumber].name[jCount].toString()),
                                        dataViewNew.categorical.categories[jCount].source.format);
                                } else {
                                    categoryLabel = Gantt.projectValueFormatter.format(tasks[tasknumber].name[jCount]);
                                }
                                break;
                            }
                            case 3: {
                                trancheAttr = tasks[tasknumber].name[jCount];
                                if (dateFormat.test(tasks[tasknumber].name[jCount])) {
                                    categoryLabel = ValueFormatter
                                    .format(new Date(tasks[tasknumber].name[jCount].toString()),
                                        dataViewNew.categorical.categories[jCount].source.format);
                                } else {
                                    categoryLabel = Gantt.trancheValueFormatter.format(tasks[tasknumber].name[jCount]);
                                }
                            }

                        }
                        if (taskLabelsShow) {
                            categoryObject[jCount] = tasks[tasknumber].name[jCount];
                            opacityValue = tasknumber % 2 === 0 ? 0.2 : 0.6;
                            if (yVal !== yCoordinate) {
                                const greyRect: Selection<HTMLElement> = this.lineGroup.append("rect").attr({
                                    class: "gantt_backgroundRect",
                                    fill: "#ccc",
                                    height: 24,
                                    opacity: opacityValue,
                                    width: width1,
                                    x: 0,
                                    y: yCoordinate - 17
                                });
                                yVal = yCoordinate;
                            }
                            axisLabel = this.lineGroup
                                .append("text")
                                .classed(Selectors.label.className, true).classed("gantt_kpiClass", true);
                            if (jCount === 0) {

                                axisLabel.attr({
                                    "class": Selectors.toggleTask.className + spaceLiteral
                                        + taskRowLiteral + tasknumber + spaceLiteral + taskColumnLiteral + jCount,
                                    "fill": taskLabelsColor,
                                    "metroAttr": metroAttr,
                                    "projectAttr": projectAttr,
                                    "regionAttr": regionAttr,
                                    "stroke-width": Gantt.axisLabelStrokeWidth,
                                    "trancheAttr": trancheAttr,
                                    "x": taskColumnArr[jCount],
                                    "y": this.getTaskLabelCoordinateY(tasknumber)
                                }).style("font-size", normalizer + pxLiteral)
                                .style("font-family", taskLabelsFontFamily);
                            } else {

                                axisLabel.attr({
                                    "class": Selectors.toggleTask.className + spaceLiteral +
                                        taskRowLiteral + tasknumber + spaceLiteral + taskColumnLiteral + jCount,
                                    "fill": taskLabelsColor,
                                    "metroAttr": metroAttr,
                                    "projectAttr": projectAttr,
                                    "regionAttr": regionAttr,
                                    "stroke-width": Gantt.axisLabelStrokeWidth,
                                    "trancheAttr": trancheAttr,
                                    "x": taskColumnArr[jCount],
                                    "y": this.getTaskLabelCoordinateY(tasknumber)
                                }).style("font-size", normalizer + pxLiteral)
                                .style("font-family", taskLabelsFontFamily);
                            }

                            if (categoryLabel === "") {
                                categoryLabel = "(Blank)";
                            }

                            if (jCount === totalCategories - 1) {

                                lastRectX = parseInt(d3.select(dotLiteral + categoryLiteral + jCount).attr("x"), 10);
                                if ((kpiPanelWidth > 0 && lastRectX >
                                     kpiPanelWidth - 1) || lastRectX > barPanelLeft - 1) {
                                    axisLabel.text(categoryLabel)
                                        .call(
                                            AxisHelper.LabelLayoutStrategy.clip,
                                            100,
                                            textMeasurementService.svgEllipsis);
                                } else {
                                    axisLabel.text(categoryLabel)
                                        .call(
                                            AxisHelper.LabelLayoutStrategy.clip,
                                            parseInt(d3.select(".gantt_kpiPanel").style("left"), 10) - lastRectX - 10,
                                            textMeasurementService.svgEllipsis);
                                }

                            } else {
                                axisLabel.text(categoryLabel)
                                    .call(
                                        AxisHelper.LabelLayoutStrategy.clip,
                                        columnWidthsArr[jCount] - 20,
                                        textMeasurementService.svgEllipsis);
                            }

                            axisLabel.append("title").text(Gantt.getLabelValuesNew(categoryLabel, "title", width));
                        }

                    }

                    if (0 !== currentLevel.KPIValues.length) {
                        for (let jCount: number = 0; jCount < totalKPIs; jCount++) {
                            if (jCount === 0) {
                                thisObj.kpiGroup.append("rect").attr({
                                    fill: "#ccc",
                                    height: 24,
                                    opacity: opacityValue,
                                    width: parseInt(d3.select(".gantt_kpiSvg").attr("width"), 10),
                                    x: 0,
                                    y: yCoordinate - 17
                                })
                                    .attr("x", 0)
                                    .attr("y", yCoordinate - 17)
                                    .attr("height", 24)
                                    .attr("width", parseInt(d3.select(".gantt_kpiSvg").attr("width"), 10))
                                    .attr("fill", "#ccc");
                            }
                            if (this.viewModel.kpiData[jCount].type.toLowerCase() === "indicator") {
                                let axisKPILabel: Selection<HTMLElement>;
                                axisKPILabel = thisObj.kpiGroup
                                    .append("circle").classed(Selectors.label.className, true)
                                    .classed(kpiClassLiteral + spaceLiteral + taskRowLiteral + tasknumber, true);
                                let color: string = kpiFontColor;
                                let text: string = "";
                                let titleText: string;
                                titleText = currentLevel.KPIValues[jCount].value ?
                                 currentLevel.KPIValues[jCount].value.toString() : "";
                                let showCircle: boolean = true;
                                let extraLeftPadding: number = 0;
                                switch (currentLevel.KPIValues[jCount].value ?
                                     currentLevel.KPIValues[jCount].value.toString() : "") {
                                    case "1":
                                        color = "#ad1717";
                                        text = "R";
                                        extraLeftPadding = 1.5;
                                        break;
                                    case "2":
                                        color = "#d15d0d";
                                        text = "O";
                                        extraLeftPadding = 1;
                                        break;
                                    case "3":
                                        color = "#ff9d00";
                                        text = "Y";
                                        extraLeftPadding = 2;

                                        break;
                                    case "4":
                                        color = "#116836";
                                        text = "G";
                                        extraLeftPadding = 0.5;
                                        break;
                                    default:
                                        showCircle = false;
                                        break;
                                }

                                if (showCircle) {
                                    axisKPILabel.attr({
                                        "cx": (Gantt.kpiLabelWidth / totalKPIs * jCount) + 37.5,
                                        "cy": yCoordinate - 4,
                                        "fill": color,
                                        "metroAttr": metroAttr,
                                        "projectAttr": projectAttr,
                                        "r": 8,
                                        "regionAttr": regionAttr,
                                        "stroke-width": Gantt.axisLabelStrokeWidth,
                                        "trancheAttr": trancheAttr

                                    }).style("font-size", normalizer + pxLiteral);
                                    axisKPILabel.append("title").text(titleText);

                                    axisKPILabel = thisObj.kpiGroup
                                    .append("text").classed(Selectors.label.className, true);
                                    axisKPILabel.attr({
                                        "fill": "#fff",
                                        "metroAttr": metroAttr,
                                        "projectAttr": projectAttr,
                                        "regionAttr": regionAttr,
                                        "stroke-width": 5,
                                        "trancheAttr": trancheAttr,
                                        "x": (Gantt.kpiLabelWidth / totalKPIs * jCount) + 32.5 + extraLeftPadding,
                                        "y": yCoordinate
                                    }).style("font-size", kpiFontSize + pxLiteral);

                                    axisKPILabel.text(text);
                                    axisKPILabel.append("title").text(titleText);
                                }
                            } else if (thisObj.viewModel.kpiData[jCount].type.toLowerCase() === "type") {
                                let axisKPILabel: Selection<HTMLElement>;
                                axisKPILabel = thisObj.kpiGroup
                                    .append("rect").classed(Selectors.label.className, true)
                                    .classed(kpiClassLiteral + spaceLiteral + taskRowLiteral + tasknumber, true);

                                let color: string;
                                color = "#fff";
                                let text: string = currentLevel.KPIValues[jCount].value ?
                                    currentLevel.KPIValues[jCount].value.toString() : "";
                                if (!text) { continue; }
                                let titleText: string;
                                titleText = text;
                                if (-1 === types.indexOf(text)) {
                                    types.push(text);
                                }
                                let index: number;
                                index = types.indexOf(text);
                                typeColor = Gantt.typeColors[index % Gantt.typeColors.length];
                                text = text.charAt(0) +
                                text.charAt(-1 !== text.indexOf(" ") ? text.indexOf(" ") + 1 : -1);

                                axisKPILabel.attr({
                                    "fill": typeColor,
                                    "height": 16,
                                    "metroAttr": metroAttr,
                                    "projectAttr": projectAttr,
                                    "regionAttr": regionAttr,
                                    "stroke-width": Gantt.axisLabelStrokeWidth,
                                    "trancheAttr": trancheAttr,
                                    "width": 24,
                                    "x": Gantt.taskLineCoordinateX + (Gantt.kpiLabelWidth / totalKPIs * jCount) + 9.5,
                                    "y": yCoordinate - 12
                                }).style("font-size", kpiFontSize + pxLiteral);
                                axisKPILabel.append("title").text(titleText);
                                axisKPILabel = thisObj.kpiGroup.append("text").classed(Selectors.label.className, true);
                                axisKPILabel.attr({
                                    "fill": color,
                                    "metroAttr": metroAttr,
                                    "projectAttr": projectAttr,
                                    "regionAttr": regionAttr,
                                    "stroke-width": 5,
                                    "trancheAttr": trancheAttr,
                                    "x": Gantt.taskLineCoordinateX + (Gantt.kpiLabelWidth / totalKPIs * jCount) + 12.5,
                                    "y": yCoordinate

                                }).style("font-size", kpiFontSize + pxLiteral);

                                axisKPILabel.text(text.toUpperCase());
                                axisKPILabel.append("title").text(titleText);
                            } else {
                                let axisKPILabel: Selection<HTMLElement>;
                                axisKPILabel = thisObj.kpiGroup
                                    .append("text").classed(Selectors.label.className, true)
                                    .classed(kpiClassLiteral + spaceLiteral + taskRowLiteral + tasknumber, true);

                                let iLeftSpacing: number = 5;
                                if (typeof currentLevel.KPIValues[jCount].value === "number") {
                                    let clippedText: string;
                                    clippedText = currentLevel.KPIValues[jCount].value.toString();
                                    thisObj.body.append("text")
                                        .text(clippedText)
                                        .classed("singleCharacter", true)
                                        .style({
                                            "font-family": "Segoe UI",
                                            "font-size": kpiFontSize + pxLiteral
                                        });
                                    // tslint:disable-next-line:no-any
                                    const singleCharacterLocal: any = $(".singleCharacter");
                                    let textTotalWidth: number;
                                    textTotalWidth = singleCharacterLocal.innerWidth();
                                    let numberOfCharactersAllowed: number;
                                    numberOfCharactersAllowed = Math.floor(
                                        (Gantt.kpiLabelWidth / totalKPIs) / (textTotalWidth / clippedText.length));
                                    if (clippedText.length > numberOfCharactersAllowed) {
                                        singleCharacterLocal.text(clippedText
                                            .substring(0, numberOfCharactersAllowed - 2) + ellipsisLiteral);
                                        textTotalWidth = singleCharacterLocal.innerWidth();
                                        let iCount: number = 0;
                                        while (textTotalWidth < width) {
                                            iCount++;
                                            singleCharacterLocal
                                                .text(clippedText
                                                    .substring(0, numberOfCharactersAllowed
                                                         - 2 + iCount) + ellipsisLiteral);
                                            textTotalWidth = singleCharacterLocal.innerWidth();
                                        }
                                    } else {
                                        iLeftSpacing = Gantt.kpiLabelWidth / totalKPIs - textTotalWidth - 5;
                                    }
                                    singleCharacterLocal.remove();
                                }

                                axisKPILabel.attr({
                                    "fill": kpiFontColor,
                                    "metroAttr": metroAttr,
                                    "projectAttr": projectAttr,
                                    "regionAttr": regionAttr,
                                    "stroke-width": Gantt.axisLabelStrokeWidth,
                                    "trancheAttr": trancheAttr,
                                    "x": (Gantt.kpiLabelWidth / totalKPIs * jCount) + iLeftSpacing,
                                    "y": yCoordinate
                                }).style("font-size", kpiFontSize + pxLiteral);

                                axisKPILabel.text(Gantt.getKPIValues(currentLevel.KPIValues[jCount], "text"));
                                axisKPILabel.append("title")
                                .text(Gantt.getKPIValues(currentLevel.KPIValues[jCount], "title"));
                            }
                        }
                    }
                }
                // Render bars
                if (!Gantt.isDateData) {
                    for (let tasknumber: number = 0; tasknumber < tasksLength; tasknumber++) {
                        let currentLevel: ITask;
                        currentLevel = tasks[tasknumber];
                        const regionAttr: string = "";
                        const metroAttr: string = "";
                        const projectAttr: string = "";
                        const trancheAttr: string = "";
                        let taskGroupSelection: Selection<HTMLElement>;
                        opacityValue = tasknumber % 2 === 0 ? 0.2 : 0.6;
                        const backgroundRectBar: Selection<HTMLElement>
                            = thisObj.backgroundGroupBar.append("rect").attr({
                                fill: "#ccc",
                                height: 24,
                                opacity: opacityValue,
                                width: parseInt(d3.select(".gantt_barSvg").attr("width"), 10),
                                x: 0,
                                y: thisObj.getTaskLabelCoordinateY(tasknumber) - 17
                        });

                        taskGroupSelection = thisObj.taskGroup
                            .append("g")
                            .classed(Selectors.taskGroup.className, true);

                        let taskSelection: Selection<HTMLElement>;
                        taskSelection = taskGroupSelection
                            .append("g")
                            .classed(Selectors.singleTask.className, true);

                        let yPos: number = Gantt.getBarYCoordinate(tasknumber) + 13 + Gantt.taskResourcePadding;
                        let xPos: number = 0;
                        let xPosStart: number = 0;
                        let eachPhaseSelection: Selection<ITask>;
                        eachPhaseSelection = taskSelection
                            .datum(currentLevel)
                            .append("g")
                            .classed(Selectors.singlePhase.className, true);

                        let taskRect: Selection<ITask>;
                        taskRect = eachPhaseSelection
                            .append("rect")
                            .classed(Selectors.taskRect.className, true)
                            .classed(taskRowLiteral + tasknumber, true);

                        if (currentLevel.numEnd !== null || currentLevel.numStart !== null) {
                            // tslint:disable-next-line:no-any
                            if (isNaN(thisObj.taskDurationToWidth1(currentLevel))
                            || isNaN(thisObj.timeScale(currentLevel.numStart as any))) {
                                taskRect
                                    .attr({
                                        // tslint:disable-next-line:no-any
                                        height: Gantt.getBarHeight() / 1.5,
                                        metroAttr,
                                        projectAttr,
                                        regionAttr,
                                        trancheAttr,
                                        width: 0,
                                        x: 0,
                                        y: Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 3

                                    })
                                    .style("fill", currentLevel.color);
                            } else {
                                taskRect
                                    .attr({
                                        // tslint:disable-next-line:no-any
                                        height: Gantt.getBarHeight() / 1.5,
                                        metroAttr,
                                        projectAttr,
                                        regionAttr,
                                        trancheAttr,
                                        width: 0 === thisObj.taskDurationToWidth1(currentLevel) ? 3 :
                                            thisObj.taskDurationToWidth1(currentLevel),
                                        x: thisObj.timeScale(currentLevel.numStart as any),
                                        y: Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 3
                                    })
                                    .style("fill", currentLevel.color);
                            }

                            yPos = Gantt.getBarYCoordinate(tasknumber)
                             + Gantt.getBarHeight() / 2 + Gantt.taskResourcePadding;
                            // tslint:disable-next-line:no-any
                            if (xPos < thisObj.timeScale(currentLevel.numEnd as any)) {
                                // tslint:disable-next-line:no-any
                                xPos = thisObj.timeScale(currentLevel.numEnd as any);
                                // tslint:disable-next-line:no-any
                                xPosStart = thisObj.timeScale(currentLevel.numStart as any);
                            }
                            // tslint:disable-next-line:no-any
                            if (xPos < thisObj.timeScale(currentLevel.numEnd as any)) {
                                // tslint:disable-next-line:no-any
                                xPos = thisObj.timeScale(currentLevel.numEnd as any);
                                // tslint:disable-next-line:no-any
                                xPosStart = thisObj.timeScale(currentLevel.numStart as any);
                            }
                        }
                        thisObj.renderTooltip(eachPhaseSelection);
                        if (currentLevel.numStart === null && currentLevel.numEnd === null) {
                            continue;
                        }
                        let labelnormalizer: number;
                        labelnormalizer = (thisObj.viewModel.settings.taskResource.fontSize > 20) ? 20
                            : thisObj.viewModel.settings.taskResource.fontSize;
                        if (taskResourceShow) {
                            let taskResource: Selection<HTMLElement>;
                            taskResource = taskSelection
                                .append("text")
                                .classed(Selectors.taskResource.className
                                     + spaceLiteral + taskRowLiteral + tasknumber, true);
                            if (resourcePresent && currentLevel.resource == null) {
                                currentLevel.resource = "(Blank)";
                            }
                            d3.select("body").append("text")
                                .text(currentLevel.resource)
                                .classed("resourceLabelText", true)
                                .style({
                                    "font-family": dataLabelsFontFamily,
                                    "font-size": normalizer + pxLiteral
                                });

                            Gantt.datalabelValueFormatter = ValueFormatter.create({
                                format: measureFormat ? measureFormat : ValueFormatter.DefaultNumericFormat
                            });
                            if (currentLevel.resource !== null) {
                                currentLevel.resource = Gantt.datalabelValueFormatter.format(currentLevel.resource);
                            } else {
                                currentLevel.resource = " ";
                            }
                            const textProperties: TextProperties = {
                                fontFamily: thisObj.viewModel.settings.taskResource.fontFamily,
                                fontSize: thisObj.viewModel.settings.taskResource.fontSize + pxLiteral,
                                text: currentLevel.resource
                            };
                            const titleWidth: number = textMeasurementService.measureSvgTextWidth(textProperties);
                            d3.selectAll(".resourceLabelText").remove();
                            let xPosVal: number = 0;
                            switch (thisObj.viewModel.settings.taskResource.position.toLowerCase()) {
                                case "center":
                                    xPosVal = ((xPosStart + xPos) / 2) - (titleWidth / 2);
                                    break;
                                case "left":
                                    xPosVal = xPosStart - titleWidth - xFactor;
                                    break;
                                case "right":
                                default:
                                    xPosVal = xPos + xFactor;
                                    break;
                            }
                            taskResource
                                .attr({
                                    metroAttr,
                                    projectAttr,
                                    regionAttr,
                                    trancheAttr,
                                    x: xPosVal,
                                    y: yPos + labelnormalizer / 3
                                })
                                .text(currentLevel.resource)
                                .style({
                                    "fill": taskResourceColor,
                                    "font-family": dataLabelsFontFamily,
                                    "font-size": labelnormalizer + pxLiteral
                                }).call(
                                    AxisHelper.LabelLayoutStrategy.clip,
                                    Gantt.defaultValues.ResourceWidth - Gantt.resourceWidthPadding - 20,
                                    textMeasurementService.svgEllipsis);
                            taskResource.append("title").text(currentLevel.resource);
                        }
                    }
                } else {
                    for (let tasknumber: number = 0; tasknumber < tasksLength; tasknumber++) {
                        let currentLevel: ITask;
                        currentLevel = tasks[tasknumber];
                        const regionAttr: string = "";
                        const metroAttr: string = "";
                        const projectAttr: string = "";
                        const trancheAttr: string = "";
                        opacityValue = tasknumber % 2 === 0 ? 0.2 : 0.6;
                        const backgroundRectBar: Selection<HTMLElement>
                         = thisObj.backgroundGroupBar.append("rect").attr({
                             fill: "#ccc",
                             height: 24,
                             opacity: opacityValue,
                             width: parseInt(d3.select(".gantt_barSvg").attr("width"), 10),
                             x: 0,
                             y: thisObj.getTaskLabelCoordinateY(tasknumber) - 17

                        });

                        let taskGroupSelection: Selection<HTMLElement>;
                        taskGroupSelection = thisObj.taskGroup
                            .append("g")
                            .classed(Selectors.taskGroup.className, true);

                        let taskSelection: Selection<HTMLElement>;
                        taskSelection = taskGroupSelection
                            .append("g")
                            .classed(Selectors.singleTask.className, true);

                        let yPos: number;
                        yPos = Gantt.getBarYCoordinate(tasknumber) + 13 + Gantt.taskResourcePadding;
                        let xPos: number;
                        xPos = 0;
                        let xPosStart: number;
                        xPosStart = 0;
                        let eachPhaseSelection: Selection<ITask>;
                        eachPhaseSelection = taskSelection
                            .datum(currentLevel)
                            .append("g")
                            .classed(Selectors.singlePhase.className, true);

                        let taskRect: Selection<ITask>;
                        taskRect = eachPhaseSelection
                            .append("rect")
                            .classed(Selectors.taskRect.className, true)
                            .classed(taskRowLiteral + tasknumber, true);
                        taskRect
                            .attr({
                                height: Gantt.getBarHeight() / 1.5,
                                metroAttr,
                                projectAttr,
                                regionAttr,
                                trancheAttr,
                                width: 0 === thisObj.taskDurationToWidth(currentLevel)
                                ? 3 : thisObj.taskDurationToWidth(currentLevel),
                                x: thisObj.timeScale(currentLevel.start),
                                y: Gantt.getBarYCoordinate(tasknumber)
                                 + Gantt.getBarHeight() / 3
                            })
                            .style("fill", currentLevel.color);

                        yPos = Gantt.getBarYCoordinate(tasknumber)
                         + Gantt.getBarHeight() / 2 + Gantt.taskResourcePadding;
                        if (xPos < thisObj.timeScale(currentLevel.end)) {
                            xPos = thisObj.timeScale(currentLevel.start) +
                                (0 === thisObj.taskDurationToWidth(currentLevel)
                                 ? 3 : thisObj.taskDurationToWidth(currentLevel));
                            xPosStart = thisObj.timeScale(currentLevel.start);
                        }
                        if (xPos < thisObj.timeScale(currentLevel.end)) {
                            xPos = thisObj.timeScale(currentLevel.start) +
                                (0 === thisObj.taskDurationToWidth(currentLevel)
                                 ? 3 : thisObj.taskDurationToWidth(currentLevel));
                            xPosStart = thisObj.timeScale(currentLevel.start);
                        }
                        thisObj.renderTooltip(eachPhaseSelection);
                        let labelnormalizer: number;
                        labelnormalizer = (thisObj.viewModel.settings.taskResource.fontSize > 20) ? 20
                            : thisObj.viewModel.settings.taskResource.fontSize;
                        if (taskResourceShow) {

                            let taskResource: Selection<HTMLElement>;
                            taskResource = taskSelection
                                .append("text")
                                .classed(Selectors.taskResource.className + spaceLiteral
                                     + taskRowLiteral + tasknumber, true);
                            if (resourcePresent && currentLevel.resource == null) {
                                currentLevel.resource = "(Blank)";
                            }
                            d3.select("body").append("text")
                                .text(currentLevel.resource)
                                .classed("resourceLabelText", true)
                                .style({
                                    "font-family": dataLabelsFontFamily,
                                    "font-size": normalizer + pxLiteral
                                });

                            Gantt.datalabelValueFormatter = ValueFormatter.create({
                                format: measureFormat ? measureFormat : ValueFormatter.DefaultNumericFormat
                            });
                            if (currentLevel.resource !== null) {
                                currentLevel.resource = Gantt.datalabelValueFormatter.format(currentLevel.resource);
                            } else {
                                currentLevel.resource = "";
                            }
                            const textProperties: TextProperties = {
                                fontFamily: thisObj.viewModel.settings.taskResource.fontFamily,
                                fontSize: thisObj.viewModel.settings.taskResource.fontSize + pxLiteral,
                                text: currentLevel.resource
                            };
                            const titleWidth: number = textMeasurementService.measureSvgTextWidth(textProperties);
                            d3.selectAll(".resourceLabelText").remove();
                            let xPosVal: number = 0;
                            let datalabelMaxWidth: number;
                            let chartShiftRight: number;
                            chartShiftRight = this.margin.left + transformRightValue;
                            switch (thisObj.viewModel.settings.taskResource.position.toLowerCase()) {
                                case "center":
                                    xPosVal = ((xPosStart + xPos) / 2) - (titleWidth / 2);
                                    datalabelMaxWidth = titleWidth + 5;
                                    break;
                                case "left":
                                    xPosVal = xPosStart - titleWidth - xFactor;
                                    datalabelMaxWidth = chartShiftRight + xPosStart - xFactor;
                                    break;
                                case "right":
                                default:
                                    xPosVal = xPos + xFactor;
                                    datalabelMaxWidth = titleWidth + xFactor;
                                    break;
                            }
                            if (xPosVal < 0) {
                                xPosVal = chartShiftRight + xPosVal;
                                xPosVal = (xPosVal > 0) ? xPosStart - titleWidth - 5 : -chartShiftRight;
                            }
                            taskResource
                                .attr({
                                    metroAttr,
                                    projectAttr,
                                    regionAttr,
                                    trancheAttr,
                                    x: xPosVal,
                                    y: yPos + labelnormalizer / 3
                                })
                                .text(currentLevel.resource)
                                .style({
                                    "fill": taskResourceColor,
                                    "font-family": dataLabelsFontFamily,
                                    "font-size": labelnormalizer + pxLiteral
                                }).call(
                                    AxisHelper.LabelLayoutStrategy.clip,
                                    datalabelMaxWidth,
                                    textMeasurementService.svgEllipsis);
                            taskResource.append("title").text(currentLevel.resource);

                        }
                        let selectionManager: ISelectionManager;
                        selectionManager = this.selectionManager;
                    }
                }
                let bars: UpdateSelection<ITask>;
                bars = d3.selectAll(dotLiteral + Selectors.taskRect.className).data(tasks);

                bars.on("click", function(d: ITask): void {
                    let sClass: any;
                    sClass = this.className;
                    let oSplittedClassNames: string[];
                    let rowNumber: string;
                    oSplittedClassNames = sClass.animVal.split(" ");
                    for (const iIterator of  oSplittedClassNames) {
                        let className: string;
                        className = iIterator;
                        if (className.indexOf("task_row") !== -1) {
                            rowNumber = className.substr(8, className.length - 8);
                            $(taskRowClassLiteral + rowNumber)
                            .addClass("gantt_higheropacity").removeClass("gantt_loweropacity");
                        }
                    }

                    thisObj.selectionManager.select(d.selectionId, false).then((ids: ISelectionId[]) => {
                        if (ids.length === 0) {
                            $(".gantt_task-rect").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                            $(".gantt_toggle-task").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                            $(".gantt_kpiClass").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                            $(".gantt_task-resource").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                            Gantt.isSelected = false;

                        } else {
                            $(".gantt_task-rect").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
                            $(".gantt_toggle-task").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
                            $(".gantt_kpiClass").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");
                            $(".gantt_task-resource").removeClass("gantt_higheropacity").addClass("gantt_loweropacity");

                            let sString: string;
                            sString = "";
                            let sStr: string;
                            sStr = "";
                            if ($(".gantt_task-rect").attr("trancheAttr")) {
                                sString = "trancheAttr";
                            } else if ($(".gantt_task-rect").attr("projectAttr")) {
                                sString = "projectAttr";
                            } else if ($(".gantt_task-rect").attr("metroAttr")) {
                                sString = "metroAttr";
                            } else if ($(".gantt_task-rect").attr("regionAttr")) {
                                sString = "regionAttr";
                            }
                            if (sString) {
                                sStr = $(this).attr(sString);
                            }
                            $(".gantt_toggle-task").addClass("gantt_loweropacity").removeClass("gantt_higheropacity");
                            $(taskRowClassLiteral + rowNumber)
                            .addClass("gantt_higheropacity").removeClass("gantt_loweropacity");
                            Gantt.isSelected = true;
                        }
                        thisObj.syncSelectionState(
                            d3.selectAll(dotLiteral + Selectors.taskRect.className),
                            thisObj.selectionManager.getSelectionIds()
                        );
                    });
                    let $LegendToggleImageId: JQuery;
                    $LegendToggleImageId = $("#LegendToggleImage");
                    if ($LegendToggleImageId.hasClass("visible")) {
                        $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                        $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                        $(".gantt_legendIndicatorPanel").hide();
                        $(".arrow").hide();
                    }
                    (d3.event as Event).stopPropagation();
                });
                let textsHierarchy: Selection<SVGAElement>;
                textsHierarchy = d3.selectAll(dotLiteral + Selectors.toggleTask.className);
                // tslint:disable-next-line:cyclomatic-complexity no-any
                textsHierarchy.on("click", function(d: any): void {
                    $(".gantt_toggle-task").addClass("gantt_loweropacity");
                    $(".gantt_task-rect").addClass("gantt_loweropacity");
                    $(".gantt_kpiClass").addClass("gantt_loweropacity");
                    $(".gantt_task-resource").addClass("gantt_loweropacity");

                    let sString: string;
                    sString = "";
                    let sStr: string;
                    sStr = "";

                    if ($(this).attr("regionAttr") === "") {
                        sString = "";
                    } else if ($(this).attr("metroAttr") === "") {
                        sString = "regionAttr";
                    } else if ($(this).attr("projectAttr") === "") {
                        sString = "metroAttr";
                    } else if ($(this).attr("trancheAttr") === "") {
                        sString = "projectAttr";
                    } else {
                        sString = "trancheAttr";
                    }
                    sStr = $(this).attr(sString);
                    let flag: boolean;
                    flag = false;
                    let categoryName: string;
                    categoryName = $(this).find("title").text();
                    let selectedSelID: ISelectionId[];
                    selectedSelID = [];
                    const tasksLength2: number = tasks.length;
                    for (let i: number = 0; i < tasksLength2; i++) {
                        for (let j: number = tasks[0].name.length - 1; j >= 0; j--) {
                            if (!(tasks[i].name[j])) { continue; }
                            let currentcategory: string;
                            if (j === 0) {
                                currentcategory = Gantt.regionValueFormatter.format(tasks[i].name[j]);
                            } else if (j === 1) {
                                currentcategory = Gantt.metroValueFormatter.format(tasks[i].name[j]);
                            } else if (j === 2) {
                                currentcategory = Gantt.projectValueFormatter.format(tasks[i].name[j]);
                            } else {
                                currentcategory = Gantt.trancheValueFormatter.format(tasks[i].name[j]);
                            }
                            let k: number = i;
                            if (currentcategory === categoryName || currentcategory.toString() === categoryName) {
                                if (Gantt.previousSel === categoryName) {
                                    for (let m: number = 0;
                                        m < Gantt.globalOptions.dataViews[0].categorical.categories[0].values.length
                                        ; m++) {
                                        Gantt.selectionIdHash[m] = true;
                                        Gantt.previousSel = null;
                                    }
                                    $(".gantt_toggle-task"
                                    ).removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                                    $(".gantt_task-rect")
                                    .removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                                    $(".gantt_kpiClass")
                                    .removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                                    $(".gantt_task-resource")
                                    .removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                                    Gantt.isSelected = true;
                                } else {
                                    for (let m: number = 0;
                                         m < Gantt.globalOptions.dataViews[0].categorical.categories[0].values.length
                                        ; m++) {
                                        Gantt.selectionIdHash[m] = false;
                                    }
                                    k = 0;
                                    let categoryLength: number;
                                    let categoryValFormatted: string;
                                    for (categoryLength =
                                        Gantt.globalOptions.dataViews[0].categorical.categories[j].values.length;
                                         k < categoryLength; k++) {
                                        if (j === 0) {
                                            categoryValFormatted = Gantt.regionValueFormatter.format(tasks[k].name[j]);
                                        } else if (j === 1) {
                                            categoryValFormatted = Gantt.metroValueFormatter.format(tasks[k].name[j]);
                                        } else if (j === 2) {
                                            categoryValFormatted = Gantt.projectValueFormatter.format(tasks[k].name[j]);
                                        } else {
                                            categoryValFormatted = Gantt.trancheValueFormatter.format(tasks[k].name[j]);
                                        }
                                        if (categoryValFormatted === categoryName ||
                                             categoryValFormatted.toString() === categoryName) {
                                            Gantt.selectionIdHash[k] = true;
                                        }
                                    }
                                    Gantt.previousSel = currentcategory.toString();
                                }
                                flag = true;
                            }
                            if (flag) { break; }
                        }
                        if (flag) { break; }
                    }

                    selectedSelID = [];
                    for (let i: number = 0;
                        i < Gantt.globalOptions.dataViews[0].categorical.categories[0].values.length; i++) {
                        if (Gantt.selectionIdHash[i] && selectionIds[i]) {
                            selectedSelID.push(selectionIds[i]);
                            $(taskRowClassLiteral + i)
                            .addClass("gantt_higheropacity").removeClass("gantt_loweropacity");
                            Gantt.isSelected = true;
                        }
                        if (selectedSelID.length === selectionIds.length || selectedSelID.length === 0) {
                            Gantt.isSelected = false;
                        }
                    }
                    thisObj.selectionManager.select(selectedSelID).then((ids: ISelectionId[]) => {
                        if (ids.length === 0) {
                            $(".gantt_task-rect").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                            $(".gantt_toggle-task").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                            $(".gantt_kpiClass").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                            $(".gantt_task-resource").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                            Gantt.isSelected = false;
                        }
                    });
                    let $LegendToggleImageId: JQuery;
                    $LegendToggleImageId = $("#LegendToggleImage");
                    if ($LegendToggleImageId.hasClass("visible")) {
                        $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                        $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                        $(".gantt_legendIndicatorPanel").hide();
                        $(".arrow").hide();
                    }
                    (d3.event as Event).stopPropagation();
                });

                d3.select("html").on("click", (): void => {
                    if (!Gantt.isSelected) {
                        (d3.event as Event).stopPropagation();
                    } else {
                        thisObj.selectionManager.clear();
                        bars.attr({
                            opacity: 1
                        });
                        $(".gantt_toggle-task").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        $(".gantt_task-rect").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        $(".gantt_kpiClass").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        $(".gantt_task-resource").removeClass("gantt_loweropacity").addClass("gantt_higheropacity");
                        Gantt.isSelected = false;
                    }
                    let $LegendToggleImageId: JQuery;
                    $LegendToggleImageId = $("#LegendToggleImage");
                    if ($LegendToggleImageId.hasClass("visible")) {
                        $LegendToggleImageId.removeClass("visible").addClass("notVisible");
                        $LegendToggleImageId.attr("href", Gantt.drillDownImage);
                        $(".gantt_legendIndicatorPanel").hide();
                        $(".arrow").hide();
                    }
                });

                bars.exit()
                    .remove();

                let taskPanelWidth: number;
                taskPanelWidth = $(".gantt_taskPanel").width();
                let totalCategoryLength: number;
                totalCategoryLength = this.viewModel.tasksNew[0].name.length;
                lastRectX = parseFloat($(headerCellClassLiteral + (totalCategoryLength - 1)).attr("x"));
                barPanelLeft = parseFloat(d3.select(".gantt_barPanel").style("left"));
                kpiPanelWidth = parseFloat(d3.select(".gantt_kpiPanel").style("left"));

                d3.select(dotLiteral + Selectors.bottomTaskDiv.className).style({
                    width: PixelConverter.toString(taskPanelWidth)
                });

                d3.select(".gantt_drillAllPanel2").style("width", PixelConverter.toString(taskPanelWidth));
                if ((kpiPanelWidth > 0 && lastRectX > kpiPanelWidth - 12) || lastRectX > barPanelLeft - 12) {
                    d3.select(dotLiteral + Selectors.bottomTaskSvg.className).style({
                        width: PixelConverter.toString(lastRectX + 100)
                    });
                    d3.select(".gantt_taskSvg").style({
                        width: PixelConverter.toString(lastRectX + 100)
                    });
                    d3.selectAll(".gantt_backgroundRect").attr({ width: lastRectX + 100 });
                    d3.select(".gantt_drillAllSvg2").style({
                        width: PixelConverter.toString(lastRectX + 100)
                    });
                    d3.selectAll(horizontalLineClassLiteral + (totalCategoryLength - 1)).attr("x2", lastRectX + 100);
                } else {
                    d3.select(dotLiteral + Selectors.bottomTaskSvg.className).style({
                        width: PixelConverter.toString(taskPanelWidth)
                    });
                    d3.select(".gantt_taskSvg").style({
                        width: PixelConverter.toString(taskPanelWidth)
                    });
                    d3.selectAll(".gantt_backgroundRect").attr({ width: taskPanelWidth });
                    d3.select(".gantt_drillAllSvg2").style({
                        width: PixelConverter.toString(taskPanelWidth)
                    });
                }
            } else {
                this.taskDiv.remove();
                this.kpiDiv.remove();
                this.backgroundGroupBar.remove();
                if ($(".taskRect").length > 0) {
                    $(".taskRect").remove();
                    $(".gantt_barPanel").not(":first").remove();
                }
                this.taskDiv = this.bottomDiv
                    .append("div")
                    .classed(Selectors.taskPanel.className, true);
                this.taskDiv.style({
                    border: "1px Black",
                    class: "ganttTaskDiv",
                    width: PixelConverter.toString(Gantt.taskLabelWidth + 20)
                });
                this.kpiDiv = this.bottomDiv
                    .append("div")
                    .classed(Selectors.kpiPanel.className, true);
                this.kpiDiv.style({
                    class: "ganttKpiDiv",
                    left: PixelConverter.toString(Gantt.taskLabelWidth + 20),
                    width: PixelConverter.toString(Gantt.kpiLabelWidth)
                });
                this.barDiv = this.bottomDiv
                    .append("div")
                    .classed(Selectors.barPanel.className, true);
                this.barDiv.style({
                    class: "ganttBarDiv",
                    left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 20),
                    width: PixelConverter
                    .toString(this.viewport.width - Gantt.taskLabelWidth - Gantt.kpiLabelWidth - 20)
                });
                const parentColour: string = "#C2C2C2";
                const firstChildColour: string = "#E0E0E0";
                const secondChildColour: string = "#F0F0F0";
                const thirdChildColour: string = "#FFFFFF";
                const opacityNumber1: number = 0.6;
                const opacityNumber2: number = 0.8;
                const categoryLen: number = Gantt.categorylength;
                if ((this.viewModel.settings.legend.show
                    && (this.viewport.width > $(".gantt_legendIndicatorPanel").innerWidth() + 100)
                    && this.viewport.height > $(".gantt_legendIndicatorPanel").innerHeight() + 50
                    && this.viewModel.kpiData.length > 0)
                    && (parseFloat(d3.select(".gantt_legendPanel").style("left")) >
                        parseFloat(d3.select(".gantt_barPanel").style("left")))) {
                    $(".gantt_legendPanel").show();
                    if ($("#LegendToggleImage").hasClass("visible")) {
                        $(".gantt_legendIndicatorPanel").show();
                        $(".arrow").show();
                    } else {
                        $(".gantt_legendIndicatorPanel").hide();
                        $(".arrow").hide();
                    }
                } else {
                    $(".arrow").hide();
                    $(".gantt_legendPanel").hide();
                    $(".gantt_legendIndicatorPanel").hide();
                }
                const textElement: Selection<HTMLElement> = this.drillAllGroup.append("text")
                    .attr("class", categoryLiteral + spaceLiteral + taskColumnLiteral)
                    .attr("x", 15)
                    .attr("y", 10);
                d3.select(categoryClassLiteral)
                    .text("Category hierarchy")
                    .style({
                        "background-color": columnHeaderBgColor,
                        "fill": columnHeaderColor,
                        "font-family": columnHeaderFontFamily,
                        "font-size": columnHeaderFontSize + pxLiteral
                    });
                d3.select(categoryClassLiteral)
                .append("title").text(Gantt.getLabelValuesNew(Gantt.categoriesTitle.toString(), "text", 50));

                for (let jCount: number = 0; jCount < totalKPIs; jCount++) {
                    let axisKPILabel1: Selection<HTMLElement>;
                    axisKPILabel1 = this.kpiTitleGroup.append("text").classed(Selectors.label.className, true);
                    axisKPILabel1.attr({
                        "background": columnHeaderBgColor,
                        "fill": columnHeaderColor,
                        "font-family": columnHeaderFontFamily,
                        "font-size": columnHeaderFontSize + pxLiteral,
                        "stroke-width": Gantt.axisLabelStrokeWidth,
                        "x": 3 + (Gantt.kpiLabelWidth / totalKPIs * jCount),
                        "y": 15
                    });
                    let sKPITitle: string;
                    sKPITitle = tasks[0].KPIValues[jCount].name;
                    let sFirstWord: string;
                    sFirstWord = sKPITitle.substr(0, sKPITitle.indexOf(" "));
                    switch (sFirstWord) {
                        case "First":
                        case "Last":
                        case "Earliest":
                        case "Latest":
                            sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 1, sKPITitle.length);
                            break;
                        case "Count":
                        case "Average":
                        case "Min":
                        case "Max":
                        case "Variance":
                        case "Median":
                            sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 4, sKPITitle.length);
                            break;
                        case "Standard":
                            sKPITitle = sKPITitle.substr(sKPITitle.indexOf(" ") + 14, sKPITitle.length);
                        default:
                    }
                    let numberOfCharsAllowed: number;
                    numberOfCharsAllowed = 75 / (Gantt.iKPIHeaderSingleCharWidth);
                    axisKPILabel1.text(Gantt.getLabelValuesNew(sKPITitle, "text", numberOfCharsAllowed));
                    axisKPILabel1.append("title").text(sKPITitle);

                    if (jCount !== 0) {
                        let kpiTitleVerticleLine: Selection<HTMLElement>;
                        kpiTitleVerticleLine =
                         this.kpiTitleGroup.append("line").classed(verticalLineSimpleLiteral, true);
                        kpiTitleVerticleLine.attr({
                            stroke: "#f2f2f2",
                            x1: (Gantt.kpiLabelWidth / totalKPIs * jCount),
                            x2: (Gantt.kpiLabelWidth / totalKPIs * jCount),
                            y1: 0,
                            y2: 30
                        });

                        let kpiVerticleLine: Selection<HTMLElement>;
                        kpiVerticleLine = this.kpiGroup.append("line").classed(verticalLineSimpleLiteral, true);
                        kpiVerticleLine.attr({
                            stroke: "#f2f2f2",
                            x1: (Gantt.kpiLabelWidth / totalKPIs * jCount) - 1,
                            x2: (Gantt.kpiLabelWidth / totalKPIs * jCount) - 1,
                            y1: 0,
                            y2: Gantt.currentTasksNumber * chartLineHeight + 8
                        });
                    }
                }
                // tslint:disable-next-line:no-any
                let yVal: number = -1;
                // tslint:disable-next-line:no-any
                let parentTasks: any;
                for (let tasknumber: number = 0; tasknumber < tasks.length; tasknumber++) {
                    // tslint:disable-next-line:typedef
                    parentTasks = tasks.filter((key) =>  key.id === tasks[tasknumber].parentId );

                    if (tasks[tasknumber].parentId === 1 || tasks[tasknumber].expanded ||
                        (parentTasks.length !== 0 && parentTasks[0].expanded)) {

                        let currentLevel: ITask;
                        currentLevel = tasks[tasknumber];
                        let leveLength: number;
                        leveLength = tasks[tasknumber].level;
                        let levelMargin: number;
                        let marginLevel: number;
                        let textMargin: number = 10;
                        levelMargin = (tasks[tasknumber].level * 10);
                        if (yVal !== thisObj.getTaskLabelCoordinateY(tasknumber)) {
                            let divWidth: number = 0;
                            // tslint:disable-next-line:no-any
                            const divTask: any = this.taskDiv.append("div");

                            if ($($(divTask)[0]).parent().width() < 200) {
                                divWidth = 200;
                            } else {
                                divWidth = $(".ganttDiv").width();
                            }
                            // tslint:disable-next-line:no-any
                            const lineDiv: any = this.taskDiv.append("div")
                                .style({
                                    height: "24px",
                                    width: divWidth + pxLiteral
                                })
                                .classed("show", true)
                                .attr({
                                    "data-ParentId": tasks[tasknumber].parentId,
                                    "data-RowId": tasks[tasknumber].rowId,
                                    "data-expanded": tasks[tasknumber].expanded,
                                    "data-isLeaf": tasks[tasknumber].isLeaf,
                                    "data-level": tasks[tasknumber].level,
                                    "data-row": tasknumber
                                });
                            if (categoryLen === 4) {
                                if (leveLength === 1) {
                                    lineDiv.style({
                                        "background-color": parentColour,
                                        "opacity": 0.8
                                    });
                                } else if (leveLength === 2) {
                                    lineDiv.style({
                                        "background-color": firstChildColour,
                                        "opacity": 0.8
                                    });
                                } else if (leveLength === 3) {
                                    lineDiv.style({
                                        "background-color": secondChildColour,
                                        "opacity": 0.8
                                    });
                                } else if (leveLength === 4) {
                                    lineDiv.style({
                                        "background-color": thirdChildColour,
                                        "opacity": 0.8
                                    });
                                }
                            } else if (categoryLen === 3) {
                                if (leveLength === 1) {
                                    lineDiv.style({
                                        "background-color": firstChildColour,
                                        "opacity": 0.8
                                    });
                                } else if (leveLength === 2) {
                                    lineDiv.style({
                                        "background-color": secondChildColour,
                                        "opacity": 0.8
                                    });
                                } else if (leveLength === 3) {
                                    lineDiv.style({
                                        "background-color": thirdChildColour,
                                        "opacity": 0.8
                                    });
                                }
                            } else if (categoryLen === 2) {
                                if (leveLength === 1) {
                                    lineDiv.style({
                                        "background-color": secondChildColour,
                                        "opacity": 0.8
                                    });
                                } else if (leveLength === 2) {
                                    lineDiv.style({
                                        "background-color": thirdChildColour,
                                        "opacity": 0.8
                                    });
                                }
                            } else {
                                const backgroundBarColor: string =
                                 tasknumber % 2 === 0 ? thirdChildColour : firstChildColour;
                                lineDiv.style({
                                    "background-color": backgroundBarColor,
                                    "opacity": 0.8
                                });
                            }

                            yVal = thisObj.getTaskLabelCoordinateY(tasknumber);
                            const marginFactor1: number = 4;
                            const marginFactor2: number = 9;
                            if (!tasks[tasknumber].isLeaf) {
                                marginLevel = levelMargin;
                                if (tasks[tasknumber].level !== 1) {
                                    marginLevel = levelMargin + (tasks[tasknumber].level * xFactor)
                                        + (tasks[tasknumber].level - 1) * marginFactor1;
                                }
                                axisLabelImg = lineDiv.append("img")
                                    .style("margin-left", (marginLevel + pxLiteral))
                                    .attr("src", tasks[tasknumber].expanded ? Gantt.minusIcon : Gantt.plusIcon);
                                // tslint:disable-next-line:typedef
                                axisLabelImg.on("click", function(this) {
                                    let sRowId: string;
                                    // tslint:disable-next-line
                                    let selectionId: any = thisObj.selectionManager;
                                    // tslint:disable-next-line
                                    let selectionIdLen: any = selectionId.selectedIds;
                                    // tslint:disable-next-line
                                    let selectionIdLen1: number = selectionIdLen.length;
                                    // tslint:disable-next-line:no-any
                                    let selobjchildrencncierarchy: any = [];
                                    sRowId = $(this).parent().attr("data-RowId");
                                    // tslint:disable-next-line:no-any
                                    if ($.grep(tasks, (e: any):
                                     any =>   e.rowId.toString() === sRowId )[0].expanded) {
                                        this.src = Gantt.plusIcon;
                                        $(this).parent().attr("data-expanded", "false");
                                        thisObj.collapseFunctinality(tasks, sRowId);
                                    } else {
                                        this.src = Gantt.minusIcon;
                                        $(this).parent().attr("data-expanded", "true");
                                        thisObj.expandFunctinality(tasks, sRowId);
                                    }

                                    if (selectionIdLen1 !== 0) {
                                        thisObj.selectionManager.clear();
                                        Gantt.lastSelectedbar = null;
                                        d3.selectAll(".taskRect.show").classed("selected", false);
                                        d3.selectAll(".taskRect.show").style({
                                            opacity: 1
                                        });
                                        d3.selectAll(".gantt_taskPanel .show").style({
                                            opacity: 1
                                        });
                                        for (let kpiindex: number = 0; kpiindex < tasks.length; kpiindex++) {
                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                            .children()[kpiindex]).css({ opacity: 1 });
                                        }
                                    }
                                    // tslint:disable-next-line:no-any
                                    function getDirectChildInHierarchy(sRowID: any): any {
                                        // tslint:disable-next-line:no-any
                                        $.map(tasks, (sObj: any): void => {
                                            if (sObj.parentId === sRowID) {
                                                selobjchildrencncierarchy.push(sObj);
                                                getDirectChildInHierarchy(sObj.rowId);
                                            }
                                        });

                                        return selobjchildrencncierarchy;
                                    }
                                    if (Object.keys(Gantt.arrGantt).length === undefined) {
                                        Gantt.arrGantt = JSON.parse(Gantt.stateValue);
                                    }
                                    for (const i of tasks) {
                                        if (Object.keys(Gantt.arrGantt).length === undefined) {
                                            if (!(sRowId ===  i.rowId.toString())) {
                                                Gantt.expandCollapseStates[ i.rowId] = false;
                                            }
                                        }
                                        if (parseInt(sRowId, 10) ===  i.rowId &&  i.expanded !== true) {
                                            Gantt.arrGantt[ i.rowId] = true;
                                        }
                                        if (parseInt(sRowId, 10) ===  i.rowId &&  i.expanded === true) {
                                            selobjchildrencncierarchy.push( i);
                                            selobjchildrencncierarchy = getDirectChildInHierarchy(parseInt(sRowId, 10));
                                            let j: number = 0;
                                            for (const ijIterator of tasks) {
                                                if (selobjchildrencncierarchy[j].rowId === ijIterator.rowId) {
                                                    Gantt.arrGantt[ijIterator.rowId] = false;
                                                    j++;
                                                    if (selobjchildrencncierarchy.length === j) {
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    thisObj.persistExpandCollapseState(Gantt.arrGantt);
                                });
                            } else {
                                if (tasks[tasknumber].level === 1) {
                                    textMargin = levelMargin;
                                } else {
                                    textMargin = levelMargin + (tasks[tasknumber].level * xFactor)
                                        + (tasks[tasknumber].level - 1) * marginFactor2;
                                }
                                marginLevel = 0;
                                scrollWidth = textMargin;
                            }
                            // tslint:disable-next-line:no-any
                            const taskName: any = (tasks[tasknumber].name) ? tasks[tasknumber].name : "(Blank)";
                            const lableWidth: number = textMeasurementService.measureSvgTextWidth(taskName);
                            const availableWIdth: number = Gantt.taskLabelWidthOriginal - marginLevel;
                            const catwidth: number = availableWIdth - textMargin;
                            axisLabel = lineDiv.append("text").text(taskName)
                                .call(
                                    AxisHelper.LabelLayoutStrategy.clip,
                                    catwidth,
                                    textMeasurementService.svgEllipsis)
                                .attr("title", tasks[tasknumber].name);
                            axisLabel
                                .style("font-size", normalizer + pxLiteral).style("font-family", taskLabelsFontFamily)
                                .style("margin-left", textMargin + pxLiteral)
                                .style("color", taskLabelsColor)
                                // tslint:disable-next-line:typedef
                                .on("click", function() {
                                    let sRowId: number;
                                    // tslint:disable-next-line:typedef
                                    let obj = {};
                                    sRowId = parseInt($(this).parent().attr("data-rowid"), 10);
                                    obj = tasks;
                                    // tslint:disable-next-line:no-any
                                    let selobjchildrencncierarchy: any = [];
                                    // tslint:disable-next-line:typedef
                                    function getDirectChildInHierarchy(sRowID) {
                                        // tslint:disable-next-line:typedef
                                        $.map(tasks, (sObj) => {
                                            if (sObj.parentId === sRowID) {
                                                selobjchildrencncierarchy.push(sObj);
                                                getDirectChildInHierarchy(sObj.rowId);
                                            }
                                        });

                                        return selobjchildrencncierarchy;
                                    }
                                    for (const i of tasks) {
                                        if (i.rowId === sRowId) {
                                            // tslint:disable-next-line:no-any
                                            const selectionId: any = i.selectionId;
                                            let parentRowId: number;
                                            parentRowId = i.rowId;
                                            selobjchildrencncierarchy.push(i);
                                            selobjchildrencncierarchy = getDirectChildInHierarchy(parentRowId);
                                            if (Gantt.lastSelectedbar === null) {
                                                Gantt.lastSelectedbar
                                                 = parseInt($($(this).parent()[0]).attr("data-rowid"), 10);
                                                thisObj.selectionManager
                                                .select(selectionId).then((ids: ISelectionId[]) => {
                                                    if ($(this).parent().attr("data-isleaf") === "true") {
                                                        d3.selectAll(".taskRect.show").classed("selected", false);
                                                        d3.selectAll(".taskRect.show").style({
                                                            opacity: 0.3
                                                        });
                                                        d3.selectAll(".gantt_taskPanel .show").style({
                                                            opacity: 0.3
                                                        });
                                                        d3.select($(this).parent()[0])
                                                            .classed("selected", true)
                                                            .style({
                                                                opacity: 1
                                                            });
                                                        for (let kpiindex: number = 0;
                                                             kpiindex < tasks.length; kpiindex++) {
                                                            // tslint:disable-next-line:max-line-length
                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                                        }
                                                        // tslint:disable-next-line:no-shadowed-variable
                                                        for (let i: number = 0;
                                                             i < tasks.length; i++) {
                                                            for (const iCount of selobjchildrencncierarchy) {
                                                                if (parseInt($(d3.selectAll(".taskRect.show")[0][i])
                                                                .attr("data-rowid"), 10)
                                                                    === iCount.rowId) {
                                                                    // tslint:disable-next-line:typedef
                                                                    const thisk =
                                                                     $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                        .css("opacity", "1");
                                                                    thisk.addClass("selected");
                                                                    // tslint:disable-next-line:typedef
                                                                    const thiskk =
                                                                     $(d3.selectAll(".gantt_taskPanel .show"));
                                                                    $(thiskk[0][i]).css("opacity", "1");
                                                                    $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                        .children()[i]).css({ opacity: 1 });
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        d3.selectAll(".taskRect.show").style({
                                                            opacity: 0.3
                                                        })
                                                            .classed("selected", false);
                                                        d3.selectAll(".gantt_taskPanel .show").style({
                                                            opacity: 0.3
                                                        });
                                                        for (let kpiindex: number = 0;
                                                             kpiindex < tasks.length; kpiindex++) {
                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                .children()[kpiindex])
                                                                .css({ opacity: 0.3 });
                                                        }
                                                        // tslint:disable-next-line:no-shadowed-variable
                                                        for (let i: number = 0; i < tasks.length; i++) {
                                                            for (const iCount of selobjchildrencncierarchy) {
                                                                if (parseInt($(d3.selectAll(".taskRect.show")[0][i])
                                                                .attr("data-rowid"), 10)
                                                                    === iCount.rowId) {
                                                                    // tslint:disable-next-line:typedef
                                                                    const thisk = $(d3.selectAll(".taskRect.show"));
                                                                    $(thisk[0][i]).css({ opacity: 1 });
                                                                    // tslint:disable-next-line:typedef
                                                                    const thiskk =
                                                                     $(d3.selectAll(".gantt_taskPanel .show"));
                                                                    $(thiskk[0][i]).css({ opacity: 1 });
                                                                    $($(d3.selectAll(".gantt_kpiPanel")[0][0]).
                                                                        children()[i]).css({ opacity: 1 });
                                                                }
                                                            }
                                                        }
                                                    }
                                                });
                                            } else if (Gantt.lastSelectedbar ===
                                                parseInt($($(d3.select($(this).parent()[0]))[0])
                                                .attr("data-rowid"), 10)) {
                                                thisObj.selectionManager.clear();
                                                d3.selectAll(".taskRect.show").classed("selected", false);
                                                d3.selectAll(".taskRect.show").style({
                                                    opacity: 1
                                                });
                                                d3.selectAll(".gantt_taskPanel .show").style({
                                                    opacity: 0.8
                                                });
                                                for (let kpiindex: number = 0;
                                                     kpiindex < tasks.length; kpiindex++) {
                                                    $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                    .children()[kpiindex]).css({ opacity: 0.8 });
                                                }
                                                Gantt.lastSelectedbar = null;
                                            } else {
                                                // tslint:disable-next-line:max-line-length
                                                Gantt.lastSelectedbar = parseInt($($(d3.select($(this).parent()[0]))[0])
                                                .attr("data-rowid"), 10);
                                                thisObj.selectionManager.select(selectionId)
                                                .then((ids: ISelectionId[]) => {
                                                    if ($(this).parent().attr("data-isleaf").toString() === "true") {
                                                        d3.selectAll(".taskRect.show").classed("selected", false);
                                                        d3.selectAll(".gantt_taskPanel .show").style({
                                                            opacity: 0.3
                                                        })
                                                            .classed("selected", false);
                                                        d3.selectAll(".taskRect.show").style({
                                                            opacity: 0.3
                                                        })
                                                            .classed("selected", false);
                                                        for (let kpiindex: number = 0;
                                                             kpiindex < tasks.length; kpiindex++) {
                                                            // tslint:disable-next-line:max-line-length
                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                                        }
                                                        d3.select($(this).parent()[0]).style({
                                                            opacity: 1
                                                        })
                                                            .classed("selected", true);
                                                        // tslint:disable-next-line:no-shadowed-variable
                                                        for (let i: number = 0; i < tasks.length; i++) {
                                                            for (const iCount of selobjchildrencncierarchy) {
                                                                // tslint:disable-next-line:max-line-length
                                                                if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) ===
                                                                iCount.rowId) {
                                                                    // tslint:disable-next-line:typedef
                                                                    const thisk =
                                                                     $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                        .css("opacity", "1");
                                                                    thisk.addClass("selected");
                                                                    // tslint:disable-next-line:typedef
                                                                    const thiskk =
                                                                     $(d3.selectAll(".gantt_taskPanel .show"));
                                                                    $(thiskk[0][i]).css("opacity", "1");
                                                                    $($(d3.selectAll(".gantt_kpiPanel")[0][0]).
                                                                        children()[i]).css({ opacity: 1 });
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        d3.selectAll(".taskRect.show").style({
                                                            opacity: 0.3
                                                        })
                                                            .classed("selected", false);
                                                        d3.selectAll(".gantt_taskPanel .show").style({
                                                            opacity: 0.3
                                                        });
                                                        for (let kpiindex: number =
                                                             0; kpiindex < tasks.length; kpiindex++) {
                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                            .children()[kpiindex])
                                                                .css({ opacity: 0.3 });
                                                        }
                                                        // tslint:disable-next-line:no-shadowed-variable
                                                        for (let i: number = 0; i < tasks.length; i++) {
                                                            for (const iCount of selobjchildrencncierarchy) {
                                                                // tslint:disable-next-line:max-line-length
                                                                if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) ===
                                                                iCount.rowId) {
                                                                    // tslint:disable-next-line:typedef
                                                                    const thisk =
                                                                     $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                        .css("opacity", "1");
                                                                    thisk.addClass("selected");
                                                                    // tslint:disable-next-line:typedef
                                                                    const thiskk =
                                                                     $(d3.selectAll(".gantt_taskPanel .show"));
                                                                    $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                        .children()[i]).css({ opacity: 1 });
                                                                    $(thiskk[0][i]).css("opacity", "1");
                                                                }
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    }
                                    (d3.event as Event).stopPropagation();
                                });

                            if (0 !== tasks[tasknumber].KPIValues.length) {
                                // tslint:disable-next-line:no-any
                                const kpiDisplayDiv: any = this.kpiDiv.append("div")
                                    .attr({
                                        "data-ParentId": tasks[tasknumber].parentId,
                                        "data-RowId": tasks[tasknumber].rowId,
                                        "data-expanded": tasks[tasknumber].expanded,
                                        "data-isLeaf": tasks[tasknumber].isLeaf,
                                        "data-level": tasks[tasknumber].level,
                                        "data-row": tasknumber
                                    });
                                if (categoryLen === 4) {
                                    if (leveLength === 1) {
                                        kpiDisplayDiv.style({
                                            "background-color": parentColour,
                                            "opacity": 0.8
                                        });
                                    } else if (leveLength === 2) {
                                        kpiDisplayDiv.style({
                                            "background-color": firstChildColour,
                                            "opacity": 0.8
                                        });
                                    } else if (leveLength === 3) {
                                        kpiDisplayDiv.style({
                                            "background-color": secondChildColour,
                                            "opacity": 0.8
                                        });
                                    } else if (leveLength === 4) {
                                        kpiDisplayDiv.style({
                                            "background-color": thirdChildColour,
                                            "opacity": 0.8
                                        });
                                    }
                                } else if (categoryLen === 3) {
                                    if (leveLength === 1) {
                                        kpiDisplayDiv.style({
                                            "background-color": firstChildColour,
                                            "opacity": 0.8
                                        });
                                    } else if (leveLength === 2) {
                                        kpiDisplayDiv.style({
                                            "background-color": secondChildColour,
                                            "opacity": 0.8
                                        });
                                    } else if (leveLength === 3) {
                                        kpiDisplayDiv.style({
                                            "background-color": thirdChildColour,
                                            "opacity": 0.8
                                        });
                                    }
                                } else if (categoryLen === 2) {
                                    if (leveLength === 1) {
                                        kpiDisplayDiv.style({
                                            "background-color": secondChildColour,
                                            "opacity": 0.8
                                        });
                                    } else if (leveLength === 2) {
                                        kpiDisplayDiv.style({
                                            "background-color": thirdChildColour,
                                            "opacity": 0.8
                                        });
                                    }
                                } else {
                                    const backgroundBarColor: string =
                                     tasknumber % 2 === 0 ? thirdChildColour : firstChildColour;
                                    kpiDisplayDiv.style({
                                        "background-color": backgroundBarColor,
                                        "opacity": 0.8
                                    });
                                }
                                if (0 !== currentLevel.KPIValues.length) {
                                    for (let jCount: number = 0; jCount < totalKPIs; jCount++) {
                                        let sKPITitle: string;
                                        sKPITitle = tasks[tasknumber].KPIValues[jCount].name;
                                        if (jCount === 0) {
                                            kpiDisplayDiv
                                                .style({
                                                    height: "24px"
                                                });

                                        }
                                        const indicatorWidth: number = 75;
                                        if (jCount < totalKPIs - 1) {
                                            kpiDisplayDiv.append("div").classed("border", true).
                                                style("margin-left", (): string => {
                                                    return indicatorWidth * (jCount + 1) + pxLiteral;
                                                });
                                        }
                                        const iCenterSpacing: number = 60;
                                        if (this.viewModel.kpiData[jCount].type.toLowerCase() === "indicator") {
                                            // tslint:disable-next-line:no-any
                                            let axisKPILabel: any;
                                            const iLeftSpacing: number = 5;
                                            axisKPILabel = kpiDisplayDiv
                                                .append("div")
                                                .classed("circle", true);
                                            let color: string = kpiFontColor;
                                            let text: string = "";
                                            let titleText: string;
                                            titleText = currentLevel.KPIValues[jCount].value ?
                                                currentLevel.KPIValues[jCount].value.toString() : "";
                                            let showCircle: boolean = true;
                                            let extraLeftPadding: number = 0;
                                            const iLeftAlignSpacing: number = 30.5;
                                            switch (currentLevel.KPIValues[jCount].value ?
                                                currentLevel.KPIValues[jCount].value.toString() : "") {
                                                case "1":
                                                    color = "#ad1717";
                                                    text = "R";
                                                    extraLeftPadding = 1.5;
                                                    break;
                                                case "2":
                                                    color = "#d15d0d";
                                                    text = "O";
                                                    extraLeftPadding = 1;
                                                    break;
                                                case "3":
                                                    color = "#ff9d00";
                                                    text = "Y";
                                                    extraLeftPadding = 2;

                                                    break;
                                                case "4":
                                                    color = "#116836";
                                                    text = "G";
                                                    extraLeftPadding = 0.5;
                                                    break;
                                                default:

                                                    showCircle = false;
                                                    break;
                                            }
                                            if (showCircle) {

                                                axisKPILabel.style("font-size", kpiFontSize + pxLiteral)
                                                    .style("background-color", color)
                                                    //   tslint:disable-next-line:typedef
                                                    .style("margin-top", 5 + pxLiteral)
                                                    .style("margin-left", (): string => {
                                                        if (text === undefined) {
                                                            return (jCount * (iCenterSpacing + 15))
                                                             + iLeftAlignSpacing + pxLiteral;
                                                        } else {
                                                            return (jCount * (iCenterSpacing + 15))
                                                             + iLeftAlignSpacing + pxLiteral;

                                                        }
                                                    });
                                                axisKPILabel.append("title").text(titleText);
                                                axisKPILabel.append("div")
                                                    .append("text").text(text)
                                                    .style({
                                                        "color": "#fff",
                                                        "stroke-width": Gantt.axisLabelStrokeWidth
                                                    }).style("font-size", kpiFontSize + pxLiteral)
                                                    .style("margin-left", (): string => {
                                                        if (text === undefined) {
                                                            return (jCount * (iCenterSpacing + 15))
                                                             + iLeftAlignSpacing + pxLiteral;
                                                        } else {
                                                            return iLeftSpacing + pxLiteral;

                                                        }
                                                    })
                                                    ;
                                                axisKPILabel.append("title").text(titleText);
                                            } else {
                                                axisKPILabel.style("margin-left", (jCount * (iCenterSpacing + 15))
                                                    + iLeftAlignSpacing + pxLiteral);
                                            }

                                        } else if (thisObj.viewModel.kpiData[jCount].type.toLowerCase() === "type") {
                                            // tslint:disable-next-line:no-any
                                            let axisKPILabel: any;
                                            axisKPILabel = kpiDisplayDiv
                                                .append("div")
                                                .classed("rectangle", true);
                                            let color: string;
                                            color = "#fff";
                                            const iLeftAlignSpacing: number = 27;
                                            let text: string = currentLevel.KPIValues[jCount].value ?
                                                currentLevel.KPIValues[jCount].value.toString() : "";
                                            if (!text) {
                                                axisKPILabel.style("margin-left", (jCount * (iCenterSpacing + 15) +
                                                    iLeftAlignSpacing + pxLiteral));
                                                continue;
                                            }
                                            let titleText: string;
                                            titleText = text;
                                            if (-1 === types.indexOf(text)) {
                                                types.push(text);
                                            }
                                            let index: number;
                                            index = types.indexOf(text);
                                            typeColor = Gantt.typeColors[index % Gantt.typeColors.length];
                                            text = text.charAt(0) +
                                             text.charAt(-1 !== text.indexOf(" ") ? text.indexOf(" ") + 1 : -1);
                                            const iLeftSpacing: number = 5;
                                            axisKPILabel.style("font-size", kpiFontSize + pxLiteral)
                                                .style("background-color", typeColor)
                                                .style("margin-top", 5 + pxLiteral)
                                                .style("margin-left", (): string => {
                                                    if (text === undefined) {
                                                        return (Gantt.kpiLabelWidth / totalKPIs * jCount)
                                                         + iLeftSpacing + pxLiteral;
                                                    } else {
                                                        return ((jCount * (iCenterSpacing + 15))
                                                         + iLeftAlignSpacing + pxLiteral);

                                                    }
                                                });
                                            axisKPILabel.append("title").text(titleText);
                                            axisKPILabel.append("div")
                                                .append("text").text(text)
                                                .style({
                                                    "color": "#fff",
                                                    "stroke-width": Gantt.axisLabelStrokeWidth,
                                                }).style("font-size", kpiFontSize + pxLiteral)
                                                .style("margin-left", (): string => {
                                                    if (text === undefined) {
                                                        return (Gantt.kpiLabelWidth / totalKPIs * jCount)
                                                         + iLeftSpacing + pxLiteral;
                                                    } else {
                                                        return iLeftSpacing + pxLiteral;

                                                    }
                                                });
                                            axisKPILabel.append("title").text(titleText);
                                        } else {
                                            // tslint:disable-next-line:no-any
                                            let axisKPILabel: any;
                                            axisKPILabel = kpiDisplayDiv
                                                .append("div")
                                                .classed("textValue", true)
                                                .append("text");
                                            let iLeftSpacing: number = 5;
                                            let clippedText: string;
                                            if (typeof currentLevel.KPIValues[jCount].value === "number") {
                                                clippedText = currentLevel.KPIValues[jCount].value.toString();
                                                kpiDisplayDiv.append("text")
                                                    .text(clippedText)
                                                    .classed("singleCharacter", true)
                                                    .style({
                                                        "font-family": taskLabelsFontFamily,
                                                        "font-size": normalizer + pxLiteral
                                                    });
                                                // tslint:disable-next-line:no-any
                                                const singleCharacterLocal: any = $(".singleCharacter");
                                                let textTotalWidth: number;
                                                textTotalWidth = singleCharacterLocal.innerWidth();
                                                let numberOfCharactersAllowed: number;
                                                numberOfCharactersAllowed = Math.floor(
                                                    (Gantt.kpiLabelWidth / totalKPIs)
                                                     / (textTotalWidth / clippedText.length));
                                                if (clippedText.length > numberOfCharactersAllowed) {
                                                    singleCharacterLocal.text(clippedText
                                                        .substring(0, numberOfCharactersAllowed - 2) + ellipsisLiteral);
                                                    textTotalWidth = singleCharacterLocal.innerWidth();
                                                    let iCount: number = 0;
                                                    while (textTotalWidth < width) {
                                                        iCount++;
                                                        // tslint:disable-next-line:max-line-length
                                                        singleCharacterLocal.text(clippedText.substring(0, numberOfCharactersAllowed - 2 + iCount) + ellipsisLiteral);
                                                        textTotalWidth = singleCharacterLocal.innerWidth();
                                                    }
                                                } else {
                                                    iLeftSpacing = Gantt.kpiLabelWidth / totalKPIs - textTotalWidth - 5;
                                                }
                                                singleCharacterLocal.remove();
                                            }
                                            axisKPILabel.attr({
                                                "margin-top": thisObj.getTaskLabelCoordinateY(tasknumber) + pxLiteral,
                                                "stroke-width": Gantt.axisLabelStrokeWidth
                                            }).style("font-size", kpiFontSize + pxLiteral)
                                                // tslint:disable-next-line:typedef
                                                .style("margin-left", () => {
                                                    if (clippedText === undefined) {
                                                        return (Gantt.kpiLabelWidth / totalKPIs * jCount)
                                                         + iLeftSpacing + pxLiteral;
                                                    } else {
                                                        return ((jCount * (iCenterSpacing + 10))
                                                         + iCenterSpacing + pxLiteral);
                                                    }
                                                });
                                            axisKPILabel.text(Gantt
                                                .getKPIValues(currentLevel.KPIValues[jCount], "text"));
                                            axisKPILabel.append("title")
                                            .text(Gantt.getKPIValues(currentLevel.KPIValues[jCount], "title"));
                                        }
                                    }
                                }
                            }
                            if (!Gantt.isDateData) {
                                // tslint:disable-next-line:no-any
                                const currentLevel1: ITask = tasks[tasknumber];
                                // tslint:disable-next-line:no-any
                                const barBackgroundDiv: any = this.barDiv
                                    .append("div")
                                    .classed("parentDiv", true)
                                    .datum(currentLevel1)
                                    .attr({
                                        "data-ParentId": tasks[tasknumber].parentId,
                                        "data-RowId": tasks[tasknumber].rowId,
                                        "data-expanded": tasks[tasknumber].expanded,
                                        "data-isLeaf": tasks[tasknumber].isLeaf,
                                        "data-level": tasks[tasknumber].level,
                                        "data-row": tasknumber
                                    })
                                    .style({
                                        "border-bottom": "0.011px",
                                        "height": "24px",
                                        "margin-left": 0 + pxLiteral,
                                        "width": parseInt(d3.select(".gantt_barSvg").attr("width"), 10) + pxLiteral
                                    });
                                if (categoryLen === 4) {
                                    if (leveLength === 1) {
                                        barBackgroundDiv.style({
                                            "background-color": parentColour,
                                            "opacity": opacityNumber1
                                        });
                                    } else if (leveLength === 2) {
                                        barBackgroundDiv.style({
                                            "background-color": firstChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    } else if (leveLength === 3) {
                                        barBackgroundDiv.style({
                                            "background-color": secondChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    } else if (leveLength === 4) {
                                        barBackgroundDiv.style({
                                            "background-color": thirdChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    }
                                } else if (categoryLen === 3) {
                                    if (leveLength === 1) {
                                        barBackgroundDiv.style({
                                            "background-color": firstChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    } else if (leveLength === 2) {
                                        barBackgroundDiv.style({
                                            "background-color": secondChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    } else if (leveLength === 3) {
                                        barBackgroundDiv.style({
                                            "background-color": thirdChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    }
                                } else if (categoryLen === 2) {
                                    if (leveLength === 1) {
                                        barBackgroundDiv.style({
                                            "background-color": secondChildColour,
                                            "opacity": opacityNumber2
                                        });
                                    } else if (leveLength === 2) {
                                        barBackgroundDiv.style({
                                            "background-color": thirdChildColour,
                                            "opacity": opacityNumber2
                                        });
                                    }
                                } else {
                                    const backgroundBarColor: string = tasknumber % 2 === 0 ?
                                     thirdChildColour : firstChildColour;
                                    barBackgroundDiv.style({
                                        "background-color": backgroundBarColor,
                                        "opacity": opacityNumber2
                                    });
                                }
                                // tslint:disable-next-line:no-any
                                let taskRect: any;
                                taskRect = this.barDiv
                                    .append("div")
                                    .classed("taskRect", true)
                                    .datum(currentLevel)
                                    .classed("show", true)
                                    .attr({
                                        "data-ParentId": tasks[tasknumber].parentId,
                                        "data-RowId": tasks[tasknumber].rowId,
                                        "data-expanded": tasks[tasknumber].expanded,
                                        "data-isLeaf": tasks[tasknumber].isLeaf,
                                        "data-level": tasks[tasknumber].level,
                                        "data-row": tasknumber
                                    });
                                let yPos: number;
                                yPos = Gantt.getBarYCoordinate(tasknumber) + 13 + Gantt.taskResourcePadding;
                                let xPos: number;
                                xPos = 0;
                                let xPosStart: number;
                                xPosStart = 0;
                                // tslint:disable-next-line:typedef
                                let obj = {};
                                let level1: number = 0;
                                let parentRowId: number = 0;
                                const rowId: number = 0;
                                // tslint:disable-next-line:no-any
                                let selobjchildrencncierarchy: any = [];
                                if (currentLevel.numEnd !== null || currentLevel.numStart !== null) {
                                    if (isNaN(thisObj.taskDurationToWidth1(currentLevel))
                                        // tslint:disable-next-line:no-any
                                        || isNaN(thisObj.timeScale(currentLevel.numStart as any))) {
                                        taskRect
                                            .style({
                                                // tslint:disable-next-line:no-any
                                                "background-color": currentLevel.color,
                                                "height": Gantt.getBarHeight() / 1.5 + pxLiteral,
                                                "margin-left": 39 + pxLiteral,
                                                "margin-top": "-21.4444444px",
                                                "opacity": 1,
                                                "position": "absolute",
                                                "width": 3 + pxLiteral
                                            })
                                            // tslint:disable-next-line:typedef
                                            .on("click", function() {
                                                // tslint:disable-next-line:typedef
                                                function getDirectChildInHierarchy(sRowID) {
                                                    // tslint:disable-next-line:typedef
                                                    $.map(tasks, (sObj) => {
                                                        if (sObj.parentId === sRowID) {
                                                            selobjchildrencncierarchy.push(sObj);
                                                            getDirectChildInHierarchy(sObj.rowId);
                                                        }
                                                    });

                                                    return selobjchildrencncierarchy;
                                                }
                                                for (const i of tasks) {
                                                    if (currentLevel.id === i.id) {
                                                        obj = i;
                                                        level1 = i.level;
                                                        parentRowId = i.rowId;
                                                        selobjchildrencncierarchy.push(i);
                                                        selobjchildrencncierarchy =
                                                         getDirectChildInHierarchy(parentRowId);
                                                        // tslint:disable-next-line:no-any
                                                        const selectionId: any = i.selectionId;
                                                        if (Gantt.lastSelectedbar === null) {
                                                            Gantt.lastSelectedbar =
                                                             parseInt(d3.select(this).attr("data-rowid"), 10);
                                                            thisObj.selectionManager
                                                            .select(selectionId).then((ids: ISelectionId[]) => {
                                                                if ($(this).attr("data-isleaf").toString() === "true") {
                                                                    let j: number = 0;
                                                                    d3.selectAll(".taskRect.show")
                                                                    .classed("selected", false);
                                                                    d3.selectAll(".taskRect.show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    d3.selectAll(".gantt_taskPanel .show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    for (let kpiindex: number = 0;
                                                                         kpiindex < tasks.length; kpiindex++) {
                                                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[kpiindex])
                                                                            .css({ opacity: 0.3 });
                                                                    }
                                                                    d3.select(this)
                                                                        .classed("selected", true)
                                                                        .style({
                                                                            opacity: 1
                                                                        });
                                                                    // tslint:disable-next-line:no-shadowed-variable
                                                                    for (let i: number = 0; i < tasks.length; i++) {
                                                                        // tslint:disable-next-line:max-line-length
                                                                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) ===
                                                                            selobjchildrencncierarchy[j].rowId) {
                                                                            // tslint:disable-next-line:typedef
                                                                            const thisk =
                                                                             $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                                .css("opacity", "1");
                                                                            thisk.addClass("selected");
                                                                            // tslint:disable-next-line:typedef
                                                                            const thiskk =
                                                                             $(d3.selectAll(".gantt_taskPanel .show"));
                                                                            $(thiskk[0][i]).css("opacity", "1");
                                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[i])
                                                                                .css({ opacity: 1 });
                                                                            j++;
                                                                        }
                                                                        if (j === selobjchildrencncierarchy.length) {
                                                                            break;
                                                                        }
                                                                    }
                                                                } else {
                                                                    let j: number = 0;
                                                                    d3.selectAll(".taskRect.show").style({
                                                                        opacity: 0.3
                                                                    })
                                                                        .classed("selected", false);
                                                                    d3.selectAll(".gantt_taskPanel .show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    for (let kpiindex: number = 0;
                                                                         kpiindex < tasks.length; kpiindex++) {
                                                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[kpiindex])
                                                                            .css({ opacity: 0.3 });
                                                                    }
                                                                    // tslint:disable-next-line:no-shadowed-variable
                                                                    for (let i: number = 0; i < tasks.length; i++) {
                                                                        // tslint:disable-next-line: max-line-length
                                                                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                                                                            // tslint:disable-next-line:typedef
                                                                            const thisk =
                                                                            $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                                .css("opacity", "1");
                                                                            thisk.addClass("selected");
                                                                            // tslint:disable-next-line:typedef
                                                                            const thiskk =
                                                                             $(d3.selectAll(".gantt_taskPanel .show"));
                                                                            $(thiskk[0][i]).css("opacity", "1")
                                                                                .addClass("selected");
                                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                                .children()[i]).css({ opacity: 1 });
                                                                            j++;
                                                                        }
                                                                        if (j === selobjchildrencncierarchy.length) {
                                                                            break;
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                        } else if (Gantt.lastSelectedbar === parseInt(d3.select(this)
                                                            .attr("data-rowid"), 10)) {
                                                            thisObj.selectionManager.clear();
                                                            d3.selectAll(".taskRect.show").classed("selected", false);
                                                            d3.selectAll(".taskRect.show").style({
                                                                opacity: 1
                                                            });
                                                            d3.selectAll(".gantt_taskPanel .show").style({
                                                                opacity: 1
                                                            });
                                                            for (let kpiindex: number = 0;
                                                                 kpiindex < tasks.length; kpiindex++) {
                                                                $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                    .children()[kpiindex]).css({ opacity: 1 });
                                                            }
                                                            Gantt.lastSelectedbar = null;
                                                        } else {
                                                            Gantt.lastSelectedbar =
                                                             parseInt(d3.select(this).attr("data-rowid"), 10);
                                                            let j: number = 0;
                                                            thisObj.selectionManager.select(selectionId)
                                                            .then((ids: ISelectionId[]) => {
                                                                if ($(this)
                                                                .attr("data-isleaf").toString() === "true") {
                                                                    d3.selectAll(".taskRect.show")
                                                                    .classed("selected", false);
                                                                    d3.selectAll(".taskRect.show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    d3.selectAll(".gantt_taskPanel .show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    for (let kpiindex: number = 0;
                                                                         kpiindex < tasks.length; kpiindex++) {
                                                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[kpiindex])
                                                                            .css({ opacity: 0.3 });
                                                                    }
                                                                    d3.select(this)
                                                                        .classed("selected", true)
                                                                        .style({
                                                                            opacity: 1
                                                                        });
                                                                    // tslint:disable-next-line:no-shadowed-variable
                                                                    for (let i: number = 0; i < tasks.length; i++) {
                                                                        // tslint:disable-next-line:max-line-length
                                                                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) ===
                                                                            selobjchildrencncierarchy[j].rowId) {
                                                                            // tslint:disable-next-line:typedef
                                                                            const thisk =
                                                                             $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                                .css("opacity", "1");
                                                                            thisk.addClass("selected");
                                                                            // tslint:disable-next-line:typedef
                                                                            const thiskk =
                                                                             $(d3.selectAll(".gantt_taskPanel .show"));
                                                                            $(thiskk[0][i]).css("opacity", "1");
                                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[i])
                                                                                .css({ opacity: 1 });
                                                                            j++;
                                                                        }
                                                                        if (j === selobjchildrencncierarchy.length) {
                                                                            break;
                                                                        }
                                                                    }
                                                                } else {
                                                                    let selobjindex: number = 0;
                                                                    d3.selectAll(".taskRect.show").style({
                                                                        opacity: 0.3
                                                                    })
                                                                        .classed("selected", false);
                                                                    d3.selectAll(".gantt_taskPanel .show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    for (let kpiindex: number = 0;
                                                                         kpiindex < tasks.length; kpiindex++) {
                                                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[kpiindex])
                                                                            .css({ opacity: 0.3 });
                                                                    }
                                                                    // tslint:disable-next-line:no-shadowed-variable
                                                                    for (let i: number = 0; i < tasks.length; i++) {
                                                                        // tslint:disable-next-line
                                                                        if (parseInt($(d3.selectAll('.taskRect.show')[0][i]).attr('data-rowid'), 10) === selobjchildrencncierarchy[selobjindex].rowId) {
                                                                            // tslint:disable-next-line:typedef
                                                                            const thisk =
                                                                             $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                                .css("opacity", "1");
                                                                            thisk.addClass("selected");
                                                                            // tslint:disable-next-line:typedef
                                                                            const thiskk =
                                                                             $(d3.selectAll(".gantt_taskPanel .show"));
                                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[i])
                                                                                .css({ opacity: 1 });
                                                                            $(thiskk[0][i]).css("opacity", "1");
                                                                            selobjindex++;
                                                                        }
                                                                        if (selobjindex ===
                                                                             selobjchildrencncierarchy.length) {
                                                                            break;
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                                (d3.event as Event).stopPropagation();
                                            });
                                    } else {
                                        taskRect
                                            .style({
                                                // tslint:disable-next-line:no-any
                                                "background-color": currentLevel.color,
                                                "height": Gantt.getBarHeight() / 1.5 + pxLiteral,
                                                "margin-left": thisObj.timeScale(currentLevel.numStart as any)
                                                 + 39 + pxLiteral,
                                                 "margin-top": "-21.4444444px",
                                                 "opacity": 1,
                                                 "position": "absolute",
                                                "width": 0 === thisObj.taskDurationToWidth1(currentLevel) ? 3
                                                 + pxLiteral :
                                                    thisObj.taskDurationToWidth1(currentLevel) + pxLiteral
                                            })
                                            // tslint:disable-next-line:typedef
                                            .on("click", function() {
                                                // tslint:disable-next-line:typedef
                                                function getDirectChildInHierarchy(sRowID) {
                                                    // tslint:disable-next-line:typedef
                                                    $.map(tasks, (sObj) => {
                                                        if (sObj.parentId === sRowID) {
                                                            selobjchildrencncierarchy.push(sObj);
                                                            getDirectChildInHierarchy(sObj.rowId);
                                                        }
                                                    });

                                                    return selobjchildrencncierarchy;
                                                }
                                                for (const i of tasks) {
                                                    if (currentLevel.id === i.id) {
                                                        obj = i;
                                                        level1 = i.level;
                                                        parentRowId = i.rowId;
                                                        selobjchildrencncierarchy.push(i);
                                                        selobjchildrencncierarchy =
                                                         getDirectChildInHierarchy(parentRowId);
                                                        // tslint:disable-next-line:no-any
                                                        const selectionId: any = i.selectionId;
                                                        if (Gantt.lastSelectedbar === null) {
                                                            Gantt.lastSelectedbar =
                                                             parseInt(d3.select(this).attr("data-rowid"), 10);
                                                            thisObj.selectionManager
                                                            .select(selectionId).then((ids: ISelectionId[]) => {
                                                                if ($(this).attr("data-isleaf").toString() === "true") {
                                                                    let j: number = 0;
                                                                    d3.selectAll(".taskRect.show")
                                                                    .classed("selected", false);
                                                                    d3.selectAll(".taskRect.show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    d3.selectAll(".gantt_taskPanel .show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    for (let kpiindex: number = 0;
                                                                         kpiindex < tasks.length; kpiindex++) {
                                                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[kpiindex])
                                                                            .css({ opacity: 0.3 });
                                                                    }
                                                                    d3.select(this)
                                                                        .classed("selected", true)
                                                                        .style({
                                                                            opacity: 1
                                                                        });
                                                                    // tslint:disable-next-line:no-shadowed-variable
                                                                    for (let i: number = 0; i < tasks.length; i++) {
                                                                        // tslint:disable-next-line: max-line-length
                                                                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                                                                            // tslint:disable-next-line:typedef
                                                                            const thisk =
                                                                             $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                                .css("opacity", "1");
                                                                            thisk.addClass("selected");
                                                                            // tslint:disable-next-line:typedef
                                                                            const thiskk =
                                                                             $(d3.selectAll(".gantt_taskPanel .show"));
                                                                            $(thiskk[0][i])
                                                                            .css("opacity", "1");
                                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[i])
                                                                                .css({ opacity: 1 });
                                                                            j++;
                                                                        }
                                                                        if (j === selobjchildrencncierarchy.length) {
                                                                            break;
                                                                        }
                                                                    }
                                                                } else {
                                                                    let j: number = 0;
                                                                    d3.selectAll(".taskRect.show").style({
                                                                        opacity: 0.3
                                                                    })
                                                                        .classed("selected", false);
                                                                    d3.selectAll(".gantt_taskPanel .show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    for (let kpiindex: number = 0;
                                                                         kpiindex < tasks.length; kpiindex++) {
                                                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                        .children()[kpiindex])
                                                                            .css({ opacity: 0.3 });
                                                                    }
                                                                    // tslint:disable-next-line:no-shadowed-variable
                                                                    for (let i: number = 0; i < tasks.length; i++) {
                                                                        // tslint:disable-next-line: max-line-length
                                                                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                                                                            // tslint:disable-next-line:typedef
                                                                            const thisk =
                                                                             $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                                .css("opacity", "1");
                                                                            thisk.addClass("selected");
                                                                            // tslint:disable-next-line:typedef
                                                                            const thiskk =
                                                                             $(d3.selectAll(".gantt_taskPanel .show"));
                                                                            $(thiskk[0][i]).css("opacity", "1")
                                                                                .addClass("selected");
                                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[i])
                                                                                .css({ opacity: 1 });
                                                                            j++;
                                                                        }
                                                                        if (j === selobjchildrencncierarchy.length) {
                                                                            break;
                                                                        }
                                                                    }
                                                                    selobjchildrencncierarchy = [];
                                                                }
                                                            });
                                                        } else if (Gantt.lastSelectedbar === parseInt(d3.select(this)
                                                            .attr("data-rowid"), 10)) {
                                                            thisObj.selectionManager.clear();
                                                            d3.selectAll(".taskRect.show").classed("selected", false);
                                                            d3.selectAll(".taskRect.show").style({
                                                                opacity: 1
                                                            });
                                                            d3.selectAll(".gantt_taskPanel .show").style({
                                                                opacity: 1
                                                            });
                                                            for (let kpiindex: number = 0;
                                                                 kpiindex < tasks.length; kpiindex++) {
                                                                $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                .children()[kpiindex])
                                                                    .css({ opacity: 1 });
                                                            }
                                                            Gantt.lastSelectedbar = null;
                                                        } else {
                                                            Gantt.lastSelectedbar =
                                                             parseInt(d3.select(this).attr("data-rowid"), 10);
                                                            let j: number = 0;
                                                            thisObj.selectionManager
                                                            .select(selectionId).then((ids: ISelectionId[]) => {
                                                                if ($(this)
                                                                .attr("data-isleaf").toString() === "true") {
                                                                    d3.selectAll(".taskRect.show")
                                                                    .classed("selected", false);
                                                                    d3.selectAll(".taskRect.show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    d3.selectAll(".gantt_taskPanel .show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    for (let kpiindex: number = 0;
                                                                         kpiindex < tasks.length; kpiindex++) {
                                                                        $($(
                                                                            d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[kpiindex])
                                                                            .css({ opacity: 0.3 });
                                                                    }
                                                                    d3.select(this)
                                                                        .classed("selected", true)
                                                                        .style({
                                                                            opacity: 1
                                                                        });
                                                                    // tslint:disable-next-line:no-shadowed-variable
                                                                    for (let i: number = 0; i < tasks.length; i++) {
                                                                        // tslint:disable-next-line: max-line-length
                                                                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                                                                            // tslint:disable-next-line:typedef
                                                                            const thisk =
                                                                             $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                                .css("opacity", "1");
                                                                            thisk.addClass("selected");
                                                                            // tslint:disable-next-line:typedef
                                                                            const thiskk =
                                                                             $(d3.selectAll(".gantt_taskPanel .show"));
                                                                            $(thiskk[0][i]).css("opacity", "1");
                                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[i])
                                                                                .css({ opacity: 1 });
                                                                            j++;
                                                                        }
                                                                        if (j === selobjchildrencncierarchy.length) {
                                                                            break;
                                                                        }
                                                                    }
                                                                } else {
                                                                    let selobjindex: number = 0;
                                                                    d3.selectAll(".taskRect.show").style({
                                                                        opacity: 0.3
                                                                    })
                                                                        .classed("selected", false);
                                                                    d3.selectAll(".gantt_taskPanel .show").style({
                                                                        opacity: 0.3
                                                                    });
                                                                    for (let kpiindex: number = 0;
                                                                         kpiindex < tasks.length; kpiindex++) {
                                                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                        .children()[kpiindex])
                                                                            .css({ opacity: 0.3 });
                                                                    }
                                                                    // tslint:disable-next-line:no-shadowed-variable
                                                                    for (let i: number = 0; i < tasks.length; i++) {
                                                                        // tslint:disable-next-line:max-line-length
                                                                        if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) === selobjchildrencncierarchy[selobjindex].rowId) {
                                                                            // tslint:disable-next-line:typedef
                                                                            const thisk =
                                                                            $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                                .css("opacity", "1");
                                                                            thisk.addClass("selected");
                                                                            // tslint:disable-next-line:typedef
                                                                            const thiskk =
                                                                             $(d3.selectAll(".gantt_taskPanel .show"));
                                                                            $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                            .children()[i])
                                                                                .css({ opacity: 1 });
                                                                            $(thiskk[0][i]).css("opacity", "1");
                                                                            selobjindex++;
                                                                        }
                                                                        if (selobjindex ===
                                                                            selobjchildrencncierarchy.length) {
                                                                            break;
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                                (d3.event as Event).stopPropagation();
                                            });
                                    }
                                    yPos = Gantt.getBarYCoordinate(tasknumber)
                                     + Gantt.getBarHeight() / 2 + Gantt.taskResourcePadding;
                                    // tslint:disable-next-line:no-any
                                    if (xPos < thisObj.timeScale(currentLevel.numEnd as any)) {
                                        // tslint:disable-next-line:no-any
                                        xPos = thisObj.timeScale(currentLevel.numEnd as any);
                                        // tslint:disable-next-line:no-any
                                        xPosStart = thisObj.timeScale(currentLevel.numStart as any);
                                    }
                                    // tslint:disable-next-line:no-any
                                    if (xPos < thisObj.timeScale(currentLevel.numEnd as any)) {
                                        // tslint:disable-next-line:no-any
                                        xPos = thisObj.timeScale(currentLevel.numEnd as any);
                                        // tslint:disable-next-line:no-any
                                        xPosStart = thisObj.timeScale(currentLevel.numStart as any);
                                    }

                                    thisObj.renderTooltip(taskRect);
                                    let labelnormalizer: number;
                                    labelnormalizer = (thisObj.viewModel.settings.taskResource.fontSize > 20) ? 20
                                        : thisObj.viewModel.settings.taskResource.fontSize;
                                    if (taskResourceShow) {
                                        // tslint:disable-next-line:no-any
                                        let taskResource: any;
                                        taskResource = barBackgroundDiv
                                            .append("text")
                                            .classed(Selectors.taskResource.className
                                                 + spaceLiteral + taskRowLiteral + tasknumber, true);

                                        Gantt.datalabelValueFormatter = ValueFormatter.create({
                                            format: measureFormat ? measureFormat : ValueFormatter.DefaultNumericFormat
                                        });
                                        if (currentLevel.resource != null) {
                                            currentLevel.resource =
                                             Gantt.datalabelValueFormatter.format(currentLevel.resource);
                                        } else {
                                            currentLevel.resource = "";
                                        }
                                        const titleWidth: number = $(".resourceLabelText").innerWidth() * 0.7;
                                        d3.selectAll(".resourceLabelText").remove();
                                        let xPosVal: number = 0;
                                        // tslint:disable-next-line:prefer-template
                                        const barStartpt: string =
                                         $('div.taskRect[data-row = "' + tasknumber + '"]').css("margin-left");
                                        // tslint:disable-next-line:radix
                                        const barStartpt1: number = parseInt(barStartpt.substring(0,
                                             barStartpt.length - 2));
                                        // tslint:disable-next-line:prefer-template
                                        const barEndpt: string =
                                         $('div.taskRect[data-row = "' + tasknumber + '"]').css("width");
                                        // tslint:disable-next-line:radix
                                        const barEndpt1: number = parseInt(barEndpt.substring(0, barEndpt.length - 2));
                                        switch (thisObj.viewModel.settings.taskResource.position.toLowerCase()) {
                                            case "center":
                                                xPosVal = ((barStartpt1 + (barEndpt1 / 2)));
                                                break;
                                            case "left":
                                                xPosVal = barStartpt1 - 10;
                                                break;
                                            case "right":
                                            default:
                                                xPosVal = barStartpt1 + barEndpt1 + 5;
                                                break;
                                        }
                                        taskResource
                                            .style({
                                                "margin-left": xPosVal + pxLiteral
                                            })
                                            .text(currentLevel.resource)
                                            .style({
                                                "color": taskResourceColor,
                                                "font-family": dataLabelsFontFamily,
                                                "font-size": labelnormalizer + pxLiteral
                                            });
                                        taskResource.append("title").text(currentLevel.resource);
                                    }
                                }
                            } else {
                                // tslint:disable-next-line:no-shadowed-variable
                                let currentLevel: ITask;
                                currentLevel = tasks[tasknumber];
                                // tslint:disable-next-line:no-any
                                let barBackgroundDiv: any;
                                barBackgroundDiv = thisObj.barDiv.append("div")
                                    .classed("parentDiv", true)
                                    .datum(currentLevel)
                                    .style({
                                        "background-color": "grey",
                                        "border-bottom": "0.011px",
                                        "height": "24px",
                                        "margin-left": 0 + pxLiteral,
                                        "margin-top": thisObj.getTaskLabelCoordinateY(tasknumber) - 17,
                                        "width": parseInt(d3.select(".gantt_barSvg").attr("width"), 10) + pxLiteral,
                                    })
                                    .datum(currentLevel)
                                    .classed("show", true)
                                    .attr({
                                        "data-ParentId": tasks[tasknumber].parentId,
                                        "data-RowId": tasks[tasknumber].rowId,
                                        "data-expanded": tasks[tasknumber].expanded,
                                        "data-isLeaf": tasks[tasknumber].isLeaf,
                                        "data-level": tasks[tasknumber].level,
                                        "data-row": tasknumber
                                    });
                                if (categoryLen === 4) {
                                    if (leveLength === 1) {
                                        barBackgroundDiv.style({
                                            "background-color": parentColour,
                                            "opacity": opacityNumber1
                                        });
                                    } else if (leveLength === 2) {
                                        barBackgroundDiv.style({
                                            "background-color": firstChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    } else if (leveLength === 3) {
                                        barBackgroundDiv.style({
                                            "background-color": secondChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    } else if (leveLength === 4) {
                                        barBackgroundDiv.style({
                                            "background-color": thirdChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    }
                                } else if (categoryLen === 3) {
                                    if (leveLength === 1) {
                                        barBackgroundDiv.style({
                                            "background-color": firstChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    } else if (leveLength === 2) {
                                        barBackgroundDiv.style({
                                            "background-color": secondChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    } else if (leveLength === 3) {
                                        barBackgroundDiv.style({
                                            "background-color": thirdChildColour,
                                            "opacity": opacityNumber1
                                        });
                                    }
                                } else if (categoryLen === 2) {
                                    if (leveLength === 1) {
                                        barBackgroundDiv.style({
                                            "background-color": secondChildColour,
                                            "opacity": opacityNumber2
                                        });
                                    } else if (leveLength === 2) {
                                        barBackgroundDiv.style({
                                            "background-color": thirdChildColour,
                                            "opacity": opacityNumber2
                                        });
                                    }
                                } else {
                                    const backgroundBarColor: string
                                     = tasknumber % 2 === 0 ? thirdChildColour : firstChildColour;
                                    barBackgroundDiv.style({
                                        "background-color": backgroundBarColor,
                                        "opacity": opacityNumber2
                                    });
                                }
                                // tslint:disable-next-line:no-any
                                let taskRect: any;
                                taskRect = this.barDiv
                                    .append("div")
                                    .classed("taskRect", true)
                                    .datum(currentLevel);
                                let yPos: number;
                                yPos = Gantt.getBarYCoordinate(tasknumber) + 13 + Gantt.taskResourcePadding;
                                let xPos: number;
                                xPos = 0;
                                let xPosStart: number;
                                xPosStart = 0;
                                // tslint:disable-next-line:typedef
                                let obj = {};
                                let level1: number = 0;
                                let parentRowId: number = 0;
                                const rowId: number = 0;
                                taskRect
                                    .classed("show", true)
                                    .attr({
                                        "data-ParentId": tasks[tasknumber].parentId,
                                        "data-RowId": tasks[tasknumber].rowId,
                                        "data-expanded": tasks[tasknumber].expanded,
                                        "data-isLeaf": tasks[tasknumber].isLeaf,
                                        "data-level": tasks[tasknumber].level,
                                        "data-row": tasknumber
                                    })
                                    .style({
                                        "background-color": currentLevel.color,
                                        "height": Gantt.getBarHeight() / 1.5 + pxLiteral,
                                        "margin-left": thisObj.timeScale(currentLevel.start) + 37 + pxLiteral,
                                        "margin-top": "-21.4444444px",
                                        "opacity": 1,
                                        "position": "absolute",
                                        "width": 0 === thisObj.taskDurationToWidth(currentLevel) ? 3 +
                                            pxLiteral : thisObj.taskDurationToWidth(currentLevel) + pxLiteral
                                    })
                                    // tslint:disable-next-line:typedef
                                    .on("click", function() {
                                        // tslint:disable-next-line:no-any
                                        let selobjchildrencncierarchy: any = [];
                                        // tslint:disable-next-line:typedef
                                        function getDirectChildInHierarchy(sRowID) {
                                            // tslint:disable-next-line:typedef
                                            $.map(tasks, (sObj) => {
                                                if (sObj.parentId === sRowID) {
                                                    selobjchildrencncierarchy.push(sObj);
                                                    getDirectChildInHierarchy(sObj.rowId);
                                                }
                                            });

                                            return selobjchildrencncierarchy;
                                        }
                                        for (let i: number = 0; i < tasks.length; i++) {
                                            if (currentLevel.id === tasks[i].id) {
                                                obj = tasks[i];
                                                level1 = tasks[i].level;
                                                parentRowId = tasks[i].rowId;
                                                selobjchildrencncierarchy.push(tasks[i]);
                                                selobjchildrencncierarchy = getDirectChildInHierarchy(parentRowId);
                                                // tslint:disable-next-line:no-any
                                                const selectionId: any = tasks[i].selectionId;
                                                if (Gantt.lastSelectedbar === null) {
                                                    Gantt.lastSelectedbar =
                                                     parseInt(d3.select(this).attr("data-rowid"), 10);
                                                    thisObj.selectionManager.select(selectionId)
                                                    .then((ids: ISelectionId[]) => {
                                                        if ($(this).attr("data-isleaf").toString() === "true") {
                                                            let j: number = 0;
                                                            d3.selectAll(".taskRect.show").classed("selected", false);
                                                            d3.selectAll(".taskRect.show").style({
                                                                opacity: 0.3
                                                            });
                                                            d3.selectAll(".gantt_taskPanel .show").style({
                                                                opacity: 0.3
                                                            });
                                                            d3.select(this)
                                                                .classed("selected", true)
                                                                .style({
                                                                    opacity: 1
                                                                });
                                                            for (let kpiindex: number = 0;
                                                                 kpiindex < tasks.length; kpiindex++) {
                                                                $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                    .children()[kpiindex]).css({ opacity: 0.3 });
                                                            }
                                                            // tslint:disable-next-line:max-line-length
                                                            for (let indexselctedobj: number = 0; indexselctedobj < tasks.length; indexselctedobj++) {
                                                                // tslint:disable-next-line:max-line-length
                                                                if (parseInt($(d3.selectAll(".taskRect.show")[0][indexselctedobj]).attr("data-rowid"), 10) === selobjchildrencncierarchy[j].rowId) {
                                                                    // tslint:disable-next-line:typedef
                                                                    const thiskk =
                                                                     $(d3.selectAll(".gantt_taskPanel .show"));
                                                                    $(thiskk[0][indexselctedobj]).css("opacity", "1")
                                                                        .addClass("selected");
                                                                    $($(d3.selectAll
                                                                        (".gantt_kpiPanel")[0][0]).children()[i])
                                                                        .css({ opacity: 1 });
                                                                    j++;
                                                                }
                                                                if (j === selobjchildrencncierarchy.length) {
                                                                    break;
                                                                }
                                                            }
                                                        } else {
                                                            let j: number = 0;
                                                            d3.selectAll(".taskRect.show").style({
                                                                opacity: 0.3
                                                            })
                                                                .classed("selected", false);
                                                            d3.selectAll(".gantt_taskPanel .show").style({
                                                                opacity: 0.3
                                                            });
                                                            for (let kpiindex: number = 0;
                                                                 kpiindex < tasks.length; kpiindex++) {
                                                                // tslint:disable-next-line:max-line-length
                                                                $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                                            }
                                                            // tslint:disable-next-line:no-shadowed-variable
                                                            for (let i: number = 0; i < tasks.length; i++) {
                                                                // tslint:disable-next-line:max-line-length
                                                                if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) ===
                                                                    selobjchildrencncierarchy[j].rowId) {
                                                                    // tslint:disable-next-line:typedef
                                                                    const thisk =
                                                                     $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                        .css("opacity", "1");
                                                                    thisk.addClass("selected");
                                                                    // tslint:disable-next-line:typedef
                                                                    const thiskk =
                                                                     $(d3.selectAll(".gantt_taskPanel .show"));
                                                                    $(thiskk[0][i]).css("opacity", "1")
                                                                        .addClass("selected");
                                                                    $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                    .children()[i])
                                                                        .css({ opacity: 1 });
                                                                    j++;
                                                                }
                                                                if (j === selobjchildrencncierarchy.length) {
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    });
                                                } else if (Gantt.lastSelectedbar ===
                                                     parseInt(d3.select(this).attr("data-rowid"), 10)) {
                                                    thisObj.selectionManager.clear();
                                                    d3.selectAll(".taskRect.show").classed("selected", false);
                                                    d3.selectAll(".taskRect.show").style({
                                                        opacity: 1
                                                    });
                                                    d3.selectAll(".gantt_taskPanel .show").style({
                                                        opacity: 0.8
                                                    });
                                                    for (let kpiindex: number = 0;
                                                         kpiindex < tasks.length; kpiindex++) {
                                                        $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                            .children()[kpiindex]).css({ opacity: 0.8 });
                                                    }
                                                    Gantt.lastSelectedbar = null;
                                                } else {
                                                    Gantt.lastSelectedbar = parseInt(d3.select(this)
                                                    .attr("data-rowid"), 10);
                                                    thisObj.selectionManager.select(selectionId)
                                                    .then((ids: ISelectionId[]) => {
                                                        if ($(this).attr("data-isleaf").toString() === "true") {
                                                            let j: number = 0;
                                                            d3.selectAll(".taskRect.show").classed("selected", false);
                                                            d3.selectAll(".taskRect.show").style({
                                                                opacity: 0.3
                                                            });
                                                            d3.selectAll(".gantt_taskPanel .show").style({
                                                                opacity: 0.3
                                                            });
                                                            d3.select(this)
                                                                .classed("selected", true)
                                                                .style({
                                                                    opacity: 1
                                                                });
                                                            for (let kpiindex: number = 0;
                                                                 kpiindex < tasks.length; kpiindex++) {
                                                                // tslint:disable-next-line:max-line-length
                                                                $($(d3.selectAll(".gantt_kpiPanel")[0][0]).children()[kpiindex]).css({ opacity: 0.3 });
                                                            }
                                                            // tslint:disable-next-line:no-shadowed-variable
                                                            for (let i: number = 0; i < tasks.length; i++) {
                                                                // tslint:disable-next-line:max-line-length
                                                                if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) ===
                                                                    selobjchildrencncierarchy[j].rowId) {
                                                                    // tslint:disable-next-line:typedef
                                                                    const thisk =
                                                                     $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                        .css("opacity", "1");
                                                                    thisk.addClass("selected");
                                                                    // tslint:disable-next-line:typedef
                                                                    const thiskk =
                                                                     $(d3.selectAll(".gantt_taskPanel .show"));
                                                                    $(thiskk[0][i]).css("opacity", "1");
                                                                    $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                    .children()[i])
                                                                        .css({ opacity: 1 });
                                                                    j++;
                                                                }
                                                                if (j === selobjchildrencncierarchy.length) {
                                                                    break;
                                                                }
                                                            }
                                                        } else {
                                                            let j: number = 0;
                                                            d3.selectAll(".taskRect.show").style({
                                                                opacity: 0.3
                                                            })
                                                                .classed("selected", false);
                                                            d3.selectAll(".gantt_taskPanel .show").style({
                                                                opacity: 0.3
                                                            });
                                                            for (let kpiindex: number = 0;
                                                                 kpiindex < tasks.length; kpiindex++) {
                                                                $($(d3.selectAll(".gantt_kpiPanel")[0][0])
                                                                .children()[kpiindex])
                                                                    .css({ opacity: 0.3 });
                                                            }
                                                            // tslint:disable-next-line:no-shadowed-variable
                                                            for (let i: number = 0; i < tasks.length; i++) {
                                                                // tslint:disable-next-line:max-line-length
                                                                if (parseInt($(d3.selectAll(".taskRect.show")[0][i]).attr("data-rowid"), 10) ===
                                                                    selobjchildrencncierarchy[j].rowId) {
                                                                    j++;
                                                                    // tslint:disable-next-line:typedef
                                                                    const thisk =
                                                                    $($(d3.selectAll(".taskRect.show")[0][i]))
                                                                        .css("opacity", "1");
                                                                    thisk.addClass("selected");
                                                                    // tslint:disable-next-line:typedef
                                                                    const thiskk =
                                                                    $(d3.selectAll(".gantt_taskPanel .show"));
                                                                    $(thiskk[0][i]).css("opacity", "1");
                                                                    $($(d3.selectAll
                                                                        (".gantt_kpiPanel")[0][0]).children()[i])
                                                                        .css({ opacity: 1 });
                                                                }
                                                                if (j === selobjchildrencncierarchy.length) {
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                        (d3.event as Event).stopPropagation();
                                    });
                                yPos = Gantt.getBarYCoordinate(tasknumber)
                                 + Gantt.getBarHeight() / 2 + Gantt.taskResourcePadding;
                                if (xPos < thisObj.timeScale(currentLevel.end)) {
                                    xPos = thisObj.timeScale(currentLevel.start) +
                                        // tslint:disable-next-line:max-line-length
                                        (0 === thisObj.taskDurationToWidth(currentLevel) ? 3 : thisObj.taskDurationToWidth(currentLevel));
                                    xPosStart = thisObj.timeScale(currentLevel.start);
                                }
                                if (xPos < thisObj.timeScale(currentLevel.end)) {
                                    xPos = thisObj.timeScale(currentLevel.start) +
                                        // tslint:disable-next-line:max-line-length
                                        (0 === thisObj.taskDurationToWidth(currentLevel) ? 3 : thisObj.taskDurationToWidth(currentLevel));
                                    xPosStart = thisObj.timeScale(currentLevel.start);
                                }
                                thisObj.renderTooltip(taskRect);
                                let labelnormalizer: number;
                                labelnormalizer = (thisObj.viewModel.settings.taskResource.fontSize > 20) ? 20
                                    : thisObj.viewModel.settings.taskResource.fontSize;
                                if (taskResourceShow) {
                                    // tslint:disable-next-line:no-any
                                    let taskResource: any;
                                    taskResource = barBackgroundDiv
                                        .append("text")
                                        .classed(Selectors.taskResource.className + spaceLiteral +
                                             taskRowLiteral + tasknumber, true);
                                    // tslint:disable-next-line:no-any
                                    let titleWidth: any;
                                    d3.selectAll(".resourceLabelText").remove();
                                    let xPosVal: number = 0;
                                    // tslint:disable-next-line:prefer-template
                                    const barStartpt: string = $('div.taskRect[data-row = "' + tasknumber + '"]')
                                    .css("margin-left");
                                    // tslint:disable-next-line:radix
                                    const barStartpt1: number = parseInt(barStartpt
                                        .substring(0, barStartpt.length - 2));
                                    // tslint:disable-next-line:prefer-template
                                    const barEndpt: string = $('div.taskRect[data-row = "' + tasknumber + '"]')
                                    .css("width");
                                    // tslint:disable-next-line:radix
                                    const barEndpt1: number = parseInt(barEndpt.substring(0, barEndpt.length - 2));
                                    if (resourcePresent && currentLevel.resource == null) {
                                        currentLevel.resource = "(Blank)";
                                    }
                                    Gantt.datalabelValueFormatter = ValueFormatter.create({
                                        format: measureFormat ? measureFormat : ValueFormatter.DefaultNumericFormat
                                    });
                                    if (currentLevel.resource !== null) {
                                        currentLevel.resource =
                                         Gantt.datalabelValueFormatter.format(currentLevel.resource);
                                    } else {
                                        currentLevel.resource = " ";

                                    }
                                    const textProperties: TextProperties = {
                                        fontFamily: thisObj.viewModel.settings.taskResource.fontFamily,
                                        fontSize: thisObj.viewModel.settings.taskResource.fontSize + pxLiteral,
                                        text: currentLevel.resource
                                    };
                                    titleWidth = textMeasurementService.measureSvgTextWidth(textProperties);

                                    switch (thisObj.viewModel.settings.taskResource.position.toLowerCase()) {
                                        case "center":
                                            xPosVal = ((barStartpt1 + (barEndpt1 / 2)));
                                            break;
                                        case "left":
                                            xPosVal = barStartpt1 - titleWidth - xFactor;
                                            break;
                                        case "right":
                                        default:
                                            xPosVal = barStartpt1 + barEndpt1 + xFactor;
                                            break;
                                    }
                                    // tslint:disable-next-line:no-any
                                    let marginLeftDataLabel: any;
                                    const widthFactor: number = 5;
                                    const leftMargin: number = 0;
                                    if (xPosVal < 0) {
                                        marginLeftDataLabel = leftMargin + pxLiteral;
                                        titleWidth = barStartpt1 - widthFactor + pxLiteral;
                                    } else {
                                        marginLeftDataLabel = xPosVal + pxLiteral;
                                        titleWidth = titleWidth + pxLiteral;
                                    }
                                    taskResource
                                        .append("div").classed("dataLabelDiv", true)
                                        .style({
                                            "margin-left": marginLeftDataLabel,
                                            "width": titleWidth
                                        })
                                        .text(currentLevel.resource)
                                        .style({
                                            "color": taskResourceColor,
                                            "font-family": dataLabelsFontFamily,
                                            "font-size": labelnormalizer + pxLiteral,
                                            "position": "block"

                                        });
                                    taskResource.append("title").text(currentLevel.resource);
                                    if (thisObj.viewModel.settings.taskResource.position.toLowerCase() === "center") {
                                        taskResource.remove();
                                        let displayText: string;
                                        displayText = null ||
                                         undefined === currentLevel.resource ? "" : currentLevel.resource;
                                        taskRect.append("text").text(displayText);
                                        taskRect.style({
                                            "color": taskResourceColor,
                                            "font-family": dataLabelsFontFamily,
                                            "font-size": labelnormalizer + pxLiteral,
                                            "line-height": document.querySelector(".taskRect")
                                            .clientHeight - 2 + pxLiteral,
                                            "text-align": "center"
                                        });
                                    }
                                }
                            }

                            $(".gantt_legendIndicatorPanel").hide();
                            $(".arrow").hide();
                        }
                    }
                }
                let chartHeight: number;
                // tslint:disable-next-line:no-any
                chartHeight = $(".show").filter(function(): any {
                    return $(this).css("display") !== "none";
                }).length;
                chartHeight = chartHeight / 2;
                if (!Gantt.isDateData) {
                    $(".gantt_barPanel").css("height", (chartHeight * 24) + pxLiteral);
                } else {
                    $(".gantt_barPanel").css("height", (chartHeight * 16) + pxLiteral);
                }
                if (this.viewModel.settings.taskLabels.isExpanded) {
                    $(".gantt_taskPanel").show();
                } else {
                    $(".gantt_taskPanel").hide();
                }
                if (d3.select("#gantt_ToggleIcon").classed("expand")) {
                    $(".gantt_taskPanel").hide();
                    $(".gantt_bottomTaskDiv").hide();
                } else {
                    $(".gantt_taskPanel").show();
                    $(".gantt_bottomTaskDiv").show();
                }
                if (d3.select("#gantt_KPIToggle").classed("expand")) {
                    $(".gantt_kpiPanel").hide();
                } else {
                    $(".gantt_kpiPanel").show();
                }
            }
        }
        // tslint:disable-next-line
        public collapseFunctinality(tasks: ITask[], parentRowId1: any): void {
            // tslint:disable-next-line:prefer-template
            $('div[data-parentid = "' + parentRowId1 + '"]').hide();
            // tslint:disable-next-line:no-any
            const arrRowid: any = [];
            // tslint:disable-next-line:no-any
            const arr: any = [];
            // tslint:disable-next-line:prefer-template
            if (($($("div[data-parentid = '" + parentRowId1 + "']")).attr("data-isleaf"))) {
                // tslint:disable-next-line:prefer-template
                arr.push($("div[data-parentid = '" + parentRowId1 + "']"));
                for (const ijterator: number = 0; iterator < arr[0].length; iterator++) {
                    // tslint:disable-next-line:prefer-template
                    arrRowid.push($($("div[data-parentid = '" + parentRowId1 + "']")[ijterator]).attr("data-rowid"));
                }

                for (const rowid1 of arrRowid) {
                    this.collapseFunctinality(tasks, this.collapseFunctinality(tasks, rowid1));
                }
            }

        }
        // tslint:disable-next-line
        public expandFunctinality(tasks: ITask[], parentRowId1: any): void {
            // tslint:disable-next-line:prefer-template
            $('div[data-parentid = "' + parentRowId1 + '"]').show();
        }
        private drawMilestoneShape(
            selection: Selection<HTMLElement>, xStartPosition: number,
            yStartPosition: number, index: number, isForLegend: boolean): void {

            let shapeName: string;
            let color: string;
            let size: number;
            let className: string;
            let milestoneShapeSelection: Selection<HTMLElement>;
            let rotateLieral: string;
            let minusLieral: string;
            minusLieral = "-";
            rotateLieral = "rotate";
            shapeName = Gantt.milestoneShapes[index];
            color = Gantt.milestoneColor[index];
            size = isForLegend ? 16 : Gantt.milestoneSize[index];
            className = isForLegend ? "gantt_milestoneLegend gantt_milestoneIcon" : "gantt_actual-milestone";
            switch (shapeName) {
                case "circle":
                    milestoneShapeSelection = selection.append("circle")
                        .attr({
                            class: className,
                            cx: xStartPosition,
                            cy: yStartPosition + Gantt.getBarHeight() / 2 + Gantt.defaultValues.ProgressBarHeight,
                            fill: color,
                            r: size / 2,
                            stroke: "black"
                        });
                    break;
                case "diamond":
                    if (isForLegend) {
                        size -= 4;
                    }
                    milestoneShapeSelection = selection.append("rect")
                        .attr({
                            class: className,
                            fill: color,
                            height: size,
                            stroke: "black",
                            transform: rotateLieral + paranthesisStartLiteral + 45 +
                                commaLiteral + (xStartPosition) + commaLiteral +
                                 (yStartPosition + Gantt.getBarHeight() / 2 +
                                    Gantt.defaultValues.ProgressBarHeight) + paranthesisEndLiteral,
                                    width: size,
                            x: xStartPosition - size / 2,
                            y: yStartPosition + Gantt.getBarHeight() / 2 +
                             Gantt.defaultValues.ProgressBarHeight - size / 2,
                        });
                    break;
                case "star":
                    milestoneShapeSelection = selection.append("polygon")
                        .attr({
                            class: className,
                            fill: color,
                            points: CalculateStarPoints(xStartPosition, yStartPosition +
                                 Gantt.getBarHeight() - 8, 5, size / 2, 5),
                                 stroke: "black",
                            transform: rotateLieral + paranthesisStartLiteral +
                             minusLieral + 17.5 + commaLiteral + (xStartPosition) +
                                commaLiteral + (yStartPosition + Gantt.getBarHeight() - 8) + paranthesisEndLiteral
                        });
                    break;
                case "triangle":
                    milestoneShapeSelection = selection.append("path")
                        .attr({
                            class: className,
                            d: getTriangleCoords(xStartPosition, yStartPosition + Gantt.getBarHeight() - 5, size),
                            fill: color,
                            stroke: "black"
                        });
                    break;
                default:
            }

            if (isForLegend) {
                milestoneShapeSelection.attr({
                    "data-milestonenamelegend": Gantt.milestoneNames[index]
                });
            } else {
                milestoneShapeSelection.attr({
                    "data-milestonename": Gantt.milestoneNames[index]
                });
            }

            function getTriangleCoords(xStart: number, yStart: number, length: number): string {

                let x1: number;
                let x2: number;
                let x3: number;
                let y1: number;
                let y2: number;
                let y3: number;
                let mLiteral: string;
                let lLiteral: string;
                let zLiteral: string;
                x1 = xStart - length / 2;
                y1 = yStart;
                x2 = xStart + length / 2;
                y2 = yStart;
                x3 = xStart;
                y3 = yStart - length / 2;
                mLiteral = "M";
                lLiteral = "L";
                zLiteral = "Z";

                return mLiteral + x1 + spaceLiteral + y1 + spaceLiteral + lLiteral + x2 +
                    spaceLiteral + y2 + spaceLiteral + lLiteral + x3 + spaceLiteral + y3 + spaceLiteral + zLiteral;
            }

            function CalculateStarPoints(centerX: number, centerY: number,
                                         arms: number, outerRadius: number, innerRadius: number): string {

                let results: string;
                results = "";
                let angle: number;
                angle = Math.PI / arms;
                let i: number;
                for (i = 0; i < 2 * arms; i++) {
                    let radius: number;
                    radius = (i % 2) === 0 ? outerRadius : innerRadius;
                    let currX: number;
                    currX = centerX + Math.cos(i * angle) * radius;
                    let currY: number;
                    currY = centerY + Math.sin(i * angle) * radius;

                    if (i === 0) {
                        results = currX + commaLiteral + currY;
                    } else {
                        results += commaLiteral + spaceLiteral + currX + commaLiteral + currY;
                    }
                }

                return results;
            }
        }

        /**
         * Returns the matching Y coordinate for a given task index
         * @param taskIndex Task Number
         */
        private getTaskLabelCoordinateY(taskIndex: number): number {
            const fontSize: number = + (this.viewModel.settings.taskLabels.fontSize * Gantt.maximumNormalizedFontSize)
                / Gantt.maximumFontSize;

            return (chartLineHeight * taskIndex) + (Gantt.getBarHeight() +
                Gantt.barHeightMargin - (chartLineHeight - fontSize) / Gantt.chartLineHeightDivider) - 3.5;
        }

        /**
         * convert task duration to width in the time scale
         * @param task The task to convert
         */
        private taskDurationToWidth(task: ITask): number {
            if (this.timeScale(task.end) - this.timeScale(task.start) < 0) {
                return 0;
            }

            return this.timeScale(task.end) - this.timeScale(task.start);
        }

        // tslint:disable-next-line:no-any
        private taskDurationToWidth1(task: any): number {
            if (this.timeScale(task.numEnd) - this.timeScale(task.numStart) < 0) {
                return 0;
            }

            return this.timeScale(task.numEnd) - this.timeScale(task.numStart);
        }

        private getTooltipForTodayLine(timestamp: number, milestoneTitle: string): VisualTooltipDataItem[] {

            let today: Date;
            today = new Date();
            let stringDate: string;
            stringDate = (zeroLiteral + (today.getMonth() + 1)).slice(-2)
                + slashLiteral + (zeroLiteral + today.getDate()).slice(-2) +
                slashLiteral + today.getFullYear() + spaceLiteral + (zeroLiteral + today.getHours()).slice(-2);
            let tooltip: VisualTooltipDataItem[];
            tooltip = [{ displayName: milestoneTitle, value: stringDate }];

            return tooltip;
        }

        /**
         * Create vertical dotted line that represent milestone in the time axis (by default it shows not time)
         * @param tasks All tasks array
         * @param timestamp the milestone to be shown in the time axis (default Date.now())
         */
        private createTodayLine(totalTasks: number,
                                milestoneTitle: string = "Today", timestamp: number = Date.now()): void {
            let todayDate: string;
            todayDate = new Date().toString();
            let line: Line[];
            line = [{
                tooltipInfo: this.getTooltipForTodayLine(timestamp, milestoneTitle),
                x1: this.timeScale(new Date(todayDate)),
                x2: this.timeScale(new Date(todayDate)),
                y1: Gantt.milestoneTop,
                y2: this.getTodayLineLength(totalTasks) + 15
            }];
            let chartLineSelection: UpdateSelection<Line>;
            chartLineSelection = this.chartGroup.selectAll(Selectors.chartLine.selectorName).data(line);
            if (this.viewModel.settings.dateType.enableToday) {
                chartLineSelection
                    .enter()
                    .append("line")
                    .style({
                        "opacity": 1,
                        "position": "absolute",
                        "z-index": 1000
                    })
                    .classed(Selectors.chartLine.className, true);
                chartLineSelection.attr({
                    // tslint:disable-next-line:typedef
                    x1: (lines: Line) => lines.x1,
                     // tslint:disable-next-line:typedef
                     x2: (lines: Line) => lines.x2,
                    // tslint:disable-next-line:typedef
                    y1: (lines: Line) => lines.y1,
                    // tslint:disable-next-line:typedef
                    y2: (lines: Line) => lines.y2 - $(".gantt_bottomMilestoneSvg").innerHeight() + pxLiteral
                });
                this.renderTooltip(chartLineSelection);
                chartLineSelection.exit().remove();
            } else {
                chartLineSelection.remove();
            }

            // today's indicator
            let xPosition: number;
            xPosition = this.timeScale(new Date(todayDate)) + 21;
            let yPosition: number;
            yPosition = 11;
            let triangleWidth: number;
            triangleWidth = 16;
            let x1: number;
            let y1: number;
            let x2: number;
            let y2: number;
            let x3: number;
            let y3: number;
            let mLiteral: string;
            let lLiteral: string;
            let zLiteral: string;
            let minusLiteral: string;
            let rotateLieral: string;
            x1 = xPosition;
            y1 = yPosition - triangleWidth / 3.5;
            x2 = xPosition;
            y2 = yPosition + triangleWidth / 3.5;
            x3 = xPosition + triangleWidth / 2;
            y3 = yPosition;
            mLiteral = "M";
            lLiteral = "L";
            zLiteral = "Z";
            minusLiteral = "-";
            rotateLieral = "rotate";
            this.todayGroup.selectAll("*").remove();
            if (this.viewModel.settings.dateType.enableToday) {
                let x: number;
                x = this.timeScale(new Date(todayDate)) + 10;
                this.todayindicator = this.todayGroup
                    .append("path")
                    .classed(Selectors.todayIndicator.className, true)
                    .attr({
                        d: mLiteral + x1 + spaceLiteral + y1 + spaceLiteral + lLiteral + x2 + spaceLiteral +
                            y2 + spaceLiteral + lLiteral + x3 + spaceLiteral + y3 + spaceLiteral + zLiteral,
                        transform: rotateLieral + paranthesisStartLiteral + minusLiteral + 90 + commaLiteral +
                            xPosition + commaLiteral + yPosition + paranthesisEndLiteral
                    })
                    .style({
                        fill: "red"
                    });
                this.todayText = this.todayGroup
                    .append("text")
                    .attr({
                        x: this.timeScale(new Date(todayDate)) + 8,
                        y: 20
                    })
                    .text("Today")
                    .classed(Selectors.todayText.className, true);
            }
        }

        // tslint:disable-next-line:no-any
        private renderTooltip(selection: Selection<any>): void {
            this.tooltipServiceWrapper.addTooltip(
                selection,
                (tooltipEvent: TooltipEventArgs<TooltipEnabledDataPoint>) => {
                    return tooltipEvent.data.tooltipInfo;
                });
        }

        private updateElementsPositions(viewport: IViewport, margin: IMargin): void {
            const taskLabelsWidth: number =
             this.viewModel.settings.taskLabels.show ? this.viewModel.settings.taskLabels.width : 0;

            this.gridGroup.attr("transform",
             SVGUtil.translate(margin.left + 18, Gantt.taskLabelsMarginTop)); // added for gridlines
            this.axisGroup.attr("transform", SVGUtil.translate(margin.left + 18, Gantt.taskLabelsMarginTop + 3));
            this.chartGroup.attr("transform", SVGUtil.translate(margin.left + 18, 0));
            this.lineGroup.attr("transform", SVGUtil.translate(0, 0));
            this.bottommilestoneGroup.attr("transform", SVGUtil.translate(margin.left + 18, 0));
            this.todayGroup.attr("transform", SVGUtil.translate(18, 0));
            this.drillAllGroup.attr("transform", SVGUtil.translate(0, 5));
            this.legendGroup.attr("transform", SVGUtil.translate(0, 0));
        }

        private getTodayLineLength(numOfTasks: number): number {
            return numOfTasks * chartLineHeight;
        }

    }
}
