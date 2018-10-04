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
    'use strict';

    // tslint:disable-next-line:typedef
    const chartProp = {

        forecastSettings: {
            units: <DataViewObjectPropertyIdentifier>{ objectName: 'forecastSettings', propertyName: 'units' },
            split: <DataViewObjectPropertyIdentifier>{ objectName: 'forecastSettings', propertyName: 'split' },
            method: <DataViewObjectPropertyIdentifier>{ objectName: 'forecastSettings', propertyName: 'method' },
            confLevel: <DataViewObjectPropertyIdentifier>{ objectName: 'forecastSettings', propertyName: 'confLevel' },
            confInterval: <DataViewObjectPropertyIdentifier>{ objectName: 'forecastSettings', propertyName: 'confInterval' },
            lambda: <DataViewObjectPropertyIdentifier>{ objectName: 'forecastSettings', propertyName: 'lambda' },
            lambdaValue: <DataViewObjectPropertyIdentifier>{ objectName: 'forecastSettings', propertyName: 'lambdaValue' },
            biasAdj: <DataViewObjectPropertyIdentifier>{ objectName: 'forecastSettings', propertyName: 'biasAdj' }
        },

        modelSettings: {
            modelTuning: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'modelTuning' },
            decay: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'decay' },
            maxit: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'maxit' },
            size: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'size' },
            repeats: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'repeats' },
            maxp: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'maxp' },
            maxq: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'maxq' },
            maxd: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'maxd' },
            maxP: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'maxP' },
            maxQ: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'maxQ' },
            maxD: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'maxD' },
            seasonal: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'seasonal' },
            allowDrift: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'allowDrift' },
            allowMean: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'allowMean' },
            stepWise: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'stepWise' },
            errorType: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'errorType' },
            trendType: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'trendType' },
            sWindow: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'sWindow' },
            sWindowValue: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'sWindowValue' },
            tWindow: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'tWindow' },
            tWindowValue: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'tWindowValue' },
            robust: <DataViewObjectPropertyIdentifier>{ objectName: 'modelSettings', propertyName: 'robust' }
        },

        plotSettings: {
            title: <DataViewObjectPropertyIdentifier>{ objectName: 'plotSettings', propertyName: 'title' },
            plotColor: <DataViewObjectPropertyIdentifier>{ objectName: 'plotSettings', propertyName: 'plotColor' },
            fline: <DataViewObjectPropertyIdentifier>{ objectName: 'plotSettings', propertyName: 'fline' },
            hline: <DataViewObjectPropertyIdentifier>{ objectName: 'plotSettings', propertyName: 'hline' },
            cline: <DataViewObjectPropertyIdentifier>{ objectName: 'plotSettings', propertyName: 'cline' },
            flineText: <DataViewObjectPropertyIdentifier>{ objectName: 'plotSettings', propertyName: 'flineText' },
            hlineText: <DataViewObjectPropertyIdentifier>{ objectName: 'plotSettings', propertyName: 'hlineText' }
        },

        xaxisSettings: {
            xTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'xaxisSettings', propertyName: 'xTitle' },
            xZeroline: <DataViewObjectPropertyIdentifier>{ objectName: 'xaxisSettings', propertyName: 'xZeroline' },
            xLabels: <DataViewObjectPropertyIdentifier>{ objectName: 'xaxisSettings', propertyName: 'xLabels' },
            xGrid: <DataViewObjectPropertyIdentifier>{ objectName: 'xaxisSettings', propertyName: 'xGrid' },
            xGridCol: <DataViewObjectPropertyIdentifier>{ objectName: 'xaxisSettings', propertyName: 'xGridCol' },
            xGridWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'xaxisSettings', propertyName: 'xGridWidth' },
            xAxisBaseLine: <DataViewObjectPropertyIdentifier>{ objectName: 'xaxisSettings', propertyName: 'xAxisBaseLine' },
            xAxisBaseLineCol: <DataViewObjectPropertyIdentifier>{ objectName: 'xaxisSettings', propertyName: 'xAxisBaseLineCol' },
            xAxisBaseLineWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'xaxisSettings', propertyName: 'xAxisBaseLineWidth' }

        },

        yaxisSettings: {
            yTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'yaxisSettings', propertyName: 'yTitle' },
            yZeroline: <DataViewObjectPropertyIdentifier>{ objectName: 'yaxisSettings', propertyName: 'yZeroline' },
            yLabels: <DataViewObjectPropertyIdentifier>{ objectName: 'yaxisSettings', propertyName: 'yLabels' },
            yGrid: <DataViewObjectPropertyIdentifier>{ objectName: 'yaxisSettings', propertyName: 'yGrid' },
            yGridCol: <DataViewObjectPropertyIdentifier>{ objectName: 'yaxisSettings', propertyName: 'yGridCol' },
            yGridWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'yaxisSettings', propertyName: 'yGridWidth' },
            yAxisBaseLine: <DataViewObjectPropertyIdentifier>{ objectName: 'yaxisSettings', propertyName: 'yAxisBaseLine' },
            yAxisBaseLineCol: <DataViewObjectPropertyIdentifier>{ objectName: 'yaxisSettings', propertyName: 'yAxisBaseLineCol' },
            yAxisBaseLineWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'yaxisSettings', propertyName: 'yAxisBaseLineWidth' }
        }

    };

    const updateHTMLHead: boolean = false;
    const renderVisualUpdateType: number[] = [
        VisualUpdateType.Resize,
        VisualUpdateType.ResizeEnd,
        VisualUpdateType.Resize + VisualUpdateType.ResizeEnd
    ];

    export class Visual implements IVisual {

        private rootElement: HTMLElement;
        private headNodes: Node[];
        private bodyNodes: Node[];
        private settings: VisualSettings;
        private dataViews: DataView;
        public forecastSettings: IForecastSettings;
        public modelSettings: IModelSettings;
        public plotSettings: IPlotSettings;
        public xaxisSettings: IXaxisSettings;
        public yaxisSettings: IYaxisSettings;

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
            this.settings = Visual.parseSettings(dataView);

            this.forecastSettings = this.getforecastSettings(dataView);
            this.modelSettings = this.getmodelSettings(dataView);
            this.plotSettings = this.getplotSettings(dataView);
            this.xaxisSettings = this.getxaxisSettings(dataView);
            this.yaxisSettings = this.getyaxisSettings(dataView);

            let payloadBase64: string = null;
            if (dataView.scriptResult && dataView.scriptResult.payloadBase64) {
                payloadBase64 = dataView.scriptResult.payloadBase64;
            }

            if (renderVisualUpdateType.indexOf(options.type) === -1) {
                if (payloadBase64) {
                    this.injectCodeFromPayload(payloadBase64);
                }
            }

        }

        public getDefaultforecastSettings(): IForecastSettings {
            return {
                units: 10,
                split: '0.75',
                method: 'LR',
                confInterval: false,
                confLevel: '0.8',
                lambda: 'NULL',
                lambdaValue: 0,
                biasAdj: false
            };
        }

        public getDefaultmodelSettings(): IModelSettings {
            return {
                modelTuning: 'auto',
                decay: 0.0009,
                maxit: 200,
                size: 20,
                repeats: 20,
                maxp: 3,
                maxq: 3,
                maxd: 2,
                maxP: 2,
                maxQ: 2,
                maxD: 1,
                seasonal: true,
                allowDrift: false,
                allowMean: false,
                stepWise: true,
                errorType: 'Z',
                trendType: 'Z',
                sWindow: 'periodic',
                sWindowValue: 10,
                tWindow: 'NULL',
                tWindowValue: 10,
                robust: false

            };
        }

        public getDefaultplotSettings(): IPlotSettings {
            return {
                title: 'Forecast',
                plotColor: '#FFFFFF',
                fline: '#F2C80F',
                hline: '#01B8AA',
                cline: '#F9F9F9',
                flineText: 'Predicted',
                hlineText: 'Observed'
            };
        }

        public getDefaultxaxisSettings(): IXaxisSettings {
            return {
                xTitle: 'Time',
                xZeroline: true,
                xLabels: true,
                xGrid: true,
                xGridCol: '#BFC4C5',
                xGridWidth: 0.1,
                xAxisBaseLine: true,
                xAxisBaseLineCol: '#000000',
                xAxisBaseLineWidth: 4
            };
        }

        public getDefaultyaxisSettings(): IYaxisSettings {
            return {
                yTitle: 'Values',
                yZeroline: true,
                yLabels: true,
                yGrid: true,
                yGridCol: '#BFC4C5',
                yGridWidth: 0.1,
                yAxisBaseLine: true,
                yAxisBaseLineCol: '#000000',
                yAxisBaseLineWidth: 4
            };
        }

        public getforecastSettings(dataView: DataView): IForecastSettings {
            const forecastSettings: IForecastSettings = this.getDefaultforecastSettings();
            let objects: DataViewObjects = null;

            if (!dataView.metadata || !dataView.metadata.objects) {
                return forecastSettings;
            }

            objects = dataView.metadata.objects;

            forecastSettings.units =
                Math.max(Math.min(DataViewObjects.getValue(objects, chartProp.forecastSettings.units, forecastSettings.units), 500), 10);
            forecastSettings.split = DataViewObjects.getValue(objects, chartProp.forecastSettings.split, forecastSettings.split);
            forecastSettings.method = DataViewObjects.getValue(objects, chartProp.forecastSettings.method, forecastSettings.method);
            forecastSettings.confInterval = DataViewObjects.getValue
                (objects, chartProp.forecastSettings.confInterval, forecastSettings.confInterval);
            forecastSettings.confLevel = DataViewObjects.getValue
                (objects, chartProp.forecastSettings.confLevel, forecastSettings.confLevel);
            forecastSettings.lambda = DataViewObjects.getValue(objects, chartProp.forecastSettings.lambda, forecastSettings.lambda);
            forecastSettings.lambdaValue = Math.max(Math.min(DataViewObjects.getValue
                (objects, chartProp.forecastSettings.lambdaValue, forecastSettings.lambdaValue),
                                                             5),
                                                    -5);
            forecastSettings.biasAdj = DataViewObjects.getValue(objects, chartProp.forecastSettings.biasAdj, forecastSettings.biasAdj);

            return forecastSettings;
        }

        public getmodelSettings(dataView: DataView): IModelSettings {
            const modelSettings: IModelSettings = this.getDefaultmodelSettings();
            let objects: DataViewObjects = null;

            if (!dataView.metadata || !dataView.metadata.objects) {
                return modelSettings;
            }

            objects = dataView.metadata.objects;

            modelSettings.modelTuning = DataViewObjects.getValue(objects, chartProp.modelSettings.modelTuning, modelSettings.modelTuning);
            modelSettings.decay = DataViewObjects.getValue(objects, chartProp.modelSettings.decay, modelSettings.decay);
            modelSettings.maxit = DataViewObjects.getValue(objects, chartProp.modelSettings.maxit, modelSettings.maxit);
            modelSettings.size = DataViewObjects.getValue(objects, chartProp.modelSettings.size, modelSettings.size);
            modelSettings.repeats = DataViewObjects.getValue(objects, chartProp.modelSettings.repeats, modelSettings.repeats);
            modelSettings.maxp = DataViewObjects.getValue(objects, chartProp.modelSettings.maxp, modelSettings.maxp);
            modelSettings.maxq = DataViewObjects.getValue(objects, chartProp.modelSettings.maxq, modelSettings.maxq);
            modelSettings.maxd = DataViewObjects.getValue(objects, chartProp.modelSettings.maxd, modelSettings.maxd);
            modelSettings.maxP = DataViewObjects.getValue(objects, chartProp.modelSettings.maxP, modelSettings.maxP);
            modelSettings.maxQ = DataViewObjects.getValue(objects, chartProp.modelSettings.maxQ, modelSettings.maxQ);
            modelSettings.maxD = DataViewObjects.getValue(objects, chartProp.modelSettings.maxD, modelSettings.maxD);
            modelSettings.seasonal = DataViewObjects.getValue(objects, chartProp.modelSettings.seasonal, modelSettings.seasonal);
            modelSettings.allowDrift = DataViewObjects.getValue(objects, chartProp.modelSettings.allowDrift, modelSettings.allowDrift);
            modelSettings.allowMean = DataViewObjects.getValue(objects, chartProp.modelSettings.allowMean, modelSettings.allowMean);
            modelSettings.stepWise = DataViewObjects.getValue(objects, chartProp.modelSettings.stepWise, modelSettings.stepWise);
            modelSettings.errorType = DataViewObjects.getValue(objects, chartProp.modelSettings.errorType, modelSettings.errorType);
            modelSettings.trendType = DataViewObjects.getValue(objects, chartProp.modelSettings.trendType, modelSettings.trendType);
            modelSettings.sWindow = DataViewObjects.getValue(objects, chartProp.modelSettings.sWindow, modelSettings.sWindow);
            modelSettings.sWindowValue = DataViewObjects.getValue
                (objects, chartProp.modelSettings.sWindowValue, modelSettings.sWindowValue);
            modelSettings.tWindow = DataViewObjects.getValue
                (objects, chartProp.modelSettings.tWindow, modelSettings.tWindow);
            modelSettings.tWindowValue = DataViewObjects.getValue
                (objects, chartProp.modelSettings.tWindowValue, modelSettings.tWindowValue);
            modelSettings.robust = DataViewObjects.getValue(objects, chartProp.modelSettings.robust, modelSettings.robust);

            return modelSettings;
        }

        public getplotSettings(dataView: DataView): IPlotSettings {
            const plotSettings: IPlotSettings = this.getDefaultplotSettings();
            let objects: DataViewObjects = null;

            if (!dataView.metadata || !dataView.metadata.objects) {
                return plotSettings;
            }

            objects = dataView.metadata.objects;

            plotSettings.title = DataViewObjects.getValue(objects, chartProp.plotSettings.title, plotSettings.title);
            plotSettings.plotColor = DataViewObjects.getFillColor(objects, chartProp.plotSettings.plotColor, plotSettings.plotColor);
            plotSettings.fline = DataViewObjects.getFillColor(objects, chartProp.plotSettings.fline, plotSettings.fline);
            plotSettings.hline = DataViewObjects.getFillColor(objects, chartProp.plotSettings.hline, plotSettings.hline);
            plotSettings.cline = DataViewObjects.getFillColor(objects, chartProp.plotSettings.cline, plotSettings.cline);
            plotSettings.flineText = DataViewObjects.getValue(objects, chartProp.plotSettings.flineText, plotSettings.flineText);
            plotSettings.hlineText = DataViewObjects.getValue(objects, chartProp.plotSettings.hlineText, plotSettings.hlineText);

            return plotSettings;
        }

        public getxaxisSettings(dataView: DataView): IXaxisSettings {
            const xaxisSettings: IXaxisSettings = this.getDefaultxaxisSettings();
            let objects: DataViewObjects = null;

            if (!dataView.metadata || !dataView.metadata.objects) {
                return xaxisSettings;
            }

            objects = dataView.metadata.objects;

            xaxisSettings.xTitle = DataViewObjects.getValue(objects, chartProp.xaxisSettings.xTitle, xaxisSettings.xTitle);
            xaxisSettings.xZeroline = DataViewObjects.getValue(objects, chartProp.xaxisSettings.xZeroline, xaxisSettings.xZeroline);
            xaxisSettings.xLabels = DataViewObjects.getValue(objects, chartProp.xaxisSettings.xLabels, xaxisSettings.xLabels);
            xaxisSettings.xGrid = DataViewObjects.getValue(objects, chartProp.xaxisSettings.xGrid, xaxisSettings.xGrid);
            xaxisSettings.xGridCol = DataViewObjects.getFillColor(objects, chartProp.xaxisSettings.xGridCol, xaxisSettings.xGridCol);
            xaxisSettings.xGridWidth = Math.min(DataViewObjects.getValue
                (objects, chartProp.xaxisSettings.xGridWidth, xaxisSettings.xGridWidth),
                                                20);
            xaxisSettings.xAxisBaseLine = DataViewObjects.getValue
                (objects, chartProp.xaxisSettings.xAxisBaseLine, xaxisSettings.xAxisBaseLine);
            xaxisSettings.xAxisBaseLineCol = DataViewObjects.getFillColor
                (objects, chartProp.xaxisSettings.xAxisBaseLineCol, xaxisSettings.xAxisBaseLineCol);
            xaxisSettings.xAxisBaseLineWidth = Math.min(DataViewObjects.getValue
                (objects, chartProp.xaxisSettings.xAxisBaseLineWidth, xaxisSettings.xAxisBaseLineWidth),
                                                        20);

            return xaxisSettings;
        }

        public getyaxisSettings(dataView: DataView): IYaxisSettings {
            const yaxisSettings: IYaxisSettings = this.getDefaultyaxisSettings();
            let objects: DataViewObjects = null;

            if (!dataView.metadata || !dataView.metadata.objects) {
                return yaxisSettings;
            }

            objects = dataView.metadata.objects;

            yaxisSettings.yTitle = DataViewObjects.getValue(objects, chartProp.yaxisSettings.yTitle, yaxisSettings.yTitle);
            yaxisSettings.yZeroline = DataViewObjects.getValue(objects, chartProp.yaxisSettings.yZeroline, yaxisSettings.yZeroline);
            yaxisSettings.yLabels = DataViewObjects.getValue(objects, chartProp.yaxisSettings.yLabels, yaxisSettings.yLabels);
            yaxisSettings.yGrid = DataViewObjects.getValue(objects, chartProp.yaxisSettings.yGrid, yaxisSettings.yGrid);
            yaxisSettings.yGridCol = DataViewObjects.getFillColor(objects, chartProp.yaxisSettings.yGridCol, yaxisSettings.yGridCol);
            yaxisSettings.yGridWidth = Math.min(DataViewObjects.getValue(objects, chartProp.yaxisSettings.yGridWidth,
                                                                         yaxisSettings.yGridWidth),
                                                20);
            yaxisSettings.yAxisBaseLine = DataViewObjects.getValue
                (objects, chartProp.yaxisSettings.yAxisBaseLine, yaxisSettings.yAxisBaseLine);
            yaxisSettings.yAxisBaseLineCol = DataViewObjects.getFillColor
                (objects, chartProp.yaxisSettings.yAxisBaseLineCol, yaxisSettings.yAxisBaseLineCol);
            yaxisSettings.yAxisBaseLineWidth = Math.min(DataViewObjects.getValue
                (objects, chartProp.yaxisSettings.yAxisBaseLineWidth, yaxisSettings.yAxisBaseLineWidth),
                                                        20);

            return yaxisSettings;
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

            // update 'body' nodes, under the rootElement
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

            // tslint:disable-next-line:typedef
            const objectName = options.objectName;
            let objectEnum: VisualObjectInstance[];
            objectEnum = [];
            let props: { [propertyName: string]: DataViewPropertyValue; };

            switch (objectName) {

                case 'forecastSettings':
                    props = {};

                    props[`method`] = this.forecastSettings.method;
                    props[`units`] = this.forecastSettings.units;
                    props[`split`] = this.forecastSettings.split;

                    props[`confInterval`] = this.forecastSettings.confInterval;
                    if (props[`confInterval`]) {
                        props[`confLevel`] = this.forecastSettings.confLevel;
                    }

                    props[`lambda`] = this.forecastSettings.lambda;
                    if (props[`lambda`] === 'manual') {
                        props[`lambdaValue`] = this.forecastSettings.lambdaValue;
                    }

                    if (props[`lambda`] !== 'NULL') {
                        props[`biasAdj`] = this.forecastSettings.biasAdj;
                    }

                    objectEnum.push({
                        objectName: objectName,
                        properties: props,
                        selector: null
                    });
                    break;

                case 'modelSettings':

                    props = {};
                    switch (this.forecastSettings.method) {

                        case 'ES':
                            props[`modelTuning`] = this.modelSettings.modelTuning;

                            if (props[`modelTuning`] === 'manual') {
                                props[`errorType`] = this.modelSettings.errorType;
                                props[`trendType`] = this.modelSettings.trendType;
                                props[`robust`] = this.modelSettings.robust;

                                props[`sWindow`] = this.modelSettings.sWindow;
                                if (props[`sWindow`] === 'numeric') {
                                    props[`sWindowValue`] = this.modelSettings.sWindowValue;
                                }

                                props[`tWindow`] = this.modelSettings.tWindow;
                                if (props[`tWindow`] === 'numeric') {
                                    props[`tWindowValue`] = this.modelSettings.tWindowValue;
                                }
                            }

                            objectEnum.push({
                                objectName: objectName,
                                properties: props,
                                selector: null
                            });

                            break;

                        case `NN`:
                            props[`modelTuning`] = this.modelSettings.modelTuning;

                            if (props[`modelTuning`] === 'manual') {
                                props[`decay`] = this.modelSettings.decay;
                                props[`maxit`] = this.modelSettings.maxit;
                                props[`size`] = this.modelSettings.size;
                                props[`repeats`] = this.modelSettings.repeats;
                            }

                            objectEnum.push({
                                objectName: objectName,
                                properties: props,
                                selector: null
                            });

                            break;

                        case `ARIMA`:
                            props[`modelTuning`] = this.modelSettings.modelTuning;

                            if (props[`modelTuning`] === 'manual') {
                                props[`maxp`] = this.modelSettings.maxp;
                                props[`maxq`] = this.modelSettings.maxq;
                                props[`maxd`] = this.modelSettings.maxd;
                                props[`maxP`] = this.modelSettings.maxP;
                                props[`maxQ`] = this.modelSettings.maxQ;
                                props[`maxD`] = this.modelSettings.maxD;
                                props[`seasonal`] = this.modelSettings.seasonal;
                                props[`allowDrift`] = this.modelSettings.allowDrift;
                                props[`allowMean`] = this.modelSettings.allowMean;
                                props[`stepWise`] = this.modelSettings.stepWise;
                            }

                            objectEnum.push({
                                objectName: objectName,
                                properties: props,
                                selector: null
                            });

                            break;

                        default:
                            break;
                    }

                    break;

                case `plotSettings`:
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            title: this.plotSettings.title,
                            plotColor: this.plotSettings.plotColor,
                            hline: this.plotSettings.hline,
                            fline: this.plotSettings.fline,
                            cline: this.plotSettings.cline,
                            hlineText: this.plotSettings.hlineText,
                            flineText: this.plotSettings.flineText

                        },
                        selector: null
                    });
                    break;

                case 'xaxisSettings':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            xTitle: this.xaxisSettings.xTitle,
                            xZeroline: this.xaxisSettings.xZeroline,
                            xLabels: this.xaxisSettings.xLabels,
                            xGrid: this.xaxisSettings.xGrid,
                            xGridCol: this.xaxisSettings.xGridCol,
                            xGridWidth: this.xaxisSettings.xGridWidth,
                            xAxisBaseLine: this.xaxisSettings.xAxisBaseLine,
                            xAxisBaseLineCol: this.xaxisSettings.xAxisBaseLineCol,
                            xAxisBaseLineWidth: this.xaxisSettings.xAxisBaseLineWidth

                        },
                        selector: null
                    });
                    break;

                case 'yaxisSettings':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            yTitle: this.yaxisSettings.yTitle,
                            yZeroline: this.yaxisSettings.yZeroline,
                            yLabels: this.yaxisSettings.yLabels,
                            yGrid: this.yaxisSettings.yGrid,
                            yGridCol: this.yaxisSettings.yGridCol,
                            yGridWidth: this.yaxisSettings.yGridWidth,
                            yAxisBaseLine: this.yaxisSettings.yAxisBaseLine,
                            yAxisBaseLineCol: this.yaxisSettings.yAxisBaseLineCol,
                            yAxisBaseLineWidth: this.yaxisSettings.yAxisBaseLineWidth

                        },
                        selector: null
                    });
                    break;

                default:
                    break;
            }

            // return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
            return objectEnum;
        }

    }
}
