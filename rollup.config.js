import shebang from 'rollup-plugin-add-shebang';
import executable from 'rollup-plugin-executable';
 
export default {
	plugins: [shebang({ include: 'dist/index.js' }), executable()]
};
