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

module powerbi.extensibility.visual {
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import tooltip = powerbi.extensibility.utils.tooltip;
    import ColorUtility = powerbi.extensibility.utils.color;

    export class Visual implements IVisual {
        public static legendTitle: string;                             // contains title for legend
        public static isVal: boolean;                                  // true if target field is present
        public static isType: boolean;                                 // true if Flight Type field is present
        private isImage: boolean;                                       // true if Image Legend is on
        public static gradients: number;                               // contains the number of gradients selected by user
        private rootElement: d3.Selection<SVGElement>;
        private target: HTMLElement;
        private viewport: IViewport;
        private updateCount: number;
        private host: IVisualHost;
        private dataView: DataView;
        // tslint:disable-next-line:no-any
        private map: any;                                               // used for designing, displaying and controlling the map
        private divs: IDivs;                                            // interface containing the divs used in the visual
        // contains all the data entered in the field pane, converted to required format
        private flightData: IFlightData;
        private settings: ISettings;                                    // interface containing the settings to use in formatting pane
        private selectionManager: ISelectionManager;
        private mapElements: IMapElements;                               // stores details of all the elements created on the map
        private selectedIds: ISelectionId[];                                        // for managing and manipulating selection IDs
        // stores the API at the end of update function to compare with new, if changed
        private previousAPI: string;
        private mapTypes: IMapTypes;                                     // to store and access different map options created
        private legendName: string;                                      // stores the name to be displayed in the color legend
        private formatter: utils.formatting.IValueFormatter;
        private zoom: number;
        private timeoutID: number;
        private marginLeft: number;
        private googleString: string;

        constructor(options: VisualConstructorOptions) {
            this.divs = {
                googleMap: null,
                legendImage: null,
                legendTypeImage: null,
                legendThreshImage: null
            };
            this.googleString = 'google';
            this.rootElement = d3.select(options.element);
            this.target = options.element;
            this.updateCount = 0;
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.zoom = 2;

            Visual.isVal = false;
            Visual.isType = false;
            this.isImage = true;

            this.settings = {
                apiSetting: null,
                mapSetting: 'silver',
                tooltipSetting: enumSettings.getDefaultTooltipSettings(),
                animationSetting: enumSettings.getDefaultAnimationSettings(),
                imageSetting: enumSettings.getDefaultImageSettings(),
                routeSetting: enumSettings.getDefaultRouteSettings(),
                colorSetting: enumSettings.getDefaultColorSettings(),
                centerSetting: enumSettings.getDefaultCenterSettings()
            };
            this.mapElements = {
                flightPath: [],
                sourcePin: [],
                destinationPin: []
            };
            this.mapTypes = {
                styledMapStandard: {},
                styledMap: {},
                styledMapSilver: {},
                styledMapNight: {}
            };
        }

        // The following function executes on all subsequent refreshes of the visual except the first time load
        private onLoad(options: VisualUpdateOptions): void {
            if (this.isImage) { this.LoadMarkerLegend(options); }
            if (Visual.isType && this.settings.routeSetting.show) { this.LoadTypeLegend(options); }
            this.initMap(options);
            this.loadComponents(options);
            if (Visual.isVal && this.settings.colorSetting.KPIlegend) { this.LoadThreshLegend(options); }
            this.checkLegendSpace(options);
        }

        // Initialises and loads the map
        private initMap (options: VisualUpdateOptions): void {
            this.divs.googleMap.selectAll('*').remove();
            const marginTop: number = (Visual.isType && this.settings.routeSetting.show) || this.isImage ? 25 : 0;
            // tslint:disable-next-line:no-any
            const google: any = window[this.googleString] || window.window[this.googleString];         // to use the class google
            const height: number = this.viewport.height - marginTop;                      // (viewport height - legend height)
            const width: number = this.viewport.width;
            const outerDiv: HTMLElement = document.createElement('div');
            outerDiv.id = 'outerDiv';
            outerDiv.style.position = 'relative';
            outerDiv.style.width = `${width}px`;
            outerDiv.style.height = `${height}px`;
            this.target.appendChild(outerDiv);
            const newDiv: HTMLElement = document.createElement('div');
            newDiv.id = 'googleMap';
            newDiv.style.position = 'relative';
            newDiv.style.width = '1024px';
            newDiv.style.height = `${height}px`;
            newDiv.style.marginLeft = width > 1024 ?
                `${(width - 1024) / 2}px` : '0px';
            newDiv.style.marginTop = height > 1024 ?
                `${(height - 1024) / 2}px` : '0px';
            outerDiv.appendChild(newDiv);

            // initialises the custom map styles
            this.mapStyles();

            // using default value of 0 if lat/lng are cleared and nothing is entered by user
            const lat: number = this.settings.centerSetting.lat === null ? 0 : this.settings.centerSetting.lat;
            const lng: number = this.settings.centerSetting.lng === null ? 0 : this.settings.centerSetting.lng;

            // initializing the map and assigning all custom map styles to it
            this.map = new google.maps.Map(document.getElementById('googleMap'), {
                center: new google.maps.LatLng(lat, lng),
                disableDefaultUI: true,
                zoomControl: true,
                zoom: this.zoom,
                minZoom: 2,
                mapTypeControlOptions: {
                    mapTypeIds: ['roadmap', 'Standard Map', 'Silver Map',
                    'Night Map', 'Basic Map']
                }
            });
            this.map.mapTypes.set('Standard Map', this.mapTypes.styledMapStandard);
            this.map.mapTypes.set('Silver Map', this.mapTypes.styledMapSilver);
            this.map.mapTypes.set('Night Map', this.mapTypes.styledMapNight);
            this.map.mapTypes.set('Basic Map', this.mapTypes.styledMap);
            const mapType: string = this.setMapType(this.settings.mapSetting);
            this.map.setMapTypeId(mapType);

            // to set the cursor to arrow pointer instead of hand
            this.map.setOptions({draggableCursor: 'default' });

            // handling map according to zoom level
            const dim: number = Math.pow(2, this.zoom) * 256;
            newDiv.style.width = width <= dim ? `${width}px` : `${dim}px`;
            newDiv.style.height = height <= dim ? `${height}px` : `${dim}px`;
            this.marginLeft = width > dim ? (width - dim) / 2 : 0;
            newDiv.style.marginLeft = `${this.marginLeft}px`;
            newDiv.style.marginTop = height > dim ? `${(height - dim) / 2}px` : '0px';

            const visualContext: this = this;

            // reload markers and paths if map is clicked
            google.maps.event.addListener(this.map, 'click', () => {
                visualContext.selectedIds = [];
                this.selectionManager.clear()
                .then(() => {
                    let iCounter: number = 0;
                    for (iCounter = 0; iCounter < this.flightData.data.length; iCounter++) {
                        visualContext.changeOpacity(iCounter, 1);
                        visualContext.changeVisibility(iCounter, true, visualContext.map);
                    }
                })
                .then(() => {
                        $('.flightLessThanTarget').attr('clickFlag', 0);
                        $('.flightGreaterThanTarget').attr('clickFlag', 0);
                        $('.flightCircle').attr('clickFlag', 0); // Update click counter
                    }
                );
                event.stopPropagation();
            });

            // change map dimensions if zoom level is changed
            google.maps.event.addListener(this.map, 'zoom_changed', () => {
                const zoom: number = visualContext.map.getZoom();
                const zoomDim: number = Math.pow(2, zoom) * 256;
                newDiv.style.width = visualContext.viewport.width <= zoomDim ? `${visualContext.viewport.width}px` : `${zoomDim}px`;
                newDiv.style.height = visualContext.viewport.height - marginTop <= zoomDim ?
                    `${visualContext.viewport.height - marginTop}px` : `${zoomDim - marginTop}px`;
                this.marginLeft = visualContext.viewport.width > zoomDim ? (visualContext.viewport.width - zoomDim) / 2 : 0;
                newDiv.style.marginLeft = `${this.marginLeft}px`;
                newDiv.style.marginTop = visualContext.viewport.height - marginTop > zoomDim ?
                    `${(visualContext.viewport.height - zoomDim - marginTop) / 2}px` : '0px';
                this.LoadMarkerLegend(options);
                this.LoadTypeLegend(options);
                this.LoadThreshLegend(options);
                this.zoom = zoom;
            });
        }

