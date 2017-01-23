# CHANGELOG #
#### State Demographics Map Viewer ####

[![Semver](http://img.shields.io/SemVer/2.0.0.png)](http://semver.org/spec/v2.0.0.html)

All notable changes to this project will be documented in this file.

Releases will be numbered with the following format:

**`<major>.<minor>.<patch>`**

And constructed with the following guidelines:

1. **MAJOR** version when you make incompatible API changes **bumps the major** resets minor and patch
2. **MINOR** version when you add functionality in a backwards-compatible manner **bumps the minor** resets patch
3. **PATCH** version when you make backwards-compatible bug fixes and misc changes **bumps only the patch**

***************************************************************************************************************

## Version 2.3.3 | 1/23/2017
* Added Title 6 tab to the MPO/COG reporting window
* Changed wording from MAG Viewer to Viewer

## Version 2.3.3 | 12/13/2016
* Fixed bug in advanced query when census fields weren't used no data would be brought in. The query now uses an acs query string and uses the resulting geoids to lookup census block groups.

## Version 2.3.2 | 11/30/2016

* Fixed block group values in custom summary and advanced query.
* Updated advanced query url to the correct census url.
* Fixed popup for Legislative Districts.
* Fixed extra block groups tab bug.
* Added Print titles to Occupation cbr items.
* Updated search census layer to work correctly and not open a summary window.

## Version 2.3.1 | 11/28/2016

* fixed COG/MPO Popup information
* fixed PDF doc issue with basemap
* updated mxd info

## Version 2.3.0 | 11/28/2016

* Added COG/MPO Summary Reports
* Added COG/MPO PDF reports
* Added COG/MPO Boundaries
* updated panelHelp-view.html with new info
* updated mainHelp-view.html with new info
* linted javascript code

## Version 2.2.11 | 07/22/2016

* Added loading splash screen
* Small spelling mistake
* Updated excel reports to have accurate headers and source label.

## Version 2.2.10 | 06/24/2016

* Fixed bug in comparison checkbox
* Fixed data issue in Advanced Query dropdowns
* Fixed loading icon
* Fixed Export bug for Selected Block Groups

## Version 2.2.9 | 06/14/2016

* Added Summary Link to all popups
* Add popup to counties layer
* Fixed bug in IE showing summary comparison reports

## Version 2.2.8 | 06/13/2016

* Fixed PDF reports - new service URL location
* Fixed issue with excel report button not repeatable
* Remove state query from age pyramid chart

## Version 2.2.7 | 05/27/2016

* Updated share functionality to work better with multiple map frames.
* Added image for sharing functionality.
* Updated interactive summary to include selected graphics.

## Version 2.2.6 | 05/24/2016

* Fixed bug in base-layer operation - base-layer disappeared after imagery layer turned on/off

## Version 2.2.5 | 05/23/2016

* Fixed bug Imagery layer turns off when other layers are turned on.
* Fixed Facebook settings in share
* Fixed Subscribe image

## Version 2.2.4 | 05/10/2016

* Changed cbr view to reflect hierarchy
* Clean up.
* Source Label (removed K)
* Updated help windows
* Changed from Jurisdiction to Place
* Changed series labels to prevent overlapping
* Update copyright information.

## Version 2.2.3 | 05/04/2016

* Fixed some data sources and fixed bug with legend layer checkboxes being in sync when using multiple map frames.

## Version 2.2.2 | 04/28/2016

* Fixed source label on tab switch

## Version 2.2.1 | 04/28/2016

* Fixed some typos and minor issues pointed out by Amanda

### Version 2.2.0 | 04/25/2016

* Updated percent field to calculate instead of relying on service percentage values
* Fixed comparison dropdown bug
* Attached new PDF reports

### Version 2.1.9 (04/11/2016)

* Changed age pyramid to combine 18-19, 20 and 21 to one group.  Reversed layout.

### Version 2.1.8 (04/06/2016)

* Fixed custom summary.  Now makes 2 requests to census and acs layers.
* Added new charts in the acs charts tab in reports.  This includes age pyramid charts and occupation charts.
* Fixed compare feature to account for new data tabs.
* Fixed search to relfect new data layers.
* Updated advanced query to get data from both census and ACS layers.
* Added new fields to cbr treeview
* Toggle source label info when user clicks different tabs
* Added new dependency (d3.js) to project.
* Fixed excel export to work with our new tabs.
* Fixed display legend checkbox

### Version 2.1.7 (03/29/2016)

* Added second tab to demographic view to separate acs and census data
* Updated config files to new service and to correct layer

### Version 2.1.6 (03/28/2016)

* Converted Excel reports to client side kendo exporting.

### Version 2.1.5 (03/1/2016)

* fixed service url for advanced query

### Version 2.1.4 (02/10/2016)

* updated service URL

### Version 2.1.3 (02/04/2016)

* fixed bug in PDF reports

### Version 2.1.2 (02/04/2016)

* fixed bug to ensure multiple map frame layers stay in sync
* ensure Reports open in new tab
* fix bug in search that was preventing jurisdiction search to work
* fixed count of selected block groups
* linted js files

### Version 2.1.1 (02/02/2016)

* updates to node_modules
* linted js files
* updated grunt files

### Version 2.1.0 (01/28/2016)

* added legend items for each layer
* fixed issue with chart labels being cut off in reports.  Simply made radius of pie charts smaller.
* fixed a bug when trying to print map with multiple map frames.
* added print map format choice.  Now allows jpg
* replaced advanced query with new ui.
* added info window links to open summary windows.
* fixed layer options to include place layer.
* made changes to markup tools.  Now updates properties of shapes on edit.

### Version 2.0.2 (10/14/2015)

* added Markup Tools

### Version 2.0.1 (10/14/2015)

* added print label to notify user only selected map will be printed
* added checkbox to interactive tools section
* fixed print map legend
* made changes to share functionality
* made changes to interactive reporting

### Version 2.0.0 (10/05/2015)

* added esri light gray basemap for maps basemap
* popups for both Congressional and Legislative Districts show representatives names and party
* added popups to the Legislative Districts layer
* added popups to the Congressional Districts layer
* updated to ArcGIS API for JavaScript `v3.14` - [v3.14] (https://developers.arcgis.com/javascript/)
* updated Kendo UI v2015.2.902 `Q2 2015 SP2` [Q2 2015 SP2] ()
* updated knockout to 2.2.0 via CDN - [knockout] (http://cdnjs.com/libraries/knockout/2.2.0)
* updated modernizr to `v2.8.3` via CDN - [modernizr] (http://cdnjs.com/libraries/modernizr)
* updated html5shiv to `v3.7.3` via CDN - [html5shiv] (https://cdnjs.com/libraries/html5shiv)
* updated respond.js to `v1.4.2` via CDN - [respond.js] (https://cdnjs.com/libraries/respond.js)
* updated normalize.css to `v3.0.3` - [normalize.css] (https://necolas.github.io/normalize.css/)

### Version 1.6.0 (03/02/2015)

* when Legislative summary button is selected it turns on the Legislative boundaries and turns off the county boundaries
* when Congressional summary button is selected it turns on the Congressional boundaries and turns off the county boundaries
* add check-box option for Congressional Districts
* add check-box option for Legislative Districts

### Version 1.5.1 (02/23/2015)

* fix comparison button for Legislative Summary
* fix comparison button for Congressional Summary

### Version 1.5.0 (02/23/2015)

* added legislative Districts
* added Congressional Districts
* updated data to ACS 2009-2013

### Version 1.4.0 (01/14/2015)

* updates to css files
* new arrangement of `Reports Window` and `Legend Window`
* changed lod method
* updated mxd file - now has all info for viewer
* updated ACS files

### Version 1.3.1 (11/19/2014)

* cleaned up some kendo ui code
* removed unnecessary widow vw

### Version 1.3.0 (11/19/2014)

* add closing of reports window if interactive summary is null
* moved selected block group config to the demographic config file
* change basemap layer from ESRI's Terrain Layer to World Street Layer
* update Facebook SDK
* upgrade ArcGIS API for JavaScript update `v3.11`
* turn on Google Analytics
* move favicon
* Kendo UI `Kendo UI Web Q1 2013 SP1 - v2013.1.514` [Site] (http://www.telerik.com/support/whats-new/kendo-ui/release-history)

### Version 1.2.0 (10/31/2014)

* Added 'Contacts' button
* created 'contacts-view.html'
* created 'contact-vm.js'
* created 'contactLaunchbar-vm.js'
* Added Indian Communities and Places to Reports section
* updated 'index.html'
* updated 'demographicConfig.js'
* updated 'config.js'
* updated 'main.css'
* updated 'main.js'
* updated 'demographic-vm.js' for modified statewide reports output
* updated 'panel-view.html'
* updated 'legal-view.html'
* updated 'socialHelp-view.html'
* updated 'social-view.html'
* updated 'mainHelp-view.html'
* updated 'panel-vm.js'
* updated 'demographic-vm.js'
* added 'AZ-COG-MPO-logo.jpg' as new header logo
* added 'stateFavicon.png' as favorites icon

### Version 1.0.0 (10/21/2014)

* Creation Date 10/21/2014

========================================================================================>
### Build Changes prior to State Demographics Viewer Build
========================================================================================>
### Version 2.2.0 (09/17/2014)

* updated email-vm to open in center of page
* changed style of control buttons

### Version 2.1.0 (09/16/2014)

* updated to ArcGIS JavaScript API v3.10
* fixed spelling error in demographic select features Help
* fixed spelling error in Legend Help
* fixed error when help menu was called
* fixed query builder reset value problem for subject selection
* changed loader icon
* loader icon site [Loader Icon] (http://preloaders.net/en/search/gear)
* fixed spelling error in Advanced Query
* minimize and concatenate css files
* remove any NaN from summary reports
* restyle comparison CheckBox it was too large
* change council districts comparison to cities not county

### Version 2.0.0 (09/09/2014)

* made change to `demographicConfig.js` name of age categories
* made updates to main help menu
* removed new age categories from charts
* fixed linting issues in `demographic-vm.js`
* updated `demographicConfig.js`
* updated `demographic-vm.js`
* updated `panel-vm.js`
* updated `panel-view.html`
* updated `panelHelp-view.html`
* adding new buttons to Reports Menu - `Council District Summary` `Supervisor District Summary`
* adding Municipal Council Districts `Maricopa County Only`
* adding Maricopa County Supervisory Districts

### Version 1.3.0 (09/04/2014)

* added new color to seriesColors config - total 12
* fixed error in seriesColors config
* added new age categories
* updated config files to not use hard coded urls
* updated Census files - changed rest endpoint

### Version 1.2.1 (08/29/2014)

* fixed error to `Housing Units per Sq Mi`

### Version 1.2.0 (07/02/2014)

* made changes to LOD config - removed level 8
* made changes to MAG logo sizes
* changed map title from `Demographic Maps Viewer` to `Demographic Viewer`
* added legal terms as modal window to main help window
* files added `legal-vm.js` `legal-view.html`

### Version 1.1.1 (06/24/2014)

* added version number and date to help/info - configurable in appConfig file

### Version 1.1.0 (05/14/2014)

* Fixed Document Mode - Changed from IE=EDGE to IE=9, IE=10, fixed IE=11 problems
* use `<!doctype html>` instead of `<!DOCTYPE html>`
* remove IE conditional classes per HTML5 Boilerplate
* updated to [ArcGIS JavaScript API 3.9] (https://developers.arcgis.com/javascript/index.html)
* updated to [Modernizr v2.8.0] (http://modernizr.com/)
* updated to [html5shiv v3.7.2] (http://www.jsdelivr.com/#!html5shiv)
* updated to [Respond.js v1.4.2] (https://github.com/scottjehl/Respond)
* updated to [Require.js v2.1.11] (http://requirejs.org/)
* updated to [Normalize.css v3.0.1] (http://necolas.github.io/normalize.css/)
* changes to css for HomeButton reduce border to 1px
* add concatenated and minified css file to project
* removed console.log from demographic-vm.js

### Version 1.0.2 (03/27/2014)

* added Grunt Files
* linted js files

### Version 1.0.1 (02/25/2014)

* fixed Median Age in Demographics Summary Report so that it does not sum
* fixed Median Household Income in Demographics Summary Report so that it does not sum
* fixed Median Housing Values in Demographics Summary Report so that it does not sum
* fixed Median Rent in Demographics Summary Report so that it does not sum
* added conditional statement to demographic-vm to allow median values when single track/value is selected

### Version 1.0.0 (01/28/2014)

* went live - [Live Site] (http://geo.azmag.gov/maps/demographic)
* deprecated sliver light site - [Deprecated Site] (http://geo.azmag.gov/maps/demographic_sl)
* changed test links to new live links


### Version 0.3.1 (01/09/2014)

* updated url's to census data
* now using ACS data from 2008-2012
* changed PLACE_NAME to NAME10 in demographicConfig.js
* changed the styling of the homeButton
* reconfigured legend with kendo panel menu for layer options
* retooling title bar for responsive CSS
* updated printing layouts
* added new printing layouts
* changed CSS styles to be more mobile friendly
* updated language in help menus

### Version 0.3.0 (01/06/2014)

* updated to ArcGIS API for JavaScript - Version 3.8
* added Verify button on advanced Query
* updated help menus
* styled chart area in demographic viewer
* changed display formate of info in chart area
* added tabs to the main help menu
* Summary Report - take out % where there is not data
* Summary Report - add divider to main header when comparison is checked
* change selected features to selected block groups
* changed legend titles for bar graphs

### Version 0.2.0 (12/04/2013)

* updated advanced query files (GISi)
* added humans.txt file (html5 boilerplate)
* added robots.txt file (html5 boilerplate)
* added 404.html file (html5 boilerplate)
* added modernizer-2.6.2.min (html5 boilerplate)
* added crossdomian.xml (html5 boilerplate)
* added Knockout2.2.0
* added HTML5 enabling script (Remy Sharp)
* added "County" field to the selected block groups window (demographic-vm.js)
* changed server setting allowing a query of up to 3,000 features
* changed default color settings for each map group (cbrConfig.js)

### Version 0.1.2 (12/03/2013)

* made changes to demographic-vm and kendo grid table for comparisons
* added meta tags to index page
* added Google analytics --still needs ID code
* updated help window titles

### Version 0.1.1 (11/12/2013)

* custom media queries for better look on mobile devices
* fixed kendo grid order
* modified GET button on reports tab
* changed the dpi on the printing function to 96 from 300 to increase print speed
* fixed sort order of cites in drop down menu
* removed densities from tables in reports
* added ability to compare cites in custom summary report
* updated data so there are no NO DATA blank areas
* added collapse menus when new menu is clicked on reports tab
* added source data text to legend
* updated help menus
* added alert when query is over 1,000 records
* added zoom to function when city/town or custom summaries are used
* updated print/export icons in Selected Features and Summary Report to show excel icon

### Version 0.1.0 (05/22/2013)

* ArcGIS API for JavaScript - Version 3.7
* kendo

## Resources / Examples

- ***ESRI REST services***

    * http://server.arcgisonline.com/ArcGIS/rest/services
    * http://services.arcgisonline.com/ArcGIS/rest/services

- ***Blog resorces***

    * http://blogs.esri.com/esri/arcgis/2009/07/13/the-map-sandwich/
    * http://blogs.esri.com/esri/arcgis/2011/09/29/esri-canvas-maps-part-i-author-beautiful-web-maps-with-our-new-artisan-basemap-sandwich/
    * https://developers.arcgis.com/en/javascript/jsapi/basemaplayer-amd.html#basemaplayer1

- ***jQuery Scrollbar ref***

    * http://manos.malihu.gr/jquery-custom-content-scroller/
    * http://www.yuiazu.net/perfect-scrollbar/

- ***TOC ref***

    * http://gmaps-utility-gis.googlecode.com/svn/tags/agsjs/latest/examples/toc.html
    * http://www.roktech.net/_blog/ROK_Blog/post/ArcGIS_Server_JS_API_-_Table_of_Contents_%28TOC%29_Example/
    * http://maps.roktech.net/demo/toc_example/index.htm
    * http://driskull.github.io/arcgis-dijit-layer-legend-js/

- ***Social Buttons ref***

    * google - https://developers.google.com/+/web/+1button/
    * facebook - http://developers.facebook.com/docs/plugins/like-button/
    * linked in - http://developer.linkedin.com/plugins/share-plugin-generator
    * twitter - https://twitter.com/about/resources/buttons#tweet
    * http://www.blackfishweb.com/blog/asynchronously-loading-twitter-google-facebook-and-linkedin-buttons-and-widgets-ajax-bonus

- ***Media Screens ref***

    * http://stephen.io/mediaqueries/
    * http://www.kendoui.com/blogs/teamblog/posts/13-01-22/responsive_design_with_twitter_bootstrap.aspx

- ***Cache Question***

    * http://resources.arcgis.com/en/help/arcgisonline-content/index.html#//011q00000005000000

- ***Icons***

    * http://icongal.com/gallery/icon/30866/128/close

- ***Demos***

    * http://demo.dtsagile.com/backbone/MapExtent
    * http://demo.dtsagile.com/backbone/SearchApp