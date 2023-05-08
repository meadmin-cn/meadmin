import fs from 'node:fs';
export default {
  autoImport: [
    {
      pattern: ['!(index).ts', '*/**/*.{ts,js}'],
      dir: 'src/config',
      toFile: 'src/config/index.ts',
      template: fs.readFileSync('template/config.ts', 'utf-8'),
      codeTemplates: [
        {
          key: '//import code',
          template: "import {{name}} from '{{path}}';\n",
        },
        {
          key: '//register code',
          template:
            "registerAs('{{fileName}}'.replace('.ts', '').replace(/\\//g, '.'), {{name}}),\n  ",
        },
      ],
    },
  ],
};
