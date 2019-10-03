define([
        "mag/utilities",
        "mag/config/config"

], function(
    utils,
    config
){



    var _parseURL = function(){
        var initStr = utils.qs("init");
        if (initStr) {
            return JSON.parse(initStr);
        }
    };

    var _objectExists = function(obj){
        if (obj !== 'undefined'){
            return true;
        }
        else  {
            return false;
        }

    };

    var _updateConfig = function(layers) {
        layers.forEach(function(layer) {
            config.layers.forEach(function (conf){
                if (layer === conf.id) {
                    conf.visible = true;
                }
            })
        })

    }

    var updateLayers = function(){
        if(_objectExists(parsedData.visibleLayers)){
            _updateConfig(parsedData.visibleLayers);
        }

    };

    var mapDataFieldNameMatches = function(name){
        if (_objectExists(parsedData.mapData)){
            if (parsedData.mapData.FieldName === name){
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }


    var checkBasemap = function(map) {
        if (_objectExists(parsedData.basemap)) {
            if (parsedData.basemap === map) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

    var return_object = function(data, obj){
        if (_objectExists(data[obj])){
            return data[obj];
        }
        else {
            return false;
        }
    }

    var parsedData = _parseURL();
    var extent = return_object(parsedData, 'extent'); 
    var panel = return_object(parsedData, 'panel'); 
    var transparency = return_object(parsedData, 'transparency'); 
    var legend = return_object(parsedData, 'legend'); 


    return {
        mapDataFieldNameMatches: mapDataFieldNameMatches,
        updateLayers: updateLayers,
        checkBasemap: checkBasemap,
        extent: extent,
        panel: panel,
        transparency: transparency,
        legend: legend

    }; 

});