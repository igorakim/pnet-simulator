var PAPER_WIDTH = 900;
var PAPER_HEIGHT = 600;
//Считаем, что "paper" определен глобально
var place_attr = { "fill": "orange", "stroke": "brown", "stroke-width": "2" };
var trans_attr = { "fill": "green", "stroke": "brown", "stroke-width": "2" };
var token_attr = { "fill": "black", "stroke": "black", "stroke-width": "0" };
var drag_on_attr = { "stroke": "red", "stroke-width": "4" };
var drag_off_attr = { "stroke": "brown", "stroke-width": "2" };
var arrow_head_attr = { "stroke": "brown", "stroke-width": "3", "arrow-end": "block-wide-long" };
var text_attr = { "fill": "blue", "font-size": "14", "font-family": "Courier New" };
var text_attr_tn = { "fill": "white", "font-size": "12", "font-family": "Arial", "font-weight": "bold" };
var sel_attr = { "stroke": "red", "stroke-width": "4" };

var TR_WIDTH = 10;
var TR_HEIGHT = 50;
var PL_RADIUS = 25;
var TN_RADIUS = 4;
var ARC_SHORT = PL_RADIUS + 2;
var ARC_TYPE = 2;
var DOUBLE_SHIFT = 10;
var TEMP_ARC = { from: null, x: 0, y: 0, img: null };
var TEMP_ARC_ON = false;

var Places = {};
var Trans = {};
var Arcs = [];
var Selected = null;

function graph_loaded()
{
    if (Object.keys(Places).length > 0 && Object.keys(Trans).length > 0)
        return true;
    else
        return false;
}


function ResetPnet() {
    Places = {};
    Trans = {};
    Arcs = [];
}

