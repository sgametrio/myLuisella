$(document).on('pageinit', pageinit);
			   
function pageinit()
{
    //mozSystem is needed because the app without it can't do any crossdomain request
    //with ajaxSetup, settings are saved for all future AJAX calls.
    $.ajaxSetup({
      xhrFields: {
        mozSystem: true
      }
    });
	
	//Don't know if this tags are useful
	$.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
    
	//If true that mean we are on mobile and not on localhost.
	var DEBUG_MOBILE = true;
	var SERVER_IP = "https://192.168.0.200";

	if(!DEBUG_MOBILE)
		SERVER_IP = "http://localhost";

	
	
	//PANEL BUTTON -> Home
	$('#homepage').click(homepage);
	
	//NAVBAR -> Home
	$('#home-button').click(registeredTables);
	
	function homepage()
	{
		$('#main-panel').panel('close');
		$('#replaceable').empty();
		$('#ajax-table-panel').empty();
		$('#replaceable').html($('#home-div').html());
		$('#replaceable').trigger('create');
	}
	
  
    //PANEL BUTTON -> Log out
    $('#logout').click(logout);
	
	function logout()
	{
		var response = window.confirm("Are you sure you want to log out?")
		if (response)
		{
			localStorage.removeItem("loggedUser");
			localStorage.removeItem("loggedUserId");
			window.location.assign("index.html");  
		}
	}
	
	
	function updateMenu() 
	{
		var menu, menuJSON;
		var date = new Date();
		var dataString = date.getFullYear().toString() + ('0' + (date.getMonth() + 1).toString()).slice(-2) + ('0' + date.getDate().toString()).slice(-2);
		retrieveMenu(dataString);
		//Now localStorage item is set correctly and we are ready to read and display plates in a collapsible set 
	}
	
	function makeOrder() 
	{
		var t_id = $('#tables-available').val();
		if(t_id == "")
		{
			alert("Please, select a table");
			return false;
		}
		var order = {};
		var food = [];
		order.tableId = t_id;
		order.waitressId = localStorage.getItem("loggedUserId");

		$.each($('[name="food"]'), function(){
			var food_quantity = $(this).find('[name="slider"]').val();
			var food_id = $(this).attr("id");
			//send only plates with at least 1 quantity
			if(food_quantity != 0)
			{
				food.push({ foodId: food_id, quantity: food_quantity });
			}
		});
		order.food = food;
		//Send order to server.
		$.ajax({
			type: 'POST',
			url: SERVER_IP + "/myLuisella-server/makeOrder.php",
			data: { order: JSON.stringify(order)},
			beforeSend:function() {
				// this is where we append a loading image
				$('#ajax-panel').html('<div class="loading"><img src="css/images/ajax-loader.gif" alt="Loading..." /></div>');
			},
			success:function(data) {
				var dataObject = JSON.parse(data);
				if(dataObject.result == "Good")
				{
					$('#menu-ajax').empty();
					$('#menu-ajax').html('Order sent.');
					for(var i = 0; i < dataObject.response_error.length; i++)
						$('#menu-ajax').append(dataObject.response_error[i].text);
				}
				else
				{

					$('#menu-ajax').empty();
					for(var i = 0; i < dataObject.response_error.length; i++)
						$('#menu-ajax').append(dataObject.response_error[i].text);
				}
			},
			error:function() {
				// failed request; give feedback to user
				$('#ajax-panel').empty();
				$('#ajax-panel').html('<strong>Oops!</strong> Connection error.');
			}
		});
		return false;
	}
	
	function newOrder(event) 
	{
		/*  Versione finale:
			- salvo la lista in localStorage (JSON)
			- ogni volta che il cameriere seleziona "make an order" legge dal file in locale i piatti disponibili, se esiste, altrimenti significa che è la prima volta che apre l'app quindi scarica dal DB;
			- Il DB contiene la lista dei piatti e l'attributo booleano "today" indica se quel piatto è presente nel menù del giorno.
		*/
		$('#main-panel').panel('close');
		$('#replaceable').empty();
		$('#ajax-table-panel').empty();
		$('#replaceable').html($('#new-orders').html());
		$('#replaceable').trigger('create');

		//ORDER BUTTON -> Make order
		
		$('#make-order').click(makeOrder);

		//ORDER BUTTON -> Update menu
		
		$('#update-menu').click(updateMenu);
		
		

	   /* Using web storage API:
		*   - localStorage save data as key -> value with no expiring date;
		*   - We save it as JSON because localStorage admit only string data;
		*   - If browser support localStorage then we cache menu, otherwise we retrieve today's menu every time from server
		*   - When we save today's menu we use json.stringify(json_object);
		*   - When we retrieve today's menu we use json.parse(string);
		*/
		if(typeof Storage !== "undefined")
		{
			var menu, menuJSON;
			var date = new Date();
			/*
				To explain, .slice(-2) gives us the last two characters of the string.
				So no matter what, we can add "0" to the day or month, and just ask for the last two since those are always the two we want.

				So if the MyDate.getMonth() returns 9, it will be:
				("0" + "9") // Giving us "09"

				so adding .slice(-2) on that gives us the last two characters which is:
				("0" + "9").slice(-2)
				"09"

				But if MyDate.getMonth() returns 10, it will be:
				("0" + "10") // Giving us "010"

				so adding .slice(-2) gives us the last two characters, or:
				("0" + "10").slice(-2)
				"10"
			 */
			var dataString = date.getFullYear().toString() + ('0' + (date.getMonth() + 1).toString()).slice(-2) + ('0' + date.getDate().toString()).slice(-2);

			if(localStorage.getItem(dataString) == null)
			{
				//Updating menu by triggering button
				$('#update-menu').trigger('click');
			}
			else
			{
				$('#menu-ajax').html("Today's menu retrieved from local storage.");
				//Now localStorage item is set correctly and we are ready to read and display plates in a collapsible set or multiselect(?) 
				menu = $.parseJSON(localStorage.getItem(dataString));
				var str = "";
				//for each object we save some property and we display it
				$.each(menu, function() {
					str = str.concat("<div data-role='collapsible' name='food' id=" + this["foodId"] + " data-collapsed='true'><h3>" + this["foodName"] + "</h3><p>" + this["description"] + " <div data-role='fieldcontain'><input type='range' name='slider' value='0' min='0' max='10' data-highlight='true' /></div></p></div>");
				});
				$('#collapsible-order').empty();
				$('#collapsible-order').append(str);
				$('#collapsible-order').collapsibleset().trigger('create');
			}
			
			var table = event.data.tableId;
			
			$('#tables-available').empty();
			$.ajax({
				type: 'GET',
				url: SERVER_IP + "/myLuisella-server/tables.php",
				data: { tableId: table },
				beforeSend:function(){
					// this is where we append a loading image
					$('#table-ajax').html('<div class="loading"><img src="css/images/ajax-loader.gif" alt="Loading..." /></div>');
				},
				success:function(data){
					//We parse JSON from tables.php to display it in a select
					var obj = $.parseJSON(data);
					$('#table-ajax').empty();
					var str = "";

					$.each(obj, function(){
						if(table !== "all")
						{
							str = str.concat("<option selected value=" + this["tableId"] + ">" + this["tableNumber"] + " - " + this["tableName"] + "</option>");
						}
						else
						{
							str = str.concat("<option value=" + this["tableId"] + ">" + this["tableNumber"] + " - " + this["tableName"] + "</option>");
						}	
					});
					$('#tables-available').html(str);
					$('#tables-available').selectmenu('refresh');

				},
				error: function(){
					alert("Error retrieving tables' list from server, check your connection please.");
				}
			});
		}
	}
	
	function newTable()
	{	
		$('#ajax-table-panel').empty();
		$('#ajax-panel').empty();
		$('#replaceable').empty();	
		//Replace the whole content with another div content
		$('#replaceable').html($('#new-table-content').html());
		$('#replaceable').trigger('create');
		//Handle click event on the reset button for erasing all data in the form
		$('#reset-button-table').click(function(){
			document.getElementById('table-name').value = "";
			document.getElementById('table-number').value = "";
			document.getElementById('customers').value = "";
			$('#ajax-panel').empty();
			return false;
		});
        //Handle click event on submit so the data are sent via AJAX to the PHP's page which save them into DB.
		$('#submit-button-table').click( function(){
			var table_name = document.getElementById('table-name').value;
			var table_number = document.getElementById('table-number').value;
			var table_customers = document.getElementById('customers').value;
			if(table_name == "" || isNaN(table_number) || isNaN(table_customers) || table_number == "" || table_customers == "")
			{
				$('#ajax-panel').html('<strong>Oops!</strong> Check what you wrote.');
				return false;
			}
			$.ajax({
				type: 'POST',
				url: SERVER_IP + "/myLuisella-server/insertTable.php",
				data: { tableName: table_name, tableNumber: table_number, customers: table_customers },
				beforeSend:function(){
					// this is where we append a loading image
					$('#ajax-panel').html('<div class="loading"><img src="css/images/ajax-loader.gif" alt="Loading..." /></div>');
				},
				success:function(data){
					if(data == "Good")
					{
						$('#ajax-panel').empty();
						$('#ajax-panel').html('New table created. <strong>Congrats!</strong>');
					}
					else
					{
						$('#ajax-panel').empty();
						$('#ajax-panel').html(data.toString());
					}
				},
				error:function(){
					// failed request; give feedback to user
					$('#ajax-panel').empty();
					$('#ajax-panel').html('<strong>Oops!</strong> Connection error.');
				}
			});
			return false;
		});
        //Closing the left panel
		$('#main-panel').panel('close');
		
		//Avoid default action for 'click' event
		return false;
	}
	
	//PANEL BUTTON -> New order
	$('#new-order').click({ tableId: "all" }, newOrder);
	
	//PANEL BUTTON -> Registered tables
	$('#all-table').click(registeredTables);
	
	function registeredTables(){
	
		$('#main-panel').panel('close');
		$('#replaceable').empty();
		$('#ajax-table-panel').empty();

		$.ajax({
			type: 'GET',
			url: SERVER_IP + "/myLuisella-server/tables.php",
            
			beforeSend:function(){
				// this is where we append a loading image
				$('#ajax-table-panel').html('<div class="loading"><img src="css/images/ajax-loader.gif" alt="Loading..." /></div>');
			},
			success:function(data){
				//We parse JSON from tables.php to display it in a listview
				var obj = $.parseJSON(data);
				$('#ajax-table-panel').empty();
				var str = "";
                //Creating a listview header
				str = str.concat("<div style='overflow:hidden' data-role='fieldcontain'><ul id='all-tab' class='ui-listview no-margin-top' data-role='listview' data-theme='b' data-inset='true'><li data-role='list-divider' data-theme='a'>Registered tables</li>");
                //For each object retrieved through AJAX and JSON it have to be created a line in the listview, having parameters as attributes for a future use.
				$.each(obj, function() {
					str = str.concat("<li><a style='text-decoration:none !important;' class='table' tablename='", this['tableName'], "' tablenumber='", this['tableNumber'], "' tablecustomers='", this['customers'], "' href='#' id='", this['tableId'], "'>", this['tableNumber'], " - ", this['tableName'], "</a></li>");
				//TODO badge with customers
				});
				str = str.concat("</ul></div><button data-icon='flat-plus' data-theme='d' id='new-table-from-registered'>Add new table</button>");
				$('#ajax-table-panel').html(str).trigger('create');
				//$('#all-tab').listview('refresh');
				
				//Every <li> with 'table' class is listening on click tap for openTable function()
				$('.table').on("tap click", openTable);
				$("#new-table-from-registered").click(newTable);
			},
			error:function(){
				// failed request; give feedback to user
				$('#ajax-table-panel').empty();
				$('#ajax-table-panel').html('<strong>Oops!</strong> Try that again in a few moments.');
			}
		});
		//avoid default action for 'click' event
		return false;
	}

	//When the page is created I simulate #all-table click
	$('#all-table').trigger('click');
	
	//PANEL BUTTON -> Register a new table
	$('#new-table').click(newTable);
    
	function retrieveMenu(dataString)
	{
		$.ajax({
			type: "POST",
			url: SERVER_IP + "/myLuisella-server/getTodayMenu.php",
			success: function(data) {
				localStorage.setItem(dataString, data);
				$('#menu-ajax').html("Today's menu retrieved from server and saved to local storage.");
				menu = $.parseJSON(localStorage.getItem(dataString));
				var str = "";
				//for each object we save some property and we display it
				$.each(menu, function() {
					str = str.concat("<div data-role='collapsible' name='food' id=" + this["foodId"] + " data-collapsed='true'><h3>" + this["foodName"] + "</h3><p>" + this["description"] + " <div data-role='fieldcontain'><input type='range' name='slider' min='0' max='10' data-highlight='true' /></div></p></div>");
				});
				$('#collapsible-order').empty();
				$('#collapsible-order').html(str);
				$('#collapsible-order').collapsibleset().trigger('create');
			},
			error: function() {
				$('#menu-ajax').html("Error retrieving menu from server. Please check your connection and refresh.");
			}
		});
	}
	
	function deletePlate(event)
	{
		var id = $(event.target).attr("id").split('&');
		//foodId&orderId
		$.ajax({
			type: 'POST',
			url: SERVER_IP + "/myLuisella-server/deleteOrder.php",
            
			data: { foodId: id[0], orderId: id[1] },
			success:function(data){
				if (data == 0)
				{
					listOrder($(event.target).attr("tableid"), 1)
				}
				else
				{
					alert(data);
				}
			},
			error:function(){
				alert("Connection error. Reconnect and try later.");
			}
		});		
	}
	
	function listOrder(t_id, to_make)
	{
		$.ajax({
			type: 'POST',
			url: SERVER_IP + "/myLuisella-server/findOrders.php",
            
			data: { tableId: t_id, toMake: to_make },
			beforeSend:function(){
				// this is where we append a loading image
				$('#ajax-open-table').html('<div class="loading"><img src="css/images/ajax-loader.gif" alt="Loading..." /></div>');
			},
			success:function(data){
				if(data == "1")
				{
					//There is an internal error (bug)
					$('#ajax-open-table').empty();
					$('#ajax-open-table').html('Something internally has broken. <strong>Table not found.</strong>');
				}
				else if(data == "0")
				{
					//No orders
					$('#ajax-open-table').empty();
					$('#collapsible-order-content').html('<h3 style="text-align:center">We found NO orders.</h3>');
				}
				else
				{
					//Show the orders in a little listview
                    //We parse JSON from findOrders.php to display it in a listview
                    var plates = $.parseJSON(data);
                    $('#ajax-open-table').empty();
                    var str = "<h3 style='text-align:center'>Orders found:</h3>";
					
                    for(var i = 0; i < plates.length; i++)
						for(var j = 0; j < plates[i]["foodIds"].length; j++)
							str = str.concat("<div data-role='collapsible' name='plates' data-collapsed='true'><h3>" + plates[i]["quantities"][j] + " | " + plates[i]["foodNames"][j] + "</h3><p><button tableid='" + t_id + "' id=" + plates[i]["foodIds"][j] + "&" + plates[i]["orderId"] + " name='delete-plate' data-icon='flat-cross' data-theme='d'>Delete order</button></p></div>");
					
					$('#collapsible-order-content').empty();
					$('#collapsible-order-content').html(str);
					$('#collapsible-order-content').collapsibleset().trigger('create');
					$('[name="delete-plate"]').click(deletePlate);

				}
				$('#make-order-from-tables').on("tap click", { tableId: t_id }, newOrder);
			},
			error:function(data){
				// failed request; give feedback to user
				$('#ajax-open-table').empty();
				$('#ajax-open-table').html('<strong>Oops!</strong> Try that again in a few moments.');
			}
		});
	}
	
	function openTable(event)
	{
		//Replace the current page with #open-table-content
		$('#ajax-table-panel').empty();
		$('#replaceable').html($('#open-table-content').html());
		$('#replaceable').trigger('create');
		
		//Fill the related fields of static content already existing with parameters
		$('#table-number').attr("value", $(event.target).attr("tablenumber"));
		$('#table-name').attr("value", $(event.target).attr("tablename"));
		$('#customers').attr("value", $(event.target).attr("tablecustomers"));
		var t_id = $(event.target).attr("id");
		var to_make = 1; //true in boolean
		
		//AJAX call is needed to find the table-related orders
		listOrder(t_id, to_make);
		
		//We make possible to table and all its order
		$('#delete-table').click(function(){
			var response = window.confirm("Are you sure you want to delete this table and ALL of its orders?")
			if (response)
			{
				$.ajax({
					type: 'POST',
					url: SERVER_IP + "/myLuisella-server/deleteTable.php",
					data: { tableId: t_id },
					success:function(data){
						if(data == 0)
							$('#all-table').trigger('click');
						else
						{
							$('#ajax-modify-table').empty();
							$('#ajax-modify-table').html(data.toString());
						}
							
					},
					error:function(){
						// failed request; give feedback to user
						$('#ajax-modify-table').empty();
						$('#ajax-modify-table').html('Check your connection, <strong>please</strong>.');
					}
				});
			}
			
		});
		
        //We make possible to change table info
		$('#modify-table').click(function(){
            
            var table_name = document.getElementById('table-name').value;
			var table_number = document.getElementById('table-number').value;
			var table_customers = document.getElementById('customers').value;
			if(table_name == "" || isNaN(table_number) || isNaN(table_customers) || table_number == "" || table_customers == "")
			{
				$('#ajax-modify-table').html('<strong>Oops!</strong> Check what you wrote.');
				return false;
			}
            
			$.ajax({
				type: 'POST',
                //TODO: send only modified parameters, not all. It is faster and lighter.
				url: SERVER_IP + "/myLuisella-server/modifyTable.php",
                
				data: { tableId: t_id, tableName: table_name, tableNumber: table_number, customers: table_customers },
				beforeSend:function(){
					// this is where we append a loading image
					$('#ajax-modify-table').html('<div class="loading"><img src="css/images/ajax-loader.gif" alt="Loading..." /></div>');
				},
				success:function(data){
					if(data == "0")
					{
                        //It's all ok. MODIFIED
						$('#ajax-modify-table').empty();
						$('#ajax-modify-table').html('<strong>Modified correctly</strong>.');
					}
					else
					{
                        //Something has broken. NOT MODIFIED
						$('#ajax-modify-table').empty();
						//$('#ajax-modify-table').html('<strong>Not modified. Something went wrong.</strong>.');
                        $('#ajax-modify-table').html(data.toString());
                    }
				},
				error:function(){
					// failed request; give feedback to user
					$('#ajax-modify-table').empty();
					$('#ajax-modify-table').html('Check your connection, <strong>please</strong>.');
				}
			});
		});
	}
}

