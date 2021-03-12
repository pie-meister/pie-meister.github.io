// function getTagHTML(el) {
//   if (el instanceof HTMLElement)
//     return (
//       `<${el.localName}` +
//       [...el.attributes].map((attr) => ` ${attr.name}="${attr.nodeValue.replace(/"/g, "&quot;")}"`).join`` +
//       `></${el.localName}>`
//     );
//   else return null;
// }
// function pointAtX(a, b, x) {
//   // sloped linefrom a->b, return y at x=0 or x=100
//   var slope = (b[1] - a[1]) / (b[0] - a[0]);
//   var y = a[1] + (x - a[0]) * slope;
//   return { x, y };
// }
// let pt2 = pointAtX([50, 50], [point1.x, point1.y], 20);

customElements.define(
  "pie-chart",
  class extends HTMLElement {
    connectedCallback() {
      this.attachShadow({
        mode: "open",
      });
      setTimeout(() => this.render()); // wait till DOM children are parsed
    }
    render() {
      let colors = this.getAttribute("colors") || ["#e24", "#2a4", "#fe2", "#46e", "#f92", "#4ef", "#f2e", "#962"];
      let pull = ~~this.getAttribute("pull") || 0;
      let gap = ~~this.getAttribute("gap") || 0;

      let dashoffset = 0; // clockwise - incremental stroke offset for each slice
      // ================================================================================== functions
      let addCircle = (point, color = "hotpink", circle = document.createElementNS(namespace, "circle")) => {
        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);
        circle.setAttribute("r", 10);
        circle.setAttribute("fill", color);
        circle.setAttribute("stroke-width", 3);
        circle.setAttribute("stroke", "black");
        this.shadowRoot.querySelector("svg").append(circle);
        return circle;
      };

      let namespace = "http://www.w3.org/2000/svg";
      // ================================================================================== createPath
      let createSlice = (
        extraRadius,
        R = (500 + pull / 2) / 2 - pull / 2 + extraRadius,
        path = document.createElementNS(namespace, "path")
      ) => (
        path.setAttribute("d", `m${500 + pull / 2} ${500 + pull / 2}m0 ${-R}a1 1 0 000 ${R * 2}a1 1 0 000-${R * 2}`),
        path.setAttribute("pathLength", pathlength),
        // stick .M method on path to get a Point position x,y later
        (path.M = (sliceSize) =>
          path.getPointAtLength(
            path.getTotalLength() - (path.getTotalLength() / pathlength) * (dashoffset + sliceSize / 2)
          )),
        // return path
        path
      );
      let pathlength = 0; // determined by first slice size, 360 for size=N% notation

      // ================================================================================== create SVG
      // inject SVG in shadowDOM so <slice> can be processed
      this.shadowRoot.innerHTML = `<style>:host{display:inline-block}svg{width:100%}</style><svg id=${
        this.id
      } xmlns=${namespace} viewBox="0 0 ${1000 + pull} ${1000 + pull}">${this.innerHTML}</svg>`;

      // ================================================================================== convert <slice>s to paths
      this.slices = [...this.shadowRoot.querySelectorAll("slice")].map((sliceBase, idx) => {
        let sizeString = sliceBase.getAttribute("size");
        let sliceSize = ~~sizeString.replace(/\%/, "");
        // ------------------------------------------------------------------ determine pathLength
        // first slice size% set pathlength for all other slices
        if (sliceSize == sizeString) {
          if (!pathlength) {
            [...this.querySelectorAll("slice")].map((slice) => (pathlength += ~~slice.getAttribute("size") + gap));
          }
        } else {
          pathlength = 360;
        }

        let slice = createSlice(0);
        let strokewidth =
          (~~sliceBase.getAttribute("stroke-width") || ~~this.getAttribute("stroke-width") || (1000 + pull) / 2) - pull;
        let point = slice.M(sliceSize);
        let pull_point = createSlice(Math.abs(pull)).M(sliceSize);
        let text_point = createSlice(this.getAttribute("text") || 60).M(sliceSize);

        let group = document.createElementNS(namespace, "g");
        let label = document.createElementNS(namespace, "text");

        slice.setAttribute("stroke-dasharray", sliceSize + " " + (pathlength - sliceSize));
        slice.setAttribute("stroke-dashoffset", (dashoffset += sliceSize + gap));
        slice.setAttribute("stroke-width", strokewidth);
        slice.setAttribute("stroke-linecap", this.getAttribute("stroke-linecap") || "");
        slice.setAttribute("fill", "none");
        slice.setAttribute("stroke", sliceBase.getAttribute("stroke") || colors.shift());
        slice.toggleAttribute("pull",sliceBase.hasAttribute("pull"));

        // let attrs = {
        //   "stroke-dasharray": sliceSize + " " + (pathlength - sliceSize),
        //   "stroke-dashoffset": (dashoffset += sliceSize + gap),
        //   "stroke-width": strokewidth,
        //   "stroke-linecap": this.getAttribute("stroke-linecap") || "",
        //   fill: "none",
        //   stroke: sliceBase.getAttribute("stroke") || colors.shift(),
        // };
        // --- OVERWRITE attrs with user <slice> attribute values
        //[...sliceBase.attributes].map((x) => (attrs[x.name] = x.value)); // add user defined attributes
        // --- assign all attributes to path
        //Object.keys(attrs).map((attr) => slice.setAttribute(attr, attrs[attr]));

        // --- create slice(idx) content
        label.setAttribute("x", text_point.x);
        label.setAttribute("y", text_point.y);
        label.innerHTML = sliceBase.innerHTML || sizeString;
        addCircle(point, "green");
        // addCircle(text_point, "grey");
        // addCircle(pull_point, "red");

        group.append(slice, label);
        group.id = "slice" + (idx + 1);
        // --- add path and label to SVG, at <slice> position
        // parentNode can be SVG or user element <g>
        sliceBase.parentNode.replaceChild(group, sliceBase);

        // abuse no longer required sliceBase
        sliceBase = {
          slice,
          point,
          label,
          pull: (state) =>
            group.setAttribute(
              "transform",
              state ? `translate(${pull_point.x - point.x} ${pull_point.y - point.y})` : `translate(0 0)`
            ),
        };
        sliceBase.pull(slice.hasAttribute("pull"));

        return sliceBase;
      }); // convert all slices
    } // render
  } // class
); // define


// function getTagHTML(el) {
//   if (el instanceof HTMLElement)
//     return (
//       `<${el.localName}` +
//       [...el.attributes].map((attr) => ` ${attr.name}="${attr.nodeValue.replace(/"/g, "&quot;")}"`).join`` +
//       `></${el.localName}>`
//     );
//   else return null;
// }
// function pointAtX(a, b, x) {
//   // sloped linefrom a->b, return y at x=0 or x=100
//   var slope = (b[1] - a[1]) / (b[0] - a[0]);
//   var y = a[1] + (x - a[0]) * slope;
//   return { x, y };
// }
// let pt2 = pointAtX([50, 50], [point1.x, point1.y], 20);