function NewPlace(x, y)
{
    AddPlace("P" + next_key(Places), x, y, 0);
}
function NewTransition(x, y) {
    AddTransition("T" + next_key(Trans), x, y);
}
function next_key(nodes)
{
    var last_key = 0;
    var keys = Object.keys(nodes);
    if (keys.length > 0) {
        var last_key = parseInt(keys[keys.length - 1].slice(1));
    }
    return last_key + 1;
}
function select_object(object)
{
    clear_selection();
    switch (object.type) {
        case "circle":
            select_circle(object);
            break;
        case "rect":
            select_rect(object);
            break;
        case "path":
            select_path(object);
            break;
        default:
    }
}
function select_circle(object)
{
    var x = object.x;
    var y = object.y;

    var r1 = paper.rect(x - PL_RADIUS, y - PL_RADIUS / 2 - 3, 2 * PL_RADIUS, PL_RADIUS + 6).attr({ "stroke": "white", "stroke-width": "4" }).toBack();
    var r2 = paper.rect(x - PL_RADIUS / 2 - 3, y - PL_RADIUS, PL_RADIUS + 6, 2 * PL_RADIUS).attr({ "stroke": "white", "stroke-width": "4" }).toBack();
    var r3 = paper.rect(x - PL_RADIUS, y - PL_RADIUS, 2 * PL_RADIUS, 2 * PL_RADIUS).attr(sel_attr).toBack();
    Selected = paper.set();
    Selected.push(r1);
    Selected.push(r2);
    Selected.push(r3);
    Selected.node = object;
    type_selected(Selected.node.key);
}
function select_rect(object)
{
    var x = object.x;
    var y = object.y;
    var w = object.attr("width");
    var h = object.attr("height");
    var r1 = paper.rect(x - TR_WIDTH-5, y - TR_HEIGHT / 2+5, w + 20, h - 10).attr({ "stroke": "white", "stroke-width": "4" }).toBack();
    var r2 = paper.rect(x - 8, y - TR_HEIGHT / 2-5, w + 6, h + 10).attr({ "stroke": "white", "stroke-width": "4" }).toBack();
    var r3 = paper.rect(x - TR_WIDTH * 1.5, y - TR_HEIGHT/2-5, w + 20, h + 10).attr(sel_attr).toBack();
    Selected = paper.set();
    Selected.push(r1);
    Selected.push(r2);
    Selected.push(r3);
    Selected.node = object;
    type_selected(Selected.node.key);
}
function select_path(object)
{
    var path = object.attr("path");
    x1 = path[0][1];
    y1 = path[0][2];
    x2 = path[1][1];
    y2 = path[1][2];
    var arcSelAttr = { "fill": "yellow", "stroke": "red" };
    var sel_size = 10;
    Selected = paper.set();
    var rect1 = paper.rect(x1 - sel_size / 2, y1 - sel_size / 2, sel_size, sel_size).attr(arcSelAttr);
    var rect2 = paper.rect(x2 - 2, y2 - sel_size / 2, sel_size, sel_size).attr(arcSelAttr);
    Selected.push(rect1);
    Selected.push(rect2);
    Selected.node = object;
    type_selected(object.keys[0] + "," + object.keys[1]);
}
function unselect() {
    clear_selection();
    type_selected("&nbsp;");
}
function type_selected(text)
{
    var selected_label = document.getElementById("selected_label");
    if (selected_label != null)
        selected_label.innerHTML = text;
}
function clear_selection()
{
    if (Selected != null)
    {
        Selected.remove();
        Selected = null;
    }
}
function RemoveObject()
{
    if (Selected == null) return;
    var obj = Selected.node;
    var key = obj.key;

    switch (obj.type) {
        case "circle":
            remove_tokens(obj);
            remove_node(obj);
            delete Places[key];
            break;
        case "rect":
            remove_node(obj);
            delete Trans[key];
            break;
        case "path":
            remove_arc(obj.keys[0], obj.keys[1]);
            break;
        default:
    }

    if (Selected != null)
    {
        clear_selection();
    }
}
function remove_node(node)
{
    var key = Selected.node.key;
    for (var i = Arcs.length - 1; i >= 0; i--) {
        if (Arcs[i].from.key === key || Arcs[i].to.key === key) {
            Arcs[i].img.remove();
            Arcs.splice(i, 1);
        }
    }
    node.caption.remove();
    node.remove();
}
function remove_arc(key1, key2)
{
    for(var i = Arcs.length - 1; i >= 0; i--)
    {
        if((Arcs[i].from.key == key1 && Arcs[i].to.key == key2) || (Arcs[i].from.key == key2 && Arcs[i].to.key == key1))
        {
            Arcs[i].img.remove();
            Arcs.splice(i, 1);
        }

    }
}

function AddPlace(key, x, y, tokens)
{
    var place = paper.circle(x, y, PL_RADIUS).attr(place_attr);
    place.drag(drag_move, drag_start, drag_end);
    place.click(place_click);
    place.mouseup(place_mouseup);
    place.x = x;
    place.y = y;
    place.dx = 0;
    place.dy = 0;
    place.key = key;
    place.tokens = new Array(tokens);
    place.tokens_count = 0;
    place.caption = draw_text(key, x, y);
	place.pnString = function() { return this.key + "," + this.x + "," + this.y + "," + this.tokens.length; }
    draw_tokens(place);
    Places[key] = place;
    return place;
}
function place_click(e) {
    select_object(this);
}
function place_mouseup(e)
{
    node_mouseup(this, e.ctrlKey);
}
function transition_mouseup(e)
{
    node_mouseup(this, e.ctrlKey);
}
function node_mouseup(node, ctrlKey) {
    if (ctrlKey && TEMP_ARC_ON) {
        TEMP_ARC.img.remove();
        AddArc(TEMP_ARC.from, node);
    }
}

function AddTransition(key, x, y)
{
    var transition = paper.rect(x - TR_WIDTH / 2, y - TR_HEIGHT/2, TR_WIDTH, TR_HEIGHT).attr(trans_attr);
    transition.drag(drag_move, drag_start, drag_end);
    transition.click(transition_click);
    transition.mouseup(transition_mouseup);
    transition.x = x;
    transition.y = y;
    transition.key = key;
    transition.caption = draw_text(key, x, y);
	transition.pnString = function() { return this.key + "," + this.x + "," + this.y}
    Trans[key] = transition;
    return transition;
}
function XY(x, y)
{
	this.cx = x;
	this.cy = y;
}
function transition_click(e) {
    select_object(this);
}

