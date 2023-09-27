import createIdRoom from "./createIdRoom.js";
import { setCookie, getCookie } from "./cookie.js";

if(document.getElementById("idRoom")) {
    setCookie('idTemp', createIdRoom(), 1);
    document.getElementById("idRoom").innerHTML = getCookie('idTemp');
}