        // checks if the data needed is present and displays error message if not
        public dataCheck(options: VisualUpdateOptions): number {
            let isOLat: boolean;
            let isOLng: boolean;
            let isDLat: boolean;
            let isDLng: boolean;             // flags to keep a record if necessary fields are present
            let iCounter: number = 0;
            for (iCounter = 0; iCounter < options.dataViews[0].metadata.columns.length; iCounter++) {
                if (options.dataViews[0].metadata.columns[iCounter].roles.hasOwnProperty('originLat')) {
                    isOLat = true;
                }
                if (options.dataViews[0].metadata.columns[iCounter].roles.hasOwnProperty('originLong')) {
                    isOLng = true;
                }
                if (options.dataViews[0].metadata.columns[iCounter].roles.hasOwnProperty('destinationLat')) {
                    isDLat = true;
                }
                if (options.dataViews[0].metadata.columns[iCounter].roles.hasOwnProperty('destinationLong')) {
                    isDLng = true;
                }
                if (options.dataViews[0].metadata.columns[iCounter].roles.hasOwnProperty('kpi')) {
                    this.legendName = options.dataViews[0].metadata.columns[iCounter].displayName;
                    Visual.isVal = true;
                }
                if (options.dataViews[0].metadata.columns[iCounter].roles.hasOwnProperty('flightType')) {
                    Visual.isType = true;
                }
            }
            if (!isOLat || !isOLng || !isDLat || !isDLng || !Visual.isVal) {
                const visualContext: this = this;
                this.rootElement.selectAll('.flightErrorMessage').remove();
                d3.select('#outerDiv').remove();
                d3.selectAll('.flightLegendImage').remove();
                d3.selectAll('.flightLegendTypeImage').remove();
                d3.selectAll('.flightLegendThreshImage').remove();
                const message: string = 'Loading...';
                this.rootElement
                    .append('div')
                    .classed('flightErrorMessage', true)
                    .text(message)
                    .attr('title', message);
                this.timeoutID = setTimeout(() => {
                    visualContext.rootElement.selectAll('.flightErrorMessage').remove();
                    const errorMessage: string = 'Data is mandatory for origin latitude/longitude,' +
                        'destination latitude/longitude and KPI fields';
                    visualContext.rootElement
                        .append('div')
                        .classed('flightErrorMessage', true)
                        .text(errorMessage)
                        .attr('title', errorMessage);
                },                          30000);

                return 0;
            }

            return 1;
        }

        // converter for data
        public converter(categoricalData: DataViewCategorical, host: IVisualHost): void {
            let mapModel: IMapModel;

            this.flightData = {
                data: []
            };
            const groups: DataViewValueColumnGroup[] = categoricalData.values.grouped();
            groups.forEach((group: DataViewValueColumnGroup) => {
                for (let iCounter: number = 0; iCounter < group.values[0].values.length; iCounter++) {
                    if (group.values[0].values[iCounter] !== null) {
                        mapModel = {
                            sourceDataPoints: {latitude: 0, longitude: 0},
                            destinationDataPoints: {latitude: 0, longitude: 0},
                            flightDataPoints: null,
                            flightType: null,
                            flightDetail: null,
                            tooltipDataPoints: [],
                            selectionId: null,
                            kpi: null
                        };
                        const selectionId: visuals.ISelectionId = host.createSelectionIdBuilder()
                            .withCategory(categoricalData.categories[0], iCounter)
                            .withSeries(categoricalData.values, group)
                            .createSelectionId();

                        for (let cat1: number = 0; cat1 < categoricalData.categories.length; cat1++) {
                            const formatter: utils.formatting.IValueFormatter = valueFormatter.create({
                                format: categoricalData.categories[cat1].source.format
                            });
                            const tooltipDataPoint: ITooltipDataPoints = {
                                name: categoricalData.categories[cat1].source.displayName,
                                value: formatter.format(categoricalData.categories[cat1].values[iCounter])
                            };
                            if (categoricalData.categories[cat1].source.roles.hasOwnProperty('originLat')) {
                                mapModel.sourceDataPoints.latitude = <number>categoricalData.categories[cat1].values[iCounter];
                            }
                            if (categoricalData.categories[cat1].source.roles.hasOwnProperty('originLong')) {
                                mapModel.sourceDataPoints.longitude = <number>categoricalData.categories[cat1].values[iCounter];
                            }
                            if (categoricalData.categories[cat1].source.roles.hasOwnProperty('destinationLat')) {
                                mapModel.destinationDataPoints.latitude = <number>categoricalData.categories[cat1].values[iCounter];
                            }
                            if (categoricalData.categories[cat1].source.roles.hasOwnProperty('destinationLong')) {
                                mapModel.destinationDataPoints.longitude = <number>categoricalData.categories[cat1].values[iCounter];
                            }
                            if (categoricalData.categories[cat1].source.roles.hasOwnProperty('flightDetail')) {
                                mapModel.flightDetail = <string>categoricalData.categories[cat1].values[iCounter];
                                mapModel.tooltipDataPoints.push(tooltipDataPoint);
                            }
                            if (categoricalData.categories[cat1].source.roles.hasOwnProperty('tooltipData')) {
                                mapModel.tooltipDataPoints.push(tooltipDataPoint);
                            }
                        }

                        const groupName: string = this.convertToString(group.name);
                        for (const k of this.dataView.metadata.columns) {
                            if (k.roles.hasOwnProperty('flightType')) {
                                Visual.isType = true;
                                Visual.legendTitle = k.displayName;
                                const tooltipDataPoint: ITooltipDataPoints = {
                                    name: Visual.legendTitle,
                                    value: groupName
                                };
                                mapModel.flightType = groupName;
                                mapModel.tooltipDataPoints.push(tooltipDataPoint);
                                break;
                            }
                        }

                        let separated: number = 0;
                        const separateAt: number = this.settings.tooltipSetting.separator;
                        for (let k: number = 0; k < group.values.length; k++) {
                            const formatter: utils.formatting.IValueFormatter = valueFormatter.create({
                                format: group.values[k].source.format
                            });
                            if (group.values[k].source.roles.hasOwnProperty('kpi')) {
                                mapModel.kpi = Number(group.values[k].values[iCounter]);
                                this.formatter = valueFormatter.create({
                                    format: group.values[k].source.format
                                });
                            }
                            if (group.values[k].source.roles.hasOwnProperty('tooltipData')) {
                                separated ++;
                                const tooltipDataPoint: ITooltipDataPoints = {
                                    name: group.values[k].source.displayName,
                                    value: formatter.format(group.values[k].values[iCounter])
                                };
                                mapModel.tooltipDataPoints.push(tooltipDataPoint);
                                if (separated === separateAt && separated !== 0) {
                                    const separator: ITooltipDataPoints = {
                                        name: '-----------',
                                        value: '-----------'
                                    };
                                    mapModel.tooltipDataPoints.push(separator);
                                }
                            }
                        }

                        mapModel.selectionId = selectionId;
                        this.flightData.data.push(mapModel);
                    }
                }
            });
        }

        // function to change transparency of markers and paths
        public changeOpacity (index: number, opacity: number): void {
            // tslint:disable-next-line:no-any
            const icons: any = this.mapElements.flightPath[index].get('icons');
            icons[0].icon.strokeOpacity = opacity;
            this.mapElements.flightPath[index].set('icons', icons);
            this.mapElements.sourcePin[index].setOptions({
                opacity: opacity
            });
            this.mapElements.destinationPin[index].setOptions({
                opacity: opacity
            });
        }

