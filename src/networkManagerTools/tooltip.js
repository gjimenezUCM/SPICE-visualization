/**
 * @fileoverview This class creates and update a tooltip with a tittle on top and some content below it.
 * @package It requires bootstrap package to be able to use Popover objects. 
 * @author Marco Expósito Pérez
 */
//Namespaces
import { nodes } from "../constants/nodes.js";
//Packages
import { Popover } from 'bootstrap';

export default class Tooltip {

    /**
     * Constructor of the class
     */
    constructor() {
        this.tooltip = null;

        this.container = document.createElement("div");
        document.body.append(this.container);
    }

    /**
     * Show a tooltip based on the tooltipManager data
     * @param {NetworkManager} networkManager manager of the network where this tooltip is going to be drawn 
     * @param {Object} event Click event that launched this function
     * @param {Object} tooltipManager Class that holds the data that this tooltip will show
     */
    showTooltip(networkManager, event, tooltipManager) {
        if (this.timer)
            clearTimeout(this.timer);

        this.timer = setTimeout(() => this.createTooltip(networkManager, event, tooltipManager),
            nodes.ZoomDuration + nodes.TooltipSpawnTimer);
    }

    /**
     * Create a new tooltip from the start or only updates its position if update is true
     * @param {NetworkManager} networkManager manager of the network where this tooltip is going to be drawn 
     * @param {Object} event Click event that launched this function
     * @param {Object} tooltipManager Class that holds the data that this tooltip will show
     * @param {Boolean} update If true only the tooltip position will be updated, otherwise create a new tooltip
     */
    createTooltip(networkManager, event, tooltipManager, update = false) {
        this.tooltipManager = tooltipManager;
        this.event = event;

        const spawnPoint = tooltipManager.calculateTooltipSpawn(networkManager, event, this.getElementPosition.bind(this));

        if (spawnPoint !== null && spawnPoint !== undefined) {
            if (!update) {
                const html = this.tooltipTemplate();

                const title = tooltipManager.getTooltipTitle(networkManager, event, this.titleTemplate.bind(this));
                const content = tooltipManager.getTooltipContent(networkManager, event, this.contentTemplate.bind(this));

                const options = {
                    trigger: "manual",
                    placement: "right",
                    template: html,
                    content: content,
                    title: title,
                    fallbackPlacements: ["right"],
                    offset: [0, 0],
                    html: true,
                };

                this.tooltip = new Popover(this.container, options);
            }

            this.container.style.top = spawnPoint.y + "px";
            this.container.style.left = spawnPoint.x + "px";
            this.container.style.position = "absolute";

            if (!update)
                this.tooltip.show();
            else {
                this.tooltip.update();
            }

        }
    }

    /** 
     * Get the element position in the dom
     * @param {Integer} id html id of the element
     * @returns {Object} Returns an object in the format of {top: (float), left: (float)}
     */
    getElementPosition(id) {
        const element = document.getElementById(id);
        const cs = window.getComputedStyle(element);
        const marginTop = cs.getPropertyValue('margin-top');
        const marginLeft = cs.getPropertyValue('margin-left');

        const top = element.offsetTop - parseFloat(marginTop);
        const left = element.offsetLeft - parseFloat(marginLeft);

        return { top: top, left: left };
    }

    /**
     * Update the position of the tooltip when the user is zooming in/out
     * @param {NetworkManager} networkManager manager of the network where this tooltip is going to be updated 
     */
    updatePosition(networkManager) {
        if (this.tooltip !== null)
            this.createTooltip(networkManager, this.event, this.tooltipManager, true)
    }

    /**
     * Returns the tooltip html template
     * @returns {String} returns a string with the template
     */
    tooltipTemplate() {
        const html = `
        <div class="popover node" role="tooltip">
            <div class="popover-arrow"></div>
            <h3 class="popover-header"></h3>
            <div class="popover-body"></div>
        </div>`;

        return html;
    }

    /**
     * Returns the tooltip tittle html template
     * @param {String} tittle Text inside the tittle
     * @returns {String} returns a string with the template
     */
    titleTemplate(tittle) {
        return `<strong> ${tittle} </strong>`;
    }

    /**
     * Returns the tooltip content html template
     * @param {Object[]} rowsData Array with the data for each row of the tooltip
     * Format-> {tittle: (String), data: (String)}
     * @returns {String} returns a string with the template
     */
    contentTemplate(rowsData) {
        let html = "";

        for (let i = 0; i < rowsData.length; i++) {
            html += this.rowTemplate(rowsData[i].tittle, rowsData[i].data);
        }

        return html;
    }

    /**
     * Returns a tooltip row html template
     * @param {String} tittle Text at the left of the tooltip
     * @param {String} data Text at the right of the tooltip
     * @returns  {String} returns a string with the template
     */
    rowTemplate(tittle, data) {
        const html = `<strong> ${tittle} </strong> ${data} <br>`;

        return html;
    }

    /**
     * Hide the current active tooltip if it exist
     */
    hide() {
        if (this.tooltip !== null) {
            this.tooltip.hide();

            if (this.timer)
                clearTimeout(this.timer);
        }
    }
}