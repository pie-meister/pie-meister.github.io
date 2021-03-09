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
      setTimeout(() => {
          //this.shadowRoot.querySelector("code").innerText = this.innerHTML.replace(/</g,"&lt;");
          Prism.highlightAllUnder(this.shadowRoot); 
      }, 500);
    }
  }
);
fetch("elements.pie-meister.min.js").then(response => console.log('content-length',response.headers.get("content-length")))