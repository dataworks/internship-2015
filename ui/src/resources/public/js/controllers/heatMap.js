controllers.controller('Display', ['$scope', 'linker', 'Watch', 'WatchIds', function($scope, linker, Watch, WatchIds) {
	$scope.map;
	var pointarray;
	var heatmap;
	var heatmaps = [];
	var specDateHolder = [];
	var myMarker = null;
	var latLng = new google.maps.LatLng(38.942892, -77.334012);
    $scope.text = '';
    $scope.endtext = '';
    $scope.deviceIds = [];
    $scope.lat = '';
    $scope.long = '';
    $scope.calendar;
    var startDate="2015-06-01T00:00:00";
    var endDate="2016-06-01T00:00:00";
    var longTw;
    var latTw;
    var longSum = 0;
    var latSum = 0;
    $scope.ownerNames = [];
    $scope.avg = {
    	name: "average",
    	value: false
    };
    $scope.comp = {
    	name: "compare",
    	value: false
    };
    
      
    
	// Creates the heat map
	$scope.loadMap = function() 
	{
		var mapOptions = {
				zoom: 10,
				center: new google.maps.LatLng(38.942892, -77.334012)
		};

		$scope.map = new google.maps.Map(document.getElementById('map-canvas'),
				mapOptions); 

		myMarker = new google.maps.Marker({
			position: latLng,
			draggable: true,
		});

		google.maps.event.addListener(myMarker, 'dragend', function(evt){
			document.getElementById('current').innerHTML = '<p>Marker dropped: Current Lat: ' + evt.latLng.lat().toFixed(3) + ' Current Lng: ' + evt.latLng.lng().toFixed(3) + '</p>';
			latTw = evt.latLng.lat().toFixed(3);
			longTw = evt.latLng.lng().toFixed(3);
			console.log(endDate);
			linker.getLatLong(latTw, longTw, startDate, endDate);
		});

		google.maps.event.addListener(myMarker, 'dragstart', function(evt){
			document.getElementById('current').innerHTML = '<p>Currently dragging marker...</p>';
		});
		myMarker.setMap($scope.map);
		$scope.loadIds();
	}
	
	/* parseToDateString
	 * 
	 * Convert date from 6/7/2015 to 2015-06-07T23:00:00
	 */
	var parseToDateString = function(dt){
		var rep = dt.split("/");
		rep4 = rep[0];
		rep[0] = rep[2];
		rep[2] = rep[1];
		rep[1] = rep4;
		ret = rep.join("-")+"T23:00:00";
		return ret;
	}

	$(document).ready(function () {                
		// create jqxcalendar.
		$("#jqxCalendar").jqxCalendar({width: 240, height: 220, 
			selectionMode: 'range', theme: 'energyblue'});
		$('#jqxCalendar').on('change', function (event) {
			var selection = event.args.range;
			startDate = parseToDateString(selection.from.toLocaleDateString());
			endDate = parseToDateString(selection.to.toLocaleDateString());
		});
			
			for(var i = 0; i < $scope.deviceIds.length; i++)
			{				
				if($scope.deviceIds[i].value == true)
				{
					console.log("st " + selection.from.toLocaleDateString() + 
							" END " + selection.to.toLocaleDateString() + " " + specDateHolder[i][0]);
					var stCheck = 
						binSearch(new Date(selection.from.toLocaleDateString()).getTime()
								, specDateHolder[i]);
					var enCheck = 
						binSearch(new Date(selection.to.toLocaleDateString()).getTime()
								, specDateHolder[i]);
					console.log("b " + stCheck + " "  + enCheck);									
				}
			}					
		});	
	
	$scope.buildDD = function (){		
        // Create a jqxDropDownList
        $("#jqxdropdownlist").jqxDropDownList({ source: $scope.ownerNames, selectedIndex: 0, width: '200px', height: '25px' });
        // disable the sixth item.
        $("#jqxdropdownlist").jqxDropDownList('disableAt', 5);
        // bind to 'select' event.
        $('#jqxdropdownlist').bind('select', function (event) {
            var args = event.args;
            var item = $('#jqxdropdownlist').jqxDropDownList('getItem', args.index);
        });
	}
	
	function binSearch(val, results)
	{
		var low = 0;
		var high = results.length - 1;

		while (low <= high) {
			var mid = Math.floor(low + ((high - low) / 2));
			var midVal;
			var midSub;
			var midPlus;
			if (results[mid].hasOwnProperty("dtime") == true)
			{
				console.log("dtime");
				midVal = results[mid].dtime;
				midSub = results[mid-1].dtime;
				midPlus = results[mid+1].dtime;
			}
			else
			{
				midVal = moment(results[mid]).subtract(20, 'h');
				midVal = new Date(midVal).getTime();
				midSub = null;
				midPlus = null;
			}
			console.log("there" + mid + " mv " + midVal + " " + val);
					
			if ((midSub <= val && midPlus >= val)
					||midVal == val)
			{				
				return mid;		
			}
			else if (midVal > val)
			{
				high = mid - 1;
			}				
			else if(midVal < val)
			{
				low = mid + 1;
			}				
		}
		return -(low + 1);  // key not found.
	}
	
	function binStPrep(st, results)
	{
		var startInd;
		if(st > results.rows[0].dtime)
		{
			startInd = binSearch(st, results.rows);
			if(results.rows[startInd].dtime < startInd)
			{
				startInd--;
			}
			else
			{
				startInd++;
			}
			
		}
		else if(st > results.rows[results.rows.length-1].dtime)
		{
			window.alert("date doesnt exist");
		}
		else if(st < results.rows[0].dtime)
		{
			startInd = 0;
		}
		return startInd;
	}
	function binSplitPrep(split, results)
	{
		var splitInd;
		if(split < results.rows[0].dtime|| 
				split > results.rows[results.rows.length-1].dtime)
		{
			window.alert("entry doesnt exist");
		}
		else
		{
			splitInd = binSearch(split, results.rows);
		}
		return splitInd;
	}
	function binEnPrep(en, results)
	{
		var endInd;
		if(en < results.rows[results.rows.length-1].dtime)
		{
			endInd = binSearch(en, results.rows);
			if(results.rows[endInd] > en)
			{
				endInd++;
			}
			else
			{
				endInd--;
			}
		}
		else if(en < results.rows[0].dtime)
		{
			window.alert("date doesnt exist");
		}
		else
		{
			endInd = results.rows[results.rows.length-1].dtime;
		}
		return endInd;
	}
	
	$scope.compare = function(results, index)
	{
		var count = 1;
		var compData1 = [];
		var compLat1 = 0;
		var compLon1 = 0;
		var div1 = 0;
		
		var splitDate;
		var compData2 = [];
		var compLat2 = 0;
		var compLon2 = 0;
		var div2 = 0;
		var splitDate;
		var stDate;
		var splitInd;
		var startInd;
		var endInd;
		
		if($scope.deviceIds[index].selectDate == true)
		{

			endInd = binEnPrep($scope.deviceIds[index].enDate, results);
			for(var i = 0; i < results.rows.length; i++)
			{
				if($scope.deviceIds[index].enDate > results.rows[i].dtime
						&& $scope.deviceIds[index].stDate < results.rows[i].dtime)
				{
					console.log(results.rows[i].dtime + 
							moment(results.rows[i].dtime).format("YYYY-MM-DD"));
				}
			}
			
			if($scope.deviceIds[index].enDate < results.rows[results.rows.length-1].dtime)
			{
				endInd = binSearch($scope.deviceIds[index].enDate, results);
				console.log("b " + moment(results.rows[endInd-1].dtime).format("YYYY-MM-DD") + 
						" " + moment($scope.deviceIds[index].enDate).format("YYYY-MM-DD"));		
				
			}
			else if($scope.deviceIds[index].enDate < results.rows[0].dtime)
			{
				window.alert("date doesnt exist");
			}
			else
			{
				endInd = results.rows[results.rows.length-1].dtime;
			}
			splitDate = moment(results.rows[endInd-1]).format("YYYY-MM-DD");
			splitDate = new Date(splitDate).getTime();
			console.log(splitDate + " " + moment(splitDate).format("YYYY-MM-DD"));
			
			splitInd = binSplitPrep(splitDate, results);
			
			div1 = Math.floor(Math.sqrt(splitInd - startInd));
			div2 = Math.floor(Math.sqrt(endInd - splitInd));
		}
		else
		{
			splitDate = moment(results.rows[results.rows.length-1].dtime).format("YYYY-MM-DD");
			splitDate = new Date(splitDate).getTime();
			splitInd = binSearch(splitDate, results);
			startInd = 0;
			endInd = results.rows.length-1;
			div1 = Math.floor(Math.sqrt(splitInd));
			div2 = Math.floor(Math.sqrt(endInd - splitInd));
		}
	}

	$scope.avgPath = function(results, index)
	{
		var count = 1;
		var avgData = [];
		var avgLat = 0;
		var avgLon = 0;
		var div = 0;
		var stInd = 0;
		var endInd = results.rows.length;
		if($scope.deviceIds[index].selectDate == true)
		{
			stInd = binStPrep($scope.deviceIds[index].stDate, results);
			endInd = binEnPrep($scope.deviceIds[index].enDate, results);
			div = Math.floor(Math.sqrt(endInd - stInd));
		}
		else
		{
			div = Math.floor(Math.sqrt(results.rows.length));
		}
		
		for(var i = stInd; i < endInd; i++)
		{
			if($scope.deviceIds[index].stDate <= results.rows[i].dtime && 
					$scope.deviceIds[index].enDate >= results.rows[i].dtime)
			{
				if(count == div)
				{
					avgLat = avgLat + results.rows[i].latitude;
					avgLon = avgLon + results.rows[i].longitude;
					avgLat = avgLat/count;
					avgLon = avgLon/count;
					avgData.push(new google.maps.LatLng(avgLat, avgLon));
					count = 1;
					avgLat = 0;
					avgLon = 0;
				}
				else if(i == endInd)
				{
					avgLat = avgLat + results.rows[i].latitude;
					avgLon = avgLon + results.rows[i].longitude;
					avgLat = avgLat/count;
					avgLon = avgLon/count;
					avgData.push(new google.maps.LatLng(avgLat, avgLon));
				}
				else 
				{
					avgLat = avgLat + results.rows[i].latitude;
					avgLon = avgLon + results.rows[i].longitude;
					count++;
				}
			}
		}
		return avgData;
	}
	
	
	$scope.matchId = function(ind)
	{
		var e;
		var index;
		if(ind == -1)
		{
			e = document.getElementById("dropdownMenu");
			index = $scope.ownerNames.indexOf(e.options[e.selectedIndex].text);
		}		
		else
		{
			index = ind;
		}
		
		if(heatmaps[index].length === 0)
		{
			$scope.deviceIds[index].value = true;
			loadHeatMap(index);
		}
		else if($scope.deviceIds[index].selectDate = true)
		{
			heatmaps[index].setMap(null);
			loadHeatMap(index);
		}
		if($scope.deviceIds[index].selectDate == false)
		{
			loadCalendar(index);
		}
		
	}
	
	function loadHeatMap(index)
	{	
			$scope.records = Watch.query({id: $scope.deviceIds[index].id, 
				startDate:'2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, devLoaded);
	}
	function loadCalendar(index)
	{
		console.log("loadCla " + specDateHolder[index].length)
		if($scope.deviceIds[index].selectDate == false)
		{
							
			var sD = $("#jqxCalendar").jqxCalendar('specialDates');
	        sD = [];
	        $("#jqxCalendar").jqxCalendar({ specialDates: sD });
			
			for(var i = 0; i < specDateHolder[index].length; i++)
			{
				$("#jqxCalendar").jqxCalendar('addSpecialDate', specDateHolder[index][i], 
						'jqx-calendar-cell-specialDate1', 'run');
			}
		}
	}
	
	var devLoaded = function(results){
		
		var watchData = [];
		var index;
		var latlngBounds = new google.maps.LatLngBounds();

		for(var i = 0; i < $scope.deviceIds.length; i++)
			if($scope.deviceIds[i].id == results.rows[0].deviceid)	
				index = $scope.deviceIds[i].index-1;
		
		if($scope.comp.value == true)
		{
			watchData = $scope.compare(results, index);
		}
		else if($scope.comp.value == false && 
				$scope.avg.value == true && $scope.deviceIds[index].value == true)
		{
			watchData = $scope.avgPath(results, index);			
		}
		else
		{
			var st = 0;
			var en = results.rows.length;
			if($scope.deviceIds[index].selectDate == true)
			{
				st = binStPrep($scope.deviceIds[index].stDate, results);
				en = binEnPrep($scope.deviceIds[index].enDate, results);
				console.log("dev st " + st + " en " + en);
			}
			
			for(var i = st; i < en; i++)
			{
				if($scope.deviceIds[index].stDate <= results.rows[i].dtime && 
						$scope.deviceIds[index].enDate >= results.rows[i].dtime)
				{
					
					watchData.push(new google.maps.LatLng(results.rows[i].latitude, 
							results.rows[i].longitude));
					longSum += results.rows[i].longitude;
					latSum += results.rows[i].latitude;
				}			
<<<<<<< HEAD
			}
=======
			}			
		}
		
>>>>>>> 16ac12a7c4b3ce064dfdf7fa343f40a84ebd7b24
			
			for(var i = 0; i < results.uniqueDates.length; i++)
			{
				if(results.uniqueDates[i].devid === $scope.deviceIds[index].id)
				{
					var date1 = new Date(results.uniqueDates[i].dtime);
					$("#jqxCalendar").jqxCalendar('addSpecialDate', date1, '', 'run');
				}		
			}			
		
		for (var i = 0; i < watchData.length; i++) {
			  latlngBounds.extend(watchData[i]);
			}
		
		var pointArray = new google.maps.MVCArray(watchData);
		heatmaps[index] = new google.maps.visualization.HeatmapLayer({
			data: pointArray});
		heatmaps[index].setMap($scope.map);

		//Fit the map to show all points 
		$scope.map.setCenter(latlngBounds.getCenter());
		$scope.map.fitBounds(latlngBounds);

		$scope.deviceIds[index].stDate = 0;
		$scope.deviceIds[index].enDate = Number.MAX_VALUE;
		$scope.deviceIds[index].selectDate = false;
	}
	
	$scope.clear = function()
	{
		for(var i = 0; i < $scope.deviceIds.length; i++)
		{
			if($scope.deviceIds[i].value == true)
			{				
				specDateHolder[i] = [];
				var sD = $("#jqxCalendar").jqxCalendar('specialDates');
		        sD = [];
		        $("#jqxCalendar").jqxCalendar({ specialDates: sD });
				heatmaps[i].setMap(null);
			}
		}
	}
	
	$scope.loadIds = function()
	{
		for(var i = 0; i < $scope.selectedDeviceIds.length; i++)
		{
			$scope.deviceIds.push({
				index: i+1,
				id: $scope.selectedDeviceIds[i],
				stDate: 0,
				enDate: Number.MAX_VALUE,
				selectDate: false,
				avgShown: false,
				value: false,
				name: $scope.ownerNames[i]
			});
			specDateHolder[i] = [];
			heatmaps[i] = [];
		}	
	}

	 
	deviceSelected = function(){
		   var arraySelected = []
		   for (var i = 0; i < $scope.deviceIds.length;i++){
			   if( $scope.deviceIds[i].value == true)
				   arraySelected.push($scope.deviceIds[i].id);
		   }
		   return arraySelected;
	   }
   
   $scope.recordsLoaded = function(results){
	   for(var i =0; i < results.ownerNames.length; i++)
		   $scope.ownerNames.push(results.ownerNames[i].ownerName);
	   $scope.buildDD();
	   $scope.loadMap();  
   }
	
   $scope.devicesLoaded = function(results){
	   $scope.selectedDeviceIds = [];
	   for(var i=0; i< results.rows.length; i++){
			$scope.selectedDeviceIds.push(results.rows[i].device);
	   }
	   
	   $scope.records = Watch.query({id: $scope.selectedDeviceIds , startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
				$scope.recordsLoaded);
   }

   WatchIds.query( {}, $scope.devicesLoaded );
}]);