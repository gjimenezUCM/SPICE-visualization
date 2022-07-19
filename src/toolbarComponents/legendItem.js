/**
 * @fileoverview This class creates a popover with the Legend of the networks on view.
 * The legend also includes options to filter the nodes of all active networks
 * @package Requires bootstrap package to be able to use Popover. 
 * @author Marco Expósito Pérez
 */
//Namespace
import { networkHTML } from "../constants/networkHTML";
import { nodes } from "../constants/nodes";
//Packages
import { Popover } from "bootstrap";

export default class LegendItem {

    /**
     * Constructor of the class
     * @param {ToolBar} toolbar toolbar owner of this item
     */
    constructor(toolbar) {
        this.toolbar = toolbar;

        this.popover = null;
        this.valuesToHide = new Array();
        this.oldclick = new Date();

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

    /**
     * Create the events related with the Legend
     */
    createEvents() {
        this.button = document.getElementById("TestingButton");
        this.button.onclick = () => this.legendOnclick();
    }

    /**
     * Function executed when the legend button is clicked. Toggle the legend popover
     */
    legendOnclick() {
        if (this.popover !== null) {
            const newClick = new Date();

            if (newClick - this.oldclick > 250) {
                this.oldclick = newClick;

                if (this.button.className === "accordion-button unselectable collapsed") {
                    this.button.className = "accordion-button unselectable";
                } else {
                    this.button.className = "accordion-button unselectable collapsed";
                }

                //If the user spams the click on the legend, the popover will break
                if (this.popover._hoverState !== "out") {
                    this.popover.toggle();
                } else {
                    console.log("Error with the legend popover");
                }
            }
        }
    }

    /**
     * Function executed when the event "networkNumberChange" is dispatched. 
     * The function creates the popover if there are more than 0 networks and the popover doesnt exist yet
     * The function also removes the popover if there are 0 networks
     */
    networkNumberChange() {
        const nNetworks = this.toolbar.networksGroup.getNnetworks();

        if (nNetworks <= 0) {
            this.button.className = "accordion-button unselectable collapsed disabled";
            if (this.popover !== null) {
                this.popover.hide();
                this.popover = null;
            }
        } else {
            const attributes = this.toolbar.networksGroup.getVisualizationAttributes();

            if (attributes === undefined || attributes === null || attributes.length === 0) {
                this.button.className = "accordion-button unselectable collapsed disabled";
            } else {
                if (this.button.className === "accordion-button unselectable collapsed disabled") {
                    this.button.className = "accordion-button unselectable collapsed";
                }

                if (this.popover === null) {
                    this.createLegendPopover(attributes)
                }
            }
        }
    }

    /**
     * Creates the popover that will act as the legend
     * @param {Object} Object with the attributes that change visualization
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     */
    createLegendPopover(attributes) {

        const allowList = Popover.Default.allowList;
        allowList.button = [];
        allowList['*'].push("style");
        allowList['*'].push("name");

        const title = "";
        const content = this.popoverContent(attributes);
        const html = this.popoverTemplate(attributes);

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

    /**
     * Returns the popover html template
     * @returns {String} returns a string with the template
     */
    popoverTemplate(attributes) {
        const html = `
        <div class="popover legend" role="tooltip" style="min-width:${networkHTML.legendColumnsWidth * attributes.length}px;">  
            <div class="popover-body legend" id="PopoverLegend"></div>
        </div>`;

        return html;
    }

    /**
    * Creates the htmlstring with the contents of the popover
    * @param {Object} Object with the attributes that change visualization
    * Format-> {attr: (string), vals: (string[], dimension: (string))}
    * @returns {String} returns the htmlstring
    */
    popoverContent(attributes) {
        this.valuesToHide = new Array();

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

        let body = `
        <div class="row">
            ${legendTable}
        </div>`;

        return body;
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
     * Adds the onclick function to all legend button options
     * @param {HTMLElement[]} legendOptions Array with all buttons
     */
    createSubButtonsOnclick(legendOptions) {
        for (const option of legendOptions) {
            option.onclick = () => this.subButtonOnclick(option);
        }
    }

    /** 
     * Function executed when the legend button options is clicked. 
     * Toggle the visibility of nodes related with the value
     */
    subButtonOnclick(option) {
        const idSanitized = (option.id).substring("legendButton".length);
        const id = idSanitized.split("_");

        const btnClass = option.className;
        const isActive = btnClass.slice(btnClass.length - 6);

        if (isActive !== "active") {
            option.className = `${networkHTML.legendButtonClass} active`;

            this.valuesToHide.push(`${id[0]}_${id[1]}`);
        } else {
            option.className = networkHTML.legendButtonClass;

            const index = this.valuesToHide.indexOf(`${id[0]}_${id[1]}`);
            if (index === -1) {
                console.log("Legend error, value to remove not found in the values to hide list")
                return;

            } else {
                this.valuesToHide.splice(index, 1);
            }
        }

        this.toolbar.networksGroup.updateFilterActivesALL(this.valuesToHide);
    }

    /**
     * Setup the config file
     * @param {Object} config network configuration file 
     */
    setConfiguration(config) {
        config["valuesToHide"] = this.valuesToHide;
    }

    /**
     * Clear the legend and disables it
     */
    restart() {
        if (this.button !== null && this.button !== undefined) {
            this.button.className = "accordion-button unselectable collapsed disabled";
            if (this.popover !== null) {
                this.popover.hide();
                this.popover = null;
            }
        }
    }

    /**
     * Auxiliar function that change strings from CamelCase to Camel Case unless all the string characters
     * are upper case. It also trim them based on the maxLength parameter
     * @param {String} string string to be edited
     * @param {Integer} maxLength max possible length of the string
     * @returns {String} Returns the string decorated 
     */
    decorateString(string, maxLength) {
        if (isNaN(string) && string !== string.toUpperCase()) {
            const notCamelCaseString = string.replace(/([A-Z])/g, " $1");
            string = notCamelCaseString.charAt(0).toUpperCase() + notCamelCaseString.slice(1);
        }
        return this.trimString(string, maxLength);
    }

    /**
     * If the string is bigger than maxLength, it will remove the last chars of the string 
     * to fit inside the maxLenght
     * @param {String} string string to be trimmed
     * @param {Integer} maxLength max possible length of the string
     * @returns {String} Returns the string decotrimmedated 
     */
    trimString(string, maxLength) {
        if (string.length > maxLength) {
            return string.substring(0, maxLength);
        } else {
            return string;
        }
    }
}