<?php

// =================================================================================================================
// @author Grant McKenzie
// @date November 2023
// @contact grant.mckenzie@mcgill.ca
// @description:
//		For the choropleth map, get the 10 break points in the selected city's data
// =================================================================================================================



	// Connect to the database
	require('db.php');
	$db_connection = pg_connect("host=localhost dbname=".$database." user=".$dbuser." password=".$dbpass);

	$city = pg_escape_string($db_connection, $_GET['city']);
	$temporal = pg_escape_string($db_connection, $_GET['temporal']);
	$spatial = pg_escape_string($db_connection, $_GET['spatial']);

	// Build the table based on the client input.
	$table = $city."_".$temporal."_".$spatial;

	// Output Object
	$out = array();

	// Query to get the breaks
	$query = "select k, percentile_disc(k) within group (order by median) from ".$table.", generate_series(0.1, 1, 0.10) as k group by k";
	$result = pg_query($db_connection, $query) or die(pg_last_error());

	while($row = pg_fetch_object($result)) {
		$out[] = floatval($row->percentile_disc);
	}

	// Output as JSON
	header("Content-Type: application/json");
	echo json_encode($out);
	exit();

?>