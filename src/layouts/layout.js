/**
 * @fileoverview This class changes the visualization layout be pairs in an horizontal way. 
 * If u add a single network, the network will be seen as a normal-big network, if u add a second it will be paired with the first one and both will shrink and 
 * be placed side by side for easier visualization. If u keep adding more networks, they will try to be paired, if cant be paired, a normal-big network unpaired will appear
 * @author Marco Expósito Pérez
 */
//Namespaces
import { networkHTML } from "../constants/networkHTML";
//Local classes

export default class Layout {

    /**
     * Constructor of the class
     * @param {NetworksGroup} networksGroup group of networks that will be controled by this panel
     * @param {Object} classNames Object with the name of the html classes to be used in this layout
     * Format-> {main: (String), second: (String), pair: (String)}
     */
    constructor(networksGroup, classNames) {
        this.networksGroup = networksGroup;
        this.classNames = classNames;
        this.domParser = new DOMParser();

        this.unpairedRows = new Array();
        this.networkKeyToRow = new Map();
        this.nRows = 0;

        this.networksGroup.setLayout(this);
    }


    /**
     * Returns an htmlString with the basic layout of a network.
     * @param {Integer} nRow number of the row used as a key
     * @param {Boolean} mirror swaps the columns place if true
     * @returns {String} returns the html string
     */
    networkTemplate(key, mirror = false) {
        const htmlString = `
        <div id="${networkHTML.topNetworkContainer}${key}">
            <div class="row" id="">
                <div class="col-sm-${mirror ? "4" : "8"}" id="leftCol_${key}"> </div>
                <div class="col-sm-${!mirror ? "4" : "8"}"" id="rightCol_${key}"> </div>
            </div>
        </div>`;        

        return htmlString;
    }


    /**
     * Make a row of the layout a single node network. The network will be bigger
     * @param {Integer} nRow number/key of the row
     * @param {String} position string with the position of the network to make bigger
     */
    makeSingleNetworkRow(nRow, position){
        //Make the current network single
        let rowId = position === networkHTML.networkFirst ? "topRow" : "bottomRow";
        let container = document.getElementById(`${rowId}_${nRow}`);

        container.className = this.classNames.main;

        //Fix the other network position
        rowId = position !== networkHTML.networkFirst ? "topRow" : "bottomRow";
        container = document.getElementById(`${rowId}_${nRow}`);

        container.className = this.classNames.second;
    }

    /**
     * Make a row of the layout work as a vertical layout row. Both networks height will be reduced
     * @param {Integer} nRow number/key of the row
     */
    makePairNetworkRow(nRow){
        const topContainer = document.getElementById(`topRow_${nRow}`);
        const bottomContainer = document.getElementById(`bottomRow_${nRow}`);

        topContainer.className = this.classNames.pair;
        bottomContainer.className = this.classNames.pair;
    }

    /**
     * Template for the tittle of a network
     * @param {String} tittle tittle of the network
     * @returns {String} htmlstring with the tittle
     */
    networkTittleTemplate(tittle){
        const htmlString = `
        <div class="row">
            <h2 class="text-start">
                ${tittle}
            </h2>
            <hr>
        </div>`;
        return htmlString;
    }

    /**
     * Delete a network from this layout
     * @param {String} key unique key of the network to be deleted 
     */
    deleteNetwork(key){
        const networkRowid = this.networkKeyToRow.get(key).split("_");

        const nRow = networkRowid[0];
        const location = networkRowid[1];
        
        document.getElementById(`leftCol_${nRow}_${location}`).innerHTML = "";
        document.getElementById(`rightCol_${nRow}_${location}`).innerHTML = "";

        let isUnpaired = false;

        for(let i = 0; i < this.unpairedRows.length; i++){
            const unpairedRow = this.unpairedRows[i];

            if(unpairedRow.nRow === nRow){
                isUnpaired = true;
                this.unpairedRows = this.unpairedRows.splice(0, i);
            }
        }
        if(isUnpaired){

            const rowContainer = document.getElementById(`networkContainer_${nRow}`); 
            document.getElementById(networkHTML.networksParentContainer).removeChild(rowContainer);

        }else{
            if(location === networkHTML.networkFirst){
                this.makeSingleNetworkRow(nRow, networkHTML.networkSecond);
            }else{
                this.makeSingleNetworkRow(nRow, networkHTML.networkFirst);
            }

            this.unpairedRows.push({nRow: nRow, location: location});
        }
    }
}   