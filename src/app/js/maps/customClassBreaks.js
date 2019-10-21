"use strict";
define([
        "mag/maps/maps-utils",
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (
        mapsutils,
        tp
    ) {
        tp.subscribe("layers-added", function () {
            let $customClassBreaksModal = $("#customClassBreaksModal");
            let $classBreakSliders = $("#classBreakSliders");
            let $classBreakSliderTooltips = $("#classBreakSliderTooltips");
            let $classBreaksCount = $("#classBreaksCount");
            let $btnClassBreaksEditor = $("#btnClassBreaksEditor");
            let sliders = [];
            let maxVal = 0;
            const minLabelSize = 13;
            const lyr = mapsutils.map.findLayerById("blockGroups").sublayers.getItemAt(0);
            let oldFld = 'TOTAL_POP';
            let currFld = 'TOTAL_POP';

            $btnClassBreaksEditor.click(function (e) {
                CbrParamChanged("Custom");
                e.preventDefault();
            });

            function CbrParamChanged(type) {

                //Saving the fld name when the map changes
                //This is used to determine whether to regenerate class breaks or use existing.
                oldFld = currFld;
                if (type.FieldName) {
                    currFld = type.FieldName;
                }

                if (type !== "custom") {
                    type = $("#classType").val();
                }

                if (type === "Custom") {
                    $customClassBreaksModal.modal("show");
                    $btnClassBreaksEditor.show();
                } else {
                    $btnClassBreaksEditor.hide();
                }
            }
            let once = false;
            $customClassBreaksModal.on('shown.bs.modal', function (e) {
                if (!once) {
                    SetupSplitter();
                    SetupCharts();
                }
            });

            function SetupSplitter(custom) {

                const rend = lyr.renderer;
                let infos = custom || rend.classBreakInfos;

                mapsutils.GetCurrentMapsParams().then(function (data) {

                    let sliderHeight = $classBreakSliders.height() - (infos.length - 1) * 7;
                    // maxVal = infos[infos.length - 1].maxValue;

                    if (data.classType === "Custom" && !custom) {
                        let cbrCount = $classBreaksCount.val();
                        let breaks = data.conf.breaks["Jenks" + cbrCount];

                        // This section trys to determine whether we should use the current breaks or set starting breaks
                        // based on the jenks lookup.
                        // Saving the map changes to be able to make sure if a new topic is chosen the breaks will always regenerate.
                        if (data.conf.FieldName === oldFld) {
                            if (data.cbInfos && data.cbInfos.length > 0) {
                                infos = data.cbInfos;
                            }
                        } else {
                            infos = mapsutils.GetCurrentBreaks(breaks, data.colorRamp);
                        }


                        // infos = mapsutils.GetCurrentBreaks(breaks, data.colorRamp);
                        // infos = data.cbInfos && data.cbInfos.length > 0 ? data.cbInfos : 
                        maxVal = infos[infos.length - 1].maxValue;
                    }

                    //Clear out old class break sliders
                    $classBreakSliders.html("");
                    $classBreakSliderTooltips.html("");

                    const panes = [];

                    for (let i = infos.length - 1; i >= 0; i--) {
                        const info = infos[i];
                        const clr = info.symbol.color;
                        const pct = (info.maxValue - info.minValue) / maxVal;
                        const paneSize = Math.floor(sliderHeight * pct);

                        sliders.push({
                            info: info,
                            clr: clr,
                            size: paneSize
                        });

                        let minLabel = mapsutils.numLabel(info.minValue);
                        let maxLabel = mapsutils.numLabel(info.maxValue);

                        if (info.label.includes("%")) {
                            minLabel = `${mapsutils.pctLabel(info.minValue)}%`;
                            maxLabel = `${mapsutils.pctLabel(info.maxValue)}%`;
                        }

                        if (i === infos.length - 1) {
                            $classBreakSliderTooltips.append(`
                            <div data-value="${info.maxValue}" style="margin-top: 3px;" id="sliderTooltip${i+1}" class="sliderTooltip">${maxLabel}</div>
                            `);
                        }
                        //Add Tooltip
                        $classBreakSliderTooltips.append(`
                        <div data-value="${info.minValue}" class="sliderTooltip" id="sliderTooltip${i}" style="margin-top: ${paneSize - 10}px">
                            <span class="sliderTooltipInnerLabel">${minLabel}</span>
                            <input style="display:none;" class="sliderTooltipInput k-textbox" >
                        </div>
                        `);

                        let showLabel = "none";
                        if (paneSize > minLabelSize) {
                            showLabel = "inline-block";
                        }

                        //Add pane
                        $classBreakSliders.append(`
                        <div class="cbPane" id="cbPane${i}"
                        style="display: flex; background-color:rgba(${clr.r},${clr.g},${clr.b},${lyr.opacity});">
                        <div class="paneLabel" style="display: ${showLabel}; margin: auto; font-size: 10.5px;">${info.label}</div>
                        </div>
                    `);

                        $classBreakSliders.find("#cbPane" + i).data("info", info);

                        const newPane = {
                            size: paneSize + "px",
                            resizable: true,
                            idx: i,
                            scrollable: false
                        };
                        panes.push(newPane);
                    }

                    let splitter = $classBreakSliders.data("kendoSplitter");
                    if (splitter) {
                        splitter.destroy();
                    }

                    $classBreakSliders.kendoSplitter({
                        orientation: "vertical",
                        panes: panes,
                        resize: UpdateRangeSliders
                    });
                });
            }

            //This really just updates the tooltips?
            function UpdateRangeSliders(e) {

                let resize = e.resizing || e.sender.resizing;

                if (resize && resize.previousPane && resize.nextPane) {

                    //Get Jquery elements for panes involved
                    let $prevPane = $(resize.previousPane);
                    let $nextPane = $(resize.nextPane);

                    let prevInfo = $prevPane.data("info");
                    let nextInfo = $nextPane.data("info");

                    // Get heights
                    let prevHeight = $prevPane.outerHeight();
                    let nextHeight = $nextPane.outerHeight();

                    //Get a pixel height for the total
                    //of the two affected panes
                    let totalHeight = prevHeight + nextHeight;

                    let prevMax = prevInfo.maxValue;
                    let nextMin = nextInfo.minValue;

                    let prevMin = (nextHeight / totalHeight) * (prevMax - nextMin) + nextMin;
                    let nextMax = prevMin;

                    //Update outside label
                    let $prevTooltip = $(`#sliderTooltip${$prevPane.attr("id").slice(-1)}`);
                    let $nextTooltip = $(`#sliderTooltip${$nextPane.attr("id").slice(-1)}`);

                    //Adjust height of the affected panes to properly align outside label
                    //Adding 7 to each height because of the height of the slider.
                    $prevTooltip.css("margin-top", prevHeight - 10);
                    $nextTooltip.css("margin-top", nextHeight - 10);


                    let $prevInnerLabel = $prevPane.find(".paneLabel");
                    let $nextInnerLabel = $nextPane.find(".paneLabel");

                    // update tooltip on left side of sliders
                    // Update inner label
                    if (prevInfo.label.includes("%")) {
                        const newPrevLabel = `${mapsutils.pctLabel(prevMin)}% - ${mapsutils.pctLabel(prevMax)}%`;
                        prevInfo.label = newPrevLabel;
                        $prevInnerLabel.html(newPrevLabel);

                        const newNextLabel = `${mapsutils.pctLabel(nextMin)}% - ${mapsutils.pctLabel(nextMax)}%`;
                        nextInfo.label = newNextLabel;
                        $nextInnerLabel.html(newNextLabel);

                        $prevTooltip.html(`<span class="sliderTooltipInnerLabel">${mapsutils.pctLabel(prevMin)}%</span>
                        <input style="display:none;" class="sliderTooltipInput k-textbox" >`);
                    } else {
                        const newPrevLabel = `${mapsutils.numLabel(prevMin)} - ${mapsutils.numLabel(prevMax)}`;
                        $prevInnerLabel.html(newPrevLabel);
                        prevInfo.label = newPrevLabel;

                        const newNextLabel = `${mapsutils.numLabel(nextMin)} - ${mapsutils.numLabel(nextMax)}`;
                        $nextInnerLabel.html(newNextLabel);
                        nextInfo.label = newNextLabel;

                        $prevTooltip.html(`<span class="sliderTooltipInnerLabel">${mapsutils.numLabel(prevMin)}</span>
                        <input style="display:none;" class="sliderTooltipInput k-textbox" >`);
                    }

                    //Update infos for next time...
                    prevInfo.minValue = prevMin;
                    prevInfo.maxValue = prevMax;
                    nextInfo.minValue = nextMin;
                    nextInfo.maxValue = nextMax;

                    $prevPane.data("info", prevInfo);
                    $nextPane.data("info", nextInfo);

                    //If pane height is greater than minimum minLabelSize, show label.
                    //Otherwise, hide
                    if (prevHeight > minLabelSize) {
                        $prevInnerLabel.show();
                    } else {
                        $prevInnerLabel.hide();
                    }
                    if (nextHeight > minLabelSize) {
                        $nextInnerLabel.show();
                    } else {
                        $nextInnerLabel.hide();
                    }
                }
            }

            //Sets up gray charts next to custom class breaks
            function SetupCharts() {
                let numberOfCharts = 50;
                let totalHeight = $classBreakSliders.height() + 2;
                let chartHeight = totalHeight / numberOfCharts;

                //Gets active map item
                let $activeItem = $("#mapsList").find(".activeMapItem");
                if ($activeItem) {
                    //Pull jquery data object from active map item
                    let conf = $activeItem.data("mapsConfig");
                    let $classBreakCharts = $("#classBreakCharts");
                    $classBreakCharts.html("");
                    let dataBins = {};
                    let wFactor = .4;
                    let q = {
                        where: "1=1",
                        outFields: [conf.FieldName],
                        returnGeometry: false,
                        orderByFields: [conf.FieldName + " DESC"]
                    };

                    if (conf.NormalizeField) {
                        q.outFields.push(conf.NormalizeField);
                    }

                    lyr.queryFeatures(q).then(function (res) {
                        let maxVal = res.features[0].attributes[conf.FieldName];
                        if (conf.NormalizeField) {
                            maxVal = maxVal / res.features[0].attributes[conf.NormalizeField];
                        }

                        let binInterval = maxVal / numberOfCharts;
                        res.features.forEach(row => {
                            let binNum = Math.floor(row.attributes[conf.FieldName] / binInterval);
                            if (conf.NormalizeField) {
                                binNum = Math.floor((row.attributes[conf.FieldName] / row.attributes[conf.NormalizeField]) / binInterval);
                            }

                            if (dataBins[binNum]) {
                                dataBins[binNum]++;
                            } else {
                                dataBins[binNum] = 1;
                            }
                        });

                        for (let i = numberOfCharts - 1; i >= 0; i--) {
                            let count = dataBins[i] || 0;
                            let w = Math.floor(count * wFactor);

                            //Adding a high limit to the width of the chart.
                            //This should probably be refactored at some point.
                            if (w > 300) {
                                w = 300;
                            }
                            $classBreakCharts.append(`
                        <div data-chart-id="chart${i}" class="classBreakChart"
                        style="font-size:10px;height:${chartHeight}px; width: ${w}px;"
                        data-toggle="tooltip" data-placement="right" title="${count}">
                        </div>
                        `);
                        }
                        //activate bootstrap tooltip
                        $classBreakCharts.find(".classBreakChart").tooltip();
                    });


                }
                // $classBreakSliderTooltips.on("click", ".sliderTooltip", function () {
                //     let $sliderTooltip = $(this);
                //     let $label = $sliderTooltip.find("span.sliderTooltipInnerLabel");
                //     $label.hide();
                //     let $sliderTooltipInput = $sliderTooltip.find(".sliderTooltipInput");
                //     let val = $sliderTooltip.data("value");
                //     $sliderTooltipInput.show();
                //     $sliderTooltipInput.val(val);
                //     $sliderTooltipInput.focus();

                //     $sliderTooltipInput.on("focusout", TooltipEditComplete)

                //     function TooltipEditComplete() {
                //         let $input = $(this);
                //         $input.hide();
                //         let newVal = $input.val();

                //         let $prevTooltip = $sliderTooltip.prev(".sliderTooltip");
                //         let $nextTooltip = $sliderTooltip.next(".sliderTooltip");

                //         let nextVal = $nextTooltip.data("value");
                //         let prevVal = $prevTooltip.data("value");

                //         if (newVal >= prevVal) {
                //             newVal = prevVal - 1;
                //         } else if (newVal <= nextVal) {
                //             newVal = nextVal + 1;
                //         }

                //         //update label
                //         $label.html(newVal);

                //         //Update dataval
                //         $sliderTooltip.data("value", newVal);

                //         //Update input for next edit
                //         $input.val(newVal);

                //         //Show label again
                //         $label.show();

                //         //Update panel info values
                //         //Gets slider number value
                //         let sliderId = $sliderTooltip.attr("id").replace(/^\D+/g, "");

                //         let $prevPane = $(`#cbPane${sliderId-1}`);
                //         let $nextPane = $(`#cbPane${sliderId}`);

                //         let prevInfo = $prevPane.data("info");
                //         let nextInfo = $nextPane.data("info");

                //         prevInfo.maxValue = Number(newVal);
                //         nextInfo.minValue = Number(newVal);

                //         $prevPane.data("info", prevInfo);
                //         $nextPane.data("info", nextInfo);

                //         SetupSplitter(mapsutils.GetCustomBreaks());

                //         //Call Update Range Sliders
                //         UpdateRangeSliders({
                //             resizing: {
                //                 previousPane: $(`#cbPane${sliderId}`),
                //                 nextPane: $(`#cbPane${sliderId-1}`)
                //             }
                //         })
                //     }

                //     //This ensures that a user doesn't enter a non-numeric character into the input
                //     $sliderTooltipInput.keydown(function (e) {
                //         //https://stackoverflow.com/questions/995183/how-to-allow-only-numeric-0-9-in-html-inputbox-using-jquery
                //         if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                //             // Allow: Ctrl+A, Command+A
                //             (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                //             // Allow: home, end, left, right, down, up
                //             (e.keyCode >= 35 && e.keyCode <= 40)) {
                //             // let it happen, don't do anything
                //             return;
                //         }
                //         // Ensure that it is a number and stop the keypress
                //         if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                //             e.preventDefault();
                //         }
                //     })

                // })
            }



            mapsutils.GetCustomBreaks = function (colorRamp) {
                // console.log(colorRamp);
                let classBreaks = [];
                let $panes = $classBreakSliders.find(".cbPane");

                $panes.each(function (i, val) {
                    let dataInfo = $(val).data("info");
                    dataInfo.symbol.color = colorRamp[$panes.length - 1 - i];
                    classBreaks.push(dataInfo);
                });
                return classBreaks.reverse();
            };
            $("#customClassBreaksButton").click(function () {
                tp.publish("customClassBreaks-selected");
                $customClassBreaksModal.modal("hide");
            });


            tp.subscribe("layers-added", CbrParamChanged);
            tp.subscribe("map-selected", CbrParamChanged);
            tp.subscribe("classType-change", CbrParamChanged);
            tp.subscribe("classBreaksCount-change", CbrParamChanged);
        });
    });
