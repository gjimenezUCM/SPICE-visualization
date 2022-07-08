/**
 * @fileoverview This File is the entry point of the application
 * @author Marco Expósito Pérez
 */
//Css
import bt_css from "../node_modules/bootstrap/dist/css/bootstrap.css";
import base_css from "../css/genericStyle.css";
import legend_css from "../css/legendStyle.css";
//Local classes
import InitialOptions from "./initialOptions.js";


window.onload = function () {

	const isLocalhost = window.location.hostname === "localhost";

	const msg = isLocalhost ? "App running as localhost" : "App running in an external server: " + window.location.hostname;
	console.log(msg);

	new InitialOptions(isLocalhost);
}


