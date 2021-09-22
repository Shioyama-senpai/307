/**
 * The request class simplifies the process of an AJAX request.
 */
class Request {
	/**
	 * The constructor of the Request class.
	 * The function takes four parameters.
	 * @param url This is the request URL.
	 * @param method This is the request method. Default value: "GET"
	 * @param successCallback: This is the function that gets called when the request returns a response. Default value: null
	 * @param errorCallback: This function will be called when an error occurs either while sending the request or in the response itself. Default value: null
	 */
	constructor(url, method = "GET", successCallback = null, errorCallback = null) {
		this.url = url;
		this.method = method;

		this.successCallback = successCallback;
		this.errorCallback = errorCallback;
	}

	/**
	 * Sends the request with the optional data as payload.
	 * If the request method is GET, the data is serialized as URL parameters.
	 * Otherwise, the data is sent as JSON payload.
	 * @param data The data to send to the server as an object. Default value: null
	 */
	send(data = null) {
		var queryString = "";

		//Compile the payload to URL parameters if the request method is GET.
		if (this.method == "GET" || this.method == "DELETE") {
			//Continue an existing query string if the URL already contains parameters.
			if (this.url.indexOf("?") != -1) {
				queryString += "&";
			}
			else {
				queryString += "?";
			}

			var allParameters = [ ];
			for (var key in data) {
				allParameters.push(key + "=" + data[key]);
			}
			queryString += allParameters.join("&");
		}

		this.request = new XMLHttpRequest();
		this.request.onreadystatechange = this.onReadyStateChange.bind(this);
		this.request.open(this.method, this.url + queryString);

		if (this.method == "POST") {
			//Set the JSON content type header and convert the data into JSON.
			this.request.setRequestHeader("Content-Type", "application/json");
			data = JSON.stringify(data);
		}

		this.request.send(data);
	}

	/**
	 * Called when the ready state of the request changed.
	 * @param event The event object.
	 */
	onReadyStateChange(event) {
		//Do nothing until the ready state is 4.
		if (this.request.readyState < 4) {
			return;
		}

		//Try to parse the response text as JSON.
		var responseData = null;
		if (this.request.responseText) {
			try {
				responseData = JSON.parse(this.request.responseText);
			}
			catch (exception) {
				//If the parsing failed, call the error handling function.
				this.onError({
					code: "invalid_response",
					message: "The response is in an invalid format. JSON expected.",
					data: this.request.responseText
				});
				return;
			}
		}

		//Redirect to the login page if it is a 401 error, given that we are not yet on the login page.
		if (this.request.status == 401 && window.location.href.indexOf("/login.php") == -1) {
			window.open("login.php", "_self");
			return;
		}

		//If the response is an error object, forward it to the error handling function.
		if (responseData && typeof responseData === "object" && "code" in responseData && "message" in responseData) {
			this.onError(responseData);
			return;
		}

		//If the response code is not in the 200 range, call the error handling function.
		if (this.request.status > 299) {
			this.onError({
				code: this.request.status,
				message: this.request.statusText,
				data: this.request.responseText
			});
			return;
		}

		//Call the success callback.
		if (this.successCallback) {
			this.successCallback(responseData);
		}
	}

	/**
	 * This gets called whenever an error occurs during the request or if the request returns an error itself.
	 * @param error The error object containing all relevant information. This object should at least contain the properties "code" and "message".
	 */
	onError(error) {
		if (this.errorCallback) {
			this.errorCallback(error);
		}
	}
}