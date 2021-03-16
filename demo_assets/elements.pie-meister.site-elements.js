/*
  Under active development

  For questions contact: Danny@Engelman.nl

*/

document.addEventListener("DOMContentLoaded", () => {
  console.log("%c PieMeister ","background:purple;color:yellow");
  setTimeout(() => {
    let pies = document.querySelector("#pies");
    // pies.addEventListener("slice", (evt) => {
    //   let slice = evt.target.slice;
    //   slice.pull(!slice.pulled);
    // });
    let slices = [...pies.shadowRoot.querySelectorAll("g")];
    slices.map((slice, idx) => {
      if (idx == 5) {
        let svg = slice.parentNode;
        let strokeWidth = ~~slice
          .querySelector("path")
          .getAttribute("stroke-width");
        // add a crust
        let p1 = slice.create(strokeWidth / 2, 20, "brown"); //radius,slicesize,stroke-width,color
        p1.setAttribute("opacity", "1");
        slice.append(p1);
      }
    });
  }, 0);
});

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
  "meister-name",
  class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `Pie Meister Web Component v3.14 `;
    }
  }
);
class PieMeister extends HTMLElement {
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
      if (!window.Prism)
        return requestAnimationFrame(() => this.showPrismContent());
      else {
        let pre = document.createElement("pre");
        [...this.attributes].map((attr) =>
          pre.setAttribute(attr.name, attr.value)
        );
        pre.slot = "html";
        pre.innerHTML = `<code class="language-html"></code>`;
        this.prepend(pre);
        let html = this.querySelector("pie-chart").outerHTML;
        html = html.replace(/pull=""/g, "pull");
        html = html.replace(/polar=""/g, "polar");
        html = html.replace(/size=""/g, "size");
        this.querySelector("code").innerHTML = formatHTMLasCode(html);
        Prism.highlightAllUnder(this.shadowRoot);
      }
    }, 0);
  }
}
customElements.define("pie-demo", class extends PieMeister {});
customElements.define("pie-example", class extends PieMeister {});

customElements.define(
  "content-length",
  class extends HTMLElement {
    connectedCallback() {
      let src =
        this.getAttribute("src") ||
        "https://qomponents.github.io/class/PieMeister.min.js";
      fetch(src).then(
        (res) =>
          (this.innerHTML =
            " " + res.headers.get("content-length") + "&nbsp;Bytes")
      );
    }
  }
);
customElements.define(
  "attr-setting",
  class extends HTMLElement {
    connectedCallback() {
      setTimeout(() => {
        //this.attachShadow({mode:"open"}).innerHTML=`<code>${this.innerHTML}</code>`;
        this.innerHTML = `<code>${this.innerHTML}</code>`;
      });
    }
  }
);
customElements.define(
  "pie-description",
  class extends HTMLElement {
    connectedCallback() {
      if (this.hasAttribute("hide")) {
        //this.closest("pie-demo").style.setProperty("--description-fr","0fr")
        //this.closest("pie-demo").style.setProperty("--pie-fr","2fr");
        this.remove();
      }
      this.slot = "description";
    }
  }
);
customElements.define(
  "chart-libraries-table",
  class extends HTMLElement {
    connectedCallback() {
      let html1 = (str, ...v) => {
        if (typeof v == "string") return v;
        try {
          // return new Function("v", "return((" + Object.keys(v).join(",") + ")=>`" + str + "`)(...Object.values(v))")(v);
        } catch (e) {
          console.error("parse", e);
          console.error(new Error().stack);
        }
      };
      function html(strings, ...keys) {
        return function (...values) {
          let dict = values[values.length - 1] || {};
          let result = [strings[0]];
          keys.forEach(function (key, i) {
            let value = Number.isInteger(key) ? values[key] : dict[key];
            result.push(value, strings[i + 1]);
          });
          return result.join("");
        };
      }
      let rows = [
        {
          name: "ZoomCharts",
          uri:
            "https://zoomcharts.com/en/javascript-charts-library/html5-charts/piechart/",
          size: "300 kB",
        },
        {
          name: "AMCharts",
          uri: "https://www.amcharts.com/demos/dragging-pie-slices/",
          size: "272 kB",
        },
        {
          name: "HighCharts",
          uri: "https://www.highcharts.com/demo/pie-basic",
          size: "95 kB",
        },
        {
          name: "GoogleCharts",
          uri:
            "https://developers.google.com/chart/interactive/docs/gallery/piechart",
          size: "66 kB",
        },
        {
          name: "D3.js",
          uri: "http://bl.ocks.org/dbuezas/9306799",
          size: "64 kB",
        },
        {
          name: "ChartJS",
          uri: "https://www.chartjs.org/samples/latest/charts/pie.html",
          size: "51 kB",
        },
        {
          name: "React Minimal Pie",
          uri:
            "https://bundlephobia.com/result?p=react-minimal-pie-chart@8.1.0",
          size: "2.1 kB",
          comment:
            "yeah right... + React 2.8 kB + React-DOM 39.4 kB  = <b>43.3 kB</b> !",
        },
        {
          name: "<meister-name></meister-name>",
          uri: "https://pie-meister.github.io",
          size: "<b><content-length></content-length></b>",
          comment: ``,
        },
      ].map(
        (c) =>
          `<tr><td><a href="${c.uri}">${c.name}</a></td><td align=right>${
            c.size
          }</td><td>${c.comment || ""}</td></tr>`
      ).join``;
      this.innerHTML =
        `<table>
        <thead>
          <tr>
            <th></th>
            <th align=right>
              GZip size
            </th>
          </tr>
        </thead>
        <tbody>` +
        rows +
        `
        </tbody>
      </table>`;
    }
  }
);

function Qomponents_Development_Extension() {
  function attachPullHandlers() {
    // [...document.querySelectorAll("pie-chart[pull]")].map(pieChart=>{
    //   pieChart.addEventListener("slice", (evt) => {
    //     let slice = evt.target.slice;
    //     slice.pull(!slice.pulled);
    //   });
    // })
  }
  attachPullHandlers();

  setTimeout(() => {
    let pies = document.querySelector("#sw");
    pies.slice.map((slice, idx) => {
      let svg = slice.parentNode;
      let path = slice.path;
      let circle = (pt, fill = "black", r = 10) => {
        let c = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        c.setAttribute("cx", pt.x);
        c.setAttribute("cy", pt.y);
        c.setAttribute("r", r);
        c.setAttribute("fill", fill);
        svg.append(c);
      };
      circle(slice.path.point());
      circle(slice.path.point(0, 50), "red");
      if (idx == 0) {
        console.warn("slice group:", slice);
        console.warn("slice size:", slice.getAttribute("size"));
        console.warn("slice path:", path.width);
        console.warn("slice path.size:", typeof path.size);
        let R = 0; // middleradius
        let newpath = slice.create(0);
        //newpath.setAttribute("stroke-width",5);
        //newpath.setAttribute("stroke-dashoffset",38);
        newpath.setAttribute("stroke", "red");
        console.error(newpath);
        //newpath.setAttribute("fill","red");
        svg.append(newpath);
      }
    });
  }, 0);
}
