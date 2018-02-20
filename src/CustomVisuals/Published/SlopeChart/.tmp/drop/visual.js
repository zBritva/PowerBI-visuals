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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var utils;
        (function (utils) {
            var dataview;
            (function (dataview) {
                // TODO: refactor & focus DataViewTransform into a service with well-defined dependencies.
                var DataViewTransform;
                (function (DataViewTransform) {
                    // TODO: refactor this, setGrouped, and groupValues to a test helper to stop using it in the product
                    function createValueColumns(values, valueIdentityFields, source) {
                        if (values === void 0) { values = []; }
                        var result = values;
                        setGrouped(result);
                        if (valueIdentityFields) {
                            result.identityFields = valueIdentityFields;
                        }
                        if (source) {
                            result.source = source;
                        }
                        return result;
                    }
                    DataViewTransform.createValueColumns = createValueColumns;
                    function setGrouped(values, groupedResult) {
                        values.grouped = groupedResult
                            ? function () { return groupedResult; }
                            : function () { return groupValues(values); };
                    }
                    DataViewTransform.setGrouped = setGrouped;
                    /** Group together the values with a common identity. */
                    function groupValues(values) {
                        var groups = [], currentGroup;
                        for (var i = 0, len = values.length; i < len; i++) {
                            var value = values[i];
                            if (!currentGroup || currentGroup.identity !== value.identity) {
                                currentGroup = {
                                    values: []
                                };
                                if (value.identity) {
                                    currentGroup.identity = value.identity;
                                    var source = value.source;
                                    // allow null, which will be formatted as (Blank).
                                    if (source.groupName !== undefined) {
                                        currentGroup.name = source.groupName;
                                    }
                                    else if (source.displayName) {
                                        currentGroup.name = source.displayName;
                                    }
                                }
                                groups.push(currentGroup);
                            }
                            currentGroup.values.push(value);
                        }
                        return groups;
                    }
                    DataViewTransform.groupValues = groupValues;
                })(DataViewTransform = dataview.DataViewTransform || (dataview.DataViewTransform = {}));
            })(dataview = utils.dataview || (utils.dataview = {}));
        })(utils = extensibility.utils || (extensibility.utils = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var utils;
        (function (utils) {
            var dataview;
            (function (dataview) {
                var DataRoleHelper;
                (function (DataRoleHelper) {
                    function getMeasureIndexOfRole(grouped, roleName) {
                        if (!grouped || !grouped.length) {
                            return -1;
                        }
                        var firstGroup = grouped[0];
                        if (firstGroup.values && firstGroup.values.length > 0) {
                            for (var i = 0, len = firstGroup.values.length; i < len; ++i) {
                                var value = firstGroup.values[i];
                                if (value && value.source) {
                                    if (hasRole(value.source, roleName)) {
                                        return i;
                                    }
                                }
                            }
                        }
                        return -1;
                    }
                    DataRoleHelper.getMeasureIndexOfRole = getMeasureIndexOfRole;
                    function getCategoryIndexOfRole(categories, roleName) {
                        if (categories && categories.length) {
                            for (var i = 0, ilen = categories.length; i < ilen; i++) {
                                if (hasRole(categories[i].source, roleName)) {
                                    return i;
                                }
                            }
                        }
                        return -1;
                    }
                    DataRoleHelper.getCategoryIndexOfRole = getCategoryIndexOfRole;
                    function hasRole(column, name) {
                        var roles = column.roles;
                        return roles && roles[name];
                    }
                    DataRoleHelper.hasRole = hasRole;
                    function hasRoleInDataView(dataView, name) {
                        return dataView != null
                            && dataView.metadata != null
                            && dataView.metadata.columns
                            && dataView.metadata.columns.some(function (c) { return c.roles && c.roles[name] !== undefined; }); // any is an alias of some
                    }
                    DataRoleHelper.hasRoleInDataView = hasRoleInDataView;
                    function hasRoleInValueColumn(valueColumn, name) {
                        return valueColumn
                            && valueColumn.source
                            && valueColumn.source.roles
                            && (valueColumn.source.roles[name] === true);
                    }
                    DataRoleHelper.hasRoleInValueColumn = hasRoleInValueColumn;
                })(DataRoleHelper = dataview.DataRoleHelper || (dataview.DataRoleHelper = {}));
            })(dataview = utils.dataview || (utils.dataview = {}));
        })(utils = extensibility.utils || (extensibility.utils = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var utils;
        (function (utils) {
            var dataview;
            (function (dataview) {
                var DataViewObject;
                (function (DataViewObject) {
                    function getValue(object, propertyName, defaultValue) {
                        if (!object) {
                            return defaultValue;
                        }
                        var propertyValue = object[propertyName];
                        if (propertyValue === undefined) {
                            return defaultValue;
                        }
                        return propertyValue;
                    }
                    DataViewObject.getValue = getValue;
                    /** Gets the solid color from a fill property using only a propertyName */
                    function getFillColorByPropertyName(object, propertyName, defaultColor) {
                        var value = getValue(object, propertyName);
                        if (!value || !value.solid) {
                            return defaultColor;
                        }
                        return value.solid.color;
                    }
                    DataViewObject.getFillColorByPropertyName = getFillColorByPropertyName;
                })(DataViewObject = dataview.DataViewObject || (dataview.DataViewObject = {}));
            })(dataview = utils.dataview || (utils.dataview = {}));
        })(utils = extensibility.utils || (extensibility.utils = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var utils;
        (function (utils) {
            var dataview;
            (function (dataview) {
                var DataViewObjects;
                (function (DataViewObjects) {
                    /** Gets the value of the given object/property pair. */
                    function getValue(objects, propertyId, defaultValue) {
                        if (!objects) {
                            return defaultValue;
                        }
                        return dataview.DataViewObject.getValue(objects[propertyId.objectName], propertyId.propertyName, defaultValue);
                    }
                    DataViewObjects.getValue = getValue;
                    /** Gets an object from objects. */
                    function getObject(objects, objectName, defaultValue) {
                        if (objects && objects[objectName]) {
                            return objects[objectName];
                        }
                        return defaultValue;
                    }
                    DataViewObjects.getObject = getObject;
                    /** Gets the solid color from a fill property. */
                    function getFillColor(objects, propertyId, defaultColor) {
                        var value = getValue(objects, propertyId);
                        if (!value || !value.solid) {
                            return defaultColor;
                        }
                        return value.solid.color;
                    }
                    DataViewObjects.getFillColor = getFillColor;
                    function getCommonValue(objects, propertyId, defaultValue) {
                        var value = getValue(objects, propertyId, defaultValue);
                        if (value && value.solid) {
                            return value.solid.color;
                        }
                        if (value === undefined
                            || value === null
                            || (typeof value === "object" && !value.solid)) {
                            return defaultValue;
                        }
                        return value;
                    }
                    DataViewObjects.getCommonValue = getCommonValue;
                })(DataViewObjects = dataview.DataViewObjects || (dataview.DataViewObjects = {}));
            })(dataview = utils.dataview || (utils.dataview = {}));
        })(utils = extensibility.utils || (extensibility.utils = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var utils;
        (function (utils) {
            var dataview;
            (function (dataview) {
                // powerbi.extensibility.utils.dataview
                var DataRoleHelper = powerbi.extensibility.utils.dataview.DataRoleHelper;
                var converterHelper;
                (function (converterHelper) {
                    function categoryIsAlsoSeriesRole(dataView, seriesRoleName, categoryRoleName) {
                        if (dataView.categories && dataView.categories.length > 0) {
                            // Need to pivot data if our category soure is a series role
                            var category = dataView.categories[0];
                            return category.source &&
                                DataRoleHelper.hasRole(category.source, seriesRoleName) &&
                                DataRoleHelper.hasRole(category.source, categoryRoleName);
                        }
                        return false;
                    }
                    converterHelper.categoryIsAlsoSeriesRole = categoryIsAlsoSeriesRole;
                    function getSeriesName(source) {
                        return (source.groupName !== undefined)
                            ? source.groupName
                            : source.queryName;
                    }
                    converterHelper.getSeriesName = getSeriesName;
                    function isImageUrlColumn(column) {
                        var misc = getMiscellaneousTypeDescriptor(column);
                        return misc != null && misc.imageUrl === true;
                    }
                    converterHelper.isImageUrlColumn = isImageUrlColumn;
                    function isWebUrlColumn(column) {
                        var misc = getMiscellaneousTypeDescriptor(column);
                        return misc != null && misc.webUrl === true;
                    }
                    converterHelper.isWebUrlColumn = isWebUrlColumn;
                    function getMiscellaneousTypeDescriptor(column) {
                        return column
                            && column.type
                            && column.type.misc;
                    }
                    converterHelper.getMiscellaneousTypeDescriptor = getMiscellaneousTypeDescriptor;
                    function hasImageUrlColumn(dataView) {
                        if (!dataView || !dataView.metadata || !dataView.metadata.columns || !dataView.metadata.columns.length) {
                            return false;
                        }
                        return dataView.metadata.columns.some(function (column) { return isImageUrlColumn(column) === true; });
                    }
                    converterHelper.hasImageUrlColumn = hasImageUrlColumn;
                })(converterHelper = dataview.converterHelper || (dataview.converterHelper = {}));
            })(dataview = utils.dataview || (utils.dataview = {}));
        })(utils = extensibility.utils || (extensibility.utils = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var utils;
        (function (utils) {
            var dataview;
            (function (dataview) {
                var DataViewObjectsParser = (function () {
                    function DataViewObjectsParser() {
                    }
                    DataViewObjectsParser.getDefault = function () {
                        return new this();
                    };
                    DataViewObjectsParser.createPropertyIdentifier = function (objectName, propertyName) {
                        return {
                            objectName: objectName,
                            propertyName: propertyName
                        };
                    };
                    DataViewObjectsParser.parse = function (dataView) {
                        var dataViewObjectParser = this.getDefault(), properties;
                        if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
                            return dataViewObjectParser;
                        }
                        properties = dataViewObjectParser.getProperties();
                        for (var objectName in properties) {
                            for (var propertyName in properties[objectName]) {
                                var defaultValue = dataViewObjectParser[objectName][propertyName];
                                dataViewObjectParser[objectName][propertyName] = dataview.DataViewObjects.getCommonValue(dataView.metadata.objects, properties[objectName][propertyName], defaultValue);
                            }
                        }
                        return dataViewObjectParser;
                    };
                    DataViewObjectsParser.isPropertyEnumerable = function (propertyName) {
                        return !DataViewObjectsParser.InnumerablePropertyPrefix.test(propertyName);
                    };
                    DataViewObjectsParser.enumerateObjectInstances = function (dataViewObjectParser, options) {
                        var dataViewProperties = dataViewObjectParser && dataViewObjectParser[options.objectName];
                        if (!dataViewProperties) {
                            return [];
                        }
                        var instance = {
                            objectName: options.objectName,
                            selector: null,
                            properties: {}
                        };
                        for (var key in dataViewProperties) {
                            if (dataViewProperties.hasOwnProperty(key)) {
                                instance.properties[key] = dataViewProperties[key];
                            }
                        }
                        return {
                            instances: [instance]
                        };
                    };
                    DataViewObjectsParser.prototype.getProperties = function () {
                        var _this = this;
                        var properties = {}, objectNames = Object.keys(this);
                        objectNames.forEach(function (objectName) {
                            if (DataViewObjectsParser.isPropertyEnumerable(objectName)) {
                                var propertyNames = Object.keys(_this[objectName]);
                                properties[objectName] = {};
                                propertyNames.forEach(function (propertyName) {
                                    if (DataViewObjectsParser.isPropertyEnumerable(objectName)) {
                                        properties[objectName][propertyName] =
                                            DataViewObjectsParser.createPropertyIdentifier(objectName, propertyName);
                                    }
                                });
                            }
                        });
                        return properties;
                    };
                    return DataViewObjectsParser;
                }());
                DataViewObjectsParser.InnumerablePropertyPrefix = /^_/;
                dataview.DataViewObjectsParser = DataViewObjectsParser;
            })(dataview = utils.dataview || (utils.dataview = {}));
        })(utils = extensibility.utils || (extensibility.utils = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));

var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var visual;
        (function (visual) {
            var SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798;
            (function (SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798) {
                "use strict";
                var injectorCounter = 0;
                function ResetInjector() {
                    injectorCounter = 0;
                }
                SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.ResetInjector = ResetInjector;
                function injectorReady() {
                    return injectorCounter === 0;
                }
                SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.injectorReady = injectorReady;
                function ParseElement(el, target) {
                    var arr = [];
                    if (!el || !el.hasChildNodes()) {
                        return;
                    }
                    var nodes = el.children;
                    for (var i = 0; i < nodes.length; i++) {
                        var tempNode = void 0;
                        if (nodes.item(i).nodeName.toLowerCase() === "script") {
                            tempNode = createScriptNode(nodes.item(i));
                        }
                        else {
                            tempNode = nodes.item(i).cloneNode(true);
                        }
                        target.appendChild(tempNode);
                        arr.push(tempNode);
                    }
                    return arr;
                }
                SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.ParseElement = ParseElement;
                function createScriptNode(refNode) {
                    var script = document.createElement("script");
                    var attr = refNode.attributes;
                    for (var i = 0; i < attr.length; i++) {
                        script.setAttribute(attr[i].name, attr[i].textContent);
                        if (attr[i].name.toLowerCase() === "src") {
                            // waiting only for src to finish loading - async opetation
                            injectorCounter++;
                            script.onload = function () {
                                injectorCounter--;
                            };
                        }
                    }
                    script.innerHTML = refNode.innerHTML;
                    return script;
                }
                function RunHTMLWidgetRenderer() {
                    // rendering HTML which was created by HTMLWidgets package
                    // wait till all the script elements are loaded
                    var intervalVar = window.setInterval(function () {
                        if (injectorReady()) {
                            window.clearInterval(intervalVar);
                            if (window.hasOwnProperty("HTMLWidgets") && window["HTMLWidgets"].staticRender) {
                                window["HTMLWidgets"].staticRender();
                            }
                        }
                    }, 100);
                }
                SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.RunHTMLWidgetRenderer = RunHTMLWidgetRenderer;
            })(SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798 = visual.SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798 || (visual.SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798 = {}));
        })(visual = extensibility.visual || (extensibility.visual = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var visual;
        (function (visual) {
            var SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798;
            (function (SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798) {
                'use strict';
                var DataViewObjects;
                (function (DataViewObjects) {
                    /** Gets the value of the given object/property pair. */
                    function getValue(objects, propertyId, defaultValue) {
                        if (!objects) {
                            return defaultValue;
                        }
                        var objectOrMap;
                        objectOrMap = objects[propertyId.objectName];
                        var object;
                        object = objectOrMap;
                        return getIndividualDataViewObject.getValue(object, propertyId.propertyName, defaultValue);
                    }
                    DataViewObjects.getValue = getValue;
                    /** Gets an object from objects. */
                    function getObject(objects, propertyName, defaultValue) {
                        if (objects && objects[propertyName]) {
                            var object = void 0;
                            object = objects[propertyName];
                            return object;
                        }
                        else {
                            return defaultValue;
                        }
                    }
                    DataViewObjects.getObject = getObject;
                    /** Gets a map of user-defined objects. */
                    function getUserDefinedObjects(objects, propertyName) {
                        if (objects && objects[propertyName]) {
                            var objectMap = void 0;
                            objectMap = objects[propertyName];
                            return objectMap;
                        }
                    }
                    DataViewObjects.getUserDefinedObjects = getUserDefinedObjects;
                    /** Gets the solid color from a fill property. */
                    function getFillColor(objects, propertyId, defaultColor) {
                        var value;
                        value = getValue(objects, propertyId);
                        if (!value || !value.solid) {
                            return defaultColor;
                        }
                        return value.solid.color;
                    }
                    DataViewObjects.getFillColor = getFillColor;
                })(DataViewObjects = SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects || (SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects = {}));
                var getIndividualDataViewObject;
                (function (getIndividualDataViewObject) {
                    function getValue(object, propertyName, defaultValue) {
                        if (!object) {
                            return defaultValue;
                        }
                        var propertyValue;
                        propertyValue = object[propertyName];
                        if (propertyValue === undefined) {
                            return defaultValue;
                        }
                        return propertyValue;
                    }
                    getIndividualDataViewObject.getValue = getValue;
                    /** Gets the solid color from a fill property using only a propertyName */
                    function getFillColorByPropertyName(objects, propertyName, defaultColor) {
                        var value;
                        value = getIndividualDataViewObject.getValue(objects, propertyName);
                        if (!value || !value.solid) {
                            return defaultColor;
                        }
                        return value.solid.color;
                    }
                    getIndividualDataViewObject.getFillColorByPropertyName = getFillColorByPropertyName;
                })(getIndividualDataViewObject = SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.getIndividualDataViewObject || (SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.getIndividualDataViewObject = {}));
                SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.chartProp = {
                    SlopeColor: {
                        upColor: { objectName: 'SlopeColor', propertyName: 'upColor' },
                        downColor: { objectName: 'SlopeColor', propertyName: 'downColor' },
                        neutralColor: { objectName: 'SlopeColor', propertyName: 'neutralColor' }
                    },
                    YAxis: {
                        yTitle: { objectName: 'yAxis', propertyName: 'yTitle' },
                        yGrid: { objectName: 'yAxis', propertyName: 'yGrid' },
                        yGridCol: { objectName: 'yAxis', propertyName: 'yGridCol' }
                    },
                    Intercept: {
                        intercept1Title: { objectName: 'intercept', propertyName: 'intercept1Title' },
                        intercept2Title: { objectName: 'intercept', propertyName: 'intercept2Title' },
                        intercept1Color: { objectName: 'intercept', propertyName: 'intercept1Color' },
                        intercept2Color: { objectName: 'intercept', propertyName: 'intercept2Color' }
                    }
                };
            })(SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798 = visual.SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798 || (visual.SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798 = {}));
        })(visual = extensibility.visual || (extensibility.visual = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
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
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var visual;
        (function (visual) {
            var SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798;
            (function (SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798) {
                'use strict';
                // in order to improve the performance, one can update the <head> only in the initial rendering.
                // set to 'true' if you are using different packages to create the widgets
                var updateHTMLHead = false;
                var renderVisualUpdateType = [
                    powerbi.VisualUpdateType.Resize,
                    powerbi.VisualUpdateType.ResizeEnd,
                    powerbi.VisualUpdateType.Resize + powerbi.VisualUpdateType.ResizeEnd
                ];
                var SlopeChart = (function () {
                    function SlopeChart(options) {
                        if (options && options.element) {
                            this.rootElement = options.element;
                        }
                        this.headNodes = [];
                        this.bodyNodes = [];
                    }
                    SlopeChart.prototype.update = function (options) {
                        if (!options ||
                            !options.type ||
                            !options.viewport ||
                            !options.dataViews ||
                            options.dataViews.length === 0 ||
                            !options.dataViews[0]) {
                            return;
                        }
                        var dataView = options.dataViews[0];
                        this.slopeColorSettings = this.getSlopeColors(dataView);
                        this.yAxisSettings = this.getyAxis(dataView);
                        this.interceptSettings = this.getintercept(dataView);
                        var payloadBase64 = null;
                        if (dataView.scriptResult && dataView.scriptResult.payloadBase64) {
                            payloadBase64 = dataView.scriptResult.payloadBase64;
                        }
                        if (renderVisualUpdateType.indexOf(options.type) === -1) {
                            if (payloadBase64) {
                                this.injectCodeFromPayload(payloadBase64);
                            }
                        }
                        else {
                            this.onResizing(options.viewport);
                        }
                    };
                    SlopeChart.prototype.getDefaultSlopeColors = function () {
                        return {
                            upColor: '#00ba38',
                            downColor: '#f8766d',
                            neutralColor: '#F2C80F'
                        };
                    };
                    SlopeChart.prototype.getDefaultyAxis = function () {
                        return {
                            yTitle: '',
                            yGrid: false,
                            yGridCol: 'Grey50'
                        };
                    };
                    SlopeChart.prototype.getDefaultintercept = function () {
                        return {
                            intercept1Color: 'black',
                            intercept1Title: '',
                            intercept2Title: '',
                            intercept2Color: 'black'
                        };
                    };
                    SlopeChart.prototype.getSlopeColors = function (dataView) {
                        var slopeColorSettings = this.getDefaultSlopeColors();
                        var objects = null;
                        if (!dataView.metadata || !dataView.metadata.objects) {
                            return slopeColorSettings;
                        }
                        objects = dataView.metadata.objects;
                        slopeColorSettings.upColor = SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects.getFillColor(objects, SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.chartProp.SlopeColor.upColor, slopeColorSettings.upColor);
                        slopeColorSettings.downColor =
                            SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects.getFillColor(objects, SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.chartProp.SlopeColor.downColor, slopeColorSettings.downColor);
                        slopeColorSettings.neutralColor =
                            SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects.getFillColor(objects, SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.chartProp.SlopeColor.neutralColor, slopeColorSettings.neutralColor);
                        return slopeColorSettings;
                    };
                    SlopeChart.prototype.getyAxis = function (dataView) {
                        var yAxisSettings = this.getDefaultyAxis();
                        var objects = null;
                        if (!dataView.metadata || !dataView.metadata.objects) {
                            return yAxisSettings;
                        }
                        objects = dataView.metadata.objects;
                        yAxisSettings.yTitle = SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects.getValue(objects, SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.chartProp.YAxis.yTitle, yAxisSettings.yTitle);
                        yAxisSettings.yGrid = SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects.getValue(objects, SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.chartProp.YAxis.yGrid, yAxisSettings.yGrid);
                        yAxisSettings.yGridCol = SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects.getValue(objects, SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.chartProp.YAxis.yGridCol, yAxisSettings.yGridCol);
                        return yAxisSettings;
                    };
                    SlopeChart.prototype.getintercept = function (dataView) {
                        var interceptSettings = this.getDefaultintercept();
                        var objects = null;
                        if (!dataView.metadata || !dataView.metadata.objects) {
                            return interceptSettings;
                        }
                        objects = dataView.metadata.objects;
                        interceptSettings.intercept1Color =
                            SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects.getFillColor(objects, SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.chartProp.Intercept.intercept1Color, interceptSettings.intercept1Color);
                        interceptSettings.intercept2Color =
                            SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects.getFillColor(objects, SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.chartProp.Intercept.intercept2Color, interceptSettings.intercept2Color);
                        interceptSettings.intercept1Title =
                            SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects.getValue(objects, SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.chartProp.Intercept.intercept1Title, interceptSettings.intercept1Title);
                        interceptSettings.intercept2Title =
                            SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.DataViewObjects.getValue(objects, SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.chartProp.Intercept.intercept2Title, interceptSettings.intercept2Title);
                        return interceptSettings;
                    };
                    SlopeChart.prototype.onResizing = function (finalViewport) {
                        /* add code to handle resizing of the view port */
                    };
                    SlopeChart.prototype.injectCodeFromPayload = function (payloadBase64) {
                        // inject HTML from payload, created in R
                        // the code is injected to the 'head' and 'body' sections.
                        // if the visual was already rendered, the previous DOM elements are cleared
                        SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.ResetInjector();
                        if (!payloadBase64) {
                            return;
                        }
                        // create 'virtual' HTML, so parsing is easier
                        var el = document.createElement('html');
                        try {
                            el.innerHTML = window.atob(payloadBase64);
                        }
                        catch (err) {
                            return;
                        }
                        // if 'updateHTMLHead == false', then the code updates the header data only on the 1st rendering
                        // this option allows loading and parsing of large and recurring scripts only once.
                        if (updateHTMLHead || this.headNodes.length === 0) {
                            while (this.headNodes.length > 0) {
                                var tempNode = this.headNodes.pop();
                                document.head.removeChild(tempNode);
                            }
                            var headList = el.getElementsByTagName('head');
                            if (headList && headList.length > 0) {
                                var head = headList[0];
                                this.headNodes = SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.ParseElement(head, document.head);
                            }
                        }
                        // update 'body' nodes, under the rootElement
                        while (this.bodyNodes.length > 0) {
                            var tempNode = this.bodyNodes.pop();
                            this.rootElement.removeChild(tempNode);
                        }
                        var bodyList = el.getElementsByTagName('body');
                        if (bodyList && bodyList.length > 0) {
                            var body = bodyList[0];
                            this.bodyNodes = SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.ParseElement(body, this.rootElement);
                        }
                        SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.RunHTMLWidgetRenderer();
                    };
                    /**
                     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
                     * objects and properties you want to expose to the users in the property pane.
                     *
                     */
                    SlopeChart.prototype.enumerateObjectInstances = function (options) {
                        var objectName;
                        objectName = options.objectName;
                        var objectEnum;
                        objectEnum = [];
                        var props;
                        switch (objectName) {
                            case 'SlopeColor':
                                objectEnum.push({
                                    objectName: objectName,
                                    properties: {
                                        upColor: this.slopeColorSettings.upColor,
                                        downColor: this.slopeColorSettings.downColor,
                                        neutralColor: this.slopeColorSettings.neutralColor
                                    },
                                    selector: null
                                });
                                break;
                            case 'yAxis':
                                props = {};
                                props["yTitle"] = this.yAxisSettings.yTitle;
                                props["yGrid"] = this.yAxisSettings.yGrid;
                                if (this.yAxisSettings.yGrid) {
                                    props["yGridCol"] = this.yAxisSettings.yGridCol;
                                }
                                objectEnum.push({
                                    objectName: objectName,
                                    properties: props,
                                    selector: null
                                });
                                break;
                            case 'intercept':
                                objectEnum.push({
                                    objectName: objectName,
                                    properties: {
                                        intercept1Color: this.interceptSettings.intercept1Color,
                                        intercept2Color: this.interceptSettings.intercept2Color,
                                        intercept1Title: this.interceptSettings.intercept1Title,
                                        intercept2Title: this.interceptSettings.intercept2Title
                                    },
                                    selector: null
                                });
                                break;
                            default:
                                break;
                        }
                        return objectEnum;
                    };
                    return SlopeChart;
                }());
                SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.SlopeChart = SlopeChart;
            })(SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798 = visual.SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798 || (visual.SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798 = {}));
        })(visual = extensibility.visual || (extensibility.visual = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var plugins;
        (function (plugins) {
            plugins.SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798_DEBUG = {
                name: 'SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798_DEBUG',
                displayName: 'Slope chart by MAQ Software',
                class: 'SlopeChart',
                version: '3.0.1',
                apiVersion: '1.8.0',
                create: function (options) { return new powerbi.extensibility.visual.SlopeChartRHTMLA849C818E46E4556B53BF9C8E9E82798.SlopeChart(options); },
                custom: true
            };
        })(plugins = visuals.plugins || (visuals.plugins = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
//# sourceMappingURL=visual.js.map