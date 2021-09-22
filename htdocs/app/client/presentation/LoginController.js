/**
 * The LoginController is a view controller that is responsible for the login page.
 */
class LoginController {
	/**
	 * The constructor for the LoginController.
	 */
	constructor() {
		this.loginForm = document.getElementById("login-form");
		this.loginButton = document.getElementById("login-button");
		this.loadingIndicator = document.getElementById("loading-indicator");
		this.errorBox = document.getElementById("error-box");
		this.emailField = document.getElementById("email-field");
		this.passwordField = document.getElementById("password-field");

		this.loginForm.addEventListener("submit", this.onLoginFormSubmitted.bind(this));

		this.loginRequest = new Request("app/server/service/login.php", "POST", this.onLoginSucceeded.bind(this), this.onLoginFailed.bind(this));
	}

	/**
	 * The callback function for the submit event of the login form.
	 */
	onLoginFormSubmitted(event) {
		event.preventDefault();

		this.loginButton.style.display = "none";
		this.loadingIndicator.style.display = "";
		this.errorBox.style.display = "none";

		this.loginRequest.send({
			email: this.emailField.value,
			password: this.passwordField.value
		});
	}

	onLoginSucceeded(responseData) {
		if (responseData == true) {
			window.open("profile.php", "_self");
		}
		else {
			this.onLoginFailed({
				code: null,
				message: "Die Anmeldung ist aus unverständlichen Gründen fehlgeschlagen."
			});
		}
	}

	onLoginFailed(error) {
		this.loginButton.style.display = "";
		this.loadingIndicator.style.display = "none";

		this.errorBox.innerText = error.message;
		this.errorBox.style.display = "";
	}
}

//Instantiate the LoginController.
new LoginController();