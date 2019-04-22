/To use this script first use the dom structure as in the example) and make sure the datatable ID is "Ajax_Table and has nessecary divs for actions and header buttons
//global table
var customTable;
$(document).ready(function () {  
    function initDatePicker() {
        $('.datepicker').dateDropper({
            format: 'Y-m-d',
            minDate: '1939',
            maxDate: moment().get('year') + 1,
            large: true
        });

        $('.datepicker-plusyear').dateDropper({
            format: 'Y-m-d',
            minDate: '2000',
            maxDate: moment().get('year') + 5,
            large: true
        });
    }
    var area_name = window.location.pathname.split('/')[1];
    var controller_name = window.location.pathname.split('/')[2];
    var route_name = window.location.pathname.split('/')[3];
    var def_path = "/" + area_name + "/" + controller_name + "/";

    if (!isNaN($("#sub-route").val())) {
        def_path = def_path + route_name + "/" + $("#sub-route").val() + "/";
    }

    var defaults = {
        "searching": true,
        "ordering": false,
        "dom": 'lrtip',
    };

    //Get Columns insert any more extra parameters here using data-whatever
    var ActionButtonsHTML = "";
    ActionButtonsHTML = $("#button_template").html();
    if (ActionButtonsHTML === "undefined") {
        ActionButtonsHTML = "";
    }

    var HeaderButtonsHTML = "";
    HeaderButtonsHTML = $("#button-header-template").html();
    if (HeaderButtonsHTML === "undefined") {
        HeaderButtonsHTML = "";
    }

    var customColumns = [];
    var i = 0;
    $('#Ajax_Table thead th').each(function () {
        var colname = $(this).attr("data-name");
        if (colname.toLowerCase() === "actions") {
            customColumns.push({
                "targets": i,
                "data": null,
                "searchable": false,
                "visible": true,
                "render": function (data, type, row) {
                    var adjustedhtmlcontent = ActionButtonsHTML.replace(/data-id=""/g, 'data-id="' + row.id + '"');
                    adjustedhtmlcontent = adjustedhtmlcontent.replace(/replace-with-id/g, row.id);
                    adjustedhtmlcontent = adjustedhtmlcontent.replace(/id="dropdown_id_"/g, 'id="dropdown_id_' + row.id + '"');
                    adjustedhtmlcontent = adjustedhtmlcontent.replace(/aria-labelledby="dropdown_id_"/g, 'aria-labelledby="dropdown_id_' + row.id + '"');
                    return adjustedhtmlcontent;
                },
            });
            $(this).css("width", "1px");
            $(this).css("text-align", "center");
        } else if (colname.toLowerCase() === "id") {
            customColumns.push({
                "targets": i,
                "data": colname,
                "searchable": false,
                "visible": false,
            });
        } else {
            customColumns.push({
                "targets": i,
                "data": colname,
                "searchable": true,
                "visible": true,
            });
        }
        i++;
    });

    var customtable_isLoading = true;
    customTable = $('#Ajax_Table').DataTable($.extend(true, {}, defaults, {

        responsive: true,
        oLanguage: {
            "sZeroRecords": function () {
                if (customtable_isLoading) {
                    return '<i class="fa fa-spinner fa-spin yahia-color"></i> Loading...';
                } else {
                    return "No records found";
                }
            }
        },
        ajax: {
            beforeSend: function () {
                //Clear Table
                if (typeof customTable !== "undefined") {
                    customTable.clear().draw();
                }
                customtable_isLoading = true;
                //Create Header Buttons 
                $('#Ajax_Table_length').append(HeaderButtonsHTML);
            },
            "url": def_path + "data",
            "type": "POST",
            "dataSrc": function (json) {
                //var json = json.replace(/\\/g, '');
                customtable_isLoading = false
                return json.data;
            }
        },
        columnDefs: customColumns,
    }));

    new $.fn.dataTable.FixedHeader(customTable);
    CustomBootBoxSearch(customTable);

    //General Scripts
    $(document).on('click', '#create-button', function () {
        var title = $(this).attr('data-title');
        //DO AJAX TO GET OTHER PAGE CONTENT
        $.ajax({
            url: def_path + "Create/",
            method: "GET",
            success: function (data) {
                let timerInterval
                Swal.fire({
                    title: '<span>' + title + '</span>',
                    html: data,                    
                    reverseButtons: true,
                    showCloseButton: true,
                    showConfirmButton: false,
                    showCancelButton: false,
                    footer: '<input form="create_form" type="submit" value="Add" class="swal2-confirm swal2-styled" />' +
                        '<button id="create_form_cancel" class="swal2-cancel swal2-styled" >Cancel</button>',
                    allowOutsideClick: () => !Swal.isLoading(),
                    //Stuff to close with button
                    timer: 3600000,
                    onOpen: () => {
                        //get datepickers and parsethem
                        //Date Picker
                        initDatePicker();
                        $.validator.unobtrusive.parse("#create_form");
                        var cancel = document.querySelector('#create_form_cancel');
                        cancel.addEventListener('click', () => {
                            Swal.increaseTimer(-3600000)
                        })
                    },
                    onClose: () => {
                        clearInterval(timerInterval)
                    }
                });
            }
        });
    });
    $(document).on('click', '#create-wide-button', function () {
        var title = $(this).attr('data-title');
        //DO AJAX TO GET OTHER PAGE CONTENT
        $.ajax({
            url: def_path + "Create/",
            method: "GET",
            success: function (data) {
                let timerInterval
                Swal.fire({
                    title: '<span>' + title + '</span>',
                    html: data,             
                    width: 1000,
                    reverseButtons: true,
                    showCloseButton: true,
                    showConfirmButton: false,
                    showCancelButton: false,
                    footer: '<input form="create_form" type="submit" value="Add" class="swal2-confirm swal2-styled" />' +
                        '<button id="create_form_cancel" class="swal2-cancel swal2-styled" >Cancel</button>',
                    allowOutsideClick: () => !Swal.isLoading(),
                    //Stuff to close with button
                    timer: 3600000,
                    onOpen: () => {
                        //get datepickers and parsethem
                        //Date Picker
                        initDatePicker();

                        $.validator.unobtrusive.parse("#create_form");
                        var cancel = document.querySelector('#create_form_cancel');
                        cancel.addEventListener('click', () => {
                            Swal.increaseTimer(-3600000)
                        })
                    },
                    onClose: () => {
                        clearInterval(timerInterval)
                    }
                });
            }
        });
    });
    $(document).on('click', '#create-large-button', function () {
        var title = $(this).attr('data-title');
        //DO AJAX TO GET OTHER PAGE CONTENT
        $.ajax({
            url: def_path + "Create/",
            method: "GET",
            success: function (data) {
                let timerInterval
                Swal.fire({
                    title: '<span>' + title + '</span>',
                    html: data,
                    width: 1000,
                    reverseButtons: true,
                    showCloseButton: true,
                    showConfirmButton: false,
                    showCancelButton: false,
                    //footer: '<input form="create_form" type="submit" value="اضف" class="swal2-confirm swal2-styled" />' +
                    //    '<button id="create_form_cancel" class="swal2-cancel swal2-styled" >الغاء</button>',
                    allowOutsideClick: () => !Swal.isLoading(),
                    //Stuff to close with button
                    timer: 3600000,
                    onOpen: (content) => {
                        //var form = $("#create-large-form").show();
                        var form = $("#create-large-form").show();

                        $("#create-large-form").steps({
                            headerTag: "h6",
                            bodyTag: "section",
                            transitionEffect: "fade",
                            titleTemplate: '<span class="step">#index#</span> #title#',
                            labels: {
                                finish: 'Add',
                                next: "Next",
                                previous: "Previous",
                            },
                            onStepChanging: function (event, currentIndex, newIndex) {
                                form.validate().settings.ignore = ":disabled";
                                console.log(form.validate());
                                console.log(form.valid());
                                validator.showErrors();
                                var a = false;
                                var section = $("#create-large-form").find("section:eq(" + currentIndex + ")");
                                var fields = section.find(":input[data-val]");

                                fields.each(function (index) {
                                    a = $(this).valid();
                                    
                                    console.log($(this).valid() + "/" + $(this).attr("id")+"/"+form.valid());
                                    if (a == false) {
                                        return a;
                                    }
                                });

                                //check all fields in section
                                return currentIndex > newIndex;// || CustomValidate(currentIndex);
                            },
                            onFinishing: function (event, currentIndex) {
                                form.validate().settings.ignore = ":disabled";
                                return form.valid() && CustomValidate(currentIndex);
                            },
                            onFinished: function (event, currentIndex) {
                                $("#create-large-form").submit();
                            }
                        });

                        function CustomValidate(currentIndex) {
                            var validator = form.validate();
                            var a = false;
                            var section = $("#create-large-form").find("section:eq(" + currentIndex + ")");
                            var fields = section.find(":input[data-val]");

                            fields.each(function (index) {
                                a = $(this).valid();
                                console.log(a + " " + $(this).attr("id"));
                                if (a == false) {
                                    return a;
                                }
                            });

                            return a;
                        }
                    },
                    onClose: () => {
                        clearInterval(timerInterval)
                    }
                });
            }
        });
    });

    $(document).on('click', '.edit-button', function () {
        var title = "Edit Record";
        var id = $(this).attr("data-id");
        //DO AJAX TO GET OTHER PAGE CONTENT
        $.ajax({
            url: def_path + "Edit/" + id,
            method: "GET",
            success: function (data) {
                let timerInterval
                Swal.fire({
                    title: '<span>' + title + '</span>',
                    html: data,
                    reverseButtons: true,
                    showCloseButton: true,
                    showConfirmButton: false,
                    showCancelButton: false,
                    footer: '<input form="edit_form" type="submit" value="Save" class="swal2-confirm swal2-styled" />' +
                        '<button id="edit_form_cancel" class="swal2-cancel swal2-styled" >Cancel</button>',
                    allowOutsideClick: () => !Swal.isLoading(),
                    //Stuff to close with button
                    timer: 3600000,
                    onOpen: () => {
                        initDatePicker();

                        $.validator.unobtrusive.parse("#edit_form");
                        var cancel = document.querySelector('#edit_form_cancel');
                        cancel.addEventListener('click', () => {
                            Swal.increaseTimer(-3600000)
                        })
                    },
                    onClose: () => {
                        clearInterval(timerInterval)
                    }
                });
            }
        });
    });
    $(document).on('click', '.edit-wide-button', function () {
        var title = "Edit Record";
        var id = $(this).attr("data-id");
        //DO AJAX TO GET OTHER PAGE CONTENT
        $.ajax({
            url: def_path + "Edit/" + id,
            method: "GET",
            success: function (data) {
                let timerInterval
                Swal.fire({
                    title: '<span>' + title + '</span>',
                    html: data,
                    width:1000,
                    reverseButtons: true,
                    showCloseButton: true,
                    showConfirmButton: false,
                    showCancelButton: false,
                    footer: '<input form="edit_form" type="submit" value="Save" class="swal2-confirm swal2-styled" />' +
                        '<button id="edit_form_cancel" class="swal2-cancel swal2-styled" >Cancel</button>',
                    allowOutsideClick: () => !Swal.isLoading(),
                    //Stuff to close with button
                    timer: 3600000,
                    onOpen: () => {
                        initDatePicker();

                        $.validator.unobtrusive.parse("#edit_form");
                        var cancel = document.querySelector('#edit_form_cancel');
                        cancel.addEventListener('click', () => {
                            Swal.increaseTimer(-3600000)
                        })
                    },
                    onClose: () => {
                        clearInterval(timerInterval)
                    }
                });
            }
        });
    });
    $(document).on('click', '.edit-large-button', function () {
        var title = $(this).attr('data-title');
        //DO AJAX TO GET OTHER PAGE CONTENT
        $.ajax({
            url: def_path + "Create/",
            method: "GET",
            success: function (data) {
                let timerInterval
                Swal.fire({
                    title: '<span>' + title + '</span>',
                    html: data, 
                    width: 1000,
                    reverseButtons: true,
                    showCloseButton: true,
                    showConfirmButton: false,
                    showCancelButton: false,
                    //footer: '<input form="create_form" type="submit" value="اضف" class="swal2-confirm swal2-styled" />' +
                    //    '<button id="create_form_cancel" class="swal2-cancel swal2-styled" >الغاء</button>',
                    allowOutsideClick: () => !Swal.isLoading(),
                    //Stuff to close with button
                    timer: 3600000,
                    onOpen: () => {
                        var form = $(".steps-validation").show();
                        $(".steps-validation").steps({
                            headerTag: "h6",
                            bodyTag: "section",
                            transitionEffect: "fade",
                            titleTemplate: '<span class="step">#index#</span> #title#',
                            labels: {
                                finish: 'Add',
                            },
                            onStepChanging: function (event, currentIndex, newIndex) {
                                //check all fields in section
                                return currentIndex > newIndex || CustomValidate(currentIndex);
                            },
                            onFinishing: function (event, currentIndex) {
                                form.validate().settings.ignore = ":disabled";
                                return form.valid() && CustomValidate(currentIndex);
                            },
                            onFinished: function (event, currentIndex) {
                                $("#wizard-form").submit();
                            }
                        });

                        function CustomValidate(currentIndex) {
                            var validator = form.validate();
                            var a = false;
                            var section = $("#wizard-form").find("section:eq(" + currentIndex + ")");
                            var fields = section.find(":input[data-val]");

                            fields.each(function (index) {
                                a = $($(this)).valid();
                                console.log(a + " " + $(this).attr("id"));
                                if (a == false) {
                                    return a;
                                }
                            });
                        }

                    },
                    onClose: () => {
                        clearInterval(timerInterval)
                    }
                });
            }
        });
    });

    $(document).on('click', '.detail-button', function () {
        var title = "Record Details";
        var id = $(this).attr("data-id");
        //DO AJAX TO GET OTHER PAGE CONTENT
        $.ajax({
            url: def_path + "Details/" + id,
            method: "GET",
            success: function (data) {
                let timerInterval
                Swal.fire({
                    title: '<span>' + title + '</span>',
                    html: data,
                    reverseButtons: true,
                    showCloseButton: true,
                    showConfirmButton: false,
                    showCancelButton: false,
                    footer:'<button id="detail_form_cancel" class="swal2-cancel swal2-styled" >Back</button>',
                    allowOutsideClick: () => !Swal.isLoading(),
                    //Stuff to close with button
                    timer: 3600000,
                    onOpen: () => {
                        var cancel = document.querySelector('#detail_form_cancel');
                        cancel.addEventListener('click', () => {
                            Swal.increaseTimer(-3600000)
                        })
                    },
                    onClose: () => {
                        clearInterval(timerInterval)
                    }
                });
            }
        });
    });
    $(document).on('click', '.delete-button', function () {
        var id = $(this).attr('data-id');
        var $tr = $(this).closest('tr');

        Swal.fire({
            title: 'Are you sure you want to delete this record?',
            text: "The data will be lost forver, and cannot be retrieved",
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Delete',

            cancelButtonText: 'Cancel'

        }).then((result) => {
            if (result.value) {
                //Ajax Call then Fire swal
                $.ajax({
                    url: def_path + "Delete",
                    method: "POST", 
                    data: {
                        id: id, '__RequestVerificationToken': $("#AntiForgeToken").val()
                    },
                    success: function (data) {
                        if (data.success) {
                            //remove from datatable
                            customTable.row($tr).remove();
                            //remove from View
                            $tr.find('td').fadeOut(1000, function () {
                                $tr.remove();
                            });
                            customTable.search('').columns().search('').draw();

                            Swal.fire(
                                'Deleted!',
                                'Deleted Record Successfuly',
                                'success'
                            )
                        } else {
                            Swal.fire(
                                'Oh No!',
                                'Error : ' + data.message,
                                'error'
                            )
                        }
                    },

                    error: function (data) {
                        console.log(data.message);
                        Swal.fire(
                            'Oh No!',
                            'Server Error',
                            'error'
                        )
                    },
                });

            }
        })

    });
});
