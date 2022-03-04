
'use strict'

/* ------------------------------------------------------------------
    CANVAS SET UP
------------------------------------------------------------------ */

// FIXME: handling multiple canvases
// QUESTION: do we need to keep 'use strict'??

// initialize canvas
const canvas = document.querySelector('#draw_space')
const parent = document.querySelector(".drawing-page .container")
canvas.width = innerWidth
canvas.height = innerHeight
const c = canvas.getContext('2d')


let canvas_left = canvas.offsetLeft,
    canvas_top = canvas.offsetTop
let shapes = []
let shape_count = -1


// resizing
function canvas_resize(n) {
    if (n) {
        canvas.width = parent.offsetWidth
        canvas.height = parent.offsetHeight
        canvas_left = parent.offsetLeft
        canvas_top = parent.offsetTop
    } else {
        canvas.width = innerWidth
        canvas.height = innerHeight
        canvas_left = canvas.offsetLeft
        canvas_top = canvas.offsetTop
    }

}
window.addEventListener('resize', canvas_resize)

// clearing
function clear_canvas() {
    c.clearRect(0, 0, canvas.width, canvas.height)
}

function reset_shapes() {
    shapes = []
    shape_count = -1
}

/* ------------------------------------------------------------------
    MOUSE DRAWING
------------------------------------------------------------------ */
let drawing = false
let mouse = { x: 0, y: 0, weight: 15 }

// draw with mouse
function draw(x, y) {
    c.beginPath()
    c.lineWidth = mouse.weight
    c.lineJoin = 'round'
    c.moveTo(mouse.x, mouse.y)
    c.lineTo(x, y)
    c.closePath()
    c.stroke()
    shapes[shape_count].push({x: mouse.x, y: mouse.y})
    mouse.x = x
    mouse.y = y
    shapes[shape_count].push({x: mouse.x, y: mouse.y})
}

// start drawing
canvas.addEventListener('mousedown', function(e) {
    drawing = true
    mouse.x = e.clientX - canvas_left
    mouse.y = e.clientY - canvas_top + scrollY
    shapes.push([])
    ++shape_count
    draw(mouse.x - 0.1, mouse.y - 0.1)
})

// continue drawing
canvas.addEventListener('mousemove', function(e) {
    if(drawing) {
        draw(
            e.clientX - canvas_left,
            e.clientY - canvas_top + scrollY
        )
    }
})

// stop drawing
canvas.addEventListener('mouseup', () => drawing = false)
canvas.addEventListener('mouseout', () => drawing = false)

/* ------------------------------------------------------------------
    GEOMETRY
------------------------------------------------------------------ */

const origin = {x: 0, y: 0}

const deg_to_rad = deg => (deg * Math.PI) / 180.0
const dist = (a, b) => Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)
const slope = (a, b) => (b.y - a.y) / (b.x - a.x)


// returns point closest to origin
const min = (a, b) => (dist(a, origin) <= dist(b, origin)) ? a : b

// returns point furthest from origin
const max = (a, b) => (dist(a, origin) >= dist(b, origin)) ? a : b

// returns points closest to the top, left, bottom, & right respectivly
const top_point = (a, b) => (a.y - b.y <= 0) ? a : b
const left_point = (a, b) => (a.x - b.x <= 0) ? a : b
const btm_point = (a, b) => (a.y - b.y >= 0) ? a : b
const right_point = (a, b) => (a.x - b.x >= 0) ? a : b


// returns center of points
function centroid(points) {
    let x = 0, y = 0

    points.forEach(p => {
        x += p.x
        y += p.y
    })

    let n = points.length
    return {x: x / n, y: y / n}
}

// returns scaled points by factor of k with center point or origin
function dilation(k, points, center) {
    let a = (center) ? center.x || 0 : 0,
        b = (center) ? center.y || 0 : 0
    let dilation = []

    points.forEach(p => {
        let x = k * (p.x - a) + a,
            y = k * (p.y - b) + b
        dilation.push({x: x, y: y})
    })

    return dilation
}

