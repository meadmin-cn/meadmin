let currentChunk = 0;
const chunks = 10; // 总分片数
console.log('开始', currentChunk);

currentChunk++;
//一次上传3个
const parallelNum = 3;
for (; currentChunk < chunks - 1;) {
  const promiseArr = [];
  for (let i = 0; i < parallelNum; i++) {
    if (currentChunk < chunks - 1) {
      console.log('中间', currentChunk);
      currentChunk++;
    }
  }
        console.log('----');

}
console.log('结束', currentChunk);
