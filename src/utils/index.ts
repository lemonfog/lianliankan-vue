// 封装队列
class Queue<T> {
  items: T[] = [];
  // 向队列尾部添加一个或多个项
  enqueue = (i: T) => this.items.push(i);
  // 移除队列的第一项 并返回被移除的项
  pop_front = () => this.items.shift() as T;
  // 返回队列的第一项
  first = () => this.items[0];
  // 队列是否为空
  isEmpty = () => this.items.length === 0;
  // 队列的长度
  size = () => this.items.length;
  // 返回字符串形式的队列
  toString = () => this.items.toString();
}
// 打乱数组
const shuffle = (arr: Array<any>) => {
  const arrSort = [];
  const len = arr.length;
  for (let i = 0; i < len; ) {
    const index = Math.floor(Math.random() * len);
    if (arr[index] != null) {
      arrSort.push(arr[index]);
      arr[index] = null;
      i++;
    }
  }
  return arrSort;
};
export { Queue, shuffle };