// returns scaled points by factors of x and y with center point or origin
function scale(x, y, points, center) {
    let a = (center) ? center.x || 0 : 0,
        b = (center) ? center.y || 0 : 0
    let scaled = []

    points.forEach(p => {
        let dx = x * (p.x - a) + a,
            dy = y * (p.y - b) + b
        scaled.push({x: dx, y: dy})
    })

    return scaled
}

// returns rotation by angle of points around center of roations or origin
// in degress or radians
function rotation(angle, points, center, in_rads) {
    let a = (center) ? center.x || 0 : 0,
        b = (center) ? center.y || 0 : 0
    let theta = (!in_rads) ? deg_to_rad(angle) : angle
    let rotation = []

    points.forEach(p => {
        let rx = (p.x - a) * Math.cos(theta) - (p.y - b) * Math.sin(theta) + a,
            ry = (p.x - a) * Math.sin(theta) + (p.y - b) * Math.cos(theta) + b
        rotation.push({x: rx, y: ry})
    })

    return rotation
}

// returns translation by x, y of points
function translation(x, y, points) {
    return points.map(o => ({x: o.x + x, y: o.y + y}))
}

// returns transformation of points by given formula
// ex. formula = o => ({x: -o.x + canvas.width, y: o.y})
//     for reflection over center of canvas
function transformation(formula, points) {
    return points.map(formula)
}

/* ------------------------------------------------------------------
    SHAPE ANALYSIS
------------------------------------------------------------------ */
let triangle = []
let circle = []

let count = 0

function draw_points(ccanvas, points, close, disjoint, weight) {
    let cv = ccanvas.getContext('2d')
    cv.lineWidth = weight || mouse.weight
    cv.lineJoin = 'round'
    cv.lineCap = 'round'

    cv.beginPath()
    cv.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
        if (disjoint) cv.moveTo(points[i].x, points[i].y)
        cv.lineTo(points[i].x, points[i].y)
    }

    if (close) cv.closePath()
    cv.stroke()
}

function get_vertices(shape, square) {
    let points = shape.flat()
    let corners = Object.values(get_corners(points))
    //draw_points(canvas, corners, true, false, 1)
    let vertices = []

    let inc = {x: false, y: false}
    let last = points[0]
    vertices.push(last)

    points.forEach(curr => {
        if ((last.x < curr.x && !inc.x) || (last.x > curr.x && inc.x)) {
            vertices.push(last)
            inc.x = !inc.x
        } else if ((last.y < curr.y && !inc.y) || (last.y > curr.y && inc.y)) {
            vertices.push(last)
            inc.y = !inc.y
        }

        last = curr
    })

    vertices.push(last)

    return vertices
}

// returns corners of image
function get_corners(shape) {
    let center = centroid(shape)
    let top_left = {x: canvas.width, y: canvas.height}
    let btm_right = {x: 0, y: 0}

    shape.forEach(point => {
        if (point.x < top_left.x) top_left.x = point.x
        if (point.y < top_left.y) top_left.y = point.y
        if (point.x > btm_right.x) btm_right.x = point.x
        if (point.y > btm_right.y) btm_right.y = point.y
    })

    return { tl: top_left, tr: {x: btm_right.x, y: top_left.y},
             bl: {x: top_left.x, y: btm_right.y}, br: btm_right }
}

// returns slipt up shape by vertices
function split_shape(shape) {
    let points = shape.flat()
    let vertices = get_vertices(shape)

    let split = []
    let temp = []

    for (let i = 0; i < points.length; ++i) {
        if (i > 0 && vertices.includes(points[i]) && temp.length > 2) {
            let verified = Math.abs(
                temp.map(o => o.x - temp[0].x + (o.y - temp[0].y))
                .reduce((a,b) => a + b) / temp.length) > 1

            if (verified) {
                split.push(temp)
                temp = []
            }
        }
        if (!vertices.includes(points[i])) temp.push(points[i])
    }

    if (temp > 2) split.push(temp)
    else split[split.length - 1].concat(temp)

    return split
}

