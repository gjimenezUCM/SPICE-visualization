import { comms } from "../namespaces/communities.js";

/**
 * @fileoverview This Class Manage everything related to implicit Communities. It reads the json, draw the 
 * bounding boxes behind the network that surround nodes of the same community and shows the info of the clicked
 * community in a table.
 * 
 * about its dependencies.
 * @package This file alone doesnt need any package
 * @author Marco Expósito Pérez
 */
export default class ImplicitCommsMan {

    /**
     * Constructor of the class
     * @param {*} communityJson Json with the implicit community data
     * @param {*} container Container where the dataTable is going to be placed
     */
    constructor(communityJson, container) {
        this.implComms = communityJson[comms.ImplGlobalJsonKey];
        this.tableContainer = container;

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
        row.className = "row dataRow border-bottom border-dark";

        if (i === nRow - 1)
            row.className = "row dataRow";

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
    drawBoundingBoxes(ctx, data, network) {
        //Tracks the draw order of the bounding boxes
        this.bbOrder = new Array();

        //Initialize all bounding boxes
        const boundingBoxes = new Array();
        for (let i = 0; i < Object.keys(this.implComms).length; i++) {
            boundingBoxes.push(null);
        }

        //DEBUG
        let bb_count = 0;

        //Obtain the bounding box of every Implicit Community of nodes
        data.forEach((node) => {

            const group = node[comms.ImplUserNewKey];
            const node_bb = network.getBoundingBox(node.id)

            if (boundingBoxes[group] === null) {
                boundingBoxes[group] = node_bb;
                this.bbOrder.push(group);

                //DEBUG
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
                this.updateCommunityInfo(i);
                return;
            }
        }

        this.clearCommunityInfo();
    }

    /**
     * Check if the pointer is inside the bounding box
     * @param {BoundingBox} bb bounding box
     * @param {Integer} x x pointer's coordinate in canvas measurement
     * @param {Integer} y y pointer's coordinate in canvas measurement
     * @returns 
     */
    clickInsideBox(bb, x, y) {
        return x > bb.left && x < bb.right && y > bb.top && y < bb.bottom;
    }

    /**
     * Update the Table with the data of a community
     * @param {*} i index of the bounding box clicked
     */
    updateCommunityInfo(i) {
        const newComm = this.implComms[this.bbOrder[i]];
        for (let i = 0; i < this.tableHtmlRows.length; i++) {
            this.tableHtmlRows[i].right.innerText = newComm[comms.ImplWantedAttr[i]];
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