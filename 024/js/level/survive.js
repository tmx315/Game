var lvjs={
  name:null,
  vu:null,
  wave:1,
  avatar:{},
  init(vu){
    this.vu=vu
  },
  //关卡开始前
  async beforeBegin(){
    const vu=this.vu
    this.name=vu.data.save.name

    vu.$refs.music.set('asset/music/流浪的骑士.mp3')
  },
  //关卡开始
  async begin(){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
    
    vu.grid.role['12,10'].tend={type:'move',des:'2,10',noatk:true}//村民

    await lh.moveToCenter('12,10')

    vu.$refs.dialog.main([
      {dia:'救命啊！',name:'村民',img:hero['村民']},
      {dia:'小心！有大量魔物袭击村子！保护好村民！！',name:this.name,img:hero['自警团'].avatar}
    ])
  },
  //我方回合
  async woTurn(){
    const vu=this.vu
    if([1,4,7].indexOf(this.wave)!=-1)vu.$refs.music.set('asset/music/流浪的骑士.mp3')
    if([2,5,8,10].indexOf(this.wave)!=-1)vu.$refs.music.set('asset/music/新圣战.mp3')
    if([3,6,9].indexOf(this.wave)!=-1)vu.$refs.music.set('asset/music/不屈.mp3')

    //lhnet
    if(vu.isnet){
      for(let k in vu.grid.role){
        if(vu.grid.role[k].command&&vu.grid.role[k].netid==lhnet.id){
          lh.moveToCenter(k)
        }
      }
    }

    if(vu.round.num==1&&this.wave>1){
      vu.$notify({
        title: '说明',
        message: '生存模式第'+this.wave+'波开始',
      })
      
      //新一波敌人
      vu.troops.enemy=vu.data.level.troops.enemy['wave'+this.wave]
      for(let i=0;i<vu.troops.enemy.length;i++){
        await vu.initTroops(vu.troops.enemy[i],'enemy')
      }

      vu.$refs.dialog.main([
        {dia:'┻━┻︵╰(‵□′)╯︵┻━┻',name:'魔物'},
        {dia:'又有魔物出现了！',name:this.name,img:hero['自警团'].avatar}
      ])
    }
  },
  //友方回合
  async friendTurn(){

  },
  //敌方回合
  async enemyTurn(){
    const vu=this.vu
    if([1,4,7].indexOf(this.wave)!=-1)vu.$refs.music.set('asset/music/伏兵.mp3')
    if([2,5,8].indexOf(this.wave)!=-1)vu.$refs.music.set('asset/music/波赞鲁.mp3')
    if([3,6,9].indexOf(this.wave)!=-1)vu.$refs.music.set('asset/music/恶灵.mp3')
    if(this.wave==10)vu.$refs.music.set('asset/music/利昂.mp3')
  },
  //AI将领行动前
  async beforeHero(xy){

  },
  //将领移动后
  async afterMove(to){

  },
  //AI部队行动结束后
  async afterTroops(xy){

  },
  //攻击前
  async beforeAttack(from,target){

  },
  //将领死亡前
  async beforeDie(role){
    const vu=this.vu
    //我方
    if(role.camp=='wo'){
      let name=role.netname?role.netname:this.name
      vu.$refs.dialog.main([
        {dia:'不！！',name,img:hero['自警团'].avatar}
      ])
      //lhnet
      if(role.netid&&role.netid==lhnet.id){
        vu.$notify({
          title: '说明',
          message: '撤退人员在一波结束后可重返战场。'
        })
      }
      return
    }
    //友方
    if(role.camp=='friend'){
      vu.$refs.dialog.main([
        {dia:'呀！！',name:'村民',img:hero['村民'].avatars.hurt},
      ])
      return
    }
    //敌方
    if(role.camp=='enemy'){
      vu.$refs.dialog.main([
        {dia:'Fu...c...',name:'魔物'},
      ])
      return
    }
  },
  //将领死亡后
  async afterDie(role){
    const vu=this.vu
    //我方
    if(role.camp=='wo'){
      //lhnet
      if(vu.isnet)lhnet.user[role.netid].live=false
      //判断我方还有人没
      for(let k in vu.grid.role){
        if(vu.grid.role[k].camp=='wo')return
      }
      //我方全灭
      vu.$notify({
        title: '说明',
        message: '游戏结束',
        duration: 0
      })
      return
    }
    //敌方
    if(role.camp=='enemy'){
      //判断敌方是否全灭
      vu.sur.troops={}
      let woHero={}
      for(let k in vu.grid.role){
        let role2=vu.grid.role[k]
        if(role2.camp=='enemy')return

        //是我方则编队
        if(role2.camp=='wo'){
          //加入我方队列
          if(role2.command)woHero[role2.id]=role2.netid
          //lhnet他人则跳过
          if(role2.netid&&role2.netid!=lhnet.id)continue
          //编队
          if(!vu.sur.troops[role2.id])vu.sur.troops[role2.id]={hero:null,soldier:[],xy:null,recruit:[]}
          //将领
          if(role2.command){
            vu.sur.troops[role2.id].hero=role2.name
            //获取出生位置
            for(let i=0;i<vu.troops.wo.length;i++){
              if(vu.troops.wo[i].id==role2.id)vu.sur.troops[role2.id].xy=vu.troops.wo[i].xy
            }
            //获取可雇佣士兵
            vu.sur.troops[role2.id].recruit=vu.data.hero[role2.name].recruit
          }else{//士兵
            vu.sur.troops[role2.id].soldier.push(role2.name)
          }
        }
      }
      //敌方全灭
      //通关
      if(this.wave==10){
        vu.$notify({
          title: '说明',
          message: '成功通关',
          duration: 0
        })
        return
      }
      //下一波
      this.wave++
      vu.round.num=-2
      //复活死亡玩家
      for(let i=0;i<vu.troops.wo.length;i++){
        let wo=vu.troops.wo[i]
        //复活
        if(!woHero[wo.id]){
          if(vu.isnet)lhnet.user[wo.netid].live=true
          let temp=JSON.parse(JSON.stringify(wo))
          temp.soldier=[]
          vu.initTroops(temp,'wo')
          //加入到该玩家的sur.troops
          if(vu.isnet&&lhnet.id==wo.netid){
            vu.sur.troops[wo.id]={hero:wo.hero,soldier:[],xy:null,recruit:[]}
            //获取出生位置
            vu.sur.troops[wo.id].xy=wo.xy
            //获取可雇佣士兵
            vu.sur.troops[wo.id].recruit=vu.data.hero[wo.hero].recruit
          }
        }
      }
      //增加资金
      let money=this.wave*100
      if(money>500)money=500
      vu.sur.money+=money
      vu.$notify({
        title: '说明',
        message: '生存模式该轮结束，获得'+money+'资金，我方有三回合时间重新部署。',
      })
    }
  }
}