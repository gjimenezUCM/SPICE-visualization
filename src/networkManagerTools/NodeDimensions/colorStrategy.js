/**
 * @fileoverview This class controls the Background color of all nodes.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { nodes } from "../../constants/nodes";
import { comms } from "../../constants/communities";

export default class ColorStrategy {

    /**
     * Constructor of the class
     * @param {Object} Attributes Object with all attributes that change visualization. 
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     */
    constructor(Attributes) {
        //Look for the attribute related to color Strat
        const AttributeToColor = Attributes.filter(attr => attr.dimension === nodes.nodeColorKey)[0];

        if (AttributeToColor !== undefined) {

            this.key = AttributeToColor.attr;
            this.initColorMap(AttributeToColor.vals);
        }
    }

    /**
     * Initializa the map with the relation value -> BackgroundColor
     * @param {String[]} values all values to include in the map
     */
    initColorMap(values) {
        this.nodeColors = new Map();

        for (let i = 0; i < values.length; i++) {
            const color = nodes.NodeAttr.getColor(i);
            this.nodeColors.set(values[i], color);
        }

    }

    /**
     * Change the node background color based on its attributes
     * @param {Object} node node to be edited
     */
    change(node) {
        if (this.key !== undefined) {
            const nodeComms = node[comms.ExpUserKsonKey];
            const value = nodeComms[this.key];

            node["color"] = {
                background: this.nodeColors.get(value),
            }

        }else{
            node["color"] = {
                background: nodes.NodeColor,
            }
        }

        node["borderWidth"] = 0;
        node["borderWidthSelected"] = 0;

        node.defaultColor = true;
    }

    /**
     * Change node background color to its colorless color
     * @param {Object} node node to be edited
     */
    toColorless(node) {
        node.defaultColor = false;

        node["color"]["background"] = nodes.NoFocusColor.Background;
    }

}