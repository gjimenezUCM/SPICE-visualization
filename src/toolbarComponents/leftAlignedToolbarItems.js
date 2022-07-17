import FileSourceItem from "./leftAlignedItems/FileSource"
import LayoutItem from "./leftAlignedItems/LayoutItem";
import OptionsItem from "./leftAlignedItems/OptionsItem";



export default class LeftAlignedToolbarItems {

    /**
     * Constructor of the class

     */
    constructor(toolbar) {

        this.initItems(toolbar);
        
        this.htmlString = `
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNavbar">
            <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand abs" href="#"> Visualization module</a>

        <div class="navbar-collapse collapse justify-content-start" id="collapseNavbar">
            <ul class="navbar-nav">
                ${this.fileSourceItem.htmlString}
                ${this.optionsItems.htmlString}
                ${this.layoutItem.htmlString}
            </ul>
        </div>`
    }

    /**
     * Initialize all items of this toolbar side
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

