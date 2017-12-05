var activeMap;

var infoTemplateC;
var listTemplateC;

var markers = [];

var ptrContent = $$('.pull-to-refresh-content');

// Add 'refresh' listener on it
ptrContent.on('refresh', function (e) {
    //Close the indicator as we have an Ajax indicator on
    myApp.pullToRefreshDone();
    loadActiveVehicles();
});

$().ready(function () {
    initMap();
    loadActiveVehicles();

    var infoTemplate = $$('#markerInfoWindow').html();
    infoTemplateC = Template7.compile(infoTemplate);

    var listTemplate = $$('#vehicleListTmpl').html();
    listTemplateC = Template7.compile(listTemplate);
});

function initMap() {
    //Default location
    var myCenter = new google.maps.LatLng(3.145575, 101.588955);
    var mapCanvas = document.getElementById("googleMap");
    var mapOptions = { center: myCenter, zoom: 10, gestureHandling: 'cooperative'};
    activeMap = new google.maps.Map(mapCanvas, mapOptions);
};


function loadActiveVehicles()
{
    var payload = {};

    payload.uid = sessionStorage.getItem("uid");
    payload.userclient = sessionStorage.getItem("userclient");

    $$.ajax({
        url: "http://securetrac.my/testapi/api/avls/livedata",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem("App_Token"),
        },
        method: "POST",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(payload),

        success: function (data, status, xhr) {
           
            sessionStorage.setItem('activeList', JSON.stringify(data));
            showActiveVehicles(data);
        },
    });
};


function showActiveVehicles(data)
{
    if (data !== null && data !== undefined)
    {
        $('#lstActiveVehicles').empty();

        //Clear existing markers from map.
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];

        $.each(data, function (idx, elem) {
            var lat = elem.Latitude / 1000000;
            var lng = elem.Longitude / 1000000;
            var myPos = new google.maps.LatLng(lat, lng);

            elem.idx = (idx + 1).toString(); /* Gmaps needs strings */

            var marker = new google.maps.Marker({ position: myPos , title : elem.Vname , data : elem , label: elem.idx});
            marker.setMap(activeMap);

            markers.push(marker);

            marker.addListener('click', function () {
                var html = infoTemplateC(this.data);
                myApp.popover(html, '#googleMap', true);
            });

            //Populate the list
            var lstItem = listTemplateC(elem);
            $('#lstActiveVehicles').append(lstItem);
        });
    }
};

$(document).off('click', '#tglPane');
$(document).on('click', '#tglPane', function (e) {
    e.preventDefault();

    var state = $(this).attr('data-state');
    var gMap = $('#googleMap');
    var infoW = $('#vwInfo');

    if (state === "down")
    {
        $('#pnlUp').html($(infoW).prop('outerHTML'));
        $('#pnlUp').css('overflow', 'auto');

        $('#pnlDown').html(gMap);
        $('#pnlDown').css('overflow', '');

        var newTglr = $('#tglPane');
        $(newTglr).attr('data-state', 'up');
        $(newTglr).removeClass('fa-chevron-up');
        $(newTglr).addClass('fa-chevron-down');
        
    }
    else
    {
        $('#pnlUp').html(gMap); 
        $('#pnlUp').css('overflow', '');

        $('#pnlDown').html($(infoW).prop('outerHTML'));
        $('#pnlDown').css('overflow', 'auto');

        var newTglr = $('#tglPane');
        $(newTglr).attr('data-state', 'down');
        $(newTglr).removeClass('fa-chevron-down');
        $(newTglr).addClass('fa-chevron-up');
    }
});

$(document).off('click', '#lstActiveVehicles .item-content');
$(document).on('click', '#lstActiveVehicles .item-content', function (e) {
    var hdr = $(this).find('div.item-title')[0];

    if (hdr !== null || hdr !== undefined)
    {
        var vid = $(hdr).attr('data-vid');
        var markerData = $.grep(markers, function (elem, idx) {
            if (elem.data.Fullvid === vid)
            {
                return elem.data;
            }
        });

        if (markerData !== null || markerData !== undefined)
        {
            var html = infoTemplateC(markerData[0].data);
            myApp.popover(html, '#googleMap', true);
        }
    }
});