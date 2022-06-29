/**
 * @fileoverview This File contains a namespace with edges constants.
 * @author Marco Expósito Pérez
 */

export const edges = {

    //--- Json Keys ---
    
    //Key used to know where all the edges data is stored
    EdgesGlobalJsonKey: "similarity",

    //Key that has the similarity value of an edge
    EdgeValueKey: "value",

    //Key with the nodes of each of the nodes linked by the edge
    EdgeOneKey: "u1",
    EdgeTwoKey: "u2",

    //--- Configuration Values ---

    //Edge Width limits
    EdgeMinWidth: 1,
    EdgeMaxWidth: 10,

    //Default color of the edge when is not selected
    EdgeDefaultColor: "#A4A4A4",
    //Color when the edge is being selected
    EdgeSelectedColor: "#000000",

    //--- Labels ---

    //Default values
    LabelStrokeWidth: 0,
    LabelSize: 30,
    LabelColor: "transparent",
    LabelStrokeColor: "transparent",
    LabelAlign: "top",
    labelVerticalAdjust: -7,

    //Labels when its edge is selected
    LabelColorSelected: "#000000",
    LabelStrokeColorSelected:"#ffffff",
    LabelStrokeWidthSelected: 1,
}