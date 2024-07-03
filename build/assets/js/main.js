/* eslint-disable no-undef */
// add parser through the tablesorter addParser method
// $.tablesorter.addParser({
//   id: "dates",
//   is: function(s, table, cell, $cell) {
//     return false;
//   },
//   format: function(s, table, cell, cellIndex) {
//     return `${s}`.substring(0, 10);
//   },
//   type: "date",
// });

$(function() {
  try {
    if ($("table")) {
      $("th").off("click");
      $("th").on("click", function(th) {
        let tagName = $(this).data("sort");

        let tagOrder =
          `${$(this).data("order")}`.toLowerCase() === "asc" ? "desc" : "asc";

        $(this).data("order", `${tagOrder}`);
        // $(this).attr("data-order", `${tagOrder}`);

        const theIndex = $(this).index();
        let $theTable = $(this).closest("table");
        let $theTr = $theTable.find("tbody").find("tr")?.[0];
        let haveLoader = $theTable.find("tbody").data("customloader");
        let theconcernedTd = $(
          $($theTr)
            .find("td")
            .eq(theIndex)?.[0]
        );
        if (theconcernedTd && theconcernedTd.data("sort")) {
          tagName = theconcernedTd.data("sort");
        }

        if (!haveLoader && tagName) {
          $theTable.find("tbody").addClass("position-relative");
          $theTable
            .find("tbody")
            .prepend(
              `<div id="" class="tbodyobjectSorter kt-portlet__body kt-padding-b-65 kt-padding-t-65" style="position: absolute; width: 100%; height: 100%; top: 0px; left: Opx; background-color: white;" > <div id="kt_table_1_wrapper" class="dataTables_wrapper dt-bootstrap4 position-relative"> <div class="row"> <div class="col-sm-12"> <div class="blockUI" style="display: none;" /> <div class="blockUI blockOverlay" style="z-index: 1; border: none; margin: 0px; padding: 0px; width: 100%; height: 100%; top: 0px; left: 0px; background-color: rgb(0, 0, 0); opacity: 0; cursor: wait; position: absolute; " /> <div class="blockUI blockMsg blockElement" style=" z-index: 1; position: absolute; padding: 0px; margin: 0px; width: 169px; top: 0px ; left: -82px; text-align: center ;color: rgb(0, 0, 0); border: 0px ; cursor: wait ; "> <div class="blockui "> <span>Chargement...</span> <span> <div class="kt-spinner kt-spinner--loader kt-spinner--brand " /> </span> </div> </div> </div> </div> </div> </div>`
            );
        }
        if (window.sortHandlerGlobal && tagName) {
          window.objectSorter = {
            name: tagName,
            order: tagOrder,
          };
          window.sortHandlerGlobal();
        }
        return;
      });
    }
  } catch (error) {
    console.log(error);
  }
});
