<?php
	ini_set('display_errors', '1');
	ini_set('display_startup_errors', '1');
	error_reporting(E_ALL);

	/**
	 * The Service class contains functions to assist the construction of a service endpoint.
	 */
	class Service {
		/**
		 * This is the variable which will hold the request data as soon as the first parameter is required.
		 */
		private static $requestData;

		/**
		 * Returns an error with the given status code and error message.
		 * The status code does not have to be numeric, but only if it is numeric, it is set as the proper HTTP response code.
		 * This function will call die() after echoing the error message.
		 * @param $code The error code. May be numeric or a string.
		 * @param $message The error message in plain language.
		 * @param $data Use this parameter to pass additional data to the client to help them understand the nature of the error.
		 */
		public static function error($code, $message, $data = null) {
			$error = array(
				"code" => $code,
				"message" => $message
			);

			if ($data) {
				$error["data"] = $data;
			}

			if (is_numeric($code)) {
				http_response_code($code);
			}

			echo json_encode($error);
			die();
		}

		/**
		 * Will respond to the client with the given data immediately.
		 * This function will call die() after echoing the data.
		 * The data will be converted to a JSON string. Do not pass a JSON string yourself.
		 * @param $data The response data. null will result in an empty response body.
		 */
		public static function respond($data = null) {
			if ($data) {
				echo json_encode($data);
			}

			die();
		}

		/**
		 * Returns the value of the request parameter for the given key.
		 * Returns null if the parameter is not present.
		 * The URL parameter will be returned if this is a GET request.
		 * @param $key The key of the parameter.
		 * @return The requested parameter or null if it is not present.
		 */
		public static function getParameter($key) {
			if ($_SERVER["REQUEST_METHOD"] == "GET" || $_SERVER["REQUEST_METHOD"] == "DELETE") {
				if (isset($_GET[$key])) {
					return $_GET[$key];
				}

				return null;
			}

			if (!self::$requestData) {
				$dataString = file_get_contents("php://input");
				self::$requestData = json_decode($dataString, true);
			}

			if (array_key_exists($key, self::$requestData)) {
				return self::$requestData[$key];
			}

			return null;
		}

		/**
		 * This function requires the requesting user to be logged in.
		 * If the user is not logged in, an error is returned.
		 */
		public static function requireLogin() {
			session_start();

			//If the expiration time of this session is not set, it is not a logged in session. We will return an error.
			//Also, if the expiration time has passed, we want to return an error as well.
			if (empty($_SESSION["expiration_time"]) || $_SESSION["expiration_time"] < time()) {
				self::error(401, "Du must angemeldet sein, um dies zu tun.");
			}

			//Update the expiration time.
			$_SESSION["expiration_time"] = time() + 60 * 30;
		}
	}
?>