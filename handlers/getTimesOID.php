<?php

// =================================================================================================================
// @author Grant McKenzie
// @date November 2023
// @contact grant.mckenzie@mcgill.ca
// @description:
//		Get the average trip start times for vehicles in a specific selected region
// =================================================================================================================


	// Connect to the database
	require('db.php');
	$db_connection = pg_connect("host=localhost dbname=".$database." user=".$dbuser." password=".$dbpass);
	
	// The client should pass the city name, spatial resolution, vehicle type, origin/destination ID.
	$city = pg_escape_string($db_connection, $_GET['city']);
	$resolution = pg_escape_string($db_connection, $_GET['resolution']);
	$vehicle_type = pg_escape_string($db_connection, $_GET['vt']);
	$oid = pg_escape_string($db_connection, $_GET['id']);
	$od = pg_escape_string($db_connection, $_GET['od']);

	// Get the sums for normalization
	$query = "select sum(cnt) from ".$city."_times_".$resolution."_".$od." where id = '".$oid."' and vt = '".$vehicle_type."'";
	//echo $query . "\n";
	$result = pg_query($db_connection, $query) or die(pg_last_error());
	$max = pg_fetch_result($result, 0, 0);

	// echo $max;

	$query = "select weekday, hour, cnt from ".$city."_times_".$resolution."_".$od." where id = '".$oid."' and vt = '".$vehicle_type."'";
	//echo $query . "\n";



	$result = pg_query($db_connection, $query) or die(pg_last_error());


	$week = array();
	$week[0] = array();
	$week[1] = array();
	$day = range(0,23);

	while($row = pg_fetch_object($result)) {
		if (!isset($week[$row->weekday]))
			$week[$row->weekday] = [];
		$week[$row->weekday][$row->hour] = round($row->cnt/$max*10000)/100;
		//$out[$row->weekday][] = (Object)array('avg'=>$row->avg,'median'=>$row->median,'count'=>$row->cnt);
	}

	//var_dump($week);

	$out = array();
	$out[0] = array();
	$out[1] = array();

	foreach($week as $k1=>$v) {
		foreach($day as $hour) {
			if (isset($v[$hour])) {
				$out[$k1][$hour] = floatval($v[$hour]);
			} else {
				$out[$k1][$hour] = 0;
			}
		}
	}

	header("Content-Type: application/json");
	echo json_encode($out);
	exit();

?>