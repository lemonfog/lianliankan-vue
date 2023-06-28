<template>
  <div class="main bg-cover w-1024px h-718px my-0 mx-auto flex relative">
    <!-- 游戏主页面背景 -->
    <div class="menu relative">
      <!-- 动物按钮背景 -->
      <!-- <div class="absolute flex flex-col ml-20px mt-10px mb-35px"> -->
      <div class="absolute flex flex-col ml-20px mt-10px">
        <div v-for="i in maxRow" class="flex">
          <div v-for="j in maxCol" class="bg-animal"></div>
        </div>
        <!-- 连线画布 -->
        <canvas ref="canvas" height="550" width="850" class="absolute top-[-25px] left-[-25px]"></canvas>
      </div>
      <!-- 动物按钮 -->
      <div class="flex flex-col ml-20px mt-10px" @click="onclick">
        <div v-for="(i, row) in ab" class="flex flex-row">
          <div v-for="(j, col) in i" class="relative z-0 w-50px h-50px"
            :class="[{ check: j.check && j.type > 0, hide: j.hide }]">
            <img :data-pos="JSON.stringify({ row, col })" class="w-50px h-50px" :src="loadPic(j.type)" alt="" srcset="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Queue, shuffle } from '../utils';
const maxRow = 10;
const maxCol = 16;
const totalAnimal = 160;
const ab = ref<Array<Array<Animal>>>([]);
const canvas = ref<null | HTMLCanvasElement>(null);
const Animals = ['explode', 'cow', 'tiger', 'rabbit', 'snake', 'horse', 'sheep', 'dog', 'pig', 'cat', 'lion', 'fox', 'panda'];
const loadPic = (flag: number) =>
  new URL(`../assets/images/${Animals[flag]}.png`, import.meta.url).href

type Pos = {
  row: number;
  col: number;
  turnNum?: number;
  direction?: number;
  lastNode?: Pos; // 指向上一个pos 这样当连线成功时 可以反向遍历 得到线路(经过的点)
};
const startPos: Pos = { row: -1, col: -1 };
let endPos: Pos;
const onclick = (e: any) => {
  // z-indx 伪元素 checkanimal  确定点击的是动物
  if (!e.target.dataset.pos) {
    console.log(e.target);
    return;
  }
  endPos = JSON.parse(e.target.dataset.pos);
  console.log(endPos);
  // 不能是已消除的
  if (ab.value[endPos.row][endPos.col].hide) return;
  // 不能是同一个位置
  if (startPos.row == endPos.row && startPos.col == endPos.col) return;
  // 点击的动物变成check
  ab.value[endPos.row][endPos.col].check = true;
  //
  if (startPos.row != -1) {
    if (check()) {
      console.log('消除一对');
      ab.value[startPos.row][startPos.col].hide = true;
      ab.value[endPos.row][endPos.col].hide = true;
      startPos.col = -1;
      startPos.row = -1;
      return;
    }
    ab.value[startPos.row][startPos.col].check = false;
  }
  startPos.col = endPos.col;
  startPos.row = endPos.row;
};

const check = () => {
  const startFlag = ab.value[startPos.row][startPos.col].type;
  const endFlag = ab.value[endPos.row][endPos.col].type;
  if (startFlag != endFlag || startFlag === 0) return false;
  return BFS(startPos, endPos);
};
// 是空白 可通行
const isBlank = (row: number, col: number) => {
  if (row == -1 || row == 10 || col == -1 || col == 16) return true;
  return ab.value[row][col].hide;
};
// 边界内部
const isN = (row: number, col: number) =>
  row >= -1 && row <= 10 && col >= -1 && col <= 16;
// 0  1  2  3
// 左 右 上 下 [row,col]
// const dir = [[0, 1], [0, -1], [-1, 0], [1, 0]]
// 0  1  2  3
// 左 下 右 上
const dir = [[0, 1], [1, 0], [0, -1], [-1, 0]];
// 绘制连线
const clip = (pathNode: any[]) => {
  const p = canvas.value!.getContext('2d') as CanvasRenderingContext2D;

  p.beginPath();
  p.moveTo(pathNode[0].x, pathNode[0].y);
  for (let i = 1; i < pathNode.length; i++)
    p.lineTo(pathNode[i].x, pathNode[i].y);
  p.strokeStyle = '#FFFFFF';
  p.shadowColor = '#FFFFFF50';
  p.lineCap = 'round';
  p.lineWidth = 2;
  p.shadowBlur = 4;
  p.stroke();
  setTimeout(() => {
    p.clearRect(0, 0, 850, 550);
  }, 1500);
};

