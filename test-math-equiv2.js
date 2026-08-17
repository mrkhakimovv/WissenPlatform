import { ComputeEngine } from '@cortex-js/compute-engine';
const ce = new ComputeEngine();
const val1 = ce.parse("1/2").N().valueOf();
const val2 = ce.parse("\\frac{1}{2}").N().valueOf();
const val3 = ce.parse("0.5").N().valueOf();
console.log(val1, val2, val3);