        // function to hide/show markers and paths
        // tslint:disable-next-line:no-any
        public changeVisibility (index: number, visibility: boolean, map: any): void {
            this.mapElements.flightPath[index].setOptions({
                visible: visibility
            });
            this.mapElements.sourcePin[index].setMap(map);
            this.mapElements.destinationPin[index].setMap(map);
        }

        // returns the name of map chosen
        public setMapType (mapSetting: string): string {
            switch (mapSetting) {
                case 'silver': return 'Silver Map';
                case 'night': return 'Night Map';
                case 'basic': return 'Basic Map';
                case 'standard': return 'Standard Map';
                case 'roadmap': return 'roadmap';
                default: return 'Basic Map';
            }
        }

        // handles events related to paths
        // tslint:disable-next-line:no-any
        public addLineSelection(flightPath: IMapElements, google: any, iCounter: number): void {
            const visualContext: this = this;
            // tslint:disable-next-line:no-any
            google.maps.event.addListener(flightPath, 'mouseover', (e: any) => {
                visualContext.addTooltip(event, iCounter);
            });
            // tslint:disable-next-line:no-any
            google.maps.event.addListener(flightPath, 'mousemove', (e: any) => {
                visualContext.addTooltip(event, iCounter);
            });
            // tslint:disable-next-line:no-any
            google.maps.event.addListener(flightPath, 'mouseout', (e: any) => {
                visualContext.hideTooltip();
            });

            // reduces transparency of other paths and markers when one path is clicked
            // tslint:disable-next-line:no-any
            google.maps.event.addListener(flightPath, 'click', (e: any) => {
                visualContext.selectionManager.clear();
                visualContext.selectionManager
                    .select(visualContext.flightData.data[iCounter].selectionId, true)
                    .then((ids: ISelectionId[]) => {
                        let index: number;
                        for (index = 0; index < visualContext.flightData.data.length; index++) {
                            if (index !== iCounter) {
                                visualContext.changeOpacity(index, 0.3);
                            }
                        }
                        visualContext.changeOpacity(iCounter, 1);
                    });
                event.stopPropagation();
            });
        }

        // handles events related to markers
        // tslint:disable-next-line:no-any
        public addPinSelection(pin: any, google: any, iCounter: number, flag: number): void {
            const visualContext: this = this;
            google.maps.event.addListener(pin, 'mouseover', () => {
                visualContext.addTooltip(event, iCounter);
            });
            google.maps.event.addListener(pin, 'mousemove', () => {
                visualContext.addTooltip(event, iCounter);
            });
            google.maps.event.addListener(pin, 'mouseout', () => {
                visualContext.hideTooltip();
            });

            if (flag === 1 || 2) {                                               // only allows click on source  and destination markers
                // tslint:disable-next-line:no-any
                google.maps.event.addListener(pin, 'click', (e: any) => {
                    // the following code snippet resets the selection if it already exists
                    visualContext.selectedIds = [];
                    visualContext.selectionManager.clear()
                        .then(() => {
                            let index: number;
                            for (index = 0; index < visualContext.flightData.data.length; index++) {
                                visualContext.changeOpacity(index, 1);
                                visualContext.changeVisibility(index, true, visualContext.map);
                            }
                        })
                        .then(() => {
                            $('.flightGreaterThanTarget').attr('clickFlag', 0);
                            $('.flightLessThanTarget').attr('clickFlag', 0);
                        });
                    event.stopPropagation();

                    // selects the clicked marker and its corresponding paths and source/destination markers
                    let jCounter: number;
                    for (jCounter = 0; jCounter < visualContext.flightData.data.length; jCounter++) {
                        if (flag === 1 && (e.latLng.lat().toFixed(2) ===
                                parseFloat(visualContext.convertToString(visualContext.flightData.data[jCounter].sourceDataPoints.latitude))
                                .toFixed(2)
                            && e.latLng.lng().toFixed(2) ===
                                parseFloat(visualContext.convertToString(
                                    visualContext.flightData.data[jCounter].sourceDataPoints.longitude)).toFixed(2))) {
                                visualContext.selectedIds.push(visualContext.flightData.data[jCounter].selectionId);
                        } else if (flag === 2 && (e.latLng.lat().toFixed(2) ===
                                parseFloat(visualContext.convertToString(
                                    visualContext.flightData.data[jCounter].destinationDataPoints.latitude)).toFixed(2)
                            && e.latLng.lng().toFixed(2) ===
                                parseFloat(visualContext.convertToString(
                                    visualContext.flightData.data[jCounter].destinationDataPoints.longitude)).toFixed(2))) {
                                visualContext.selectedIds.push(visualContext.flightData.data[jCounter].selectionId);
                        } else {
                            visualContext.changeVisibility(jCounter, false, null);
                        }
                    }
                    visualContext.selectionManager.select(visualContext.selectedIds);
                    event.stopPropagation();
                });
            }
        }

        // tslint:disable-next-line:no-any
        public animateLine(plane: any, flightPath: any, destinationPin: any,
            // tslint:disable-next-line:no-any
                           google: any, latLngSource: any, latLngDest: any, iCounter: number): void {
            // Displaying the moving icon only if animation is enabled
            plane.setMap(this.map);
            // The following code snippet adds animation to the paths and flight icons
            let stepNo: number = 0;
            // Altering animation speed
            const steps: number = this.settings.animationSetting.speed === 'low' ? 150 : this.settings.animationSetting.speed === 'medium'
                            ? 60 : 20;
            const timePerStep: number = 2; // Change this to set animation resolution
            const interval: number = setInterval(() => {
                stepNo += 1;
                if (stepNo > steps) {
                    plane.setMap(null);
                    clearInterval(interval);
                } else {
                    // tslint:disable-next-line:no-any
                    const latLngMiddle: any = google.maps.geometry.spherical.interpolate(latLngSource, latLngDest, stepNo / steps);
                    flightPath.setPath([latLngSource, latLngMiddle]);
                    plane.setPosition(latLngMiddle);
                }
            },                                   timePerStep);
        }

        // assigns color to each line/path
        public fillColor (index: number): string {
            let kpi: string = this.formatter.format(this.flightData.data[index].kpi);
            const flag: number = kpi.indexOf('%') >= 0 ? 1 : 0;
            kpi = kpi.split(',').join('');
            let value: number;
            if (flag === 1) {
                value = parseFloat(kpi.split('%')[0]);
            } else {
                value = parseFloat(kpi);
            }

            switch (true) {
                case (Visual.gradients === 1): return this.settings.colorSetting.pathColor;
                case (value <= this.settings.colorSetting.circleThresh1): return this.settings.colorSetting.circleColor1;
                case (Visual.gradients === 2 || value <= this.settings.colorSetting.circleThresh2):
                    return this.settings.colorSetting.circleColor2;
                case (Visual.gradients === 3 || value <= this.settings.colorSetting.circleThresh3):
                    return this.settings.colorSetting.circleColor3;
                case (Visual.gradients === 4 || value <= this.settings.colorSetting.circleThresh4):
                    return this.settings.colorSetting.circleColor4;
                case (Visual.gradients === 5 || value <= this.settings.colorSetting.circleThresh5):
                    return this.settings.colorSetting.circleColor5;
                case (Visual.gradients === 6 || value <= this.settings.colorSetting.circleThresh6):
                    return this.settings.colorSetting.circleColor6;
                default: return this.settings.colorSetting.circleColor7;
            }
        }

