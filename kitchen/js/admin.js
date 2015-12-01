$(document).ready(function(){
	//AJAX -> retrieve categories list
    $.ajax({
		type: 'POST',
		url: SERVER_IP + "/myLuisella-server/retrieveCategoriesList.php",
		success: function(data){
			if(data != 0)
			{
				var categories = $.parseJSON(data);
				var str = "";
				$.each(categories, function(){
					str = str.concat("<option value='" + this["category"] + "'>" + this["category"] + "</option>");
				});
				$('#ajax-panel-plate').empty();
				$('#category').empty();
				$('#category').html(str);
				$('#ajax-panel-plate').hide();
			}
			else
			{
				$('#ajax-panel-plate').empty();
				$('#ajax-panel-plate').html(data.toString());
				$('#ajax-panel-plate').show();
			}
		},
		error:function(){
			//failed request; give feedback to user
			$('#ajax-panel-plate').empty();
			$('#ajax-panel-plate').html('<strong>Oops!</strong> Connection error.');
			$('#ajax-panel-plate').show();
		}
		
	});
	
	//AJAX -> retrieve plates list
    $.ajax({
		type: 'POST',
		url: SERVER_IP + "/myLuisella-server/retrievePlatesList.php",
		success: function(data){
			if(data != 0)
			{
				var plates = $.parseJSON(data);
				var str = "";
				$.each(plates, function(){
					str = str.concat("<option value='" + this["foodId"] + "'>" + this["foodName"] + "</option>");
				});
				$('#ajax-panel-list').empty();
				$('#plate-list').empty();
				$('#plate-list').html(str);
				$('#ajax-panel-list').hide();
			}
			else
			{
				$('#ajax-panel-list').empty();
				$('#ajax-panel-list').html(data.toString());
				$('#ajax-panel-list').show();
			}
		},
		error:function(){
			//failed request; give feedback to user
			$('#ajax-panel-list').empty();
			$('#ajax-panel-list').html('<strong>Oops!</strong> Connection error.');
			$('#ajax-panel-list').show();
		}
		
	});
	
	//Handle click event on submit so the data are sent via AJAX to the PHP's page which save them into DB.
	$('#submit-button-plate').click(function(){
		$('#ajax-panel-plate').hide();
		var food_name = document.getElementById('food-name').value;
		var food_price = document.getElementById('food-price').value;
		var description = document.getElementById('description').value;
		var category = document.getElementById('category').value;
		if(food_name == "" || food_price == "")
		{
			$('#ajax-panel-plate').html('<strong>Oops!</strong> Check what you wrote.');
			$('#ajax-panel-plate').show();
			return false;
		}
		$.ajax({
			type: 'POST',
			url: SERVER_IP + "/myLuisella-server/insertPlate.php",
			
			data: { foodName: food_name, price: food_price, description: description, category: category },
			success:function(data){
				if(data == "Good")
				{
					$('#ajax-panel-plate').empty();
					$('#ajax-panel-plate').html('New plate added. <strong>Congrats!</strong>');
				}
				else
				{
					$('#ajax-panel-plate').empty();
					$('#ajax-panel-plate').html(data.toString());
				}
				$('#ajax-panel-plate').show();
			},
			error:function(){
				// failed request; give feedback to user
				$('#ajax-panel-plate').empty();
				$('#ajax-panel-plate').html('<strong>Oops!</strong> Connection error.');
				$('#ajax-panel-plate').show();
			}
			
		});
		return false;
	});
});