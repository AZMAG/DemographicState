<div>
  <span>
  <a href="http://www.azmag.gov/">
    <img
      alt="MAG"
      src="https://maps.azmag.gov/images/logos/MAG-logo.png"
      width="200"
    />
   </a>
  </span>
  <span>
  <a href="https://geo.azmag.gov/maps/azdemographics/">
    <img
      alt="Neighborhood Explorer"
      src="https://maps.azmag.gov/images/viewer-icons/icon_statewide-demographics.png"
      width="130"
    />
  </a>
  </span>
</div>

# Arizona Demographics

Map viewer for selected census info for Arizona

[![Website](https://img.shields.io/website-up-down-green-red/http/shields.io.svg?label=my-website)](http://geo.azmag.gov/maps/azdemographics/)
[![GitHub version](https://badge.fury.io/gh/AZMAG%2fmap-Demographic-Statewide.svg)](https://badge.fury.io/gh/AZMAG%2fmap-Demographic-Statewide)
[![GitHub issues](https://img.shields.io/github/issues/AZMAG/map-Demographic-Statewide.svg)](https://github.com/AZMAG/map-Demographic-Statewide/issues)
[![dependencies](https://david-dm.org/AZMAG/map-Demographic-Statewide.png)](https://david-dm.org/AZMAG/map-Demographic-Statewide)
[![devDependency Status](https://david-dm.org/AZMAG/map-Demographic-Statewide/dev-status.png)](https://david-dm.org/AZMAG/map-Demographic-Statewide)
[![Semver](http://img.shields.io/SemVer/2.0.0.png)](http://semver.org/spec/v2.0.0.html)
[![Built with Grunt](http://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Arizona Demographics is one of the Maricopa Association of Governments interactive mapping and analysis sites, showing selected population and housing data. The viewer allows you to graphically view selected population and housing data for all Census block groups for the State of Arizona. The viewer provides interactive mapping and reporting tools to allow exploration of data from Census 2010 and the American Community Survey (ACS) 2013-2017.

Use this site to explore Explore data from Census 2010 and American Community Survey (ACS) 2013-2017.

This web app viewer was developed by MAG staff for MAG member agencies and the public using ESRI's JavaScript API.

## Keywords

`Demographics` `Census` `2010` `American Community Survey` `ACS` `2013-2017` `5yr` `Counties` `State` `Arizona` `Maps` `MAG` `ESRI` `#MAGmaps`

## Version

Releases will be numbered with the following format:

**`<major>.<minor>.<patch>`**

And constructed with the following guidelines:

1. **MAJOR** version when you make incompatible API changes **bumps the major** resets minor and patch
2. **MINOR** version when you add functionality in a backwards-compatible manner **bumps the minor** resets patch
3. **PATCH** version when you make backwards-compatible bug fixes and misc changes **bumps only the patch**

### version | 4.0.7 ###

* Updated | 2019-07-24

* Created | 2014-10-21

## Credits

Maricopa Association of Governments (MAG) and the MAG member agencies

## Site URL

-   [Arizona Demographics](http://geo.azmag.gov/maps/azdemographics/)

## Documentation

A detailed list of the changes and fixes in each version update can be found in the CHANGELOG.md.

-   [CHANGELOG](CHANGELOG.md)

## Resources

## Examples

## Dependencies

-   [git-labelmaker](https://github.com/himynameisdave/git-labelmaker?utm_source=hashnode.com)

## Legal Disclaimer

The Maricopa Association of Governments provides the data within these pages as a public resource of general information for use "as is." The Maricopa Association of Governments GIS (Geographic Information System) departments provides this information with the understanding that it is not guaranteed to be accurate, correct or complete and any conclusions drawn from such information are the sole responsibility of the user. Further, the Maricopa Association of Governments GIS departments makes no warranty, representation or guaranty as to the content, sequence, accuracy, timeliness or completeness of any of the spatial or database information provided herein. While every effort has been made to ensure the content, sequence, accuracy, timeliness or completeness of materials presented within these pages, the Maricopa Association of Governments GIS Departments assumes no responsibility for errors or omissions, and explicitly disclaims any representations and warranties, including, without limitation, the implied warranties of merchantability and fitness for a particular purpose. The Maricopa Association of Governments GIS Departments shall assume no liability for:

    1. Any errors, omissions, or inaccuracies in the information provided, regardless of how caused; or
    2. Any decision made or action taken or not taken by viewer in reliance upon any information or data furnished hereunder.

Availability of the Maricopa Association of Governments Map Server is not guaranteed. Applications, servers, and network connections may be unavailable at any time for maintenance or unscheduled outages. Outages may be of long duration. Users are cautioned to create dependencies on these services for critical needs.

THE FOREGOING WARRANTY IS EXCLUSIVE AND IN LIEU OF ALL OTHER WARRANTIES OF MERCHANTABILITY, FITNESS FOR PARTICULAR PURPOSE AND/OR ANY OTHER TYPE WHETHER EXPRESSED OR IMPLIED. In no event shall Maricopa Association of Governments become liable to users of these data, or any other party, for any loss or direct, indirect, special, incidental or consequential damages, including, but not limited to, time, money or goodwill, arising from the use or modification of the data.

To assist the Maricopa Association of Governments in the maintenance and/or correction of the data, users should provide the Maricopa Association of Governments GIS Departments with information concerning errors or discrepancies found in using the data. Please use the e-mail contact address at the bottom of the affected web page.

Please acknowledge the Maricopa Association of Governments (MAG) GIS as the source when Map Server data is used in the preparation of reports, papers, publications, maps, or other products.

## Copyright and Licensing

Code released under the MIT license.

A copy of the license is available in the repository's `LICENSE` file.

-   [LICENSE](LICENSE)

## Tests

Tests use [Intern](https://theintern.io/) 

More information on running and writing tests can be found in [TESTS.md.](test/TESTS.md)

## Build

You can build the compiled files by running the default grunt task from the root folder. Running the run task will also build the compiled files and spin up a node server the app will run on and watch for modified source code and rebuild after changes are saved.

`grunt` or `grunt run`

This will compile the files and place them in the **dist** folder for distribution.