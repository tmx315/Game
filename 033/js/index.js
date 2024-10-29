var n = 0;
// 获取小鸟图片
var flybird = $(".bird").get(0);
// 创建一个小鸟对象
var flyBird = {
    stepx: 52, // 加速度
    stepy: 0,
    x: flybird.offsetLeft,
    y: flybird.offsetTop
}
//定义一个变量  用来存放分数的
var count = 0;
// z
var timer = setInterval(function() {
    // 背景图移动
    // 往左滚动 所以是-n + "px"
    $('.sky_img').css({
        'background-position': -n + 'px',
    });
    n += 5;

    // 小鸟运动

    // 加速度
    flyBird.stepy += 1;
    // 小鸟距离上面的距离
    flyBird.y += flyBird.stepy;
    if (flyBird.stepy >= 10) {
        flyBird.stepy = -10,
            flyBird.y += flyBird.stepy;
    }
    $(flybird).css("top", flyBird.y + "px")

}, 20);
var flying = true;

// 点击开始游戏
$(".h2").click(function() {
    $(".h2").hide();
    // 停止开场动画
    clearInterval(timer);
    // 小鸟运动
    flyBird.stepy = 0;
    setInterval(function() {
        if (flying) {
            $('.sky_img').css({
                'background-position': -n + 'px',
            });
            n += 5;
            flyBird.y += flyBird.stepy;
            flyBird.stepy += 1;
            flyBird.x = flyBird.stepx;
            //碰到上边死亡
            if (flyBird.y <= 0) {
                flying = false;
                $(".mask").css("display", "block");
                $(".sucess").css("display", "block")
                $(".score").css("display", "none")
            }
            //碰到下边死亡
            if (flyBird.y >= 600) {
                flying = false;
                $(".mask").css("display", "block");
                $(".sucess").css("display", "block")
                $(".score").css("display", "none")
            }
            $(flybird).css("top", flyBird.y + "px");
            $(flybird).css("left", flyBird.x + "px");
        }
    }, 30)


    // 绑定鼠标点击事件
    $('.sky_img').click(function() {
        flyBird.stepy = -10;
    });
    // 键盘空格键
    $(document).keydown(function(e) {
        if (e.keycode == undefined) {
            flyBird.stepy = -10;
        }
    });

    // // 创建柱子

    var createzz = function(x) {
        // 创建柱子对象
        var zz = {
            x: x, //距离左边
            upHeight: 0, //上面柱子高度
            downHeight: 0 //下面柱子高度
        }
        zz.x = x;
        // 随机生成上面柱子高度
        zz.upHeight = Math.floor(Math.random() * 200 + 50);
        // 下面柱子高度 = 总高度-中间空余空间-上面柱子高度
        zz.downHeight = 600 - 150 - zz.upHeight;

        // 创建上面柱子
        var upDiv = document.createElement("div");
        console.log(upDiv);
        $(upDiv).css({
            "position": "absolute",
            "height": zz.upHeight + "px",
            "width": "52px",
            "left": zz.x + "px",
            "top": 0,
            "background": "url(img/pipe2.png) no-repeat center bottom"
        });
        $('.sky_img').append($(upDiv));

        // 创建下面柱子
        var downDiv = document.createElement("div");
        $(downDiv).css({
            "position": "absolute",
            "height": zz.downHeight + "px",
            "width": "52px",
            "left": zz.x + "px",
            "top": zz.upHeight + 150 + "px",
            "background": "url(img/pipe1.png) no-repeat"
        });
        $('.sky_img').append($(downDiv));

        // 移动柱子
        function Movezz() {
            if (flying) {
                // 柱子往左移动 一次5px
                zz.x -= 5;
                // 上下柱子移动
                $(upDiv).css("left", zz.x + "px");
                $(downDiv).css("left", zz.x + "px");
                if (zz.x <= -52) {
                    zz.x = 1800;
                }
                //判断小鸟是否飞过柱子
                if (zz.x >= 0 && flyBird.x >= zz.x + 52) {
                    count++;
                    $(".score").html(count);
                    $(".results").html(count);
                }

                var ucheck = flyBird.x + 30 > zz.x && flyBird.x < zz.x + 52 && flyBird.y <= zz.upHeight;
                var dcheck = flyBird.x + 30 > zz.x && flyBird.x < zz.x + 52 && flyBird.y + 30 >= zz.downHeight + 150;
                if (ucheck || dcheck) {
                    flying = false;
                    $(".mask").css("display", "block");
                    $(".sucess").css("display", "block")
                    $(".score").css("display", "none")
                }
            }
        }
        var zztimer = setInterval(Movezz, 30);
    }
    createzz(300);
    createzz(600);
    createzz(900);
    createzz(1200);
    createzz(1500);
    createzz(1800);

//重新开始游戏
    $(".return").click(function() {
        location.href = "index.html";
    })
});
