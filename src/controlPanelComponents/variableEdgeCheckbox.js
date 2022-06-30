/**
 * @fileoverview This class creates a checkbox that changes the edges width to relate with the similarity value
 * @author Marco Expósito Pérez
 */

//Namespaces
import { networkHTML } from "../constants/networkHTML";

export default class VariableEdgeCheckbox {

    /**
     * Constructor of the class
     * @param {HTMLElement} container html container where the checkbox will be appended
     * @param {NetworksGroup} networksGroup  group of all networks that will see their edges altered by the checkbox
     */
    constructor(container, networkGroup) {
        this.domParser = new DOMParser();
        this.networksGroups = networkGroup;

        this.checkboxId = "variableEdgeCheckbox";

        const htmlString = this.variableEdgeTemplate();
        const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;
        container.append(html);

        this.checked = networkHTML.variableEdgeInitialValue;

        this.addCheckboxOnchange();
    }

    /**
     * Function that returns a html string with the checkbox
     * @returns {String} returns the html string
     */
    variableEdgeTemplate() {
        let checked = "";
        if (networkHTML.variableEdgeInitialValue)
            checked = `checked="true"`;

        let html = `
        <div> 
            <label class="unselectable" for="${this.checkboxId}"> Variable edge width:  </label>
            <input type="checkbox" ${checked} id="${this.checkboxId}"></input>
        </div>`;
        return html;
    }

    /**
     * Add onchange function to the checkbox
     */
    addCheckboxOnchange() {
        const checkbox = document.getElementById(this.checkboxId);

        checkbox.onchange = () => this.variableEdgeChange(checkbox);
    }

    /** 
     *  Update all networks with the new variableEdgeWidth value
     */
    variableEdgeChange(checkBox) {
        this.checked = checkBox.checked;

        this.networksGroups.variableEdgeChangeALL(checkBox.checked);
    }

    /**
     * Returns the current state of the checkbox
     * @returns {Boolean} current state of the checkbox
     */
    getChecked(){
        return this.checked;
    }
}