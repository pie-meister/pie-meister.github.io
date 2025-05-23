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

customElements.define("progress-circle", class extends (customElements.get("pie-chart")) {
    connectedCallback() {
        setTimeout(() => {
            let createSlice = (
                partName,
                sizeValue,
                strokeColor,
                strokeWidth,
                extraAttributes = "",
                labelContent = "",
                radiusValue
            ) =>
                `<slice part=${partName} size=${sizeValue} stroke-width=${strokeWidth} radius=${radiusValue} stroke=${strokeColor} ${extraAttributes}>${labelContent}</slice>`;
            let createProgressSlice = (progressElement, index, allProgressElements) => {
                let strokeColor = progressElement.getAttribute("stroke") || "green";
                let width = this.getAttribute("width")
                    ? ~~this.getAttribute("width")
                    : progressElement.getAttribute("width")
                        ? ~~progressElement.getAttribute("width")
                        : 70;
                let radius = -index * width - index * width / 10 + 30;
                let fillColor = false;
                let fillAttribute = this.getAttribute("fill")
                    ? "fill=" + this.getAttribute("fill")
                    : "" == progressElement.innerHTML
                        ? (fillColor = strokeColor, "fill=" + strokeColor)
                        : "fill=none";
                let labelContent =
                    allProgressElements.length > 1
                        ? `<tspan part=label x=59% >${progressElement.innerHTML} </tspan><tspan part=value> $size</tspan>`
                        : "" == progressElement.innerHTML
                            ? `<tspan part=value x=50% y=62% ${fillColor ? "font-size=4em fill=" + fillColor : ""}>$size</tspan>`
                            : `<tspan part=label x=50% y=330>${progressElement.innerHTML}</tspan><tspan part=value x=50% y=510 font-size=5em >$size</tspan>`;
                return (
                    createSlice("background", "100%", this.getAttribute("background") || strokeColor, width, fillAttribute, " ", radius) +
                    createSlice("edge", progressElement.getAttribute("value"), progressElement.getAttribute("edge") || this.getAttribute("edge") || "#000", width, void 0, " ", radius) +
                    createSlice(`circle x=438 y=${64 + index * (1.1 * width)}`, progressElement.getAttribute("value"), strokeColor, .9 * width, void 0, labelContent, radius) +
                    "<pie-chart></pie-chart>"
                );
            };
            let progressElements = [...this.querySelectorAll("progress")];
            this.innerHTML =
                "<style>" +
                "path{stroke-linecap:round}" +
                (progressElements.length > 1
                    ? "text{text-anchor:end;alignment-baseline:middle;font-size:2em}" +
                    "[part='text'] tspan:nth-child(2){font-size:1.5em;fill:white;font-weight:bold}"
                    : `text{text-anchor:middle;alignment-baseline:middle;font-size:2.5em;fill:${this.getAttribute("color") || ""}}` +
                    `[part="label"]{font-size:2em}`) +
                "[part='background']{opacity:0.3}" +
                "</style>" +
                this.innerHTML +
                (this.getAttribute("value")
                    ? (this.setAttribute(
                        "range" + 10 * ~~(this.getAttribute("value").replace("%", "") / 10),
                        this.getAttribute("value")
                    ),
                        createProgressSlice(this, 0, []))
                    : progressElements.map(createProgressSlice).join(""));
            this.setAttribute("offset", "top");
            this.setAttribute("pull", this.getAttribute("pull") || "-230");
            this.setAttribute("part", "chart");
            super.connectedCallback();
            setTimeout(() => {
                [...this.querySelectorAll("slice")].map(slice => slice.remove());
            });
        });
    }
});