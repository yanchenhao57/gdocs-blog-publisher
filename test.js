const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tasks = Array.from({ length: 10 }, (_, i) => async () => {
  await delay(Math.random() * 100);
  console.log(`任务 ${i} 执行完成`);
  return i;
});

const results = [];
let index = 0;
const maxConcurrency = 3;

const runner = async () => {
  while (index < tasks.length) {
    const currentIndex = index++;
    try {
      const result = await tasks[currentIndex]();
      results[currentIndex] = result;
    } catch (e) {
      console.error(`任务 ${currentIndex} 失败:`, e);
    }
  }
};

const main = async () => {
  const runners = Array.from({ length: maxConcurrency }, () => runner());
  console.log("🚀 ~ main ~ runners:", runners);
  await Promise.all(runners);

  console.log("结果数组:", results);
  console.log("执行任务数量:", results.filter((v) => v !== undefined).length);
};

main();
