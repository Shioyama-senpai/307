/**
 * The VisitsController is a view controller that is responsible for the visit list page and its modal views.
 */
class VisitsController {
	/**
	 * The constructor for the VisitsController.
	 */
	constructor() {
		this.addVisitButton = document.getElementById("add-visit-button");
		this.addVisitButton.addEventListener("click", this.onAddVisitButtonPressed.bind(this));

		this.nameSelect = document.getElementById("name-select");
		this.nameSelect.addEventListener("change", this.onFilterChanged.bind(this));

		this.loadingContainer = document.getElementById("loading-container");

		this.visitsContainer = document.getElementById("visits-container");

		this.nameList = document.getElementById("name-list");
		this.purposeList = document.getElementById("purpose-list");
		this.mealTypeList = document.getElementById("meal-type-list");
		this.mealList = document.getElementById("meal-list");

		this.modalContainer = document.getElementById("modal-container");
		this.modalContainer.addEventListener("click", this.onModalContainerClicked.bind(this));

		this.visitForm = document.getElementById("visit-form");
		this.visitTypeSelect = document.getElementById("visit-type-select");
		this.namesBox = document.getElementById("names-box");
		this.newNameField = document.getElementById("new-name-field");
		this.dateField = document.getElementById("date-field");
		this.visitPurposeField = document.getElementById("visit-purpose-field");
		this.servedMealsContainer = document.getElementById("served-meals-container");
		this.addMealButton = document.getElementById("add-meal-button");
		this.broughtItemsField = document.getElementById("brought-items-field");
		this.descriptionField = document.getElementById("description-field");
		this.saveButton = document.getElementById("save-button");
		this.deleteButton = document.getElementById("delete-button");

		this.errorBox = document.getElementById("error-box");

		this.newNameField.addEventListener("keydown", this.onNewNameFieldKeyPressed.bind(this));
		this.newNameField.addEventListener("blur", this.onNewNameFieldBlurred.bind(this));
		this.addMealButton.addEventListener("click", this.onAddMealButtonPressed.bind(this));
		this.visitForm.addEventListener("submit", this.onVisitFormSubmitted.bind(this));
		this.deleteButton.addEventListener("click", this.onDeleteButtonPressed.bind(this));

		this.loadVisitsRequest = new Request("app/server/service/visits.php", "GET", this.loadedVisits.bind(this), this.visitLoadingError.bind(this));
		this.saveVisitRequest = new Request("app/server/service/visit.php", "POST", this.savedVisit.bind(this), this.visitSavingError.bind(this));
		this.deleteVisitRequest = new Request("app/server/service/visit.php", "DELETE", this.deletedVisit.bind(this), this.visitDeletionError.bind(this));

		//Load the visits initially.
		this.loadVisits();
	}

	/**
	 * Loads the visits from the server.
	 */
	loadVisits() {
		this.loadingContainer.style.display = "";

		//Remove the visit entries before loading the new ones.
		while (this.visitsContainer.children.length > 0) {
			this.visitsContainer.removeChild(this.visitsContainer.firstChild);
		}

		this.loadVisitsRequest.send({
			name: this.nameSelect.value
		});
	}

