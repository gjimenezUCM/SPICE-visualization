/**
 * @fileoverview This File contains a namespace about nodes constants.
 * @author Marco Expósito Pérez
 */

export const nodes = {

    //--- Json Keys ---

    //Key used to know where all the users data is stored
    UsersGlobalJsonKey: "users",

    //--- Configuration Values ---

    //Sizes
    DefaultSize: 15,
    SelectedSize: 25,

    //Color when another node is being focused
    NoFocusColor: { Background: "rgba(155, 155, 155, 0.3)", Border: "rgba(100, 100, 100, 0.3)" },

    //Zoom duration when a node is clicked
    ZoomDuration: 1000,
    //When zoom ends, tooltip will spawn when this ms have pased
    TooltipSpawnTimer: 500,

    //Default value for a node shape when the explicit community doesnt change it
    NodeShape: "circle",
    
    NodeBorderWidth: 2,
    NodeBorderWidthSelected: 4,

    //--- DataTable ---

    //Whitelist with the keys that will be shown in the selected Node Data Panel.
    //implicit_Comm needs to be equal to comms.ImplUserNewKey. Cant do it in the code because of circular dependency
    NodesWantedAttr: ["id", "label", "implicit_Comm"],

    //html
    //Title of the table with selected node data
    NodesTableTitle: "Node Attributes",
    //ClassName of a row without border
    borderlessHTMLrow: "row dataRow",
    //ClassName of a row with main attributes
    borderMainHTMLrow: "row dataRow border-bottom border-dark",
    //ClassName of a explicit community row
    borderHTMLrow: "row dataRow border-bottom border-grey",
    //ClassName of the row that separates main and explicit community data
    borderSeparatorHTMLrow: "row dataRow border-bottom border-primary",

    //--- Explicit Communities Variable Attributes ---
    
    //Characteristics that change based on the explicit communities
    BackgroundColors: [
        "rgb(255, 0, 0, 1)", //Red
        "rgb(0, 255, 72, 1)", //Green
        "rgb(25, 166, 255, 1)", //Blue
        "rgb(255, 252, 25, 1)", //Yellow
    ],

    AvailableShapes: [
        { Shape: "dot", vOffset: -31, selOffset: -40 },
        { Shape: "diamond", vOffset: -31, selOffset: -40 },
        { Shape: "star", vOffset: -31, selOffset: -40 },
        { Shape: "triangle", vOffset: -25, selOffset: -35 },
        { Shape: "square", vOffset: -31, selOffset: -40 },
        { Shape: "triangleDown", vOffset: -35, selOffset: -45 },
        { Shape: "hexagon", vOffset: -31, selOffset: -40 },
    ],

}