function split_circle(shape) {
    let points = shape.flat()
    let center = centroid(points)

    const orientation = (a, b) => {
        let theta = Math.atan2(a.y - b.y, a.x - b.x)
        return theta * 180 / Math.PI
    }

    let split = [[], [], [], []]
    let curr = 0, last
    let added = []
    for (let i = 0; i < points.length; ++i) {
        let dir = orientation(points[i], center)
        curr = Math.floor((dir + 90) / 90) + 1
        if (curr < 0 || curr > 3) continue
        if (i > 0 && curr != last) {
            let density = split[last].slice(1)
                .map((p, i) => dist(split[last][i], p))
                .reduce((prev, curr) => prev + curr) / split[last].length
            if (density > 2)
                added.push(last)
        }
        if (!added.includes(curr)) {
            split[curr].push(points[i])
        }
        last = curr
    }

    return split
}

function split_tri(shape) {
    let points = shape.flat()
    let center = centroid(points)

    const orientation = (a, b) => {
        let theta = Math.atan2(a.y - b.y, a.x - b.x)
        //theta =  1 / Math.cos((theta % (2 * Math.PI / 3)) - (Math.PI / 3))
        return theta * 180 / Math.PI
    }

    let split = [[], [], []]
    let curr = 0, last
    let added = []
    for (let i = 0; i < points.length; ++i) {
        let dir = orientation(points[i], center)
        curr = dir //Math.round((dir + 120) / 120)
        if (i > 0 && curr > -150 && curr < -30) {
            c.strokeStyle = '#f00'
            draw_points(canvas, points.slice(i-1, i+1), false , true)
        } else if (i > 0 && curr > -30 && curr < 90) {
            c.strokeStyle = '#0f0'
            draw_points(canvas, points.slice(i-1, i+1), false , true)
        } else if (i > 0 && curr > 90 && curr < 210) {
            c.strokeStyle = '#00f'
            draw_points(canvas, points.slice(i-1, i+1), false , true)
        } else if (i>0) {
            c.strokeStyle = '#0ff'
            draw_points(canvas, points.slice(i-1, i+1), false , true)
        }
        console.log(curr);
        if (curr < 0 || curr > 2) continue
        if (last != undefined && curr != last) {
            let density = split[last].slice(1)
                .map((p, i) => dist(split[last][i], p))
                .reduce((prev, curr) => prev + curr) / split[last].length
            if (density > 3)
                added.push(last)
        }
        if (!added.includes(curr)) {
            split[curr].push(points[i])
        }
        last = curr
    }
    console.log(split);
    return split
}

function points_to_string(points) {
    let str = ''

    for (let i = 0; i < points.length; i++)
        str += '(' + points[i].x + ', ' + points[i].y + ')\n'

    return str
}

function draw_guidelines() {
    c.strokeStyle = '#555'
    c.lineWidth = 3
    let sx = 30
    c.beginPath()
    c.moveTo(100, 120 + sx)
    c.lineTo(canvas.width - 100, 120 + sx)
    c.stroke()
    c.beginPath()
    c.moveTo(100, 240+sx)
    c.lineTo(canvas.width - 100, 240 + sx)
    c.stroke()
    c.beginPath()
    c.moveTo(100, 360+sx)
    c.lineTo(canvas.width - 100, 360 + sx)
    c.stroke()
    c.strokeStyle = '#000'
    c.lineWidth = 15
}

let ftext

let ins_text = document.querySelector('#ins-text')

// TODO: disable drawing after all analysis is done
function analyze() { // TODO: collect? instruct? change name!
    c.strokeStyle = '#000'
    switch (count) {
        case -1:
            ins_text.innerHTML = 'draw a triangle'
            break
        case 0:
            triangle = shapes
            Part.shape_to_parts(split_shape(triangle), 'tri')
            ins_text.innerHTML = 'draw a circle'
            clear_canvas()
            break
        case 1:
            circle = shapes
            Part.shape_to_parts(split_circle(circle), 'cir')
            ins_text.innerHTML = 'draw a letter <span style="font-family:monospace">x</span>'
            clear_canvas()
            draw_guidelines()
            break
        case 2:
            let corners = get_corners(shapes.flat())
            let xh = corners.br.y - corners.tl.y
            let caph = 360 - 120
            x_height = xh * cap_height / caph
            clear_canvas()
            ins_text.innerHTML = 'redo or scroll to see font'
            canvas_resize(0)
            scrollTo('type')
            update()
            break
    }

    reset_shapes()
    ++count
}

