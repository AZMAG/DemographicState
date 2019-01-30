"use strict";
require(["dojo/topic", "dojo/domReady!"], function (tp) {
    //Cache Maps List Element
    let $mapsList = $("#mapsList");
    let configLookup = [];
    let counter = 0;
    tp.subscribe("map-loaded", function (panel) {
        // if (panel === "maps") {
        StartupMapsList();
        // }
    });

    //This is the function that helps generate the maps html.
    //It is called recursively, so all future levels of categories will work correctly
    function GetMapsHTML(items, cat) {
        let rtnHTML = "";
        for (let i = 0; i < items.length; i++) {
            const conf = items[i];
            if (conf.items) {
                rtnHTML += `
                        <div class="categoryItem">
                            <span class="expandBtn"><i class="fas fa-caret-right"></i></span>
                            <span>${conf.Name}</span>
                        </div>
                        <div class="mapSubItemList" style="display:none;">${GetMapsHTML(conf.items, conf)}</div>
                        `;
            } else {
                rtnHTML += `<div class="mapItem" data-category="${cat.ShortName}" data-lookup-id="${counter}">${conf.Name}</div>`;
                configLookup.push(conf);
                counter++;
            }
            return rtnHTML;
        }

        function StartupMapsList() {
            //Append html
            // console.log($mapsList, app);
            // console.log(GetMapsHTML(app.mapsConfig));

            $mapsList.append(GetMapsHTML(app.mapsConfig));

            let $initMap = null;
            //Attach Data using jquery.
            //Seems like this could be included in the function
            //above somehow to prevent the second iteration of all the map items.
            $mapsList.find(".mapItem").each(function (i, item) {
                const lookupId = $(item).data("lookup-id");
                const category = $(item).data("category");
                const data = configLookup[lookupId];
                data.category = category;

                $(item).data("mapsConfig", data);

                if (app.initConfig && app.initConfig.mapData) {
                    if (app.initConfig.mapData.FieldName === data.FieldName) {
                        $initMap = $(this);
                    }
                }
            });

            //Use the initial field from the query params
            //or defaults to the first map item if there are none.
            if ($initMap) {
                $initMap.addClass("activeMapItem");
                let $allParents = $initMap.parentsUntil("#mapsList");
                $allParents.show();
                $.each($allParents, function (i, val) {
                    $(val).prev().find(".expandBtn").find(".fa-caret-right").toggleClass("fa-caret-right fa-caret-down");
                });
            } else {
                $mapsList.find(".mapSubItemList").first().show().find(".mapItem").first().addClass("activeMapItem");
                $mapsList.find(".fa-caret-right").first().toggleClass("fa-caret-right fa-caret-down");
            }

            //Handles click event for category items in the maps panel.
            //This seems like it could be simplified
            $mapsList.find(".categoryItem").click(function () {
                let $clickedSubList = $(this).next();
                let isVisible = $clickedSubList.is(":visible");
                let hasParent = $(this).closest(".mapSubItemList");
                let $icon = $(this).find("i");

                if (hasParent.length === 0) {
                    // Resets all other categories
                    $mapsList.find(".mapSubItemList").slideUp();
                    $mapsList
                        .find(".fa-caret-down")
                        .removeClass("fa-caret-down")
                        .addClass("fa-caret-right");
                } else {
                    if (isVisible) {
                        $clickedSubList.slideUp();
                        $icon.toggleClass("fa-caret-down fa-caret-right");
                    }
                }
                if (!isVisible) {
                    $clickedSubList.slideDown();
                    $icon.toggleClass("fa-caret-right fa-caret-down");
                }
            });

            //Handles click event for map items
            $mapsList.find(".mapItem").click(function () {
                $mapsList.find(".activeMapItem").removeClass("activeMapItem");
                $(this).addClass("activeMapItem");
                tp.publish("map-selected", $(this).data("mapsConfig"));
            });
        }
    }
});
