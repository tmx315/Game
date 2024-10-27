//对话框,用法<loaf-dialog ref="dialog" @finish="func"></loaf-dialog>
//使用await则finish不需要
//this.$refs.dialog.main([{dia:'xxxxx',name:'你',img:'asset/image/you.png'},])
const loaf_dialog={
  data(){
    return {
      sel:0,
      dialog:null,
      finished:true,
      all:null
    }
  },
  methods:{
    main(dia){
      //return
      return new Promise((resolve,reject)=>{
        this.all=dia
        this.sel=0
        this.finished=false
        this.dialog=this.all[this.sel]
        let timer=setInterval(()=>{
          if(this.sel>=this.all.length){
            clearInterval(timer)
            resolve()
          }
        },300)
      })
    },
    next(){
      if(this.sel>=this.all.length-1){//对话结束，返回值
        this.finished=true
      }
      this.sel++
      this.dialog=this.all[this.sel]
    }
  },
  template:
    `<div v-if="!finished" class="loaf-dialog-background" @click="next">
      <div v-if="dialog" class="loaf-dialog-posi">
        <div class="loaf-dialog">
          <div class="loaf-dialog-main">{{dialog.dia}}</div>
          <div v-show="dialog.name" class="loaf-dialog-left">
            <div class="loaf-dialog-left-img">
              <img v-show="dialog.img" :src="dialog.img">
            </div>
            <span>{{dialog.name}}</span>
          </div>
        </div>
      </div>
    <div>`
}

//系统菜单，用法<loaf-menu @music="changeVolume"></loaf-menu>
//配合音乐组件，changeVolume(type,val){this.$refs.music.volume(type,val)}
const loaf_menu={
  data(){
    return {
      show:{
        main:true,
        sl:true,
        option:false
      },
      music:30,
      effect:30,
      type:'',
    }
  },
  created(){
    //处理选项显示
    let path=location.pathname
    if(path.indexOf('index.html')!=-1)this.show.main=false
    if(path.indexOf('hall.html')!=-1)this.show.sl=false
    if(lh.getUrl('type')=='net')this.show.sl=false
  },
  methods:{
    menu(command) {
      lh.playAudio('asset/effect/click2.mp3',this.effect)
      if(command=='option'){
        this.show.option=true
      }
      if(command=='back'){
        this.$confirm('是否退出到主菜单', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          lh.toUrl('index.html')
        }).catch(() => {

        })
      }
      if(command=='exit'){
        this.$confirm('是否退出游戏', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          location.href='/'
        }).catch(() => {

        })
      }
    },
    changeMusicVolume(val){
      this.changeVolume('music',val)
    },
    changeEffectVolume(val){
      this.changeVolume('effect',val)
    },
    changeVolume(type,val){
      this.$emit('music',type,val)
    }
  },
  template:
    `<div>
      <el-dropdown v-if="show.main" trigger="click" class="loaf-menu" @command="menu">
        <el-button style="width: 100px;" type="primary">
          菜单<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="option">选项</el-dropdown-item>
            <el-dropdown-item command="back">回主菜单</el-dropdown-item>
            <el-dropdown-item command="exit">退出游戏</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div v-if="show.option" class="loaf-popup">
        <div class="loaf-popup-content">
          <i class="el-icon-circle-close" @click="show.option=false"></i>
          <div style="display: flex;margin: 50px 0 0 25px;">
            <span class="demonstration" style="display: flex;justify-content: center;align-items: center;width: 100px;">音乐音量</span>
            <el-slider v-model="music" style="width: 300px;margin-left: 10px;" @input="changeMusicVolume"></el-slider>
          </div>
          <div style="display: flex;margin: 50px 0 0 25px;">
            <span class="demonstration" style="display: flex;justify-content: center;align-items: center;width: 100px;">音效音量</span>
            <el-slider v-model="effect" style="width: 300px;margin-left: 10px;" @input="changeEffectVolume"></el-slider>
          </div>
        </div>
      </div>
    </div>`
}

//音乐音效，用法<loaf-music ref="music"></loaf-music>
const loaf_music={
  data(){
    return {
      music:30,
      effect:30,
      timer:null,
      src:''
    }
  },
  mounted(){
    document.getElementById("loaf-music").volume=this.music/100
  },
  methods:{
    volume(type,val){
      this[type]=val
      if(type=='music'){
        document.getElementById("loaf-music").volume=this.music/100
      }
    },
    set(src){
      this.src=src
    },
    play(src){
      lh.playAudio(src,this.effect)
    }
  },
  template:`<audio id="loaf-music" autoplay loop :src="src"></audio>`
}

const vueCom=[
  {name:'loaf-dialog',com:loaf_dialog},
  {name:'loaf-menu',com:loaf_menu},
  {name:'loaf-music',com:loaf_music},
]