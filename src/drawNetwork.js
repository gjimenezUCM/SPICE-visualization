import { DataSet } from "vis-data/peer";
import { Network } from "vis-network/peer";

export default class DrawNetwork {

    /** Constructor that will draw the network
     * 
     * @param {*} jsonInput json with all the necesary data to create the nodes and edges
     * @param {*} container container where the network will be created
     */
    constructor(jsonInput, container, networkManager) {
        this.container = container;
        this.networkManager = networkManager;

        this.activateEdgeLabels = true;

        this.initEdgesParameters();
        this.initNodesParameters();
        this.initBoundingBoxesParameters();

        this.parseJson(jsonInput);

        this.chooseOptions(jsonInput);

        this.drawNetwork();
    }

    /**
     * Initialize all parameters related with Edges
     */
    initEdgesParameters() {
        //Edges with value equal or below to this wont be drawn
        this.edgeValueThreshold = document.getElementById('edgeThreshold').value;

        //In case value key changes, this is what is compared while parsing edges json
        this.edgeValue = "value";

        this.maxEdgeWidth = 13;
        this.minEdgeWidth = 3;

        //If true, edgesWidth will change based on the value (similarity) between the nodes they link
        if (document.getElementById('changeMaxEdgeWidth').checked) {
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
        this.groupColor.push({ color: "rgba(110, 143, 254, 1)", border: "rgba(92, 92, 235, 1)", 
                            colorSelected: "rgba(184, 202, 255, 1)", borderSelected: "rgba(164, 164, 238, 1)" }); //Blue
        this.groupColor.push({ color: "rgba(255, 130, 132, 1)", border: "rgba(224, 100, 103, 1)", 
                            colorSelected: "rgba(238, 193, 174, 1)", borderSelected: "rgba(230, 172, 173, 1)" }); //Red

       
    }

    /**
     * Initialize all parameters related with bounding boxes of node groups
     */
    initBoundingBoxesParameters() {
        //In case group key changes, this is what is compared while parsing nodes json
        this.boxGroup_key = "group";

        this.boxBorderWidth = 4;

        this.boxGroupColor = new Array();
        this.boxGroupColor.push({ color: "rgba(248, 212, 251, 0.6)", border: "rgba(242, 169, 249, 1)" }); //Purple
        this.boxGroupColor.push({ color: "rgba(255, 255, 170, 0.6)", border: "rgba(255, 222, 120, 1)" }); //Yellow
        this.boxGroupColor.push({ color: "rgba(211, 245, 192, 0.6)", border: "rgba(169, 221, 140, 1)" }); //Green
        this.boxGroupColor.push({ color: "rgba(254, 212, 213, 0.6)", border: "rgba(252, 153, 156, 1)" }); //Red
        this.boxGroupColor.push({ color: "rgba(220, 235, 254, 0.6)", border: "rgba(168, 201, 248, 1)" }); //Blue
    }

    /** Parse the JSON object to get the necesary data to create the network
     * 
     * @param {*} json //JSON object that will be parsed to get the necesary data to create the network
     */
    parseJson(json) {
        //Get nodes from json
        const nodes = this.parseNodes(json);
        const edges = this.parseEdges(json);

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
            node["boxGroup"] = parseInt(node[this.boxGroup_key]);

            //Vis uses "group" key to change the color of all nodes with the same key
            node["group"] = "group_" + node[this.groupColor_key];
            delete node[this.groupColor_key];
        }
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
        for (const edge of json.similarity) {
            //Update targets to vis format
            edge["from"] = edge["u1"];
            edge["to"] = edge["u2"];

            delete edge["u1"];
            delete edge["u2"];

            //Vis use "value" key to change edges width. This way edges with higher similarity will be stronger
            edge["value"] = edge[this.edgeValue];
            if (this.edgeValue !== "value")
                delete edge[this.edgeValue];

            //Vis use "label" key to show text above each edge. We can use it to see the similarity of each edge
            if (this.activateEdgeLabels)
                edge["label"] = edge["value"].toString();

            edge["hidden"] = false;
        }
        const edges = new DataSet(json.similarity);

        return edges;
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
                smooth: false

            },
            nodes: {
                shape: 'circle',
                borderWidth: 3,
                borderWidthSelected: 4,
                widthConstraint: 30,
                font: {
                    size: 20
                },
            },
            groups: {
                group_0: {
                    color: {
                        background: this.groupColor[0].color,
                        border: this.groupColor[0].border,
                        highlight: {
                            background: this.groupColor[0].colorSelected,
                            border: this.groupColor[0].borderSelected,
                        }
                    }
                },
                group_1: {
                    color: {
                        background: this.groupColor[1].color,
                        border: this.groupColor[1].border,
                        highlight: {
                            background: this.groupColor[1].colorSelected,
                            border: this.groupColor[1].borderSelected,
                        }
                    }
                }
            },
            physics: {
                enabled: false
            },
            interaction: {
                zoomView: false,
                dragView: false,
            }
        };
    }

    /**
     * Draw the network with the parsed data and options chosen in the container and initialize the Events of the network
     */
    drawNetwork() {
        this.network = new Network(this.container, this.data, this.options);
        this.network.on("beforeDrawing", (ctx) => this.preDrawEvent(ctx));

        this.network.on("selectNode", (event) => this.nodeSelectedCallback(event.nodes[0]));
        this.network.on("deselectNode", () => this.nodeDeselectedCallback());

        this.hideEdgesbelowThreshold();
    }

    /** When a node is selected, it tells to the network manager to select the same node in all networks
     * 
     * @param {*} id id of the node 
     */
    nodeSelectedCallback(id){
        console.log(id);
        
        if(id !== undefined)
            this.networkManager.nodeSelected(id);
    }

    /** When a node is deselected, it tells to the network manager to deselect all nodes;
     * 
     */
    nodeDeselectedCallback(){
        this.networkManager.nodeDeselected();
    }

    /** Select the node whose id is id parameter and darken all other nodes
     * 
     * @param {*} id //Id of the node
     */
    nodeSelected(id){
        this.network.selectNodes([id], true);

        const selectedNodes = new Array();
        selectedNodes.push( id )

        const connected_edges = this.network.getConnectedEdges(selectedNodes[0]);
        const clickedEdges = this.data.edges.get(connected_edges);

        clickedEdges.forEach((edge) => {
            if(!edge.hidden){
                if(edge.from !== selectedNodes[0] ){
                    selectedNodes.push( edge.from );
                }else{
                    selectedNodes.push( edge.to );
                }
            }
        })

        this.data.nodes.forEach((node) => {
            if(selectedNodes.includes(node.id)){
                this.turnNodeColorToDefault(node);
            }else
                this.darkenNode(node);

        });

    }

    /**
     * Return all nodes to default color mode
     */
    nodeDeselected(){
        this.network.unselectAll();

        this.data.nodes.forEach((node) => {
                this.turnNodeColorToDefault(node);
        });
    }

    /** Reset node colors to default
     * 
     * @param {*} node 
     */
    turnNodeColorToDefault(node){
        node.borderWidth = this.options.nodes.borderWidth;

        const color = this.options.groups[node["group"]].color;
        node["color"] = color;

        this.data.nodes.update(node);
    }

    /** Change node colors to grey colors
     * 
     * @param {*} node 
     */
    darkenNode(node){
        node.borderWidth = 1;
        node.color = {background: "rgba(155, 155, 155, 1)", border: "rgba(100, 100, 100, 1)"};

        this.data.nodes.update(node);
    }


    /** Function executed when "beforeDrawing" event is launched.
     * 
     * @param {*} ctx Context object necesary to draw in the network canvas
     */
    preDrawEvent(ctx) {
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
            const group = node["boxGroup"];

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
                ctx.strokeStyle = this.boxGroupColor[i].border;
                ctx.strokeRect(bb.left, bb.top, bb.right - bb.left, bb.bottom - bb.top);

                //Draw Background
                ctx.lineWidth = 0;
                ctx.fillStyle = this.boxGroupColor[i].color;
                ctx.fillRect(bb.left, bb.top, bb.right - bb.left, bb.bottom - bb.top);
            }
        }
    }

    /**
     * Hide all edges below a set threshold
     */
    hideEdgesbelowThreshold() {
        this.data.edges.forEach((edge) => {

            if (edge["value"] < this.edgeValueThreshold) {
                if (!edge["hidden"]) {
                    edge["hidden"] = true;
                    this.data.edges.update(edge);
                }
            } else {
                if (edge["hidden"]) {
                    edge["hidden"] = false;
                    this.data.edges.update(edge);
                }
            }
        })
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
    changeAllMaxEdgesWidth() {
        let max;
        if (this.changeMaxEdgeWidth) {
            max = this.maxEdgeWidth;
        } else {
            max = this.minEdgeWidth;
        }
        this.options.edges.scaling.max = max;

        this.network.setOptions(this.options);

        //Update all edges with the new options
        this.data.edges.forEach((edge) => {
            this.data.edges.update(edge);
        });
    }
}