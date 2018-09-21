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

    export module enumSettings {
        export function getDefaultTooltipSettings(): ITooltipSettings {
            return {
                show: false,
                separator: 0
            };
        }

        export function getDefaultAnimationSettings(): IAnimationSettings {
            return {
                show: false,
                speed: 'low'
            };
        }

        export function getDefaultImageSettings(): IImageSettings {
            return {
                show: true
            };
        }

        export function getDefaultRouteSettings(): IRouteSettings {
            return {
                route: 'Dotted',
                show: true,
                internationalRoute: 'Dashed',
                domesticRoute: 'Solid',
                otherRoute: 'Dotted'
            };
        }

        export function getDefaultColorSettings(): IColorSettings {
            return {
                KPIlegend: true,
                gradients: '1',
                circleThresh1: null,
                circleThresh2: null,
                circleThresh3: null,
                circleThresh4: null,
                circleThresh5: null,
                circleThresh6: null,
                pathColor: '#0B6A0B',
                circleColor1: '#C50F1F',
                circleColor2: '#F7630C',
                circleColor3: '#EAA00A',
                circleColor4: '#EABD00',
                circleColor5: '#8CBD18',
                circleColor6: '#13A10E',
                circleColor7: '#0B6A0B'
            };
        }

        export function getDefaultCenterSettings(): ICenterCoords {
            return {
                lat: null,
                lng: null
            };
        }

        export let chartProperties: {
            api: {
                apiKey: DataViewObjectPropertyIdentifier;
            },
            mapTypes: {
                maps: DataViewObjectPropertyIdentifier;
            },
            tooltipSeparator: {
                show: DataViewObjectPropertyIdentifier;
                separator: DataViewObjectPropertyIdentifier;
            },
            animation: {
                show: DataViewObjectPropertyIdentifier;
                speed: DataViewObjectPropertyIdentifier;
            },
            image: {
                show: DataViewObjectPropertyIdentifier;
            },
            routes: {
                route: DataViewObjectPropertyIdentifier;
                show: DataViewObjectPropertyIdentifier;
                internationalRoute: DataViewObjectPropertyIdentifier;
                domesticRoute: DataViewObjectPropertyIdentifier;
                otherRoute: DataViewObjectPropertyIdentifier;
            },
            colors: {
                KPIlegend: DataViewObjectPropertyIdentifier;
                gradients: DataViewObjectPropertyIdentifier;
                circleThresh1: DataViewObjectPropertyIdentifier;
                circleThresh2: DataViewObjectPropertyIdentifier;
                circleThresh3: DataViewObjectPropertyIdentifier;
                circleThresh4: DataViewObjectPropertyIdentifier;
                circleThresh5: DataViewObjectPropertyIdentifier;
                circleThresh6: DataViewObjectPropertyIdentifier;
                pathColor: DataViewObjectPropertyIdentifier;
                circleColor1: DataViewObjectPropertyIdentifier;
                circleColor2: DataViewObjectPropertyIdentifier;
                circleColor3: DataViewObjectPropertyIdentifier;
                circleColor4: DataViewObjectPropertyIdentifier;
                circleColor5: DataViewObjectPropertyIdentifier;
                circleColor6: DataViewObjectPropertyIdentifier;
                circleColor7: DataViewObjectPropertyIdentifier;
            },
            center: {
                lat: DataViewObjectPropertyIdentifier;
                lng: DataViewObjectPropertyIdentifier;
            }
        }  = {
            api: {
                apiKey: <DataViewObjectPropertyIdentifier>{ objectName: 'api', propertyName: 'apiKey' }
            },
            mapTypes: {
                maps: <DataViewObjectPropertyIdentifier>{ objectName: 'mapTypes', propertyName: 'maps' }
            },
            tooltipSeparator : {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'tooltipSeparator', propertyName: 'show' },
                separator: <DataViewObjectPropertyIdentifier>{ objectName: 'tooltipSeparator', propertyName: 'separator' }
            },
            animation: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'animation', propertyName: 'show' },
                speed: <DataViewObjectPropertyIdentifier>{ objectName: 'animation', propertyName: 'speed' }
            },
            image: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'image', propertyName: 'show' }
            },
            routes: {
                route: <DataViewObjectPropertyIdentifier>{ objectName: 'routes', propertyName: 'route' },
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'routes', propertyName: 'show' },
                internationalRoute: <DataViewObjectPropertyIdentifier>{ objectName: 'routes', propertyName: 'internationalRoute' },
                domesticRoute: <DataViewObjectPropertyIdentifier>{ objectName: 'routes', propertyName: 'domesticRoute' },
                otherRoute: <DataViewObjectPropertyIdentifier>{ objectName: 'routes', propertyName: 'otherRoute' }
            },
            colors: {
                KPIlegend: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'KPIlegend' },
                gradients: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'gradients' },
                circleThresh1: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleThresh1' },
                circleThresh2: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleThresh2' },
                circleThresh3: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleThresh3' },
                circleThresh4: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleThresh4' },
                circleThresh5: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleThresh5' },
                circleThresh6: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleThresh6' },
                pathColor: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'pathColor' },
                circleColor1: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleColor1' },
                circleColor2: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleColor2' },
                circleColor3: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleColor3' },
                circleColor4: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleColor4' },
                circleColor5: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleColor5' },
                circleColor6: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleColor6' },
                circleColor7: <DataViewObjectPropertyIdentifier>{ objectName: 'colors', propertyName: 'circleColor7' }
            },
            center: {
                lat: <DataViewObjectPropertyIdentifier>{ objectName: 'center', propertyName: 'lat' },
                lng: <DataViewObjectPropertyIdentifier>{ objectName: 'center', propertyName: 'lng' }
            }
        };

        export function getAPISettings(dataView: DataView): string {
            let objects: DataViewObjects = null;
            let apiSetting: string = null;

            if (!dataView.metadata || !dataView.metadata.objects) { return apiSetting; }

            objects = dataView.metadata.objects;

            apiSetting = DataViewObjects.getValue(objects, chartProperties.api.apiKey, apiSetting);

            return apiSetting;
        }

        export function getMapSettings(dataView: DataView): string {
            let objects: DataViewObjects = null;
            let mapSetting: string = 'basic';

            if (!dataView.metadata || !dataView.metadata.objects) { return mapSetting; }

            objects = dataView.metadata.objects;

            mapSetting = DataViewObjects.getValue(objects, chartProperties.mapTypes.maps, mapSetting);

            return mapSetting;
        }

        export function getTooltipSettings(dataView: DataView): ITooltipSettings {
            let objects: DataViewObjects = null;
            const tooltipSetting: ITooltipSettings = getDefaultTooltipSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return tooltipSetting; }

            objects = dataView.metadata.objects;

            tooltipSetting.show = <boolean>DataViewObjects.getValue(objects, chartProperties.tooltipSeparator.show, tooltipSetting.show);
            tooltipSetting.separator = DataViewObjects.getValue(objects, chartProperties.tooltipSeparator.separator,
                                                                tooltipSetting.separator);
            tooltipSetting.separator = tooltipSetting.show === false ? 0 : tooltipSetting.separator;

            return tooltipSetting;
        }

        export function getAnimationSettings(dataView: DataView): IAnimationSettings {
            let objects: DataViewObjects = null;
            const animationSetting: IAnimationSettings = getDefaultAnimationSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return animationSetting; }

            objects = dataView.metadata.objects;

            animationSetting.show = <boolean>DataViewObjects.getValue(objects, chartProperties.animation.show, animationSetting.show);
            animationSetting.speed = DataViewObjects.getValue(objects, chartProperties.animation.speed, animationSetting.speed);

            return animationSetting;
        }

        export function getImageSettings(dataView: DataView): IImageSettings {
            let objects: DataViewObjects = null;
            const imageSetting: IImageSettings = getDefaultImageSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return imageSetting; }

            objects = dataView.metadata.objects;

            imageSetting.show = <boolean>DataViewObjects.getValue(objects, chartProperties.image.show, imageSetting.show);

            return imageSetting;
        }

        export function getRouteSettings(dataView: DataView): IRouteSettings {
            let objects: DataViewObjects = null;
            const routeSetting: IRouteSettings = getDefaultRouteSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return routeSetting; }

            objects = dataView.metadata.objects;

            routeSetting.route = DataViewObjects.getValue(objects, chartProperties.routes.route, routeSetting.route);
            routeSetting.show = DataViewObjects.getValue(objects, chartProperties.routes.show, routeSetting.show);
            routeSetting.internationalRoute = DataViewObjects.getValue(objects, chartProperties.routes.internationalRoute,
                                                                       routeSetting.internationalRoute);
            routeSetting.domesticRoute = DataViewObjects.getValue(objects, chartProperties.routes.domesticRoute,
                                                                  routeSetting.domesticRoute);
            routeSetting.otherRoute = DataViewObjects.getValue(objects, chartProperties.routes.otherRoute, routeSetting.otherRoute);

            return routeSetting;
        }

        export function getColorSettings(dataView: DataView): IColorSettings {
            let objects: DataViewObjects = null;
            const colorSetting: IColorSettings = getDefaultColorSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return colorSetting; }

            objects = dataView.metadata.objects;

            colorSetting.KPIlegend = DataViewObjects.getValue<boolean>(objects, chartProperties.colors.KPIlegend, colorSetting.KPIlegend);
            colorSetting.gradients = DataViewObjects.getValue(objects, chartProperties.colors.gradients, colorSetting.gradients);
            colorSetting.circleThresh1 = DataViewObjects.getValue<number>(objects, chartProperties.colors.circleThresh1,
                                                                          colorSetting.circleThresh1);
            colorSetting.circleThresh2 = DataViewObjects.getValue<number>(objects, chartProperties.colors.circleThresh2,
                                                                          colorSetting.circleThresh2);
            colorSetting.circleThresh3 = DataViewObjects.getValue<number>(objects, chartProperties.colors.circleThresh3,
                                                                          colorSetting.circleThresh3);
            colorSetting.circleThresh4 = DataViewObjects.getValue<number>(objects, chartProperties.colors.circleThresh4,
                                                                          colorSetting.circleThresh4);
            colorSetting.circleThresh5 = DataViewObjects.getValue<number>(objects, chartProperties.colors.circleThresh5,
                                                                          colorSetting.circleThresh5);
            colorSetting.circleThresh6 = DataViewObjects.getValue<number>(objects, chartProperties.colors.circleThresh6,
                                                                          colorSetting.circleThresh6);
            colorSetting.pathColor = DataViewObjects.getFillColor(objects, chartProperties.colors.pathColor, colorSetting.pathColor);
            colorSetting.circleColor1 = DataViewObjects.getFillColor(objects, chartProperties.colors.circleColor1,
                                                                     colorSetting.circleColor1);
            colorSetting.circleColor2 = DataViewObjects.getFillColor(objects, chartProperties.colors.circleColor2,
                                                                     colorSetting.circleColor2);
            colorSetting.circleColor3 = DataViewObjects.getFillColor(objects, chartProperties.colors.circleColor3,
                                                                     colorSetting.circleColor3);
            colorSetting.circleColor4 = DataViewObjects.getFillColor(objects, chartProperties.colors.circleColor4,
                                                                     colorSetting.circleColor4);
            colorSetting.circleColor5 = DataViewObjects.getFillColor(objects, chartProperties.colors.circleColor5,
                                                                     colorSetting.circleColor5);
            colorSetting.circleColor6 = DataViewObjects.getFillColor(objects, chartProperties.colors.circleColor6,
                                                                     colorSetting.circleColor6);
            colorSetting.circleColor7 = DataViewObjects.getFillColor(objects, chartProperties.colors.circleColor7,
                                                                     colorSetting.circleColor7);
            // checking corner cases for threshold values and allowing clearing threshold fields
            colorSetting.circleThresh2 = colorSetting.circleThresh2 === null ? null :
                                                    colorSetting.circleThresh1 > colorSetting.circleThresh2 ?
                                                    colorSetting.circleThresh1 : colorSetting.circleThresh2;
            colorSetting.circleThresh3 = colorSetting.circleThresh3 === null ? null :
                                                    colorSetting.circleThresh2 > colorSetting.circleThresh3 ?
                                                    colorSetting.circleThresh2 : colorSetting.circleThresh3;
            colorSetting.circleThresh4 = colorSetting.circleThresh4 === null ? null :
                                                    colorSetting.circleThresh3 > colorSetting.circleThresh4 ?
                                                    colorSetting.circleThresh3 : colorSetting.circleThresh4;
            colorSetting.circleThresh5 = colorSetting.circleThresh5 === null ? null :
                                                    colorSetting.circleThresh4 > colorSetting.circleThresh5 ?
                                                    colorSetting.circleThresh4 : colorSetting.circleThresh5;
            colorSetting.circleThresh6 = colorSetting.circleThresh6 === null ? null :
                                                    colorSetting.circleThresh5 > colorSetting.circleThresh6 ?
                                                    colorSetting.circleThresh5 : colorSetting.circleThresh6;

            return colorSetting;
        }

        export function getCenterSettings(dataView: DataView): ICenterCoords {
            let objects: DataViewObjects = null;
            const centerSetting: ICenterCoords = getDefaultCenterSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return centerSetting; }

            objects = dataView.metadata.objects;

            centerSetting.lat = DataViewObjects.getValue<number>(objects, chartProperties.center.lat, centerSetting.lat);
            centerSetting.lng = DataViewObjects.getValue<number>(objects, chartProperties.center.lng, centerSetting.lng);

            // allowing clearing the text and setting allowed values
            centerSetting.lat = centerSetting.lat === null ? null : centerSetting.lat <= -90 || centerSetting.lat >= 90 ?
                                0 : centerSetting.lat;
            centerSetting.lng = centerSetting.lng === null ? null : centerSetting.lng < -180 || centerSetting.lng > 180 ?
                                0 : centerSetting.lng;

            return centerSetting;
        }

        export function enumerateAPISettings(apiSetting: string, instance: VisualObjectInstance[], objectName: string): void {
            const props: {} = {
                apiKey: apiSetting
            };
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateMapSettings(mapSetting: string, instance: VisualObjectInstance[], objectName: string): void {
            const props: {} = {
                maps: mapSetting
            };
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateTooltipSetting(tooltipSetting: ITooltipSettings, instance: VisualObjectInstance[],
                                                objectName: string): void {
            const props: {} = {
                show: tooltipSetting.show
            };
            if (tooltipSetting.show) {
                // tslint:disable-next-line:no-string-literal
                props['separator'] = tooltipSetting.separator;
            }
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateAnimationSetting(animationSetting: IAnimationSettings, instance: VisualObjectInstance[],
                                                  objectName: string): void {
            const props: {} = {
                show: animationSetting.show
            };
            if (animationSetting.show) {
                // tslint:disable-next-line:no-string-literal
                props['speed'] = animationSetting.speed;
            }
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateImageSetting(imageSetting: IImageSettings, instance: VisualObjectInstance[], objectName: string): void {
            const props: {} = {
                show: imageSetting.show
            };
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateRouteSettings(routeSetting: IRouteSettings, instance: VisualObjectInstance[], objectName: string): void {
            let props: {} = {};
            if (!Visual.isType) {
                props = {
                    route: routeSetting.route
                };
            }
            if (Visual.isType) {
                props = {
                    show: routeSetting.show
                };
                if (routeSetting.show) {
                    // tslint:disable-next-line:no-string-literal
                    props['internationalRoute'] = routeSetting.internationalRoute;
                    // tslint:disable-next-line:no-string-literal
                    props['domesticRoute'] = routeSetting.domesticRoute;
                    // tslint:disable-next-line:no-string-literal
                    props['otherRoute'] = routeSetting.otherRoute;
                }
            }
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateColorSetting(colorSetting: IColorSettings, instance: VisualObjectInstance[], objectName: string): void {
            const props: {} = {};
            // tslint:disable-next-line:no-string-literal
            props['KPIlegend'] = colorSetting.KPIlegend;
            // tslint:disable-next-line:no-string-literal
            props['gradients'] = colorSetting.gradients;
            if (Visual.gradients === 1) {
                // tslint:disable-next-line:no-string-literal
                props['pathColor'] = colorSetting.pathColor;
            } else if (Visual.gradients >= 2) {
                // tslint:disable-next-line:no-string-literal
                props['circleColor1'] = colorSetting.circleColor1;
                // tslint:disable-next-line:no-string-literal
                props['circleThresh1'] = colorSetting.circleThresh1;
                // tslint:disable-next-line:no-string-literal
                props['circleColor2'] = colorSetting.circleColor2;
                if (Visual.gradients >= 3) {
                    // tslint:disable-next-line:no-string-literal
                    props['circleThresh2'] = colorSetting.circleThresh2;
                    // tslint:disable-next-line:no-string-literal
                    props['circleColor3'] = colorSetting.circleColor3;
                    if (Visual.gradients >= 4) {
                        // tslint:disable-next-line:no-string-literal
                        props['circleThresh3'] = colorSetting.circleThresh3;
                        // tslint:disable-next-line:no-string-literal
                        props['circleColor4'] = colorSetting.circleColor4;
                        if (Visual.gradients >= 5) {
                            // tslint:disable-next-line:no-string-literal
                            props['circleThresh4'] = colorSetting.circleThresh4;
                            // tslint:disable-next-line:no-string-literal
                            props['circleColor5'] = colorSetting.circleColor5;
                            if (Visual.gradients >= 6) {
                                // tslint:disable-next-line:no-string-literal
                                props['circleThresh5'] = colorSetting.circleThresh5;
                                // tslint:disable-next-line:no-string-literal
                                props['circleColor6'] = colorSetting.circleColor6;
                                if (Visual.gradients === 7) {
                                    // tslint:disable-next-line:no-string-literal
                                    props['circleThresh6'] = colorSetting.circleThresh6;
                                    // tslint:disable-next-line:no-string-literal
                                    props['circleColor7'] = colorSetting.circleColor7;
                                }
                            }
                        }
                    }
                }
            }
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateCenterSettings(centerSetting: ICenterCoords, instance: VisualObjectInstance[], objectName: string): void {
            const props: {} = {
                lat: centerSetting.lat,
                lng: centerSetting.lng
            };
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        /* do not update*/
        export module DataViewObjects {
            /** Gets the value of the given object/property pair. */
            export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

                if (!objects) { return defaultValue; }
                const objectOrMap: DataViewObject = objects[propertyId.objectName];

                const object: DataViewObject = <DataViewObject>objectOrMap;

                return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
            }

            /** Gets an object from objects. */
            export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
                if (objects && objects[objectName]) {
                    const object: DataViewObject = <DataViewObject>objects[objectName];

                    return object;
                } else { return defaultValue; }
            }

            /** Gets a map of user-defined objects. */
            export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
                if (objects && objects[objectName]) {
                    const map: DataViewObjectMap = <DataViewObjectMap>objects[objectName];

                    return map;
                }
            }

            /** Gets the solid color from a fill property. */
            export function getFillColor(
                objects: DataViewObjects,
                propertyId: DataViewObjectPropertyIdentifier,
                defaultColor?: string): string {
                const value: Fill = getValue(objects, propertyId);
                if (!value || !value.solid) { return defaultColor; }

                return value.solid.color;
            }
            /**
             * Gets property value for a particular object.
             *
             * @function
             * @param {DataViewObjects} objects - Map of defined objects.
             * @param {string} objectName       - Name of desired object.
             * @param {string} propertyName     - Name of desired property.
             * @param {T} defaultValue          - Default value of desired property.
             */
            export function getValueOverload<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
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
        }
        export module DataViewObject {
            export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {

                if (!object) { return defaultValue; }

                const propertyValue: T = <T>object[propertyName];
                if (propertyValue === undefined) { return defaultValue; }

                return propertyValue;
            }

            /** Gets the solid color from a fill property using only a propertyName */
            export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
                const value: Fill = DataViewObject.getValue(objects, propertyName);
                if (!value || !value.solid) { return defaultColor; }

                return value.solid.color;
            }
        }
        export function getCategoricalObjectValue<T>(
            category: DataViewCategoryColumn,
            index: number,
            objectName: string,
            propertyName: string,
            defaultValue: T): T {
            const categoryObjects: DataViewObject[] = category.objects;

            if (categoryObjects) {
                const categoryObject: DataViewObject = categoryObjects[index];
                if (categoryObject) {
                    const object: DataViewPropertyValue = categoryObject[objectName];
                    if (object) {
                        const property: T = <T>object[propertyName];
                        if (property !== undefined) {
                            return property;
                        }
                    }
                }
            }

            return defaultValue;
        }
        /* do not update*/
    }
}
