import FileSourceItem from "./leftToolbarItems/FileSource"
import OptionsItem from "./leftToolbarItems/OptionsItem";



export default class LeftAlignedToolbarItems {

    /**
     * Constructor of the class

     */
    constructor(toolbar) {

        this.initItems(toolbar);
        
        this.htmlString = `
        <div class="d-flex col leftNavbarGroup">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNavbar">
                <span class="navbar-toggler-icon"></span>
            </button>
            <a class="navbar-brand abs" href="#"> Visualization module</a>

            <div class="navbar-collapse collapse" id="collapseNavbar">
                <ul class="navbar-nav">
                    ${this.fileSourceItem.htmlString}
                    ${this.optionsItems.htmlString}

                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Layout
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a class="dropdown-item" href="#">Horizontal</a></li>
                            <li><a class="dropdown-item" href="#">Vertical</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
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

    }
    
    /**
     * Create the events of all items of this toolbar side
     */
    createEvents(){
        for(const item of this.items){
            item.createEvents();
        }

    }
}

