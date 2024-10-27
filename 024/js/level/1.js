var lvjs={
  first:{
    at:[],
    bat:[]
  },
  vu:null,
  //存档读取
  load(data){
    const vu=this.vu
    this.first=data.first
    vu.round.lock=false
    vu.round.turn='wo'
    vu.$refs.music.set('asset/music/流浪的骑士.mp3')
  },
  init(vu){
    this.vu=vu
  },
  //关卡开始前
  async beforeBegin(){
    const vu=this.vu
    vu.$refs.music.set('asset/music/流浪的骑士.mp3')
  },
  //关卡开始
  async begin(){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)

    //设置友方和敌方的趋势
    vu.grid.role['12,10'].tend={type:'move',des:'2,10',noatk:true}//村民
    vu.grid.role['5,4'].tend={type:'stop',noatk:true}//莉娅娜

    await lh.moveToCenter('14,21')

    await vu.$refs.dialog.main([
      {dia:'不，不好了，艾尔文！',name:'海恩',img:hero['海恩'].avatar},
      {dia:'怎么了，海恩？',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'雷卡尔特帝国的骑士团从村外打进来了！',name:'海恩',img:hero['海恩'].avatar},
      {dia:'村外？！海恩你从小一起长大的好朋友不是住在那附近吗？',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'就是啊！所以不快点去救她的话她就危险了！',name:'海恩',img:hero['海恩'].avatar},
      {dia:'艾尔文你的剑术很好吧？所以求你帮帮我吧！',name:'海恩',img:hero['海恩'].avatar},
      {dia:'知道了。马上就去！',name:'艾尔文',img:hero['艾尔文'].avatar},
    ])
  },
  //我方回合
  async woTurn(){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
    vu.$refs.music.set('asset/music/流浪的骑士.mp3')

    if(vu.round.num==2){
      for(let k in vu.grid.role){
        if(vu.grid.role[k].name=='海恩'){
          await lh.moveToCenter(k)
          break
        }
      }

      await vu.$refs.dialog.main([
        {dia:'大势不妙啊艾尔文。帝国的那帮人，想要将莉娅娜带走啊！',name:'海恩',img:hero['海恩'].avatar},
        {dia:'究竟是怎么回事？',name:'艾尔文',img:hero['艾尔文'].avatar},
        {dia:'算了，待会儿再想吧。总之要赶快！',name:'艾尔文',img:hero['艾尔文'].avatar}
      ])

      //自警团
      vu.grid.role['27,4'].tend={type:'move',des:'25,4',noatk:true}
      vu.grid.role['28,6'].tend={type:'move',des:'25,6',noatk:true}
      vu.grid.role['29,3'].tend={type:'move',des:'27,3',noatk:true}
      
      //利昂
      for(let k in vu.grid.role){
        if(vu.grid.role[k].name=='利昂')delete vu.grid.role[k].tend
        if(vu.grid.role[k].name=='利亚德')delete vu.grid.role[k].tend
      }
    }

    if(vu.round.num==3){
      //自警团
      if(vu.grid.role['25,4'])vu.grid.role['25,4'].tend={type:'move',des:'28,4'}

      //巴尔多
      vu.grid.role['4,8'].tend={type:'attack',des:'22,16'}
    }
  },
  //友方回合
  async friendTurn(){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
    if(vu.round.num==1){
      await lh.moveToCenter('12,10')

      await vu.$refs.dialog.main([
        {dia:'救命啊！',name:'村民',img:hero['村民'].avatar}
      ])

      await lh.moveToCenter('17,13')

      await vu.$refs.dialog.main([
        {dia:'利昂大人！村民怎么处置？我们的行动暴露了！',name:'帝国军指挥官',img:hero['帝国军指挥官'].avatar},
      ])

      await lh.moveToCenter('13,7')

      await vu.$refs.dialog.main([
        {dia:'不要作无益的杀戮。我们的任务不是杀人。',name:'利昂',img:hero['利昂'].avatar},
      ])

      await lh.moveToCenter('15,10')

      await vu.$refs.dialog.main([
        {dia:'你只要确保巴尔多的退路即可！',name:'利亚德',img:hero['利亚德'].avatar},
        {dia:'遵命！',name:'帝国军指挥官',img:hero['帝国军指挥官'].avatar},
      ])
    }
  },
  //敌方回合
  async enemyTurn(){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
    vu.$refs.music.set('asset/music/利昂.mp3')

    //目标中移除莉娅娜和村民
    let posi=[]
    for(let k in vu.grid.role){
      if(vu.grid.role[k].name=='莉娅娜'||vu.grid.role[k].name=='村民')posi.push(k)
    }
    for(let i=0;i<posi.length;i++){
      let idx=vu.round.target.indexOf(posi[i])
      if(idx!=-1){
        vu.round.target.splice(idx,1)
      }
    }

    if(vu.round.num==1){
      await lh.moveToCenter('5,8')

      await vu.$refs.dialog.main([
        {dia:'利昂大人，发现要找的那个小姑娘了！',name:'巴尔多',img:hero['巴尔多'].avatar}
      ])

      await lh.moveToCenter('5,4')

      await vu.$refs.dialog.main([
        {dia:'！？',name:'莉娅娜',img:hero['莉娅娜'].avatar}
      ])

      await lh.moveToCenter('13,7')

      await vu.$refs.dialog.main([
        {dia:'唔，快点。',name:'利昂',img:hero['利昂'].avatar}
      ])

      await lh.moveToCenter('5,8')

      await vu.$refs.dialog.main([
        {dia:'你就是莉娅娜吧。要命就乖乖地跟我们去帝国一趟。',name:'巴尔多',img:hero['巴尔多'].avatar},
        {dia:'我…，找我有什么事…？',name:'莉娅娜',img:hero['莉娅娜'].avatar},
        {dia:'事出突然非常抱歉。',name:'利昂',img:hero['利昂'].avatar},
        {dia:'我是统领雷卡尔特帝国青龙骑士团的利昂。奉命行事，特此前来迎接你去帝国。',name:'利昂',img:hero['利昂'].avatar},
        {dia:'我……？',name:'莉娅娜',img:hero['莉娅娜'].avatar},
        {dia:'贝伦哈尔特陛下正在等你。你能不能前往帝都……',name:'利昂',img:hero['利昂'].avatar},
        {dia:'……如果我跟你们走，你能向我保证不袭击村里的人吗？',name:'莉娅娜',img:hero['莉娅娜'].avatar},
        {dia:'当然，在不光彩的劫持女性后，若再杀害手无寸铁的村民，这种令自己蒙羞的事我绝不会干。',name:'利昂',img:hero['利昂'].avatar},
        {dia:'只是……，胆敢反抗我们的人一律格杀勿论。',name:'利昂',img:hero['利昂'].avatar},
        {dia:'我明白了……那么我和你们一起走吧。',name:'莉娅娜',img:hero['莉娅娜'].avatars.heavy},
        {dia:'……谢谢。请让我表示感谢。',name:'利昂',img:hero['利昂'].avatar},
      ])

      //修改趋势
      vu.grid.role['5,8'].tend={type:'move',des:'5,5',noatk:true}
      //利昂、利亚德
      vu.grid.role['13,7'].tend={type:'move',des:'18,6'}
      vu.grid.role['15,10'].tend={type:'move',des:'21,9'}
    }

    if(vu.round.num==2){
      //巴尔多
      vu.grid.role['5,5'].tend={type:'stop'}

      await lh.moveToCenter('5,5')

      await vu.$refs.dialog.main([
        {dia:'哼，太无聊了。连剑都不让用的作战真没意思！',name:'巴尔多',img:hero['巴尔多'].avatar},
        {dia:'机会难得。吓唬一下那边的小丫头们！',name:'巴尔多',img:hero['巴尔多'].avatar},
        {dia:'不要！你为什么不遵守约定！',name:'莉娅娜',img:hero['莉娅娜'].avatars.angry},
        {dia:'吵死了！抓到你后，我可就用不着管那些鸟事了！',name:'巴尔多',img:hero['巴尔多'].avatar}
      ])

      //移动巴尔多
      vu.calReach('5,5',5,'run')
      await vu.move('5,5','4,8')

      await vu.$refs.dialog.main([
        {dia:'喂！闪开！别挡道！',name:'巴尔多',img:hero['巴尔多'].avatar},
        {dia:'呀！救命啊！',name:'村民',img:hero['村民'].avatars.hurt},
        {dia:'住手，巴尔多！不要擅自行动！',name:'利亚德',img:hero['利亚德'].avatar},
      ])

      //巴尔多攻击村民
      await vu.attack('4,8','4,9')

      await vu.$refs.dialog.main([
        {dia:'呀~！',name:'村民',img:hero['村民'].avatars.hurt},
        {dia:'太过分了！为什么要做那样的事……',name:'莉娅娜',img:hero['莉娅娜'].avatars.angry},
        {dia:'住嘴，小丫头！不给你点苦头吃就不知道老实吗！',name:'巴尔多',img:hero['巴尔多'].avatar},
        {dia:'还不住手！！混帐！我说过不可滥杀无辜的！',name:'利昂',img:hero['利昂'].avatars.angry},
        {dia:'决不允许你再有这样的举动！我的部队不需要无视军规的人！！',name:'利昂',img:hero['利昂'].avatars.angry},
        {dia:'……是!非，非常的抱歉。',name:'巴尔多',img:hero['巴尔多'].avatar},
      ])
    }
  },
  //AI将领行动前
  async beforeHero(xy){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)

    if(vu.round.num==1){
      if(xy=='13,7'){
        await lh.moveToCenter('27,4')
        
        //自警团编队
        let troops=[{
          "id":"friend3",
          "xy": "27,4",
          "hero": "自警团",
          "soldier": ["枪兵","枪兵","枪兵","枪兵"]
        },
        {
          "id":"friend4",
          "xy": "28,6",
          "hero": "自警团",
          "soldier": ["枪兵","枪兵","枪兵","枪兵"]
        },
        {
          "id":"friend5",
          "xy": "29,3",
          "hero": "司祭",
          "soldier": ["卫兵", "卫兵", "卫兵", "卫兵"]
        }]
        for(let i=0;i<troops.length;i++){
          await vu.initTroops(troops[i],'friend')
        }
        
        await vu.$refs.dialog.main([
          {dia:'住手！！我不会让你们在这村子里胡作非为的！',name:'自警团',img:hero['自警团'].avatar}
        ])

        await lh.moveToCenter('15,10')

        await vu.$refs.dialog.main([
          {dia:'利昂大人。村里的自警团来了！',name:'利亚德',img:hero['利亚德'].avatar},
          {dia:'很快啊……但是不用在意什么自警团。继续执行作战任务！',name:'利昂',img:hero['利昂'].avatar},
          {dia:'说什么！！我会让你们后悔只带了这么点人马来！',name:'自警团',img:hero['自警团'].avatar},
          {dia:'哼，有意思。',name:'利昂',img:hero['利昂'].avatar},
          {dia:'利亚德跟我上！将敌人一扫而光！！',name:'利昂',img:hero['利昂'].avatar},
          {dia:'是！',name:'利亚德',img:hero['利亚德'].avatar},
        ])

        await vu.$refs.dialog.main([
          {dia:'那么，我在这里掩护巴尔多大人撤退！',name:'帝国军指挥官',img:hero['帝国军指挥官'].avatar},
          {dia:'……你这是头一次上战场吧…而且还是这种劫持女性的战斗，抱歉了。',name:'利昂',img:hero['利昂'].avatar},
          {dia:'请大人不必放在心上我能和利昂大人共同战斗已经感到很荣幸了。',name:'帝国军指挥官',img:hero['帝国军指挥官'].avatar},
          {dia:'谢谢。但是，不要勉强。',name:'利昂',img:hero['利昂'].avatar},
        ])
      }
    }

    if(vu.round.num==2){
      if(xy=='27,4'){
        await lh.moveToCenter(xy)
        
        await vu.$refs.dialog.main([
          {dia:'这个村庄由我们来保护！',name:'自警团',img:hero['自警团'].avatar}
        ])
      }

      //利亚德
      if(vu.grid.role[xy].id=='enemy4'){
        await lh.moveToCenter(xy)
        
        await vu.$refs.dialog.main([
          {dia:'跟上利昂大人！冲啊！',name:'利亚德',img:hero['利亚德'].avatar},
          {dia:'要小心，利亚德。对方部队的编制是枪兵。',name:'利昂',img:hero['利昂'].avatar},
          {dia:'我用波状攻击打开突破口直接攻击敌人的指挥官',name:'利亚德',img:hero['利亚德'].avatar},
          {dia:'唔。',name:'利昂',img:hero['利昂'].avatar},
        ])
      }
      
      //帝国军指挥官
      if(vu.grid.role[xy].id=='enemy2'){
        await lh.moveToCenter(xy)

        await vu.$refs.dialog.main([
          {dia:'见鬼！就他们这点人，我自己一人就能打败……',name:'帝国军指挥官',img:hero['帝国军指挥官'].avatar},
          {dia:'你是头次上战场。不要勉强，让受伤的部下回到你自己的身边，那样毎回合部下的体力就会恢复少许。',name:'利亚德',img:hero['利亚德'].avatar},
          {dia:'总之要爱护兵士。若不那样的话，是无法在战场上生存的。',name:'利亚德',img:hero['利亚德'].avatar},
          {dia:'遵命！',name:'帝国军指挥官',img:hero['帝国军指挥官'].avatar},
        ])
      }
    }

    if(vu.round.num==3){
      if(vu.grid.role[xy].id=='friend3'){
        await lh.moveToCenter(xy)

        await vu.$refs.dialog.main([
          {dia:'对手果然很强啊!在领主到来之前，一边回复部队体力一边战斗!',name:'司祭',img:hero['司祭'].avatar},
          {dia:'是啊。连枪兵都抵挡不住，看来传说中最强的骑士团果然名不虚传。',name:'自警团',img:hero['自警团'].avatar},
        ])
      }
      
      //巴尔多
      if(vu.grid.role[xy].id=='enemy1'){
        await lh.moveToCenter(xy)

        await vu.$refs.dialog.main([
          {dia:'走啊，快点跟上！小丫头！',name:'巴尔多',img:hero['巴尔多'].avatar}
        ])
      }
    }
  },
  //将领移动后
  async afterMove(to){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)

    if(vu.round.num==1){
      if(to=='5,5'){
        await lh.moveToCenter('5,8')

        await vu.$refs.dialog.main([
          {dia:'喂，乖乖的跟我来！',name:'巴尔多',img:hero['巴尔多'].avatar},
          {dia:'好痛！不用你这么使劲拉，我也会跟你走的。',name:'莉娅娜',img:hero['莉娅娜'].avatar},
          {dia:'哼！都成俘虏了小丫头还那么横！',name:'巴尔多',img:hero['巴尔多'].avatar},
          {dia:'好，带她回帝国吧。但是要注意你的举止。',name:'利昂',img:hero['莉娅娜'].avatar},
          {dia:'是……以后我会注意的。',name:'巴尔多',img:hero['巴尔多'].avatar}
        ])
      }
    }

    //巴尔多成功逃离
    if(vu.grid.role[to].id=='enemy1'&&lh.calDis(to,'31,23')<4){
      await vu.$refs.dialog.main([
        {dia:'好、作战结束。返回大部队。',name:'利昂',img:hero['利昂'].avatar},
        {dia:'你是叫艾尔文吧、小子！虽然气势不小、却是个什么都干不了的家伙么。哈~哈~哈……',name:'巴尔多',img:hero['巴尔多'].avatar},
        {dia:'呃、怎么会这样……',name:'艾尔文',img:hero['艾尔文'].avatar},
      ])
      vu.fail()
    }
  },
  //AI部队行动结束后
  async afterTroops(xy){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)

    //莉娅娜跟随巴尔多
    if(vu.round.num>=2&&vu.grid.role[xy].name=='巴尔多'){
      vu.round.turn='wo'//防止更新位置
      let lynPosi,betPosi
      for(let k in vu.grid.role){
        if(vu.grid.role[k].name=='莉娅娜')lynPosi=k
        if(vu.grid.role[k].name=='巴尔多')betPosi=k
      }
      let lynRole=vu.grid.role[lynPosi]
      vu.calReach(lynPosi,lynRole.mov,lynRole.move)
      await vu.approach(lynPosi,betPosi)
      vu.round.turn='enemy'
    }
  },
  //攻击前
  async beforeAttack(from,target){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)

    //=========攻击=========
      //艾尔文-帝国军指挥官
      if(this.first.at.indexOf('wo1-enemy2')==-1&&vu.grid.role[from].id=='wo1'&&vu.grid.role[target].id=='enemy2'){
        await vu.$refs.dialog.main([
          {dia:'我不会再让你们为所欲为的！',name:'艾尔文',img:hero['艾尔文'].avatars.angry},
        ])
        this.first.at.push('wo1-enemy2')
      }
      //艾尔文-巴尔多
      if(this.first.at.indexOf('wo1-enemy1')==-1&&vu.grid.role[from].id=='wo1'&&vu.grid.role[target].id=='enemy1'){
        await vu.$refs.dialog.main([
          {dia:'站住！',name:'艾尔文',img:hero['艾尔文'].avatars.angry},
          {dia:'你这家伙想怎样！不想死的话，快滚！',name:'巴尔多',img:hero['巴尔多'].avatar},
          {dia:'啊，求你了！不要管我快逃吧！',name:'莉娅娜',img:hero['莉娅娜'].avatars.heavy},
          {dia:'由于我的原因，连无辜的人也被牵连……',name:'莉娅娜',img:hero['莉娅娜'].avatars.heavy},
          {dia:'等一下！我一定救你出来。',name:'艾尔文',img:hero['艾尔文'].avatar},
          {dia:'哼！可恶，自作聪明的家伙！',name:'巴尔多',img:hero['巴尔多'].avatar},
        ])
        this.first.at.push('wo1-enemy1')
      }
      //艾尔文-利昂
      if(this.first.at.indexOf('wo1-enemy3')==-1&&vu.grid.role[from].id=='wo1'&&vu.grid.role[target].id=='enemy3'){
        await vu.$refs.dialog.main([
          {dia:'为什么？为什么身为青龙骑士团的骑士会劫持一名孤身女子！',name:'艾尔文',img:hero['艾尔文'].avatar},
          {dia:'关于作战内容怎么可以外泄。',name:'利昂',img:hero['利昂'].avatar},
          {dia:'我听说青龙骑士团不仅仅是强大、而且还是最重视骑士道精神的骑士团。那你们为什么要做这样的事！',name:'艾尔文',img:hero['艾尔文'].avatar},
          {dia:'你什么都不知道的话就不要胡说！我们也不希望做这样的事！我们是奉了巴恩哈特陛下的命令，才执行这样的任务！！',name:'利亚德',img:hero['利亚德'].avatar},
          {dia:'别说了利亚德。无论说什么、我们正在做的事情也是让人感到耻辱的。只是、无论发生什么情况这次的作战任务是一定要成功。抱歉了，你们给我死在这里吧。',name:'利昂',img:hero['利昂'].avatar},
        ])
        this.first.at.push('wo1-enemy3')
      }
      //海恩-巴尔多
      if(this.first.at.indexOf('wo2-enemy1')==-1&&vu.grid.role[from].id=='wo2'&&vu.grid.role[target].id=='enemy1'){
        await vu.$refs.dialog.main([
          {dia:'莉娅娜、我来救你了！',name:'海恩',img:hero['海恩'].avatar},
        ])
        this.first.at.push('wo2-enemy1')
      }
      //海恩-帝国军指挥官
      if(this.first.at.indexOf('wo2-enemy2')==-1&&vu.grid.role[from].id=='wo2'&&vu.grid.role[target].id=='enemy2'){
        await vu.$refs.dialog.main([
          {dia:'帝国兵！快点滚回你们的国家去！',name:'海恩',img:hero['海恩'].avatars.angry},
        ])
        this.first.at.push('wo2-enemy2')
      }
      //自警团
      if(this.first.at.indexOf('friend3')==-1&&vu.grid.role[from].id=='friend3'){
        await vu.$refs.dialog.main([
          {dia:'竟敢小瞧我们！',name:'自警团',img:hero['自警团'].avatar},
        ])
        this.first.at.push('friend3')
      }
      //利昂
      if(this.first.at.indexOf('enemy3')==-1&&vu.grid.role[from].id=='enemy3'){
        await vu.$refs.dialog.main([
          {dia:'哼……干得不错啊。但是、你还能坚持抵挡多久呢！',name:'利昂',img:hero['利昂'].avatar},
        ])
        this.first.at.push('enemy3')
      }
      //利亚德
      if(this.first.at.indexOf('enemy4')==-1&&vu.grid.role[from].id=='enemy4'){
        await vu.$refs.dialog.main([
          {dia:'就算你带枪兵我们青龙骑士团也不会怯阵的!',name:'利亚德',img:hero['利亚德'].avatar},
        ])
        this.first.at.push('enemy4')
      }
      //帝国军指挥官
      if(this.first.at.indexOf('enemy2')==-1&&vu.grid.role[from].id=='enemy2'){
        await vu.$refs.dialog.main([
          {dia:'上啊！！',name:'帝国军指挥官',img:hero['帝国军指挥官'].avatar},
        ])
        this.first.at.push('enemy2')
      }
      //巴尔多-艾尔文|海恩
      if(this.first.at.indexOf('enemy1')==-1&&vu.grid.role[from].id=='enemy1'&&(vu.grid.role[target].id=='wo1'||vu.grid.role[target].id=='wo2')){
        await vu.$refs.dialog.main([
          {dia:'竟然想阻拦我巴尔多大人，愚蠢的家伙！来得正好，我正感觉不够刺激哪，让我好好的陪你玩玩!!',name:'巴尔多',img:hero['巴尔多'].avatar},
        ])
        this.first.at.push('enemy1')
      }

    //==========受攻击==========
      //帝国军指挥官
      if(this.first.bat.indexOf('enemy2')==-1&&vu.grid.role[target].id=='enemy2'){
        await vu.$refs.dialog.main([
          {dia:'我不会输的！',name:'帝国军指挥官',img:hero['帝国军指挥官'].avatar},
        ])
        this.first.bat.push('enemy2')
      }
      //自警团
      if(vu.grid.role[from].id=='enemy4'){
        if((vu.grid.role[target].id=='friend3'&&this.first.bat.indexOf('friend3')==-1)||(vu.grid.role[target].id=='friend4'&&this.first.bat.indexOf('friend4')==-1)){
          await vu.$refs.dialog.main([
            {dia:'有趣！那你来试试！',name:'自警团',img:hero['自警团'].avatar},
          ])
          this.first.bat.push('friend3')
          this.first.bat.push('friend4')
        }
      }
  },
  //将领死亡前
  async beforeDie(role){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)

    //帝国军指挥官
    if(role.id=='enemy2'){
      await vu.$refs.dialog.main([
        {dia:'利…利昂大人对不起……',name:'帝国军指挥官',img:hero['帝国军指挥官'].avatars.hurt},
        {dia:'唉！竟然让他死了……',name:'利昂',img:hero['利昂'].avatar},
      ])
    }
    //巴尔多
    if(role.id=='enemy1'){
      await vu.$refs.dialog.main([
        {dia:'混蛋…利昂大人……',name:'巴尔多',img:hero['巴尔多'].avatars.hurt},
      ])
    }
    //司祭
    if(role.id=='friend5'){
      await vu.$refs.dialog.main([
        {dia:'哇~！',name:'司祭',img:hero['司祭'].avatars.hurt},
      ])
    }
    //自警团
    if(role.id=='friend3'||role.id=='friend4'){
      await vu.$refs.dialog.main([
        {dia:'哇！',name:'自警团',img:hero['自警团'].avatars.hurt},
      ])
    }
  },
  async afterDie(role){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)

    //如果援军都凉了
    if(role.id=='friend3'||role.id=='friend4'||role.id=='friend5'){
      let allGG=true
      for(let k in vu.grid.role){
        let v=vu.grid.role[k].id
        if(v=='friend3'||v=='friend4'||v=='friend5'){
          allGG=false
          break
        }
      }
      if(allGG){
        await vu.$refs.dialog.main([
          {dia:'好，现在我们去掩护巴尔多！',name:'利昂',img:hero['利昂'].avatar},
          {dia:'是！',name:'利亚德',img:hero['利亚德'].avatar},
        ])
      }
    }
    //巴尔多
    if(role.id=='enemy1'){
      await vu.$refs.dialog.main([
        {dia:'什么！？失败了……',name:'利昂',img:hero['利昂'].avatar},
      ])

      vu.$refs.music.set('asset/music/援军.mp3')

      //罗伦、斯科特登场
      let troops=[{
        "id":"friend6",
        "xy": "25,4",
        "hero": "罗伦",
        "soldier": ["重装枪兵","重装枪兵","重装枪兵","重装枪兵"]
      },
      {
        "id":"friend7",
        "xy": "30,4",
        "hero": "斯科特",
        "soldier": ["步兵","步兵","步兵","步兵"]
      },
      {
        "id":"friend8",
        "xy": "28,3",
        "hero": "龙骑统帅",
        "soldier": ["骑兵", "骑兵", "骑兵", "骑兵"]
      },
      {
        "id":"friend9",
        "xy": "27,5",
        "hero": "龙骑统帅",
        "soldier": ["骑兵", "骑兵", "骑兵", "骑兵"]
      }]
      for(let i=0;i<troops.length;i++){
        await vu.initTroops(troops[i],'friend')
      }
      
      await lh.moveToCenter('25,4')

      //如果利昂、利亚德都存活
      let liang=null,liyade=null
      for(let k in vu.grid.role){
        let v=vu.grid.role[k]
        if(v.command&&v.id=='enemy3')liang=k
        if(v.command&&v.id=='enemy4')liyade=k
      }
      if(liang&&liyade){
        await vu.$refs.dialog.main([
          {dia:'竟敢在我的领地内为所欲为，不可饶恕。',name:'罗伦',img:hero['罗伦'].avatar},
          {dia:'把他们赶出村子！',name:'斯科特',img:hero['斯科特'].avatar},
          {dia:'是领主大人的部队！',name:'海恩',img:hero['海恩'].avatar},
        ])
        
        //利亚德
        await lh.moveToCenter(liyade)

        await vu.$refs.dialog.main([
          {dia:'敌人的援军来了！',name:'利亚德',img:hero['利亚德'].avatar},
          {dia:'情况不妙……没办法，撤退！',name:'利昂',img:hero['利昂'].avatar},
          {dia:'是！',name:'利亚德',img:hero['利亚德'].avatar},
        ])

        //撤退
        for(let k in vu.grid.role){
          let v=vu.grid.role[k].id
          if(v=='enemy3'||v=='enemy4')delete vu.grid.role[k]
        }
      }else{//如果利昂、利亚德有人撤退
        await vu.$refs.dialog.main([
          {dia:'竟敢在我的领地内随便…嗯？！',name:'罗伦',img:hero['罗伦'].avatar},
          {dia:'厉害……就他们那几个人竟然把青龙骑士团的人打败了！',name:'斯科特',img:hero['斯科特'].avatar},
          {dia:'唔、的确是啊。看来我们来得太晚了。',name:'罗伦',img:hero['罗伦'].avatar},
        ])
      }

      await lh.wait(1000)
      
      //艾尔文
      await lh.moveToCenter(vu.findHero('wo1'))

      await vu.$refs.dialog.main([
        {dia:'好像已经没事了。',name:'艾尔文',img:hero['艾尔文'].avatar},
        {dia:'非常感谢您的帮助，剑士先生。',name:'莉娅娜',img:hero['莉娅娜'].avatar},
        {dia:'我是光之神殿的巫女，名叫莉娅娜，可以告诉我您的姓名吗？',name:'莉娅娜',img:hero['莉娅娜'].avatar},
        {dia:'我叫艾尔文，正在四处旅行……',name:'艾尔文',img:hero['艾尔文'].avatar},
        {dia:'艾尔文先生，真的非常感谢你的帮助。我简直不知道该如何感谢你才好……',name:'莉娅娜',img:hero['莉娅娜'].avatar},
        {dia:'不，别客气。你有没有受伤？',name:'艾尔文',img:hero['艾尔文'].avatar},
        {dia:'不要紧的。艾尔文先生您……',name:'莉娅娜',img:hero['莉娅娜'].avatar},
        {dia:'别那么称呼，就叫我艾尔文好了。',name:'艾尔文',img:hero['艾尔文'].avatar},
        {dia:'那么，也请你叫我莉娅娜吧。',name:'莉娅娜',img:hero['莉娅娜'].avatar},
        {dia:'不愧是艾尔文！真的很厉害啊！太帅了！',name:'海恩',img:hero['海恩'].avatar},
        {dia:'海恩，谢谢你来救我。',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      ])

      await lh.moveToCenter('25,4')

      await vu.$refs.dialog.main([
        {dia:'喂，诸位，大家都没事吧。待在这里的话，刚才的那些家伙说不定会再来找麻烦。',name:'罗伦',img:hero['罗伦'].avatar},
        {dia:'总之先到我在萨尔拉斯城的住处躲一下吧。',name:'罗伦',img:hero['罗伦'].avatar},
        {dia:'是啊，那我们马上出发吧。',name:'艾尔文',img:hero['艾尔文'].avatar},
      ])

      //斯科特加入队伍
      vu.data.save.hero['斯科特']=JSON.parse(JSON.stringify(vu.data.hero.wo['斯科特']))

      vu.win()
    }
    //艾尔文
    if(role.id=='wo1'){
      await vu.$refs.dialog.main([
        {dia:'唔……到此为止了吗……',name:'艾尔文',img:hero['艾尔文'].avatars.hurt},
      ])
      vu.fail()
    }
    //海恩
    if(role.id=='wo2'){
      await vu.$refs.dialog.main([
        {dia:'已经不行了……艾尔文、以后就靠你了！',name:'海恩',img:hero['海恩'].avatars.hurt},
      ])
    }
    //利昂
    if(role.id=='enemy3'){
      await vu.$refs.dialog.main([
        {dia:'不、不可能！！作为青龙骑士团团长的我竟然战败……',name:'利昂',img:hero['利昂'].avatars.hurt},
      ])
    }
    //利亚德
    if(role.id=='enemy4'){
      await vu.$refs.dialog.main([
        {dia:'利昂大人！',name:'利亚德',img:hero['利亚德'].avatars.hurt},
        {dia:'利昂：别勉强！下面的事我来！！',name:'利昂',img:hero['利昂'].avatars.hurt},
      ])
    }
  },
}