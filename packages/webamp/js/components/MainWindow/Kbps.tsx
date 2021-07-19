import { memo } from "react";

import CharacterString from "../CharacterString";
import * as Selectors from "../../selectors";
import { useTypedSelector } from "../../hooks";

const Kbps = memo(() => {
  let kbps = useTypedSelector(Selectors.getKbps)?.padStart(3);
  if (kbps !== undefined && kbps?.length > 3) {
    kbps = kbps.substring(0, 2) + "H";
  }
  return (
    <div id="kbps">
      <CharacterString>{kbps || ""}</CharacterString>
    </div>
  );
});

export default Kbps;
