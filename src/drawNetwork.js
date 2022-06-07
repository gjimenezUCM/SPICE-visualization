import { DataSet } from "vis-data/peer";
import { Network } from "vis-network/peer";
import { Popover } from 'bootstrap';
import Utils from "./Utils";
import Explicit_community from "./explicitCommunity";

export default class DrawNetwork {

    /** Constructor that will draw the network
     * 
     * @param {*} jsonInput json with all the necesary data to create the nodes and edges
     * @param {*} container container where the network will be created
     */
    constructor(jsonInput, container, rightContainer, networkManager, config) {
        this.container = container;
        this.dataContainer = rightContainer;
        this.networkManager = networkManager;
        this.config = config;
        this.key = config.key;

        this.data = { nodes: "", edges: "" };
        this.explCommOptions = new Utils();
        this.activateEdgeLabels = true;

        this.initExplicitCommunities(jsonInput);
        this.initNodes(jsonInput);
        this.initEdges(jsonInput);

        this.initDataTable();

        this.chooseOptions();

        this.drawNetwork();
    }

    //#region BOUNDING BOXES && EXPLICIT COMMUNITIES 

    /** Initialize all explicit communities, bounding boxes and its parameters
     * 
     * @param {*} json json with communities data
     */
    initExplicitCommunities(json) {
        this.initBoundingBoxesParameters();
        this.communities = this.parseCommunities(json);
    }

    /**
     * Initialize all parameters related with bounding boxes of node groups
     */
    initBoundingBoxesParameters() {
        //In case group key changes, this is what is compared while parsing nodes json
        this.implicitCommunity_key = "group";

        this.boxBorderWidth = 4;

        this.bbColor = new Array();
        this.bbColor.push({ color: "rgba(248, 212, 251, 0.6)", border: "rgba(242, 169, 249, 1)" }); //Purple
        this.bbColor.push({ color: "rgba(255, 255, 170, 0.6)", border: "rgba(255, 222, 120, 1)" }); //Yellow
        this.bbColor.push({ color: "rgba(211, 245, 192, 0.6)", border: "rgba(169, 221, 140, 1)" }); //Green
        this.bbColor.push({ color: "rgba(254, 212, 213, 0.6)", border: "rgba(252, 153, 156, 1)" }); //Red
        this.bbColor.push({ color: "rgba(220, 235, 254, 0.6)", border: "rgba(168, 201, 248, 1)" }); //Blue
    }

    /** Parse the JSON object to get the communities of the network
    * 
    * @param {*} json //JSON object that will be parsed
    * @returns communities json object
    */
    parseCommunities(json) {
        return json.communities;
    }

    //#endregion BOUNDING BOXES && EXPLICIT COMMUNITIES 

    //#region NODES SETUP

    /** Initialize all nodes and its parameters
     * 
     * @param {*} json json with node data
     */
    initNodes(json) {
        //TODO Los valores de las keys deberian venir de una opcion al usuario
        this.explicitCommunities = new Array();


        this.explicitCommunities.push(new Explicit_community("ageGroup"));
        this.explicitCommunities.push(new Explicit_community("language"));

        //Explicit Community 0
        this.nodeColors = new Map();

        //Explicit Community 1
        this.nodeShapes = new Map();

        //Default Options
        this.defaultNodeSize = 15;
        this.SelectedNodeSize = 25;

        this.darkNodeColor = { background: "rgba(155, 155, 155, 0.3)", border: "rgba(100, 100, 100, 0.3)" };

        this.zoomDuration = 1000;

        this.data.nodes = this.parseNodes(json);
    }

    /** Parse the JSON object to get the nodes of the network
    * 
    * @param {*} json //JSON object that will be parsed to get its nodes
    * @returns nodes dataSet
    */
    parseNodes(json) {
        for (let node of json.users) {

            //The implicit community will be used for the bounding boxes
            node["implicit_Comm"] = parseInt(node[this.implicitCommunity_key]);

            //Vis uses "group" key to change the color of all nodes with the same key. We need to remove it
            delete node["group"];

            //Explicit 0 -> Color of the node
            node = this.checkExplicitCommunity_0(node);

            //Explicit 1 -> Shape of the node
            node = this.checkExplicitCommunity_1(node);
        }
        const nodes = new DataSet(json.users);
        return nodes;
    }

