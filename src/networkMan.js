/**
 * @fileoverview This Class draw the network based on the inputJson, manages all network-related events and
 * edit the network or the shown info based on the user inputs.
 * @package It requires vis-Network package to be able to use the Network Class. 
 * @author Marco Expósito Pérez
 */

//Namespaces
import { edges } from "./namespaces/edges.js";
import { nodes } from "./namespaces/nodes.js";
import { networkHTML } from "./namespaces/networkHTML.js";
//Packages
import { Network } from "vis-network/peer";
//Local classes
import ImplicitCommsMan from "./networkManagerTools/implicitCommsMan.js";
import ExplicitCommsMan from "./networkManagerTools/explicitCommsMan.js";
import NodesMan from "./networkManagerTools/nodesMan.js";
import EdgesMan from "./networkManagerTools/edgesMan.js";

export default class NetworkMan {

    /**
     * Constructor of the class
     * @param {Object} jsonInput json input with all the network data
     * @param {HTMLElement} container container of the network
     * @param {HTMLElement} rightContainer container of the dataTables
     * @param {NetworkGroupManager} networkManager manager of all active networks
     * @param {Object} config config options for edges
     */
    constructor(jsonInput, container, rightContainer, networkManager, config) {
        this.container = container;
        this.groupManager = networkManager;
        this.key = config.key;

        this.implCommMan = new ImplicitCommsMan(jsonInput, rightContainer, this);
        this.explCommMan = new ExplicitCommsMan(this);

        this.nodesMan = new NodesMan(this.explCommMan, rightContainer);
        this.edgesMan = new EdgesMan(config);

        this.data =
        {
            nodes: this.nodesMan.parseNodes(jsonInput),
            edges: this.edgesMan.parseEdges(jsonInput)
        };

        this.nodesMan.createNodesDataTable();
        this.implCommMan.createCommunityDataTable();

        this.chooseOptions();
        this.drawNetwork();
    }

