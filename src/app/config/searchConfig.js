(function() {
	'use strict';

	define(
		[
			'dojo/topic',
			'esri/tasks/locator',
			'esri/geometry/Extent',
			'esri/layers/FeatureLayer',
			'app/config/demographicConfig'
		],
		function(tp, Locator, Extent, FeatureLayer, demographicConfig) {
			var searchConfig = new function() {
				var self = this;
				self.Sources = [];

				self.init = function() {
					self.Sources = [
						{
							locator: new Locator(appConfig.geoCoderService),
							singleLineFieldName: 'SingleLine',
							autoNavigate: true,
							enableInfoWindow: true,
							enableHighlight: false,
							autoSelect: false,
							showInfoWindowOnSelect: true,
							name: 'Map',
							searchExtent: new Extent({
								xmin: -114.68,
								ymin: 31.29,
								xmax: -109.06,
								ymax: 36.99
							}),
							placeholder: '302 N 1st Ave, Phoenix, Arizona'
						},
						{
							featureLayer: new FeatureLayer(demographicConfig.reports['countySummary']['ACSRestUrl']),
							searchFields: [ demographicConfig.reports['countySummary']['summaryField'] ],
							displayField: demographicConfig.reports['countySummary']['summaryField'],
							name: 'Counties',
							outFields: [ '*' ],
							placeholder: 'Pinal County'
						},
						{
							featureLayer: new FeatureLayer(demographicConfig.reports['cogSummary']['ACSRestUrl']),
							searchFields: [ demographicConfig.reports['cogSummary']['summaryField'] ],
							displayField: demographicConfig.reports['cogSummary']['summaryField'],
							autoNavigate: true,
							name: 'COG / MPO',
							outFields: [ '*' ],
							placeholder: 'Southeastern Arizona Governments Assoc.'
						},
						{
							featureLayer: new FeatureLayer(
								demographicConfig.reports['legislativeSummary']['ACSRestUrl']
							),
							searchFields: [ demographicConfig.reports['legislativeSummary']['summaryField'] ],
							displayField: demographicConfig.reports['legislativeSummary']['summaryField'],
							name: 'Legislative Districts',
							outFields: [ '*' ],
							placeholder: 'Legislative District 03'
						},
						{
							featureLayer: new FeatureLayer(demographicConfig.reports['placeSummary']['ACSRestUrl']),
							searchFields: [ demographicConfig.reports['placeSummary']['summaryField'] ],
							displayField: demographicConfig.reports['placeSummary']['summaryField'],
							name: 'Place',
							outFields: [ '*' ],
							placeholder: 'Scottsdale'
						},
						{
                            featureLayer: new FeatureLayer(demographicConfig.reports['congressionalSummary']['ACSRestUrl']),
							searchFields: [ demographicConfig.reports['congressionalSummary']['summaryField'] ],
							displayField: demographicConfig.reports['congressionalSummary']['summaryField'],
							name: 'Congressional Districts',
							outFields: [ '*' ],
							placeholder: 'Congressional District 1'
						},
						{
							featureLayer: new FeatureLayer(demographicConfig.reports['councilDistrictSummary']['ACSRestUrl']),
							searchFields: [demographicConfig.reports['councilDistrictSummary']['summaryField']],
							displayField: demographicConfig.reports['councilDistrictSummary']['summaryField'],
							name: 'City Council Districts',
							outFields: ['*'],
							placeholder: 'Buckeye District 1'
						},
						{
							featureLayer: new FeatureLayer(demographicConfig.reports['supervisorSummary']['ACSRestUrl']),
							searchFields: [demographicConfig.reports['supervisorSummary']['summaryField']],
							displayField: demographicConfig.reports['supervisorSummary']['summaryField'],
							name: 'Supervisor Districts',
							outFields: ['*'],
							placeholder: 'Apache County - District 1'
						},
						{
							featureLayer: new FeatureLayer(demographicConfig.reports['zipCodeSummary']['ACSRestUrl']),
							searchFields: [ demographicConfig.reports['zipCodeSummary']['summaryField'] ],
							displayField: demographicConfig.reports['zipCodeSummary']['summaryField'],
							autoNavigate: true,
							name: 'Zip Codes',
							outFields: [ '*' ],
							placeholder: '85254'
						},
						{
							featureLayer: new FeatureLayer(appConfig.tractService),
                            searchFields: [ 'NAMELSAD' ],
							displayField: 'NAMELSAD',
							autoNavigate: true,
							name: 'Census Tracts',
							outFields: [ '*' ],
							placeholder: 'Census Tract 8.03'
						},
						{
							featureLayer: new FeatureLayer(appConfig.SchoolsService),
							searchFields: [ "DistrictName" ],
							displayField: "DistrictName",
							autoNavigate: true,
							name: 'School Districts',
							outFields: [ '*' ],
							placeholder: 'Unified School Districts',
							enableInfoWindow: true,
							showInfoWindowOnSelect: true
						}
					];
				};
			}();
			return searchConfig;
		}
	);
})();
