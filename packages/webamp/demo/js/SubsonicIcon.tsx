import icon from "../images/icons/subsonic-32x32.png";
import DesktopIcon from "./DesktopIcon";
import ReactDOM from "react-dom";
import "../../css/subsonic-container.css";
import { setSubsonicServer } from "./Subsonic";

const container = document.createElement("div");
container.id = "subsonic-container";
const body = document.querySelector("body")?.appendChild(container);

const SubsonicIcon = () => {
    function onOpen() {
        ReactDOM.render(
            <form id="subsonic-connect">
                <label htmlFor="subsonic-domain">Domain</label>
                <input id="subsonic-domain" name="domain" type="text" required />
                <label htmlFor="subsonic-username">Username</label>
                <input id="subsonic-username" name="username" type="text" required />
                <label htmlFor="subsonic-password">Password</label>
                <input id="subsonic-password" name="password" type="password" required />
                <button id="subsonic-close">Close</button><button>Connect</button>
            </form>, container);
        (document.getElementById("subsonic-domain") as HTMLInputElement).value = window.location.hostname;
        document.getElementById("subsonic-connect")?.addEventListener("submit", function (e) {
            e.preventDefault();
            setSubsonicServer((document.getElementById("subsonic-domain") as HTMLInputElement).value,
                (document.getElementById("subsonic-username") as HTMLInputElement).value,
                (document.getElementById("subsonic-password") as HTMLInputElement).value);
            ReactDOM.unmountComponentAtNode(container);
        });
        document.getElementById("subsonic-close")?.addEventListener("click", function (e) {
            ReactDOM.unmountComponentAtNode(container);
        });
    }
    return (
        <DesktopIcon
            iconUrl={icon}
            name={`Connect to Subsonic`}
            onOpen={onOpen}
        />
    );
};

export default SubsonicIcon;
