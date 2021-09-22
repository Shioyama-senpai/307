/**
 * The StatsController is a view controller that is responsible for the stats view.
 */
class StatsController {
	/**
	 * The constructor for the StatsController.
	 */
	constructor() {
		this.statSelect = document.getElementById("stat-select");
		this.loadingContainer = document.getElementById("loading-container");
		this.statList = document.getElementById("stat-list");

		this.statSelect.addEventListener("change", this.onStatSelected.bind(this));

		this.loadStatsRequest = new Request("app/server/service/stats.php", "GET", this.loadedStats.bind(this), this.statsLoadingError.bind(this));

		this.loadStats();
	}

	/**
	 * Callback for the change event of the stat select.
	 */
	onStatSelected(event) {
		this.loadStats();
	}

	/**
	 * Loads the stats from the server.
	 */
	loadStats() {
		this.loadingContainer.style.display = "";

		//Remove the stat entries before loading the new ones.
		while (this.statList.children.length > 0) {
			this.statList.removeChild(this.statList.firstChild);
		}

		this.loadStatsRequest.send({
			stats: this.statSelect.value
		});
	}

	/**
	 * Callback for the stats loading request.
	 */
	loadedStats(data) {
		if (!data) {
			this.loadingContainer.style.display = "none";
			return;
		}

		for (var i = 0; i < data.length; i++) {
			var row = data[i];

			var statRow = document.createElement("DIV");
			statRow.className = "stat-list-item";

			var leftArea = document.createElement("DIV");
			leftArea.className = "left-area";
			statRow.appendChild(leftArea);

			var rightArea = document.createElement("DIV");
			rightArea.className = "right-area";
			statRow.appendChild(rightArea);

			var nameLabel = document.createElement("SPAN");
			nameLabel.className = "name-label";
			nameLabel.innerText = row.name;
			leftArea.appendChild(nameLabel);

			var lastEntryLabel = document.createElement("SPAN");
			lastEntryLabel.className = "last-entry-label";
			lastEntryLabel.innerText = "Letztes Treffen: " + new Date(row.last_date.replace(" ", "T")).toLocaleDateString(undefined, {
				year: "numeric",
				month: "long",
				day: "numeric"
			});
			leftArea.appendChild(lastEntryLabel);

			var statTopLabel = document.createElement("SPAN");
			statTopLabel.className = "stat-top-label";
			rightArea.appendChild(statTopLabel);

			var viewButton = document.createElement("A");
			viewButton.href = "visits.php?name=" + row.name;
			viewButton.className = "button";
			viewButton.innerText = "Anzeigen ❯";
			rightArea.appendChild(viewButton);

			if (this.statSelect.value == "visits_per_person") {
				statTopLabel.innerHTML = "<b>" + row.visits;
				if (row.visits == 1) {
					statTopLabel.innerHTML += " Eintrag</b>";
				}
				else {
					statTopLabel.innerHTML += " Einträge</b>";
				}
			}
			else if (this.statSelect.value == "long_time_no_see") {
				statTopLabel.innerHTML = "<b>" + row.days_since_last_entry;
				if (row.days_since_last_entry == 1) {
					statTopLabel.innerHTML += " Tag</b> nicht mehr gesehen";
				}
				else {
					statTopLabel.innerHTML += " Tage</b> nicht mehr gesehen";
				}
			}

			this.statList.appendChild(statRow);
		}

		this.loadingContainer.style.display = "none";
	}

	/**
	 * Error callback for the stats loading request.
	 */
	statsLoadingError(error) {
		this.loadingContainer.style.display = "none";
	}
}

//Instantiate the StatsController.
new StatsController();