    /**
    * Initialize vis.network options
    */
    chooseOptions() {
        this.options = {
            autoResize: true,
            edges: {
                scaling: {
                    min: edges.EdgeMinWidth,
                    max: this.edgesMan.getMaxWidth(),
                    label: {
                        enabled: false
                    }
                },
                color: {
                    color: edges.EdgeDefaultColor,
                    highlight: edges.EdgeSelectedColor
                },
                chosen: {
                    label: this.edgesMan.labelEdgeChosen.bind(this),
                },
                font: {
                    strokeWidth: edges.LabelStrokeWidth,
                    size: edges.LabelSize,
                    color: edges.LabelColor,
                    strokeColor: edges.LabelStrokeColor,
                    align: edges.LabelAlign,
                    vadjust: edges.labelVerticalAdjust
                },
                smooth: {
                    enabled: false,
                }
            },
            nodes: {
                shape: nodes.NodeShape,
                borderWidth: nodes.NodeBorderWidth,
                borderWidthSelected: nodes.NodeBorderWidthSelected,
                shapeProperties: {
                    interpolation: false
                },
                size: nodes.DefaultSize,
                chosen: {
                    node: this.nodesMan.nodeChosen.bind(this),
                    label: this.nodesMan.labelChosen.bind(this),
                },

            },
            groups: {
                useDefaultGroups: false
            },
            physics: {
                enabled: false,
                //Avoid overlap between nodes, but enable physics. Leaving this here in case we need it in the future
                /* barnesHut: {
                    springConstant: 0,
                    avoidOverlap: 0.1
                }*/

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
        this.network = new Network(this.container, this.data, this.options);
        //this.network.stabilize();   //In case physics are active, we stop them just in case nodes start to "boing"

        this.container.firstChild.id = networkHTML.topCanvasContainer + this.key;

        this.network.on("beforeDrawing", (ctx) => this.preDrawEvent(ctx));
        this.network.on("click", (event) => this.clickEvent(event));
        this.network.on("zoom", (event) => this.zoomEvent(event));
    }

    /** 
     * Function executed when "beforeDrawing" event is launched. Happens before drawing the network
     * @param {CanvasRenderingContext2D} ctx Context object necesary to draw in the network canvas
     */
    preDrawEvent(ctx) {
        this.implCommMan.drawBoundingBoxes(ctx, this.data.nodes, this.network);
    }

    /** 
     * Function executed when "click" event is launched. Happens when the user clicks in the canvas
     * @param {Object} event Click event
     */
    clickEvent(event) {
        this.groupManager.hidePopover();

        if (event.nodes.length > 0) {
            this.nodeHasBeenClicked(event.nodes[0]);
        } else {
            this.noNodeIsClicked();
            this.implCommMan.checkBoundingBoxClick(event);
        }
    }

    /** 
     * Function executed when "zoom" event is launched. Happens when the user zooms-in in the canvas
     * @param {Object} event Zoom event
     */
    zoomEvent(event) {
        const tooltip = this.groupManager.tooltip;

        if (tooltip !== null)
            tooltip.zoomUpdate();
    }

    /** 
    * Function executed only when this was the network that received the click event on top of a node
    * @param {*} id id of the node 
    */
    nodeHasBeenClicked(id) {
        this.groupManager.nodeSelected(id);

        //We only create the tooltip in this network
        //We need a timeout to print the tooltip once zoom has ended
        setTimeout(function () {
            this.nodesMan.updateTooltip(id, this);
        }.bind(this), nodes.ZoomDuration + nodes.TooltipSpawnTimer);
    }

    /** 
     * Select the node and turn darker nodes that are not connected to it, darkens all edges not conected to it
     * and fit the camera to zoom into all not darkened nodes
     * @param {Integer} id //Id of the node
     */
    nodeSelected(id) {
        this.network.selectNodes([id], true);

        this.nodesMan.updateDataPanel(id);

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
                duration: nodes.ZoomDuration,
            },
        }
        this.network.fit(fitOptions);

        console.log(selectedNodes);
        //Update all nodes color acording to their selected status
        const newNodes = new Array();
        this.data.nodes.forEach((node) => {
            if (selectedNodes.includes(node.id)) {
                if (!node.defaultColor) {
                    this.nodesMan.turnNodeColorToDefault(node)
                    newNodes.push(node);
                }

            } else if (node.defaultColor) {
                this.nodesMan.turnNodeDark(node);
                newNodes.push(node);
            }
        });

        this.data.nodes.update(newNodes);
    }

    /** 
     * Function executed only when this was the network that received the click event but no nodes was clicked
     */
    noNodeIsClicked() {
        this.groupManager.nodeDeselected();
    }

    /**
     * Restore the network to the original deselected state
     */
    nodeDeselected() {
        //Return to fit all nodes into the "camera"
        const fitOptions = {
            animation: true,
            animation: {
                duration: nodes.ZoomDuration,
            },
        }
        this.network.fit(fitOptions);

        this.nodesMan.clearDataPanel();

        this.network.unselectAll();

        const newNodes = new Array();
        this.data.nodes.forEach((node) => {
            if (!node.defaultColor) {
                this.nodesMan.turnNodeColorToDefault(node)
                newNodes.push(node);
            }

        });

        this.data.nodes.update(newNodes);
    }

    /**
     * Destroy the network 
     */
    clearNetwork() {
        this.network.destroy();
    }

    /**
     * Highlight all nodes that contains selectedCommunities key and values
     * @param {Object} selectedCommunities Object with the format of {key: (string), values: (String[])}
     */
    highlightCommunity(selectedCommunities) {
        const n = selectedCommunities.length;
        if (n === 0) {
            this.nodeDeselected();
        } else
            this.explCommMan.highlightCommunities(selectedCommunities);
    }

    /**
     * Returns all detected Explicit Communities and the max size of our filter
     * @returns {Object} Object with the format of {data: {key: (string), values: (String[])}, filterSize: (int)}
     */
    getExplicitCommunities() {
        return this.explCommMan.getCommunitiesData();
    }


}


