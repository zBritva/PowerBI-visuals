/*
 *  Power BI Visual CLI
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
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import Legend = powerbi.extensibility.utils.chart.legend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import LegendDataPoint = powerbi.extensibility.utils.chart.legend.LegendDataPoint;
    import LegendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import Selection = d3.Selection;
    import createInteractivityService = powerbi.extensibility.utils.interactivity.createInteractivityService;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import ColorHelper = powerbi.extensibility.utils.color;
    import AxisHelper = powerbi.extensibility.utils.chart.axis;
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import SelectableDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
    import ISelectionHandler = powerbi.extensibility.utils.interactivity.ISelectionHandler;

    interface ITreeChartDataPoint extends SelectableDataPoint {
        area : number;
        depth : number;
        dx : number;
        dy : number;
        name: string;
        // tslint:disable-next-line:no-any
        parent : any;
        // tslint:disable-next-line:no-any
        identity: any;
        value: number;
        valueIndex : number;
        x: number;
        y : number;
        z : number;
        barheight : number;
        barwidth : number;
        opacity : number;
        brickClass : string;
    }

    const nameliteral : string = 'name' ;
    const cellliteral : string = 'cell';
    const treeliteral : string = 'treemap';
    const commaliteral : string = ' commonCells';
    const valueliteral : string = 'value';
    const yearliteral : string = 'year';
    const dotliteral : string = '.';
    const hashliteral : string = '#';
    const xaxisliteral : string = 'xaxis';
    const pixelLiteral : string = 'px';
    const translateLiteral : string = 'translate(';
    const closeLiteral : string = ')';
    const totalRectLiteral : string = 'totalrect';
    const totalLabelLiteral : string = 'totallabels';
    const nameLiteral : string = 'name';
    const comma : string = ',';
    const dataLiteral : string = '__data__';
    const dataRectLiteral : string = 'datarects';
    const zeroOnlyLiteral : string = '0';
    const brickClass : string = 'brickClass';
    const fifthValue : number = 5;
    const sixthValue : number = 6;
    const tenthValue : number = 10;
    const paddingValue : number = 15;
    const twentyValue : number = 20;
    const heightPaddingValue : number = 25;
    const xaxisPaddingValue : number = 30;
    const errorMessagePadding : number = 3.5;
    // tslint:disable-next-line:no-any
    let THIS : any;
    // tslint:disable-next-line:no-any
    const tooltipData : any = [];
    let formatter: IValueFormatter;
    // tslint:disable-next-line:no-any
    let node : any ;
    // tslint:disable-next-line:no-any
    let root : any;
    // tslint:disable-next-line:no-any
    let globalcategory : any;
    // tslint:disable-next-line:no-any
    let globalcolor : any; //for colormap
    let globalpadding : number;
    let globalBarWidth : number;
    let textHeight : number = 0;
    // tslint:disable-next-line:no-any
    let groupColorArray : any = [];
    // tslint:disable-next-line:no-any
    let displayVal: any = 0;
    // tslint:disable-next-line:no-any
    let opacityObject : any = [];
    let globalTreeChartDataPoints: ITreeChartDataPoint[] = [];
    let clickedFlagLiteral : number = 0;
    const numericLiteral : string = 'n';
    export  function getCategoricalObjectValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            const object: DataViewObject = objects[objectName];
            if (object) {
                const property: T = <T>object[propertyName];
                if (property !== undefined) {
                    return property;
                }
            }
        }

        return defaultValue;
    }
    export function getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            // tslint:disable-next-line:no-any
            const object : any  = objects[objectName];
            if (object) {
                const property: T = <T>object[propertyName];
                if (property !== undefined) {
                    return property;
                }
            }
        }

        return defaultValue;
    }

    module Selectors {
        export const className: ClassAndSelector = createClassAndSelector('');
        export const chart: ClassAndSelector = createClassAndSelector('');
        export const chartLine: ClassAndSelector = createClassAndSelector('');
        export const body: ClassAndSelector = createClassAndSelector('');
        export const label: ClassAndSelector = createClassAndSelector('label');
        export const legendItems: ClassAndSelector = createClassAndSelector('legendItem');
        export const legendTitle: ClassAndSelector = createClassAndSelector('legendTitle');
        export const errorPanel: ClassAndSelector = createClassAndSelector('errorPanel');
    }
    import IColorPalette = powerbi.extensibility.IColorPalette;

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): ITreeMapBarChartViewModel {
        // tslint:disable-next-line:no-any
        const dataViews : any = options.dataViews;
        const viewModel: ITreeMapBarChartViewModel = {
            dataPoints: []
        };

        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source
            || !dataViews[0].categorical.values) {
            return viewModel;
        }
        const categorical : DataViewCategorical = options.dataViews[0].categorical ;
        const treeMapBarChartDataPoints: ITreeMapBarDataPoint[] = [];
        const colorPalette: IColorPalette = host.colorPalette;
        const groups: DataViewValueColumnGroup[] = options.dataViews[0].categorical.values.grouped();
        const legendFormatterValue : string = options.dataViews[0].categorical.values.source.format;
        const legendFormatter  : IValueFormatter = ValueFormatter.create({
            format: legendFormatterValue
        });
        groups.forEach((group: DataViewValueColumnGroup, iterator : number) => {
            let groupNameString: string = group.name !== null ? group.name !== '' ?
                group.name.toString() : '(Blank)' : 'Blank';
            //to check for date
            if (String(new Date(groupNameString)) === 'Invalid Date' ||
            new Date(groupNameString).toISOString() !== groupNameString) {
                groupNameString = groupNameString;
            } else {
                groupNameString = legendFormatter.format(new Date(groupNameString));
            }
            // tslint:disable-next-line:no-any
            let defaultColor: any = '#fff';
            defaultColor = {
                solid: {
                    color: colorPalette.getColor(groupNameString).value
                }
            };
            const legendcolor : string = getCategoricalObjectValue<Fill>
            (group.objects, 'dataPoint', 'fill', defaultColor).solid.color;
            treeMapBarChartDataPoints.push({
                color: legendcolor,
                category: groupNameString,
                selectionId: host.createSelectionIdBuilder()
                    .withSeries(options.dataViews[0].categorical.values, group)
                    .createSelectionId()
            });
        });

        return {
            dataPoints: treeMapBarChartDataPoints
        };

    }
    /**
     * TreeMapBar class contains variables and methods to draw treemap.
     */
    export class TreemapBar implements IVisual {

        private svg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private barChartContainer: d3.Selection<SVGElement>;
        private barContainer: d3.Selection<SVGElement>;
        private bars: d3.Selection<SVGElement>;
        private selectionManager: ISelectionManager;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private dataPoints: ITreeMapBarDataPoint[];
        private legend: ILegend;
        private viewport: IViewport;
        public viewModel: ITreeMapBarChartViewModel;
        public legendViewModel: ITreeMapBarViewModel;
        public settings: VisualSettings;
        private interactivityService: IInteractivityService;
        private isInteractiveChart: boolean = false;
        private treeChartPoints: ITreeChartDataPoint[];
        // tslint:disable-next-line:no-any
        private treeMapBarDiv: Selection<any>;
        // tslint:disable-next-line:no-any
        private body: Selection<any>;
        // tslint:disable-next-line:no-any
        private errorDiv: Selection<any>;
        // tslint:disable-next-line:no-any
        private errorText: Selection<any>;
        public dataView: DataView;
        // tslint:disable-next-line:no-any
        public optionsNew : any;
        // tslint:disable-next-line:no-any
        public optionsUpdate : any;
        public data : string[] = [];
        public dataNew : string[] = [];
        public dataAxis : string[] = [];
        // tslint:disable-next-line:no-any
        public selectionID : any = [];
        // tslint:disable-next-line:no-any
        public selectionIdNew : any = [];
        public selector : number = 0;
        public legendIndex : number = 0;
        private element: HTMLElement;
        private isLandingPageOn: boolean = false;
        private landingPageRemoved: boolean = false;
        // tslint:disable-next-line:no-any
        private landingPage: d3.Selection<any>;
        // tslint:disable-next-line:no-any
        private brickSelection: d3.selection.Update<any>;
        // tslint:disable-next-line:no-any
        private clearCatcher: d3.Selection<any>;
        private behavior: TreeBehavior;

        // tslint:disable-next-line:no-any
        public static config  : any = {
            xScalePadding: 0.1,
            solidOpacity: 1,
            transparentOpacity: 0.5
        };
        public resetOpacity() : void {
            // tslint:disable-next-line:no-any
            let legends: any;
            legends = d3.selectAll('.legendItem');
            groupColorArray = [];
            for (let loopiterator: number = 0; loopiterator < opacityObject.length; loopiterator++) {
                    THIS.getColorBands(opacityObject[loopiterator].color, opacityObject[loopiterator].count);

            }
            d3.selectAll('#child').style({
                opacity : 1,
                // tslint:disable-next-line:no-any
                'fill-opacity': function(d : any, i : any) : any {return groupColorArray[i]; }
            });
            d3.selectAll('.datalabels').style({ 'fill-opacity': TreemapBar.config.solidOpacity });
            // tslint:disable-next-line:no-any
            legends.select('circle').style({ fill : function(d : any): any { return globalcolor[d.tooltip]; } });
            legends.style({
                opacity : 1
            });

        }
        public rootClick(): void {
            const length : number = d3.selectAll('#child')[0].length;
            // tslint:disable-next-line:no-any
            const bricks: any = d3.selectAll('#child')[0];
            const width: number = this.optionsUpdate.viewport.width;
            let height: number = this.optionsUpdate.viewport.height;
            if (this.legend.getOrientation() === LegendPosition.BottomCenter
             || this.legend.getOrientation() === LegendPosition.Bottom) {
                height = height - this.legend.getMargins().height;
            }
            let heightBar: number = 0;
            let axisselected: string;
            let levelLiteral : number = 0;
            const legendArray: string = THIS.data.filter(
                // tslint:disable-next-line:typedef
                function (elem, indexIterator) {
                    return THIS.data.indexOf(elem) === indexIterator;
                }
            ).join('@#');
            const legendLengthArray: string[] = legendArray.split('@#');
            if (legendLengthArray.length === 1) {
                for (let iterator: number = 0; iterator < length; iterator++) {
                    if (bricks[iterator][dataLiteral][brickClass] === 'brick-selected') {
                        // tslint:disable-next-line:no-any
                        const d: any = bricks[iterator][dataLiteral];
                        bricks[iterator][dataLiteral][brickClass] = '';
                        if (d.parent.parent) {
                            axisselected = d.parent.parent.year;
                        } else {
                            axisselected = d.parent.year;
                        }
                        const globalarray: string = globalcategory.values.filter(
                            // tslint:disable-next-line:typedef
                            function (elem, indexIterator) {
                                return globalcategory.values.indexOf(elem) === indexIterator;
                            }
                        ).join('@#');
                        const tabarray: string[] = globalarray.split('@#');
                        tabarray.sort();
                        let index: number = 0;
                        for (let loopiterator: number = 0; loopiterator <
                            tabarray.length; loopiterator++) {
                            const categoryNew: string =
                                tabarray[loopiterator];
                            if (categoryNew === axisselected) {
                                index = loopiterator;
                            }
                        }
                        if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                            if (d.parent) {
                                if (d.parent.parent) {
                                    heightBar = d.parent.parent.dy;

                                } else {
                                    heightBar = d.parent.dy;

                                }
                            }
                            THIS.zoomSingle(d.parent,
                                            d.barwidth, heightBar, height, index, d.barheight);
                        } else {
                            if (d.parent) {
                                if (d.parent.parent) {
                                    heightBar = d.parent.parent.dx;

                                } else {
                                    heightBar = d.parent.dx;

                                }
                            }
                            THIS.zoomSingle(d.parent,
                                            heightBar, d.barwidth, width, index, d.barheight);
                        }
                    }
                }
            } else {
                const tabarrNew: string = globalcategory.values.filter(
                    // tslint:disable-next-line:typedef
                    function (elem, indexIterator) {
                        return globalcategory.values.indexOf(elem) === indexIterator;
                    }
                ).join('@#');
                const tabarrayNew: string[] = tabarrNew.split('@#');
                for (let loopiterator: number = 0; loopiterator <
                    tabarrayNew.length; loopiterator++) {
                    if (d3.selectAll(dotliteral + cellliteral + loopiterator).classed('zoom-selected1')) {
                        levelLiteral = 1;
                        break;
                    }
                    if (d3.selectAll(dotliteral + cellliteral + loopiterator).classed('zoom-selected')) {
                        //from one level to zero level
                        levelLiteral = 0;
                        d3.selectAll(dotliteral + cellliteral + loopiterator).classed('zoom-selected', false);
                        d3.selectAll(dotliteral + cellliteral + loopiterator).classed('backward', true);
                        break;
                    }
                    if (d3.selectAll(dotliteral + cellliteral + loopiterator).classed('backward')) {
                        levelLiteral = 0;
                        break;
                    }
                }
                if (levelLiteral === 1) {
                    for (let iterator: number = 0; iterator < length; iterator++) {
                        if (bricks[iterator][dataLiteral][brickClass] === 'brick-selected1') {
                            // tslint:disable-next-line:no-any
                            const d: any = bricks[iterator][dataLiteral];
                            bricks[iterator][dataLiteral][brickClass] = 'brick-selected';
                            if (d.parent.parent) {
                                axisselected = d.parent.parent.year;
                            } else {
                                axisselected = d.parent.year;
                            }
                            const globalarray: string = globalcategory.values.filter(
                                // tslint:disable-next-line:typedef
                                function (elem, indexIterator) {
                                    return globalcategory.values.indexOf(elem) === indexIterator;
                                }
                            ).join('@#');
                            const tabarray: string[] = globalarray.split('@#');
                            tabarray.sort();
                            let index: number = 0;
                            for (let loopiterator: number = 0; loopiterator <
                                tabarray.length; loopiterator++) {
                                const categoryNew: string =
                                    tabarray[loopiterator];
                                if (categoryNew === axisselected) {
                                    index = loopiterator;
                                }
                            }
                            if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                                if (d.parent) {
                                    if (d.parent.parent) {
                                        heightBar = d.parent.parent.dy;

                                    } else {
                                        heightBar = d.parent.dy;

                                    }
                                }
                                THIS.zoom(d.parent,
                                          d.barwidth, heightBar, height, index, d.barheight);
                            } else {
                                if (d.parent) {
                                    if (d.parent.parent) {
                                        heightBar = d.parent.parent.dx;

                                    } else {
                                        heightBar = d.parent.dx;

                                    }
                                }
                                THIS.zoom(d.parent,
                                          heightBar, d.barwidth, width, index, d.barheight);
                            }
                        }
                    }
                } else {
                    for (let iterator: number = 0; iterator < length; iterator++) {
                        if (bricks[iterator][dataLiteral][brickClass] === 'brick-selected') {
                            // tslint:disable-next-line:no-any
                            const d: any = bricks[iterator][dataLiteral];
                            bricks[iterator][dataLiteral][brickClass] = '';
                            if (d.parent.parent) {
                                axisselected = d.parent.parent.year;
                            } else {
                                axisselected = d.parent.year;
                            }
                            const tabarray: string = globalcategory.values.filter(
                                // tslint:disable-next-line:typedef
                                function (elem, indexIterator) {
                                    return globalcategory.values.indexOf(elem) === indexIterator;
                                }
                            ).join('@#');
                            const tabArray: string[] = tabarray.split('@#');
                            tabArray.sort();
                            let index: number = 0;
                            for (let loopiterator: number = 0; loopiterator <
                                tabArray.length; loopiterator++) {
                                const categoryNew: string =
                                    tabArray[loopiterator];
                                if (categoryNew === axisselected) {
                                    index = loopiterator;
                                }
                            }
                            d3.selectAll(dotliteral + cellliteral + index).classed('backward', true);
                            if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                                if (d.parent) {
                                    if (d.parent.parent) {
                                        heightBar = d.parent.parent.dy;

                                    } else {
                                        heightBar = d.parent.dy;

                                    }
                                }
                                THIS.zoom(d.parent.parent,
                                          d.barwidth, heightBar, height, index, d.barheight);
                            } else {
                                if (d.parent) {
                                    if (d.parent.parent) {
                                        heightBar = d.parent.parent.dx;

                                    } else {
                                        heightBar = d.parent.dx;

                                    }
                                }
                                THIS.zoom(d.parent.parent,
                                          heightBar, d.barwidth, width, index, d.barheight);

                            }
                        }
                    }
                }
            }
        }
        // tslint:disable-next-line:no-any
        public clicked(d : any) : void {
            const width: number = this.optionsUpdate.viewport.width;
            let height: number = this.optionsUpdate.viewport.height;
            if (this.legend.getOrientation() === LegendPosition.BottomCenter
             || this.legend.getOrientation() === LegendPosition.Bottom) {
                height = height - this.legend.getMargins().height;
            }
            let heightBar: number = 0;
            let axisselected: string;
            if (d.parent.parent) {
                axisselected = d.parent.parent.year;
            } else {
                axisselected = d.parent.year;
            }
            const tabarrNew: string = globalcategory.values.filter(
                // tslint:disable-next-line:typedef
                function (elem, indexIterator) {
                    return globalcategory.values.indexOf(elem) === indexIterator;
                }
            ).join('@#');
            const tabarrayNew: string[] = tabarrNew.split('@#');
            tabarrayNew.sort();
            let index: number = 0;
            for (let loopiterator: number = 0; loopiterator <
                tabarrayNew.length; loopiterator++) {
                const categoryNew: string =
                    tabarrayNew[loopiterator];
                if (categoryNew === axisselected) {
                    index = loopiterator;
                }
            }
            if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                if (d.parent) {
                    if (d.parent.parent) {
                        heightBar = d.parent.parent.dy;

                    } else {
                        heightBar = d.parent.dy;

                    }
                }
                if (d3.selectAll(dotliteral + cellliteral + index).classed('backward')) {
                    return THIS.zoom(d.parent.parent,
                                     d.barwidth, heightBar, height, index, d.barheight);
                }
                if (d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected')) {
                    $(d).attr('brickClass', 'brick-selected1');

                    return THIS.zoom(d,
                                     d.barwidth, heightBar, height, index, d.barheight);
                }
                if (!d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected1')) {
                    $(d).attr('brickClass', 'brick-selected');

                    return THIS.zoom(d.parent,
                                     d.barwidth, heightBar, height, index, d.barheight);
                }

            } else {
                if (d.parent) {
                    if (d.parent.parent) {
                        heightBar = d.parent.parent.dx;

                    } else {
                        heightBar = d.parent.dx;

                    }
                }
                if (d3.selectAll(dotliteral + cellliteral + index).classed('backward')) {
                    return THIS.zoom(d.parent.parent,
                                     heightBar, d.barwidth, width, index, d.barheight);
                }
                if (d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected')) {
                    $(d).attr('brickClass', 'brick-selected1');

                    return THIS.zoom(d,
                                     heightBar, d.barwidth, width, index, d.barheight);
                }
                if (!d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected1')) {
                    $(d).attr('brickClass', 'brick-selected');

                    return THIS.zoom(d.parent,
                                     heightBar, d.barwidth, width, index, d.barheight);
                }
            }
        }
        // tslint:disable-next-line:no-any
        public clickedSingle(d: any): void {
            const width: number = this.optionsUpdate.viewport.width;
            let height: number = this.optionsUpdate.viewport.height;
            if (this.legend.getOrientation() === LegendPosition.BottomCenter
             || this.legend.getOrientation() === LegendPosition.Bottom) {
                height = height - this.legend.getMargins().height;
            }
            let heightBar: number = 0;
            let axisselected: string;
            if (d.parent.parent) {
                axisselected = d.parent.parent.year;
            } else {
                axisselected = d.parent.year;
            }
            const tabarrNew: string = globalcategory.values.filter(
                // tslint:disable-next-line:typedef
                function (elem, indexIterator) {
                    return globalcategory.values.indexOf(elem) === indexIterator;
                }
            ).join('@#');
            const tabarrayNew: string[] = tabarrNew.split('@#');
            tabarrayNew.sort();
            let index: number = 0;
            for (let loopiterator: number = 0; loopiterator <
                tabarrayNew.length; loopiterator++) {
                const categoryNew: string =
                    tabarrayNew[loopiterator];
                if (categoryNew === axisselected) {
                    index = loopiterator;
                }
            }
            if (!d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected')) {
                if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                    if (d.parent) {
                        if (d.parent.parent) {
                            heightBar = d.parent.parent.dy;

                        } else {
                            heightBar = d.parent.dy;

                        }
                    }
                    $(d).attr('brickClass', 'brick-selected');

                    return THIS.zoomSingle(d,
                                           d.barwidth, heightBar, height, index, d.barheight);
                } else {
                    if (d.parent) {
                        if (d.parent.parent) {
                            heightBar = d.parent.parent.dx;

                        } else {
                            heightBar = d.parent.dx;

                        }
                    }
                    $(d).attr('brickClass', 'brick-selected1');

                    return THIS.zoomSingle(d,
                                           heightBar, d.barwidth, width, index, d.barheight);
                }
            }
        }
        public clearAnimation(index : number ): void {
            d3.selectAll(dotliteral + cellliteral + index).select('rect').attr('fill', 'none');
            d3.selectAll(dotliteral + cellliteral + index).select('rect').style('fill-opacity', 0);
            d3.selectAll(dotliteral + cellliteral + index).select('rect').style('stroke', 'none');
            d3.selectAll(dotliteral + cellliteral + index).select('rect').style('stroke-width', '0');
            d3.selectAll(dotliteral + cellliteral + index).select(dotliteral + dataRectLiteral).attr('fill', 'none');
        }
        public replaceString(name: string): string {
            name = name.replace(/[^A-Z0-9]/ig, 'sp');
            // tslint:disable-next-line:no-any
            const regExp : any = /^[0-9].*$/;
            if (regExp.test(name)) {
                name = numericLiteral + name;
            }

            return name;
        }
        // tslint:disable-next-line:no-any
        public animationRenderZoom(d: any, index: number, multiplier: number,
                                      // tslint:disable-next-line:no-any
                                   height: number, x: any, y: any, kx: number, ky: number, h: number, t: any, type : string) : void {
            let parentliteral2 : string = '';
            if (type === 'ZoomIn') {
                parentliteral2 = this.replaceString(d.parent[nameliteral].toString());
            }
            // tslint:disable-next-line:no-any
            let required2 : any ;
            this.clearAnimation(index);
            const parentliteral1: string = dotliteral + this.replaceString(d.name.toString());
            d3.selectAll(dotliteral + cellliteral + index).select(dotliteral + dataRectLiteral).attr('fill', 'none');
            let parentLiteralClass : string = '';
            const parentliteralNew: string = dotliteral + this.replaceString(d.name.toString());
            // tslint:disable-next-line:no-any
            const titlerects: any = d3.selectAll(dotliteral + cellliteral + index).select(parentliteralNew + dataRectLiteral);

            if (type === 'ZoomIn') {
                d3.selectAll(dotliteral + cellliteral + index).selectAll(dotliteral + dataRectLiteral).attr('fill', 'none');
                const parentliteralText: string = this.replaceString(d.parent[nameliteral].toString());
                parentLiteralClass = parentliteralText + dataRectLiteral;
                const lenTitle: number = titlerects[0].length;
                //for title background
                for (let iterator: number = 0; iterator < lenTitle; iterator++) {
                    if (titlerects[0][iterator] != null && d3.selectAll(dotliteral + cellliteral + index).select(parentLiteralClass)) {
                        if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                            let widthArray: number = 0;
                            d3.select(titlerects[0][iterator])
                                // tslint:disable-next-line:no-any
                                .style('fill-opacity', function (dIterator : any) : number {
                                    const text: string = dIterator[nameLiteral];
                                    const xAxisPropNew: TextProperties = {
                                        text: String(text),
                                        fontFamily: THIS.settings.dataLabels.fontFamily,
                                        fontSize: THIS.settings.dataLabels.fontSize + pixelLiteral
                                    };
                                    const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                                    const tempVariableX: number = dIterator.dx * kx - 1;
                                    const tempVariableY: number = dIterator.dy * ky - 1;
                                    widthArray = measureWidth / 2;
                                    if (measureWidth > tempVariableX || textHeight > tempVariableY) {
                                        return 0;
                                    } else {
                                        return THIS.limitValue(THIS.lowerLimitValue
                                            (THIS.settings.dataLabels.rectopacity, 0),
                                                               1);
                                    }
                                })
                                // tslint:disable-next-line:no-any
                                .attr('x', function (axiskIterator : any) : number {
                                    return x(axiskIterator.x) + multiplier +
                                    tenthValue + Math.max(kx * axiskIterator.dx - 1) / 2 - widthArray;
                                })
                                // tslint:disable-next-line:no-any
                                .attr('y', function (lIterator : any) : number {
                                    return (height - h - heightPaddingValue)
                                     + y(lIterator.y) + Math.max(ky * lIterator.dy - 1) / 2 - textHeight;
                                })
                                .attr('fill', THIS.settings.dataLabels.backgroundColor);
                        } else {
                            let widthArray: number = 0;
                            d3.select(titlerects[0][iterator])
                            // tslint:disable-next-line:no-any
                                .style('fill-opacity', function (eIterator : any)  : number {
                                    const text: string = eIterator[nameLiteral];
                                    const xAxisPropNew: TextProperties = {
                                        text: String(text),
                                        fontFamily: THIS.settings.dataLabels.fontFamily,
                                        fontSize: THIS.settings.dataLabels.fontSize + pixelLiteral
                                    };
                                    const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                                    const tempVariableX: number = eIterator.dx * kx - 1;
                                    const tempVariableY: number = eIterator.dy * ky - 1;
                                    widthArray = measureWidth / 2;
                                    if (measureWidth > tempVariableX || textHeight > tempVariableY) {
                                        return 0;
                                    } else {
                                        return THIS.limitValue(THIS.lowerLimitValue
                                            (THIS.settings.dataLabels.rectopacity, 0),
                                                               1);
                                    }
                                })
                                // tslint:disable-next-line:no-any
                                .attr('x', function (axiskIterator : any)  : number {

                                    return x(axiskIterator.x) + xaxisPaddingValue + Math.max(kx * axiskIterator.dx) / 2 - widthArray;
                                })
                                // tslint:disable-next-line:no-any
                                .attr('y', function (lIterator : any)  : number {
                                    return y(lIterator.y) + multiplier + tenthValue + Math.max(ky * lIterator.dy) / 2 - textHeight;
                                })
                                .attr('fill', THIS.settings.dataLabels.backgroundColor);
                        }
                    }
                }
            } else {
                //condition change
                const lenTitle: number = titlerects[0].length;
                d3.selectAll(dotliteral + cellliteral + index).selectAll(dotliteral + dataRectLiteral).attr('fill', 'none');
                 //for title background
                for (let iterator: number = 0; iterator < lenTitle; iterator++) {
                if (titlerects[0][iterator] != null ) {
                    if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                        let widthArray : number = 0;
                        d3.select(titlerects[0][iterator])
                        // tslint:disable-next-line:no-any
                        .style('fill-opacity', function (dIterator : any) : number {
                            const text: string = dIterator[nameLiteral];
                            const xAxisPropNew: TextProperties = {
                                text: String(text),
                                fontFamily: THIS.settings.dataLabels.fontFamily,
                                fontSize: THIS.settings.dataLabels.fontSize + pixelLiteral
                            };
                            const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                            const tempVariableX: number = dIterator.dx * kx - 1;
                            const tempVariableY: number = dIterator.dy * ky - 1;
                            widthArray = measureWidth / 2;
                            if (measureWidth > tempVariableX || textHeight > tempVariableY) {
                                return 0;
                            } else {
                                return THIS.limitValue(THIS.lowerLimitValue
                                    (THIS.settings.dataLabels.rectopacity, 0),
                                                       1);
                            }
                        })
                            // tslint:disable-next-line:no-any
                            .attr('x', function (axiskIterator : any) : number {

                                return x(axiskIterator.x) + multiplier + tenthValue + Math.max(kx * axiskIterator.dx - 1) / 2 - widthArray;
                            })
                            // tslint:disable-next-line:no-any
                            .attr('y', function (lIterator : any) : number {
                                return (height - h - heightPaddingValue)
                                + y(lIterator.y) + Math.max(ky * lIterator.dy - 1) / 2 - textHeight;
                            })
                            .attr('fill', THIS.settings.dataLabels.backgroundColor);
                    } else {
                        let widthArray : number = 0;
                        d3.select(titlerects[0][iterator])
                        // tslint:disable-next-line:no-any
                        .style('fill-opacity', function (eIterator : any): number {
                            const text: string = eIterator[nameLiteral];
                            const xAxisPropNew: TextProperties = {
                                text: String(text),
                                fontFamily: THIS.settings.dataLabels.fontFamily,
                                fontSize: THIS.settings.dataLabels.fontSize + pixelLiteral
                            };
                            const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                            const tempVariableX: number = eIterator.dx * kx - 1;
                            const tempVariableY: number = eIterator.dy * ky - 1;
                            widthArray = measureWidth / 2;
                            if (measureWidth > tempVariableX || textHeight > tempVariableY) {
                                return 0;
                            } else {
                                return THIS.limitValue(THIS.lowerLimitValue
                                    (THIS.settings.dataLabels.rectopacity, 0),
                                                       1);
                            }
                        })
                            // tslint:disable-next-line:no-any
                            .attr('x', function (axiskIterator : any) : number {

                                return x(axiskIterator.x) + xaxisPaddingValue + Math.max(kx * axiskIterator.dx) / 2 - widthArray;
                            })
                            // tslint:disable-next-line:no-any
                            .attr('y', function (lIterator : any) : number {
                                return y(lIterator.y) + multiplier + tenthValue + Math.max(ky * lIterator.dy) / 2 - textHeight;
                            })
                            .attr('fill', THIS.settings.dataLabels.backgroundColor);

                    }
                }
            }
            }
            //tslint:disable-next-line:no-any
            const required1: any = d3.selectAll(dotliteral + cellliteral + index).select(parentliteral1);
            const len1: number = required1[0].length;
            if (type === 'ZoomIn') {
                required2 = required1.select(parentliteral2);
            }
            let nonEnptyLength: number = 0;
            for (let loopIterator: number = 0; loopIterator < len1; loopIterator++) {
                if (required1[0][loopIterator] != null) {
                    nonEnptyLength += 1;
                }
            }
            groupColorArray = [];
            let count: number = 0;
            const parentColor: string = globalcolor[d[nameliteral]];
            THIS.getColorBands(parentColor, nonEnptyLength);
            if (type === 'ZoomIn') {
                for (let iterator: number = 0; iterator < len1; iterator++) {
                    if ( required1[0][iterator] != null && d3.select(required1[0][iterator]).classed(parentliteral2)) {
                        d3.select(required1[0][iterator])
                            .attr('fill', globalcolor[d.parent[nameliteral]])
                            .style({
                                'fill-opacity': d.opacity,
                                stroke: THIS.settings.borderSettings.color,
                                'stroke-width': THIS.limitValue(THIS.lowerLimitValue
                                    (THIS.settings.borderSettings.borderstroke, 1),
                                                                fifthValue),
                                'stroke-opacity': THIS.limitValue(THIS.lowerLimitValue
                                    (THIS.settings.borderSettings.borderopacity, 0),
                                                                  1)

                            });
                        count++;
                    }
                }

            } else {
                for (let iterator: number = 0; iterator < len1; iterator++) {
                    if (required1[0][iterator] != null) {
                        d3.select(required1[0][iterator])
                            .attr('fill', globalcolor[d[nameliteral]])
                            .style({
                                'fill-opacity': groupColorArray[count],
                                stroke: THIS.settings.borderSettings.color,
                                'stroke-width': THIS.limitValue(THIS.lowerLimitValue
                                    (THIS.settings.borderSettings.borderstroke, 1),
                                                                fifthValue),
                                'stroke-opacity': THIS.limitValue(THIS.lowerLimitValue
                                    (THIS.settings.borderSettings.borderopacity, 0),
                                                                  1)

                            });
                        count++;
                    }
                }
            }
            //for text
            if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                t.select('text')
                    // tslint:disable-next-line:no-any
                    .attr('x', function (aIterator : any)
                    : number { return x(aIterator.x) + multiplier + tenthValue + (kx * aIterator.dx - 1) / 2; })
                    // tslint:disable-next-line:no-any
                    .attr('y', function (bIterator : any) : number {
                        return (height - h - xaxisPaddingValue + y(bIterator.y)) + (ky * bIterator.dy - 1) / 2; });
            } else {
                t.select('text')
                    // tslint:disable-next-line:no-any
                    .attr('x', function (mIterator : any)
                    : number { return x(mIterator.x) + xaxisPaddingValue + (kx * mIterator.dx - 1) / 2; })
                    // tslint:disable-next-line:no-any
                    .attr('y', function (dIterator : any)
                    : number { return y(dIterator.y) + multiplier + tenthValue + (ky * dIterator.dy - 1) / 2; });
            }
            t.select('text')
                // tslint:disable-next-line:no-any
                .text(function (textIterator : any) : string {
                    const text: string = textIterator[nameLiteral];
                    const xAxisPropNew: TextProperties = {
                        text: String(text),
                        fontFamily: THIS.settings.dataLabels.fontFamily,
                        fontSize: THIS.settings.dataLabels.fontSize + pixelLiteral
                    };
                    const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                    const measureHeight: number = textHeight;
                    const tempVariableX: number = textIterator.dx * kx - 1;
                    const tempVariableY: number = textIterator.dy * ky - 1;
                    if (measureWidth > tempVariableX || measureHeight > tempVariableY) {
                        return '';
                    } else {
                        return text;
                    }

                })
                .duration(1000);
            // tslint:disable-next-line:no-any
            d3.selectAll(dotliteral + cellliteral + index).select('text').style('fill', 'none');
            if (type === 'ZoomIn') {
                const parentliteral: string = hashliteral + this.replaceString(d.parent[nameliteral].toString());
                const parentliteralText: string = this.replaceString(d.name.toString());
                // tslint:disable-next-line:no-any
                const required: any = d3.selectAll(dotliteral + cellliteral + index).select(parentliteral);
                const len: number = required[0].length;
                for (let iterator: number = 0; iterator < len; iterator++) {
                    if (required[0][iterator] != null && d3.select(required[0][iterator]).classed(parentliteralText)) {
                        d3.select(required[0][iterator]).style({
                            'font-size': THIS.settings.dataLabels.fontSize + pixelLiteral,
                            margin: 'auto', display: 'block',
                            fill: THIS.settings.dataLabels.color,
                            'font-family': THIS.settings.dataLabels.fontFamily
                        });
                    }
                }
            } else {
                const parentliteral: string = hashliteral + this.replaceString(d.name.toString());
                // tslint:disable-next-line:no-any
                const required: any = d3.selectAll(dotliteral + cellliteral + index).select(parentliteral);
                const len: number = required[0].length;
                for (let iterator: number = 0; iterator < len; iterator++) {
                    if (required[0][iterator] != null) {
                        d3.select(required[0][iterator]).style({
                            'font-size': THIS.settings.dataLabels.fontSize + pixelLiteral,
                            margin: 'auto', display: 'block',
                            fill: THIS.settings.dataLabels.color,
                            'font-family': THIS.settings.dataLabels.fontFamily
                        });
                    }
                }

            }
        }
        // tslint:disable-next-line:no-any
        public animationBackward(d: any, index: number, multiplier: number,
                                 // tslint:disable-next-line:no-any
                                 height: number, x: any, y: any, kx: number, ky: number, h: number, t: any) : void {
            //for bricks
            t.select('rect')
                .attr({
                    // tslint:disable-next-line:no-any
                    width : function (fIterator : any) : number {return Math.max(kx * fIterator.dx - 1 , 0); },
                    // tslint:disable-next-line:no-any
                    height : function (gIterator : any) : number {return Math.max(ky * gIterator.dy - 1 , 0); },
                    // tslint:disable-next-line:no-any
                    fill : function (fillIterator : any, i : number) : any {
                        return fillIterator.children ? null : globalcolor[fillIterator.parent[nameliteral]]; }
                })
                .style({
                    // tslint:disable-next-line:no-any
                    'fill-opacity' : function (fillIterator : any, i : number) : any {return groupColorArray[i]; },
                    // tslint:disable-next-line:no-any
                    stroke : function (mIterator : any) : any {return THIS.settings.borderSettings.color; },
                    // tslint:disable-next-line:no-any
                    'stroke-width' : function (nIterator : any) : number {return THIS.limitValue(THIS.lowerLimitValue
                            (THIS.settings.borderSettings.borderstroke, 1),
                                                                                                 fifthValue); },
                    // tslint:disable-next-line:no-any
                    'stroke-opacity': function (kIterator : any) : number {return THIS.limitValue(THIS.lowerLimitValue
                            (THIS.settings.borderSettings.borderopacity, 0),
                                                                                                  1);
                    }
                });
            //for background texts
            if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                // tslint:disable-next-line:no-any
                const widthArray : any = [];
                let textIterator : number = -1;
                d3.selectAll(dotliteral + cellliteral + index).selectAll(dotliteral + dataRectLiteral).style('fill-opacity', 0);
                d3.selectAll(dotliteral + cellliteral + index).selectAll(dotliteral + dataRectLiteral).transition()
                    // tslint:disable-next-line:no-any
                    .style('fill-opacity', function (aIterator : any) : number {
                        const text: string = aIterator[nameLiteral];
                        const xAxisPropNew: TextProperties = {
                            text: String(text),
                            fontFamily: THIS.settings.dataLabels.fontFamily,
                            fontSize: THIS.settings.dataLabels.fontSize + pixelLiteral
                        };
                        const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                        widthArray.push(measureWidth / 2);
                        if (measureWidth > (ky * aIterator.dx) || textHeight > (ky * aIterator.dy)) {
                            return 0;
                        } else {
                            return THIS.limitValue(THIS.lowerLimitValue
                                (THIS.settings.dataLabels.rectopacity, 0),
                                                   1);
                        }
                    })
                    .attr({
                        // tslint:disable-next-line:no-any
                        x : function (axiskIterator : any) : number {
                            textIterator++;

                            return x(axiskIterator.x) + multiplier +
                             tenthValue + Math.max(kx * axiskIterator.dx - 1) / 2 - widthArray[textIterator]; },
                        // tslint:disable-next-line:no-any
                        y : function (lIterator : any) : number {
                            return (height - h - heightPaddingValue) + y(lIterator.y) + Math.max(ky * lIterator.dy - 1) / 2 - textHeight; },
                        // tslint:disable-next-line:no-any
                        fill : function (cIterator : any) : any {return THIS.settings.dataLabels.backgroundColor; }
                    });

            } else {
                // tslint:disable-next-line:no-any
                const widthArray : any = [];
                let iTerator : number = -1;
                d3.selectAll(dotliteral + cellliteral + index).selectAll(dotliteral + dataRectLiteral).style('fill-opacity', 0);
                d3.selectAll(dotliteral + cellliteral + index).selectAll(dotliteral + dataRectLiteral).transition()
                    // tslint:disable-next-line:no-any
                    .style('fill-opacity', function (bIterator : any) : number {
                        const text: string = bIterator[nameLiteral];
                        const xAxisPropNew: TextProperties = {
                            text: String(text),
                            fontFamily: THIS.settings.dataLabels.fontFamily,
                            fontSize: THIS.settings.dataLabels.fontSize + pixelLiteral
                        };
                        const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                        widthArray.push(measureWidth / 2);
                        if (measureWidth > (ky * bIterator.dx) || textHeight > (ky * bIterator.dy)) {
                            return 0;
                        } else {
                            return THIS.limitValue(THIS.lowerLimitValue
                                (THIS.settings.dataLabels.rectopacity, 0),
                                                   1);
                        }
                    })
                    .attr({
                        // tslint:disable-next-line:no-any
                        x: function (axiskIterator : any) : number {
                            iTerator++;

                            return x(axiskIterator.x) + xaxisPaddingValue + Math.max(kx * axiskIterator.dx) / 2 - widthArray[iTerator]; },
                        // tslint:disable-next-line:no-any
                        y: function (lIterator : any) : number {
                            return y(lIterator.y) + multiplier + tenthValue + Math.max(ky * lIterator.dy) / 2 - textHeight; },
                        fill: THIS.settings.dataLabels.backgroundColor
                    });

            }
            // for text
            if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                t.select('text')
                    // tslint:disable-next-line:no-any
                    .attr('x', function (axiskIterator: any): number {
                        return (axiskIterator.x + multiplier +
                            tenthValue) + axiskIterator.dx / 2;
                    })
                    // tslint:disable-next-line:no-any
                    .attr('y', function (lIterator : any):
                     number { return (height - h - xaxisPaddingValue) + lIterator.y + lIterator.dy / 2; })
                    .style({ 'fill-opacity': TreemapBar.config.solidOpacity });
            } else {
                t.select('text')
                    // tslint:disable-next-line:no-any
                    .attr('x', function (mIterator : any): number { return xaxisPaddingValue + mIterator.x + mIterator.dx / 2; })
                    // tslint:disable-next-line:no-any
                    .attr('y', function (nIterator : any): number { return (nIterator.y + multiplier + tenthValue) + nIterator.dy / 2; })
                    .style({ 'fill-opacity': TreemapBar.config.solidOpacity });
            }
            t.select('text')
                // tslint:disable-next-line:no-any
                .text(function (xIterator : any) : string {
                    const text: string = xIterator[nameLiteral];
                    const xAxisPropNew: TextProperties = {
                        text: String(text),
                        fontFamily: THIS.settings.dataLabels.fontFamily,
                        fontSize: THIS.settings.dataLabels.fontSize + pixelLiteral
                    };
                    const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                    const measureHeight: number = textHeight;
                    const tempVariableX: number = xIterator.dx * kx - 1;
                    const tempVariableY: number = xIterator.dy * ky - 1;
                    if (measureWidth > tempVariableX || measureHeight > tempVariableY) {
                        return '';
                    } else {
                        return text;
                    }

                })
                .style({
                    'font-size': THIS.settings.dataLabels.fontSize + pixelLiteral,
                    margin: 'auto', display: 'block',
                    fill: THIS.settings.dataLabels.color,
                    'font-family': THIS.settings.dataLabels.fontFamily
                });
            d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected', false);
            d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected1', false);
        }
        // tslint:disable-next-line:no-any
        private addSelection(dataPoints: any): void {
            const behaviorOptions: ITreeBehaviorOptions = {
                clearCatcher: d3.select('.barChart'),
                brickSelection: d3.selectAll('#child').data(dataPoints),
                legendSelection: d3.selectAll('.legendItem'),
                interactivityService: this.interactivityService
            };
            this.interactivityService.bind(
                globalTreeChartDataPoints,
                this.behavior,
                behaviorOptions,
                {
                });
        }

        private createLegendData(dataView: DataView, host: IVisualHost, settings: TreeMapBarSettings): LegendData {
            let legendTitle : string = '';
            // tslint:disable-next-line:no-any
            const dataViewVariable : any = this.dataView.categorical.categories;
            if (this.dataView && this.dataView.categorical && dataViewVariable) {
                legendTitle = this.optionsUpdate.dataViews[0].categorical.values.source.displayName;
            }
            const legendData: LegendData = {
                fontSize: this.settings.enableAxis.fontSize,
                dataPoints: [],
                title: this.settings.enableAxis.showTitle ? (this.settings.enableAxis.titleText !== '' ?
                    this.settings.enableAxis.titleText : legendTitle) : null,
                labelColor: this.settings.enableAxis.labelColor
            };
            let iterator : number = 0;
            // tslint:disable-next-line:no-any
            const label : any = [];
            while (iterator < this.dataPoints.length) {
                label.push((iterator + 1).toString());
                iterator++;
            }
            const groups: DataViewValueColumnGroup[] = this.optionsUpdate.dataViews[0].categorical.values.grouped();
            groups.forEach((group: DataViewValueColumnGroup, jterator : number) => {
                legendData.dataPoints.push({
                    label: this.dataPoints[jterator].category === 'null' ? '(Blank)' : this.dataPoints[jterator].category,
                    color: this.dataPoints[jterator].color,
                    icon: LegendIcon.Circle,
                    selected: false,
                    identity : host.createSelectionIdBuilder()
                    .withSeries(this.optionsUpdate.dataViews[0].categorical.values, group)
                    .createSelectionId()
                });
            });

            return legendData;

        }
        //function to check if value exists
        // tslint:disable-next-line:no-any
        public checkIfExists(childrenNew : any, valueToCheck : any) : boolean {
            for (let iIterator: number = 0; iIterator < childrenNew.length; iIterator++) {
                if (childrenNew[iIterator].name === valueToCheck) {
                    return false;
                }
            }

            return true;
        }
        // function to sort array of objects based on axis
        // tslint:disable-next-line:no-any
        public compare(a: any, b: any): number {
            const returnValue : number = a.axis > b.axis ? 1 : a.axis < b.axis ? -1 : 0;

            return returnValue;
        }
        // tslint:disable-next-line:no-any
        public bubbleSort(arr : any) : any {
            const len : number = arr.length;
            for (let outerIterator: number = len - 1; outerIterator >= 0; outerIterator--) {
              for (let innerIterator : number = 1; innerIterator <= outerIterator; innerIterator++) {
                if (arr[innerIterator - 1].axis > arr[innerIterator].axis) {
                    // tslint:disable-next-line:no-any
                    const temp : any = arr[innerIterator - 1];
                    arr[innerIterator - 1] = arr[innerIterator];
                    arr[innerIterator] = temp;
                 }
              }
            }

            return arr;
         }
        // tslint:disable-next-line:no-any
        public compareValue(a: any, b: any): number {
            return parseFloat(a.value) - parseFloat(b.value);

        }
        public limitValue(a: number, b: number): number {
            const returnValue : number = a <= b ? a : b;

            return returnValue;
        }
        public lowerLimitValue(a: number, b: number): number {
            const returnValue : number = a < b ? b : a;

            return returnValue;
        }

        // tslint:disable-next-line:no-any
        public getColorBands(color : any , bands : any) : any {
            for (let index  : number = 1; index <= bands; index++) {
                // tslint:disable-next-line:no-any
                const fraction : any = (index) / parseFloat(bands );
                groupColorArray.push(fraction);
            }

            return groupColorArray;
        }
        // tslint:disable-next-line:no-any
        public darken( color : any , fraction : any) : any {
            if (fraction < 0.1) {
                fraction = 0.1;
            }
            // tslint:disable-next-line:no-any
            const code : any = d3.rgb(color);
            // tslint:disable-next-line:no-any
            const hexColor : any = this.rgbToHex(code.r, code.g, code.b);
            // tslint:disable-next-line:no-any
            const transparentColor : any = ColorHelper.hexToRGBString(hexColor, fraction);

            return transparentColor;
        }
        // tslint:disable-next-line:no-any
        public componentToHex(c : any) : any {
            const hex : string = c.toString(16);

            return hex.length === 1 ? zeroOnlyLiteral + hex : hex;
        }

        // tslint:disable-next-line:no-any
        public rgbToHex(r : any, g : any, b : any) : any {
            return hashliteral + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
        }
        public remove() : void {
            d3.selectAll('.legend #legendGroup .legendItem, .legend #legendGroup .legendTitle');
            d3.select('.legend').remove();
            d3.select('.barmsg').remove();
            d3.select('.barChart').remove();
            d3.select('.barChart').selectAll('*').remove();
            d3.select('.barMessageText').remove();
            d3.select('.clearCatcher').remove();
        }
        public parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }
        // method to set the display units when selected as auto
        public getAutoDisplayUnits(valLen: number): number {
            let displayValNew: number;
            if (valLen > 9) {
                displayValNew = 1e9;
            } else if (valLen <= 9 && valLen > sixthValue) {
                displayValNew = 1e6;
            } else if (valLen <= sixthValue && valLen >= 4) {
                displayValNew = 1e3;
            } else {
                displayValNew = tenthValue;
            }

            return displayValNew;
        }
        constructor(options: VisualConstructorOptions) {
            this.optionsNew = options;
            this.host = options.host;
            this.element = options.element;
            this.selectionManager = options.host.createSelectionManager();
            this.interactivityService = createInteractivityService(options.host);
            this.behavior = new TreeBehavior();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
        }

        /**
         * Enumerates through the objects defined in the capabilities and adds the properties to the format pane
         *
         *
         * @function
         * @param {EnumerateVisualObjectInstancesOptions} options - Map of defined objects
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[]
        | VisualObjectInstanceEnumerationObject {
            // tslint:disable-next-line:typedef
            const objectName = options.objectName;
            const objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case 'enableAxis':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.enableAxis.show,
                            position: this.settings.enableAxis.position,
                            showTitle: this.settings.enableAxis.showTitle,
                            fontSize: this.settings.enableAxis.fontSize,
                            labelColor: this.settings.enableAxis.labelColor
                        },
                        selector: null
                    });
                    if (this.settings.enableAxis.showTitle) {
                        objectEnumeration.push({
                            objectName: objectName,
                            selector: null,
                            properties: {
                                titleText: this.settings.enableAxis.titleText === '' ?
                                    this.optionsUpdate.dataViews[0].metadata.columns[this.legendIndex].displayName
                                    : this.settings.enableAxis.titleText
                            }
                        });
                    }

                    return objectEnumeration;
                case 'chartOrientation':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            orientation: this.settings.chartOrientation.orientation
                        },
                        selector: null
                    });

                    return objectEnumeration;
                case 'dataLabels':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.dataLabels.show,
                            color: this.settings.dataLabels.color,
                            fontSize : this.settings.dataLabels.fontSize,
                            fontFamily: this.settings.dataLabels.fontFamily,
                            title : this.settings.dataLabels.title

                        },
                        selector: null
                    });
                    if (this.settings.dataLabels.title) {
                        objectEnumeration.push({
                            objectName: objectName,
                            selector: null,
                            properties: {
                                backgroundColor: this.settings.dataLabels.backgroundColor,
                                rectopacity: this.limitValue(this.lowerLimitValue
                                    (this.settings.dataLabels.rectopacity , 0),
                                                             1)
                            }
                        });
                    }

                    return objectEnumeration;
                case 'xaxisLabels':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            color: this.settings.xaxisLabels.color,
                            fontSize: this.limitValue(this.settings.xaxisLabels.fontSize , xaxisPaddingValue),
                            fontFamily: this.settings.xaxisLabels.fontFamily
                        },
                        selector: null
                    });

                    return objectEnumeration;
                case 'totalLabels':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show : this.settings.totalLabels.show,
                            color: this.settings.totalLabels.color,
                            fontSize: this.settings.totalLabels.fontSize,
                            fontFamily: this.settings.totalLabels.fontFamily,
                            displayUnits : this.settings.totalLabels.displayUnits,
                            labelPrecision : this.limitValue(this.lowerLimitValue
                                (this.settings.totalLabels.labelPrecision , 0),
                                                             4)
                        },
                        selector: null
                    });

                    return objectEnumeration;
                case 'dataPoint':
                    for (let iterator : number = 0 ; iterator < this.dataPoints.length ; iterator++) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: this.dataPoints[iterator].category,
                            properties: {
                                fill: this.dataPoints[iterator].color
                            },
                            selector: this.dataPoints[iterator].selectionId.getSelector()
                        });
                    }

                    return objectEnumeration;
                case 'animation':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.animation.show
                        },
                        selector: null
                    });

                case 'borderSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        selector: null,
                        properties: {
                            color: this.settings.borderSettings.color,
                            borderstroke: this.limitValue(this.lowerLimitValue
                                (this.settings.borderSettings.borderstroke , 1 ),
                                                          fifthValue),
                            borderopacity: this.limitValue(this.lowerLimitValue
                                (this.settings.borderSettings.borderopacity , 0),
                                                           1)
                        }
                    });

                    return objectEnumeration;

                default :
                {
                    break;
                }

            }

        }
        private HandleLandingPage(options: VisualUpdateOptions) : void {
            if (!options.dataViews || !options.dataViews.length) {
                if (!THIS.isLandingPageOn) {
                    THIS.isLandingPageOn = true;
                    const sampleLandingPage: Element = this.createsampleLandingPage();
                    THIS.landingPage = d3.select('.LandingPage');
                }
            } else {
                if (THIS.isLandingPageOn && !THIS.landingPageRemoved) {
                    THIS.landingPageRemoved = true;
                    THIS.landingPage.remove();
                }
            }
        }

        private createsampleLandingPage(): Element {
            // tslint:disable-next-line:no-any
            const page: any = d3.select(this.optionsNew.element)
                .append('div')
                .classed('LandingPage', true);

            page.append('text')
                .classed('landingPageHeader', true)
                .text('Treemap Bar Chart by MAQ Software')
                .append('text')
                .classed('landingPageText', true)
                .text('Treemap Bar Chart visual categorizes the data into the groups and show the data in Hierarchical structure');

            return page;
        }
        //function to render chart
        // tslint:disable-next-line:no-any
        private drawChart(testDataForTree : any , colorMap : any, valueIndex : number , category : any): void {
            // tslint:disable-next-line:no-any
            const barHeights: any = [];
            const width: number = this.optionsUpdate.viewport.width;
            let height : number = this.optionsUpdate.viewport.height;
            if (this.legend.getOrientation() === LegendPosition.BottomCenter
             || this.legend.getOrientation() === LegendPosition.Bottom) {
                height = height - this.legend.getMargins().height;
            }
            // tslint:disable-next-line:no-any
            const valuesCategory : any  = this.optionsUpdate.dataViews[0].categorical.values;
            // tslint:disable-next-line:no-any
            const filterValues : any = []; //rect coordinates
            // tslint:disable-next-line:no-any
            const filterdata: any = []; //height and width
            // tslint:disable-next-line:no-any
            const filterExtreme: any = []; // extreme condition of box
            const fontFamilyLiteral : string = THIS.settings.dataLabels.fontFamily;
            // tslint:disable-next-line:no-any
            const countArray : any = [];
            const fontSizeLiteral : string = THIS.settings.dataLabels.fontSize + pixelLiteral;
            this.svg.attr({
                width: width,
                height: height
            });
            const barOuterPad: number = tenthValue;
            let widthForBars : number = 0;

            if (this.settings.chartOrientation.orientation === 'Vertical') {
                widthForBars = width - (barOuterPad * 2);
            } else {
                widthForBars = height - (barOuterPad * 2) ;
            }
            const barWidth: number = sixthValue * widthForBars / (7 * testDataForTree.length - 1);
            const barPad: number = barWidth / sixthValue;
            globalpadding = barPad;
            globalBarWidth = barWidth;
            let sum: number;
            const tabarr: string = THIS.data.filter(
                // tslint:disable-next-line:typedef
                function (elem, index) {
                    return THIS.data.indexOf(elem) === index;
                }
            ).join('@#');
            const tabarray: string[] = tabarr.split('@#');
            for (let iIterator: number = 0; iIterator < tabarray.length; iIterator++) {

                countArray.push({
                    key : tabarray[iIterator],
                    count : 0,
                    color : colorMap[tabarray[iIterator]]
                });
            }
            for (let iIterator: number = 0; iIterator < testDataForTree.length; iIterator++) { // INSIDE ONE TREE MAP BAR
                sum = 0;
                this.svg.selectAll(hashliteral + treeliteral + iIterator).remove();
                for (let iTreeMapIterator: number = 0; iTreeMapIterator < testDataForTree[iIterator].children.length;
                    iTreeMapIterator++) {
                    for (let iChildrenIterator: number = 0; iChildrenIterator <
                        testDataForTree[iIterator].children[iTreeMapIterator].children.length;
                        iChildrenIterator++) {
                        sum += testDataForTree[iIterator].children[iTreeMapIterator].children[iChildrenIterator].value;
                    }
                }
                if (sum < 0) {
                    sum = 0;
                }
                barHeights.push(sum);
            }
            let maximumSum: number = Math.max(...barHeights);
            if (maximumSum <= 0) {
                maximumSum = 1;
            }
            let x: number = tenthValue;
            if (THIS.settings.totalLabels.displayUnits === 0) {
                const valLen: number = maximumSum.toString().split('.')[0].length;
                displayVal = this.getAutoDisplayUnits(valLen);
            }
            // tslint:disable-next-line:no-any
            let cells: any;
            let heightForBar: number = 0;
            let labelheight: number = 0;
            for (let iIterator: number = 0; iIterator < testDataForTree.length; iIterator++) {
                let totalheight: number = 0;
                if (this.settings.chartOrientation.orientation === 'Vertical') {
                heightForBar = (barHeights[iIterator] * (height - xaxisPaddingValue) ) / maximumSum;
            } else {
                heightForBar = (barHeights[iIterator] * width * 0.9) / maximumSum;
            }
                if (THIS.settings.totalLabels.show) {
                    let getformatter: string;
                    if (iIterator === 0) {
                        getformatter = valuesCategory[valueIndex].source.format ?
                            valuesCategory[valueIndex].source.format : ValueFormatter.DefaultNumericFormat;
                        formatter = ValueFormatter.create({
                            format: getformatter,
                            value: THIS.settings.totalLabels.displayUnits === 0 ? displayVal : THIS.settings.totalLabels.displayUnits,
                            precision: THIS.limitValue(this.lowerLimitValue
                                (THIS.settings.totalLabels.labelPrecision , 0),
                                                       4)
                        });
                        const totalValue: string = formatter.format(barHeights[iIterator]);
                        const xAxisPropNew1: TextProperties = {
                            text: totalValue,
                            fontFamily: THIS.settings.totalLabels.fontFamily,
                            fontSize: THIS.settings.totalLabels.fontSize + pixelLiteral
                        };
                        labelheight = textMeasurementService.measureSvgTextHeight(xAxisPropNew1);
                    }

                    heightForBar = heightForBar - labelheight;
                    const borderStrikeValue: number = this.limitValue(this.lowerLimitValue
                        (this.settings.borderSettings.borderstroke, 1),
                                                                      fifthValue);
                    totalheight = height - heightForBar - xaxisPaddingValue -
                       borderStrikeValue - 2;
                    if (this.settings.chartOrientation.orientation === 'Vertical' && heightForBar < 0) {
                        totalheight = height - xaxisPaddingValue;
                    }
                }
                // tslint:disable-next-line:no-any
                let treemap : any;
                //sort the data based on value field because of gradient efect
                for (let mIterator : number = 0 ; mIterator < testDataForTree[iIterator].children.length ; mIterator++) {
                    testDataForTree[iIterator].children[mIterator].children.sort(this.compareValue);
                }
                if (this.settings.chartOrientation.orientation === 'Vertical') {
                treemap = d3.layout.treemap()
                    .size([barWidth, heightForBar])
                    .sort(null)
                    .nodes(testDataForTree[iIterator])
                    // tslint:disable-next-line:no-any
                    .filter(function(d : any) : any { return !d.children; });

                } else {
                    treemap  = d3.layout.treemap()
                    .size([heightForBar , barWidth])
                    .sort(null)
                    .nodes(testDataForTree[iIterator])
                    // tslint:disable-next-line:no-any
                    .filter(function(d : any) : any { return !d.children; });
                }
                //calculate children for legend
                for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                   countArray[loopIterator].count = 0;
                }
                for (let jIterator: number = 0; jIterator < treemap.length; jIterator++) {
                    const parent : string = treemap[jIterator].parent[nameLiteral];
                    for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                        if (countArray[loopIterator].key === parent) {
                            countArray[loopIterator].count++;
                        }
                    }
                }
                groupColorArray = [];
                for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                    opacityObject.push({
                        axis : testDataForTree[iIterator].year,
                        key : countArray[loopIterator].key,
                        count : countArray[loopIterator].count,
                        color : countArray[loopIterator].color
                    });
                    this.getColorBands(countArray[loopIterator].color, countArray[loopIterator].count);
                }
                node = root = testDataForTree[iIterator];

                // tslint:disable-next-line:no-any
                const barForTreeMap: any = this.svg.append('g').attr('id', treeliteral + iIterator).style('position', 'relative');
                let kiterator: number = -1;
                let treeChartDataPoints: ITreeChartDataPoint[] = [];
                treeChartDataPoints = treemap;
                for (let pIterator : number = 0 ; pIterator < treeChartDataPoints.length ; pIterator++) {
                    treeChartDataPoints[pIterator].barheight = heightForBar;
                    treeChartDataPoints[pIterator].barwidth = barWidth;
                    treeChartDataPoints[pIterator].opacity = groupColorArray[pIterator];
                    treeChartDataPoints[pIterator].brickClass = '';
                    globalTreeChartDataPoints.push(treeChartDataPoints[pIterator]);
                }
                this.interactivityService.applySelectionStateToData(globalTreeChartDataPoints);
                cells = barForTreeMap.selectAll(dotliteral + cellliteral + iIterator)
                    .data(treeChartDataPoints)
                    .enter()
                    .append('g')
                    .attr('class', function () : string {
                        kiterator++;

                        return cellliteral + iIterator + commaliteral;
                    });
                if (this.settings.chartOrientation.orientation === 'Vertical') {
                    cells.append('rect')
                    .attr({
                        // tslint:disable-next-line:no-any
                        x : function (d : any) : number  {return d.x + x; },
                        // tslint:disable-next-line:no-any
                        y : function (d : any ) : number { return (height - heightForBar - xaxisPaddingValue) + d.y; },
                        // tslint:disable-next-line:no-any
                        width : function (d : any) : number { return Math.max(0, d.dx - 1); },
                        // tslint:disable-next-line:no-any
                        height : function (d : any) : number { return Math.max(0, d.dy - 1); },
                        // tslint:disable-next-line:no-any
                        fill : function (d : any, i : number) : any {return d.children ? null : colorMap[d.parent[nameliteral]]; }
                    })
                    // tslint:disable-next-line:no-any
                    .style('fill-opacity', function (d : any, i : number) : any {
                        return groupColorArray[i];
                    });
                } else {
                    cells.append('rect')
                    .attr({
                        // tslint:disable-next-line:no-any
                        x : function (d : any) : number {return d.x + xaxisPaddingValue; },
                        // tslint:disable-next-line:no-any
                        y : function (d : any) : number { return d.y + x ; },
                        // tslint:disable-next-line:no-any
                        width : function (d : any) : number { return Math.max(0, d.dx - 1); },
                        // tslint:disable-next-line:no-any
                        height : function (d : any) : number { return Math.max(0, d.dy - 1); },
                        // tslint:disable-next-line:no-any
                        fill : function (d : any, i : number) : any {
                            return d.children ? null : colorMap[d.parent[nameliteral]];
                        }
                    })
                    // tslint:disable-next-line:no-any
                    .style('fill-opacity', function (d : any, i : number) : any {
                        return groupColorArray[i];
                    });
                }
                cells.selectAll('rect')
                    // tslint:disable-next-line:no-any
                    .attr('class', function (d : any) : string {
                        return d.parent ?
                            (d.parent.parent ?
                                `${THIS.replaceString(d.parent[nameliteral]
                                    .toString())} ${THIS.replaceString(d[nameliteral].toString())}` :
                                    THIS.replaceString(d[nameliteral].toString())) : 'treemapbar';
                    })
                    // tslint:disable-next-line:no-any
                    .attr('id', function (d : any) : string {
                        return d.parent ?
                            (d.parent.parent ? 'child' :
                            THIS.replaceString(d[nameliteral].toString())) : 'treemapbar';
                    })
                    .style({
                        stroke: THIS.settings.borderSettings.color,
                        'stroke-width': THIS.limitValue(THIS.lowerLimitValue
                            (THIS.settings.borderSettings.borderstroke, 1),
                                                        fifthValue),
                        'stroke-opacity': THIS.limitValue(THIS.lowerLimitValue
                            (THIS.settings.borderSettings.borderopacity, 0),
                                                          1)
                    });
                // tslint:disable-next-line:no-any
                const tooltipData1: any = [];
                // tslint:disable-next-line:no-any
                const cells1: any = barForTreeMap.selectAll('#child');
                // tslint:disable-next-line:no-any
                cells1.forEach(function (d: any, i: number): any {
                    return tooltipData1.push(d[i][dataLiteral]);

                });
                barForTreeMap.selectAll('#child').data(tooltipData1);
                if (this.settings.dataLabels.show) {
                    if (this.settings.chartOrientation.orientation === 'Vertical') {
                        //append rectangles for datalabels text background
                        if (this.settings.dataLabels.title) {
                            cells.append('rect')
                            // tslint:disable-next-line:no-any
                            .attr('x', function (d : any) : number {
                                filterValues.push({
                                    x : (d.x + x) + d.dx / 2,
                                    y : (height - heightForBar - xaxisPaddingValue) + d.y + d.dy / 2
                                });

                                return (d.x + x) + d.dx / 2; })
                            // tslint:disable-next-line:no-any
                            .attr('y', function (d : any) : number {
                                return (height - heightForBar - xaxisPaddingValue) + d.y + d.dy / 2; })
                            // tslint:disable-next-line:no-any
                            .attr('class', function (d : any) : string {
                                    return d.parent ?
                                        (d.parent.parent ?
                                            `${THIS.replaceString(d.parent[nameliteral]
                                                .toString()) + dataRectLiteral}
                                                ${THIS.replaceString(d[nameliteral].toString()) + dataRectLiteral}` :
                                                THIS.replaceString(d[nameliteral].toString())) : 'treemapbar';
                            })
                            .classed(dataRectLiteral, true)
                            // tslint:disable-next-line:no-any
                            .attr('id' , function(d : any) : string {
                                return  d.parent ?
                                    (d.parent.parent ?
                                        THIS.replaceString(d.parent[nameliteral].toString()) + dataRectLiteral :
                                        THIS.replaceString(d[nameliteral].toString())) : 'treemapbar';
                            })
                            .style({
                                'pointer-events' : 'none'
                            });
                        }
                         //append text for datalabels text
                        cells.append('text')
                        // tslint:disable-next-line:no-any
                        .attr('class', function (d : any) : string {
                            return `${'datalabels'} ${THIS.replaceString(d[nameliteral].toString())}`;
                        })
                        .attr({
                            // tslint:disable-next-line:no-any
                            x: function (d : any) : number { return (d.x + x) + d.dx / 2; },
                            // tslint:disable-next-line:no-any
                            y: function (d : any) : number {
                                return (height - heightForBar -  xaxisPaddingValue) + d.y + d.dy / 2 ; }, 'text-anchor': 'middle'
                        })
                        // tslint:disable-next-line:no-any
                        .attr('id', function (d : any) : string {
                            return d.parent ?
                                (d.parent.parent ?
                                    THIS.replaceString(d.parent[nameliteral].toString()) :
                                    THIS.replaceString(d[nameliteral].toString())) : 'treemapbar';
                        })
                        .style({
                            'font-size': fontSizeLiteral,
                            margin: 'auto', display: 'block',
                            fill: this.settings.dataLabels.color,
                            'font-family': fontFamilyLiteral,
                            'pointer-events' : 'none'
                        })
                        // tslint:disable-next-line:no-any
                        .text(function (d : any, i : number) : string {
                                const text: string = d.children ? null : d[nameLiteral];
                                const xAxisPropNew: TextProperties = {
                                                text: String(text),
                                                fontFamily: fontFamilyLiteral,
                                                fontSize: fontSizeLiteral
                                            };
                                const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                                const measureHeight: number = textHeight;
                                filterdata.push({
                                    height: measureHeight,
                                    width: measureWidth
                                });
                                const tempVariableX : number = d.dx - 1;
                                const tempVariableY : number = d.dy - 1;
                                if (measureWidth > tempVariableX || measureHeight > tempVariableY) {
                                    const translatewidth: number = Math.pow(tenthValue, fifthValue);
                                    filterExtreme.push({
                                        width: tempVariableX,
                                        height: tempVariableY
                                    });

                                    return '';
                                } else {
                                    filterExtreme.push({
                                        width : Math.pow(tenthValue, fifthValue),
                                        height : Math.pow(tenthValue, fifthValue)
                                    });

                                    return text;
                                }

                        });
                    } else {
                         //append rectangles for datalabels text background
                        if (this.settings.dataLabels.title) {
                            cells.append('rect')
                            // tslint:disable-next-line:no-any
                            .attr('x', function (d : any) : number {
                                filterValues.push({
                                    x :  xaxisPaddingValue + d.x + d.dx / 2,
                                    y : (d.y + x) + d.dy / 2
                                });

                                return  xaxisPaddingValue + d.x + d.dx / 2; })
                            // tslint:disable-next-line:no-any
                            .attr('y', function (d : any) : number {
                                return (d.y + x) + d.dy / 2 ; })
                            // tslint:disable-next-line:no-any
                            .attr('class', function (d : any) : string {
                                    return d.parent ?
                                        (d.parent.parent ?
                                            `${THIS.replaceString(d.parent[nameliteral]
                                                .toString()) + dataRectLiteral}
                                                ${THIS.replaceString(d[nameliteral].toString()) + dataRectLiteral}` :
                                                THIS.replaceString(d[nameliteral].toString())) : 'treemapbar';
                            })
                            .classed(dataRectLiteral, true)
                            // tslint:disable-next-line:no-any
                            .attr('id' , function(d : any) : string {
                                return  d.parent ?
                                    (d.parent.parent ?
                                        THIS.replaceString(d.parent[nameliteral].toString()) + dataRectLiteral :
                                        THIS.replaceString(d[nameliteral].toString())) : 'treemapbar';
                            })
                            .style({
                                'pointer-events' : 'none'
                            });
                        }
                         //append text for datalabels text
                        cells.append('text')
                        // tslint:disable-next-line:no-any
                        .attr('class', function (d : any) : string {
                            return `${'datalabels'} ${THIS.replaceString(d[nameliteral].toString())}`;
                        })
                        .attr({
                            // tslint:disable-next-line:no-any
                            x: function (d : any) : number { return  xaxisPaddingValue + d.x + d.dx / 2; },
                            // tslint:disable-next-line:no-any
                            y: function (d : any ) : number { return (d.y + x) + d.dy / 2 ; }, 'text-anchor': 'middle'
                        })
                        // tslint:disable-next-line:no-any
                        .attr('id', function (d : any) : string {
                            return d.parent ?
                                (d.parent.parent ?
                                    THIS.replaceString(d.parent[nameliteral].toString()) :
                                    THIS.replaceString(d[nameliteral].toString())) : 'treemapbar';
                        })
                        .style({
                            'font-size': fontSizeLiteral,
                            margin: 'auto', display: 'block',
                            fill: this.settings.dataLabels.color,
                            'font-family': fontFamilyLiteral,
                            'pointer-events' : 'none'
                        })
                        // tslint:disable-next-line:no-any
                        .text(function (d : any) : string {
                                const text: string = d.children ? null : d[nameLiteral];
                                const xAxisPropNew: TextProperties = {
                                                text: String(text),
                                                fontFamily: fontFamilyLiteral,
                                                fontSize: fontSizeLiteral
                                            };
                                const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                                const measureHeight: number = textHeight;
                                filterdata.push({
                                    height: measureHeight,
                                    width: measureWidth
                                });
                                const tempVariableX : number = d.dx - 1;
                                const tempVariableY : number = d.dy - 1;
                                if (measureWidth > tempVariableX || measureHeight > tempVariableY) {
                                    const translatewidth: number = Math.pow(tenthValue, fifthValue);
                                    filterExtreme.push({
                                        width: tempVariableX,
                                        height: tempVariableY
                                    });

                                    return '';
                                } else {
                                    filterExtreme.push({
                                        width: Math.pow(tenthValue, fifthValue),
                                        height: Math.pow(tenthValue, fifthValue)
                                    });

                                    return text;
                                }
                        });

                    }
                    //change the opacity of datalabels background rectangles
                    if (this.settings.dataLabels.title) {
                    d3.selectAll(dotliteral + dataRectLiteral)
                        // tslint:disable-next-line:no-any
                        .attr('x', function (d: any, i : number): number {

                            return Number(filterValues[i].x) - (Number(filterdata[i].width) / 2); })
                        // tslint:disable-next-line:no-any
                        .attr('y', function (d : any, i : number) : number {
                            return Number(filterValues[i].y) - (Number(filterdata[i].height)) + filterdata[i].height / 3; })
                        .attr('fill', `${this.settings.dataLabels.backgroundColor}`)
                        .attr({
                            // tslint:disable-next-line:no-any
                            width: function (d : any , i: number) : any { return Math.max(filterdata[i].width, 0); },
                            // tslint:disable-next-line:no-any
                            height: function (d : any, i : number) : any {  return Math.max(filterdata[i].height, 0); }
                        })
                        // tslint:disable-next-line:no-any
                        .style('fill-opacity', function(d : any, i : number) : number {
                            if (!d.children) {
                                if (filterExtreme[i].width <=  filterdata[i].width || filterExtreme[i].height  <= filterdata[i].height) {
                                    return 0;
                                } else {
                                    return THIS.limitValue(THIS.lowerLimitValue
                                        (THIS.settings.dataLabels.rectopacity, 0),
                                                           1);
                                }
                            } else {

                                return 0;
                            }
                        });
                        }
                }

                // tslint:disable-next-line:no-any
                const gForYear: any = d3.select(hashliteral + treeliteral + iIterator)
                    .append('g').attr('class', xaxisliteral + iIterator).data(treemap)
                    .style('position', 'absolute');
                let xaxisSize: string = '';
                if (THIS.settings.xaxisLabels.fontSize >  xaxisPaddingValue) {

                    xaxisSize = String( xaxisPaddingValue) + pixelLiteral;
                } else {
                    xaxisSize = THIS.settings.xaxisLabels.fontSize + pixelLiteral;
                }
                let labelSize: string = '';
                if (THIS.settings.totalLabels.fontSize >  xaxisPaddingValue) {

                    labelSize = String( xaxisPaddingValue) + pixelLiteral;
                } else {
                    labelSize = THIS.settings.totalLabels.fontSize + pixelLiteral;
                }
                if (THIS.settings.totalLabels.show) {
                    let getformatter: string;
                    getformatter = valuesCategory[valueIndex].source.format ?
                        valuesCategory[valueIndex].source.format : ValueFormatter.DefaultNumericFormat;
                    formatter = ValueFormatter.create({
                        format: getformatter,
                        value: THIS.settings.totalLabels.displayUnits === 0 ? displayVal : THIS.settings.totalLabels.displayUnits,
                        precision: THIS.limitValue(this.lowerLimitValue
                            (THIS.settings.totalLabels.labelPrecision , 0),
                                                   4)
                    });
                    const totalValue: string = formatter.format(barHeights[iIterator]);
                    //append totallabels
                    if (this.settings.chartOrientation.orientation === 'Vertical') {
                        gForYear.append('text')
                            .attr('x', x + (barWidth / 2))
                            .classed('totallabels', true)
                            .attr('y',  totalheight)
                            .attr('text-anchor', 'middle');
                    } else {
                        gForYear.append('text')
                        // tslint:disable-next-line:no-any
                        .attr('x', function(d : any) : number {
                            return xaxisPaddingValue + heightForBar + 1; })
                        .classed('totallabels', true)
                        .attr('y', x + (barWidth / 2) + labelheight / 4);
                    }
                    gForYear.selectAll('text')
                        .style({
                            fill: THIS.settings.totalLabels.color,
                            'font-size': labelSize,
                            'font-family': THIS.settings.totalLabels.fontFamily
                        })
                        // tslint:disable-next-line:no-any
                        .text(function (d : any) : string {
                            const xAxisPropNew1: TextProperties = {
                                text: totalValue,
                                fontFamily: THIS.settings.totalLabels.fontFamily,
                                fontSize: labelSize
                            };
                            let updatedSizeText: string = '';
                            if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                                updatedSizeText = textMeasurementService.getTailoredTextOrDefault(xAxisPropNew1, barWidth / 2 );
                            } else {
                                updatedSizeText = textMeasurementService.getTailoredTextOrDefault(
                                    xAxisPropNew1, width - heightForBar - xaxisPaddingValue );
                                if ( labelheight > barWidth) {
                                        updatedSizeText = '';
                                    }
                            }

                            return updatedSizeText;
                        })
                        // tslint:disable-next-line:no-any
                        .append('title').text(function (d: any): string {
                            return String(totalValue);
                        });
                }
                //append x-axis labels
                if (this.settings.chartOrientation.orientation === 'Vertical') {
                    gForYear.append('text')
                    .attr('x', x + (barWidth / 2))
                    .classed('xaxislabels', true)
                    .attr('y', height - fifthValue);
                } else {
                    //
                    gForYear.append('text')
                    .attr('y', x + (barWidth / 2))
                    .classed('xaxislabels', true)
                    .attr('x', fifthValue)
                    // tslint:disable-next-line:prefer-template
                    .attr('transform' , 'translate(' +  (x + (barWidth / 2)) + ',' +  (x + (barWidth / 2)) + ')' + 'rotate(-270)');

                }
                gForYear.selectAll('.xaxislabels')
                    .attr('text-anchor', 'middle')
                    .style({
                        'font-size': THIS.settings.xaxisLabels.fontSize > xaxisPaddingValue ?
                        xaxisPaddingValue : THIS.settings.xaxisLabels.fontSize + pixelLiteral,
                        fill: THIS.settings.xaxisLabels.color,
                        'font-family': THIS.settings.xaxisLabels.fontFamily
                    })
                    // tslint:disable-next-line:no-any
                    .text(function (d : any) : string {
                        let xText : string = '';
                        if (d.parent.parent) {
                            xText = d.parent.parent.year;
                        } else {
                            xText = d.parent.year;

                        }
                        const xAxisPropNew: TextProperties = {
                            text: String(xText),
                            fontFamily: THIS.settings.xaxisLabels.fontFamily,
                            fontSize: xaxisSize
                        };
                        const xwidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                        const updatedSizeText: string =
                            textMeasurementService.getTailoredTextOrDefault(xAxisPropNew, barWidth);

                        if (updatedSizeText === '(null)') {
                            return '(Blank)';
                        } else {
                            return updatedSizeText;
                        }
                    })
                    // tslint:disable-next-line:no-any
                    .append('title').text(function (d: any): string {
                        const xText : string = '';
                        if (d.parent.parent) {
                            return d.parent.parent.year === '(null)' ? '(Blank)' : d.parent.parent.year;
                        } else {
                            return  d.parent.year === '(null)' ? '(Blank)' : d.parent.year;

                        }
                    });
                x = x + barPad + barWidth;
                let selectionManager: ISelectionManager;
                selectionManager = this.selectionManager;
                //onclick function on xaxislabels
                // tslint:disable-next-line:no-any
                d3.selectAll('.xaxislabels').on('click', function (d : any) : void {
                    THIS.resetOpacity();
                    let selectedLegend : string = '';
                    if (d.parent.parent) {
                        selectedLegend = d.parent.parent.year;
                    } else {
                        selectedLegend = d.parent.year;
                    }
                    const dataArrayLength: number = THIS.dataAxis.length;
                    const selectedSelectionId: ISelectionId[] = [];
                    for (let iterator: number = 0; iterator < dataArrayLength; iterator++) {
                        if (selectedLegend === THIS.dataAxis[iterator]) {
                            selectedSelectionId.push(THIS.selectionID[iterator]);
                        }
                    }
                    selectionManager.clear();
                    if (d3.select(this).classed('selectedaxis')) {
                        THIS.resetOpacity();
                        d3.select(this).classed('selectedaxis', false);
                    } else {
                        selectionManager.select(selectedSelectionId).then((ids: ISelectionId[]) => {

                            d3.selectAll('.xaxislabels').classed('selectedaxis', false);
                            d3.select(this).classed('selectedaxis', true);
                            const tabarr1: string = category[0].values.filter(
                                // tslint:disable-next-line:typedef
                                function (elem, indexElement) {
                                    return category[0].values.indexOf(elem) === indexElement;
                                }
                            ).join('@#');
                            const tabarray1: string[] = tabarr1.split('@#');
                            tabarray1.sort();
                            let index: number = 0;
                            for (let loopiterator: number = 0; loopiterator <
                                tabarray1.length; loopiterator++) {
                                const categoryNew: string =
                                    tabarray1[loopiterator];
                                if (categoryNew === selectedLegend) {
                                    index = loopiterator;
                                }
                            }
                            for (let iterator : number = 0 ; iterator <  tabarray1.length ; iterator++) {
                                if (iterator !== index) {
                                    d3.selectAll(dotliteral + cellliteral + iterator).select('rect')
                                    .style({
                                        'fill-opacity': 0.5
                                    });
                                    d3.selectAll(dotliteral + cellliteral + iterator).select('text').style({
                                        'fill-opacity': 0
                                    });
                                }
                            }
                        });
                    }
                    (<Event>d3.event).stopPropagation();
                });
                d3.selectAll('#child')
                    // tslint:disable-next-line:no-any
                    .attr('width', function (d : any) : number { return Math.max(0, d.dx - 1); });
                // tslint:disable-next-line:no-any
                d3.selectAll('#child').attr('height', function (d : any) : number {
                    let rectHeight: number = 0;
                    rectHeight = THIS.limitValue(THIS.lowerLimitValue
                        (THIS.settings.borderSettings.borderstroke, 1),
                                                 paddingValue);

                    return Math.max(0, d.dy - rectHeight);
                });
                d3.selectAll(dotliteral + dataRectLiteral).style({
                    'stroke-width': 0,
                    'stroke-opacity': 0,
                    stroke: 'white'
                });
            }
            // tslint:disable-next-line:no-any
            const bcells : any = d3.selectAll('#child')[0];
            // tslint:disable-next-line:no-any
            const mydata : any = [];
            // tslint:disable-next-line:no-any
            bcells.forEach(function (d: any): any {
                mydata.push(d[dataLiteral]);
            });
            this.brickSelection = d3.selectAll('#child').data(mydata);
            THIS.tooltipServiceWrapper.addTooltip(d3.selectAll('#child'),
                // tslint:disable-next-line:no-any
                                                  (tooltipEvent: TooltipEventArgs<any>) =>
                    THIS.getTooltipData(tooltipEvent.data),
                // tslint:disable-next-line:no-any
                                                  (tooltipEvent: TooltipEventArgs<any>) => tooltipEvent.data.identity);
            //add tooltip to datalabels
            THIS.tooltipServiceWrapper.addTooltip(d3.selectAll('.datalabels'),
                // tslint:disable-next-line:no-any
                                                  (tooltipEvent: TooltipEventArgs<any>) =>
                    THIS.getTooltipData(tooltipEvent.data),
                // tslint:disable-next-line:no-any
                                                  (tooltipEvent: TooltipEventArgs<any>) => tooltipEvent.data.identity);

        }
        // tslint:disable-next-line:no-any
        public renderData(dataView: DataView, host : any , options : any, axis : any , sublegend : any ): any {
            dataView = options.dataViews[0];
            // tslint:disable-next-line:no-any
            const dataObject: any = [];
            // tslint:disable-next-line:no-any
            let dDataObject: any = {};
            let legendDisplay : string  = '';
            let subLegendDisplay : string = '';
            let valueDisplay : string = '';
            let axisDisplay : string = '';
            const fontFamilyLiteral : string = THIS.settings.dataLabels.fontFamily;
            const fontSizeLiteral : string = THIS.settings.dataLabels.fontSize + pixelLiteral;
            let subLegendIndex : number = 0;
            // tslint:disable-next-line:no-any
            const columns : any = options.dataViews[0].metadata.columns;
            for (let iterator : number = 0 ; iterator < columns.length ; iterator++) {

                if (columns[iterator].roles.Axis) {
                    axisDisplay = columns[iterator].displayName;
                }
                if (columns[iterator].roles.Legend) {
                    legendDisplay = columns[iterator].displayName;
                    THIS.legendIndex = iterator;
                }
                if (columns[iterator].roles.SubLegend) {
                    subLegendDisplay = columns[iterator].displayName;
                    subLegendIndex = iterator;

                }
                if (columns[iterator].roles.Value) {
                    valueDisplay = columns[iterator].displayName;
                }
            }
            const groups: DataViewValueColumnGroup[] = dataView.categorical.values.grouped();
            const legendFormatterValue : string = dataView.categorical.values.source.format;
            const legendFormatter  : IValueFormatter = ValueFormatter.create({
                format: legendFormatterValue
            });
            const subLegendFormatterValue : string = columns[subLegendIndex].format;
            const subLegendFormatter  : IValueFormatter = ValueFormatter.create({
                format: subLegendFormatterValue
            });
            groups.forEach((group: DataViewValueColumnGroup) => {
                for (let groupIterator: number = 0; groupIterator < group.values[0].values.length; groupIterator++) {
                    if (group.values[0].values[groupIterator] !== null) {
                        const selectionId: visuals.ISelectionId = host.createSelectionIdBuilder()
                        .withCategory(dataView.categorical.categories[0], groupIterator)
                        .withSeries(dataView.categorical.values, group)
                        .createSelectionId();
                        let groupNameString : string = group.name !== null ? group.name !== '' ?
                        group.name.toString() : '(Blank)' : 'Blank';
                        //to check for date
                        if (String(new Date(groupNameString)) === 'Invalid Date' ||
                        new Date(groupNameString).toISOString() !== groupNameString) {
                            groupNameString = groupNameString;
                        } else {
                            groupNameString = legendFormatter.format(new Date(groupNameString));
                        }
                        let sublegendString : string = '';
                        if (sublegend) {
                            sublegendString  = sublegend[groupIterator] !== null ? sublegend[groupIterator] !== '' ?
                            (sublegend[groupIterator].toString()) : '(Blank)' : '(Blank)';
                            if (String(new Date(sublegendString)) === 'Invalid Date' ||
                            new Date(sublegendString).toISOString() !== sublegendString) {
                                sublegendString = sublegendString;
                            } else {
                                sublegendString = subLegendFormatter.format(new Date(sublegendString));
                            }
                        }
                        //mandatory in tooltip
                        // tslint:disable-next-line:no-any
                        const tooltipDataPointNew: any = [];
                        let tooltipDataPoint: ITooltipDataPoints;
                        tooltipDataPoint = {
                            formatter: '',
                            name: 'selectionId',
                            value: selectionId
                        };
                        tooltipDataPointNew.push(tooltipDataPoint);
                        let tooltipDataNew1: ITooltipDataPoints;
                        tooltipDataNew1 = {
                            formatter: '',
                            name: axisDisplay,
                            value: axis[groupIterator] !== null ? axis[groupIterator] !== '' ?
                                (axis[groupIterator].toString()) : '(Blank)' : '(Blank)'
                        };
                        tooltipDataPointNew.push(tooltipDataNew1);
                        let tooltipDataNew2: ITooltipDataPoints;
                        tooltipDataNew2 = {
                            formatter: '',
                            name: legendDisplay,
                            value: groupNameString
                        };
                        tooltipDataPointNew.push(tooltipDataNew2);
                        let getformatter: string;
                        getformatter = group.values[0].source.format ?
                        group.values[0].source.format : ValueFormatter.DefaultNumericFormat;
                        THIS.limitValue(this.lowerLimitValue
                            (THIS.settings.totalLabels.labelPrecision , 0),
                                        4);
                        formatter = ValueFormatter.create({
                            format: getformatter
                        });
                        let tooltipDataNew4: ITooltipDataPoints;
                        tooltipDataNew4 = {
                            formatter: '',
                            name: valueDisplay,
                            value: group.values[0].values[groupIterator] !== 0 ?
                                formatter.format(Number(group.values[0].values[groupIterator])) : 0
                        };
                        tooltipDataPointNew.push(tooltipDataNew4);
                        if (sublegend !== undefined) {
                            let tooltipDataNew5: ITooltipDataPoints;
                            tooltipDataNew5 = {
                                formatter: '',
                                name: subLegendDisplay,
                                value: sublegendString
                            };
                            tooltipDataPointNew.push(tooltipDataNew5);
                            dDataObject = {
                                axis: axis[groupIterator] !== null ?
                                axis[groupIterator] !== '' ? String(axis[groupIterator]) : '(Blank)' : '(Blank)',
                                legend: groupNameString,
                                sublegend: sublegendString,
                                values: group.values[0].values[groupIterator] != null ? group.values[0].values[groupIterator] : 0,
                                selectionId: selectionId,
                                tooltip: tooltipDataPointNew,
                                valueIndex : 0
                            };
                        } else {
                            dDataObject = {
                                axis: axis[groupIterator] !== null ?
                                axis[groupIterator] !== '' ? String(axis[groupIterator]) : '(Blank)' : '(Blank)',
                                legend: groupNameString,
                                sublegend: groupNameString,
                                values: group.values[0].values[groupIterator] != null ? group.values[0].values[groupIterator] : 0,
                                selectionId: selectionId,
                                tooltip: tooltipDataPointNew,
                                valueIndex : 0
                            };
                        }
                        dataObject.push(dDataObject);
                        THIS.data.push(dDataObject.legend);
                        THIS.dataNew.push(dDataObject.sublegend);
                        THIS.dataAxis.push(dDataObject.axis);
                        THIS.selectionID.push(dDataObject.selectionId);
                        //measure data in tooltip bag
                        for (let jIterator: number = 1; jIterator < group.values.length; jIterator++) {
                            let getformatterNew: string;
                            const tooltipDisplayName: string = group.values[jIterator].source.displayName;
                            // tslint:disable-next-line:no-any
                            const value: any = group.values[jIterator].values[groupIterator];
                            if (typeof (value) !== 'string') {
                                getformatterNew = group.values[jIterator].source.format ?
                                    group.values[jIterator].source.format : ValueFormatter.DefaultNumericFormat;
                                formatter = ValueFormatter.create({ format: getformatterNew });
                                let tooltipDataBag: ITooltipDataPoints;
                                tooltipDataBag = {
                                    formatter: '',
                                    name: tooltipDisplayName,
                                    value: value !== 0 ?
                                        formatter.format(Number(value)) : 0
                                };
                                tooltipDataPointNew.push(tooltipDataBag);
                            } else if (group.values[jIterator].source.type.dateTime) {
                                getformatterNew = group.values[jIterator].source.format ?
                                    group.values[jIterator].source.format : ValueFormatter.DefaultNumericFormat;
                                formatter = ValueFormatter.create({ format: getformatterNew });
                                let tooltipDataBag: ITooltipDataPoints;
                                tooltipDataBag = {
                                    formatter: '',
                                    name: tooltipDisplayName,
                                    value: formatter.format(new Date(value))
                                };
                                tooltipDataPointNew.push(tooltipDataBag);
                            } else {
                                let tooltipDataBag: ITooltipDataPoints;
                                tooltipDataBag = {
                                    formatter: '',
                                    name: tooltipDisplayName,
                                    value: value !== null ? value !== '' ?
                                        value : '(Blank)' : '(Blank)'
                                };
                                tooltipDataPointNew.push(tooltipDataBag);
                            }
                        }
                    }
                }
            });
            const xAxisPropNew: TextProperties = {
                text: String(groups[0].values[0].values[0]),
                fontFamily: fontFamilyLiteral,
                fontSize: fontSizeLiteral
            };
            textHeight = textMeasurementService.measureSvgTextHeight(xAxisPropNew);

            return dataObject;
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions) : void {
            THIS = this;
            this.optionsUpdate = options;
            this.HandleLandingPage(options);
            let axisliteral : number = 0;
            THIS.selector = 0;
            globalTreeChartDataPoints = [];
            // tslint:disable-next-line:no-any
            let dDataObject: any = {};
            this.remove();
            // tslint:disable-next-line:no-any
            const errormsg: any = d3.select(this.optionsNew.element)
                .append('div')
                .classed('barmsg', true);
            // tslint:disable-next-line:no-any
            const svg: any = this.svg = d3.select(this.optionsNew.element)
                .append('svg')
                .classed('barChart', true)
                .style({display: 'inline-block'});
            this.body = d3.select(this.optionsNew.element);
            this.interactivityService = createInteractivityService(this.host);
            THIS.data = [];
            THIS.dataNew = [];
            THIS.dataAxis = [];
            THIS.selectionID = [];
            THIS.tooltipData = [];
            this.viewport = options.viewport;
            let isAxisAvailable : boolean = false;
            let isLegendAvailable : boolean = false ;
            let isValueAvailable : boolean = false;
            let isSubLegendAvailable : boolean = false;
            let isBothSameAvailable : boolean = false;
            let isSameAxisLegendAvailable : boolean = false;
            let axisIndex : number = 0;
            let subLegendIndex : number = 0;
            const valueIndex : number = 0;
            let categoryLength : number ;
             // tslint:disable-next-line:no-any
            let category : any;
            this.svg.on('contextmenu', () => {
                const mouseEvent: MouseEvent = d3.event as MouseEvent;
                const eventTarget: EventTarget = mouseEvent.target;
                // tslint:disable-next-line:no-any
                const dataPoint : any = d3.select(eventTarget).datum();
                if (dataPoint.identity !== undefined ) {
                    this.selectionManager.showContextMenu( dataPoint.identity , {
                        x: mouseEvent.clientX,
                        y: mouseEvent.clientY
                    });
                    mouseEvent.preventDefault();
                }
            });
            if (options.dataViews.length) {
                this.settings = this.parseSettings(options && options.dataViews && options.dataViews[0]);
                if (options.dataViews[0].categorical.categories) {
                    category = options.dataViews[0].categorical.categories;
                    categoryLength = category.length;
                    for (let iterator: number = 0; iterator < categoryLength; iterator++) {
                        if (category[iterator].source.roles.Axis) {
                            isAxisAvailable = true;
                            axisIndex = iterator;
                        }
                        if (category[iterator].source.roles.SubLegend) {
                            isSubLegendAvailable = true;
                            subLegendIndex = iterator;
                        }
                        if (category[iterator].source.roles.SubLegend && category[iterator].source.roles.Legend) {
                            isBothSameAvailable = true;
                        }
                        if (category[iterator].source.roles.Legend && category[iterator].source.roles.Axis) {
                            isSameAxisLegendAvailable = true;
                        }

                    }
                }
                if (options.dataViews[0].categorical.values !== undefined &&
                    options.dataViews[0].categorical.values.source !== undefined) {
                    isLegendAvailable = true;
                    for (let oiterator : number = 0 ; oiterator < options.dataViews[0].metadata.columns.length ; oiterator++) {
                        if (options.dataViews[0].metadata.columns[oiterator].roles.Value !== undefined) {
                            isValueAvailable = true;
                            break;
                        }
                    }
                }

                if (isAxisAvailable && isLegendAvailable && isValueAvailable) {
                    this.legend = createLegend((this.optionsNew.element),
                                               this.optionsNew.host && false,
                                               this.interactivityService,
                                               true,
                                               LegendPosition.Top);
                    globalcategory = category[0];
                    // tslint:disable-next-line:no-any
                    const axis: any = category[axisIndex].values;
                    if (typeof (globalcategory.values[0]) === 'object') {
                        let objectFormatter: IValueFormatter;
                        let formatObject : string;
                        formatObject = globalcategory.source.format ?
                        globalcategory.source.format : ValueFormatter.DefaultNumericFormat;
                        objectFormatter = ValueFormatter.create({
                            format: formatObject
                        });
                        for (let iterator: number = 0; iterator < globalcategory.values.length; iterator++) {
                            globalcategory.values[iterator] = String(objectFormatter.format(globalcategory.values[iterator]));
                        }
                    }
                    let sublegend: PrimitiveValue[];
                    if (!isSubLegendAvailable) {
                        //subLegendIndex = this.legendIndex;
                    } else {
                        sublegend = category[subLegendIndex].values;
                    }
                    // tslint:disable-next-line:typedef
                    const checkAxis: number = axis.some(function (d) {
                        return d !== null;
                    });
                    if (!checkAxis) {
                        axisliteral = 1;
                    }
                    if (!axisliteral) {
                        // tslint:disable-next-line:no-any
                        const dataView: DataView = this.dataView = options.dataViews[0];
                        // tslint:disable-next-line:no-any
                        let dataObject: any = [];
                        // tslint:disable-next-line:no-any
                        const testData: any = [];
                        // tslint:disable-next-line:no-any
                        let children: any = [];
                        const iLengthAxis: number = axis.length;
                        // tslint:disable-next-line:no-any
                        let tempAxis: any = null;
                        let jIterator: number = 0;
                        const settings: TreeMapBarSettings = TreeMapBarSettings.parse<TreeMapBarSettings>(dataView);
                        dataObject = this.renderData(this.dataView, this.host, options, axis, sublegend);
                        this.bubbleSort(dataObject);
                        for (let loopIterator: number = 0; loopIterator < dataObject.length; loopIterator++) {
                            THIS.tooltipData.push(dataObject[loopIterator].tooltip);
                            if (String(tempAxis) !== String(dataObject[loopIterator].axis)) {
                                tempAxis = dataObject[loopIterator].axis;
                                dDataObject = {
                                    year: tempAxis,
                                    children: null,
                                    val: dataObject[loopIterator].values
                                };
                                testData.push(dDataObject);
                            }
                        }
                        for (let mIterator: number = 0; mIterator < dataObject.length; mIterator++) {
                            if (!mIterator || String(dataObject[mIterator].axis) === String(dataObject[mIterator - 1].axis)) {
                                if (!children.length || this.checkIfExists(children, dataObject[mIterator].legend)) {
                                    dDataObject = {
                                        name: dataObject[mIterator].legend,
                                        selectionId: dataObject[mIterator].selectionId
                                    };
                                    children.push(dDataObject);
                                }
                            } else {
                                testData[jIterator++].children = children;
                                children = [];
                                dDataObject = {
                                    name: dataObject[mIterator].legend,
                                    selectionId: dataObject[mIterator].selectionId
                                };
                                children.push(dDataObject);

                            }
                        }
                        testData[jIterator].children = children;
                        for (let iIterator: number = 0; iIterator < testData.length; iIterator++) {
                            for (jIterator = 0; jIterator < testData[iIterator].children.length; jIterator++) {
                                children = [];
                                for (let loopIterator: number = 0; loopIterator < dataObject.length; loopIterator++) {
                                    if (String(testData[iIterator].children[jIterator].name) === String(dataObject[loopIterator].legend)
                                        && String(testData[iIterator].year) === String(dataObject[loopIterator].axis)) {
                                        dDataObject = {
                                            name: dataObject[loopIterator].sublegend,
                                            value: dataObject[loopIterator].values,
                                            identity: dataObject[loopIterator].selectionId,
                                            valueIndex: dataObject[loopIterator].valueIndex
                                        };
                                        children.push(dDataObject);
                                        THIS.selector++;
                                    }
                                }
                                testData[iIterator].children[jIterator].children = children;
                            }
                        }

                        // tslint:disable-next-line:no-any
                        const testDataForTree: any = testData;
                        // Fetching capabilities
                        this.viewModel = visualTransform(options, this.host);
                        this.dataPoints = this.viewModel.dataPoints;

                        //color Mapping
                        // tslint:disable-next-line:no-any
                        const colorMap: any = {};
                        for (const colorPoint of this.dataPoints) {
                            colorMap[colorPoint.category] = colorPoint.color;
                        }
                        globalcolor = colorMap;
                        const legendData: Legend.LegendData = this.createLegendData(this.dataView, this.host, settings);
                        this.legendViewModel = {
                            dataView: this.dataView,
                            settings: settings,
                            legendData: legendData
                        };
                        this.renderLegend();
                        opacityObject = [];
                        this.drawChart(testDataForTree, colorMap, valueIndex, category);

                    } else {
                        const width: number = options.viewport.width;
                        const height: number = options.viewport.height;

                        this.svg.attr({
                            width: width,
                            height: height
                        });
                        errormsg.style({ 'margin-top': `${height / 2}px`, 'margin-left': `${width / 4}px` })
                            .append('text')
                            .classed('barMessageText', true)
                            .text('Values in Axis or Legend or Sub-Legend are Blank');
                    }
                } else {
                    const width: number = options.viewport.width;
                    const height: number = options.viewport.height;

                    this.svg.attr({
                        width: width,
                        height: height
                    });
                    if (!isAxisAvailable) {
                        errormsg.style({ 'margin-top': `${height / 2}px`, 'margin-left': `${width / errorMessagePadding}px` })
                            .append('text')
                            .classed('barMessageText', true)
                            .text('Insert Mandatory Axis Field');
                    } else if (isBothSameAvailable) {
                        d3.select('.barChart').remove();
                        errormsg.style({ 'margin-top': `${height / 2}px`, 'margin-left': `${width / errorMessagePadding}px` })
                            .append('text')
                            .classed('barMessageText', true)
                            .text('Both Legend and SubLegend values are same');

                    } else if (isSameAxisLegendAvailable) {
                        d3.select('.barChart').remove();
                        errormsg.style({ 'margin-top': `${height / 2}px`, 'margin-left': `${width / errorMessagePadding}px` })
                            .append('text')
                            .classed('barMessageText', true)
                            .text('Both Axis and Legend values are same');

                    } else if (!isLegendAvailable) {
                        d3.select('.barChart').remove();
                        errormsg.style({ 'margin-top': `${height / 2}px`, 'margin-left': `${width / errorMessagePadding}px` })
                            .append('text')
                            .classed('barMessageText', true)
                            .text('Insert Mandatory Legend Field');

                    } else {
                        errormsg.style({ 'margin-top': `${height / 2}px`, 'margin-left': `${width / errorMessagePadding}px` })
                            .append('text')
                            .classed('barMessageText', true)
                            .text('Insert Mandatory Value Field');
                    }

                }
        }
            d3.select('html').on('click', function (): void {
                if (THIS.settings.animation.show) {
                    THIS.rootClick();
                }
             });
            this.addSelection(globalTreeChartDataPoints);
        }
        private renderLegend(): void {
            if (!this.viewModel) {

                return;
            }
            if (!this.legendViewModel.legendData) {

                return;
            }
            const position: LegendPosition = this.settings.enableAxis.show
                ? LegendPosition[this.settings.enableAxis.position]
                : LegendPosition.None;

            this.legend.changeOrientation(position);
            this.legend.changeOrientation(position);
            this.legend.drawLegend(this.legendViewModel.legendData, this.viewport);
            this.svg.style('margin', 0);

            if (this.settings.enableAxis.show) {
                d3.select('.legend').style({display: 'block', top: 0});
                d3.select('.barChart').style({position: 'absolute' , bottom: 0 , left: 0, right: 0});
            }
            if (!this.settings.enableAxis.show) {
                d3.select('.legend').style('display', 'none');
            }
            switch (this.legend.getOrientation()) {
                case LegendPosition.Left:
                    this.viewport.width -= this.legend.getMargins().width;
                    d3.select('.legend').style('left', 0);
                    d3.select('.barChart').style({
                        right: 0,
                        left: this.legend.getMargins().width + pixelLiteral
                    });
                    break;
                case LegendPosition.LeftCenter:
                    this.viewport.width -= this.legend.getMargins().width;
                    d3.select('.legend').style('left', 0);
                    d3.select('.barChart').style({left: this.legend.getMargins().width + pixelLiteral , right: 0 });
                    break;
                case LegendPosition.Right:
                case LegendPosition.RightCenter:
                    this.viewport.width -= this.legend.getMargins().width;
                    d3.select('.barChart').style('left', 0);
                    d3.select('.legend').style('right', 0);
                    break;
                case LegendPosition.Top:
                this.viewport.height -= this.legend.getMargins().height;
                break;
                case LegendPosition.TopCenter:
                    if (d3.select('.navArrow')[0][0] !== null) {
                        const xpos : string = d3.select('.navArrow').attr('transform').substring(tenthValue,
                                                                                                 d3.select('.navArrow')
                            .attr('transform').indexOf(','));
                        if (Number(xpos) > this.viewport.width - tenthValue) {
                            this.legend.changeOrientation(0);
                            this.legend.drawLegend(this.legendViewModel.legendData, this.viewport);
                        }
                    }
                    this.viewport.height -= this.legend.getMargins().height;
                    break;
                case LegendPosition.Bottom:
                    d3.select('.barChart').style('bottom', this.legend.getMargins().height + pixelLiteral);
                    break;
                case LegendPosition.BottomCenter:
                    if (d3.select('.navArrow')[0][0] !== null) {
                        const xpos : string = d3.select('.navArrow').attr('transform').substring(tenthValue,
                                                                                                 d3.select('.navArrow')
                                                                                      .attr('transform').indexOf(','));
                        if (Number(xpos) > this.viewport.width - tenthValue) {
                            this.legend.changeOrientation(1);
                            this.legend.drawLegend(this.legendViewModel.legendData, this.viewport);
                        }
                    }
                    d3.select('.barChart').style('bottom', this.legend.getMargins().height + pixelLiteral);
                    d3.select('.legend').style({ 'margin-left': 'auto' });
                    break;
                default :
                break;
            }
            // tslint:disable-next-line:no-any
            $('.legend #legendGroup').on('click.load', '.navArrow', function (): any {
                THIS.addSelection(globalTreeChartDataPoints);
              });
            d3.select('.clearCatcher').remove();
        }
        // tslint:disable-next-line:typedef
        public zoom(d, w, h, height, index, heightcollapse) : void {
            const kx : number = w / d.dx;
            let ky : number;
            // tslint:disable-next-line:no-any
            const x : any  = d3.scale.linear().range([0, w]);
            // tslint:disable-next-line:no-any
            let y : any ;
            x.domain([d.x, d.x + d.dx]);
            ky  =  h / d.dy;
            y = d3.scale.linear().range([0, h]);
            y.domain([d.y, d.y + d.dy]);
            // tslint:disable-next-line:no-any
            let t : any ;
            let multiplier : number = 0;
            if (index !== 0) {
                multiplier =  (globalpadding + globalBarWidth ) * index;
            } else {
                multiplier = 0;
            }
            if (d3.selectAll(dotliteral + cellliteral + index).classed('backward')) {
                //for brick
                t =  d3.selectAll(dotliteral + cellliteral + index).transition();
                const tabarr: string = THIS.data.filter(
                    // tslint:disable-next-line:typedef
                    function (elem, indexNew) {
                        return THIS.data.indexOf(elem) === indexNew;
                    }
                ).join('@#');
                const tabarray: string[] = tabarr.split('@#');
                // tslint:disable-next-line:no-any
                const countArray : any = [];
                for (let iIterator: number = 0; iIterator < tabarray.length; iIterator++) {

                    countArray.push({
                        key: tabarray[iIterator],
                        count: 0,
                        color : globalcolor[tabarray[iIterator]]
                    });
                }
                if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                    t.select('rect')
                // tslint:disable-next-line:no-any
                .attr('x', function (dIterator : any) : number {
                    const parent: string = dIterator.parent[nameLiteral];
                    for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                        if (countArray[loopIterator].key === parent) {
                            countArray[loopIterator].count++;
                        }
                    }

                    return x(dIterator.x ) + multiplier + tenthValue ;
                })
                // tslint:disable-next-line:no-any
                .attr('y', function (eIterator : any) : number { return (height - h - xaxisPaddingValue) + y(eIterator.y); });

                } else {

                    t.select('rect')
                    // tslint:disable-next-line:no-any
                    .attr('x', function (aIterator : any) : number {
                        const parent: string = aIterator.parent[nameLiteral];
                        for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                            if (countArray[loopIterator].key === parent) {
                                countArray[loopIterator].count++;
                            }
                        }

                        return x(aIterator.x) + xaxisPaddingValue;
                    })
                    // tslint:disable-next-line:no-any
                    .attr('y', function (bIterator : any) : number { return  y(bIterator.y) + multiplier + tenthValue; });
                }
                groupColorArray = [];
                for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                    THIS.getColorBands(countArray[loopIterator].color, countArray[loopIterator].count);
                }
                this.animationBackward(d, index, multiplier, height, x, y, kx, ky, h, t);
                d3.selectAll(dotliteral + cellliteral + index).classed('backward', false);
                d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected', false);

            } else if (d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected1') ) {
                t =  d3.selectAll(dotliteral + cellliteral + index).transition();
                const tabarr: string = THIS.data.filter(
                    // tslint:disable-next-line:typedef
                    function (elem, indexNew) {
                        return THIS.data.indexOf(elem) === indexNew;
                    }
                ).join('@#');
                const tabarray: string[] = tabarr.split('@#');
                // tslint:disable-next-line:no-any
                const countArray : any = [];
                for (let iIterator: number = 0; iIterator < tabarray.length; iIterator++) {

                    countArray.push({
                        key: tabarray[iIterator],
                        count: 0,
                        color : globalcolor[tabarray[iIterator]]
                    });
                }
                if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                    t.select('rect')
                        // tslint:disable-next-line:no-any
                        .attr('x', function (dIterator : any) : number {
                            const parent: string = dIterator.parent[nameLiteral];
                            for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                                if (countArray[loopIterator].key === parent) {
                                    countArray[loopIterator].count++;
                                }
                            }

                            return x(dIterator.x ) + multiplier + tenthValue ;
                })
                // tslint:disable-next-line:no-any
                .attr('y', function (eIterator : any) : number { return (height - h - xaxisPaddingValue) + y(eIterator.y); });
                } else {

                    t.select('rect')
                    // tslint:disable-next-line:no-any
                    .attr('x', function (aIterator : any) : number {
                        const parent: string = aIterator.parent[nameLiteral];
                        for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                            if (countArray[loopIterator].key === parent) {
                                countArray[loopIterator].count++;
                            }
                        }

                        return x(aIterator.x) + xaxisPaddingValue;
                    })
                    // tslint:disable-next-line:no-any
                    .attr('y', function (bIterator : any) : number { return  y(bIterator.y) + multiplier + tenthValue; });
                }
                groupColorArray = [];
                for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                    THIS.getColorBands(countArray[loopIterator].color, countArray[loopIterator].count);
                }
                t.select('rect')
                .attr({
                    // tslint:disable-next-line:no-any
                    width: function(fIterator : any) : number {return Math.max(0, kx * fIterator.dx - 1); },
                    // tslint:disable-next-line:no-any
                    height : function(gIterator : any) : number {return Math.max(0, ky * gIterator.dy - 1); }
                })
                .duration(1000);
                this.animationRenderZoom(d, index, multiplier, height, x, y, kx, ky, h, t, 'ZoomOut');
                d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected1', false);
                d3.selectAll(dotliteral + cellliteral + index).classed('backward', true);
            } else if (d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected') ) {
                t =  d3.selectAll(dotliteral + cellliteral + index).transition();
                const tabarr: string = THIS.data.filter(
                    // tslint:disable-next-line:typedef
                    function (elem, indexNew) {
                        return THIS.data.indexOf(elem) === indexNew;
                    }
                ).join('@#');
                const tabarray: string[] = tabarr.split('@#');
                // tslint:disable-next-line:no-any
                const countArray : any = [];
                for (let iIterator: number = 0; iIterator < tabarray.length; iIterator++) {

                    countArray.push({
                        key: tabarray[iIterator],
                        count: 0,
                        color : globalcolor[tabarray[iIterator]]
                    });
                }
                if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                    t.select('rect')
                        // tslint:disable-next-line:no-any
                        .attr('x', function (dIterator : any): number {
                            const parent: string = dIterator.parent[nameLiteral];
                            for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                                if (countArray[loopIterator].key === parent) {
                                    countArray[loopIterator].count++;
                                }
                            }

                            return x(dIterator.x ) + multiplier + tenthValue ;
                })
                // tslint:disable-next-line:no-any
                .attr('y', function (eIterator : any) : number { return (height - h - xaxisPaddingValue) + y(eIterator.y); });
                } else {

                    t.select('rect')
                    // tslint:disable-next-line:no-any
                    .attr('x', function (aIterator : any) : number {
                        const parent: string = aIterator.parent[nameLiteral];
                        for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                            if (countArray[loopIterator].key === parent) {
                                countArray[loopIterator].count++;
                            }
                        }

                        return x(aIterator.x) + xaxisPaddingValue;
                    })
                    // tslint:disable-next-line:no-any
                    .attr('y', function (bIterator: any): number { return  y(bIterator.y) + multiplier + tenthValue; });
                }
                groupColorArray = [];
                for (let loopIterator: number = 0; loopIterator < countArray.length; loopIterator++) {
                    THIS.getColorBands(countArray[loopIterator].color, countArray[loopIterator].count);
                }
                t.select('rect')
                .attr({
                    // tslint:disable-next-line:no-any
                    width: function(fIterator : any): number {return Math.max(0, kx * fIterator.dx - 1); },
                    // tslint:disable-next-line:no-any
                    height : function(gIterator : any) : number {return Math.max(0, ky * gIterator.dy - 1); }
                })
                .duration(1000);
                this.animationRenderZoom(d, index, multiplier, height, x, y, kx, ky, h, t, 'ZoomIn');
                d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected1', true);
                d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected', false);
            } else {
                //for brick
                t = d3.selectAll(dotliteral + cellliteral + index).transition();
                if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                    t.select('rect')
                        .attr({
                            // tslint:disable-next-line:no-any
                            x : function (dIterator : any) : number {return x(dIterator.x) + multiplier + tenthValue; } ,
                            // tslint:disable-next-line:no-any
                            y : function (mIterator : any) : number { return (height - h - xaxisPaddingValue) + y(mIterator.y); }
                        });

                } else {
                    t.select('rect')
                    .attr({
                        // tslint:disable-next-line:no-any
                        x : function (aIterator : any): number {return x(aIterator.x) + xaxisPaddingValue; },
                        // tslint:disable-next-line:no-any
                        y : function (bIterator : any): number { return y(bIterator.y) + multiplier + tenthValue; }
                    });
                }
                t.select('rect')
                    .attr({
                        // tslint:disable-next-line:no-any
                        width : function (widthIterator : any): number { return Math.max(kx * widthIterator.dx - 1 , 0); },
                        // tslint:disable-next-line:no-any
                        height : function (lIterator : any): number {return Math.max(ky * lIterator.dy - 1 , 0); }
                    })
                    .duration(1000);
                const parentliteral1: string = dotliteral + THIS.replaceString(d.name.toString());
                const parentliteralNew: string = hashliteral + THIS.replaceString(d.name.toString());
                this.clearAnimation(index);
                // tslint:disable-next-line:no-any
                const titlerects: any = d3.selectAll(dotliteral + cellliteral + index).select(parentliteralNew + dataRectLiteral);
                const lenTitle: number = titlerects[0].length;
                //for title background
                for (let iterator: number = 0; iterator < lenTitle; iterator++) {

                    if (titlerects[0][iterator] != null) {
                        let widthArray : number = 0;
                        if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                            d3.select(titlerects[0][iterator]).style('fill-opacity', 0);
                            d3.select(titlerects[0][iterator]).transition()
                            // tslint:disable-next-line:no-any
                            .style('fill-opacity', function (dIterator : any) : number {
                                const text: string = dIterator[nameLiteral];
                                const xAxisPropNew: TextProperties = {
                                    text: String(text),
                                    fontFamily: THIS.settings.dataLabels.fontFamily,
                                    fontSize: THIS.settings.dataLabels.fontSize + pixelLiteral
                                };
                                const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                                widthArray = measureWidth / 2;
                                const tempVariableX: number = dIterator.dx * kx - 1;
                                const tempVariableY: number = dIterator.dy * ky - 1;
                                if (measureWidth > tempVariableX || textHeight > tempVariableY) {
                                    return 0;
                                } else {
                                    return THIS.limitValue(THIS.lowerLimitValue
                                        (THIS.settings.dataLabels.rectopacity, 0),
                                                           1);
                                }
                            })
                                // tslint:disable-next-line:no-any
                                .attr('x', function (axiskIterator : any) : number {
                                    return x(axiskIterator.x) + multiplier + tenthValue
                                    + Math.max(kx * axiskIterator.dx - 1) / 2 - widthArray;
                                })
                                // tslint:disable-next-line:no-any
                                .attr('y', function (lIterator : any) : number {
                                    return (height - h - heightPaddingValue)
                                    + y(lIterator.y) + Math.max(ky * lIterator.dy - 1) / 2 - textHeight;
                                })
                                .attr('fill', THIS.settings.dataLabels.backgroundColor)
                                .duration(1000);

                        } else {
                            d3.select(titlerects[0][iterator]).style('fill-opacity', 0);
                            d3.select(titlerects[0][iterator]).transition()
                                // tslint:disable-next-line:no-any
                                .style('fill-opacity', function (eIterator : any) : number {
                                    const text: string = eIterator[nameLiteral];
                                    const xAxisPropNew: TextProperties = {
                                        text: String(text),
                                        fontFamily: THIS.settings.dataLabels.fontFamily,
                                        fontSize: THIS.settings.dataLabels.fontSize + pixelLiteral
                                    };
                                    const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + fifthValue;
                                    const tempVariableX: number = eIterator.dx * kx - 1;
                                    const tempVariableY: number = eIterator.dy * ky - 1;
                                    widthArray = measureWidth / 2;
                                    if (measureWidth > tempVariableX || textHeight > tempVariableY) {
                                        return 0;
                                    } else {
                                        return THIS.limitValue(THIS.lowerLimitValue
                                            (THIS.settings.dataLabels.rectopacity, 0),
                                                               1);
                                    }
                                })
                                // tslint:disable-next-line:no-any
                                .attr('x', function (axiskIterator : any) : number {

                                return x(axiskIterator.x) + xaxisPaddingValue + Math.max(kx * axiskIterator.dx) / 2 - widthArray;
                            })
                                // tslint:disable-next-line:no-any
                                .attr('y', function (lIterator : any) : number {
                                    return y(lIterator.y) + multiplier + tenthValue + Math.max(ky * lIterator.dy) / 2 - textHeight;
                                })
                                .attr('fill', THIS.settings.dataLabels.backgroundColor)
                                .duration(1000);
                        }
                    }
                }
                //tslint:disable-next-line:no-any
                const required1: any = d3.selectAll(dotliteral + cellliteral + index).select(parentliteral1);
                const len1: number = required1[0].length;

                let nonEnptyLength: number = 0;
                for (let iterator: number = 0; iterator < len1; iterator++) {
                    if (required1[0][iterator] != null) {
                        nonEnptyLength += 1;
                    }
                }
                //for colors
                groupColorArray = [];
                let count: number = 0;
                // tslint:disable-next-line:no-any
                const parentColor: string = globalcolor[d[nameliteral]];
                THIS.getColorBands(parentColor, nonEnptyLength);
                for (let iterator: number = 0; iterator < len1; iterator++) {
                    if (required1[0][iterator] != null) {
                        d3.select(required1[0][iterator])
                            .attr('fill', globalcolor[d[nameliteral]])
                            .style({
                                'fill-opacity': groupColorArray[count],
                                stroke: THIS.settings.borderSettings.color,
                                'stroke-width': THIS.limitValue(THIS.lowerLimitValue
                                    (THIS.settings.borderSettings.borderstroke, 1),
                                                                paddingValue),
                                'stroke-opacity': THIS.limitValue(THIS.lowerLimitValue
                                    (THIS.settings.borderSettings.borderopacity, 0),
                                                                  1)

                            });
                        count++;
                    }
                }
                //for datalabels
                if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                    t.select('text')
                        // tslint:disable-next-line:no-any
                        .attr('x', function (aIterator : any): number {
                            return x(aIterator.x) + multiplier + tenthValue + (kx * aIterator.dx - 1) / 2; })
                        // tslint:disable-next-line:no-any
                        .attr('y', function (bIterator : any): number  {
                             return (height - h - xaxisPaddingValue + y(bIterator.y)) + (ky * bIterator.dy - 1) / 2; });
                } else {
                    t.select('text')
                        // tslint:disable-next-line:no-any
                        .attr('x', function (mIterator : any): number  {
                            return x(mIterator.x) + xaxisPaddingValue + (kx * mIterator.dx - 1) / 2; })
                        // tslint:disable-next-line:no-any
                        .attr('y', function (dIterator : any) : number {
                            return y(dIterator.y) + multiplier + tenthValue + (ky * dIterator.dy - 1) / 2; });
                }
                t.select('text')
                    // tslint:disable-next-line:no-any
                    .text(function (textIterator : any) : string {
                        const text: string = textIterator[nameLiteral];
                        const xAxisPropNew: TextProperties = {
                            text: String(text),
                            fontFamily: THIS.settings.dataLabels.fontFamily,
                            fontSize: THIS.settings.dataLabels.fontSize + pixelLiteral
                        };
                        const measureWidth: number = textMeasurementService.measureSvgTextWidth(xAxisPropNew) + paddingValue;
                        const measureHeight: number = textHeight;
                        const tempVariableX: number = textIterator.dx * kx - 1;
                        const tempVariableY: number = textIterator.dy * ky - 1;
                        if (measureWidth > tempVariableX || measureHeight > tempVariableY) {
                            return '';
                        } else {
                            return text;
                        }

                    })
                    .duration(1000);
                // tslint:disable-next-line:no-any
                d3.selectAll(dotliteral + cellliteral + index).select('text').style('fill', 'none');
                const parentliteral: string = hashliteral + THIS.replaceString(d.name.toString());
                // tslint:disable-next-line:no-any
                const required: any = d3.selectAll(dotliteral + cellliteral + index).select(parentliteral);
                const len: number = required[0].length;
                for (let iterator: number = 0; iterator < len; iterator++) {
                    if (required[0][iterator] != null) {
                        d3.select(required[0][iterator]).style({
                            'font-size': THIS.settings.dataLabels.fontSize + pixelLiteral,
                            margin: 'auto', display: 'block',
                            fill: THIS.settings.dataLabels.color,
                            'font-family': THIS.settings.dataLabels.fontFamily
                        });
                    }
                }
                node = d;
                d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected', true);
            }
            (<Event>d3.event).stopPropagation();
          }
        // tslint:disable-next-line:no-any
        private getTooltipData(data: any): VisualTooltipDataItem[] {
            let tooltipDataPointsFinal: VisualTooltipDataItem[];
            tooltipDataPointsFinal = [];
            //mandatory fields
            for (let iterator : number = 0; iterator < THIS.tooltipData.length ; iterator++) {
                if (JSON.stringify(THIS.tooltipData[iterator][0].value) === JSON.stringify(data.identity)) {
                    for (let jIterator : number = 1; jIterator < THIS.tooltipData[iterator].length ; jIterator++ ) {
                        let dataTooltip: VisualTooltipDataItem;
                        dataTooltip = {
                            displayName: '',
                            value: ''
                        };
                        dataTooltip.displayName = THIS.tooltipData[iterator][jIterator].name;
                        if (THIS.tooltipData[iterator][jIterator].value === '(null)') {
                            dataTooltip.value = '(Blank)';

                        } else {
                            dataTooltip.value = String(THIS.tooltipData[iterator][jIterator].value);
                        }
                        tooltipDataPointsFinal.push(dataTooltip);
                    }
                    break;
                }
            }

            return tooltipDataPointsFinal;

        }
        // tslint:disable-next-line:typedef
        public zoomSingle(d, w, h, height, index, heightcollapse) {
            const kx: number = w / d.dx;
            let ky: number;
            // tslint:disable-next-line:no-any
            const x: any = d3.scale.linear().range([0, w]);
            // tslint:disable-next-line:no-any
            let y: any;
            x.domain([d.x, d.x + d.dx]);
            ky = h / d.dy;
            y = d3.scale.linear().range([0, h]);
            y.domain([d.y, d.y + d.dy]);
            // tslint:disable-next-line:no-any
            let t: any;
            let multiplier: number = 0;
            if (index !== 0) {
                multiplier = (globalpadding + globalBarWidth) * index;
            } else {
                multiplier = 0;
            }
            if (d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected')) {
                //for brick
                t = d3.selectAll(dotliteral + cellliteral + index).transition();
                const tabarr: string = THIS.data.filter(
                    // tslint:disable-next-line:typedef
                    function (elem, indexNew) {
                        return THIS.data.indexOf(elem) === indexNew;
                    }
                ).join('@#');
                const tabarray: string[] = tabarr.split('@#');
                // tslint:disable-next-line:no-any
                const countArray: any = [];
                for (let iIterator: number = 0; iIterator < tabarray.length; iIterator++) {

                    countArray.push({
                        key: tabarray[iIterator],
                        count: 0,
                        color: globalcolor[tabarray[iIterator]]
                    });
                }
                if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                    t.select('rect')
                        // tslint:disable-next-line:no-any
                        .attr('x', function (dIterator : any) : number {
                            const parent: string = dIterator.parent[nameLiteral];
                            for (let loopiterator: number = 0; loopiterator < countArray.length; loopiterator++) {
                                if (countArray[loopiterator].key === parent) {
                                    countArray[loopiterator].count++;
                                }
                            }

                            return x(dIterator.x) + multiplier + tenthValue;
                        })
                        // tslint:disable-next-line:no-any
                        .attr('y', function (eIterator : any) : number { return (height - h - xaxisPaddingValue) + y(eIterator.y); });

                } else {

                    t.select('rect')
                        // tslint:disable-next-line:no-any
                        .attr('x', function (aIterator : any) : number {
                            const parent: string = aIterator.parent[nameLiteral];
                            for (let loopiterator: number = 0; loopiterator < countArray.length; loopiterator++) {
                                if (countArray[loopiterator].key === parent) {
                                    countArray[loopiterator].count++;
                                }
                            }

                            return x(aIterator.x) + xaxisPaddingValue;
                        })
                        // tslint:disable-next-line:no-any
                        .attr('y', function (bIterator : any) : number { return y(bIterator.y) + multiplier + tenthValue; });
                }
                groupColorArray = [];
                for (let loopiterator: number = 0; loopiterator < countArray.length; loopiterator++) {
                    THIS.getColorBands(countArray[loopiterator].color, countArray[loopiterator].count);
                }
                this.animationBackward(d, index, multiplier, height, x, y, kx, ky, h, t);
                d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected', false);

            } else {
                t =  d3.selectAll(dotliteral + cellliteral + index).transition();
                const tabarr: string = THIS.data.filter(
                    // tslint:disable-next-line:typedef
                    function (elem, indexNew) {
                        return THIS.data.indexOf(elem) === indexNew;
                    }
                ).join('@#');
                const tabarray: string[] = tabarr.split('@#');
                // tslint:disable-next-line:no-any
                const countArray : any = [];
                for (let iIterator: number = 0; iIterator < tabarray.length; iIterator++) {

                    countArray.push({
                        key: tabarray[iIterator],
                        count: 0,
                        color : globalcolor[tabarray[iIterator]]
                    });
                }
                if (THIS.settings.chartOrientation.orientation === 'Vertical') {
                    t.select('rect')
                        // tslint:disable-next-line:no-any
                        .attr('x', function (dIterator : any) : number {
                            const parent: string = dIterator.parent[nameLiteral];
                            for (let loopiterator: number = 0; loopiterator < countArray.length; loopiterator++) {
                                if (countArray[loopiterator].key === parent) {
                                    countArray[loopiterator].count++;
                                }
                            }

                            return x(dIterator.x ) + multiplier + tenthValue ;
                })
                // tslint:disable-next-line:no-any
                .attr('y', function (eIterator : any) : number { return (height - h - xaxisPaddingValue) + y(eIterator.y); });
                } else {

                    t.select('rect')
                    // tslint:disable-next-line:no-any
                    .attr('x', function (aIterator : any) : number {
                        const parent: string = aIterator.parent[nameLiteral];
                        for (let loopiterator: number = 0; loopiterator < countArray.length; loopiterator++) {
                            if (countArray[loopiterator].key === parent) {
                                countArray[loopiterator].count++;
                            }
                        }

                        return x(aIterator.x) + xaxisPaddingValue;
                    })
                    // tslint:disable-next-line:no-any
                    .attr('y', function (bIterator : any) : number { return  y(bIterator.y) + multiplier + tenthValue; });
                }
                groupColorArray = [];
                for (let loopiterator: number = 0; loopiterator < countArray.length; loopiterator++) {
                    THIS.getColorBands(countArray[loopiterator].color, countArray[loopiterator].count);
                }
                t.select('rect')
                .attr({
                    // tslint:disable-next-line:no-any
                    width: function(fIterator : any) : number {return Math.max(0, kx * fIterator.dx - 1); },
                    // tslint:disable-next-line:no-any
                    height : function(gIterator : any) : number {return Math.max(0, ky * gIterator.dy - 1); }
                })
                .duration(500);
                this.animationRenderZoom(d, index, multiplier, height, x, y, kx, ky, h, t, 'ZoomIn');
                d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected1', true);
                d3.selectAll(dotliteral + cellliteral + index).classed('zoom-selected', true);
            }
            (<Event>d3.event).stopPropagation();
        }
    }
    interface ITreeBehaviorOptions {
        // tslint:disable-next-line:no-any
        clearCatcher: any;
        // tslint:disable-next-line:no-any
        brickSelection: any;
        // tslint:disable-next-line:no-any
        legendSelection: any;
        interactivityService: IInteractivityService;
    }
    /**
     * TreeBehaviour class contains variables and methods for Selection.
     */
    class TreeBehavior implements IInteractiveBehavior {
        private options: ITreeBehaviorOptions;
        public bindEvents(options: ITreeBehaviorOptions, selectionHandler: ISelectionHandler): void {
            this.options = options;
            // tslint:disable-next-line:no-any
            const clearCatcher: any = options.clearCatcher;
            const interactivityService: IInteractivityService = options.interactivityService;
            // tslint:disable-next-line:no-any
            options.brickSelection.on('click', (d: any) => {
                const legendArray: string = THIS.data.filter(
                    // tslint:disable-next-line:typedef
                    function (elem, indexIterator) {
                        return THIS.data.indexOf(elem) === indexIterator;
                    }
                ).join('@#');
                const tabarrayNew: string[] = legendArray.split('@#');
                clickedFlagLiteral = 1;
                if (THIS.settings.animation.show) {
                    if (tabarrayNew.length > 1) {
                        THIS.clicked(d);
                    } else {
                        THIS.clickedSingle(d);
                    }
                } else {
                    selectionHandler.handleSelection(d, false);
                }
                clickedFlagLiteral = 0;
                (<Event>d3.event).stopPropagation();
            });
            clearCatcher.on('click', () => {
                THIS.resetOpacity();
                selectionHandler.handleClearSelection();
            });
            options.legendSelection.on('click', (d: SelectableDataPoint) => {

                selectionHandler.handleSelection(d, false);
                (<Event>d3.event).stopPropagation();
            });
            this.renderSelection(interactivityService.hasSelection());
        }
        // tslint:disable-next-line:no-any
        public renderSelection(hasSelection: boolean): any {
            //on click of brick opacity is not changed
            if (!clickedFlagLiteral || !THIS.settings.animation.show) {
                this.options.brickSelection.style('opacity', (d: SelectableDataPoint) => {
                    return (hasSelection && !d.selected) ? 0.5 : 1;
                });
                this.options.legendSelection.style('opacity', (d: SelectableDataPoint) => {
                    return (hasSelection && !d.selected) ? 0.5 : 1;
                });
            }
        }
    }
}