        // identifies the clicked circle
        public setCircles (id: string): IStartEnd {
            let circle: string = null;
            let start: number = 0;
            let end: number = 0;
            const clickedFlag: number = parseInt($(`.${id}`).attr('clickFlag'), null);
            switch (id) {
                case 'flightCircle1': circle = 'c1';
                                      start = this.settings.colorSetting.circleThresh1;
                                      break;
                case 'flightCircle2': circle = 'c2';
                                      start = this.settings.colorSetting.circleThresh1;
                                      end = this.settings.colorSetting.circleThresh2;
                                      break;
                case 'flightCircle3': circle = 'c3';
                                      start = this.settings.colorSetting.circleThresh2;
                                      end = this.settings.colorSetting.circleThresh3;
                                      break;
                case 'flightCircle4': circle = 'c4';
                                      start = this.settings.colorSetting.circleThresh3;
                                      end = this.settings.colorSetting.circleThresh4;
                                      break;
                case 'flightCircle5': circle = 'c5';
                                      start = this.settings.colorSetting.circleThresh4;
                                      end = this.settings.colorSetting.circleThresh5;
                                      break;
                case 'flightCircle6': circle = 'c6';
                                      start = this.settings.colorSetting.circleThresh5;
                                      end = this.settings.colorSetting.circleThresh6;
                                      break;
                case 'flightCircle7': circle = 'c7';
                                      start = this.settings.colorSetting.circleThresh6;
                                      break;
                default: circle = 'c1';
                         start = this.settings.colorSetting.circleThresh1;
                         break;
            }
            $('.flightLessThanTarget').attr('clickFlag', 0);
            $('.flightGreaterThanTarget').attr('clickFlag', 0);
            $('.flightCircle').attr('clickFlag', 0); // Update click counters of other circles
            $(`.${id}`).attr('clickFlag', clickedFlag);
            const toReturn: IStartEnd = {circle: null , start : 0, end: 0};
            toReturn.circle = circle;
            toReturn.start = start;
            toReturn.end = end;

            return toReturn;
        }

        public loadComponents (options: VisualUpdateOptions): void {
            if (typeof document !== 'undefined') {
                // tslint:disable-next-line:no-any
                const google: any = window[this.googleString] || window.window[this.googleString];     // to use the class google

                const categoricalData: DataViewCategorical = this.dataView.categorical;

                this.converter(categoricalData, this.host);

                // initialising markers and icons
                // tslint:disable-next-line:no-any
                const sourceIcon: any = {
                    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAAS1BMVEVMaXErMIcrMIcrMIcrMIcrMIcr' +
                        'MIcrMIcrMIcrMIcrMIcrMIcrMIcrMIf///+9v9pTV557frTz8/jLzOGjpctgZKWIi7w4PY9GSpYxMDqwAAAADXRSTlMAsJDgQBCAMMDwIFBg' +
                        '+SGGagAAAAlwSFlzAAALEgAACxIB0t1+/AAAAEBJREFUCJkVy7cBgDAQBMEVIAfcy2D7rxSRTTIQXUo7EPNzVU3g3m7WtKLbzA4t5DZQBoLOX' +
                        'uoMPknKkf+FzcMHXyECgMGZa7MAAAAASUVORK5CYII=',
                    anchor: new google.maps.Point(4, 5)
                };
                // tslint:disable-next-line:no-any
                const destinationIcon: any = {
                    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAMAAAAVv241AAAAM1BMVEVMaXErMIcrMIcrMIcrMIcrMIcrMIcr' +
                        'MIcrMIcrMIcrMIcrMIcrMIcrMIcrMIcrMIcrMIei3xwKAAAAEHRSTlMAMNDggKDAEPBgQHBQkCCwdwZONAAAAAlwSFlzAAALEgAACxIB0t1+/AAA' +
                        'AGlJREFUCJlFjVkSgDAIQ9OFFq1L7n9aWXTMR4dXSAKg3CTbBtdG1i5KsflS+ues7MDpj5PqxGAJgPAwmAndTgYzB9U2iy1Wi+aZ' +
                        'ah1lF0aQ9YTyYCTs4SwxS8ZYL92Nt5xc+HSw4tdI9wPsTQR+aWpi0AAAAABJRU5ErkJggg=='
                };
                // tslint:disable-next-line:no-any
                const planeIcon: any = {
                    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAACXBIWXMAAAsSAAALEgHS3X78AAAA6ElEQVQokZ2S' +
                        'QWrCQBSGv8QZQXBTk1VXIhgLXQa8RSDQjYeoK8/RVS7QC4hCziEILqpZiBeYjcRNCZ0uMtMOQRvpv/v/9/55/POep7XGIpivY2AC9P' +
                        'lFCRxUlm6s4GmtCebrLpAAAbehgFxl6advhDYDpp4AeIPXVQzEtiL2x0gUp8TyKhrm1dOocMwbYTL8GOT2Y+E+b/ibY5z4bmh3gouG3vevNbXh36' +
                        'bSkioa5teaGnrZ6U1nXeAR4Ct8UAhR+OdLiJQKKVX1PH5v/N7OLveF9j0BKJWlS5spp974nwbTV5+Rxb239w0MGVD5' +
                        'OkFQBwAAAABJRU5ErkJggg==',
                    anchor: new google.maps.Point(10, 10)
                };

                this.mapElements.flightPath = [];
                this.mapElements.sourcePin = [];
                this.mapElements.destinationPin = [];

                // each iteration of the following loop places source and destinations markers and animates paths of flights
                let iCounter: number;
                for (iCounter = 0; iCounter < this.flightData.data.length; iCounter++) {
                    // setting source latitude and longitude in each iteration
                    // tslint:disable-next-line:no-any
                    const latLngSource: any = new google.maps.LatLng(this.flightData.data[iCounter].sourceDataPoints.latitude,
                                                                     this.flightData.data[iCounter].sourceDataPoints.longitude);
                    // setting destination latitude and longitude in each iteration
                    // tslint:disable-next-line:no-any
                    const latLngDest: any = new google.maps.LatLng(this.flightData.data[iCounter].destinationDataPoints.latitude,
                                                                   this.flightData.data[iCounter].destinationDataPoints.longitude);
                    // to store color of paths
                    let pathColor: string = null;
                    const value: number = 0;
                    pathColor = this.fillColor(iCounter);
                    // setting type of flight - international/domestic
                    const type: string = this.flightData.data[iCounter].flightType === null ? null :
                        this.flightData.data[iCounter].flightType.toLowerCase();
                    const routeType: string = (!Visual.isType ? this.settings.routeSetting.route :
                        type === 'international' ? this.settings.routeSetting.internationalRoute :
                        type === 'domestic' ? this.settings.routeSetting.domesticRoute : this.settings.routeSetting.otherRoute);

                    // setting the source pin
                    this.mapElements.sourcePin.push(new google.maps.Marker({
                        position: latLngSource,
                        map: this.map,
                        icon: sourceIcon
                    }));
                    // adding tooltip on each pin
                    this.addPinSelection(this.mapElements.sourcePin[iCounter], google, iCounter, 1);

                    // creating dash symbol for dashed line
                    // tslint:disable-next-line:no-any
                    const lineSymbol: any = {
                        path: routeType === 'Dashed' ? 'M 0,-4 0,4' : 'M 0,-2 0,0',
                        strokeOpacity: 1,
                        scale: 1
                    };
                    // setting the destination pin
                    this.mapElements.destinationPin.push(new google.maps.Marker({
                        position: latLngDest,
                        map: this.map,
                        icon: destinationIcon
                    }));
                    // adding tooltip on each pin
                    this.addPinSelection(this.mapElements.destinationPin[iCounter], google, iCounter, 2);

                    // placing the flight icon on the map
                    const plane: d3.Selection<HTMLElement> = new google.maps.Marker({
                        position: latLngSource,
                        icon: planeIcon
                    });
                    // adding tooltip on each flight icon
                    this.addPinSelection(plane, google, iCounter, 0);

                    this.mapElements.flightPath.push(new google.maps.Polyline({
                        path: [latLngSource, latLngSource],
                        geodesic: true,
                        map: this.map,
                        strokeOpacity: 0,
                        strokeColor: pathColor
                    }));
                    this.mapElements.flightPath[iCounter].setOptions({
                        icons: [{
                            icon: lineSymbol,
                            offset: '0',
                            repeat: '6px'    // repeating the symbol to make dashed/dotted line
                        }]
                    });
                    // tslint:disable-next-line:no-any
                    const icons: any = this.mapElements.flightPath[iCounter].get('icons');
                    switch (routeType) {
                        case 'Dotted': icons[0].repeat = '6px';    break;
                        case 'Dashed': icons[0].repeat = '12px';    break;
                        case 'Solid': icons[0].repeat = '2px';    break;
                        default: icons[0].repeat = '2px';
                    }
                    this.mapElements.flightPath[iCounter].set('icons', icons);

                    // called to animate the paths and flight icons
                    if (this.settings.animationSetting.show) {
                        this.animateLine(plane, this.mapElements.flightPath[iCounter], this.mapElements.destinationPin[iCounter],
                                         google, latLngSource, latLngDest, iCounter);
                    } else {
                        this.mapElements.flightPath[iCounter].setPath([latLngSource, latLngDest]);
                    }
                    this.addLineSelection(this.mapElements.flightPath[iCounter], google, iCounter);
                }
            }
        }

