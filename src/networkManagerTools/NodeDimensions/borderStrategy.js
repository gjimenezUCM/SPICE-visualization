/**
 * @fileoverview This File controls the Border color of all nodes.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { nodes } from "../../constants/nodes";
import { comms } from "../../constants/communities";

export default class BorderStrategy {

    /**
     * Constructor of the class
     * @param {Object} Attributes Object with all attributes that change visualization. 
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     */
    constructor(Attributes) {
        //Look for the attribute related to borders Strat

        const AttributeToBorder = Attributes.filter(attr => attr.dimension === nodes.nodeBorderKey)[0];

        if (AttributeToBorder !== undefined) {
            this.key = AttributeToBorder.attr;
            this.initBorderMap(AttributeToBorder.vals);
        }

    }

    /**
     * Initializa the map with the relation value -> borderColor
     * @param {String[]} values all values to include in the map
     */
    initBorderMap(values) {
        this.nodeBorders = new Map();

        for (let i = 0; i < values.length; i++) {
            const border = nodes.NodeAttr.getBorder(i);
            this.nodeBorders.set(values[i], border);
        }
    }

    /**
     * Change the node border color and width based on its attributes
     * @param {Object} node node to be edited
     */
    change(node) {
        if (this.key !== undefined) {
            const nodeComms = node[comms.ExpUserKsonKey];
            const value = nodeComms[this.key];

            const borderColor = this.nodeBorders.get(value);

            node["color"]["border"] = borderColor;

            node["borderWidth"] = nodes.NodeWithBorderColorWidth;
            node["borderWidthSelected"] = nodes.NodeWithBorderColorWidthSelected;

        } else {
            node["borderWidth"] = nodes.NodeDefaultBorderWidth;
            node["borderWidthSelected"] = nodes.NodeDefaultBorderWidthSelected;
        }
    }

    /**
     * Change node border color to its colorless color
     * @param {Object} node node to be edited
     */
    toColorless(node) {
        node["color"]["border"] = nodes.NoFocusColor.Border;
    }


}