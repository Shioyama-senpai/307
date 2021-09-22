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

	//Limit the length of the parameters.
	if (strlen($email) > 500) {
		Service::error(400, "Die E-Mail-Adresse ist zu lang.");
	}
	if (strlen($password) > 500) {
		Service::error(400, "Das Passwort ist zu lang.");
	}

	//Make sure the email address is in a valid format.
	if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
		Service::error(400, "Die E-Mail-Adresse hat ein ungültiges Format.");
	}

	//Check whether the email address already exists or not.
	if (UserRepository::userExists($email)) {
		Service::error(400, "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.");
	}

	$creationResult = UserRepository::create(array(
		"email" => $email,
		"password" => $password
	));

	if ($creationResult !== true) {
		Service::error($creationResult["code"], $creationResult["message"]);
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