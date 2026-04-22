import { resolve } from 'node:path';
import { CantorMirror } from './src/utils/cantorPricing/mirror';
import { buildContext } from './src/utils/cantorPricing/context';
import { parse, evalExpr, toNum } from './src/utils/cantorFormula/index';

const mirror = new CantorMirror(resolve(process.cwd(), 'src/data/cantor/cantor.sqlite'));

const input = {
  article: 'F100',
  profilsatz: 'IG5',
  materialart: 2,
  beschvar: 'UR-P',
  width_mm: 1000,
  height_mm: 1000,
  sashCount: 1,
  openings: ['UR-P'],
  color: { type: 'DEK-DEK', code: '0006' },
  frameProfile: '50001',
  sashProfile: '50011',
  glazing: { 
    code: '2-24', 
    panes: ['FL4', 'T4'], 
    spacer: 'S' 
  },
  hardware: {},
  schwelle: 0,
  dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' }
};

const ctx = buildContext(input as any, mirror);

// override evalExpr or IIF handling here just for this test
function myEvalExpr(node: any, c: any): any {
  if (node.type === 'call' && node.name === 'IIF') {
    const cond = myEvalExpr(node.args[0], c);
    const condBool = Boolean(cond) && cond !== '0' && cond !== 0;
    console.log(`IIF Cond:`, cond, `=>`, condBool);
    const res = condBool ? myEvalExpr(node.args[1], c) : myEvalExpr(node.args[2], c);
    console.log(`IIF Result:`, res);
    return res;
  }
  if (node.type === 'binop') {
    const left = myEvalExpr(node.left, c);
    const right = myEvalExpr(node.right, c);
    if (node.op === '=') return left == right;
    if (node.op === '<>') return left != right;
    if (node.op === '+') return left + right;
    if (node.op === 'AND') return left && right;
  }
  if (node.type === 'var') return c.resolve(node.name);
  if (node.type === 'str' || node.type === 'num') return node.value;
  if (node.type === 'call') {
     if (node.name === 'PMATALL') {
         return 10;
     }
     if (node.name === 'fn_SystemCeny') return 'IG5';
     if (node.name === 'fn_getEinhVarFeldA') return 'F100';
  }
  return 0;
}

const astPvc = parse(`IIF(MATERIALART=2,
IIF(AUFTYP<>"PP",
IIF(ART_1199_MacierzOku <> "-", PMATALL(ART_1805_MatArt+"_"+fn_getEinhVarFeldA(ARTIKEL,41),ART_1199_MacierzOku,
IIF(fn_SystemCeny()="IGL","IG5",fn_SystemCeny()),"",BRB,BRH),
IIF(BESCHLAGMAXPRIOWERT=0 AND BESCHLAGMINPRIOWERT=0 ,PMATALL(ART_1805_MatArt+"_"+"F100","F",fn_SystemCeny(),"",BRB,BRH),0)),
IIF(ART_1199_MacierzOku <> "-", PMATALL(ART_1805_MatArt+"_F100","F",fn_SystemCeny(),"",ART_x801_IFS_Szer,ART_x801_IFS_Wys),0)),0)`);

console.log("Custom PVC Eval:", myEvalExpr(astPvc, ctx));

// Also let's check actual evalExpr but trace IIF
const origEvalExpr = evalExpr;

