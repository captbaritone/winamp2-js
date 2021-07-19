import * as Sentry from "@sentry/browser";
// @ts-ignore
import createMiddleware from "redux-sentry-middleware";
// @ts-ignore
import isButterchurnSupported from "butterchurn/dist/isSupported.min";
import { loggerMiddleware } from "./eventLogger";
import * as SoundCloud from "./SoundCloud";

import {
  Action,
  Options,
  PrivateOptions,
  WINDOWS,
  STEP_MARQUEE,
  UPDATE_TIME_ELAPSED,
  UPDATE_WINDOW_POSITIONS,
  SET_VOLUME,
  SET_BALANCE,
  SET_BAND_VALUE,
  AppState,
  WindowLayout,
} from "./Webamp";

import { getButterchurnOptions } from "./butterchurnOptions";
import dropboxFilePicker from "./dropboxFilePicker";
import availableSkins from "./avaliableSkins";

import { initialTracks, initialState } from "./config";
import screenshotInitialState from "./screenshotInitialState";

const NOISY_ACTION_TYPES = new Set([
  STEP_MARQUEE,
  UPDATE_TIME_ELAPSED,
  UPDATE_WINDOW_POSITIONS,
  SET_VOLUME,
  SET_BALANCE,
  SET_BAND_VALUE,
]);

const MIN_MILKDROP_WIDTH = 725;

let lastActionType: string | null = null;

// Filter out consecutive common actions
function filterBreadcrumbActions(action: Action) {
  const noisy =
    lastActionType != null &&
    NOISY_ACTION_TYPES.has(action.type) &&
    NOISY_ACTION_TYPES.has(lastActionType);
  lastActionType = action.type;
  return !noisy;
}

const sentryMiddleware = createMiddleware(Sentry, {
  filterBreadcrumbActions,
  stateTransformer: getDebugData,
});

export async function getWebampConfig(
  screenshot: boolean,
  skinUrl: string | null,
  soundCloudPlaylist: SoundCloud.SoundCloudPlaylist | null
): Promise<Options & PrivateOptions> {
  let __butterchurnOptions;
  let __initialWindowLayout: WindowLayout | undefined;
  if (isButterchurnSupported()) {
    const startWithMilkdropHidden = skinUrl != null || screenshot;

    __butterchurnOptions = getButterchurnOptions(startWithMilkdropHidden);

    if (
      startWithMilkdropHidden ||
      document.body.clientWidth < MIN_MILKDROP_WIDTH
    ) {
      __initialWindowLayout = {
        [WINDOWS.MAIN]: { position: { x: 0, y: 0 } },
        [WINDOWS.EQUALIZER]: { position: { x: 0, y: 116 } },
        [WINDOWS.PLAYLIST]: { position: { x: 0, y: 232 }, size: [0, 0] },
        [WINDOWS.MILKDROP]: { position: { x: 0, y: 348 }, size: [0, 0] },
      };
    } else {
      __initialWindowLayout = {
        [WINDOWS.MAIN]: { position: { x: 0, y: 0 } },
        [WINDOWS.EQUALIZER]: { position: { x: 0, y: 116 } },
        [WINDOWS.PLAYLIST]: { position: { x: 0, y: 232 }, size: [0, 4] },
        [WINDOWS.MILKDROP]: { position: { x: 275, y: 0 }, size: [7, 12] },
      };
    }
  }

  const initialSkin = !skinUrl ? undefined : { url: skinUrl };

  return {
    initialSkin,
    // eslint-disable-next-line no-nested-ternary
    initialTracks: screenshot
      ? undefined
      : soundCloudPlaylist != null
      ? SoundCloud.tracksFromPlaylist(soundCloudPlaylist)
      : initialTracks,
    availableSkins,
    filePickers: [dropboxFilePicker],
    enableHotkeys: true,
    handleTrackDropEvent: (e) => {
      const trackJson = e.dataTransfer.getData("text/json");
      if (trackJson == null) {
        return null;
      }
      try {
        const track = JSON.parse(trackJson);
        return [track];
      } catch (err) {
        return null;
      }
    },
    requireJSZip: () =>
      // @ts-ignore
      import(/* webpackChunkName: "jszip" */ "jszip/dist/jszip"),
    requireMusicMetadata: () =>
      import(
        /* webpackChunkName: "music-metadata-browser" */ "music-metadata-browser/dist/index"
      ),
    __initialWindowLayout,
    __initialState: screenshot ? screenshotInitialState : initialState,
    __butterchurnOptions,
    __customMiddlewares: [sentryMiddleware, loggerMiddleware],
  };
}

function getDebugData(state: AppState) {
  return {
    ...state,
    display: {
      ...state.display,
      skinGenLetterWidths: "[[REDACTED]]",
      skinImages: "[[REDACTED]]",
      skinCursors: "[[REDACTED]]",
      skinRegion: "[[REDACTED]]",
    },
  };
}
