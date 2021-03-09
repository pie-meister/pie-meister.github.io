function stripControlCharacters(s) {
  return s
    .split("")
    .filter((x) => {
      let ascii = x.charCodeAt(0);
      if (ascii != 10) {
        if (ascii < 31 || ascii > 127) {
          ascii = false;
        }
      }
      return ascii;
    })
    .join("");
}
function PrismNormalizeCode(code) {
  Prism.plugins.NormalizeWhitespace.normalize(code, {
    "remove-trailing": true,
    "remove-indent": true,
    "left-trim": true,
    "right-trim": true,
    "remove-initial-line-feed": true,
    /*'break-lines': 80,
      'indent': 2,
      'tabs-to-spaces': 4,*/
    "spaces-to-tabs": 4,
  });
  return Prism.highlight(code, Prism.languages.javascript);
}
function formatHTMLasCode(html) {
  let code = stripControlCharacters(html);
  code = code.replaceAll(" ".repeat(8), ""); // replace 8 spaces
  // code = code.replace(/ /g, "X"); // replace 4 spaces
  return PrismNormalizeCode(code);
}
customElements.define(
  "pie-demo",
  class extends HTMLElement {
    constructor() {
      // if docs say "use super() first" then docs are wrong
      let template = (id = "") => {
        let templ = document.getElementById(this.nodeName + id);
        if (templ) return templ.content.cloneNode(true);
        else return []; // empty content for .append
      };
      super().attachShadow({ mode: "open" }).append(template());
      this.showPrismContent();
    }
    showPrismContent() {
      setTimeout(() => {
        if (!window.Prism) return requestAnimationFrame(() => this.showPrismContent());
        else {
          let pre = document.createElement("pre");
          [...this.attributes].map((attr) => pre.setAttribute(attr.name, attr.value));
          pre.slot = "html";
          pre.innerHTML = `<code class="language-html"></code>`;
          console.log(pre);
          this.prepend(pre);
          let html = this.querySelector("pie-chart").outerHTML;
          this.querySelector("code").innerHTML = formatHTMLasCode(html);
          Prism.highlightAllUnder(this.shadowRoot);
        }
      }, 0);
    }
  }
);
customElements.define(
  "content-length",
  class extends HTMLElement {
    connectedCallback() {
      fetch(this.getAttribute("src")).then((res) => (this.innerHTML = res.headers.get("content-length") + " Bytes"));
    }
  }
);
