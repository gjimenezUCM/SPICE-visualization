/**
 * @fileoverview This class creates a checkbox that hides all edges except when they are selected
 * @author Marco Expósito Pérez
 */

//Namespaces
import { networkHTML } from "../constants/networkHTML";

export default class AllowThirdDimensionCheckbox {

    /**
     * Constructor of the class
     * @param {HTMLElement} container html container where the checbox will be appended
     * @param {NetworksGroup} networksGroup  group of all networks that will see their edges altered by the checbox
     */
    constructor(container, networkGroup) {
        this.domParser = new DOMParser();
        this.networksGroups = networkGroup;

        this.checkboxId = "allowThirdDimensionCheckbox";

        const htmlString = this.allowThirdDimensionTemplate();
        const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;
        container.append(html);

        this.checked = networkHTML.thirdDimensionInitialValue;

        this.addCheckboxOnchange();
    }

    /**
     * Function that returns a html string with the checkbox
     * @returns {String} returns the html string
     */
    allowThirdDimensionTemplate() {
        let checked = "";
        if (networkHTML.thirdDimensionInitialValue)
            checked = `checked="true"`;

        let html = `
        <div> 
            <label class="unselectable" for="${this.checkboxId}"> Allow third dimension: </label>
            <input type="checkbox" ${checked} id="${this.checkboxId}"></input>
        </div>`;
        return html;
    }

    /**
     * Add onchange function to the checkbox
     */
    addCheckboxOnchange() {
        const checkbox = document.getElementById(this.checkboxId);

        checkbox.onchange = () => this.allowThirdDimensionChange(checkbox);
    }

    /** 
     *  Update all networks with the new variableEdgeWidth value
     */
    allowThirdDimensionChange(checkBox) {
        this.checked = checkBox.checked;
        this.networksGroups.changeThirdDimensionALL(checkBox.checked);
        this.legend.restartLegend();
    }


    /**
     * Returns the current state of the checkbox
     * @returns {Boolean} current state of the checkbox
     */
     getChecked(){
        return this.checked;
    }

    setLegend(legend){
        this.legend = legend;
    }
}