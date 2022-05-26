import DrawNetwork from "./drawNetwork";
import NetworkManager from "./networkManager";
import RequestsManager from "./requestsManager";


export default class EventsManager {

    constructor() {
        this.requestManager = new RequestsManager();
        this.networkManager = new NetworkManager();

        this.popupInit();
    }

    /**
     * Get the number of available files from the database
     */
    popupInit() {
        this.requestManager.getAllFileNames()
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
            const key = headersFile.files[i].name;

            const newContainer = document.createElement('div');
            newContainer.className = "row";

            const newOption = document.createElement('input');
            newOption.type = 'button';
            newOption.value = key;
            newOption.className = 'dropDownOption';

            newOption.onclick = () => {
                this.popupClicked(key)
            };

            newContainer.appendChild(newOption);

            const newCheckBox = document.createElement('input');
            newCheckBox.type = 'checkbox';
            newCheckBox.disabled = true;
            newCheckBox.checked = false;
            newCheckBox.id = "networkActiveCheck_" + key;
            newCheckBox.className = "dropdownCheck";

            newContainer.appendChild(newCheckBox);

            popupContainer.appendChild(newContainer)
        }
    }

    /** Show/hide the network based on the file clicked
     * 
     * @param {*} key Key of the network 
     */
    popupClicked(key) {
        const checkbox = document.getElementById("networkActiveCheck_" + key);
        if (checkbox.checked) {
            this.networkManager.removeNetwork(key);

            checkbox.checked = false;
        } else {
            this.requestManager.getNetwork(key + ".json")
                .then((file) => {
                    this.createNetwork(key, file);

                });

            checkbox.checked = true;
        }
    }

    /** Create the network and all the user configuration options 
     * 
     * @param {*} key Key of the netwprk
     * @param {*} file File with the network config data
     */
    createNetwork(key, file) {
        const allNetworkContainer = document.getElementById("networksContainer");

        const newNetworkContainer = document.createElement("div");
        newNetworkContainer.id = "network_" + key;
        
        const separator = document.createElement('hr');

        const titleContainer = document.createElement('div');
        titleContainer.className = "middle";

        const title = document.createElement("h2");
        title.innerHTML = key;
        titleContainer.appendChild(title);

        const sliderContainer = this.createThresholdSliderContainer(key);
        const checkboxContainer = this.createVariableEdgeCheckBoxContainer(key);

        newNetworkContainer.appendChild(separator);
        newNetworkContainer.appendChild(titleContainer);
        newNetworkContainer.appendChild(sliderContainer);
        newNetworkContainer.appendChild(checkboxContainer);

        allNetworkContainer.appendChild( newNetworkContainer);

        this.networkManager.addNetwork(key, file, newNetworkContainer)

        
    }

    /** Create a container with a slider that controls the minimum similarity Threshold for edges to be visible in the network
     * 
     * @param {*} key Key of the network
     * @returns Container with the slider
     */
    createThresholdSliderContainer(key) {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = "middle";

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = "0.0";
        slider.max = "1.0";
        slider.step = "0.1";
        slider.value = "0.5";
        slider.id = "thresholdSlider_" + key;

        slider.oninput = () => this.thresholdChange(key);

        const text = document.createElement('span');
        text.innerHTML = "Minimum Similarity: ";

        const value = document.createElement('span');
        value.id = "thresholdSliderValue_" + key;
        value.innerHTML = "0.5";

        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(text);
        sliderContainer.appendChild(value);

        return sliderContainer;
    }

    /** Create a container with a checkbox that controls if the network edges width should vary with its similarity
     * 
     * @param {*} key Key of the network
     * @returns Container with the checkbox
     */
    createVariableEdgeCheckBoxContainer(key) {
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = "middle";

        const text2 = document.createElement('span');
        text2.innerHTML = "Variable edge width: ";

        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.checked = false;
        checkBox.id = "thresholdVariableCheck_" + key;
    
        checkBox.onchange = () => this.variableEdgeChange(key);

        checkboxContainer.appendChild(text2);
        checkboxContainer.appendChild(checkBox);

        return checkboxContainer;
    }

    /** Update the network with the new threshold value. Updates the label with the value too
     * 
     * @param {*} key Key of the network
     */
    thresholdChange(key) {
        const slider = document.getElementById("thresholdSlider_" + key);
        const value = document.getElementById("thresholdSliderValue_" + key);

        let newValue = slider.value;

        if (newValue === "0") newValue = "0.0";
        if (newValue === "1") newValue = "1.0";

        value.innerHTML = newValue;

        this.networkManager.thresholdChange(key, newValue);
    }


   /** UUpdate the network with the new variableEdgeWidth value
    * 
    * @param {*} key key of the network
    */
    variableEdgeChange(key) {
        const checkBox = document.getElementById("thresholdVariableCheck_" + key);
        
        this.networkManager.variableEdgeChange(key, checkBox.checked);
    }
}