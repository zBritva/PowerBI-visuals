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
    'use strict';

    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

    export class VisualSettings extends DataViewObjectsParser {

    }

    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

            if (!objects) {
                return defaultValue;
            }

            let objectOrMap: DataViewObject;
            objectOrMap = objects[propertyId.objectName];

            let object: DataViewObject;
            object = <DataViewObject>objectOrMap;

            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }

        /** Gets an object from objects. */
        export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                let object: DataViewObject;
                object = <DataViewObject>objects[objectName];

                return object;
            } else {
                return defaultValue;
            }
        }

        /** Gets a map of user-defined objects. */
        export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
            if (objects && objects[objectName]) {
                let map: DataViewObjectMap;
                map = <DataViewObjectMap>objects[objectName];

                return map;
            }
        }

        /** Gets the solid color from a fill property. */
        export function getFillColor(
            objects: DataViewObjects,
            propertyId: DataViewObjectPropertyIdentifier,
            defaultColor?: string): string {
            let value: Fill;
            value = getValue(objects, propertyId);
            if (!value || !value.solid) {
                return defaultColor;
            }

            return value.solid.color;
        }
    }

    export module DataViewObject {
        export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {

            if (!object) {
                return defaultValue;
            }

            let propertyValue: T;
            propertyValue = <T>object[propertyName];
            if (propertyValue === undefined) {
                return defaultValue;
            }

            return propertyValue;
        }

        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            let value: Fill;
            value = DataViewObject.getValue(objects, propertyName);

            if (!value || !value.solid) {
                return defaultColor;
            }

            return value.solid.color;
        }

    }

    export interface IForecastSettings {
        method: string;
        units: number;
        split: string;
        confLevel: string;
        confInterval: boolean;
        lambda: string;
        lambdaValue: number;
        biasAdj: boolean;
    }

    export interface IModelSettings {
        modelTuning: string;
        decay: number;
        maxit: number;
        size: number;
        repeats: number;
        maxp: number;
        maxq: number;
        maxd: number;
        maxP: number;
        maxQ: number;
        maxD: number;
        seasonal: boolean;
        allowDrift: boolean;
        allowMean: boolean;
        stepWise: boolean;
        errorType: string;
        trendType: string;
        sWindow: string;
        sWindowValue: number;
        tWindow: string;
        tWindowValue: number;
        robust: boolean;
    }

    export interface IPlotSettings {
        title: string;
        plotColor: string;
        fline: string;
        hline: string;
        cline: string;
        flineText: string;
        hlineText: string;
    }

    export interface IXaxisSettings {
        xTitle: string;
        xZeroline: boolean;
        xLabels: boolean;
        xGrid: boolean;
        xGridCol: string;
        xGridWidth: number;
        xAxisBaseLine: boolean;
        xAxisBaseLineCol: string;
        xAxisBaseLineWidth: number;
    }

    export interface IYaxisSettings {
        yTitle: string;
        yZeroline: boolean;
        yLabels: boolean;
        yGrid: boolean;
        yGridCol: string;
        yGridWidth: number;
        yAxisBaseLine: boolean;
        yAxisBaseLineCol: string;
        yAxisBaseLineWidth: number;
    }

}
