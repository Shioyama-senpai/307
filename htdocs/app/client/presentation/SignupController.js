/**
 * The SignupController is a view controller that is responsible for the signup page.
 */
class SignupController {
	/**
	 * The constructor for the SignupController.
	 */
	constructor() {
		this.signupForm = document.getElementById("signup-form");
		this.signupButton = document.getElementById("signup-button");
		this.loadingIndicator = document.getElementById("loading-indicator");
		this.errorBox = document.getElementById("error-box");
		this.emailField = document.getElementById("email-field");
		this.passwordField = document.getElementById("password-field");

		this.signupForm.addEventListener("submit", this.onSignupFormSubmitted.bind(this));

		this.signupRequest = new Request("app/server/service/signup.php", "POST", this.onSignupSucceeded.bind(this), this.onSignupFailed.bind(this));
	}

	/**
	 * The callback function for the submit event of the login form.
	 */
	onSignupFormSubmitted(event) {
		event.preventDefault();

		this.signupButton.style.display = "none";
		this.loadingIndicator.style.display = "";
		this.errorBox.style.display = "none";

		this.signupRequest.send({
			email: this.emailField.value,
			password: this.passwordField.value
		});
	}

	onSignupSucceeded(responseData) {
		if (responseData == true) {
			window.open("profile.php", "_self");
		}
		else {
			this.onSignupFailed({
				code: null,
				message: "Die Registration ist aus unverständlichen Gründen fehlgeschlagen."
			});
		}
	}

	onSignupFailed(error) {
		this.signupButton.style.display = "";
		this.loadingIndicator.style.display = "none";

		this.errorBox.innerText = error.message;
		this.errorBox.style.display = "";
	}
}

//Instantiate the SignupController.
new SignupController();