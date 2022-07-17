import { Popover } from "bootstrap";
import { option } from "vis-util/esnext";
import { networkHTML } from "../../constants/networkHTML";
import { nodes } from "../../constants/nodes";

export default class LegendItem {

    /**
     * Constructor of the class
     */
    constructor(toolbar) {
        this.toolbar = toolbar;

        this.popover = null;

        addEventListener('networkNumberChange', () => this.networkNumberChange(), false);

        this.htmlString = `
        <li class="nav-item dropdown">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button id="TestingButton" class="accordion-button unselectable collapsed disabled">
                        Legend
                    </button>
                </h2>
            </div>
    
        </li>`;
    }

    networkNumberChange() {
        const nNetworks = this.toolbar.networksGroup.getNnetworks();

        if (nNetworks === 0) {
            this.button.className = "accordion-button unselectable collapsed disabled";
            if (this.popover !== null) {
                this.popover.hide();
                this.popover = null;
            }
        } else {
            if (this.button.className === "accordion-button unselectable collapsed disabled") {
                this.button.className = "accordion-button unselectable collapsed";
            }

            if (this.popover === null) {
                this.createLegendPopover()
            }

        }
    }

    /**
     * Create the events related with the Legend
     */
    createEvents() {
        this.button = document.getElementById("TestingButton");
        this.button.onclick = () => this.legendOnclick();
    }

    createLegendPopover() {
        const attributes = this.toolbar.networksGroup.getVisualizationAttributes();

        const allowList = Popover.Default.allowList;
        allowList.button = [];
        allowList['*'].push("style");
        allowList['*'].push("name");

        const title = "";
        const content = this.tooltipContent(attributes);
        const html = this.tooltipTemplate(attributes);

        const options = {
            trigger: "manual",
            placement: "bottom",
            container: document.body,
            template: html,
            content: content,
            title: title,
            fallbackPlacements: ["bottom"],
            offset: [0, 8],
            allowList: allowList,
            html: true,
        };
        this.popover = new Popover(this.button, options);

        this.popover.show();
        const legendOptions = document.querySelectorAll("button[name='legendOption']");
        this.popover.hide();

        this.createSubButtonsOnclick(legendOptions);
    }

    createSubButtonsOnclick(legendOptions){
        
        for(const option of legendOptions){
            option.onclick = () => this.subButtonOnclick(option);
        }
    }

    subButtonOnclick(option){
        const idSanitized = (option.id).substring("legendButton".length);
        const id = idSanitized.split("_");

        const btnClass = option.className;
        const isActive = btnClass.slice(btnClass.length - 6);

        if (isActive !== "active") {
            option.className = `${networkHTML.legendButtonClass} active`; 
            
            this.filterValuesToHide.push(`${id[0]}_${id[1]}`);
        } else {
            option.className = networkHTML.legendButtonClass;

            const index = this.filterValuesToHide.indexOf(`${id[0]}_${id[1]}`);
            if (index === -1) {
                console.log("Legend error, value to remove not found in the values to hide list")
                return;

            } else {
                this.filterValuesToHide.splice(index, 1);
            }
        }

        this.toolbar.networksGroup.updateFilterActivesALL(this.filterValuesToHide);
    }

    legendOnclick() {
        if (this.popover !== null) {

            if (this.button.className === "accordion-button unselectable collapsed") {
                this.button.className = "accordion-button unselectable";
            } else {
                this.button.className = "accordion-button unselectable collapsed"
            }

            this.popover.toggle();
        }
    }

    tooltipContent(attributes) {
        this.filterValuesToHide = new Array();

        let legendTable = "";
        for (let i = 0; i < attributes.length; i++) {
            const buttonsDiv = this.legendAttributeButtons(attributes[i].attr, attributes[i].vals, attributes[i].dimension);

            const htmlString = `
            <div class="col ${attributes[i].dimension} ${i !== attributes.length - 1 ? "border-end border-dark" : ""}">
                <h5 class="Legend-subTittle border-bottom border-dark text-center"> ${this.decorateString(attributes[i].attr, networkHTML.legendColumnsMaxTitleChars)} </h5>
                ${buttonsDiv}
            </div>`;

            legendTable += htmlString;
        }

        let topBody = `
        <div class="row">
            ${legendTable}
        </div>`;

        return topBody;

    }

    /**
     * Function that returns a html string based on a template and the parameters of the function
     * @param {String} key key linked to the button.
     * @param {String[]} values String Array with the values of the buttons 
     * @param {String} dimension Name of the dimension that all these buttons will change
     * @returns {String} returns a string with the html of the buttons
     */
    legendAttributeButtons(key, values, dimension) {
        let buttonHTML = "";

        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            if (value == "") value = "\"\"";

            value = this.decorateString(value, networkHTML.legendColumnsMaxSubChars);

            const rightCol = this.getCommunityValueIndicator(dimension, i);

            buttonHTML += `
            <button type="button" class="${networkHTML.legendButtonClass}" name="legendOption" id="legendButton${key}_${values[i]}">
                <div class="container legend">
                    <div class="row">
                        <div class="col-9">    
                            ${value}
                        </div>
                        <div class="col-3 dimension">    
                            ${rightCol}
                        </div>
                    </div>
                </div>
            </button>`;
        }

        const output = `
        <div class="legendButtonContainer" id="legendButtonContainer ${dimension}">
            ${buttonHTML}
        </div>`;

        return output;
    }

    /**
     * Function that returns a html string that allow the user to understand what node visual characteristic will
     * be toggled when clicking a legend button
     * @param {String} dimension Dimension that is going to be altered
     * @param {Integer} valueIndex Index that decide the type of the characteristic once we know the dimension
     * @returns {String} returns a string with the html of the community value
     */
    getCommunityValueIndicator(dimension, valueIndex) {
        let output = document.createElement("div");

        switch (dimension) {
            case nodes.nodeColorKey:
                output.className = "LegendColor box";
                output.style.backgroundColor = nodes.NodeAttr.getColor(valueIndex);
                break;

            case nodes.nodeShapeKey:
                nodes.getShapehtml(output, valueIndex)
                break;

            case nodes.nodeBorderKey:
                output.className = "LegendBorder box";
                output.style.borderColor = nodes.NodeAttr.getBorder(valueIndex);
                output.style.borderWidth = "4px";
                break;
        }

        return output.outerHTML;
    }


    /**
     * Returns the tooltip html template
     * @returns {String} returns a string with the template
     */
    tooltipTemplate(attributes) {

        const html = `
        <div class="popover legend" role="tooltip" style="min-width:${networkHTML.legendColumnsWidth * attributes.length}px;">  
            <div class="popover-body legend" id="PopoverLegend"></div>
        </div>`;

        return html;
    }


    setConfiguration(config) {


    }

    decorateString(string, maxLength) {
        if (string !== string.toUpperCase()) {
            const notCamelCaseString = string.replace(/([A-Z])/g, " $1");
            string = notCamelCaseString.charAt(0).toUpperCase() + notCamelCaseString.slice(1);
        }
        return this.trimString(string, maxLength);
    }

    trimString(string, length) {
        if (string.length > length) {
            return string.substring(0, length)
        } else {
            return string;
        }
    }
}