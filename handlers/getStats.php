<?php

// =================================================================================================================
// @author Grant McKenzie
// @date November 2023
// @contact grant.mckenzie@mcgill.ca
// @description:
//		Get basic descriptive statistics for each of our cities and vehicle types
// =================================================================================================================

	// Connect to the database
	require('db.php');
	$db_connection = pg_connect("host=localhost dbname=".$database." user=".$dbuser." password=".$dbpass);


	// Get city
	$city = pg_escape_string($db_connection, $_GET['city']);


	// The output object
	$out = array();

	// Get stats
	$query = "select * from city_stats where city = '".$city."'";
	$result = pg_query($db_connection, $query) or die(pg_last_error());

	while($row = pg_fetch_object($result)) {
		$out = $row;
	}

	// Decode the JSON values coming from the database
	$out->counts = json_decode($out->counts);
	$out->durations = json_decode($out->durations);

	// Output object as JSON
	header("Content-Type: application/json");
	echo json_encode($out);
	exit();

?>