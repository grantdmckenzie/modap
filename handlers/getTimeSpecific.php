<?php

	$city = $_GET['city'];
	$weekend = $_GET['wknd'];
	$hour = $_GET['hr'];
	$oid = $_GET['oid'];

	$db_connection = pg_connect("host=localhost dbname=mmtimes user=mmtimes password=mmtimes");

	$query = "select avg, median, stddev, cnt, did from helsinki_hrwknd_osm where wknd = ".$weekend." and hour = ".$hour. " and oid = '".$oid."'";

	$result = pg_query($db_connection, $query) or die(pg_last_error());

	$out = array();

	while($row = pg_fetch_object($result)) {
		$out[$row->did] = (Object)array('avg'=>$row->avg,'median'=>$row->median, 'stddev'=>$row->stddev, 'count'=>$row->cnt);
	}

	header("Content-Type: application/json");
	echo json_encode($out);
	exit();

?>