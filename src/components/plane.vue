<template>
  <div class="type-game">
    <canvas
      id="container"
      style="margin:0px; padding:0px;"
    >
    </canvas>
    <!-- <div>
      <span
        v-for="(item,index) in bulletArr"
        :key="index"
      >{{item.targetIndex}}</span>
      {{bulletArr.length}}
    </div> -->
  </div>
</template>

<script>

import { getBarrage } from "@/api/KuaiShou.js";

const _MAX_TARGET = 15; // 画面中一次最多出现的目标

const CANVAS = {
  canvas: null,
  width: Math.ceil(window.innerWidth * 1),
  height: Math.ceil(window.innerHeight * 1),
  originWidth: 720,
  originHeight: 1560
  // height: Math.ceil(1280 * 1)
}

const PLANE = {
  x: CANVAS.width / 2,
  y: CANVAS.height / 2,
  radius: 20 * (CANVAS.height / CANVAS.originHeight),
  radiusChange: 6,
  // strokeStyle: '#7ddbcf',
  strokeStyle: '#FFFFFF',
  lineWidth: 2,
  rotate: 0,
  image: new Image(),
  imageUrl: require("@/assets/plane/plane.png"),
  // imageUrl: 'https://p2.a.yximgs.com/uhead/AB/2019/12/05/13/BMjAxOTEyMDUxMzIyMDVfNjIyODE3MTc4XzJfaGQxNzhfOTU5_s.jpg'
}

const BACKGROUND = {
  image: new Image(),
  imageUrl: require("@/assets/plane/background.png"),
  speed: 0.3,
  width: CANVAS.width,
  height: CANVAS.height,
  relativeY: 0
}