	/**
	 * Callback for the visits loading request.
	 */
	loadedVisits(visits) {
		this.visits = visits;

		var uniqueNames = [ ];
		var uniquePurposes = [ ];
		var uniqueMealTypes = [ ];
		var uniqueMeals = [ ];

		if (!visits) {
			this.loadingContainer.style.display = "none";
			return;
		}

		//Collect the unique values for the datalists.
		for (var i = 0; i < visits.length; i++) {
			var visit = visits[i];

			//Iterate over the names of the visit and insert them into the unique names array if they are not already in there.
			var names = visit.name.replaceAll("  ", " ").replaceAll(" + ", ",").replaceAll("+", ",").replaceAll(" & ", ",").replaceAll("&", ",").replaceAll(", ", ",").split(",");
			for (var j = 0; j < names.length; j++) {
				var name = names[j];

				if (uniqueNames.indexOf(name) == -1) {
					uniqueNames.push(name);
				}
			}

			if (uniquePurposes.indexOf(visit.visit_purpose) == -1) {
				uniquePurposes.push(visit.visit_purpose);
			}

			for (var j = 0; j < visit.meals.length; j++) {
				if (uniqueMealTypes.indexOf(visit.meals[j].meal_type) == -1) {
					uniqueMealTypes.push(visit.meals[j].meal_type);
				}
				if (uniqueMeals.indexOf(visit.meals[j].meal) == -1) {
					uniqueMeals.push(visit.meals[j].meal);
				}
			}
		}

		//Add the datalist options if no filter is selected.
		if (this.nameSelect.value == "") {
			//Add the unique names to the name datalist after removing the existing ones, but only if no name filter is set.
			while (this.nameList.children.length > 0) {
				this.nameList.removeChild(this.nameList.firstChild);
			}

			//We also add the names to the name filter dropdown.
			var selectedNameFilter = this.nameSelect.value;
			while (this.nameSelect.children.length > 1) {
				this.nameSelect.removeChild(this.nameSelect.lastChild);
			}

			for (var i = 0; i < uniqueNames.length; i++) {
				var option = document.createElement("OPTION");
				option.value = uniqueNames[i];
				this.nameList.appendChild(option);

				var filterOption = document.createElement("OPTION");
				filterOption.value = uniqueNames[i];
				filterOption.innerText = uniqueNames[i];
				if (uniqueNames[i] == selectedNameFilter) {
					filterOption.selected = true;
				}
				this.nameSelect.appendChild(filterOption);
			}

			//Add the unique visit purposes to the datalist for this field.
			while (this.purposeList.children.length > 0) {
				this.purposeList.removeChild(this.purposeList.firstChild);
			}
			for (var i = 0; i < uniquePurposes.length; i++) {
				var option = document.createElement("OPTION");
				option.value = uniquePurposes[i];
				this.purposeList.appendChild(option);
			}

			//Add the unique meals and meal types to the datalist for this field.
			while (this.mealTypeList.children.length > 0) {
				this.mealTypeList.removeChild(this.mealTypeList.firstChild);
			}
			while (this.mealList.children.length > 0) {
				this.mealList.removeChild(this.mealList.firstChild);
			}
			for (var i = 0; i < uniqueMealTypes.length; i++) {
				var option = document.createElement("OPTION");
				option.value = uniqueMealTypes[i];
				this.mealTypeList.appendChild(option);
			}
			for (var i = 0; i < uniqueMeals.length; i++) {
				var option = document.createElement("OPTION");
				option.value = uniqueMeals[i];
				this.mealList.appendChild(option);
			}
		}

		//Remove the existing visit entries.
		while (this.visitsContainer.children.length > 0) {
			this.visitsContainer.removeChild(this.visitsContainer.firstChild);
		}

		//List the visits.
		for (var i = 0; i < visits.length; i++) {
			var visit = visits[i];

			var visitLink = document.createElement("A");
			visitLink.setAttribute("visit-id", visit.visit_id);
			visitLink.addEventListener("click", this.onVisitPressed.bind(this));

			var visitElement = document.createElement("DIV");
			visitElement.className = "visit-list-item";
			visitLink.appendChild(visitElement);

			var leftArea = document.createElement("DIV");
			leftArea.className = "left-area";
			visitElement.appendChild(leftArea);

			var visitTypeLabel = document.createElement("SPAN");
			visitTypeLabel.className = "visit-type-label";
			visitTypeLabel.innerText = visit.visit_type == 1 ? "Besuch von " : visit.visit_type == 2 ? "Zu Besuch bei " : "Auswärts getroffen mit ";
			leftArea.appendChild(visitTypeLabel);

			var nameLabel = document.createElement("SPAN");
			nameLabel.className = "name-label";
			var nameString = "";
			var names = visit.name.split(", ");
			for (var j = 0; j < names.length; j++) {
				if (j > 0) {
					if (j + 1 == names.length) {
						nameString += " und ";
					}
					else {
						nameString += ", ";
					}
				}

				nameString += names[j];
			}
			nameLabel.innerText = nameString;
			leftArea.appendChild(nameLabel);

			var visitPurposeLabel = document.createElement("SPAN");
			visitPurposeLabel.className = "visit-purpose-label";
			visitPurposeLabel.innerText = " zum " + visit.visit_purpose;
			leftArea.appendChild(visitPurposeLabel);

			var rightArea = document.createElement("DIV");
			rightArea.className = "right-area";
			visitElement.appendChild(rightArea);

			var dateLabel = document.createElement("SPAN");
			dateLabel.className = "date-label";
			dateLabel.innerText = new Date(visit.date.replace(" ", "T")).toLocaleDateString(undefined, {
				year: "numeric",
				month: "long",
				day: "numeric"
			});
			rightArea.appendChild(dateLabel);

			if (visit.meals && visit.meals.length > 0) {
				var mealsBox = document.createElement("DIV");
				mealsBox.className = "served-meals-box";

				var servedMealsLabel = document.createElement("SPAN");
				servedMealsLabel.className = "served-meals-label";
				servedMealsLabel.innerText = "Servierte Gerichte:";
				mealsBox.appendChild(servedMealsLabel);

				var servedMealsText = document.createElement("P");
				servedMealsText.className = "served-meals-text";
				var servedMealsString = "";
				for (var j = 0; j < visit.meals.length; j++) {
					var meal = visit.meals[j];
					if (j > 0) {
						servedMealsString += "<br>";
					}
					servedMealsString += "<b>" + meal.meal_type + "</b>" + (meal.meal_type && meal.meal ? ": " : "") + meal.meal;
				}
				servedMealsText.innerHTML = servedMealsString;
				mealsBox.appendChild(servedMealsText);

				visitElement.appendChild(mealsBox);
			}

			if (visit.brought_items) {
				var broughtItemsBox = document.createElement("DIV");
				broughtItemsBox.className = "brought-items-box";

				var broughtItemsLabel = document.createElement("SPAN");
				broughtItemsLabel.className = "brought-items-label";
				broughtItemsLabel.innerText = "Mitgebracht:";
				broughtItemsBox.appendChild(broughtItemsLabel);

				var broughtItemsText = document.createElement("P");
				broughtItemsText.className = "brought-items-text";
				broughtItemsText.innerText = visit.brought_items;
				broughtItemsBox.appendChild(broughtItemsText);

				visitElement.appendChild(broughtItemsBox);
			}

			if (visit.description) {
				var descriptionBox = document.createElement("DIV");
				descriptionBox.className = "description-box";

				var descriptionLabel = document.createElement("SPAN");
				descriptionLabel.className = "description-label";
				descriptionLabel.innerText = "Sonstiges:";
				descriptionBox.appendChild(descriptionLabel);

				var descriptionText = document.createElement("P");
				descriptionText.className = "description-text";
				descriptionText.innerText = visit.description;
				descriptionBox.appendChild(descriptionText);

				visitElement.appendChild(descriptionBox);
			}

			this.visitsContainer.appendChild(visitLink);
		}

		//Preselect the filter if specified.
		if (!this.hasSetFilter) {
			var parameters = new URLSearchParams(window.location.search);
			if (parameters.has("name")) {
				this.nameSelect.value = parameters.get("name");
				this.loadVisits();
			}

			this.hasSetFilter = true;
		}

		this.loadingContainer.style.display = "none";
	}

