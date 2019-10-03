define([
        "mag/utilities",
        "mag/config/config"

], function(
    utils,
    config
){

    var _parseURL= function(){
        var initStr = utils.qs("init");
        if (initStr) {
            return JSON.parse(initStr);
        }
    };

    var initConfig = {
        parsedData: _parseURL(),
        getExtent: function(){
            return this.returnObject(this.parsedData, 'extent')
        },
        getPanel: function(){
            return this.returnObject(this.parsedData, 'panel')
        },
        getTransparency: function(){
            return this.returnObject(this.parsedData, 'transparency')
        },
        getLegend: function(){
            return this.returnObject(this.parsedData, 'legend')
        },
        updateLayers: function(){
            if(this._objectExists(this.parsedData, 'visibleLayers')){
                this._updateConfig(this.parsedData.visibleLayers);
            }

        },
        mapDataFieldNameMatches: function(name){
            if (this._objectExists(this.parsedData, 'mapData')){
                if (this.parsedData.mapData.FieldName === name){
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        },
        checkBasemap: function(map) {
            if (this._objectExists(this.parsedData, 'basemap')) {
                if (this.parsedData.basemap === map) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return null;
            }
        },
        _objectExists: function(data, obj){
            if (typeof data !== 'undefined' && data.hasOwnProperty(obj)){
                return true;
            }
            else  {
                return false;
            }

        },
        _updateConfig: function(layers) {
            layers.forEach(function(layer) {
                config.layers.forEach(function (conf){
                    if (layer === conf.id) {
                        conf.visible = true;
                    }
                })
            })

        },
        returnObject: function(data, obj){
            if (this._objectExists(data, obj)){
                return data[obj];
            }
            else {
                return null;
            }
        }
        // extent: this.returnObject(this.parsedData, 'extent'), 
        // panel: this.returnObject(this.parsedData, 'panel'), 
        // transparency: this.returnObject(this.parsedData, 'transparency'), 
        // legend: this.returnObject(this.parsedData, 'legend'),        

    }

    
    return initConfig;
        // {
        //     mapDataFieldNameMatches: mapDataFieldNameMatches,
        //     updateLayers: updateLayers,
        //     checkBasemap: checkBasemap,
        //     extent: extent,
        //     panel: panel,
        //     transparency: transparency,
        //     legend: legend

        // }; 

});