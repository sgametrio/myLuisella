//This page set up the server ip for first time or retrieve it from localStorage

//First time opening the app or after cleaned app data
if(localStorage.getItem("SERVER_IP") == null)
{
   localStorage.setItem("SERVER_IP", JSON.stringify(new Object("https://192.168.1.200")));
   //Default value for server ip
   SERVER_IP = "https://192.168.1.200";
}
else
   SERVER_IP = JSON.parse(localStorage.getItem("SERVER_IP"));
