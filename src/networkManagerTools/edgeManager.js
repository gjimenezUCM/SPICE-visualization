/**
 * @fileoverview This class Manages most things related to edges. It reads the json and parse the data, 
 * and changes edges atributes based on the control panel inputs.
 * @package Requires vis-data package to be able to use vis-network datasets. 
 * @author Marco Expósito Pérez
 */

//Namespaces
import { networkHTML } from "../constants/networkHTML.js";
import { edges } from "../constants/edges.js";
//Packages
import { DataSet } from "vis-data/peer";

export default class EdgeManager {

    /**
     * Constructor of the class
     * @param {Object} config object with the initial config options for the edges
     */
    constructor(config) {
        //Dictates what is the similarity threshold below all edges will be hidden
        this.edgeValueThreshold = config.edgeThreshold;
        //Dictates if the edge width should change with the similarity value "strength"
        this.variableEdge = config.variableEdge;
        //Dictates if All edges that are not currently selected, should be hidden
        this.hideUnselected = config.hideUnselected;
    }

    /**
     * Parse the json into a proper edges Dataset to use to draw the network
     * @param {Object} json json with the nodes data
     * @returns {DataSet} a vis.js DataSet with the nodes data ready to for the network drawing
     */
    parseEdges(json) {
        const newEdges = new Array();

        for (const edge of json[edges.EdgesGlobalJsonKey]) {
            //Dont save edges with no similarity
            if (edge[edges.EdgeValueKey]) {
                //Dont save autoedges
                if (edge[edges.EdgeOneKey] !== edge[edges.EdgeTwoKey]) {

                    //Update targets to vis format
                    edge["from"] = edge[edges.EdgeOneKey].toString();
                    edge["to"] = edge[edges.EdgeTwoKey].toString();

                    delete edge[edges.EdgeOneKey];
                    delete edge[edges.EdgeTwoKey];

                    //Vis use "value" key to change edges width in case we activate the option.
                    edge["value"] = edge[edges.EdgeValueKey].toString();
                    if (edges.EdgeValueKey !== "value")
                        delete edge[edges.EdgeValueKey];

                    edge["label"] = edge["value"].toString();

                    if (edge["value"] < this.edgeValueThreshold) {
                        edge["hidden"] = true;
                    } else
                        edge["hidden"] = false;

                    //Hide unselected
                    const color = edges.EdgeDefaultColor;
                    if (this.hideUnselected)
                        edge.color = { color: `${color}00` };
                    else
                        edge.color = { color: `${color}` };

                    newEdges.push(edge);
                }
            }

        }

        this.edges = new DataSet(newEdges);
        return this.edges;
    }

    /**
     * Calculate what is the max edge width based on the variable Edge parameter
     * @returns {Integer} returns an integer with the max edge width
     */
    getMaxWidth() {
        if (this.variableEdge)
            return edges.EdgeMaxWidth;
        else
            return edges.EdgeMinWidth;
    }

    /**
     * Changes the edge label parameters when an edge is selected
     * @param {Object} values value of the parameters that will change
     * @param {Integer} id id of the edge (unused)
     * @param {Boolean} selected Boolean that says if the edge has been selected
     * @param {Boolean} hovering Boolean that says if the edge has been hovered (unused)
     */
    labelEdgeChosen(values, id, selected, hovering) {
        if (selected) {
            values.color = edges.LabelColorSelected;
            values.strokeColor = edges.LabelStrokeColorSelected;
            values.strokeWidth = edges.LabelStrokeWidthSelected;
        }
    }

    /**
     * Update the edge Threshold value to hide edges below that value
     * @param {Float} newThreshold new value
     */
    updateEdgesThreshold(newThreshold) {
        this.edgeValueThreshold = newThreshold;

        const newEdges = new Array();
        this.edges.forEach((edge) => {
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

        this.edges.update(newEdges);
    }

    /**
     * Update the variable that says if the edge should vary with the similarity value and update
     * all edges acordingly
     * @param {NetworkMan} networkMan parent networkManager object
     * @param {Boolean} newBool new value
     */
    updateVariableEdge(networkMan, newBool) {
        this.variableEdge = newBool;
        let max = this.getMaxWidth();

        networkMan.options.edges.scaling.max = max;
        networkMan.network.setOptions(networkMan.options);

        //Update all edges with the new options
        this.edges.update(this.edges);
    }

    /**
     * Change base edge color based on the value of hideUnselected
     * @param {Bool} newBool new value of hideUnselected
     */
    hideUnselectedEdges(newBool) {
        this.hideUnselected = newBool;

        const newEdges = new Array();

        this.edges.forEach((edge) => {

            if (this.hideUnselected)
                edge.color = { color: `${edges.EdgeDefaultColor}00` };
            else
                edge.color = { color: edges.EdgeDefaultColor };

            newEdges.push(edge);
        })

        this.edges.update(newEdges);
    }
}