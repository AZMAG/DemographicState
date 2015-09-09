(function () {

    "use strict";

    define(

        function () {
            var interactiveToolConfig = new function () {
                var self = this;

                //This is the default value for the textbox that holds the value of the number of units to buffer in the buffering tool
                self.defaultBufferValue = 1;

                //his is a configurable list of units that can be used to buffer search areas.
                self.bufferUnits = [
                    { text: "Mile", value: esri.tasks.GeometryService.UNIT_NAUTICAL_MILE },
                    { text: "Kilometer", value: esri.tasks.GeometryService.UNIT_KILOMETER },
                    { text: "Feet", value: esri.tasks.GeometryService.UNIT_FOOT },
                    { text: "Meter", value: esri.tasks.GeometryService.UNIT_METER }
                ];

                //This is the default selected index in the unit selector for the buffering tool
                self.selectedBufferUnitIndex = 0;

                //This is the URl to the geometry service that performs the buffering for the buffering tool.
                self.geometryServiceURL = "http://geo.azmag.gov/gismag/rest/services/Utilities/Geometry/GeometryServer";

                //This is the spatial reference specified for the buffered area.
                self.bufferSpatialReference = { wkid: 26949 };

                // JSON respresentation of an ESRI Simple Fill Symbol
                // http://resources.arcgis.com/en/help/arcgis-rest-api/#/Symbol_Objects/02r3000000n5000000/
                self.selectionPointSymbol = {
                    type: "simplemarkersymbol",
                    style: "esriSFSNull",
                    color: [255, 0, 255, 191]
                };

                self.selectionSymbol = {
                    type: "esriSFS",
                    style: "esriSFSNull",
                    color: [0, 0, 0, 0],
                    outline: {
                        type: "esriSLS",
                        style: "esriSLSSolid",
                        color: [255, 0, 255, 191],
                        width: 3
                    }
                };

                self.bufferSymbol = {
                    type: "esriSFS",
                    style: "esriSFSNull",
                    color: [0, 0, 0, 0],
                    outline: {
                        type: "esriSLS",
                        style: "esriSLSDash",
                        color: [255, 0, 0, 191],
                        width: 3
                    }
                };
            };
            return interactiveToolConfig;
        }
    )
}());