function AddArc(node1, node2) {
    var arc = null;
    if (node1 != null && node2 != null && node1.key.substr(0, 1) != node2.key.substr(0, 1))
    {
        arc = { isDouble: false };
        if (already_arc(node1.key, node2.key)) {
            arc.isDouble = true;
        }

        arc.img = draw_arc(node1.x, node1.y, node2.x, node2.y, arc.isDouble);
        arc.from = node1;
        arc.to = node2;
        arc.img.click(arc_click);
        arc.img.keys = [node1.key, node2.key];
        arc.pnString = function () { return this.from.key + "," + this.to.key; }
        Arcs.push(arc);
    }
    return arc;
}

function already_arc(key1, key2) {
    var count = 0;
    Arcs.forEach(function (arc, ind) {
        if ((arc.from.key == key1 && arc.to.key == key2) || (arc.from.key == key2 && arc.to.key == key1)) {
            //console.log(arc);
            count++;
        }
    });
    if (count > 0) { return true; }
    else { return false; }
}

function set_arc(arc_img)
{
    var path = arc_img.attr("path");
    arc_img.pn = {};
    arc_img.pn.x1 = path[0][1];
    arc_img.pn.y1 = path[0][2];
    arc_img.pn.x2 = path[1][1];
    arc_img.pn.y2 = path[1][2];
    arc_img.click(arc_click);
}
function arc_click() {
    select_object(this);
}

function drag_start(x, y, e)
{
    if (!e.ctrlKey)
    {
        clear_selection();
        this.current_transform = this.transform();
        this.attr(drag_on_attr);
    }
    else
    {
        TEMP_ARC.x = this.x;
        TEMP_ARC.y = this.y;
        TEMP_ARC.from = this;
    }
}
function drag_move(dx, dy, x, y, e)
{
    if (!e.ctrlKey) {
        this.dx = dx;
        this.dy = dy;
        this.transform(this.current_transform + "T" + dx + ',' + dy);
        redraw_text(this, this.x + dx, this.y + dy, this.key);
        redraw_Arcs(this, this.x + dx, this.y + dy, 7);
        if (typeof this.tokens != "undefined" && this.tokens.length > 0) {
            redraw_tokens(this, this.x + dx, this.y + dy);
        }
    }
    else
    {
        if (TEMP_ARC.img != null) TEMP_ARC.img.remove();
        if (Math.abs(TEMP_ARC.x - this.x + dx) > PL_RADIUS)
        {
            TEMP_ARC.img = paper.arc(TEMP_ARC.x, TEMP_ARC.y, this.x + dx, this.y + dy, 7);
            TEMP_ARC_ON = true;
        }
    }
}
function drag_end(e)
{
    if (!e.ctrlKey) {
        this.x += parseInt(this.dx) || 0;
        this.y += parseInt(this.dy) || 0;
        this.dx = 0;    //Reset transform
        this.dy = 0;
        this.current_transform = this.transform();
        this.attr(drag_off_attr);
    }
}

