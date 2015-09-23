(function () {

    "use strict";

    define([
	
			'esri/tasks/locator',
			'esri/geometry/Extent',
			'esri/layers/FeatureLayer',
			'esri/symbols/PictureMarkerSymbol'
			
        ], function (Locator, Extent, FeatureLayer, PictureMarkerSymbol) {

            var searchConfig = new function () {
                var self = this;
				
				self.Sources = [
				{
					locator: new Locator("//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"),
					singleLineFieldName: "SingleLine",
					autoNavigate: true,
					enableInfoWindow: true,
					enableHighlight: false,
					autoSelect: false,
					showInfoWindowOnSelect: true,
					name: "Map",
					searchExtent: new esri.geometry.Extent({"xmin":-114.68,"ymin":31.29, "xmax":-109.06,"ymax":36.99}),
					placeholder: "302 N 1st Ave, Phoenix, Arizona"
				 }
				,
				{
					featureLayer: new FeatureLayer("http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain/MapServer/4"),
					searchFields: ["NAME"],
					displayField: "NAME",
					name: "Counties",
					placeholder: "Pinal County"
				},
				{
					featureLayer: new FeatureLayer("http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain/MapServer/1"),
					searchFields: ["NAME"],
					displayField: "NAME",
					name: "Jurisdiction",
					placeholder: "Scottsdale"
				},
				{
					featureLayer: new FeatureLayer("http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain/MapServer/2"),
					searchFields: ["DISTRICT_NUM"],
					displayField: "DISTRICT_NUM",
					name: "Legislative Districts",
					placeholder: "Legislative District 03"
				},
				{
					featureLayer: new FeatureLayer("http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain/MapServer/3"),
					searchFields: ["DISTRICT_NUM"],
					displayField: "DISTRICT_NUM",
					name: "Congressional Districts",
					placeholder: "Congressional District 1"
				},
				{
					featureLayer: new FeatureLayer("http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain/MapServer/5"),
					searchFields: ["NAMELSAD"],
					displayField: "NAMELSAD",
					autoNavigate: true,
					name: "Census Tracts",
					placeholder: "Census Tract 8.03"
				 }
				 ]
                };
            return searchConfig;
        }
		)
}());