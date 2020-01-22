'use strict';

define([
    '../config/config',
    'magcore/utils/reports'
], function(
    config,
    reports
) {
    let $loadingSpinner = $('.loading-container');
    
    var reportsutils = {
        selectedReport: {},
        GetData: async function(conf, geoids, geo) {
            let url = config.mainUrl;
            $loadingSpinner.css('display', 'flex');
            this.selectedReport = await reports.queryGeoIds(conf, url, geoids, geo)
            $loadingSpinner.css('display', 'none');

            return $.extend({}, this.selectedReport);
        }
        
    };

    return reportsutils;
});
