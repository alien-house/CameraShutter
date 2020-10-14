import * as PIXI from 'pixi.js'
import { gsap, Power2 } from "gsap";

export default class Shutter {

  constructor() {
    this.body = document.querySelector('body');
    this.triangleWidth = 5000; //耐えられる幅に設定
    this.triangleHeight = this.triangleWidth * 1.2;
    this.triangleHalfway = this.triangleWidth / 2;
    this.container = null;
    this.shutterlist = null;
    this.xpos = this.triangleWidth;
    this.ypos = this.xpos * 0.71;
    this.deg45 = 0.785398163397448;//45度
    this.durationIn = 0.8;
    this.startTL = undefined;
    let angles = new Array(8).fill(0);
    this.anglelist = angles.map(( value, i ) => this.deg45 * i);
  }

  init(container) {
    this.container = container;
    this.shutterlist = this.anglelist.map(obj =>{
      let tri = this.createTriangle(obj);
      this.container.addChild(tri);
      return tri;
    });
    this.setPos();
  }

  shutterStart(obj) {
    if(typeof this.startTL !== 'undefined') {
      this.startTL.kill();
    }
    let xpos = window.innerWidth / 2;
    let ypos = window.innerHeight / 2;
    this.startTL = gsap.timeline({
      repeat: 1,
      repeatDelay: 0.3,
      yoyo: true,
      yoyoEase:Power2.easeOut,
      defaults: {
        duration: this.durationIn,
        ease: Power2.easeInOut
      },
      onRepeat: () => {
        obj.onComplete();
      },
    });
    this.startTL.to(this.shutterlist, { x: xpos, y: ypos })
  }



  setPos() {
    let tl = gsap.timeline();
    tl.set(this.shutterlist[0], { x: `-=${this.xpos}`})
      .set(this.shutterlist[4], { x: `+=${this.xpos}`})
      .set(this.shutterlist[2], { y: `-=${this.xpos}`})
      .set(this.shutterlist[6], { y: `+=${this.xpos}`})
      .set(this.shutterlist[1], { x: `-=${this.ypos}`, y: `-=${this.ypos}`})
      .set(this.shutterlist[3], { x: `+=${this.ypos}`, y: `-=${this.ypos}`})
      .set(this.shutterlist[5], { x: `+=${this.ypos}`, y: `+=${this.ypos}`})
      .set(this.shutterlist[7], { x: `-=${this.ypos}`, y: `+=${this.ypos}`})
  }



  createTriangle(angle) {
    let tag = new PIXI.Graphics();
    tag.beginFill(0x1f1f1f, 1);
    tag.lineStyle(1, 0xFFFFFF, 1);
    tag.moveTo(this.triangleWidth, 0);
    tag.lineTo(this.triangleHalfway, this.triangleHeight);
    tag.lineTo(0, 0);
    tag.lineTo(this.triangleHalfway, 0);
    tag.closePath();
    tag.endFill();
    tag.pivot.x = this.triangleHalfway;
    tag.pivot.y = this.triangleHeight;
    tag.x = window.innerWidth / 2;
    tag.y = window.innerHeight / 2;
    tag.zIndex = 999;
    //rotationはラジアンで
    tag.rotation = angle;
    return tag;
  }



}

