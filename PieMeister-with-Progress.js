
// To receive fully documented source code, you can send 25$ to my PayPal account: danny@engelman.nl

customElements.define("pie-chart", class extends HTMLElement {
    connectedCallback() {
        setTimeout((() => this.svg(this.attachShadow({
            mode: "open"
        }))));
    }
    svg(root, colors = (this.getAttribute("stroke") || "#3c3,#c33,#33c,#cc3,#c3c,#3cc").split(","), pull = ~~this.getAttribute("pull"), t = 0, pathLength = 0) {
        root.innerHTML = "<style>:host{display:inline-block}svg{width:100%}</style>" + `<svg part=svg viewBox=0,0,${1e3 + pull},${1e3 + pull}>${this.innerHTML}</svg>`;
        [ ...root.querySelectorAll("slice") ].map(((e, i) => {
            let s = document.createElementNS("http://www.w3.org/2000/svg", "g");
            let r = document.createElementNS("http://www.w3.org/2000/svg", "text");
            let l = e.getAttribute("size") || "";
            let a = ~~l.replace("%", "");
            let n = ~~e.getAttribute("stroke-width") || ~~this.getAttribute("stroke-width") || 500 + pull / 2 - pull;
            let u = t;
            let o;
            s.path = (t = 0, i = n, r = e.getAttribute("stroke") || (o ? "" : colors.shift()), l = a, h = u, g = (500 + pull / 2) / 2 - pull / 2 + t - ("stroke-width" == this.getAttribute("fill") ? (500 - pull / 2 - i) / 2 : 0), p = document.createElementNS("http://www.w3.org/2000/svg", "path")) => (p.setAttribute("part", "path"), 
            p.setAttribute("stroke", r), 
            p.setAttribute("stroke-width", i), 
            p.setAttribute("pathLength", pathLength), 
            p.setAttribute("stroke-dasharray", l + " " + (pathLength - l)), 
            p.setAttribute("d", `m${500 + pull / 2},${500 + pull / 2}m0,${-g}a2,2,0,000,${2 * g}a2,2,0,000-${2 * g}`), 
            p.setAttribute("fill", "none"), 
            p.getPoint = (t = 0, e) => e ? s.path(e).getPoint(t) : p.getPointAtLength(p.getTotalLength() - p.getTotalLength() / pathLength * (t + (h + l / 2))), 
            p);
            if (a == l) {
                if (!pathLength) [ ...this.querySelectorAll("slice") ].map((t => pathLength += ~~t.getAttribute("size")));
            } else pathLength = ~~this.getAttribute("size") || 100;
            if (!a) a = pathLength - t, 
            l = a + "%";
            o = s.path(~~e.getAttribute("radius"));
            s.points = [ [ 0, 0 ], [ a / -2, n / -2 ], [ a / -2, n / 2 ], [ a / 2, n / -2 ], [ a / 2, n / 2 ], [ 0, n / -2 ], [ 0, n / 2 ], [ 0, ~~e.getAttribute("pulltext") || ~~this.getAttribute("pulltext") || 0 ], [ 0, Math.abs(~~e.getAttribute("pull") || pull) ] ].map((([t, e]) => o.getPoint(t, e)));
            s.setAttribute("part", "slice" + i);
            s.setAttribute("size", l);
            s.setAttribute("label", r.innerHTML = this.querySelector("style") ? e.innerHTML ? e.innerHTML.replace("$size", l) : l : "");
            o.setAttribute("stroke-dashoffset", "top" == this.getAttribute("offset") ? a - pathLength : t += a);
            [ ...e.attributes ].map((t => o.setAttribute(t.name, t.value)));
            r.setAttribute("part", "text");
            r.setAttribute("x", e.getAttribute("x") || ("top" == this.getAttribute("offset") ? "50%" : s.points[7].x));
            r.setAttribute("y", e.getAttribute("y") || ("top" == this.getAttribute("offset") ? "50%" : s.points[7].y));
            s.append(o, r);
            e.replaceWith(s);
            if (e.hasAttribute("pull")) s.setAttribute("transform", `translate(${s.points[8].x - s.points[0].x} ${s.points[8].y - s.points[0].y})`);
        }));
    }
});

class PieMeisterProgress extends(customElements.get("pie-chart")){
    connectedCallback() {
        setTimeout((() => {
            let slice = (t, e, i, s, r = "", l = "", a) => `<slice part=${t} size=${e} stroke-width=${s} radius=${a} stroke=${i} ${r}>${l}</slice>`;
            let progressSlice = (t, e, i = []) => {
                let s = t.getAttribute("stroke") ? t.getAttribute("stroke") : "green";
                let r = this.getAttribute("width") ? ~~this.getAttribute("width") : t.getAttribute("width") ? ~~t.getAttribute("width") : 70;
                let l = -e * r - e * r / 10 + 30;
                let a = i.length > 1;
                let n = "" == t.innerHTML;
                let u = false;
                let o = this.getAttribute("fill") ? "fill=" + this.getAttribute("fill") : n ? (u = s, 
                "fill=" + s) : "fill=none";
                let h = a ? "<tspan part=label>" + t.innerHTML + " </tspan><tspan part=value> $size</tspan>" : n ? `<tspan part=value x=50% y=62% ${u ? "font-size=250 fill=" + u : ""}>$size</tspan>` : "<tspan part=label x=50% y=350>" + t.innerHTML + "</tspan><tspan part=value x=50% y=500>$size</tspan>";
                return slice("background", "100%", this.getAttribute("background") || s, r, o, " ", l) + slice("edge", t.getAttribute("value"), t.getAttribute("edge") || this.getAttribute("edge") || "#000", r, void 0, " ", l) + slice(`circle x=438 y=${64 + e * (1.1 * r)}`, t.getAttribute("value"), s, .9 * r, void 0, h, l) + "<pie-chart></pie-chart>";
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
}

customElements.define("progress-circle", PieMeisterProgress);