/**
 * @fileoverview This class draw the network based on the inputJson, manages all network-related events and
 * edit the network or the shown info based on the user inputs.
 * @package It requires vis-Network package to be able to use the Network Class. 
 * @author Marco Expósito Pérez
 */

//Namespaces
import { comms } from "./constants/communities.js";
import { edges } from "./constants/edges.js";
import { nodes } from "./constants/nodes.js";
import { networkHTML } from "./constants/networkHTML.js";
//Packages
import { Network } from "vis-network/peer";
//Local classes
import ImplicitCommsMan from "./networkManagerTools/implicitCommsData.js";
import NodeVisuals from "./networkManagerTools/nodeVisuals.js";
import NodeData from "./networkManagerTools/nodeData.js";
import EdgeManager from "./networkManagerTools/edgeManager.js";
import nodeLocationSetter from "./networkManagerTools/nodeLocationSetter.js";

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

        this.implCommMan = new ImplicitCommsMan(jsonInput);
        this.nodeVisuals = new NodeVisuals(this);

        this.nodeData = new NodeData(this.nodeVisuals, rightContainer);
        this.edgesMan = new EdgeManager(config);

        this.data =
        {
            nodes: this.nodeData.parseNodes(jsonInput),
            edges: this.edgesMan.parseEdges(jsonInput)
        };

        new nodeLocationSetter(this.data.nodes, this.implCommMan.implComms.length);

        this.nodeData.createNodeDataTable(rightContainer);
        this.implCommMan.createCommunityDataTable(rightContainer);

        this.nodeVisuals.createNodeDimensionStrategy(this.data.nodes);

        this.chooseOptions();
        this.drawNetwork();

        this.updateFilterActives(config.valuesToHide);
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
                borderWidth: nodes.NodeDefaultBorderWidth,
                borderWidthSelected: nodes.NodeDefaultBorderWidthSelected,
                shapeProperties: {
                    interpolation: false
                },
                size: nodes.DefaultSize,
                chosen: {
                    node: this.nodeVisuals.nodeChosen.bind(this),
                    label: this.nodeVisuals.labelChosen.bind(this),
                },
                color: {
                    background: nodes.NodeColor,
                    border: nodes.NodeColor,
                },
                font: {
                    vadjust: nodes.NodevOffset,
                    size: nodes.LabelSize,
                }

            },
            groups: {
                useDefaultGroups: false
            },
            physics: {
                enabled: false,
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
        this.groupManager.hideTooltip();

        if (event.nodes.length > 0) {
            this.nodeHasBeenClicked(event.nodes[0]);

            this.groupManager.showTooltip(this, event, this.nodeData);
            this.implCommMan.updateDataTableFromNodeId(event.nodes[0], this.data.nodes);

        } else {
            this.noNodeIsClicked(event);

            this.groupManager.showTooltip(this, event, this.implCommMan);
            this.implCommMan.updateDataTableFromClick(event);
        }
    }

    /** 
     * Function executed when "zoom" event is launched. Happens when the user zooms-in in the canvas
     * @param {Object} event Zoom event
     */
    zoomEvent(event) {
        this.groupManager.updateTooltipPosition(this);
    }

    /** 
    * Function executed only when this was the network that received the click event on top of a node
    * @param {*} id id of the node 
    */
    nodeHasBeenClicked(id) {
        this.groupManager.nodeSelected(id);
    }

    /** 
     * Select the node and turn darker nodes that are not connected to it, darkens all edges not conected to it
     * and fit the camera to zoom into all not darkened nodes
     * @param {Integer} id //Id of the node
     */
    nodeSelected(id) {
        this.network.selectNodes([id], true);

        //Update node data table
        this.nodeData.updateDataTable(id);

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

        //Update all nodes color acording to their selected status
        const newNodes = new Array();
        this.data.nodes.forEach((node) => {
            if (selectedNodes.includes(node.id)) {
                if (!node.defaultColor) {
                    this.nodeVisuals.nodeDimensionStrategy.nodeColorToDefault(node);
                    newNodes.push(node);
                }

            } else if (node.defaultColor) {
                this.nodeVisuals.nodeDimensionStrategy.nodeVisualsToColorless(node);
                newNodes.push(node);
            }
        });

        this.data.nodes.update(newNodes);
    }

    /** 
     * Function executed only when this was the network that received the click event but no nodes was clicked
     */
    noNodeIsClicked(event) {
        const index = this.implCommMan.checkBoundingBoxClick(event);

        this.groupManager.nodeDeselected(index);
    }

    /**
     * Restore the network to the original deselected state
     */
    nodeDeselected(boundingBoxId) {
        const fitOptions = {
            animation: true,
            animation: {
                duration: nodes.ZoomDuration,
            },
        }

        
        if (boundingBoxId !== undefined) {

            const nodesInsideBoundingBox = new Array();
            this.data.nodes.forEach((node) => {
                if (node[comms.ImplUserNewKey] === boundingBoxId) {
                    nodesInsideBoundingBox.push(node.id);
                }
            });

            fitOptions["nodes"] = nodesInsideBoundingBox;
        }

        this.network.fit(fitOptions);
        
        this.nodeData.clearDataTable();

        this.network.unselectAll();

        const newNodes = new Array();
        this.data.nodes.forEach((node) => {
            if (!node.defaultColor) {
                this.nodeVisuals.nodeDimensionStrategy.nodeColorToDefault(node);
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
     * Update node visuals of all networks to match current filter
     * @param {String[]} filter string array with all values to hide
     */
    updateFilterActives(filter) {
        this.nodeVisuals.updateFilterActives(filter, this.data.nodes);
    }

    /**
     * Returns the attributes that changes visualization
     * @returns {Object} Object with the attributes that change visualization
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     */
    getVisualizationAttributes() {
        return this.nodeVisuals.getVisualizationAttributes();
    }
}


