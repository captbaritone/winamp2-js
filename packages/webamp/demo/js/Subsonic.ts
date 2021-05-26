import { URLTrack } from "../../js/types"
const md5 = require("md5");
export interface Playlist {
    name: String, id: Number
}
var domain: string;
var username: string;
var password: string;
export var playlists: Playlist[] = [];
function getNonce(): string {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~'
    const result = new Array();
    window.crypto.getRandomValues(new Uint8Array(32)).forEach(c =>
        result.push(charset[c % charset.length]));
    return result.join('');
}
function getAuthParams(): string {
    const salt = getNonce();
    const token = md5(password.concat(salt));
    return `u=${username}&s=${salt}&t=${token}`;
}
/**
 * attempt to detect if this is served from a subsonic compatible server, and try to get credentials automatically
 * currently supports Funkwhale
 */
async function detectServer() {
    let home = await fetch(window.location.origin);
    if (!home.ok) { return; }
    let t = await home.text();
    const dom = new DOMParser().parseFromString(t, 'text/html');
    if (null !== dom.querySelector("meta[name=generator][content=Funkwhale]")) {
        let req = await fetch(`${window.location.origin}/api/v1/users/me/`);
        if (!req.ok) { return; }
        let userjson = await req.json();
        req = await fetch(`${window.location.origin}/api/v1/users/${userjson.username}/subsonic-token/`);
        if (!req.ok) { return; }
        let subjson = await req.json();
        setSubsonicServer(window.location.hostname, userjson.username, subjson.subsonic_api_token);
    }
}
export function setSubsonicServer(newDomain: string, newUsername: string, newPassword: string) {
    if (null !== newDomain && null !== newUsername && null !== newPassword) {
        domain = newDomain;
        username = newUsername;
        password = newPassword;
        getPlaylists().then(function (l) {
            // redraw desktop to show playlist icons
            window.dispatchEvent(new Event("resize"));
        });
    }
}
detectServer();
export async function getPlaylists(): Promise<Playlist[]> {
    const parameters = new URLSearchParams(window.location.search);
    if (undefined !== domain && undefined !== username && undefined !== password) {
        let res = await fetch(`https://${domain}/rest/getPlaylists.view?f=json&${getAuthParams()}`);
        if (res.ok) {
            let lists = await res.json();
            playlists = [];
            for (const e of lists['subsonic-response']['playlists']['playlist']) {
                playlists.push({ name: e.name, id: e.id });
            }
        };
    }
    return playlists;
}
export async function getPlaylistTracks(id: Number): Promise<URLTrack[]> {
    const output: URLTrack[] = [];
    const parameters = new URLSearchParams(window.location.search);
    let res = await fetch(`https://${domain}/rest/getPlaylist.view?f=json&id=${id}&${getAuthParams()}`);
    if (res.ok) {
        let lists = await res.json();
        for (const e of lists['subsonic-response']['playlist']['entry']) {
            output.push({
                duration: e.duration,
                defaultName: `${e.artist} - ${e.title}`,
                url: `https://${domain}/rest/stream.view?id=${e.id}&${getAuthParams()}`,
                //metaData: { artist: e.artist, title: e.title, album: e.album },
            });
        }
    }
    return output;
}
