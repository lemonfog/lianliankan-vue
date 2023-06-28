<template>
  <div class="main bg-cover w-1024px h-718px my-0 mx-auto flex relative">
    <!-- 游戏主页面背景 -->
    <div class="menu relative">
      <!-- 动物按钮背景 -->
      <div class="absolute flex flex-col ml-20px mt-10px mb-35px">
        <div v-for="i in row" class="flex">
          <div v-for="j in col" class="bg-animal"></div>
        </div>
      </div>
      <!-- 动物按钮 -->
      <div class="flex flex-col ml-20px mt-10px mb-35px" @click="onclick">
        <div v-for="i, row in ab" class="flex flex-row">
          <div v-for="j, col in i" class="relative z-0 w-50px h-50px"
            :class="[{ check: j.check && j.type > 0, hide: j.hide }]">
            <!-- <div></div> -->
            <img :data-pos="JSON.stringify({ x: col, y: row })" class="w-50px h-50px" :src="loadPic(j.type)" alt=""
              srcset="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
type Pos = {
  x: number,
  y: number
}
const startPos: Pos = { x: -1, y: -1 }
let endPos: Pos;
const onclick = (e: any) => {
  // z-indx 伪元素 checkanimal  确定点击的是动物
  if (!e.target.dataset.pos) {
    console.log(e.target);
    return
  }
  endPos = JSON.parse(e.target.dataset.pos)
  console.log(endPos);
  // 不能是已消除的
  if (ab.value[endPos.y][endPos.x].hide) return
  // 不能是同一个位置
  if (startPos.x == endPos.x && startPos.y == endPos.y) return
  // 点击的动物变成check
  // if (ab.value[endPos.y][endPos.x].type) {
  ab.value[endPos.y][endPos.x].check = true
  // }

  // 
  if (startPos.x != -1) {
    if (check()) {
      console.log('消除一对');
      ab.value[startPos.y][startPos.x].hide = true
      ab.value[endPos.y][endPos.x].hide = true
      startPos.x = -1
      startPos.y = -1
      return
    }
    ab.value[startPos.y][startPos.x].check = false
  }
  startPos.x = endPos.x
  startPos.y = endPos.y
};

const check = () => {
  const startFlag = ab.value[startPos.y][startPos.x].type
  const endFlag = ab.value[endPos.y][endPos.x].type
  if (startFlag != endFlag || startFlag === 0) return false
  // 水平
  if (horizontal(startPos, endPos)) return true
  // 垂直
  if (vertical(startPos, endPos)) return true
  // 一个折点
  if (turn_once(startPos, endPos)) return true
  return false

}
const isBlock = (x: number, y: number) => {
  console.log(!ab.value[y][x].hide);
  return !ab.value[y][x].hide
}
const horizontal = (startPos: Pos, endPos: Pos) => {
  if (startPos.y == endPos.y) {
    const x = Math.min(startPos.x, endPos.x)
    const X = Math.max(startPos.x, endPos.x)
    for (let i = x + 1; i < X; i++) {
      if (isBlock(i, startPos.y))
        // if (ab.value[startPos.y][i].type > 0)
        return false
    }
    // 绘制路线
    return true
  }
  return false
}
const vertical = (startPos: Pos, endPos: Pos) => {
  if (startPos.x == endPos.x) {
    const y = Math.min(startPos.y, endPos.y)
    const Y = Math.max(startPos.y, endPos.y)
    for (let i = y + 1; i < Y; i++) {
      if (isBlock(startPos.x, i)) return false
      // console.log(ab.value[i][startPos.x].type > 0);
      // if (ab.value[i][startPos.x].type > 0) return false
    }
    return true
  }
  return false
}

const turn_once = (startPos: Pos, endPos: Pos) => {
  const tmp1: Pos = { x: startPos.x, y: endPos.y }
  const tmp2 = { x: endPos.x, y: startPos.y }
  console.log(tmp1, tmp2);
  if (!isBlock(tmp1.x, tmp1.y) && horizontal(endPos, tmp1) && vertical(startPos, tmp1)) return true
  if (!isBlock(tmp2.x, tmp2.y) && horizontal(endPos, tmp2) && vertical(startPos, tmp2)) return true
  if (!isBlock(tmp1.x, tmp1.y) && horizontal(startPos, tmp1) && vertical(endPos, tmp1)) return true
  if (!isBlock(tmp2.x, tmp2.y) && horizontal(startPos, tmp2) && vertical(endPos, tmp2)) return true
  return false
}

const turn_two = (startPos: Pos, endPos: Pos) => {

}
type Animal = {
  check: boolean;
  hide: boolean;
  type: number;
};

type GameNode = {
  direction: number
  trunNum: number
}

const col = 16;
const row = 10;
const totalAnimal = 160
// 'explode'
const Animals = ['', 'cow', 'tiger', 'rabbit', 'snake', 'horse', 'sheep', 'dog', 'pig', 'cat', 'lion', 'fox', 'panda']
const loadPic = (flag: number) => {
  return new URL(`../assets/images/${Animals[flag]}.png`, import.meta.url).href;
};

onMounted(() => {
  console.log(1);
  init()
});
const ab = ref<Array<Array<Animal>>>([]);

const shuffle = (arr: Array<any>) => {
  const arrSort = []
  const len = arr.length
  for (let i = 0; i < len;) {
    const index = Math.floor(Math.random() * len)
    if (arr[index] != null) {
      arrSort.push(arr[index])
      arr[index] = null
      i++
    }
  }
  return arrSort
}

const init = () => {
  // 动物容器 160
  const a = []
  for (let i = 1; i <= 12; i++) {
    for (let j = 1; j <= 14; j++) {
      a.push(i)
      if (a.length == totalAnimal) break
    }
  }

  // // 打乱
  const b = shuffle(a)

  // 生成二维数组
  let index = 0
  const t: Animal[][] = []
  for (let i = 0; i < 10; i++) {
    const acc: Animal[] = []
    for (let j = 0; j < 16; j++) {
      acc.push({ check: false, hide: false, type: b[index] })
      index++
    }
    t.push(acc)
  }
  ab.value = t

};
</script>

<style scoped>
.fox {
  width: 50px;
  height: 50px;
  background-size: cover;
  background-image: url('../assets/images/fox.png');
}

.main {
  background-image: url('../assets/images/background.png');
}

.menu {
  width: 835px;
  height: 542px;
  margin-top: 88px;
  margin-left: 4px;
  line-height: 0;
  background-image: url('../assets/images/bigRect.png');
  background-size: 835px 542px;
}

.check::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  width: 60px;
  height: 60px;
  z-index: -1;
  /* background-size: 60px 60px; */
  /* background-size: contain; */
  background-size: cover;
  background-image: url('../assets/images/checkanimal.png');
}

.bg-animal {
  /* color: #386635; */
  background-color: rgba(56, 102, 53, 0.15);
  width: 42px;
  height: 42px;
  margin: 4px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.hide {
  opacity: 0;
}
</style>
