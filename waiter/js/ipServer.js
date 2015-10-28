//If true that mean we are on mobile and not on localhost.
var DEBUG_MOBILE = true;
var SERVER_IP = "http://localhost";
if (DEBUG_MOBILE)
{
    //First time opening the app or after cleaned app data
	if(localStorage.getItem("SERVER_IP") == null)
    {
        localStorage.setItem("SERVER_IP", JSON.stringify(new Object("https://192.168.1.200")));
        //Default value
        SERVER_IP = "https://192.168.1.200";
    }
    else
        SERVER_IP = JSON.parse(localStorage.getItem("SERVER_IP"));                   
}