    /** Change node color based on what filtered explicit community 0 value has.
     * 
     * @param {*} node node that is going to be edited
     * @returns the node edited
     */
    checkExplicitCommunity_0(node) {
        const explValue_0 = node.explicit_community[this.explicitCommunities[0].key];

        //If the value is not included yet. Add the value to the array and map
        if (!this.explicitCommunities[0].values.includes(explValue_0)) {
            this.explicitCommunities[0].values.push(explValue_0);

            const key = explValue_0;
            const color = this.explCommOptions.getColorsForN(this.explicitCommunities[0].values.length)

            this.nodeColors.set(key, color);
        }

        node["defaultColor"] = true;
        return this.turnNodeColorToDefault(node);
    }

    /** Change node shape based on what filtered explicit community 1 value has.
    * 
    * @param {*} node node that is going to be edited
    * @returns the node edited
    */
    checkExplicitCommunity_1(node) {
        const explValue_1 = node.explicit_community[this.explicitCommunities[1].key];

        let figure;
        if (this.explicitCommunities[1].values.includes(explValue_1)) {

            figure = this.nodeShapes.get(explValue_1);
        } else {
            //If the value is not included yet. Add the value to the array and map
            this.explicitCommunities[1].values.push(explValue_1);

            const key = explValue_1;
            const shape = this.explCommOptions.getShapeForN(this.explicitCommunities[1].values.length);

            this.nodeShapes.set(key, shape);
            figure = shape;
        }

        node.shape = figure.shape;
        node.font = {
            vadjust: figure.vOffset,
        };

        return node;
    }

    /** Turn node colors to default
     * 
     * @param {*} node node that is going to be edited
     */
    turnNodeColorToDefault(node) {
        const explicit0_value = node.explicit_community[this.explicitCommunities[0].key];

        node.color = {
            background: this.nodeColors.get(explicit0_value),
            border: this.nodeColors.get(explicit0_value)
        }

        node.defaultColor = true;

        return node;
    }

    // #endregion NODES SETUP

    //#region EDGES SETUP

    /** Initialize all edges and its parameters
     * 
     * @param {*} json json with edge data
     */
    initEdges(json) {
        //Edges with value equal or below to this will be hidden
        this.edgeValueThreshold = this.config.edgeThreshold;

        //In case value key changes, this is what is compared while parsing edges json
        this.edgeValue = "value";

        //If true, edgesWidth will change based on the value (similarity) between the nodes they link
        if (this.config.variableEdge) {
            this.changeMaxEdgeWidth = true;
        } else {
            this.changeMaxEdgeWidth = false;
        }

        //Default Options
        this.maxEdgeWidth = 10;
        this.minEdgeWidth = 1;

        //TODO Implementar el cambio de colores de aristas
        this.defaultEdgeColor;
        this.selectedEdgeColor;

        this.data.edges = this.parseEdges(json)
    }

    /** Parse the JSON object to get the edges of the network
     * 
     * @param {*} json //JSON object that will be parsed to get its nodes
     * @returns edges dataSet
     */
    parseEdges(json) {
        //Get edges from json
        const edges = new Array();
        for (const edge of json.similarity) {
            //Dont save edges with no similarity
            if (edge[this.edgeValue]) {
                //Dont save autoedges
                if (edge["u1"] !== edge["u2"]) {

                    //Update targets to vis format
                    edge["from"] = edge["u1"];
                    edge["to"] = edge["u2"];

                    delete edge["u1"];
                    delete edge["u2"];

                    //Vis use "value" key to change edges width in case we activate the option.
                    edge["value"] = edge[this.edgeValue];
                    if (this.edgeValue !== "value")
                        delete edge[this.edgeValue];

                    //DEBUG TO CHECK PERFORMANCE WITH LABELS
                    if (this.key === "agglomerativeClusteringGAM&Labels") {
                        edge["label"] = edge["value"].toString();
                    }

                    if (edge["value"] < this.edgeValueThreshold) {
                        edge["hidden"] = true;
                    } else
                        edge["hidden"] = false;

                    edges.push(edge);
                }
            }
        }
        const output = new DataSet(edges);
        return output;
    }

    // #endregion EDGES SETUP

    //#region DATATABLE SETUP

