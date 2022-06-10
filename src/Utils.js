
export default class Utils {

    constructor() {

        this.red = "rgb(255, 0, 0, 1)";
        this.green = "rgb(0, 255, 72, 1)";
        this.blue = "rgb(25, 166, 255, 1)";
        this.yellow = "rgb(255, 252, 25, 1)";
    }

    getColorsForN(n) {
        switch (n) {
            case 0:
                return this.red;
            case 1:
                return this.green;
            case 2:
                return this.blue;
            case 3:
                return this.yellow;
        }
    }

    getShapeForN(n) {
        n = n % 7
        switch (n) {
            case 0:
                return { shape: "dot", vOffset: -31, selOffset: -40 };
            case 1:
                return { shape: "diamond", vOffset: -31, selOffset: -40 };
            case 2:
                return { shape: "star", vOffset: -31, selOffset: -40 };
            case 3:
                return { shape: "triangle", vOffset: -25, selOffset: -35 };
            case 4:
                return { shape: "square", vOffset: -31, selOffset: -40 };
            case 5:
                return { shape: "triangleDown", vOffset: -35, selOffset: -45 };
            case 6:
                return { shape: "hexagon", vOffset: -31, selOffset: -40 };
        }
    }

    getCommunityCharacteristic(communityN, n) {
        switch (communityN) {
            case 0:
                return this.getColorsForN(n);
            case 1:
                return this.getShapeForN(n);
        }

    }


    getShapehtml(html, n) {
        let shape = this.getShapeForN(n).shape;

        switch (shape) {
            case "square":
                html.className = "square";
                return;
            case "triangle":
                html.className = "triangle";
                return;
            case "diamond":
                html.className = "diamond";
                return;
            case "dot":
                html.className = "circle";
                return;
            case "star":
                html.className = "star";
                return;
            default:
                html.innerText = shape;
                return;
        }
    }



}