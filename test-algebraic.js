import { ComputeEngine } from '@cortex-js/compute-engine';
const ce = new ComputeEngine();
const val1 = ce.parse("2x+1").N().valueOf();
console.log("2x+1:", val1);
console.log("isEqual:", ce.parse("2x+1").isSame(ce.parse("1+2x")));
console.log("isEqual 2:", ce.parse("2x+1").isEqual(ce.parse("1+2x")));
