

export default class dataTable {

    constructor(container) {
        this.container = container;

        this.domParser = new DOMParser();
    }

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

    clearDataTable() {
        for (let i = 0; i < this.htmlRows.length; i++) {
            this.htmlRows[i].data.innerText = "";
        }
    }

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

        if(drawLineAtTheEnd)
            this.container.append(document.createElement("hr"));
    }

    datatableTemplate(tittle, body) {
        const html = `
        <div class="border border-dark rounded">
            <h5 class="middle attributes border-bottom border-dark">${tittle}</h5>
            ${body}
        </div>
        <hr>`;

        return html;
    }

    contentTemplate(rowsData) {
        let html = "";

        for (let i = 0; i < rowsData.length; i++) {
            html += this.rowTemplate(rowsData[i].class, rowsData[i].title, rowsData[i].data);
        }

        return html;
    }


    rowTemplate(rowClass, tittle, data) {
        const html = `
        <div class= "${rowClass}" >
            <div class = "col-6"> ${tittle} </div>
            <div class = "col-6"> ${data} </div>
        </div>`;

        return html;
    }
}