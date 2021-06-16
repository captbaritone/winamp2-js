import { SkinContext } from "../types";
import { toBool } from "../utils";
import Layout from "./Layout";
import XmlObj from "./XmlObj";

// > A container is a top level object and it basically represents a window.
// > Nothing holds a container. It is an object that holds multiple related
// > layouts. Each layout represents an appearance for that window. You can design
// > different layouts for each window but only one can be visible at a time.
//
// -- http://wiki.winamp.com/wiki/Modern_Skin:_Container
export default class Container extends XmlObj {
  _layouts: Layout[] = [];
  _activeLayout: Layout | null = null;
  _defaultVisible: boolean = true;
  _id: string;
  constructor() {
    super();
  }

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "id":
        this._id = value.toLowerCase();
        break;
      case "default_visible":
        this._defaultVisible = toBool(value);
        break;
      default:
        return false;
    }
    return true;
  }

  init(context: SkinContext) {
    for (const layout of this._layouts) {
      layout.init(context);
    }
  }

  getId() {
    return this._id;
  }

  /* Required for Maki */
  /**
   * Get the layout associated with the an id.
   * This corresponds to the "id=..." attribute in
   * the XML tag <layout .. />.
   *
   *  @ret             The layout associated with the id.
   * @param  layout_id   The id of the layout you wish to retrieve.
   */
  getlayout(layoutId: string): Layout {
    const lower = layoutId.toLowerCase();
    for (const layout of this._layouts) {
      if (layout.getId() === lower) {
        return layout;
      }
    }
    throw new Error(`Could not find a container with the id; "${layoutId}"`);
  }

  addLayout(layout: Layout) {
    layout.setParent(this);
    this._layouts.push(layout);
    this._activeLayout = layout;
  }

  getDebugDom(): HTMLDivElement {
    const div = window.document.createElement("div");
    div.setAttribute("data-xml-id", this.getId());
    div.setAttribute("data-obj-name", "Container");

    if (this._defaultVisible && this._activeLayout) {
      div.appendChild(this._activeLayout.getDebugDom());
    }
    return div;
  }
}
