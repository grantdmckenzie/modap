<?php

	$city = $_GET['city'];
	$resolution = $_GET['resolution'];
	$id = $_GET['id'];
	$od = $_GET['od'];
	$vt = $_GET['vt'];

	require('db.php');
	$db_connection = pg_connect("host=localhost dbname=".$database." user=".$dbuser." password=".$dbpass);

	$query = "select sum(cnt) from ".pg_escape_string($db_connection, $city)."_duration_histogram_".pg_escape_string($db_connection, $resolution)."_".$od." where ".$od." = '".pg_escape_string($db_connection, $id)."' and vt = '".$vt."'";
	$result = pg_query($db_connection, $query) or die(pg_last_error());
	$sum = pg_fetch_result($result, 0, 0);

	$query = "select bin, cnt from ".$city."_duration_histogram_".$resolution."_".$od." where ".$od." = '".$id."' and vt = '".$vt."'";
	//echo $query . "\n";

	$result = pg_query($db_connection, $query) or die(pg_last_error());

	$durations = array();
	$bins = range(0, 6900, 300);

	while($row = pg_fetch_object($result)) {
		$durations[intval($row->bin)] = round(intval($row->cnt)/$sum*10000)/100;
	}

	$out = array();

	foreach($bins as $bin) {
		if (isset($durations[$bin])) {
			$out[$bin] = intval($durations[$bin]);
		} else {
			$out[$bin] = 0;
		}
	}

	header("Content-Type: application/json");
	echo json_encode($out);
	exit();

?>