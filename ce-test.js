import { ComputeEngine } from '@cortex-js/compute-engine';
const ce = new ComputeEngine();
const a = ce.parse('\\frac{1}{2}');
const b = ce.parse('0.5');
console.log('valA', a.N().valueOf());
console.log('valB', b.N().valueOf());
console.log('isSame simplify', a.simplify().isSame(b.simplify()));
