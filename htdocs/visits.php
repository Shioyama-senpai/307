<?php require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/presentation/helper/PageBuilder.php"; ?>
<?php PageBuilder::requireLogin(); ?>
<?php PageBuilder::build("Besuche ✿ Gästebuch", "visits"); ?>