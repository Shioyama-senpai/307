<?php
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/data/Repository.php";
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/data/helper/DatabaseConnection.php";

	/**
	 * The UserRepository class is used for handling the user model in the database.
	 */
	class UserRepository extends Repository {
		/**
		 * Creates a new entity of this type.
		 * @param $data The data of the entity.
		 * @return true on success, an error object otherwise.
		 */
		public static function create($data) {
			if (empty($data["email"]) || empty($data["email"])) {
				return array(
					"code" => 400,
					"message" => "Alle Felder müssen ausgefüllt sein."
				);
			}

			$email = $data["email"];
			$password = $data["password"];

			$createUser = self::$database->query("INSERT INTO user(email, password) VALUES(?, ?)", array($email, password_hash($email . $password, PASSWORD_DEFAULT)), array("s", "s"));

			if (!$createUser || ($createUser !== true && $createUser->affected_rows != 1)) {
				return array(
					"code" => 500,
					"message" => "Die Erstellung des Benutzers ist fehlgeschlagen. Bitte versuche es erneut oder melde dieses Problem."
				);
			}

			return true;
		}

		/**
		 * Updates the user with the given email address with the given data.
		 * @param $email The email address of the user to update.
		 * @param $data The new data. Not all fields must be present.
		 */
		public static function update($email, $data) {
			if (empty($email)) {
				return array(
					"code" => 400,
					"message" => "Alle Felder müssen ausgefüllt sein."
				);
			}

			$allowedKeys = array("email", "password");

			$fieldString = "";
			$parameters = array();
			$parameterTypes = array();

			foreach ($data as $key => $value) {
				if (!in_array($key, $allowedKeys)) {
					return array(
						"code" => 400,
						"message" => "Die Eigenschaft " . $key . " gibt es nicht."
					);
				}
				if ($fieldString != "") {
					$fieldString .= ", ";
				}
				$fieldString .= $key . " = ?";
				$parameters[] = $value;
				$parameterTypes[] = (is_integer($value) ? "i" : (is_float($value) ? "d" : "s"));
			}

			if ($fieldString == "") {
				return array(
					"code" => 400,
					"message" => "Es wurden keine Werte zum aktualisieren übergeben."
				);
			}

			$parameters[] = $email;
			$parameterTypes[] = "s";
			$update = self::$database->query("UPDATE user SET " . $fieldString . " WHERE email = ? LIMIT 1", $parameters, $parameterTypes);

			if (!$update || ($update !== true && $update->affected_rows != 1)) {
				return array(
					"code" => 500,
					"message" => "Der Benutzer konnte nicht aktualsiiert werden. Bitte versuche es noch einmal oder melde dieses Problem."
				);
			}

			return true;
		}

		/**
		 * Applies the given session ID to the user with the given email address.
		 * @param $session_id The session ID to set.
		 * @param $email The email address of the user to set the session ID for.
		 * @return true if the operation was successful, false otherwise.
		 */
		public static function setSession($email, $sessionId) {
			$setSession = self::$database->query("UPDATE user SET session = ? WHERE email = ? LIMIT 1", array($sessionId, $email), array("s", "s"));

			if (!$setSession || ($setSession !== true && $setSession->affected_rows != 1)) {
				return false;
			}

			return true;
		}

		/**
		 * Compares the password of the user with the specified email address with the given plain text password.
		 * @param $email The email address of the user.
		 * @param $password The plain text password to compare with the user's.
		 * @return true if the passwords match, false otherwise.
		 */
		public static function checkPassword($email, $password) {
			$user = self::$database->getFirstResult(self::$database->query("SELECT user_id, password FROM user WHERE email = ? LIMIT 1", array($email), array("s")));

			if (!$user) {
				return false;
			}

			return password_verify($email . $password, $user["password"]);
		}

		/**
		 * Gets the currently logged in user from the database.
		 * @return The session user object.
		 */
		public static function getSessionUser() {
			$sessionId = session_id();

			if (!$sessionId) {
				return null;
			}

			return self::$database->getFirstResult(self::$database->query("SELECT user_id, email FROM user WHERE session = ? LIMIT 1", array($sessionId), array("s")));
		}

		/**
		 * Checks whether a user exists with the given email address or not.
		 * @return true if there is already a user with this email address, false otherwise.
		 */
		public static function userExists($email) {
			return self::$database->getFirstResult(self::$database->query("SELECT user_id FROM user WHERE email = ? LIMIT 1", array($email), array("s"))) ? true : false;
		}
	}

	//Initialize the class.
	UserRepository::initialize();
?>