let parts = {}

class Part {
    constructor(o) {
        this.name = o.name
        this._points = o.points
        this.first = o.points[0]
        this.last = o.points[o.points.length - 1]
    }

    draw(weight, ccanvas) {
        draw_points(ccanvas, this.points, false, false, weight)
    }

    to_string() {
        return this.name + ': \n' + pointsToString(this.points) + '\n'
    }

    get points() {
        return this._points
    }

    set points(p) {
        this._points = p
        this.first = this._points[0]
        this.last = this._points[this._points.length - 1]
    }

    static shape_to_parts(shape, type) {
        if (type == 'tri') {
            let slopes = shape.map((p, i) => [slope(p[0], p[p.length - 1]), i])
                    .filter(o => o[0])
                    .sort((a, b) => a[0] - b[0])

            let a1 = new Part({name: 'A1', points: shape[slopes[0][1]]}),
                base = new Part({name: 'base', points: shape[slopes[1][1]]}),
                a2 = new Part({name: 'A2', points: shape[slopes[2][1]]})
            parts[a1.name] = a1
            parts[base.name] = base
            parts[a2.name] = a2

            return
        }

        if (type == 'cir') {
            let angles = shape.map((p, i) => [Math.atan2(p[0].y - p[p.length - 1].y, p[0].x - p[p.length - 1].x), i])
                .filter(o => Math.abs(o[0]) > 0.01)
                .sort((a, b) => a[0] - b[0])
            // 1 0 3 2

            let o1 = new Part({name: 'O1', points: shape[0]})
            let o2 = new Part({name: 'O2', points: shape[3]})
            let o3 = new Part({name: 'O3', points: shape[2]})
            let o4 = new Part({name: 'O4', points: shape[1]})
            parts[o1.name] = o1
            parts[o2.name] = o2
            parts[o3.name] = o3
            parts[o4.name] = o4
        }
    }
}

/* ------------------------------------------------------------------
    FONT BUILDING
------------------------------------------------------------------ */

// mapping char_descr to respective char
function build_font() {
    let chars = Font.gen_chars()
    let shapes = {
        '!': exclamation(), '"': quote_mark(), '#': hash_sign(), '$': dollar(),
        '%': percent(), '&': [], '\'': apostrophe(), '(': left_paren(),
        ')': right_paren(), '*': [], '+': plus(), ',': comma(), '-': hyphen(),
        '.': period(), '/': for_slash(), '0': zero(), '1': one(), '2': two(),
        '3': three(), '4': four(), '5': five(), '6': six(), '7': seven(),
        '8': eight(), '9': nine(), ':': colon(), ';': semi_colon(),
        '<': less_than(), '=': [], '>': greater_than(), '?': question(),
        '@': [], 'A': A(), 'B': B(), 'C': C(), 'D': D(), 'E': E(), 'F': F(),
        'G': G(), 'H': H(), 'I': I(), 'J': J(), 'K': K(), 'L': L(), 'M': M(),
        'N': N(), 'O': O(), 'P': P(), 'Q': Q(), 'R': R(), 'S': S(), 'T': T(),
        'U': U(), 'V': V(), 'W': W(), 'X': X(), 'Y': Y(), 'Z': Z(),
        '[': left_bracket(), '\\': back_slash(), ']': right_bracket(), '^': [],
        '_': underscore(), '`': [], 'a': a(), 'b': b(), 'c': c_(), 'd': d(),
        'e': e(), 'f': f(), 'g': g(), 'h': h(), 'i': i(), 'j': j(), 'k': k(),
        'l': l(), 'm': m(), 'n': n(), 'o': o(), 'p': p(), 'q': q(), 'r': r(),
        's': s(), 't': t(), 'u': u(), 'v': v(), 'w': w(), 'x': x(), 'y': y(),
        'z': z(), '{': [], '|': bar(), '}': [], '~': []}

    for (let ch in shapes)
        chars[ch].shape = shapes[ch]

    return new Font({chars: chars, weight: mouse.weight})
}