        // Loads the destination/source legend
        public LoadMarkerLegend(options: VisualUpdateOptions): void {
            const width: number = (Visual.isType && this.settings.routeSetting.show) ? options.viewport.width / 3 - this.marginLeft
                            : options.viewport.width - this.marginLeft;
            this.divs.legendImage.selectAll('*').remove();
            this.divs.legendImage.style('width', `${width}px`);
            this.divs.legendImage.style('margin-left', `${this.marginLeft}px`);
            const source: d3.Selection<HTMLElement> = this.divs.legendImage
                .append('div')
                .classed('flightSource', true);
            source.append('div')
                .classed('flightSourceImage', true);
            source.append('text')
                .classed('flightSourceText', true)
                .text(' (Origin)');
            const destination: d3.Selection<HTMLElement> = this.divs.legendImage
                .append('div')
                .classed('flightDestination', true);
            destination.append('div')
                .classed('flightDestinationImage', true);
            destination.append('text')
                .classed('flightDestinationText', true)
                .text(' (Destination)');
        }

        public assignImage(type: string): string {
            if (type === 'Dashed') {
                return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUCAYAAACaq43EAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFEmlUWHR' +
                'YTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0' +
                'YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxO' +
                'jA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmR' +
                'mOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcH' +
                'VybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bX' +
                'BNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXN' +
                'vdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wNC0xOFQxN' +
                'To0MjoyMiswNTozMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDQtMThUMTU6NTE6MzErMDU6MzAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMDQtMThUMTU' +
                '6NTE6MzErMDU6MzAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM' +
                '2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OWMyOWRkMTItZTI0Ny1jNTQ5LTgzYWMtMmI1ZDFhMGU0MmMxIiB4bXBNTTpEb2N1bWVudEl' +
                'EPSJ4bXAuZGlkOjljMjlkZDEyLWUyNDctYzU0OS04M2FjLTJiNWQxYTBlNDJjMSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjljMjlkZDE' +
                'yLWUyNDctYzU0OS04M2FjLTJiNWQxYTBlNDJjMSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0Z' +
                'WQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6OWMyOWRkMTItZTI0Ny1jNTQ5LTgzYWMtMmI1ZDFhMGU0MmMxIiBzdEV2dDp3aGVuPSIyMDE4LTA' +
                '0LTE4VDE1OjQyOjIyKzA1OjMwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDwvcmRmOlNlcT4gP' +
                'C94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmFd334AAABP' +
                'SURBVEiJY/z//z/DQACmAbF11OJRi0ctpiZg1DOcBCtBDl48l+uArkDfaDJGCXPxXC4jOer0jSY3MDAw1DMwDKSPR4vMUYtHLR61mFwAAEc3FRAp0Cg' +
                '6AAAAAElFTkSuQmCC';
            } else if (type === 'Solid') {
                return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUCAYAAACaq43EAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFEmlUWHRYT' +
                'Uw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4' +
                'bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5' +
                'ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2Nya' +
                'XB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGM' +
                'vZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0c' +
                'DovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV' +
                '2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wNC0xOFQxNTo0M' +
                'joyMiswNTozMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDQtMThUMTU6NTA6NDIrMDU6MzAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMDQtMThUMTU6' +
                'NTA6NDIrMDU6MzAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiB' +
                'JRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDYyY2RlMmYtOWQ4My02YTQ5LWE5MzgtNTQ5YTc2OTAxN2U3IiB4bXBNTTpEb2' +
                'N1bWVudElEPSJ4bXAuZGlkOjQ2MmNkZTJmLTlkODMtNmE0OS1hOTM4LTU0OWE3NjkwMTdlNyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZ' +
                'GlkOjQ2MmNkZTJmLTlkODMtNmE0OS1hOTM4LTU0OWE3NjkwMTdlNyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rp' +
                'b249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NDYyY2RlMmYtOWQ4My02YTQ5LWE5MzgtNTQ5YTc2OTAxN2U3IiBzdEV2dDp3aGVu' +
                'PSIyMDE4LTA0LTE4VDE1OjQyOjIyKzA1OjMwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDwvcmRm' +
                'OlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnXa' +
                'p9UAAAA6SURBVEiJY/z//z/DQACmAbF11OJRi0ctpiZg1DOcdGAgLGZhYGCwHyiLHQfCYsbRsnrU4lGLh7zFAFUYCFVsfs+3AAAAAElFTkSuQmCC';
            }

            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUCAYAAACaq43EAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFEmlUWHRYTUw6' +
                'Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4b' +
                'Wxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2Oj' +
                'M5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkR' +
                'lc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVyb' +
                'C5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXB' +
                'NTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZX' +
                'NvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wNC0xO' +
                'FQxNTo0MjoyMiswNTozMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDQtMThUMTU6NTE6MTErMDU6MzAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMDQtM' +
                'ThUMTU6NTE6MTErMDU6MzAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1' +
                'JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDRkM2EzZWUtZTBhOS05MDQ2LTg4NjMtMWZjYmQwMDBlN2E1IiB4bXBNTTp' +
                'Eb2N1bWVudElEPSJ4bXAuZGlkOjQ0ZDNhM2VlLWUwYTktOTA0Ni04ODYzLTFmY2JkMDAwZTdhNSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZ' +
                'GlkOjQ0ZDNhM2VlLWUwYTktOTA0Ni04ODYzLTFmY2JkMDAwZTdhNSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249I' +
                'mNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NDRkM2EzZWUtZTBhOS05MDQ2LTg4NjMtMWZjYmQwMDBlN2E1IiBzdEV2dDp3aGVuP' +
                'SIyMDE4LTA0LTE4VDE1OjQyOjIyKzA1OjMwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDwvcm' +
                'RmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI' +
                '/PoNqqJgAAACzSURBVEiJ7ZTBDYMwEAQHKkgJVBAIjZASoACLlEAJEBcAJYRGLNwBJaQD52OjU/yNhCL5XqfbXc/ZD2fOOc6o/BRqAidwAv+ysuvtWQ' +
                'ED0Fqj3kEoaz0CmzVqEbPIW9b6AizAYI3ahLcFKmvUQ8wObw68gAYYv0I9MJe1LsSikdf3jddCvgBmoPdnRd4cuAMrcGzmbzkBnTVqF8HI6/vVayG/' +
                'Ax0wyReT3iz91QmcwH8P/gAG1UBB+AdcNgAAAABJRU5ErkJggg==';
        }

