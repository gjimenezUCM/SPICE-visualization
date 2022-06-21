/**
 * @fileoverview This Class creates a single control panel for all networks. It also manages the user input
 * to update networks acordingly
 * @package It requires bootstrap to be able to create Collapses.
 * @package It requires bootstrap to be able to create Dropdowns.
 * @author Marco Expósito Pérez
 */
//Namespaces
import { networkHTML } from "./namespaces/networkHTML.js";
import { nodes } from "./namespaces/nodes.js";
//Packages
import { Collapse } from 'bootstrap';
import { Dropdown } from 'bootstrap';
import Legend from "./controlPanelComponents/legend.js";

export default class ControlPanel {

    /**
     * Constructor of the class
     * @param {NetworkGroupManager} networkManager manager of all networks
     */
    constructor(networkManager) {
        this.isActive = false;
        this.networkManager = networkManager;

        //Communities that change nodes visual properties and can be hidden
        this.filteredCommunities = new Array();
        //Map that links the key of a filter atrribute with its dropdown button 
        this.filterToDropdown = new Map();
        //Maximum number of communities that can be filtered/visualy represented
        this.maxFilterSize = 0;

        this.filterValuesToHide = new Array();
    }

    /**
     * Creates the controlPanel if its not currently active
     */
    createControlPanel() {
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

        this.container.appendChild(inputTitle);
        this.container.appendChild(sliderContainer);
        this.container.appendChild(checkboxContainer);
        new Legend(this.container, this.networkManager);

        this.container.append(document.createElement("br"));

        document.getElementById(networkHTML.controlPanelParentContainer).appendChild(this.container);

    }

    /** 
     * Create a container with a slider that controls the minimum similarity Threshold 
     * for edges to be visible in the network
     * @returns {HTMLElement} Container with the slider
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
    * @returns {HTMLElement}  Container with the checkbox
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