

export default class SelectPerspectiveItem {

    /**
     * Constructor of the class
     */
    constructor(toolbar) {
        this.toolbar = toolbar;

        this.htmlString = `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle btn-secondary" data-bs-auto-close="outside" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Select Perspective
            </a>
            <ul class="dropdown-menu" id="dropdownPerspectivesOptionsMenu" aria-labelledby="navbarDropdown">
            </ul>
        </li>`;
    }

    /**
     * Create the events related with the Layout dropdown
     */
    createEvents(){
        const file = this.toolbar.file;
        const n = file.length;

        let content = "<div>";
        for (let i = 0; i < n; i++) {
            const key = file[i].name;
            content += this.dropdownRowTemplate(key);
        }
        content += "</div>"

        const html = this.toolbar.domParser.parseFromString(content, "text/html").body.firstChild;
        document.getElementById("dropdownPerspectivesOptionsMenu").append(html);

        this.perspectiveOptions = document.querySelectorAll("a[name='dropdownPerspectivesOptions']");

        for(const option of this.perspectiveOptions){
            option.onclick = () => this.selectPerspectiveOnclick(option);
        }
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



    dropdownRowTemplate(key){
        return `
        <li>
            <a class="dropdown-item unselectable" name="dropdownPerspectivesOptions" key="${key}" id="dropdownPerspectivesOptions${key}">
                ${key}
            </a>
        </li>`;
    }

    setConfiguration(){}
}