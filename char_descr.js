
// TODO: reorganize to have all non-character functions in other file

let x_height = 60
let num_height = 100
let cap_height = 130

const flip_shape = (original => {
    let shape = original

    let center = centroid(shape.map(part => part.points).flat())
    shape.map(part => {
        part.points = transformation(
            o => ({x: -o.x + center.x , y: o.y}), part.points)
        return part
    })

    return shape
})

const rotate_shape = ((deg, shape) => {
    let center = centroid(shape.map(part => part.points).flat())

    shape.map(part => {
        part.points = rotation(deg, part.points, center)
        return part
    })

    return shape
})

const dilate_shape = ((k, shape) => {
    let center = centroid(shape.map(part => part.points).flat())

    shape.map(part => {
        part.points = dilation(k, part.points, center)
        return part
    })

    return shape
})

const scale_shape = ((x, y, shape) => {
    let center = centroid(shape.map(part => part.points).flat())

    shape.map(part => {
        part.points = scale(x, y, part.points, center)
        return part
    })

    return shape
})

const place = ((x, y, shape) => {
    let corners = get_corners(shape.map(part => part.points).flat())

    let x_shift = x - corners.tl.x
    let y_shift = y - corners.tl.y

    shape.map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })

    return shape
})

const simple_lower = (upper => {
    return adjust_height(x_height, upper)
})

const get_height = (shape => {
    let corners = get_corners(shape.map(part => part.points).flat())
    return (corners.br.y - corners.tl.y)
})

const get_width = (shape => {
    let corners = get_corners(shape.map(part => part.points).flat())
    return (corners.br.x - corners.tl.x)
})

const adjust_height = ((new_height, shape) => {
    let corners = get_corners(shape.map(part => part.points).flat())
    return dilate_shape(new_height / (corners.br.y - corners.tl.y), shape)
})

const add_spacer = ((shape, height, down) => {
    let corners = get_corners(shape.map(part => part.points).flat())
    if (height == undefined) {
        let dy = cap_height - (corners.bl.y - corners.tl.y)
        shape.push(new Part({name: 'spacer',
            points: [{x: corners.tl.x , y: corners.tl.y - dy}]}))
    } else {

        let dy = cap_height + height - (corners.bl.y - corners.tl.y)
        if (down) dy = -cap_height + height
        shape.push(new Part({name: 'spacer',
            points: [{x: corners.tl.x , y: corners.tl.y - dy}]}))
    }

    return shape
})

function A() {
    let shape = V()
    let center = centroid(shape.map(part => part.points).flat())
    shape = rotate_shape(180, shape)

    let midline = new Part(parts.base)
    let gap_width = get_width(shape) / 2
    let line_width = midline.points[midline.points.length - 1].x - midline.points[0].x
    midline.points = dilation(gap_width/line_width, midline.points, centroid(midline.points))
    let y_shift = center.y - midline.points[0].y
    x_shift = centroid(shape[1].points).x - midline.points[0].x
    midline.points = translation(x_shift, y_shift, midline.points)

    shape.push(midline)

    return adjust_height(cap_height, shape)
}

function a() {
    let shape = o()

    let tail = l()[0]
    center = centroid(tail.points)
    let o_height = shape[3].points[shape[3].points.length - 1].y - shape[2].points[0].y
    let tail_height = tail.points[tail.points.length - 1].y - tail.points[0].y
    tail.points = dilation(o_height/tail_height, tail.points, center)

    let a_btm = btm_point(shape[2].first, shape[2].last)
    let o3_btm = top_point(shape[2].first, shape[2].last)
    let x_shift = o3_btm.x - top_point(tail.first, tail.last).x
    let y_shift = a_btm.y - btm_point(tail.first, tail.last).y
    tail.points = translation(x_shift, y_shift, tail.points)
    shape.push(tail)

    shape = shape.flat()

    return shape
}

function B() {
    let shape = P()

    let b2 = P()
    delete b2[0]
    b2.filter(o => o)
    b2 = scale_shape(1.5, 1, b2)
    let bline = shape[0]
    let bline_len = bline.points.length
    let btm_shift = bline.points[0].y - b2[1].points[0].y
    let left_shift = bline.points[0].x - b2[1].points[0].x
    b2.map(part => {
        part.points = translation(left_shift, btm_shift, part.points)
        return part
    })
    shape.push(b2)

    return shape.flat()
}

function b() {
    let shape = p().slice(0,-1)

    let center = centroid(shape.map(part => part.points).flat())
    let corners = get_corners(shape.map(part => part.points).flat())

    shape.map(part => {
        part.points = rotation(180, part.points, center)
        part.points = transformation(o => ({x: -o.x + corners.tr.x - corners.tl.x , y: o.y}), part.points)
        return part
    })

    return shape
}

function C() {
    return O().slice(0, 2)
}

function c_() {
    return simple_lower(C())
}

