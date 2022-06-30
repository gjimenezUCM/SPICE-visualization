/**
 * @fileoverview This File contains a namespace about nodes constants.
 * @author Marco Expósito Pérez
 */

export const nodes = {

    //--- Json Keys ---

    //Key used to know where all the users data is stored
    UsersGlobalJsonKey: "users",

    //--- Location Values ---
    nodeGroupsBaseDistance: 75,
    
    nodeBetweenNodesDistance: 8,
    //--- Configuration Values ---

    //Sizes
    DefaultSize: 20,
    SelectedSize: 30,

    //Color when another node is being focused
    NoFocusColor: { Background: "rgba(155, 155, 155, 0.3)", Border: "rgba(100, 100, 100, 0.3)" },

    //Zoom duration when a node is clicked
    ZoomDuration: 1000,
    //When zoom ends, tooltip will spawn when this ms have pased
    TooltipSpawnTimer: 500,

    //Default value for a background color when the explicit community doesnt change it
    NodeColor: "#D2C7F9",
    //Default value for a node shape when the explicit community doesnt change it
    NodeShape: "dot",
    //Default value for vAdjust label for the default shape,
    NodevOffset: -31,

    NodeDefaultBorderWidth: 0,
    NodeDefaultBorderWidthSelected: 0,

    NodeWithBorderColorWidth: 4,
    NodeWithBorderColorWidthSelected: 4,

    LabelSize: 13,
    //--- DataTable ---

    //Whitelist with the keys that will be shown in the selected Node Data Panel.
    //implicit_Comm needs to be equal to comms.ImplUserNewKey. Cant do it in the code because of circular dependency
    NodesWantedAttr: ["id", "label", "implicit_Comm"],

    //html
    //Title of the table with selected node data
    NodesTableTitle: "User Attributes",
    //ClassName of a row without border
    borderlessHTMLrow: "row dataRow",
    //ClassName of a row with main attributes
    borderMainHTMLrow: "row dataRow border-bottom border-dark",
    //ClassName of a explicit community row
    borderHTMLrow: "row dataRow border-bottom border-grey",
    //ClassName of the row that separates main and explicit community data
    borderSeparatorHTMLrow: "row dataRow border-bottom border-primary",

    //--- Explicit Communities Variable Attributes ---

    //KEYS
    nodeColorKey: "color",
    nodeShapeKey: "shape",
    nodeBorderKey: "border",
    
    //Node attributes that change based on its explicit Community
    NodeAttr: {
        getColor: (n) => getColorOfN(n),
        getShape: (n) => getShapeOfN(n),
        getBorder: (n) => getBorderOfN(n),
    },

    //--- Legends Helpers ---

    getShapehtml: (html, index) => getShapehtml(html, index),

    //Characteristics that change based on the explicit communities

    BackgroundColors: [
        "rgb(255, 0, 0, 1)", //Red
        "rgb(0, 255, 72, 1)", //Green
        "rgb(25, 166, 255, 1)", //Blue
        "rgb(255, 252, 25, 1)", //Yellow
        "rgb(232, 134, 12, 1)", //Orange
        "rgb(123, 12, 232, 1)", //Purple
    ],

    BoderColors: [
        "rgb(128, 126, 13, 1)", //Yellow
        "rgb(62, 6, 116, 1)", //Purple
        "rgb(13, 84, 128, 1)", //Blue
        "rgb(128, 0, 0, 1)", //Red
        "rgb(0, 128, 36, 1)", //Green
        "rgb(13, 84, 128, 1)", //Blue
    ],

    AvailableShapes: [
        { Shape: "dot", vOffset: -35, selOffset: -40 },
        { Shape: "diamond", vOffset: -35, selOffset: -40 },
        { Shape: "star", vOffset: -34, selOffset: -40 },
        { Shape: "triangle", vOffset: -29, selOffset: -35 },
        { Shape: "square", vOffset: -35, selOffset: -40 },
        { Shape: "triangleDown", vOffset: -40, selOffset: -45 },
        { Shape: "hexagon", vOffset: -35, selOffset: -40 },
    ],

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