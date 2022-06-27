import { networkHTML } from "../constants/networkHTML";
import { nodes } from "../constants/nodes";

import { Collapse } from 'bootstrap';

export default class Legend {

    constructor(container, networksGroups) {
        this.domParser = new DOMParser();
        this.filterValuesToHide = new Array();
        this.networksGroups = networksGroups;

        const attributes = networksGroups.getVisualizationAttributes();

        container.append(this.createLegendContainer(attributes));

        this.addButtonLegendOnClick(attributes);
    }

    /**
     * Create a container with the legend. Legend rows also allow to hide the nodes that meed some 
     * explicit communities's attributes
     * @param {Object} attributes Object with the attributes that change visualization
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     * @returns {HTMLElement} returns the container with the legend/filter
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

    filterButtonsTemplate(values, dimension) {
        let html = "<div>";

        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            if (value == "") value = "\"\"";

            const rightCol = this.getCommunityValueIndicator(dimension, i);;

            html += `
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

        return html;
    }

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

        this.networksGroups.updateFilterActivesALL(this.filterValuesToHide);

    }


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

    addButtonLegendOnClick(attributes) {
        
        for (let i = 0; i < attributes.length; i++) {
            const values = attributes[i].vals;
            for(let j = 0; j < values.length; j++){
                
                console.log(`legendButton${values[j]}`);
                const button = document.getElementById(`legendButton${values[j]}`);
                
                button.onclick = () => this.filterButtonClick(values[j], button);

            }
        }

    }
}


