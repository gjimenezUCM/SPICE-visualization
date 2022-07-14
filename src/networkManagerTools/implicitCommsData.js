/**
 * @fileoverview This class holds the data of the implicit Communities and show that data using a tooltip 
 * when a bounding box is clicked and also shows that data in a dataTable
 * @author Marco Expósito Pérez
 */

//Namespaces
import { comms } from "../constants/communities.js";
import { networkHTML } from "../constants/networkHTML.js";
import { nodes } from "../constants/nodes.js";

//Local classes
import dataTable from "./dataTable.js";

export default class ImplicitCommsData {

    /**
     * Constructor of the class
     * @param {JSON} communityJson Json with the implicit community data
     */
    constructor(communityJson) {
        //Data of all implicit communities
        this.implComms = communityJson[comms.ImplGlobalJsonKey];
    }

    /**
     * Draw the bounding boxes behind the network nodes
     * @param {CanvasRenderingContext2D} ctx Context of the canvas 
     * @param {DataSet} data Data of the nodes in the network
     * @param {Network} network Network where the bounding boxes are being drawn on
     */
    drawBoundingBoxes(ctx, data, network) {
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
                //DEBUG TO SEE THE BB COLOR IN THE TABLE
                this.implComms[i].color = this.getCommunityBBcolor(i);

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
     * @returns {Integer} Returns the index of the bounding box that contains the click. 
     * Returns undefined if the click hit none
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
     * Create and empty dataTable with the community attributes we want to show
     * @param {HTMLElement} container container of the dataTable
     */
    createCommunityDataTable(container) {
        this.dataTable = new dataTable(container);

        const tittle = "Community Attributes";

        //We only include the data we want to show
        const rowsData = new Array();
        for (let i = 0; i < comms.ImplWantedAttr.length; i++) {
            rowsData.push({
                class: nodes.borderMainHTMLrow,
                title: `<strong> ${comms.ImplWantedAttr[i]} </strong>`,
                data: ""
            });
        }

        //Remove the border of the last row
        let lastMainrow = rowsData.pop();
        lastMainrow.class = nodes.borderlessHTMLrow;
        rowsData.push(lastMainrow);

        this.dataTable.createDataTable(rowsData, tittle, false)
    }

    /**
     * Update the dataTable based on where the user clicked. 
     * If the click didnt hit a bounding box, the function clears the dataTable
     * @param {Object} event click event
     */
    updateDataTableFromClick(event) {
        this.clearDataTable();

        let i = this.checkBoundingBoxClick(event);
        if (i !== undefined) {
            this.updateDataTable(i);
        }
    }

    /**
     * Update the dataTable based on what node the user clicked. 
     * If the click didnt hit a bounding box, the function clears the dataTable
     * @param {Object} event click event
     */
    updateDataTableFromNodeId(id, nodes) {
        let i = nodes.get(id)[comms.ImplUserNewKey];
        if (i !== undefined) {
            this.updateDataTable(i);
        }
    }

    /**
     * Update the dataTable based on the index of the bounding box 
     * that we want to represent in the dataTable. 
     * @param {Integer} i index of the bounding box
     */
    updateDataTable(i) {
        const community = this.implComms[i];
        const newRowData = new Map();

        for (let i = 0; i < comms.ImplWantedAttr.length; i++) {
            newRowData.set(comms.ImplWantedAttr[i], community[comms.ImplWantedAttr[i]])
        }

        this.dataTable.updateDataTable(newRowData)
    }

    /**
     * Clears all data from the dataTable
     */
    clearDataTable() {
        this.dataTable.clearDataTable();
    }

    /**
     * Calculate the spawning point of the tooltip
     * @param {NetworkManager} networkManager Manager of the network where the tooltip is going to be draw
     * @param {Object} event Event with the location of the user click
     * @param {Function} getElementPosition Function that returns the DOM position of a HTML element
     * @param {Function} isClickOnCanvas Function that returns if the click object is in the canvas
     * @returns {Object} returns an object with the spawn Point.
     * Format-> { x: (integer), y: (integer) } 
     */
    calculateTooltipSpawn(networkManager, event, getElementPosition, isClickOnCanvas) {
        //Horizontal offset to make the tooltip not overlap the bounding box
        const xOffset = 10;

        //CHeck if the click hit a bounding box
        this.activeBBindex = this.checkBoundingBoxClick(event);

        if (this.activeBBindex === undefined)
            return this.activeBBindex;

        //Get the position of the bounding box in the canvas DOM
        const bbLeft = networkManager.network.canvasToDOM({
            x: this.bb[this.activeBBindex].left,
            y: this.bb[this.activeBBindex].top
        });
        const bbRight = networkManager.network.canvasToDOM({
            x: this.bb[this.activeBBindex].right,
            y: this.bb[this.activeBBindex].bottom
        });

        //Calculate the real absolute click coordinates
        const networkCanvasPosition = getElementPosition(networkHTML.topCanvasContainer + networkManager.key);

        const clickX = bbRight.x + xOffset + networkCanvasPosition.left;
        const clickY = bbLeft.y + (bbRight.y - bbLeft.y) / 2 + networkCanvasPosition.top;

        const output = { x: clickX, y: clickY };

        if (isClickOnCanvas(output, networkCanvasPosition)) 
            return output;
        return null;
    }



    /**
     * Returns the Title of the tooltip
     * @param {NetworkManager} networkManager (unused)
     * @param {Object} event (unused)
     * @param {Function} titleTemplate Function that returns the html template of the tooltip tittle
     * @returns {String} String with the tootip tittle
     */
    getTooltipTitle(networkManager, event, titleTemplate) {
        const communityClicked = this.implComms[this.activeBBindex];
        const title = communityClicked.id;

        return titleTemplate(title);
    }

    /**
     * Returns the Content of the tooltip
     * @param {NetworkManager} networkManager (unused)
     * @param {Object} event (unused)
     * @param {Function} contentTemplate Function that returns the html template of the tooltip content
     * @returns {String} String with the tootip content
     */
    getTooltipContent(networkManager, event, contentTemplate) {
        const communityClicked = this.implComms[this.activeBBindex];
        const rowData = new Array();

        for (let i = 0; i < comms.ImplWantedAttr.length; i++) {
            rowData.push({ tittle: comms.ImplWantedAttr[i], data: communityClicked[comms.ImplWantedAttr[i]] });
        }

        return contentTemplate(rowData);
    }

    /**
     * Completely remove the dataTable
     */
    removeTable(){
        this.dataTable.removeDataTable();
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
            case 5:
                return "orange";
            case 6:
                return "white";
            case 7:
                return "black";
        }
    }
}