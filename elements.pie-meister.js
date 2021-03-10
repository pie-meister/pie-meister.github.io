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
          pathlength = 100; // 100% pie
        }
        // ================================================================================== createPath
        this.sliced = (
          // user parameters
          extraRadius, // 0 = slice middle point

          width = strokeWidth,

          // calculations:
          R = (500 + pull / 2) / 2 -
            pull / 2 +
            extraRadius -
            (this.hasAttribute("polar") ? (500 - strokeWidth) / 2 : 0),
          path = document.createElementNS(namespace, "path")
        ) => (
          path.setAttribute("d", `m${500 + pull / 2} ${500 + pull / 2}m0 ${-R}a1 1 0 000 ${R * 2}a1 1 0 000-${R * 2}`),
          path.setAttribute("pathLength", pathlength),
          path.setAttribute("fill", "none"),
          path.setAttribute("stroke-width", width),
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
        let path = this.sliced(0); // path stroke positioning 0 = middle of slice
        let centerPoint = path.M(); // sliceSize is a variable in scope
        // pullPoint is used for calculations, not drawn on SVG
        let pullPoint = this.sliced(Math.abs(~~sliceBase.getAttribute("pull") || pull)).M();
        // textPoint is used for calculations, not drawn on SVG
        let textPoint = this.sliced(~~this.getAttribute("text") || 60).M();
        let label = document.createElementNS(namespace, "text");
        let group = document.createElementNS(namespace, "g");

        // determine color
        path.setAttribute("stroke", sliceBase.getAttribute("stroke") || colors.shift());
        //! 43 Bytes for Events
        path.onmouseenter = () => ((this.slice = group), this.dispatchEvent(new Event(this.id)));
        path.onmouseout = () => ((this.slice = group), this.dispatchEvent(new Event(this.id)));

        group.pull = (state) => {
          //(group.setAttribute("x", pullPoint.x+pull), group.setAttribute("y", pullPoint.y)),
          group.pulled = state;
          group.setAttribute(
            "transform",
            state ? `translate(${pullPoint.x - centerPoint.x} ${pullPoint.y - centerPoint.y})` : `translate(0 0)`
          );
        };

        dashoffset += sliceSize + gap;
        path.setAttribute("stroke-dashoffset", dashoffset);

        // add user defined <slice> attributes to path
        [...sliceBase.attributes].map((x) => path.setAttribute(x.name, x.value));

        // ------------------------------------------------------------------ create slice(idx) content
        label.setAttribute("x", textPoint.x + ~~sliceBase.getAttribute("x"));
        label.setAttribute("y", textPoint.y + ~~sliceBase.getAttribute("y"));
        label.innerHTML = sliceBase.innerHTML || sizeString;
        //addCircle(point.M(0), "green");
        //addCircle(text_point, "grey");
        // addCircle(pull_point, "red");

        group.append(path, 
          this.querySelector("style") && label // if lightDOM has a style element, append <text>
          );
        group.id = "slice" + (idx + 1);
        // --- add path and label to SVG, at <slice> position
        // parentNode can be SVG or user element <g>
        sliceBase.parentNode.replaceChild(group, sliceBase);

        group.pull(sliceBase.hasAttribute("pull"));
        return group;
      }); // convert all slices
    } // render
  } // class
); // define
