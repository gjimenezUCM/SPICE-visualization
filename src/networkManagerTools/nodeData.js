/**
 * @fileoverview This class controls the visualization of the data of the nodes. The datatable and the tooltip
 * @package It requires vis-data package to be able to use vis-network datasets. 
 * @package It requires bootstrap to be able to draw popovers.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { nodes } from "../namespaces/nodes.js";
import { comms } from "../namespaces/communities.js";
import { networkHTML } from "../namespaces/networkHTML.js";
//Packages
import { DataSet } from "vis-data/peer";
import { Popover } from 'bootstrap';

export default class NodeData {

    /**
     * Constructor of the class
     * @param {ExplicitCommsMan} explicitMan Explicit manager of the network
     * @param {HTMLElement} container Container where the datatable will be placed
     */
    constructor(explicitMan, container) {
        this.explCommMan = explicitMan;
        this.container = container;

        this.tooltip = null;
    }

    /**
     * Parse the json into a proper nodes Dataset to use to draw the network
     * @param {Object} json json with the nodes data
     * @returns {DataSet} a vis.js DataSet with the nodes data ready to draw the network
     */
    parseNodes(json) {
        for (let node of json[nodes.UsersGlobalJsonKey]) {
            this.explCommMan.findExplicitCommunities(node);

            //The implicit community will be used for the bounding boxes
            node[comms.ImplUserNewKey] = parseInt(node[comms.ImplUserJsonKey]);

            //Vis uses "group" key to change the color of all nodes with the same key. We need to remove it
            if (comms.ImplUserJsonKey === "group")
                delete node["group"];

            node["defaultColor"] = true;

            this.nExplCommunities = Object.keys(node[comms.ExpUserKsonKey]).length;
        }
        this.nodes = new DataSet(json.users);

        return this.nodes;
    }

    /**
     * Create the Table/html with the data about the selected node. Its empty if none is selected
     */
    createNodesDataTable() {

        const nExplCommunities = this.nExplCommunities;
        const nRow = nodes.NodesWantedAttr.length + nExplCommunities;

        const dataContainer = document.createElement('div');
        dataContainer.className = "border border-dark rounded";

        const titleContainer = document.createElement('h5');
        titleContainer.className = "middle attributes border-bottom border-dark";
        titleContainer.textContent = nodes.NodesTableTitle;

        dataContainer.appendChild(titleContainer);

        this.tableHtmlRows = new Array();
        for (let i = 0; i < nRow; i++) {

            const row = document.createElement('div');
            row.className = nodes.borderMainHTMLrow;

            //If its the last row with data, we remove the border
            if (i >= nodes.NodesWantedAttr.length - 1)
                row.className = nodes.borderlessHTMLrow;

            const colLeft = document.createElement("div");
            colLeft.className = "col-6 ";
            colLeft.innerHTML = "";

            //If we are writing a wantedNodeAttrb, we want to show the key of it in the table
            if (i < nodes.NodesWantedAttr.length)
                colLeft.innerHTML = "<b>" + nodes.NodesWantedAttr[i] + "</b>";

            const colRight = document.createElement("div");
            colRight.className = "col-6 ";
            colRight.innerHTML = "";

            this.tableHtmlRows.push({ left: colLeft, right: colRight, row: row });

            row.appendChild(colLeft);
            row.appendChild(colRight);
            dataContainer.appendChild(row);
        }

        this.container.appendChild(dataContainer);
        this.container.appendChild(document.createElement("hr"));
    }

    /**
     * Update the data panel to show a node's data
     * @param {integer} id the id of the node
     */
    updateDataPanel(id) {
        const node = this.nodes.get(id);

        this.clearDataPanel();

        let lastImportantRowIndex;
        let rowIndex = 0;

        //Add the important attributes in their fixed order
        for (let i = 0; i < nodes.NodesWantedAttr.length; i++) {
            const currentKey = nodes.NodesWantedAttr[i];

            this.updateDataPanelRow(rowIndex, currentKey, node[currentKey], true, false);

            lastImportantRowIndex = rowIndex;
            rowIndex++;
        }

        let lastRowIndex = lastImportantRowIndex;

        const keys = Object.keys(node[comms.ExpUserKsonKey]);

        //We only want to show explicit community info from the unimportant attributes
        for (let i = 0; i < keys.length; i++) {
            const currentKey = keys[i];

            //We change the border between the last wanted attribute and the explicit Community attributes
            if (lastImportantRowIndex !== null) {
                this.tableHtmlRows[lastImportantRowIndex].row.className = nodes.borderSeparatorHTMLrow;
                lastImportantRowIndex = null;
            }

            this.updateDataPanelRow(rowIndex, currentKey, node[comms.ExpUserKsonKey][currentKey], true, true);

            lastRowIndex = rowIndex;
            rowIndex++;
        }

        this.tableHtmlRows[lastRowIndex].row.className = nodes.borderlessHTMLrow;
    }


    /**
    * Clear all data from DataPanel while mantaining the important keys
    */
    clearDataPanel() {
        for (let i = 0; i < this.tableHtmlRows.length; i++) {
            let hasBottomBorder = true;
            let keyName = "";

            if (i >= nodes.NodesWantedAttr.length - 1)
                hasBottomBorder = false;

            if (i < nodes.NodesWantedAttr.length)
                keyName = nodes.NodesWantedAttr[i];

            this.updateDataPanelRow(i, keyName, "", hasBottomBorder);
        }
    }

    /** 
     * Update a dataPanel row 
     * @param {integer} index index of the row to update
     * @param {String} key new Text in the left column
     * @param {String} value new Text in the right column
     * @param {Boolean} bottomBorder Boolean indicating if the row should have bottom Border
     * @param {Boolean} greyBorder Boolean indicating if the row should have grey Border
     */
    updateDataPanelRow(index, key, value, bottomBorder, greyBorder) {
        this.tableHtmlRows[index].left.innerHTML = "<b>" + key + "</b>";
        this.tableHtmlRows[index].right.innerHTML = value;

        if (!bottomBorder) {
            this.tableHtmlRows[index].row.className = nodes.borderlessHTMLrow;
        } else if (greyBorder) {
            this.tableHtmlRows[index].row.className = nodes.borderHTMLrow;
        } else
            this.tableHtmlRows[index].row.className = nodes.borderMainHTMLrow;
    }

    /**
     * Update or create the tooltip of a node
     * @param {Integer} id id of the node
     * @param {NetworkMan} networkMan networkManager where this tooltip is going to be drawn
     * @param {Boolean} respawn Boolean saying if the tooltip should do the "spawn" animation
     */
    updateTooltip(id, networkMan, respawn = true) {
        let tooltip = networkMan.groupManager.tooltip;
        let container = networkMan.groupManager.tooltipContainer;

        if (respawn) {
            if (tooltip !== null) {
                tooltip.hide();
            }
            tooltip = null;
            if (container !== null)
                container.remove();
        }

        const canvasPosition = this.getElementPosition(networkHTML.topCanvasContainer + networkMan.key)

        const nodeCanvasPosition = networkMan.network.getPosition(id);
        const nodePosition = networkMan.network.canvasToDOM(nodeCanvasPosition);

        //Depending on the zoom, we increase the offset
        const xOffset = networkMan.network.getScale() * 40;
        //Calculate the real absolute click coordinates
        const clickX = nodePosition.x + canvasPosition.left + xOffset;
        const clickY = nodePosition.y + canvasPosition.top;

        const title = "<h5> " + id + "</h5>";
        const content = this.getTooltipContent(id);

        if (tooltip === null) {

            //We use a bootstrap Popover as a tooltip
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

            tooltip.zoomUpdate = () => this.updateTooltip(id, networkMan, false);
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

        networkMan.groupManager.tooltip = tooltip;
        networkMan.groupManager.tooltipContainer = container;
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
     * Returns the tooltip content of a node
     * @param {Integer} id id of the node
     * @returns {String} Returns a string with the content
     */
    getTooltipContent(id) {
        const node = this.nodes.get(id);
        let content = "";

        content += "<b> label: </b> " + node["label"] + "<br>";
        content += "<b> group: </b> " + node["implicit_Comm"] + "<br>";

        const keys = Object.keys(node.explicit_community);
        for (let i = 0; i < keys.length; i++) {
            content += "<b>" + keys[i] + "</b> " + node.explicit_community[keys[i]] + "<br>";
        }

        return content;
    }

    
}