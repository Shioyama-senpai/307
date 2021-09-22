/**
 * The ProfileController is a view controller that is responsible for the profile page and its modal views.
 */
class ProfileController {
	/**
	 * The constructor for the ProfileController.
	 */
	constructor() {
		this.emailLabel = document.getElementById("email-label");
		this.successBox = document.getElementById("success-box");

		this.modalContainer = document.getElementById("modal-container");
		this.changeEmailView = document.getElementById("change-email-view");
		this.changePasswordView = document.getElementById("change-password-view");

		this.modalContainer.addEventListener("click", this.onModalContainerClicked.bind(this));

		this.changeEmailButton = document.getElementById("change-email-button");

		this.changeEmailButton.addEventListener("click", this.onChangeEmailButtonPressed.bind(this));

		this.changeEmailForm = document.getElementById("change-email-form");
		this.changeEmailSubmitButton = document.getElementById("change-email-submit-button");
		this.changeEmailLoadingIndicator = document.getElementById("change-email-loading-indicator");
		this.changeEmailErrorBox = document.getElementById("change-email-error-box");
		this.changeEmailOldEmailField = document.getElementById("change-email-old-email-field");
		this.changeEmailNewEmailField = document.getElementById("change-email-new-email-field");
		this.changeEmailPasswordField = document.getElementById("change-email-password-field");

		this.changeEmailForm.addEventListener("submit", this.onChangeEmailFormSubmitted.bind(this));

		this.changeEmailRequest = new Request("app/server/service/changeemail.php", "POST", this.onEmailChangeSucceeded.bind(this), this.onEmailChangeFailed.bind(this));

		this.changePasswordButton = document.getElementById("change-password-button");

		this.changePasswordButton.addEventListener("click", this.onChangePasswordButtonPressed.bind(this));

		this.changePasswordForm = document.getElementById("change-password-form");
		this.changePasswordSubmitButton = document.getElementById("change-password-submit-button");
		this.changePasswordLoadingIndicator = document.getElementById("change-password-loading-indicator");
		this.changePasswordErrorBox = document.getElementById("change-password-error-box");
		this.changePasswordOldPasswordField = document.getElementById("change-password-old-password-field");
		this.changePasswordNewPasswordField = document.getElementById("change-password-new-password-field");
		this.changePasswordEmailField = document.getElementById("change-password-email-field");

		this.changePasswordForm.addEventListener("submit", this.onChangePasswordFormSubmitted.bind(this));

		this.changePasswordRequest = new Request("app/server/service/changepassword.php", "POST", this.onPasswordChangeSucceeded.bind(this), this.onPasswordChangeFailed.bind(this));
	}

	/**
	 * The callback for the change email button in the main view.
	 */
	onChangeEmailButtonPressed(event) {
		if (this.changeEmailView.className.indexOf("visible") == -1) {
			this.changeEmailView.classList.add("visible");
		}
		if (this.modalContainer.className.indexOf("visible")) {
			this.modalContainer.classList.add("visible");
		}
		this.successBox.style.display = "none";
	}

	/**
	 * The callback function for the submit event of the email change form.
	 */
	onChangeEmailFormSubmitted(event) {
		event.preventDefault();

		this.changeEmailSubmitButton.style.display = "none";
		this.changeEmailLoadingIndicator.style.display = "";
		this.changeEmailErrorBox.style.display = "none";

		this.changeEmailRequest.send({
			old_email: this.changeEmailOldEmailField.value,
			new_email: this.changeEmailNewEmailField.value,
			password: this.changeEmailPasswordField.value
		});
	}

	/**
	 * The success callback for the change email request.
	 */
	onEmailChangeSucceeded(responseData) {
		if (responseData == true) {
			//Update the email label in the main view.
			this.emailLabel.innerText = this.changeEmailNewEmailField.value;

			//Hide and clear the change email view.
			this.modalContainer.classList.remove("visible");
			this.changeEmailView.classList.remove("visible");

			this.changeEmailOldEmailField.value = "";
			this.changeEmailNewEmailField.value = "";
			this.changeEmailPasswordField.value = "";
			this.changeEmailSubmitButton.style.display = "";
			this.changeEmailLoadingIndicator.style.display = "none";

			//Show the success message.
			this.successBox.innerText = "Die E-Mail-Adresse wurde geändert.";
			this.successBox.style.display = "";
		}
		else {
			this.onEmailChangeFailed({
				code: null,
				message: "Die Änderung der E-Mail-Adresse ist aus unverständlichen Gründen fehlgeschlagen."
			});
		}
	}

	/**
	 * The error callback for the change email request.
	 */
	onEmailChangeFailed(error) {
		this.changeEmailSubmitButton.style.display = "";
		this.changeEmailLoadingIndicator.style.display = "none";

		this.changeEmailErrorBox.innerText = error.message;
		this.changeEmailErrorBox.style.display = "";
	}

	/**
	 * The callback for the change password button in the main view.
	 */
	onChangePasswordButtonPressed(event) {
		if (this.changePasswordView.className.indexOf("visible") == -1) {
			this.changePasswordView.classList.add("visible");
		}
		if (this.modalContainer.className.indexOf("visible")) {
			this.modalContainer.classList.add("visible");
		}
		this.successBox.style.display = "none";
	}

	/**
	 * The callback function for the submit event of the password change form.
	 */
	onChangePasswordFormSubmitted(event) {
		event.preventDefault();

		this.changePasswordSubmitButton.style.display = "none";
		this.changePasswordLoadingIndicator.style.display = "";
		this.changePasswordErrorBox.style.display = "none";

		this.changePasswordRequest.send({
			old_password: this.changePasswordOldPasswordField.value,
			new_password: this.changePasswordNewPasswordField.value,
			email: this.changePasswordEmailField.value
		});
	}

	/**
	 * The success callback for the change password request.
	 */
	onPasswordChangeSucceeded(responseData) {
		if (responseData == true) {
			//Hide and clear the change password view.
			this.modalContainer.classList.remove("visible");
			this.changePasswordView.classList.remove("visible");

			this.changePasswordOldPasswordField.value = "";
			this.changePasswordNewPasswordField.value = "";
			this.changePasswordEmailField.value = "";
			this.changePasswordSubmitButton.style.display = "";
			this.changePasswordLoadingIndicator.style.display = "none";

			//Show the success message.
			this.successBox.innerText = "Das Passwort wurde geändert.";
			this.successBox.style.display = "";
		}
		else {
			this.onPasswordChangeFailed({
				code: null,
				message: "Die Änderung des Passworts ist aus unverständlichen Gründen fehlgeschlagen."
			});
		}
	}

	/**
	 * The error callback for the change password request.
	 */
	onPasswordChangeFailed(error) {
		this.changePasswordSubmitButton.style.display = "";
		this.changePasswordLoadingIndicator.style.display = "none";

		this.changePasswordErrorBox.innerText = error.message;
		this.changePasswordErrorBox.style.display = "";
	}

	/**
	 * The callback function to the click event on the modal container.
	 */
	onModalContainerClicked(event) {
		if (event.target != this.modalContainer) {
			return;
		}

		this.modalContainer.classList.remove("visible");
		this.changeEmailView.classList.remove("visible");
		this.changePasswordView.classList.remove("visible");
	}
}

//Instantiate the ProfileController.
new ProfileController();