	/**
	 * Error callback for the visits loading request.
	 */
	visitLoadingError(error) {
		this.loadingContainer.style.display = "none";
	}

	/**
	 * Saves the visit data in the input fields on the server side.
	 */
	saveVisit() {
		this.errorBox.style.display = "none";

		//Assemble the names.
		var name = "";
		var nameTokens = this.namesBox.querySelectorAll(".name-token");
		for (var i = 0; i < nameTokens.length; i++) {
			var token = nameTokens[i];
			if (name != "") {
				name += ", ";
			}
			name += nameTokens[i].innerText;
		}

		//If there are no names, display an error.
		if (name == "") {
			this.errorBox.innerText = "Du musst mindestens einen Namen eingeben.";
			this.errorBox.style.display = "";
			return;
		}

		//Gather the served meals.
		var meals = [ ];
		var mealRows = this.servedMealsContainer.querySelectorAll(".meal-row");
		for (var i = 0; i < mealRows.length; i++) {
			var row = mealRows[i];
			var mealTypeField = row.querySelector(".meal-type-field");
			var mealField = row.querySelector(".meal-field");

			//If both fields are empty, skip this meal row.
			if (!mealTypeField.value && !mealField.value) {
				continue;
			}

			meals.push({
				meal_type: mealTypeField.value,
				meal: mealField.value
			});
		}

		var visit = {
			name: name,
			date: this.dateField.value,
			visit_type: this.visitTypeSelect.value,
			visit_purpose: this.visitPurposeField.value,
			meals: meals,
			brought_items: this.broughtItemsField.value,
			description: this.descriptionField.value
		};

		if (this.visitId) {
			visit.visit_id = this.visitId;
		}

		this.saveVisitRequest.send(visit);
	}

