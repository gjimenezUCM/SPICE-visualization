/**
 * @fileoverview This class changes the visualization layout be pairs in an horizontal way. 
 * If u add a single network, the network will be seen as a normal-big network, if u add a second it will be paired with the first one and both will shrink and 
 * be placed side by side for easier visualization. If u keep adding more networks, they will try to be paired, if cant be paired, a normal-big network unpaired will appear
 * @author Marco Expósito Pérez
 */
//Namespaces
import { networkHTML } from "../constants/networkHTML";
import Layout from "./layout";
//Local classes

export default class HorizontalLayout extends Layout{

    /**
     * Constructor of the class
     * @param {NetworksGroup} networksGroup group of networks that will be controled by this panel
     */
    constructor(networksGroup) {
        super(networksGroup, {main: "col singleNetworkContainer", second: "", pair: "col singleNetworkContainer"});
    }

    /**
     * Returns an htmlString with the basic layout of the horizontal layout. 2 columns of networks
     * @param {Integer} nRow numer of the row used as a key
     * @returns {String} returns the html string
     */
    horizontalLayoutTemplate(nRow) {
        const htmlString = `
        <div class="row" id="networkContainer_${nRow}">
            <div class="col" id="topRow_${nRow}">
                ${this.networkTemplate(`${this.nRows}_${networkHTML.networkFirst}`, true)}
            </div>
            <div class="col" id="bottomRow_${nRow}">
                ${this.networkTemplate(`${this.nRows}_${networkHTML.networkSecond}`, false)}
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
            const htmlString = this.horizontalLayoutTemplate(this.nRows);
            const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;

            const allNetworksContainer = document.getElementById(networkHTML.networksParentContainer);
            allNetworksContainer.append(html);

            this.makeSingleNetworkRow(this.nRows, networkHTML.networkFirst);

            //Create the networkContainers
            const tabledataContainer = document.getElementById(`leftCol_${this.nRows}_${networkHTML.networkFirst}`);
            const networkContainer = document.getElementById(`rightCol_${this.nRows}_${networkHTML.networkFirst}`);
            
            const htmlTittleString = this.networkTittleTemplate(key);
            const htmlTittle = this.domParser.parseFromString(htmlTittleString, "text/html").body.firstChild;

            tabledataContainer.append(htmlTittle);

            //Create the network
            this.networksGroup.addNetwork(file, networkContainer, tabledataContainer, config)

            this.networkKeyToRow.set(key, `${this.nRows}_${networkHTML.networkFirst}`);
            this.unpairedRows.push({nRow: this.nRows, location: networkHTML.networkSecond});
            this.nRows++;

        }else{
            this.makePairNetworkRow(unpairedRow.nRow);

            //Create the networkContainers
            const leftCol = document.getElementById(`leftCol_${unpairedRow.nRow}_${unpairedRow.location}`);
            const rightCol = document.getElementById(`rightCol_${unpairedRow.nRow}_${unpairedRow.location}`);

            const htmlTittleString = this.networkTittleTemplate(key);
            const htmlTittle = this.domParser.parseFromString(htmlTittleString, "text/html").body.firstChild;

            let tabledataContainer = rightCol;
            let networkContainer = leftCol;

            //Create the network
            if(unpairedRow.location === networkHTML.networkFirst){
                tabledataContainer = leftCol;
                networkContainer = rightCol;   
            }

            tabledataContainer.append(htmlTittle);
            this.networksGroup.addNetwork(file, networkContainer, tabledataContainer, config)

            this.networkKeyToRow.set(key, `${unpairedRow.nRow}_${unpairedRow.location}`);
        }
    }
}   