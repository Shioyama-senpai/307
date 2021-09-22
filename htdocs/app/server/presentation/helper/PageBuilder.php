<?php
	ini_set('display_errors', '1');
	ini_set('display_startup_errors', '1');
	error_reporting(E_ALL);

	/**
	 * The PageBuilder is a class that provides functions to build an HTML web page with header and footer.
	 */
	class PageBuilder {
		/**
		 * Starts a new page by echoing the standard <!DOCTYPE html>, <html> and <head> tags.
		 * This function also echoes the default page header.
		 * @param $pageTitle The title of the page which gets written into the <title> tag.
		 * @param $pageName The name of the page. This is used for highlighting the appropriate navigation entry.
		 */
		public static function start($pageTitle = "", $pageName = "") {
			echo "<!DOCTYPE html>
<html>
	<head>
		<meta charset=\"utf-8\">
		<title>" . $pageTitle . "</title>
		<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, user-scalable=no\">
		<link rel=\"stylesheet\" type=\"text/css\" href=\"app/client/view/style/design.css\">
		<link rel=\"stylesheet\" type=\"text/css\" href=\"app/client/view/style/page.css\">
		<script src=\"app/client/presentation/helper/Request.js\"></script>
	</head>
	<body>
		<div class=\"navigation\">
			<table class=\"navigation-table\">
				<tr>
					<td " . ($pageName == "visits" ? "class=\"active\"" : "") . ">
						<a href=\"visits.php\">Besuche</a>
					</td>
					<td " . ($pageName == "stats" ? "class=\"active\"" : "") . ">
						<a href=\"stats.php\">Statistiken</a>
					</td>
					<td " . ($pageName == "profile" || $pageName == "login" || $pageName == "signup" ? "class=\"active\"" : "") . ">
						<a href=\"profile.php\">Profil</a>
					</td>
				</tr>
			</table>
		</div>
		<div class=\"content-container\">
			<div class=\"content\">
";
		}

		/**
		 * End the page by placing the closing tags that correspond to the tags that were left open in the start() function.
		 */
		public static function end() {
			echo "
			</div>
			<div class=\"vertical-centerer\"></div>
			<div class=\"footer\">
				<span>© " . date("Y") . " Manuel Sollberger</span>
				<span>・</span>
				<a href=\"privacy.php\">Datenschutz</a>
			</div>
		</div>
	</body>
</html>";
		}

		/**
		 * This is a composite function that calls the start and end functions of this class.
		 * Between the start and end calls, the template file with the name $pageName is included if it exists.
		 * @param $pageTitle The title of the page which gets written into the <title> tag.
		 * @param $pageName The name of the page. This is used to include the page template.
		 */
		public static function build($pageTitle = "", $pageName = "") {
			self::start($pageTitle, $pageName);
			
			//Include the page template if specified.
			if ($pageName) {
				require $_SERVER["DOCUMENT_ROOT"] . "/app/server/presentation/pages/" . $pageName . ".phtml";
			}

			self::end();
		}

		/**
		 * Call this before the page loads to make sure the user is logged in.
		 * Will redirect the user to the login page if the session is not valid.
		 */
		public static function requireLogin() {
			session_start();

			//If the expiration time of this session is not set, it is not a logged in session. We will redirect to the login page.
			//Also, if the expiration time has passed, we want to redirect the user to the login page as well.
			if (empty($_SESSION["expiration_time"]) || $_SESSION["expiration_time"] < time()) {
				header("Location: login.php");
				die();
			}

			//Update the expiration time.
			$_SESSION["expiration_time"] = time() + 60 * 30;
		}
	}
?>