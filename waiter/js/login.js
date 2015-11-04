$(document).ready(function(){
	//mozSystem is needed beacuse the app without it can't do any crossdomain request
    //with ajaxSetup settings are saved for all future AJAX calls.
    $.ajaxSetup({
      xhrFields: {
        mozSystem: true
      }
    });
    document.getElementById("server_url_text").value = $.parseJSON(localStorage.getItem("SERVER_IP"));
});

function login()
{
    var pw = document.getElementById('login_password').value;
    var pass;
    var user = document.getElementById('login_username').value;
    //function that converts into an md5 hash the password 
    pass = md5(pw);
    

    $.ajax({
        type: 'POST',
        url: SERVER_IP + "/myLuisella-server/validateLogin.php",
        data: {username: user, password: pass},
        success: function(data){
            if(!isNaN(data))
				{
					window.location.assign("home.html");
					localStorage.setItem("loggedUser", user);
					localStorage.setItem("loggedUserId", data);
				}
            else if(data == "Bad")
                $('#error').html('Check your credentials, <strong>please</strong>.');
            else
                alert(data.toString());
        },
        error: function(data){
            var error = 'Connection error. Retry later, please.<br/>';
            $('#error').html(error);
        }
    });
    return false;
}
    
function signup()
{
    var pw = document.getElementById('signup_password').value;
    var pass;
    var admin_pw = document.getElementById('signup_admin').value;
    var admin_pass;
    var user = document.getElementById('signup_username').value;
    //function that converts into an md5 hash the password 
    pass = md5(pw);
    admin_pass = md5(admin_pw);

    $.ajax({
        type: 'POST',
        url: SERVER_IP + "/myLuisella-server/createUser.php",
        data: {username: user, password: pass, admin: admin_pass},
        success: function(data){
            if(data == "Good")
                window.location.assign("home.html");
            else if(data == "Bad")
                $('#error-signup').html('Wrong admin password.');
            else
                $('#error-signup').html(data.toString());
        },
        error: function(){
            $('#error-signup').html('Retry later, <strong>please</strong>.');
        }
    });
    return false;
}

function changeServerUrl()
{
    //TODO: Check valid URL
    SERVER_IP = document.getElementById("server_url_text").value;
    localStorage.setItem("SERVER_IP", JSON.stringify(new Object(SERVER_IP)));
    alert("Now server URL is: " + SERVER_IP);
}