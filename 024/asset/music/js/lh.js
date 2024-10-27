var lh={
  //==========系统==========
    //引入js和css
    load(sel=null){
      let need=[
        {name:'axios',content:'<script type="text/javascript" src="asset/js/axios.min.js"></script>'},
        {name:'animate',content:'<link rel="stylesheet" href="asset/css/animate.min.css" />'},
        {name:'anime',content:'<script type="text/javascript" src="asset/js/anime.min.js"></script>'},
        {name:'vue',content:'<script type="text/javascript" src="asset/js/vue/vue.global.prod.js"></script>'},
        {name:'element',content:'<link rel="stylesheet" href="asset/js/vue/element/index.css" />'
          +'<script type="text/javascript" src="asset/js/vue/element/index.full.js"></script>'
          +'<script type="text/javascript" src="asset/js/vue/element/zh-cn.js"></script>'},
        {name:'vue-component',content:'<link rel="stylesheet" href="asset/css/component.css" />'
          +'<script type="text/javascript" src="asset/js/component.js"></script>'},
      ]
      for(let i=0;i<need.length;i++){
        if(sel&&sel.indexOf(need[i].name)==-1)continue
        document.write(need[i].content)
      }
    },
    //处理vue element component模块
    vue(App){
      ElementPlus.locale(ElementPlus.lang.zhCn)
      const app=Vue.createApp(App)
      app.use(ElementPlus)
      for(let i=0;i<vueCom.length;i++){
        app.component(vueCom[i].name,vueCom[i].com)
      }
      app.mount("#app")
    },
    //同步get请求 返回json格式的结果
    get(url){
      let xmlhttp=new XMLHttpRequest()
      xmlhttp.open("GET",url,false)
      xmlhttp.send()
      return JSON.parse(xmlhttp.responseText)
    },
    //获取URL参数
    getUrl(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
      var r = window.location.search.substr(1).match(reg);  //匹配目标参数
      if (r != null) return decodeURI(r[2]); return null; //返回参数值
    },
    //跳转
    toUrl(url){
      document.getElementById('app').className = 'animate__animated animate__flipOutY'
      setTimeout(()=>{
        location.href=url
      }, 800)
    },
  //==========坐标==========
    //获取一个点周围4个点
    getFour(xy){
      let xysplit=xy.split(','),x=parseInt(xysplit[0]),y=parseInt(xysplit[1])
      let xx,yy,check=[]
      xx=x;yy=y-1;check.push(xx+','+yy)//上
      xx=x;yy=y+1;check.push(xx+','+yy)//下
      xx=x-1;yy=y;check.push(xx+','+yy)//左
      xx=x+1;yy=y;check.push(xx+','+yy)//右
      return check
    },
    //获取周围一定距离的点(起始 距离)
    getByDis(start,distance){
      let open={},close={}
      open[start]={parent:start,mov:distance}

      let expand=(point)=>{
        //拓展所有open的点,根据移动力消耗去重
        for(let k in point){
          let four=this.getFour(k)
          //获取剩余移动力
          let mov=open[k].mov
          //放入close
          close[k]=JSON.parse(JSON.stringify(open[k]))
          delete open[k]
          //处理拓展的点
          for(let i=0;i<four.length;i++){
            let v=four[i]
            //该点是拓展点的父节点
            if(v==close[k].parent)continue
            //获取移动力消耗
            let cost=1
            //不能到达该点
            if(mov<cost)continue
            //移动力消耗
            let newMov=mov-cost
            //判断是否存在open，对比剩余移动力
            if(open[v]&&newMov>open[v].mov){
              //如果移动力更多，更新移动力和父节点
              open[v].mov=newMov
              open[v].parent=k
            }
            //判断是否存在close，对比剩余移动力
            if(close[v]&&newMov>close[v].mov){
              //如果移动力更多，移入open，更新移动力和父节点
              delete close[v]
              open[v]={mov:newMov,parent:k}
            }
            //不存在open和close，则加入到open
            if(!open[v]&&!close[v])open[v]={mov:newMov,parent:k}
          }
        }
        //如果open还有，则递归
        if(JSON.stringify(open)!='{}'){
          expand(open)
        }
      }

      expand(open)

      let reach=Object.keys(close)
      return reach
    },
    //根据父节点获取起始点到终点的路径
    getPath(from,to,reach){
      //从终点走回起点
      let path=[],next=to
      while(next!=from){
        path.push(next)
        next=reach[next].parent
      }
      path.push(from)
      //数组反向
      return path.reverse()
    },
    //计算两点的距离 
    calDis(from,to){
      let xysplit=to.split(',')
      let tx=parseInt(xysplit[0]),ty=parseInt(xysplit[1])
      xysplit=from.split(',')
      let fx=parseInt(xysplit[0]),fy=parseInt(xysplit[1])
      let distance=Math.abs(tx-fx)+Math.abs(ty-fy)
      return distance
    },
    //计算坐标群中离目标最近的坐标(起始 坐标群)
    calNear(from,group){
      let tarxy,minDis=10000
      for(let i=0;i<group.length;i++){
        let v=group[i]
        let distance=this.calDis(v,from)
        this.calDis(v,from)
        if(distance<minDis){
          minDis=distance
          tarxy=v
        }
      }
      return tarxy
    },
    //计算坐标群中离目标最远的坐标(起始 坐标群)
    calFar(from,group){
      let tarxy,maxDis=0
      for(let i=0;i<group.length;i++){
        let v=group[i]
        let distance=this.calDis(v,from)
        if(distance>maxDis){
          maxDis=distance
          tarxy=v
        }
      }
      return tarxy
    },
    //将坐标路径转换为动画路径
    tranAnime(path){
      let result=[]
      //取出原点
      let from=path[0]
      let newPath=JSON.parse(JSON.stringify(path))
      newPath.splice(0,1)
      for(let i=0;i<newPath.length;i++){
        let v=newPath[i]
        let xysplit=v.split(',')
        let tx=parseInt(xysplit[0]),ty=parseInt(xysplit[1])
        xysplit=from.split(',')
        let fx=parseInt(xysplit[0]),fy=parseInt(xysplit[1])
        //判断方向
        if(tx>fx)result.push('d')
        if(tx<fx)result.push('a')
        if(ty>fy)result.push('s')
        if(ty<fy)result.push('w')
        //修改from
        from=v
      }
      return result
    },
  //==========动画==========
    //移动地图让目标元素在中间
    moveToCenter(xy){
      return new Promise((resolve,reject)=>{
        let element=document.getElementById('grid-x'+xy)
        let posi=this.getPosition(element)
        let tran=this.getTransform(document.getElementById('map'))
        let from={x:posi.x+parseInt(tran.x),y:posi.y+parseInt(tran.y)}
        let to={x:document.body.clientWidth/2,y:document.body.clientHeight/2}
        let move={x:from.x-to.x,y:from.y-to.y}
        let des={x:tran.x-move.x,y:tran.y-move.y}
        anime({
          targets: document.getElementById('map'),
          translateX: des.x,
          translateY: des.y,
          duration: 300,
          easing: 'linear',
          complete:()=>{
            resolve()
          }
        })
      })
    },
    //根据路径播放动画(id 路径 格子大小 事件)
    playAnime(id,path,cell,time=50){
      return new Promise((resolve,reject)=>{
        path=lh.tranAnime(path)
        //路线
        let x=0,y=0,tX=[],tY=[]
        for(let i=0;i<path.length;i++){
          let v=path[i]
          if(v=='w')y-=cell
          if(v=='a')x-=cell
          if(v=='s')y+=cell
          if(v=='d')x+=cell
          tX.push({value: x, duration: time})
          tY.push({value: y, duration: time})
        }
        //动画
        anime({
          targets: document.getElementById(id),
          translateX: tX,
          translateY: tY,
          easing: 'linear',
          complete:()=>{
            resolve()
          }
        })
      })
    },
    //根据两点播放直线动画(id from to 格子大小 速度)
    playStra(id,from,to,cell,time=100){
      let xysplit=from.split(',')
      let fx=parseInt(xysplit[0]),fy=parseInt(xysplit[1])
      xysplit=to.split(',')
      let tx=parseInt(xysplit[0]),ty=parseInt(xysplit[1])
      let x=(tx-fx)*cell,y=(ty-fy)*cell
      return new Promise((resolve,reject)=>{
        anime({
          targets: document.getElementById(id),
          translateX: x,
          translateY: y,
          easing: 'linear',
          duration:time,
          complete:()=>{
            resolve()
          }
        })
      })
    },
  //==========DOM==========
    //鼠标拖拽地图(地图ID)
    addDragMask(mapid){
      let mask = document.createElement('div')
      mask.id='lh-mask'
      mask.style.cssText="width: 100%;height: 100%;position: absolute;top:0;left:0;z-index:10;display: none;cursor:move;";
      document.body.appendChild(mask)
      let dv = document.getElementById(mapid)
      let x = 0
      let y = 0
      let l = 0
      let t = 0
      let isDown = false
      //鼠标按下事件
      dv.onmousedown = function(e) {
        if(e.button!=2){return}
        //调出遮罩层
        document.getElementById('lh-mask').style.display='block'
        
        //获取x坐标和y坐标
        x = e.clientX
        y = e.clientY

        //获取左部和顶部的偏移量
        let temp=dv.style.transform
        if(temp){
          temp=temp.replace('translateX(','')
          temp=temp.replace('translateY(','')
          temp=temp.replaceAll('px)','')
          temp=temp.split(' ')
          l = temp[0]
          t = temp[1]
        }
        //开关打开
        isDown = true
      }
      //鼠标移动
      window.onmousemove = function(e) {
        if (isDown == false) {
            return
        }
        //获取x和y
        var nx = e.clientX
        var ny = e.clientY
        //计算移动后的左偏移量和顶部的偏移量
        var nl = nx - (x - l)
        var nt = ny - (y - t)

        dv.style.transform = 'translateX('+nl + 'px)'+' translateY('+nt + 'px)'
      }
      //鼠标抬起事件
      window.onmouseup = function(e) {
        //隐藏遮罩层
        document.getElementById('lh-mask').style.display='none'

        //开关关闭
        isDown = false
      }
    },
    //WASD移动地图(地图ID)
    moveMap(mapid){
      let dv = document.getElementById(mapid)
      let lock=[false,false,false,false],timer=[]
      //按下事件
      window.onkeydown = function(e) {
        let speed=5,top=0,left=0
        let temp=dv.style.transform
        // if(temp){
        //   temp=temp.replace('translateX(','')
        //   temp=temp.replace('translateY(','')
        //   temp=temp.replaceAll('px)','')
        //   temp=temp.split(' ')
        //   //left = temp[0]
        //   //top = temp[1]
        //   left = parseInt(temp[0])
        //   top = parseInt(temp[1])
        // }
        if(!dv.style.top){
          dv.style.top='0px'
        }else{
          top=parseInt(dv.style.top.replace('px',''))
        }
        if(!dv.style.left){
          dv.style.left='0px'
        }else{
          left=parseInt(dv.style.left.replace('px',''))
        }

        //wasd keyCode,87 65 83 68
        if(e.keyCode==87){
          if(lock[0]){return}
          clearInterval(timer[0])
          timer[0]=setInterval(()=>{
            top+=speed
            dv.style.top=top+'px'
            //dv.style.transform = 'translateX('+left + 'px)'+' translateY('+top + 'px)'
          },10)
          lock[0]=true
        }
        if(e.keyCode==65){
          if(lock[1]){return}
          clearInterval(timer[1])
          timer[1]=setInterval(()=>{
            left+=speed
            dv.style.left=left+'px'
            //dv.style.transform = 'translateX('+left + 'px)'+' translateY('+top + 'px)'
          },10)
          lock[1]=true
        }
        if(e.keyCode==83){
          if(lock[2]){return}
          clearInterval(timer[2])
          timer[2]=setInterval(()=>{
            top-=speed
            dv.style.top=top+'px'
            //dv.style.transform = 'translateX('+left + 'px)'+' translateY('+top + 'px)'
          },10)
          lock[2]=true
        }
        if(e.keyCode==68){
          if(lock[3]){return}
          clearInterval(timer[3])
          timer[3]=setInterval(()=>{
            left-=speed
            dv.style.left=left+'px'
            //dv.style.transform = 'translateX('+left + 'px)'+' translateY('+top + 'px)'
          },10)
          lock[3]=true
        }
      }
      //抬起事件
      window.onkeyup = function(e) {
        //wasd keyCode,87 65 83 68
        if(e.keyCode==87){clearInterval(timer[0])}
        if(e.keyCode==65){clearInterval(timer[1])}
        if(e.keyCode==83){clearInterval(timer[2])}
        if(e.keyCode==68){clearInterval(timer[3])}
        
        //开关关闭
        lock[0] = false
        lock[1] = false
        lock[2] = false
        lock[3] = false
      }
    },
    //获取元素的位置
    getPosition(element) {
      let actualTop = element.offsetTop
      let actualLeft = element.offsetLeft
      let current = element.offsetParent
      while (current !== null) {
        actualTop += current.offsetTop
        actualLeft += current.offsetLeft
        current = current.offsetParent
      }
      let result={x:actualLeft,y:actualTop}
      return result
    },
    //获取元素的transform
    getTransform(element){
      let temp=element.style.transform
      temp=temp.replace('translateX(','')
      temp=temp.replace('translateY(','')
      temp=temp.replaceAll('px)','')
      temp=temp.split(' ')
      let result={x:temp[0],y:temp[1]}
      return result
    },
  //==========其它==========
    //获取两数组的重合元素，按v1的顺序
    getCoin(v1,v2){
      let res=[]
      for(let i=0;i<v1.length;i++){
        if(v2.indexOf(v1[i])!=-1){res.push(v1[i])}
      }
      return res
    },
    //停顿一定时间
    wait(time){
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          resolve()
        },time)
      })
    },
    //播放音效
    playAudio(src,volume){
      window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

      var context = new window.AudioContext();;
      var source = null;
      var audioBuffer = null;

      const gainNode = context.createGain();
      gainNode.gain.value = volume/100; // setting it to 10%
      gainNode.connect(context.destination);

      let stopSound=function() {
        if (source) {
          source.stop(0); //立即停止
        }
      }

      let playSound=function() {
        source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = false; //循环播放
        source.connect(gainNode);
        source.start(0); //立即播放
      }

      let initSound=function(arrayBuffer) {
        context.decodeAudioData(arrayBuffer, function(buffer) { //解码成功时的回调函数
          audioBuffer = buffer;
          playSound();
        }, function(e) { //解码出错时的回调函数
          console.log('Error decoding file', e);
        });
      }

      let loadAudioFile=function(url) {
        var xhr = new XMLHttpRequest(); //通过XHR下载音频文件
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(e) { //下载完成
          initSound(this.response);
        };
        xhr.send();
      }
      
      loadAudioFile(src);
    },
    //得到一个两数之间的随机整数，包括两个数在内
    getRandom(min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min + 1)) + min
    },
}