    /**
    * Initialize all parameters related with the dataTable of the selected node and create it
    */
    initDataTable() {
        //Internal/Aux attributes that are not intended to be shown to the user. These tags should be the same as the node keys names
        this.notShowAttributes = new Array("defaultColor", "borderWidth", "color", "group", "shape", "font");

        //Atributes that all nodes have and are important to show. These tags should be the same as the node keys names
        this.mainShowAttributes = new Array("id", "label", "implicit_Comm");

        //Array with all dataTable columns. Its used to easily iterate over all of them
        this.dataPanelContainers = new Array();

        this.createEmptyDataTable();
    }

    /**
     * Create an empty DataPanel 
     */
    createEmptyDataTable() {
        const nRow = this.getNrows();

        const dataContainer = document.createElement('div');
        dataContainer.className = "border border-dark rounded";

        const titleContainer = document.createElement('h5');
        titleContainer.className = "middle attributes border-bottom border-dark";
        titleContainer.textContent = "Node Attributes";

        dataContainer.appendChild(titleContainer);

        for (let i = 0; i < nRow; i++) {

            const row = document.createElement('div');
            row.className = "row dataRow border-bottom border-dark";

            if (i >= this.mainShowAttributes.length - 1)
                row.className = "row dataRow";

            const colLeft = document.createElement("div");
            colLeft.className = "col-6 ";
            colLeft.innerHTML = "";

            if (i < this.mainShowAttributes.length)
                colLeft.innerHTML = "<b>" + this.mainShowAttributes[i] + "</b>";

            const colRight = document.createElement("div");
            colRight.className = "col-6 ";
            colRight.innerHTML = "";

            this.dataPanelContainers.push({ left: colLeft, right: colRight, row: row });

            row.appendChild(colLeft);
            row.appendChild(colRight);
            dataContainer.appendChild(row);
        }

        this.dataContainer.appendChild(dataContainer);
    }

    /**
     * Get the number of rows of node attributes
     * @returns The number of rows
     */
    getNrows() {
        let maxLength = 0;
        let maxNode;
        this.data.nodes.forEach((node) => {

            let length = Object.keys(node).length
            length += Object.keys(node.explicit_community).length;

            if (length > maxLength) {
                maxLength = length;
                maxNode = node;
            }
        });

        //Delete all attributes that should not be shown
        for (let key of Object.keys(maxNode)) {
            if (this.notShowAttributes.includes(key)) {
                maxLength--;
            }
        }

        return maxLength;
    }


    //#endregion DATATABLE SETUP

    /**
    * Initialize vis.network options
    */
    chooseOptions() {
        //Edge generic options
        let max;
        if (this.changeMaxEdgeWidth) {
            max = this.maxEdgeWidth;
        } else {
            max = this.minEdgeWidth;
        }

        //Global generic options
        this.options = {
            autoResize: true,
            edges: {
                scaling: {
                    min: this.minEdgeWidth,
                    max: max,
                    label: {
                        enabled: false
                    }
                },
                color: {
                    color: '#848484',
                    highlight: '#848484'
                },
                font: {
                    strokeWidth: 0,
                    size: 20,
                    color: "#000000",
                    align: "top",
                    vadjust: -7
                },
                smooth: {
                    enabled: false,
                }

            },
            nodes: {
                shape: 'circle',
                borderWidth: 3,
                borderWidthSelected: 4,
                shape: "diamond",
                shapeProperties: {
                    interpolation: false
                },
                size: this.defaultNodeSize,
                chosen: {
                    node: this.nodeChosen.bind(this),
                    label: this.labelChosen.bind(this),
                },

            },
            groups: {
                useDefaultGroups: false
            },
            physics: {
                enabled: false,
                barnesHut: {
                    springConstant: 0,
                    avoidOverlap: 0.1
                }

            },
            interaction: {
                zoomView: true,
                dragView: true,
                hover: false,
                hoverConnectedEdges: false,
            },
            layout: {
                improvedLayout: false,
            }
        };
    }


    /**
     * Draw the network and initialize all Events
     */
    drawNetwork() {
        this.network = new Network(this.container, this.data, this.options);
        this.network.stabilize();

        this.container.firstChild.id = "topCanvas_" + this.key;

        //this.network.on("beforeDrawing", (ctx) => this.preDrawEvent(ctx));
        this.network.on("click", (event) => this.clickEventCallback(event));
        this.network.on("zoom", (event) => this.zoomEventCallback(event));
    }

    //#region PREDRAW EVENT

