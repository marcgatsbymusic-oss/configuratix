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
const rows = mirror.loadSchema(41, 2301, 'E');
const baseRow = rows[0];

console.log("Formula Text:", baseRow.FORMELTEXT);
console.log("Formula:", baseRow.FORMEL);

const ast = parse(baseRow.FORMEL);
console.log("AST:", JSON.stringify(ast, null, 2));

const result = evalExpr(ast, ctx);
console.log("Eval result:", result, "toNum:", toNum(result));

// Debug pieces
const astDrewno = parse(`IIF(MATERIALART=1, IIF(AUFTYP<>"PP", fn_CenaBaz41DRE(), 0), 0)`);
console.log("DREWNO Eval:", evalExpr(astDrewno, ctx));

const astPvc = parse(`IIF(MATERIALART=2,
IIF(AUFTYP<>"PP",
IIF(ART_1199_MacierzOku <> "-", PMATALL(ART_1805_MatArt+"_"+fn_getEinhVarFeldA(ARTIKEL,41),ART_1199_MacierzOku,
IIF(fn_SystemCeny()="IGL","IG5",fn_SystemCeny()),"",BRB,BRH),
IIF(BESCHLAGMAXPRIOWERT=0 AND BESCHLAGMINPRIOWERT=0 ,PMATALL(ART_1805_MatArt+"_"+"F100","F",fn_SystemCeny(),"",BRB,BRH),0)),
IIF(ART_1199_MacierzOku <> "-", PMATALL(ART_1805_MatArt+"_F100","F",fn_SystemCeny(),"",ART_x801_IFS_Szer,ART_x801_IFS_Wys),0)),0)`);
console.log("PVC Eval:", evalExpr(astPvc, ctx));

const astAlu = parse(`IIF(MATERIALART=3 AND ((fn_JednCennik()<>"" AND ART_1199_MacierzOku="-") OR (ART_1199_MacierzOku <> "-") OR (fn_JednCennik()="" AND ART_1199_MacierzOku="-" AND BESCHLAGMAXPRIOWERT=0 AND BESCHLAGMINPRIOWERT=0) ),
IIF(AUFTYP<>"PP",
IIF(ART_1199_MacierzOku <> "-", PMATALL(ART_1805_MatArt+"_"+fn_getEinhVarFeldA(ARTIKEL,41),ART_1199_MacierzOku,fn_SystemCeny()+IIF(ART_1805_MatArt="AL" AND ART_1199_WzmSkrzO="J","_MAX","")
,"",BRB,BRH),
IIF((BESCHLAGMAXPRIOWERT=0 AND BESCHLAGMINPRIOWERT=0) OR ART_1199_MacierzOku="-",PMATALL(ART_1805_MatArt+"_F100","F",fn_SystemCenyAlu()+IIF(ART_1805_MatArt="AL" AND ART_1199_WzmSkrzO="J","_MAX"+IIF(ART_1805_MatArt="AL" AND ART_1199_WersjaHiO="J","_HI",""),"")
+IIF(ART_1805_MatArt="AL" AND ART_1199_WersjaHiO="J","_HI",""),"",BRB,BRH),0)),
IIF(ART_1199_MacierzOku <> "-", PMATALL(ART_1805_MatArt+"_F100","F",fn_SystemCeny()+IIF(ART_1805_MatArt="AL" AND ART_1199_WzmSkrzO="J","_MAX","")
+IIF(ART_1805_MatArt="AL" AND ART_1199_WersjaHiO="J","_HI",""),"",ART_x801_IFS_Szer,ART_x801_IFS_Wys),0)),0)`);
console.log("ALU Eval:", evalExpr(astAlu, ctx));

