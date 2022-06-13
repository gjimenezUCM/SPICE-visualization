/**
 * @fileoverview This Class Manages everything related to implicit Communities. It reads the json, draw the 
 * bounding boxes behind the network that surround nodes of the same community and shows the info of the clicked
 * community in a table and in a tooltip.
 * @package It requires bootstrap to be able to draw popovers.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { comms } from "../namespaces/communities.js";
import { networkHTML } from "../namespaces/networkHTML.js";
import { nodes } from "../namespaces/nodes.js";
//packages
import { Popover } from 'bootstrap';

export default class ImplicitCommsMan {

    /**
     * Constructor of the class
     * @param {JSON} communityJson Json with the implicit community data
     * @param {HTMLElement} container Container where the dataTable is going to be placed
     * @param {NetworkMan} networkMan networkManager parent of this object
     */
    constructor(communityJson, container, networkMan) {
        //Data of all implicit communities
        this.implComms = communityJson[comms.ImplGlobalJsonKey];

        this.tableContainer = container;

        this.networkMan = networkMan;
        this.tooltip = null;
    }

    /**
     * Create the Table/html with the data about the selected Implicit Community. Its empty if none is selected
     */
    createCommunityDataTable() {
        const tableContainer = document.createElement('div');
        tableContainer.className = "border border-dark rounded";

        const titleContainer = document.createElement('h5');
        titleContainer.className = "middle attributes border-bottom border-dark";
        titleContainer.textContent = comms.ImplTableTitle;
        tableContainer.appendChild(titleContainer);

        this.tableHtmlRows = new Array();
        const nRow = comms.ImplWantedAttr.length;

        for (let i = 0; i < nRow; i++) {
            this.addTableRow(i, nRow, tableContainer);
        }

        this.tableContainer.appendChild(tableContainer);
    }

    /**
     * Add a row to the community table
     * @param {integer} i index of the new row
     * @param {integer} nRow max of rows
     * @param {HTMLElement} tableContainer html container of the table
     */
    addTableRow(i, nRow, tableContainer) {
        const row = document.createElement('div');
        row.className = comms.borderTMLrow;

        if (i === nRow - 1)
            row.className = comms.borderlessHTMLrow;

        const colLeft = document.createElement("div");
        colLeft.className = "col-6 ";
        colLeft.innerHTML = "<b>" + comms.ImplWantedAttr[i] + "</b>";


        const colRight = document.createElement("div");
        colRight.className = "col-6 ";
        colRight.innerHTML = "";

        this.tableHtmlRows.push({ left: colLeft, right: colRight, row: row });

        row.appendChild(colLeft);
        row.appendChild(colRight);
        tableContainer.appendChild(row);
    }

    /**
     * Draw the bounding boxes behind the network nodes
     * @param {CanvasRenderingContext2D} ctx Context of the canvas 
     * @param {DataSet} data Data of the nodes in the network
     * @param {Network} network Network with the nodes
     */
    drawBoundingBoxes(ctx, data) {
        const network = this.networkMan.network;

        //Tracks the draw order of the bounding boxes
        this.bbOrder = new Array();

        //Initialize all bounding boxes
        const boundingBoxes = new Array();
        for (let i = 0; i < Object.keys(this.implComms).length; i++) {
            boundingBoxes.push(null);
        }

        //DEBUG TO SEE THE BB COLOR IN THE TABLE
        let bb_count = 0;

        //Obtain the bounding box of every Implicit Community of nodes
        data.forEach((node) => {
            const group = node[comms.ImplUserNewKey];
            const node_bb = network.getBoundingBox(node.id)

            if (boundingBoxes[group] === null) {
                boundingBoxes[group] = node_bb;
                this.bbOrder.push(group);

                //DEBUG TO SEE THE BB COLOR IN THE TABLE
                this.implComms[group].color = this.getCommunityBBcolor(bb_count);
                bb_count++;

            } else {
                if (node_bb.left < boundingBoxes[group].left)
                    boundingBoxes[group].left = node_bb.left;

                if (node_bb.top < boundingBoxes[group].top)
                    boundingBoxes[group].top = node_bb.top;

                if (node_bb.right > boundingBoxes[group].right)
                    boundingBoxes[group].right = node_bb.right;

                if (node_bb.bottom > boundingBoxes[group].bottom)
                    boundingBoxes[group].bottom = node_bb.bottom;
            }
        })

        //Draw the bounding box of all groups
        for (let i = 0; i < boundingBoxes.length; i++) {
            if (boundingBoxes[i] !== null) {

                //Draw Border
                ctx.lineWidth = comms.Bb.BoderWidth;
                ctx.strokeStyle = comms.Bb.Color[i].Border;
                ctx.strokeRect(boundingBoxes[i].left, boundingBoxes[i].top, boundingBoxes[i].right - boundingBoxes[i].left, boundingBoxes[i].bottom - boundingBoxes[i].top);

                //Draw Background
                ctx.lineWidth = 0;
                ctx.fillStyle = comms.Bb.Color[i].Color;
                ctx.fillRect(boundingBoxes[i].left, boundingBoxes[i].top, boundingBoxes[i].right - boundingBoxes[i].left, boundingBoxes[i].bottom - boundingBoxes[i].top);
            }
        }

        //Array with all bounding boxes coordinates
        this.bb = new Array();
        for (let i = 0; i < boundingBoxes.length; i++) {
            this.bb.push({ ...boundingBoxes[i] });
        }
    }

    /**
     * Check if the pointer is clicking inside a bounding box
     * @param {Object} event Data of the click event that trigered this function
     */
    checkBoundingBoxClick(event) {
        const x = event.pointer.canvas.x;
        const y = event.pointer.canvas.y;

        /*TODO It can happen that 2 boxes are on top of another, 
        and u only get the info of the toppest one, leaving the user without chances of clicking the lower one
        */
        for (let i = 0; i < this.bb.length; i++) {
            if (this.clickInsideBox(this.bb[i], x, y)) {
                return i;
            }
        }
    }

    /**
     * Check if the pointer is inside the bounding box
     * @param {BoundingBox} bb bounding box
     * @param {Integer} x x pointer's coordinate in canvas measurement
     * @param {Integer} y y pointer's coordinate in canvas measurement
     * @returns {Boolean} Boolean if its inside or not
     */
    clickInsideBox(bb, x, y) {
        return x > bb.left && x < bb.right && y > bb.top && y < bb.bottom;
    }

    /**
     * Update the Table with the data of a community
     * @param {Object} event Data of the click event that trigered this function
     */
    updateCommunityInfoFromClick(event) {
        this.clearCommunityInfo();

        let i = this.checkBoundingBoxClick(event);
        if (i !== undefined) {
            const newComm = this.implComms[this.bbOrder[i]];
            for (let i = 0; i < this.tableHtmlRows.length; i++) {
                this.tableHtmlRows[i].right.innerText = newComm[comms.ImplWantedAttr[i]];
            }
        }
    }

    updateCommunityInfoFromNodeId(id) {
        let i = this.networkMan.data.nodes.get(id)[comms.ImplUserNewKey];
        const newComm = this.implComms[i];
        for (let i = 0; i < this.tableHtmlRows.length; i++) {
            this.tableHtmlRows[i].right.innerText = newComm[comms.ImplWantedAttr[i]];
        }
    }

    /**
     * Update the Tooltip with the data of a community
     * @param {Object} event Data of the click event that trigered this function
     */
    updateTooltipInfo(event) {
        let i = this.checkBoundingBoxClick(event);

        if (i !== undefined) {
            const newComm = this.implComms[this.bbOrder[i]];

            setTimeout(function () {
                this.updateTooltip(newComm, this.bb[i]);
            }.bind(this), nodes.ZoomDuration + nodes.TooltipSpawnTimer / 2);
        }
    }

    /**
     * Clear all the data from the table
     */
    clearCommunityInfo() {
        for (let i = 0; i < this.tableHtmlRows.length; i++) {
            this.tableHtmlRows[i].right.innerText = "";
        }
    }

    /**
     * Update the Tooltip with the comunity clicked data
     * @param {Object} community 
     * @param {BoundingBox} bb 
     * @param {Boolean} respawn 
     */
    updateTooltip(community, bb, respawn = true) {
        let tooltip = this.networkMan.groupManager.tooltip;
        let container = this.networkMan.groupManager.tooltipContainer;

        if (respawn) {
            if (tooltip !== null) {
                tooltip.hide();
            }
            tooltip = null;
            if (container !== null)
                container.remove();
        }

        const canvasPosition = this.getElementPosition(networkHTML.topCanvasContainer + this.networkMan.key)

        const bbLeft = this.networkMan.network.canvasToDOM({ x: bb.left, y: bb.top });
        const bbRight = this.networkMan.network.canvasToDOM({ x: bb.right, y: bb.bottom });

        const clickX = bbLeft.x + (bbRight.x - bbLeft.x) / 2 + canvasPosition.left;
        const clickY = bbLeft.y + (bbRight.y - bbLeft.y) / 2 + canvasPosition.top;

        const title = "<h5> " + community.id + "</h5>";
        const content = this.getTooltipContent(community);

        if (tooltip === null) {

            //Create the popover
            const options = {
                trigger: "manual",
                placement: "right",
                template: "<div class=\"popover node\" role=\"tooltip\"><div class=\"popover-arrow\"></div><h3 class=\"popover-header\"></h3><div class=\"popover-body\"></div></div>",
                fallbackPlacements: ["right"],
                content: " ",
                offset: [0, 0],
                html: true,
            };

            container = document.createElement("div");
            document.body.append(container);


            tooltip = new Popover(container, options);

            tooltip.zoomUpdate = () => this.updateTooltip(community, bb, false);
        }

        container.style.top = clickY + "px";
        container.style.left = clickX + "px";
        container.style.position = "absolute";

        if (respawn) {
            tooltip.setContent({
                '.popover-header': title,
                '.popover-body': content
            });
            tooltip.show();
        } else {
            tooltip.update();
        }

        this.networkMan.groupManager.tooltip = tooltip;
        this.networkMan.groupManager.tooltipContainer = container;
    }

    /** 
     * Get the element position in the dom
     * @param {Integer} id id of the element
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
     * Returns the content of the community Tooltip
     * @param {Object} community 
     * @returns {String} returns a string with the html content
     */
    getTooltipContent(community) {
        let content = "";

        for (let i = 0; i < comms.ImplWantedAttr.length; i++) {
            content += "<b>" + comms.ImplWantedAttr[i] + "</b> "
            content += community[comms.ImplWantedAttr[i]] + "<br>";
        }

        return content;
    }

    /**
     * Remove the current tooltip
     */
    removeTooltip() {
        this.tooltip.hide();
        this.tooltip = null;
    }

    //This is intended for debug purpouses
    getCommunityBBcolor(index) {
        switch (index) {
            case 0:
                return "purple";
            case 1:
                return "yellow";
            case 2:
                return "green";
            case 3:
                return "red";
            case 4:
                return "blue";
        }
    }
}