    /** Function executed when "beforeDrawing" event is launched.
     * 
     * @param {*} ctx Context object necesary to draw in the network canvas
     */
    preDrawEvent(ctx) {
        this.ctx = ctx;
        this.drawBoundingBoxes(ctx);
    }

    /** Iterate over all nodes getting the bounding box of every "boxGroup", and draw them
     * 
     * @param {*} ctx Context object necesary to draw in the network canvas
     */
    drawBoundingBoxes(ctx) {
        const bigBoundBoxes = new Array();
        bigBoundBoxes.push(null);
        bigBoundBoxes.push(null);
        bigBoundBoxes.push(null);
        bigBoundBoxes.push(null);
        bigBoundBoxes.push(null);

        //Obtain the bounding box of every boxGroup of nodes
        this.data.nodes.forEach((node) => {
            const group = node["implicit_Comm"];

            let bb = this.network.getBoundingBox(node.id)
            if (bigBoundBoxes[group] === null)
                bigBoundBoxes[group] = bb;
            else {
                if (bb.left < bigBoundBoxes[group].left)
                    bigBoundBoxes[group].left = bb.left;

                if (bb.top < bigBoundBoxes[group].top)
                    bigBoundBoxes[group].top = bb.top;

                if (bb.right > bigBoundBoxes[group].right)
                    bigBoundBoxes[group].right = bb.right;

                if (bb.bottom > bigBoundBoxes[group].bottom)
                    bigBoundBoxes[group].bottom = bb.bottom;
            }
        })


        //Draw the bounding box of all groups
        for (let i = 0; i < bigBoundBoxes.length; i++) {
            if (bigBoundBoxes[i] !== null) {
                const bb = bigBoundBoxes[i];

                //Draw Border
                ctx.lineWidth = this.boxBorderWidth;
                ctx.strokeStyle = this.bbColor[i].border;
                ctx.strokeRect(bb.left, bb.top, bb.right - bb.left, bb.bottom - bb.top);

                //Draw Background
                ctx.lineWidth = 0;
                ctx.fillStyle = this.bbColor[i].color;
                ctx.fillRect(bb.left, bb.top, bb.right - bb.left, bb.bottom - bb.top);
            }
        }
    }
    //#endregion PREDRAW EVENT

    //#region CLICK EVENT

    /** Function executed when the user clicks inside the network canvas
     * 
     * @param {*} event Click event
     */
    clickEventCallback(event) {
        if (event.nodes.length > 0) {
            this.nodeHasBeenClicked(event.nodes[0]);
        } else {
            this.noNodeIsClicked()
        }
    }

    /** Function executed only when it was this network the one that was clicked a node
    * 
    * @param {*} id id of the node 
    */
    nodeHasBeenClicked(id) {
        this.networkManager.nodeSelected(id);

        //We only create the tooltip in this network
        //We need a timeout to print the tooltip once zoom has ended
        setTimeout(function () {
            this.updateTooltip(id);
        }.bind(this), this.zoomDuration + 100);
    }

    /** Select the node whose id is id parameter and darken all other nodes
     * 
     * @param {*} id //Id of the node
     */
    nodeSelected(id) {
        this.network.selectNodes([id], false);

        this.updateDataPanel(id);

        //Search for the nodes that are connected to the selected Node
        const selectedNodes = new Array();
        selectedNodes.push(id)

        const connected_edges = this.network.getConnectedEdges(selectedNodes[0]);
        const clickedEdges = this.data.edges.get(connected_edges);

        clickedEdges.forEach((edge) => {
            if (!edge.hidden) {
                if (edge.from !== selectedNodes[0] && edge.to === selectedNodes[0]) {
                    selectedNodes.push(edge.from);
                } else if (edge.to !== selectedNodes[0] && edge.from === selectedNodes[0]) {
                    selectedNodes.push(edge.to);
                }
            }
        })

        //Move the "camera" to focus on these nodes
        const fitOptions = {
            nodes: selectedNodes,
            animation: {
                duration: this.zoomDuration,
            },
        }
        this.network.fit(fitOptions);

        //Update all nodes color acording to their selected status
        const newNodes = new Array();
        this.data.nodes.forEach((node) => {
            if (selectedNodes.includes(node.id)) {
                if (!node.defaultColor) {
                    newNodes.push(this.turnNodeColorToDefault(node));
                }

            } else if (node.defaultColor) {
                newNodes.push(this.turnNodeDark(node));
            }
        });

        this.data.nodes.update(newNodes);
    }

