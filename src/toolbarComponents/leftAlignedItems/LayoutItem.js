/**
 * @fileoverview This class creates a dropdown Menu that allows the user to choose diferent layouts
 * to see the networks
 * @package Requires bootstrap package to be able to use the dropdown. 
 * @author Marco Expósito Pérez
 */

export default class LayoutItem {

    /**
     * Constructor of the class
     * @param {ToolBar} toolbar toolbar owner of this item
     */
    constructor(toolbar) {
        this.toolbar = toolbar;

        this.htmlString = `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle unselectable" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Layout
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><a class="dropdown-item unselectable" name="networkLayout">Horizontal</a></li>
                <li><a class="dropdown-item unselectable active" name="networkLayout">Vertical</a></li>
            </ul>
        </li>`;
    }

    /**
     * Create the events related with the Layout dropdown
     */
     createEvents(){
        this.layoutsArray = new Array();

        this.layoutsArray = document.querySelectorAll("a[name='networkLayout']");

        for(const option of this.layoutsArray){
            option.onclick = () => this.layoutOnclick(option.innerText);
        }
    }

    /**
     * Function executed when a layout option is clicked. Changes the aplication layout and restarts it
     * @param {String} layout key of the layout selected
     */
    layoutOnclick(layout){
        this.toolbar.changeLayout(layout);

        for(const option of this.layoutsArray){
            if(option.innerText === layout){
                option.className = "dropdown-item unselectable active";
            }else{
                option.className = "dropdown-item unselectable";
            }
        }
    }   

    setConfiguration(){}

}