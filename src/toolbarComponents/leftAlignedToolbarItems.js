/**
 * @fileoverview This class holds the items inside the UI that will be aligned to the left of the toolbox
 * @author Marco Expósito Pérez
 */
//Local classes
import FileSourceItem from "./leftAlignedItems/FileSource"
import LayoutItem from "./leftAlignedItems/LayoutItem";
import OptionsItem from "./leftAlignedItems/OptionsItem";

export default class LeftAlignedToolbarItems {

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
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNavbar">
            <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand abs" href="${window.location.href}"> Visualization module</a>

        <div class="navbar-collapse collapse justify-content-start" id="collapseNavbar">
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

        this.fileSourceItem = new FileSourceItem(toolbar);
        this.items.push(this.fileSourceItem);

        this.optionsItems = new OptionsItem(toolbar);
        this.items.push(this.optionsItems);

        this.layoutItem = new LayoutItem(toolbar);
        this.items.push(this.layoutItem);
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

