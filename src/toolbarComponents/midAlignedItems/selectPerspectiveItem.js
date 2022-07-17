/**
 * @fileoverview This class creates a dropdown Menu that allows the user to pick between diferent
 * perspectives to see/hide them
 * @package Requires bootstrap package to be able to use the dropdown. 
 * @author Marco Expósito Pérez
 */

export default class SelectPerspectiveItem {
    
    /**
     * Constructor of the class
     * @param {ToolBar} toolbar toolbar owner of this item
     */
    constructor(toolbar) {
        this.toolbar = toolbar;
        
        addEventListener('toolbarReset', () => this.restart(), false);

        this.htmlString = `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle btn-secondary unselectable" data-bs-auto-close="outside" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Select Perspective
            </a>
            <ul class="dropdown-menu" id="dropdownPerspectivesOptionsMenu" aria-labelledby="navbarDropdown">
            </ul>
        </li>`;
    }

    /**
     * Create the events related with the Select perspective dropdown
     */
    createEvents(){
        const htmlString = this.createDropdownMenu();

        const html = this.toolbar.domParser.parseFromString(htmlString, "text/html").body.firstChild;
        document.getElementById("dropdownPerspectivesOptionsMenu").append(html);

        this.perspectiveOptions = document.querySelectorAll("a[name='dropdownPerspectivesOptions']");

        for(const option of this.perspectiveOptions){
            option.onclick = () => this.selectPerspectiveOnclick(option);
        }
    }
    
    /**
     * Creates the dropdown html structure based on the number of files available
     * @returns {String} returns the html string with the structure
     */
    createDropdownMenu(){
        this.restart();

        const file = this.toolbar.file;
        const n = file.length;

        let content = "<div>";
        for (let i = 0; i < n; i++) {
            const key = file[i].name;
            content += this.dropdownRowTemplate(key);
        }
        content += "</div>"

        return content;
    }

    /**
     * Function executed when a Select perspective option is clicked. Add/Hide the network perspective selected
     * @param {HTMLElement} button button clicked
     */
    selectPerspectiveOnclick(button){
        const active = this.toolbar.toggleDropdownItemState(button);
        const key = button.getAttribute("key");

        this.toolbar.togglePerspective(active, key);
    }

    /**
     * Template of a row of the dropdown
     * @param {String} key key of this option
     * @returns {String} returns the html string with the template
     */
    dropdownRowTemplate(key){
        return `
        <li>
            <a class="dropdown-item unselectable" name="dropdownPerspectivesOptions" key="${key}" id="dropdownPerspectivesOptions${key}">
                ${key}
            </a>
        </li>`;
    }

    setConfiguration(){}

    /**
     * Clear the dropdown menu options
     */
    restart(){
        const dropdownContainer = document.getElementById("dropdownPerspectivesOptionsMenu");
        dropdownContainer.innerHTML = "";
    }
}