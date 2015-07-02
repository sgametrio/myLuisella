$(document).ready(function(){
	//If true that mean we are on mobile and not on localhost.
	var DEBUG_MOBILE = false;
	var SERVER_IP = "http://192.168.0.200";

	if(!DEBUG_MOBILE)
		SERVER_IP = "http://localhost";
	
	//retrieving menu list
	setTimeout(function(){
		$.ajax({
			type: 'POST',
			url: SERVER_IP + "/myLuisella-server/allPlates.php",
			success:function(data){
				var plates = $.parseJSON(data);
				$.each(plates, function(){
					var category = this["category"];
					//creating manually the collapsible if not exists
					if($('#' + category).length == 0)
						$('#all-plates').append("<div class='panel panel-info'><div class='panel-heading' role='tab' id='" + category + "-header'><h3 class='panel-title'><a class='collapsed' data-toggle='collapse' data-parent='#all-plates' href='#" + category + "-collapsible' aria-expanded='false' aria-controls='" + category + "-collapsible'>" + category + "</a></h3></div><div id='" + category + "-collapsible' class='panel-collapse collapse' role='tabpanel' aria-labelledby='" + category + "-header'><div id='" + category + "' class='panel-body'></div></div></div>");
					//creating manually the table
					if($('#' + category + '-table').length == 0)
						$('#' + category).append("<table class='table table-striped table-condensed' id='" + category + "-table'></table>");
					$('#' + category + '-table').append("<tr name='food' data-foodid='" + this["foodId"] + "'><td class='col-md-11'>" + this["foodName"] + "</td><td class='col-md-1'><div class='checkbox'><input id='" + this["foodId"] + "-input' type='checkbox'/></div></td></tr>")
					if(this["todayMenu"] == 1)
						$('#' + this["foodId"] + '-input').prop("checked", true);
				});
			},
			error:function(){
				// failed request; give feedback to user
				$('#ajax-panel-ingredient').empty();
				$('#ajax-panel-ingredient').html('<strong>Oops!</strong> Connection error.');
				$('#ajax-panel-ingredient').show();
			}
		});
	}, 0);
	
	//submit today menu
	$('#confirm-menu-button').click(function(){
		var food_ids = [];
		$.each($('[name="food"]'), function(){
			var food_id = $(this).data('foodid');
			if($('#' + food_id + '-input').prop("checked"))
				food_ids.push({foodId: food_id, checked: 1});
			else
				food_ids.push({foodId: food_id, checked: 0});
		});
		$.ajax({
			type: "POST",
			url: SERVER_IP + "/myLuisella-server/setTodayMenu.php",
			data: { foodIds: JSON.stringify(food_ids) },
			success:function(data){
				if(data == "0")
				{
					$('#ajax-panel-ingredient').empty();
					$('#ajax-panel-ingredient').html('<strong>Congrats!</strong> Menu inserted correctly.');
					$('#ajax-panel-ingredient').show();
				}
				else
				{
					$('#ajax-panel-ingredient').empty();
					$('#ajax-panel-ingredient').html('<strong>Oops!</strong> Something went wrong.');
					$('#ajax-panel-ingredient').show();
				}
			},
			error:function(){
				// failed request; give feedback to user
				$('#ajax-panel-ingredient').empty();
				$('#ajax-panel-ingredient').html('<strong>Oops!</strong> Connection error.');
				$('#ajax-panel-ingredient').show();
			}
		});
	});
});