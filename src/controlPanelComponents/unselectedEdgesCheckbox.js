/**
 * @fileoverview This class creates a checkbox that hides all edges except when they are selected
 * @author Marco Expósito Pérez
 */

//Namespaces
import { networkHTML } from "../constants/networkHTML";

export default class UnselectedEdgesCheckbox {

    /**
     * Constructor of the class
     * @param {HTMLElement} container html container where the checbox will be appended
     * @param {NetworksGroup} networksGroup  group of all networks that will see their edges altered by the checbox
     */
    constructor(container, networkGroup) {
        this.domParser = new DOMParser();
        this.networksGroups = networkGroup;

        this.checkboxId = "unselectedEdgesCheckbox";

        const htmlString = this.unselectedEdgesTemplate();
        const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;
        container.append(html);

        this.checked = networkHTML.unselectedEdgesInitialValue;

        this.addCheckboxOnchange();
    }

    /**
     * Function that returns a html string with the checkbox
     * @returns {String} returns the html string
     */
    unselectedEdgesTemplate() {
        let checked = "";
        if (networkHTML.unselectedEdgesInitialValue)
            checked = `checked="true"`;

        let html = `
        <div> 
            <span> Hide edges not selected: </span>
            <input type="checkbox" ${checked} id="${this.checkboxId}"></input>
        </div>`;
        return html;
    }

    /**
     * Add onchange function to the checkbox
     */
    addCheckboxOnchange() {
        const checkbox = document.getElementById(this.checkboxId);

        checkbox.onchange = () => this.unselectedEdgeChange(checkbox);
    }

    /** 
     *  Update all networks with the new variableEdgeWidth value
     */
    unselectedEdgeChange(checkBox) {
        this.checked = checkBox.checked;

        this.networksGroups.hideUnselectedEdgesALL(checkBox.checked);
    }


    /**
     * Returns the current state of the checkbox
     * @returns {Boolean} current state of the checkbox
     */
     getChecked(){
        return this.checked;
    }
}