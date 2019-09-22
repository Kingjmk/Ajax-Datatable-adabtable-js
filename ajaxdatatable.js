$(function () {
    //Form Save & Load Plugin
    (function ($) {
        $.fn.toJSON = function () {
            var $elements = {};
            var $form = $(this);
            $form.find('input, select, textarea').each(function () {
                ;
                var name = $(this).data('id')
                var type = $(this).attr('type')
                if (name) {
                    var $value;
                    if (type == 'radio') {
                        $value = $('input[data-id=' + name + ']:checked', $form).val()
                    } else if (type == 'checkbox') {
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
            var $form = $(this);
            var data = JSON.parse(json_string);
            $.each(data, function (key, value) {
                var $elem = $('[data-id="' + key + '"]', $form);
                var type = $elem.first().attr('type');
                if (type == 'radio') {
                    $('[data-id="' + key + '"][value="' + value + '"]').prop('checked', true)
                } else if (type == 'checkbox' && (value == true || value == 'true')) {
                    $('[data-id="' + key + '"]').prop('checked', true)
                } else {
                    $elem.val(value)
                }
            })
        };
    }(jQuery));

    if (typeof($.datatable_functions_create_row) !== 'function'){
        $.datatable_functions_create_row = function(row, data, dataIndex) {};
    }


    var filter_form_data = '';
    var customTable;
    var HeaderButtonsHTML = "";

    function get_columns_defs(table_head_object,){
        let i = 0;
        let customColumns = [];
        //Get Columns insert any more extra parameters here using data-whatever
        let ActionButtonsHTML = "";
        ActionButtonsHTML = $("#button_template").html();
        if (typeof (ActionButtonsHTML) === 'undefined') {
            ActionButtonsHTML = "";
        }

        HeaderButtonsHTML = $("#button-header-template").html();
        if (typeof (HeaderButtonsHTML) === 'undefined') {
            HeaderButtonsHTML = "";
        } else {

        }
        table_head_object.each(function () {
            let colname = $(this).data("name");
            let colrelatedname = $(this).data("related");
            if (typeof (colrelatedname) == 'undefined') {
                colrelatedname = colname
            }

            let custom_column = {};

            if (colname.toLowerCase() === "actions") {
                custom_column = {
                    "targets": i,
                    "className": "align-middle text-dark",
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
                };
            } else if (colname.toLowerCase() === "id") {
                if ($(this).data('enabled') !== true) {
                    customColumns.push({
                        "targets": i,
                        "className": "align-middle text-dark",
                        "data": colname,
                        "name": colrelatedname,
                        "searchable": false,
                        "visible": false,
                        "responsivePriority": 99,
                    });
                } else {
                    custom_column = {
                        "targets": i,
                        "className": "align-middle text-dark",
                        "data": colname,
                        "name": colrelatedname,
                        "searchable": true,
                        "visible": true,
                        "responsivePriority": i + 10,
                    };
                }

            } else {
                if (colname === colrelatedname) {
                    custom_column = {
                        "targets": i,
                        "className": "align-middle text-dark",
                        "data": colname,
                        "searchable": true,
                        "visible": true,
                        "responsivePriority": i + 10,
                    };
                } else {
                    custom_column = {
                        "targets": i,
                        "className": "align-middle text-dark",
                        "data": colname,
                        "name": colrelatedname,
                        "searchable": true,
                        "visible": true,
                        "responsivePriority": i + 10,
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
            customColumns.push(custom_column);

            i++;
        });

        return customColumns;
    }

    function render_filter_field(object, htmlclass) {
        let nameoffield = object.header().textContent;
        let idoffield = object.index();
        let $this = $(object.header());

        let isrelated = '';
        if (typeof ($this.data('related')) !== 'undefined') {
            isrelated = 'data-is-related=true';
        }

        let newhtmlinput = '<div class="' + htmlclass + '"><label class="control-label mt-1 mb-1 float-left">' + nameoffield + '</label><input ' + isrelated + ' placeholder="' + nameoffield + '" data-type="text" data-id="' + idoffield + '" class="form-control customSearchInput" name="" type="text" value=""></div>';
        if (nameoffield === "" || nameoffield === "#") {
            return '';
        }

        //Loop through
        if ($this.data('select')) {

            let datalist = $this.data('list').split(',');
            newhtmlinput = '<div class="' + htmlclass + '"><label class="control-label mt-1 mb-1 float-left">' + nameoffield + '</label><select ' + isrelated + ' data-type="radio" data-id="' + idoffield + '" class="form-control customSearchInput">';
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

            //Must have data-date and data-date-format as attributes and datetime format must be in DateTimePicker format yyyy-MM-dd HH:mm is 2019-07-18 16:45
        } else if ($this.data('date')) {

            //get date format
            let dateformat = $this.data('format');
            let datefield = $this.data('field');
            let datemoment = $this.data('moment');
            //If the datatype is date
            newhtmlinput = '<div class="' + htmlclass + '"><label class="control-label mt-1 mb-1 float-left">' + nameoffield + '</label><input ' + isrelated + ' data-type="date" data-format="' + dateformat + '" data-field="' + datefield + '" data-moment="' + datemoment + '" type="text" data-id="' + idoffield + '" class="form-control customSearchInput customFilterDatepicker" readonly></div>';

        } else if ($this.data('date-range')) {

            //get date format
            let dateformat = $this.data('format');

            //If the datatype is date range
            newhtmlinput = '<div ' + isrelated + ' class="' + htmlclass + ' row customSearchInput" style="margin-right: 15px;padding-right:0" data-format="' + dateformat + '" data-type="date-range" data-id="' + idoffield + '"><div class="col-6"><label class="control-label mt-1 mb-1 float-left">' + nameoffield + ' </label><input data-id="' + idoffield + '-1" placeholder="From" data-format="' + dateformat + '" data-field="date" type="text" class="form-control customFilterDatepicker" readonly></div>'
                + '<div class="col-6" style="padding-right:0"><label class="control-label mt-1 mb-1 float-left">&nbsp;</label><input placeholder="To"  ' + isrelated + ' data-id="' + idoffield + '-2" data-format="' + dateformat + '" data-field="date" type="text"  class="form-control customFilterDatepicker" readonly></div></div>';

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

    function Filter(table) {
        //Searchbar div
        let searchwrapper = $('#datatable_filter');
        searchwrapper.html('');
        searchwrapper.prepend('<a class="btn info" href="#" title="Filter" id="customsearchbutton" data-tableid="' + table.tables().nodes().to$().attr('id') + '"><i class="la la-filter font-large-1"></i></a>');
        searchwrapper.prepend('<a class="btn danger" href="#" title="Remove Filtering" id="customsearchcancelbutton" data-tableid="' + table.tables().nodes().to$().attr('id') + '"><i class="la la-ban danger font-large-1"></i></a>')

        var header_filter_html = '';
        table.columns().every(function () {
            if ($(this.header()).data('header-filter') === true) {
                header_filter_html = header_filter_html + render_filter_field(this, 'datatable-header-filter d-inline-flex input-sm');
            }
        });
        searchwrapper.prepend(header_filter_html);
        $('#customsearchcancelbutton').hide();
    }

    $(document).on('change', '.datatable-header-filter .customSearchInput', function (event) {
        if (typeof ($(this).val()) !== 'undefined') {
            let tableid = $('#customsearchbutton').data('tableid');
            let mytable = $('#' + tableid).DataTable();
            mytable.columns($(this).data('id')).search($(this).val(), true, true, false).draw();
            $('#customsearchcancelbutton').show();
        }
    });

    //Search Button Event Listener
    $(document).on('click', '#customsearchcancelbutton', function (event) {
        let tableid = $(this).data('tableid');
        let mytable = $('#' + tableid).DataTable();
        mytable.search('').columns().search('').draw();

        //clear history on cancel
        filter_form_data = '';

        $('#customsearchcancelbutton').hide();
    });

    $(document).on('click', '#customsearchbutton', function (event) {
        let tableid = $(this).data('tableid');
        let mytable = $('#' + tableid).DataTable();

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
                    $(".customFilterDatepicker").each(function (index) {
                        $(this).parent().append('<div id="datetimeinput-wrapper-' + index + '"></div>');
                        $('#datetimeinput-wrapper-' + index).DateTimePicker();
                    });

                    //load form data
                    if ($("#datatable").data('history')) {
                        if (filter_form_data.length > 2) {
                            $("#filter-form").fromJSON(filter_form_data);
                        }
                    }
                }
            }).then((result) => {
                if (result.value) {
                    //save filter here
                    if ($("#datatable").data('history')) {
                        filter_form_data = $("#filter-form").toJSON();
                    }

                    //Gett all objects with class of customSearchInput
                    $('.customSearchInput').each(function () {
                        //improve this regex
                        let concatchar = '^';
                        if (typeof ($(this).data('is-related')) !== 'undefined') {
                            concatchar = '';
                        }

                        if ($(this).data('type') === "date") { //for single date
                            //Do date
                            let columnid = $(this).data('id');
                            let fieldtype = $(this).data('field');
                            let momentformat = $(this).data('moment');

                            let dateval = $(this).val();
                            let formatteddate = moment(dateval).format(momentformat);
                            if (formatteddate !== 'undefined' && formatteddate.length > 0 && formatteddate != "Invalid date") {
                                mytable.columns(columnid).search(concatchar + formatteddate, true, true, false);
                            }
                        } else if ($(this).data('type') === "date-range") { //for date range
                            let frominput = $(this).find(".col-6 .customFilterDatepicker");
                            let toinput = $(this).find(".col-6 .customFilterDatepicker:eq(1)");


                            //Do date
                            let columnid = $(this).data('id');
                            let fromdate = moment(frominput.val()).unix();
                            let todate = moment(toinput.val()).unix();

                            if ((fromdate !== 'undefined' && fromdate > 0 && fromdate !== "NaN") && (todate !== 'undefined' && todate > 0 && todate !== "NaN")) {
                                mytable.columns(columnid).search(fromdate + "|" + todate, true, true, false);
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
                    $('#customsearchcancelbutton').show();

                }
            });
        }
    });


    $(document).ready(function () {
        let menudata = $("#datatable").data('menu');
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

        if ($("#datatable").data('button')) {
            buttons = [];
            let buttonsarr = $("#datatable").data('button-list');
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

        let customColumns = get_columns_defs($('#datatable thead th'));

        let dom = "<'row mb-1'<'col-sm-6 header-btn-wrapper none-print'><'col-sm-6'B>>" + "<'row'<'col-sm-6 vertical_center'l><'col-sm-6'f>>" + "<'row'<'col-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>";
        let defaults = {
            orderCellsTop: true,
            colReorder: true,
            processing: true,
            serverSide: true,
            responsive: true,
            pageLength: parseInt(lengthMenuSize),
            dom: dom,
            buttons: buttons,
            columnDefs: customColumns,
            autoWidth:false,
            createdRow: function (row, data, dataIndex) {
                $(row).attr('data-id', data.id);
                //override this function to run custom code on add row
                $.datatable_functions_create_row(row, data, dataIndex);
            },
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
        if (typeof ($('#datatable').data('ajax')) !== 'undefined') {
            console.error("use data-url instead of data-ajax!");
        }

        if (typeof ($('#datatable').data('url')) !== 'undefined') {
            customTable = $('#datatable').DataTable($.extend(true, {}, defaults, {
                "initComplete": function (settings, json) {
                    //Create Header Buttons
                    if ($('#datatable').data('selectable')) {
                        $('.header-btn-wrapper').append('<button type="button" class="btn btn-primary" href="#" id="datatable-select-all"  data-all=true data-id=""><i class="ft-check"></i> Select All</button>');
                    }
                    $('.header-btn-wrapper').append(HeaderButtonsHTML);
                    if ($('#datatable').data('refresh')) {
                        if ($('#datatable').data('refresh-delay') > 0) {
                            Refresh(customTable, $('#datatable').data('refresh-delay') * 1000);
                        } else {
                            Refresh(customTable);
                        }
                    }
                    if ($('#datatable').data('hover-row')) {
                        $('#datatable').addClass('datatable-change-row-color-on-hover');
                    }

                    $('#datatable_filter').html('');
                    if ($('#datatable').data('filter')) {
                        Filter(customTable);
                    }
                },
                "ajax": function (data, callback, settings) {

                    var urlParams = new URLSearchParams(window.location.search);
                    var do_search = $("#datatable").data('searchable') && typeof (customTable) == 'undefined' && urlParams.has('search') && urlParams.has('col');

                    if (do_search) {
                        var searchterm = urlParams.get('search');
                        var column = urlParams.get('col');

                        data.columns[column].search.value = searchterm;
                        data.columns[column].search.regex = true;
                    }

                    $.ajax({
                        url: $('#datatable').data('url'),
                        beforeSend: function () {
                            if ($("#datatable").data('selectable')) {
                                $("#datatable-select-all").data('all', true);
                                $("#datatable-select-all").html('<i class="ft ft-check"></i> Select All');
                            }
                        },
                        data: data,
                        success: function (result) {
                            callback(result);
                            if (do_search) {
                                $('#customsearchcancelbutton').show();
                            }
                        }
                    });
                },
            }));
        } else {
            //none ajax datatable
            customTable = $('#datatable').DataTable($.extend(true, {}, defaults, {
                "initComplete": function (settings, json) {
                    setTimeout(function () {
                        if ($('#datatable').data('filter')) {
                            Filter(customTable);
                        }

                        if ($('#datatable').data('hover-row')) {
                            $('#datatable').addClass('datatable-change-row-color-on-hover');
                        }
                    }, 100);
                },
                processing: false,
                serverSide: false,
            }));
            $('.header-btn-wrapper').append(HeaderButtonsHTML);
        }

        if (customTable.length) {
            new $.fn.dataTable.FixedHeader(customTable);
        }

        $('#datatable tbody').on('click', 'td:not(:last-child)', function () {
            if ($('#datatable').data('selectable')) {
                $(this).parent('tr').toggleClass('selected');
            }
        });

        $(document).on('click', '#datatable-count-rows', function () {
            let mm = "";
            alert(customTable.rows('.selected').data().length + ' row(s) selected');
        });

        $(document).on('click', '#datatable-select-all', function () {
            let mm = "";
            if ($(this).data('all')) {
                $('#datatable tbody tr').each(function () {
                    $(this).addClass('selected');
                });
                $(this).data('all', false);
                $(this).html('<i class="ft ft-check"></i> Unselect All');
            } else {
                $('#datatable tbody tr').each(function () {
                    $(this).removeClass('selected');
                });
                $(this).data('all', true);
                $(this).html('<i class="ft ft-check"></i> Select All');
            }
        });

        $(document).on('click', '#datatable tbody tr td', function () {
            if ($(this).parents('tr').data('url') && $('#datatable').data('hover-row')) {
                window.location = $(this).parents('tr').data('url');
            }
        });
    });

});