function D() {
    let shape = adjust_height(cap_height, l())
    let dcurve = [new Part(parts.O3), new Part(parts.O4)]
    dcurve = scale_shape(1.2, 1, dcurve)

    let l_height = shape[0].points[shape[0].points.length - 1].y - shape[0].points[0].y
    let dc_height = dcurve[1].points[dcurve[1].points.length - 1].y - dcurve[0].points[0].y
    let center = centroid(dcurve.map(part => part.points).flat())
    dcurve.map(part => {
        part.points = dilation(l_height/dc_height, part.points, center)
        return part
    })

    let x_shift = shape[0].points[shape[0].points.length - 1].x - dcurve[1].points[dcurve[1].points.length - 1].x
    let y_shift = shape[0].points[shape[0].points.length - 1].y - dcurve[1].points[dcurve[1].points.length - 1].y

    dcurve.map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })

    shape.push(dcurve)
    shape = shape.flat()

    let corners = get_corners(shape.map(part => part.points).flat())
    shape = scale_shape(1, cap_height / (corners.br.y - corners.tl.y), shape)

    return shape
}

function d() {
    let shape = p().slice(0,-1)

    let center = centroid(shape.map(part => part.points).flat())

    shape.map(part => {
        part.points = rotation(180, part.points, center)
        return part
    })

    shape = add_spacer(shape, 0, true)
    return shape
}

function E() {
    let shape = F()

    let b2 = L()[0]
    let center = centroid(b2.points)
    b2.points = transformation(o => ({x: -o.x + center.x , y: o.y}), b2.points)
    let btm_shift = shape[1].points[shape[1].points.length - 1].y - b2.points[0].y
    let left_shift = shape[1].points[shape[1].points.length - 1].x - b2.points[0].x
    b2.points = translation(left_shift, btm_shift, b2.points)

    shape.push(b2)

    shape = shape.flat()

    let corners = get_corners(shape.map(part => part.points).flat())
    shape = scale_shape(1, cap_height / (corners.br.y - corners.tl.y), shape)

    return shape
}

function e() {
    let shape = [new Part(parts.O1), new Part(parts.O2), new Part(parts.O4)]
    shape = simple_lower(shape)

    let e_line = new Part(parts.base)
    let s_width = shape[2].points[0].x - shape[0].points[0].x
    let el_width = e_line.points[e_line.points.length - 1].x - e_line.points[0].x
    let center = centroid(e_line.points)
    e_line.points = dilation(s_width/el_width, e_line.points, center)

    let x_shift = shape[2].points[0].x - e_line.points[e_line.points.length - 1].x
    let y_shift = shape[2].points[0].y - e_line.points[e_line.points.length - 1].y
    e_line.points = translation(x_shift, y_shift, e_line.points)

    shape.push(e_line)

    return shape
}

function F() {
    let shape = L()
    let center = centroid(shape.map(part => part.points).flat())
    let corners = get_corners(shape.map(part => part.points).flat())

    shape.map(part => {
        part.points = rotation(180, part.points, center)
        part.points = transformation(o => ({x: -o.x + corners.tr.x - corners.tl.x , y: o.y}), part.points)
        return part
    })

    let f2 = new Part(parts.base)
    center = centroid(f2.points)
    f2.points = transformation(o => ({x: -o.x + center.x , y: o.y}), f2.points)
    f2.points = dilation(0.3, f2.points, center)
    center = centroid([top_point(shape[1].first, shape[1].last), btm_point(shape[1].first, shape[1].last)])
    let x_shift = center.x - f2.points[0].x
    let y_shift = center.y - f2.points[0].y
    f2.points = translation(x_shift, y_shift, f2.points)
    shape.push(f2)


    return shape.flat()
}

function f() {
    let shape = t()

    let curve = r().slice(1)
    let x_shift = shape[0].points[shape[0].points.length - 1].x - curve[1].points[curve[1].points.length - 1].x
    let y_shift = shape[0].points[shape[0].points.length - 1].y - curve[1].points[curve[1].points.length - 1].y
    curve[0].points = translation(x_shift, y_shift, curve[0].points)
    curve[1].points = translation(x_shift, y_shift, curve[1].points)
    shape.push(curve)

    return shape.flat()
}

function G() {
    let shape = C()

    let bar1 = t()[1]
    let bar2 = i()[0]
    shape.push(bar1)
    shape.push(bar2)

    if (get_height([bar2]) > get_height(shape) - 30) {
        bar2.points = scale(1, 0.7, bar2.points)
    }

    let right_c = right_point(shape[1].first, shape[1].last)
    let btm_bar2 = btm_point(bar2.first, bar2.last)
    let x_shift = right_c.x - btm_bar2.x
    let y_shift = right_c.y - btm_bar2.y
    bar2.points = translation(x_shift + 15, y_shift, bar2.points)

    let top_bar2 = top_point(bar2.first, bar2.last)
    let right_b1 = right_point(bar1.first, bar1.last)
    x_shift = top_bar2.x - right_b1.x
    y_shift = top_bar2.y - right_b1.y
    bar1.points = translation(x_shift, y_shift, bar1.points)

    return shape.flat()
}

