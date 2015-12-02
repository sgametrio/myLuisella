//If true that mean we are on mobile and not on localhost.
var DEBUG_MOBILE = true;
var SERVER_IP = "http://192.168.1.200";
if (DEBUG_MOBILE)
{
    //First time opening the app or after cleaned app data
	if(localStorage.getItem("SERVER_IP") == null)
	{
		localStorage.setItem("SERVER_IP", "http://192.168.1.200");
		//Default value
		SERVER_IP = "http://192.168.1.200";
	}
	else
		SERVER_IP = JSON.parse(localStorage.getItem("SERVER_IP"));
}
