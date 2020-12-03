// Dynamically set the css background images for all the sprites
import { LETTERS } from "../constants";
import { imageSelectors, cursorSelectors } from "../skinSelectors";
import { useTypedSelector } from "../hooks";
import * as Selectors from "../selectors";
import { SkinImages } from "../types";
import { createSelector } from "reselect";
import Css from "./Css";
import ClipPaths from "./ClipPaths";
import { imageVarName, cursorVarName } from "../utils";

const CSS_PREFIX = "#webamp";

const mapRegionNamesToIds: { [key: string]: string } = {
  normal: "mainWindowClipPath",
  windowshade: "shadeMainWindowClipPath",
  equalizer: "equalizerWindowClipPath",
  equalizerws: "shadeEqualizerWindowClipPath",
};

const mapRegionNamesToMatcher: { [key: string]: string } = {
  normal: "#main-window:not(.shade)",
  windowshade: "#main-window.shade",
  equalizer: "#equalizer-window:not(.shade)",
  equalizerws: "#equalizer-window.shade",
};

const numExIsUsed = (skinImages: SkinImages) => Boolean(skinImages.DIGIT_0_EX);

const FALLBACKS: { [key: string]: string } = {
  MAIN_BALANCE_BACKGROUND: "MAIN_VOLUME_BACKGROUND",
  MAIN_BALANCE_THUMB: "MAIN_VOLUME_THUMB",
  MAIN_BALANCE_THUMB_ACTIVE: "MAIN_VOLUME_THUMB_SELECTED",
};

const getCssVars = createSelector(
  Selectors.getSkinImages,
  Selectors.getSkinCursors,
  (skinImages, skinCursors): string | null => {
    if (!skinImages || !skinCursors) {
      return null;
    }
    const variableRules = [
      ...Object.entries(skinImages).map(([imageName, value]) => [
        imageVarName(imageName),
        value || skinImages[FALLBACKS[imageName]],
      ]),
      ...Object.entries(skinCursors).map(([imageName, value]) => [
        cursorVarName(imageName),
        value,
      ]),
    ];

    const rules = variableRules
      .filter(([, image]) => image != null)
      .map(([name, image]) => `${name}: url(${image})`)
      .join(";\n  ");

    return `${CSS_PREFIX} {\n  ${rules}\n}`;
  }
);

const getLetterWidths = createSelector(
  Selectors.getSkinLetterWidths,
  (skinGenLetterWidths) => {
    const cssRules: string[] = [];
    if (skinGenLetterWidths != null) {
      LETTERS.forEach((letter) => {
        const width = skinGenLetterWidths[`GEN_TEXT_${letter}`];
        const selectedWidth =
          skinGenLetterWidths[`GEN_TEXT_SELECTED_${letter}`];
        cssRules.push(
          `${CSS_PREFIX} .gen-text-${letter.toLowerCase()} {width: ${width}px;}`
        );
        cssRules.push(
          `${CSS_PREFIX} .selected .gen-text-${letter.toLowerCase()} {width: ${selectedWidth}px;}`
        );
      });
    }
    return cssRules.join("\n");
  }
);

const getCssRules = createSelector(
  Selectors.getSkinImages,
  Selectors.getSkinRegion,
  (skinImages, skinRegion): string => {
    const cssRules = [];
    // DEPRECATED: All of these should be replaced with calls to `useSprite` in
    // the component that actually renders the element.
    Object.entries(imageSelectors).forEach(([imageName, selectors]) => {
      selectors.forEach((selector) => {
        // Ideally we would collapse this down into a single rule that has
        // multipel comma separated selectors. However, `::-moz-range-thumb`
        // will break the rule in non-Firefox browsers, so we just make each
        // selector it's own rule.
        cssRules.push(
          `${CSS_PREFIX} ${selector} {\n  background-image: var(${imageVarName(
            imageName
          )});\n}`
        );
      });
    });

    Object.keys(cursorSelectors).forEach((cursorName) => {
      cursorSelectors[cursorName].forEach((selector) => {
        cssRules.push(
          `${
            // TODO: Fix this hack
            // Maybe our CSS name spacing should be based on some other class/id
            // than the one we use for defining the main div.
            // That way it could be shared by both the player and the context menu.
            selector.startsWith("#webamp-context-menu") ? "" : CSS_PREFIX
          } ${selector} {cursor: var(${cursorVarName(cursorName)}), auto}`
        );
      });
    });

    if (numExIsUsed(skinImages)) {
      // This alternate number file requires that the minus sign be
      // formatted differently.
      cssRules.push(
        `${CSS_PREFIX} .status #time #minus-sign { top: 0px; left: -1px; width: 9px; height: 13px; }`
      );
    }

    for (const [regionName, polygons] of Object.entries(skinRegion)) {
      if (polygons) {
        const matcher = mapRegionNamesToMatcher[regionName];
        const id = mapRegionNamesToIds[regionName];
        cssRules.push(`${CSS_PREFIX} ${matcher} { clip-path: url(#${id}); }`);
      }
    }

    return cssRules.join("\n");
  }
);

const getClipPaths = createSelector(Selectors.getSkinRegion, (skinRegion) => {
  const clipPaths: { [id: string]: string[] } = {};
  for (const [regionName, polygons] of Object.entries(skinRegion)) {
    if (polygons) {
      const id = mapRegionNamesToIds[regionName];
      clipPaths[id] = polygons;
    }
  }
  return clipPaths;
});

export default function Skin() {
  const cssRules = useTypedSelector(getCssRules);
  const cssVars = useTypedSelector(getCssVars);
  const letterWidths = useTypedSelector(getLetterWidths);
  const clipPaths = useTypedSelector(getClipPaths);
  return (
    <>
      <Css id="webamp-style">{cssRules}</Css>
      {cssVars != null && (
        <Css id="webamp-skin">{`${cssVars} ${letterWidths}`}</Css>
      )}
      <ClipPaths>{clipPaths}</ClipPaths>
    </>
  );
}
