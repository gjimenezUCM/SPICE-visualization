/**
 * @fileoverview This class holds the items inside the UI that will be aligned to the right of the toolbox
 * @author Marco Expósito Pérez
 */
//Local classes
import LegendItem from "./rightAlignedItems/legendItem";

export default class RightAlignedToolbarItems {

    /**
     * Constructor of the class
     * @param {ToolBar} toolbar toolbar owner of this item
     */
    constructor(toolbar) {

        this.initItems(toolbar);
        
        this.htmlString = `
        <div class="navbar-collapse collapse flex-row-reverse" id="collapseNavbar">
            <ul class="navbar-nav">
                ${this.legend.htmlString}
            </ul>
        </div>`;
        
    }

    /**
     * Initialize all items of this toolbar side
     */
    initItems(toolbar){
        this.items = new Array();

        this.legend = new LegendItem(toolbar);
        this.items.push(this.legend);
    }
    
    /**
     * Create the events of all items of this toolbar side
     */
    createEvents(){
        for(const item of this.items){
            item.createEvents();
        }
    }

    /**
     * Set the configuration file based on all items of this toolbar part
     * @param {Object} config network configuration file
     */
    setConfiguration(config){
        for(const item of this.items){
            item.setConfiguration(config);
        }
    }
}

