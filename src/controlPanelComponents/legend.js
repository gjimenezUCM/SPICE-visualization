/**
 * @fileoverview This class creates an interactuable legend that allows the user to see whats the relation
 * between node visuals and the explicit community values. Clicking in the legend also allows to hide all nodes
 * that contain the values clicked.
 * @package It requires bootstrap to be able to use the accordion.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { networkHTML } from "../constants/networkHTML";
import { nodes } from "../constants/nodes";

export default class Legend {

    /**
     * Constructor of the class
     * @param {HTMLElement} container html container where the legend will be appended
     * @param {NetworksGroup} networksGroup  group of all networks that will see their nodes filtered by the legend
     */
    constructor(container, networksGroup) {
        this.domParser = new DOMParser();
        this.networksGroup = networksGroup;
        this.container = container;

        this.initLegend();
    }

    /**
     * Create a container with the legend. 
     * @param {Object} attributes Object with the attributes that change visualization
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     * @param {HTMLElement} container Container where the legend will be placed
     */
    createLegendContainer(attributes, container) {
        let legendTable = "";

        for (let i = 0; i < attributes.length; i++) {
            const buttonsDiv = this.filterButtonsTemplate(attributes[i].attr, attributes[i].vals, attributes[i].dimension);

            const htmlString = `
            <div class="col ${attributes[i].dimension} ${i !== attributes.length - 1 ? "border-end border-dark" : ""}">
                <h5 class="Legend-subTittle border-bottom border-dark"> ${attributes[i].attr} </h5>
                ${buttonsDiv}
            </div>`;
            
            legendTable += htmlString;
        }

        let topBody = `
        <div class="row">
            ${legendTable}
        </div>`;

        const topAcoordion = this.accordionTemplate("top", "Legend", topBody);

        const html = this.domParser.parseFromString(topAcoordion, "text/html").body.firstChild;
        container.append(html);

        const topHTML = document.getElementById(`accordiontop`);
        topHTML.style.maxWidth = `${15 * attributes.length}%`;
    }

    /**
     * Function that returns a html string based on a template and the parameters of the function
     * @param {String} key key linked to the button.
     * @param {String[]} values String Array with the values of the buttons 
     * @param {String} dimension Name of the dimension that all these buttons will change
     * @returns {String} returns a string with the html of the buttons
     */
    filterButtonsTemplate(key, values, dimension) {
        let buttonHTML = "";

        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            if (value == "") value = "\"\"";

            const rightCol = this.getCommunityValueIndicator(dimension, i);

            buttonHTML += `
            <button type="button" class="${networkHTML.legendButtonClass}" id="legendButton${key}_${values[i]}">
                <div class="container legend">
                    <div class="row">
                        <div class="col-6">    
                            ${value}
                        </div>
                        <div class="col-6 dimension">    
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
     * Function that returns a html string with a bootstrap accordion created
     * @param {String} id Id of the accordion
     * @param {String} buttonText Name that will appear in the button of the accordion
     * @param {String} body Body that will be collapsed in the accordion
     * @returns {String} returns the html string with the accordion
     */
    accordionTemplate(id, buttonText, body) {
        const html = `
        <div class="accordion${id}" id="accordion${id}">
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${id}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${id}" aria-expanded="true" aria-controls="collapse${id}">
                        ${buttonText}
                    </button>
                </h2>
                <div id="collapse${id}" class="accordion-collapse collapse" aria-labelledby="heading${id}" data-bs-parent="#accordion${id}"> 
                    ${body}
                </div>
            </div>
        </div>`;

        return html;
    }

    /**
     * Add the onclick function to the buttons and also changes the height of buttons to fill all the space
     * @param {Object} attributes Object with the attributes that change visualization
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     */
    buttonAdditions(attributes) {
        const buttonHeight = 35 + 1;
        let maxHeight = 0;

        //Calculate max Height and add the on click function to the buttons
        for (let i = 0; i < attributes.length; i++) {
            const values = attributes[i].vals;
            const key = attributes[i].attr;
            let newHeight = 0;

            for (let j = 0; j < values.length; j++) {
                const button = document.getElementById(`legendButton${key}_${values[j]}`);
                newHeight += buttonHeight;

                button.onclick = () => this.filterButtonClick(key, values[j], button);
            }

            if(maxHeight < newHeight){
                maxHeight = newHeight
            }
        }

        //Auto adjust button height 
        //this.autoAdjustButtonHeight(attributes, maxHeight);
    }

    /**
     * AutoAdjust Legend's buttons height
     * @param {Object} attributes Object with the attributes that change visualization
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     * @param {Integer} maxHeight Max height
     */
    autoAdjustButtonHeight(attributes, maxHeight) {
        for (let i = 0; i < attributes.length; i++) {
            const values = attributes[i].vals;
            const buttonHeight = maxHeight / values.length;

            for (let j = 0; j < values.length; j++) {
                const button = document.getElementById(`legendButton${values[j]}`);
                button.style.height = `${buttonHeight}px`;
            }
        }
    }

    /**
     * Function executed when a legend button is clicked Update the values to hide and update the all networks 
     * @param {String} key key linked to the button.
     * @param {String} value value linked to the button.
     * @param {HTMLElement} button button clicked
     */
    filterButtonClick(key, value, button) {
        const btnClass = button.className;
        const isActive = btnClass.slice(btnClass.length - 6);

        if (isActive !== "active") {
            button.className = `${networkHTML.legendButtonClass} active`; 

            this.filterValuesToHide.push(`${key}_${value}`);
        } else {
            button.className = networkHTML.legendButtonClass;

            const index = this.filterValuesToHide.indexOf(`${key}_${value}`);
            if (index === -1) {
                this.filterButtonClick(key, value, button);
                return;

            } else {
                this.filterValuesToHide.splice(index, 1);
            }
        }

        this.networksGroup.updateFilterActivesALL(this.filterValuesToHide);
    }

    initLegend(){
        this.filterValuesToHide = new Array();

        const attributes = this.networksGroup.getVisualizationAttributes();

        this.createLegendContainer(attributes, this.container);

        this.buttonAdditions(attributes);
    }

    restartLegend(){
        const legendContainer = document.getElementById("accordiontop");
        legendContainer.remove();

        this.initLegend();
    }
}


