import { DataSet } from "vis-data/peer";
import { Network } from "vis-network/peer";
import 'bootstrap';

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

        this.activateEdgeLabels = true;

        this.initEdgesParameters();
        this.initNodesParameters();
        this.initBoundingBoxesParameters();
        this.initDataTableParameters();

        this.parseJson(jsonInput);
        //this.initNodeDataPanel();
        this.chooseOptions(jsonInput);

        this.drawNetwork();
    }

    /**
     * Initialize all parameters related with Edges
     */
    initEdgesParameters() {
        //Edges with value equal or below to this wont be drawn
        console.log(this.config);
        this.edgeValueThreshold = this.config.edgeThreshold;

        //In case value key changes, this is what is compared while parsing edges json
        this.edgeValue = "value";

        this.maxEdgeWidth = 13;
        this.minEdgeWidth = 3;

        //If true, edgesWidth will change based on the value (similarity) between the nodes they link
        if (this.config.variableEdge) {
            this.changeMaxEdgeWidth = true;
        } else {
            this.changeMaxEdgeWidth = false;
        }
    }

    /**
     * Initialize all parameters related with Nodes
     */
    initNodesParameters() {
        //In case explicit_community key changes, this is what is compared while parsing nodes json
        this.groupColor_key = "explicit_community";

        this.groupColor = new Array();
        this.groupColor.push({
            color: "rgba(110, 143, 254, 1)", border: "rgba(92, 92, 235, 1)",
            colorSelected: "rgba(184, 202, 255, 1)", borderSelected: "rgba(164, 164, 238, 1)"
        }); //Blue
        this.groupColor.push({
            color: "rgba(255, 130, 132, 1)", border: "rgba(224, 100, 103, 1)",
            colorSelected: "rgba(238, 193, 174, 1)", borderSelected: "rgba(230, 172, 173, 1)"
        }); //Red

        this.darkenColor = { background: "rgba(155, 155, 155, 0.3)", border: "rgba(100, 100, 100, 0.3)" };

        //Duration of the zoomIn/zoomOut when a node is selected
        this.zoomDuration = 1000;
    }

    /**
     * Initialize all parameters related with bounding boxes of node groups
     */
    initBoundingBoxesParameters() {
        //In case group key changes, this is what is compared while parsing nodes json
        this.implicitCommunity_key = "group";

        this.boxBorderWidth = 4;

        this.ImplCommColor = new Array();
        this.ImplCommColor.push({ color: "rgba(248, 212, 251, 0.6)", border: "rgba(242, 169, 249, 1)" }); //Purple
        this.ImplCommColor.push({ color: "rgba(255, 255, 170, 0.6)", border: "rgba(255, 222, 120, 1)" }); //Yellow
        this.ImplCommColor.push({ color: "rgba(211, 245, 192, 0.6)", border: "rgba(169, 221, 140, 1)" }); //Green
        this.ImplCommColor.push({ color: "rgba(254, 212, 213, 0.6)", border: "rgba(252, 153, 156, 1)" }); //Red
        this.ImplCommColor.push({ color: "rgba(220, 235, 254, 0.6)", border: "rgba(168, 201, 248, 1)" }); //Blue
    }

    /**
     * Initialize all parameters related with the dataTable of the selected node
     */
    initDataTableParameters() {
        //Internal/Aux attributes that are not intended to be shown to the user. These tags should be the same as the node keys names
        this.notShowAttributes = new Array("defaultColor", "borderWidth", "color", "group");

        //Atributes that all nodes have and are important to show. These tags should be the same as the node keys names
        this.mainShowAttributes = new Array("id", "label", this.groupColor_key, "Implicit_Comm");

        //Array with all dataTable columns. Its used to easily iterate over all of them
        this.dataPanelContainers = new Array();
    }

    /** Parse the JSON object to get the necesary data to create the network
     * 
     * @param {*} json //JSON object that will be parsed to get the necesary data to create the network
     */
    parseJson(json) {
        //Get nodes from json
        const nodes = this.parseNodes(json);
        const edges = this.parseEdges(json);
        //this.communities = this.parseCommunities();

        this.data = {
            nodes: nodes,
            edges: edges
        };
    }

    /** Parse the JSON object to get the nodes of the network
     * 
     * @param {*} json //JSON object that will be parsed to get its nodes
     * @returns 
     */
    parseNodes(json) {
        for (const node of json.users) {

            //"BoxGroup" is the key we will use to track what nodes should be inside the same big bounding box
            node["Implicit_Comm"] = parseInt(node[this.implicitCommunity_key]);

            //Vis uses "group" key to change the color of all nodes with the same key
            node["Group"] = node["group"]
            node["group"] = 0;
            //group_" + node[this.groupColor_key];

            //This attribute will be used to know if the node is with the default color. To improve performance
            node["defaultColor"] = true;

            //TODO Cambiarlo
            //node["group"] = 0;
        }
        console.log(json.users);
        const nodes = new DataSet(json.users);
        return nodes;
    }

    /** Parse the JSON object to get the edges of the network
     * 
     * @param {*} json //JSON object that will be parsed to get its nodes
     * @returns 
     */
    parseEdges(json) {
        //Get edges from json
        const edges = new Array();
        for (const edge of json.similarity) {
            if (edge[this.edgeValue]) {
                //Update targets to vis format
                edge["from"] = edge["u1"];
                edge["to"] = edge["u2"];

                delete edge["u1"];
                delete edge["u2"];

                //Vis use "value" key to change edges width. This way edges with higher similarity will be stronger
                edge["value"] = edge[this.edgeValue];
                if (this.edgeValue !== "value")
                    delete edge[this.edgeValue];

                if (edge["value"] < this.edgeValueThreshold)
                    edge["hidden"] = true;
                else
                    edge["hidden"] = false;

                //See label testing
                if (this.key === "noAgglomerativeClusteringGAM") {
                    edge["label"] = edge["value"].toString();
                }
                edges.push(edge);
            }

        }
        const output = new DataSet(edges);

        return output;
    }

    /**
     * Initialize an empty DataPanel 
     */
    initNodeDataPanel() {
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
            const length = Object.keys(node).length
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

    /** Returns if a key should be shown in data panel
     * 
     * @param {*} key Key to be compared 
     * @returns Boolean 
     */
    canShowKey(key) {
        switch (key) {
            case "defaultColor":
            case 'borderWidth':
            case 'color':
            case "label":
                return false;
            default:
                return true;
        }
    }

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
                shapeProperties: {
                    interpolation: false    // 'true' for intensive zooming
                },
            },
            groups: {
                useDefaultGroups: false
            },
            physics: {
                barnesHut: {
                    springConstant: 0,
                    avoidOverlap: 0.2
                }

            },
            interaction: {
                zoomView: true,
                dragView: true,
                hover: false,
                hoverConnectedEdges: false,
            },
            layout: {
                improvedLayout: true,
            }
        };
    }

    /**
     * Draw the network and initialize all Events
     */
    drawNetwork() {
        console.log("drawNetwork Start " + new Date().toLocaleTimeString());
        this.network = new Network(this.container, this.data, this.options);
        console.log("drawNetwork Ends " + new Date().toLocaleTimeString());
        this.network.stabilize();
        this.container.firstChild.id = "topCanvas_" + this.key;

        //this.network.on("beforeDrawing", (ctx) => this.preDrawEvent(ctx));
        this.network.on("click", (event) => this.clickEventCallback(event));

        //this.hideEdgesbelowThreshold(this.edgeValueThreshold);
    }

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

        //We only create the tooltip in this networw
        //We need a timeout to print the tooltip once zoom has ended
        setTimeout(function () {
            this.updateTooltip(id);
        }.bind(this), this.zoomDuration);
    }

    /** Update or create the tooltip of the node id
     * 
     * @param {*} id id of the node
     */
    updateTooltip(id) {
        const canvasPosition = this.getElementPosition("topCanvas_" + this.key)

        const nodeCanvasPosition = this.network.getPosition(id);
        const nodePosition = this.network.canvasToDOM(nodeCanvasPosition);

        //Calculate the real absolute click coordinates
        const clickX = nodePosition.x + canvasPosition.left + 35;
        const clickY = nodePosition.y + canvasPosition.top;

        const title = "<h5> " + id + "</h5>";
        const content = this.getTooltipContent(id);

        if (this.tooltip === undefined) {
            //Create the popup
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

            this.tooltip = new bootstrap.Popover(this.popoverContainer, options);
        }

        this.popoverContainer.style.top = clickY + "px";
        this.popoverContainer.style.left = clickX + "px";
        this.popoverContainer.style.position = "absolute";

        this.tooltip.setContent({
            '.popover-header': title,
            '.popover-body': content
        })

        this.tooltip.show();

        this.networkManager.setTooltip(this.tooltip);
    }

    /** Returns the tooltip content of a node
     * 
     * @param {*} id id of the node
     * @returns string with the content
     */
    getTooltipContent(id) {
        const node = this.data.nodes.get(id);
        let content = "";

        content += "<b> Label: </b> " + node["label"] + "<br>";
        content += "<b> " + this.groupColor_key + ": </b> " + node[this.groupColor_key] + "<br>";
        content += "<b> Group: </b> " + node["Implicit_Comm"] + "";

        return content;
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
    /** Function executed only when it was this network the one that unselected a node
     * 
     */
    noNodeIsClicked() {
        this.networkManager.nodeDeselected();
    }

    /** Select the node whose id is id parameter and darken all other nodes
     * 
     * @param {*} id //Id of the node
     */
    nodeSelected(id) {
        this.network.selectNodes([id], true);

        this.updateDataPanel(id);

        //Search for the nodes that are connected to the selected Node
        const selectedNodes = new Array();
        selectedNodes.push(id)

        const connected_edges = this.network.getConnectedEdges(selectedNodes[0]);
        const clickedEdges = this.data.edges.get(connected_edges);

        clickedEdges.forEach((edge) => {
            if (!edge.hidden) {
                if (edge.from !== selectedNodes[0]) {
                    selectedNodes.push(edge.from);
                } else {
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
        this.data.nodes.forEach((node) => {
            if (selectedNodes.includes(node.id)) {
                if (!node.defaultColor)
                    this.turnNodeColorToDefault(node);

            } else if (node.defaultColor)
                this.darkenNode(node);

        });

    }

    /** Update the data panel with the node with the data
     * 
     * @param {*} id id of the node
     */
    updateDataPanel(id) {
        const node = this.data.nodes.get(id);
        const keys = Object.keys(node);

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
        //Add unimportant attributes
        for (let i = 0; i < keys.length; i++) {

            //If its an available attribute that has not been already included as a main Attribute
            if (!this.notShowAttributes.includes(keys[i]) && !this.mainShowAttributes.includes(keys[i])) {
                const currentKey = keys[i];

                if (lastImportantRowIndex !== null) {
                    this.dataPanelContainers[lastImportantRowIndex].row.className = "row dataRow border-bottom border-primary";
                    lastImportantRowIndex = null;
                }

                this.updateDataPanelRow(rowIndex, currentKey, node[currentKey], true, true);

                lastRowIndex = rowIndex;
                rowIndex++;
            }
        }

        this.dataPanelContainers[lastRowIndex].row.className = "row dataRow";
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

        this.data.nodes.forEach((node) => {
            if (!node.defaultColor)
                this.turnNodeColorToDefault(node);
        });
    }

    /** Reset node colors to default
     * 
     * @param {*} node 
     */
    turnNodeColorToDefault(node) {
        node.defaultColor = true;

        node.borderWidth = this.options.nodes.borderWidth;
        const color = this.options.groups[node["group"]].color;
        node["color"] = color;

        this.data.nodes.update(node);
    }

    /** Change node colors to grey colors
     * 
     * @param {*} node 
     */
    darkenNode(node) {
        node.defaultColor = false;

        node.borderWidth = 1;
        node.color = this.darkenColor;

        this.data.nodes.update(node);
    }


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
            const group = node["Implicit_Comm"];

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
                ctx.strokeStyle = this.ImplCommColor[i].border;
                ctx.strokeRect(bb.left, bb.top, bb.right - bb.left, bb.bottom - bb.top);

                //Draw Background
                ctx.lineWidth = 0;
                ctx.fillStyle = this.ImplCommColor[i].color;
                ctx.fillRect(bb.left, bb.top, bb.right - bb.left, bb.bottom - bb.top);
            }
        }
    }

    /**
     * Hide all edges below a set threshold
     */
    hideEdgesbelowThreshold(newThreshold) {
        this.edgeValueThreshold = newThreshold;


        console.log("preEdge Threshold Change " + new Date().toLocaleTimeString());

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

        console.log("postEdge Threshold Change " + new Date().toLocaleTimeString());
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

    getExplicitCommunities() {

    }
}


