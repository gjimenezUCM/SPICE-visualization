import { networkHTML } from "../namespaces/networkHTML";
import { nodes } from "../namespaces/nodes";

import { Collapse } from 'bootstrap';

export default class Legend {

    constructor(container, networksGroups) {
        const attributes = networksGroups.getVisualizationAttributes();

        container.append(this.createLegendContainer(attributes));
        this.filterValuesToHide = new Array();
        this.networksGroups = networksGroups
    }

    /**
     * Create a container with the legend. Legend rows also allow to hide the nodes that meed some 
     * explicit communities's attributes
     * @param {Object} attributes Object with the attributes that change visualization
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     * @returns {HTMLElement} returns the container with the legend/filter
     */
    createLegendContainer(attributes) {
        const innerAcoordionArray = [];
        for (let i = 0; i < attributes.length; i++) {
            const div = this.createFilterButtons(attributes[i].vals, attributes[i].dimension);
            const innerAcord = this.createAccordion(attributes[i].attr, attributes[i].attr, [div]);

            innerAcoordionArray.push(innerAcord);
        }

        let acoordion = this.createAccordion("topId", "Legend", innerAcoordionArray, true);

        return acoordion;
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

    createFilterButtons(values, dimension) {
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
            this.getCommunityValueIndicator(rightContainer, dimension, i);
            rowContainer.append(rightContainer);
        }

        return container;
    }

    getCommunityValueIndicator(container, dimension, valueIndex) {
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

        container.append(output);
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
}


