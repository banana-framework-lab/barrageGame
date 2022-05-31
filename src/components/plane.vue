<template>
  <div class="type-game">
    <canvas
      id="type"
      width="450"
      height="800"
    ></canvas>
  </div>
</template>

<script>
const _MAX_TARGET = 5; // 画面中一次最多出现的目标
const _TARGET_CONFIG = {
  // 靶子的固定参数
  speed: 2,
  radius: 13
}
const _DICTIONARY = ["呆萌的燕燕", "广西某男网友", "你肩带掉了～", "呵呵呵呵哒，", "呆萌的小楊（歪萌）🙈", "大老黑呀呀呀"];
export default {
  name: "PlanePage",
  data() {
    return {
      ctx: null,
      clientWidth: 0,
      clientHeight: 0,
      bulletArr: [], // 屏幕中的子弹
      targetArr: [], // 存放当前目标
      targetImgArr: [],
      planeImg: null,
      currentIndex: -1,
      wordsPool: [],
      score: 0,
      gameOver: false,
      colors: ["#FFFF00", "#FF6666"]
    };
  },
  mounted() {
    this.wordsPool = _DICTIONARY.concat([]);
    let container = document.getElementById("type");
    this.clientWidth = container.width;
    this.clientHeight = container.height;
    this.ctx = container.getContext("2d");

    this.planeImg = new Image();
    this.planeImg.src = 'https://p1.a.yximgs.com/uhead/AB/2018/11/11/22/BMjAxODExMTEyMjAyMDJfOTc4NjI1MTFfMl9oZDMzN183NTE=_s.jpg';

    this.generateTarget();

    setInterval(() => {
      this.run()
    }, 1000 / 60)

    setInterval(() => {
      this.autoShot()
    }, 300)

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
      this.drawPlane(0);
      this.drawTarget();
      this.drawBullet();
      this.drawScore();
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
    generateWord(number) {
      // 从池子里随机挑选一个词，不与已显示的词重复
      let arr = [];
      for (let i = 0; i < number; i++) {
        let random = Math.floor(Math.random() * this.wordsPool.length);
        arr.push(this.wordsPool[random]);
        this.wordsPool.splice(random, 1);
      }
      return arr;
    },
    generateTarget() {
      // 随机生成目标

      let length = this.targetArr.length;
      if (length < _MAX_TARGET) {
        let txtArr = this.generateWord(_MAX_TARGET - length);
        for (let i = 0; i < _MAX_TARGET - length; i++) {
          const actualBlood = (Math.floor(Math.random() * 50) + 1);
          this.targetArr.push({
            x: this.getRandomInt(
              _TARGET_CONFIG.radius,
              this.clientWidth - _TARGET_CONFIG.radius
            ),
            y: _TARGET_CONFIG.radius * 2,
            txt: txtArr[i],
            actualBlood: actualBlood,
            blood: actualBlood,
            dx: (_TARGET_CONFIG.speed * Math.random().toFixed(1)) / 2,
            dy: _TARGET_CONFIG.speed * Math.random().toFixed(1),
            rotate: 0
          });
          const img = new Image();
          img.src = 'https://aliimg.a.yximgs.com/uhead/AB/2022/05/24/01/BMjAyMjA1MjQwMTI4MDhfNTk5ODQzMDI1XzJfaGQyMDdfNjg5_s.jpg@0e_0o_0l_50h_50w_85q.src';
          this.targetImgArr.push(img)
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

      this.targetArr.forEach((item, index) => {
        this.ctx.save();

        this.ctx.translate(item.x, item.y); //设置旋转的中心点

        this.ctx.beginPath();

        this.ctx.font = "10px 微软雅黑";


        const name = item.txt.slice(0, 5) + "...";
        this.drawText(
          name,
          - name.length * 3,
          _TARGET_CONFIG.radius * 2 + 3,
          "yellow"
        );
        this.drawText(
          item.blood + "/" + item.actualBlood,
          -(item.blood + "/" + item.actualBlood).length * 2.5,
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
          this.targetImgArr[index],
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
          // 所有子弹全部击中了目标
          let word = this.targetArr[targetArrIndex].txt;
          const actualBlood = (Math.floor(Math.random() * 50) + 1);
          this.targetArr[targetArrIndex] = {
            // 生成新的目标
            x: this.getRandomInt(
              _TARGET_CONFIG.radius,
              this.clientWidth - _TARGET_CONFIG.radius
            ),
            y: _TARGET_CONFIG.radius * 2,
            txt: this.generateWord(1)[0],
            actualBlood: actualBlood,
            blood: actualBlood,
            dx: (_TARGET_CONFIG.speed * Math.random().toFixed(1)) / 2,
            dy: _TARGET_CONFIG.speed * Math.random().toFixed(1),
            rotate: 0
          };
          this.wordsPool.push(word); // 被击中的目标词重回池子里

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
    }
  }
}
</script>

<style scoped lang="scss">
.type-game {
  background: #7ddbcf;
  text-align: center;
  #type {
    background: #000000;  
  }
}
</style>