function g() {
    let shape = [a(), j()]
    delete shape[1][1]
    shape[1] = shape[1].filter(o => o)

    let curve = shape[1].slice(1,3)
    curve = scale_shape(get_width(shape[0]) / get_width(curve), 1, curve)

    let line_btm = btm_point(shape[0][4].first, shape[0][4].last)
    let curve_right = top_point(shape[1][0].first, shape[1][0].last)
    let x_shift = line_btm.x - curve_right.x
    let y_shift = line_btm.y - curve_right.y
    shape[1].map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })

    line_btm = btm_point(shape[1][0].first, shape[1][0].last)
    curve_right = top_point(curve[1].first, curve[1].last)
    x_shift = line_btm.x - curve_right.x
    y_shift = line_btm.y - curve_right.y
    curve.map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })

    shape[0] = add_spacer(shape[0])
    shape = shape.flat()
    return shape
}

function H() {
    let shape = I()

    shape = rotate_shape(90, shape)
    let corners = get_corners(shape.map(part => part.points).flat())
    shape = scale_shape(1, cap_height / (corners.br.y - corners.tl.y), shape)

    return shape
}

function h() {
    let shape = n()

    let bar = l()[0]
    let h_height = bar.points[bar.points.length - 1].y - bar.points[0].y
    let n_height = shape[0].points[shape[0].points.length - 1].y - shape[0].points[0].y
    shape[0].points = dilation(h_height/n_height, shape[0].points, centroid(shape[0].points))
    let y_shift = shape[1].points[shape[1].points.length - 1].y - shape[0].points[0].y
    shape[0].points = translation(0, y_shift, shape[0].points)

    return shape
}

function I() {
    let shape = adjust_height(cap_height, l())

    let itop = new Part(parts.base)
    let y_shift = shape[0].points[shape[0].points.length - 1].y - itop.points[itop.points.length - 1].y
    itop.points = translation(0, y_shift, itop.points)
    shape.push(itop)

    let ibtm = new Part(parts.base)
    y_shift = shape[0].points[0].y - ibtm.points[0].y
    ibtm.points = translation(0, y_shift, ibtm.points)
    shape.push(ibtm)

    return adjust_height(cap_height, shape)
}

function i() {
    let shape = l()
    shape = simple_lower(shape)

    let top = shape[0].points[shape[0].points.length - 1]
    let dot = new Part({name: 'dot', points: [
        top,
        {x: top.x + 0.1, y: top.y + 0.1}
    ]})
    //parts[dot.name] = dot
    dot.points = translation(0, -30, dot.points)
    shape.push(dot)

    return shape.flat()
}

function J() {
    let shape = U()
    delete shape[1]
    shape = adjust_height(cap_height, shape.filter(o => o))
    //shape.push(T()[1])
    return shape
}

function j() {
    let shape = [exclamation(), u().slice(2)]
    let center = centroid(shape[0].map(part => part.points).flat())
    shape[0].map(part => {
        part.points = rotation(180, part.points, center)
        return part
    })
    shape[0][0].points = scale(0, 0.8, shape[0][0].points, center)

    let line_btm = btm_point(shape[0][0].first, shape[0][0].last)
    let curve_right = right_point(shape[1][1].first, shape[1][1].last)
    let x_shift = line_btm.x - curve_right.x
    let y_shift = line_btm.y - curve_right.y - mouse.weight
    shape[1].map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })

    shape[0][0].points = translation(0, -mouse.weight, shape[0][0].points)

    shape = shape.flat()
    shape = add_spacer(shape, cap_height/2)

    return shape
}

function K() {
    let shape = [l(), V()]
    shape[0] = adjust_height(cap_height, shape[0])

    let center = centroid(shape[1].map(part => part.points).flat())
    shape[1].map(part => {
        part.points = rotation(90, part.points, center)
        return part
    })

    let l_height = shape[0][0].last.y - shape[0][0].first.y
    let v_height = top_point(shape[1][0].first, shape[1][0].last).y - btm_point(shape[1][1].first, shape[1][1].last).y + 15
    dilate_shape(l_height / v_height, shape[1])

    //center = shape[0][0].points[Math.round(shape[0][0].points.length / 2)]
    center = centroid(shape[0].map(part => part.points).flat())
    let left_v = left_point(shape[1][0].first, shape[1][0].first)
    let y_shift = center.y - left_v.y
    let x_shift = center.x - left_v.x
    shape[1][0].points = translation(x_shift, y_shift, shape[1][0].points)
    shape[1][1].points = translation(x_shift, y_shift, shape[1][1].points)

    shape = shape.flat()

    return adjust_height(cap_height, shape)
}

function k() {
    let shape = [l(), v()]
    let center = centroid(shape[1].map(part => part.points).flat())
    shape[1].map(part => {
        part.points = rotation(90, part.points, center)
        return part
    })

    let btm_l = btm_point(shape[0][0].first, shape[0][0].last)
    let y_shift = btm_l.y - right_point(shape[1][1].first, shape[1][1].last).y
    let x_shift = btm_l.x - left_point(shape[1][1].first, shape[1][1].last).x
    shape[1][0].points = translation(x_shift, y_shift, shape[1][0].points)
    shape[1][1].points = translation(x_shift, y_shift, shape[1][1].points)

    return shape.flat()
}

