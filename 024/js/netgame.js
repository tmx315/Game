var lhnet={
  vu:null,
  server:'',
  ws:null,
  id:null,
  user:{},
  owner:null,
  now:0,
  num:0,
  chatTimer:null,
  round:{
    now:0,
    ai:false
  },
  //通行参数
  pass:{
    start:false,
  },
  init(vu){
    this.vu=vu
  },
  //关卡开始前
  beforeBegin(){
    const vu=this.vu
    //连接服务器
    this.server=ipcRenderer.sendSync('getData','server')
    this.ws = new WebSocket('ws://'+this.server)
    let timestamp,timer

    this.ws.onopen=(o=>{
      console.log('服务器连接成功')
      //心跳
      timer=setInterval(()=>{
        timestamp = (new Date()).getTime()
        this.ws.send(JSON.stringify({r:'/main/ping'}))
      },10*1000)
      //加入游戏
      let temp=ipcRenderer.sendSync('getData','netgame')
      let msg={r:'/game/enter',name:temp.name,key:temp.key,hero:temp.hero,now:temp.now,num:temp.num,owner:temp.owner}
      this.ws.send(JSON.stringify(msg))
    })
    this.ws.onmessage=(o=>{
      let res=JSON.parse(o.data)
      //心跳
      if(res.r=='/main/ping'){
        let temp=(new Date()).getTime()
        vu.net.ping=temp-timestamp
        return
      }
      this.onMsg(res)
    })
    this.ws.onclose=(o=>{
      console.log('onclose')
      console.log(o)
      clearInterval(timer)
      vu.$notify({
        title: '提示',
        message: '服务器连接断开',
        duration: 0
      })
    })
    this.ws.onerror=(o=>{
      console.log('onerror')
      console.log(o)
      clearInterval(timer)
      vu.$notify({
        title: '提示',
        message: '发生错误，服务器连接断开',
        duration: 0
      })
    })
    
    //选择关卡
    vu.level='survive'

    //等待玩家到齐
    return new Promise((resolve,reject)=>{
      let timer=setInterval(()=>{
        if(this.pass.start){
          clearInterval(timer)
          resolve()
        }
      },300)
    })
  },
  //socket回复
  async onMsg(o){
    const vu=this.vu
    //功能
      //获取cid
      if(o.r=='/game/cid'){
        this.id=o.data
        return
      }
      //开始初始化
      if(o.r=='/game/start'){
        //获取所有人的数据
        this.owner=o.data.owner
        this.user=o.data.user
        //设置存活
        for(let k in this.user){this.user[k].live=true}
        this.num=o.data.now
        //如果是房主
        if(this.id==this.owner){
          //初始化
          //我方
          let wo=Object.keys(this.user)
          let len=vu.troops.wo.length
          for(let i=0;i<len;i++){
            if(wo[i]){
              vu.troops.wo[i].hero=this.user[wo[i]].hero
              vu.troops.wo[i].name=this.user[wo[i]].name
              vu.troops.wo[i].netid=wo[i]
            }else{
              vu.troops.wo.splice(-1,1)
            }
          }
          //敌方
          vu.troops.enemy=vu.troops.enemy.wave1

          //发送数据
          let msg={r:'/game/start',troops:vu.troops}
          this.ws.send(JSON.stringify(msg))
        }
        return
      }
      //离开
      if(o.r=='/game/leave'){
        let name=this.user[o.data].name
        vu.$message(name+'离开了游戏')
        delete this.user[o.data]
        //我方回合移除部队
        let timer=setInterval(()=>{
          if(vu.round.turn=='wo'){
            //移除部队
            for(let k in vu.grid.role){
              if(vu.grid.role[k].netid==o.data)delete vu.grid.role[k]
            }
            clearInterval(timer)
          }
        },300)
        return
      }
      //聊天
      if(o.r=='/game/chat'){
        if(vu.net.chat.length>30)vu.net.chat.splice(0,1)
        vu.show.chatMsg=true
        vu.net.chat.push({name:o.data.name,content:o.data.content})
        vu.$nextTick(()=>{
          let chat=document.getElementById('chat')
          chat.scrollTop = chat.scrollHeight
        })
        //5秒无新消息关闭
        clearTimeout(this.chatTimer)
        this.chatTimer=setTimeout(()=>{
          vu.show.chatMsg=false
        },5000)
        return
      }
      //开始编队
      if(o.r=='/game/start/troops'){
        vu.troops=o.data
        this.pass.start=true
        return
      }
      //错误提示
      if(o.r=='/game/error'){
        vu.$message.error(o.data)
        return
      }

    //接收行为请求(房主)
    if(o.r=='/game/act/req'){
      //移动和取消移动
      if(o.data.type=='move'||o.data.type=='moveCancel'){
        let from=o.data.param.from,to=o.data.param.to
        //如果to有人了
        if(vu.grid.role[to]){
          let msg={r:'/game/error',id:o.data.id,content:'无法移动到目标位置'}
          this.ws.send(JSON.stringify(msg))
          return
        }
        //通知移动角色
        this.actNot(o.data.type,o.data.param,o.data.id)
      }
      //我方结束
      if(o.data.type=='turn'&&o.data.param.act=='wait'){
        //记录当前等待人数
        this.round.now++
        //获取当前存活玩家人数
        let live=0
        for(let k in this.user){
          if(this.user[k].live)live++
        }
        //判断是否所有人都结束回合
        if(this.round.now>=live){
          //重置
          this.round.now=0
          //通知进入AI回合
          this.actNot('turn',{act:'start'})
        }
      }
      return
    }

    //行为运作
    if(o.r=='/game/act'){
      //移动
      if(o.data.type=='move'){
        //AI回合房主不执行
        if(this.round.ai&&o.data.id==this.id)return

        let from=o.data.param.from,to=o.data.param.to,path=o.data.param.path
        //如果是自己移动
        if(o.data.id==this.id){
          vu.gridClick(to,true)
          return
        }
        //如果是非我方将领
        if(vu.grid.role[from].command&&vu.grid.role[from].camp!='wo')lh.moveToCenter(from)
        //移动
        vu.move(from,to,path)
      }
      //取消移动
      if(o.data.type=='moveCancel'){
        let from=o.data.param.from,to=o.data.param.to
        //如果是自己取消
        if(o.data.id==this.id){
          vu.rightClick(true)
        }else{
          //还原role
          let role=vu.grid.role[from]
          delete vu.grid.role[from]
          vu.grid.role[to]=role
        }
      }
      //休息待机
      if(o.data.type=='rest'&&o.data.id!=this.id){
        //AI回合房主不执行
        if(this.round.ai&&o.data.id==this.id)return

        let xy=o.data.param.xy
        vu.rest(xy)
        if(vu.grid.role[xy].camp=='wo')vu.grid.finish[xy]=true
      }
      //攻击
      if(o.data.type=='attack'&&o.data.id!=this.id){
        //AI回合房主不执行
        if(this.round.ai&&o.data.id==this.id)return

        let from=o.data.param.from,target=o.data.param.target
        vu.attack(from,target)
        if(vu.grid.role[from].camp=='wo')vu.grid.finish[from]=true
      }
      //魔法
      if(o.data.type=='magic'&&o.data.id!=this.id){
        //AI回合房主不执行
        if(this.round.ai&&o.data.id==this.id)return

        let from=o.data.param.from
        let target=o.data.param.target
        let magic=o.data.param.magic
        vu.magic(from,target,magic)
        if(vu.grid.role[from].camp=='wo')vu.grid.finish[from]=true
      }
      //回合
      if(o.data.type=='turn'){
        //开始AI行动
        if(o.data.param.act=='start'){
          this.round.ai=true
          //房主执行
          if(o.data.id==this.id)vu.turn()
        }
        //友方(非房主执行)
        if(o.data.param.act=='friend'&&o.data.id!=this.id){
          vu.grid.finish={}
          vu.round.turn='friend'
          vu.turnAnime()
          vu.turnCure()
          //lvjs
          lvjs.friendTurn()
        }
        //敌方(非房主执行)
        if(o.data.param.act=='enemy'&&o.data.id!=this.id){
          vu.round.turn='enemy'
          vu.turnAnime()
          vu.turnCure()
          //lvjs
          lvjs.enemyTurn()
        }
        //结束(非房主执行)
        if(o.data.param.act=='end'&&o.data.id!=this.id){
          this.round.ai=false
          vu.round.lock=false
          vu.round.num++
          vu.round.turn='wo'
          vu.turnAnime()
          //回血
          vu.turnCure()
          //lvjs
          lvjs.woTurn()
        }
      }
      //部署
      if(o.data.type=='deploy'){
        vu.initOne(o.data.param.id,o.data.param.name,o.data.param.xy,o.data.param.netid)
      }
      //解雇
      if(o.data.type=='dismiss'&&o.data.id!=this.id){
        delete vu.grid.role[o.data.param.xy]
      }
      return
    }

    //错误信息
    if(o.r=='/main/error'){
      vu.$message.error(o.msg)
      return
    }
    //公告
    if(o.r=='/main/notice'){
      vu.$notify({title: '通知',message: o.msg,duration: 0})
      return
    }
  },
  //行为请求
  actReq(type,param){
    let msg={r:'/game/act/req',type,param}
    this.ws.send(JSON.stringify(msg))
  },
  //行为通知
  actNot(type,param,id=null){
    if(!id)id=this.id
    let msg={r:'/game/act',id,type,param}
    this.ws.send(JSON.stringify(msg))
  },
  //聊天
  chat(d,e){
    if(e.keyCode != 13)return
    e.stopPropagation()
    const vu=this.vu
    //没有内容
    if(!vu.net.form.chat){
      d.blur()
      return
    }
    let msg={r:'/game/chat',content:vu.net.form.chat}
    this.ws.send(JSON.stringify(msg))
    vu.net.form.chat=''
    d.blur()
  },
}