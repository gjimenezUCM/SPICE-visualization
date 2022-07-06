/**
 * @fileoverview This File contains a namespace about Explicit and implicit communities constants.
 * @author Marco Expósito Pérez
 */

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

