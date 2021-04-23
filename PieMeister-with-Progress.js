
// To receive full documented source code, send 25$ to my PayPal account: danny@engelman.nl

customElements.define("pie-chart", class extends HTMLElement {
    connectedCallback() {
        setTimeout((() => this.svg(this.attachShadow({
            mode: "open"
        }))));
    }
    svg(root, colors = (this.getAttribute("stroke") || "#3c3,#c33,#33c,#cc3,#c3c,#3cc").split(","), pull = ~~this.getAttribute("pull"), t = 0, pathLength = 0) {
        root.innerHTML = "<style>:host{display:inline-block}svg{width:100%}</style>" + `<svg part=svg viewBox=0,0,${1e3 + pull},${1e3 + pull}>${this.innerHTML}</svg>`;
        [ ...root.querySelectorAll("slice") ].map(((sliceDefinition, e) => {
            let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            let label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            let sizeString = sliceDefinition.getAttribute("size") || "";
            let sliceSize = ~~sizeString.replace("%", "");
            let strokeWidth = ~~sliceDefinition.getAttribute("stroke-width") || ~~this.getAttribute("stroke-width") || 500 + pull / 2 - pull;
            let i = t;
            let slicepath;
            group.path = (extraRadius = 0, t = strokeWidth, e = sliceDefinition.getAttribute("stroke") || (slicepath ? "" : colors.shift()), s = sliceSize, r = i, l = (500 + pull / 2) / 2 - pull / 2 + extraRadius - ("stroke-width" == this.getAttribute("fill") ? (500 - pull / 2 - t) / 2 : 0), path = document.createElementNS("http://www.w3.org/2000/svg", "path")) => (path.setAttribute("part", "path"), 
            path.setAttribute("stroke", e), 
            path.setAttribute("stroke-width", t), 
            path.setAttribute("pathLength", pathLength), 
            path.setAttribute("stroke-dasharray", s + " " + (pathLength - s)), 
            path.setAttribute("d", `m${500 + pull / 2},${500 + pull / 2}m0,${-l}a2,2,0,000,${2 * l}a2,2,0,000-${2 * l}`), 
            path.setAttribute("fill", "none"), 
            path.getPoint = (t = 0, radius) => radius ? group.path(radius).getPoint(t) : path.getPointAtLength(path.getTotalLength() - path.getTotalLength() / pathLength * (t + (r + s / 2))), 
            path);
            if (sliceSize == sizeString) {
                if (!pathLength) [ ...this.querySelectorAll("slice") ].map((slice => pathLength += ~~slice.getAttribute("size")));
            } else pathLength = ~~this.getAttribute("size") || 100;
            if (!sliceSize) sliceSize = pathLength - t, 
            sizeString = sliceSize + "%";
            slicepath = group.path(~~sliceDefinition.getAttribute("radius"));
            group.points = [ [ 0, 0 ], [ sliceSize / -2, strokeWidth / -2 ], [ sliceSize / -2, strokeWidth / 2 ], [ sliceSize / 2, strokeWidth / -2 ], [ sliceSize / 2, strokeWidth / 2 ], [ 0, strokeWidth / -2 ], [ 0, strokeWidth / 2 ], [ 0, ~~sliceDefinition.getAttribute("pulltext") || ~~this.getAttribute("pulltext") || 0 ], [ 0, Math.abs(~~sliceDefinition.getAttribute("pull") || pull) ] ].map((([radius, width]) => slicepath.getPoint(radius, width)));
            group.setAttribute("part", "slice" + e);
            group.setAttribute("size", sizeString);
            group.setAttribute("label", label.innerHTML = this.querySelector("style") ? sliceDefinition.innerHTML ? sliceDefinition.innerHTML.replace("$size", sizeString) : sizeString : "");
            slicepath.setAttribute("stroke-dashoffset", "top" == this.getAttribute("offset") ? sliceSize - pathLength : t += sliceSize);
            [ ...sliceDefinition.attributes ].map((t => slicepath.setAttribute(t.name, t.value)));
            label.setAttribute("part", "text");
            label.setAttribute("x", sliceDefinition.getAttribute("x") || ("top" == this.getAttribute("offset") ? "50%" : group.points[7].x));
            label.setAttribute("y", sliceDefinition.getAttribute("y") || ("top" == this.getAttribute("offset") ? "50%" : group.points[7].y));
            group.append(slicepath, label);
            sliceDefinition.replaceWith(group);
            if (sliceDefinition.hasAttribute("pull")) group.setAttribute("transform", `translate(${group.points[8].x - group.points[0].x} ${group.points[8].y - group.points[0].y})`);
        }));
    }
});

customElements.define("progress-circle", class extends(customElements.get("pie-chart")){
    connectedCallback() {
        setTimeout((() => {
            let slice = (t, e, stroke, strokeWidth, i = "", label = "", radius) => `<slice part=${t} size=${e} stroke-width=${strokeWidth} radius=${radius} stroke=${stroke} ${i}>${label}</slice>`;
            let progressSlice = (t, e, i = []) => {
                let stroke = t.getAttribute("stroke") ? t.getAttribute("stroke") : "green";
                let width = this.getAttribute("width") ? ~~this.getAttribute("width") : t.getAttribute("width") ? ~~t.getAttribute("width") : 70;
                let radius = -e * width - e * width / 10 + 30;
                let s = i.length > 1;
                let r = "" == t.innerHTML;
                let l = false;
                let a = this.getAttribute("fill") ? "fill=" + this.getAttribute("fill") : r ? (l = stroke, 
                "fill=" + stroke) : "fill=none";
                let label = s ? "<tspan part=label>" + t.innerHTML + " </tspan><tspan part=value> $size</tspan>" : r ? `<tspan part=value x=50% y=62% ${l ? "font-size=250 fill=" + l : ""}>$size</tspan>` : "<tspan part=label x=50% y=350>" + t.innerHTML + "</tspan><tspan part=value x=50% y=500>$size</tspan>";
                return slice("background", "100%", this.getAttribute("background") || stroke, width, a, " ", radius) + slice("edge", t.getAttribute("value"), t.getAttribute("edge") || this.getAttribute("edge") || "#000", width, void 0, " ", radius) + slice(`circle x=438 y=${64 + e * (1.1 * width)}`, t.getAttribute("value"), stroke, .9 * width, void 0, label, radius) + "<pie-chart></pie-chart>";
            };
            let t = [ ...this.querySelectorAll("progress") ];
            this.innerHTML = "<style>" + "path{stroke-linecap:round}" + (t.length > 1 ? "text{text-anchor:end;alignment-baseline:middle;font-size:30}" + "[part='text'] tspan:nth-child(2){font-size:40;fill:white;font-weight:bold}" : `text{text-anchor:middle;alignment-baseline:middle;font-size:150;fill:${this.getAttribute("color") || ""}}` + `[part="label"]{font-size:80}`) + "[part='background']{opacity:0.3}" + "</style>" + this.innerHTML + (this.getAttribute("value") ? (this.setAttribute("range" + 10 * ~~(this.getAttribute("value").replace("%", "") / 10), this.getAttribute("value")), 
            progressSlice(this, 0)) : t.map(progressSlice).join(""));
            this.setAttribute("offset", "top");
            this.setAttribute("pull", this.getAttribute("pull") || "-230");
            this.setAttribute("part", "chart");
            super.connectedCallback();
            setTimeout((() => {
                [ ...this.querySelectorAll("slice") ].map((t => t.remove()));
            }));
        }));
    }
});