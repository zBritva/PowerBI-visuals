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
module powerbi.extensibility.visual.DumbbellChartB13A88DFEE724350B46BCF0EFA5B6E321  {
    'use strict';

    // in order to improve the performance, one can update the <head> only in the initial rendering.
    // set to 'true' if you are using different packages to create the widgets
    const updateHTMLHead: boolean = false;
    const renderVisualUpdateType: number[] = [
        VisualUpdateType.Resize,
        VisualUpdateType.ResizeEnd,
        VisualUpdateType.Resize + VisualUpdateType.ResizeEnd
    ];

    export class DumbbellChart implements IVisual {
        private rootElement: HTMLElement;
        private headNodes: Node[];
        private bodyNodes: Node[];
        private settings: VisualSettings;

        public visualColorsSettings: IVisualColors;
        public xaxisTextSettings: IXaxisText;
        public yaxisTextSettings: IYaxisText;
        public legendSettings: IlegendSettings;

        public constructor(options: VisualConstructorOptions) {
            if (options && options.element) {
                this.rootElement = options.element;
            }
            this.headNodes = [];
            this.bodyNodes = [];
        }

        public update(options: VisualUpdateOptions): void {
            if (!options ||
                !options.type ||
                !options.viewport ||
                !options.dataViews ||
                options.dataViews.length === 0 ||
                !options.dataViews[0]) {
                return;
            }

            const dataView: DataView = options.dataViews[0];
            this.settings = DumbbellChart.parseSettings(dataView);
            this.visualColorsSettings = this.getVisualColors(dataView);
            this.xaxisTextSettings = this.getXaxisText(dataView);
            this.yaxisTextSettings = this.getYaxisText(dataView);
            this.legendSettings = this.getLegend(dataView);

            let payloadBase64: string = null;
            if (dataView.scriptResult && dataView.scriptResult.payloadBase64) {
                payloadBase64 = dataView.scriptResult.payloadBase64;
            }

            if (renderVisualUpdateType.indexOf(options.type) === -1) {
                if (payloadBase64) {
                    this.injectCodeFromPayload(payloadBase64);
                }
            } else {
                this.onResizing(options.viewport);
            }
        }

        //assigning default values to properties
        public getDefaultXaxisText(): IXaxisText {
            return {
                xtitleText: '',
                xlegendColor: 'grey',
                xtextColor: 'black',
                xLegend: true
            };
        }

        public getDefaultYaxisText(): IYaxisText {
            return {
                ytitleText: '',
                ylegendColor: 'grey',
                ytextColor: 'black',
                yLegend: true
            };
        }

        public getDefaultLegend(): IlegendSettings {
            return {
                show: true
            };
        }

        public getDefaultVisualColors(): IVisualColors {
            return {
                valueColor1: '#01B8AA',
                valueColor2: '#FD625E',
                valueColor3: '#A66999',
                valueColor4: '#F2C80F',

                segmentColor: '#5F6B6D',
                segment2Color: '#8AD4EB',
                segment3Color: '#374649',

                plotColor: 'white',
                chartColor: 'white'
            };
        }

