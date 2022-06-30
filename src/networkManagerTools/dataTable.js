/**
 * @fileoverview This class creates and update a html table with a tittle/label in the left column, 
 * and its data/value in the right.
 * @author Marco Expósito Pérez
 */
export default class dataTable {

    /**
     * Constructor of the class
     * @param {HTMLElement} container container of the datatable
     */
    constructor(container) {
        this.container = container;

        this.domParser = new DOMParser();
    }

    /**
     * Create teh dataTable skeleton with empty values
     * @param {Object[]} rowsData Array with the data to create every row of the dataTable.
     * Format-> {tittle: (string), class: (string), data: (string))}
     * @param {String} tittle Title of the dataTable
     * @param {Boolean} drawLineAtTheEnd Boolean that defines if a line should be drawn after the datatable
     */
    createDataTable(rowsData, tittle, drawLineAtTheEnd = true) {
        const body = this.contentTemplate(rowsData);
        const htmlString = this.datatableTemplate(tittle, body);

        const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;
        const htmlChildren = html.children;

        this.htmlRows = new Array();

        for (const child of htmlChildren) {
            if (child.children.length > 1)
                this.htmlRows.push({ tittle: child.children[0], data: child.children[1] });
        }

        this.container.append(html);

        if (drawLineAtTheEnd)
            this.container.append(document.createElement("hr"));
    }

    /**
     * Update the dataTable with the new data for all rows
     * @param {Map} rowsData map with the relationship between tittle -> new data value 
     */
    updateDataTable(rowsData) {
        for (let i = 0; i < this.htmlRows.length; i++) {
            let key;
            if (this.htmlRows[i].tittle.children.length === 1) {
                key = this.htmlRows[i].tittle.children[0].innerText;
            } else {
                key = this.htmlRows[i].tittle.innerText;
            }

            const value = rowsData.get(key);
            if (value !== undefined)
                this.htmlRows[i].data.innerText = value;
        }
    }

    /**
     * Remove all data from the dataTable
     */
    clearDataTable() {
        for (let i = 0; i < this.htmlRows.length; i++) {
            this.htmlRows[i].data.innerText = "";
        }
    }

    /**
     * Returns a Template of the datatable
     * @param {String} tittle Title of the dataTable
     * @param {String} body Body of the datatable
     * @returns {String} returns a string with the template filled
     */
    datatableTemplate(tittle, body) {
        const html = `
        <div class="dataTable border border-dark rounded">
            <h5 class="middle attributes border-bottom border-dark">${tittle}</h5>
            ${body}
        </div>
        <hr>`;

        return html;
    }

    /**
     * Returns a Template of the content of the datatable. The content is formado by rows
     * @param {Object[]} rowsData Array with the data to create every row of the dataTable.
     * Format-> {tittle: (string), class: (string), data: (string))}
     * @returns {String} returns a string with the template filled
     */
    contentTemplate(rowsData) {
        let html = "";

        for (let i = 0; i < rowsData.length; i++) {
            html += this.rowTemplate(rowsData[i].class, rowsData[i].title, rowsData[i].data);
        }

        return html;
    }

    /**
     * Returns a Template of a single row of the datatable.
     * @param {String} rowClass html class of the row
     * @param {String} tittle title/label of the row. Goes in the left column
     * @param {String} data data/value of the row, Goes in the right column
     * @returns {String} returns a string with the template filled
     */
    rowTemplate(rowClass, tittle, data) {
        const html = `
        <div class= "${rowClass}" >
            <div class = "col-6"> ${tittle} </div>
            <div class = "col-6"> ${data} </div>
        </div>`;

        return html;
    }
}