function L() {
    let shape = [new Part(parts.base)]

    let pline = new Part(parts.base)
    let center = centroid(pline.points)
    pline.points = rotation(90, pline.points, center)
    shape.push(pline)

    shape[0].points = dilation(0.6, shape[0].points, centroid(shape[0].points))
    let btm_p = btm_point(pline.first, pline.last)
    let left_base = left_point(shape[0].first, shape[0].last)
    let x_shift = btm_p.x - left_base.x
    let y_shift = btm_p.y - left_base.y
    shape[0].points = translation(x_shift, y_shift, shape[0].points)

    return adjust_height(cap_height, shape)
}

function l() {
    let pline = new Part(parts.base)
    let center = centroid(pline.points)
    pline.points = rotation(90, pline.points, center)

    return adjust_height(cap_height, [pline])
}

function M() {
    let shape = W()
    let center = centroid(shape.map(part => part.points).flat())

    shape.map(part => {
        part.points = rotation(180, part.points, center)
        return part
    })

    return shape
}

function m() {
    let shape = n()

    let arc = [shape[1], shape[2], shape[3]]
    let center = centroid(shape.map(part => part.points).flat())
    arc.map(part => {
        part.points = dilation(0.9, part.points, center)
        return part
    })

    let arc2 = [new Part(shape[1]), new Part(shape[2]), new Part(shape[3])]
    let x_shift = arc2[0].points[0].x - arc[2].points[arc[2].points.length -  1].x
    let y_shift = arc2[0].points[0].y - arc[1].points[0].y
    arc2.map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })
    shape.push(arc2)

    return shape.flat()
}

function N() {
    let shape = Z()
    let center = centroid(shape.map(part => part.points).flat())

    let opp = 0, hyp = 0
    let angle = Math.asin(opp, hyp)
    if (!angle) angle = Math.PI / 2

    shape.map(part => {
        part.points = rotation(angle, part.points, center, true)
        return part
    })

    let corners = get_corners(shape.map(part => part.points).flat())
    shape = scale_shape(1, cap_height / (corners.br.y - corners.tl.y), shape)

    return shape
}

function n() {
    let shape = u()
    let center = centroid(shape.map(part => part.points).flat())

    shape.map(part => {
        part.points = rotation(180, part.points, center)
        return part
    })

    return shape.flat()
}

function O() {
    let shape = [new Part(parts.O1),
            new Part(parts.O2),
            new Part(parts.O3),
            new Part(parts.O4)]

    return adjust_height(cap_height, shape)
}

function o() {
    return simple_lower(O())
}

function P() {
    let shape = []

    let pline = adjust_height(cap_height, l())[0]
    shape.push(pline)

    let pcurve = [new Part(parts.O3), new Part(parts.O4)]
    pcurve = adjust_height(cap_height / 2, pcurve)
    pcurve = scale_shape(1.3, 1, pcurve)

    let pline_len = pline.points.length
    let top_shift = pline.points[pline_len - 1].y - pcurve[1].points[0].y
    let left_shift = pline.points[pline_len - 1].x - pcurve[1].points[pcurve[1].points.length - 1].x
    let top_line = top_point(pline.first, pline.last)
    pcurve = place(top_line.x, top_line.y, pcurve)

    shape.push(pcurve)

    return adjust_height(cap_height, shape.flat())
}

function p() {
    let shape = [l(), o()]
    let center = centroid(shape[1].map(part => part.points).flat())
    shape[1].map(part => {
        part.points = rotation(180, part.points, center)
        return part
    })

    if (get_height(shape[1]) > get_height(shape[0]) - 30) {
        shape[0] = scale_shape(1, 1.3, shape[0])
    }

    let btm_l = top_point(shape[0][0].first, shape[0][0].last)
    let y_shift = btm_l.y - right_point(shape[1][2].first, shape[1][2].last).y
    let x_shift = btm_l.x - left_point(shape[1][2].first, shape[1][2].last).x
    shape[1].map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })

    shape[1] = add_spacer(shape[1])
    return shape.flat()
}

function Q() {
    let shape = O()
    let corners = get_corners(shape.map(part => part.points).flat())

    let tail = new Part(parts.base)
    let center = centroid(tail.points)
    tail.points = rotation(45, tail.points, center)
    tail.points = dilation(0.5, tail.points, center)
    let x_shift = corners.br.x - tail.points[0].x
    let y_shift = corners.br.y - tail.points[0].y
    tail.points = translation(x_shift, y_shift, tail.points)
    shape.push(tail)

    return shape.flat()
}

function q() {
    let shape = p()

    let corners = get_corners(shape.map(part => part.points).flat())

    shape.map(part => {
        part.points = transformation(o => ({x: -o.x + corners.tr.x - corners.tl.x , y: o.y}), part.points)
        return part
    })

    return shape
}

function R() {
    let shape = P()

    let leg = new Part(parts.base)
    let center = centroid(leg.points)
    leg.points = rotation(45, leg.points, center)
    //leg.points = dilation(0.9, leg.points, center)
    leg = adjust_height(cap_height / 2, [leg])[0]
    let x_shift = shape[1].points[0].x - leg.points[leg.points.length - 1].x
    let y_shift = shape[1].points[0].y - leg.points[leg.points.length - 1].y
    leg.points = translation(x_shift, y_shift, leg.points)
    shape.push(leg)

    return shape.flat()
}