        // loads the legend indicating route type - domestic/international
        public LoadTypeLegend(options: VisualUpdateOptions): void {
            const visualContext: this = this;
            const width: number = (this.isImage) ? options.viewport.width * 2 / 3 - this.marginLeft - 5
                            : options.viewport.width - this.marginLeft;
            this.divs.legendTypeImage.selectAll('*').remove();
            this.divs.legendTypeImage.style('width', `${width}px`);
            const international: string = this.assignImage(this.settings.routeSetting.internationalRoute);
            const domestic: string = this.assignImage(this.settings.routeSetting.domesticRoute);
            const other: string = this.assignImage(this.settings.routeSetting.otherRoute);
            const otherRoute: d3.Selection<HTMLElement> = this.divs.legendTypeImage
                .append('div')
                .attr('clickFlag', 0)
                .classed('flightOther', true);
            otherRoute.append('div')
                .classed('flightLine', true)
                .style('background-image', `url(${other})`);
            otherRoute.append('text')
                .text(' (Other)');
            const domesticRoute: d3.Selection<HTMLElement> = this.divs.legendTypeImage
                .append('div')
                .attr('clickFlag', 0)
                .classed('flightDomestic', true);
            domesticRoute.append('div')
                .classed('flightLine', true)
                .style('background-image', `url(${domestic})`);
            domesticRoute.append('text')
                .text(' (Domestic)');
            const internationalRoute: d3.Selection<HTMLElement> = this.divs.legendTypeImage
                .append('div')
                .attr('clickFlag', 0)
                .classed('flightInternational', true);
            internationalRoute.append('div')
                .classed('flightLine', true)
                .style('background-image', `url(${international})`);
            internationalRoute.append('text')
                .text(' (International)');

            // tslint:disable-next-line:no-any
            internationalRoute.on('click', function(): any {
                // the following code snippet resets the selection if it already exists
                visualContext.selectedIds = [];
                visualContext.selectionManager.clear()
                    .then(() => {
                        let iCounter: number;
                        for (iCounter = 0; iCounter < visualContext.flightData.data.length; iCounter++) {
                            visualContext.changeOpacity(iCounter, 1);
                            visualContext.changeVisibility(iCounter, true, visualContext.map);
                        }
                    })
                    .then(() => {
                        $('.flightDomestic').attr('clickFlag', 0);
                        $('.flightOther').attr('clickFlag', 0);
                    });
                event.stopPropagation();

                // If it is clicked for first time
                if (!parseInt(this.getAttribute('clickFlag'), null)) {
                    this.setAttribute('clickFlag', 1); // Update click counter

                    // renders only the paths and markers which are international
                    let iCounter: number;
                    for (iCounter = 0; iCounter < visualContext.flightData.data.length; iCounter++) {
                        if (visualContext.flightData.data[iCounter].flightType.toLowerCase() === 'international') {
                            visualContext.selectedIds.push(visualContext.flightData.data[iCounter].selectionId);
                        } else {
                            visualContext.changeVisibility(iCounter, false, null);
                        }
                    }
                    visualContext.selectionManager.select(visualContext.selectedIds);
                    event.stopPropagation();
                } else {                               // If it is clicked again
                    this.setAttribute('clickFlag', 0); // Update click counter
                }
            });

            // tslint:disable-next-line:no-any
            domesticRoute.on('click', function (): any {
                // the following code snippet resets the selection if it already exists
                visualContext.selectedIds = [];
                visualContext.selectionManager.clear()
                    .then(() => {
                        let iCounter: number;
                        for (iCounter = 0; iCounter < visualContext.flightData.data.length; iCounter++) {
                            visualContext.changeOpacity(iCounter, 1);
                            visualContext.changeVisibility(iCounter, true, visualContext.map);
                        }
                    })
                    .then(() => {
                        $('.flightInternational').attr('clickFlag', 0);
                        $('.flightOther').attr('clickFlag', 0);
                    });
                event.stopPropagation();

                // If it is clicked for first time
                if (!parseInt(this.getAttribute('clickFlag'), null)) {
                    this.setAttribute('clickFlag', 1); // Update click counter

                    // renders only the paths and markers which are domestic
                    let iCounter: number;
                    for (iCounter = 0; iCounter < visualContext.flightData.data.length; iCounter++) {
                        if (visualContext.flightData.data[iCounter].flightType.toLowerCase() === 'domestic') {
                            visualContext.selectedIds.push(visualContext.flightData.data[iCounter].selectionId);
                        } else {
                            visualContext.changeVisibility(iCounter, false, null);
                        }
                    }
                    visualContext.selectionManager.select(visualContext.selectedIds);
                    event.stopPropagation();
                } else {                                // If it is clicked again
                    this.setAttribute('clickFlag', 0); // Update click counter to reset selection
                }
            });

            // tslint:disable-next-line:no-any
            otherRoute.on('click', function(): any {
                // the following code snippet resets the selection if it already exists
                visualContext.selectedIds = [];
                visualContext.selectionManager.clear()
                    .then(() => {
                        let iCounter: number;
                        for (iCounter = 0; iCounter < visualContext.flightData.data.length; iCounter++) {
                            visualContext.changeOpacity(iCounter, 1);
                            visualContext.changeVisibility(iCounter, true, visualContext.map);
                        }
                    })
                    .then(() => {
                        $('.flightInternational').attr('clickFlag', 0);
                        $('.flightDomestic').attr('clickFlag', 0);
                    });
                event.stopPropagation();

                // If it is clicked for first time
                if (!parseInt(this.getAttribute('clickFlag'), null)) {
                    this.setAttribute('clickFlag', 1); // Update click counter

                    // renders only the paths and markers which are domestic
                    let iCounter: number;
                    for (iCounter = 0; iCounter < visualContext.flightData.data.length; iCounter++) {
                        if (visualContext.flightData.data[iCounter].flightType.toLowerCase() !== 'international' &&
                            visualContext.flightData.data[iCounter].flightType.toLowerCase() !== 'domestic') {
                            visualContext.selectedIds.push(visualContext.flightData.data[iCounter].selectionId);
                        } else {
                            visualContext.changeVisibility(iCounter, false, null);
                        }
                    }
                    visualContext.selectionManager.select(visualContext.selectedIds);
                    event.stopPropagation();
                } else {                                // If it is clicked again
                    this.setAttribute('clickFlag', 0); // Update click counter to reset selection
                }
            });
        }

