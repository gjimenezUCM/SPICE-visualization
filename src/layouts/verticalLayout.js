/**
 * @fileoverview This class changes the visualization layout be pairs in a vertical way. 
 * If u add a single network, the network will be seen as a normal-big network, if u add a second it will be paired with the first one and both will shrink and 
 * be placed one on top of the other for easier visualization. If u keep adding more networks, they will try to be paired, if cant be paired, a normal-big network unpaired will appear
 * @author Marco Expósito Pérez
 */
//Namespaces
import { networkHTML } from "../constants/networkHTML";
import Layout from "./layout";
//Local classes

export default class VerticalLayout extends Layout{

    /**
     * Constructor of the class
     * @param {NetworksGroup} networksGroup group of networks that will be controled by this panel
     */
    constructor(networksGroup) {
        super(networksGroup, {main: "col singleNetworkContainer", second: "", pair: "col pairNetworkVertical"});
    }

    /**
     * Returns an htmlString with the basic layout of the vertical layout. 2 rows of networks
     * @param {Integer} nRow numer of the row used as a key
     * @returns {String} returns the html string
     */
    verticalLayoutTemplate(nRow) {
        const htmlString = `
        <div id="networkContainer_${nRow}">
            <div class="row" id="topRow_${nRow}">
                ${this.networkTemplate(`${this.nRows}_${networkHTML.networkFirst}`)}
            </div>
            <div class="row" id="bottomRow_${nRow}">
                ${this.networkTemplate(`${this.nRows}_${networkHTML.networkSecond}`)}
            </div>
        </div>`;

        return htmlString;
    }

    /**
     * Add a new network to the layout
     * @param {String} key key of the network 
     * @param {String} file file with the data of the network
     * @param {Object} config object with the initial configuration of the network
     */
    addNetwork(key, file, config){
        
        const unpairedRow = this.unpairedRows.pop();

        if(unpairedRow === undefined){
            //Create the new row in Layout
            const htmlString = this.verticalLayoutTemplate(this.nRows);
            const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;

            const allNetworksContainer = document.getElementById(networkHTML.networksParentContainer);
            allNetworksContainer.append(html);

            this.makeSingleNetworkRow(this.nRows, networkHTML.networkFirst);

            //Create the networkContainers
            const leftContainer = document.getElementById(`leftCol_${this.nRows}_${networkHTML.networkFirst}`);
            const rightContainer = document.getElementById(`rightCol_${this.nRows}_${networkHTML.networkFirst}`);
            
            const htmlTittleString = this.networkTittleTemplate(key);
            const htmlTittle = this.domParser.parseFromString(htmlTittleString, "text/html").body.firstChild;

            rightContainer.append(htmlTittle);

            //Create the network
            this.networksGroup.addNetwork(file, leftContainer, rightContainer, config)

            this.networkKeyToRow.set(key, `${this.nRows}_${networkHTML.networkFirst}`);
            this.unpairedRows.push({nRow: this.nRows, location: networkHTML.networkSecond});
            this.nRows++;

        }else{
            this.makePairNetworkRow(unpairedRow.nRow);

            //Create the networkContainers
            const networkContainer = document.getElementById(`leftCol_${unpairedRow.nRow}_${unpairedRow.location}`);
            const datatableContainer = document.getElementById(`rightCol_${unpairedRow.nRow}_${unpairedRow.location}`);

            const htmlTittleString = this.networkTittleTemplate(key);
            const htmlTittle = this.domParser.parseFromString(htmlTittleString, "text/html").body.firstChild;

            datatableContainer.append(htmlTittle);

            //Create the network
            this.networksGroup.addNetwork(file, networkContainer, datatableContainer, config)

            this.networkKeyToRow.set(key, `${unpairedRow.nRow}_${unpairedRow.location}`);
        }

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

        container.className = "row singleNetworkContainer";

        //Fix the other network position
        rowId = position !== networkHTML.networkFirst ? "topRow" : "bottomRow";
        container = document.getElementById(`${rowId}_${nRow}`);

        container.className = "row";
    }

    /**
     * Make a row of the layout work as a vertical layout row. Both networks height will be reduced
     * @param {Integer} nRow number/key of the row
     */
    makePairNetworkRow(nRow){
        const topContainer = document.getElementById(`topRow_${nRow}`);
        const bottomContainer = document.getElementById(`bottomRow_${nRow}`);

        topContainer.className = "row pairNetworkVertical";
        bottomContainer.className = "row pairNetworkVertical";
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
}   