import { WebampLazy } from "./Webamp";
import { Suspense } from "react";
import WebampIcon from "./WebampIcon";
// import Mp3Icon from "./Mp3Icon";
import SkinIcon from "./SkinIcon";
import { /* defaultInitialTracks, */ SHOW_DESKTOP_ICONS } from "./config";
import { useWindowSize } from "../../js/hooks";
import avaliableSkins from "./avaliableSkins";
import DesktopLinkIcon from "./DesktopLinkIcon";
import museumIcon from "../images/icons/internet-folder-32x32.png";
import soundcloudIcon from "../images/icons/soundcloud-32x32.png";
import { SoundCloudPlaylist } from "./SoundCloud";
import { getPlaylists, playlists } from "./Subsonic";
import PlaylistIcon from "./PlaylistIcon";
import SubsonicIcon from "./SubsonicIcon";
// import MilkIcon from "./MilkIcon";

interface Props {
  webamp: WebampLazy;
  soundCloudPlaylist: SoundCloudPlaylist | null;
}

const ICON_WIDTH = 75;
const ICON_HEIGHT = 100;
const VERTICAL_MARGIN = 30;
const HORIZONTAL_MARGIN = 10;

const DemoDesktop = ({ webamp, soundCloudPlaylist }: Props) => {
  const { width } = useWindowSize();
  const visibleWidth = width - VERTICAL_MARGIN * 2;

  const columns = Math.floor(visibleWidth / ICON_WIDTH);

  const icons = [<WebampIcon webamp={webamp} />];

  if (SHOW_DESKTOP_ICONS) {
    icons.push(
      /*
      ...defaultInitialTracks.map((track) => {
        return <Mp3Icon webamp={webamp} track={track} />;
      }),
      */
      ...avaliableSkins.map((skin) => {
        return <SkinIcon webamp={webamp} skin={skin} />;
      }),
      /*
      <MilkIcon
        webamp={webamp}
        preset={{
          url:
            "https://s3-us-east-2.amazonaws.com/butterchurn-presets/65b9eea6e1cc6bb9f0cd2a47751a186f.json",
          name: "105",
        }}
      />
      */ <DesktopLinkIcon
        iconUrl={museumIcon}
        name="Winamp Skin Musuem"
        href={"https://skins.webamp.org"}
      />
    );
    if (soundCloudPlaylist != null) {
      icons.push(
        <DesktopLinkIcon
          iconUrl={soundcloudIcon}
          name={soundCloudPlaylist.title}
          href={soundCloudPlaylist.permalink_url}
        />
      );
    }
    icons.push(SubsonicIcon());
    playlists.forEach(list => {
      icons.push(PlaylistIcon({ webamp: webamp, playlist: list }));
    });
  }
  return (
    <div
      id="desktop"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        // bottom: 0,
        marginTop: VERTICAL_MARGIN,
        marginLeft: HORIZONTAL_MARGIN,
      }}
    >
      <Suspense
        fallback={null /* Wait for all icons to load before showing any */}
      >
        {icons.map((icon, i) => {
          const row = Math.floor(i / columns);
          const column = i % columns;
          return (
            <div
              key={i}
              style={{
                left: column * ICON_WIDTH,
                top: row * ICON_HEIGHT,
                width: ICON_WIDTH,
                position: "absolute",
              }}
            >
              {icon}
            </div>
          );
        })}
      </Suspense>
    </div>
  );
};

export default DemoDesktop;
