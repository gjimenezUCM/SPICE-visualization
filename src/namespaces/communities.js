/**
 * @fileoverview This File contains a namespace about Explicit and implicit communities constants.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { nodes } from "./nodes.js";

export const comms = {

    //--- Json Keys ---

    //Name of the explicit community attribute array of a user
    ExpUserKsonKey: "explicit_community",

    //Name of the implicit community attribute in the original json
    ImplGlobalJsonKey: "communities",
    //Name of the implicit community atribute inside a user
    ImplUserJsonKey: "group",
    //Currently the above key is "group". Thats a vis.js attribute and it needs to be changed. This is the new key
    ImplUserNewKey: "implicit_Comm",

    //--- Explicit Communities ---

    //Node attributes that change based on its explicit Community
    NodeAttr: {
        getColor: (n) => getColorOfN(n),
        getShape: (n) => getShapeOfN(n),
        getBorder: (n) => getBorderOfN(n),
    },

    //--- Legends Helpers ---

    getShapehtml: (html, index) => getShapehtml(html, index),

    //--- DataTable ---

    //Whitelist with the keys that will be shown in the Community Data Panel. Color is intended for debug purpouses
    ImplWantedAttr: ["name", "explanation", "color"],

    //html
    //Title of the table with implicit community data
    ImplTableTitle: "Comunity Attributes",
    //ClassName of a row without border
    borderlessHTMLrow: "row dataRow",
    //ClassName of a row with main attributes
    borderTMLrow: "row dataRow border-bottom border-dark",

    //--- Bounding boxes ---

    Bb: {
        //width of the border of the bounding boxes
        BoderWidth: 4,
        //backgroundColor and border color of the bounding boxes
        Color: [
            {
                Color: "rgba(248, 212, 251, 0.6)", Border: "rgba(242, 169, 249, 1)" //purple
            }, {
                Color: "rgba(255, 255, 170, 0.6)", Border: "rgba(255, 222, 120, 1)" //Yellow
            }, {
                Color: "rgba(211, 245, 192, 0.6)", Border: "rgba(169, 221, 140, 1)" //Green
            }, {
                Color: "rgba(254, 212, 213, 0.6)", Border: "rgba(252, 153, 156, 1)" //Red
            }, {
                Color: "rgba(220, 235, 254, 0.6)", Border: "rgba(168, 201, 248, 1)" //Blue
            },],
    },

}

/**
 * Returns a color for a node background
 * @param {Integer} n index of the returned color
 * @returns {String} Returns aa string similar to "rgb(255, 0, 0, 1)"
 */
const getColorOfN = function (n) {
    n = n % nodes.BackgroundColors.length;

    return nodes.BackgroundColors[n];
};

/**
 * Returns a shape and label offset for a node shape
 * @param {Integer} n index of the returned shape
 * @returns {Object} Returns an object in the format of { Shape: "dot", vOffset: -31, selOffset: -40 }
 */
const getShapeOfN = function (n) {
    n = n % nodes.AvailableShapes.length;

    return nodes.AvailableShapes[n];
}

/**
 * Returns a color for a node border
 * @param {Integer} n index of the returned color
 * @returns {String} Returns aa string similar to "rgb(255, 0, 0, 1)"
 */
const getBorderOfN = function (n) {
    n = n % nodes.BoderColors.length;

    return nodes.BoderColors[n];
};

/**
 * Updates the html to match the class that its n-shape should have
 * @param {HTMLElement} html html to edit
 * @param {Integer} n n of the shape
 */
const getShapehtml = function (html, n) {
    let shape = getShapeOfN(n).Shape;

    html.className = shape;
}