<?php

// =================================================================================================================
// @author Grant McKenzie
// @date November 2023
// @contact grant.mckenzie@mcgill.ca
// @description:
//		Get the average trip start times for vehicle types across all regions
// =================================================================================================================

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

	// Connect to database
	require('db.php');
	$db_connection = pg_connect("host=localhost dbname=".$database." user=".$dbuser." password=".$dbpass);

	// The client should pass the city name - for selecting from the correct table.
	$city = pg_escape_string($db_connection, $_GET['city']);

	// Set up output object
	$allvt = (Object)array();

	// Query the total sum of all trips by vehicle type
	$query = "SELECT vt, sum(trips) as sum FROM ".$city."_times_overall GROUP BY vt";
	$result = pg_query($db_connection, $query) or die(pg_last_error());
	while($row = pg_fetch_object($result)) {
		$vt = $row->vt;
		$sum = $row->sum;
		$allvt->$vt = array();
		getVT($vt, $sum);
	}

	// Function to normalize the data based on the sum
	function getVT($vt, $sum) {
		global $city;
		global $allvt;
		global $db_connection;

		// Query to get the number of trips by hour and categorize as weekday or weekend.
		$query = "select weekday, hour, trips from ".$city."_times_overall where vt = '".$vt."' order by weekday, hour";
		$result = pg_query($db_connection, $query) or die(pg_last_error());

		// set up output object 
		$out = array();
		while($row = pg_fetch_object($result)) {
			if (!isset($out[$row->weekday]))
				$out[$row->weekday] = [];
			$out[$row->weekday][] = round(intval($row->trips)/$sum * 10000)/100;
		}

		// Add the vehicle specific output to the overall output for all vehicles
		$allvt->$vt = $out;
	}

	// Output to the client as JSON
	header("Content-Type: application/json");
	echo json_encode($allvt);
	exit();

?>