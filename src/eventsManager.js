import DrawNetwork from "./drawNetwork";
import NetworkManager from "./networkManager";
import RequestsManager from "./requestsManager";


export default class EventsManager {

    constructor() {
        this.requestManager = new RequestsManager();
        this.networkManager = new NetworkManager();

        this.popupInit();

        this.sliderInputManager();

        this.checkBoxManager();
    }
    /**
     * Get the number of available files from the database
     */
    popupInit() {
        this.requestManager.getNetwork("dataList.json")
            .then((file) => {
                file = JSON.parse(file);
                this.popupManager(file)
            });
    }

    /** Create an option in a popup for each file. The popup has a button to activate/deactivate and a checkbox to see the current state
     * 
     * @param {*} headersFile JSON file with all available files
     */
    popupManager(headersFile) {
        const n = headersFile.files.length;
        
        const popupContainer = document.getElementById("dropdown");

        for (let i = 0; i < n; i++) {

            const newContainer = document.createElement('div');
            newContainer.className = "row";

            const newOption = document.createElement('input');
            newOption.type = 'button';
            newOption.value = headersFile.files[i].name;
            newOption.className = 'dropDownOption';

            newOption.onclick = () => {
                this.popupClicked(headersFile.files[i].name)
            };

            newContainer.appendChild(newOption);

            const newCheckBox = document.createElement('input');
            newCheckBox.type = 'checkbox';
            newCheckBox.disabled = true;
            newCheckBox.checked = false;
            newCheckBox.id ="check_" + headersFile.files[i].name;
            newCheckBox.className = "dropdownCheck";

            newContainer.appendChild(newCheckBox);

            popupContainer.appendChild(newContainer)

        }
    }
    /** Show/hide a network based on the name of the file input parameter
     * 
     * @param {*} name name of the file to show/hide 
     */
    popupClicked(name) {
        const checkbox = document.getElementById("check_" + name);
        if(checkbox.checked){
            this.networkManager.removeNetwork(name);

            checkbox.checked = false;
        }else{
            this.requestManager.getNetwork(name+".json")
            .then((file) => {
                this.networkManager.addNetwork(name, file)
            });

            checkbox.checked = true;
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