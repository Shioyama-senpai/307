<?php
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/data/Repository.php";
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/data/UserRepository.php";
	require_once $_SERVER["DOCUMENT_ROOT"] . "/app/server/data/helper/DatabaseConnection.php";

	/**
	 * The VisitRepository class is used for handling the visit model in the database.
	 */
	class VisitRepository extends Repository {
		/**
		 * Fetches all visits matching the given optional filters.
		 * @return An array containing all visits.
		 */
		public static function list($filters = array()) {
			$filterQuery = "";
			$parameters = array(UserRepository::getSessionUser()["user_id"]);
			$parameterTypes = array("i");

			//Build the filter query string.
			foreach ($filters as $key => $value) {
				//Skip the filter if the key is not allowed.
				if (!in_array($key, array("name"))) {
					continue;
				}

				//Skip the filter if the value is empty.
				if (empty($value)) {
					continue;
				}

				if ($filterQuery != "") {
					$filterQuery .= " AND ";
				}
				$filterQuery .= $key . " LIKE ?";
				$parameters[] = "%" . $value . "%";
				$parameterTypes[] = "s";
			}

			$visits = self::$database->toArray(self::$database->query("SELECT * FROM visit WHERE id_user = ?" . ($filterQuery != "" ? " AND " . $filterQuery : "") . " ORDER BY date DESC", $parameters, $parameterTypes));

			//Add the meals.
			$i = 0;
			foreach ($visits as $visit) {
				$meals = self::$database->toArray(self::$database->query("SELECT * FROM visit_meal WHERE id_visit = ?", array($visit["visit_id"]), array("i")));

				$visits[$i]["meals"] = $meals;

				$i++;
			}

			return $visits;
		}

		/**
		 * Creates a new entity of this type.
		 * @param $data The data of the entity.
		 * @return the created object on success, an error object otherwise.
		 */
		public static function create($data) {
			$createVisit = self::$database->query("INSERT INTO visit(id_user, name, date, visit_type, visit_purpose, brought_items, description) VALUES(?, ?, ?, ?, ?, ?, ?)", array(UserRepository::getSessionUser()["user_id"], $data["name"], $data["date"], $data["visit_type"], $data["visit_purpose"], $data["brought_items"], $data["description"]), array("i", "s", "s", "i", "s", "s", "s"));

			if (!$createVisit || ($createVisit !== true && $createVisit->affected_rows != 1)) {
				return array(
					"code" => 500,
					"message" => "Der Besuch konnte nicht erstellt werden. Bitte versuche es noch einmal oder melde dieses Problem."
				);
			}

			$data["visit_id"] = self::$database->getInsertedId();

			//Add the meals.
			$valueStrings = array();
			$parameters = array();
			$parameterTypes = array();

			foreach ($data["meals"] as $meal) {
				$valueStrings[] = "(?, ?, ?)";
				$parameters[] = $data["visit_id"];
				$parameters[] = strip_tags($meal["meal_type"]);
				$parameters[] = strip_tags($meal["meal"]);
				$parameterTypes[] = "i";
				$parameterTypes[] = "s";
				$parameterTypes[] = "s";
			}

			if (count($valueStrings) > 0) {
				$insertMeals = self::$database->query("INSERT INTO visit_meal(id_visit, meal_type, meal) VALUES" . implode(", ", $valueStrings), $parameters, $parameterTypes);

				if (!$insertMeals || ($insertMeals !== true && $insertMeals->affected_rows == 0)) {
					return array(
						"code" => 500,
						"message" => "Die servierten Gerichte konnten nicht eingetragen werden. Bitte versuche es noch einmal oder melde dieses Problem."
					);
				}
			}

			return $data;
		}

		/**
		 * Updates the visit with the given ID with the given data.
		 * @param $id The ID of the visit to update.
		 * @param $data The new data. Not all fields must be present.
		 */
		public static function update($id, $data) {
			if (empty($id)) {
				return array(
					"code" => 400,
					"message" => "Die ID muss angegeben werden."
				);
			}

			$allowedKeys = array("name", "date", "visit_type", "visit_purpose", "brought_items", "description");

			$fieldString = "";
			$parameters = array();
			$parameterTypes = array();

			foreach ($data as $key => $value) {
				if (!in_array($key, $allowedKeys)) {
					continue;
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

			$parameters[] = $id;
			$parameters[] = UserRepository::getSessionUser()["user_id"];
			$parameterTypes[] = "i";
			$parameterTypes[] = "i";
			$update = self::$database->query("UPDATE visit SET " . $fieldString . " WHERE visit_id = ? AND id_user = ? LIMIT 1", $parameters, $parameterTypes);

			if (!$update || ($update !== true && $update->affected_rows != 1)) {
				return array(
					"code" => 500,
					"message" => "Der Besuch konnte nicht aktualsiiert werden. Bitte versuche es noch einmal oder melde dieses Problem."
				);
			}

			//Update the meals.
			if (array_key_exists("meals", $data)) {
				$deleteMeals = self::$database->query("DELETE FROM visit_meal WHERE id_visit = ?", array($id), array("i"));
				if (!$deleteMeals) {
					return array(
						"code" => 500,
						"message" => "Die servierten Gerichte konnten nicht aktualsiiert werden. Bitte versuche es noch einmal oder melde dieses Problem."
					);
				}
				
				if (is_array($data["meals"])) {
					$valueStrings = array();
					$parameters = array();
					$parameterTypes = array();

					foreach ($data["meals"] as $meal) {
						$valueStrings[] = "(?, ?, ?)";
						$parameters[] = $id;
						$parameters[] = strip_tags($meal["meal_type"]);
						$parameters[] = strip_tags($meal["meal"]);
						$parameterTypes[] = "i";
						$parameterTypes[] = "s";
						$parameterTypes[] = "s";
					}

					if (count($valueStrings) > 0) {
						$insertMeals = self::$database->query("INSERT INTO visit_meal(id_visit, meal_type, meal) VALUES" . implode(", ", $valueStrings), $parameters, $parameterTypes);

						if (!$insertMeals || ($insertMeals !== true && $insertMeals->affected_rows == 0)) {
							return array(
								"code" => 500,
								"message" => "Die servierten Gerichte konnten nicht eingetragen werden. Bitte versuche es noch einmal oder melde dieses Problem."
							);
						}
					}
				}
			}

			return true;
		}

		/**
		 * Deletes a visit.
		 * @param $id The ID of the visit to delete.
		 * @return true if the operation was successful, an error object otherwise.
		 */
		public static function delete($id) {
			$deleteVisit = self::$database->query("DELETE FROM visit WHERE visit_id = ? AND id_user = ? LIMIT 1", array($id, UserRepository::getSessionUser()["user_id"]), array("i", "i"));

			if (!$deleteVisit || ($deleteVisit !== true && $deleteVisit->affected_rows != 1)) {
				return array(
					"code" => "500",
					"message" => "Der Besuch konnte nicht gelöscht werden. Bitte versuche es noch einmal oder melde dieses Problem."
				);
			}

			//Delete the meals.
			$deleteMeals = self::$database->query("DELETE FROM visit_meal WHERE id_visit = ?", array($id), array("i"));
			if (!$deleteMeals) {
				return array(
					"code" => 500,
					"message" => "Die servierten Gerichte konnten nicht gelöscht werden. Bitte versuche es noch einmal oder melde dieses Problem."
				);
			}

			return true;
		}

		/**
		 * Generates the stats for the given stat key.
		 * @param The stat key.
		 * @return An array with the stat rows.
		 */
		public static function getStats($stats) {
			$allNames = self::$database->getFirstResult(self::$database->query("SELECT GROUP_CONCAT(name SEPARATOR \", \") AS names FROM visit WHERE id_user = ?", array(UserRepository::getSessionUser()["user_id"]), array("i")))["names"];

			//Return an empty array if no names are available.
			if (empty($allNames)) {
				return array();
			}

			$allNames = str_replace(" + ", "+", $allNames);
			$allNames = str_replace("+", ", ", $allNames);
			$allNames = str_replace(" & ", "&", $allNames);
			$allNames = str_replace("&", ", ", $allNames);
			$allNames = str_replace(", ", ",", $allNames);

			$allNames = explode(",", $allNames);

			$uniqueNames = array();
			foreach ($allNames as $name) {
				if (!in_array($name, $uniqueNames)) {
					$uniqueNames[] = $name;
				}
			}
			$allNames = $uniqueNames;

			$statData = array();

			//Iterate over all the names and get the amount of visits containing the name.
			foreach ($allNames as $name) {
				$visits = self::$database->getFirstResult(self::$database->query("SELECT COUNT(*) AS visit_count, MAX(date) AS last_date, DATEDIFF(NOW(), MAX(date)) AS days_since_last_entry FROM visit WHERE name LIKE ? AND id_user = ?", array("%" . $name . "%", UserRepository::getSessionUser()["user_id"]), array("s", "i")));

				$statData[] = array(
					"visits" => $visits["visit_count"],
					"name" => $name,
					"last_date" => $visits["last_date"],
					"days_since_last_entry" => $visits["days_since_last_entry"]
				);
			}

			if ($stats == "visits_per_person") {
				usort($statData, [self::class, "compareVisits"]);
			}
			else if ($stats == "long_time_no_see") {
				usort($statData, [self::class, "compareDaysSinceLastEntry"]);
			}

			return $statData;
		}

		/**
		 * Compares the amount of visits of two stat rows.
		 */
		private static function compareVisits($a, $b) {
			if ($a["visits"] > $b["visits"]) {
				return -1;
			}
			else if ($a["visits"] < $b["visits"]) {
				return 1;
			}

			return 0;
		}

		/**
		 * Compares the amount of days since the last entry of two stat rows.
		 */
		private static function compareDaysSinceLastEntry($a, $b) {
			if ($a["days_since_last_entry"] > $b["days_since_last_entry"]) {
				return -1;
			}
			else if ($a["days_since_last_entry"] < $b["days_since_last_entry"]) {
				return 1;
			}

			return 0;
		}
	}

	//Initialize the class.
	VisitRepository::initialize();
?>