export type ZikhrItem = {
  name: string;
  description: string;
  count: number;
};

export const ZIKHR_ITEMS: ZikhrItem[] = [
  {
    name: 'Subhanallah',
    description:
      'Subhanallah, Allah’ın her türlü eksiklikten münezzeh olduğunu hatırlamak için söylenir.',
    count: 99,
  },
  {
    name: 'Elhamdülillah',
    description:
      'Elhamdülillah, tüm övgülerin yalnızca Allah’a ait olduğunu kalpte tazelemek için söylenir.',
    count: 99,
  },
  {
    name: 'Allahu Ekber',
    description:
      'Allahu Ekber, Allah’ın en yüce olduğunu idrak etmek ve kalbi diriltmek için söylenir.',
    count: 99,
  },
];

export const DEFAULT_ZIKHR = ZIKHR_ITEMS[0];


