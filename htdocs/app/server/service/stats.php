<?php
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/service/helper/Service.php";
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/data/VisitRepository.php";

	Service::requireLogin();

	if ($_SERVER["REQUEST_METHOD"] != "GET") {
		Serivce::error(405, "Invalide Anfragemethode.");
	}

	$stats = VisitRepository::getStats(Service::getParameter("stats"));

	Service::respond($stats);
?>