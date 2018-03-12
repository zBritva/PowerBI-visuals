module powerbi.extensibility.visual {

    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    const legendValues: {} = {};
    const legendValuesTorender: {} = {};
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import legendPosition = powerbi.extensibility.utils.chart.legend.position;
    import legend = powerbi.extensibility.utils.chart.legend;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import legendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    // tslint:disable-next-line:no-any
    let series: any[] = [];
    interface IQuadrantChartViewModel {
        legendData: LegendData;
        dataPoints: IQuadrantChartDataPoint[];
    }

    interface IQuadrantChartDataPoint {
        category: string;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
    }

    // tslint:disable-next-line:no-any
    function findLegend(array: any, n: number, x: any): number {
        let i: number;
        for (i = 0; i < n; i++) {
            if (array[i].name === x) {
                return i;
            }
        }

        return -1;
    }

    // tslint:disable-next-line:no-any
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, context: any): IQuadrantChartViewModel {
        if (!options.dataViews) {
            return;
        }
        if (!options.dataViews[0]) {
            return;
        }
        if (!options.dataViews[0].categorical) {
            return;
        }
        const dataViews: DataView = options.dataViews[0];
        const categorical: DataViewCategorical = options.dataViews[0].categorical;
        // tslint:disable-next-line:no-any
        let category: any;
        if (categorical.categories) {
            category = categorical.categories[0];
        } else {
            category = categorical.values[0];
        }
        const quadrantChartDataPoints: IQuadrantChartDataPoint[] = [];
        const colorPalette: IColorPalette = host.colorPalette;
        const objects: DataView = options.dataViews[0];
        for (let iIterator: number = 0; iIterator < series.length; iIterator++) {
            const defaultColor: Fill = {
                solid: {
                    color: colorPalette.getColor(series[iIterator].name).value
                }
            };
            quadrantChartDataPoints.push({
                category: series[iIterator].name,
                color: getCategoricalObjectValue<Fill>(category, iIterator, 'legendColors', 'legendColor', defaultColor).solid.color,
                selectionId: host.createSelectionIdBuilder().withCategory(category, iIterator).createSelectionId()
            });
        }

        return {
            legendData: context.getLegendData(dataViews, quadrantChartDataPoints, host),
            dataPoints: quadrantChartDataPoints
        };
    }

    export class QuadrantChart implements IVisual {
        // tslint:disable-next-line:no-any
        private bubbleChartWithAxis: any;
        public host: IVisualHost;
        private viewport: IViewport;
        private svg: d3.Selection<SVGElement>;
        // tslint:disable-next-line:no-any
        private settings: any;
        // tslint:disable-next-line:no-any
        public dataView: any;
        private quadrantChartPoints: IQuadrantChartDataPoint[];
        private selectionManager: ISelectionManager;
        // workaround temp variable because the PBI SDK doesn't correctly identify style changes. See getSettings method.
        private prevDataViewObjects: {} = {};
        private legend: ILegend;
        private legendObjectProperties: DataViewObject;
        public groupLegends: d3.Selection<SVGElement>;
        // tslint:disable-next-line:no-any
        private legendData: any;
        private currentViewport: IViewport;
        // tslint:disable-next-line:no-any
        private rootElement: any;
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.rootElement = d3.select(options.element);
            // tslint:disable-next-line:no-any
            const svg: any = this.svg = this.rootElement.append('div').classed('container', true);
            svg.attr('id', 'container');
            const oElement: JQuery = $('div');
            this.legend = createLegend(oElement, false, null, true);
            this.rootElement.select('.legend').style('top', 0);
        }

        // tslint:disable-next-line:no-any
        public getLegendData(dataView: DataView, quadrantChartDataPoints: any, host: IVisualHost): LegendData {
            let sTitle: string = '';
            if (dataView && dataView.categorical && dataView.categorical.categories
                && dataView.categorical.categories[0] && dataView.categorical.categories[0].source) {
                sTitle = dataView.categorical.categories[0].source.displayName;
            }
            const legendData: LegendData = {
                fontSize: 8,
                dataPoints: [],
                title: sTitle
            };
            for (let i: number = 0; i < quadrantChartDataPoints.length; ++i) {
                if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[0]) {
                    legendData.dataPoints.push({
                        label: quadrantChartDataPoints[i].category,
                        color: quadrantChartDataPoints[i].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        selected: false,
                        identity: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], i).createSelectionId()
                    });
                }
                legendValues[i] = quadrantChartDataPoints[i].category;
            }

            return legendData;
        }
        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            this.currentViewport = {
                height: Math.max(0, options.viewport.height),
                width: Math.max(0, options.viewport.width)
            };
            this.rootElement.select('.MAQChartsSvgRoot').remove();
            d3.select('.errorMessage').remove();
            const width: number = options.viewport.width;
            const height: number = options.viewport.height;
            this.svg.attr({
                width: width,
                height: height
            });
            let skipFlag: number = 0;
            // Grab the dataview object
            if (!options.dataViews || 0 === options.dataViews.length || !options.dataViews[0].categorical) {
                return;
            }
            this.dataView = options.dataViews[0];
            // data binding:start
            const assignData: number[] = [-1, -1, -1, -1];
            let iCounter: number;
            let jCounter: number;
            for (iCounter = 0; iCounter < this.dataView.categorical.values.length; iCounter++) {
                if (this.dataView.categorical.values[iCounter].source.roles.xAxis) {
                    assignData[0] = iCounter;
                } else if (this.dataView.categorical.values[iCounter].source.roles.yAxis) {
                    assignData[1] = iCounter;
                } else if (this.dataView.categorical.values[iCounter].source.roles.radialAxis) {
                    assignData[2] = iCounter;
                }
            }
            if (this.dataView.categorical.categories !== undefined) {
                assignData[3] = 0;
            }
            // tslint:disable-next-line:no-any
            const dataViewObject: any = this.dataView.categorical;
            let isLegends: boolean = true;
            let isRadius: boolean = true;
            if (-1 === assignData[0] || -1 === assignData[1]) {
                this.rootElement.select('.legend #legendGroup').selectAll('*').style('visibility', 'hidden');
                $('#container').removeAttr('style');
                d3.select('#container').append('svg').classed('errorMessage', true).attr({ width: width, height: height });
                d3.select('svg')
                    .append('text')
                    .attr({ x: width / 2, y: height / 2, 'font-size': '20px', 'text-anchor': 'middle' })
                    .text('Please select both x-axis and y-axis values');

                return;
            } else {
                this.rootElement.selectAll('.legend #legendGroup').selectAll('*').style('visibility', 'visible');
            }
            let legendNumbers: number = 0;
            // if the whole column is null
            let loopctr1: number = 0;
            let loopctr2: number = 0;
            let iColLength: number;
            iColLength = dataViewObject.values[assignData[0]].values.length;
            while (loopctr1 < iColLength) {
                if (dataViewObject.values[assignData[0]].values[loopctr1] !== null) {
                    break;
                }
                loopctr1++;
            }
            while (loopctr2 < iColLength) {
                if (dataViewObject.values[assignData[0]].values[loopctr2] !== '') {
                    break;
                }
                loopctr2++;
            }
            if (loopctr1 === iColLength || loopctr2 === iColLength) {
                $('#container').removeAttr('style');
                d3.select('#container').append('svg').classed('errorMessage', true).attr({ width: width, height: height });
                d3.select('svg')
                    .append('text')
                    .attr({ x: width / 2, y: height / 2, 'font-size': '20px', 'text-anchor': 'middle' })
                    .text('Only null values present for X axis');

                return;
            }
            let loopctr: number = 0;
            // vacant the visual if x-axis contains negative values.
            loopctr = 0;
            while (loopctr < iColLength && (dataViewObject.values[assignData[0]].values[loopctr] === null
                || dataViewObject.values[assignData[0]].values[loopctr] === ''
                || (typeof (dataViewObject.values[assignData[0]].values[loopctr]) === 'number'
                    && (dataViewObject.values[assignData[0]].values[loopctr] >= 0)))) {
                loopctr++;
            }
            if (loopctr !== iColLength) {
                $('#container').removeAttr('style');
                d3.select('#container').append('svg').classed('errorMessage', true).attr({ width: width, height: height });
                d3.select('svg')
                    .append('text')
                    .attr({ x: width / 2, y: height / 2, 'font-size': '20px', 'text-anchor': 'middle' })
                    .text('Data not supported');

                return;
            }

            // check for all nulls in y-axis
            loopctr1 = 0, loopctr2 = 0;
            iColLength = dataViewObject.values[assignData[1]].values.length;
            while (loopctr1 < iColLength) {
                if (dataViewObject.values[assignData[1]].values[loopctr1] !== null) {
                    break;
                }
                loopctr1++;
            }
            while (loopctr2 < iColLength) {
                if (dataViewObject.values[assignData[1]].values[loopctr2] !== '') {
                    break;
                }
                loopctr2++;
            }
            if (loopctr1 === iColLength || loopctr2 === iColLength) {
                $('#container').removeAttr('style');
                d3.select('#container').append('svg').classed('errorMessage', true).attr({ width: width, height: height });
                d3.select('svg')
                    .append('text')
                    .attr({ x: width / 2, y: height / 2, 'font-size': '20px', 'text-anchor': 'middle' })
                    .text('Only null values present for Y axis');

                return;
            }

            // vacant the visual if y-axis contains negative values.
            loopctr = 0;
            while (loopctr < iColLength && (dataViewObject.values[assignData[1]].values[loopctr] === null
                || dataViewObject.values[assignData[1]].values[loopctr] === ''
                || (typeof (dataViewObject.values[assignData[1]].values[loopctr]) === 'number'
                    && (dataViewObject.values[assignData[1]].values[loopctr] >= 0)))) {
                loopctr++;
            }
            if (loopctr !== iColLength) {
                $('#container').removeAttr('style');
                d3.select('#container').append('svg').classed('errorMessage', true).attr({ width: width, height: height });
                d3.select('svg')
                    .append('text')
                    .attr({ x: width / 2, y: height / 2, 'font-size': '20px', 'text-anchor': 'middle' })
                    .text('Data not supported');

                return;
            }
            if (-1 === assignData[2]) {
                isRadius = false;
            } else {
                // if we have radius axis, check for negative numbers, or all nulls
                // check for all null
                loopctr1 = 0, loopctr2 = 0;
                iColLength = dataViewObject.values[assignData[2]].values.length;
                while (loopctr1 < iColLength) {
                    if (dataViewObject.values[assignData[2]].values[loopctr1] !== null) {
                        break;
                    }
                    loopctr1++;
                }
                while (loopctr2 < iColLength) {
                    if (dataViewObject.values[assignData[2]].values[loopctr2] !== '') {
                        break;
                    }
                    loopctr2++;
                }
                if (loopctr1 === iColLength || loopctr2 === iColLength) {
                    $('#container').removeAttr('style');
                    d3.select('#container').append('svg').classed('errorMessage', true).attr({ width: width, height: height });
                    d3.select('svg')
                        .append('text')
                        .attr({ x: width / 2, y: height / 2, 'font-size': '20px', 'text-anchor': 'middle' })
                        .text('Only null values present for Radius axis');

                    return;
                }
                // check for negative numbers
                loopctr = 0;
                while (loopctr < iColLength && (dataViewObject.values[assignData[2]].values[loopctr] === ''
                    || dataViewObject.values[assignData[2]].values[loopctr] === null
                    || (typeof (dataViewObject.values[assignData[2]].values[loopctr]) === 'number'
                        && (dataViewObject.values[assignData[2]].values[loopctr] >= 0)))) {
                    loopctr++;
                }
                if (loopctr !== iColLength) {
                    $('#container').removeAttr('style');
                    d3.select('#container').append('svg').classed('errorMessage', true).attr({ width: width, height: height });
                    d3.select('svg')
                        .append('text')
                        .attr({ x: width / 2, y: height / 2, 'font-size': '20px', 'text-anchor': 'middle' })
                        .text('Data not supported');

                    return;
                }
            }
            if (-1 === assignData[3]) {
                isLegends = false;
            } else {
                // check for all nulls in legend-axis
                loopctr1 = 0, loopctr2 = 0;
                iColLength = dataViewObject.categories[assignData[3]].values.length;
                while (loopctr1 < iColLength) {
                    if (dataViewObject.categories[assignData[3]].values[loopctr1] !== null) {
                        break;
                    }
                    loopctr1++;
                }
                while (loopctr2 < iColLength) {
                    if (dataViewObject.categories[assignData[3]].values[loopctr2] !== '') {
                        break;
                    }
                    loopctr2++;
                }
                if (loopctr1 === iColLength || loopctr2 === iColLength) {
                    $('#container').removeAttr('style');
                    d3.select('#container').append('svg').classed('errorMessage', true).attr({ width: width, height: height });
                    d3.select('svg')
                        .append('text')
                        .attr({ x: width / 2, y: height / 2, 'font-size': '20px', 'text-anchor': 'middle' })
                        .text('Only null values present for Legend axis');

                    return;
                }
            }
            loopctr = 0;
            // tslint:disable-next-line:no-any
            const length1: any = dataViewObject.values[assignData[0]].values.length; skipFlag = 0;
            while (loopctr < length1) {
                if (dataViewObject.values[assignData[0]].values[loopctr] === null
                    || dataViewObject.values[assignData[0]].values[loopctr] === ''
                    || dataViewObject.values[assignData[1]].values[loopctr] === null
                    || dataViewObject.values[assignData[1]].values[loopctr] === ''
                    || (assignData[2] !== -1
                        && (dataViewObject.values[assignData[2]].values[loopctr] === null
                            || dataViewObject.values[assignData[2]].values[loopctr] === ''))
                    || (assignData[3] !== -1
                        && (dataViewObject.categories[assignData[3]].values[loopctr] === null
                            || dataViewObject.categories[assignData[3]].values[loopctr] === ''))) {
                    skipFlag++;
                }
                loopctr++;
            }
            if (skipFlag === length1) {
                $('#container').removeAttr('style');
                d3.select('#container').append('svg').classed('errorMessage', true).attr({ width: width, height: height });
                d3.select('svg')
                    .append('text')
                    .attr({ x: width / 2, y: height / 2, 'font-size': '20px', 'text-anchor': 'middle' })
                    .text('No data available');

                return;
            }
            series = [];
            for (jCounter = 0; jCounter < dataViewObject.values[0].values.length; jCounter++) {
                const objSeries: {
                    'name': string;
                    'data': {
                        // tslint:disable-next-line:no-any
                        'scaleX': any[];
                        // tslint:disable-next-line:no-any
                        'scaleY': any[];
                        // tslint:disable-next-line:no-any
                        'radius': any[];
                    };
                } = {
                        name: '',
                        data: {
                            scaleX: [],
                            scaleY: [],
                            radius: []
                        }
                    };
                let legendIndex: number;
                if (options.dataViews[0].categorical.categories !== undefined) {
                    if (dataViewObject.categories[0].values[jCounter] !== null && dataViewObject.categories[0].values[jCounter] !== '') {
                        legendIndex = findLegend(series, legendNumbers,
                            (isLegends ? dataViewObject.categories[0].values[jCounter] : 'NA'));

                        if (legendIndex === -1) {
                            objSeries.name = (isLegends ? dataViewObject.categories[0].values[jCounter] : 'NA');
                            series[legendNumbers] = objSeries;
                            legendIndex = legendNumbers;
                            legendNumbers++;
                        }
                        series[legendIndex].data.scaleX.push(dataViewObject.values[assignData[0]].values[jCounter]);
                        series[legendIndex].data.scaleY.push(dataViewObject.values[assignData[1]].values[jCounter]);
                        series[legendIndex].data.radius.push((isRadius ? dataViewObject.values[assignData[2]].values[jCounter] : 4));
                    }
                } else {
                    legendIndex = findLegend(series, legendNumbers, (isLegends ? dataViewObject.categories[0].values[jCounter] : 'NA'));

                    if (legendIndex === -1) {
                        objSeries.name = (isLegends ? dataViewObject.categories[0].values[jCounter] : 'NA');
                        series[legendNumbers] = objSeries;
                        legendIndex = legendNumbers;
                        legendNumbers++;
                    }
                    series[legendIndex].data.scaleX.push(dataViewObject.values[assignData[0]].values[jCounter]);
                    series[legendIndex].data.scaleY.push(dataViewObject.values[assignData[1]].values[jCounter]);
                    series[legendIndex].data.radius.push((isRadius ? dataViewObject.values[assignData[2]].values[jCounter] : 4));

                }
            }
            const THIS: this = this;
            // data binding: end
            const viewModel: IQuadrantChartViewModel = visualTransform(options, this.host, THIS);

            if (!viewModel) {
                return;
            }
            if (series.length <= 0) {
                $('#container').removeAttr('style');
                d3.select('#container').append('svg').classed('errorMessage', true).attr({ width: width, height: height });
                d3.select('svg')
                    .append('text')
                    .attr({ x: width / 2, y: height / 2, 'font-size': '20px', 'text-anchor': 'middle' })
                    .text('No data available');

                return;
            }
            this.quadrantChartPoints = viewModel.dataPoints;
            const settingsChanged: boolean = this.getSettings(this.dataView.metadata.objects);
            // workaround because of sdk bug that doesn't notify when only style has changed
            this.renderLegend(viewModel);
            if (!this.bubbleChartWithAxis || settingsChanged
                // tslint:disable-next-line:no-bitwise
                || ((options.type & VisualUpdateType.Resize) || options.type & VisualUpdateType.ResizeEnd)) {
                this.svg.selectAll('*').remove();
                this.bubbleChartWithAxis =
                    MAQDrawChart(this.dataView, this.settings, viewModel, series, assignData, ValueFormatter, textMeasurementService);
            }

            this.addBubbleSelection(this.selectionManager, viewModel);

            this.addLegendSelection();
            $('#legendGroup').on('click.load', '.navArrow', function (): void {
                THIS.addLegendSelection();
            });

            this.rootElement
                .on('click',
                () => this.selectionManager.clear().then(() => this.rootElement.selectAll('.legendItem').attr('opacity', 1),
                    this.rootElement.selectAll('svg .MAQCharts-plotArea circle').attr('opacity', 1)));
        }

        // tslint:disable-next-line:no-any
        private addBubbleSelection(selectionManager: any, viewModel: any): void {
            // tslint:disable-next-line:variable-name
            const THIS: this = this;
            const bubbles: d3.selection.Update<{}> = this.svg.selectAll('svg .MAQCharts-plotArea circle').data(viewModel.dataPoints);

            // tslint:disable-next-line:no-any
            bubbles.on('click', function (d: any): void {
                // tslint:disable-next-line:no-any
                selectionManager.select(d.selectionId).then((ids: any[]) => {
                    // tslint:disable-next-line:no-any
                    function CompareIds(legendData: any): number {
                        if (ids.length) {
                            if (legendData.identity.key === ids[0].key) {
                                return 1;
                            } else {
                                return 0.5;
                            }
                        } else {
                            return 1;
                        }
                    }
                    // tslint:disable-next-line:no-any
                    const legendOnBubble: any = THIS.rootElement.selectAll('.legendItem');
                    // tslint:disable-next-line:no-any
                    legendOnBubble.attr('opacity', (g: any) => {
                        return CompareIds(g);
                    });

                    bubbles.attr({
                        opacity: ids.length > 0 ? 0.5 : 1
                    });
                    d3.select(this).attr({
                        opacity: 1
                    });
                });
                (<Event>d3.event).stopPropagation();
            });
        }

        private addLegendSelection(): void {
            // tslint:disable-next-line:variable-name
            const THIS: this = this;
            // tslint:disable-next-line:no-any
            const legends: any = this.rootElement.selectAll('.legendItem');
            const selectionManager: ISelectionManager = this.selectionManager;
            // tslint:disable-next-line:no-any
            legends.on('click', function (d: any): void {
                // tslint:disable-next-line:no-any
                selectionManager.select(d.identity).then((ids: any[]) => {
                    // tslint:disable-next-line:no-any
                    function CompareIds(arcData: any): number {
                        if (ids.length) {
                            if (arcData.selectionId.key === ids[0].key) {
                                return 1;
                            } else {
                                return 0.5;
                            }
                        } else {
                            return 1;
                        }
                    }
                    // tslint:disable-next-line:no-any
                    const arcs: any = THIS.rootElement.selectAll('svg .MAQCharts-plotArea circle');
                    // tslint:disable-next-line:no-any
                    arcs.attr('opacity', (e: any) => {
                        return CompareIds(e);
                    });
                    legends.attr({
                        opacity: ids.length > 0 ? 0.5 : 1
                    });

                    d3.select(this).attr({
                        opacity: 1
                    });
                });
                (<Event>d3.event).stopPropagation();
            });
        }

        private renderLegend(viewModel: IQuadrantChartViewModel): void {
            if (!viewModel || !viewModel.legendData) {
                return;
            }
            if (this.dataView && this.dataView.metadata) {
                this.legendObjectProperties = powerbi.extensibility.utils.dataview.DataViewObjects
                    .getObject(this.dataView.metadata.objects, 'legend', {});
            }
            const legendData: LegendData = viewModel.legendData;
            const legendDataTorender: LegendData = {
                fontSize: 8,
                dataPoints: [],
                title: legendData.title
            };
            for (let j: number = 0; j < legendData.dataPoints.length; j++) {

                legendDataTorender.dataPoints.push({
                    label: legendData.dataPoints[j].label,
                    color: legendData.dataPoints[j].color,
                    icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                    selected: false,
                    identity: legendData.dataPoints[j].identity
                });
                legendValuesTorender[j] = legendValues[j];
            }
            if (this.legendObjectProperties) {
                powerbi.extensibility.utils.chart.legend.data.update(legendDataTorender, this.legendObjectProperties);
                const position: string = <string>this.legendObjectProperties[powerbi.extensibility.utils.chart.legend.legendProps.position];
                if (position) {
                    this.legend.changeOrientation(LegendPosition[position]);
                }
            }
            this.legend.drawLegend(legendDataTorender, _.clone(this.currentViewport));
            powerbi.extensibility.utils.chart.legend.positionChartArea(this.svg, this.legend);
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const objectName: string = options.objectName;
            const objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case 'legendColors':
                    for (const quadrantChartPoint of this.quadrantChartPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: quadrantChartPoint.category,
                            properties: {
                                legendColor: {
                                    solid: {
                                        color: quadrantChartPoint.color
                                    }
                                }
                            },
                            selector: quadrantChartPoint.selectionId.getSelector()
                        });
                    }
                    break;
                case 'legend':
                    objectEnumeration.push({
                        objectName: 'legend',
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            show: this.settings.showLegend,
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: powerbi.extensibility.utils.dataview.DataViewObject
                                .getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.showTitle, true),
                            labelColor: powerbi.extensibility.utils.dataview.DataViewObject
                                .getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.labelColor, null),
                            fontSize: powerbi.extensibility.utils.dataview.DataViewObject
                                .getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.fontSize, 8)
                        }
                    });
                    break;
                case 'quadrantNames':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showQuadrants,
                            quadrant1: this.settings.quadrant1,
                            quadrant2: this.settings.quadrant2,
                            quadrant3: this.settings.quadrant3,
                            quadrant4: this.settings.quadrant4,
                            quadrantDivisionX: this.settings.quadrantDivisionX,
                            quadrantDivisionY: this.settings.quadrantDivisionY,
                            type: this.settings.type
                        },
                        selector: null
                    });
                    break;
                case 'xAxis':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showxAxis,
                            start: this.settings.startxAxis,
                            end: this.settings.endxAxis,
                            interval: this.settings.intervalxAxis,
                            titleEnable: this.settings.showxAxisTitle,
                            titleText: this.settings.xTitleText,
                            label: this.settings.showxAxisLabel,
                            displayUnits: this.settings.xDisplayUnits,
                            textPrecision: this.settings.xTextPrecision
                        },
                        selector: null
                    });
                    break;
                case 'yAxis':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showyAxis,
                            start: this.settings.startyAxis,
                            end: this.settings.endyAxis,
                            interval: this.settings.intervalyAxis,
                            titleEnable: this.settings.showyAxisTitle,
                            titleText: this.settings.yTitleText,
                            label: this.settings.showyAxisLabel,
                            displayUnits: this.settings.yDisplayUnits,
                            textPrecision: this.settings.yTextPrecision
                        },
                        selector: null
                    });
                    break;
                default:
            }

            return objectEnumeration;
        }

        private getSettings(objects: DataViewObjects): boolean {
            let settingsChanged: boolean = false;
            if (typeof this.settings === 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    // Quadrant
                    showLegend: getValue<boolean>(objects, 'legend', 'show', true),
                    showQuadrants: getValue<boolean>(objects, 'quadrantNames', 'show', true),
                    type: getValue<boolean>(objects, 'quadrantNames', 'type', false),
                    quadrant1: getValue<string>(objects, 'quadrantNames', 'quadrant1', 'Quadrant1'),
                    quadrant2: getValue<string>(objects, 'quadrantNames', 'quadrant2', 'Quadrant2'),
                    quadrant3: getValue<string>(objects, 'quadrantNames', 'quadrant3', 'Quadrant3'),
                    quadrant4: getValue<string>(objects, 'quadrantNames', 'quadrant4', 'Quadrant4'),
                    // X-Axis and Y-Axis
                    showxAxis: getValue<boolean>(objects, 'xAxis', 'show', true),
                    showyAxis: getValue<boolean>(objects, 'yAxis', 'show', true),

                    startxAxis: getValue<number>(objects, 'xAxis', 'start', null),
                    startyAxis: getValue<number>(objects, 'yAxis', 'start', null),
                    endxAxis: getValue<number>(objects, 'xAxis', 'end', null),
                    endyAxis: getValue<number>(objects, 'yAxis', 'end', null),

                    intervalxAxis: (getValue<number>(objects, 'xAxis', 'interval', null) < 1
                        &&
                        getValue<number>(objects, 'xAxis', 'interval', null) !== null)
                        ? 1
                        : getValue<number>(objects, 'xAxis', 'interval', null) > 15 ? 15
                            : getValue<number>(objects, 'xAxis', 'interval', null),
                    intervalyAxis: (getValue<number>(objects, 'yAxis', 'interval', null) < 1
                        &&
                        getValue<number>(objects, 'yAxis', 'interval', null) !== null) ? 1
                        : getValue<number>(objects, 'yAxis', 'interval', null) > 15 ? 15
                            : getValue<number>(objects, 'yAxis', 'interval', null),

                    showxAxisTitle: getValue<boolean>(objects, 'xAxis', 'titleEnable', true),
                    showyAxisTitle: getValue<boolean>(objects, 'yAxis', 'titleEnable', true),
                    showxAxisLabel: getValue<boolean>(objects, 'xAxis', 'label', true),
                    showyAxisLabel: getValue<boolean>(objects, 'yAxis', 'label', true),
                    xTitleText: getValue<string>(objects, 'xAxis', 'titleText', 'X'),
                    yTitleText: getValue<string>(objects, 'yAxis', 'titleText', 'Y'),
                    xDisplayUnits: getValue<number>(objects, 'xAxis', 'displayUnits', 0),
                    yDisplayUnits: getValue<number>(objects, 'yAxis', 'displayUnits', 0),
                    xTextPrecision: getValue<number>(objects, 'xAxis', 'textPrecision', 0) < 0 ? 0
                        : getValue<number>(objects, 'xAxis', 'textPrecision', 0) > 4 ? 4
                            : getValue<number>(objects, 'xAxis', 'textPrecision', 0) % 1 !== 0 ?
                                getValue<number>(objects, 'xAxis', 'textPrecision', 0) - getValue<number>(objects, 'xAxis', 'textPrecision', 0) % 1
                                : getValue<number>(objects, 'xAxis', 'textPrecision', 0),
                    yTextPrecision: getValue<number>(objects, 'yAxis', 'textPrecision', 0) < 0 ? 0
                        : getValue<number>(objects, 'yAxis', 'textPrecision', 0) > 4 ? 4
                            : getValue<number>(objects, 'yAxis', 'textPrecision', 0) % 1 !== 0 ?
                                getValue<number>(objects, 'yAxis', 'textPrecision', 0) - getValue<number>(objects, 'yAxis', 'textPrecision', 0) % 1
                                : getValue<number>(objects, 'yAxis', 'textPrecision', 0),
                    // Quadrant division lines
                    quadrantDivisionX: getValue<number>(objects, 'quadrantNames', 'quadrantDivisionX', -1),
                    quadrantDivisionY: getValue<number>(objects, 'quadrantNames', 'quadrantDivisionY', -1)
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;

            return settingsChanged;
        }
    }
}