    /** Change node colors to grey colors
     * 
     * @param {*} node edited node
     */
    turnNodeDark(node) {
        node.defaultColor = false;
        node.color = this.darkNodeColor;

        return node;
    }

    /** 
     * Function executed only when it was this network the one that unselected a node
     */
    noNodeIsClicked() {
        this.networkManager.nodeDeselected();
    }

    /**
     * Restore the network to the original deselected state
     */
    nodeDeselected() {
        //Return to fit all nodes into the "camera"
        const fitOptions = {
            animation: true
        }
        this.network.fit(fitOptions);

        this.clearDataPanel();

        this.network.unselectAll();

        const newNodes = new Array();
        this.data.nodes.forEach((node) => {
            if (!node.defaultColor)
                newNodes.push(this.turnNodeColorToDefault(node));
        });

        this.data.nodes.update(newNodes);
    }

    /** Function executed when a node is selected
     * 
     * @param {*} values parameters of the node
     * @param {*} id id of the node
     * @param {*} selected if the node has been selected
     * @param {*} hovering if the node has been hovered
     */
    nodeChosen(values, id, selected, hovering) {

        if (selected) {
            values.size = this.SelectedNodeSize;
        }

    }

    labelChosen(values, id, selected, hovering) {
        if (selected) {
            values.vadjust -= 10;
        }
    }
    //#endregion EVENTS

    zoomEventCallback(event) {
        if (this.tooltip !== undefined) {
            this.updateTooltip(this.selectedNodeId, false);
        }
    }
    //#region TOOLTIP
    /** Update or create the tooltip of the node id
     * 
     * @param {*} id id of the node
     */
    updateTooltip(id, respawn = true) {
        this.selectedNodeId = id;
        const canvasPosition = this.getElementPosition("topCanvas_" + this.key)

        const nodeCanvasPosition = this.network.getPosition(id);
        const nodePosition = this.network.canvasToDOM(nodeCanvasPosition);

        const xOffset = this.network.getScale() * 50;
        //Calculate the real absolute click coordinates
        const clickX = nodePosition.x + canvasPosition.left + xOffset;
        const clickY = nodePosition.y + canvasPosition.top;

        const title = "<h5> " + id + "</h5>";
        const content = this.getTooltipContent(id);

        if (this.tooltip === undefined) {
            //Create the popover
            const options = {
                trigger: "manual",
                placement: "right",
                fallbackPlacements: ["right"],
                content: " ",
                offset: [0, 0],
                html: true,
            };

            this.popoverContainer = document.createElement("div");
            document.body.append(this.popoverContainer);

            this.tooltip = new Popover(this.popoverContainer, options);
        }

        this.popoverContainer.style.top = clickY + "px";
        this.popoverContainer.style.left = clickX + "px";
        this.popoverContainer.style.position = "absolute";



        if (respawn) {
            this.tooltip.setContent({
                '.popover-header': title,
                '.popover-body': content
            });
            this.tooltip.show();
        }else{
            this.tooltip.update();
        }

        this.networkManager.setTooltip(this.tooltip);
    }

    /** Get the element position in the dom
     * 
     * @param {*} id id of the element
     * @returns and object with the top and left position
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


    /** Returns the tooltip content of a node
     * 
     * @param {*} id id of the node
     * @returns string with the content
     */
    getTooltipContent(id) {
        const node = this.data.nodes.get(id);
        let content = "";

        content += "<b> label: </b> " + node["label"] + "<br>";
        content += "<b> group: </b> " + node["implicit_Comm"] + "<br>";

        const keys = Object.keys(node.explicit_community);
        for (let i = 0; i < keys.length; i++) {
            content += "<b>" + keys[i] + "</b> " + node.explicit_community[keys[i]] + "<br>";

        }

        return content;
    }

    //#endregion TOOLTIP

    //#region DATATABLE

