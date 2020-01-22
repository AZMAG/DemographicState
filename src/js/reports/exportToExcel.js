"use strict";
define([
        "../config/acsFieldsConfig",
        "../config/config",
        "dojo/topic"
    ],
    function (
        acsFieldsConfig,
        config,
        tp
    ){
    tp.subscribe("excel-export", exportToExcel);
   

    async function exportToExcel(params) {
    let grid = params.grid;
    let title6Grid = params.title6Grid.data("kendoGrid");
    // console.log(params);
    let selectedReport = params.title;
    // let selectedReport = $("#specificReport").find(":selected").text();
    let fileName = selectedReport + "_Demographic_Report.xlsx";
    let sourceLabel = config.sourceLabel;
    let disclaimer = config.legalACSDisclaimer;

    let rowSpan = 11;

    function GetTitle6Data() {
        return new Promise(function(resolve, reject) {
            if (title6Grid) {
                title6Grid.bind("excelExport", function(e) {
                    e.preventDefault();
                    resolve(e);
                })
                title6Grid.saveAsExcel();
            } else {
                resolve(undefined);
            }
        });
    }

    const title6Data = await GetTitle6Data();

    grid.bind("excelExport", function(e) {

        let rows = e.workbook.sheets[0].rows;
        let columns = e.workbook.sheets[0].columns;
        columns[1].width = 290;

        $.each(rows, function(i, row) {
            if (row.type === "header") {
                $.each(row.cells, function(i, cell) {
                    cell.background = "#8DB4E2";
                    cell.bold = true;
                    cell.color = "#000";

                    if (cell.value) {
                        cell.value = cell.value.replace("tableHeader", "");
                    }

                });
            } else if (row.type === "group-header") {
                row.cells[0].value = row.cells[0].value.substring(37);
                row.cells[0].background = "#000";
                row.cells[0].color = "#fff";
                row.cells[0].bold = true;
            } else {
                $.each(acsFieldsConfig, function (j, el) {
                    if (el.tableHeader === row.cells[1].value) {
                        if (el.tableHeader.includes("Minority")) {
                            el.tableHeader = "Minority";
                        }

                        let indent = {
                            0: "",
                            1: "   ",
                            2: "      ",
                            3: "         "
                        };

                        row.cells[1].value = `${indent[el.indentLevel]}${el.tableHeader}`;

                        if (el.universeField === 1) {
                            row.cells[0].value = row.cells[1].value;
                            row.cells[0].colSpan = 2;
                            row.cells.splice(1, 1);
                            $.each(row.cells, function(i, cell) {
                                cell.background = "#8DB4E2";
                                cell.italic = true;
                                cell.bold = true;
                                if (i > 0) {
                                    cell.textAlign = "right";
                                }
                            });
                        } else if (el.universeField === 2) {
                            $.each(row.cells, function(i, cell) {
                                if (i > 0) {
                                    cell.background = "#D9D9D9";
                                    cell.bold = true;
                                }
                                if (i > 1) {
                                    cell.value = "";
                                    cell.textAlign = "right";
                                }
                            });
                        } else {
                            $.each(row.cells, function(i, cell) {
                                if (i > 1) {
                                    cell.textAlign = "right";
                                }
                            });
                            row.cells[2].value = row.cells[2].value.toLocaleString("en");
                            row.cells[1].value = row.cells[1].value.replace("Males age", "Age");
                            row.cells[1].value = row.cells[1].value.replace("Males less", "Less");
                            row.cells[1].value = row.cells[1].value.replace("Females age", "Age");
                            row.cells[1].value = row.cells[1].value.replace("Females less", "Less");
                        }
                        return false;
                    }
                });
            }
        });


        e.workbook.sheets[0]["name"] = "Demographic Data";
        e.workbook.sheets[0]["frozenRows"] = 2;

        let headerRow = {
            cells: [{
                background: "#000",
                colSpan: columns.length,
                color: "#fff",
                rowSpan: 1,
                fontSize: 14,
                value: selectedReport,
                hAlign: "center"
            }],
            height: 30,
            headerRow: "added"
        };

        let sourceRow = {
            cells: [{
                background: "#000",
                colSpan: columns.length,
                color: "#fff",
                rowSpan: 1,
                fontSize: 11,
                value: sourceLabel,
                hAlign: "left",
                wrap: true
            }]
        };

        let footerRow = {
            cells: [{
                background: "#d3d3d3",
                colSpan: columns.length,
                color: "#000",
                rowSpan: disclaimer === config.legalACSDisclaimer ? Math.floor(rowSpan * 0.6) : rowSpan,
                fontSize: 8,
                value: disclaimer,
                hAlign: "center",
                wrap: true
            }]
        };

        if (rows[0].headerRow !== "added") {
            //Add custom header row
            rows.unshift(headerRow);
            rows.push(sourceRow);
            rows.push(footerRow);
        }

        //Change the workbook name to the selected report value
        e.workbook.fileName = fileName;

        //Add title 6 data
        if (title6Data) {
            let title6Sheet = title6Data.workbook.sheets[0];

            title6Sheet["name"] = "Title 6 Data";
            title6Sheet.columns[0].width = 290;
            title6Sheet.columns[3].width = 150;
            title6Sheet.columns[4].width = 150;
            title6Sheet.columns[5].width = 150;
            title6Sheet.columns[6].width = 150;

            title6Sheet.rows.map((row) => {
                if (row.type === 'data') {

                    row.cells[1].value = row.cells[1].value.toLocaleString("en");
                    row.cells[5].value = row.cells[5].value.toLocaleString("en");

                    //Format as percent
                    if (
                        typeof row.cells[2].value === 'number' &&
                        typeof row.cells[4].value === 'number' &&
                        typeof row.cells[6].value === 'number') {
                        row.cells[2].value = (Math.round(row.cells[2].value * 1000) / 10) + '%';
                        row.cells[4].value = (Math.round(row.cells[4].value * 1000) / 10) + '%';
                        row.cells[6].value = (Math.round(row.cells[6].value * 1000) / 10) + '%';
                    }
                }

                return row;
            })

            title6Sheet.rows.unshift({
                cells: [{
                    background: "#000",
                    colSpan: 7,
                    color: "#fff",
                    rowSpan: 1,
                    fontSize: 14,
                    value: "Title 6 Data",
                    hAlign: "center"
                }],
                height: 30,
                headerRow: "added"
            });
            title6Sheet.rows.push({
                cells: [{
                    background: "#d3d3d3",
                    colSpan: 7,
                    color: "#000",
                    rowSpan: 4,
                    fontSize: 10,
                    value: "The data used in this analysis are generated using an enhanced method of interpolation based on the ACS 2015 block groups and using the 2010 Census block data.  In order to approximate the population, housing and workforce data for these custom areas, the following enhanced method was used: The counts are redistributed to a more detailed geography (Census Block Group data or Census Tracts), that better nests within the MPO boundaries. The counts are proportionally redistributed to blocks based on the Census 2010 counts for population, households or housing units. The blocks are then assigned to the MPO containing their center, and summed by the MPO, to obtain the final counts.",
                    hAlign: "center",
                    wrap: true
                }]
            });

            e.workbook.sheets.push(title6Sheet);
        }

        //Unbind the event so to prevent issues with multiple excel files being downloaded.
        grid.unbind("excelExport");
    });
    grid.saveAsExcel();
    };
});
