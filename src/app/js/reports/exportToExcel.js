"use strict";
require([
        "dojo/topic"
    ],
    function(tp) {
        tp.subscribe("excel-export", exportToExcel);
    });

function exportToExcel(params) {
    let grid = params.grid;
    let selectedReport = $("#specificReport").find(":selected").text();
    let fileName = selectedReport + "_Demographic_Report.xlsx";
    let sourceLabel = app.config.sourceLabel;
    let disclaimer = app.config.legalACSDisclaimer;

    let colSpan = 4;
    let rowSpan = 11;

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
                });
            } else if (row.type === "group-header") {
                row.cells[0].value = row.cells[0].value.substring(37);
                row.cells[0].background = "#000";
                row.cells[0].color = "#fff";
                row.cells[0].bold = true;
            } else {
                $.each(app.acsFieldsConfig, function(j, el) {
                    if (el.tableHeader === row.cells[1].value) {
                        let indent = {
                            0: "",
                            1: "   ",
                            2: "      ",
                            3: "         "
                        };

                        row.cells[1].formula = `="${indent[el.indentLevel]}${el.tableHeader}"`;

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
                colSpan: colSpan,
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
                colSpan: colSpan,
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
                colSpan: colSpan,
                color: "#000",
                rowSpan: disclaimer === app.config.legalACSDisclaimer ? Math.floor(rowSpan * 0.6) : rowSpan,
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

        //Unbind the event so to prevent issues with multiple excel files being downloaded.
        grid.unbind("excelExport");
    });
    grid.saveAsExcel();
}