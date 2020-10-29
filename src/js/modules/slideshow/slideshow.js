import * as PIXI from 'pixi.js'
import { gsap } from "gsap";
import Shutter from "./shutter";
export default class Slideshow {

  constructor() {
    this.body = document.querySelector('body');
    this.sprite = null;
    this.imgratio = null;
    this.zoomContainer = null;
    this.element = document.getElementById('canvas');
    this.cNum = 0;
    this.maxNum = 0;
    this.ssInterval = 3000; //6000
    this.data = [
      {
        "name": "slide01",
        "url": "./assets/images/slideshow/img01.jpg"
      },
      {
        "name": "slide02",
        "url": "./assets/images/slideshow/img02.jpg"
      },
      {
        "name": "slide03",
        "url": "./assets/images/slideshow/img03.jpg"
      },
      {
        "name": "slide04",
        "url": "./assets/images/slideshow/img04.jpg"
      },
      {
        "name": "slide05",
        "url": "./assets/images/slideshow/img05.jpg"
      },
      {
        "name": "slide06",
        "url": "./assets/images/slideshow/img06.jpg"
      },
    ];
  }

  init() {
    this.app = new PIXI.Application({
      width: document.body.clientWidth, height: document.documentElement.clientHeight, backgroundColor: 0x000000,
      autoStart: true,
      autoResize: true,
      antialias:true,
      resolution: devicePixelRatio,
    });

    this.maxNum = this.data.length - 1;
    //Pixi.jsのcanvas内でもスクロールできる設定
    this.app.renderer.plugins.interaction.autoPreventDefault = false;
    this.app.renderer.view.style.touchAction = 'auto';

    this.container = new PIXI.Container();
    //順序を変更可の設定
    this.container.sortableChildren = true;

    this.element.appendChild(this.app.view);
    this.app.stage.addChild(this.container);

    this.imageSpriteBoxes = [];
    this.slideWrapBoxes = [];
    this.slideZoom = [];
    window.addEventListener('resize', this.resize.bind(this));

    //シャッターオブジェクト生成
    this.shutter = new Shutter();

    //画像データのロード
    this.app.loader.add(this.data);
    this.app.loader.load((loader, resources) => {
      Object.keys(resources).forEach( (key) => {
        this.imageSpriteBoxes.push(new PIXI.Sprite(resources[key].texture))
      });
      this.build();
      this.resize();
    });
    //ブラウザタブの切り替え時にリセット
    document.addEventListener("visibilitychange", this.viewChanged.bind(this));
  }


  build() {
    let slideContainer = new PIXI.Container();
    const verticesX = this.app.screen.width / 2;
    const verticesY = this.app.screen.height / 2;

    this.imageSpriteBoxes.forEach( (slide, i) => {
      let slideWrap = new PIXI.Container();
      slideWrap.position.x = 0
      slideWrap.position.y = 0;
      this.slideWrapBoxes.push(slideWrap);

      this.zoomContainer = new PIXI.Container();
      //拡大を中央に
      this.zoomContainer.pivot.x = verticesX;
      this.zoomContainer.pivot.y = verticesY;
      this.zoomContainer.position.x = verticesX;
      this.zoomContainer.position.y = verticesY;
      this.slideZoom.push(this.zoomContainer);
      this.zoomContainer.addChild(slide);

      this.imgratio = slide.height / slide.width;
      this.cover_ratio = slide.width / slide.height;
      slideWrap.alpha = 0;

      slideWrap.addChild(this.zoomContainer);
      slideContainer.addChild(slideWrap);
    });

    this.container.addChild(slideContainer);
    this.shutter.init(this.container);
    this.firstExpression();
  }

  firstExpression() {
    this.slideWrapBoxes[this.cNum].alpha = 1;
    this.zooming();
    this.slideshowStart();
  }

  zooming() {
    this.slideZoom[this.cNum].scale.x = this.slideZoom[this.cNum].scale.y = 1;
    gsap.to(this.slideZoom[this.cNum].scale, {
      x:1.05,
      y:1.05,
      ease: "none",
      duration: (this.ssInterval / 1000) + 0.5
    });
  }

  //スライドショースタート
  slideshowStart() {
    this.setIntervalID = setInterval( () => {
      this.shutter.shutterStart({
        onComplete : () => {
          this.slideWrapBoxes[this.cNum].alpha = 0;
          if(this.cNum >= this.maxNum) {
            this.cNum = 0;
          } else {
            this.cNum++;
          };
          this.slideWrapBoxes[this.cNum].alpha = 1;
          this.zooming();
        }
      });
    }, this.ssInterval);

  }



  resize() {
    this.app.renderer.resize(document.body.clientWidth, document.documentElement.clientHeight);
    let appratio = this.app.screen.width / this.app.screen.height;
    const verticesX = this.app.screen.width / 2;
    const verticesY = this.app.screen.height / 2;
    this.zoomContainer.pivot.x = verticesX;
    this.zoomContainer.pivot.y = verticesY;
    this.zoomContainer.position.x = verticesX;
    this.zoomContainer.position.y = verticesY;
    this.imageSpriteBoxes.forEach( (slide) => {
      if(this.cover_ratio > appratio) {
        slide.width = this.cover_ratio * this.app.screen.height;
        slide.height = this.app.screen.height;
      } else {
        slide.width = this.app.screen.width;
        slide.height = this.imgratio * slide.width;
      }
      slide.position.x = -(slide.width / 2) + (this.app.screen.width / 2);
    });

  }



  viewChanged() {
    if (document.hidden) {
        this.hidden();
    } else {
        this.visible();
    }
  }

  hidden() {
    this.cNum = 0;
    this.slideWrapBoxes.forEach( (slide) => {
      slide.alpha = 0;
    });
    clearInterval(this.setIntervalID);
  }

  visible() {
    this.firstExpression();
  }


}