function r() {
    let shape = n()
    delete shape[1]
    return shape.filter(o => o)
}

function S() {
    let shape = [C(), C(), [new Part(parts.O4)], [new Part(parts.O2)]]
    shape.map(part => dilate_shape(0.8, part))

    let center = centroid(shape[1].map(part => part.points).flat())
    shape[1].map(part => {
        part.points = rotation(180, part.points, center)
        return part
    })

    let btm_o1 = btm_point(shape[0][1].first, shape[0][1].last)
    let top_o2 = top_point(shape[1][1].first, shape[1][1].last)
    let x_shift = top_o2.x - btm_o1.x
    let y_shift = top_o2.y - btm_o1.y
    shape[0].map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })

    let left_o2 = left_point(shape[1][0].first, shape[1][0].last)
    let right_o1 = right_point(shape[0][0].first, shape[0][0].last)
    let left_o3 = left_point(shape[2][0].first, shape[2][0].last)
    let right_o4 = right_point(shape[3][0].first, shape[3][0].last)
    x_shift = left_o2.x - right_o4.x
    y_shift = left_o2.y - right_o4.y
    shape[3][0].points = translation(x_shift, y_shift, shape[3][0].points)
    x_shift = right_o1.x - left_o3.x
    y_shift = right_o1.y - left_o3.y
    shape[2][0].points = translation(x_shift, y_shift, shape[2][0].points)

    return adjust_height(cap_height, shape.flat())
}

function s() {
    return adjust_height(x_height + 4, S())
}

function T() {
    let shape = l()

    let ttop = new Part(parts.base)
    ttop.points = dilation(0.7, ttop.points, centroid(ttop.points))
    let y_shift = shape[0].points[shape[0].points.length - 1].y - ttop.points[0].y
    ttop.points = translation(0, y_shift, ttop.points)

    shape.push(ttop)

    return adjust_height(cap_height, shape.flat())
}

function t() {
    let shape = l()
    let center = centroid(shape[0].points)
    shape[0].points = dilation(0.8, shape[0].points, center)

    let f2 = new Part(parts.base)
    f2.points = dilation(0.3, f2.points, centroid(f2.points))
    center = centroid(shape[0].points)
    let y_shift = center.y - f2.points[0].y
    f2.points = translation(0, y_shift, f2.points)
    shape.push(f2)

    return shape
}

function U() {
    let shape = H().slice(1)

    for (let i = 0; i < shape[0].points.length / 4; ++i) {
        delete shape[0].points[i]
        delete shape[1].points[i]
    }
    shape[0].points = shape[0].points.filter(o => o)
    shape[1].points = shape[1].points.filter(o => o)

    let ucurve = [new Part(parts.O2), new Part(parts.O3)]
    let h_width = shape[0].points[shape[0].points.length - 1].x - shape[1].points[0].x
    let c_width = ucurve[1].points[ucurve[1].points.length - 1].x - ucurve[0].points[0].x
    let k = Math.min(h_width/c_width, c_width/h_width)
    center = centroid(ucurve.map(part => part.points).flat())
    ucurve.map(part => {
        part.points = dilation(k, part.points, center)
        return part
    })

    let x_shift = shape[1].points[0].x - ucurve[0].points[0].x
    let y_shift = shape[1].points[0].y - ucurve[0].points[0].y
    ucurve[0].points = translation(x_shift, y_shift, ucurve[0].points)
    ucurve[1].points = translation(x_shift, y_shift, ucurve[1].points)
    shape.push(ucurve)

    x_shift = ucurve[1].points[ucurve[1].points.length - 1].x - shape[0].points[0].x
    y_shift = ucurve[1].points[ucurve[1].points.length - 1].y - shape[0].points[0].y
    shape[0].points = translation(x_shift, y_shift, shape[0].points)

    return adjust_height(cap_height, shape.flat())
}

function u() {
    let shape = simple_lower(U())

    let tail = shape[0]
    let u_height = tail.points[tail.points.length -  1].y - shape[3].points[0].y
    let tail_height = tail.points[tail.points.length -  1].y - tail.points[0].y
    tail.points = dilation(u_height/tail_height, tail.points, centroid(tail.points))

    let y_shift = shape[3].points[0].y - tail.points[0].y
    tail.points = translation(0, y_shift, tail.points)

    return shape.flat()
}

function V() {
    let shape = []
    let center =  centroid(triangle.flat())

    let v1 = new Part(parts.A1)
    v1.points = rotation(-60, v1.points, center)
    shape.push(v1)

    let v2 = new Part(parts.A1)
    v2.points = rotation(0, v2.points, center)
    shape.push(v2)

    let btm1 = btm_point(v1.first, v1.last)
    let btm2 = btm_point(v2.first, v2.last)
    let x_shift = btm1.x - btm2.x
    let y_shift = btm1.y - btm2.y
    v2.points = translation(x_shift, y_shift, v2.points)

    return adjust_height(cap_height, shape)
}

