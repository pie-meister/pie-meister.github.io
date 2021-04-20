try {
  /*
  Under active development

  For questions contact: Danny@Engelman.nl

*/

  // ===========================================================================
  function circle(svg, pt, fill = "black", r = 10) {
    let c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", pt.x);
    c.setAttribute("cy", pt.y);
    c.setAttribute("r", r);
    c.setAttribute("fill", fill);
    return svg.appendChild(c);
  }
  function sliceCircle(slice) {
    circle(slice, slice.$(0));
  }
  // ===========================================================================
  function makeSliceInteractive(pieChart, slice) {
    sliceCircle(slice);
    console.warn("slice", pieChart);
    let pull = ~~pieChart.getAttribute("pull");
    slice.pull = (state = slice.hasAttribute`pull`, pt = slice.$(0, Math.abs(~~slice.getAttribute`pull` || pull))) =>
      slice.setAttribute(
        `transform`,
        (slice.pulled = state) // SET pulled property
          ? `translate(${pt.x - slice.$().x} ${pt.y - slice.$().y})`
          : `` //`translate(0 0)`
      );
    //slice.pull();

    slice.onmouseout = (_) => (
      (pieChart.slice = slice), pieChart.dispatchEvent(new Event(`slice`), slice.pull(slice.toggleAttribute(`pull`)))
    );
    slice.onmouseover = (_) => (
      (pieChart.slice = slice), pieChart.dispatchEvent(new Event(`slice`), slice.pull(slice.toggleAttribute(`pull`)))
    );
  }
  // ===========================================================================
  function makeAllChartsPullable() {
    [...document.querySelectorAll("pie-chart[pull]")].map((pieChart) => {
      pieChart.addEventListener("slice", (evt) => {
        let slice = evt.target.slice;
        slice.pull(!slice.pulled);
      });
      let slices = [...pieChart.shadowRoot.querySelectorAll("g")];
      slices.map((slice) => makeSliceInteractive(pieChart, slice));
    });
  }

  function markSlicePoints(slice) {
    let svg = slice.closest("svg");
    let slice_path = slice.querySelector("path");
    console.log(slice);
    let circle = (pt, label) => {
      let e = (e) => document.createElementNS("http://www.w3.org/2000/svg", e);
      let t = e("text");
      t.setAttribute("x", pt.x - 10);
      t.setAttribute("y", pt.y + 10);
      t.setAttribute("font-size", "30px");
      t.setAttribute("fill", "black");
      t.innerHTML = label;
      let c = e("circle");
      c.setAttribute("cx", pt.x);
      c.setAttribute("cy", pt.y);
      c.setAttribute("r", 20);
      c.setAttribute("stroke", "black");
      c.setAttribute("fill", slice_path.getAttribute("stroke"));

      svg.append(c, t);
      return pt;
    };
    //createSlicePoints(slice);
    slice.$$.map((pt, idx) => circle(pt, idx));
  }
  // ===========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    top.onclick = (evt) => {
      //document.body.scrollIntoView();
      if (evt.target.id == "top")
        document.body.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    };

    console.log("%c Meister Site Elements ", "background:purple;color:yellow");
    // ------------------------------------------------------------------ attach pull handlers
    setTimeout(() => {
      //    makeAllChartsPullable();
    }, 10);
    // ------------------------------------------------------------------ dev code
    setTimeout(() => {
      let pies = document.querySelector("#pc");
      // pies.addEventListener("slice", (evt) => {
      //   let slice = evt.target.slice;
      //   slice.pull(!slice.pulled);
      // });
      if (!pies?.shadowRoot) return;
      let slices = [...pies.shadowRoot.querySelectorAll("g")];
      slices.map((slice, idx) => {
        if (idx < 1) {
          let svg = slice.closest("svg");
          markSlicePoints(slice);
          let slice_path = slice.querySelector("path");
          // slice_path.setAttribute("opacity", "0");
          let percentage = ~~slice.getAttribute("size").replace("%", "");
          //percentage = 50;
          let pathLength = 100;
          //if (idx == 0) {
          let slice_strokeWidth = ~~slice.querySelector("path").getAttribute("stroke-width");
          // add a crust
          let strokeWidth = slice_strokeWidth / slices.length;
          let radius = slice_strokeWidth / 2 - idx * strokeWidth;
          let color = slice_path.getAttribute("stroke");
          console.error("p1:");
          let p1 = slice.$(radius, strokeWidth, color, percentage, -25); //radius,slicesize,stroke-width,color
          p1.setAttribute("opacity", "1");
          p1.setAttribute("stroke-linecap", "round");
          // p1.setAttribute(
          //   "stroke-dasharray",
          //   percentage + " " + (pathLength - percentage)
          // );
          //svg.append(p1);
        }
      });
    }, 0);
  });
  // ===========================================================================
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
  // ===========================================================================
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
  // ===========================================================================
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
  // ===========================================================================
  function formatHTMLasCode(html) {
    let code = stripControlCharacters(html);
    code = code.replaceAll(" ".repeat(8), ""); // replace 8 spaces
    // code = code.replace(/ /g, "X"); // replace 4 spaces
    return PrismNormalizeCode(code);
  }
  // ===========================================================================
  customElements.define(
    "meister-name",
    class extends HTMLElement {
      connectedCallback() {
        this.innerHTML = `&lt;pie-chart> Web Component v3.14 `;
      }
    }
  );
  // ===========================================================================
  class MeisterDemo extends HTMLElement {
    constructor() {
      // if docs say "use super() first" then docs are wrong
      let template = (id = this.getAttribute("template") || "") => {
        let templ = document.getElementById(this.nodeName + id);
        if (templ) return templ.content.cloneNode(true);
        else return []; // empty content for .append
      };
      let defaultTemplate = "-21"; // ""
      super().attachShadow({ mode: "open" }).append(template(defaultTemplate));

      //if there is no description column only show code and result
      if (this.hasAttribute("columns")) {
        let columns = this.getAttribute("columns") || "1fr 1fr 1fr";
        this.style.setProperty("--columns", columns);
      }
      this.showPrismContent();
      this.showExample();
    }
    // ------------------------------------------------------------------
    showPrismContent() {
      setTimeout(() => {
        if (!window.Prism) return requestAnimationFrame(() => this.showPrismContent());
        else {
          try {
            let pre = document.createElement("pre");
            [...this.attributes].map((attr) => pre.setAttribute(attr.name, attr.value));
            pre.innerHTML = `<code class="language-html"></code>`;
            if (this.hasAttribute("challenge")) {
              let details = document.createElement("details");
              let summary = document.createElement("summary");
              summary.onmouseover = () => {
                console.log(summary, details.hasAttribute("open"));
                details.hasAttribute("open") || details.setAttribute("open", "open");
              };
              summary.style = "color:black;cursor:pointer";
              summary.innerHTML = `<b>Show me the code!</b>`;
              details.append(summary, pre);
              this.prepend(details);
              pre = details;
            }
            pre.slot = "html";
            this.prepend(pre);
            let html =
              this.querySelector("[code]")?.innerHTML ||
              this.querySelector("pie-chart")?.outerHTML ||
              this.querySelector("progress-circle")?.outerHTML ||
              "";
            html = html.replace(/pull=""/g, "pull");
            html = html.replace(/color1=""/g, "color1");
            html = html.replace(/color2=""/g, "color2");
            html = html.replace(/color3=""/g, "color3");
            html = html.replace(/color4=""/g, "color4");
            html = html.replace(/size=""/g, "size");
            this.querySelector("code").innerHTML = formatHTMLasCode(html);
            Prism.highlightAllUnder(this.shadowRoot);
          } catch (e) {
            console.error("Prism", e);
          }
        }
      }, 0);
    }
    showExample() {
      try {
        if (this.hasAttribute("example")) {
          let pie = this.querySelector("pie-chart") || this.querySelector("progress-circle");
          if (pie) {
            console.warn("Show example", pie);
            let div = document.createElement("div");
            div.append(pie.cloneNode(true));
            div.onclick = (evt) => pie.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            Examples.append(div);
          } else {
            console.warn("No code in example");
          }
        } else {
          console.warn("no example",this);
        }
      } catch (e) {
        console.error("pie-chart example", e);
      }
    }
  }
  // ===========================================================================
  customElements.define("meister-demo", class extends MeisterDemo {});
  // ===========================================================================
  customElements.define("meister-example", class extends MeisterDemo {});
  // ===========================================================================
  customElements.define(
    "content-length",
    class extends HTMLElement {
      // ------------------------------------------------------------------
      connectedCallback() {
        let src = this.getAttribute("src") || "https://pie-meister.github.io/PieMeister.min.js";
        fetch(src, { mode: "cors" }).then(
          (res) => (this.innerHTML = " " + res.headers.get("content-length") + "&nbsp;Bytes")
        );
      }
    }
  );
  // ===========================================================================
  customElements.define(
    "attr-setting",
    class extends HTMLElement {
      // ------------------------------------------------------------------
      connectedCallback() {
        setTimeout(() => {
          //this.attachShadow({mode:"open"}).innerHTML=`<code>${this.innerHTML}</code>`;
          this.innerHTML = `<code>${this.innerHTML}</code>`;
        });
      }
    }
  );
  // ===========================================================================
  customElements.define(
    "meister-description",
    class extends HTMLElement {
      // ------------------------------------------------------------------
      connectedCallback() {
        if (this.hasAttribute("hide")) {
          //this.closest("meister-demo").style.setProperty("--description-fr","0fr")
          //this.closest("meister-demo").style.setProperty("--pie-fr","2fr");
          this.remove();
        }
        this.slot = "description";
      }
    }
  );
  // ===========================================================================
  customElements.define(
    "chart-libraries-table",
    class extends HTMLElement {
      // ------------------------------------------------------------------
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
        let rows = [
          {
            name: "ZoomCharts",
            uri: "https://zoomcharts.com/en/javascript-charts-library/html5-charts/piechart/",
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
            uri: "https://developers.google.com/chart/interactive/docs/gallery/piechart",
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
            uri: "https://bundlephobia.com/result?p=react-minimal-pie-chart@8.1.0",
            size: "2.1 kB",
            comment: " + React = <b>43.3 kB</b>!",
          },
          {
            name: "<b><meister-name></meister-name></b>",
            uri: "https://pie-meister.github.io",
            size: "<b><content-length></content-length></b>",
            comment: ``,
          },
          {
            name: "<b>&lt;progress-circle></b>",
            uri: "https://pie-meister.github.io",
            size: "<b><content-length src='./PieMeister-with-Progress.min.js'></content-length></b>",
            comment: `includes &lt;pie-chart>`,
          },
        ].map(
          (c) =>
            `<tr><td><a href="${c.uri}">${c.name}</a></td><td align=right>${c.size}</td><td>${
              c.comment || ""
            }</td></tr>`
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
  // ===========================================================================
  function Qomponents_Development_Extension() {
    setTimeout(() => {
      let pies = document.querySelector("#sw");
      pies.slice.map((slice, idx) => {
        let svg = slice.parentNode;
        let path = slice.path;
        circle(slice.path.$());
        circle(slice.path.$(0, 50), "red");
        if (idx == 0) {
          console.warn("slice group:", slice);
          console.warn("slice size:", slice.getAttribute("size"));
          console.warn("slice path:", path.width);
          console.warn("slice path.size:", typeof path.size);
          let R = 0; // middleradius
          let newpath = slice.$(0);
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
} catch (e) {
  console.error("Meister Elements error:", e);
}
