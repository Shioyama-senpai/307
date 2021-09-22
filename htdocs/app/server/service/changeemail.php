<?php
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/service/helper/Service.php";
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/data/UserRepository.php";

	Service::requireLogin();

	if ($_SERVER["REQUEST_METHOD"] != "POST") {
		Serivce::error(405, "Invalide Anfragemethode.");
	}

	$old_email = Service::getParameter("old_email");
	$new_email = Service::getParameter("new_email");
	$password = Service::getParameter("password");

	if (empty($old_email) || empty($new_email) || empty($password)) {
		Service::error(400, "Alle nicht optionalen Felder müssen ausgefüllt sein.");
	}

	//Limit the length of the new email address.
	if (strlen($new_email) > 500) {
		Service::error(400, "Die neue E-Mail-Adresse ist zu lang.");
	}

	if ($old_email == $new_email) {
		Service::error(400, "Die alte und die neue E-Mail-Adresse stimmen überein.");
	}

	//Make sure the new email address is in a valid format.
	if (!filter_var($new_email, FILTER_VALIDATE_EMAIL)) {
		Service::error(400, "Die neue E-Mail-Adresse hat ein ungültiges Format.");
	}

	//Check whether the password is correct.
	if (!UserRepository::checkPassword($old_email, $password)) {
		Service::error(400, "Die alte E-Mail-Adresse oder das Passwort ist falsch.");
	}

	//Check whether the email address already exists or not.
	if (UserRepository::userExists($new_email)) {
		Service::error(400, "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.");
	}

	$updateResult = UserRepository::update($old_email, array(
		"email" => $new_email,
		"password" => password_hash($new_email . $password, PASSWORD_DEFAULT)
	));

	if ($updateResult !== true) {
		Service::error($updateResult["code"], $updateResult["message"]);
	}

	Service::respond(true);
?>