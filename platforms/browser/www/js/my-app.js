"use strict";

/*===============================================*/
/* APP INIT		 						         */
/*===============================================*/
var myApp = new Framework7({
    material: true,
    init: false,
    swipePanel: 'left',
    cache: 'false'

});

/*===============================================*/
/* EXPORT SELECTORS ENGINE		 			     */
/*===============================================*/
var $$ = Dom7;

/*===============================================*/
/* ADD VIEW		 			     				 */
/*===============================================*/
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});


/*=========================================================*/
/* SHOW/HIDE PRELOADER FOR REMOTE AJAX LOADED PAGES		   */
/*=========================================================*/

$$(document).on('ajaxStart', function (e) {
    myApp.showIndicator();
});
$$(document).on('ajaxComplete', function () {
    myApp.hideIndicator();
});

$$(document).on('ajaxError', function (evt, xhr, settings, error) {

    switch (evt.detail.xhr.status) {
        case 0:
            myApp.alert('No internet connnectivity', 'e÷EYE');
            break;
        case 401:
            myApp.alert('Your session has timed out. Please re-login', 'e÷EYE');
            break;
        default:
            //myApp.alert('An error occured while sending the request', 'e÷EYE');
            break;
    }

    myApp.hideIndicator();
});



/*==================================================================*/
/* PAGE INIT : HERE, YOU CAN WRITE YOUR CUSTOM JAVASCRIPT/JQUERY    */
/*==================================================================*/

$$(document).on('pageInit', function (e) {

    $('a.close-panel').click(function (e) {

        $('div.list-menu li').each(function (idx, elem) {
            $(this).removeClass('active-menu');
        });

        var menuLi = $(this).closest('li');
        menuLi.addClass('active-menu');
    });

});


//And now we initialize app
myApp.init();


//Register custom T7 Helper for Date Formats
Template7.registerHelper('fmtDate', function (theDate, dtFormat) {
    return moment(theDate).format(dtFormat);
});

Template7.registerHelper('fmtOdo', function (value) {
    var digits = ("" + value).split("");
    var shtml = $('<div class=\'odo\'/>');
    var digitArea = false;

    $.each(digits, function (idx, elem) {
        if (elem === ".") {
            digitArea = true;
        }

        if (!digitArea) {
            var str = '<span>' + elem + '</span>';
            shtml.append(str);
        }
        else {
            if (elem !== ".")
            {
                var str = '<span class=\'digit\'>' + elem + '</span>';
                shtml.append(str);
            }
        }
    });

    //If the Odo does not have a decimal point - add a zero
    if (!digitArea)
    {
        var str = '<span class=\'digit\'>0</span>';
        shtml.append(str);
    }

    return shtml.prop('outerHTML');


});