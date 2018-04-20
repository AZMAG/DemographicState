/**
 * Map model (contains map related properties) - Singleton
 *
 * This module is defined as a singleton object and as such,
 * contains a different architecture than other modules.
 *
 * @class map-model
 **/

(function() {
	'use strict';

	define(
		[
			'dojo/dom-construct',
			'dojo/dom',
			'dojo/on',
			'dojo/topic',

			'dojo/_base/lang',
			'esri/graphic',
			'app/helpers/bookmark-delegate',

			'esri/geometry/Extent',
			'esri/geometry/Point',
			'esri/SpatialReference',

			'esri/layers/WMSLayer',
			'esri/layers/ArcGISDynamicMapServiceLayer',
			'esri/layers/ArcGISTiledMapServiceLayer',
			'esri/layers/VectorTileLayer',
			'esri/layers/FeatureLayer',
			'esri/Color',
			'esri/symbols/SimpleMarkerSymbol',
			'esri/symbols/SimpleLineSymbol',
			'esri/symbols/SimpleFillSymbol',
			'esri/renderers/UniqueValueRenderer',

			'esri/InfoTemplate',

			'dojo/domReady!'
		],
		function(
			dc,
			dom,
			on,
			tp,
			lang,
			Graphic,
			bookmarkDelegate,
			Extent,
			Point,
			SpatialReference,
			WMSLayer,
			ArcGISDynamicMapServiceLayer,
			ArcGISTiledMapServiceLayer,
			VectorTileLayer,
			FeatureLayer,
			Color,
			SimpleMarkerSymbol,
			SimpleLineSymbol,
			SimpleFillSymbol,
			UniqueValueRenderer,
			InfoTemplate
		) {
			/**
         * Holds reference to the map.
         *
         * @property instance
         * @type {map}
         */
			var instance = null; //no globals!

			/**
         * Contains properties and methods to manage the ESRI map.
         *
         * @class MapModel
         * @constructor
         */
			function MapModel() {
				if (instance !== null) {
					throw new Error('Cannot instantiate more than one MapModel, use MapModel.getInstance()');
				}
				this.mapInstance = null;
				this.baseMapInstance = null;
				this.mapInstances = [];
				this.mapLayers = [];
				this.anonymousMapLayers = [];
				this.allowedMapLayers = [];
				this.basemapLayers = [];
				this.layerCategories = [];
				this.selectableLayers = [
					{
						title: 'Custom Shape'
					}
				];
				this.layersToAdd = [];
				this.resizeTimer;
				this.initializationData = undefined;
				this.initializing = true;
				//this.initialize();
				this.self = this;
			}

			MapModel.prototype = {
				/**
             * Initialize the class and load the map layers.
             *
             * @method initialize
             */
				initialize: function() {
					// create div for loading gif. vw
					var loading = dc.create(
						'div',
						{
							id: 'loading'
						},
						'display',
						'after'
					);
					//dc.create("div", { id: "loading" }, "map", "first");
					var img = dc.create(
						'img',
						{
							id: 'loadimag',
							src: 'app/resources/img/loading.gif'
						},
						'loading',
						'first'
					);

					// hide div till called. vw
					esri.hide(dojo.byId('loading'));

					this.initializationData = bookmarkDelegate.getQueryStringMapDataObj();

					/**
                 * infoTemplate for Congressional Districts
                 * @type {InfoTemplate}
                 */
					self.congressInfoTemplate = new InfoTemplate();
					self.congressInfoTemplate.setTitle('Congressional Districts');
					self.congressInfoTemplate.setContent(
						"<strong><div id='congressionalLink'>${CDIST_NAME}</div></strong>"
					);
					// self.congressInfoTemplate.setContent("<strong><div id='congressionalLink'>${CDIST_NAME}</div></strong>" +
					//     "<hr>" +
					//     "Representative: ${CDRepresentative} - (${CDParty})");

					/**
                 * infoTemplate for Legislative Districts
                 * @type {InfoTemplate}
                 */
					self.legislatureInfoTemplate = new InfoTemplate();
					self.legislatureInfoTemplate.setTitle('Legislative Districts');
					self.legislatureInfoTemplate.setContent(
						"<strong><div id='legislativeLink'>${SLDIST_NAME}</div></strong>"
					);
					// self.legislatureInfoTemplate.setContent("<strong><div id='legislativeLink'>${SLDIST_NAME}</div></strong>" +
					//     "<hr>" +
					//     "Representative: ${HouseRep1} - (${Party_HRep1})<br>" +
					//     "Representative: ${HouseRep2} - (${Party_HRep2})<br>" +
					//     "Senator: ${Senator} - (${Party_Sen})<br>");

					/**
                 * infoTemplate for Cogs / MPOs
                 * @type {InfoTemplate}
                 */
					self.cogInfoTemplate = new InfoTemplate();
					self.cogInfoTemplate.setTitle('COGs / MPOs');
					self.cogInfoTemplate.setContent("<strong><div id='cogLink'>${NAME}</div></strong>");

					/**
                 * infoTemplate for ZIP code areas
                 * @type {InfoTemplate}
                 */
					self.zipCodesInfoTemplate = new InfoTemplate();
					self.zipCodesInfoTemplate.setTitle('ZIP Codes');
					self.zipCodesInfoTemplate.setContent(
						"<strong><div id='zipCodeLink'>${ZIPCODE}</div></strong><br>" +
							'<strong>Place:</strong> ${NAME}'
					);

					self.supervisorInfoTemplate = new InfoTemplate();
					self.supervisorInfoTemplate.setTitle('Supervisor District');
					self.supervisorInfoTemplate.setContent(
						"<strong><div id='supervisorLink'>${SuperDistName}</div></strong>"
					);

					self.councilDistrictInfoTemplate = new InfoTemplate();
					self.councilDistrictInfoTemplate.setTitle('City Council District');
					self.councilDistrictInfoTemplate.setContent(
						"<strong><div id='councilDistrictLink'>${CityDistrictName}</div></strong>"
					);

					/**
                 * infoTemplate for Counties
                 * @type {InfoTemplate}
                 */
					self.countyInfoTemplate = new InfoTemplate();
					self.countyInfoTemplate.setTitle('Counties');
					self.countyInfoTemplate.setContent("<strong><div id='countyLink'>${NAME}</div></strong>");

					/**
                 * infoTemplate for School Districts
                 * @type {InfoTemplate}
                 */
					self.districtInfoTemplate = new InfoTemplate();
					self.districtInfoTemplate.setTitle('Unified School Districts');
					self.districtInfoTemplate.setContent(
						"<strong><div id=''>${DistrictName}</div></strong><br>" +
							'District EntityID: ${DistrictEntityID}<br>' +
							'Grades Levels: ${GradesServed}'
					);

					self.featureFillSymbol = new SimpleFillSymbol(
						SimpleFillSymbol.STYLE_BACKWARD_DIAGONAL,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([ 0, 255, 255 ]), 2),
						new Color([ 0, 255, 255, 0.25 ])
					);
				},
				// =====================================================================================================================================>
				// end initialize

				loadInitialMap: function(map) {
					this.baseMapInstance = map;
					this.mapInstance = map;
					this.mapInstances.push(map);

					on(map, 'LayerAddResult', this.mapOnLayerAddResult);
					on(this.mapInstance, 'Load', this.countiesLoaded);
					on(
						map,
						'Load',
						lang.hitch(this, function() {
							this.mapLoaded(map);
						})
					);
					on(this.mapInstance, "extent-change", this.extentChanged);
				},

				loadNewMap: function(map, mapInitData) {
					this.mapInstance = map;
					this.mapInstances.push(map);
					on(map, 'LayerAddResult', this.mapOnLayerAddResult);

					on(
						map,
						'Load',
						lang.hitch(this, function() {
							this.mapLoaded(this.mapInstance);
						})
					);

					this.createLayers(map);
					if (this.initializing) {
						tp.publish('MapFrameInitialized', this.mapInstance, mapInitData);
					} else {
						tp.publish('SelectedMapChanged', this.mapInstance);
					}
				},

				removeMap: function(map) {
					this.mapInstances.pop();
					if (this.mapInstance.id === map.id) {
						this.mapInstance = this.baseMapInstance;
						tp.publish('SelectedMapChanged', this.mapInstance);
					}
				},

				recenterMaps: function(centerPnt) {
					for (var i = 0; i < this.mapInstances.length; i++) {
						this.mapInstances[i].resize(true);
						this.mapInstances[i].reposition();
						this.mapInstances[i].centerAt(centerPnt);
					}
				},

				syncMapExtents: function(extent, mapID) {
					for (var i = 0; i < this.mapInstances.length; i++) {
						if (this.mapInstances[i].id !== mapID) {
							this.mapInstances[i].setExtent(extent);
						}
					}
				},

				/**
             * Used to coordinate popups with interactive tools
             * found in the demographic-vm.js
             * @return {[type]} [description]
             */
				showInfoWindow: function() {
					// this.mapInstance.infoWindow = true;
					this.mapInstance.setInfoWindowOnClick(true);
				},

				/**
             * Used to coordinate popups with interactive tools
             * found in the interactiveTools-vm.js
             * @return {[type]} [description]
             */
				hideInfoWindow: function() {
					// this.mapInstance.infoWindow = false;
					this.mapInstance.infoWindow.hide();
					this.mapInstance.setInfoWindowOnClick(false);
				},

				/**
             * Fired when a layer is added to the map.
             *
             * @event onLayerAddResult
             * @param {Layer} layer - the layer added to the map.
             * @param {Error} error - any errors that occurred loading the layer.
             */
				mapOnLayerAddResult: function(layer, error) {
					if (error) {
						alert(error);
					}
					tp.publish('mapLayerAdded');
				},

				/**
             * Loads the thematic legend
             * @return {[type]} [description]
             */
				mapLoaded: function(map) {
					tp.publish('MapLoaded', map);
				},

				extentChanged: function (e) {
					tp.publish("extentChanged");
				},

				/**
             * Loads the counties legend
             * @return {[type]} [description]
             */
				countiesLoaded: function() {
					tp.publish('Counties Loaded');
				},

				/**
             * Read layer info from config.js and add the layers to the map.
             *
             * @method createLayers
             */
				createLayers: function(currentMap) {
					//for (var h = 0; h < this.mapInstances.length; h++) {
					var layersTOC = []; // add only certin layers to TOC
					var layersToAdd = [];

					var layerInfo = appConfig.layerInfo.slice(0);

					layerInfo.sort(function(a, b) {
						if (a.drawOrder < b.drawOrder) return -1;
						if (a.drawOrder > b.drawOrder) return 1;
						return 0;
					});

					for (var i = 0; i < layerInfo.length; i++) {
						// add all layers to TOC
						var info = layerInfo[i];
						var layer;

						var token = '';
						if (typeof info.token !== 'undefined') {
							token = '?token=' + info.token;
						}

						var visible = info.visible;
						var opacity = info.opacity;
						if (currentMap.id !== this.baseMapInstance.id) {
							var tempLyr = this.baseMapInstance.getLayer(info.id);
							if (tempLyr) {
								visible = tempLyr.visible;
								opacity = tempLyr.opacity;
							}
						}

						switch (info.type) {
							case 'wms':
								var resourceInfo = {
									extent: this.getMapExtent(),
									layerInfos: info.layers,
									version: info.version
								};
								var vlayers = [];
								for (var x = 0; x < info.layers.length; x++) {
									var li = info.layers[x];
									vlayers.push(li.name);
								}
								layer = new WMSLayer(info.url, {
									id: info.id,
									visible: visible,
									resourceInfo: resourceInfo,
									visibleLayers: vlayers,
									opacity: opacity
								});
								layer.setImageFormat('png');
								break;
							case 'dynamic':
								layer = new ArcGISDynamicMapServiceLayer(info.url + token, {
									id: info.id,
									visible: visible,
									opacity: opacity
								});
								layer.setVisibleLayers(info.layers);
								break;
							case 'tile':
								// layer = new VectorTileLayer("test.json");
								layer = new ArcGISTiledMapServiceLayer(info.url + token, {
									id: info.id,
									visible: visible,
									opacity: opacity
								});
								break;
							case 'feature':
                                var featureTemplate;

								if (info.id === 'congressionalDistricts') {
									featureTemplate = self.congressInfoTemplate;
								} else if (info.id === 'legislativeDistricts') {
									featureTemplate = self.legislatureInfoTemplate;
								} else if (info.id === 'zipCodes') {
									featureTemplate = self.zipCodesInfoTemplate;
								} else if (info.id === 'countyBoundaries') {
									featureTemplate = self.countyInfoTemplate;
								} else if (info.id === 'cogBoundaries') {
									featureTemplate = self.cogInfoTemplate;
								} else if (info.id === 'districts') {
									featureTemplate = self.districtInfoTemplate;
								} else if (info.id === 'supervisorDistricts') {
									featureTemplate = self.supervisorInfoTemplate;
                                } else if (info.id === 'councilDistricts') {
									featureTemplate = self.councilDistrictInfoTemplate;
								}

								layer = new FeatureLayer(info.url + token, {
									id: info.id,
									visible: info.visible,
									opacity: info.opacity,
									mode: FeatureLayer.MODE_ONDEMAND,
									outFields: info.outFields,
									infoTemplate: featureTemplate
								});
						}

						layer.tocIndex = i;
						this.applyLayerProperties(layer, info);
						layersToAdd.push(layer);

						if (info.showTOC !== false) {
							layersTOC.push(layer);
						}

						// Hack: workaround inability to create legend when appending token to url
						//http://forums.arcgis.com/threads/65481-Legend-problems-with-secured-services-when-migrating-to-3.0-3.1
						if (typeof info.token !== 'undefined') {
							layer.url = layer.originalUrl;
							layer.queryUrl = layer.queryUrl + '?token=' + layer.token;
						}
					}

					var layersReversed = layersToAdd.reverse();
					// console.log(layersReversed);

					currentMap.addLayers(layersReversed);

					if (currentMap.id === this.baseMapInstance.id) {
						// publish for base map instance and default legend
						// console.log(layersTOC);
						tp.publish('addTOCLayers', layersTOC);
					} else {
						// publish for new map legends
					}

					//This section fixed the rendering bug where the renderer is not respecting the drawing order from the MXD
					var layer = currentMap.getLayer('cogBoundaries');
					dojo.connect(layer, 'onUpdateEnd', function() {
						$.each(this.graphics, function(index, graphic) {
							if (
								graphic.attributes.COG === 'MAG' ||
								graphic.attributes.COG === 'FMPO' ||
								graphic.attributes.COG === 'SVMP' ||
								graphic.attributes.COG === 'LHCMP' ||
								graphic.attributes.COG === 'CYMP' ||
								graphic.attributes.COG === 'SCMPO'
							) {
								var shape = graphic.getDojoShape();
								if (shape) {
									shape.moveToFront();
								}
							}
						});
					});
				},

				/**
             * Add additional layer properties to the layer before adding it to the map.
             *
             * @method applyLayerProperties
             * @param {Layer} layer - the layer to apply properties to.
             * @param {Object} info - the layer info object from the config.js file.
             */
				applyLayerProperties: function(layer, info) {
					layer.layerType = info.type;
					layer.layers = info.layers;
					layer.title = info.title;
					layer.description = info.description;
					layer.filters = info.filters;
					layer.category = info.category;
					layer.selectable = info.selectable;
					layer.queryUrl = info.queryUrl;
					layer.historical = info.historical;
					layer.originalUrl = info.url;
					layer.token = info.token;
					layer.queryWhere = info.queryWhere;
					layer.layerDefField = info.layerDefField;
					layer.isBasemap = info.isBasemap ? true : false;

					if (typeof layer.queryWhere === 'undefined' || layer.queryWhere === '') {
						layer.queryWhere = '1=1';
					}
					if (typeof info.layerDefField === 'undefined') {
						layer.layerDefField = '';
					}
					if (typeof info.historical === 'undefined') {
						layer.historical = false;
					}

					// var initData = this.GetMapInitDataByID(this.getMap().id);
					// if (initData) {
					//     $.each(initData.layers, function(i, layerId) {
					//         if (info.id === layerId) {
					//             // console.log(info.id, layerId);
					//             // console.log(info, layer)

					//             info.visible = true;
					//             layer.setVisibility(true);
					//         }
					//     });
					// }

					//Apply a definition expression on the layer if
					//it is a historical layer
					layer.defExp = '';
					if (layer.historical) {
						var d = new Date();
						d.setDate(d.getDate() - 1);
						var curr_date = d.getDate();
						var curr_month = d.getMonth() + 1; //Months are zero based
						var curr_year = d.getFullYear();
						var yesterday = curr_year + '-' + curr_month + '-' + curr_date;
						layer.defExp =
							"(Date >= '" + yesterday + " 00:00:00' AND Date <= '" + yesterday + " 23:59:59')";
					}

					//Add observable properties
					layer.loading = kendo.observable(false);
					layer.isVisible = kendo.observable(layer.visible);
					layer.optionsVisible = kendo.observable(false);

					layer.refreshOpacity = function() {
						this.opacityLevel(this.opacity * 100 + '%');
					};

					//Categorize layer
					if (layer.isBasemap) {
						this.basemapLayers.push(layer);
					} else {
						this.mapLayers.push(layer);
						//this.categorizeLayer(layer);
						if (layer.selectable) {
							this.selectableLayers.push(layer);
						}
					}
				},

				/**
             * Optionally categorize layers.
             *
             * @method categorizeLayer
             * @param {Layer} layer - the layer to be categorized.
             */
				categorizeLayer: function(layer) {
					var l = this.layerCategories.length;
					var exists = false;
					var obj;

					//Categorize the layer
					for (var x = 0; x < l; x++) {
						obj = this.layerCategories[x];
						if (obj.category === layer.category) {
							obj.layers.push(layer);
							if (layer.historical) {
								obj.historical = true;
								exists = true;
								break;
							}
						}
					}

					if (!exists) {
						var id = Math.floor(Math.random() * 1000000);
						var d = new Date();
						d.setDate(d.getDate() - 1);
						var curr_date = d.getDate();
						var curr_month = d.getMonth() + 1; //Months are zero based
						var curr_year = d.getFullYear();
						var yesterday = curr_year + '-' + curr_month + '-' + curr_date;
						obj = {
							id: id,
							category: layer.category,
							historical: layer.historical,
							fromDate: yesterday,
							toDate: yesterday,
							layers: [ layer ]
						};
						this.layerCategories.push(obj);
					}

					//Categorize the layer filters
					l = layer.filters.length;
					var filterCategories = [];
					for (var x = 0; x < l; x++) {
						exists = false;
						var filter = layer.filters[x];
						for (var y = 0; y < filterCategories.length; y++) {
							obj = filterCategories[y];
							if (obj.category === filter.category) {
								obj.filters.push(filter);
								exists = true;
								break;
							}
						}
						if (!exists) {
							filterCategories.push({
								category: filter.category,
								filters: [ filter ]
							});
						}
					}
					layer.filters = kendo.observable(filterCategories);
				},

				/**
             * Get the map instance.
             *
             * @method getMap
             * @returns {Map}
             */
				getMap: function() {
					return this.mapInstance;
				},

				/**
             * Get the graphics layer from the map.
             *
             * @method getGraphics
             * @returns {GraphicsLayer}
             */
				getGraphics: function(map) {
					var graphics;
					if (map) {
						graphics = map.graphics;
					} else {
						graphics = this.mapInstance.graphics;
					}

					return graphics;
				},

				/**
             * Get the spatial reference of the map.
             *
             * @method getSpatialReference
             * @returns {SpatialReference}
             */
				getSpatialReference: function() {
					return this.mapInstance.spatialReference;
				},

				/**
             * Resize the map to fit it's parent container.
             *
             * @method resizeMap
             */
				resizeMap: function() {
					if (this.mapInstance) {
						this.mapInstance.reposition();
						this.mapInstance.resize();
					}
				},

				/**
             * Get the current map extent.
             *
             * @method getMapExtent
             * @returns {Extent}
             */
				getMapExtent: function() {
					return this.mapInstance.extent;
				},

				/**
             * Set the map extent to the extent of the provided geometry.
             *
             * @method setMapExtent
             * @param {Geometry} geometry - source geometry for new extent.
             */
				setMapExtent: function(geometry) {
					var extent = new Extent();
					switch (geometry.type) {
						case 'extent':
							extent = geometry;
							break;
						case 'polygon':
							extent = geometry.getExtent();
							break;
						case 'point':
							var tol = 5000;
							extent.update(geometry.x - tol, geometry.y - tol, geometry.x + tol, geometry.y + tol);
							extent.spatialReference = this.getSpatialReference();
							break;
					}
					this.mapInstance.setExtent(extent, true);
				},

				/**
             * Center the map on the given point.
             *
             * @method centerMap
             * @param {Point} pt - pont to center map on.
             */
				centerMap: function(pt) {
					this.mapInstance.centerAt(pt);
				},

				/**
             * Center the map on the given latitude and longitude.
             *
             * @method centerMapAtLatLon
             * @param {number} lat - latitude uses for center point.
             * @param {number} lon - longitude used for center point.
             */
				centerMapAtLatLon: function(lat, lon) {
					var geoPt = new Point(
						lon,
						lat,
						new SpatialReference({
							wkid: 102100
						})
					);
					var convertedPt = esri.geometry.geographicToWebMercator(geoPt);
					this.mapInstance.centerAt(convertedPt);
				},

				/**
             * Center and zoom the map on a given point.
             *
             * @method zoomToPoint
             * @param {Point} pt - point to center and zoom to.
             */
				zoomToPoint: function(pt) {
					this.mapInstance.centerAndZoom(pt, 14);
				},

				/**
             * Add a graphic to the map graphics layer.
             *
             * @method addGraphic
             * @param {Graphic} graphic - feature to be added.
             * @param {string} color - name of the color to use as a fill color.
             */
				addGraphic: function(graphic, color, hasSymbol, allMapInstances) {
					if (!hasSymbol) {
						var symbol = this.getSymbol(graphic.geometry, color);
						graphic.symbol = symbol;
					}
					if (allMapInstances) {
						for (var i = 0; i < this.mapInstances.length; i += 1) {
							var newGraphic = new Graphic(
								graphic.geometry,
								graphic.symbol,
								graphic.attributes,
								graphic.infoTemplate
							);
							this.mapInstances[i].graphics.add(newGraphic);
							if (newGraphic.getShape()) {
								newGraphic.getShape().moveToFront();
							}
						}
					} else {
						this.mapInstance.graphics.add(graphic);
					}
				},

				/**
             * Add multiple graphics to the map graphics layer.
             *
             * @method addGraphics
             * @param {Graphics[]} graphics - array of features to be added.
             * @param {string} color - name of color for the graphix to be added.
             */
				addGraphics: function(graphics, color, allMapInstances) {
					if (graphics.length === 0) {
						return;
					}
					var geometry = graphics[0].geometry;
					var symbol = this.getSymbol(geometry, color);
					for (var x = 0; x < graphics.length; x++) {
						var g = graphics[x];
						g.symbol = symbol;
						if (allMapInstances) {
							for (var i = 0; i < this.mapInstances.length; i += 1) {
								var newGraphic = new Graphic(g.geometry, g.symbol, g.attributes, g.infoTemplate);
								this.mapInstances[i].graphics.add(newGraphic);
								if (newGraphic.getShape()) {
									newGraphic.getShape().moveToFront();
								}
							}
						} else {
							this.mapInstance.graphics.add(g);
						}
					}
				},

				/**
             * Set (change) the symbol of the given graphic.
             *
             * @method setSymbol
             * @param {Graphic} graphic - the graphic whose symbol is to be set.
             * @param {string} color - name of the color to use as a fill color.
             */
				setSymbol: function(graphic, color) {
					var symbol = this.getSymbol(graphic.geometry, color);
					graphic.setSymbol(symbol);
				},

				/**
             * Determine symbol for graphic based on supplied color and geometry type.
             *
             * @method getSymbol
             * @param {Geometry} geometry - the geometry to be symbolized.
             * @param {string} color - name of the color to use as a fill color.
             * @returns {Symbol}
             */
				getSymbol: function(geometry, color) {
					var symbol, dojoColor;
					color = typeof color === 'undefined' ? 'cyan' : color;

					switch (color) {
						case 'cyan':
							dojoColor = new Color([ 0, 255, 255, 0.35 ]);
							break;
						case 'yellow':
							dojoColor = new Color([ 255, 255, 0, 0.5 ]);
							break;
						case 'red':
							dojoColor = new Color([ 255, 0, 0, 0.25 ]);
							break;
						case 'green':
							dojoColor = new Color([ 0, 255, 0, 0.25 ]);
							break;
						case 'blue':
							dojoColor = new Color([ 0, 0, 255, 0.25 ]);
							break;
						case 'grey':
							dojoColor = new Color([ 117, 117, 117, 0.5 ]);
							break;
					}

					switch (geometry.type) {
						case 'point':
							symbol = new SimpleMarkerSymbol(
								SimpleMarkerSymbol.STYLE_SQUARE,
								10,
								new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([ 255, 0, 0 ]), 1),
								dojoColor
							);
							break;
						case 'polyline':
							symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([ 255, 0, 0 ]), 2);
							break;
						case 'polygon':
							symbol = new SimpleFillSymbol(
								SimpleFillSymbol.STYLE_SOLID,
								new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([ 0, 255, 255 ]), 3),
								dojoColor
							);
							break;
						case 'extent':
							symbol = new SimpleFillSymbol(
								SimpleFillSymbol.STYLE_SOLID,
								new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([ 50, 50, 50 ]), 2),
								dojoColor
							);
							break;
						case 'multipoint':
							symbol = new SimpleMarkerSymbol(
								SimpleMarkerSymbol.STYLE_SQUARE,
								10,
								new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([ 255, 0, 0 ]), 1),
								dojoColor
							);
							break;
					}
					return symbol;
				},

				/**
             * Remove graphic from map graphics layer
             *
             * @method removeGraphic
             */
				removeGraphic: function(graphic, map) {
					if (map === undefined) {
						if (this.mapInstance !== null) {
							if (this.mapInstance.graphics !== null && graphic !== null) {
								this.mapInstance.graphics.remove(graphic);
							}
						}
					} else {
						if (map !== null) {
							if (map.graphics !== null && graphic !== null) {
								map.graphics.remove(graphic);
							}
						}
					}
				},

				/**
             * Clear all graphics from map graphics layer
             *
             * @method clearGraphics
             */
				clearGraphics: function() {
					if (this.mapInstances !== null) {
						for (var i = 0; i < this.mapInstances.length; i += 1) {
							if (this.mapInstances[i].graphics !== null) {
								this.mapInstances[i].graphics.clear();
							}
						}
					}
				},

				/**
            TODO: UPDATE COMMENTS
            Description

            @method Name
            @param {string} name - description.
            **/
				GetMapInitDataByID: function(mapID) {
					for (var i = 0; i < this.initializationData.maps.length; i++) {
						if (this.initializationData.maps[i].mapID === mapID) {
							return this.initializationData.maps[i];
						}
					}
					return undefined;
				}
			};
			// End prototype

			/**
         * Get the singleton instance of the map.
         *
         * @method getInstance
         * @returns {Map}
         */
			MapModel.getInstance = function() {
				// summary:
				//      Gets an instance of the singleton
				if (instance === null) {
					instance = new MapModel();
				}
				return instance;
			};

			return MapModel.getInstance();
		}
	);
})();