	/**
	 * Callback for the save visit request.
	 */
	savedVisit(visit) {
		if (!visit) {
			this.visitSavingError({
				code: null,
				message: "Aus unerklärlichen Gründen konnte der Besuch nicht gespeichert werden."
			});
			return;
		}

		//Refresh the visit list. Yes, I am lazy.
		this.loadVisits();
		this.hideVisit();
	}

	/**
	 * Called when an error occurs while saving the visit.
	 */
	visitSavingError(error) {
		this.errorBox.innerText = error.message;
		this.errorBox.style.display = "";
	}

	/**
	 * Deletes the currently visible visit.
	 * Will just close the modal view if the visit has not been saved yet.
	 */
	deleteVisit() {
		if (!this.visitId) {
			this.hideVisit();
			return;
		}

		this.deleteVisitRequest.send({
			visit_id: this.visitId
		});
	}

	/**
	 * The success callback for the visit deletion request.
	 */
	deletedVisit(responseData) {
		//Refresh the visit list. Yes, I am lazy.
		this.loadVisits();
		this.hideVisit();
	}

	/**
	 * The error callback for the visit deletion request.
	 */
	visitDeletionError(error) {
		this.errorBox.innerText = error.message;
		this.errorBox.style.display = "";
	}

	/**
	 * Called when a filter value has changed.
	 * Will reload the visits.
	 */
	onFilterChanged(event) {
		this.loadVisits();
	}

	/**
	 * Creates a new name token for the given name.
	 */
	addName(name) {
		var nameToken = document.createElement("SPAN");
		nameToken.innerText = name;
		nameToken.className = "name-token";
		nameToken.addEventListener("click", this.onRemoveNameButtonPressed.bind(this));
		this.namesBox.insertBefore(nameToken, this.newNameField);
	}

	/**
	 * The callback for the click event of the button to remove a name token.
	 */
	onRemoveNameButtonPressed(event) {
		event.currentTarget.parentNode.removeChild(event.currentTarget);
	}

	/**
	 * The callback for the click event of the add visit button.
	 */
	onAddVisitButtonPressed(event) {
		this.showVisit();
	}

	/**
	 * The callback for the key down event of the new name field.
	 */
	onNewNameFieldKeyPressed(event) {
		if (event.key != "Enter" && event.key != "," && event.key != "+" && event.key != "&") {
			return;
		}

		event.preventDefault();

		this.addToken();
	}

	/**
	 * The callback for the blur event of the new name field.
	 */
	onNewNameFieldBlurred(event) {
		this.addToken();
	}

	/**
	 * Converts the current name input into a token.
	 */
	addToken() {
		//Do nothing if there is no input.
		if (!this.newNameField.value) {
			return;
		}

		var newName = this.newNameField.value;

		//Truncate the name.
		while (newName.endsWith(" ")) {
			newName = newName.substring(0, newName.length - 1);
		}
		while (newName.startsWith(" ")) {
			newName = newName.substring(1, newName.length);
		}

		this.newNameField.value = "";
		this.addName(newName);
	}

	/**
	 * The callback function for the click event on the button that adds a new meal row.
	 */
	onAddMealButtonPressed(event) {
		this.addMeal();
	}

