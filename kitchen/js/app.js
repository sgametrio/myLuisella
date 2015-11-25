$(document).ready(function(){
	//If true that mean we are on mobile and not on localhost.
	var DEBUG_MOBILE = true;
	var SERVER_IP = "https://192.168.1.200";

	if(!DEBUG_MOBILE)
		SERVER_IP = "http://localhost";
		
	//Refresh button
	$('#all-tables-and-orders').click(all_tables);
	
	function all_tables(){
	
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
							str = str.concat("<div class='panel panel-info'><div style='text-align:center' class='panel-heading'><div style='float:left'>#" + tables[i]["tableNumber"] + "</div>" + tables[i]["tableName"] + "</div><div class='panel-body'><p id='" + tables[i]["tableId"] + "' style='text-align:center'><strong>No orders found yet.</strong></p></div></div>");
						}
						else
						{
							str = str.concat("<div class='panel panel-info'><div style='text-align:center' class='panel-heading'><div style='float:left'>#" + tables[i]["tableNumber"] + "</div>" + tables[i]["tableName"] + "</div><div class='panel-body'><p><table id='" + tables[i]["tableId"] + "' class='table table-condensed table-striped'>");
							for(var j = 0; j < n_order; j++)
							{
								for(var k = 0; k < tables[i]["order"][j]["foodIds"].length; k++)
								{
									str = str.concat("<tr data-toggle='modal' data-food='" + tables[i]["order"][j]["foodNames"][k] + "' data-qty='" + tables[i]["order"][j]["quantities"][k] + "' data-table='" + tables[i]["tableId"] + "' data-id='" + tables[i]["order"][j]["foodIds"][k] + "&" + tables[i]["order"][j]["orderId"] + "' data-target='#mark-as-done'><td class='col-md-9 col-sm-9 col-xs-9'>" + tables[i]["order"][j]["foodNames"][k] + "</td>");
									if(tables[i]["order"][j]["extraInfos"][k] != null)
										str = str.concat("<td class='col-md-1 col-sm-1 col-xs-1'>X</td>");
									else
										str = str.concat("<td class='col-md-1 col-sm-1 col-xs-1'></td>");
									str = str.concat("<td class='col-md-2 col-sm-2 col-xs-2'>" + tables[i]["order"][j]["quantities"][k] + "</td>");
									str = str.concat("</tr>");
								}
							}
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
	
	function markPlateAsDone(table_id, foodId, orderId, modal)
	{
		$.ajax({
			type: 'POST',
			url: SERVER_IP + "/myLuisella-server/markPlateAsDone.php",
			data: { foodId: foodId, orderId: orderId },
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
		var getIdFromRow = $(event.relatedTarget).data('id');
		var foodName = $(event.relatedTarget).data('food');
		var quantity= $(event.relatedTarget).data('qty');
		var table_id = $(event.relatedTarget).data('table');
		var modal = $(this);
        //make your ajax call populate items or what even you need
        modal.find('#modal-body').html($('<b> Order selected: ' + quantity + ' ' + foodName  + '</b>'))
		$('#mark-button').click(function(){
			//splitting id into foodId and orderId
			var ids = getIdFromRow.split('&');
			//ids[0] -> foodId | ids[1] -> orderId
			var foodId = ids[0];
			var orderId = ids[1];
			markPlateAsDone(table_id, foodId, orderId, modal);
		});
	});
    
	//Simulating #all-tables-and-orders click to view 
	$('#all-tables-and-orders').trigger('click');
	
	
	function refreshTableOrder(table_id)
	{
		$.ajax({
			type: 'POST',
			url: SERVER_IP + "/myLuisella-server/findOrders.php",
			data: { tableId: table_id, toMake: "1" },
			success:function(data) {
				var str = "";
				if(data == 0)
					str = "<div style='text-align:center'><strong>No orders found yet.</strong></div>";
				else
				{
					var orders = $.parseJSON(data);
				$('#' + table_id).empty();
				
				if(orders.length == 0)
					str = "<div style='text-align:center'><strong>No orders found yet.</strong></div>";
				else
					str = str.concat("<tr><th class='col-md-9 col-sm-9 col-xs-9'>Plate name</th><th class='col-md-1 col-sm-1 col-xs-1'></th><th class='col-md-2 col-sm-2 col-xs-2'>Q.ty</th></tr>");
					for(var j = 0; j < orders.length; j++)
					{
						for(var k = 0; k < orders[j]["foodIds"].length; k++)
						{
							str = str.concat("<tr data-toggle='modal' data-food='" + orders[j]["foodNames"][k] + "' data-qty='" + orders[j]["quantities"][k] + "' data-table='" + table_id + "' data-id='" + orders[j]["foodIds"][k] + "&" + orders[j]["orderId"] + "' data-target='#mark-as-done'><td class='col-md-9 col-sm-9 col-xs-9'>" + orders[j]["foodNames"][k] + "</td>");
							if(orders[j]["extraInfos"][k] != null)
								str = str.concat("<td class='col-md-1 col-sm-1 col-xs-1'>X</td>");
							else
								str = str.concat("<td class='col-md-1 col-sm-1 col-xs-1'></td>");
							str = str.concat("<td class='col-md-2 col-sm-2 col-xs-2'>" + orders[j]["quantities"][k] + "</td>");
							str = str.concat("</tr>");
						}
					}
				}
				
				$('#' + table_id).html(str);
			},
			error:function(){
			}
		});
	}
	
	setInterval(all_tables, 15000);
});

