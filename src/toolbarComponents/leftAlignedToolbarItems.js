/**
 * @fileoverview This class holds the items inside the UI that will be aligned to the left of the toolbox
 * @author Marco Expósito Pérez
 */

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

