<?php
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/service/helper/Service.php";
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/data/VisitRepository.php";

	Service::requireLogin();

	if ($_SERVER["REQUEST_METHOD"] != "POST" && $_SERVER["REQUEST_METHOD"] != "DELETE") {
		Serivce::error(405, "Invalide Anfragemethode.");
	}

	//Save the provided data if the request method is POST.
	if ($_SERVER["REQUEST_METHOD"] == "POST") {
		$visit_id = Service::getParameter("visit_id");

		$name = Service::getParameter("name");
		if (!$name) {
			Service::error(400, "Der Name muss angegeben werden.");
		}
		if (strlen($name) > 500) {
			Service::error(400, "Der Name ist zu lang.");
		}

		$date = Service::getParameter("date");
		if (!$date) {
			Service::error(400, "Das Datum muss angegeben werden.");
		}
		$date = date("Y-m-d H:i:s", strtotime($date));

		$visit_type = Service::getParameter("visit_type");
		if (!in_array($visit_type, array(1, 2, 3))) {
			Service::error(400, "Die Besuchsart muss 1, 2 oder 3 sein.");
		}

		$visit_purpose = Service::getParameter("visit_purpose");
		if (!$visit_purpose) {
			Service::error(400, "Der Besuchsanlass muss angegeben werden.");
		}
		if (strlen($visit_purpose) > 500) {
			Service::error(400, "Der Besuchsanlass ist zu lang.");
		}

		$meals = Service::getParameter("meals");
		if (!is_array($meals)) {
			Service::error(400, "Die servierten Gerichte müssen als Liste angegeben werden.");
		}

		$brought_items = Service::getParameter("brought_items");
		if ($brought_items && strlen($brought_items) > 500) {
			Service::error(400, "Die Mitbringsel sind zu lang.");
		}

		$description = Service::getParameter("description");
		if ($description && strlen($description) > 500) {
			Service::error(400, "Die Beschreibung ist zu lang.");
		}

		//Create or update the visit.
		$result = false;
		if (is_numeric($visit_id)) {
			$result = VisitRepository::update($visit_id, array(
				"visit_id" => $visit_id,
				"name" => $name,
				"date" => $date,
				"visit_type" => $visit_type,
				"visit_purpose" => $visit_purpose,
				"meals" => $meals,
				"brought_items" => $brought_items,
				"description" => $description
			));
		}
		else {
			$result = VisitRepository::create(array(
				"name" => $name,
				"date" => $date,
				"visit_type" => $visit_type,
				"visit_purpose" => $visit_purpose,
				"meals" => $meals,
				"brought_items" => $brought_items,
				"description" => $description
			));
		}

		Service::respond($result);
	}

	//Delete the visit with the provided ID if the request method is DELETE.
	if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
		$visit_id = Service::getParameter("visit_id");

		if (!$visit_id) {
			Service::error("400", "Die ID muss angegeben werden.");
		}

		Service::respond(VisitRepository::delete($visit_id));
	}
?>