function v() {
    return simple_lower(V())
}

function W() {
    let shape = scale_shape(0.6, 1, V())

    let w2 = scale_shape(0.6, 1, V())
    let w1 = shape[1]
    let left_w1 = top_point(w1.first, w1.last)
    let right_w2 = top_point(w2[0].first, w2[0].last)
    let x_shift = left_w1.x - right_w2.x
    let y_shift = left_w1.y - right_w2.y
    w2.map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })
    shape.push(w2)

    return adjust_height(cap_height, shape.flat())
}

function w() {
    return simple_lower(W())
}

function X() {
    let shape = []

    let x1 = new Part(parts.A1)
    let center = centroid(x1.points)
    x1.points = rotation(-60, x1.points, center)
    let left_shift = center.x - x1.points[0].x
    let y_shift = center.y - x1.points[x1.points.length - 1].y -  x1.points[0].y
    x1.points = translation(-left_shift, y_shift, x1.points)
    shape.push(x1)

    let x2 = new Part(parts.A1)
    let right_shift = center.x - x2.points[0].x
    y_shift = center.y - x2.points[x2.points.length - 1].y - x2.points[0].y
    x2.points = translation(right_shift, y_shift, x2.points)
    shape.push(x2)

    return adjust_height(cap_height, shape)
}

function x() {
    return simple_lower(X())
}

function Y() {
    let shape = V()

    let pline = new Part(parts.base)
    let center = centroid(pline.points)
    pline.points = rotation(90, pline.points, center)
    for (let i = 0; i < pline.points.length / 3; ++i) {
        delete pline.points[i]
    }
    pline.points = pline.points.filter(o => o)
    let left_shift = shape[0].points[0].x - pline.points[0].x
    let btm_shift = shape[0].points[0].y - pline.points[0].y
    pline.points = translation(left_shift, btm_shift, pline.points)
    pline.points = rotation(180, pline.points, shape[0].points[0])
    shape.push(pline)

    return adjust_height(cap_height, shape)
}

function y() {
    let shape = v()
    shape = add_spacer(shape)

    let y2 = shape[1]
    let center = top_point(y2.first, y2.last)
    y2.points = dilation(1.8, y2.points, center)

    return shape
}

function Z() {
    let shape = []

    let slash = new Part(parts.A1)
    shape.push(slash)
    let slash_len = slash.points.length

    let topline = new Part(parts.base)
    let right_shift = slash.points[slash_len - 1].x - topline.points[0].x
    let top_shift = slash.points[slash_len - 1].y - topline.points[0].y
    topline.points = translation(right_shift, top_shift, topline.points)
    shape.push(topline)

    let btmline = new Part(parts.base)
    let left_shift = slash.points[0].x - btmline.points[btmline.points.length - 1].x
    let btm_shift = slash.points[0].y - btmline.points[btmline.points.length - 1].y
    btmline.points = translation(left_shift, btm_shift, btmline.points)
    shape.push(btmline)

    return adjust_height(cap_height - mouse.weight, shape)
}

function z() {
    return simple_lower(Z())
}

function zero() {
    let shape = O()
    let center = centroid(shape.map(part => part.points).flat())

    shape.map(part => {
        part.points = scale(0.6, 1, part.points, center)
        return part
    })

    return adjust_height(num_height, shape)
}

function one() {
    let shape = [l(), o()[2]].flat()

    adjust_height(num_height, [shape[0]])
    shape[1].points = dilation(0.9, shape[1].points, centroid(shape[1].points))

    let top_l = top_point(shape[0].first, shape[0].last)
    let right_o = right_point(shape[1].first, shape[1].last)
    let x_shift = top_l.x - right_o.x
    let y_shift = top_l.y - right_o.y
    shape[1].points = translation(x_shift, y_shift, shape[1].points)

    return shape
}

function two() {
    let shape = three()
    delete shape[3]
    delete shape[4]
    shape = shape.filter(o => o)

    shape[3].points = rotation(-90, shape[3].points, centroid(shape[3].points))

    let base = z()[2]
    shape.push(base)

    let btm_o3 = btm_point(shape[1].first, shape[1].last)
    let top_curve = top_point(shape[3].first, shape[3].last)
    let x_shift = btm_o3.x - top_curve.x
    let y_shift = btm_o3.y - top_curve.y
    shape[3].points = translation(x_shift, y_shift, shape[3].points)

    let left_base = left_point(base.first, base.last)
    let btm_curve = btm_point(shape[3].first, shape[3].last)
    x_shift = btm_curve.x - left_base.x
    y_shift = btm_curve.y - left_base.y
    base.points = translation(x_shift, y_shift, base.points)

    let corners = get_corners(shape.map(part => part.points).flat())
    shape = scale_shape(1, num_height / (corners.br.y - corners.tl.y), shape)

    return shape
}

function three() {
    let shape = eight()
    delete shape[1]
    delete shape[4]
    return shape.filter(o => o)
}

