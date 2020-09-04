<?php
	$json = $_POST['json'];
	file_put_contents('../data/data.json', $json);
	echo file_get_contents('../data/data.json');
?>
