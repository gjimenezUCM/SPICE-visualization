/*
THIS FILE IS NOT FINAL. THE UI IS GOING TO BE REWORKED IN A SINGLE NAV BAR. THATS WHY ITS MOSTLY A DIRECT COPY OF "changeNodeLabelVisibilityCheckbox.js"
*/

//Namespaces
import { networkHTML } from "../constants/networkHTML";
import HorizontalLayout from "../layouts/horizontalLayout";
import VerticalLayout from "../layouts/verticalLayout";

export default class layoutChange {

    /**
     * Constructor of the class
     * @param {HTMLElement} container html container where the checkbox will be appended
     * @param {NetworksGroup} networksGroup  group of all networks that will see their edges altered by the checkbox
     */
    constructor(container, initialOptions, networksGroup) {
        this.domParser = new DOMParser();
        this.networkManager = networksGroup;
        this.initialOptions = initialOptions;

        this.checked = networkHTML.showNodeLabelInitialValue;
        this.checkboxId = "layoutChange";

        const htmlString = this.nodeVisibilityTemplate();
        const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;
        container.append(html);

        
        
        this.addCheckboxOnchange();
    }

    /**
     * Function that returns a html string with the checkbox
     * @returns {String} returns the html string
     */
    nodeVisibilityTemplate() {
        let html = `
        <div> 
            <label class="unselectable" for="${this.checkboxId}"> Activate Horizontal Layout:  </label>
            <input type="checkbox" ${this.checked ? 'checked="true"' : ""} id="${this.checkboxId}"></input>
        </div>`;
        return html;
    }

    /**
     * Add onchange function to the checkbox
     */
    addCheckboxOnchange() {
        const checkbox = document.getElementById(this.checkboxId);

        checkbox.onchange = () => this.nodeLabelChange(checkbox);
    }

    /** 
     *  Update all networks with the new nodeLabelVisbility value
     */
    nodeLabelChange(checkBox) {
        this.checked = checkBox.checked;

        this.initialOptions.restartInitialOptions();
        
        if(this.initialOptions.layout === 0)
        {
            this.initialOptions.layout = 1;
            this.initialOptions.layoutManager = new HorizontalLayout(this.networkManager);
        }else{
            this.initialOptions.layout = 0;
            this.initialOptions.layoutManager = new VerticalLayout(this.networkManager);
        }
    }

    /**
     * Returns the current state of the checkbox
     * @returns {Boolean} current state of the checkbox
     */
    getChecked(){
        return this.checked;
    }
}