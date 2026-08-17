import { ComputeEngine } from '@cortex-js/compute-engine';
const ce = new ComputeEngine();
console.log("1/2 == 0.5 :", ce.parse("1/2").isEqual(ce.parse("0.5")));
console.log("1/2 == 0.5 :", ce.parse("\\frac{1}{2}").isEqual(ce.parse("0.5")));
console.log("sqrt(2)+3 == 3+sqrt(2) :", ce.parse("\\sqrt{2}+3").isEqual(ce.parse("3+\\sqrt{2}")));
console.log("x+x == 2x :", ce.parse("x+x").isEqual(ce.parse("2x")));
