import DrawNetwork from "./drawNetwork";

export default class EventsManager {

    constructor() {
        this.fileInputManager();

        this.sliderInputManager();

        this.checkBoxManager();
    }

    /**
     * Create the parameters necesary for the fileInputChange function
     */
    fileInputManager() {
        this.fileInput = document.getElementById('jsonInput');
        this.reader = new FileReader();

        this.activeNetwork = null;

        this.fileInput.addEventListener("change", () => this.fileInputChange(), false);
    }

    /**
     * Executer when the file input changes. It trys to parse it to json and create a network, if it cant, an alert will be shown
     */
    fileInputChange() {
        const file = this.fileInput.files[0];
        this.reader.readAsText(file, "UTF-8");

        //Check if the file selected is a valid json file
        this.reader.onload = (evt) => {
            try {
                if (this.activeNetwork !== null) this.activeNetwork.clearNetwork();

                const jsonFile = JSON.parse(evt.target.result);
                const container = document.getElementById('mynetwork');

                this.activeNetwork = new DrawNetwork(jsonFile, container);

            } catch (e) {
                console.log(e);

                alert("The file is not a valid json file");
            }
        };
        this.reader.onerror = (evt) => {
            if (this.activeNetwork !== null) this.activeNetwork.clearNetwork();

            alert("Error trying to read the selected file");
        }

    }

    /**
     *  Update the slider value and update the networks's edges to hide anyone below the threshold
     */
    sliderInputManager() {
        document.getElementById('edgeThreshold').oninput = () => {
            let thresholdValue = document.getElementById('edgeThreshold').value;

            if (thresholdValue === "0") thresholdValue = "0.0";
            if (thresholdValue === "1") thresholdValue = "1.0";

            document.getElementById('thresholdValue').innerHTML = thresholdValue;

            if (this.activeNetwork !== null) {
                this.activeNetwork.edgeValueThreshold = parseFloat(thresholdValue);
                this.activeNetwork.hideEdgesbelowThreshold();
            }
        }
    }

    /**
     * //UPDATE THE NETWORK AND CHANGE MAX WIDTH OF EDGES BASED ON THE CHECKBOX
     */
    checkBoxManager() {
        document.getElementById('changeMaxEdgeWidth').addEventListener('change', () => {
            if (this.activeNetwork !== null) {
                this.activeNetwork.changeMaxEdgeWidth = document.getElementById('changeMaxEdgeWidth').checked;
                this.activeNetwork.changeAllMaxEdgesWidth();
            }
        });
    }
}