import { generateAPIService } from '../src';

describe('generateAPIService', () => {
  [{ name: 'api' }, { name: 'api2', operationIdSplitter: '_' }].forEach(
    ({ name, operationIdSplitter }) => {
      it(name, async () => {
        const tsContent = await generateAPIService({
          input: { type: 'local', filename: `${__dirname}/${name}.json` },
          banner: '//banner',
          operationIdSplitter,
        });
        expect(tsContent).toMatchSnapshot(name);
      });
    }
  );
});