function arrow_arc(x1, y1, x2, y2, dd)                  //Отрисовка дуги средствами Рафаеля
{
    var R = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    var r = R - dd;
    var dx = ((x2 - x1) * r) / R;
    var dy = ((y2 - y1) * r) / R;
    var a1 = x2 - dx;
    var b1 = y2 - dy;
    var a2 = x1 + dx;
    var b2 = y1 + dy;
    var a = paper.path("M" + a1 + "," + b1 + " L" + a2 + "," + b2);
    return a;
}
function draw_arc(x1, y1, x2, y2, isDouble)       // Рисует дугу
{
    if (isDouble == true) {
        y1 += DOUBLE_SHIFT;
        y2 += DOUBLE_SHIFT;
    }
    if (ARC_TYPE == 1)
    {
        var arc = paper.arc(x1, y1, x2, y2, 7);
    }
    else
    {
        var arc = arrow_arc(x1, y1, x2, y2, ARC_SHORT).attr(arrow_head_attr);
    }
    return arc;
}
function redraw_Arcs(node, x, y)
{
    Arcs.forEach(function (arc, index)
    {
        var keys = null;
        if (arc.from.key == node.key)
        {
            keys = arc.img.keys;
            arc.img.remove();
            arc.img = draw_arc(x, y, arc.to.x, arc.to.y, arc.isDouble);
            arc.img.keys = keys;
            arc.img.click(arc_click);
        }
        else if (arc.to.key == node.key)
        {
            keys = arc.img.keys;
            arc.img.remove();
            arc.img = draw_arc(arc.from.x, arc.from.y, x, y, arc.isDouble);
            arc.img.keys = keys;
            arc.img.click(arc_click);
        }

    });
}

function draw_text(text, x, y) {
    return paper.text(x, y - PL_RADIUS - 10, text).attr(text_attr);
}
function redraw_text(node, x, y, text) {
    node.caption.remove();
    node.caption = draw_text(text, x, y)
}

