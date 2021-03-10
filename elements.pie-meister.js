customElements.define(
  "pie-chart",
  class extends HTMLElement {
    connectedCallback() {
      this.attachShadow({
        // shadowDOM can only be attached once
        mode: "open",
      });
      setTimeout(() => this.svg()); // wait till DOM children are parsed
    }
    svg(
      // optional used parameters
      colors = (this.getAttribute("colors") || "#e24,#2a4,#fe2,#46e,#f92").split`,`, //, "#4ef", "#f2e", "#962"],
      pull = ~~this.getAttribute("pull"),
      gap = ~~this.getAttribute("gap"),

      // Component controlled variables (code gold, saving 4 bytes let statement)
      dashoffset = 0, // clockwise - incremental stroke offset for each slice
      namespace = "http://www.w3.org/2000/svg",
      // ================================================================================== pathlength for all slices
      pathlength = 0 // determined by first slice size, 100 for size=N% notation
    ) {
      // ================================================================================== create SVG
      // inject SVG in shadowDOM so <slice> can be processed
      this.shadowRoot.innerHTML = `<style>:host{display:inline-block}svg{width:100%}</style><svg id=${
        this.id
      } xmlns=${namespace} viewBox="0 0 ${1000 + pull} ${1000 + pull}">${this.innerHTML}</svg>`;

      // ================================================================================== functions
      function addCircle(point, color = "hotpink", circle = document.createElementNS(namespace, "circle")) {
        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);
        circle.setAttribute("r", 10);
        circle.setAttribute("fill", color);
        circle.setAttribute("stroke-width", 3);
        circle.setAttribute("stroke", "black");
        this.shadowRoot.querySelector("svg").append(circle);
        return circle;
      }
      // ================================================================================== convert <slice>s to paths
      this.slices = [...this.shadowRoot.querySelectorAll("slice")].map((sliceBase, idx) => {
        let sizeString = sliceBase.getAttribute("size");
        let sliceSize = ~~sizeString.replace(/\%/, "");
        let strokeWidth =
          ~~sliceBase.getAttribute("stroke-width") || // <slice stroke-width=X>
            ~~this.getAttribute("stroke-width") || // <pie-chart stroke-width=X>
            500 + pull / 2 - pull; // default Center + HALF pull margin - the pulled slice distance
        // ------------------------------------------------------------------ determine pathLength from lightDOM <slice>
        // first slice size% set pathlength for all other slices
        if (sliceSize == sizeString) {
          if (!pathlength) {
            [...this.querySelectorAll("slice")].map((slice) => (pathlength += ~~slice.getAttribute("size") + gap));
          }
        } else {
          pathlength = ~~this.getAttribute("scale") || 100; // 100% pie
        }
        // ================================================================================== createPath
        this.slice = (
          // user parameters
          extraRadius, // 0 = slice middle point
          // determine color, 0/false value prevents shifting auto-color
          stroke = sliceBase.getAttribute("stroke") || colors.shift(),

          width = strokeWidth,

          // calculations:
          R = (500 + pull / 2) / 2 - pull / 2 + extraRadius,
          path = document.createElementNS(namespace, "path")
        ) => (
          path.setAttribute("d", `m${500 + pull / 2} ${500 + pull / 2}m0 ${-R}a1 1 0 000 ${R * 2}a1 1 0 000-${R * 2}`),
          path.setAttribute("pathLength", pathlength),
          path.setAttribute("fill", "none"),
          path.setAttribute("stroke-width", width),
          path.setAttribute("stroke", stroke),
          path.setAttribute("stroke-dasharray", sliceSize + " " + (pathlength - sliceSize)),
          // stick .M method on path to get a Point position x,y later
          (path.M = () =>
            path.getPointAtLength(
              path.getTotalLength() - (path.getTotalLength() / pathlength) * (dashoffset + sliceSize / 2)
            )),
          // return path
          path
        );
        // ------------------------------------------------------------------ create SVG slice
        let path = this.slice(0);
        let centerPoint = path.M(); // sliceSize is a variable in scope
        let borderline = this.slice(
          strokeWidth / 2,
          sliceBase.getAttribute("border") || this.getAttribute("border"),
          10
        );
        let pullPoint = this.slice(Math.abs(~~sliceBase.getAttribute("pull")||pull), 0).M();
        let textPoint = this.slice(~~this.getAttribute("text") || 60, 0).M();
        let group = document.createElementNS(namespace, "g");
        let label = document.createElementNS(namespace, "text");
        let pullSlice = sliceBase.hasAttribute("pull");
        path.onmouseover = () => path.dispatchEvent(new Event(this.id, { bubbles: 1, composed: 1 }));

        dashoffset += sliceSize + gap;
        path.setAttribute("stroke-dashoffset", dashoffset);
        borderline.setAttribute("stroke-dashoffset", dashoffset);
        [...sliceBase.attributes].map((x) => path.setAttribute(x.name, x.value)); // add user defined attributes

        // ------------------------------------------------------------------ create slice(idx) content
        label.setAttribute("x", textPoint.x + ~~sliceBase.getAttribute("x"));
        label.setAttribute("y", textPoint.y + ~~sliceBase.getAttribute("y"));
        label.innerHTML = sliceBase.innerHTML || sizeString;
        //addCircle(point.M(0), "green");
        //addCircle(text_point, "grey");
        // addCircle(pull_point, "red");

        group.append(path, label, borderline);
        group.id = "slice" + (idx + 1);
        // --- add path and label to SVG, at <slice> position
        // parentNode can be SVG or user element <g>
        sliceBase.parentNode.replaceChild(group, sliceBase);

        // abuse no longer required sliceBase
        path.slice = {
          p: path,
          c: centerPoint,
          l: label,
          pull: (state) =>
            group.setAttribute(
              "transform",
              state ? `translate(${pullPoint.x - centerPoint.x} ${pullPoint.y - centerPoint.y})` : `translate(0 0)`
            ),
        };
        path.slice.pull(pullSlice);

        return path.slice;
      }); // convert all slices
    } // render
  } // class
); // define