    /** Update the data panel with the node with the data
     * 
     * @param {*} id id of the node
     */
    updateDataPanel(id) {
        const node = this.data.nodes.get(id);

        this.clearDataPanel();

        let lastImportantRowIndex;
        let rowIndex = 0;

        //Add the important attributes in their fixed order
        for (let i = 0; i < this.mainShowAttributes.length; i++) {
            const currentKey = this.mainShowAttributes[i];

            this.updateDataPanelRow(rowIndex, currentKey, node[currentKey], true, false);

            lastImportantRowIndex = rowIndex;
            rowIndex++;
        }

        let lastRowIndex = lastImportantRowIndex;

        const keys = Object.keys(node.explicit_community);
        //We only want to show explicit community info from the unimportant attributes
        for (let i = 0; i < keys.length; i++) {
            const currentKey = keys[i];

            if (lastImportantRowIndex !== null) {
                this.dataPanelContainers[lastImportantRowIndex].row.className = "row dataRow border-bottom border-primary";
                lastImportantRowIndex = null;
            }

            this.updateDataPanelRow(rowIndex, currentKey, node.explicit_community[currentKey], true, true);

            lastRowIndex = rowIndex;
            rowIndex++;
        }

        this.dataPanelContainers[lastRowIndex].row.className = "row dataRow";
    }

    /**
     * Clear all data from DataPanel while mantaining the important keys
     */
    clearDataPanel() {
        for (let i = 0; i < this.dataPanelContainers.length; i++) {
            let hasBottomBorder = true;
            let keyName = "";

            if (i >= this.mainShowAttributes.length - 1)
                hasBottomBorder = false;

            if (i < this.mainShowAttributes.length)
                keyName = this.mainShowAttributes[i];

            this.updateDataPanelRow(i, keyName, "", hasBottomBorder);
        }
    }

    /** Update a dataPanel row 
     * 
     * @param {*} index index of the row to update
     * @param {*} key new Text in the left column
     * @param {*} value new Text in the right column
     * @param {*} bottomBorder Boolean indicating if the row should have bottom Border
     */
    updateDataPanelRow(index, key, value, bottomBorder, greyBorder) {
        this.dataPanelContainers[index].left.innerHTML = "<b>" + key + "</b>";
        this.dataPanelContainers[index].right.innerHTML = value;

        if (!bottomBorder) {
            this.dataPanelContainers[index].row.className = "row dataRow";
        } else if (greyBorder) {
            this.dataPanelContainers[index].row.className = "row dataRow border-bottom border-grey";
        } else
            this.dataPanelContainers[index].row.className = "row dataRow border-bottom border-dark";
    }
    //#endregion DATATABLE

    /**
     * Hide all edges below a set threshold
     */
    hideEdgesbelowThreshold(newThreshold) {
        this.edgeValueThreshold = newThreshold;

        const newEdges = new Array();
        this.data.edges.forEach((edge) => {
            if (edge["value"] < this.edgeValueThreshold) {
                if (!edge["hidden"]) {
                    edge["hidden"] = true;
                }
            } else {
                if (edge["hidden"]) {
                    edge["hidden"] = false;
                }
            }

            newEdges.push(edge);
        })

        this.data.edges.update(newEdges);
    }

    /**
     * Destroy the network 
     */
    clearNetwork() {
        this.network.destroy();
    }

    /**
     * Update the max width based on current this.changeMaxEdgeWidth parameter. If true, the width of edges will vary based on their "value" parameter
     */
    updateVariableEdge(newBool) {
        this.changeMaxEdgeWidth = newBool;

        let max;
        if (this.changeMaxEdgeWidth) {
            max = this.maxEdgeWidth;
        } else {
            max = this.minEdgeWidth;
        }
        this.options.edges.scaling.max = max;

        this.network.setOptions(this.options);

        //Update all edges with the new options
        this.data.edges.update(this.data.edges);
    }

    highlightCommunity(selectedCommunities) {
        const n = selectedCommunities.length;

        if (n === 0) {
            this.nodeDeselected();
        } else {
            //Update all nodes color acording to their selected status
            const newNodes = new Array();
            this.data.nodes.forEach((node) => {
                let count = 0;
                for (let i = 0; i < n; i++) {
                    if (this.nodeHasCommunity(node, selectedCommunities[i].key, selectedCommunities[i].values)) {
                        count++;
                    }
                }

                if (count === n)
                    newNodes.push(this.turnNodeColorToDefault(node));
                else
                    newNodes.push(this.turnNodeDark(node));
            });

            this.data.nodes.update(newNodes);
        }
    }

    nodeHasCommunity(node, key, values) {
        for (let i = 0; i < values.length; i++) {

            if (node.explicit_community[key] === values[i])
                return true;
        }

        return false;
    }

    getExplicitCommunities() {
        return this.explicitCommunities;
    }
}