	/**
	 * Adds a meal row to the meal list.
	 * @param type The meal type (optional).
	 * @param meal The meal description (optional).
	 */
	addMeal(type = "", meal = "") {
		var mealRow = document.createElement("DIV");
		mealRow.className = "meal-row";

		var mealTypeField = document.createElement("INPUT");
		mealTypeField.type = "text";
		mealTypeField.setAttribute("list", "meal-type-list");
		mealTypeField.placeholder = "Gang";
		mealTypeField.value = type;
		mealTypeField.className = "meal-type-field";
		mealRow.appendChild(mealTypeField);

		var mealField = document.createElement("INPUT");
		mealField.type = "text";
		mealField.setAttribute("list", "meal-list");
		mealField.placeholder = "Gericht";
		mealField.value = meal;
		mealField.className = "meal-field";
		mealRow.appendChild(mealField);

		var removeButton = document.createElement("BUTTON");
		removeButton.innerText = "×";
		removeButton.addEventListener("click", this.onRemoveMealButtonPressed.bind(this));
		mealRow.appendChild(removeButton);

		this.servedMealsContainer.appendChild(mealRow);
	}

	/**
	 * The callback function for the click event of the button to remove a meal.
	 */
	onRemoveMealButtonPressed(event) {
		event.currentTarget.parentNode.parentNode.removeChild(event.currentTarget.parentNode);
	}

	/**
	 * The callback function for the click event of the visit links.
	 */
	onVisitPressed(event) {
		var visitId = event.currentTarget.getAttribute("visit-id");

		var visit = null;
		for (var i = 0; i < this.visits.length; i++) {
			if (this.visits[i].visit_id == visitId) {
				visit = this.visits[i];
				break;
			}
		}

		if (!visit) {
			return;
		}

		this.showVisit(visit);
	}

	/**
	 * The callback function for the click event of the save button.
	 */
	onVisitFormSubmitted(event) {
		event.preventDefault();
		this.saveVisit();
	}

	/**
	 * The callback function for the click event of the delete button.
	 */
	onDeleteButtonPressed(event) {
		if (!confirm("Willst du diesen Eintrag wirklich löschen?")) {
			return;
		}

		event.stopPropagation();
		this.deleteVisit();
	}

	/**
	 * Shows the visit modal view with the data of the given visit.
	 * If no visit data is provided, the view is shown empty.
	 * @param visit The visit data object.
	 */
	showVisit(visit = null) {
		if (!visit) {
			visit = {
				name: "",
				date: "",
				visit_purpose: "",
				meals: [ ],
				brought_items: "",
				description: ""
			};

			this.visitId = null;
		}
		else {
			this.visitId = visit.visit_id;
		}

		var names = visit.name.replaceAll("  ", " ").replaceAll(" + ", ",").replaceAll("+", ",").replaceAll(" & ", ",").replaceAll("&", ",").replaceAll(", ", ",").split(",");
		while (this.namesBox.children.length > 1) {
			this.namesBox.removeChild(this.namesBox.firstChild);
		}
		if (visit.name != "") {
			for (var i = 0; i < names.length; i++) {
				this.addName(names[i]);
			}
		}

		this.dateField.value = visit.date.split(" ")[0];

		this.visitPurposeField.value = visit.visit_purpose;

		while (this.servedMealsContainer.children.length > 0) {
			this.servedMealsContainer.removeChild(this.servedMealsContainer.firstChild);
		}
		for (var i = 0; i < visit.meals.length; i++) {
			this.addMeal(visit.meals[i].meal_type, visit.meals[i].meal);
		}

		this.broughtItemsField.value = visit.brought_items;

		this.descriptionField.value = visit.description;

		if (this.modalContainer.className.indexOf("visible") == -1) {
			this.modalContainer.classList.add("visible");
		}
	}

	/**
	 * Hides the visit modal view.
	 */
	hideVisit() {
		this.modalContainer.classList.remove("visible");
	}

	/**
	 * The callback function to the click event on the modal container.
	 */
	onModalContainerClicked(event) {
		if (event.target != this.modalContainer) {
			return;
		}

		this.hideVisit();
	}
}

//Instantiate the VisitsController.
new VisitsController();