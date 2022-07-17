import SelectPerspectiveItem from "./midAlignedItems/selectPerspectiveItem";

export default class MidAlignedToolbarItems {

    /**
     * Constructor of the class

     */
    constructor(toolbar) {

        this.initItems(toolbar);
        
        this.htmlString = `
        <div class="navbar-collapse collapse justify-content-center" id="collapseNavbar">
            <ul class="navbar-nav">
                ${this.selectPerspective.htmlString}
            </ul>
        </div>`
    }

    /**
     * Initialize all items of this toolbar side
     */
    initItems(toolbar){
        this.items = new Array();

        this.selectPerspective = new SelectPerspectiveItem(toolbar);
        this.items.push(this.selectPerspective);
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

