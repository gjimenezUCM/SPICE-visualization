/**
 * @fileoverview This Class creates a single control panel for all networks. It also manages the user input
 * to update networks acordingly
 * @package It requires bootstrap to be able to create Collapses.
 * @package It requires bootstrap to be able to create Dropdowns.
 * @author Marco Expósito Pérez
 */
//Namespaces
import { networkHTML } from "./namespaces/networkHTML.js";
import { comms } from "./namespaces/communities.js";
//Packages
import { Collapse } from 'bootstrap';
import { Dropdown } from 'bootstrap';

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
        this.legendContainer = null;
    }

    /**
     * Creates the controlPanel if its not currently active
     */
    createControlPanel() {
        if (this.isActive)
            return;
        this.isActive = true;

        const communities = this.networkManager.getExplicitCommunities();

        //Create the control panel
        this.container = document.createElement("div");
        this.container.className = "middle";

        const inputTitle = document.createElement("h5");
        inputTitle.innerHTML = "Control Panel";

        const sliderContainer = this.createThresholdSliderContainer();
        const checkboxContainer = this.createVariableEdgeCheckBoxContainer();
        const filterChooser = this.createFilterChooser();

        this.container.appendChild(inputTitle);
        this.container.appendChild(sliderContainer);
        this.container.appendChild(checkboxContainer);
        this.container.appendChild(filterChooser);

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

    createFilterChooser() {
        const communities = this.networkManager.getExplicitCommunities();

        this.filteredCommunities = new Array();
        this.maxFilterSize = 2;//communities.filterSize;

        const n = communities.data.length;

        //Create dropdown skeleton
        const topContainer = document.createElement("div");
        topContainer.className = "dropdown";

        const mainButton = document.createElement("button");
        mainButton.innerText = "Select Filter";
        mainButton.className = "btn btn-secondary dropdown-toggle";

        mainButton.setAttribute("data-bs-toggle", "dropdown");
        mainButton.setAttribute("aria-expanded", "false");
        //Dropdown closes by clicking outside it
        mainButton.setAttribute("data-bs-auto-close", "outside");
        topContainer.append(mainButton);

        const optionsContainer = document.createElement("ul");
        optionsContainer.className = "dropdown-menu dropdown-menu-dark";

        topContainer.append(optionsContainer);

        //Fill the dropdown with the files
        for (let i = 0; i < n; i++) {

            const key = communities.data[i].key;
            const newFileContainer = document.createElement('li');

            const newFileButton = document.createElement('a');
            newFileButton.className = "dropdown-item";
            newFileButton.innerHTML = key;
            newFileButton.style.userSelect = "none";
            newFileButton.onclick = () => this.chooseFilterClick(newFileButton, key);

            this.filterToDropdown.set(key, newFileButton);
            newFileContainer.appendChild(newFileButton);
            optionsContainer.appendChild(newFileContainer);
        }

        const options = {}
        new Dropdown(mainButton, options);

        return topContainer;
    }

    chooseFilterClick(button, key) {
        const index = this.filteredCommunities.indexOf(key);

        if (index !== -1) {
            this.filteredCommunities.splice(index, 1);
            button.className = "dropdown-item";

        } else {

            if (this.filteredCommunities.length === this.maxFilterSize) {

                const first = this.filteredCommunities[0];
                this.filterToDropdown.get(first).className = "dropdown-item";
                this.filteredCommunities.splice(0, 1);

            }
            this.filteredCommunities.push(key);
            button.className = "dropdown-item active";
        }

        this.updateHiddenCommunities();
    }

    updateHiddenCommunities() {
        if (this.legendContainer !== null) {
            this.container.removeChild(this.legendContainer);
            this.legendContainer = null;
        }

        this.createLegend();
    }

    createLegend() {
        this.networkManager.selectCommunitiesALL(this.filteredCommunities);

        const filter = this.networkManager.getSelectedCommunities();

        if (this.filteredCommunities.length > 0) {
            this.legendContainer = this.createLegendContainer(filter);
            this.container.appendChild(this.legendContainer);
        }
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
     * Create a container with the legend. Legend rows also allow to filter the attributes of the 
     * explicit communities
     * @param {Object} filter Object with the format of {key: (string), values: (String[])}
     * @returns {HTMLElement} returns the container with the legend/filter
     */
    createLegendContainer(filter) {
        const innerAcoordionArray = [];
        for (let i = 0; i < filter.length; i++) {
            const div = this.createFilterButtons(filter[i].values, i);
            const innerAcord = this.createAccordion(filter[i].key, filter[i].key, [div]);

            innerAcoordionArray.push(innerAcord);
        }

        let acoordion = this.createAccordion("topId", "Legend", innerAcoordionArray, true);

        return acoordion;
    }

    /**
     * Create all buttons that will filter the network for a community's values
     * @param {String[]} values each value will create a new button
     * @param {Integer} n Order of the community in the filter
     * @returns {HTMLElement} returns the container with all buttons
     */
    createFilterButtons(values, n) {
        const container = document.createElement("div");

        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            if (value == "") value = "\"\"";

            const topRow = document.createElement("div");
            topRow.className = "row align-items-left"
            container.append(topRow);

            const newButton = document.createElement("Button");
            newButton.className = networkHTML.legendButtonClass + " active";
            newButton.onclick = () => this.filterButtonClick(values[i], newButton);
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

    /**
     * Create a accordion using bootstrap collapse class
     * @param {String} id id of the accordion. All acordions with the same id will be closed 
     * and opened at the same time 
     * @param {String} buttonName Inner text of the accordion button
     * @param {HTMLElement[]} collapsable Array of html elements to be collapsed inside this accordion
     * @param {Boolean} topAccord Indicates if its the top accordion in a nested structure
     * @returns {HTMLElement} returns a container with the accordion
     */
    createAccordion(id, buttonName, collapsable, topAccord = false) {
        const topAccordion = document.createElement("div");
        topAccordion.className = "accordion";

        if (topAccord)
            topAccordion.className = "top " + topAccordion.className;

        const topItem = document.createElement("div");
        topItem.className = "accordion-item";
        topAccordion.append(topItem);

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


        return topAccordion;

    }

    /**
     * Updates a container with the value visualized in some way. For example, Colors are visualized in 
     * a square whose background is the color
     * @param {HTMLElement} container container to be edited
     * @param {Integer} filterPosition order in the filter
     * @param {Integer} valueIndex order within the community values
     */
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

    /**
     * Function executed when a filter/legend button is clicked
     * @param {String} value value linked with the button
     * @param {HTMLElement} button button 
     */
    filterButtonClick(value, button) {
        const btnClass = button.className;
        const isActive = btnClass.slice(btnClass.length - 6);

        if (isActive === "active") {
            button.className = networkHTML.legendButtonClass;

            this.filterValuesToHide.push(value);
        } else {
            button.className = networkHTML.legendButtonClass + "  active";

            const index = this.filterValuesToHide.indexOf(value);
            if (index === -1) {
                this.filterButtonClick(value, button);
                return;

            } else {
                this.filterValuesToHide.splice(index, 1);
            }
        }

        this.networkManager.updateFilterActivesALL(this.filterValuesToHide);

    }
}   