function AddToken(place) {
    remove_tokens(place);
    place.tokens.push({});
    draw_tokens(place);
}
function RemoveToken(place) {
    if (place.tokens.length > 0) {
        remove_tokens(place);
        place.tokens.pop();
        draw_tokens(place);
    }
}
function draw_tokens(node) {
    place_tokens(node.tokens, node.x, node.y, TN_RADIUS);
}
function place_tokens(tokens, x, y, r) {
    var d = r + 1;

    if (tokens.length == 1) {
        tokens[0] = paper.circle(x, y, r).attr(token_attr);
    }
    if (tokens.length == 2) {
        tokens[0] = paper.circle(x - d, y, r).attr(token_attr);
        tokens[1] = paper.circle(x + d, y, r).attr(token_attr);
    }
    if (tokens.length == 3) {
        tokens[0] = paper.circle(x, y - r, r).attr(token_attr);
        tokens[1] = paper.circle(x - d, y + d, r).attr(token_attr);
        tokens[2] = paper.circle(x + d, y + d, r).attr(token_attr);
    }
    if (tokens.length == 4) {
        tokens[0] = paper.circle(x - d, y - d, r).attr(token_attr);
        tokens[1] = paper.circle(x + d, y - d, r).attr(token_attr);
        tokens[2] = paper.circle(x - d, y + d, r).attr(token_attr);
        tokens[3] = paper.circle(x + d, y + d, r).attr(token_attr);
    }
    if (tokens.length == 5) {
        d = r + 3;
        tokens[0] = paper.circle(x - d, y - d, r).attr(token_attr);
        tokens[1] = paper.circle(x + d, y - d, r).attr(token_attr);
        tokens[2] = paper.circle(x - d, y + d, r).attr(token_attr);
        tokens[3] = paper.circle(x + d, y + d, r).attr(token_attr);
        tokens[4] = paper.circle(x, y, r).attr(token_attr);
    }
    if (tokens.length == 6) {
        d = r + 1;
        tokens[0] = paper.circle(x - 2 * d, y - d, r).attr(token_attr);
        tokens[1] = paper.circle(x + 0 + 0, y - d, r).attr(token_attr);
        tokens[2] = paper.circle(x + 2 * d, y - d, r).attr(token_attr);
        tokens[3] = paper.circle(x - 2 * d, y + d, r).attr(token_attr);
        tokens[4] = paper.circle(x + 0 + 0, y + d, r).attr(token_attr);
        tokens[5] = paper.circle(x + 2 * d, y + d, r).attr(token_attr);
    }
    if (tokens.length == 7) {
        d = r + 1;
        tokens[0] = paper.circle(x - 2 * d, y - d, r).attr(token_attr);
        tokens[1] = paper.circle(x + 0 + 0, y - 2 * d, r).attr(token_attr);
        tokens[2] = paper.circle(x + 2 * d, y - d, r).attr(token_attr);
        tokens[3] = paper.circle(x - 2 * d, y + d, r).attr(token_attr);
        tokens[4] = paper.circle(x + 0 + 0, y, r).attr(token_attr);
        tokens[5] = paper.circle(x + 2 * d, y + d, r).attr(token_attr);
        tokens[6] = paper.circle(x, y + 2 * d, r).attr(token_attr);
    }
    if (tokens.length == 8) {
        d = r + 1;
        tokens[0] = paper.circle(x - 2 * d, y - d, r).attr(token_attr);
        tokens[1] = paper.circle(x + 0 + 0, y - d, r).attr(token_attr);
        tokens[2] = paper.circle(x + 2 * d, y - d, r).attr(token_attr);
        tokens[3] = paper.circle(x - 2 * d, y + d, r).attr(token_attr);
        tokens[4] = paper.circle(x + 0 + 0, y + d, r).attr(token_attr);
        tokens[5] = paper.circle(x + 2 * d, y + d, r).attr(token_attr);
        tokens[6] = paper.circle(x, y - 3 * d, r).attr(token_attr);
        tokens[7] = paper.circle(x, y + 3 * d, r).attr(token_attr);
    }
    if (tokens.length == 9) {
        d = r + 1;
        tokens[0] = paper.circle(x - 2 * d, y - d, r).attr(token_attr);
        tokens[1] = paper.circle(x + 0 + 0, y - d, r).attr(token_attr);
        tokens[2] = paper.circle(x + 2 * d, y - d, r).attr(token_attr);
        tokens[3] = paper.circle(x - 2 * d, y + d, r).attr(token_attr);
        tokens[4] = paper.circle(x + 0 + 0, y + d, r).attr(token_attr);
        tokens[5] = paper.circle(x + 2 * d, y + d, r).attr(token_attr);
        tokens[6] = paper.circle(x, y - 3 * d, r).attr(token_attr);
        tokens[7] = paper.circle(x - d, y + 3 * d, r).attr(token_attr);
        tokens[8] = paper.circle(x + d, y + 3 * d, r).attr(token_attr);
    }
    if (tokens.length == 10) {
        d = r + 1;
        tokens[0] = paper.circle(x - 2 * d, y - d, r).attr(token_attr);
        tokens[1] = paper.circle(x + 0 + 0, y - d, r).attr(token_attr);
        tokens[2] = paper.circle(x + 2 * d, y - d, r).attr(token_attr);
        tokens[3] = paper.circle(x - 2 * d, y + d, r).attr(token_attr);
        tokens[4] = paper.circle(x + 0 + 0, y + d, r).attr(token_attr);
        tokens[5] = paper.circle(x + 2 * d, y + d, r).attr(token_attr);
        tokens[6] = paper.circle(x - d, y - 3 * d, r).attr(token_attr);
        tokens[7] = paper.circle(x + d, y - 3 * d, r).attr(token_attr);
        tokens[8] = paper.circle(x - d, y + 3 * d, r).attr(token_attr);
        tokens[9] = paper.circle(x + d, y + 3 * d, r).attr(token_attr);
    }
    if (tokens.length > 10) {
        var tn = paper.set();
        tn.push(paper.circle(x, y, 15).attr(token_attr));
        tn.push(paper.text(x, y, tokens.length.toString()).attr(text_attr_tn));
        tokens[0] = tn;
    }
}
function redraw_tokens(node, x, y) {
    remove_tokens(node);
    place_tokens(node.tokens, x, y, TN_RADIUS);
}
function remove_tokens(node) {
    for (i = 0; i < node.tokens.length; i++) {
        if (typeof node.tokens[i] != "undefined" && node.tokens[i].hasOwnProperty('type')) {
            node.tokens[i].remove();
        }
        else {
            break;
        }
    }
}
function getByKey(key) {
    if (key.charAt(0) == "P")
        return Places[key];
    if (key.charAt(0) == "T")
        return Trans[key];
    return null;
}
