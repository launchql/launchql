// @ts-nocheck
import { sync as glob } from 'glob';
import { basename } from 'path';

import getName from '../src';

jest.setTimeout(3000000);
const files = []
  .concat(glob(__dirname + '/../../../__fixtures__/kitchen-sink/**'))
  .concat(glob(__dirname + '/../../../__fixtures__/kitchen-sink/**/.*'))
  .filter((file) => {
    const key = file.split('kitchen-sink')[1];
    return key != '';
  })
  .concat([
    'niño.yo',
    'beça',
    'Selam Dünya.jpg',
    'Салом Ҷаҳон.gif',
    'Përshendetje Botë',
    'PËRSHENDETJE BOTË',
    'PËRSH- - - ENDETJE  BOTË'
  ]);

const allNonEnglish = [].concat([
  'どうもありがとうミスターロボット.txt',
  'Лев.р',
  'Дмитрий',
  '全国温泉ガイド.jp',
  '你好，世界',
  '你好，世界',
  '你好，世界.世界'
]);

describe('uploads', () => {
  it('english', async () => {
    const res = {};
    const use = files;
    for (let i = 0; i < use.length; i++) {
      const file = use[i];
      const results = getName(file);
      res[basename(file)] = results;
    }
    expect(res).toMatchSnapshot();
  });
  it('upper', async () => {
    const res = {};
    const use = files;
    for (let i = 0; i < use.length; i++) {
      const file = use[i];
      const results = getName(file, { lower: false });
      res[basename(file)] = results;
    }
    expect(res).toMatchSnapshot();
  });
  it('any w english', async () => {
    const res = {};
    const use = allNonEnglish;
    for (let i = 0; i < use.length; i++) {
      const file = use[i];
      try {
        getName(file);
      } catch (e) {
        expect(e.message).toMatchSnapshot();
      }
    }
  });
  it('any', async () => {
    const res = {};
    const use = allNonEnglish;
    for (let i = 0; i < use.length; i++) {
      const file = use[i];
      const results = await getName(file, { english: false });
      res[basename(file)] = results;
    }
    expect(res).toMatchSnapshot();
  });
});
