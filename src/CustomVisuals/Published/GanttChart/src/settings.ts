/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
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
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
    import ColorHelper = powerbi.extensibility.utils.color.ColorHelper;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import SelectionDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import ISelectionId = powerbi.visuals.ISelectionId;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import IBehaviorOptions = powerbi.extensibility.utils.interactivity.IBehaviorOptions;
    import InteractivitySelectionService = powerbi.extensibility.utils.interactivity.InteractivitySelectionService;
    import BaseDataPoint =  powerbi.extensibility.utils.interactivity.BaseDataPoint;
    import Selection = d3.Selection;

    export type GanttDateType = "Day" | "Week" | "Month" | "Quarter" | "Year";
    export type GanttDataType = "Integer" | "Float";
    export type GanttKPIType = "Value" | "Indicator" | "Type";
    export type GanttScrollPositionType = "Start" | "Today" | "End";

    export interface IAxisPropertiesParameter {
    viewportIn: IViewport;
    textProperties: TextProperties;
    startDate: Date;
    endDate: Date;
    datamin: number;
    datamax: number;
    axisLength: number;
    ticks: number;
   }
    export interface IGeneralSettings {
        groupTasks: boolean;
    }

    export interface IBarColor {
        defaultColor: string;
        showall: boolean;
        fillColor: string;
    }

    export interface ILegendSettings {
        show: boolean;
        position: string;
        showTitle: boolean;
        titleText: string;
        labelColor: string;
        fontSize: number;
    }

    export interface ITaskLabelsSettings {
        show: boolean;
        fill: string;
        fontSize: number;
        fontFamily: string;
        width: number;
        isExpanded: boolean;
        isHierarchy: boolean;
    }
    export interface IColumnHeaderSettings {
        fill: string;
        fill2: string;
        columnOutline: string;
        fontFamily: string;
        fontSize: number;
    }
    export interface ITaskResourceSettings {
        show: boolean;
        position: string;
        fill: string;
        fontSize: number;
        fontFamily: string;
    }

    export interface ITaskGridLinesSettings {
        show: boolean;
        fill: string;
        interval: number;
    }

    export interface IDateTypeSettings {
        type: GanttDateType;
        enableToday: boolean;
    }

    export interface IDataTypeSettings {
        type: GanttDataType;

    }

    export interface ITask extends SelectionDataPoint {
        id: number;
        repeat: number;
        name: string[];
        start: Date;
        end: Date;
        numStart: number;
        numEnd: number;
        resource: string;
        color: string;
        KPIValues: IKPIValues[];
        tooltipValues: ITooltipDataValues[];
        tooltipInfo: VisualTooltipDataItem[];
        identity: ISelectionId;
        level: number;
        isLeaf: boolean;
        rowId: number;
        parentId: number;
        selectionId: ISelectionId;
        expanded: boolean;
        mapId?: number;
    }

    export interface IKPIValues {
        name: string;
        value: string;
    }

    export interface ITooltipDataValues {
        name: string;
        value: string;
    }

    export interface IGanttChartFormatters {
        startDataFormatter: IValueFormatter;
        endDataFormatter: IValueFormatter;
        completionFormatter: IValueFormatter;
        durationFormatter: IValueFormatter;
    }

    export interface IKPIConfig {
        name: string;
        type: string;
        identity: {};
    }

    export interface IHierarchyArrayConfig {
        id: number;
        name: string[];
        start: Date;
        end: Date;
        numStart: number;
        numEnd: number;
        resource: string;
        color: string;
        KPIValues: IKPIValues[];
        tooltipValues: ITooltipDataValues[];
        tooltipInfo: VisualTooltipDataItem[];
        selectionId: ISelectionId;
        level: number;
        isLeaf: boolean;
        rowId: number;
        parentId: number;
        expanded: boolean;
    }

    export interface IGanttViewModel {
        dataView: DataView;
        settings: IGanttSettings;
        tasksNew: ITask[];
        kpiData: IKPIConfig[];
        hierarchyArray: IHierarchyArrayConfig[];
    }

    export interface ITooltipOptions {
        opacity: number;
        animationDuration: number;
        offsetX: number;
        offsetY: number;
    }

    export interface IShowData {
        sName: string;
        sFlag: any;
    }

    export interface IKPIColumnTypeSettings {
        value: GanttKPIType;
        indicator: GanttKPIType;
        type: GanttKPIType;
    }

    export interface IScrollPositionSettings {
        position: GanttScrollPositionType;
        position2: GanttScrollPositionType;
    }

    export interface IDisplayRatioSettings {
        ratio: number;
    }

    export interface ICategoryColumnsWidthSettings {
        width: string;
        categoryLength: number;
    }

    export interface ISortAttributesSettings {
        sortOrder: string;
        sortLevel: number;
        prevSortedColumn: number;
    }

    export interface IVisualProperty {
    width: number;
    height: number;
   }

    export interface IGanttBehaviorOptions extends IBehaviorOptions<BaseDataPoint> {
    behavior: IInteractiveBehavior;
    taskSelection: Selection<SelectionDataPoint>;
    legendSelection: Selection<SelectionDataPoint>;
    interactivityService: IInteractivityService<SelectionDataPoint>;
}

    export interface IGanttSettings {
        general: IGeneralSettings;
        barColor: IBarColor;
        legend: ILegendSettings;
        taskLabels: ITaskLabelsSettings;
        columnHeader: IColumnHeaderSettings;
        taskResource: ITaskResourceSettings;
        scrollPosition: IScrollPositionSettings;
        dateType: IDateTypeSettings;
        datatype: IDataTypeSettings;
        kpiColumnType: IKPIColumnTypeSettings;
        taskGridlines: ITaskGridLinesSettings;
        displayRatio: IDisplayRatioSettings;
        categoryCoumnsWidth: ICategoryColumnsWidthSettings;
        sortAttributes: ISortAttributesSettings;
        persistExpandCollapseSettings: PersistExpandCollapseSettings;
        captionValue: CaptionValues;
    }
    /**
     * export class CaptionValues
     */
    export class CaptionValues {
        public captionValue: string = "{}";
    }
    /**
     * PersistExpandCollapseSettings
     */
    // tslint:disable-next-line:max-classes-per-file
    export class PersistExpandCollapseSettings {
        public expandCollapseState: string = "{}";
    }
    // tslint:disable-next-line:max-classes-per-file
    /**
     * GanttSettings
     */
    // tslint:disable-next-line: max-classes-per-file
    export class GanttSettings {
        // tslint:disable-next-line:typedef
        public static get Default() {

            return new this();
        }

        public static parse(objects: DataViewObjects, colors: IColorPalette): IGanttSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties;

            return {
                barColor: this.parseBarColorSettings(objects, colors),
                captionValue: new CaptionValues(),
                categoryCoumnsWidth: this.parseCategoryColumnsWidthSettings(objects),
                columnHeader: this.parseColumnHeaderSettings(objects, colors),
                datatype: this.parseDataTypeSettings(objects),
                dateType: this.parseDateTypeSettings(objects),
                displayRatio: this.parseDisplayRatioSettings(objects),
                general: this.parseGeneralSettings(objects),
                kpiColumnType: this.parseKPIColumnTypeSettings(objects),
                legend: this.parseLegendSettings(objects, colors),
                persistExpandCollapseSettings: new PersistExpandCollapseSettings(),
                scrollPosition: this.parseScrollPositionSettings(objects),
                sortAttributes: this.parsesortAttributesSettings(objects),
                taskGridlines: this.parseTaskGridLinesSettings(objects, colors),
                taskLabels: this.parseTaskLabelsSettings(objects, colors),
                taskResource: this.parseTaskResourceSettings(objects, colors)
            };
        }
        // Default Settings
        private static general: IGeneralSettings = {
            groupTasks: false
        };

        private static barColor: IBarColor = {
            defaultColor: "#5F6B6D",
            fillColor: "#5F6B6D",
            showall: true
        };

        private static legend: ILegendSettings = {
            fontSize: 8,
            labelColor: "#000",
            position: "Right",
            show: true,
            showTitle: true,
            titleText: ""

        };

        private static taskLabels: ITaskLabelsSettings = {
            fill: "#000",
            fontFamily: "Segoe UI",
            fontSize: 11,
            isExpanded: true,
            isHierarchy: false,
            show: true,
            width: 10
        };

        private static columnHeader: IColumnHeaderSettings = {
            columnOutline: "none",
            fill: "#000",
            fill2: "#fff",
            fontFamily: "Segoe UI",
            fontSize: 11
        };

        private static taskResource: ITaskResourceSettings = {
            fill: "#000",
            fontFamily: "Segoe UI",
            fontSize: 11,
            position: "Right",
            show: true,
        };

        private static taskGridLines: ITaskGridLinesSettings = {
            fill: "#808080",
            interval: 2,
            show: true
        };

        private static dateType: IDateTypeSettings = {
            enableToday: true,
            type: "Month"
        };

        private static datatype: IDataTypeSettings = {
            type: "Integer"
        };

        private static kpiColumnType: IKPIColumnTypeSettings = {
            indicator: "Indicator",
            type: "Type",
            value: "Value"
        };

        private static scrollPosition: IScrollPositionSettings = {
            position: "Start",
            position2: "Start"
        };

        private static displayRatio: IDisplayRatioSettings = {
            ratio: 40
        };

        private static categoryColumnsWidth: ICategoryColumnsWidthSettings = {
            categoryLength: 0,
            width: ""
        };
        private static sortAttributes: ISortAttributesSettings = {
            prevSortedColumn: -1,
            sortLevel: 0,
            sortOrder: "asc"
        };
        private static parseCategoryColumnsWidthSettings(objects: DataViewObjects): ICategoryColumnsWidthSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.categoryColumnsWidth;
            const defaultSettings: ICategoryColumnsWidthSettings = this.categoryColumnsWidth;

            return {
                categoryLength:
                    DataViewObjects.getValue<number>(objects,
                         properties.categoryLength, defaultSettings.categoryLength),
                width: DataViewObjects.getValue<string>(objects, properties.width, defaultSettings.width)
            };

        }
        private static parsesortAttributesSettings(objects: DataViewObjects): ISortAttributesSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.sortAttributes;
            const defaultSettings: ISortAttributesSettings = this.sortAttributes;

            return {
                prevSortedColumn:
                    DataViewObjects
                        .getValue<number>(objects, properties.prevSortedColumn, defaultSettings.prevSortedColumn),
                sortLevel: DataViewObjects.getValue<number>(objects, properties.sortLevel, defaultSettings.sortLevel),
                sortOrder: DataViewObjects.getValue<string>(objects, properties.sortOrder, defaultSettings.sortOrder),

            };

        }

        private static parseDisplayRatioSettings(objects: DataViewObjects): IDisplayRatioSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.displayRatio;
            const defaultSettings: IDisplayRatioSettings = this.displayRatio;

            return {
                ratio: DataViewObjects.getValue<number>(objects, properties.ratio, defaultSettings.ratio)
            };

        }

        private static parseGeneralSettings(objects: DataViewObjects): IGeneralSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.general;
            const defaultSettings: IGeneralSettings = this.general;

            return {
                groupTasks:
                    DataViewObjects.getValue<boolean>(objects, properties.groupTasks, defaultSettings.groupTasks)
            };
        }

        private static parseBarColorSettings(objects: DataViewObjects, colors: IColorPalette): IBarColor {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.barColor;
            const defaultSettings: IBarColor = this.barColor;

            return {
                defaultColor: DataViewObjects.getFillColor(objects, properties.defaultColor, defaultSettings.fillColor),
                fillColor: DataViewObjects.getFillColor(objects, properties.fillColor, defaultSettings.fillColor),
                showall: DataViewObjects.getValue<boolean>(objects, properties.showall, defaultSettings.showall)
            };
        }

        private static parseLegendSettings(objects: DataViewObjects, colors: IColorPalette): ILegendSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.legend;
            const defaultSettings: ILegendSettings = this.legend;

            return {
                fontSize: DataViewObjects.getValue<number>(objects, properties.fontSize, defaultSettings.fontSize),
                labelColor: DataViewObjects.getFillColor(objects, properties.labelColor, defaultSettings.labelColor),
                position: DataViewObjects.getValue<string>(objects, properties.position, defaultSettings.position),
                show: DataViewObjects.getValue<boolean>(objects, properties.show, defaultSettings.show),
                showTitle: DataViewObjects.getValue<boolean>(objects, properties.showTitle, defaultSettings.showTitle),
                titleText: DataViewObjects.getValue<string>(objects, properties.titleText, defaultSettings.titleText)

            };
        }

        private static parseTaskLabelsSettings(objects: DataViewObjects, colors: IColorPalette): ITaskLabelsSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.taskLabels;
            const defaultSettings: ITaskLabelsSettings = this.taskLabels;

            return {
                fill: DataViewObjects.getFillColor(objects, properties.fill, defaultSettings.fill),
                fontFamily:
                    DataViewObjects.getValue<string>(objects, properties.fontFamily, defaultSettings.fontFamily),
                fontSize: DataViewObjects.getValue<number>(objects, properties.fontSize, defaultSettings.fontSize),
                isExpanded:
                    DataViewObjects.getValue<boolean>(objects, properties.isExpanded, defaultSettings.isExpanded),
                isHierarchy:
                    DataViewObjects.getValue<boolean>(objects, properties.isHierarchy, defaultSettings.isHierarchy),
                show: DataViewObjects.getValue<boolean>(objects, properties.show, defaultSettings.show),
                width: DataViewObjects.getValue<number>(objects, properties.width, defaultSettings.width)
            };
        }
        private static parseColumnHeaderSettings(objects: DataViewObjects,
                                                 colors: IColorPalette): IColumnHeaderSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.columnHeader;
            const defaultSettings: IColumnHeaderSettings = this.columnHeader;

            return {
                columnOutline:
                    DataViewObjects.getValue<string>(objects, properties.columnOutline, defaultSettings.columnOutline),
                fill: DataViewObjects.getFillColor(objects, properties.fill, defaultSettings.fill),
                fill2: DataViewObjects.getFillColor(objects, properties.fill2, defaultSettings.fill2),
                fontFamily:
                    DataViewObjects.getValue<string>(objects, properties.fontFamily, defaultSettings.fontFamily),
                fontSize: DataViewObjects.getValue<number>(objects, properties.fontSize, defaultSettings.fontSize)

            };
        }

        private static parseTaskResourceSettings(objects: DataViewObjects,
                                                 colors: IColorPalette): ITaskResourceSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.taskResource;
            const defaultSettings: ITaskResourceSettings = this.taskResource;

            return {
                fill: DataViewObjects.getFillColor(objects, properties.fill, defaultSettings.fill),
                fontFamily: DataViewObjects.getValue<string>
                    (objects, properties.fontFamily, defaultSettings.fontFamily),
                fontSize: DataViewObjects.getValue<number>(objects, properties.fontSize, defaultSettings.fontSize),
                position: DataViewObjects.getValue<string>(objects, properties.position, defaultSettings.position),
                show: DataViewObjects.getValue<boolean>(objects, properties.show, defaultSettings.show)

            };
        }

        private static parseTaskGridLinesSettings(objects: DataViewObjects,
                                                  colors: IColorPalette): ITaskGridLinesSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.taskGridlines;
            const defaultSettings: ITaskGridLinesSettings = this.taskGridLines;

            return {
                fill: DataViewObjects.getFillColor(objects, properties.fill, defaultSettings.fill),
                interval: DataViewObjects.getValue<number>(objects, properties.interval, defaultSettings.interval),
                show: DataViewObjects.getValue<boolean>(objects, properties.show, defaultSettings.show)
            };
        }

        private static parseDateTypeSettings(objects: DataViewObjects): IDateTypeSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.dateType;
            const defaultSettings: IDateTypeSettings = this.dateType;

            return {
                enableToday:
                    DataViewObjects.getValue<boolean>(objects, properties.enableToday, defaultSettings.enableToday),
                type: DataViewObjects.getValue<GanttDateType>(objects, properties.type, defaultSettings.type)
            };
        }

        private static parseDataTypeSettings(objects: DataViewObjects): IDataTypeSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.datatype;
            const defaultSettings: IDataTypeSettings = this.datatype;

            return {
                type: DataViewObjects.getValue<GanttDataType>(objects, properties.type, defaultSettings.type)
            };
        }

        private static parseScrollPositionSettings(objects: DataViewObjects): IScrollPositionSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.scrollPosition;
            const defaultSettings: IScrollPositionSettings = this.scrollPosition;

            return {
                position: DataViewObjects
                    .getValue<GanttScrollPositionType>(objects, properties.position, defaultSettings.position),
                position2: DataViewObjects
                    .getValue<GanttScrollPositionType>(objects, properties.position2, defaultSettings.position2)
            };
        }

        private static parseKPIColumnTypeSettings(objects: DataViewObjects): IKPIColumnTypeSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.kpiColumnType;
            const defaultSettings: IKPIColumnTypeSettings = this.kpiColumnType;

            return {
                indicator: DataViewObjects
                    .getValue<GanttKPIType>(objects, properties.indicator, defaultSettings.indicator),
                type: DataViewObjects.getValue<GanttKPIType>(objects, properties.type, defaultSettings.type),
                value: DataViewObjects.getValue<GanttKPIType>(objects, properties.value, defaultSettings.value)
            };
        }

        // tslint:disable-next-line:no-any
        private static getColor(objects: DataViewObjects,
                                properties: any, defaultColor: string, colors: IColorPalette): string {
            let colorHelper: ColorHelper;
            colorHelper = new ColorHelper(colors, properties, defaultColor);

            return colorHelper.getColorForMeasure(objects, properties);
        }

    }
}
