module powerbi.extensibility.visual {
    export interface IFlightData {
        data: IMapModel[];
    }

    export interface ITooltipDataPoints {
        name: string;
        value: string;
    }

    export interface IMapModel {
        sourceDataPoints: IDataPoints;
        destinationDataPoints: IDataPoints;
        flightDataPoints: string;
        flightType: string;
        flightDetail: string;
        tooltipDataPoints: ITooltipDataPoints[];
        selectionId: ISelectionId;
        kpi: number;
    }

    export interface IDataPoints {
        latitude: number;
        longitude: number;
    }

    export interface ITooltipSettings {
        show: boolean;
        separator: number;
    }

    export interface IAnimationSettings {
        show: boolean;
        speed: string;
    }

    export interface IImageSettings {
        show: boolean;
    }

    export interface IRouteSettings {
        route: string;
        show: boolean;
        internationalRoute: string;
        domesticRoute: string;
        otherRoute: string;
    }

    export interface IColorSettings {
        KPIlegend: boolean;
        gradients: string;
        circleThresh1: number;
        circleThresh2: number;
        circleThresh3: number;
        circleThresh4: number;
        circleThresh5: number;
        circleThresh6: number;
        pathColor: string;
        circleColor1: string;
        circleColor2: string;
        circleColor3: string;
        circleColor4: string;
        circleColor5: string;
        circleColor6: string;
        circleColor7: string;
    }

    export interface IStartEnd {
        circle: string;
        start: number;
        end: number;
    }

    export interface IDivs {
        googleMap: d3.Selection<HTMLElement>;
        legendImage: d3.Selection<HTMLElement>;
        legendTypeImage: d3.Selection<HTMLElement>;
        legendThreshImage: d3.Selection<HTMLElement>;
    }

    export interface ICenterCoords {
        lat: number;
        lng: number;
    }

    export interface ISettings {
        apiSetting: string;
        mapSetting: string;
        tooltipSetting: ITooltipSettings;
        animationSetting: IAnimationSettings;
        imageSetting: IImageSettings;
        routeSetting: IRouteSettings;
        colorSetting: IColorSettings;
        centerSetting: ICenterCoords;
    }

    export interface IMapElements {
        // tslint:disable-next-line:no-any
        flightPath: any;
        // tslint:disable-next-line:no-any
        sourcePin: any;
        // tslint:disable-next-line:no-any
        destinationPin: any;
    }

    export interface IMapTypes {
        // tslint:disable-next-line:no-any
        styledMapStandard: any;
        // tslint:disable-next-line:no-any
        styledMap: any;
        // tslint:disable-next-line:no-any
        styledMapSilver: any;
        // tslint:disable-next-line:no-any
        styledMapNight: any;
    }
}
