/**
 * @fileoverview This class controls the Shape and label vertical offset of all nodes.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { nodes } from "../../constants/nodes";
import { comms } from "../../constants/communities";

export default class ShapeStrategy {

    /**
     * Constructor of the class
     * @param {Object} Attributes Object with all attributes that change visualization. 
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     */
    constructor(Attributes) {
        //Look for the attribute related to shape Strat
        const AttributeToShape = Attributes.filter(attr => attr.dimension === nodes.nodeShapeKey)[0];

        if (AttributeToShape !== undefined) {

            this.key = AttributeToShape.attr;
            this.initShapeMap(AttributeToShape.vals);
        }
    }

    /**
     * Initializa the map with the relation value -> shape
     * @param {String[]} values all values to include in the map
     */
    initShapeMap(values) {
        this.nodeShapes = new Map();

        for (let i = 0; i < values.length; i++) {
            const shape = nodes.NodeAttr.getShape(i);
            this.nodeShapes.set(values[i], shape);
        }

    }

    /**
     * Change the node shape and vertical label offset based on its attributes
     * @param {Object} node node to be edited
     */
    change(node) {
        if (this.key !== undefined) {
            const nodeComms = node[comms.ExpUserKsonKey];
            const value = nodeComms[this.key];

            const shapeVals = this.nodeShapes.get(value);

            node["shape"] = shapeVals.Shape;
            node.font["vadjust"] = shapeVals.vOffset;
        }
    }
}