function four() {
    let shape = adjust_height(num_height, l())
    shape.push(adjust_height(num_height / 2, l()))
    shape.push(adjust_height(num_height / 2, l()))
    shape = shape.flat()

    shape[1].points = rotation(90, shape[1].points)
    let center = centroid(shape[0].points)
    let right_base = right_point(shape[1].first, shape[1].last)
    let x_shift = center.x - right_base.x
    let y_shift = center.y - right_base.y + 15
    shape[1].points = translation(x_shift, y_shift, shape[1].points)

    let btm_short = btm_point(shape[2].first, shape[2].last)
    let left_base = left_point(shape[1].first, shape[1].last)
    x_shift = left_base.x - btm_short.x
    y_shift = left_base.y - btm_short.y
    shape[2].points = translation(x_shift, y_shift, shape[2].points)

    return shape
}

function five() {
    let shape = eight().slice(4)

    shape[0].points = scale(0.7, 0.4, shape[0].points)
    let right_o1 = right_point(shape[0].first, shape[0].last)
    let left_o4 = left_point(shape[3].first, shape[3].last)
    let x_shift = left_o4.x - right_o1.x
    let y_shift = left_o4.y - right_o1.y
    shape[0].points = translation(x_shift, y_shift, shape[0].points)

    let l_bar = l()[0]
    l_bar.points = rotation(15, l_bar.points, centroid(l_bar.points))
    l_bar = adjust_height(num_height / 2.3, [l_bar])[0]
    shape.push(l_bar)

    let left_o1 = left_point(shape[0].first, shape[0].last)
    let btm_bar = btm_point(shape[4].first, shape[4].last)
    x_shift = left_o1.x - btm_bar.x
    y_shift = left_o1.y - btm_bar.y
    shape[4].points = translation(x_shift, y_shift, shape[4].points)
    shape = adjust_height(num_height, shape)

    l_bar = two()[4]
    l_bar.points = scale(0.6, 1, l_bar.points)
    shape.push(l_bar)

    let top_bar = top_point(shape[4].first, shape[4].last)
    let left_bar = left_point(shape[5].first, shape[5].last)
    x_shift = top_bar.x - left_bar.x
    y_shift = top_bar.y - left_bar.y
    shape[5].points = translation(x_shift, y_shift, shape[5].points)

    return shape
}

function six() {
    let shape = eight().slice(4)

    let curve = new Part(shape.slice()[0])
    let curve_height = btm_point(curve.first, curve.last).y
            - top_point(curve.first, curve.last).y
    let base_height = btm_point(shape[1].first, shape[1].last).y
            - top_point(shape[1].first, shape[1].last).y
    let ky = (num_height - base_height) / curve_height
    curve.points = scale(
            1.3, ky,
            curve.points)

    let btm_o1 = btm_point(shape[0].first, shape[0].last)
    let btm_curve = btm_point(curve.first, curve.last)
    let x_shift = btm_o1.x - btm_curve.x
    let y_shift = btm_o1.y - btm_curve.y
    curve.points = translation(x_shift, y_shift, curve.points)
    shape.push(curve)

    return shape
}

function seven() {
    let shape = two().slice(3)
    shape = rotate_shape(180, shape)

    let corners = get_corners(shape.map(part => part.points).flat())
    shape = scale_shape(1, num_height / (corners.br.y - corners.tl.y), shape)

    let f2 = new Part(parts.base)
    center = centroid(f2.points)
    f2.points = transformation(o => ({x: -o.x + center.x , y: o.y}), f2.points)
    f2.points = dilation(0.3, f2.points, center)
    center = centroid(Object.values(corners))
    let x_shift = center.x - f2.points[0].x
    let y_shift = center.y - f2.points[0].y
    f2.points = translation(x_shift, y_shift, f2.points)
    shape.push(f2)

    return shape
}

function eight() {
    let shape = [o(), o()]
    shape[1] = dilate_shape(1.1, shape[1])

    let btm_o1 = btm_point(shape[0][1].first, shape[0][1].last)
    let top_o2 = top_point(shape[1][0].first, shape[1][0].last)
    let y_shift = top_o2.y - btm_o1.y
    shape[0].map(part => {
        part.points = translation(0, y_shift, part.points)
        return part
    })

    shape = shape.flat()

    return adjust_height(num_height, shape)
}

function nine() {
    return rotate_shape(180, six())
}

function period() {
    return [new Part({name: 'dot', points: [
        origin,
        {x: origin.x + 0.1, y: origin.y + 0.1}]})]
}

function exclamation() {
    let shape = l()
    shape = adjust_height(cap_height - 30, shape)

    let btm = shape[0].points[0]
    let m = slope(shape[0].points[shape[0].points.length - 1], btm)
    let dot = new Part({name: 'dot', points: [
        btm,
        {x: btm.x + 0.1, y: btm.y + 0.1}
    ]})
    dot.points = translation(30 / m, 30, dot.points)
    shape.push(dot)

    return shape.flat()
}

function question() {
    let shape = [three().slice(0, 3), i()]

    let center = centroid(shape[1].map(part => part.points).flat())
    shape[1].map(part => {
        part.points = rotation(180, part.points, center)
        return part
    })

    let btm_3 = btm_point(shape[0][1].first, shape[0][1].last)
    let top_i = top_point(shape[1][0].first, shape[1][0].last)
    let x_shift = btm_3.x - top_i.x
    let y_shift = btm_3.y - top_i.y
    shape[1].map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })


    return shape.flat()
}