        //getting setting values for chart properties
        public getVisualColors(dataView: DataView): IVisualColors {
            const visualColorsSettings: IVisualColors = this.getDefaultVisualColors();
            let objects: DataViewObjects = null;
            if (!dataView.metadata || !dataView.metadata.objects) {
                return visualColorsSettings;
            }
            objects = dataView.metadata.objects;
            visualColorsSettings.valueColor1 =
            DataViewObjects.getFillColor(objects, chartProp.IVisualColors.valueColor1, visualColorsSettings.valueColor1);
            visualColorsSettings.valueColor2 =
            DataViewObjects.getFillColor(objects, chartProp.IVisualColors.valueColor2, visualColorsSettings.valueColor2);
            visualColorsSettings.valueColor3 =
            DataViewObjects.getFillColor(objects, chartProp.IVisualColors.valueColor3, visualColorsSettings.valueColor3);
            visualColorsSettings.valueColor4 =
            DataViewObjects.getFillColor(objects, chartProp.IVisualColors.valueColor4, visualColorsSettings.valueColor4);
            visualColorsSettings.segmentColor =
            DataViewObjects.getFillColor(objects, chartProp.IVisualColors.segmentColor, visualColorsSettings.segmentColor);
            visualColorsSettings.segment2Color =
            DataViewObjects.getFillColor(objects, chartProp.IVisualColors.segment2Color, visualColorsSettings.segment2Color);
            visualColorsSettings.segment3Color =
            DataViewObjects.getFillColor(objects, chartProp.IVisualColors.segment3Color, visualColorsSettings.segment3Color);
            visualColorsSettings.chartColor =
            DataViewObjects.getFillColor(objects, chartProp.IVisualColors.chartColor, visualColorsSettings.chartColor);
            visualColorsSettings.plotColor =
            DataViewObjects.getFillColor(objects, chartProp.IVisualColors.plotColor, visualColorsSettings.plotColor);

            return visualColorsSettings;
        }

        public getXaxisText(dataView: DataView): IXaxisText {
            const xaxisTextSettings: IXaxisText = this.getDefaultXaxisText();
            let objects: DataViewObjects = null;
            if (!dataView.metadata || !dataView.metadata.objects) {
                return xaxisTextSettings;
            }
            objects = dataView.metadata.objects;
            xaxisTextSettings.xtitleText = DataViewObjects.getValue(objects, chartProp.IXaxisText.xtitleText, xaxisTextSettings.xtitleText);
            xaxisTextSettings.xlegendColor =
            DataViewObjects.getFillColor(objects, chartProp.IXaxisText.xlegendColor, xaxisTextSettings.xlegendColor);
            xaxisTextSettings.xtextColor =
            DataViewObjects.getFillColor(objects, chartProp.IXaxisText.xtextColor, xaxisTextSettings.xtextColor);
            xaxisTextSettings.xLegend = DataViewObjects.getValue(objects, chartProp.IXaxisText.xLegend, xaxisTextSettings.xLegend);

            return xaxisTextSettings;
        }

        public getYaxisText(dataView: DataView): IYaxisText {
            const yaxisTextSettings: IYaxisText = this.getDefaultYaxisText();
            let objects: DataViewObjects = null;
            if (!dataView.metadata || !dataView.metadata.objects) {
                return yaxisTextSettings;
            }
            objects = dataView.metadata.objects;
            yaxisTextSettings.ytitleText = DataViewObjects.getValue(objects, chartProp.IYaxisText.ytitleText, yaxisTextSettings.ytitleText);
            yaxisTextSettings.ylegendColor =
            DataViewObjects.getFillColor(objects, chartProp.IYaxisText.ylegendColor, yaxisTextSettings.ylegendColor);
            yaxisTextSettings.ytextColor =
            DataViewObjects.getFillColor(objects, chartProp.IYaxisText.ytextColor, yaxisTextSettings.ytextColor);
            yaxisTextSettings.yLegend = DataViewObjects.getValue(objects, chartProp.IYaxisText.yLegend, yaxisTextSettings.yLegend);

            return yaxisTextSettings;
        }

        public getLegend(dataView: DataView): IlegendSettings {
            const legendSettings: IlegendSettings = this.getDefaultLegend();
            let objects: DataViewObjects = null;
            if (!dataView.metadata || !dataView.metadata.objects) {
                return legendSettings;
            }
            objects = dataView.metadata.objects;
            legendSettings.show = DataViewObjects.getValue(objects, chartProp.legend.show, legendSettings.show);

            return legendSettings;
        }

        public onResizing(finalViewport: IViewport): void {
            /* add code to handle resizing of the view port */
        }

