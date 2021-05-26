import { WebampLazy, URLTrack } from "./Webamp";
import { useCallback } from "react";
import icon from "../images/icons/winamp-playlist-32x32.png";
import DesktopIcon from "./DesktopIcon";
import { getPlaylistTracks, Playlist } from "./Subsonic";

interface Props {
    webamp: WebampLazy; playlist: Playlist;
}

const PlaylistIcon = ({ webamp, playlist }: Props) => {
    function onOpen() {
        getPlaylistTracks(playlist.id).then(tracks => {
            webamp.setTracksToPlay(tracks);
        });
    }

    return (
        <DesktopIcon
            iconUrl={icon}
            name={`${playlist.name}`}
            onOpen={onOpen}
        />
    );
};

export default PlaylistIcon;
