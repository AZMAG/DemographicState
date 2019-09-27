var allTestFiles = [];

var TEST_REGEXP = /.*spec\.js$/;

Object.keys(window.__karma__.files).forEach(function (file) {
    if (TEST_REGEXP.test(file)) {
        allTestFiles.push(file);
    }
});

var dojoConfig = {
    parseOnLoad: true,
    aliases: [['domReady', 'dojo/domReady']],
    packages: [
        // hosted packages
        {
            name: 'esri',
            location: 'http://js.arcgis.com/4.11'
        }, {
            name: 'dojo',
            location: 'http://js.arcgis.com/4.11/dojo'
        }
    ],
    async: true
};


/**
 * This function must be defined and is called back by the dojo adapter
  * @returns {string} a list of dojo spec/test modules to register with your testing framework
 */
window.__karma__.dojoStart = function () {
    return allTestFiles;
}