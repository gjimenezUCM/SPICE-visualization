import { DataSet } from "vis-data/peer";
import { Network } from "vis-network/peer";

export default class DrawNetwork {


    constructor(jsonInput, container) {
        this.container = container;


        this.activateEdgeLabels = true;

        //Edges with value equal or below to this wont be drawn
        this.edgeValueThreshold = 1;

        //In case value key changes, this is what is compared while parsing edges json
        this.edgeValue = "value";

        //In case explicit_community key changes, this is what is compared while parsing edges json
        this.groupColor_key = "explicit_community";

        this.groupColor_0 = "#4ADEDE";
        this.groupColor_1 = "#37983B";
        this.groupColor_2 = "#FFFFFF";

        this.parseJson(jsonInput);
        this.chooseOptions(jsonInput);

        this.drawNetwork();
    }



    parseJson(json) {
        //Get nodes from json
        const nodes = this.parseNodes(json);
        const edges = this.parseEdges(json);

        this.data = {
            nodes: nodes,
            edges: edges
        };
    }

    parseNodes(json) {
        for (const node of json.users) {
            node["oldgroup"] = node["group"];   //Just in case we need the group in the future

            node["group"] = "group_" + node[this.groupColor_key]
            delete node[this.groupColor_key];
        }
        const nodes = new DataSet(json.users);
        return nodes;
    }

    parseEdges(json) {
        //Get edges from json
        for (const edge of json.similarity) {
            edge["from"] = edge["u1"];
            delete edge["u1"];

            edge["to"] = edge["u2"];
            delete edge["u2"];

            edge["value"] = edge[this.edgeValue];

            if (this.edgeValue !== "value")
                delete edge[this.edgeValue];


            if (this.activateEdgeLabels)
                edge["label"] = edge["value"].toString();

        }
        const edges = new DataSet(json.similarity);
        console.log(json.similarity);

        return edges;
    }

    chooseOptions() {
        this.options = {
            edges: {
                scaling: {
                    min: 3,
                    max: 15,
                    label: {
                        enabled: false
                    }
                },
                font: {
                    strokeWidth: 0,
                    size: 20,
                    color: "#000000"
                }
            },
            nodes: {
                shape: 'circle',
                widthConstraint: 30,
                font: {
                    size: 20
                },
            },
            groups: {
                group_0: {
                    color: {
                        background: this.groupColor_0
                    }
                },
                group_1: {
                    color: {
                        background: this.groupColor_1
                    }
                },
                group_2: {
                    color: {
                        background: this.groupColor_2
                    }
                }
            },
            physics: {
                enabled: false
            }
        };
    }

    drawNetwork() {
        this.network = new Network(this.container, this.data, this.options);
    }

    clearNetwork() {
        this.network.destroy();
    }
}