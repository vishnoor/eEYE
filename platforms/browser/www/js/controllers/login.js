
$('#btnLogin').click(function (e) {
    e.preventDefault();

    if (validateForm())
    {

        $$.ajax({
            url : "http://securetrac.my/testapi/token",
            method : "POST",
            dataType : 'json',
            data : $('#frmLogin').serialize(),

            success : function (data, status, xhr) {
            
                processLoginResult(data);
            },
        });
    }
});

function processLoginResult(data) {
    if (data.access_token !== null || data.access_token !== undefined)
    {
        sessionStorage.setItem("App_Token", data.access_token);
        window.location = "home.html";
    }
}

function validateForm()
{
    sessionStorage.setItem("uid", $('#username').val());
    sessionStorage.setItem("userclient", $('#UserClient').val());

    return true;
}