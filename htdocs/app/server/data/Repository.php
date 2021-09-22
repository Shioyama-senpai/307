<?php
	/**
	 * This is the base class for all repository classes.
	 * It contains the function to initialize the database connection.
	 */
	class Repository {
		/**
		 * The database connection instance.
		 */
		protected static $database;

		/**
		 * Prepares the database connection.
		 */
		public static function initialize() {
			$configuration = json_decode(file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/config/configuration.json"), true);

			self::$database = new DatabaseConnection($configuration["database_hostname"], $configuration["database_username"], $configuration["database_password"], $configuration["database_name"]);
		}
	}
?>