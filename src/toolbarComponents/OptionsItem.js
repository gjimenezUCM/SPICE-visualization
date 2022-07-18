/**
 * @fileoverview This class creates a dropdown Menu that allows the user to edit some options about the networks.
 * User can: hide/show node labels, hide all edges unless a node is selected, change edge width based
 * on their similarity, add a third dimension to node visuals
 * @package Requires bootstrap package to be able to use the dropdown. 
 * @author Marco Expósito Pérez
 */

//Namespace
import { networkHTML } from "../constants/networkHTML.js";

export default class OptionsItem {

    /**
     * Constructor of the class
     * @param {ToolBar} toolbar toolbar owner of this item
     */
    constructor(toolbar) {
        this.toolbar = toolbar;

        const hideNodeState = !networkHTML.showNodeLabelInitialValue ? " active" : "";
        this.hideNodeValue = !networkHTML.showNodeLabelInitialValue;

        const hideUnselectedEdgesState = networkHTML.unselectedEdgesInitialValue ? " active" : "";
        this.hideUnselectedEdgesValue = networkHTML.unselectedEdgesInitialValue;

        const variableEdgeWidthState = networkHTML.variableEdgeInitialValue ? " active" : "";
        this.variableEdgeWidthValue = networkHTML.variableEdgeInitialValue;

        const thirdDimensionState = networkHTML.thirdDimensionInitialValue ? " active" : "";
        this.thirdDimensionValue = networkHTML.thirdDimensionInitialValue;

        const sliderValue = networkHTML.sliderThresholdInitialValue;
        this.sliderValue = sliderValue;

        this.htmlString = `                    
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle unselectable" data-bs-auto-close="outside" id="navbarDropdownOptionsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Options
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdownOptionsDropdown">
                <li><a class="dropdown-item unselectable${hideNodeState}" id="hideNodeLabels">Hide node labels</a></li>
                <li><a class="dropdown-item unselectable${hideUnselectedEdgesState}" id="hideUnselectedEdges">Hide unselected Edges</a></li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <div style="margin-left: 13px">          
                        Minimum Similarity:
                        <span class="unselectable" id="thresholdValue"> ${sliderValue} </span>
                    </div>
                    <div style="margin-left: 30px"> 
                        <input type="range" min="0.0" max="1.0" step="0.1" value="${sliderValue}" id="thresholdSlider"></input>
                    </div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item unselectable${variableEdgeWidthState}" id="variableEdgeWidth">Variable edge width</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item unselectable${thirdDimensionState}" id="thirdDimension">Third dimension</a></li>
            </ul>
        </li>`;
    }

    /**
     * Create the events related with the Options dropdown
     */
    createEvents() {
        const hideNodeLabels = document.getElementById("hideNodeLabels");
        hideNodeLabels.onclick = () => this.toggleNodeLabels(hideNodeLabels);

        const hideUnselectedEdges = document.getElementById("hideUnselectedEdges");
        hideUnselectedEdges.onclick = () => this.toggleUnselectedEdges(hideUnselectedEdges);

        const variableEdgeWidth = document.getElementById("variableEdgeWidth");
        variableEdgeWidth.onclick = () => this.toggleVariableEdgeWidth(variableEdgeWidth);

        const thirdDimension = document.getElementById("thirdDimension");
        thirdDimension.onclick = () => this.toggleThirdDimension(thirdDimension);

        const thresholdValue = document.getElementById("thresholdValue");
        const thresholdSlider = document.getElementById("thresholdSlider");
        thresholdSlider.onchange = () => this.thresholdChange(thresholdSlider.value);
        thresholdSlider.oninput = () => this.updateSliderText(thresholdSlider.value, thresholdValue);
    }

    /**
     * Function executed when hideNodeLabels option is clicked. Toggle node labels visibility
     * @param {HTMLElement} button button clicked
     */
    toggleNodeLabels(button) {
        const active = !this.toolbar.toggleDropdownItemState(button);
        this.hideNodeValue = active;
        console.log(`toggle node labels ${active}`);
        
        this.toolbar.networksGroup.nodeLabelVisibilityChangeALL(active);    
    }

    /**
     * Function executed when hideUnselectedEdges option is clicked. Toggle the visibility of the unselected edges
     * @param {HTMLElement} button button clicked
     */
    toggleUnselectedEdges(button) {
        const active = this.toolbar.toggleDropdownItemState(button);
        this.hideUnselectedEdgesValue = active;
        console.log(`toggle unselected edges ${active}`);

        this.toolbar.networksGroup.hideUnselectedEdgesALL(active);   
    }

    /**
     * Function executed when variableEdgeWidth option is clicked. Toggle the edges's options to change the width based on their similarity
     * @param {HTMLElement} button button clicked
     */
    toggleVariableEdgeWidth(button) {
        const active = this.toolbar.toggleDropdownItemState(button);
        this.variableEdgeWidthValue = active;
        console.log(`toggle variableEdgeWidth ${active}`);
       
        this.toolbar.networksGroup.variableEdgeChangeALL(active);
    }

    /**
     * Function executed when thirdDimension option is clicked. Toggle the node's thirdDimension to change the border color based on their 3rd explicit community value
     * @param {HTMLElement} button button clicked
     */
    toggleThirdDimension(button) {
        const active = this.toolbar.toggleDropdownItemState(button);
        this.thirdDimensionValue = active;
        console.log(`toggle thirdDimension ${active}`);

        this.toolbar.networksGroup.changeThirdDimensionALL(active);

        this.toolbar.legendItem.restart()
        this.toolbar.legendItem.networkNumberChange();
    }

    /**
     * Update all networks with the slider value
     * @param {Integer} value value of the slider
     */
    thresholdChange(value) {
        this.sliderValue = value;
        console.log(`treshold change ${value}`);
        
        this.toolbar.networksGroup.thresholdChangeALL(value);
    }

    /**
     * Update the slider text to show the new values
     * @param {Integer} value value to update to
     * @param {HTMLElement} text text to be updated
     */
    updateSliderText(value, text) {
        if (value === "0")
            value = "0.0";
        else if (value === "1")
            value = "1.0";

        text.innerHTML = value;
    }

    /**
     * Setup the config file
     * @param {Object} config network configuration file 
     */
    setConfiguration(config){
        config["edgeThreshold"] = this.sliderValue;
        config["variableEdge"] = this.variableEdgeWidthValue;
        config["hideUnselected"] = this.hideUnselectedEdgesValue;
        config["allowThirdDimension"] = this.thirdDimensionValue;
        config["showNodeLabels"] = this.hideNodeValue;
    }

}