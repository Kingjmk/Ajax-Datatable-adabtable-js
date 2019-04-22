/*

Code by Jameel Hamdan
Don't forget to check the HTML file for reference
*/

function CustomSearch(table) {
    //Searchbar div 
    //var searchwrapper = $('#' + table.tables().nodes().to$().attr('id') + '_filter');
    var searchwrapper = $('.heading-elements ul');
    searchwrapper.prepend('<li><a href="#" title="Filter" id="customsearchbutton" data-tableid="' + table.tables().nodes().to$().attr('id') + '"><i class="fa fa-filter"></i></a></li>');
    searchwrapper.prepend('<li><a href="#" title="Remove Filtering" id="customsearchcancelbutton" data-tableid="' + table.tables().nodes().to$().attr('id') + '"><i class="fa fa-ban danger"></i></a></li>')
    //searchwrapper.find('a').attr('style', 'display: inline-block; width: fit-content; border-radius: 3px; margin-bottom: 3px; margin-right:3px;overflow-x: hidden;');
    $('#customsearchcancelbutton').hide();
}

//Search Button Event Listener
$(document).on('click', '#customsearchcancelbutton', function (event) {
    var tableid = $(this).attr('data-tableid'); 
    var mytable = $('#' + tableid).DataTable();
    mytable.search('').columns().search('').draw();
    $('#customsearchcancelbutton').hide();
});

$(document).on('click', '#customsearchbutton', function (event) {
    var tableid = $(this).attr('data-tableid');
    var mytable = $('#' + tableid).DataTable();
    mytable = $('#' + tableid).DataTable();

    //clear search
    mytable.search('').columns().search('').draw();

    var inputhtmls = ' ';
    var resultcheck = false;
    mytable.columns().every(function () {
        resultcheck = true;
        //check if selectlist
        var nameoffield = this.header().textContent;
        var idoffield = this.index();
        var newhtmlinput = '<label class="control-label mb-10 mt-10 text-left-must">' + nameoffield + '</label><input placeholder="' + nameoffield +'" data-type="text" data-id="' + idoffield + '" class="form-control customSearchInput" name="" type="text" value="">';

        //Loop through
        if (this.header().innerHTML.search('<select') !== -1) {
            nameoffield = $(this.header().innerHTML).attr('data-name');
            if ($(this.header().innerHTML).attr('data-multiple') === "true") {
                newhtmlinput = '<label class="control-label mb-10 mt-10 text-left-must">' + nameoffield + '</label> </br><div data-type="combo" data-id="' + idoffield + '" class="customSearchInput customserachcheboxes">';
                var i = 0;
                $('#' + $(this.header().innerHTML).attr('id')).children('option').each(function () {
                    if ($(this).val() !== "All") {
                        newhtmlinput = newhtmlinput + '<div class="check-wrapper"> <input id="customSearchField_' + nameoffield + '_Box_' + i + '" type="checkbox" value="' + $(this).val() + '"> <label for="customSearchField_' + nameoffield + '_Box_' + i + '"> ' + $(this).val() + '</label></div>';
                        i++;
                    }
                });
                newhtmlinput = newhtmlinput + '</div>';
            } else {
                newhtmlinput = '<label class="control-label mb-10 mt-10 text-left-must">' + nameoffield + '</label><select data-type="radio" data-id="' + idoffield + '" class="form-control customSearchInput">';
                newhtmlinput = newhtmlinput + '<option name="' + nameoffield + '" value="">All</option>';

                $('#' + $(this.header().innerHTML).attr('id')).children('option').each(function () {
                    if ($(this).val() != "All") {
                        newhtmlinput = newhtmlinput + '<option name="' + nameoffield + '" value="' + $(this).val() + '">' + $(this).val() + '</option>';
                    }
                });
                newhtmlinput = newhtmlinput + '</select>';
            }

            //manuAlly input data (data-selectlist="true" data-selectlist-data="Active,Not Active")
        } else if ($(this.header()).attr('data-selectlist') === "true") {
            var datalist = $(this.header()).attr('data-selectlist-data').split(',');
            newhtmlinput = '<label class="control-label mb-10 mt-10 text-left-must">' + nameoffield + '</label><select data-type="radio" data-id="' + idoffield + '" class="form-control customSearchInput">';
            newhtmlinput = newhtmlinput + '<option name="' + nameoffield + '" value="">All</option>';
            $.each(datalist, function (index, value) {
                if (value != "All") {
                    newhtmlinput = newhtmlinput + '<option name="' + nameoffield + '" value="' + value + '">' + value + '</option>';
                }
            });
            newhtmlinput = newhtmlinput + '</select>';

            //Must have data-date and data-date-format as attributes and datetime format must be in MOMENT format
        } else if ($(this.header()).attr('data-date') === "true") {
            //get date format 
            var dateformat = $(this.header()).attr('data-date-format');
            //If the datatype is date
            var newhtmlinput = '<label class="control-label mb-10 mt-10 text-left-must">' + nameoffield + '</label><input data-type="date" type="text" data-id="' + idoffield + '" class="form-control customSearchInput customFilterDatepicker" name="" type="text" value="">';

        } else if ($(this.header()).attr('data-name').toLowerCase() === "actions" || nameoffield.toLowerCase() == "id") {
            return false;
        }
        if ($(this.header()).attr('data-field-enabled') != "false") {
            inputhtmls = inputhtmls + newhtmlinput;
        }
    });

    if (mytable !== null && resultcheck) {
        //Get Input Data
        var swalbox = swal.fire({
            title: 'Filter Table',
            html: inputhtmls ,
            showCancelButton: true,
            confirmButtonText: 'Search',
            cancelButtonText: 'Cancel',
            allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {   
            if (result.value) {
                //Filter Here
                //Gett all objects with class of customSearchInput
                $('.customSearchInput').each(function () {
                    //Check if combo box
                    if ($(this).attr('data-type') === "combo") {
                        //Do combobox code
                        var columnid = $(this).attr('data-id');

                        $(this).find('.check-wrapper input[type="checkbox"]:checked').each(function () {
                            mytable.columns(columnid).search($(this).val(), true, false).draw();
                        });
                    } else if ($(this).attr('data-type') === "date") {
                        //Do date
                        var columnid = $(this).attr('data-id');
                        var newformat = $(this).attr('data-date-myformat');
                        var dateval = $(this).val();
                        var formatteddate = moment(dateval).format(newformat);
                        if (formatteddate !== 'undefined' && formatteddate.length > 0 && formatteddate != "Invalid date") {
                            mytable.columns(columnid).search('^' + formatteddate, true, true, false).draw();
                        }
                    } else if ($(this).attr('data-type') === "radio") {
                        //Do combobox code
                        var columnid = $(this).attr('data-id');
                        if ($(this).val().length > 0) {
                            mytable.columns(columnid).search('^' + $(this).val() + "$", true, true, false).draw();
                        }

                    } else {
                        console.log(mytable.columns($(this).attr('data-id')).search('^' + $(this).val(), true, true, true).draw());
                        
                    }
                });
                $('#customsearchcancelbutton').show();

            }
        });        
    }
});
