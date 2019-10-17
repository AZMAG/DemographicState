'use strict';

define([
    'mag/config/config',
    'esri/tasks/QueryTask'
], function(
    config,
    QueryTask
) {
    let $loadingSpinner = $('.loading-container');
    
    var reportsutils = {
        selectedReport: {},
        GetData: async function(conf, geoids, geo) {
            $loadingSpinner.css('display', 'flex');

            let where = '1=1';
            if (geoids && geoids.length > 0) {
                let str = '';
                geoids.forEach(id => {
                    str += `'${id}',`;
                });
                where = `GEOID IN(${str.slice(0, -1)})`;
            }
            let q = {
                returnGeometry: true,
                outFields: ['*'],
                where: where,
                geometry: geo ? geo : null,
                orderByFields: ['GEOID']
            };

            let qt = new QueryTask({
                url: config.mainUrl + '/' + conf.ACSIndex
            });

            const acsPromise = qt.execute(q);

            qt.url = config.mainUrl + '/' + conf.censusIndex;
            q.returnGeometry = false;

            const censusPromise = qt.execute(q);

            const [acsData, censusData] = await Promise.all([
                acsPromise,
                censusPromise
            ]);

            this.selectedReport = {
                conf: conf,
                acsData,
                censusData
            };

            $loadingSpinner.css('display', 'none');

            return $.extend({}, this.selectedReport);
        }
    };

    return reportsutils;
});
