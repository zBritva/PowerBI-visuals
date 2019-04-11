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
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    export class KPITicker implements IVisual {
        // stores the entire data that is selected by the user
        private static oData: DataViewTableRow[];
        // stores the index of data which is to be added next
        private static iCurrentPosition: number = 0;
        // number of KPI that is to be shown at a time. Possible values : 1, 2, 3, 4
        private static iNumberOfKPI: number = 4;
        // stores the dataView of the visual
        private static oDataView: DataView;
        // stores the font size of elements of the visual
        private static iValueFontSize: number;
        private static iNameFontSize: number;
        // stores the font color of elements of the visual
        private static iValueFontColor: string;
        private static iNameFontColor: string;
        // stores the font family of elements of the visual
        private static iNameFontFamily: string;
        private static iValueFontFamily: string;
        // stores the background color of the container
        private static iHorizontalScroll: boolean;
        private static iVerticalScroll: boolean = true;
        private static iHorizontalStack: boolean = true;
        private static iVerticalStack: boolean;
        private static iBackgroundColor: string;
        // stores the value of time for which current data will appear
        private static iDelay: number = 1200;
        // stores the value of time after which next data will appear
        private static iDuration: number = 4000;
        private static iDurationS: number;
        // stores the index of meaure KPI Status
        private static iIndexOfStatus: number;
        // stores the index of category KPI Nane
        private static iIndexOfName: number;
        // stores the index of measure KPI Last Value
        private static iIndexOfLastValue: number;
        // stores the index of measure KPI Current Value
        private static iIndexOfCurrentValue: number;
        // stores the interval value
        private static iInterval: number = -1;
        // stores the timeout value
        private static iTimeout: number = -1;
        // stores the color for positive indicator
        private static iPositiveIndicatorColor: string;
        // stores the color for negative indicator
        private static iNegativeIndicatorColor: string;
        // stores the color for neutral indicator
        private static iNeutralIndicatorColor: string;
        //Give Threshold in terms of percentage
        private static iPositiveThresholdPercentage: number;
        private static iNegativeThresholdPercentage: number;
        //Get Color for  Depending on threshold
        private static iPositiveThresholdIndicatorColor: string;
        private static iNegativeThresholdIndicatorColor: string;
        private static iNeutralThresholdIndicatorColor: string;
        //Incase of Postive or Negative Data Bag
        private static iPositiveThresholdValue: number;
        private static iNegativeThresholdValue: number;
        // stores the flag variable to check if index is exceeding the length of data
        private static bFlag: boolean;
        // stores the index to check if index is exceeding data length
        private static iCheckIndex: number;
        // tells where to continue from in case the index exceeds data length
        private static iFlagIndex: number;
        // stores if change percentage is to be shown or not
        private static iEnableDelta: number;
        // stores the information if the visual is updated or not
        private static iAnimation: number;
        private static bIsUpdated: boolean;
        private static iAnimationStyle: string;
        // stores the dynamic height and width
        private static dynamicWidth: number;
        private static dynamicHeight: number;
        private static iResponsive: boolean;
        // stores the height and width of tiles when resposnive is turned off
        private static iHeightOfTiles: number;
        private static iWidthOfTiles: number;
        // stores the position of text
        private static iNameAlignment: string;
        // stores the limits for height and width in vertical stacking
        private static iMaxDynamicWidthVertical: number = 291;
        private static iMaxDynamicHeightVertical: number = 690;
        private static iMinDynamicWidthVertical: number = 290;
        private static iMinDynamicHeightVertical: number = 320;
        // stores the limits for height and width in horizontal stacking
        private static iMaxDynamicWidthHorizontal: number;
        private static iMaxDynamicHeightHorizontal: number = 80;
        private static iMinDynamicWidthHorizontal: number = 1140;
        private static iMinDynamicHeightHorizontal: number = 80;
        // limits for height and width in vertical stacking
        private static iMaxWidthOfTilesVertical: number = 400;
        private static iMaxHeightOfTilesVertical: number = 120;
        private static iMinWidthOfTilesVertical: number = 260;
        private static iMinHeightOfTilesVertical: number = 80;
        // limits for height and width in horizontal stacking
        private static iMaxWidthOfTilesHorizontal: number = 300;
        private static iMaxHeightOfTilesHorizontal: number = 200;
        private static iMinWidthOfTilesHorizontal: number = 260;
        private static iMinHeightOfTilesHorizontal: number = 80;
        // maintain max/min KPI Count
        private static iMaxKPICount: number = 4;
        private static iMinKPICount: number = 1;
        // stores value to check if animation is On or Off
        private static iShowAnimation: boolean;
        // stores min and max duration for animation
        private static iMinDuration: number = 2;
        private static iMaxDuration: number = 10;
        // stores fade duration
        private static iFadeDuration: number = 2;
        private static iFadeInDuration: number = 1000;
        // stores margins and borders
        private static iMarginForScroll: number = 15;
        private static iMarginForKPIName: number = 11;
        private static iBorderOfContainer: number = 10;
        private static iMarginForCarousel: number = 6;
        private static iMarginForTop: number = 6;
        private static iMarginForLeft: number = 2;
        // stores value to check if carousel is On or Off
        private static iShowCarousel: boolean;
        // stores display units and decimal places
        private static iDisplayUnits: number;
        private static iDecimalPlaces: number;
        private static displayVal: number;
        // stores total no. of tiles
        private static iNoOfTiles: number;
        private static iMaxCurrentValueWidth: number;
        private static iMaxPriceChangeValueWidth: number;
        private static iMaxDeltaWidth: number;

        /*
        * Creates instance of KPIIndicator. This method is only called once.
        * @param {VisualConstructorOptions} options - Contains references to the element that will
        *                                             contain the visual and a reference to the host
        *                                             which contains services.
        *
        */
        constructor(options: VisualConstructorOptions) {
            // this is to make the parent container
            d3.select(options.element).append('div').attr('id', 'wrapper');
            d3.select(options.element).append('div').attr('id', 'scrollArrows');
            d3.select('body').style('overflow', 'auto');

        }
        /*
        * function to updates the state of the visual. Every sequential databinding and resize will call update.
        * @param {VisualUpdateOptions} options - Contains references to the size of the container
        *                                        and the dataView which contains all the data
        *                                        the visual had queried.
        */
        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {

            const kpiName: string = 'kpiName';
            const kpiCurrentValue: string = 'kpiCurrentValue';
            const kpiLastValue: string = 'kpiLastValue';
            const kpiStatus: string = 'kpiStatus';
            const kpiPositiveThresholdValue: string = 'kpiPositiveThresholdValue';
            const kpiNegativeThresholdValue: string = 'kpiNegativeThresholdValue';
            KPITicker.dynamicWidth = options.viewport.width;
            KPITicker.dynamicHeight = options.viewport.height;

            //clear interval and timeout when update is called
            if (KPITicker.iInterval !== -1) {
                window.clearTimeout(KPITicker.iInterval);
            }
            if (KPITicker.iTimeout !== -1) {
                window.clearTimeout(KPITicker.iTimeout);
            }

            // check if basic requirements are satisfied else return
            if (options.dataViews.length === 0 || !options.dataViews[0].categorical ||
                ((!options.dataViews[0].categorical.values))) {
                KPITicker.displayBasicRequirement(1);

                return;
            }
            if ((!options.dataViews[0].categorical.categories)) {
                KPITicker.displayBasicRequirement(4);

                return;
            }
            // initializing KPITicker.iCurrentPosition to zero
            KPITicker.iCurrentPosition = 0;
            // to pass dataView as a parameter when formatting options are choosen
            KPITicker.oDataView = options.dataViews[0];
            let oDataCategorical: DataViewCategorical;
            oDataCategorical = KPITicker.oDataView.categorical;
            let iNumberOfValues: number;
            iNumberOfValues = oDataCategorical.values.length;
            let iNumberOfCategories: number;
            iNumberOfCategories = oDataCategorical.categories.length;
            let iIndex: number = 0;

            // initializing the KPITIcker.iIndexOfName, KPITIcker.iIndexOfStatus,
            //KPITIcker.iIndexOfLastValue,KPITIcker.iIndexOfCurrentValue to -1 so that
            //if they are not selected by user the value corresponding to them is not displayed
            KPITicker.iIndexOfName = -1;
            KPITicker.iIndexOfStatus = -1;
            KPITicker.iIndexOfLastValue = -1;
            KPITicker.iIndexOfCurrentValue = -1;
            KPITicker.iPositiveThresholdValue = -1;
            KPITicker.iNegativeThresholdValue = -1;

            // assigning proper index for category KPI Name
            for (iIndex = 0; iIndex < iNumberOfCategories; iIndex++) {
                if (oDataCategorical.categories[iIndex].source.roles[kpiName]) {
                    KPITicker.iIndexOfName = iIndex;
                    break;
                }
            }
            // assigning proper index for measures
            for (iIndex = 0; iIndex < iNumberOfValues; iIndex++) {
                // assigning index for measure KPI Current Value
                if (oDataCategorical.values[iIndex].source.roles[kpiCurrentValue]) {
                    KPITicker.iIndexOfCurrentValue = iIndex;
                } else if (oDataCategorical.values[iIndex].source.roles[kpiLastValue]) { // assigning index for measure KPI Last Value
                    KPITicker.iIndexOfLastValue = iIndex;
                } else if (oDataCategorical.values[iIndex].source.roles[kpiStatus]) { // assigning index for measure KPI Status
                    KPITicker.iIndexOfStatus = iIndex;
                    // assigning index for measure KPI Positive Threshold
                } else if (oDataCategorical.values[iIndex].source.roles[kpiPositiveThresholdValue]) {
                    KPITicker.iPositiveThresholdValue = iIndex;
                    // assigning index for measure KPI Negative Threshold
                } else if (oDataCategorical.values[iIndex].source.roles[kpiNegativeThresholdValue]) {
                    KPITicker.iNegativeThresholdValue = iIndex;
                }
            }
            // if KPI current value or KPI name is not selected
            if (KPITicker.iIndexOfCurrentValue === -1 || KPITicker.iIndexOfName === -1) {
                KPITicker.displayBasicRequirement(1);

                return;
            }
            //if status, Positive Threshold Data bag and Negative Threshold Data Bag were selected
            if (KPITicker.iIndexOfStatus !== -1 && (KPITicker.iPositiveThresholdValue !== -1 || KPITicker.iNegativeThresholdValue !== -1)) {
                KPITicker.displayBasicRequirement(3);

                return;
            }
            // if status column has values other than -1,0 and 1
            if (KPITicker.iIndexOfStatus !== -1) {
                let oStatusData: PrimitiveValue[];
                oStatusData = KPITicker.oDataView.categorical.values[KPITicker.iIndexOfStatus].values;
                let iLengthOfData: number;
                iLengthOfData = oStatusData.length;
                for (iIndex = 0; iIndex < iLengthOfData; iIndex++) {
                    if (oStatusData[iIndex] === null || !(oStatusData[iIndex] === 1 ||
                        oStatusData[iIndex] === -1 || oStatusData[iIndex] === 0)) {
                        KPITicker.displayBasicRequirement(2);

                        return;
                    }
                }
            }
            // storing all the data in one variable
            const len: number = KPITicker.oDataView.categorical.categories[0].values.length;
            const categoriesLength: number = KPITicker.oDataView.categorical.categories.length;
            const valuesLength: number = KPITicker.oDataView.categorical.values.length;
            const cLength: number = KPITicker.oDataView.metadata.columns.length;
            let iRow: number;
            let iColumn: number;
            let kIterator: number = 0;
            let jIterator: number = 0;
            // tslint:disable-next-line:no-any
            const data: any[] = [];
            for (iRow = 0; iRow < len; iRow++) {
                data[iRow] = [];
                kIterator = 0, jIterator = 0;
                for (iColumn = 0; iColumn < cLength; iColumn++) {
                    if (KPITicker.oDataView.metadata.columns[iColumn].isMeasure === true) {
                        data[iRow][iColumn] = KPITicker.oDataView.categorical.values[kIterator++].values[iRow];
                    } else {
                        data[iRow][iColumn] = KPITicker.oDataView.categorical.categories[jIterator++].values[iRow];
                    }
                }
            }

            KPITicker.oData = data;
            // empty the main div when update is called
            $('#wrapper').empty();
            $('#scrollArrows').empty();

            let iDivStart: number;
            iDivStart = 1;
            // The number of containers. Possible values 1,2,3,4
            KPITicker.iNumberOfKPI = KPITicker.getValue<number>(KPITicker.oDataView, 'configuration', 'numberOfKPI', 4);
            // convert KPI count to integer if it is in decimal
            if (KPITicker.iNumberOfKPI % 1 !== 0) {
                KPITicker.iNumberOfKPI -= KPITicker.iNumberOfKPI % 1;
            }
            if (KPITicker.iNumberOfKPI > KPITicker.iMaxKPICount) {
                KPITicker.iNumberOfKPI = KPITicker.iMaxKPICount;
            } else if (KPITicker.iNumberOfKPI < KPITicker.iMinKPICount) {
                KPITicker.iNumberOfKPI = KPITicker.iMinKPICount;
            }
            if (KPITicker.oData.length < KPITicker.iNumberOfKPI) {
                KPITicker.iNumberOfKPI = KPITicker.oData.length;
            }
            // if KPITicker.iNumberOfKPI is still 0 that means there is no data after filters are applied
            if (KPITicker.iNumberOfKPI === 0) {
                KPITicker.displayBasicRequirement(0);

                return;
            }
            // The font size of containers. We are normalizing it to be 15 at max as height is not changeable
            KPITicker.iNameFontSize = KPITicker.getValue<number>(KPITicker.oDataView, 'name', 'fontSize', 14);
            // Restrict max font size to 14
            if (KPITicker.iNameFontSize > 25) {
                KPITicker.iNameFontSize = 25;
            }
            KPITicker.iValueFontSize = KPITicker.getValue<number>(KPITicker.oDataView, 'value', 'fontSize', 14);
            // Restrict max font size to 14
            if (KPITicker.iValueFontSize > 25) {
                KPITicker.iValueFontSize = 25;
            }

            // Status of show change percentage
            KPITicker.iEnableDelta = KPITicker.getValue<number>(KPITicker.oDataView, 'configuration', 'enableDelta', 0);
            // Carousel feature to be on or off
            KPITicker.iNoOfTiles = KPITicker.oDataView.categorical.categories[0].values.length / KPITicker.iNumberOfKPI;
            if (KPITicker.iNoOfTiles > 1) {
                KPITicker.iShowCarousel = KPITicker.getValue<boolean>(KPITicker.oDataView, 'carousel', 'show', false);
            } else {
                KPITicker.iShowCarousel = false;
            }
            // Animation feature to be on or off
            if (KPITicker.iNoOfTiles > 1) {
                KPITicker.iShowAnimation = KPITicker.getValue<boolean>(KPITicker.oDataView, 'animation', 'show', true);
            } else {
                KPITicker.iShowAnimation = false;
            }

            // Change the scrolling to horizontal
            KPITicker.iHorizontalScroll = KPITicker.getValue<boolean>(KPITicker.oDataView, 'animation', 'horizontalScroll', false);
            if (KPITicker.iHorizontalScroll) {
                KPITicker.iVerticalScroll = false;
            } else {
                KPITicker.iVerticalScroll = true;
            }
            // Change the stacking to vertical
            KPITicker.iVerticalStack = KPITicker.getValue<boolean>(KPITicker.oDataView, 'animation', 'verticalStack', false);
            if (KPITicker.iVerticalStack) {
                KPITicker.iHorizontalStack = false;
            } else {
                KPITicker.iHorizontalStack = true;
            }
            // Display units and decimal places for values
            KPITicker.iDisplayUnits = KPITicker.getValue<number>(KPITicker.oDataView, 'value', 'displayUnits', 0);
            KPITicker.iDecimalPlaces = KPITicker.getValue<number>(KPITicker.oDataView, 'value', 'decimalPlaces', 0);
            // Allowed decimal places from 0 to 4 only
            if (KPITicker.iDecimalPlaces > 4) {
                KPITicker.iDecimalPlaces = 4;
            } else if (KPITicker.iDecimalPlaces < 0) {
                KPITicker.iDecimalPlaces = 0;
            } else {
                // tslint:disable-next-line:no-bitwise
                KPITicker.iDecimalPlaces = ~~KPITicker.iDecimalPlaces;
            }

            // The font color of Name and Value
            KPITicker.iValueFontColor = KPITicker.getFill(KPITicker.oDataView, 'valueFontColor');
            KPITicker.iNameFontColor = KPITicker.getFill(KPITicker.oDataView, 'nameFontColor');

            // The font family of Name and Value
            KPITicker.iNameFontFamily = KPITicker.getValue<string>(KPITicker.oDataView, 'name', 'fontFamily', 'Segoe UI');
            KPITicker.iValueFontFamily = KPITicker.getValue<string>(KPITicker.oDataView, 'value', 'fontFamily', 'Segoe UI');

            // Alignment of text
            KPITicker.iNameAlignment = KPITicker.getValue<string>(KPITicker.oDataView, 'name', 'alignName', 'left');

            // The background color of containers
            KPITicker.iBackgroundColor = KPITicker.getFill(KPITicker.oDataView, 'backgroundColor');

            //Get Threshold Percentage Value
            KPITicker.iPositiveThresholdPercentage = KPITicker.getValue(KPITicker.oDataView, 'threshold', 'PThresholdPercentage', null);
            KPITicker.iNegativeThresholdPercentage = KPITicker.getValue(KPITicker.oDataView, 'threshold', 'NThresholdPercentage', null);
            //Getting Length of Input Threshold Percentage and splitting Dot Seperated string into different index of array
            const pPercentage: string = String(KPITicker.iPositiveThresholdPercentage);
            const pLPercentage: number = pPercentage.length;
            //getting Dot "." Position for the string
            const dotIndex: number = pPercentage.indexOf('.');
            //if value with decimal places were not assigned and if the entered percentage length is greater than 4
            if (dotIndex === -1 && pLPercentage > 4) {
                KPITicker.iPositiveThresholdPercentage = 9999.99;
            } else if (dotIndex !== -1) {
                //if value with decimal places is assigned whatever might be the value entered after dot it trims into 2 Decimal places
                KPITicker.iPositiveThresholdPercentage = KPITicker.iPositiveThresholdPercentage * 100;
                KPITicker.iPositiveThresholdPercentage = KPITicker.iPositiveThresholdPercentage -
                    KPITicker.iPositiveThresholdPercentage % 1;
                KPITicker.iPositiveThresholdPercentage = KPITicker.iPositiveThresholdPercentage / 100;
            } else if (KPITicker.iPositiveThresholdPercentage < 0) {
                KPITicker.iPositiveThresholdPercentage = 0;
            }
            //if value with decimal places were not assigned and if the entered percentage length is greater than 4
            const nPercentage: string = String(KPITicker.iNegativeThresholdPercentage);
            const nLPercentage: number = nPercentage.length;
            //getting Dot "." Position for the string
            const ndotIndex: number = nPercentage.indexOf('.');
            //if value with decimal places were not assigned and if the entered percentage length is greater than 4
            if (ndotIndex === -1 && nLPercentage > 4) {
                KPITicker.iNegativeThresholdPercentage = 9999.99;
            } else if (ndotIndex !== -1) {
                //if value with decimal places is assigned whatever might be the value entered after dot it trims into 2 Decimal places
                KPITicker.iNegativeThresholdPercentage = KPITicker.iNegativeThresholdPercentage * 100;
                KPITicker.iNegativeThresholdPercentage = KPITicker.iNegativeThresholdPercentage -
                    KPITicker.iNegativeThresholdPercentage % 1;
                KPITicker.iNegativeThresholdPercentage = KPITicker.iNegativeThresholdPercentage / 100;
            } else if (KPITicker.iNegativeThresholdPercentage < 0) {
                KPITicker.iNegativeThresholdPercentage = 0;
            }
            // The color of positive indicator
            KPITicker.iPositiveIndicatorColor = KPITicker.getFill(KPITicker.oDataView, 'positiveIndicatorColor');
            // The color of negative indicator
            KPITicker.iNegativeIndicatorColor = KPITicker.getFill(KPITicker.oDataView, 'negativeIndicatorColor');
            // The color of neutral indicator
            KPITicker.iNeutralIndicatorColor = KPITicker.getFill(KPITicker.oDataView, 'neutralIndicatorColor');
            // The color of positive threshold indicator
            KPITicker.iPositiveThresholdIndicatorColor = KPITicker.getFill(KPITicker.oDataView, 'positiveThresholdIndicatorColor');
            // The color of negative threshold indicator
            KPITicker.iNegativeThresholdIndicatorColor = KPITicker.getFill(KPITicker.oDataView, 'negativeThresholdIndicatorColor');
            // The color of neutral threshold indicator
            KPITicker.iNeutralThresholdIndicatorColor = KPITicker.getFill(KPITicker.oDataView, 'neutralThresholdIndicatorColor');
            // Style of Animation
            KPITicker.iAnimationStyle = KPITicker.getValue(KPITicker.oDataView, 'animation', 'animationStyle', 'slideAndWait');
            if (KPITicker.iShowAnimation === false) {
                KPITicker.iHorizontalScroll = false;
                KPITicker.iAnimationStyle = 'noAnimation';
            }

            // On and Off Responsive
            KPITicker.iResponsive = KPITicker.getValue(KPITicker.oDataView, 'responsive', 'makeResponsive', true);

            // When responsive is turned off set minimum/maximum height and width of the tiles
            if (!(KPITicker.iResponsive)) {
                // Width of tiles when responsive is OFF
                KPITicker.iWidthOfTiles = KPITicker.getValue(KPITicker.oDataView, 'responsive', 'widthOfTiles', 290);
                // Height of tiles when responsive is OFF
                KPITicker.iHeightOfTiles = KPITicker.getValue(KPITicker.oDataView, 'responsive', 'heightOfTiles', 80);

                if (KPITicker.iVerticalStack) { // set min/max heigth and width in vertical stacking
                    if (KPITicker.iWidthOfTiles > KPITicker.iMaxWidthOfTilesVertical) {
                        KPITicker.iWidthOfTiles = KPITicker.iMaxWidthOfTilesVertical;
                    } else if (KPITicker.iWidthOfTiles < KPITicker.iMinWidthOfTilesVertical) {
                        KPITicker.iWidthOfTiles = KPITicker.iMinWidthOfTilesVertical;
                    }
                    if (KPITicker.iHeightOfTiles > KPITicker.iMaxHeightOfTilesVertical) {
                        KPITicker.iHeightOfTiles = KPITicker.iMaxHeightOfTilesVertical;
                    } else if (KPITicker.iHeightOfTiles < KPITicker.iMinHeightOfTilesVertical) {
                        KPITicker.iHeightOfTiles = KPITicker.iMinHeightOfTilesVertical;
                    }
                } else { // set min/max heigth and width in horizontal stacking
                    if (KPITicker.iWidthOfTiles > KPITicker.iMaxWidthOfTilesHorizontal) {
                        KPITicker.iWidthOfTiles = KPITicker.iMaxWidthOfTilesHorizontal;
                    } else if (KPITicker.iWidthOfTiles < KPITicker.iMinWidthOfTilesHorizontal) {
                        KPITicker.iWidthOfTiles = KPITicker.iMinWidthOfTilesHorizontal;
                    }
                    if (KPITicker.iHeightOfTiles > KPITicker.iMaxHeightOfTilesHorizontal) {
                        KPITicker.iHeightOfTiles = KPITicker.iMaxHeightOfTilesHorizontal;
                    } else if (KPITicker.iHeightOfTiles < KPITicker.iMinHeightOfTilesHorizontal) {
                        KPITicker.iHeightOfTiles = KPITicker.iMinHeightOfTilesHorizontal;
                    }
                }
            }

            // Set duration according to the format pane
            KPITicker.iDurationS = KPITicker.getValue<number>(KPITicker.oDataView, 'animation', 'duration', 2);
            if (KPITicker.iDurationS < KPITicker.iMinDuration) {
                KPITicker.iDurationS = KPITicker.iMinDuration;
            } else if (KPITicker.iDurationS > KPITicker.iMaxDuration) {
                KPITicker.iDurationS = KPITicker.iMaxDuration;
            }
            // convert duration into milliseconds
            KPITicker.iDuration = KPITicker.iDurationS * 1000;
            // set the value of delay according to the duration of animation in a particukar ratio
            KPITicker.iDelay = 3 * (KPITicker.iDuration / 10);

            if (KPITicker.iAnimationStyle === 'noAnimation') {
                KPITicker.iDelay = 0;
            } else if (KPITicker.iAnimationStyle === 'fade') {
                // set the duration as per the fade animation
                KPITicker.iDuration = (KPITicker.iDurationS + KPITicker.iFadeDuration) * 1000;
            }
            // creating wrapper1 initially to start the visual
            KPITicker.createWrapper(1);
            // change the top of wrapper1 to initially show it on the screen
            // Inline CSS required here
            $('#wrapper1').css({ top: '0px', left: '0px' });
            // change the height/width of wrapper initially
            if (KPITicker.iResponsive) {
                if (KPITicker.iVerticalStack) {
                    $('#wrapper').css({
                        height: `${KPITicker.dynamicHeight - KPITicker.iMarginForScroll - 20}px`,
                        width: `${KPITicker.iMaxDynamicWidthVertical}px`
                    });
                } else {
                    $('#wrapper').css({
                        height: `${KPITicker.iMaxDynamicHeightHorizontal}px`,
                        width: `${KPITicker.dynamicWidth - KPITicker.iMarginForScroll * 2}px`
                    });
                }

            } else {

                if (KPITicker.iVerticalStack) {

                    $('#wrapper').css({
                        height: `${(KPITicker.iHeightOfTiles * KPITicker.iNumberOfKPI)}px`,
                        width: `${KPITicker.iWidthOfTiles}px`
                    });
                } else {
                    $('#wrapper').css('height', `${KPITicker.iHeightOfTiles}px`)
                        .css('width', `${(KPITicker.iWidthOfTiles * KPITicker.iNumberOfKPI)}px`);
                }
            }
            iDivStart = 1;
            // the visual is updated
            KPITicker.bIsUpdated = true;
            // populating the wrapper1 that was created
            KPITicker.populateWrapper(1, iDivStart);
            // Apply carousel feature if toggle is turned on
            if (KPITicker.iNoOfTiles > 1 && KPITicker.iShowCarousel) {
                if (KPITicker.iHorizontalScroll) { // if horizontal scrolling is on then previous and next arrows should be there
                    // previously scrolled data should be appeared
                    $('<div>').attr('id', 'prev').addClass('slideArrows').appendTo('#scrollArrows')
                        // tslint:disable-next-line:typedef
                        .on('click', function () {
                            // Reset duration and delay to 0 so that there is no animation when clicked on carousel
                            KPITicker.iDuration = 0;
                            KPITicker.iDelay = 0;
                            // subtracting 2 times as addNextdata function is adding numberofKPI in eachcase
                            KPITicker.iCurrentPosition -= (KPITicker.iNumberOfKPI * 2);
                            clearTimeout(KPITicker.iInterval);
                            KPITicker.addNextData();
                        });
                    $('<div>').attr('id', 'next').addClass('slideArrows').appendTo('#scrollArrows')
                        // tslint:disable-next-line:typedef
                        .on('click', function () {
                            // Reset duration and delay to 0 so that there is no animation when clicked on carousel
                            KPITicker.iDuration = 0;
                            KPITicker.iDelay = 0;
                            clearTimeout(KPITicker.iInterval);
                            KPITicker.addNextData();
                        });

                    if (KPITicker.iResponsive) { // if responsive is turned on change the top,left of arrows according to the stacking
                        if (KPITicker.iHorizontalStack) {

                            $('.slideArrows').css({
                                top: `${(KPITicker.iMaxDynamicHeightHorizontal
                                    + KPITicker.iMarginForScroll) / 2}px`
                            });
                            $('#prev').css('margin-top', `${KPITicker.iMarginForTop + KPITicker.iMarginForLeft}px`);
                        } else {

                            $('.slideArrows').css({ top: `${(KPITicker.dynamicHeight / 2) - KPITicker.iMarginForTop}px` });
                            $('#prev').css('margin-top', `${KPITicker.iMarginForTop + KPITicker.iMarginForLeft}px`);
                            $('#next').css('left', `${KPITicker.iMaxDynamicWidthVertical + KPITicker.iMarginForCarousel}px`);
                        }
                    } else {
                        if (KPITicker.iHorizontalStack) {

                            $('.slideArrows').css({ top: `${(KPITicker.iHeightOfTiles / 2) + KPITicker.iMarginForTop}px` });
                            $('#prev').css('margin-top', `${KPITicker.iMarginForTop + KPITicker.iMarginForLeft}px`);
                            $('#next').css('left', `${(KPITicker.iWidthOfTiles * KPITicker.iNumberOfKPI)
                                + KPITicker.iMarginForCarousel}px`);
                        } else {
                            $('.slideArrows').css({
                                top: `${((KPITicker.iHeightOfTiles * KPITicker.iNumberOfKPI) / 2) + KPITicker.iBorderOfContainer}px`
                            });
                            $('#prev').css('margin-top', `${KPITicker.iMarginForTop + KPITicker.iMarginForLeft}px`);
                            $('#next').css('left', `${KPITicker.iWidthOfTiles + KPITicker.iMarginForCarousel}px`);
                        }
                    }
                } else { // if horizontal is off i.e. vertical scrolling is on then top and bottom arrows should be there
                    $('<div>').attr('id', 'top').addClass('slideArrows').appendTo('#scrollArrows')
                        // tslint:disable-next-line:typedef
                        .on('click', function () {
                            // Reset duration and delay to 0 so that there is no animation when clicked on carousel
                            KPITicker.iDuration = 0;
                            KPITicker.iDelay = 0;
                            clearTimeout(KPITicker.iInterval);
                            KPITicker.addNextData();
                        });
                    $('<div>').attr('id', 'bottom').addClass('slideArrows').appendTo('#scrollArrows')
                        // tslint:disable-next-line:typedef
                        .on('click', function () {
                            // Reset duration and delay to 0 so that there is no animation when clicked on carousel
                            KPITicker.iDuration = 0;
                            KPITicker.iDelay = 0;
                            KPITicker.iCurrentPosition -= (KPITicker.iNumberOfKPI * 2);
                            clearTimeout(KPITicker.iInterval);
                            KPITicker.addNextData();
                        });
                    if (KPITicker.iResponsive) {
                        if (KPITicker.iHorizontalStack) {
                            $('.slideArrows').css({ left: `${(KPITicker.dynamicWidth - KPITicker.iBorderOfContainer * 4)}px` });
                        } else {
                            $('.slideArrows').css({ left: `${(KPITicker.iMaxDynamicWidthVertical - KPITicker.iBorderOfContainer)}px` });
                        }
                    } else {
                        if (KPITicker.iHorizontalStack) {
                            $('.slideArrows').css({
                                left: `${((KPITicker.iWidthOfTiles * KPITicker.iNumberOfKPI) - KPITicker.iBorderOfContainer)}px`
                            });
                        } else {
                            $('.slideArrows').css({ left: `${(KPITicker.iWidthOfTiles - KPITicker.iBorderOfContainer)}px` });
                        }
                    }
                }
            }
            // change the value of KPITIcker.iCurrentPosition to number of containers
            KPITicker.iCurrentPosition = KPITicker.iNumberOfKPI;
            // call add next data in fixed timeout only if some slicer is not applied or
            //the number of data is equal to the number of containers.

            if (!(KPITicker.iNumberOfKPI === KPITicker.oData.length) && (KPITicker.iShowAnimation === true)) {
                KPITicker.iInterval = window.setTimeout(KPITicker.addNextData, KPITicker.iDuration);
            }
        }
        /*
        * method to display text if basic requirements are not satisfied
        */
        private static displayBasicRequirement(iStatus: number): void {
            $('#wrapper').empty();
            $('#wrapper').css('width', KPITicker.dynamicWidth);
            $('<p>').attr('id', 'textToDisplay').appendTo('#wrapper');
            $('#textToDisplay').css('width', KPITicker.dynamicWidth);
            if (iStatus === 1) {
                document.getElementById('textToDisplay').textContent = `Please select 'KPI current value' `;
            } else if (iStatus === 2) { // if appropriate column for status is not selected
                document.getElementById('textToDisplay').textContent = `Please select a column with values -1, 0 or 1 for 'KPI status' `;
            } else if (iStatus === 3) { // if status column and any of the positive or negative threshold data bag were selected
                // tslint:disable-next-line:max-line-length
                document.getElementById('textToDisplay').textContent = `Select either 'KPI status' or any of the 'KPI positive' or 'KPI negative' threshold data bag `;
            } else if (iStatus === 4) {
                document.getElementById('textToDisplay').textContent = `Please select 'KPI name' `;
            } else { // after filters are selected there is no data to display
                document.getElementById('textToDisplay').textContent = `No Data to display `;
            }
        }
        /*
        * method to enumerate through the objects defined in the capabilities and adds the properties to the format pane
        * @param {EnumerateVisualObjectInstancesOptions} options - Map of defined objects
        */
        // tslint:disable-next-line:cyclomatic-complexity
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {

            let oObjectName: string;
            oObjectName = options.objectName;
            let oObjectEnumeration: VisualObjectInstance[];
            oObjectEnumeration = [];
            let oDataView: DataView;
            oDataView = KPITicker.oDataView;
            switch (oObjectName) {
                // enumerate containers object from capabilities.json
                case 'carousel':
                    if ((KPITicker.iNoOfTiles) > 1) {
                        let oCarousel: VisualObjectInstance;
                        oCarousel = {
                            objectName: 'carousel',
                            displayName: 'Carousel',
                            selector: null,
                            properties: {
                                show: KPITicker.iShowCarousel
                            }
                        };
                        oObjectEnumeration.push(oCarousel);
                    }
                    break;

                case 'animation':
                    let oAnimation: VisualObjectInstance;
                    oAnimation = {
                        objectName: 'animation',
                        displayName: 'Animation',
                        selector: null,
                        properties: {
                            show: KPITicker.iShowAnimation,
                            duration: KPITicker.iDurationS,
                            horizontalScroll: KPITicker.iHorizontalScroll,
                            verticalStack: KPITicker.iVerticalStack,
                            animationStyle: KPITicker.iAnimationStyle
                        }
                    };
                    oObjectEnumeration.push(oAnimation);
                    break;
                case 'responsive':
                    let oResponsive: VisualObjectInstance;
                    oResponsive = {
                        objectName: 'responsive',
                        displayName: 'Responsive',
                        selector: null,
                        properties: {
                            makeResponsive: KPITicker.iResponsive
                        }
                    };
                    if (KPITicker.iResponsive === false) {
                        oResponsive = {
                            objectName: 'responsive',
                            displayName: 'Responsive',
                            selector: null,
                            properties: {
                                makeResponsive: KPITicker.iResponsive,
                                widthOfTiles: KPITicker.iWidthOfTiles,
                                heightOfTiles: KPITicker.iHeightOfTiles
                            }
                        };
                    }
                    oObjectEnumeration.push(oResponsive);
                    break;
                case 'name':
                    let oName: VisualObjectInstance;
                    oName = {
                        objectName: 'name',
                        displayName: 'Name',
                        selector: null,
                        properties: {
                            fontSize: KPITicker.iNameFontSize,
                            nameFontColor: KPITicker.iNameFontColor,
                            fontFamily: KPITicker.iNameFontFamily,
                            alignName: KPITicker.iNameAlignment

                        }
                    };
                    oObjectEnumeration.push(oName);
                    break;
                case 'value':
                    let oValue: VisualObjectInstance;
                    oValue = {
                        objectName: 'value',
                        displayName: 'Value',
                        selector: null,
                        properties: {
                            fontSize: KPITicker.iValueFontSize,
                            valueFontColor: KPITicker.iValueFontColor,
                            fontFamily: KPITicker.iValueFontFamily,
                            displayUnits: KPITicker.iDisplayUnits,
                            decimalPlaces: KPITicker.iDecimalPlaces
                        }
                    };
                    oObjectEnumeration.push(oValue);
                    break;
                case 'configuration':
                    let oConfiguration: VisualObjectInstance;
                    if (KPITicker.iIndexOfLastValue !== -1) {
                        oConfiguration = {
                            objectName: 'configuration',
                            displayName: 'Formatting',
                            selector: null,
                            properties: {
                                numberOfKPI: KPITicker.iNumberOfKPI,
                                enableDelta: KPITicker.iEnableDelta,
                                backgroundColor: KPITicker.iBackgroundColor
                            }
                        };
                        oObjectEnumeration.push(oConfiguration);
                    } else {
                        oConfiguration = {
                            objectName: 'configuration',
                            displayName: 'Formatting',
                            selector: null,
                            properties: {
                                numberOfKPI: KPITicker.iNumberOfKPI,
                                backgroundColor: KPITicker.iBackgroundColor
                            }
                        };
                        oObjectEnumeration.push(oConfiguration);
                    }
                    break;
                // enumerate indicators object from capabilities.json
                case 'indicators':
                    if (KPITicker.iIndexOfStatus !== -1) {
                        let oIndicators: VisualObjectInstance;
                        oIndicators = {
                            objectName: 'indicators',
                            displayName: 'Indicators',
                            selector: null,
                            properties: {
                                positiveIndicatorColor: KPITicker.iPositiveIndicatorColor,
                                negativeIndicatorColor: KPITicker.iNegativeIndicatorColor,
                                neutralIndicatorColor: KPITicker.iNeutralIndicatorColor
                            }
                        };
                        oObjectEnumeration.push(oIndicators);
                    }
                    break;
                // enumerate threshold object from capabilities.json
                case 'threshold':
                    // enumerate threshold positive and negative input fields, if positive and negative threshold data bag were not selected
                    if (KPITicker.iIndexOfLastValue !== -1 && KPITicker.iIndexOfStatus === -1
                        && KPITicker.iPositiveThresholdValue === -1
                        && KPITicker.iNegativeThresholdValue === -1) {
                        let oThreshold: VisualObjectInstance;
                        oThreshold = {
                            objectName: 'threshold',
                            displayName: 'Threshold',
                            selector: null,
                            properties: {
                                positiveThresholdIndicatorColor: KPITicker.iPositiveThresholdIndicatorColor,
                                PThresholdPercentage: KPITicker.iPositiveThresholdPercentage,
                                negativeThresholdIndicatorColor: KPITicker.iNegativeThresholdIndicatorColor,
                                NThresholdPercentage: KPITicker.iNegativeThresholdPercentage,
                                neutralThresholdIndicatorColor: KPITicker.iNeutralThresholdIndicatorColor
                            }
                        };
                        oObjectEnumeration.push(oThreshold);
                    }
                    // enumerate threshold with negative input field, if only positive threshold data bag is selected
                    if (KPITicker.iIndexOfStatus === -1
                        && KPITicker.iPositiveThresholdValue !== -1
                        && KPITicker.iNegativeThresholdValue === -1) {
                        let oThreshold: VisualObjectInstance;
                        oThreshold = {
                            objectName: 'threshold',
                            displayName: 'Threshold',
                            selector: null,
                            properties: {
                                positiveThresholdIndicatorColor: KPITicker.iPositiveThresholdIndicatorColor,
                                negativeThresholdIndicatorColor: KPITicker.iNegativeThresholdIndicatorColor,
                                NThresholdPercentage: KPITicker.iNegativeThresholdPercentage,
                                neutralThresholdIndicatorColor: KPITicker.iNeutralThresholdIndicatorColor
                            }
                        };
                        oObjectEnumeration.push(oThreshold);
                    }
                    // enumerate threshold with positive input field, if only negative threshold data bag is selected
                    if (KPITicker.iIndexOfStatus === -1
                        && KPITicker.iNegativeThresholdValue !== -1
                        && KPITicker.iPositiveThresholdValue === -1) {
                        let oThreshold: VisualObjectInstance;
                        oThreshold = {
                            objectName: 'threshold',
                            displayName: 'Threshold',
                            selector: null,
                            properties: {
                                positiveThresholdIndicatorColor: KPITicker.iPositiveThresholdIndicatorColor,
                                PThresholdPercentage: KPITicker.iPositiveThresholdPercentage,
                                negativeThresholdIndicatorColor: KPITicker.iNegativeThresholdIndicatorColor,
                                neutralThresholdIndicatorColor: KPITicker.iNeutralThresholdIndicatorColor
                            }
                        };
                        oObjectEnumeration.push(oThreshold);
                    }
                    // enumerate threshold with color field, if both positive and negative threshold data bag were selected
                    if (KPITicker.iIndexOfStatus === -1
                        && KPITicker.iPositiveThresholdValue !== -1
                        && KPITicker.iNegativeThresholdValue !== -1) {
                        let oThreshold: VisualObjectInstance;
                        oThreshold = {
                            objectName: 'threshold',
                            displayName: 'Threshold',
                            selector: null,
                            properties: {
                                positiveThresholdIndicatorColor: KPITicker.iPositiveThresholdIndicatorColor,
                                negativeThresholdIndicatorColor: KPITicker.iNegativeThresholdIndicatorColor,
                                neutralThresholdIndicatorColor: KPITicker.iNeutralThresholdIndicatorColor
                            }
                        };
                        oObjectEnumeration.push(oThreshold);
                    }
                    break;
                default:
                    break;
            }

            return oObjectEnumeration;
        }
        /*
        * method to get the color of font or background whichever is needed
        * @param {DataView} oDataView - contains the DataView of options
        * @param {string} sKey - name of property whose value is needed
        */
        // tslint:disable-next-line:cyclomatic-complexity
        private static getFill(oDataView: DataView, sKey: string): string {
            const configuration: string = 'configuration';
            const indicators: string = 'indicators';
            const name: string = 'name';
            const value: string = 'value';
            const threshold: string = 'threshold';
            if (oDataView) {
                const oObjects: DataViewObjects = oDataView.metadata.objects;
                if (oObjects) {
                    // return appropriate value as per the formatting options selected
                    const oConfiguration: DataViewObject = oObjects[configuration];
                    if (oConfiguration) {
                        const oFill: Fill = <Fill>oConfiguration[sKey];
                        if (oFill) {
                            return oFill.solid.color;
                        }
                    }
                    const oIndicators: DataViewObject = oObjects[indicators];
                    if (oIndicators) {
                        const oFill: Fill = <Fill>oIndicators[sKey];
                        if (oFill) {
                            return oFill.solid.color;
                        }
                    }
                    // for font color
                    const oName: DataViewObject = oObjects[name];
                    if (oName) {
                        const oFill: Fill = <Fill>oName[sKey];
                        if (oFill) {
                            return oFill.solid.color;
                        }
                    }
                    const oValue: DataViewObject = oObjects[value];
                    if (oValue) {
                        const oFill: Fill = <Fill>oValue[sKey];
                        if (oFill) {
                            return oFill.solid.color;
                        }
                    }
                    const oThreshold: DataViewObject = oObjects[threshold];
                    if (oThreshold) {
                        const oFill: Fill = <Fill>oThreshold[sKey];
                        if (oFill) {
                            return oFill.solid.color;
                        }
                    }
                }
            }
            if ('nameFontColor' === sKey) {
                return '#043c74';
            } else if ('valueFontColor' === sKey) {
                return '#043c74';
            } else if ('backgroundColor' === sKey) {
                return '#efefef';
            } else if ('positiveIndicatorColor' === sKey) {
                return '#009900';
            } else if ('negativeIndicatorColor' === sKey) {
                return '#ff0000';
            } else if ('neutralIndicatorColor' === sKey) {
                return '#0000ff';
            } else if ('positiveThresholdIndicatorColor' === sKey) {  //Assigning default color for positive threshold
                return '#009900';
            } else if ('negativeThresholdIndicatorColor' === sKey) {  //Assigning default color for negative threshold
                return '#ff0000';
            } else if ('neutralThresholdIndicatorColor' === sKey) {  //Assigning default color for neutral threshold
                return '#0000ff';
            }
        }
        private static getValue<T>(oDataView: DataView, sProperty: string, sKey: string, defaultValue: T): T {
            if (oDataView) {
                const oObjects: DataViewObjects = oDataView.metadata.objects;
                if (oObjects) {
                    // return appropriate value as per the formatting options selected
                    const oProperties: DataViewObject = oObjects[sProperty];
                    if (oProperties) {
                        const value: T = <T>oProperties[sKey];
                        // only the key corresponding to that object should be updated.
                        if (value === undefined) {
                            return defaultValue;
                        }

                        return value;
                    }
                }
            }

            return defaultValue;
        }
        /*
        * method to decide which class is to be used for what div and append html elements accordingly
        * @param {DataView} oDataView - contains the DataView of options
        * @param {string} sClassNames - class names that are to be applied to the div
        * @param {number} iIndicator - to tell if the value to be displayed is Change Percentage or Change Value
        * @param {number} iIndex - index of the data row whose value is to be populated
        */
        // tslint:disable-next-line:no-any
        // tslint:disable-next-line:cyclomatic-complexity
        private static appendData(oDataView: DataView, sClassNames: string, iIndicator: number, iIndex: number, sDivIdName: string): void {

            // tslint:disable-next-line:no-any
            let sValueDisplayed: any;
            let iCurrentValue: number;
            let iLastValue: number;
            let tStatus: number;
            // this variable stores the percenatge from positive, negative threshold data bag
            let iPThresholdValue: number = 0;
            let iNThresholdValue: number = 0;
            // if iIndicator is 0, the value to be displayed is KPI Change Percentage
            if (iIndicator === 0) {
                // when both current, last data bag were selected and when status, positive, negative threshold data bag were not selected
                if (KPITicker.iIndexOfCurrentValue !== -1
                    && KPITicker.iIndexOfLastValue !== -1
                    && KPITicker.iIndexOfStatus === -1
                    && (this.iPositiveThresholdPercentage !== null
                        || this.iNegativeThresholdPercentage !== null)
                    && KPITicker.iPositiveThresholdValue === -1
                    && KPITicker.iNegativeThresholdValue === -1) {
                    iCurrentValue = <number>oDataView.categorical.values[KPITicker.iIndexOfCurrentValue].values[iIndex];
                    iLastValue = <number>oDataView.categorical.values[KPITicker.iIndexOfLastValue].values[iIndex];
                    // if the last KPI value is 0, then the percentage change should be calculated with denominator as 1
                    const title: string = 'KPI Change Value: '; // difference value of kpi current value and kpi last value
                    // when Negative threshold Input is not given
                    if (this.iNegativeThresholdPercentage === null) {
                        if (iLastValue == null || iCurrentValue == null) {
                            sValueDisplayed = '-';
                            d3.select(sDivIdName).append('div')
                                .classed(sClassNames, true)
                                .attr('title', title + sValueDisplayed)
                                .text(sValueDisplayed);
                        } else {
                            if (iLastValue === 0) {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / 1) * 100).toFixed(2);
                            } else {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / Math.abs(iLastValue)) * 100).toFixed(2);
                            }
                            if (sValueDisplayed === '0.00') { // when svaluedisplayed is equal to zero then neutral sign will applied
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed >= this.iPositiveThresholdPercentage && this.iPositiveThresholdPercentage !== 0) {
                                tStatus = 1;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed > 0 && sValueDisplayed <= this.iPositiveThresholdPercentage) {
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            }
                        }
                    } else if (this.iPositiveThresholdPercentage === null) { // when Positive Threshold input field is null
                        if (iLastValue == null || iCurrentValue == null) {
                            sValueDisplayed = '-';
                            d3.select(sDivIdName).append('div')
                                .classed(sClassNames, true)
                                .attr('title', title + sValueDisplayed)
                                .text(sValueDisplayed);
                        } else {
                            if (iLastValue === 0) {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / 1) * 100).toFixed(2);
                            } else {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / Math.abs(iLastValue)) * 100).toFixed(2);
                            }
                            if (sValueDisplayed === '0.00') { // when svaluedisplayed is equal to zero then neutral sign will applied
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed <= (-this.iNegativeThresholdPercentage) && this.iNegativeThresholdPercentage !== 0) {
                                tStatus = -1;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed < 0 && sValueDisplayed >= (-this.iNegativeThresholdPercentage)) {
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            }
                        }
                    } else { // when both the input fields either null or not null
                        if (iLastValue == null || iCurrentValue == null) {
                            sValueDisplayed = '-';
                            d3.select(sDivIdName).append('div')
                                .classed(sClassNames, true)
                                .attr('title', title + sValueDisplayed)
                                .text(sValueDisplayed);
                        } else {
                            if (iLastValue === 0) {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / 1) * 100).toFixed(2);
                            } else {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / Math.abs(iLastValue)) * 100).toFixed(2);
                            }
                            if (sValueDisplayed === '0.00') { // when svaluedisplayed is equal to zero then neutral sign will applied
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed >= this.iPositiveThresholdPercentage && this.iPositiveThresholdPercentage !== 0) {
                                tStatus = 1;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed <= (-this.iNegativeThresholdPercentage) && this.iNegativeThresholdPercentage !== 0) {
                                tStatus = -1;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else {
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            }
                        }
                    }
                }
                // when both current, last, positive data bag were selected and when status, negative threshold data bag were not selected
                if (KPITicker.iIndexOfCurrentValue !== -1
                    && KPITicker.iIndexOfLastValue !== -1
                    && KPITicker.iIndexOfStatus === -1
                    && KPITicker.iPositiveThresholdValue !== -1
                    && KPITicker.iNegativeThresholdValue === -1) {
                    iCurrentValue = <number>oDataView.categorical.values[KPITicker.iIndexOfCurrentValue].values[iIndex];
                    iLastValue = <number>oDataView.categorical.values[KPITicker.iIndexOfLastValue].values[iIndex];
                    iPThresholdValue = <number>oDataView.categorical.values[KPITicker.iPositiveThresholdValue].values[iIndex];
                    const title: string = 'KPI Change Value: '; // difference value of kpi current value and kpi last value
                    if (this.iNegativeThresholdPercentage !== null) { // Negative threshold value
                        // if the last KPI value is 0, then the percentage change should be calculated with denominator as 1
                        if (iLastValue == null || iCurrentValue == null) {
                            sValueDisplayed = '-';
                            d3.select(sDivIdName).append('div')
                                .classed(sClassNames, true)
                                .attr('title', title + sValueDisplayed)
                                .text(sValueDisplayed);
                        } else {
                            if (iLastValue === 0) {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / 1) * 100).toFixed(2);
                            } else {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / Math.abs(iLastValue)) * 100).toFixed(2);
                            }
                            if (sValueDisplayed === '0.00') { // when svaluedisplayed is equal to zero then neutral sign will applied
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed >= iPThresholdValue && iPThresholdValue !== 0) {
                                tStatus = 1;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed <= (-this.iNegativeThresholdPercentage) && this.iNegativeThresholdPercentage !== 0) {
                                tStatus = -1;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else {
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            }
                        }
                    } else {
                        // if the last KPI value is 0, then the percentage change should be calculated with denominator as 1
                        if (iLastValue == null || iCurrentValue == null) {
                            sValueDisplayed = '-';
                            d3.select(sDivIdName).append('div')
                                .classed(sClassNames, true)
                                .attr('title', title + sValueDisplayed)
                                .text(sValueDisplayed);
                        } else {
                            if (iLastValue === 0) {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / 1) * 100).toFixed(2);
                            } else {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / Math.abs(iLastValue)) * 100).toFixed(2);
                            }
                            if (sValueDisplayed === '0.00') { // when svaluedisplayed is equal to zero then neutral sign will applied
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed >= iPThresholdValue && iPThresholdValue !== 0) {
                                tStatus = 1;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed > 0 && sValueDisplayed <= iPThresholdValue) {
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            }
                        }
                    }
                }
                // when both current, last, negative data bag were selected and when status, positive threshold data bag were not selected
                if (KPITicker.iIndexOfCurrentValue !== -1
                    && KPITicker.iIndexOfLastValue !== -1
                    && KPITicker.iIndexOfStatus === -1
                    && KPITicker.iPositiveThresholdValue === -1
                    && KPITicker.iNegativeThresholdValue !== -1) {
                    iCurrentValue = <number>oDataView.categorical.values[KPITicker.iIndexOfCurrentValue].values[iIndex];
                    iLastValue = <number>oDataView.categorical.values[KPITicker.iIndexOfLastValue].values[iIndex];
                    iNThresholdValue = <number>oDataView.categorical.values[KPITicker.iNegativeThresholdValue].values[iIndex];
                    // if the last KPI value is 0, then the percentage change should be calculated with denominator as 1
                    const title: string = 'KPI Change Value: '; // difference value of kpi current value and kpi last value
                    if (this.iPositiveThresholdPercentage !== null) {
                        if (iLastValue == null || iCurrentValue == null) {
                            sValueDisplayed = '-';
                            d3.select(sDivIdName).append('div')
                                .classed(sClassNames, true)
                                .attr('title', title + sValueDisplayed)
                                .text(sValueDisplayed);
                        } else {
                            if (iLastValue === 0) {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / 1) * 100).toFixed(2);
                            } else {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / Math.abs(iLastValue)) * 100).toFixed(2);
                            }
                            if (sValueDisplayed === '0.00') {   // when svaluedisplayed is equal to zero then neutral sign will applied
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed >= this.iPositiveThresholdPercentage && this.iPositiveThresholdPercentage !== 0) {
                                tStatus = 1;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed <= (-iNThresholdValue) && iNThresholdValue !== 0) {
                                tStatus = -1;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else {
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            }
                        }
                    } else {
                        if (iLastValue == null || iCurrentValue == null) {
                            sValueDisplayed = '-';
                            d3.select(sDivIdName).append('div')
                                .classed(sClassNames, true)
                                .attr('title', title + sValueDisplayed)
                                .text(sValueDisplayed);
                        } else {
                            if (iLastValue === 0) {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / 1) * 100).toFixed(2);
                            } else {
                                sValueDisplayed = (((iCurrentValue - iLastValue) / Math.abs(iLastValue)) * 100).toFixed(2);
                            }
                            if (sValueDisplayed === '0.00') {   // when svaluedisplayed is equal to zero then neutral sign will applied
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed <= (-iNThresholdValue) && iNThresholdValue !== 0) {
                                tStatus = -1;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            } else if (sValueDisplayed < 0 && sValueDisplayed > (-this.iNegativeThresholdPercentage)) {
                                tStatus = 0;
                                KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                            }
                        }
                    }
                }
                //when both current, last, positive, negative threshold data bag were selected and when status data bag were not selected
                if (KPITicker.iIndexOfCurrentValue !== -1
                    && KPITicker.iIndexOfLastValue !== -1
                    && KPITicker.iIndexOfStatus === -1
                    && KPITicker.iPositiveThresholdValue !== -1
                    && KPITicker.iNegativeThresholdValue !== -1) {
                    iCurrentValue = <number>oDataView.categorical.values[KPITicker.iIndexOfCurrentValue].values[iIndex];
                    iLastValue = <number>oDataView.categorical.values[KPITicker.iIndexOfLastValue].values[iIndex];
                    iPThresholdValue = <number>oDataView.categorical.values[KPITicker.iPositiveThresholdValue].values[iIndex];
                    iNThresholdValue = <number>oDataView.categorical.values[KPITicker.iNegativeThresholdValue].values[iIndex];
                    // if the last KPI value is 0, then the percentage change should be calculated with denominator as 1
                    const title: string = 'KPI Change Value: '; // difference value of kpi current value and kpi last value
                    if (iLastValue == null || iCurrentValue == null) {
                        sValueDisplayed = '-';
                        d3.select(sDivIdName).append('div')
                            .classed(sClassNames, true)
                            .attr('title', title + sValueDisplayed)
                            .text(sValueDisplayed);
                    } else {
                        if (iLastValue === 0) {
                            sValueDisplayed = (((iCurrentValue - iLastValue) / 1) * 100).toFixed(2);
                        } else {
                            sValueDisplayed = (((iCurrentValue - iLastValue) / Math.abs(iLastValue)) * 100).toFixed(2);
                        }
                        if (sValueDisplayed === '0.00') { // when svaluedisplayed is equal to zero then neutral sign will applied
                            tStatus = 0;
                            KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                        } else if (sValueDisplayed >= iPThresholdValue && iPThresholdValue !== 0) {
                            tStatus = 1;
                            KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                        } else if (sValueDisplayed <= (-iNThresholdValue) && iNThresholdValue !== 0) {
                            tStatus = -1;
                            KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                        } else {
                            tStatus = 0;
                            KPITicker.ThresholdtliChangeImage(KPITicker.oDataView, tStatus, iIndex, sDivIdName);
                        }
                    }
                }

                // tslint:disable-next-line:triple-equals
                if (KPITicker.iIndexOfCurrentValue !== -1 && KPITicker.iIndexOfLastValue !== -1 && KPITicker.iEnableDelta == 1) {
                    iCurrentValue = <number>oDataView.categorical.values[KPITicker.iIndexOfCurrentValue].values[iIndex];
                    iLastValue = <number>oDataView.categorical.values[KPITicker.iIndexOfLastValue].values[iIndex];
                    // if the last KPI value is 0, then the percentage change should be calculated with denominator as 1
                    const title: string = 'KPI Change Percentage: ';
                    if (iLastValue == null || iCurrentValue == null) {
                        sValueDisplayed = '-';
                        d3.select(sDivIdName).append('div')
                            .classed(sClassNames, true)
                            .attr('title', title + sValueDisplayed)
                            .text(sValueDisplayed);
                    } else {
                        if (iLastValue === 0) {
                            sValueDisplayed = (((iCurrentValue - iLastValue) / 1) * 100).toFixed(2);
                        } else {
                            sValueDisplayed = (((iCurrentValue - iLastValue) / Math.abs(iLastValue)) * 100).toFixed(2);
                        }
                        const openBracket: string = '(';
                        const closeBracket: string = ') ';
                        const percent: string = '%';
                        d3.select(sDivIdName).append('div')
                            .classed(sClassNames, true)
                            .attr('title', title + sValueDisplayed + percent)
                            .text(openBracket + sValueDisplayed + percent + closeBracket);
                    }

                }
                // tslint:disable-next-line:triple-equals
            } else if (iIndicator == 1) {  // if iIndicator is 1, the value to be displayed is KPI Change Value
                // tslint:disable-next-line:triple-equals
                if (KPITicker.iIndexOfLastValue != -1 && KPITicker.iIndexOfCurrentValue != -1) {
                    const title: string = 'KPI Change Value: ';
                    iCurrentValue = <number>oDataView.categorical.values[KPITicker.iIndexOfCurrentValue].values[iIndex];
                    iLastValue = <number>oDataView.categorical.values[KPITicker.iIndexOfLastValue].values[iIndex];
                    if (iCurrentValue == null) {
                        sValueDisplayed = iLastValue;
                    } else if (iLastValue == null) {
                        sValueDisplayed = iCurrentValue;
                    } else {
                        sValueDisplayed = iCurrentValue - iLastValue;
                    }
                    // If display unit is selected as Auto
                    let displayVal: number = 0;
                    // tslint:disable-next-line:no-any
                    let tempdata: any = sValueDisplayed;
                    tempdata = Math.round(tempdata);
                    tempdata = Math.abs(tempdata);
                    const valLen: number = String(tempdata).length;
                    if (KPITicker.iDisplayUnits === 0) {
                        if (valLen > 9) {
                            displayVal = 1e9;
                        } else if (valLen <= 9 && valLen > 6) {
                            displayVal = 1e6;
                        } else if (valLen <= 6 && valLen >= 4) {
                            displayVal = 1e3;
                        } else {
                            displayVal = 10;
                        }
                    }
                    // Apply formatting according to the display unit and decimal places
                    const formatter: IValueFormatter = ValueFormatter.create({
                        format: KPITicker.oDataView.categorical.values[KPITicker.iIndexOfCurrentValue].source.format ?
                            KPITicker.oDataView.categorical.values[KPITicker.iIndexOfCurrentValue].source.format :
                            ValueFormatter.DefaultNumericFormat,
                        value: KPITicker.iDisplayUnits === 0 ? displayVal : KPITicker.iDisplayUnits,
                        precision: KPITicker.iDecimalPlaces
                    });
                    sValueDisplayed = formatter.format(sValueDisplayed);
                    d3.select(sDivIdName).append('div')
                        .classed(sClassNames, true)
                        .attr('title', title + sValueDisplayed)
                        .text(sValueDisplayed);
                }
            }
        }
        /*
        * method to decide what indicator is to be used on the basis of status and display statistics about the kpi
        * @param {DataView} oDataView - DataView of the visual
        * @param {number} iIndex - Index of data to be loaded
        */
        private static tliChangeImage(oDataView: DataView, iIndex: number, sDivIdName: string): void {
            // to store the status of the data that is being populated
            let iTliStatus: number;
            let sKPICurrentValue: string;
            // if KPI Value column is selected populate it
            if (KPITicker.iIndexOfCurrentValue !== -1) {
                sKPICurrentValue = <string>oDataView.categorical.values[KPITicker.iIndexOfCurrentValue].values[iIndex];
                // if display unit for current value is selected as Auto
                if (KPITicker.iDisplayUnits === 0) {
                    KPITicker.displayVal = 0;
                    // tslint:disable-next-line:no-any
                    let tempdata: any = sKPICurrentValue;
                    tempdata = Math.round(tempdata);
                    tempdata = Math.abs(tempdata);
                    const valLen: number = String(tempdata).length;
                    if (valLen > 9) {
                        KPITicker.displayVal = 1e9;
                    } else if (valLen <= 9 && valLen > 6) {
                        KPITicker.displayVal = 1e6;
                    } else if (valLen <= 6 && valLen >= 4) {
                        KPITicker.displayVal = 1e3;
                    } else {
                        KPITicker.displayVal = 10;
                    }
                }

                // Apply formatting according to the display unit and decimal places
                const formatter: IValueFormatter = ValueFormatter.create({
                    format: KPITicker.oDataView.categorical.values[KPITicker.iIndexOfCurrentValue].source.format ?
                        KPITicker.oDataView.categorical.values[KPITicker.iIndexOfCurrentValue].source.format :
                        ValueFormatter.DefaultNumericFormat,
                    value: KPITicker.iDisplayUnits === 0 ? KPITicker.displayVal : KPITicker.iDisplayUnits,
                    precision: KPITicker.iDecimalPlaces
                });
                sKPICurrentValue = formatter.format(sKPICurrentValue);
                const title: string = 'KPI Current Value: ';
                if (sKPICurrentValue == null) {
                    d3.select(sDivIdName)
                        .append('div').classed('tliPrice', true).attr('title', title + sKPICurrentValue).text('-');
                } else {
                    d3.select(sDivIdName)
                        .append('div').classed('tliPrice', true).attr('title', title + sKPICurrentValue).text(sKPICurrentValue);
                }
            }
            // populate the other details on the basis of selection of Status column
            if (KPITicker.iIndexOfStatus !== -1) {
                // storing the value of status of current data to nTliStatus
                iTliStatus = Number(oDataView.categorical.values[KPITicker.iIndexOfStatus].values[iIndex]);
                switch (iTliStatus) {

                    // when nTliStatus is 0 that is no change therefore neutral value
                    case 0:
                        if (KPITicker.iIndexOfCurrentValue !== -1) {
                            d3.select(sDivIdName).append('div').classed('neutral', true).classed('indicator', true)
                                .attr('title', 'Neutral indicator');
                        }
                        KPITicker.appendData(oDataView, `tliChangePriceNeutral tliChangePrice`, 1, iIndex, sDivIdName);
                        KPITicker.appendData(oDataView, `tliChangeNeutral tliChange`, 0, iIndex, sDivIdName);
                        break;
                    // when nTliStatus is 1 that is positive change therefore positive value
                    case 1:
                        if (KPITicker.iIndexOfCurrentValue !== -1) {
                            d3.select(sDivIdName).append('div').classed('arrowUp', true).classed('arrow', true)
                                .attr('title', 'Positive indicator');
                        }
                        KPITicker.appendData(oDataView, `tliChangePricePositive tliChangePrice`, 1, iIndex, sDivIdName);
                        KPITicker.appendData(oDataView, `tliChangePositive tliChange`, 0, iIndex, sDivIdName);
                        break;
                    // when nTliStatus is -1 that is negative change therefore negative value
                    case -1:
                        if (KPITicker.iIndexOfCurrentValue !== -1) {
                            d3.select(sDivIdName).append('div').classed('arrowDown', true).classed('arrow', true)
                                .attr('title', 'Negative indicator');
                        }
                        KPITicker.appendData(oDataView, `tliChangePriceNegative tliChangePrice`, 1, iIndex, sDivIdName);
                        KPITicker.appendData(oDataView, `tliChangeNegative tliChange`, 0, iIndex, sDivIdName);
                        break;
                    default:
                        break;
                }
            } else { // if KPITIcker.iIndexOfStatus is -1
                // to append indicators before kpi change value
                KPITicker.appendData(oDataView, `tliChange`, 0, iIndex, sDivIdName);
                KPITicker.appendData(oDataView, `tliChangePrice`, 1, iIndex, sDivIdName);
            }
        }
        // when status column is not selected depending on the user given threshold percentage this function will be called
        private static ThresholdtliChangeImage(oDataView: DataView, tStatus: number, iIndex: number, sDivIdName: string): void {
            switch (tStatus) {
                // when nTliStatus is 0 that is no change therefore neutral value
                case 0:
                    if (KPITicker.iIndexOfCurrentValue !== -1) {
                        d3.select(sDivIdName).append('div').classed('neutral', true).classed('indicator', true)
                            .attr('title', 'Neutral indicator');
                    }
                    break;
                // when nTliStatus is 1 that is positive change therefore positive value
                case 1:
                    if (KPITicker.iIndexOfCurrentValue !== -1) {
                        d3.select(sDivIdName).append('div').classed('arrowUp', true).classed('arrow', true)
                            .attr('title', 'Positive indicator');
                    }
                    break;
                // when nTliStatus is -1 that is negative change therefore negative value
                case -1:
                    if (KPITicker.iIndexOfCurrentValue !== -1) {
                        d3.select(sDivIdName).append('div').classed('arrowDown', true).classed('arrow', true)
                            .attr('title', 'Negative indicator');
                    }
                    break;
                default:
                    break;
            }
        }

        /*
        * method to load data in the div
        * @param {DataView} oDataView - DataView of the visual
        * @param {number} nDivID - ID of div which is to be loaded
        * @param {number} iIndex - Index of data to be loaded
        */
        private static populateDiv(oDataView: DataView, nDivID: number, iIndex: number): void {
            // storing the div name to be used
            let sDivIdName: string;
            sDivIdName = `#container${nDivID}`;
            const className: string = '.tliName';
            const tliName: string = 'tliName';
            // populate name if KPI Name column is selected

            if (KPITicker.iResponsive) {

                if (KPITicker.iVerticalStack) {
                    if (KPITicker.iIndexOfName !== -1) {
                        d3.select(sDivIdName).append('div').classed('tliName', true)
                            .style({
                                'text-align': KPITicker.iNameAlignment, width: `${KPITicker.iMaxDynamicWidthVertical -
                                    KPITicker.iMarginForKPIName}px`
                            })
                            .classed(tliName + iIndex, true)
                            .style({
                                'text-align': KPITicker.iNameAlignment, width: `${KPITicker.iMaxDynamicWidthVertical -
                                    KPITicker.iMarginForKPIName}px`
                            })
                            .style('height', '35px')
                            .style('padding-top', '6px')
                            .text(<string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex])
                            .attr('title', <string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex]);
                        d3.select(className + iIndex).text(<string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex]);
                    }
                    KPITicker.tliChangeImage(KPITicker.oDataView, iIndex, sDivIdName);
                } else {
                    if (KPITicker.iIndexOfName !== -1) {
                        d3.select(sDivIdName).append('div').classed('tliName', true)
                            .style({
                                width: `${((KPITicker.dynamicWidth - KPITicker.iMarginForScroll * 2) / KPITicker.iNumberOfKPI)
                                    - KPITicker.iMarginForKPIName}px`
                                , 'text-align': KPITicker.iNameAlignment
                            })
                            .classed(tliName + iIndex, true)
                            .style('height', '35px')
                            .style('padding-top', '6px')
                            .style({
                                width: `${((KPITicker.dynamicWidth - KPITicker.iMarginForScroll * 2) / KPITicker.iNumberOfKPI)
                                    - KPITicker.iMarginForKPIName}px`
                                , 'text-align': KPITicker.iNameAlignment
                            })

                            .text(<string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex])
                            .attr('title', <string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex]);
                        d3.select(className + iIndex).text(<string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex]);
                    }
                    KPITicker.tliChangeImage(KPITicker.oDataView, iIndex, sDivIdName);
                }
            } else {
                if (KPITicker.iVerticalStack) {
                    if (KPITicker.iIndexOfName !== -1) {
                        d3.select(sDivIdName).append('div').classed('tliName', true)
                            .style({
                                width: `${(KPITicker.iWidthOfTiles - KPITicker.iMarginForKPIName)}px`,
                                'text-align': KPITicker.iNameAlignment
                            })
                            .classed(tliName + iIndex, true)
                            .style('height', '35px')
                            .style('padding-top', '6px')
                            .style({
                                width: `${(KPITicker.iWidthOfTiles - KPITicker.iMarginForKPIName)}px`,
                                'text-align': KPITicker.iNameAlignment
                            })
                            .text(<string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex])
                            .attr('title', <string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex]);
                        d3.select(className + iIndex).text(<string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex]);
                    }
                    KPITicker.tliChangeImage(KPITicker.oDataView, iIndex, sDivIdName);
                } else {
                    if (KPITicker.iIndexOfName !== -1) {
                        d3.select(sDivIdName).append('div').classed('tliName', true)
                            .style({ width: `${(KPITicker.iWidthOfTiles - KPITicker.iMarginForKPIName)}px` })
                            .style({ 'text-align': KPITicker.iNameAlignment })
                            .style('height', '35px')
                            .style('padding-top', '6px')
                            .classed(tliName + iIndex, true)
                            .style({ width: `${(KPITicker.iWidthOfTiles - KPITicker.iMarginForKPIName)}px` })
                            .text(<string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex])
                            .attr('title', <string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex]);
                        d3.select(className + iIndex).text(<string>oDataView.categorical.categories[KPITicker.iIndexOfName].values[iIndex]);
                    }
                    KPITicker.tliChangeImage(KPITicker.oDataView, iIndex, sDivIdName);
                }
            }
        }

        /*
        * method to create wrapper according to parameter passed.
        * @param {number} iWrapperID  - ID of the wrapper to be created
        */
        private static createWrapper(iWrapperID: number): void {
            let sWrapperName: string;
            sWrapperName = `wrapper${iWrapperID}`;
            let sWrapperDivName: string;
            let sClassOfContainer: string;
            let iStartPoint: number;
            let iEndPoint: number;
            let iIndex: number = 0;
            sClassOfContainer = `kpi${KPITicker.iNumberOfKPI}`;
            // append the wrapper with appropriate id to "wrapper" div and then change
            // its top so that it is below the existing wrapper
            // When responsive is turned on, assign dynamic height and width
            if (KPITicker.iResponsive) {
                if (KPITicker.iAnimationStyle !== 'fade') {
                    if (KPITicker.iVerticalStack) {
                        $('<div>').attr('id', sWrapperName).appendTo('#wrapper')
                            .css({
                                height: KPITicker.dynamicHeight - KPITicker.iMarginForScroll * 2,
                                width: KPITicker.iMaxDynamicWidthVertical
                            });
                        if (KPITicker.iHorizontalScroll) {
                            $(`#${sWrapperName}`).css('left', `${KPITicker.iMaxDynamicWidthVertical}px`);
                        } else {
                            $(`#${sWrapperName}`).css('top', `${KPITicker.dynamicHeight}px`);
                        }
                    } else {
                        $('<div>').attr('id', sWrapperName).appendTo('#wrapper')
                            .css({
                                height: KPITicker.iMinHeightOfTilesHorizontal,
                                width: KPITicker.dynamicWidth - KPITicker.iMarginForScroll * 2
                            });
                        if (KPITicker.iHorizontalScroll) {
                            $(`#${sWrapperName}`).css('left', `${KPITicker.dynamicWidth}px`);
                        } else {
                            $(`#${sWrapperName}`).css('top', `${KPITicker.iMinHeightOfTilesHorizontal}px`);
                        }
                    }
                } else {
                    if (KPITicker.iVerticalStack) {
                        $('<div>').attr('id', sWrapperName).appendTo('#wrapper')
                            .css({ height: KPITicker.dynamicHeight - KPITicker.iMarginForScroll * 2 });
                    } else {
                        $('<div>').attr('id', sWrapperName).appendTo('#wrapper')
                            .css({
                                height: KPITicker.iMinHeightOfTilesHorizontal,
                                width: KPITicker.dynamicWidth - KPITicker.iMarginForScroll * 2
                            });
                    }
                    $(`#${sWrapperName}`).addClass('initialWrapper');
                    $(`#${sWrapperName}`).hide().fadeIn(KPITicker.iFadeInDuration);
                }
            } else { // assign height and width according to the format pane

                if (KPITicker.iAnimationStyle !== 'fade') {
                    if (KPITicker.iVerticalStack) {
                        $('<div>').attr('id', sWrapperName).appendTo('#wrapper')
                            .css({
                                height: (KPITicker.iHeightOfTiles * KPITicker.iNumberOfKPI)
                                , width: KPITicker.iWidthOfTiles
                            });
                        if (KPITicker.iHorizontalScroll) {
                            $(`#${sWrapperName}`)
                                .css('padding-top', '6px')
                                .css('left', `${KPITicker.iWidthOfTiles}px`);
                        } else {
                            $(`#${sWrapperName}`)
                                .css('padding-top', '6px')
                                .css('top', `${KPITicker.iHeightOfTiles * KPITicker.iNumberOfKPI}px`);
                        }
                    } else {

                        $('<div>').attr('id', sWrapperName).appendTo('#wrapper')
                            .css({
                                height: KPITicker.iHeightOfTiles,
                                width: (KPITicker.iWidthOfTiles * KPITicker.iNumberOfKPI) + KPITicker.iBorderOfContainer
                            });
                        if (KPITicker.iHorizontalScroll) {
                            $(`#${sWrapperName}`).css('left', `${KPITicker.iWidthOfTiles * KPITicker.iNumberOfKPI
                                + KPITicker.iBorderOfContainer}px`);
                        } else {
                            $(`#${sWrapperName}`).css('top', `${KPITicker.iHeightOfTiles}px`);
                        }
                    }
                } else {
                    if (KPITicker.iVerticalStack) {
                        $('<div>').attr('id', sWrapperName).css('padding-top', '6px').appendTo('#wrapper')
                            .css({
                                height: (KPITicker.iHeightOfTiles * KPITicker.iNumberOfKPI)
                                , width: KPITicker.iWidthOfTiles
                            });
                    } else {
                        $('<div>').attr('id', sWrapperName).css('padding-top', '6px').appendTo('#wrapper')
                            .css({
                                height: KPITicker.iHeightOfTiles,
                                width: (KPITicker.iWidthOfTiles * KPITicker.iNumberOfKPI) + KPITicker.iBorderOfContainer
                            });
                    }
                    $(`#${sWrapperName}`).addClass('initialWrapper');
                    $(`#${sWrapperName}`).hide().fadeIn(KPITicker.iFadeInDuration);
                }
            }
            if (iWrapperID === 1) {
                iStartPoint = 1;
                iEndPoint = KPITicker.iNumberOfKPI;
            } else if (iWrapperID === 2) {
                iStartPoint = KPITicker.iNumberOfKPI + 1;
                iEndPoint = 2 * KPITicker.iNumberOfKPI;
            }
            // append div to the wrapper just created on the basis of which wrapper id was created and the number of containers
            for (iIndex = iStartPoint; iIndex <= iEndPoint; iIndex++) {

                sWrapperDivName = `container${iIndex}`;
                if (KPITicker.iVerticalStack) {
                    if (KPITicker.iResponsive) {
                        $('<div>').attr('id', sWrapperDivName).appendTo(`#${sWrapperName}`)
                            .css({
                                height: ((KPITicker.dynamicHeight - KPITicker.iMarginForScroll * 2) / KPITicker.iNumberOfKPI),
                                width: KPITicker.iMaxDynamicWidthVertical
                            })
                            .addClass('containers');
                    } else {
                        //
                        $('<div>').attr('id', sWrapperDivName).appendTo(`#${sWrapperName}`)
                            .css({
                                height: (KPITicker.iHeightOfTiles),
                                width: KPITicker.iWidthOfTiles
                            })
                            .addClass('containers');
                    }
                } else {
                    if (KPITicker.iResponsive) {
                        $('<div>').attr('id', sWrapperDivName).appendTo(`#${sWrapperName}`)
                            .css('width', ((KPITicker.dynamicWidth - KPITicker.iMarginForScroll * 2) / KPITicker.iNumberOfKPI) - 1)
                            .addClass('containers');
                    } else {
                        $('<div>').attr('id', sWrapperDivName).appendTo(`#${sWrapperName}`)
                            .css({ width: (KPITicker.iWidthOfTiles), height: KPITicker.iHeightOfTiles })
                            .addClass('containers');
                    }
                }
            }
        }

        /*
        * method to change the css of containers whenever update is called
        * The css is changed according to the formatting options
        * @param {number} cssDivStart - The id of div from which the wrapper starts
        */
        private static changeCSS(iCssDivStart: number): void {
            // change the css according to the number of KPI that are to be displayed at a time
            let iEndPoint: number = 0;
            let iIndex: number = 0;
            let sPriceMarginLeft: string;
            sPriceMarginLeft = '10px';
            // to decide how many div are there to change the css
            if (iCssDivStart === 1) {
                iEndPoint = KPITicker.iNumberOfKPI;
            } else {
                iEndPoint = 2 * KPITicker.iNumberOfKPI;
            }
            // change the values as per the number of containers selected in the format pane
            switch (KPITicker.iNumberOfKPI) {

                case 1:
                    $('.tliName').addClass('tliNameKPIOne');
                    $('.tliPrice').addClass('tliPriceKPIOne');
                    $('.tliChangePrice').addClass('tliChangePriceKPIOne');
                    $('.tliChange').addClass('tliChangeKPIOne');
                    $('.arrow').addClass('indicatorKPIOne');
                    break;
                case 2:
                    $('.tliName').addClass('tliNameKPITwo');
                    $('.arrow').addClass('indicatorKPITwo');
                    break;
                case 3:
                    $('.tliName').addClass('tliNameKPIThree');
                    $('.arrow').addClass('indicatorKPIThree');
                    break;
                default:
                    break;
            }

            // tslint:disable-next-line:triple-equals
            if (KPITicker.iEnableDelta == 1) {
                KPITicker.iMaxCurrentValueWidth = $('.containers').width() / 3.8;
                KPITicker.iMaxPriceChangeValueWidth = $('.containers').width() / 3.8;
                KPITicker.iMaxDeltaWidth = $('.containers').width() / 4.159;
            } else {
                KPITicker.iMaxCurrentValueWidth = $('.containers').width() / 2.6;
                KPITicker.iMaxPriceChangeValueWidth = $('.containers').width() / 2.6;
            }
            // change the background color of the containers on the basis of
            for (iIndex = iCssDivStart; iIndex <= iEndPoint; iIndex++) {
                const sContainerId: string = `#container${iIndex}`;
                $(sContainerId).css('background', <string>KPITicker.iBackgroundColor);
            }
            // change the css on the basis of font size selected in format pane
            $('.tliName').css('font-size', `${KPITicker.iNameFontSize}px`);
            $('.tliPrice').css('font-size', `${KPITicker.iValueFontSize}px`);
            $('.tliPrice').css('max-width', `${KPITicker.iMaxCurrentValueWidth}px`);
            $('.tliChangePrice').css('font-size', `${KPITicker.iValueFontSize}px`);
            $('.tliChangePrice').css('max-width', `${KPITicker.iMaxPriceChangeValueWidth}px`);
            $('.tliChange').css('font-size', `${KPITicker.iValueFontSize}px`);
            // change the css on the basis of font color selected in format pane
            $('.tliName').css('color', <string>KPITicker.iNameFontColor);
            $('.tliPrice').css('color', <string>KPITicker.iValueFontColor);
            // fontfamily
            $('.tliName').css('font-family', <string>KPITicker.iNameFontFamily);
            $('.tliPrice').css('font-family', <string>KPITicker.iValueFontFamily);
            $('.tliChange').css('max-width', `${KPITicker.iMaxDeltaWidth}px`);
            $('.tliChange').css('font-family', <string>KPITicker.iValueFontFamily);
            $('.tliChangePrice').css('font-family', <string>KPITicker.iValueFontFamily);
            // change the color of indicators and the font color as per the selection in format pane if the Status column is selected
            if (KPITicker.iIndexOfStatus !== -1) {
                $('.arrowDown').css('margin-bottom', `${KPITicker.iValueFontSize - 10}px`);
                $('.arrowUp').css('margin-bottom', `${KPITicker.iValueFontSize - 10}px`);
                $('.neutral').css('margin-bottom', `${KPITicker.iValueFontSize - 10}px`);
                $('.arrowDown').css('border-top-color', <string>KPITicker.iNegativeIndicatorColor);
                $('.tliChangeNegative').css('color', <string>KPITicker.iNegativeIndicatorColor);
                $('.tliChangePriceNegative').css('color', <string>KPITicker.iNegativeIndicatorColor);
                $('.neutral').css('background', <string>KPITicker.iNeutralIndicatorColor);
                $('.tliChangeNeutral').css('color', <string>KPITicker.iNeutralIndicatorColor);
                $('.tliChangePriceNeutral').css('color', <string>KPITicker.iNeutralIndicatorColor);
                $('.arrowUp').css('border-bottom-color', <string>KPITicker.iPositiveIndicatorColor);
                $('.tliChangePositive').css('color', <string>KPITicker.iPositiveIndicatorColor);
                $('.tliChangePricePositive').css('color', <string>KPITicker.iPositiveIndicatorColor);
            } else {  // if Status column is not selected then the font color is same as KPI Name and KPI Value
                $('.tliChange').css('color', <string>KPITicker.iValueFontColor);
                $('.tliChangePrice').css('color', <string>KPITicker.iValueFontColor);
            }
            // change the color of threshold indicator as per the selection in format pane if the Status column is not selected
            if (KPITicker.iIndexOfStatus === -1 && KPITicker.iIndexOfCurrentValue !== -1 && KPITicker.iIndexOfLastValue !== -1) {
                $('.arrowDown').css('border-top-color', <string>KPITicker.iNegativeThresholdIndicatorColor);
                $('.tliChangeNegative').css('color', <string>KPITicker.iNegativeThresholdIndicatorColor);
                $('.tliChangePriceNegative').css('color', <string>KPITicker.iNegativeThresholdIndicatorColor);
                $('.neutral').css('background', <string>KPITicker.iNeutralThresholdIndicatorColor);
                $('.tliChangeNeutral').css('color', <string>KPITicker.iNeutralThresholdIndicatorColor);
                $('.tliChangePriceNeutral').css('color', <string>KPITicker.iNeutralThresholdIndicatorColor);
                $('.arrowUp').css('border-bottom-color', <string>KPITicker.iPositiveThresholdIndicatorColor);
                $('.tliChangePositive').css('color', <string>KPITicker.iPositiveThresholdIndicatorColor);
                $('.tliChangePricePositive').css('color', <string>KPITicker.iPositiveThresholdIndicatorColor);
            }

            // if KPI Value is not selected only show other data with appropriate margin
            if (KPITicker.iIndexOfCurrentValue === -1) {
                $('.tliChangePrice').css('margin-left', sPriceMarginLeft);
            }
        }

        /*
        *method to add next data after duration is over
        */
        private static addNextData(): void {
            // Reset currentPosition to 0, if it becomes negative
            if (KPITicker.iCurrentPosition < 0) {
                KPITicker.iCurrentPosition = 0;
            }
            // add next data only if mouse is not on the wrapper
            if (!($('#wrapper').is(':hover'))) {
                // flag to check if the index has exceeded the data length
                KPITicker.bFlag = true;
                KPITicker.bIsUpdated = false;
                let iDivStart: number = 0;
                // to change the iCurrentPosition value
                KPITicker.iCheckIndex = 0;
                // to start with first value when div is empty but data is not available
                KPITicker.iFlagIndex = 0;
                if (KPITicker.iCurrentPosition !== KPITicker.oData.length - 1) {
                    KPITicker.iCurrentPosition = KPITicker.iCurrentPosition % (KPITicker.oData.length - 1);
                }
                // if wrapper1 is present, create wrapper2 and remove wrapper1 after animating it.
                if ($('#wrapper1').length) {
                    KPITicker.createWrapper(2);
                    iDivStart = KPITicker.iNumberOfKPI + 1;
                    KPITicker.populateWrapper(2, iDivStart);
                } else { // if wrapper2 is present, create wrapper1 and remove wrapper2 after animating it.
                    KPITicker.createWrapper(1);
                    iDivStart = 1;
                    KPITicker.populateWrapper(1, iDivStart);
                }
                // check if index has exceeded the length of data and populate accordingly
                if (KPITicker.bFlag) {
                    if (KPITicker.iCheckIndex === (KPITicker.oData.length - 1)) {
                        KPITicker.iCurrentPosition = 0;
                    } else {
                        KPITicker.iCurrentPosition += KPITicker.iNumberOfKPI;
                        if (KPITicker.iCurrentPosition > KPITicker.oData.length - 1) {
                            KPITicker.iCurrentPosition = 0;
                        }
                    }
                } else {
                    KPITicker.iCurrentPosition = KPITicker.iFlagIndex;
                }
            }
            // convert duration into milliseconds
            KPITicker.iDuration = KPITicker.iDurationS * 1000;
            // set the value of delay according to the duration of animation in a particukar ratio

            if ((KPITicker.iAnimationStyle !== 'noAnimation') && (KPITicker.iShowCarousel)) {
                KPITicker.iDelay = 3 * (KPITicker.iDuration / 10);
            }
            if (KPITicker.iShowAnimation === true) {
                KPITicker.iInterval = window.setTimeout(KPITicker.addNextData, KPITicker.iDuration);
            }
        }
        /*
        * method to populate wrapper which was created by addNextData and animate it
        * @param {number} iWrapperID - id of the wrapper that was created
        * @param {number} iDivStart - id of the first div in the wrapper created
        */
        private static populateWrapper(iWrapperID: number, iDivStart: number): void {
            let iIndex: number;
            iIndex = 0;
            KPITicker.iCheckIndex = 0;
            KPITicker.iFlagIndex = 0;
            KPITicker.bFlag = true;
            for (iIndex = KPITicker.iCurrentPosition; iIndex < KPITicker.iCurrentPosition + KPITicker.iNumberOfKPI; iIndex++) {
                KPITicker.iCheckIndex = iIndex;
                if (iIndex <= KPITicker.oData.length - 1) {
                    KPITicker.populateDiv(KPITicker.oDataView, iDivStart, iIndex);
                } else {
                    KPITicker.populateDiv(KPITicker.oDataView, iDivStart, KPITicker.iFlagIndex);
                    KPITicker.iFlagIndex++;
                    KPITicker.bFlag = false;
                }
                iDivStart++;
            }
            // change the css according to the default value or the custom value selected by the user
            KPITicker.changeCSS(iWrapperID);

            // animate the wrappers up only if it is not the first time
            if (!KPITicker.bIsUpdated) {
                if (KPITicker.iShowAnimation === true || KPITicker.iShowCarousel === true) {
                    KPITicker.animateWrapper(iWrapperID);
                }
            }
        }

        /*
        * method to animate wrapper which was created by addNextData
        * @param {number} iWrapperID - id of the wrapper that was created
        */
        private static animateWrapper(iWrapperID: number): void {
            let sWrapperTop: string;
            let sWrapperBottom: string;
            if (iWrapperID === 1) {
                sWrapperTop = '#wrapper2';
                sWrapperBottom = '#wrapper1';
            } else {
                sWrapperTop = '#wrapper1';
                sWrapperBottom = '#wrapper2';
            }
            if (KPITicker.iResponsive) { // if responsive is turned on
                if (KPITicker.iAnimationStyle !== 'fade') { // if animationstyle is not fade
                    if (KPITicker.iVerticalStack) {
                        if (KPITicker.iHorizontalScroll) {
                            $(sWrapperTop).animate({
                                left: `-=${KPITicker.iMaxDynamicWidthVertical}px`
                            },
                                                   KPITicker.iDelay).dequeue();

                            // tslint:disable-next-line:typedef
                            $(sWrapperBottom).animate({
                                left: `-=${KPITicker.iMaxDynamicWidthVertical}px`
                            },
                                // tslint:disable-next-line:typedef
                                                      KPITicker.iDelay, function () {
                                    KPITicker.iTimeout = window.setTimeout(function (): void {
                                        $(sWrapperTop).remove();
                                        clearTimeout(KPITicker.iTimeout);
                                    },                                     KPITicker.iDelay);
                                });
                        } else {
                            $(sWrapperTop).animate({ top: `-=${KPITicker.dynamicHeight}px` }, KPITicker.iDelay).dequeue();

                            // tslint:disable-next-line:typedef
                            $(sWrapperBottom).animate({ top: `-=${KPITicker.dynamicHeight}px` }, KPITicker.iDelay, function () {
                                KPITicker.iTimeout = window.setTimeout(function (): void {
                                    $(sWrapperTop).remove();
                                    clearTimeout(KPITicker.iTimeout);
                                },                                     KPITicker.iDelay);
                            });
                        }
                    } else {
                        if (KPITicker.iHorizontalScroll) {
                            $(sWrapperTop).animate({
                                left: `-=${KPITicker.dynamicWidth}px`
                            },
                                                   KPITicker.iDelay).dequeue();

                            // tslint:disable-next-line:typedef
                            $(sWrapperBottom).animate({
                                left: `-=${KPITicker.dynamicWidth}px`
                            },
                                // tslint:disable-next-line:typedef
                                                      KPITicker.iDelay, function () {
                                    KPITicker.iTimeout = window.setTimeout(function (): void {
                                        $(sWrapperTop).remove();
                                        clearTimeout(KPITicker.iTimeout);
                                    },                                     KPITicker.iDelay);
                                });
                        } else {
                            $(sWrapperTop).animate({ top: `-=${KPITicker.iMinHeightOfTilesHorizontal}px` }, KPITicker.iDelay).dequeue();

                            // tslint:disable-next-line:typedef
                            $(sWrapperBottom).animate({ top: `-=${KPITicker.iMinHeightOfTilesHorizontal}px` }
                                // tslint:disable-next-line:typedef
                                ,                     KPITicker.iDelay, function () {
                                    KPITicker.iTimeout = window.setTimeout(function (): void {
                                        $(sWrapperTop).remove();
                                        clearTimeout(KPITicker.iTimeout);
                                    },                                     KPITicker.iDelay);
                                });
                        }
                    }
                } else { // if animation style is fade
                    KPITicker.iTimeout = setTimeout(function (): void {
                        $(sWrapperTop).remove();
                        clearTimeout(KPITicker.iTimeout);
                    });
                }
            } else { // When responsive is turned OFF
                if (KPITicker.iAnimationStyle !== 'fade') {
                    if (KPITicker.iVerticalStack) {
                        if (KPITicker.iHorizontalScroll) {
                            $(sWrapperTop).animate({
                                left: `-=${KPITicker.iWidthOfTiles}px`
                            },
                                                   KPITicker.iDelay).dequeue();
                            // tslint:disable-next-line:typedef
                            $(sWrapperBottom).animate({
                                left: `-=${KPITicker.iWidthOfTiles}px`
                            },
                                // tslint:disable-next-line:typedef
                                                      KPITicker.iDelay, function () {
                                    KPITicker.iTimeout = window.setTimeout(function (): void {
                                        $(sWrapperTop).remove();
                                        clearTimeout(KPITicker.iTimeout);
                                    },                                     KPITicker.iDelay);
                                });
                        } else {
                            $(sWrapperTop).animate({ top: `-=${KPITicker.iHeightOfTiles * KPITicker.iNumberOfKPI}px` }
                                ,                  KPITicker.iDelay).dequeue();

                            // tslint:disable-next-line:typedef
                            $(sWrapperBottom).animate({ top: `-=${KPITicker.iHeightOfTiles * KPITicker.iNumberOfKPI}px` },
                                // tslint:disable-next-line:typedef
                                                      KPITicker.iDelay, function () {
                                    KPITicker.iTimeout = window.setTimeout(function (): void {
                                        $(sWrapperTop).remove();
                                        clearTimeout(KPITicker.iTimeout);
                                    },                                     KPITicker.iDelay);
                                });
                        }
                    } else {
                        if (KPITicker.iHorizontalScroll) {
                            $(sWrapperTop).animate({
                                left: `-=${(KPITicker.iWidthOfTiles * KPITicker.iNumberOfKPI) + 10}px`
                            },
                                                   KPITicker.iDelay).dequeue();

                            // tslint:disable-next-line:typedef
                            $(sWrapperBottom).animate({
                                left: `-=${(KPITicker.iWidthOfTiles * KPITicker.iNumberOfKPI) + 10}px`
                            },
                                // tslint:disable-next-line:typedef
                                                      KPITicker.iDelay, function () {
                                    KPITicker.iTimeout = window.setTimeout(function (): void {
                                        $(sWrapperTop).remove();
                                        clearTimeout(KPITicker.iTimeout);
                                    },                                     KPITicker.iDelay);
                                });
                        } else {
                            $(sWrapperTop).animate({ top: `-=${KPITicker.iHeightOfTiles}px` }, KPITicker.iDelay).dequeue();

                            // tslint:disable-next-line:typedef
                            $(sWrapperBottom).animate({ top: `-=${KPITicker.iHeightOfTiles}px` }, KPITicker.iDelay, function () {
                                KPITicker.iTimeout = window.setTimeout(function (): void {
                                    $(sWrapperTop).remove();
                                    clearTimeout(KPITicker.iTimeout);
                                },                                     KPITicker.iDelay);
                            });
                        }
                    }
                } else {
                    KPITicker.iTimeout = setTimeout(function (): void {
                        $(sWrapperTop).remove();
                        clearTimeout(KPITicker.iTimeout);
                    });
                }
            }

        }

    }
}
