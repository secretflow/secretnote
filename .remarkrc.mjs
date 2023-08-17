import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';

export default {
  plugins: [remarkGfm, remarkFrontmatter, remarkDirective, remarkMath],
};
