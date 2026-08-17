import { ComputeEngine } from '@cortex-js/compute-engine';
const ce = new ComputeEngine();
const ex1 = ce.parse("x+x").simplify();
const ex2 = ce.parse("2x").simplify();
console.log("x+x simplified:", ex1.toString());
console.log("2x simplified:", ex2.toString());
console.log("equal:", ex1.isEqual(ex2));
console.log("same:", ex1.isSame(ex2));