        // loads the threshold/target legend if target value exists
        public LoadThreshLegend(options: VisualUpdateOptions): void {
            d3.selectAll('.flightLegendThreshImage').remove();
            this.divs.legendThreshImage = d3.select(this.target)
                    .append('div')
                    .classed('flightLegendThreshImage', true);
            const visualContext: this = this;
            const width: number = options.viewport.width - 70;
            const margin: number = this.marginLeft + 70;
            this.divs.legendThreshImage.selectAll('*').remove();
            this.divs.legendThreshImage.style('width', `${width}px`);
            this.divs.legendThreshImage.style('margin-left', `${margin}px`);
            const target: d3.Selection<HTMLElement> = this.divs.legendThreshImage
                .append('div')
                .classed('flightTarget', true)
                .style('width', width - margin);
            target.append('text')
                .classed('flightTargetText', true)
                .text(`${this.legendName}`);
            let iCounter: number;
            for (iCounter = 0; iCounter < Visual.gradients; iCounter++) {
                target.append('span')
                .classed(`flightCircle${iCounter + 1}`, true)
                .classed('flightCircle', true)
                .attr('id', `flightCircle${iCounter + 1}`)
                .attr('clickFlag', 0);
            }
            if (Visual.gradients === 1) {
                $('.flightCircle1').css('background-color', this.settings.colorSetting.pathColor);
            } else {
                $('.flightCircle1').css('background-color', this.settings.colorSetting.circleColor1);
            }
            $('.flightCircle2').css('background-color', this.settings.colorSetting.circleColor2);
            $('.flightCircle3').css('background-color', this.settings.colorSetting.circleColor3);
            $('.flightCircle4').css('background-color', this.settings.colorSetting.circleColor4);
            $('.flightCircle5').css('background-color', this.settings.colorSetting.circleColor5);
            $('.flightCircle6').css('background-color', this.settings.colorSetting.circleColor6);
            $('.flightCircle7').css('background-color', this.settings.colorSetting.circleColor7);

            $('.flightCircle').off('click');
            // tslint:disable-next-line:no-any
            $('.flightCircle').on('click', function(e: any): any {
                const returned: IStartEnd = visualContext.setCircles(e.target.id);
                // the following code snippet resets the selection if it already exists
                visualContext.selectedIds = [];
                visualContext.selectionManager.clear()
                    .then(() => {
                        let iCounterElements: number;
                        for (iCounterElements = 0; iCounterElements < visualContext.flightData.data.length; iCounterElements++) {
                            visualContext.changeOpacity(iCounterElements, 1);
                            visualContext.changeVisibility(iCounterElements, true, visualContext.map);
                        }
                    });
                event.stopPropagation();

                // If it is clicked for first time
                if (!parseInt(this.getAttribute('clickFlag'), null)) {
                    this.setAttribute('clickFlag', 1); // Update click counter

                    // the following code snippet renders only the paths and markers for which the legend is clicked
                    let iCounterMarkers: number;
                    for (iCounterMarkers = 0; iCounterMarkers < visualContext.flightData.data.length; iCounterMarkers++) {
                        let flag: number = 0;
                        let kpi: string = visualContext.formatter.format(visualContext.flightData.data[iCounterMarkers].kpi);
                        const flagKPI: number = kpi.indexOf('%') >= 0 ? 1 : 0;
                        kpi = kpi.split(',').join('');
                        let value: number;
                        if (flagKPI === 1) {
                            value = parseFloat(kpi.split('%')[0]);
                        } else {
                            value = parseFloat(kpi);
                        }
                        switch (returned.circle) {
                            // when circle 1 is clicked
                            case 'c1': if (value <= returned.start && Visual.gradients !== 1) {
                                        visualContext.selectedIds.push(visualContext.flightData.data[iCounterMarkers].selectionId);
                                        flag = 1;
                                    } else if (Visual.gradients === 1) {
                                        visualContext.selectedIds.push(visualContext.flightData.data[iCounterMarkers].selectionId);
                                        flag = 1;
                                    }
                                       break;
                            // when circle 7 is clicked
                            case `c${Visual.gradients}`: if (value > returned.start) {
                                        visualContext.selectedIds.push(visualContext.flightData.data[iCounterMarkers].selectionId);
                                        flag = 1;
                                    }
                                                         break;
                            // when any other circle is clicked
                            default: if (value > returned.start &&
                                        value <= returned.end) {
                                        visualContext.selectedIds.push(visualContext.flightData.data[iCounterMarkers].selectionId);
                                        flag = 1;
                                    }
                                     break;
                        }
                        // hides all the other paths and markers
                        if (!flag) {
                            visualContext.changeVisibility(iCounterMarkers, false, null);
                        }
                    }
                    visualContext.selectionManager.select(visualContext.selectedIds);
                    event.stopPropagation();
                } else {                               // If it is clicked again
                    this.setAttribute('clickFlag', 0); // Update click counter
                }
            });
        }

        // hide/show legends according to available space
        public checkLegendSpace(options: VisualUpdateOptions): void {
            const imageLegend: JQuery = $('.flightLegendImage');
            const typeLegend: JQuery = $('.flightLegendTypeImage');
            const threshLegend: JQuery = $('.flightLegendThreshImage');
            // remove the legend indicating domestic/international routes if enough space is not available
            if (typeLegend[0] && ((typeLegend[0].scrollHeight > typeLegend[0].clientHeight
                        || typeLegend[0].scrollWidth > typeLegend[0].clientWidth)
                    || (imageLegend[0] && (imageLegend[0].scrollHeight > imageLegend[0].clientHeight
                        || imageLegend[0].scrollWidth > imageLegend[0].clientWidth)))) {
                Visual.isType = false;
                d3.selectAll('.flightLegendTypeImage').remove();
                if (!this.isImage) {
                    $('#googleMap').css('height', this.viewport.height);
                } else {
                    this.divs.legendImage.style('width', `${options.viewport.width}px`);
                }
            }

            // remove the legend indicating source/destination if enough space is not available
            if (imageLegend[0] && (imageLegend[0].scrollHeight > imageLegend[0].clientHeight
                || imageLegend[0].scrollWidth > imageLegend[0].clientWidth)) {
                this.isImage = false;
                d3.selectAll('.flightLegendImage').remove();
                if (!(Visual.isType && this.settings.routeSetting.show)) {
                    $('#googleMap').css('height', this.viewport.height);
                } else {
                    this.divs.legendTypeImage.style('width', `${options.viewport.width}px`);
                }
            }
            // remove the threshold legend if enough space is not available
            if (threshLegend[0] && (threshLegend[0].scrollHeight > threshLegend[0].clientHeight
                || threshLegend[0].scrollWidth > threshLegend[0].clientWidth)) {
                d3.selectAll('.flightLegendThreshImage').remove();
            }
        }

        // creates tooltips
        // tslint:disable-next-line:no-any
        public addTooltip(e: any, iCounter: number): void {
            const visualContext: this = this;
            // tslint:disable-next-line:no-any
            const map: any = this.map;
            const x: number = e.clientX;
            const y: number = e.clientY;
            const tooltipShowOptions: TooltipShowOptions = {
                coordinates: [x, y],
                isTouchEvent: false,
                dataItems: visualContext.getTooltipData(visualContext.flightData.data[iCounter]),
                identities: []
            };
            // Doesn't show tooltip window if there is no column added in the tooltips field
            if (tooltipShowOptions.dataItems.length) { this.host.tooltipService.show(tooltipShowOptions); }
        }

        // hides tooltips
        public hideTooltip(): void {
            const tooltipHideOptions: TooltipHideOptions = {
                immediately: true,
                isTouchEvent: false
            };
            this.host.tooltipService.hide(tooltipHideOptions);
        }

        // converts tooltip data into required format
        // tslint:disable-next-line:no-any
        public getTooltipData(value: any): VisualTooltipDataItem[] {
            const tooltipDataPoints: VisualTooltipDataItem[] = [];
            for (const iCounter of value.tooltipDataPoints) {
                const tooltipData: VisualTooltipDataItem = {
                    displayName: '',
                    value: ''
                };
                tooltipData.displayName = iCounter.name;
                tooltipData.value = iCounter.value;
                tooltipDataPoints.push(tooltipData);
            }

            return tooltipDataPoints;
        }

        // the following code snippet converts a value to string and checks for corner cases
        public convertToString(str: PrimitiveValue): string {
            if (str || str === 0) {
                return str.toString();
            } else {
                return null;
            }

        }

