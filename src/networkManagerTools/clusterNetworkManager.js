/**
 * @fileoverview This class draw the network based on the inputJson, manages all network-related events and
 * edit the network or the shown info based on the user inputs.
 * @package It requires vis-Network package to be able to use the Network Class. 
 * @author Marco Expósito Pérez
 */

//Namespaces
import { comms } from "../constants/communities";
import { networkHTML } from "../constants/networkHTML";
import { nodes } from "../constants/nodes";
//Packages
import { Network } from "vis-network/peer";

//Local classes
import ImplicitCommsData from "./implicitCommsData";

export default class ClusterNetworkManager {

    /**
     * Constructor of the class
     * @param {Object} jsonInput json input with all the network data
     * @param {HTMLElement} container container of the network
     * @param {HTMLElement} rightContainer container of the dataTables
     * @param {NetworkGroupManager} networkManager manager of all active networks
     * @param {Object} config config options for edges
     */
    constructor(container, rightContainer, networkManager, data) {
        this.container = container;
        this.networkManager = networkManager;
        this.key = networkManager.key;
        this.implCommMan = new ImplicitCommsData(data.json, true);

        this.nClusters = this.implCommMan.implComms.length;

        this.data =
        {
            nodes: data.nodes,
            edges: data.edges
        };
        this.options = data.options;

        this.implCommMan.createCommunityDataTable(rightContainer);

        this.drawNetwork();
    }

    /**
     * Draw the network and initialize all Events
     */
    drawNetwork() {
        this.network = new Network(this.container, this.data, this.options);
        this.network.stabilize();   //In case physics are active, we stop them just in case nodes start to "boing"

        this.clusterNetwork();

        this.container.firstChild.id = `${networkHTML.topCanvasContainer}cluster${this.key}`;

        this.network.on("click", (event) => this.clickEvent(event));
        this.network.on("zoom", (event) => this.zoomEvent(event));
    }

    /**
     * Make cluster of all nodes with the same implicit Community value
     */
    clusterNetwork() {
        for (let i = 0; i < this.nClusters; i++) {
            const colors = comms.Bb.Color[i];

            const clusterOptions = {
                joinCondition: function (childOptions) {
                    return childOptions[comms.ImplUserNewKey] == i;
                },
                clusterNodeProperties: {
                    id: `${nodes.ClusterNodeId}_${this.implCommMan.implComms[i].id}`,
                    label: this.implCommMan.implComms[i].name,
                    shape: "database",
                    color: {
                        border: colors.Border,
                        background: colors.Color,
                    },
                    borderWidth: 2,
                    explanation: this.implCommMan.implComms[i].explanation,
                    allowSingleNodeCluster: true
                },
            }

            this.network.cluster(clusterOptions);
        }
    }

    /** 
     * Function executed when "click" event is launched. Happens when the user clicks in the canvas
     * @param {Object} event Click event
     */
    clickEvent(event) {
        this.networkManager.groupManager.hideTooltip();

        if (event.nodes.length > 0) {
            this.nodeHasBeenClicked(event.nodes[0]);

            //Show the cluster information in the table
            this.implCommMan.updateDataTableFromNodeId(event.nodes[0], this.data.nodes);
            this.networkManager.groupManager.showTooltip(this, event, this.implCommMan);
        } else {
            this.noNodeIsClicked();

            this.implCommMan.clearDataTable();
        }
    }

    /** 
     * Function executed when "zoom" event is launched. Happens when the user zooms-in in the canvas
     * @param {Object} event Zoom event
     */
    zoomEvent(event) {
        this.networkManager.groupManager.updateTooltipPosition(this);
    }

    /** 
    * Function executed only when this was the network that received the click event on top of a node
    * @param {*} id id of the node 
    */
    nodeHasBeenClicked(id) {
        const idArray = id.split("_");
        this.networkManager.clusterNodeHasBeenClicked(parseInt(idArray[1]));

        this.nodeSelected(id);
    }

    /** 
     * Select the node and turn darker nodes that are not connected to it, darkens all edges not conected to it
     * and fit the camera to zoom into all not darkened nodes
     * @param {Integer} id //Id of the node
     */
    nodeSelected(id) {
        this.network.selectNodes([id], true);

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

        for(let i = 0; i < this.nClusters; i++){
            const clusterKey = `${nodes.ClusterNodeId}_${this.implCommMan.implComms[i].id}`;

            if(clusterKey === id)
                this.clusterColorToDefault(clusterKey);
            else
                this.clusterVisualsToColorless(clusterKey);
        }
    }

    /** 
     * Function executed only when this was the network that received the click event but no nodes was clicked
     */
    noNodeIsClicked() {
        this.networkManager.nodeDeselected();

        this.nodeDeselected();
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

        this.network.unselectAll();

        for(let i = 0; i < this.nClusters; i++){
            const clusterKey = `${nodes.ClusterNodeId}_${this.implCommMan.implComms[i].id}`;

            this.clusterColorToDefault(clusterKey);
        }
    }

    /**
     * Destroy the network 
     */
    clearNetwork() {
        this.network.destroy();
    }


    clusterVisualsToColorless(clusterId) {
        const options = {
            color: {
                background: nodes.NoFocusColor.Background,
                border: nodes.NoFocusColor.Border
            }
        }

        this.network.updateClusteredNode(clusterId, options);
    }

    clusterColorToDefault(clusterId) {
        const idArray = clusterId.split("_");
        const colors = comms.Bb.Color[idArray[1]];

        const options = {
            color: {
                border: colors.Border,
                background: colors.Color,
            },
        }

        this.network.updateClusteredNode(clusterId, options);
    }
}


