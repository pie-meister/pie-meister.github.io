import PieMeister from "./PieMeister.js";

export default class PieMeisterInteractive extends PieMeister {
  connectedCallback() {
    super.connectedCallback(); // draws the svg

    this.slices = [...pies.shadowRoot.querySelectorAll("g[slice]")].map(
      (slice, idx) => {
        //------------------------------------------------------------------ create method .pull(T/F)
        slice.pull = (
          state = sliceDefinition.hasAttribute`pull`,
          pt = slice.point(
            0,
            Math.abs(~~sliceDefinition.getAttribute`pull` || pull)
          )
        ) =>
          slice.setAttribute(
            `transform`,
            (slice.pulled = state) // SET pulled property
              ? `translate(${pt.x - slice.point().x} ${pt.y - slice.point().y})`
              : `` //`translate(0 0)`
          );
        slice.pull();

        //------------------------------------------------------------------ mouse Events
        slice.onmouseout = (_) => (
          (this.slice = slice),
          this.dispatchEvent(
            new Event(`slice`),
            slice.pull(slice.toggleAttribute(`pull`))
          )
        );
        slice.onmouseover = (_) => (
          (this.slice = slice),
          this.dispatchEvent(
            new Event(`slice`),
            slice.pull(slice.toggleAttribute(`pull`))
          )
        );
        if (idx == 2) {
          let svg = slice.parentNode;
          let p1 = slice.create(180, 20, "brown"); //radius,slicesize,stroke-width,color
          console.log(p1.point());
          p1.setAttribute("opacity", "1");
          slice.append(p1);
        }
        return slice;
      }
    );

    // get all slices
  }
}