class Font {
    constructor(o) {
        this.chars = o.chars
        this.weight = 10
        this.size = 0.6
        this.color = '#2d2d2d'
    }

    display(ccanvas) {
        ccanvas.getContext('2d').strokeStyle = this.color
        let char_array = Object.values(this.chars)
        char_array.sort((a, b) => a.type - b.type)

        let dx = 100, dy = 100, corners = {}, last = 0, newline = false, count = 0
        for (let i = 0; i < char_array.length; i++) {
            if (char_array[i].shape.length < 1) {
                console.warn('\'' + char_array[i].char + '\'', 'missing');
                continue
            }

            if (i > 0 && !newline) {
                dx += last + this.weight * 3 + 50
            } else {
                dx = 100
                if (i > 0) dy += 150
                count = 0
                newline = !newline
            }

            if (char_array[i].char == 'z') {
                console.log(last, dx);
                console.log(get_width(y()));
                console.log(get_width(char_array[i-1].shape))
            }

            char_array[i].shape = add_spacer(char_array[i].shape)
            char_array[i].shape = dilate_shape(this.size, char_array[i].shape)
            char_array[i].shape = place(dx, dy, char_array[i].shape)
            this.draw_char(char_array[i].char, ccanvas)

            last = get_width(char_array[i].shape)
            newline = (dx + last + this.weight * 3 + 350 > ccanvas.width)

            char_array[i].shape = dilate_shape(1/this.size, char_array[i].shape)

        }

        return dy
    }

    // QUESTION: may need to add async/await ??
    // QUESTION: whats diff btw display and print can it be reduced?

    print(start, string, ccanvas) {
        let schars = string.split('')
        let fchars = schars.map(c => this.chars[c])
        let cv = ccanvas.getContext('2d')
        cv.strokeStyle = this.color
        let char_array = Object.values(fchars)

        let dx = start, dy = 150, corners = {}, last = [], shift = 0
        for (let i = 0; i < char_array.length; ++i) {
            if (schars[i] == ' ') {
                dx += 50
                continue
            }

            if (char_array[i].shape.length < 1) {
                console.warn('\'' + char_array[i].char + '\'', 'missing');
                continue
            }


            if (i > 0) {
                dx += last + this.weight * 2 + 7 - shift
                //dx += 50
            } else dx = 150

            char_array[i].shape = add_spacer(char_array[i].shape)
            char_array[i].shape = dilate_shape(this.size, char_array[i].shape)
            char_array[i].shape = place(dx, dy, char_array[i].shape)
            this.draw_char(char_array[i].char, ccanvas)
            corners = get_corners(char_array[i].shape.map(part => part.points).flat())

            last = corners.br.x - corners.bl.x - shift
            char_array[i].shape = dilate_shape(1/this.size, char_array[i].shape)
        }

        return dx
    }

    draw_char(code, ccanvas) {
        let to_draw = this.chars[code].shape

        // TODO: some sort of translation for alignment

        to_draw.forEach(part => {
            part.draw(this.weight, ccanvas)
        })
    }

    static gen_chars() {
        let chars = {}

        for(let i = 33, type = ''; i < 127; ++i) {
            if (i > 47 && i < 58) type = 3 // 'number'
            else if (i > 64 && i < 91) type = 1 // 'uletter'
            else if (i > 96 && i < 123) type = 2 // 'lletter'
            else type = 4 // 'symbol'

            chars[String.fromCharCode(i)] = {
                code: i,
                char: String.fromCharCode(i),
                type: type,
                shape: [] }
        }

        return chars
    }
}

/* ------------------------------------------------------------------
    KEYBOARD ACTIONS
------------------------------------------------------------------ */

window.onkeydown = function(e) {
    if (e.metaKey) return
    if (e.keyCode === 13) { // enter/return key
        e.preventDefault()
        return
    }
    if (e.keyCode == 8) {
        if (start != undefined && start > 150) {

        }
    }
    console.log(e.keyCode, e.key);
    if (e.keyCode == 32 && e.target == document.body) {
        e.preventDefault
        // TODO: add space
        return false
    }
    if (count == 3) {
        build_font().draw_char(e.key, canvas)
    }
}