        private injectCodeFromPayload(payloadBase64: string): void {
            // inject HTML from payload, created in R
            // the code is injected to the 'head' and 'body' sections.
            // if the visual was already rendered, the previous DOM elements are cleared

            ResetInjector();

            if (!payloadBase64) {
                return;
            }

            // create 'virtual' HTML, so parsing is easier
            const el: HTMLHtmlElement = document.createElement('html');
            try {
                el.innerHTML = window.atob(payloadBase64);
            } catch (err) {
                return;
            }

            // if 'updateHTMLHead == false', then the code updates the header data only on the 1st rendering
            // this option allows loading and parsing of large and recurring scripts only once.
            if (updateHTMLHead || this.headNodes.length === 0) {
                while (this.headNodes.length > 0) {
                    const tempNode: Node = this.headNodes.pop();
                    document.head.removeChild(tempNode);
                }
                const headList: NodeListOf<HTMLHeadElement> = el.getElementsByTagName('head');
                if (headList && headList.length > 0) {
                    const head: HTMLHeadElement = headList[0];
                    this.headNodes = ParseElement(head, document.head);
                }
            }

            // Update 'body' nodes, under the rootElement
            while (this.bodyNodes.length > 0) {
                const tempNode: Node = this.bodyNodes.pop();
                this.rootElement.removeChild(tempNode);
            }
            const bodyList: NodeListOf<HTMLBodyElement> = el.getElementsByTagName('body');
            if (bodyList && bodyList.length > 0) {
                const body: HTMLBodyElement = bodyList[0];
                this.bodyNodes = ParseElement(body, this.rootElement);
            }

            RunHTMLWidgetRenderer();
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /**
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
         * objects and properties you want to expose to the users in the property pane.
         *
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions):
            VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            let objectName: string;
            objectName = options.objectName;
            let objectEnum: VisualObjectInstance[];
            objectEnum = [];
            let props: {} = {};
            switch (objectName) {
                case 'visualColors':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            valueColor1: this.visualColorsSettings.valueColor1,
                            valueColor2: this.visualColorsSettings.valueColor2,
                            valueColor3: this.visualColorsSettings.valueColor3,
                            valueColor4: this.visualColorsSettings.valueColor4,

                            segmentColor: this.visualColorsSettings.segmentColor,
                            segment2Color: this.visualColorsSettings.segment2Color,
                            segment3Color: this.visualColorsSettings.segment3Color,

                            plotColor: this.visualColorsSettings.plotColor,
                            chartColor: this.visualColorsSettings.chartColor

                        },
                        selector: null
                    });
                    break;

                case 'xAxis':
                    if (this.xaxisTextSettings.xLegend === true) {
                        props = {
                            titleText: this.xaxisTextSettings.xtitleText,
                            titleColor: this.xaxisTextSettings.xlegendColor,
                            showLabel: this.xaxisTextSettings.xLegend,
                            labelColor: this.xaxisTextSettings.xtextColor

                        };
                    } else {
                        props = {
                            titleText: this.xaxisTextSettings.xtitleText,
                            titleColor: this.xaxisTextSettings.xlegendColor,
                            showLabel: this.xaxisTextSettings.xLegend

                        };
                    }
                    objectEnum.push({
                        objectName: objectName,
                        properties: props,
                        selector: null
                    });
                    break;

                case 'yAxis':
                    if (this.yaxisTextSettings.yLegend === true) {
                        props = {
                            titleText: this.yaxisTextSettings.ytitleText,
                            titleColor: this.yaxisTextSettings.ylegendColor,
                            showLabel: this.yaxisTextSettings.yLegend,
                            labelColor: this.yaxisTextSettings.ytextColor
                        };
                    } else {
                        props = {
                            titleText: this.yaxisTextSettings.ytitleText,
                            titleColor: this.yaxisTextSettings.ylegendColor,
                            showLabel: this.yaxisTextSettings.yLegend
                        };
                    }
                    objectEnum.push({
                        objectName: objectName,
                        properties: props,
                        selector: null
                    });
                    break;

                case 'legend':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            show: this.legendSettings.show
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
