<?php
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/service/helper/Service.php";
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/data/UserRepository.php";

	Service::requireLogin();

	if ($_SERVER["REQUEST_METHOD"] != "POST") {
		Serivce::error(405, "Invalide Anfragemethode.");
	}

	$old_password = Service::getParameter("old_password");
	$new_password = Service::getParameter("new_password");
	$email = Service::getParameter("email");

	if (empty($old_password) || empty($new_password) || empty($email)) {
		Service::error(400, "Alle nicht optionalen Felder müssen ausgefüllt sein.");
	}

	//Limit the length of the new password.
	if (strlen($new_password) > 500) {
		Service::error(400, "Das neue Passwort ist zu lang.");
	}

	if ($old_password == $new_password) {
		Service::error(400, "Das alte und das neue Passwort stimmen überein.");
	}

	//Check whether the old password is correct.
	if (!UserRepository::checkPassword($email, $old_password)) {
		Service::error(400, "Die E-Mail-Adresse oder das alte Passwort ist falsch.");
	}

	$updateResult = UserRepository::update($email, array(
		"password" => password_hash($email . $new_password, PASSWORD_DEFAULT)
	));

	if ($updateResult !== true) {
		Service::error($updateResult["code"], $updateResult["message"]);
	}

	Service::respond(true);
?>