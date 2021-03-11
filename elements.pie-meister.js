// fix 0% count
// document label %
// document gap

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
    // declared as method .svg() so user can redraw a chart 
    // this Component does not track for changed attributes (yet)
    // Process the user-defined lightDOM, create an SVG element, then replace all <slice> with:
    // <g slice> grouped as one slice
    //    <path>  using stroke-dasharray to draw slices!
    //    <text>  slice label
    // </g>
    svg(
      // optional user parameters
      colors = (this.getAttribute("stroke") || "#e24,#2a4,#fe2,#46e,#f92").split`,`, //, "#4ef", "#f2e", "#962"],
      pull = ~~this.getAttribute("pull"), // how far a slice can be pulled outward
      gap = ~~this.getAttribute("gap"), // gap between slices

      // ================================================================================== configuration
      // Component controlled variables (code golf, saves 4 bytes let statement)
      dashoffset = 0, // clockwise - incremental stroke offset for each slice
      namespace = "http://www.w3.org/2000/svg",
      // ================================================================================== pathlength for all slices
      pathlength = 0 // determined by first slice size, 100 for size=N% notation
    ) {
      // ================================================================================== create SVG
      // inject SVG in shadowDOM so all SVG is parsed and <slice> can be processed
      // default viewBox = 1000 x 1000 extra padding with pull attribute
      this.shadowRoot.innerHTML = `<style>:host{display:inline-block}svg{width:100%}</style><svg id=${
        this.id
      } xmlns=${namespace} viewBox="0 0 ${1000 + pull} ${1000 + pull}">${this.innerHTML}</svg>`;
      // ================================================================================== convert <slice>s to paths
      //this.slices =
      [...this.shadowRoot.querySelectorAll("slice")].map((sliceDefinition, idx) => {
        let sizeString = sliceDefinition.getAttribute("size");
        let sliceSize = ~~sizeString.replace("%", ""); // remove % to create an Integer value
        // strokeWidth = slice radius size from SVG centerpoint (500,500)
        let strokeWidth =
          ~~sliceDefinition.getAttribute("stroke-width") || // <slice stroke-width=X>
          ~~this.getAttribute("stroke-width") || // <pie-chart stroke-width=X>
          500 + pull / 2 - pull; // default Center + HALF pull margin - the pulled slice distance
        // ------------------------------------------------------------------ determine pathLength from lightDOM <slice>
        // first slice size="N" sets pathlength for all other slices
        if (sliceSize == sizeString) {
          // NO % on first size="N"
          if (!pathlength) {
            // calculate AND set the pathlength for No Percentage pie
            [...this.querySelectorAll("slice")].map((slice) => (pathlength += ~~slice.getAttribute("size") + gap));
          }
        } else {
          pathlength = 100; // 100% pie
        }
        // size="0" or size= "" calculates % remainder
        if (!sliceSize) sliceSize = 100 - dashoffset;

        // ================================================================================== createPath
        this.slice = (
          // user parameter
          extraRadius, // 0 = slice middle point

          // calculations, again:preventing the need for 4 Bytes let statement
          R = (500 + pull / 2) / 2 -
            pull / 2 +
            extraRadius -
            (this.hasAttribute("polar") ? (500 - strokeWidth) / 2 : 0),
          path = document.createElementNS(namespace, "path")
        ) => (
          path.setAttribute("d", `m${500 + pull / 2} ${500 + pull / 2}m0 ${-R}a1 1 0 000 ${R * 2}a1 1 0 000-${R * 2}`),
          path.setAttribute("pathLength", pathlength),
          // No fill because the path IS A FULL circle, we only see parts/slices because of the stroke-dasharray!
          path.setAttribute("fill", "none"), 
          path.setAttribute("stroke-width", strokeWidth), // radius size
          path.setAttribute("stroke-dasharray", sliceSize + " " + (pathlength - sliceSize)),
          
          
          // stick .M method on path to get a Point position x,y later
          // function returns the middle of the slice arc
          // becuase the method is defined within! each slice scope all variables for that one slice can be used
          // a 'global' method would require everything as function parameters
          // this takes more memory (who cares about memory when the full library is 1K?)
          // is only slower when you do over a million calls (that is 1000 pies with 1000 slices each)
          // only Mr Creosote (see Youtube) can eat that many pies
          (path.M = () =>
            path.getPointAtLength(
              path.getTotalLength() - (path.getTotalLength() / pathlength) * (dashoffset + sliceSize / 2)
            )),
          // return path, so it can be added to the slice <g> group
          // again ... avoiding the use for a 'return' statement .. that is 6 Bytes man!
          path
        );
        // ------------------------------------------------------------------ create SVG slice
        let path = this.slice(0); // path stroke positioning 0 = middle of slice
        
        // pullPoint used to calculate pull distance in the correct direction, not drawn on SVG
        let pullPoint = this.slice(Math.abs(~~sliceDefinition.getAttribute("pull") || pull)).M();
        // textPoint used for <text> label position calculation, not drawn on SVG
        let textPoint = this.slice(~~this.getAttribute("text") || 60).M();
        
        // <g> is the slice containing <path> and <text> label
        let group = document.createElementNS(namespace, "g");
        let label = document.createElementNS(namespace, "text");
        
        // TODO: is it worth to have the path METHOD reference available for the outside world?
        //group.path = path;
        // group.p is middle of <path> strokeWidth draws the path
        //! Calculate center point once! Later calls would use other parameters
        group.p = path.M(); // sliceSize is a variable in scope

        // determine color
        path.setAttribute("stroke", sliceDefinition.getAttribute("stroke") || colors.shift());
        //! 43 Bytes for Events
        group.onmouseover = () => ((this.g = group), this.dispatchEvent(new Event("slice")));
        group.onmouseout = () => ((this.g = group), this.dispatchEvent(new Event("slice")));

        // set extra properties on slice <g> for easy CSS selecting
        // group.setAttribute("sw", strokeWidth);
        // group.setAttribute("offset", dashoffset);
        group.setAttribute("slice", idx + 1);
        group.setAttribute("size", sizeString);
        group.setAttribute(
          "label",
          (label.innerHTML = // set the svg innerHTML
            // if sliceBase has a label, then replace %
            (sliceDefinition.innerHTML && sliceDefinition.innerHTML.replace("size", sizeString)) || /* else use: */ sizeString)
        );
        // create method .pull(T/F)
        group.pull = (state) =>
          group.setAttribute(
            "transform",
            (group.pulled = state)
              ? `translate(${pullPoint.x - group.p.x} ${pullPoint.y - group.p.y})`
              : ``//`translate(0 0)`
          );
        // calculate dashoffset ONCE for each slice
        path.setAttribute("stroke-dashoffset", (dashoffset += sliceSize + gap));
        // add user defined <slice> attributes to path
        [...sliceDefinition.attributes].map((x) => path.setAttribute(x.name, x.value));
        // ------------------------------------------------------------------ create slice(idx) content
        label.setAttribute("x", textPoint.x + ~~sliceDefinition.getAttribute("x"));
        label.setAttribute("y", textPoint.y + ~~sliceDefinition.getAttribute("y"));

        // let circle = document.createElementNS(namespace, "g");
        // circle.innerHTML = `<circle cx="${group.p.x}" cy="${group.p.y}" r="20" fill="red"/>`;

        group.append(
          path,
          this.querySelector("style") && label // if lightDOM has a style element, append <text>
        );

        // --- add path and label to SVG, at <slice> position
        // parentNode can be SVG or user element <g>
        sliceDefinition.parentNode.replaceChild(group, sliceDefinition);

        group.pull(sliceDefinition.hasAttribute("pull"));
        // return group;
      }); // convert all slices
    } // render
  } // class
); // define
