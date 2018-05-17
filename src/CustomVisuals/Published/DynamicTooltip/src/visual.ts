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
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
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
    }

    export interface Itooltip {
        text: string;
        header: string;
        imageurl: string;
    }

    export interface ImeasureSettings {
        show: boolean;
        textPrecision: number;
        displayUnits: number;
    }

    export let visualProperties : {
        Itooltip: {
            text: DataViewObjectPropertyIdentifier;
            header: DataViewObjectPropertyIdentifier;
            imageurl: DataViewObjectPropertyIdentifier;
        };
        ImeasureSettings: {
            show: DataViewObjectPropertyIdentifier;
            textPrecision: DataViewObjectPropertyIdentifier;
            displayUnits: DataViewObjectPropertyIdentifier;
        };
    }
     = {
        Itooltip: {
            text: <DataViewObjectPropertyIdentifier>{ objectName: 'tooltip', propertyName: 'text' },
            header: <DataViewObjectPropertyIdentifier>{ objectName: 'tooltip', propertyName: 'header' },
            imageurl: <DataViewObjectPropertyIdentifier>{ objectName: 'tooltip', propertyName: 'imageurl' }
        },
        ImeasureSettings: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'measuretooltip', propertyName: 'show' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'measuretooltip', propertyName: 'textPrecision' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'measuretooltip', propertyName: 'displayUnits' }
        }
    };

    export class Visual implements IVisual {

        private target: HTMLElement;
        private updateCount: number;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private host: IVisualHost;
        private root: d3.Selection<SVGElement>;
        private image: d3.Selection<SVGElement>;
        private tooltipText: string;
        private header: string;
        private opacity: number;
        private dataViews : DataView;
        private imageurl: string;
        private showMeasure: boolean;
        private textPrecision: number;
        private displayUnits: number;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.target = options.element;
            this.updateCount = 0;

            this.root = d3.select(options.element);
            this.imageurl = 'https://genericvisual.blob.core.windows.net/images/Tooltip.svg';
            this.image = this.root.append('div').classed('dynamicTooltip_div', true)
                .append('img').classed('dynamicTooltip_img', true)
                .attr('src', this.imageurl);
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.tooltipText = 'Tooltip text here';
            this.header = 'Tooltip header text here';
            this.showMeasure = false;
            this.textPrecision = 0;
            this.displayUnits = 0;
        }

        public update(options: VisualUpdateOptions) : void {

            let textSetting: Itooltip;
            textSetting = this.getDefaultTextSettings();
            // tslint:disable-next-line:no-any
            let img: d3.Selection<any>;
            img = d3.select('img');

            let minVal: number;
            minVal = Math.min(options.viewport.width, options.viewport.height); // Take minimum value of width and height
            if (options.viewport.width > options.viewport.height) {
                $('.dynamicTooltip_div').addClass('dt_horizontallyCenter');
                $('.dynamicTooltip_img').removeClass('dt_verticallyCenter');
            } else if (options.viewport.width < options.viewport.height) {
                $('.dynamicTooltip_div').removeClass('dt_horizontallyCenter');
                $('.dynamicTooltip_img').addClass('dt_verticallyCenter');

                let topPx: number;
                topPx = options.viewport.height / 2 - minVal / 2;
                let topPos: string;
                topPos = topPx > 0 ? `${topPx}px` : '0px';
                this.image.style({
                    top: topPos
                });
            } else {
                $('.dynamicTooltip_div').removeClass('dt_horizontallyCenter');
                $('.dynamicTooltip_img').removeClass('dt_verticallyCenter');
            }

            this.image.style({
                width: `${minVal}px`,
                height: `${minVal}px`
            });

            let dataViews: DataView[];
            dataViews = options.dataViews;
            if (dataViews && dataViews[0] && dataViews[0].metadata) {

                let dataView: DataView;
                dataView = this.dataViews = options.dataViews[0];
                let imagePatt: RegExp;
                imagePatt = new RegExp('^https?://(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:/[^/#?]+)+\.(?:jpg|gif|png|svg)$');
                let selectedImage: string;
                let validImage: boolean;
                let tooltipSettings: Itooltip;
                tooltipSettings = this.getToolTipSettings(dataView);
                let measureSettings: ImeasureSettings;
                measureSettings = this.getMeasureSettings(dataView);

                this.tooltipText = tooltipSettings.text;
                this.header = tooltipSettings.header;
                if (measureSettings.show) {
                    if (dataViews[0].categorical && dataViews[0].categorical.values && dataViews[0].categorical.values[0]) {
                        this.header = dataViews[0].categorical.values[0].source.displayName;
                        this.tooltipText = dataViews[0].categorical.values[0].values
                            .toString() !== '' ? dataViews[0].categorical.values[0].values.toString() : tooltipSettings.text;
                        let decimalPlaces: number;

                        decimalPlaces = measureSettings.textPrecision;

                        let displayUnits: number;

                        displayUnits = measureSettings.displayUnits;

                        let formatter: utils.formatting.IValueFormatter;
                        if ((String((dataViews[0].categorical.values[0].source.format)) === 'undefined') ||
                         (String((dataViews[0].categorical.values[0].source.format)) === 'dd MMMM yyyy') ) {
                            formatter = valueFormatter.create({
                                format: dataViews[0].categorical.values[0].source.format
                            });
                         } else {
                        formatter = valueFormatter.create({
                            format: dataViews[0].categorical.values[0].source.format,
                            value: displayUnits, precision: decimalPlaces
                        });
                    }
                        let formattedData: string;
                        formattedData = formatter.format(this.tooltipText);
                        this.tooltipText = formattedData;

                    }
                }
                selectedImage = tooltipSettings.imageurl;
                validImage = imagePatt.test(selectedImage);
                this.image = validImage ? img.attr('src', selectedImage) : img.attr('src', textSetting.imageurl);
                let objects: DataViewObjects;
                objects = dataViews[0].metadata.objects;
            }

            if (this.tooltipText !== '') {
                this.tooltipServiceWrapper.addTooltip(this.root,
                                                      (tooltipEvent: TooltipEventArgs<number>) =>
                        this.getTooltipData(this.tooltipText, this.header),
                                                      (tooltipEvent: TooltipEventArgs<number>) => null);
            }
        }

        public getDefaultTextSettings(): Itooltip {
            return {
                text: 'sample',
                header: 'text',
                imageurl: 'https://genericvisual.blob.core.windows.net/images/Tooltip.svg'
            };
        }
        public getToolTipSettings(dataView: DataView): Itooltip {
            let objects: DataViewObjects = null;
            let textSetting: Itooltip;
            textSetting = this.getDefaultTextSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return textSetting;
            }
            objects = dataView.metadata.objects;
            let textProperties: {
                Itooltip: {
                    text: DataViewObjectPropertyIdentifier;
                    header: DataViewObjectPropertyIdentifier;
                    imageurl: DataViewObjectPropertyIdentifier;
                };
                ImeasureSettings: {
                    show: DataViewObjectPropertyIdentifier;
                    textPrecision: DataViewObjectPropertyIdentifier;
                    displayUnits: DataViewObjectPropertyIdentifier;
                };
            };
            textProperties = visualProperties;
            textSetting.text = DataViewObjects.getValue(objects, textProperties.Itooltip.text, textSetting.text);
            textSetting.header = DataViewObjects.getValue(objects, textProperties.Itooltip.header, textSetting.header);
            textSetting.imageurl = DataViewObjects.getValue(objects, textProperties.Itooltip.imageurl, textSetting.imageurl);

            return textSetting;
        }

        public getDefaultMeasureSettings(): ImeasureSettings {
            return {
                show: false,
                textPrecision: 0,
                displayUnits: 0
            };
        }
        public getMeasureSettings(dataView: DataView): ImeasureSettings {
            let objects: DataViewObjects = null;
            let settings: ImeasureSettings;
            settings = this.getDefaultMeasureSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return settings;
            }

            objects = dataView.metadata.objects;
            let properties: {
                Itooltip: {
                    text: DataViewObjectPropertyIdentifier;
                    header: DataViewObjectPropertyIdentifier;
                    imageurl: DataViewObjectPropertyIdentifier;
                };
                ImeasureSettings: {
                    show: DataViewObjectPropertyIdentifier;
                    textPrecision: DataViewObjectPropertyIdentifier;
                    displayUnits: DataViewObjectPropertyIdentifier;
                };
            };
            properties
                = visualProperties;
            settings.show = DataViewObjects.getValue(objects, properties.ImeasureSettings.show, settings.show);
            settings.displayUnits = DataViewObjects.getValue(objects, properties.ImeasureSettings.displayUnits, settings.displayUnits);
            settings.textPrecision = DataViewObjects
                .getValue(objects, properties.ImeasureSettings.textPrecision, settings.textPrecision) > 4 ? 4 : (DataViewObjects
                    .getValue(objects, properties.ImeasureSettings.textPrecision, settings.textPrecision) < 0 ? 0 : (DataViewObjects
                        .getValue(objects, properties.ImeasureSettings.textPrecision, settings.textPrecision)));

            return settings;
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let tooltipSetting: Itooltip;
            tooltipSetting = this.getToolTipSettings(this.dataViews);
            let measuredSettings: ImeasureSettings;
            measuredSettings = this.getMeasureSettings(this.dataViews);
            let objectName: string;
            objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[];
            objectEnumeration = [];

            switch (objectName) {
                case 'tooltip':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Tooltip Settings',
                        properties: {
                            header: tooltipSetting.header,
                            text: tooltipSetting.text,
                            imageurl: tooltipSetting.imageurl
                        },
                        selector: null
                    });
                    break;
                case 'measuretooltip':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Measure Tooltip',
                        selector: null,
                        properties: {
                            show: measuredSettings.show,
                            textPrecision: measuredSettings.textPrecision,
                            displayUnits: measuredSettings.displayUnits
                        }
                    });
                    break;
                default:
                    break;
            }

            return objectEnumeration;
        }

        private getTooltipData(tooltip: string, header: string): VisualTooltipDataItem[] {
            return [{
                displayName: '',
                value: tooltip,
                header: header
            }];
        }

    }
}
