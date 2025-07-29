<?php

// =================================================================================================================
// @author Grant McKenzie
// @date November 2023
// @contact grant.mckenzie@mcgill.ca
// @description:
//		Receive an ID of the region selected, the city name, the spatial resolution and either Origin or Destination
//		Return a set of all vehicle types along with all IDs that in which a trip either originated or completed.  
//			Provide the average, median, and count of trip between the selected region and all other regions
// =================================================================================================================

	// Get the Database Connection
	require('db.php');
	$db_connection = pg_connect("host=localhost dbname=".$database." user=".$dbuser." password=".$dbpass);
	
	// Get input
	$id = pg_escape_string($db_connection, $_GET['id']);
	$city = pg_escape_string($db_connection, $_GET['city']);
	$spatial = pg_escape_string($db_connection, $_GET['spatial']);
	$od = pg_escape_string($db_connection, $_GET['od']);

	// OID needs to either be origin ID or destination ID
	$aod = $od == 'oid' ? 'did' : 'oid';




	// Build the table from which we will be selecting
	$table = $city."_duration_".$spatial;
	
	// Build the query based on input.
	$query = "SELECT ".$aod." as id, vt, avg, median, stddev, cnt from ".$table." where ".$od." = '" . $id . "'";
	
	// Get Results object
	$result = pg_query($query) or die(pg_last_error());

	// Set up output object
	$out = (Object)array();

	// Loop through the results
	while($row = pg_fetch_object($result)) {
		$vt = $row->vt;
		if (!property_exists($out, $vt)) {
			$out->$vt = array();
		}
		$out->$vt[$row->id] = (Object)array('avg'=>$row->avg,'median'=>$row->median, 'stddev'=>$row->stddev, 'count'=>$row->cnt);
	}

	// Output the results as JSON
	header("Content-Type: application/json");
	echo json_encode($out);
	exit();

?>