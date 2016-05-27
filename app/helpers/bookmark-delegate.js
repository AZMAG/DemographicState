/**
 * Provides methods for communicating with a map service layer.
 *
 * @class layer-delegate
 */


(function() {
    "use strict";

    define([
            "dojo/_base/lang",
            "dojo/topic",
            "app/models/map-model"
        ],

        function(lang, topic, MapModel) {

            var BookmarkDelegate = {

                //Contains a single map extent for all map objects
                mapExtent: ko.observable(), //still used
                //Contains a single list of selected base maps for all map instances
                legendLayerOptions: ko.observableArray(), //still used
                //This is an array of of the data for all existing maps. This is used when the bookmarking query string is built.
                mapInfoList: ko.observableArray().extend({
                    notify: "always"
                }),

                /**
                This method updates mapInfoList with the data from all of the maps.

                @method mapInfoUpdated
                @param [object] infoList - array of objects representing the settings of all of the maps in the application
                **/
                mapInfoUpdated: function(infoList) {
                    //console.log(infoList);
                    this.mapInfoList.removeAll();
                    for (var i = 0; i < infoList.length; i++) {
                        var classMethod = "";
                        var breaks = [];
                        if (infoList[i].customBreaks && infoList[i].customBreaks.breaks) {
                            classMethod = "custom";
                            for (var j = 0; j < infoList[i].customBreaks.breaks.length; j++) {
                                breaks.push([infoList[i].customBreaks.breaks[j].minValue, infoList[i].customBreaks.breaks[j].maxValue]);
                            }
                        } else if (infoList[i].Renderer) {
                            classMethod = infoList[i].Renderer.classificationMethod;
                        }
                        this.mapInfoList.push({
                            mapID: infoList[i].ID,
                            mapOpacity: infoList[i].Opacity,
                            selectedMap: (infoList[i].MapInfo) ? {
                                ShortName: infoList[i].MapInfo.ShortName.replace("%", "{percent}")
                            } : "",
                            classMethod: classMethod,
                            layers: infoList[i].Layers,
                            colorPalet: {
                                ramp: (infoList[i].CBRCurrent) ? infoList[i].CBRCurrent : "",
                                numBreaks: (infoList[i].ColorRamp) ? infoList[i].ColorRamp.length : 0
                            },
                            breaks: breaks
                        });
                    }
                    this.mapExtent(infoList[0].Extent.toJson());
                    //console.log(this.mapInfoList());
                    var queryString = this.buildMapQueryString();
                    console.log(queryString);
                },

                /**
                This function builds the querystring for bookmarking based on the map data in the client.

                @method buildMapQueryString
                **/
                buildMapQueryString: function() {

                    var queryString = "data={\"maps\":[";
                    for (var i = 0; i < this.mapInfoList().length; i++) {
                        queryString = queryString + JSON.stringify(this.mapInfoList()[i]);
                        if (i !== this.mapInfoList().length - 1) {
                            queryString = queryString + ",";
                        }
                    }
                    //queryString = queryString + "],\"LO\":" + JSON.stringify(this.legendLayerOptions()) + ",\"E\":" + JSON.stringify(this.mapExtent()) + "}";
                    queryString = queryString + "],\"E\":" + JSON.stringify(this.mapExtent()) + "}";
                    //console.log(queryString);
                    return "?" + queryString;
                },

                /**
                This function takes any querystring and turns it into an initialization object used to initialize the application on load.

                @method mapInfoUpdated
                @param {string} queryString - The querystring on the current URL. If it is not provided then the function will use the window object to get the querystring if any is present.
                **/
                getQueryStringMapDataObj: function(queryString) {
                    var url = (queryString) ? queryString : window.location.toString();
                    var savedMapObj;
                    if (url.indexOf("?") > -1) { //querystring present
                        var queryString = decodeURIComponent(url.substring(url.indexOf("?data=") + 6)); //The ?data= is trimmed from the begenning of the query string
                        try {
                            savedMapObj = JSON.parse(queryString);
                            for (var i = 0; i < savedMapObj.maps.length; i++) {
                                savedMapObj.maps[i].selectedMap.ShortName = savedMapObj.maps[i].selectedMap.ShortName.replace("{percent}", "%");
                            }
                        } catch (e) {
                            console.log(e); //log the issue to the console.
                        }

                    }
                    return savedMapObj;
                },

                /**
                This method calls to bitly to shorten the URL for sharing

                @method mapInfoUpdated
                @param {string} bigurl - The application URL with the bookmarking data.
                @param {function} callback - This function is executed when the AJAX call is completed.
                **/
                minifyURL: function(bigurl, callback) {
                    // console.log(bigurl);
                    $.getJSON("http://api.bitly.com/v3/shorten?callback=?", {
                            format: "json",
                            apiKey: appConfig.URLMinimizer.apiKey,
                            login: appConfig.URLMinimizer.login,
                            longUrl: bigurl
                        },
                        function(response) {
                            //console.log(response.data.url);
                            callback(response.data.url);
                        }
                    );
                },

                /**
                This method appends the bookmarking data to the end of the application URL.

                @method appendBookmarkDataToCurrentURL
                **/
                appendBookmarkDataToCurrentURL: function() {
                    window.location.search = this.buildMapQueryString(true);
                }

            };

            return BookmarkDelegate;

        });
}());
