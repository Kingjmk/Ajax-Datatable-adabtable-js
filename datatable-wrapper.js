(function ($) {
    //Form Save & Load Plugin
    $.fn.toJSON = function () {
        let $elements = {};
        let $form = $(this);
        $form.find('input, select, textarea').each(function () {
            let name = $(this).data('id');
            let type = $(this).attr('type');
            if (name) {
                let $value;
                if (type === 'radio') {
                    $value = $('input[data-id=' + name + ']:checked', $form).val()
                } else if (type === 'checkbox') {
                    $value = $(this).is(':checked')
                } else {
                    $value = $(this).val()
                }
                $elements[$(this).data('id')] = $value
            }
        });
        return JSON.stringify($elements)
    };

    $.fn.fromJSON = function (json_string) {
        let $form = $(this);
        let data = JSON.parse(json_string);
        $.each(data, function (key, value) {
            let $elem = $('[data-id="' + key + '"]', $form);
            let type = $elem.first().attr('type');
            if (type === 'radio') {
                $('[data-id="' + key + '"][value="' + value + '"]').prop('checked', true)
            } else if (type === 'checkbox' && (value === true || value === 'true')) {
                $('[data-id="' + key + '"]').prop('checked', true)
            } else {
                $elem.val(value)
            }
        })
    };

    //Datatables API plugin
    $.fn.datatable_wrapper = function (options) {
        const defaults = {};

        let settings = $.extend({}, defaults, options);
        if (typeof ($.datatable_functions_create_row) !== 'function') {
            $.datatable_functions_create_row = function (row, data, dataIndex) {
            };
        }

        function get_default_order(table_head_object,) {
            let custom_order = [];

            let i = 0;
            table_head_object.each(function () {
                // takes 'asc', 'desc'
                if (typeof ($(this).data('default-order')) !== 'undefined') {
                    custom_order.push([i, $(this).data('default-order')]);
                }
                i++;
            });

            return custom_order
        }

        function get_column_enabled(column, default_value = true) {
            let value = $(column).data('enabled');
            if (typeof (value) !== 'undefined') return value;

            return default_value
        }

        function get_columns_defs(table_head_object, table_id = null) {
            let i = 0;
            let customColumns = [];
            //Get Columns insert any more extra parameters here using data-whatever
            let ActionButtonsHTML = $('#' + table_id + '_button_template').html();
            if (typeof (ActionButtonsHTML) === 'undefined') {
                ActionButtonsHTML = $("#button_template").html();
                if (typeof (ActionButtonsHTML) === 'undefined') {
                    ActionButtonsHTML = "";
                }
            }

            console.log(ActionButtonsHTML);
            table_head_object.each(function () {
                let colname = $(this).data("name");
                let colrelatedname = $(this).data("related");
                if (typeof (colrelatedname) == 'undefined') {
                    colrelatedname = colname
                }

                let custom_column = {};
                let default_custom_column = {
                    "targets": i,
                    "className": "align-middle text-dark",
                    "searchable": get_column_enabled(this),
                    "visible": get_column_enabled(this),
                    "responsivePriority": i + 10,
                };

                if (colname.toLowerCase() === "actions") {
                    custom_column = {
                        "data": null,
                        "searchable": false,
                        "orderable": false,
                        "visible": true,
                        "responsivePriority": 1,
                        "render": function (data, type, row) {
                            let adjustedhtmlcontent = ActionButtonsHTML.replace(/data-id=""/g, 'data-id="' + row.id + '"');
                            adjustedhtmlcontent = adjustedhtmlcontent.replace(/replace-with-id/g, row.id);
                            adjustedhtmlcontent = adjustedhtmlcontent.replace(/\/0000/g, "/" + row.id);
                            adjustedhtmlcontent = adjustedhtmlcontent.replace(/id="dropdown_id_"/g, 'id="dropdown_id_' + row.id + '"');
                            adjustedhtmlcontent = adjustedhtmlcontent.replace(/aria-labelledby="dropdown_id_"/g, 'aria-labelledby="dropdown_id_' + row.id + '"');
                            return adjustedhtmlcontent;
                        },
                    }
                } else if (colname.toLowerCase() === "id") {
                    custom_column = {
                        "visible": get_column_enabled(this, false),
                        "data": colname,
                        "name": colrelatedname,
                    };
                } else {
                    if (colname === colrelatedname) {
                        custom_column = {
                            "data": colname,
                        };
                    } else {
                        custom_column = {
                            "data": colname,
                            "name": colrelatedname,
                        };
                    }
                }

                if ($(this).data('custom-rep') === true) {
                    custom_column['render'] = {
                        _: 'display',
                        sort: 'value',
                        filter: 'value',
                    }
                }

                custom_column = $.extend(default_custom_column, custom_column);
                customColumns.push(custom_column);
                i++;
            });

            return customColumns;
        }

        function get_header_buttons(table_head_object, table_id = null) {
            let HeaderButtonsHTML = $('#' + table_id + '-button-header-template').html();
            if (typeof (HeaderButtonsHTML) === 'undefined') {
                HeaderButtonsHTML = $("#button-header-template").html();
                if (typeof (HeaderButtonsHTML) === 'undefined') {
                    HeaderButtonsHTML = "";
                }
            }
            return HeaderButtonsHTML
        }

        function render_filter_field(object, htmlclass) {
            let nameoffield = object.header().textContent;
            let idoffield = object.index();
            let $this = $(object.header());

            let isrelated = '';
            if (typeof ($this.data('related')) !== 'undefined') {
                isrelated = 'data-is-related=true';
            }

            let newhtmlinput = '<div class="' + htmlclass + '"><label class="control-label mt-1 mb-1 float-left">' + nameoffield + '</label><input id="filter-field-' + idoffield + '" ' + isrelated + ' placeholder="' + nameoffield + '" data-type="text" data-id="' + idoffield + '" class="form-control customSearchInput" name="" type="text" value=""></div>';
            if (nameoffield === "" || nameoffield === "#") {
                return '';
            }

            //Loop through
            if ($this.data('select')) {

                let datalist = $this.data('list').split(',');
                newhtmlinput = '<div class="' + htmlclass + '"><label class="control-label mt-1 mb-1 float-left">' + nameoffield + '</label><select id="filter-field-' + idoffield + '" ' + isrelated + ' data-type="radio" data-id="' + idoffield + '" class="form-control customSearchInput">';
                newhtmlinput = newhtmlinput + '<option name="' + nameoffield + '" value="">All</option>';

                if (typeof ($this.data('list-label')) === 'undefined') {
                    for (let index = 0; index < datalist.length; index++) {
                        let value = datalist[index];
                        if (value !== "All") {

                            newhtmlinput = newhtmlinput + '<option name="' + nameoffield + '" value="' + value + '">' + value + '</option>';
                        }
                    }
                } else {
                    let labellist = $this.data('list-label').split(',');
                    for (let index = 0; index < datalist.length; index++) {
                        let value = datalist[index];
                        if (value !== "All") {
                            newhtmlinput = newhtmlinput + '<option name="' + nameoffield + '" value="' + value + '">' + labellist[index] + '</option>';
                        }
                    }
                }

                newhtmlinput = newhtmlinput + '</select></div>';

                //Must have input format of Y-m-d ex: 2019-07-18
            } else if ($this.data('date')) {
                //If the datatype is date

                newhtmlinput = '<div class="' + htmlclass + '"><label class="control-label mt-1 mb-1 float-left">' + nameoffield + '</label><input placeholder="' + nameoffield + '" id="filter-field-' + idoffield + '" ' + isrelated + ' data-type="date" type="text" data-id="' + idoffield + '" class="form-control customSearchInput datepicker" readonly></div>';

            } else if ($this.data('date-range')) {

                //If the datatype is date range
                newhtmlinput = '<div ' + isrelated + ' class="' + htmlclass + ' row customSearchInput" style="margin-right: 15px;padding-right:0" data-type="date-range" data-id="' + idoffield + '"><div class="col-6"><label class="control-label mt-1 mb-1 float-left">' + nameoffield + ' </label><input id="filter-field-' + idoffield + '-1" data-id="' + idoffield + '-1" placeholder="From" type="text" class="form-control customFilterDatepicker daterangepicker" second-input="#filter-field-' + idoffield + '-2" readonly ></div>'
                    + '<div class="col-6" style="padding-right:0"><label class="control-label mt-1 mb-1 float-left">&nbsp;</label><input placeholder="To"  ' + isrelated + ' id="filter-field-' + idoffield + '-2" data-id="' + idoffield + '-2" type="text"  class="form-control customFilterDatepicker" readonly></div></div>';

            } else if ($this.data('name').toLowerCase() === "actions" || nameoffield.toLowerCase() === "id") {
                return '';
            }

            return newhtmlinput
        }

        function Refresh(table, timeout = 5000) {
            setInterval(function () {
                table.ajax.reload(null, false)
            }, timeout);
        }

        function Filter(table, table_id) {
            //Searchbar div
            let searchwrapper = $('#' + table_id + '_filter');
            searchwrapper.html('');
            searchwrapper.prepend('<a class="btn info" href="#" title="Filter" id="' + table_id + '-customsearchbutton" data-tableid="' + table.tables().nodes().to$().attr('id') + '"><i class="la la-filter font-large-1"></i></a>');
            searchwrapper.prepend('<a class="btn danger" href="#" title="Remove Filtering" id="' + table_id + '-customsearchcancelbutton" data-tableid="' + table.tables().nodes().to$().attr('id') + '"><i class="la la-ban danger font-large-1"></i></a>');

            var header_filter_html = '';
            table.columns().every(function () {
                if ($(this.header()).data('header-filter') === true) {
                    header_filter_html = header_filter_html + render_filter_field(this, table_id + '-header-filter d-inline-flex input-sm');
                }
            });
            searchwrapper.prepend(header_filter_html);
            $('#' + table_id + '-customsearchcancelbutton').hide();
        }

        return this.each(function (datatable_index) {
            var filter_form_data = '';
            var datatable;
            var $datatable_dom = $(this);
            var $datatable_parent = $(this).parent('.table-responsive');
            var $datatable_header = $(this).find('thead th');
            var datatable_id = $(this).attr('id');
            var base_datatable_search_function = $.fn.dataTable.ext.search;

            if (typeof (datatable_id) === 'undefined') {
                datatable_id = 'custom_datatable_' + datatable_index;
                $(this).attr('id', datatable_id);
            }

            $(document).on('change', '.' + datatable_id + '-header-filter .customSearchInput', function () {
                if (typeof ($(this).val()) !== 'undefined') {
                    let mytable = $('#' + datatable_id).DataTable();
                    mytable.columns($(this).data('id')).search($(this).val(), true, true, false).draw();
                    $('#' + datatable_id + '-customsearchcancelbutton').show();
                }
            });

            //Search Button Event Listener
            $(document).on('click', '#' + datatable_id + '-customsearchcancelbutton', function (event) {
                let tableid = $(this).data('tableid');
                let mytable = $('#' + tableid).DataTable();
                $.fn.dataTable.ext.search = base_datatable_search_function;
                mytable.search('').columns().search('').draw();

                //clear history on cancel
                filter_form_data = '';
                $(this).hide();
            });

            $(document).on('click', '#' + datatable_id + '-customsearchbutton', function (event) {
                let tableid = $(this).data('tableid');
                let $datatable_dom = $('#' + tableid);
                let mytable = $datatable_dom.DataTable();

                let inputhtmls = ' ';
                let resultcheck = false;
                let htmlclass = "col-12";
                let swalwidth = null;

                if (mytable.columns()[0].length > 9) {
                    swalwidth = 1000;
                    htmlclass = "col-sm-12 col-md-6";
                }

                mytable.columns().every(function () {
                    resultcheck = true;

                    //check if selectlist
                    let newhtmlinput = render_filter_field(this, htmlclass);
                    if ($(this.header()).data('enabled') !== false) {
                        inputhtmls = inputhtmls + newhtmlinput;
                    }
                });

                if (mytable !== null && resultcheck) {
                    //Get Input Data
                    var swalbox = swal.fire({
                        width: swalwidth,
                        title: 'Filter Table',
                        html: '<form class="row" id="filter-form">' + inputhtmls + '</form>',
                        showCancelButton: true,
                        confirmButtonText: 'Search',
                        cancelButtonText: 'Cancel',
                        allowOutsideClick: () => !Swal.isLoading(),
                        onOpen: function () {
                            let index = 0;
                            $(".datepicker").each(function (index) {
                                $(this).datepicker();
                            });

                            $(".daterangepicker").each(function (index) {
                                $(this).daterangepicker()
                            });

                            //load form data
                            if ($datatable_dom.data('history')) {
                                if (filter_form_data.length > 2) {
                                    $("#filter-form").fromJSON(filter_form_data);
                                }
                            }
                        }
                    }).then((result) => {
                        if (result.value) {
                            //save filter here
                            if ($datatable_dom.data('history')) {
                                filter_form_data = $("#filter-form").toJSON();
                            }

                            $.fn.dataTable.ext.search = base_datatable_search_function;

                            //Get all objects with class of customSearchInput
                            $('.customSearchInput').each(function () {
                                //improve this regex
                                let concatchar = '^';
                                if (typeof ($(this).data('is-related')) !== 'undefined') {
                                    concatchar = '';
                                }

                                if ($(this).data('type') === "date") { //for single date
                                    //Do date
                                    let columnid = $(this).data('id');
                                    let momentformat = $(this).data('moment');

                                    let dateval = $(this).val();
                                    let formatteddate = moment(dateval).format(momentformat);
                                    if (formatteddate !== 'undefined' && formatteddate.length > 0 && formatteddate !== 'Invalid date') {
                                        mytable.columns(columnid).search(concatchar + formatteddate, true, true, false);
                                    }
                                } else if ($(this).data('type') === "date-range") { //for date range
                                    let frominput = $(this).find(".col-6 .customFilterDatepicker");
                                    let toinput = $(this).find(".col-6 .customFilterDatepicker:eq(1)");

                                    //Do date
                                    let columnid = $(this).data('id');
                                    let fromdate = moment(frominput.val()).unix();
                                    let todate = moment(toinput.val()).add(23, 'hours').add(59, 'minutes').unix();

                                    if ((fromdate !== 'undefined' && fromdate > 0 && fromdate !== "NaN") && (todate !== 'undefined' && todate > 0 && todate !== "NaN")) {
                                        if (typeof ($mytable.data('url')) !== 'undefined') {
                                            mytable.columns(columnid).search(fromdate + "|" + todate, true, true, false);
                                        } else {
                                            $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
                                                var value = moment(data[columnid]).unix();
                                                return todate >= value && value >= fromdate;
                                            });
                                        }
                                    }
                                } else if ($(this).data('type') === "radio") {
                                    //Do combobox code
                                    let columnid = $(this).data('id');
                                    if ($(this).val().length > 0) {
                                        mytable.columns(columnid).search($(this).val(), true, true, false);
                                    }

                                } else {
                                    mytable.columns($(this).data('id')).search($(this).val(), true, true, true);

                                }
                            });

                            mytable.columns().draw();
                            $('#' + datatable_id + '-customsearchcancelbutton').show();

                        }
                    });
                }
            });

            $(document).on('click', '#' + datatable_id + ' tbody tr td', function () {
                if ($(this).parents('tr').data('id') && $datatable_dom.data('hover-row') && $datatable_dom.data('row-url')) {
                    var data_id = $(this).parents('tr').data('id');
                    window.location = $datatable_dom.data('row-url').replace(/\/0000/g, "/" + data_id);
                }
            });

            $(function () {
                let menudata = $datatable_dom.data('menu');
                let lengthMenuSize = 10;
                let lengthMenu = "Show <select class=\"custom-select custom-select-sm form-control form-control-sm\"><option value=\"10\">10</option> <option value=\"25\">25</option> <option value=\"50\">50</option><option value=\"-1\">All</option></select> entries";
                if (typeof (menudata) !== 'undefined') {
                    let temp = 'Show <select class="custom-select custom-select-sm form-control form-control-sm">';
                    let index = 0;
                    menudata.split(",").forEach(function (item) {
                        let text = item;
                        if (item === '-1') {
                            text = 'All';
                        }
                        if (index === 0) {
                            temp += '<option value="' + item + '" selected>' + text + '</option>';
                            lengthMenuSize = item;
                        } else {
                            temp += '<option value="' + item + '">' + text + '</option>';
                        }

                        index++;
                    });
                    temp += '</select> entries';
                    lengthMenu = temp;
                }

                let buttons = [];

                if ($datatable_dom.data('button')) {
                    buttons = [];
                    let buttonsarr = $datatable_dom.data('button-list');
                    if (typeof (buttonsarr) !== 'undefined') {
                        try {
                            buttonsarr.split(",").forEach(function (item) {
                                buttons.push({
                                    extend: item,
                                    text: item.charAt(0).toUpperCase() + item.substring(1, item.length),
                                    className: 'btn btn-default',
                                    exportOptions: {
                                        columns: 'th:not(:last-child)'
                                    }
                                });
                            });
                            if (typeof (buttonsarr[0]) === 'undefined') {
                                console.error('data-button-list is empty make sure to insert a value in it like this "excel,print,pdf"');
                                buttons = [{
                                    extend: 'excel',
                                    text: 'Excel',
                                    className: 'btn btn-default none-print',
                                    exportOptions: {
                                        columns: 'th:not(:last-child)'
                                    }
                                }];
                            }
                        } catch (error) {
                            buttons = [{
                                extend: 'excel',
                                text: 'Excel',
                                className: 'btn btn-default none-print',
                                exportOptions: {
                                    columns: 'th:not(:last-child)'
                                }
                            }];
                            console.error('data-button-list format not correct make sure its like this "excel,print,pdf" no spaces and use a comma to seperate');
                        }
                    } else {
                        buttons = [{
                            extend: 'excel',
                            text: 'Excel',
                            className: 'btn btn-default none-print',
                            exportOptions: {
                                columns: 'th:not(:last-child)'
                            }
                        }];
                    }
                }

                let customColumns = get_columns_defs($datatable_header);
                let order_defaults = get_default_order($datatable_header);
                let header_button = get_header_buttons($datatable_header);

                let dom = "<'row mb-1'<'col-sm-6 header-btn-wrapper none-print'><'col-sm-6'B>>" + "<'row'<'col-sm-6 vertical_center'l><'col-sm-6'f>>" + "<'row'<'col-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>";
                let defaults = {
                    rowId: 'id',
                    deferRender: true,
                    orderCellsTop: true,
                    colReorder: true,
                    processing: true,
                    serverSide: true,
                    responsive: true,
                    autoWidth: false,
                    pageLength: parseInt(lengthMenuSize),
                    dom: dom,
                    buttons: buttons,
                    columnDefs: customColumns,
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr('data-id', data.id);
                        //override this function to run custom code on add row
                        $.datatable_functions_create_row(row, data, dataIndex);
                    },
                    order: order_defaults,
                    language: {
                        "lengthMenu": lengthMenu,
                        "zeroRecords": function () {
                            return "No records found";
                        },
                        "processing": '<i class="la la-spinner la-spin"></i> Loading...',
                        "loadingRecords": '<i class="la la-spinner la-spin"></i> Loading...',
                    },

                };

                //handle non ajax tables
                if (typeof ($datatable_dom.data('ajax')) !== 'undefined') {
                    console.error("use data-url instead of data-ajax!");
                }

                //handle selectable table option
                if ($datatable_dom.data('selectable')) {
                    defaults['select'] = {style: 'multi'};
                    defaults['paging'] = true;
                    defaults['serverSide'] = false;
                }

                if (typeof ($datatable_dom.data('url')) !== 'undefined') {
                    datatable = $datatable_dom.DataTable($.extend(true, {}, defaults, {
                        "initComplete": function (settings, json) {
                            //Create Header Buttons
                            $datatable_parent.find('.header-btn-wrapper').append(header_button);
                            if ($datatable_dom.data('refresh')) {
                                if ($datatable_dom.data('refresh-delay') > 0) {
                                    Refresh(datatable, $datatable_dom.data('refresh-delay') * 1000);
                                } else {
                                    Refresh(datatable);
                                }
                            }
                            if ($datatable_dom.data('hover-row')) {
                                $datatable_dom.addClass('datatable-change-row-color-on-hover');
                            }

                            $('#' + datatable_id + '_filter').html('');
                            if ($datatable_dom.data('filter')) {
                                Filter(datatable, datatable_id);
                            }
                            $datatable_dom.addClass('datatable-rendered');
                        },
                        "ajax": {
                            url: $datatable_dom.data('url'),
                        },
                    }));
                } else {
                    //none ajax datatable
                    datatable = $datatable_dom.DataTable($.extend(true, {}, defaults, {
                        "initComplete": function (settings, json) {
                            setTimeout(function () {
                                if ($datatable_dom.data('filter')) {
                                    Filter(datatable);
                                }

                                if ($datatable_dom.data('hover-row')) {
                                    $datatable_dom.addClass('datatable-change-row-color-on-hover');
                                }
                            }, 100);
                            $datatable_dom.addClass('datatable-rendered');

                        },
                        processing: false,
                        serverSide: false,
                    }));

                    $datatable_parent.find('.header-btn-wrapper').append(header_button);

                }

                if (datatable.length) {
                    new $.fn.dataTable.FixedHeader(datatable);
                }

                // callable functions
                $.datatable_functions_selected_rows = function () {
                    return datatable.rows({selected: true}).data();
                };

                // callable functions
                $.datatable_functions_selected_rows_ids = function () {
                    let all_rows = datatable.rows({selected: true}).data();
                    let row_id_array = [];
                    for (let i = 0; i < all_rows.length; i += 1) {
                        row_id_array[i] = all_rows[i]['id']
                    }
                    return row_id_array
                }

            });
        });
    };

    $(document).ready(function () {
        $("table#datatable").datatable_wrapper();
        $("table.datatable-wrapper").datatable_wrapper()
    });
}(jQuery));


