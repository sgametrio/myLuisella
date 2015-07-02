//If true that mean we are on mobile and not on localhost.
var DEBUG_MOBILE = false;
var SERVER_IP = "https://192.168.0.200";

if(!DEBUG_MOBILE)
	SERVER_IP = "http://localhost";

if(localStorage.getItem("loggedUser") !== null)
{
	//Someone is logged. Go ahead to "home page".
	window.location.assign("home.html");
}