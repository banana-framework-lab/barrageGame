<template>
  <div class="type-game">
    <canvas
      id="container"
      style="margin:0px; padding:0px;"
    >
    </canvas>
  </div>
</template>

<script>

import { getBarrage } from "@/api/KuaiShou.js";

const _MAX_TARGET = 20; // 画面中一次最多出现的目标
export default {
  name: "PlanePage",
  data() {
    return {
      backgroundImage: null,
      backgroundY: 0,
      backgroundSpeed: 0.3,
      ctx: null,
      clientWidth: 0,
      clientHeight: 0,
      targetPool: [],
      bulletArr: [], // 屏幕中的子弹
      targetArr: [], // 存放当前目标
      planeImg: null,
      currentIndex: -1,
      score: 0,
      colors: ["#FFFF00", "#FF6666"],
      offsetTime: 0
    };
  },
  mounted() {
    let container = document.getElementById("container");
    const ratio = window.devicePixelRatio || 1;
    container.width = Math.floor(215 * ratio);
    container.height = Math.floor(384.5 * ratio);

    this.offsetTime = (new Date()).valueOf()

    this.clientWidth = container.width;
    this.clientHeight = container.height;

    this.backgroundImage = new Image();
    this.backgroundImage.src = require("@/assets/plane/background.jpg");
    this.backgroundImage.width = this.clientWidth
    this.backgroundImage.height = this.clientHeight

    this.ctx = container.getContext("2d")

    this.planeImg = new Image();
    this.planeImg.src = 'https://p2.a.yximgs.com/uhead/AB/2019/12/05/13/BMjAxOTEyMDUxMzIyMDVfNjIyODE3MTc4XzJfaGQxNzhfOTU5_s.jpg';

    for (let index = 0; index < _MAX_TARGET; index++) {
      this.targetArr.push({ status: 0 })
    }

    const _this = this
    function animloop() {
      _this.run();
      window.requestAnimationFrame(animloop);
    }
    animloop()

    setInterval(() => {
      this.run()
    }, 1000 / 60)

    setInterval(() => {
      this.autoShot()
    }, 500)

    this.getTargetList()
    setInterval(() => {
      this.getTargetList()
    }, 10000)

  },
  methods: {
    run() {
      if (!this.gameOver) {
        this.drawAll();
      } else {
        this.drawGameOver();
      }
    },
    drawAll() {
      this.ctx.clearRect(0, 0, this.clientWidth, this.clientHeight);
      this.drawBackground();
      this.generateTarget()
      this.drawBullet();
      this.drawTarget();
      this.drawPlane();
      this.drawScore();
    },
    drawBackground() {

      //循环运动
      this.backgroundY += this.backgroundSpeed;
      if (this.backgroundY >= this.clientHeight) {
        this.backgroundY = 0;
      }

      // 绘制背景
      this.ctx.drawImage(
        this.backgroundImage,
        0, this.backgroundY
      );
      //补空白
      this.ctx.drawImage(
        this.backgroundImage,
        0, this.clientHeight - this.backgroundY,
        this.clientWidth, this.backgroundY,
        0, 0,
        this.clientWidth, this.backgroundY
      );
    },
    drawPlane() {

      this.ctx.save();

      this.ctx.beginPath();
      this.ctx.arc(this.clientWidth / 2, this.clientHeight - 40, 20, 0, 2 * Math.PI);
      this.ctx.strokeStyle = '#ffffff'; // 设置绘制圆形边框的颜色
      this.ctx.lineWidth = 10;
      this.ctx.stroke();
      this.ctx.clip()
      this.ctx.drawImage(
        this.planeImg,
        this.clientWidth / 2 - 20,
        this.clientHeight - 40 - 20,
        40,
        40
      );

      this.ctx.closePath();

      this.ctx.restore();
    },
    generateTarget() {
      // 随机生成目标
      if (this.targetPool.length <= 0) {
        return;
      }
      let length = this.targetArr.filter((item) => { return item.status == 1 }).length;
      if (length < _MAX_TARGET) {
        for (let i = 0; i < _MAX_TARGET - length; i++) {
          let target = this.targetPool.pop();
          if (target) {
            const index = this.targetArr.findIndex((item) => { return item.status == 0 })
            if (index >= 0) {
              const img = new Image();
              img.src = target.image;

              this.targetArr[index] = {
                x: this.getRandomInt(
                  this.getTargetRadius(target.totalBlood),
                  this.clientWidth - this.getTargetRadius(target.totalBlood)
                ),
                y: this.getTargetRadius(target.totalBlood) * 2,
                name: target.name,
                image: img,
                totalBlood: target.totalBlood,
                actualBlood: target.totalBlood,
                blood: target.totalBlood,
                rotate: 0,
                status: 1,
                xWay: ((Math.floor(Math.random() * 50) + 1) % 2 == 0) ? 1 : -1,
                moveConstant: Math.random().toFixed(1)
              }
            }
          }
          if (this.targetPool.length > 0) {
            break;
          }
        }
      }
    },
    getRandomInt(n, m) {
      return Math.floor(Math.random() * (m - n + 1)) + n;
    },
    drawText(txt, x, y, color) {
      this.ctx.fillStyle = color;
      this.ctx.fillText(txt, x, y);
    },
    drawScore() {
      // 分数
      this.ctx.font = "13px 微软雅黑";
      this.drawText("击败数：" + String(this.score), 10, this.clientHeight - 10, "#fff");
    },
    getTargetRadius(blood) {
      if (blood >= 40) {
        return 28
      } else if (blood < 40 && blood >= 20) {
        return 20
      } else {
        return 13
      }
    },
    getTargetSpeed(blood) {
      if (blood >= 40) {
        return 0.2
      } else if (blood < 40 && blood >= 20) {
        return 0.5
      } else {
        return 1
      }
    },
    drawTarget() {
      // 逐帧画目标

      this.targetArr.forEach((item) => {
        if (item.status == 0) {
          return
        }

        this.ctx.save();

        this.ctx.translate(item.x, item.y); //设置旋转的中心点

        this.ctx.beginPath();

        // this.ctx.font = "11px 微软雅黑";

        // const name = item.name.slice(0, 5) + "...";
        // this.drawText(
        //   name,
        //   - name.length * 3,
        //   this.getTargetRadius(item.blood) * 2,
        //   "yellow"
        // );
        // const blood = item.blood + "/" + item.totalBlood
        // this.drawText(
        //   blood,
        //   - blood.length * 2.5,
        //   this.getTargetRadius(item.blood) * 2 + 15,
        //   "yellow"
        // );
        this.ctx.closePath();

        this.ctx.rotate((item.rotate * Math.PI) / 180);

        this.ctx.arc(
          0,
          0,
          this.getTargetRadius(item.blood),
          0,
          2 * Math.PI
        );
        this.ctx.strokeStyle = 'yellow'; // 设置绘制圆形边框的颜色
        this.ctx.lineWidth = 6;
        this.ctx.stroke();
        this.ctx.clip()
        this.ctx.drawImage(
          item.image,
          -1 * this.getTargetRadius(item.blood),
          -1 * this.getTargetRadius(item.blood),
          this.getTargetRadius(item.blood) * 2,
          this.getTargetRadius(item.blood) * 2
        );

        this.ctx.restore();

        let yStep = (this.getTargetSpeed(item.blood) * item.moveConstant) / 2;

        item.y += yStep > 0 ? yStep : yStep + 0.5;
        item.x += item.xWay * (this.getTargetSpeed(item.blood) * item.moveConstant + 0.1);
        if (item.x < 0 || item.x > this.clientWidth) {
          item.xWay *= -1;
        }
        if (item.y > this.clientHeight + this.getTargetRadius(item.blood)) {
          // 碰到底部了
          item.y = this.getTargetRadius(item.blood) * 2
        }
        // 旋转
        item.rotate += 1;
      });
    },
    autoShot() {
      if (this.currentIndex === -1) {
        // 当前没有在射击的目标
        const isHasTarget = this.targetArr.findIndex(item => { return item.actualBlood > 0 && item.status == 1 })
        if (!(isHasTarget >= 0)) {
          return
        }
        let index = Math.floor(Math.random() * this.targetArr.length);
        while (this.targetArr[index].actualBlood <= 0) {
          index = Math.floor(Math.random() * this.targetArr.length);
        }
        if (index !== -1) {
          this.currentIndex = index;
          this.createBullet(index);
        }
      } else {
        if (this.targetArr[this.currentIndex].actualBlood > 0) {
          // 已有目标正在被射击
          this.createBullet(this.currentIndex);
        } else {
          // 重新寻找目标
          const isHasTarget = this.targetArr.findIndex(item => { return item.actualBlood > 0 })
          if (!(isHasTarget >= 0)) {
            return
          }
          let index = Math.floor(Math.random() * this.targetArr.length);
          while (this.targetArr[index].actualBlood <= 0) {
            index = Math.floor(Math.random() * this.targetArr.length);
          }
          if (index !== -1) {
            this.currentIndex = index;
            this.createBullet(index);
          }
        }
      }
    },
    // 发射一个子弹
    createBullet(index) {
      if (this.targetArr[index].y > (this.clientHeight - 100)) {
        return
      }
      this.targetArr[index].actualBlood--
      this.bulletArr.push({
        dx: 1,
        dy: 4,
        x: this.clientWidth / 2,
        y: this.clientHeight - 60,
        targetIndex: index
      });
    },
    firedTarget(item) {
      // 判断是否击中目标
      let targetArrIndex = item.targetIndex;
      if (
        item.x > this.targetArr[targetArrIndex].x - this.getTargetRadius(this.targetArr[targetArrIndex].blood) &&
        item.x < this.targetArr[targetArrIndex].x + this.getTargetRadius(this.targetArr[targetArrIndex].blood) &&
        item.y > this.targetArr[targetArrIndex].y - this.getTargetRadius(this.targetArr[targetArrIndex].blood) &&
        item.y < this.targetArr[targetArrIndex].y + this.getTargetRadius(this.targetArr[targetArrIndex].blood)
      ) {
        // 子弹击中了目标
        this.targetArr[targetArrIndex].blood--;
        if (this.targetArr[targetArrIndex].blood == 0) {
          this.targetArr[targetArrIndex] = {
            status: 0
          }
          if (this.currentIndex == targetArrIndex) {
            this.currentIndex = -1;
          }
          this.score++;
        }
        return false;
      } else {
        return true;
      }
    },
    drawBullet() { // 逐帧画子弹

      // 判断子弹是否已经击中目标
      if (this.bulletArr.length === 0) {
        return;
      }
      this.bulletArr = this.bulletArr.filter(this.firedTarget);
      this.bulletArr.forEach(item => {
        let targetX = this.targetArr[item.targetIndex].x;
        let targetY = this.targetArr[item.targetIndex].y;
        let k =
          (this.clientHeight - 60 - targetY) /
          (this.clientWidth / 2 - targetX); // 飞机头和目标的斜率
        let b = targetY - k * targetX; // 常量b
        item.y = item.y - 4; // y轴偏移一个单位
        item.x = (item.y - b) / k;

        for (let i = 0; i < 10; i++) {
          // 画出拖尾效果
          this.ctx.beginPath();
          this.ctx.arc(
            (item.y + i * 1.8 - b) / k,
            item.y + i * 1.8,
            4 - 0.2 * i,
            1,
            2 * Math.PI
          );
          this.ctx.fillStyle = `rgba(255,255,255,${1 - 0.08 * i})`;
          this.ctx.fill();
          this.ctx.closePath();
        }
      });
    },
    getTargetList() {
      getBarrage(this.offsetTime).then(res => {
        if (res.data.code == 1) {
          res.data.data.forEach(item => {
            const object = {
              name: item.name,
              image: item.headUrl,
              status: 1,
              totalBlood: (Math.floor(Math.random() * 50) + 1)
            }
            if (
              this.targetArr.findIndex(item => item.name == object.name) < 0 &&
              this.targetPool.findIndex(item => item.name == object.name) < 0
            ) {
              this.targetPool.push(object);
            }
          })
          this.offsetTime = (new Date()).valueOf()
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.type-game {
  padding: 0px !important;
  margin: 0px !important;
  background: #7ddbcf;
  text-align: center;
  #container {
    cursor: none;
    background: #ffffff;
    display: block;
  }
}
</style>
