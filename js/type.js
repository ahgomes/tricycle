
const display_space = document.querySelector('#display_space')
display_space.height = innerHeight * 3
display_space.width = innerWidth
const ds = display_space.getContext('2d')

let ftriangle
let fcircle
let ffont
let cont = document.querySelector('.display .container')
let input = document.querySelector('#type-test')
let curr_weight = 8


function onload() {
    input.value = ''
    location.hash = ''
    triangle = [
        {x:462,y:396},{x:461.9,y:395.9},{x:461.9,y:395.9},{x:462,y:397},{x:462,y:397},{x:462,y:395},{x:462,y:395},{x:472,y:375},{x:472,y:375},{x:501,y:324},{x:501,y:324},{x:528,y:275},{x:528,y:275},{x:534,y:265},{x:534,y:265},{x:536,y:262},{x:536,y:262},{x:543,y:272},{x:543,y:272},{x:550,y:285},{x:550,y:285},{x:560,y:301},{x:560,y:301},{x:572,y:321},{x:572,y:321},{x:594,y:356},{x:594,y:356},{x:612,y:384},{x:612,y:384},{x:613,y:386},{x:613,y:386},{x:618,y:393},{x:618,y:393},{x:620,y:395},{x:620,y:395},{x:620,y:396},{x:620,y:396},{x:621,y:396},{x:621,y:396},{x:620,y:396},{x:620,y:396},{x:618,y:396},{x:618,y:396},{x:602,y:396},{x:602,y:396},{x:583,y:397},{x:583,y:397},{x:559,y:399},{x:559,y:399},{x:534,y:400},{x:534,y:400},{x:509,y:400},{x:509,y:400},{x:501,y:400},{x:501,y:400},{x:488,y:400},{x:488,y:400},{x:478,y:400},{x:478,y:400},{x:469,y:400},{x:469,y:400},{x:467,y:400},{x:467,y:400},{x:467,y:399},{x:467,y:399},{x:467,y:397}]
    circle = [
        {x:512,y:332},{x:511.9,y:331.9},{x:511.9,y:331.9},{x:512,y:332},{x:512,y:332},{x:512,y:332},{x:512,y:332},{x:510,y:332},{x:510,y:332},{x:502,y:332},{x:502,y:332},{x:496,y:332},{x:496,y:332},{x:490,y:334},{x:490,y:334},{x:485,y:336},{x:485,y:336},{x:470,y:346},{x:470,y:346},{x:465,y:352},{x:465,y:352},{x:456,y:364},{x:456,y:364},{x:452,y:371},{x:452,y:371},{x:447,y:387},{x:447,y:387},{x:446,y:398},{x:446,y:398},{x:445,y:409},{x:445,y:409},{x:447,y:431},{x:447,y:431},{x:452,y:440},{x:452,y:440},{x:458,y:449},{x:458,y:449},{x:479,y:464},{x:479,y:464},{x:487,y:468},{x:487,y:468},{x:497,y:470},{x:497,y:470},{x:505,y:471},{x:505,y:471},{x:515,y:472},{x:515,y:472},{x:524,y:472},{x:524,y:472},{x:536,y:469},{x:536,y:469},{x:541,y:467},{x:541,y:467},{x:550,y:462},{x:550,y:462},{x:559,y:457},{x:559,y:457},{x:567,y:451},{x:567,y:451},{x:574,y:446},{x:574,y:446},{x:580,y:440},{x:580,y:440},{x:586,y:433},{x:586,y:433},{x:591,y:425},{x:591,y:425},{x:597,y:411},{x:597,y:411},{x:599,y:401},{x:599,y:401},{x:599,y:390},{x:599,y:390},{x:599,y:381},{x:599,y:381},{x:596,y:371},{x:596,y:371},{x:591,y:363},{x:591,y:363},{x:584,y:355},{x:584,y:355},{x:577,y:349},{x:577,y:349},{x:569,y:343},{x:569,y:343},{x:561,y:337},{x:561,y:337},{x:553,y:333},{x:553,y:333},{x:545,y:329},{x:545,y:329},{x:538,y:327},{x:538,y:327},{x:529,y:326},{x:529,y:326},{x:521,y:326},{x:521,y:326},{x:512,y:326},{x:512,y:326},{x:507,y:326},{x:507,y:326},{x:499,y:326},{x:499,y:326},{x:496,y:326},{x:496,y:326},{x:495,y:326},{x:495,y:326},{x:495,y:326}]
    ftriangle = triangle
    fcircle = circle
    Part.shape_to_parts(split_shape(triangle), 'tri')
    Part.shape_to_parts(split_circle(circle), 'cir')

    ffont = build_font()
    ffont.weight = curr_weight
    let dy = ffont.display(display_space)

    cont.style.height = dy + cap_height + 50 + 'px'
    parts = {}
    canvas_resize(1)
}

