import DrawNetwork from "./drawNetwork";

window.onload = function () {

	//PARSE THE FILE AND CREATE THE NETWORK
	const fileInput = document.getElementById('jsonInput');
	const reader = new FileReader();
	let activeNetwork = null;

	fileInput.addEventListener("change", function () {
		const file = fileInput.files[0];
		reader.readAsText(file, "UTF-8");

		//Check if the file selected is a valid json file
		reader.onload = function (evt) {
			try {
				const jsonFile = JSON.parse(evt.target.result);
				const container = document.getElementById('mynetwork');

				activeNetwork = new DrawNetwork(jsonFile, container);

			} catch (e) {
				console.log(e);
				
				if(activeNetwork !== null) activeNetwork.clearNetwork();

				alert("The file is not a valid json file");
			}
		};
		reader.onerror = function (evt) {
			if(activeNetwork !== null) activeNetwork.clearNetwork();

			alert("Error trying to read the selected file");
		}
	}, false);

	//UPDATE THE SLIDER VALUE AND THE NETWORK
	document.getElementById('edgeThreshold').oninput = function() {
		let ThresholdValue = this.value;

		if(ThresholdValue === "0") ThresholdValue = "0.0";
		if(ThresholdValue === "1") ThresholdValue = "1.0";

		document.getElementById('thresholdValue').innerHTML = ThresholdValue;

		if(activeNetwork !== null){
			activeNetwork.edgeValueThreshold = parseFloat(ThresholdValue);
			activeNetwork.hideEdgesbelowThreshold();
		}
	}

}