function left_paren() {
    let shape = C()

    let center = centroid(shape.map(part => part.points).flat())
    shape.map(part => {
        part.points = scale(0.8, 1.2, part.points, center)
        return part
    })

    return shape
}

function right_paren() {
    return flip_shape(left_paren())
}

function for_slash() {
    return [new Part(parts.A1)]
}

function back_slash() {
    return flip_shape(for_slash())
}

function less_than() {
    return k().slice(1)
}

function greater_than() {
    return flip_shape(less_than())
}

function comma() {
    let shape = adjust_height(x_height / 2, one().slice(1))

    shape = add_spacer(shape, get_height(shape))

    return shape
}

function colon() {
    let shape = [period(), period()].flat()

    shape[1].points = translation(0, x_height, shape[1].points)

    return shape
}

function semi_colon() {
    let shape = [period(), comma().slice(0,1)].flat()

    let top_comma = top_point(shape[1].first, shape[1].last)
    shape[0].points = translation(top_comma.x, top_comma.y, shape[0].points)
    shape[1].points = translation(0, x_height - 15, shape[1].points)

    shape = add_spacer(shape, get_height([shape[1]]))

    return shape
}

function percent() {
    let shape = [o(), l(), o()]

    shape[0] = adjust_height(x_height / 2, shape[0])
    shape[1] = rotate_shape(45, shape[1])
    shape[2] = adjust_height(x_height / 2, shape[2])

    let corners = get_corners(shape[1][0].points)

    let x_shift = corners.tl.x
        - top_point(shape[0][3].first, shape[0][3].last).x
    let y_shift = corners.tl.y
        - btm_point(shape[0][3].first, shape[0][3].last).y
    shape[0].map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })

    x_shift = corners.br.x - btm_point(shape[2][1].first, shape[2][1].last).x
    y_shift = corners.br.y - top_point(shape[2][1].first, shape[2][1].last).y
    shape[2].map(part => {
        part.points = translation(x_shift, y_shift, part.points)
        return part
    })

    return shape.flat()
}

function dollar() {
    let shape = [S(), bar()]
    shape[0] = adjust_height(num_height - 30, shape[0])

    let top_s = top_point(shape[0][4].first, shape[0][4].last)
    let top_l = top_point(shape[1][0].first, shape[1][0].last)
    let x_shift = top_s.x - top_l.x
    let y_shift = top_s.y - top_l.y - (15 + 7.5)
    shape[1][0].points = translation(x_shift, y_shift, shape[1][0].points)

    return shape.flat()
}

function bar() {
    return adjust_height(cap_height + 15, l())
}

function hyphen() {
    let shape = t().slice(1)
    shape = add_spacer(shape, cap_height/2, true)
    return shape
}

function left_bracket() {
    let shape = bar()

    let top_bar = top_point(shape[0].first, shape[0].last)
    let btm_bar = btm_point(shape[0].first, shape[0].last)

    let upper = hyphen()[0]
    let left_u = left_point(upper.first, upper.last)
    let x_shift = top_bar.x - left_u.x
    let y_shift = top_bar.y - left_u.y
    upper.points = translation(x_shift, y_shift, upper.points)
    shape.push(upper)

    let lower = hyphen()[0]
    let left_l = left_point(lower.first, lower.last)
    x_shift = btm_bar.x - left_l.x
    y_shift = btm_bar.y - left_l.y
    lower.points = translation(x_shift, y_shift, lower.points)
    shape.push(lower)

    return shape
}

function right_bracket() {
    return flip_shape(left_bracket())
}

function plus() {
    let shape = [underscore(), l()]

    adjust_height(num_height / 2, shape[1])
    shape[1][0].points = translation(-7.5, -7.5, shape[1][0].points)

    shape = shape.flat()
    shape = add_spacer(shape, cap_height/2, true)
    return shape
}

function emdash() {
    return rotate_shape(90, adjust_height(num_height - 30, l()))
}

function apostrophe() {
    let shape = rotate_shape(90, hyphen().slice(0,1))
    shape = add_spacer(shape, 0, true)
    return shape
}

function quote_mark() {
    let shape = [apostrophe(), apostrophe()].flat()

    shape[2].points = translation(30, 0, shape[2].points)

    return shape
}

function underscore() {
    return dilate_shape(0.8, emdash())
}

function hash_sign() {
    let shape = [l(), l(), l(), l()]

    rotate_shape(24, shape[0])
    rotate_shape(24, shape[1])
    rotate_shape(90, shape[2])
    rotate_shape(90, shape[3])

    shape[0][0].points = translation(-50, 0, shape[0][0].points)
    shape[2][0].points = translation(0, -30, shape[2][0].points)
    shape[3][0].points = translation(-30, 30, shape[3][0].points)

    return adjust_height(num_height - 30, shape.flat())
}

// TODO: points not always in same order creat max and min point functions
