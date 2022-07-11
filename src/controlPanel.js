/**
 * @fileoverview This class creates a single control panel for all networks. The control panel is made of a slider
 * that updates the minimum edge value threshold, a checkbox that change if edges width relates to the edge value
 * and a legend that also allows the user to hide nodes that meet some attribute values.
 * @author Marco Expósito Pérez
 */
//Namespaces
import { networkHTML } from "./constants/networkHTML.js";
import AllowThirdDimensionCheckbox from "./controlPanelComponents/allowThirdDimensionCheckbox.js";
//Local classes
import Legend from "./controlPanelComponents/legend.js";
import ThresholdSlider from "./controlPanelComponents/thresholdSlider.js";
import UnselectedEdgesCheckbox from "./controlPanelComponents/unselectedEdgesCheckbox.js";
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

        this.thresholdSlider = new ThresholdSlider(this.container, this.networkManager);
        this.variableEdge = new VariableEdgeCheckbox(this.container, this.networkManager);
        this.unselectedEdges = new UnselectedEdgesCheckbox(this.container, this.networkManager);
        this.allowThirdDimension = new AllowThirdDimensionCheckbox(this.container, this.networkManager);

        this.legend = new Legend(this.container, this.networkManager);
        this.allowThirdDimension.setLegend(this.legend)
        

        //this.container.append(document.createElement("br"));
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

    /**
     * Returns the current value of the threshold Slider
     * @returns {Float} returns the value of the slider
     */
    getSliderThreshold() {
        if (!this.isActive)
            return networkHTML.sliderThresholdInitialValue;
        else {
            return this.thresholdSlider.getThreshold();
        }
    }

    /**
     * Returns the current state of the variable Edge checkbox
     * @returns {Boolean} current state of the checkbox
     */
    getVariableEdgeValue() {
        if (!this.isActive)
            return networkHTML.variableEdgeInitialValue;
        else {
            return this.variableEdge.getChecked();
        }
    }

    /**
     * Returns the current state of the unselected Edges checkbox
     * @returns {Boolean} current state of the checkbox
     */
    getUnselectedEdgesValue() {
        if (!this.isActive)
            return networkHTML.unselectedEdgesInitialValue;
        else {
            return this.unselectedEdges.getChecked();
        }
    }

    /**
     * Returns the values to hide in a network based on the legend input
     * @returns {String[]} values to hide
     */
    getValuesToHide() {
        if (!this.isActive)
            return [];
        else {
            return this.legend.filterValuesToHide;
        }
    }

    /**
     * Returns the current state of the allowThirdDimension checkbox
     * @returns {Boolean} current state of the checkbox
     */
    getThirdDimensionValue(){
        if (!this.isActive)
            return networkHTML.thirdDimensionInitialValue;
        else {
            return this.allowThirdDimension.getChecked();
        }
    }
}   