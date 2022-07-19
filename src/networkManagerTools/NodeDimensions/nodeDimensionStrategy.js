/**
 * @fileoverview This class controls the dimensions strategy of all nodes. It changes its visual values to meet
 * the chosen strat.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { nodes } from "../../constants/nodes";
//Local classes
import BorderStrategy from "./borderStrategy";
import ColorStrategy from "./colorStrategy";
import ShapeStrategy from "./shapeStrategy";

export default class NodeDimensionStrategy {

    /**
     * Constructor of the class
     * @param {Object} Attributes Object with all attributes that change visualization. 
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     */
    constructor(attributes) {
        const colorStrat = new ColorStrategy(attributes);
        const shapeStrat = new ShapeStrategy(attributes);
        const borderStrat = new BorderStrategy(attributes);

        this.strategy = {
            [nodes.nodeColorKey]: {
                change: colorStrat.change.bind(colorStrat),
                toColorless: colorStrat.toColorless.bind(colorStrat)
            },
            [nodes.nodeShapeKey]: {
                change: shapeStrat.change.bind(shapeStrat),
            },
            [nodes.nodeBorderKey]: {
                change: borderStrat.change.bind(borderStrat),
                toColorless: borderStrat.toColorless.bind(borderStrat)
            },
        }

        this.attributes = attributes;
    }

    /**
     * Update visualization of the node to match its attributes values
     * @param {Object} node node to be edited
     */
    changeNodeVisuals(node) {
        const keys = Object.keys(this.strategy);

        for (let i = 0; i < keys.length; i++) {
            this.strategy[keys[i]].change(node);
        }
    }

    /**
     * Change the color of a node to its default color
     * @param {Object} node node to be edited
     */
    nodeColorToDefault(node) {
        this.strategy[nodes.nodeColorKey].change(node);
        this.strategy[nodes.nodeBorderKey].change(node);
    }

    /**
     * Change the color of a node to its colorless state
     * @param {Object} node node to be edited
     */
    nodeVisualsToColorless(node) {
        this.strategy[nodes.nodeColorKey].toColorless(node);
        this.strategy[nodes.nodeBorderKey].toColorless(node);
    }

}