        public update(options: VisualUpdateOptions): void {
            clearTimeout(this.timeoutID);
            this.rootElement.selectAll('.flightErrorMessage').remove();
            d3.select('#outerDiv').remove();
            d3.selectAll('.flightLegendImage').remove();
            d3.selectAll('.flightLegendTypeImage').remove();
            d3.selectAll('.flightLegendThreshImage').remove();
            this.dataView = options.dataViews && options.dataViews[0]
                ? options.dataViews[0]
                : null;

            // displays message to enter API field
            this.settings.apiSetting = null;
            this.settings.apiSetting = enumSettings.getAPISettings(this.dataView);
            if (!this.settings.apiSetting) {
                const message: string = `Please add 'API Key' field in the formatting pane`;
                this.rootElement
                    .append('div')
                    .classed('flightErrorMessage', true)
                    .text(message)
                    .attr('title', message);

                return;
            }

            Visual.isVal = false;
            Visual.isType = false;
            if (!this.dataCheck(options)) {
                return;
            }

            // tslint:disable-next-line:no-any
            const google: any = window[this.googleString] || window.window[this.googleString];         // to use the class google
            this.viewport = options.viewport;

            this.settings.mapSetting = enumSettings.getMapSettings(this.dataView);
            this.settings.tooltipSetting = enumSettings.getTooltipSettings(this.dataView);
            this.settings.animationSetting = enumSettings.getAnimationSettings(this.dataView);
            this.settings.imageSetting = enumSettings.getImageSettings(this.dataView);
            this.settings.routeSetting = enumSettings.getRouteSettings(this.dataView);
            this.settings.colorSetting = enumSettings.getColorSettings(this.dataView);
            this.settings.centerSetting = enumSettings.getCenterSettings(this.dataView);
            this.isImage = this.settings.imageSetting.show ? true : false;

            if (this.isImage) {
                this.divs.legendImage = d3.select(this.target)
                    .append('div')
                    .classed('flightLegendImage', true);
            }
            if (Visual.isType && this.settings.routeSetting.show) {
                this.divs.legendTypeImage = d3.select(this.target)
                    .append('div')
                    .classed('flightLegendTypeImage', true);
            }

            this.flightData = {
                data: []
            };
            this.updateCount++;
            // to obtain the number of gradient colors
            Visual.gradients = parseInt(this.settings.colorSetting.gradients, null);

            // runs the first time the map is loaded
            if (this.updateCount === 1 || this.previousAPI !== this.settings.apiSetting) {
                this.divs.googleMap = d3.select(this.target)
                    .append('script')
                        .attr({
                            type: 'text/javascript',
                            src: `https://maps.googleapis.com/maps/api/js?key=${this.settings.apiSetting}&libraries=geometry`,
                            async: true
                        });
                this.divs.googleMap
                    .on('load', () => {
                        this.initMap(options);
                        this.loadComponents(options);
                        if (this.isImage) { this.LoadMarkerLegend(options); }
                        if (Visual.isType && this.settings.routeSetting.show) { this.LoadTypeLegend(options); }
                        if (Visual.isVal && this.settings.colorSetting.KPIlegend) { this.LoadThreshLegend(options); }
                        this.checkLegendSpace(options);
                    });
                this.selectedIds = [];
            } else {                                // runs on every subsequent load of the map after the first one
                this.onLoad(options);
            }
            this.previousAPI = this.settings.apiSetting;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const objectName: string = options.objectName;
            const objectEnumeration: VisualObjectInstance[] = [];
            const visualContext: this = this;
            switch (objectName) {
                case 'api':
                    enumSettings.enumerateAPISettings(visualContext.settings.apiSetting, objectEnumeration, objectName);
                    break;
                case 'mapTypes':
                    enumSettings.enumerateMapSettings(visualContext.settings.mapSetting, objectEnumeration, objectName);
                    break;
                case 'tooltipSeparator':
                    enumSettings.enumerateTooltipSetting(visualContext.settings.tooltipSetting, objectEnumeration, objectName);
                    break;
                case 'animation':
                    enumSettings.enumerateAnimationSetting(visualContext.settings.animationSetting, objectEnumeration, objectName);
                    break;
                case 'image':
                    enumSettings.enumerateImageSetting(visualContext.settings.imageSetting, objectEnumeration, objectName);
                    break;
                case 'routes':
                    enumSettings.enumerateRouteSettings(visualContext.settings.routeSetting, objectEnumeration, objectName);
                    break;
                case 'colors':
                    enumSettings.enumerateColorSetting(visualContext.settings.colorSetting, objectEnumeration, objectName);
                    break;
                case 'center':
                    enumSettings.enumerateCenterSettings(visualContext.settings.centerSetting, objectEnumeration, objectName);
                    break;
                default:
            }

            return objectEnumeration;
        }

        // contains the custom map styles
        public mapStyles(): void {
            // tslint:disable-next-line:no-any
            const google: any = window[this.googleString] || window.window[this.googleString];         // to use the class google
            this.mapTypes.styledMapStandard = new google.maps.StyledMapType(
                [
                    {
                    elementType: 'labels',
                    stylers: [
                        {
                            visibility: 'off'
                        }
                    ]
                    },
                    {
                    featureType: 'administrative',
                    elementType: 'geometry',
                    stylers: [
                        {
                            visibility: 'off'
                        }
                    ]
                    },
                    {
                    featureType: 'administrative.neighborhood',
                    stylers: [
                        {
                        visibility: 'off'
                        }
                    ]
                    }
                ],
                {name: 'Standard Map'});
            this.mapTypes.styledMapSilver  = new google.maps.StyledMapType(
                [
                    {
                    elementType: 'geometry',
                    stylers: [
                        {
                        color: '#f5f5f5'
                        }
                    ]
                    },
                    {
                    elementType: 'labels',
                    stylers: [
                        {
                        visibility: 'off'
                        }
                    ]
                    },
                    {
                    featureType: 'administrative',
                    stylers: [
                        {
                        visibility: 'off'
                        }
                    ]
                    },
                    {
                    featureType: 'administrative',
                    elementType: 'geometry',
                    stylers: [
                        {
                        visibility: 'off'
                        }
                    ]
                    },
                    {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [
                        {
                        color: '#c9c9c9'
                        }
                    ]
                    }
                ],
                {name: 'Silver Map'});
            this.mapTypes.styledMapNight = new google.maps.StyledMapType(
                [
                    {
                      elementType: 'geometry',
                      stylers: [
                        {
                          color: '#212121'
                        }
                      ]
                    },
                    {
                      elementType: 'labels',
                      stylers: [
                        {
                          visibility: 'off'
                        }
                      ]
                    },
                    {
                      featureType: 'administrative',
                      stylers: [
                        {
                          visibility: 'off'
                        }
                      ]
                    },
                    {
                    featureType: 'administrative',
                    elementType: 'geometry',
                    stylers: [
                        {
                        visibility: 'off'
                        }
                    ]
                    },
                    {
                      featureType: 'water',
                      elementType: 'geometry',
                      stylers: [
                        {
                          color: '#000000'
                        }
                      ]
                    }
                ],
                {name: 'Night Map'}
            );
            this.mapTypes.styledMap = new google.maps.StyledMapType(
                [
                    {
                        featureType: 'administrative',
                        elementType: 'labels.text.fill',
                        stylers: [
                            {
                                visibility: 'off'
                            },
                            {
                                color: '#444444'
                            }
                        ]
                    },
                    {
                    featureType: 'administrative',
                    elementType: 'geometry',
                    stylers: [
                        {
                        visibility: 'off'
                        }
                    ]
                    },
                    {
                        featureType: 'landscape',
                        elementType: 'all',
                        stylers: [
                            {
                                color: '#f2f2f2'
                            }
                        ]
                    },
                    {
                        featureType: 'poi',
                        elementType: 'all',
                        stylers: [
                            {
                                visibility: 'off'
                            }
                        ]
                    },
                    {
                        featureType: 'road',
                        elementType: 'all',
                        stylers: [
                            {
                                saturation: -100
                            },
                            {
                                lightness: 45
                            }
                        ]
                    },
                    {
                        featureType: 'road.highway',
                        elementType: 'all',
                        stylers: [
                            {
                                visibility: 'simplified'
                            }
                        ]
                    },
                    {
                        featureType: 'road.arterial',
                        elementType: 'labels.icon',
                        stylers: [
                            {
                                visibility: 'off'
                            }
                        ]
                    },
                    {
                        featureType: 'transit',
                        elementType: 'all',
                        stylers: [
                            {
                                visibility: 'off'
                            }
                        ]
                    },
                    {
                        featureType: 'water',
                        elementType: 'all',
                        stylers: [
                            {
                                color: '#bee0ee'
                            },
                            {
                                visibility: 'on'
                            }
                        ]
                    }
                ],
                {name: 'Basic Map'});
        }
    }
}
