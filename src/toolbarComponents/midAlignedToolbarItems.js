/**
 * @fileoverview This class holds the items inside the UI that will be aligned to the middle of the toolbox
 * @author Marco Expósito Pérez
 */
//Local classes
import SelectPerspectiveItem from "./midAlignedItems/selectPerspectiveItem";

export default class MidAlignedToolbarItems {

    /**
     * Constructor of the class
     * @param {Object[]} items items that will be in this part of the toolbar
     */
     constructor(items) {   
        this.items = items;
        
        let body = "";
        for(const item of this.items){
            body += item.htmlString;
        }

        this.htmlString = `
        <div class="navbar-collapse collapse justify-content-center" id="collapseNavbar">
            <ul class="navbar-nav">
                ${body}
            </ul>
        </div>`
    }

    /**
     * Initialize all items of this toolbar part
     */
    initItems(toolbar){
        this.items = new Array();

        this.selectPerspective = new SelectPerspectiveItem(toolbar);
        this.items.push(this.selectPerspective);
    }
    
    /**
     * Create the events of all items of this toolbar part
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

