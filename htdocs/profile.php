<?php require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/presentation/helper/PageBuilder.php"; ?>
<?php require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/data/UserRepository.php"; ?>
<?php PageBuilder::requireLogin(); ?>
<?php PageBuilder::build("Profil ✿ Gästebuch", "profile"); ?>