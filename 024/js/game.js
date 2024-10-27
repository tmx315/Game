lh.vue({
  data(){
    return{
      level:1,
      isnet:false,
      pattern:'',
      style:{
        hp:''
      },
      show:{
        role:false,
        magic:false,
        chat:false,
        chatMsg:false,
        round:false,
        deploy:false
      },
      grid:{
        cell:48,
        x:0,
        y:0,
        allshader:false,
        role:{},
        item:{},
        finish:{},
        click:{},
        command:{}
      },
      troops:{},
      //data
      data:{
        save:null,
        hero:{wo:null,enemy:null},
        wo:null,
        enemy:null,
        arms:null,
        equip:null,
        magic:null,
        level:null,
        map:null,
        terrain:null,
      },
      //选择相关
      sel:{
        from:null,
        to:null,
        reach:[],
        path:{},
        step:null,
        lock:false,
        mouse:null,
        magic:null
      },
      //回合
      round:{
        turn:null,
        num:1,
        troops:{},
        target:[],
        lock:true,
      },
      //网络
      net:{
        ping:'-',
        chat:[],
        form:{
          chat:''
        }
      },
      //生存模式
      sur:{
        money:0,
        troops:{},
      },
      //鼠标
      hover:{
        id:null,
        xy:'',
        terrain:'',
        color:'',
        role:{},
        timer:null,
        netid:null,
      },
    }
  },
  computed:{
    //gridx class
    gridx(){
      return function(xy){
        let res=''
        if(this.grid.allshader&&!this.grid.click[xy])res+='grid-shade '
        if(this.grid.command[xy])res+='grid-x-'+this.grid.command[xy]+' '
        return res
      }
    },
    //是否禁用回合结束
    disRound(){
      if(this.round.lock)return true
      if(this.isnet&&!lhnet.user[lhnet.id].live)return true
      return false
    },
    //grid role img
    roleImg(){
      return function(xy){
        //finish
        if(this.grid.finish[xy])return this.grid.role[xy].img
        //hover
        if(this.grid.role[xy].id==this.hover.id)return this.grid.role[xy].imgs.active
        return this.grid.role[xy].img
      }
    },
  },
  async created(){
    //获取英雄
    this.data.hero.wo = lh.get("asset/data/role/hero/wo.json")
    this.data.hero.enemy = lh.get("asset/data/role/hero/enemy.json")
    //获取我方兵种
    this.data.wo = lh.get("asset/data/role/wo.json")
    //获取敌方兵种
    this.data.enemy = lh.get("asset/data/role/enemy.json")
    //获取装备
    this.data.equip = lh.get("asset/data/equip.json")
    //获取兵种克制
    this.data.arms = lh.get("asset/data/role/arms.json")
    //获取魔法
    this.data.magic = lh.get("asset/data/magic.json")
    //获取地形
    this.data.terrain = lh.get("asset/data/terrain.json")

    //获取存档姓名和英雄资料
    this.data.save=lh.get('save.json').save1
    this.level=this.data.save.level

    if(lh.getUrl('level')&&lh.getUrl('level')==2)this.level=2

    //如果是联机
    if(lh.getUrl('type')=='net'){
      this.isnet=true
      this.pattern='survive'
      this.level='survive'
    }

    //lvjs
    lvjs.init(this)
    //lhnet
    if(this.isnet)lhnet.init(this)
  },
  async mounted(){
    //地图拖拽事件
    lh.addDragMask('map')
    //wasd移动地图
    //lh.moveMap('map')
    //定义快捷按键
    window.onkeyup = (e)=>{
      //esc
      if(e.keyCode == 27&&this.show.chat){
        this.show.chat=false
        return
      }
      //enter
      if(e.keyCode == 13&&this.isnet){
        if(!this.show.chat){
          clearTimeout(lhnet.chatTimer)
          this.show.chatMsg=true
          this.show.chat=true
          this.$nextTick(()=>{
            this.$refs.chat.focus()
          })
        }
      }
    }
    //添加右键事件
    window.onmousedown = (e)=>{
      if(e.button==2)this.rightClick()
    }

    //取消右键菜单
    window.oncontextmenu=function(e){e.preventDefault()}

    //获取当前关卡情况
    this.data.level=lh.get("asset/data/level/"+this.level+".json")

    //获取部队
    if(!this.isnet&&lh.getUrl('type')!='load'){
      let troops={'艾尔文':['步兵','步兵','步兵','步兵'],'海恩':['卫兵','卫兵','卫兵','卫兵']}
      for(let i=0;i<this.data.level.troops.wo.length;i++){
        let v=this.data.level.troops.wo[i]
        v.soldier=troops[v.hero]
      }
    }

    //获取地图数据
    this.data.map = lh.get(this.data.level.map)
    let rate=this.grid.cell/this.data.map.cell//方格大小
    let width=this.data.map.width*rate,height=this.data.map.height*rate
    //样式处理
    document.getElementById('map').style.width=width+'px'
    document.getElementById('map').style.height=height+'px'
    document.getElementById('map').style['background-image']='url('+this.data.map.path+')'
    this.style.hp='font-size:'+this.grid.cell/4+'px;'
    //定义网格
    this.grid.x=width/this.grid.cell
    this.grid.y=height/this.grid.cell

    //添加滚轮事件
    window.onmousewheel=(e)=>{
      //滚轮向上 放大
      if(e.wheelDelta>0){
        if(this.grid.cell<100)this.grid.cell++
      }else{
        if(this.grid.cell>24)this.grid.cell--
      }

      //修改网格大小
      rate=this.grid.cell/this.data.map.cell
      width=this.data.map.width*rate
      height=this.data.map.height*rate
      document.getElementById('map').style.width=width+'px'
      document.getElementById('map').style.height=height+'px'
      this.style.hp='font-size:'+this.grid.cell/4+'px;'
    }

    this.$nextTick(async ()=>{
      //如果是读档则不再继续
      if(lh.getUrl('type')=='load')return

      //获取部队
      this.troops = JSON.parse(JSON.stringify(this.data.level.troops))

      //lhnet
      if(this.isnet)await lhnet.beforeBegin()
      //lvjs
      await lvjs.beforeBegin()

      //初始化我方部队
      for(let i=0;i<this.troops.wo.length;i++){
        await this.initTroops(this.troops.wo[i],'wo')
      }
      //初始化友方部队
      for(let i=0;i<this.troops.friend.length;i++){
        await this.initTroops(this.troops.friend[i],'friend')
      }
      //初始化敌方部队
      for(let i=0;i<this.troops.enemy.length;i++){
        await this.initTroops(this.troops.enemy[i],'enemy')
      }

      //lvjs
      await lvjs.begin()

      this.round.lock=false
      this.round.turn='wo'
      await this.turnAnime()
    })
  },
  methods:{
    //==========回合==========
      //回合切换动画
      async turnAnime(){
        this.$refs.music.play('asset/effect/round.mp3')
        this.show.round=true
        await lh.wait(1300)
        if(document.getElementById('round'))document.getElementById('round').className = 'animate__animated animate__bounceOutRight'
        await lh.wait(1000)
        this.show.round=false
      },
      //回合事件
      async turn(){
        //我方未行动士兵跟随将领
        await this.woTurn()
        //修改
        this.grid.finish={}

        //友方
        //lhnet
        if(this.isnet)lhnet.actNot('turn',{act:'friend'})
        this.round.turn='friend'
        await this.turnAnime()
        //回血
        this.turnCure()
        //编队
        this.turnTroops()
        //lvjs
        await lvjs.friendTurn()
        //行动
        await this.aiTurn()
        
        //敌方
        //lhnet
        if(this.isnet)lhnet.actNot('turn',{act:'enemy'})
        this.round.turn='enemy'
        await this.turnAnime()
        //回血
        this.turnCure()
        //编队
        this.turnTroops()
        //lvjs
        await lvjs.enemyTurn()
        //行动
        await this.aiTurn()

        //回合结束

        //新回合
        //lhnet
        if(this.isnet){
          lhnet.actNot('turn',{act:'end'})
          lhnet.round.ai=false
        }
        this.round.lock=false
        this.round.num++
        this.round.turn='wo'
        await this.turnAnime()
        //回血
        this.turnCure()
        //lvjs
        await lvjs.woTurn()
      },
      //回合按钮
      turnClick(){
        //我方回合
        if(this.round.turn!='wo')return
        //默认步骤
        if(this.sel.step){
          this.$message.error('行动尚未取消')
          return
        }
        //音效
        this.$refs.music.play('asset/effect/click.mp3')
        //确认按钮
        this.$confirm('孟轩官网024提示：是否结束我方回合', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(async ()=>{
          //加锁
          this.round.lock=true

          //lhnet
          if(this.isnet){
            this.$message('等待其他玩家')
            lhnet.actReq('turn',{act:'wait'})
            return
          }

          await this.turn()
        }).catch(e=>{
          console.log(e)
        })
      },
      //回合分队
      turnTroops(){
        this.round.troops={}
        this.round.target=[]
        //获取所有角色坐标按阵营和编队分队
        for(let k in this.grid.role){
          //是
          if(this.grid.role[k].camp==this.round.turn){
            //判断是否有这个ID
            if(!this.round.troops[this.grid.role[k].id]){
              this.round.troops[this.grid.role[k].id]=[]
            }
            //将领
            if(this.grid.role[k].command){
              this.round.troops[this.grid.role[k].id].splice(0,0,k)
            }else{//士兵
              this.round.troops[this.grid.role[k].id].push(k)
            }
          }else{
            //不是敌方回合，则友方忽略我方
            if(this.round.turn!='enemy'){
              if(this.grid.role[k].camp=='enemy')this.round.target.push(k)
            }else{
              this.round.target.push(k)
            }
          }
        }
      },
      //回复周围士兵血量
      turnCure(){
        let turn=this.round.turn
        //回血
        for(let k in this.grid.role){
          if(this.grid.role[k].command&&this.grid.role[k].camp==turn){
            //回复周围小兵血量
            let temp=lh.getFour(k)
            for(let i=0;i<temp.length;i++){
              if(this.grid.role[temp[i]]&&this.grid.role[temp[i]].id==this.grid.role[k].id){
                if(this.grid.role[temp[i]].hp>7){
                  this.grid.role[temp[i]].hp=10
                }else{
                  this.grid.role[temp[i]].hp+=3
                }
              }
            }
          }
        }
      },
    //==========AI==========
      //我方AI
      async woTurn(){
        //获取我方所有将领和士兵位置
        let hero=[],soldier=[]
        for(let k in this.grid.role){
          let role=this.grid.role[k]
          if(role.camp=='wo'){
            if(role.command)hero.push(k)
            if(!role.command)soldier.push(k)
          }
        }
        //如果我方有未行动的士兵
        for(let i=0;i<soldier.length;i++){
          let v=soldier[i]
          if(!this.grid.finish[v]){
            //获取将领位置
            for(let i2=0;i2<hero.length;i2++){
              if(this.grid.role[hero[i2]].id==this.grid.role[v].id){
                //跟随将领
                this.calReach(v,this.grid.role[v].mov,this.grid.role[v].move)
                let des=lh.calNear(hero[i2],this.sel.reach)
                await this.move(v,des)
                break
              }
            }
          }
        }
      },
      //AI行动
      async aiTurn(){
        //按编队轮询
        for(let k in this.round.troops){
          //lvjs
          await lvjs.beforeHero(this.round.troops[k][0])
          await this.heroTurn(k)
          if(this.round.troops[k].length>1){//是否还有士兵
            for(let i=1;i<this.round.troops[k].length;i++){
              //如果该士兵已经阵亡
              if(!this.grid.role[this.round.troops[k][i]])continue
              await this.soldierTurn(k,i)
            }
          }
          //lvjs
          await lvjs.afterTroops(this.round.troops[k][0])
        }
      },
      //将领行动(id)
      async heroTurn(id){
        //将领位置
        let from=this.round.troops[id][0]
        let role=this.grid.role[from]

        //移动地图
        await lh.moveToCenter(from)
        await lh.wait(300)
        
        //计算血量，是否休息回血
        if(role.hp<8){this.rest(from);return;}

        //计算移动范围，根据士兵速度放慢1格速度
        let mov=role.mov,minSoldierMov=100
        for(let i=0;i<this.round.troops[id].length;i++){
          let v=this.round.troops[id][i]
          if(this.grid.role[v].mov<minSoldierMov)minSoldierMov=this.grid.role[v].mov
        }
        if(mov>minSoldierMov-1)mov=minSoldierMov-1
        this.calReach(from,mov,role.move)

        //作战趋势
        if(role.tend){
          let tend=role.tend
          //移动
          if(tend.type=='move'){
            //判断是否已到达
            if(from==tend.des){this.rest(from);return;}
            let des=await this.approach(from,tend.des)
            return
          }
          //跟随
          if(tend.type=='follow'){
            let des
            for(let k in this.grid.role){
              if(this.grid.role[k].command&&this.grid.role[k].id==tend.id){
                des=k
                break
              }
            }
            //判断是否已在旁边
            if(lh.calDis(from,des)<2){
              this.rest(from)
              return
            }
            des=await this.approach(from,des)
            return
          }
          //停止
          if(tend.type=='stop'){
            this.rest(from)
            return
          }
          //朝目的地进攻，移动范围内有敌人时进行攻击
          if(tend.type=='attack'){
            let reachEnemy=this.calReachEnemy(this.sel.reach)
            //移动范围内有敌对
            if(JSON.stringify(reachEnemy)!='{}'){
              //选择最近的目标攻击
              let temp=[]
              for(let v in reachEnemy){temp.push(v)}
              let des=lh.calNear(from,temp)
              //移动
              await this.move(from,reachEnemy[des][0])
              //攻击
              await this.attack(reachEnemy[des][0],des)
            }else{
              await this.approach(from,tend.des)
            }
            return
          }
          //追杀某个目标
          if(tend.type=='hunt'){
            //task
            return
          }
        }

        //如果没有趋势
        //搜索移动范围内的敌人和进攻点
        let reachEnemy=this.calReachEnemy(this.sel.reach)

        //判断双方伤害
        if(JSON.stringify(reachEnemy)!='{}'){
          for(let k in reachEnemy){
            let res=this.calDamage(from,k,reachEnemy[k][0])
            let damage1=res[0],damage2=res[1]
            if(damage1<=0||damage2>3)delete reachEnemy[k]
          }
        }

        //移动范围内有敌对
        if(JSON.stringify(reachEnemy)!='{}'){
          //选择最近的目标攻击
          let temp=[]
          for(let v in reachEnemy){temp.push(v)}
          let des=lh.calNear(from,temp)
          //移动
          await this.move(from,reachEnemy[des][0])
          //攻击
          await this.attack(reachEnemy[des][0],des)
          return
        }

        //移动范围无敌对
        if(JSON.stringify(reachEnemy)=='{}'){
          //搜索最近的敌对
          let des=lh.calNear(from,this.round.target)
          des=await this.approach(from,des)
        }
      },
      //士兵行动(id 序号)
      async soldierTurn(id,i0){
        //将领位置
        let hero=this.round.troops[id][0]
        //士兵位置
        let soldier=this.round.troops[id][i0]
        let role=this.grid.role[soldier]

        //计算移动范围
        this.calReach(soldier,role.mov,role.move)

        //作战趋势
        if(this.grid.role[hero].tend){
          let tend=this.grid.role[hero].tend
          if(tend.noatk){
            //计算离将领最近的位置
            let des=lh.calNear(hero,this.sel.reach)
            await this.move(soldier,des)
            return
          }
        }

        //判断将领四个方向情况
        let vac=[],tar=[]
        let temp=lh.getFour(hero)
        for(let i=0;i<temp.length;i++){
          let v=temp[i]
          //有空位
          if(!this.grid.role[v]){vac.push(v)}
          //有敌对
          if(this.round.target.indexOf(v)!=-1)tar.push(v)
        }

        //自身血量小于8
        if(role.hp<8){
          //4格有空位
          if(vac.length){
            //判断将领周围空位能否到达
            let des=[]
            for(let i=0;i<vac.length;i++){
              if(this.sel.reach.indexOf(vac[i])!=-1){
                des.push(vac[i])
              }
            }
            //没有能到达的空位
            if(!des.length){
              //计算离将领最近的位置
              des=lh.calNear(hero,this.sel.reach)
              await this.move(soldier,des)
              return
            }
            //判断最远的空位
            des=lh.calFar(soldier,des)
            //移动
            await this.move(soldier,des)
          }
          //4格没有空位且没有敌人
          if(!vac.length&&!tar.length){
            //计算离将领最近的位置
            let des=lh.calNear(hero,this.sel.reach)
            await this.move(soldier,des)
          }
          //4格没有空位有敌人
          if(!vac.length&&tar.length){
            //目标遍历
            for(let i=0;i<tar.length;i++){
              //task判断目标的防御
              let attacked=false
              //判断目标周围的空位
              let temp=[],temp2=lh.getFour(tar[i])
              for(let i2=0;i2<temp2.length;i2++){
                if(!this.grid.role[temp2[i2]]){temp.push(temp2[i2])}
              }
              //目标周围有空位
              if(temp.length){
                //判断空位能否到达
                for(let i2=0;i2<temp.length;i2++){
                  if(this.sel.reach.indexOf(temp[i2])!=-1){
                    //移动攻击
                    await this.move(soldier,temp[i2])
                    await this.attack(temp[i2],tar[i])
                    attacked=true
                    break//跳出其他空位判断
                  }
                }
              }
              //如果进行过攻击
              if(attacked){break}
            }
          }
        }

        //自身血量大于7
        if(role.hp>=8){
          //将领指挥范围和移动范围重合点能否攻击到敌人
          let commandRange=lh.getByDis(hero,this.grid.role[hero].command.range)
          commandRange=lh.getCoin(commandRange,this.sel.reach)
          let reachEnemy=this.calReachEnemy(commandRange)

          //判断双方伤害
          if(JSON.stringify(reachEnemy)!='{}'){
            for(let k in reachEnemy){
              let res=this.calDamage(soldier,k,reachEnemy[k][0])
              let damage1=res[0],damage2=res[1]
              if(damage1<=0||damage2>=role.hp)delete reachEnemy[k]
            }
          }

          //移动范围及将领指挥范围内有适合攻击的敌对
          if(JSON.stringify(reachEnemy)!='{}'){
            //选择距离将领最近的进攻坐标
            let temp=[]
            for(let k in reachEnemy){
              for(let i=0;i<reachEnemy[k].length;i++){
                temp.push(reachEnemy[k][i])
              }
            }
            let des=lh.calNear(hero,temp)
            //获取该坐标能攻击到的敌人
            let four=lh.getFour(des)
            temp=[]
            for(let i=0;i<four.length;i++){
              if(this.round.target.indexOf(four[i])!=-1){temp.push(four[i])}
            }
            //移动攻击
            await this.move(soldier,des)
            await this.attack(des,temp[0])
            return
          }

          //移动范围无适合攻击的敌对
          if(JSON.stringify(reachEnemy)=='{}'){
            //判断将领周围空位能否到达
            let des=[]
            for(let i=0;i<vac.length;i++){
              if(this.sel.reach.indexOf(vac[i])!=-1){
                des.push(vac[i])
              }
            }
            //没有能到达的空位
            if(!des.length){
              //计算离将领最近的位置
              des=lh.calNear(hero,this.sel.reach)
              await this.move(soldier,des)
              return
            }
            //判断最远的空位
            des=lh.calFar(soldier,des)
            //移动
            await this.move(soldier,des)
          }
        }
      },
    //==========点击==========
      //角色点击事件
      roleClick(xy){
        //回合限制
        if(this.round.turn!='wo'){return}
        //步骤
        if(this.sel.step){return}
        //未结束行动
        if(this.grid.finish[xy]){return}
        //禁止点击友方敌人
        if(this.grid.role[xy].camp!='wo'){return}
        if(this.sel.lock){return}

        //lhnet
        if(this.isnet&&this.grid.role[xy].netid!=lhnet.id){return}
          
        //添加原点
        this.sel.from=xy
        //处理to
        this.sel.to=null

        //显示菜单，移动、攻击、休息、魔法、指令
        let menu=['移动','攻击']
        let menuID=['menu-move','menu-attack']
        //判断是将领还是士兵
        if(this.grid.role[xy].command){
          menu.push('休息')
          menuID.push('menu-rest')
          menu.push('魔法')
          menuID.push('menu-magic')
          //menu.push('指令')
          //menuID.push('menu-order')
        }else{
          menu.push('待机')
          menuID.push('menu-rest')
        }
        //html
        let div='<div id="role-menu" class="role-menu">'
        for (let i=0;i<menu.length;i++){
          let v=menu[i]
          div+='<button id="'+menuID[i]+'">'+v+'</button>'
        }
        div+='</div>'
        this.grid.item[xy]=div
        //添加点击事件
        this.$nextTick(() => {
          for (let i=0;i<menuID.length;i++){
            let v=menuID[i]
            let qwe=document.getElementById(v)
            qwe.onclick=()=>{this.roleMenu(v)}
          }
          //步骤
          this.sel.step='menu'
        })
      },
      //角色行为菜单点击事件
      roleMenu(id){
        if(this.sel.step!='menu'){return}
        if(this.sel.lock){return}

        //音效
        this.$refs.music.play('asset/effect/click.mp3')

        //移动
        if(id=='menu-move'){
          //样式
          this.grid.allshader=true
          //步骤
          this.sel.step='move'
          //寻路
          let from=this.sel.from
          this.calReach(from,this.grid.role[from].mov,this.grid.role[from].move)
          //暂时隐藏菜单
          document.getElementById('role-menu').style.display='none'
        }
        //攻击
        if(id=='menu-attack'){
          //样式
          this.grid.allshader=true
          //步骤修改
          this.sel.step='attack'
          //暂时隐藏菜单
          document.getElementById('role-menu').style.display='none'
          //攻击范围内添加可点击事件
          let range=this.grid.role[this.sel.from].range
          let temp=lh.getByDis(this.sel.from,range)
          for (let i=0;i<temp.length;i++){
            let v=temp[i]
            if(!this.grid.role[v]||this.grid.role[v].camp=='enemy'){
              this.grid.click[v]=true
            }
          }
        }
        //休息待机
        if(id=='menu-rest'){
          this.sel.step=null
          this.rest(this.sel.from)
          this.grid.finish[this.sel.from]=true
          //移除菜单
          delete this.grid.item[this.sel.from]
          //lhnet
          if(this.isnet)lhnet.actNot('rest',{xy:this.sel.from})
        }
        //魔法
        if(id=='menu-magic'){
          this.sel.step='magic'
          this.show.magic=true
        }
        if(id=='menu-order'){
          this.$message('开发中')
        }
      },
      //上层点击事件
      async gridClick(xy,passnet=false){
        if(this.sel.lock){return}

        //移动
        if(this.sel.step=='move'){
          //判断是否已经有角色
          if(this.grid.role[xy]){
            this.$message.error('孟轩官网024提示：无法移动到目标位置')
            return
          }
          //lhnet
          if(this.isnet&&!passnet){
            lhnet.actReq('move',{
              from:this.sel.from,
              to:xy,
              path:lh.getPath(this.sel.from,xy,this.sel.path)
            })
            return
          }
          //音效
          this.$refs.music.play('asset/effect/click3.mp3')
          //加锁
          this.sel.lock=true
          //保存目标
          this.sel.to=xy
          //移动
          await this.move(this.sel.from,this.sel.to)
          //移除点击层
          this.grid.click={}
          //步骤修改
          this.sel.step='afterMove'
          //解锁
          this.sel.lock=false
          //添加当前坐标点击待机事件
          this.grid.click[xy]=true
          //攻击范围内添加可点击事件
          let range=this.grid.role[xy].range
          let temp=lh.getByDis(xy,range)
          for (let i=0;i<temp.length;i++){
            let v=temp[i]
            if(!this.grid.role[v]||this.grid.role[v].camp=='enemy'){
              this.grid.click[v]=true
            }
          }
          return
        }

        //攻击待机
        if(this.sel.step=='afterMove'){
          //如果目标不存在
          if(!this.grid.role[xy]){
            this.$message.error('没有可攻击目标')
            return
          }
          //修改步骤
          this.sel.step=null
          //移除点击事件
          this.grid.click={}
          //样式
          this.grid.allshader=false
          //移除隐藏的角色菜单
          delete this.grid.item[this.sel.from]
          //判断有没移动和点击的位置
          if(!this.sel.to){//没移动
            //lhnet
            if(this.isnet)lhnet.actNot('attack',{from:this.sel.from,target:xy})
            //攻击
            await this.attack(this.sel.from,xy)
            //禁止行动
            this.grid.finish[this.sel.from]=true
            return
          }
          if(this.sel.to&&xy!=this.sel.to){//移动后攻击
            //lhnet
            if(this.isnet)lhnet.actNot('attack',{from:this.sel.to,target:xy})
            //攻击
            await this.attack(this.sel.to,xy)
            //禁止行动
            this.grid.finish[this.sel.to]=true
            return
          }
          if(this.sel.to&&xy==this.sel.to){//待机
            //lhnet
            if(this.isnet)lhnet.actNot('rest',{xy})
            //禁止行动
            this.grid.finish[this.sel.to]=true
            return
          }
        }

        //攻击
        if(this.sel.step=='attack'){//如果目标不存在
          if(!this.grid.role[xy]){
            this.$message.error('没有可攻击目标')
            return
          }
          //修改步骤
          this.sel.step=null
          //移除点击事件
          this.grid.click={}
          //样式
          this.grid.allshader=false
          //移除隐藏的角色菜单
          delete this.grid.item[this.sel.from]
          //lhnet
          if(this.isnet)lhnet.actNot('attack',{from:this.sel.from,target:xy})
          //攻击
          await this.attack(this.sel.from,xy)
          //禁止行动
          this.grid.finish[this.sel.from]=true
          return
        }

        //魔法攻击
        if(this.sel.step=='magicUse'){
          let magic=this.data.magic[this.sel.magic]
          if(magic.type=='damage'){
            //单体法术
            if(magic.influ==0){
              if(!this.grid.role[xy]||this.grid.role[xy].camp!='enemy'){
                this.$message.error('孟轩官网024提示：请选择敌对目标')
                return
              }
            }
          }else{
            this.$message('孟轩官网024提示：尚不支持非伤害性法术')
            return
          }
          //lhnet
          if(this.isnet)lhnet.actNot('magic',{from:this.sel.from,target:xy,magic:this.sel.magic})
          //修改步骤
          this.sel.step=null
          //移除点击事件
          this.grid.click={}
          //样式
          this.grid.allshader=false
          //移除隐藏的角色菜单
          delete this.grid.item[this.sel.from]
          //禁止行动
          this.grid.finish[this.sel.from]=true
          //使用魔法
          await this.magic(this.sel.from,xy)
        }
      },
      //右键取消
      rightClick(passnet=false){
        if(!this.sel.step)return
        if(this.sel.lock)return

        //音效
        if(!passnet)this.$refs.music.play('asset/effect/click2.mp3')

        if(this.sel.step=='menu'){//取消菜单
          //还原步骤
          this.sel.step=null
          //移除菜单
          delete this.grid.item[this.sel.from]
          return
        }
        if(this.sel.step=='move'){//取消移动选择
          //还原步骤
          this.sel.step='menu'
          //移除点击层
          this.grid.click={}
          //移除样式
          this.grid.allshader=false
          //显示菜单
          document.getElementById('role-menu').style.display='block'
          return
        }
        //取消移动
        if(this.sel.step=='afterMove'){
          //lhnet
          if(this.isnet&&!passnet&&this.sel.to){
            lhnet.actReq('moveCancel',{
              from:this.sel.to,
              to:this.sel.from,
            })
            return
          }
          //还原步骤
          this.sel.step='move'
          //还原role
          let role=this.grid.role[this.sel.to]
          delete this.grid.role[this.sel.to]
          this.grid.role[this.sel.from]=role
          //移除点击层
          this.grid.click={}
          //重置
          this.sel.to=null
          for(let i=0;i<this.sel.reach.length;i++){
            //添加点击移动事件
            this.grid.click[this.sel.reach[i]]=true
          }
          return
        }
        //取消攻击选择
        if(this.sel.step=='attack'){
          //还原步骤
          this.sel.step='menu'
          //移除点击层
          this.grid.click={}
          //移除样式
          this.grid.allshader=false
          //显示菜单
          document.getElementById('role-menu').style.display='block'
          return
        }
        //取消魔法选择
        if(this.sel.step=='magic'){
          this.show.magic=false
          //还原步骤
          this.sel.step='menu'
          return
        }
        //取消魔法目标选择
        if(this.sel.step=='magicUse'){
          //显示魔法选择
          this.show.magic=true
          //还原步骤
          this.sel.step='magic'
          //移除点击层
          this.grid.click={}
          //移除样式
          this.grid.allshader=false
          return
        }
      },
    //==========行为==========
      //移动(from to)
      async move(from,to,path=null){
        if(from!=to){//如果有移动
          //锁定位置
          this.grid.role[to]={}

          let role=JSON.parse(JSON.stringify(this.grid.role[from]))

          //动画路径
          if(!path)path=lh.getPath(from,to,this.sel.path)

          //lhnet
          if(this.isnet&&lhnet.round.ai&&lhnet.id==lhnet.owner){//AI回合房主传递
            lhnet.actNot('move',{from,to,path})
          }

          //AI将领移动
          if(this.round.turn!='wo'&&this.grid.role[from].command){
            this.grid.item[from]='<div style="background-image: url(asset/image/ui/sel.png);background-size: 100% 100%;height:100%;width:100%;display:flex;justify-content: center;align-items: center;"><img src="asset/image/ui/arrow.png" style="width:70%;height:70%;"></div>'
            await lh.wait(300)
            await lh.playStra('grid-item'+from,from,to,this.grid.cell)
            await lh.wait(300)
            document.getElementById('grid-item'+from).style.transform=null
            delete this.grid.item[from]
          }
          await lh.playAnime('grid-role'+from,path,this.grid.cell)
          if(this.round.turn!='wo')await lh.wait(300)

          //处理
          this.grid.role[to]=role
          document.getElementById('grid-role'+from).style.transform=null
          delete this.grid.role[from]

          let netUpdate=true
          //lhnet
          if(this.isnet&&lhnet.round.ai&&lhnet.id!=lhnet.owner){//AI回合非房主不更新
            netUpdate=false
          }
          //AI回合则更新位置
          if(this.round.turn!='wo'&&netUpdate){
            let idx=this.round.troops[role.id].indexOf(from)
            this.round.troops[role.id][idx]=to
          }

          //lvjs
          if(role.command)await lvjs.afterMove(to)
        }
      },
      //攻击(from,target)
      async attack(from,target){
        //lvjs
        await lvjs.beforeAttack(from,target)

        //lhnet
        if(this.isnet&&lhnet.round.ai&&lhnet.id==lhnet.owner){//AI回合房主传递
          lhnet.actNot('attack',{from,target})
        }
        
        //角色
        let role1=this.grid.role[from]
        let role2=this.grid.role[target]

        //如果非我方，剑UI动画
        if(role1.camp!='wo'){
          this.grid.item[from]='<div style="background-image: url(asset/image/ui/sel.png);background-size: 100% 100%;height:100%;width:100%;display:flex;justify-content: center;align-items: center;"><img src="asset/image/ui/attack.png" style="width:70%;height:70%;"></div>'
          await lh.wait(100)
          await lh.playStra('grid-item'+from,from,target,this.grid.cell)
          await lh.wait(300)
          document.getElementById('grid-item'+from).style.transform=null
          delete this.grid.item[from]
        }

        //两人靠近交战动画
        //task
        
        //最后伤害
        let res=this.calDamage(from,target)
        let damage1=res[0],damage2=res[1]

        //记录伤害
        let damageArr=[]

        //播放音效
        if(damage1>0){
          damageArr.push([target,damage1])
          this.$refs.music.play(this.grid.role[target].inj)
        }
        if(damage2>0){
          damageArr.push([from,damage2])
          this.$refs.music.play(this.grid.role[from].inj)
        }

        //伤害处理
        await this.damage(damageArr)
      },
      //魔法攻击(from,target)
      async magic(from,target,selmagic=null){
        //lvjs
        await lvjs.beforeAttack(from,target)

        //lhnet
        if(this.isnet&&lhnet.round.ai&&lhnet.id==lhnet.owner){//AI回合房主传递
          lhnet.actNot('magic',{from,target,magic:this.sel.magic})
        }

        if(!selmagic)selmagic=this.sel.magic
        let magic=this.data.magic[selmagic]

        //获取影响范围
        let influ=this.data.magic[selmagic].influ
        target=[target]
        if(influ=='troops'){
          let id=this.grid.role[target].id
          target=[]
          for(let k in this.grid.role){
            if(this.grid.role[k].id==id)target.push(k)
          }
        }
        if(influ!='troops'&&influ>0)target=lh.getByDis(target)

        //记录伤害
        let damageArr=[]

        //判断类型
        if(magic.type=='damage'){
          //获取伤害
          let damage=this.grid.role[from].magic_atk
          for(let i=0;i<target.length;i++){
            let v=target[i]
            //动画
            this.grid.item[v]='<img src="asset/image/magic/fire.gif" style="width:100%;height:100%;">'
            //获取对方魔防
            let role=this.grid.role[v]
            let mr=role.mr
            damage=Math.ceil(damage-damage*mr/100)
            //伤害不能超过守方hp
            if(damage>role.hp)damage=role.hp
            if(damage>0)damageArr.push([v,damage])
            //关闭动画
            await lh.wait(800)
            delete this.grid.item[v]
          }
          //伤害处理
          await this.damage(damageArr)
        }
      },
      //休息(xy)
      rest(xy){
        //lhnet
        if(this.isnet&&lhnet.round.ai&&lhnet.id==lhnet.owner){//AI回合房主传递
          lhnet.actNot('rest',{xy})
        }

        if(this.grid.role[xy].command){
          this.grid.role[xy].hp+=3
          if(this.grid.role[xy].hp>10){this.grid.role[xy].hp=10}
        }
      },
      //朝目标靠近，返回最后移动地点
      async approach(from,target){
        //如果目标在移动范围内
        if(this.sel.reach.indexOf(target)!=-1){
          await this.move(from,target)
          return target
        }
        //A星算法
        let path=this.Astar(from,target,this.grid.role[from].move)
        //路径和可到达地点的重合点
        path=lh.getCoin(path,this.sel.reach)
        //选择最后一个重合点
        let des=path[path.length-1]
        //如果有人
        if(this.grid.role[des]){
          des=lh.calNear(target,this.sel.reach)
        }
        //移动
        await this.move(from,des)
        //返回目的
        return des
      },
    //==========计算==========
      //魔法范围计算
      calMagic(magic){
        this.sel.step='magicUse'
        this.show.magic=false
        this.sel.magic=magic

        //范围
        magic=this.data.magic[magic]
        let heroMagicRange=this.grid.role[this.sel.from].magic_range
        let range=lh.getByDis(this.sel.from,magic.range+heroMagicRange)

        //样式
        this.grid.allshader=true
        
        //添加点击事件
        for(let i=0;i<range.length;i++){
          this.grid.click[range[i]]=true
        }
      },
      //可移动范围计算(初始点 移动力 移动方式)
      calReach(start,move,moveType){
        //移动者阵营
        let camp=this.grid.role[start].camp
        //重置点击移动事件
        this.grid.click={}
        //待拓展，已遍历，待剔除角色
        let open={},close={},elicamp=[]
        open[start]={parent:start,mov:move}

        //获取移动力消耗
        let getMove=(v)=>{
          //获取地形
          let type=this.data.map.terrain[v]
          //移动力消耗
          let cost=this.data.terrain[type][moveType]
          //如果有敌对阵营则移动力消耗等同stop
          if(this.grid.role[v]){
            //判断我方和敌方回合
            if(camp!='enemy'){//我方和友方回合
              if(this.grid.role[v].camp=='enemy'){
                cost=1000
              }else{
                //判断待剔除角色地点是否已经存在
                //添加到待剔除角色中
                if(elicamp.indexOf(v)==-1){elicamp.push(v)}
              }
            }else{//敌方回合
              if(this.grid.role[v].camp!='enemy'){
                cost=1000
              }else{
                //判断待剔除阵角色点是否已经存在
                //添加到待剔除角色中
                if(elicamp.indexOf(v)==-1){elicamp.push(v)}
              }
            }
          }
          return cost
        }

        //广度优先算法
        let expand=(point)=>{
          //拓展所有open的点,根据移动力消耗去重
          for(let k in point){
            let four=lh.getFour(k)
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
              let cost=getMove(v)
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

        //开始遍历
        expand(open)

        //全局
        let temp=[]
        for(let k in close){
          //添加点击移动事件，剔除角色坐标
          if(elicamp.indexOf(k)==-1){
            temp.push(k)
            if(camp=='wo')this.grid.click[k]=true
          }
        }
        this.sel.reach=temp
        this.sel.path=close
      },
      //A星算法，计算到目标的路径(起始 目标 移动类型)
      Astar(start,des,move){
        let map=this.data.map,terrain=this.data.terrain
        let open={},close={}
        close[start]=null

        let func=(point)=>{
          //四方向
          let four=lh.getFour(point)
          //计算F=G+H值，加入open
          for(let i=0;i<four.length;i++){
            let v=four[i]
            //不在open和close
            if(!open[v]&&!close[v]){
              //获取该点地形
              let ter=map.terrain[v]
              //移动消耗
              let g=parseInt(terrain[ter][move])
              
              //该点到目标的距离
              let h=lh.calDis(v,des)

              //加入open
              open[v]={parent:point,f:g+h}
            }
          }

          //选择F最小的open拓展
          let min=10000,xy
          for(let k in open){
            if(open[k].f<min){
              min=open[k].f
              xy=k
            }
          }
          //加入close
          close[xy]=open[xy]
          delete open[xy]

          //递归
          if(xy!=des){
            func(xy)
          }
        }

        //开始Astar
        func(start)

        //从终点走回起点
        let path=[],next=des
        while(next!=start){
          path.push(next)
          next=close[next].parent
        }
        path.push(start)
        //数组反向
        return path.reverse()
      },
      //计算范围内敌人和进攻位置
      calReachEnemy(range){
        let reachEnemy={}
        for(let i=0;i<range.length;i++){
          let temp=lh.getFour(range[i])
          for(let i2=0;i2<temp.length;i2++){
            let v=temp[i2]
            if(this.round.target.indexOf(v)!=-1){
              //保存目标坐标和进攻坐标
              if(reachEnemy[v]){//已存在进攻坐标
                reachEnemy[v].push(range[i])
              }else{//不存在
                reachEnemy[v]=[range[i]]
              }
            }
          }
        }
        return reachEnemy
      },
      //计算攻防伤害
      calDamage(from,target,from2=null){
        //获取攻防
        let role1=this.grid.role[from]
        let role2=this.grid.role[target]
        let atk1=role1.atk,atk2=role2.atk,def1=role1.def,def2=role2.def

        //攻方是士兵，计算指挥加成
        if(!role1.command){
          //获取攻方指挥官位置
          for(let k in this.grid.role){
            if(role1.id==this.grid.role[k].id&&this.grid.role[k].command){
              //获取到指挥官信息
              let command=this.grid.role[k].command

              //是否在指挥范围
              if(lh.calDis(from,k)<=command.range){
                //属性加成
                atk1+=command.atk
                def1+=command.def
              }
              break
            }
          }
        }
        //守方是士兵，计算指挥加成
        if(!role2.command){
          //获取守方指挥官位置
          for(let k in this.grid.role){
            if(role2.id==this.grid.role[k].id&&this.grid.role[k].command){
              //获取到指挥官信息
              let command=this.grid.role[k].command

              //是否在指挥范围
              if(lh.calDis(from,k)<=command.range){
                //属性加成
                atk2+=command.atk
                def2+=command.def
              }
              break
            }
          }
        }

        //计算兵种克制
        let type1=this.grid.role[from].type
        let type2=this.grid.role[target].type
        if(this.data.arms[type1]&&this.data.arms[type1][type2]){
          atk1+=this.data.arms[type1][type2].at
          def1+=this.data.arms[type1][type2].df
        }
        if(this.data.arms[type2]&&this.data.arms[type2][type1]){
          atk2+=this.data.arms[type2][type1].at
          def2+=this.data.arms[type2][type1].df
        }

        //计算伤害
        let damage1=atk1-def2
        let damage2=atk2-def1

        //计算地形减伤
        let redu1=this.data.terrain[this.data.map.terrain[from]].raise
        let redu2=this.data.terrain[this.data.map.terrain[target]].raise
        //如果有即将移动的位置
        if(from2)redu1=this.data.terrain[this.data.map.terrain[from2]].raise
        if(redu1)damage1=Math.ceil(damage1*(1-redu2/100))
        if(redu2)damage2=Math.ceil(damage2*(1-redu1/100))

        //伤害根据自身HP调整百分比
        if(role1.hp<10)damage1=Math.ceil(damage1*role1.hp/10)
        if(role2.hp<10)damage2=Math.ceil(damage2*role2.hp/10)

        //随机数
        // if(!this.isnet){
        //   damage1+=lh.getRandom(-1,1)
        //   damage2+=lh.getRandom(-1,1)
        // }

        //判断双方攻击距离和当前距离
        if(lh.calDis(from,target)>1){
          if(role1.range>role2.range)damage2=0
          if(role2.range>role1.range)damage1=0
        }

        return [damage1,damage2]
      },
    //==========事件==========
      //选框
      mouseover(xy){
        //如果是同一个位置
        if(this.hover.xy==xy)return

        clearTimeout(this.hover.timer)//防抖
        this.hover.timer=setTimeout(()=>{
          this.grid.command={}
          this.hover.role={}
          this.hover.xy=xy

          let ter=this.data.map.terrain[xy]
          this.hover.terrain='-'+this.data.terrain[ter].raise+'%'

          //判断是否有role
          if(this.grid.role[xy]){
            this.hover.color=this.hover.color==''?'2':''
            this.show.role=true
            this.hover.role=JSON.parse(JSON.stringify(this.grid.role[xy]))
            this.hover.id=this.grid.role[xy].id

            //显示指挥官加成范围
            for(let k in this.grid.role){
              if(this.grid.role[xy].id==this.grid.role[k].id&&this.grid.role[k].command){
                //获取到指挥官信息
                let command=this.grid.role[k].command

                //指挥范围
                let temp=lh.getByDis(k,command.range)
                let color='blue'+this.hover.color
                if(this.grid.role[k].camp=='friend')color='green'+this.hover.color
                if(this.grid.role[k].camp=='enemy')color='red'+this.hover.color
                for(let i=0;i<temp.length;i++){
                  this.grid.command[temp[i]]=color
                }

                //如果不是指挥官，是否在指挥范围
                if(!this.grid.role[xy].command&&lh.calDis(xy,k)<=command.range){
                  //属性加成
                  this.hover.role.atk=this.hover.role.atk+'+'+command.atk
                  this.hover.role.def=this.hover.role.def+'+'+command.def
                }
                break
              }
            }

            //如果有netid
            if(this.grid.role[xy].netid){
              this.show.netname=true
              this.hover.netid=this.grid.role[xy].netid
            }
          }else{
            this.show.role=false
            this.show.netname=false
          }
        },50)
      },
      //受到伤害([[xy,damage]])
      async damage(arr){
        let dieArr=[]
        for(let i=0;i<arr.length;i++){
          let xy=arr[i][0],damage=arr[i][1]
          //如果目标已经不存在
          if(!this.grid.role[xy])continue
          //伤害不能小于0
          if(damage<0)damage=0
          //伤害不能超过守方hp
          let role=this.grid.role[xy]
          if(damage>=role.hp){
            damage=role.hp
            dieArr.push(xy)
          }
          this.grid.role[xy].hp=role.hp-damage
        }

        await lh.wait(300)

        //是否有死亡者
        if(dieArr.length)await this.roleDie(dieArr)
      },
      //阵亡处理
      async roleDie(arr){
        //消除阵亡者
        for(let i=0;i<arr.length;i++){
          let v=arr[i]
          //死亡者已经被消除
          if(!this.grid.role[v])continue
          let role=this.grid.role[v]

          //lvjs
          if(role.command)await lvjs.beforeDie(role)

          //消除本身
          delete this.grid.role[v]
          //如果是将领，消除部队
          if(role.command){
            for(let k in this.grid.role){
              if(this.grid.role[k].id==role.id){
                //添加阵亡士兵坐标
                arr.push(k)
                delete this.grid.role[k]
              }
            }
          }

          //lvjs
          if(role.command)await lvjs.afterDie(role)
        }
        
        //处理AI目标
        if(this.round.turn!='wo'){
          for(let i=0;i<arr.length;i++){
            let idx=this.round.target.indexOf(arr[i])
            if(idx!=-1){this.round.target.splice(idx,1)}
          }
        }
      },
      //雇佣
      recruit(id,name){
        //人数
        if(this.sur.troops[id].soldier.length>3){
          this.$message.error('部队人数已满')
          return
        }
        //资金
        if(this.sur.money<this.data.wo[name].cost){
          this.$message.error('资金不足')
          return
        }
        //招募
        this.sur.troops[id].soldier.push(name)
        //资金扣除
        this.sur.money-=this.data.wo[name].cost
        //lhnet
        if(this.isnet){
          lhnet.actNot('deploy',{id,name,xy:this.sur.troops[id].xy,netid:lhnet.id})
          return
        }
        this.initOne(id,name,this.sur.troops[id].xy)
      },
      //解雇
      dismiss(id,name){
        let idx=this.sur.troops[id].soldier.indexOf(name)
        this.sur.troops[id].soldier.splice(idx,1)
        //资金返还
        this.sur.money+=this.data.wo[name].cost/2
        //移除
        for(let k in this.grid.role){
          let role=this.grid.role[k]
          if(role.id==id&&role.name==name){
            delete this.grid.role[k]
            //lhnet
            if(this.isnet)lhnet.actNot('dismiss',{xy:k})
            break
          }
        }
      },
    //==========其它==========
      //初始化编队(v,阵营)
      async initTroops(v,camp){
        let num=v.soldier.length+1,hero
        for(let i=0;i<num;i++){
          let dic,role={}
          if(camp=='wo'){//我方
            if(i==0){//将领
              dic=this.data.save.hero[v.hero]
              //lhnet
              if(this.isnet)dic=this.data.hero.wo[v.hero]
            }else{//士兵
              dic=this.data.wo[v.soldier[i-1]]
            }
          }
          if(camp=='friend'){//友方
            if(i==0){//将领
              dic=this.data.hero.wo[v.hero]
            }else{//士兵
              dic=this.data.wo[v.soldier[i-1]]
            }
          }
          if(camp=='enemy'){//敌方
            if(i==0){//将领
              dic=this.data.hero.enemy[v.hero]
            }else{//士兵
              dic=this.data.enemy[v.soldier[i-1]]
            }
          }
          role=JSON.parse(JSON.stringify(dic))
          role.camp=camp
          if(i==0){//将领
            role.allmp=dic.mp
            role.name=v.hero
          }else{//士兵
            role.name=v.soldier[i-1]
          }

          role.hp=10//初始HP
          role.id=v.id//部队ID
          //lhnet
          if(this.isnet&&v.netid){
            role.netid=v.netid
            role.netname=lhnet.user[v.netid].name
          }

          //如果将领有soldier加成
          if(i>0&&hero.soldier){
            if(hero.soldier.mr)role.mr+=hero.soldier.mr
            if(hero.soldier.mov)role.mov+=hero.soldier.mov
          }

          //绘制
          let xy=v.xy//将领
          if(i>0){//士兵
            let four=lh.getFour(xy)
            xy=four[i-1]
          }else{//将领，地图移动
            await lh.moveToCenter(xy)
          }

          //坐标不可用
          if(this.grid.role[xy]||this.data.map.terrain[xy]=='stop'){
            let tvs=(point,dis)=>{
              let four=lh.getByDis(point,dis)
              for(let i2=0;i2<four.length;i2++){
                if(!this.grid.role[four[i2]]&&this.data.map.terrain[four[i2]]!='stop'){//可用
                  xy=four[i2]
                  break
                }else{
                  if(i2==four.length-1)tvs(point,dis+1)
                }
              }
            }
            tvs(xy,1)
          }
          role.xy=xy
          hero=role
          this.grid.role[xy]=role
          await lh.wait(100)
        }
      },
      //生成单个士兵
      initOne(id,name,xy,netid=null){
        //入场
        let role=JSON.parse(JSON.stringify(this.data.wo[name]))
        role.camp='wo'
        role.name=name
        role.hp=10//初始HP
        role.id=id//部队ID
        //lhnet
        if(this.isnet){
          role.netid=netid
          role.netname=lhnet.user[netid].name
        }

        //task 如果将领有soldier加成

        //绘制
        //坐标不可用
        if(this.grid.role[xy]||this.data.map.terrain[xy]=='stop'){
          let tvs=(point,dis)=>{
            let four=lh.getByDis(point,dis)
            for(let i2=0;i2<four.length;i2++){
              if(!this.grid.role[four[i2]]&&this.data.map.terrain[four[i2]]!='stop'){//可用
                xy=four[i2]
                break
              }else{
                if(i2==four.length-1)tvs(point,dis+1)
              }
            }
          }
          tvs(xy,1)
        }
        role.xy=xy
        this.grid.role[xy]=role
      },
      //搜索某个ID或名字的将领，返回坐标
      findHero(str){
        for(let k in this.grid.role){
          if(this.grid.role[k].command&&(this.grid.role[k].id==str||this.grid.role[k].name==str)){
            return k
          }
        }
        return null
      },
      //修改音量
      changeVolume(type,val){
        if(this.$refs.music)this.$refs.music.volume(type,val)
      },
      //操作说明
      explain(){
        this.$notify({
          title: '操作说明',
          dangerouslyUseHTMLString: true,
          message: '左键：选择<br>右键：取消<br>按住右键：拖拽地图<br>滚轮：放大缩小<br>回车键：联机聊天',
          duration: 0
        })
      },
      //成功
      win(){
        if(this.level<27){
          //资金和经验
          let exp=1000+(this.level-1)*100
          let money=this.level*1000
          this.$alert('获得全局经验'+exp+'，资金'+money+'P', '关卡完成', {
            confirmButtonText: '确定',
            callback: () => {
              this.data.save.exp+=exp
              this.data.save.money+=money
              this.data.save.level++
              this.data.save.shop=true
              //跳转
              lh.toUrl('game.html?level=2')
            }
          })
        }else{
          this.$notify({
            title: '提示',
            message: '游戏通关。',
            duration: 0
          })
          this.grid.role={}
        }
      },
      //失败
      fail(){
        this.$notify({
          title: '提示',
          message: '任务失败，请读档或重新开始。',
          duration: 0
        })
        this.grid.role={}
      },
  }
})