window.onload = onload()

function update() {
    ffont = build_font()
    ffont.weight = curr_weight
    cont.style.height = ''
    window.offsetHeight
    display_space.height = innerHeight * 3
    display_space.width = innerWidth
    let dy = ffont.display(display_space)

    cont.style.height = dy + cap_height + 50 + 'px'
}


// FIXME: drawing on other canavas.

function chng_weight(e) {
    //canvas_resize(0)
    Part.shape_to_parts(split_shape(triangle), 'tri')
    Part.shape_to_parts(split_circle(circle), 'cir')

    ffont = build_font()
    switch (e.textContent) {
        case 'thin':
            ffont.weight = 3
            break;
        case 'regular':
            ffont.weight = 8
            break;
        case 'medium':
            ffont.weight = 13
            break;
        case 'bold':
            ffont.weight = 18
            break;
        case 'black':
            ffont.weight = 25
            break;
    }

    if (!typed) {
        cont.style.height = ''
        window.offsetHeight
        display_space.height = innerHeight * 3
        display_space.width = innerWidth
        let dy = ffont.display(display_space)

        cont.style.height = dy + cap_height + 50 + 'px'
    } else {
        cleared = true
        print(last_typed)
    }

    curr_weight = ffont.weight

    document.querySelector('.type-page .selected').classList.remove('selected')
    e.classList.add('selected')
}

function scrollTo(hash) {
    location.hash = "#" + hash;
}

let typed = false
let cleared = true
let start = 100
let last_typed = ''

input.addEventListener('input', in_print);

function in_print(e) {
    print(e.target.value)
}

function print(string) {
    //canvas_resize(0)
    cont.style.width = ''
    window.offsetHeight
    if (cleared) {
        ds.clearRect(0, 0, display_space.width, display_space.height)
        start = 100
        //cleared = false
    }
    start = ffont.print(100, string, display_space)
    console.log(start);
    cont.style.width = start + cap_height + 50 + 'px'
    cont.style.height = ''
    typed = true
    last_typed = string
}

window.onbeforeunload = function () {
    window.scrollTo(0, 0)
}

function redo() {
    if (count < 3) {
        clear_canvas()
        if (count == 2) draw_guidelines()
    } else {
        count = -1
        analyze()
        canvas_resize(1)
    }
}

function submit() {
    analyze()
}

function reset() {
    typed = false
    input.value = ''
    let ft = (count > 1) ? triangle : ftriangle
    let fc = (count > 1) ? circle : fcircle
    canvas_resize(0)
    cont.style.height = ''
    cont.style.width = ''
    display_space.height = innerHeight * 3
    display_space.width = innerWidth
    ds.clearRect(0, 0, display_space.width, display_space.height)

    Part.shape_to_parts(split_shape(ft), 'tri')
    Part.shape_to_parts(split_circle(fc), 'cir')

    ffont = build_font()
    ffont.weight = curr_weight
    let dy = ffont.display(display_space)
    window.offsetHeight

    cont.style.height = dy + cap_height + 50 + 'px'
    parts = {}
    canvas_resize(1)
}
