<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

	$city = $_GET['city'];

	require('db.php');
	$db_connection = pg_connect("host=localhost dbname=".$database." user=".$dbuser." password=".$dbpass);

	$query = "select vt, sum(cnt) as max from ".pg_escape_string($db_connection, $city)."_duration_overall group by vt";
	$result = pg_query($db_connection, $query) or die(pg_last_error());
	$maxs = (Object)array();
	while($row = pg_fetch_object($result)) {
		$maxs->{$row->vt} = $row->max;
	}

	$query = "select vt, (bin/60) as bin, cnt from ".pg_escape_string($db_connection, $city)."_duration_overall";

	$result = pg_query($db_connection, $query) or die(pg_last_error());

	$out = (Object)array();

	while($row = pg_fetch_object($result)) {
		$vt = $row->vt;
		if(!property_exists($out, $vt)) {
			$out->$vt = array();
		} 
		$out->$vt[intval($row->bin)] = round(intval($row->cnt)/$maxs->$vt*10000)/100;
	}

	header("Content-Type: application/json");
	echo json_encode($out);
	exit();

?>