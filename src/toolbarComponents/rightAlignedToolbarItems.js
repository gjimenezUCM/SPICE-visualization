import LegendItem from "./rightAlignedItems/legendItem";

export default class RightAlignedToolbarItems {

    /**
     * Constructor of the class

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

    setConfiguration(config){
        for(const item of this.items){
            item.setConfiguration(config);
        }
    }
}

