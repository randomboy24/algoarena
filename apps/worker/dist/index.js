// import * as db from "@repo/database";
// // console.log(await db.prisma.user.findMany());
// console.log(await db.prisma.user.findMany());
//  function main() {
//      return new Promise(function (res,rej)  {
//      })
// }
async function main() {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const data = await response.json();
    console.log(data);
}
main();
export {};
//# sourceMappingURL=index.js.map