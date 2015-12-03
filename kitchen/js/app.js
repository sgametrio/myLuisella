$(document).ready(function(){

	var getIdFromRow = "";
	var modal = {};
	var table_id = "";

	//Refresh button
	$('#all-tables-and-orders').click(all_tables);

	function all_tables()
	{
		$.ajax({
			type: 'GET',
			url: SERVER_IP + "/myLuisella-server/tablesAndOrders.php",
			success:function(data){
				if(data == 0)
				{
					//It means there aren't any tables
					$('#tables').html("No tables found.");
				}
				else
				{
					//We parse JSON to display tables into cards
					var tables = $.parseJSON(data);
					for(var i = 1; i <= 3; i++)
						$('#tables-col-' + i).empty();
					for(var i = 0; i < tables.length; i++)
					{
						var str = "";
						var n_order = tables[i]["order"].length;
						if(n_order == 0)
						{
							str = str.concat("<div class='panel panel-info'><div style='text-align:center' class='panel-heading'><div style='float:left'>#" + tables[i]["tableNumber"] + "</div>" + tables[i]["tableName"] + "</div><div class='panel-body' id='" + tables[i]["tableId"] + "'><p  style='text-align:center'><strong>No orders found yet.</strong></p></div></div>");
						}
						else
						{
							str = str.concat("<div class='panel panel-info'><div style='text-align:center' class='panel-heading'><div style='float:left'>#" + tables[i]["tableNumber"] + "</div>" + tables[i]["tableName"] + "</div><div class='panel-body' id='" + tables[i]["tableId"] + "'><p><table class='table table-condensed table-striped'>");

                     //Make creation of dynamic HTML unique between two different function calls
                     str = str.concat(createTableCode(tables[i]["order"], tables[i]["tableId"]));
                     str = str.concat("</table></p></div></div>");
						}
						var column = ((i%3)+1);
						$(str).appendTo('#tables-col-' + column);
					}
				}

			},
			error:function(){
				// failed request; give feedback to user
				$('#tables').html('<strong>Oops!</strong> Try that again in a few moments.');
			}
		});
	}
   
   function refreshTableOrder(table_id)
	{
		$.ajax({
			type: 'POST',
			url: SERVER_IP + "/myLuisella-server/findOrders.php",
			data: { tableId: table_id },
			success:function(data) {
				var str = "";
				$('#' + table_id).empty();
				if(data == 0)
					str = "<p style='text-align:center'><strong>No orders found yet.</strong><p>";
				else
				{
					var orders = $.parseJSON(data);
					if(orders.length == 0)
						str = "<p style='text-align:center'><strong>No orders found yet.</strong><p>";
					else
					{
						str = "<p><table class='table table-condensed table-striped'>";
                  //Make creation of dynamic HTML unique between two different function calls
                  str = str.concat(createTableCode(orders, table_id));
						str = str.concat("</table></p>");
					}

				}
				$('#' + table_id).html(str);
			}
		});
	}

   function createTableCode(orders, tableId)
   {
      var str = "";
      for(var j = 0; j < orders.length; j++)
      {
         for(var k = 0; k < orders[j]["foodIds"].length; k++)
         {
            str = str.concat("<tr data-toggle='modal' data-food='" + orders[j]["foodNames"][k] + "' data-qty='" + orders[j]["quantities"][k] + "' data-table='" + tableId + "' data-id='" + orders[j]["foodIds"][k] + "&" + orders[j]["orderId"]);
            if(orders[j]["status"][k] == 1)
               str = str.concat("' style='background-color:#FFF59D' data-target='#mark-as-done'");
            else
               str = str.concat("' data-target='#confirm-modal'");
            str = str.concat("><td class='col-md-9 col-sm-9 col-xs-9'>" + orders[j]["foodNames"][k] + "</td>");
            if(orders[j]["extraInfos"][k] != null)
               str = str.concat("<td class='col-md-1 col-sm-1 col-xs-1'>X</td>");
            else
               str = str.concat("<td class='col-md-1 col-sm-1 col-xs-1'></td>");
            str = str.concat("<td class='col-md-2 col-sm-2 col-xs-2'>" + orders[j]["quantities"][k] + "</td>");
            str = str.concat("</tr>");
         }
      }
      return str;
   }

	function markPlate(table_id, foodId, orderId, modal, plate_code)
	{
		$.ajax({
			type: 'POST',
			url: SERVER_IP + "/myLuisella-server/markPlate.php",
			data: { foodId: foodId, orderId: orderId , status: plate_code},
			success: function(data){
				if(data == 0)
				{
					modal.modal('hide');
					refreshTableOrder(table_id);
				}
				else
				{
					modal.find('#modal-body').html('DataBase error. Please retry.');
				}
			},
			error:function(){
				modal.find('#modal-body').html('No connection to the server. Check it and retry soon.');
			}
		});
	}

	$('#mark-as-done').modal({
		show: false
	}).on('show.bs.modal', function(event){
		getIdFromRow = $(event.relatedTarget).data('id');
		var foodName = $(event.relatedTarget).data('food');
		var quantity= $(event.relatedTarget).data('qty');
		table_id = $(event.relatedTarget).data('table');
		modal = $(this);
		//make your ajax call populate items or what even you need
		modal.find('#modal-body').html($('<b> Order selected: ' + quantity + ' ' + foodName  + '</b>'));
	});

   $('#confirm-modal').modal({
		show: false
	}).on('show.bs.modal', function(event){
		getIdFromRow = $(event.relatedTarget).data('id');
		var foodName = $(event.relatedTarget).data('food');
		var quantity= $(event.relatedTarget).data('qty');
		table_id = $(event.relatedTarget).data('table');
		modal = $(this);
		//make your ajax call populate items or what even you need
		modal.find('#modal-body').html($('<b> Order selected: ' + quantity + ' ' + foodName  + '</b>'));
	});


	$('#mark-button').click(function(){
		//splitting id into foodId and orderId
		var ids = getIdFromRow.split('&');
		//ids[0] -> foodId | ids[1] -> orderId
		var foodId = ids[0];
		var orderId = ids[1];
		var done_code = 0;
		markPlate(table_id, foodId, orderId, modal, done_code);
	});

   $('#confirm-button').click(function(){
		//splitting id into foodId and orderId
		var ids = getIdFromRow.split('&');
		//ids[0] -> foodId | ids[1] -> orderId
		var foodId = ids[0];
		var orderId = ids[1];
		var confirm_code = 1;
		markPlate(table_id, foodId, orderId, modal, confirm_code);
	});

	$('#reject-button').click(function(){
		//splitting id into foodId and orderId
		var ids = getIdFromRow.split('&');
		//ids[0] -> foodId | ids[1] -> orderId
		var foodId = ids[0];
		var orderId = ids[1];
		var reject_code = 3;
		markPlate(table_id, foodId, orderId, modal, reject_code);
	});

	//Simulating #all-tables-and-orders click to view
	$("#all-tables-and-orders").trigger("click");
	//setInterval(all_tables, 15000);
});
