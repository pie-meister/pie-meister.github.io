// IDE VSCode with comment highlighting for comments (green), todo (orange), warning (red)

// pull on all pull graphs
// document gap
// document size=360 , or set fixed pathLength=100

customElements.define(
  // todo: create/export class so developer can create own "pie-chart"
  "pie-chart",
  class extends HTMLElement {
    connectedCallback() {
      this.svg(
        this.attachShadow({
          // shadowDOM can only be attached once, user will see error in console
          // todo: add constructor()
          mode: "open",
        })
      );
    }
    // declared as method .svg() so user can redraw a chart
    // this Component does not track for changed attributes (yet)
    // Process the user-defined lightDOM, create an SVG element, then replace all <slice> with:
    // <g slice> grouped as one slice
    //    <path>  using stroke-dasharray to draw slices!
    //    <text>  slice label
    // </g>
    svg(
      root,
      // ================================================================================== optional user parameters
      colors = (this.getAttribute("stroke") || "#e24,#2a4,#fe2,#46e,#f62,#4ee")
        .split`,`, //  #f2e  #962
      pull = ~~this.getAttribute("pull"), // how far a slice can be pulled outward
      gap = ~~this.getAttribute("gap"), // gap between slices
      // ================================================================================== configuration
      // Component controlled variables (code golf, saves 4 bytes let statement)
      dashoffset = 0, // clockwise - incremental stroke offset for each slice
      namespace = "http://www.w3.org/2000/svg",
      // ================================================================================== pathlength for all slices
      pathLength = 0 // determined by first slice size, 100 for size=N% notation
    ) {
      // wait till DOM children are parsed
      setTimeout(() => {
        // ================================================================================== create SVG
        // inject SVG in shadowDOM so all SVG is parsed and <slice> can be processed
        // default viewBox = 1000 x 1000 extra padding with pull attribute
        root.innerHTML = `<style>:host{display:inline-block}svg{width:100%}</style><svg id=${
          this.id
        } xmlns=${namespace} viewBox="0,0,${1000 + pull},${1000 + pull}">${
          this.innerHTML
        }</svg>`;
        // ================================================================================== convert <slice>s to paths
        this.slices = [...root.querySelectorAll("slice")].map(
          (sliceDefinition, idx) => {
            let sizeString = sliceDefinition.getAttribute("size");
            let sliceSize = ~~sizeString.replace("%", ""); // remove % to create an Integer value
            // strokeWidth = slice radius size from SVG centerpoint (500,500)
            let strokeWidth =
              ~~sliceDefinition.getAttribute("stroke-width") || // <slice stroke width=X>
              ~~this.getAttribute("stroke-width") || // <pie-chart stroke width=X>
              500 + pull / 2 - pull; // default Center + HALF pull margin - the pulled slice distance
            let slice_dashoffset = dashoffset;
            // ================================================================================== createPath
            let createSlice = (
              // user parameter
              extraRadius, // 0 = slice middle point

              //! required parameters
              __strokeWidth = strokeWidth,
              __sliceSize = sliceSize,
              __stroke = /* get <slice> color */ sliceDefinition.getAttribute(
                "stroke"
              ) /* or a color from the array for first .sliceCreate(0) call */ ||
                (extraRadius == 0 && colors.shift()),

              // calculations, again:preventing the need for 4 Bytes let statement
              R = (500 + pull / 2) / 2 /* center point of SVG */ -
                pull / 2 +
                extraRadius -
                (this.getAttribute("fill") == "stroke-width"
                  ? (500 - pull / 2 - __strokeWidth) / 2
                  : 0),
              //! "fill" on <pie-chart> value is not used for anything

              path = document.createElementNS(namespace, "path")
            ) => (
              path.setAttribute("stroke", __stroke),
              path.setAttribute("stroke-width", __strokeWidth), // radius size
              path.setAttribute("pathLength", pathLength),
              path.setAttribute(
                "stroke-dasharray",
                __sliceSize + " " + (pathLength - __sliceSize)
              ),
              //path.setAttribute("d", `m${500 + pull / 2} ${500 + pull / 2}m0 ${-R}a1 1 0 000 ${R * 2}a1 1 0 000-${R * 2}`),
              path.setAttribute(
                "d",
                //! SVG 1 1 notation are flags, can be any value, 2 2 compresses better
                `m${500 + pull / 2} ${500 + pull / 2}m0 ${-R}a2 2 0 000 ${
                  R * 2
                }a2 2 0 000-${R * 2}`
              ),
              // No fill because the path IS A FULL circle, we only see parts/slices because of the stroke-dasharray!
              path.setAttribute("fill", "none"),
              // stick .point method on path to get a Point position x,y later
              // function returns the middle of the slice arc
              // becuase the method is defined within! each slice scope all variables for that one slice can be used
              // a 'global' method would require everything as function parameters
              // this takes more memory (who cares about memory when the full library is 1K?)
              // is only slower when you do over a million calls (that is 1000 pies with 1000 slices each)
              // only Mr Creosote (see Youtube) can eat that many pies
              (path.point = () =>
                path.getPointAtLength(
                  path.getTotalLength() -
                    (path.getTotalLength() / pathLength) *
                      (slice_dashoffset + __sliceSize / 2)
                )),
              // return path, so it can be added to the slice <g> group
              // again ... avoiding the use for a 'return' statement .. that is 6 Bytes man!
              path
            );
            // ------------------------------------------------------------------ determine pathLength from lightDOM <slice>
            // first slice size="N" sets pathlength for all other slices
            if (sliceSize == sizeString) {
              // NO % on first size="N"
              if (!pathLength) {
                // calculate AND set the pathlength for No Percentage pie
                [...this.querySelectorAll("slice")].map(
                  (slice) => (pathLength += ~~slice.getAttribute("size") + gap)
                );
              }
            } else {
              pathLength = ~~this.getAttribute("size") || 100; // 100% pie
            }
            // size="0" or size= "" calculates % remainder
            if (!sliceSize)
              (sliceSize = pathLength - dashoffset),
                (sizeString = sliceSize + "%");

            // ------------------------------------------------------------------ create SVG slice
            let path = createSlice(0); // path stroke positioning 0 = middle of slice

            // textPoint used for <text> label position calculation, not drawn on SVG
            let textPoint = createSlice(
              ~~this.getAttribute("text") || 60
            ).point();

            // <g> is the slice containing <path> and <text> label
            let group = document.createElementNS(namespace, "g");
            let label = document.createElementNS(namespace, "text");
            // grouppoint is middle of <path> strokeWidth draws the path
            //! Calculate center point once! Later calls would use other parameters
            let grouppoint = path.point(); // sliceSize is a variable in scope

            // TODO: is it worth to have the path METHOD reference available for the outside world?
            group.path = path;
            group.create = createSlice;

            //! 43 Bytes for Events
            group.onmouseout = () => (
              (this.g = group), this.dispatchEvent(new Event("slice"))
            );
            group.onmouseover = () => (
              (this.g = group), this.dispatchEvent(new Event("slice"))
            );

            // set extra properties on slice <g> for easy CSS selecting
            // group.setAttribute("sw", strokeWidth);
            // group.setAttribute("offset", dashoffset);
            group.setAttribute("size", sizeString);
            group.setAttribute("slice", idx + 1);
            group.setAttribute(
              "label",
              (label.innerHTML = this.querySelector("style") // set the svg innerHTML
                ? /* if sliceBase has a label */ (sliceDefinition.innerHTML &&
                    /* then replace % */ sliceDefinition.innerHTML.replace(
                      "size",
                      sizeString
                    )) ||
                  /* else use: */ sizeString
                : "")
            );

            //! calculate dashoffset ONCE for each slice, I tried to parameterize to for the createSlice function
            //! but need way more code. This means 3rd party code needs to substract the size from the offset see example
            path.setAttribute(
              "stroke-dashoffset",
              (dashoffset += sliceSize + gap)
            );
            // ------------------------------------------------------------------ add user <slice> attributes
            [...sliceDefinition.attributes].map((x) =>
              path.setAttribute(x.name, x.value)
            );
            // ------------------------------------------------------------------ set <text x y> position
            label.setAttribute(
              "y",
              textPoint.y + ~~sliceDefinition.getAttribute("y")
            );
            label.setAttribute(
              "x",
              textPoint.x + ~~sliceDefinition.getAttribute("x")
            );
            // ------------------------------------------------------------------ add path and label to <group>
            group.append(path, label);
            // parentNode can be SVG or user element <g>
            sliceDefinition.parentNode.replaceChild(group, sliceDefinition);
            // ------------------------------------------------------------------ create method .pull(T/F)
            group.pull = (
              state,
              distance = Math.abs(
                ~~sliceDefinition.getAttribute("pull") || pull
              ),
              // pullPoint used to calculate pull distance in the correct direction, not drawn on SVG
              pullPoint = createSlice(distance + 1).point()
            ) =>
              group.setAttribute(
                "transform",
                (group.pulled = state)
                  ? `translate(${pullPoint.x - grouppoint.x} ${
                      pullPoint.y - grouppoint.y
                    })`
                  : `` //`translate(0 0)`
              );
            // ------------------------------------------------------------------ pull current slice
            group.pull(sliceDefinition.hasAttribute("pull"));
            return group;
          }
        ); // convert all slices
      });
    } // svg()
  } // class
); // define
