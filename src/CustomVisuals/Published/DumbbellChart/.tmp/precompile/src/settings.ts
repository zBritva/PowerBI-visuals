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

module powerbi.extensibility.visual.DumbbellChartB13A88DFEE724350B46BCF0EFA5B6E321  {
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
  // Creating interfaces
  export interface IVisualColors {
    valueColor1: string;
    valueColor2: string;
    valueColor3: string;
    valueColor4: string;
    segmentColor: string;
    segment2Color: string;
    segment3Color: string;
    chartColor: string;
    plotColor: string;

  }

  export interface IXaxisText {
    xtitleText: string;
    xLegend: boolean;
    xtextColor: string;
    xlegendColor: string;
  }
  export interface IYaxisText {
    ytitleText: string;
    yLegend: boolean;
    ytextColor: string;
    ylegendColor: string;
  }
  export interface IlegendSettings {
    show: boolean;
  }
  // Creating chart properties
  export let chartProp: {
    IVisualColors: {
      valueColor1: DataViewObjectPropertyIdentifier;
      valueColor2: DataViewObjectPropertyIdentifier;
      valueColor3: DataViewObjectPropertyIdentifier;
      valueColor4: DataViewObjectPropertyIdentifier;
      segmentColor: DataViewObjectPropertyIdentifier;
      segment2Color: DataViewObjectPropertyIdentifier;
      segment3Color: DataViewObjectPropertyIdentifier;
      chartColor: DataViewObjectPropertyIdentifier;
      plotColor: DataViewObjectPropertyIdentifier;

    };
    IXaxisText: {
      xtitleText: DataViewObjectPropertyIdentifier;
      xtextColor: DataViewObjectPropertyIdentifier;
      xlegendColor: DataViewObjectPropertyIdentifier;
      xLegend: DataViewObjectPropertyIdentifier;
    };
    IYaxisText: {
      ytitleText: DataViewObjectPropertyIdentifier;
      ytextColor: DataViewObjectPropertyIdentifier;
      ylegendColor: DataViewObjectPropertyIdentifier;
      yLegend: DataViewObjectPropertyIdentifier;
    };
    legend: {
      show: DataViewObjectPropertyIdentifier;
    };
  };

  // Initializing chart properties
  chartProp = {
    IVisualColors: {
      valueColor1: <DataViewObjectPropertyIdentifier>{ objectName: 'visualColors', propertyName: 'valueColor1' },
      valueColor2: <DataViewObjectPropertyIdentifier>{ objectName: 'visualColors', propertyName: 'valueColor2' },
      valueColor3: <DataViewObjectPropertyIdentifier>{ objectName: 'visualColors', propertyName: 'valueColor3' },
      valueColor4: <DataViewObjectPropertyIdentifier>{ objectName: 'visualColors', propertyName: 'valueColor4' },
      segmentColor: <DataViewObjectPropertyIdentifier>{ objectName: 'visualColors', propertyName: 'segmentColor' },
      segment2Color: <DataViewObjectPropertyIdentifier>{ objectName: 'visualColors', propertyName: 'segment2Color' },
      segment3Color: <DataViewObjectPropertyIdentifier>{ objectName: 'visualColors', propertyName: 'segment3Color' },
      chartColor: <DataViewObjectPropertyIdentifier>{ objectName: 'visualColors', propertyName: 'chartColor' },
      plotColor: <DataViewObjectPropertyIdentifier>{ objectName: 'visualColors', propertyName: 'plotColor' }

    },
    IXaxisText: {
      xtitleText: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'titleText' },
      xtextColor: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'labelColor' },
      xlegendColor: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'titleColor' },
      xLegend: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'showLabel' }
    },
    IYaxisText: {
      ytitleText: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'titleText' },
      ytextColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'labelColor' },
      ylegendColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'titleColor' },
      yLegend: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'showLabel' }
    },
    legend: {
      show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' }
    }
  };

}
