<?php
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/service/helper/Service.php";
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/data/UserRepository.php";

	if ($_SERVER["REQUEST_METHOD"] != "POST") {
		Serivce::error(405, "Invalide Anfragemethode.");
	}

	$email = Service::getParameter("email");
	$password = Service::getParameter("password");

	if (empty($email) || empty($password)) {
		Service::error(400, "Alle nicht optionalen Felder müssen ausgefüllt sein.");
	}

	if (!UserRepository::checkPassword($email, $password)) {
		Service::error(400, "Die Anmeldedaten sind falsch.");
	}

	//Start the session and make sure a new session ID is being generated.
	session_set_cookie_params(0, "/", null, null, true);
	session_start();
	session_regenerate_id(true);

	//The session will expire after 30 minutes of inactivity.
	$_SESSION["expiration_time"] = time() + 60 * 30;

	UserRepository::setSession($email, session_id());

	Service::respond(true);
?>