customElements.define("pie-chart", class extends HTMLElement {
    connectedCallback() {
        setTimeout(() => this.svg(this.attachShadow({ mode: "open" })));
    }
    svg(
        root,
        // variables:
        colors = (this.getAttribute("stroke") || "#3c3,#c33,#33c,#cc3,#c3c,#3cc").split(","),
        pull = ~~this.getAttribute("pull"),
        totalSoFar = 0,
        totalPathLength = 0
    ) {
        root.innerHTML = "<style>:host{display:inline-block}svg{width:100%}</style>" +
            `<svg part=svg viewBox=0,0,${1e3 + pull},${1e3 + pull}>${this.innerHTML}</svg>`;
        // create slices
        [...root.querySelectorAll("slice")]
            .map((sliceDefinition, sliceIndex) => {
                let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
                let label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                let sizeString = sliceDefinition.getAttribute("size") || "";
                let sliceSize = ~~sizeString.replace("%", "");
                let strokeWidth = ~~sliceDefinition.getAttribute("stroke-width") ||
                    ~~this.getAttribute("stroke-width") ||
                    500 + pull / 2 - pull;
                let startOffset = totalSoFar;
                let slicePath;
                group.path = (
                    extraRadius = 0,
                    pathStrokeWidth = strokeWidth,
                    strokeColor = sliceDefinition.getAttribute("stroke") || (slicePath ? "" : colors.shift()),
                    arcLength = sliceSize,
                    arcStart = startOffset,
                    radius = (500 + pull / 2) / 2 - pull / 2 + extraRadius - ("stroke-width" == this.getAttribute("fill") ? (500 - pull / 2 - pathStrokeWidth) / 2 : 0),
                    path = document.createElementNS("http://www.w3.org/2000/svg", "path")
                ) => (
                    path.setAttribute("part", "path path" + sliceIndex),
                    path.setAttribute("stroke", strokeColor),
                    path.setAttribute("stroke-width", pathStrokeWidth),
                    path.setAttribute("pathLength", totalPathLength),
                    path.setAttribute("stroke-dasharray", arcLength + " " + (totalPathLength - arcLength)),
                    path.setAttribute("d", `m${500 + pull / 2},${500 + pull / 2}m0,${-radius}a2,2,0,000,${2 * radius}a2,2,0,000-${2 * radius}`),
                    path.setAttribute("fill", "none"),
                    path.getPoint = (pointOffset = 0, customRadius) =>
                        customRadius
                            ? group.path(customRadius).getPoint(pointOffset)
                            : path.getPointAtLength(
                                path.getTotalLength() -
                                path.getTotalLength() / totalPathLength * (pointOffset + (arcStart + arcLength / 2))
                            )
                    , path
                );
                if (sliceSize == sizeString) {
                    if (!totalPathLength) {
                        [...this.querySelectorAll("slice")].map(slice => totalPathLength += ~~slice.getAttribute("size"));
                    }
                } else {
                    totalPathLength = ~~this.getAttribute("size") || 100;
                }
                if (!sliceSize) {
                    sliceSize = totalPathLength - totalSoFar;
                    sizeString = sliceSize + "%";
                }
                slicePath = group.path(~~sliceDefinition.getAttribute("radius"));
                group.points = [
                    [0, 0],
                    [sliceSize / -2, strokeWidth / -2],
                    [sliceSize / -2, strokeWidth / 2],
                    [sliceSize / 2, strokeWidth / -2],
                    [sliceSize / 2, strokeWidth / 2],
                    [0, strokeWidth / -2],
                    [0, strokeWidth / 2],
                    [0, ~~sliceDefinition.getAttribute("pulltext") || ~~this.getAttribute("pulltext") || 0],
                    [0, Math.abs(~~sliceDefinition.getAttribute("pull") || pull)]
                ].map(([radius, width]) => slicePath.getPoint(radius, width));
                group.setAttribute("part", "slice slice" + sliceIndex);
                group.setAttribute("size", sizeString);
                group.setAttribute(
                    "label",
                    label.innerHTML = this.querySelector("style")
                        ? sliceDefinition.innerHTML
                            ? sliceDefinition.innerHTML.replace("$size", sizeString)
                            : sizeString
                        : ""
                );
                slicePath.setAttribute(
                    "stroke-dashoffset",
                    "top" == this.getAttribute("offset")
                        ? sliceSize - totalPathLength
                        : totalSoFar += sliceSize
                );
                [...sliceDefinition.attributes].map(attr => slicePath.setAttribute(attr.name, attr.value));
                label.setAttribute("part", "text text" + sliceIndex);
                label.setAttribute(
                    "x",
                    sliceDefinition.getAttribute("x") ||
                    ("top" == this.getAttribute("offset") ? "50%" : group.points[7].x)
                );
                label.setAttribute(
                    "y",
                    sliceDefinition.getAttribute("y") ||
                    ("top" == this.getAttribute("offset") ? "50%" : group.points[7].y)
                );
                group.append(slicePath, label);
                sliceDefinition.replaceWith(group);
                if (sliceDefinition.hasAttribute("pull")) {
                    group.setAttribute(
                        "transform",
                        `translate(${group.points[8].x - group.points[0].x} ${group.points[8].y - group.points[0].y})`
                    );
                }
            });
    }
});