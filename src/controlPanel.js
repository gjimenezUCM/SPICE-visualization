/**
 * @fileoverview This class creates a single control panel for all networks. The control panel is made of a slider
 * that updates the minimum edge value threshold, a checkbox that change if edges width relates to the edge value
 * and a legend that also allows the user to hide nodes that meet some attribute values.
 * @author Marco Expósito Pérez
 */
//Namespaces
import { networkHTML } from "./constants/networkHTML.js";
//Local classes
import Legend from "./controlPanelComponents/legend.js";
import ThresholdSlider from "./controlPanelComponents/thresholdSlider.js";
import VariableEdgeCheckbox from "./controlPanelComponents/variableEdgeCheckbox.js";

export default class ControlPanel {

    /**
     * Constructor of the class
     * @param {NetworksGroup} networksGroup group of networks that will be controled by this panel
     */
    constructor(networksGroup) {
        this.isActive = false;
        this.networkManager = networksGroup;
    }

    /**
     * Creates the controlPanel if its not currently active
     */
    createControlPanel() {
        if (this.isActive)
            return;
        this.isActive = true;

    
        this.container = document.createElement("div");
        this.container.className = "middle";
        document.getElementById(networkHTML.controlPanelParentContainer).appendChild(this.container);

        const inputTitle = document.createElement("h5");
        inputTitle.innerHTML = "Control Panel";
        this.container.appendChild(inputTitle);

        new ThresholdSlider(this.container, this.networkManager);
        new VariableEdgeCheckbox(this.container, this.networkManager);
        new Legend(this.container, this.networkManager);

        this.container.append(document.createElement("br"));
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