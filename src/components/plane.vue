<template>
  <div class="type-game">
    <canvas
      id="type"
      width="394"
      height="700"
    >
    </canvas>
  </div>
</template>

<script>
const _MAX_TARGET = 20; // 画面中一次最多出现的目标
const _TARGET_CONFIG = {
  // 靶子的固定参数
  speed: 2,
  radius: 13
}
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

    };
  },
  mounted() {
    let container = document.getElementById("type");

    this.clientWidth = container.width;
    this.clientHeight = container.height;

    this.backgroundImage = new Image();
    this.backgroundImage.src = require("@/assets/plane/background.jpg");
    this.backgroundImage.width = this.clientWidth
    this.backgroundImage.height = this.clientHeight


    this.ctx = container.getContext("2d");

    this.planeImg = new Image();
    this.planeImg.src = 'https://p1.a.yximgs.com/uhead/AB/2018/11/11/22/BMjAxODExMTEyMjAyMDJfOTc4NjI1MTFfMl9oZDMzN183NTE=_s.jpg';

    for (let index = 0; index < _MAX_TARGET; index++) {
      this.targetArr.push({ status: 0 })
    }

    setInterval(() => {
      this.run()
    }, 1000 / 60)

    setInterval(() => {
      this.autoShot()
    }, 300)

    setInterval(() => {
      this.getTargetList()
    }, 5000)

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
      this.drawPlane();
      this.drawTarget();
      this.drawBullet();
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
      console.log(this.clientHeight - this.backgroundY)
    },
    drawPlane() {

      this.ctx.save();

      this.ctx.beginPath();
      this.ctx.arc(this.clientWidth / 2, this.clientHeight - 40, 20, 0, 2 * Math.PI);
      this.ctx.strokeStyle = '#ffffff'; // 设置绘制圆形边框的颜色
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
              const totalBlood = (Math.floor(Math.random() * 50) + 1);
              const img = new Image();
              img.src = target.image;

              this.targetArr[index] = {
                x: this.getRandomInt(
                  _TARGET_CONFIG.radius,
                  this.clientWidth - _TARGET_CONFIG.radius
                ),
                y: _TARGET_CONFIG.radius * 2,
                name: target.name,
                image: img,
                totalBlood: totalBlood,
                actualBlood: totalBlood,
                blood: totalBlood,
                dx: (_TARGET_CONFIG.speed * Math.random().toFixed(1)) / 2,
                dy: _TARGET_CONFIG.speed * Math.random().toFixed(1) + 0.1,
                rotate: 0,
                status: 1
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
      this.drawText("分数：" + String(this.score), 10, this.clientHeight - 10, "#fff");
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

        this.ctx.font = "10px 微软雅黑";

        const name = item.name.slice(0, 5) + "...";
        this.drawText(
          name,
          - name.length * 3,
          _TARGET_CONFIG.radius * 2 + 3,
          "yellow"
        );
        const blood = item.blood + "/" + item.totalBlood
        this.drawText(
          blood,
          - blood.length * 2.5,
          _TARGET_CONFIG.radius * 2 + 15,
          "yellow"
        );
        this.ctx.closePath();

        this.ctx.rotate((item.rotate * Math.PI) / 180);

        this.ctx.arc(
          0,
          0,
          _TARGET_CONFIG.radius,
          0,
          2 * Math.PI
        );
        this.ctx.strokeStyle = 'yellow'; // 设置绘制圆形边框的颜色
        this.ctx.stroke();
        this.ctx.clip()
        this.ctx.drawImage(
          item.image,
          -1 * _TARGET_CONFIG.radius,
          -1 * _TARGET_CONFIG.radius,
          _TARGET_CONFIG.radius * 2,
          _TARGET_CONFIG.radius * 2
        );

        this.ctx.restore();

        item.y += item.dy;
        item.x += item.dx;
        if (item.x < 0 || item.x > this.clientWidth) {
          item.dx *= -1;
        }
        if (item.y > this.clientHeight + _TARGET_CONFIG.radius) {
          // 碰到底部了
          item.y = _TARGET_CONFIG.radius * 2
        }
        // 旋转
        item.rotate += 5;
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
        item.x > this.targetArr[targetArrIndex].x - _TARGET_CONFIG.radius &&
        item.x < this.targetArr[targetArrIndex].x + _TARGET_CONFIG.radius &&
        item.y > this.targetArr[targetArrIndex].y - _TARGET_CONFIG.radius &&
        item.y < this.targetArr[targetArrIndex].y + _TARGET_CONFIG.radius
      ) {
        // 子弹击中了目标
        this.targetArr[targetArrIndex].blood--;
        if (this.targetArr[targetArrIndex].blood == 0) {
          let target = this.targetPool.pop();
          if (target) {
            const totalBlood = (Math.floor(Math.random() * 50) + 1);
            const img = new Image();
            img.src = target.image;

            this.targetArr[targetArrIndex] = {
              x: this.getRandomInt(
                _TARGET_CONFIG.radius,
                this.clientWidth - _TARGET_CONFIG.radius
              ),
              y: _TARGET_CONFIG.radius * 2,
              name: target.name,
              image: img,
              totalBlood: totalBlood,
              actualBlood: totalBlood,
              blood: totalBlood,
              dx: (_TARGET_CONFIG.speed * Math.random().toFixed(1)) / 2,
              dy: _TARGET_CONFIG.speed * Math.random().toFixed(1),
              rotate: 0,
              status: 1
            };
          } else {
            this.targetArr[targetArrIndex] = {
              status: 0
            }
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
          this.ctx.fillStyle = `rgba(193,255,255,${1 - 0.08 * i})`;
          this.ctx.fill();
          this.ctx.closePath();
        }
      });
    },
    getTargetList() {
      const res = [
        {
          name: "呆萌的燕燕",
          image: 'https://aliimg.a.yximgs.com/uhead/AB/2022/05/24/01/BMjAyMjA1MjQwMTI4MDhfNTk5ODQzMDI1XzJfaGQyMDdfNjg5_s.jpg@0e_0o_0l_50h_50w_85q.src',
          status: 1
        },
        {
          name: "广西某男网友",
          image: 'https://aliimg.a.yximgs.com/uhead/AB/2022/05/24/01/BMjAyMjA1MjQwMTI4MDhfNTk5ODQzMDI1XzJfaGQyMDdfNjg5_s.jpg@0e_0o_0l_50h_50w_85q.src',
          status: 1
        },
        {
          name: "你肩带掉了～",
          image: 'https://aliimg.a.yximgs.com/uhead/AB/2022/05/24/01/BMjAyMjA1MjQwMTI4MDhfNTk5ODQzMDI1XzJfaGQyMDdfNjg5_s.jpg@0e_0o_0l_50h_50w_85q.src',
          status: 1
        },
        {
          name: "呵呵呵呵哒",
          image: 'https://aliimg.a.yximgs.com/uhead/AB/2022/05/24/01/BMjAyMjA1MjQwMTI4MDhfNTk5ODQzMDI1XzJfaGQyMDdfNjg5_s.jpg@0e_0o_0l_50h_50w_85q.src',
          status: 1
        },
        {
          name: "呆萌的小楊（歪萌）🙈",
          image: 'https://aliimg.a.yximgs.com/uhead/AB/2022/05/24/01/BMjAyMjA1MjQwMTI4MDhfNTk5ODQzMDI1XzJfaGQyMDdfNjg5_s.jpg@0e_0o_0l_50h_50w_85q.src',
          status: 1
        },
        {
          name: "大老黑呀呀呀",
          image: 'https://aliimg.a.yximgs.com/uhead/AB/2022/05/24/01/BMjAyMjA1MjQwMTI4MDhfNTk5ODQzMDI1XzJfaGQyMDdfNjg5_s.jpg@0e_0o_0l_50h_50w_85q.src',
          status: 1
        }
      ];
      for (const key in res) {
        this.targetPool.push(res[key]);
      }
    }
  }
}
</script>

<style scoped lang="scss">
.type-game {
  background: #7ddbcf;
  text-align: center;
  #type {
    background: #ffffff;
  }
}
</style>
