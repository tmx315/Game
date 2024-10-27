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
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)

    document.getElementById('map').style.filter='brightness(50%)'

    let aierwen={
      "id":"wo1",
      "xy": "12,23",
      "hero": "艾尔文",
      "soldier": []
    }
    await vu.initTroops(aierwen,'wo')

    await vu.$refs.dialog.main([
      {dia:'好安静啊。白天的激战仿佛像做梦一样……',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'可是，青龙骑士团为什么要抓莉娅娜呢，他们究竟想干什么？',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'而且还出动了雷卡尔特帝国內被誉为最强的骑士团，难道说莉娅娜对于他们来说有什么重要的事……',name:'艾尔文',img:hero['艾尔文'].avatar},
    ])

    vu.$refs.music.set('asset/music/莉娅娜.mp3')

    let liyana={
      "id":"friend1",
      "xy": "9,22",
      "hero": "莉娅娜",
      "soldier": []
    }
    await vu.initTroops(liyana,'friend')

    await vu.$refs.dialog.main([
      {dia:'你睡不着吗，艾尔文先生？',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      {dia:'啊……我在想今天的事。',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'那件事先不说，再称呼我时，能不能别加先生这个词。感觉很不习惯呢。',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'抱歉、不知不觉就……但是，真不可思议啊……',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      {dia:'这样两人在一起的时候……',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      {dia:'好像很久以前我就对艾尔文已经很熟悉了。',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      {dia:'……究竟是为什么我还不清楚，但是如果我父亲还活着的话，我想一定会像艾尔文一样是一位坚强温柔的人。',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      {dia:'啊！请原谅。突然间说了奇怪的话……',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      {dia:'没关系。直到现在，莉娅娜也一直生活得很辛苦啊。我从海恩那儿都听说了。',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'嗯。在我还是婴儿时，就被丢弃在村内神殿的入口处了……',name:'莉娅娜',img:hero['莉娅娜'].avatars.heavy},
      {dia:'之后神殿内的人就收养了我，代替亲人把我抚养大。大家都对我很亲切，至于悲伤的事，想想几乎没有呢。',name:'莉娅娜',img:hero['莉娅娜'].avatars.heavy},
      {dia:'是这样啊……',name:'艾尔文',img:hero['艾尔文'].avatars.heavy},
      {dia:'艾尔文……艾尔文为什么要四处旅行呢？如果可以的话请告诉我。',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      {dia:'我并不是抱着什么了不起的目的旅行。在我还很小的时候，我父母就已经去世了……',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'之后、我父亲的属下，一个叫多林的人收养了我，一边旅行一边把我养大。',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'多林见多识广，教会了我很多东西。尤其是剑术方面，对我要求十分严格。',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'可惜他现在已经不在人世了。只是……',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'……只是？',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      {dia:'多林好像是被什么人杀死的……所以现在、我四处旅行也是为了寻找那个仇人。',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'是这样啊……对不起，让你想起了伤心的事……',name:'莉娅娜',img:hero['莉娅娜'].avatars.heavy},
      {dia:'别介意、不必道歉的。………夜已经很深了。请快休息吧。',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'嗯！晚安，艾尔文……',name:'莉娅娜',img:hero['莉娅娜'].avatar},
    ])

    document.getElementById('map').style.filter='none'
    vu.grid.role={}
    vu.$refs.music.set('asset/music/剧情提要.mp3')
  },
  //关卡开始
  async begin(){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)

    await lh.moveToCenter('20,20')

    await vu.$refs.dialog.main([
      {dia:'各位、昨晚睡得还好吧？',name:'罗伦',img:hero['罗伦'].avatar}
    ])

    await lh.moveToCenter('6,17')

    await vu.$refs.dialog.main([
      {dia:'嗯。我睡得很香呢。',name:'海恩',img:hero['海恩'].avatar},
      {dia:'但以后我们该做什么呢……帝国看样子是真的要对莉娅娜小姐动手啊……',name:'罗伦',img:hero['罗伦'].avatar},
      {dia:'要保护莉娅娜小姐就要与帝国为敌，我身为地方领主力不能及啊……',name:'罗伦',img:hero['罗伦'].avatar}
    ])

    await lh.moveToCenter('20,17')

    await vu.$refs.dialog.main([
      {dia:'但是我想帝国劫持莉娅娜小姐，一定是在密谋什么坏事吧。',name:'斯科特',img:hero['斯科特'].avatar},
      {dia:'最近的帝国，正在对各地进行大规模的侵略，恐怕是由于军事上的理由才要劫持莉娅娜小姐的！',name:'斯科特',img:hero['斯科特'].avatar},
      {dia:'同感。但是，该怎样才能保护莉娅娜小姐不受伤害，这倒这是个问题。',name:'罗伦',img:hero['罗伦'].avatar}
    ])

    await lh.moveToCenter('9,19')

    await vu.$refs.dialog.main([
      {dia:'请问……艾斯德鲁的光之大神殿也不行吗？',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      {dia:'我和那里的司祭大人见过几次面。从他们那里一定可以得到帮助来对抗帝国军的。',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      {dia:'对啊！在那里有很多本领高强的神官战士。',name:'海恩',img:hero['海恩'].avatar},
      {dia:'但是这儿离艾斯德鲁很远，莉娅娜一个人去会有危险。好，那我也一起去吧。',name:'海恩',img:hero['海恩'].avatar}
    ])

    await lh.moveToCenter('6,20')

    await vu.$refs.dialog.main([
      {dia:'帝国也还在搜寻莉娅娜吧！毕竟这旅行没有什么目标，我也陪你们一起去。',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'谢谢大家！',name:'莉娅娜',img:hero['莉娅娜'].avatar},
      {dia:'父亲大人！请允许我也一起去吧！我想一定会是个锻炼自己的好机会。',name:'斯科特',img:hero['斯科特'].avatar},
      {dia:'……唔。在旅途中可以增长些见识也好。难得的机会，那就好好的磨练自己吧。',name:'罗伦',img:hero['罗伦'].avatar},
      {dia:'那么艾尔文，莉娅娜就拜托你了。斯科特你也要小心……',name:'罗伦',img:hero['罗伦'].avatar},
      {dia:'是，父亲大人。',name:'斯科特',img:hero['斯科特'].avatar},
      {dia:'那么，现在就出发去神殿吧。会是段很长的旅途了……',name:'海恩',img:hero['海恩'].avatar}
    ])

    await lh.moveToCenter('9,21')

    //罗伦部下出现
    let troops=[
      {
        "id":"friend3",
        "xy": "9,21",
        "hero": "步兵指挥官",
        "soldier": ["步兵","步兵"]
      },
      {
        "id":"friend4",
        "xy": "17,21",
        "hero": "步兵指挥官",
        "soldier": ["步兵","步兵"]
      }
    ]
    for(let i=0;i<troops.length;i++){
      await vu.initTroops(troops[i],'friend')
    }

    vu.$refs.music.set('asset/music/新圣战.mp3')

    await lh.moveToCenter('20,20')

    await vu.$refs.dialog.main([
      {dia:'唔？！怎么了？',name:'罗伦',img:hero['罗伦'].avatar},
      {dia:'罗伦大人，有人埋伏在这附近！',name:'步兵指挥官',img:hero['步兵指挥官'].avatar},
    ])

    await lh.moveToCenter('13,27')

    //炎龙兵团的部队出现
    troops=[
      {
        "id":"enemy1",
        "xy": "13,27",
        "hero": "帝国骑兵指挥官",
        "soldier": ["步兵","步兵","步兵"]
      },
      {
        "id":"enemy2",
        "xy": "13,30",
        "hero": "兹鲁姆",
        "soldier": ["步兵","步兵","步兵","步兵"]
      },
      {
        "id":"enemy3",
        "xy": "9,30",
        "hero": "帝国步兵指挥官",
        "soldier": ["步兵","步兵","步兵","步兵"]
      },
      {
        "id":"enemy4",
        "xy": "17,30",
        "hero": "帝国步兵指挥官",
        "soldier": ["步兵","步兵","步兵","步兵"]
      }
    ]
    for(let i=0;i<troops.length;i++){
      await vu.initTroops(troops[i],'enemy')
    }

    await vu.$refs.dialog.main([
      {dia:'哈~哈~哈！竟然发现了。',name:'兹鲁姆',img:hero['兹鲁姆'].avatar},
      {dia:'本大人是炎龙兵团将军巴尔加斯大人的左右手，兹鲁姆队长。不好意思，那个小丫头我们抓定了！',name:'兹鲁姆',img:hero['兹鲁姆'].avatar},
      {dia:'糟糕！现在该怎么办？！',name:'艾尔文',img:hero['艾尔文'].avatar},
      {dia:'这里有我们挡着。大家和莉娅娜小姐一起，从后门撤退。',name:'罗伦',img:hero['罗伦'].avatar},
      {dia:'知道了。大家快走！',name:'艾尔文',img:hero['艾尔文'].avatar},
    ])
  },
  //我方回合
  async woTurn(){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
    vu.$refs.music.set('asset/music/新圣战.mp3')
  },
  //友方回合
  async friendTurn(){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
  },
  //敌方回合
  async enemyTurn(){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
    vu.$refs.music.set('asset/music/摩根.mp3')
  },
  //AI将领行动前
  async beforeHero(xy){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
  },
  //将领移动后
  async afterMove(to){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
  },
  //AI部队行动结束后
  async afterTroops(xy){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
  },
  //攻击前
  async beforeAttack(from,target){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
  },
  //将领死亡前
  async beforeDie(role){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
  },
  async afterDie(role){
    const vu=this.vu
    let hero={}
    Object.assign(hero,vu.data.hero.wo,vu.data.hero.enemy)
  },
}