const BFS = (startPos: Pos, endPos: Pos) => {
  let queue = new Queue<Pos>();
  startPos.direction = -1;
  startPos.turnNum = 0;
  let popNode: Pos;
  const visted = new Map(); // 也可以用{}
  const pathNode = [];
  queue.enqueue(startPos);
  while (!queue.isEmpty()) {
    popNode = queue.pop_front();
    visted.set(`${popNode.row}-${popNode.col}`, undefined);
    // 到达endpos
    if (popNode.col == endPos.col && popNode.row == endPos.row) {
      //  如果有多种路径 这样并不能保证折点是一个
      //  应该把这种路径保存起来 再筛以便能一个折点连接就不绘制两个折点 continue
      if (popNode.turnNum! > 2) return false;

      // 相邻时不绘制连线 产生爆炸特效

      // 终点偏移
      let x = 0, y = 0;
      // 0左 1下 2右 3上
      popNode.direction! % 2 == 0 ?
        (x = (popNode.direction! / 2) * 50 - 25) :
        (y = ((popNode.direction! - 1) / 2) * 50 - 25);
      // 由于动物图标是由[0,0]开始 而它的中心点在canvas的坐标是[1*50,1*50]
      //先将终点偏移后的位置push
      pathNode.push({ x: (endPos.col + 1) * 50 + x, y: (endPos.row + 1) * 50 + y, });
      switch (popNode.turnNum) {
        case 1:
          // push 转折点
          // 遍历链表
          while (pathNode.length == 1 && popNode) {
            popNode = popNode.lastNode!;
            // 此时popNode就是转折点  终止while
            if (popNode.turnNum == 0)
              pathNode.push({ x: (popNode.col + 1) * 50, y: (popNode.row + 1) * 50, });
          }
          // 判断转折点和开始点的方位 来处理开始点的偏移
          // 重置x,y
          x = 0; y = 0;
          popNode.col == startPos.col ?
            popNode.row > startPos.row ? (y = 25) : (y = -25) :
            popNode.col > startPos.col ? (x = 25) : (x = -25);
          // push 起点
          pathNode.push({ x: (startPos.col + 1) * 50 + x, y: (startPos.row + 1) * 50 + y, });
          // console.log(pathNode);
          break;
        case 2:
          let bool = true;
          while (bool && popNode) {
            popNode = popNode.lastNode!;
            if (popNode.turnNum == 1) bool = false;
          }
          // 折点偏移
          x = 0;
          y = 0;
          // popNode.col == -1 || popNode.col == 16 ?
          //   x = (popNode.col + 1) % 16 * (-50) + 30 :
          //   popNode.row == -1 || popNode.row == 10 ?
          //     y = (popNode.row + 1) % 10 * (-50) + 30 :
          //     null
          // 25 -
          popNode.col == -1 || popNode.col == 16 ?
            x = popNode.col == -1 ? 12.5 : -12.5 :
            popNode.row == -1 || popNode.row == 10 ?
              (y = popNode.row == -1 ? 12.5 : -12.5) : null;

          // 邻近endpos的折点
          pathNode.push({ x: (popNode.col + 1) * 50 + x, y: (popNode.row + 1) * 50 + y, });

          popNode.direction! % 2 == 0 ?
            (popNode.col = startPos.col) :
            (popNode.row = startPos.row);

          // 此时 popNode的
          pathNode.push({ x: (popNode.col + 1) * 50 + x, y: (popNode.row + 1) * 50 + y, });
          // // 起点偏移
          x = 0;
          y = 0;
          popNode.col == startPos.col ?
            popNode.row > startPos.row ? (y = 25) : (y = -25) :
            popNode.col > startPos.col ? (x = 25) : (x = -25);
          // push 起点
          pathNode.push({ x: (startPos.col + 1) * 50 + x, y: (startPos.row + 1) * 50 + y, });
          break;
        default:
          // 0
          //  起点反向偏移
          pathNode.push({ x: (startPos.col + 1) * 50 - x, y: (startPos.row + 1) * 50 - y, });

      }
      // console.log(pathNode);
      clip(pathNode);
      return true;
      // 反向遍历popNode 他的lastnode是上一个节点 这样就可以得到经过的点

    }
    for (let i = 0; i < 4; i++) {
      let row = popNode.row + dir[i][0];
      let col = popNode.col + dir[i][1];
      // 在地图范围内 未访问过 空白 或者是endPos
      if (!isN(row, col) || visted.has(`${row}-${col}}`) || !(isBlank(row, col) || row == endPos.row && col == endPos.col)) continue

      // if (isN(row, col) && !visted.has(`${row}-${col}`) &&
      //   (isBlank(row, col) || (row == endPos.row && col == endPos.col))
      // ) {
      // 转弯次数
      const turnNum = popNode.direction == -1 || popNode.direction == i ?
        popNode.turnNum : popNode.turnNum! + 1;
      if (turnNum! > 2) continue;
      queue.enqueue({ row, col, direction: i, lastNode: popNode, turnNum, });
      // }
    }
  }
  return false;
};

type Animal = {
  check: boolean;
  hide: boolean;
  type: number;
};

onMounted(() => {
  init();
});

const init = () => {
  const a = [];
  for (let i = 1; i <= 12; i++) {
    for (let j = 1; j <= 14; j++) {
      a.push(i);
      if (a.length == totalAnimal) break;
    }
  }

  // // 打乱
  const b = shuffle(a);

  let index = 0;
  const t: Animal[][] = [];
  for (let i = 0; i < 10; i++) {
    const acc: Animal[] = [];
    for (let j = 0; j < 16; j++) {
      acc.push({ check: false, hide: false, type: b[index] });
      index++;
    }
    t.push(acc);
  }
  ab.value = t;
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
  height: 535px;
  margin-top: 88px;
  margin-left: 4px;
  line-height: 0;
  background-image: url('../assets/images/bigRect.png');
  background-size: 835px 535px;
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