export default {
  name: "PlanePage",
  data() {
    return {
      ctx: null,
      bulletImgArr: [],
      bulletArr: [],
      targetPool: [],
      targetArr: [],
      currentIndex: -1,
      score: 0,
      offsetTime: 0,
      boomArray: []
    }
  },
  mounted() {
    this.intiAll()

    const _this = this
    function animloop() {
      _this.drawAll()
      window.requestAnimationFrame(animloop)
    }
    animloop()

    // setInterval(() => {
    //   PLANE.radius += PLANE.radiusChange
    //   PLANE.radiusChange = PLANE.radiusChange * -1
    // }, 300)

    // setInterval(() => {
    //   this.drawAll()
    // }, 100)

    setInterval(() => {
      this.generateTarget()
    }, 1000 / 120)

    // setTimeout(() => {
    //   this.autoShot()
    // }, 1000);

    setInterval(() => {
      this.autoShot()
    }, 200)

    this.getTargetList()
    setInterval(() => {
      this.getTargetList()
    }, 10000)
  },
  methods: {
    intiAll() {
      this.offsetTime = (new Date()).valueOf()
      this.initCanvas()
      this.initBackground()
      this.initPlane()
      this.initBulletImgArr()
      this.initTargetStack()
      this.ctx = CANVAS.canvas.getContext("2d")
    },
    initCanvas() {
      CANVAS.canvas = document.getElementById("container")
      CANVAS.canvas.width = CANVAS.width
      CANVAS.canvas.height = CANVAS.height
    },
    initBackground() {
      BACKGROUND.image.src = BACKGROUND.imageUrl
      BACKGROUND.image.width = BACKGROUND.width
      BACKGROUND.image.height = BACKGROUND.height
    },
    initPlane() {
      PLANE.image.src = PLANE.imageUrl
    },
    initBulletImgArr() {
      for (let i = 1; i <= 50; i++) {
        const image = new Image();
        image.src = require("@/assets/plane/bullet/bullet_" + i + ".png");
        this.bulletImgArr.push(image)
      }
    },
    initTargetStack() {
      for (let index = 0; index < _MAX_TARGET; index++) {
        this.targetArr.push({
          x: 0,
          y: 0,
          name: '',
          image: '',
          totalBlood: 0,
          actualBlood: 0,
          blood: 0,
          rotate: 0,
          status: 0,
          xWay: 1,
          yWay: 1,
          moveConstant: 0
        })
      }
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
              img.src = target.image

              const radius = this.getTargetRadius(target.totalBlood)
              let initX = 0
              let initY = 0
              if ((((Math.ceil(Math.random() * 50) + 1) % 2 == 0) ? 1 : -1) > 0) { // 先判断横向还是纵向启动
                // 纵向
                if ((((Math.ceil(Math.random() * 50) + 1) % 2 == 0) ? 1 : -1) > 0) {
                  initY = 0 + radius
                  initX = this.getRandomInt(
                    radius,
                    CANVAS.width - radius
                  )
                } else {
                  initY = CANVAS.height - radius
                  initX = this.getRandomInt(
                    radius,
                    CANVAS.width - radius
                  )
                }
              } else {
                // 横向
                if ((((Math.ceil(Math.random() * 50) + 1) % 2 == 0) ? 1 : -1) > 0) {
                  // min  
                  initX = 0 + radius
                  initY = this.getRandomInt(
                    radius,
                    CANVAS.height - radius
                  )
                } else {
                  // max
                  initX = CANVAS.width - radius
                  initY = this.getRandomInt(
                    radius,
                    CANVAS.height - radius
                  )
                }
              }

              // initX = 0
              // initY = + 50

              this.$set(this.targetArr, index, {
                x: initX,
                y: initY,
                name: target.name,
                image: img,
                totalBlood: target.totalBlood,
                actualBlood: target.totalBlood,
                blood: target.totalBlood,
                rotate: 0,
                status: 1,
                xWay: ((Math.ceil(Math.random() * 50) + 1) % 2 == 0) ? 1 : -1,
                yWay: ((Math.ceil(Math.random() * 50) + 1) % 2 == 0) ? 1 : -1,
                moveConstant: Math.ceil(Math.random())
              })
            }
          }
          if (this.targetPool.length <= 0) {
            break;
          }
        }
      }
    },
    getX(x) {
      if (x < CANVAS.width / 2) {
        return - ((CANVAS.width / 2) - x)
      } else if (x > CANVAS.width / 2) {
        return x - (CANVAS.width / 2)
      } else {
        return 0
      }
    },
    getY(y) {
      if (y < CANVAS.height / 2) {
        return (CANVAS.height / 2) - y
      } else if (y > CANVAS.height / 2) {
        return - (y - (CANVAS.height / 2))
      } else {
        return 0
      }
    },
    drawAll() {
      this.ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
      this.drawBackground()
      this.drawBullet()
      this.drawTarget()
      this.drawPlane()
      // this.drawScore()
      this.drawBoom()
    },
    drawBackground() {
      //循环运动
      BACKGROUND.relativeY += BACKGROUND.speed
      if (BACKGROUND.relativeY >= CANVAS.height) {
        BACKGROUND.relativeY = 0;
      }

      // 绘制背景
      this.ctx.drawImage(
        BACKGROUND.image,
        0, BACKGROUND.relativeY
      );
      // //补空白
      this.ctx.drawImage(
        BACKGROUND.image,
        0, CANVAS.height - BACKGROUND.relativeY,
        CANVAS.width, BACKGROUND.relativeY,
        0, 0,
        CANVAS.width, BACKGROUND.relativeY
      );
    },
    drawPlane() {
      this.ctx.save();
      this.ctx.beginPath()
      this.ctx.translate(PLANE.x, PLANE.y); //设置旋转的中心点
      this.ctx.rotate((PLANE.rotate));

      // this.ctx.arc(0, 0, PLANE.radius, 0, 2 * Math.PI)
      this.ctx.strokeStyle = PLANE.strokeStyle
      this.ctx.lineWidth = PLANE.lineWidth;
      this.ctx.stroke();
      // this.ctx.clip()
      this.ctx.drawImage(
        PLANE.image,
        0 - PLANE.radius,
        0 - PLANE.radius,
        PLANE.radius * 2,
        PLANE.radius * 2
      );
      this.ctx.closePath();
      this.ctx.restore();
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
      this.drawText("击败数：" + String(this.score), 10, CANVAS.height - 10, "#fff");
    },
    getTargetRadius(blood) {
      if (blood >= 12) {
        return 40 * (CANVAS.height / CANVAS.originHeight)
      } else if (blood < 12 && blood >= 7) {
        return 32 * (CANVAS.height / CANVAS.originHeight)
      } else {
        return 25 * (CANVAS.height / CANVAS.originHeight)
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

        const radius = this.getTargetRadius(item.blood)

        this.ctx.save();

        this.ctx.translate(item.x, item.y); //设置旋转的中心点

        this.ctx.beginPath();

        this.ctx.font = "11px 微软雅黑";

        // let name = item.name.slice(0, 5) + "...";
        // // name = index + name
        // this.drawText(
        //   name,
        //   - name.length * 3,
        //   radius * 2,
        //   "#ffffff"
        // );
        // const blood = item.blood + "/" + item.totalBlood
        // this.drawText(
        //   blood,
        //   - blood.length * 2.5,
        //   radius * 2 + 15,
        //   "#ffffff"
        // );
        this.ctx.closePath();

        this.ctx.rotate((item.rotate * Math.PI) / 180);

        this.ctx.arc(
          0,
          0,
          radius,
          0,
          2 * Math.PI
        );
        this.ctx.strokeStyle = '#ffffff'; // 设置绘制圆形边框的颜色
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.clip()
        this.ctx.drawImage(
          item.image,
          -1 * radius,
          -1 * radius,
          radius * 2,
          radius * 2
        );

        this.ctx.restore();

        let yStep = (this.getTargetSpeed(item.blood) * item.moveConstant) / 2;
        // let yStep = 5;

        item.y += (item.yWay * Math.ceil(yStep > 0 ? yStep : yStep + 0.5));
        item.x += (item.xWay * Math.ceil(this.getTargetSpeed(item.blood) * item.moveConstant));

        if ((Math.pow(this.getX(item.x), 2) + Math.pow(this.getY(item.y), 2)) <= Math.pow(PLANE.radius + radius + (PLANE.lineWidth / 2), 2)) {
          if (Math.abs(this.getX(item.x)) > Math.abs(this.getY(item.y))) {
            if (this.getX(item.x) > 0 && item.xWay > 0) {
              item.xWay = 1;
            } else if (this.getX(item.x) < 0 && item.xWay < 0) {
              item.xWay = -1;
            } else {
              item.xWay *= -1;
            }
          } else if (Math.abs(this.getX(item.x)) < Math.abs(this.getY(item.y))) {
            if (this.getY(item.y) < 0 && item.yWay > 0) {
              item.yWay = 1;
            } else if (this.getY(item.y) > 0 && item.yWay < 0) {
              item.yWay = -1;
            } else {
              item.yWay *= -1;
            }
          } else {
            item.xWay *= -1;
            item.yWay *= -1;
          }
        } else {
          if (item.x < (0 + radius) || item.x > (CANVAS.width - radius)) {
            item.xWay *= -1;
          }
          if (item.y < (0 + radius) || item.y > (CANVAS.height - radius)) {
            item.yWay *= -1;
          }
        }
        // 旋转
        item.rotate += 1;
      });
    },
    autoShot() {
      if (this.currentIndex === -1) {
        // 当前没有在射击的目标
        const isHasTarget = this.targetArr.findIndex(item => {
          return item.actualBlood > 0 && item.status == 1
        })
        if (!(isHasTarget >= 0)) {
          return
        }
        let index = Math.floor(Math.random() * this.targetArr.length);
        while ((this.targetArr[index].actualBlood || 0) <= 0) {
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
          const isHasTarget = this.targetArr.findIndex(item => { return item.actualBlood > 0 && item.status == 1 })
          if (!(isHasTarget >= 0)) {
            return
          }
          let index = Math.floor(Math.random() * this.targetArr.length);
          while ((this.targetArr[index].actualBlood || 0) <= 0) {
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
      this.targetArr[index].actualBlood--
      const imgIndex = Math.floor(Math.random() * this.bulletImgArr.length);
      this.bulletArr.push({
        dx: 1,
        dy: 4,
        x: PLANE.x,
        y: PLANE.y,
        targetIndex: index,
        img: this.bulletImgArr[imgIndex],
        imgIndex: imgIndex,
        rotate: 0
      });
      PLANE.rotate = Math.atan2(this.getX(this.targetArr[index].x), this.getY(this.targetArr[index].y))
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
        if (this.targetArr[targetArrIndex].blood <= 0) {
          this.createBoom(this.targetArr[targetArrIndex].x, this.targetArr[targetArrIndex].y)
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
        let targetX = this.targetArr[item.targetIndex].x
        let targetY = this.targetArr[item.targetIndex].y
        let k = (PLANE.y - targetY) / (PLANE.x - targetX) // 飞机头和目标的斜率
        let b = targetY - k * targetX // 常量b

        if (Math.abs(k) > 0.3) {
          item.y = (item.y + (this.getY(targetY) > 0 ? -4 : 4)) // y轴偏移一个单位
          item.x = (item.y - b) / k
        } else if (Math.abs(k) < 0.3) {
          item.x = (this.getX(targetX) > 0 ? item.x + 4.5 : item.x - 4.5)
          if (Math.abs(k) > 0) {
            item.y = k * item.x + b
          }
        }
        // for (let i = 0; i < 15; i++) {
        //   // 画出拖尾效果
        //   this.ctx.beginPath();
        //   this.ctx.arc(
        //     (item.y + i * 1.8 - b) / k,
        //     item.y + i * 1.8,
        //     4 - 0.2 * i,
        //     1,
        //     2 * Math.PI
        //   );

        //   this.ctx.fillStyle = `rgba(255,255,255,${1 - 0.08 * i})`;
        //   this.ctx.fill();
        //   this.ctx.closePath();
        // }

        this.ctx.save();
        this.ctx.translate(item.x, item.y); //设置旋转的中心点
        this.ctx.rotate((item.rotate += 25 * Math.PI) / 180);

        // 设置三角形的起点坐标
        this.ctx.moveTo(0, 4.33)
        // 设置三角形的第一个坐标点坐标
        this.ctx.lineTo(5, -4.33);
        // 设置三角形的第二点坐标位置
        this.ctx.lineTo(-5, -4.33);
        // 设置自动闭合
        this.ctx.closePath();
        this.ctx.fillStyle = '#ffffff';
        //进行绘制描边
        this.ctx.fill();

        // this.ctx.drawImage(
        //   item.img,
        //   - 7.5,
        //   - 7.5,
        //   15,
        //   15
        // );
        this.ctx.restore();

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
              totalBlood: this.getRandomInt(1, 20)
              // totalBlood: 99999999999
              // totalBlood: 20
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
    },
    createBoom(x, y) {
      var count = parseInt(Math.random() * 15 + 8);
      for (var i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const angleX = this.getRandomInt(6, 12) * Math.cos(angle)
        const angleY = this.getRandomInt(6, 12) * Math.sin(angle)
        const boom = {
          x: x,
          y: y,
          color: "#" + parseInt(Math.random() * 16777216).toString(16),
          r: this.getRandomInt(10, 25),
          angle: angle,
          angleX: angleX,
          angleY: angleY,
          rotate: 0
        }
        this.boomArray.push(boom)
      }

    },
    drawBoom() {
      this.boomArray = this.boomArray.filter((item) => {
        if (item.r < 0.5) {
          return false
        } else {
          return true
        }
      });

      this.boomArray.forEach((item) => {

        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(item.x, item.y); //设置旋转的中心点
        this.ctx.rotate((item.rotate += 15 * Math.PI) / 180);

        this.ctx.fillStyle = item.color;
        // 设置三角形的起点坐标
        const height = Math.sqrt((item.r * item.r) - (item.r * item.r / 4)) / 2
        this.ctx.moveTo(0, height)
        // 设置三角形的第一个坐标点坐标
        this.ctx.lineTo(item.r / 2, -height);
        // 设置三角形的第二点坐标位置
        this.ctx.lineTo(-item.r / 2, -height);
        // 设置自动闭合
        this.ctx.closePath();
        //进行绘制描边
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.closePath();

        // this.ctx.beginPath();
        // this.ctx.fillStyle = item.color;
        // this.ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
        // this.ctx.fill();
        // this.ctx.closePath();

        item.x += item.angleX;
        item.y += item.angleY;
        item.r -= 0.5;
        item.angleX *= 0.92;
        item.angleY *= 0.92;
      })
    }
  }
}
</script>

<style scoped lang="scss">
.type-game {
  padding: 0px !important;
  margin: 0px !important;
  background: #000000;
  #container {
    background: #ffffff;
    display: block;
  }
}
</style>
