/**
 * @fileoverview This Class creates a single control panel for all networks. It also manages the user input
 * to update networks acordingly
 * @package It requires bootstrap to be able to create Collapses.
 * @package It requires bootstrap to be able to create Dropdowns.
 * @author Marco Expósito Pérez
 */
//Namespaces
import { networkHTML } from "./constants/networkHTML.js";
//Packages
import Legend from "./controlPanelComponents/legend.js";
import ThresholdSlider from "./controlPanelComponents/thresholdSlider.js";

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

        document.getElementById(networkHTML.controlPanelParentContainer).appendChild(this.container);

        const inputTitle = document.createElement("h5");
        inputTitle.innerHTML = "Control Panel";

        const checkboxContainer = this.createVariableEdgeCheckBoxContainer();

        this.container.appendChild(inputTitle);
        new ThresholdSlider(this.container, this.networkManager);
        this.container.appendChild(checkboxContainer);
        new Legend(this.container, this.networkManager);

        this.container.append(document.createElement("br"));
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