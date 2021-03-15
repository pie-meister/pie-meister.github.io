// IDE VSCode with comment highlighting for comments (green), todo (orange), warning (red)
// PieMeister
// #METHODS:
// - svg(root) redraws the whole pie-chart from <slice> in lightDOM in specified root
// - $ - array of all drawn <g> slices
// each slice: <g>
//            #ATTRIBUTES
//            - size
//            - label
//            #PROPERTIES
//            pulled = state
//            #METHODS
//            - path.point
//            - create ( extraRadius , )  creates new slice <path> Element (doesn't overwrite the current slice)
//            - pull
console.log("PieMeister 3.14");
export default class PieMeister extends HTMLElement {
  connectedCallback() {
    this.svg();
  }
  // declared as method .svg so user can redraw a chart
  // this Component does not track for changed attributes (yet)
  // Process the user-defined lightDOM, create an SVG element, then replace all <slice> with:
  // <g slice> grouped as one slice
  //    <path>  using stroke-dasharray to draw slices!
  //    <text>  slice label
  // </g>
  svg(
    root = this.attachShadow({
      // shadowDOM can only be attached once, user will see error in console
      // todo: add constructor
      mode: `open`,
    }),
    // =========================================================================== optional user parameters
    colors = (this.getAttribute`stroke` || `#e33,#3e3,#35e,#ee3,#e5e,#3ee`)
      .split`,`, //  #f2e  #962
    pull = ~~this.getAttribute`pull`, // how far a slice can be pulled outward
    //gap = Number(this.getAttribute`gap`), //! between slices, messes up % calcs
    // =========================================================================== configuration
    // Component controlled variables (code golf, saves 4 bytes let statement)
    dashoffset = 0, // clockwise - incremental stroke offset for each slice
    //namespace = `http://www.w3.org/2000/svg`,
    // =========================================================================== pathlength for all slices
    // todo add default offset path length
    pathLength = 0 // determined by first slice size, 100 for size=N% notation
  ) {
    // wait till DOM children are parsed
    setTimeout((_) => {
      // =========================================================================== create SVG
      // inject SVG in shadowDOM so all SVG is parsed and <slice> can be processed
      // default viewBox = 1000 x 1000 extra padding with pull attribute
      root.innerHTML = `<style>:host{display:inline-block}svg{width:100%}</style><svg xmlns=http://www.w3.org/2000/svg viewBox=0,0,${
        1000 + pull
      },${1000 + pull}>${this.innerHTML}</svg>`;
      // append user <slice> as HTML so we keep all <slice>
      // =========================================================================== convert <slice>s to paths
      //this.$ = [...root.querySelectorAll`slice`].map((sliceDefinition, idx) => {
      [...root.querySelectorAll`slice`].map((sliceDefinition, idx) => {
        // <g> is the slice containing <path> and <text> label
        let group = document.createElementNS(`http://www.w3.org/2000/svg`, `g`);
        let label = document.createElementNS(
          `http://www.w3.org/2000/svg`,
          `text`
        );
        let sizeString = sliceDefinition.getAttribute`size`;
        let sliceSize = ~~sizeString.replace(`%`, ``); // remove % to create an Integer value
        // strokeWidth = slice radius size from SVG centerpoint (500,500)
        let strokeWidth =
          ~~sliceDefinition.getAttribute`stroke-width` || // <slice stroke width=X>
          ~~this.getAttribute`stroke-width` || // <pie-chart stroke width=X>
          500 + pull / 2 - pull; // default Center + HALF pull margin - the pulled slice distance
        //! slice START dashoffset
        let slice_dashoffset = dashoffset;
        let path; // declare use later;
        // =========================================================================== createPath
        group.create = (
          // user parameter
          extraRadius = 0, // 0 = slice middle point

          //! optional user parameters
          __strokeWidth = strokeWidth,
          __strokeColor = sliceDefinition.getAttribute(`stroke`) ||
            (extraRadius == 0 && colors.shift()),
          //! slice parameters
          __sliceSize = sliceSize,
          __stroke_dashoffset = slice_dashoffset, // todo parameteriz to earlier

          //! calculations, again:preventing the need for 4 Bytes let statement
          R = (500 + pull / 2) / 2 /* center point of SVG */ -
            pull / 2 +
            extraRadius -
            (this.getAttribute`fill` == `stroke-width`
              ? (500 - pull / 2 - __strokeWidth) / 2
              : 0),
          //! `fill` on <pie-chart> value is not used for anything

          path = document.createElementNS(`http://www.w3.org/2000/svg`, `path`)
        ) => (
          path.setAttribute(`stroke`, __strokeColor),
          path.setAttribute(`stroke-width`, __strokeWidth), // radius size
          path.setAttribute(`pathLength`, pathLength),
          path.setAttribute(
            `stroke-dasharray`,
            __sliceSize + ` ` + (pathLength - __sliceSize)
          ),
          //! required to draw over pie when user calls slice function:
          path.setAttribute(
            `stroke-dashoffset`,
            __stroke_dashoffset + __sliceSize
          ),
          //path.setAttribute(`d`, `m${500 + pull / 2} ${500 + pull / 2}m0 ${-R}a1 1 0 000 ${R * 2}a1 1 0 000-${R * 2}`),
          path.setAttribute(
            `d`,
            //! SVG 1 1 notation are flags, can be any value, 2 2 compresses better
            `m${500 + pull / 2} ${500 + pull / 2}m0 ${-R}a2 2 0 000 ${
              R * 2
            }a2 2 0 000-${R * 2}`
          ),
          // No fill because the path IS A FULL circle, we only see parts/slices because of the stroke-dasharray!
          path.setAttribute(`fill`, `none`),
          (path.width = __strokeWidth),
          // stick .point method on path to get a Point position x,y later
          // function returns the middle of the slice arc
          // becuase the method is defined within! each slice scope all variables for that one slice can be used
          // a class method would require everything as function parameters
          // this takes more memory (who cares about memory when the full library is 1K?)
          // is only slower when you do over a million calls (that is 1000 pies with 1000 slices each)
          // only Mr Creosote (see Youtube) can eat that many pies
          (path.point = (offset = 0, radius) =>
            radius
              ? group.create(radius).point(offset)
              : path.getPointAtLength(
                  path.getTotalLength() -
                    (path.getTotalLength() / pathLength) *
                      (offset + (__stroke_dashoffset + __sliceSize / 2))
                )),
          // return path, so it can be added to the slice <g> group
          // again ... avoiding the use for a return statement .. that is 6 Bytes man!
          path
        );
        // =========================================================== determine pathLength from lightDOM <slice>
        // first slice size=`N` sets pathlength for all other slices
        if (sliceSize == sizeString) {
          // NO % on first size=`N`
          if (!pathLength) {
            // calculate AND set the pathlength for No Percentage pie
            [...this.querySelectorAll`slice`].map(
              //(slice) => (pathLength += ~~slice.getAttribute`size` + gap)
              (slice) => (pathLength += ~~slice.getAttribute`size`)
            );
          }
        } else {
          pathLength = ~~this.getAttribute`size` || 100; // default 100% pie // todo move to parameter
        }
        // ----------------------------------------------------------- calc remainder slice
        // size=`0` or size= `` calculates % remainder
        if (!sliceSize)
          //(sliceSize = pathLength - dashoffset-gap), (sizeString = sliceSize + `%`);
          (sliceSize = pathLength - dashoffset), (sizeString = sliceSize + `%`);

        // ----------------------------------------------------------- create SVG slice
        path = group.create(0); // path stroke positioning 0 = middle of slice
        group.point = path.point;

        // ------------------------------------------------------------------extra <g> attributes
        group.setAttribute(`slice`, idx);
        group.setAttribute(`size`, sizeString);
        group.setAttribute(
          `label`,
          //! if a <style> is defined show a Label
          (label.innerHTML = this.querySelector`style` // set the svg innerHTML
            ? /* if sliceBase has a label */ (sliceDefinition.innerHTML &&
                /* then replace % */ sliceDefinition.innerHTML.replace(
                  `size`,
                  sizeString
                )) ||
              /* else use: */ sizeString
            : /* empty innerHTML string */ ``)
        );
        // ----------------------------------------------------------- calc NEXT slice dashoffset ONCE
        path.setAttribute(
          `stroke-dashoffset`,
          // (dashoffset += sliceSize + gap)
          (dashoffset += sliceSize)
        );
        // ----------------------------------------------------------- add user <slice> attributes
        [...sliceDefinition.attributes].map((x) =>
          path.setAttribute(x.name, x.value)
        );
        // ----------------------------------------------------------- set <text x y> position
        // textPoint used for <text> label position calculation, not drawn on SVG
        label.setAttribute(
          `y`,
          group.point(
            0,
            ~~sliceDefinition.getAttribute`pulltext` ||
              ~~this.getAttribute`pulltext` ||
              0
          ).y
        );
        label.setAttribute(
          `x`,
          group.point(
            0,
            ~~sliceDefinition.getAttribute`pulltext` ||
              ~~this.getAttribute`pulltext` ||
              0
          ).x
        );
        // ----------------------------------------------------------- add path and label to <group>
        group.append(path, label);
        // parentNode can be SVG or user element <g>
        sliceDefinition.parentNode.replaceChild(group, sliceDefinition);
        let pt = group.point(
          0,
          Math.abs(~~sliceDefinition.getAttribute`pull` || pull)
        );
        if (sliceDefinition.hasAttribute`pull`) {
          group.setAttribute(
            `transform`,
            `translate(${pt.x - group.point().x} ${pt.y - group.point().y})`
          );
        }
        // ----------------------------------------------------------- pull current slice
        // return group;
      }); // convert all slices
    });
  } // svg
} // class
