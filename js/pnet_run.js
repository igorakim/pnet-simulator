var RunList = [];
var RunIcon = null;
var ExitRun = false;    // Нажата кнопка "СТОП", т.е.(выйти из симуляции)
var IsRunning = false;
var AnimateDelay = 500;

function StartRun() {
    IsRunning = true;
    ExitRun = false;
    RunIcon = new RunIconInitialize(AnimateDelay);
    Run();
}
function StopRun() {
    ExitRun = true;
    IsRunning = false;
}
//function ResetRun() {
//    IsRunning = false;
//    RunIcon = null;
//    RunList = [];
//}

function Run()
{
    RunList = [];
    Object.keys(Places).forEach(function (key, ind) { Places[key].tokens_count = Places[key].tokens.length; });

    if (!ExitRun) {
        Object.keys(Trans).forEach(function (key, ind) {        // Цикл по ключам переходов
            var arcsIn = get_arcsIn(key);
            if (ready_toFire(arcsIn)) {
                var run_item = {};
                run_item.tran = Trans[key];
                run_item.arcsIn = arcsIn;
                run_item.arcsOut = get_arcsOut(key);
                run_item.temp_tokens = [];
                RunList.push(run_item);
            }
        });
        animate_list();
    }
    else
    {
        RunIcon.remove();
    }
}

function animate_list()
{
    animate1();
    RunIcon.animate1();     //Delay(1) using animation
}
function animate1()
{
    RunList.forEach(function (run_item, ind) {
        run_item.arcsIn.forEach(function (arc, ind) {			                            
            if (arc.from.tokens.length > 0)
            {
                var animation = Raphael.animation(new XY(arcX2(arc), arcY2(arc)), AnimateDelay, "easeIn");
                var ttoken = arc.from.tokens.pop();                                           // Взять токен
                if (typeof ttoken != "undefined" && ttoken.hasOwnProperty('type'))            // Надо проверить на случай > 10
                {
                    ttoken.remove();                                                          // Можно удалить
                }
                ttoken = paper.circle(arcX1(arc), arcY1(arc), TN_RADIUS).attr(token_attr);            // Добавить токен для анимации
                redraw_tokens(arc.from, arc.from.x, arc.from.y);
                run_item.temp_tokens.push(ttoken);                                            //  и переместить во временный массив
                run_item.temp_tokens[run_item.temp_tokens.length - 1].animate(animation);     // Теперь анимируем
            }
        });
    });
}
function animate2()
{
    RunList.forEach(function (run_item, ind) {
        run_item.temp_tokens.forEach(function (token, ind) { token.remove(); });
        run_item.temp_tokens = [];
        run_item.arcsOut.forEach(function (arc, ind) {			
            //var token = paper.circle(run_item.tran.x, run_item.tran.y, 3).attr(token_attr);
            //var animation = Raphael.animation(new XY(arc.to.x, arc.to.y + 10), AnimateDelay, "easeIn");
            var token = paper.circle(arcX1(arc), arcY1(arc), TN_RADIUS).attr(token_attr);
            var animation = Raphael.animation(new XY(arcX2(arc), arcY2(arc)), AnimateDelay, "easeIn");
            run_item.temp_tokens.push(token);
            token.animate(animation);
        });
    });
    RunIcon.animate2();     //Delay(2) using animation
}
function animate3() {
    RunList.forEach(function (run_item, ind) {
        run_item.temp_tokens.forEach(function (token, ind) { token.remove(); });
        run_item.temp_tokens = [];
        run_item.arcsOut.forEach(function (arc, ind) {			// 
            AddToken(arc.to);
        });
    });
    Run();
}

//Updated: 3.02.2017
function ready_toFire(arcsIn) {
    var isReady = true;
    arcsIn.forEach(function (item, ind) {
        if (item.from.tokens_count <= 0) {
            isReady = false;
        }
        else {
            item.from.tokens_count--;
        }
    });
    if (!isReady) { //Если неудачно, то восстановить токены
        arcsIn.forEach(function (item, ind) { item.from.tokens_count = item.from.tokens.length; });
    }
    return isReady;
}

function get_arcsIn(key)
{
    var arcsIn = [];
    Arcs.forEach(function (item, index) {
        if (item.to.key == key) {
            arcsIn.push(item);
        }
    });
    return arcsIn;
}
function get_arcsOut(key) {
    var arcsOut = [];
    Arcs.forEach(function (item, index) {
        if (item.from.key == key) {
            arcsOut.push(item);
        }
    });
    return arcsOut;
}
function RunIconInitialize(delay)
{
    var x = 25;
    var y = PAPER_HEIGHT - 10;
    var width = 40;
    var height = 2;
    var r = 4;

    this.img = paper.circle(x, y, r).attr({"fill":"red", "stroke":"red"});
    this.animation1 = Raphael.animation(new XY(x + width, y), delay, "easyin", animate2);
    this.animation2 = Raphael.animation(new XY(x, y), delay, "easyin", animate3);
    this.animate1 = function () { this.img.animate(this.animation1); };
    this.animate2 = function () { this.img.animate(this.animation2); };

    //this.img1 = paper.rect(x - height / 2, y - height / 2, 1, height).attr("stroke", "gray");
    //this.img2 = paper.rect(x + width, y - height / 2, 1, height).attr("fill", "gray");
    //this.img3 = paper.path("M" + x + "," + y + " L" + (x + width) + "," + y).attr({ "stroke":"gray", "stroke-width":"1" });

    //this.text = paper.text(x, y-10, "Running...").attr({ "fill": "blue", "font-size": "12", "font-family": "Courier New", "text-anchor" : "start" });

    this.remove = function () {
        this.img.remove();
        //this.img1.remove();
        //this.img2.remove();
        //this.img3.remove();
        //this.text.remove();
    };
}

function arcX1(arc) {
    return arc.img.attrs.path[0][1];
}
function arcY1(arc) {
    return arc.img.attrs.path[0][2];
}
function arcX2(arc) {
    return arc.img.attrs.path[1][1];
}
function arcY2(arc) {
    return arc.img.attrs.path[1][2];
}
