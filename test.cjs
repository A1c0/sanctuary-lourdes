
const {create} = require("./index.cjs");
const Sl = create({checkTypes:false});

console.log(Sl.toMaybe(x => !!x)(null))
