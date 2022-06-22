/**
 * @fileoverview This Class Manages everything related to implicit Communities. It reads the json, draw the 
 * bounding boxes behind the network that surround nodes of the same community and shows the info of the clicked
 * community in a table and in a tooltip.
 * @package It requires bootstrap to be able to draw popovers.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { comms } from "../constants/communities.js";
import { networkHTML } from "../constants/networkHTML.js";
import { nodes } from "../constants/nodes.js";
//packages
import { Popover } from 'bootstrap';
import dataTable from "./dataTable.js";

export default class ImplicitCommsData {

    /**
     * Constructor of the class
     * @param {JSON} communityJson Json with the implicit community data
     * @param {HTMLElement} container Container where the dataTable is going to be placed
     * @param {NetworkMan} networkMan networkManager parent of this object
     */
    constructor(communityJson, container, networkMan) {
        //Data of all implicit communities
        this.implComms = communityJson[comms.ImplGlobalJsonKey];

        this.container = container;

        this.networkMan = networkMan;
    }

    /**
     * Draw the bounding boxes behind the network nodes
     * @param {CanvasRenderingContext2D} ctx Context of the canvas 
     * @param {DataSet} data Data of the nodes in the network
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

    createCommunityDatatable() {
        this.dataTable = new dataTable(this.container);

        const tittle = "Community Attributes";

        //First we show the data that we want that is not from explicit communities
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

        return;
    }

    updateDatatableFromClick(event) {
        this.clearDataPanel();

        let i = this.checkBoundingBoxClick(event);
        if (i !== undefined) {
            this.updateDataPanel(i);
        }
    }

    updateDatatableFromNodeId(id) {
        let i = this.networkMan.data.nodes.get(id)[comms.ImplUserNewKey];
        if (i !== undefined) {
            this.updateDataPanel(i);
        }
    }

    updateDataPanel(i) {
        const community = this.implComms[this.bbOrder[i]];
        const newRowData = new Map();

        for (let i = 0; i < comms.ImplWantedAttr.length; i++) {
            newRowData.set(comms.ImplWantedAttr[i], community[comms.ImplWantedAttr[i]])
        }


        this.dataTable.updateDataTable(newRowData)
    }


    clearDataPanel() {
        this.dataTable.clearDataTable();
    }

    calculateTooltipSpawn(networkManager, event, getElementPosition) {
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

        const clickX = bbLeft.x + (bbRight.x - bbLeft.x) / 2 + networkCanvasPosition.left;
        const clickY = bbLeft.y + (bbRight.y - bbLeft.y) / 2 + networkCanvasPosition.top;

        return { x: clickX, y: clickY };
    }

    getTooltipTitle(networkManager, event, titleTemplate) {
        const communityClicked = this.implComms[this.bbOrder[this.activeBBindex]];
        const title = communityClicked.id;

        return titleTemplate(title);
    }


    getTooltipContent(networkManager, event, contentTemplate) {
        const communityClicked = this.implComms[this.bbOrder[this.activeBBindex]];
        const rowData = new Array();

        for (let i = 0; i < comms.ImplWantedAttr.length; i++) {
            rowData.push({ tittle: comms.ImplWantedAttr[i], data: communityClicked[comms.ImplWantedAttr[i]] });
        }

        return contentTemplate(rowData);
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