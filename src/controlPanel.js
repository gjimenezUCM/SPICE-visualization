import { networkHTML } from "./namespaces/networkHTML";
import { Collapse } from 'bootstrap';
import { comms } from "./namespaces/communities.js";

import Utils from "./Utils";

export default class ControlPanel {

    constructor(networkManager) {
        this.isActive = false;
        this.networkManager = networkManager;

        this.filterValuesToHide = new Array();
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

        this.container.appendChild(inputTitle);
        this.container.appendChild(sliderContainer);
        this.container.appendChild(checkboxContainer);

        document.getElementById(networkHTML.controlPanelParentContainer).appendChild(this.container);

        //TODO. User should be able to choose what communities want to represent visualy
        this.filteredCommunities = new Array();
        for (let i = 0; i < communities.filterSize; i++) {
            this.filteredCommunities.push(communities.data[i]);
        }
        this.networkManager.selectCommunitiesALL(this.filteredCommunities);

        const filter = this.networkManager.getSelectedCommunities();

        const legendContainer = this.createLegendContainer(filter);
        this.container.appendChild(legendContainer);
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


    createLegendContainer(filter) {
        const innerAcoordionArray = [];
        for (let i = 0; i < filter.length; i++) {
            const div = this.createLegendButtons(filter[i].values, i);
            const innerAcord = this.createAcordion(filter[i].key, filter[i].key, [div]);

            innerAcoordionArray.push(innerAcord);
        }

        let acoordion = this.createAcordion("topId", "Legend", innerAcoordionArray, true);

        return acoordion;
    }


    createLegendButtons(values, n) {
        const container = document.createElement("div");

        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            if (value == "") value = "\"\"";

            const topRow = document.createElement("div");
            topRow.className = "row align-items-left"
            container.append(topRow);

            const newButton = document.createElement("Button");
            newButton.className = networkHTML.legendButtonClass + " active";
            newButton.onclick = () => this.legendButtonClick(values[i], newButton);
            topRow.append(newButton);

            const rowContainer = document.createElement("div");
            rowContainer.className = "row align-items-center"
            newButton.append(rowContainer)

            const leftContainer = document.createElement("div");
            leftContainer.className = "col value";
            leftContainer.innerText = value;
            rowContainer.append(leftContainer);

            const rightContainer = document.createElement("div");
            rightContainer.className = "col";
            this.getCommunityValueIndicator(rightContainer, n, i);
            rowContainer.append(rightContainer);
        }

        return container;
    }

    createAcordion(id, buttonName, collapsable, topClass = false) {
        const topAcordion = document.createElement("div");
        topAcordion.className = "accordion";

        if (topClass)
            topAcordion.className = "top " + topAcordion.className;

        const topItem = document.createElement("div");
        topItem.className = "accordion-item";
        topAcordion.append(topItem);

        const topHeader = document.createElement("h2");
        topHeader.className = "accordion-header";
        topItem.append(topHeader);

        const topButton = document.createElement("button");
        topButton.className = "accordion-button collapsed";
        topButton.type = "button";
        topButton.innerText = buttonName;
        topButton.setAttribute("data-bs-toggle", "collapse");
        topButton.setAttribute("data-bs-target", "#" + id);

        topHeader.append(topButton);

        const colOne = document.createElement("div");
        colOne.className = "accordion-collapse collapse";
        colOne.id = id;
        topItem.append(colOne);

        const colOneBody = document.createElement("div");
        colOneBody.className = "accordion-body";
        colOne.append(colOneBody);


        for (let i = 0; i < collapsable.length; i++) {
            colOneBody.append(collapsable[i]);
        }

        new Collapse(colOne, { toggle: false });
        colOne.addEventListener("show.bs.collapse", (event) => {

            if (event.target.id === id)
                topButton.className = "accordion-button";
        });
        colOne.addEventListener("hide.bs.collapse", (event) => {
            if (event.target.id === id)
                topButton.className = "accordion-button collapsed";
        });


        return topAcordion;

    }

    getCommunityValueIndicator(container, filterPosition, valueIndex) {
        let output = document.createElement("div");

        switch (filterPosition) {
            case 0:
                output.className = "box";
                output.style.backgroundColor = comms.NodeAttr.getColor(valueIndex);
                break;

            case 1:
                comms.getShapehtml(output, valueIndex)
                break;
        }

        container.append(output);
    }

    legendButtonClick(value, button) {
        const btnClass = button.className;
        const isActive = btnClass.slice(btnClass.length - 6);
        
        if(isActive === "active"){
            button.className = networkHTML.legendButtonClass;

            this.filterValuesToHide.push(value);
        }else{
            button.className = networkHTML.legendButtonClass + "  active";

            const index = this.filterValuesToHide.indexOf(value);
            if(index === -1){
                this.legendButtonClick(value, button);
                return;

            }else{
                this.filterValuesToHide.splice(index, 1);
            }
        }

        this.networkManager.updateFilterActivesALL(this.filterValuesToHide);
       
    }
}   