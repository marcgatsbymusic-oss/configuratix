import { CantorMirror } from './src/utils/cantorPricing/mirror';
const mirror = new CantorMirror('src/data/cantor/cantor.sqlite');
console.log("With IGLO 5:", mirror.articleVariablesFor('F200', 'IGLO 5').get('ART_1805_MatrixName'));
console.log("With IG5:", mirror.articleVariablesFor('F200', 'IG5').get('ART_1805_MatrixName'));
