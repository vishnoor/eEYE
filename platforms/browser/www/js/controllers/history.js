//Reference to gMap Variable
var histMap;
var histMarkers = [];

myApp.onPageInit('history', function (page) {
    //initHistMap();
    populateVehicleList();

    //Set the tilldate to today
    $('#dtTillDate').val(moment().format('YYYY-MM-DDTHH:mm'));

});

$(document).off('click', '#btnRefresh');
$(document).on('click', '#btnRefresh', function (e) {
    e.preventDefault();

    if (validateForm())
        fetchData();
    else
        myApp.alert('Please provide all fields', 'e÷EYE');

});

$(document).off('click', '#cmdFindVehicleHistory');
$(document).on('click', '#cmdFindVehicleHistory', function (e) {
    e.preventDefault();

    if (validateForm())
        fetchData();
    else
        myApp.alert('Please provide all fields', 'e÷EYE');
   
});


$(document).off('click', '#mdFullMap');
$(document).on('click', '#mdFullMap', function (e) {
    e.preventDefault();
    //Get height of WebView
    var winHeight = $('.page-content').height();
    var theI = $($(this).find('i')[0]);

    //Get state of Criteria Panel
    var state = $('#pnlHistoryCriteria').attr('data-state');

    //Toggle UI
    $('#pnlHistoryCriteria').toggle();

    //Set state of Criteria Panel
    if (state === 'expanded')
    {
        $('#pnlHistoryCriteria').attr('data-state', 'collapsed');

        $('#vwMap').height(winHeight + 'px');
        $('#googleMap-hist').height((winHeight) + 'px');

        theI.removeClass('fa-expand');
        theI.addClass('fa-compress');
    }
    else
    {
        $('#pnlHistoryCriteria').attr('data-state', 'expanded');

        $('#vwMap').height('420px');
        $('#googleMap-hist').height('420px');

        theI.removeClass('fa-compress');
        theI.addClass('fa-expand');
    }

    google.maps.event.trigger(histMap, 'resize');
});

//mdList Handler
$(document).off('click', '#mdList');
$(document).on('click', '#mdList', function (e) {
    $('#vwMap').hide();
    $('#mdMap').removeClass('active');

    $('#vwList').show();
    $('#mdList').addClass('active');
});

//mdList Handler
$(document).off('click', '#mdMap');
$(document).on('click', '#mdMap', function (e) {
    $('#vwList').hide();
    $('#mdList').removeClass('active');

    $('#vwMap').show();
    $('#mdMap').addClass('active');

    google.maps.event.trigger(histMap, 'resize');
});

$(document).off('click', '#vwList .item-content');
$(document).on('click', '#vwList .item-content', function (e) {

    var what = $(this).find('.item-title')[0];
    if (what !== null || what !== undefined)
    {
        var idx = $(what).attr('data-vid');
    }
    var html = infoTemplateC(histMarkers[idx].data);
    myApp.popover(html, '#vwList', true);
});

//Functions
function initHistMap()
{
    //Default location
    var myCenter = new google.maps.LatLng(3.145575, 101.588955);
    var mapCanvas = document.getElementById("googleMap-hist");
    var mapOptions = { center: myCenter, zoom: 10, gestureHandling: 'cooperative'};
    histMap = new google.maps.Map(mapCanvas, mapOptions);
    $('#vwMap').show();
};

function fetchData()
{
    if (histMap === null || histMap === undefined) {
        initHistMap();
    }

    var payload = {};

    payload.fullvid = $('#cboVehicle').find('option:selected').val();
    payload.fromdate = moment($('#dtStartDate').val()).format('YYYYMMDDHHmmss');
    payload.todate = moment($('#dtTillDate').val()).format('YYYYMMDDHHmmss');

    $$.ajax({
        url: "http://securetrac.my/testapi/api/avls/histdata",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem("App_Token"),
        },
        method: "POST",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(payload),

        success: function (data, status, xhr) {

            $('#pnlHistoryResult').show();

            if (data !== null || data !== undefined)
            {
                if (data.length > 0)
                {
                    var nData = transformData(data);
                    renderMarkers(nData);
                }
                else
                {
                    myApp.alert('No data found for provided criteria.', 'e÷EYE');
                    $('#lstVehicleHistory').html('No data');

                    //Clear any existing markers
                    if (histMarkers !== null || histMarkers !== undefined) {
                        $.each(histMarkers, function (idx, elem) {
                            elem.setMap(null);
                        });
                        histMarkers = [];
                    }
                }
            }
        },

    });
};

function renderMarkers(historyPoints)
{
    google.maps.event.trigger(histMap, 'resize');
    $('#lstVehicleHistory').html('');


    var listTemplate = $('#vehicleHistoryListTmpl').html();
    var listHistTemplateC = Template7.compile(listTemplate);

    if (historyPoints !== null || historyPoints !== undefined)
    {
        //Clear any existing markers
        if (histMarkers !== null || histMarkers !== undefined)
        {
            $.each(histMarkers, function (idx, elem) {
                elem.setMap(null);
            });
            histMarkers = [];
        }
        
        $.each(historyPoints, function (idx, elem) {

            var lat = elem.Latitude / 1000000;
            var lng = elem.Longitude / 1000000;
            elem.idx = idx;

            var histPoint = new google.maps.LatLng(lat, lng);
            var marker = new google.maps.Marker({ position: histPoint, data: elem });
            marker.setMap(histMap);

            histMarkers.push(marker);
            
            marker.addListener('click', function () {
                //console.log(this.data);
                showMapInfo(this.data);
            });
            
            //Populate the list
            var lstItem = listHistTemplateC(elem);
            $('#lstVehicleHistory').append(lstItem);
        });

        //Center to the last point in the array
        var newCenterP = historyPoints[historyPoints.length - 1];
        var latC = newCenterP.Latitude / 1000000;
        var lngC = newCenterP.Longitude / 1000000;
        var histPointC = new google.maps.LatLng(lat, lng);
        histMap.setCenter(latC, lngC);

    }
};

function populateVehicleList() {
    var activeList = sessionStorage.getItem('activeList');
    if (activeList !== null || activeList !== undefined)
    {
        var jObj = JSON.parse(activeList);
        var cbo = $('#cboVehicle');

        $.each(jObj, function (idx, elem) {
            var optionHTML = '<option value=\'' + elem.Fullvid + '\'>' + elem.Vname + '</option>';
            cbo.append(optionHTML);
        });
    }
};

function validateForm() {
    var isOk = true;

    isOk = isOk && $('#dtStartDate').val() === "" ? false : true;

    if (isOk)
    {
        isOk = $('#dtTillDate').val() === "" ? false : true;
    }
    

    return isOk;
};

function transformData(data)
{
    /*
    var histData = $.map(data, function (elem, i) {
        elem.Gpsdt1 = moment(elem.Gpsdt).format('YYYYMMDDHHmmss');
        return elem;
    });
    */
    var sorted = data.sort(function compareDates(a, b) { // non-anonymous as you ordered...
        var dateA = new Date(a.Gpsdt);
        var dateB = new Date(b.Gpsdt);
        return dateB - dateA ;
    });

    return sorted;
}

function showMapInfo(data)
{
     var html = infoTemplateC(data);
     myApp.popover(html, '#googleMap-hist', true);
}