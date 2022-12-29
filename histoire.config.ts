import { HstVue } from '@histoire/plugin-vue';
import { defineConfig } from 'histoire';

export default defineConfig({
  plugins: [HstVue()],
  setupFile: 'src/histoire-setup.ts',
  storyMatch: ['src/components/**/*.story.vue'],
  tree: {
    groups: [
      {
        id: 'top',
        title: '',
      },
      {
        title: 'Components',
        include: file => /Basic|Mol|Org/.test(file.title),
      },
    ],
  },
});
