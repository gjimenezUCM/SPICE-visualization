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
        this.filterValuesToHide = new Array();
        this.networksGroup = networksGroup;

        const attributes = networksGroup.getVisualizationAttributes();

        container.append(this.createLegendContainer(attributes));

        this.addButtonLegendOnclick(attributes);
    }

    /**
     * Create a container with the legend. 
     * @param {Object} attributes Object with the attributes that change visualization
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     * @returns {HTMLElement} returns the container with the legend
     */
    createLegendContainer(attributes) {
        let topBody = "";
        for (let i = 0; i < attributes.length; i++) {
            const buttonsDiv = this.filterButtonsTemplate(attributes[i].vals, attributes[i].dimension);

            const htmlString = this.accordionTemplate(attributes[i].attr, attributes[i].attr, buttonsDiv);

            topBody += htmlString;
        }

        const topAcoordion = this.accordionTemplate("top", "Legend", topBody);

        const html = this.domParser.parseFromString(topAcoordion, "text/html").body.firstChild;
        return html;
    }

    /**
     * Function that returns a html string based on a template and the parameters of the function
     * @param {String[]} values String Array with the values of the buttons 
     * @param {String} dimension Name of the dimension that all these buttons will change
     * @returns {String} returns a string with the html of the buttons
     */
    filterButtonsTemplate(values, dimension) {
        let buttonHTML = "";

        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            if (value == "") value = "\"\"";

            const rightCol = this.getCommunityValueIndicator(dimension, i);

            buttonHTML += `
            <div class="row align-items-left">
                <button type="button" class="legend btn btn-outline-primary active" id="legendButton${values[i]}">
                    <div class="row align-items-center">
                        <div class="col value">    
                            ${value}
                        </div>
                        <div class="col">    
                            ${rightCol}
                        </div>
                    </div>
                </button>
            </div>`;
        }

        const output =`
        <div>
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
                output.className = "box";
                output.style.backgroundColor = nodes.NodeAttr.getColor(valueIndex);
                break;

            case nodes.nodeShapeKey:
                nodes.getShapehtml(output, valueIndex)
                break;

            case nodes.nodeBorderKey:
                output.className = "box";
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
        <div class="accordion${id}">
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
     * Look for the legendButtons and add them the corresponding onclick function
     * @param {Object} attributes Object with the attributes that change visualization
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     */
    addButtonLegendOnclick(attributes) {
        for (let i = 0; i < attributes.length; i++) {
            const values = attributes[i].vals;

            for (let j = 0; j < values.length; j++) {
                const button = document.getElementById(`legendButton${values[j]}`);

                button.onclick = () => this.filterButtonClick(values[j], button);
            }
        }
    }

    /**
     * Function executed when a legend button is clicked Update the values to hide and update the all networks 
     * @param {String} value value linked to the button.
     * @param {HTMLElement} button button clicked
     */
    filterButtonClick(value, button) {
        const btnClass = button.className;
        const isActive = btnClass.slice(btnClass.length - 6);

        if (isActive === "active") {
            button.className = networkHTML.legendButtonClass;

            this.filterValuesToHide.push(value);
        } else {
            button.className = `${networkHTML.legendButtonClass} active`;

            const index = this.filterValuesToHide.indexOf(value);
            if (index === -1) {
                this.filterButtonClick(value, button);
                return;

            } else {
                this.filterValuesToHide.splice(index, 1);
            }
        }

        this.networksGroup.updateFilterActivesALL(this.filterValuesToHide);
    }
}


