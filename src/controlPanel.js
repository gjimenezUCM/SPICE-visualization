import { networkHTML } from "./namespaces/networkHTML";

export default class ControlPanel {

    constructor(networkManager) {
        this.isActive = false;
        this.networkManager = networkManager;
    }

    /**
     * Creates the controlPanel if its not currently active
     * @param {Object} communities Filtered communities used for some of the inputs
     */
    createControlPanel(communities) {
        if (this.isActive)
            return;
        this.isActive = true;

        //Create the control panel
        this.container = document.createElement("div");
        this.container.className = "middle";

        const inputTitle = document.createElement("h5");
        inputTitle.innerHTML = "Control Panel";

        const sliderContainer = this.createThresholdSliderContainer();
        const checkboxContainer = this.createVariableEdgeCheckBoxContainer();
        //const explicitContainer = this.createExplicitCommunityChooser(exp_communities);

        this.container.appendChild(inputTitle);
        this.container.appendChild(sliderContainer);
        this.container.appendChild(checkboxContainer);
        //this.container.appendChild(explicitContainer);

        document.getElementById(networkHTML.controlPanelParentContainer).appendChild(this.container);

        //TODO. User should be able to choose what communities want to represent visualy
        this.filteredCommunities = new Array();
        for(let i = 0; i < communities.filterSize; i++){
            this.filteredCommunities.push(communities.data[i]);
        }
        this.networkManager.initFilterALL(this.filteredCommunities);
        
    }

    /** 
     * Create a container with a slider that controls the minimum similarity Threshold 
     * for edges to be visible in the network
     * @returns Container with the slider
     */
    createThresholdSliderContainer() {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = "middle";

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = "0.0";
        slider.max = "1.0";
        slider.step = "0.1";
        slider.value = networkHTML.sliderThresholdInitialValue;
        slider.id = "thresholdSlider";

        slider.onchange = () => this.thresholdChange(slider);


        const text = document.createElement('span');
        text.innerHTML = "Minimum Similarity: ";

        const value = document.createElement('span');
        value.id = "thresholdSliderValue";
        value.innerHTML = networkHTML.sliderThresholdInitialValue;

        slider.oninput = () => this.updateSliderText(slider, value);

        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(text);
        sliderContainer.appendChild(value);

        return sliderContainer;
    }

    /** 
     *  Update all networks with the new threshold value. Updates the label with the value too
     */
    thresholdChange(slider) {
        let newValue = slider.value;

        this.networkManager.thresholdChangeALL(newValue);
    }

    /**
     * Update the text nearby the slider to show the new values
     */
    updateSliderText(slider, text) {
        let newValue = slider.value;

        if (newValue === "0") newValue = "0.0";
        if (newValue === "1") newValue = "1.0";

        text.innerHTML = newValue;
    }


    /** 
    * Create a container with a checkbox that controls if the network edges width should vary 
    * with its similarity
    * @returns Container with the checkbox
    */
    createVariableEdgeCheckBoxContainer() {
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = "middle";

        const text2 = document.createElement('span');
        text2.innerHTML = "Variable edge width: ";

        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.checked = this.initialVariableWidthValue;

        checkBox.onchange = () => this.variableEdgeChange(checkBox);

        checkboxContainer.appendChild(text2);
        checkboxContainer.appendChild(checkBox);

        return checkboxContainer;
    }


    /** 
     *  Update all networks with the new variableEdgeWidth value
     */
    variableEdgeChange(checkBox) {
        this.networkManager.variableEdgeChangeALL(checkBox.checked);
    }

    /**
     * Remove the controlPanel if its active
     */
    removeControlpanel() {
        if (!this.isActive)
            return;
        this.isActive = false;

        document.getElementById(networkHTML.controlPanelParentContainer).removeChild(this.container);
    }
}   