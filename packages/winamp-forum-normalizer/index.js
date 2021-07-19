import fs from "fs";
import Hat from "html-ast-transform";

const { transform, h, getAttr, hasClass } = Hat;

const replaceTags = {
  code: (node) => {
    return h("h1", [], [h("#text", "Hello")]);
  },
};

function clean(html) {
  return transform(html, { replaceTags });
}

function main(fileName, output) {
  const html = fs.readFileSync(fileName, { encoding: "utf8" });
  fs.writeFileSync(output, clean(html));
}

main("./example.html", "out.html");
