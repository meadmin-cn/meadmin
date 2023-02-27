import { walkSync } from '@/utils/file';
import { ConfigFactory, registerAs } from '@nestjs/config';
import { relative, sep } from 'node:path';
export default async () => {
  return Promise.all(
    walkSync(
      __dirname,
      async (relativePath: string, filePath: string) => {
        return registerAs(
          relativePath.slice(0, -3).replace(sep, '.'),
          (await import(`./${relativePath}`)).default as ConfigFactory,
        );
      },
      (filePath) => {
        const relativePath = relative(__dirname, filePath);
        if (
          [/^[^.]+\.(js|ts)$/, /^(?!index.(js|ts)$)/].every((item) =>
            item.test(relativePath),
          )
        ) {
          return [relativePath, filePath];
        }
      },
    ),
  );
};
