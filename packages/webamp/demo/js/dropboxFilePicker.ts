import { FilePicker } from "./Webamp";

interface DropboxFile {
  link: string;
  name: string;
}

// Requires Dropbox's Chooser to be loaded on the page
function genAudioFileUrlsFromDropbox(): Promise<DropboxFile[]> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    if (window.Dropbox == null) {
      reject();
    }
    // @ts-ignore
    window.Dropbox.choose({
      success: resolve,
      error: reject,
      linkType: "direct",
      folderselect: false,
      multiselect: true,
      extensions: ["video", "audio"],
    });
  });
}
const dropboxFilePicker: FilePicker = {
  contextMenuName: "Dropbox...",
  filePicker: async () => {
    const files = await genAudioFileUrlsFromDropbox();
    return files.map((file) => ({
      url: file.link,
      defaultName: file.name,
    }));
  },
  requiresNetwork: true,
};

export default dropboxFilePicker;
