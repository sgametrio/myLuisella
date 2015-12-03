if(localStorage.getItem("loggedUser") == null)
{
   //No one is logged. Return to the 'log-in page'
   window.location.assign("index.html");
}
