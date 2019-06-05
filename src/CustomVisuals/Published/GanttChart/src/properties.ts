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

    // tslint:disable-next-line:typedef
    export const ganttProperties = {
        barColor: {
            defaultColor: { objectName: "barColor", propertyName: "defaultColor" } as DataViewObjectPropertyIdentifier,
            fillColor: { objectName: "barColor", propertyName: "fillColor" } as DataViewObjectPropertyIdentifier,
            showall: { objectName: "barColor", propertyName: "showall" } as DataViewObjectPropertyIdentifier
        },
        categoryColumnsWidth: {
            categoryLength:
             { objectName: "categoryColumnsWidth", propertyName: "categoryLength" } as DataViewObjectPropertyIdentifier,
            width: { objectName: "categoryColumnsWidth", propertyName: "width" } as DataViewObjectPropertyIdentifier
        },
        columnHeader: {
            columnOutline:
             { objectName: "columnHeader", propertyName: "columnOutline" } as DataViewObjectPropertyIdentifier,
            fill: { objectName: "columnHeader", propertyName: "fill" } as DataViewObjectPropertyIdentifier,
            fill2: { objectName: "columnHeader", propertyName: "fill2" } as DataViewObjectPropertyIdentifier,
            fontFamily: { objectName: "columnHeader", propertyName: "fontFamily" } as DataViewObjectPropertyIdentifier,
            fontSize: { objectName: "columnHeader", propertyName: "fontSize" } as DataViewObjectPropertyIdentifier

        },
        datatype: {
            type: { objectName: "datatype", propertyName: "type" } as DataViewObjectPropertyIdentifier
        },
        dateType: {
            enableToday: { objectName: "dateType", propertyName: "enableToday" } as DataViewObjectPropertyIdentifier,
            type: { objectName: "dateType", propertyName: "type" } as DataViewObjectPropertyIdentifier
        },
        displayRatio: {
            ratio: { objectName: "displayRatio", propertyName: "ratio" } as DataViewObjectPropertyIdentifier
        },
        general: {
            groupTasks: { objectName: "general", propertyName: "groupTasks" } as DataViewObjectPropertyIdentifier
        },
        kpiColumnType: {
            indicator: { objectName: "dataPosition", propertyName: "indicator" } as DataViewObjectPropertyIdentifier,
            type: { objectName: "dataPosition", propertyName: "type" } as DataViewObjectPropertyIdentifier,
            value: { objectName: "dataPosition", propertyName: "value" } as DataViewObjectPropertyIdentifier
        },
        legend: {
            fontSize: { objectName: "legend", propertyName: "fontSize" } as DataViewObjectPropertyIdentifier,
            labelColor: { objectName: "legend", propertyName: "labelColor" } as DataViewObjectPropertyIdentifier,
            position: { objectName: "legend", propertyName: "position" } as DataViewObjectPropertyIdentifier,
            show: { objectName: "legend", propertyName: "show" } as DataViewObjectPropertyIdentifier,
            showTitle: { objectName: "legend", propertyName: "showTitle" } as DataViewObjectPropertyIdentifier,
            titleText: { objectName: "legend", propertyName: "titleText" } as DataViewObjectPropertyIdentifier
        },
        persistExpandCollapseState: {
            // tslint:disable-next-line:max-line-length
            expandCollapseState: {objectName: "persistExpandCollapseState", propertyName: "expandCollapseState"} as DataViewObjectPropertyIdentifier
        },
        scrollPosition: {
            position: { objectName: "scrollPosition", propertyName: "position" } as DataViewObjectPropertyIdentifier,
            position2: { objectName: "scrollPosition", propertyName: "position2" } as DataViewObjectPropertyIdentifier
        },
        sortAttributes: {
            prevSortedColumn:
             { objectName: "sortAttributes", propertyName: "prevSortedColumn" } as DataViewObjectPropertyIdentifier,
            sortLevel: { objectName: "sortAttributes", propertyName: "sortLevel" } as DataViewObjectPropertyIdentifier,
            sortOrder: { objectName: "sortAttributes", propertyName: "sortOrder" } as DataViewObjectPropertyIdentifier
        },
        taskGridlines: {
            fill: { objectName: "taskGridlines", propertyName: "fill" } as DataViewObjectPropertyIdentifier,
            interval: { objectName: "taskGridlines", propertyName: "interval" } as DataViewObjectPropertyIdentifier,
            show: { objectName: "taskGridlines", propertyName: "show" } as DataViewObjectPropertyIdentifier
        },
        taskLabels: {
            fill: { objectName: "taskLabels", propertyName: "fill" } as DataViewObjectPropertyIdentifier,
            fontFamily: { objectName: "taskLabels", propertyName: "fontFamily" } as DataViewObjectPropertyIdentifier,
            fontSize: { objectName: "taskLabels", propertyName: "fontSize" } as DataViewObjectPropertyIdentifier,
            isExpanded: { objectName: "taskLabels", propertyName: "isExpanded" } as DataViewObjectPropertyIdentifier,
            isHierarchy: { objectName: "taskLabels", propertyName: "isHierarchy" } as DataViewObjectPropertyIdentifier,
            show: { objectName: "taskLabels", propertyName: "show" } as DataViewObjectPropertyIdentifier,
            width: { objectName: "taskLabels", propertyName: "width" } as DataViewObjectPropertyIdentifier

        },
        taskResource: {
            fill: { objectName: "taskResource", propertyName: "fill" } as DataViewObjectPropertyIdentifier,
            fontFamily: { objectName: "taskResource", propertyName: "fontFamily" } as DataViewObjectPropertyIdentifier,
            fontSize: { objectName: "taskResource", propertyName: "fontSize" } as DataViewObjectPropertyIdentifier,
            position: { objectName: "taskResource", propertyName: "position" } as DataViewObjectPropertyIdentifier,
            show: { objectName: "taskResource", propertyName: "show" } as DataViewObjectPropertyIdentifier

        }
    };
}
