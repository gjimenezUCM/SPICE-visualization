/**
 * @fileoverview This class holds explicit community data and changes the node visuals to match its communities
 * values depending on the attributes chosen
 * @author Marco Expósito Pérez
 */

//Namespaces
import { comms } from "../constants/communities.js";
import { nodes } from "../constants/nodes.js";
//Local classes
import NodeDimensionStrategy from "./NodeDimensions/nodeDimensionStrategy.js";

export default class NodeVisuals {

    /**
     * Constructor of the class
     * @param {Object} config Object with the initial configuration of this class
     */
    constructor(config) {
        //Contains all explicit Communities with its values
        this.communitiesData = new Array();

        this.activateThirdDimension = config.allowThirdDimension;

        this.nodeLabelVisibility = !config.showNodeLabels;

        this.undefinedName = "not defined";
    }

    /** 
     * Execute while parsing nodes. It finds all explicit Communities and all its values
     * @param {Object} node node with the explicit Community attribute
     */
    findExplicitCommunities(node) {
        if (this.validateExplicitCommunity(node)) {
            const explicitData = node[comms.ExpUserKsonKey];

            const keys = Object.keys(explicitData);
            keys.forEach((key) => {
                explicitData[key] = this.validateCommunityValue(explicitData[key]);

                if (explicitData[key] !== this.undefinedName) {
                    if (this.communitiesData.length === 0) {
                        this.communitiesData.push({ key: key, values: new Array(explicitData[key]) });
                    } else {
                        let community = this.communitiesData.find(element => element.key === key);

                        if (community === undefined) {
                            this.communitiesData.push({ key: key, values: new Array(explicitData[key]) });

                        } else {
                            if (!community.values.includes(explicitData[key])) {
                                community.values.push(explicitData[key]);
                            }
                        }
                    }
                }
            });
        }
    }

    validateExplicitCommunity(node) {
        if (node[comms.ExpUserKsonKey] === undefined ||
            node[comms.ExpUserKsonKey] === null)
            throw new Error(`node ${node[id]} doesnt have an explicit community attribute`);

        if (node[comms.ExpUserKsonKey] === "[]" ||
            node[comms.ExpUserKsonKey] === "{}")
            return false;
        else
            return true;
    }

    validateCommunityValue(value) {
        const type = typeof (value);

        switch (type) {
            case "string":
                return value;
            case "number":
                return value.toString();
            default:
                return this.undefinedName;
        }
    }

    /**
     * Create the node Dimension Strategy object based on a attributes object
     * @param {Dataset} nods Dataset with the data of all nodes of the network
     */
    createNodeDimensionStrategy(nods) {
        const attributes = new Array();

        if (this.communitiesData[0] !== undefined) {
            attributes.push({
                attr: this.communitiesData[0].key,
                vals: this.communitiesData[0].values,
                dimension: nodes.nodeColorKey,
            })
        }

        if (this.communitiesData[1] !== undefined) {
            attributes.push({
                attr: this.communitiesData[1].key,
                vals: this.communitiesData[1].values,
                dimension: nodes.nodeShapeKey,
            })
        }

        if (this.communitiesData[2] !== undefined && this.activateThirdDimension) {
            attributes.push({
                attr: this.communitiesData[2].key,
                vals: this.communitiesData[2].values,
                dimension: nodes.nodeBorderKey,
            })
        }

        this.nodeDimensionStrategy = new NodeDimensionStrategy(attributes);

        this.updateNodeVisuals(nods);
    }

    /**
     * Update the visuals of all nodes to match the current node Dimension Strategy
     * @param {Dataset} nodes Dataset with the data of all nodes of the network
     */
    updateNodeVisuals(nodes) {
        const newNodes = new Array();

        nodes.forEach((node) => {
            this.nodeDimensionStrategy.changeNodeVisuals(node);
            newNodes.push(node);
        });

        nodes.update(newNodes);
    }

    /**
     * Returns the attributes that change visualization
     * @returns {Object} Object with the attributes that change visualization
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     */
    getVisualizationAttributes() {
        return this.nodeDimensionStrategy.attributes;
    }

    /**
     * Hide all nodes that contain any of these filtered communities values
     * @param {String[]} filter Array with the name of all values to be hidden
     * @param {DataSet} nodes Dataset with the network's data of all nodes
     */
    updateFilterActives(filter, nodes) {
        const newNodes = new Array();

        nodes.forEach((node) => {
            const explComms = node[comms.ExpUserKsonKey];
            const keys = Object.keys(explComms);

            let isHidden = false;
            for (let i = 0; i < keys.length; i++) {
                const value = explComms[keys[i]]
                const key = keys[i];

                if (filter.includes(`${key}_${value}`)) {
                    isHidden = true;
                    this.nodeDimensionStrategy.nodeVisualsToColorless(node);
                    break;
                }
            }
            if (!isHidden) {
                this.nodeDimensionStrategy.nodeColorToDefault(node);
            }

            newNodes.push(node);
        });
        nodes.update(newNodes);
    }

    /**
     * Hide/Show the label of the nodes based on nodeLabelVisibility value
     * @param {DataSet} nodes Dataset with the network's data of all nodes
     */
    updateNodeLabelsVisibility(nodes) {
        const newNodes = new Array();

        nodes.forEach((node) => {
            if (!this.nodeLabelVisibility)
                node["font"].color = "#00000000";
            else
                node["font"].color = "#000000FF";

            newNodes.push(node);
        });
        nodes.update(newNodes);
    }

    /** 
     * Function executed when a node is selected that update the node visual attributes
     * @param {Object} values value of the parameters that will change
     * @param {Integer} id id of the node (unused)
     * @param {Boolean} selected Boolean that says if the node has been selected
     * @param {Boolean} hovering Boolean that says if the node has been hovered (unused)
     */
    nodeChosen(values, id, selected, hovering) {
        if (selected) {
            values.size = nodes.SelectedSize;
        }
    }

    /** 
     * Function executed when a node is selected that update node's attributes of its label
     * @param {Object} values label's parameters that will change
     * @param {Integer} id id of the node (unused)
     * @param {Boolean} selected Boolean that says if the node has been selected
     * @param {Boolean} hovering Boolean that says if the node has been hovered (unused)
     */
    labelChosen(values, id, selected, hovering) {
        if (selected) {
            values.vadjust -= 10;
        }
    }
}