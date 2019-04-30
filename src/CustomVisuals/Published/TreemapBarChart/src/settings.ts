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
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import Selection = d3.Selection;

    //interface
    export interface ITreeBehaviorOptions {
    // tslint:disable-next-line:no-any
    legendSelection: Selection<any>;
    interactivityService: IInteractivityService;
  }
    /**
     * ILegendSettings class contains variables to draw legend.
     */
    export class ILegendSettings {
    public show: boolean = true;
    public position: string = 'Right';
    public showTitle: boolean = false;
    public titleText: string = '';
    public labelColor: string = '#000';
    public fontSize: number = 8;
  }
    export interface ITooltipDataPoints {
    name: string;
    // tslint:disable-next-line:no-any
    value: any;
    formatter: string;
}
    /**
     * TreeMapBarSettings class contains settings for Legend.
     */
    export class TreeMapBarSettings extends DataViewObjectsParser {
    public legend: ILegendSettings = new ILegendSettings();
  }
    export interface ITreeMapBarViewModel {
    dataView: DataView;
    settings: TreeMapBarSettings;
    legendData: LegendData;
  }
    export interface ITreeMapBarChartViewModel {
    dataPoints: ITreeMapBarDataPoint[];
  }
    export interface ITreeMapBarDataPoint {
    category: string;
    color: string;
    selectionId: powerbi.visuals.ISelectionId;
  }
    /**
     * VisualSettings class contains variables for Formatting the chart.
     */
    export class VisualSettings extends DataViewObjectsParser {
      public enableAxis: EnableAxis = new EnableAxis();
      public dataLabels: DataLabels = new DataLabels();
      public xaxisLabels: XaxisLabels = new XaxisLabels();
      public totalLabels: TotalLabels = new TotalLabels();
      public borderSettings: BorderSettings = new BorderSettings();
      public chartOrientation: ChartOrientation = new ChartOrientation();
      public animation : Animation = new Animation();
      }
    /**
     * EnableAxis class contains variables for Legend Settings.
     */
// tslint:disable-next-line:max-classes-per-file
    export class EnableAxis {
        public show: boolean = true;
        public position: string =  'Top';
        public showTitle: boolean = true;
        public titleText : string = '';
        public fontSize:  number = 11;
        // tslint:disable-next-line:no-any
        public labelColor: string =  '#000';
}
    /**
     * ChartOrientation class contains variables to draw chart in dofferent Orientation.
     */
    // tslint:disable-next-line:max-classes-per-file
    export class ChartOrientation {
    public orientation: string = 'Vertical';
  }
    /**
     * DataLabels class contains variables for Data Labels.
     */
    // tslint:disable-next-line:max-classes-per-file
    export class DataLabels {
        public show: boolean =  true;
        public color: string = '#000';
        public fontSize: number =  11;
        public fontFamily: string = 'Segoe UI';
        public displayUnits: number = 0;
        public labelPrecision: number = 0;
        public title: boolean = false;
        public backgroundColor: string = '#d6ebf2';
        public rectopacity: number = 1;
    }
    /**
     * XaxisLabels class contains variables for Xaxis Labels.
     */
    // tslint:disable-next-line:max-classes-per-file
    export class XaxisLabels {
        public color: string =   '#000';
        public fontSize: number =  11;
        public fontFamily: string =  'Segoe UI';
    }
    /**
     * TotalLabels class contains variables for Total Labels.
     */
    // tslint:disable-next-line:max-classes-per-file
    export class TotalLabels {
        public color : string = '#000';
        public fontSize: number = 11;
        public fontFamily: string =  'Segoe UI';
        public show : boolean = true;
        public displayUnits: number =  0;
        public labelPrecision: number =  0;
    }
    /**
     * Animation class contains variables to show animation.
     */
    // tslint:disable-next-line:max-classes-per-file
    export class Animation {
      public show : boolean = false;
  }
    /**
     * BorderSettings class contains variables for Border Formatting.
     */
    // tslint:disable-next-line:max-classes-per-file
    export class BorderSettings {
        public color : string = '#000';
        public borderstroke : number = 2;
        public borderopacity : number =  0.5;
    }
}
