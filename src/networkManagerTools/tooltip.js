import { networkHTML } from "../constants/networkHTML";
import { Popover } from 'bootstrap';
import { nodes } from "../constants/nodes.js";

export default class Tooltip {

    constructor() {
        this.tooltip = null;

        this.container = document.createElement("div");
        document.body.append(this.container);
    }

    showTooltip(networkManager, event, tooltipManager) {
        if (this.timer)
            clearTimeout(this.timer);

        this.timer = setTimeout(() => this.createTooltip(networkManager, event, tooltipManager),
            nodes.ZoomDuration + nodes.TooltipSpawnTimer);
    }

    createTooltip(networkManager, event, tooltipManager, update = false) {
        this.tooltipManager = tooltipManager;
        this.event = event;

        const spawnPoint = tooltipManager.calculateTooltipSpawn(networkManager, event, this.getElementPosition);

        if (spawnPoint !== null && spawnPoint !== undefined) {

            if (!update) {
                const html = this.tooltipTemplate();

                const title = tooltipManager.getTooltipTitle(networkManager, event, this.titleTemplate);
                const content = tooltipManager.getTooltipContent(networkManager, event, this.contentTemplate);

                const options = {
                    trigger: "manual",
                    placement: "right",
                    template: html,
                    content: content,
                    tittle: content,
                    fallbackPlacements: ["right"],
                    offset: [0, 0],
                    html: true,
                };

                this.tooltip = new Popover(this.container, options);

                this.tooltip.setContent({
                    '.popover-header': title,
                    '.popover-body': content
                });

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

    updatePosition(networkManager) {
        this.createTooltip(networkManager, this.event, this.tooltipManager, true)
    }


    boundingBoxTooltip(networkManager, event) {
        console.log("bounding box tooltip")
    }

    tooltipTemplate() {
        var html = `
        <div class="popover node" role="tooltip">
            <div class="popover-arrow"></div>
            <h3 class="popover-header"></h3>
            <div class="popover-body"></div>
        </div>`;

        return html;
    }

    titleTemplate(tittle) {
        return `<strong> ${tittle} </strong>`;
    }

    contentTemplate(rowsData) {
        let html = ""

        for (let i = 0; i < rowsData.length; i++) {
            html += `<strong> ${rowsData[i].title} </strong> ${rowsData[i].data} <br>`;
        }

        return html;
    }

    hide() {
        if (this.tooltip !== null) {
            this.tooltip.hide();

            if (this.timer)
                clearTimeout(this.timer);
        }
    }
}