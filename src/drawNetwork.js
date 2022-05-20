import { DataSet } from "vis-data/peer";
import { Network } from "vis-network/peer";

export default class DrawNetwork {
    constructor(jsonInput, container) {
        this.container = container;

        this.parseJson(jsonInput);
        this.chooseOptions(jsonInput);

        this.drawNetwork();
    }



    parseJson(json) {

        //Get nodes from json

        const nodes = new DataSet([
            { id: 1, label: "Node 1" },
            { id: 2, label: "Node 2" },
            { id: 3, label: "Node 3" },
            { id: 4, label: "Node 4" },
            { id: 5, label: "Node 5" }
        ]);

        //Get edges from json

        const edges = new DataSet([
            { from: 1, to: 3 },
            { from: 1, to: 2 },
            { from: 2, to: 4 },
            { from: 2, to: 5 },
            { from: 3, to: 3 }
        ]);

        this.data = {
            nodes: nodes,
        	edges: edges
        };
    }

    chooseOptions(){
        this.options = {};
    }
    drawNetwork() {
        this.network = new Network(this.container, this.data, this.options);
    }


    clearNetwork(){
        this.network.destroy();
    }
}