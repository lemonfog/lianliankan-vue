<template>
  <div class="main bg-cover w-1024px h-718px my-0 mx-auto flex items-center justify-center relative">
    <div class="menu bg-cover w-450px h-480px rounded-15px flex flex-col  items-center">
      <button class="w-220px h-100px text-white font-bold ">难度选择</button>
      <button class="w-180px h-84px text-white font-bold ">初级</button>
      <button class="w-180px h-84px text-white font-bold ">中级</button>
      <button class="w-180px h-84px text-white font-bold ">高级</button>
      <button class="w-124px h-60px bg-cover absolute right-32px bottom-72px">
        <img class="mx-auto mt-[-6px]" src="../assets/icon/sound.svg" alt="" srcset="">
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.main {
  background-image: url('../assets/images/background.png');
  /* background-size: cover; */
}

.menu {
  background-image: url('../assets/images/midRect.png');
}

button {
  background-size: cover;
  background-image: url('../assets/images/normal.png');
}

button:hover {
  background-image: url('../assets/images/hover.png');
}

.sound {
  background-image: url('../assets/icon/sound.svg');
}

.mute {
  background-image: url('../assets/icon/mute.svg');
}
</style>