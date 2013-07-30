<?php
	if(isset($_GET['key']))
		echo $_GET['key'];
	else if(isset($_GET['response'])) {
		switch($_GET['response']) {
			case "json":
				echo json_encode(array('key1' => 'value', 'key2' => array(), 'key3' => 243));
			break;
		}
	}
	else if(isset($_POST['post'])) {
		echo 'post';
	}
	else if(isset($_POST['error'])) {
		header('HTTP/1.1 404 Not Found');
	}
	else
		echo 'done';
?>