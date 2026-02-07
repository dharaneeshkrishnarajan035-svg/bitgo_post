const data = 'NNdfYComtzlukuFS-V7j:X';
const base64Encoded = btoa(data);
console.log(base64Encoded);


const base64Encoded2 = Buffer.from(data).toString("base64");
console.log(base64Encoded2);
