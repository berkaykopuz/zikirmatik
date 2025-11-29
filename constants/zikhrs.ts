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
  {
    name: 'La ilahe illallah',
    description:
      'Kelime-i Tevhid; Allah’tan başka ilah olmadığını ikrar etmek ve imanı tazelemek için söylenir.',
    count: 100,
  },
  {
    name: 'Estağfirullah',
    description:
      'İstiğfar; günahlardan pişmanlık duyup Allah’tan bağışlanma dilemek ve manevi arınma için söylenir.',
    count: 100,
  },
  {
    name: 'Allahümme Salli Ala Seyyidina Muhammed',
    description:
      'Salavat; Peygamber Efendimiz’e (s.a.v.) selam göndermek ve şefaatine nail olmak ümidiyle söylenir.',
    count: 100,
  },
  {
    name: 'La havle ve la kuvvete illa billah',
    description:
      'Güç ve kuvvetin yalnız Allah’tan geldiğini hatırlatır; sıkıntı anlarında huzur verir.',
    count: 100,
  },
  {
    name: 'Subhanallahi ve bihamdihi',
    description:
      'Dile hafif ama mizanda (sevap tartısında) ağır gelen, Allah’ı hamd ile tesbih eden faziletli bir zikirdir.',
    count: 100,
  },
  {
    name: 'Hasbunallahu ve ni\'mel vekil',
    description:
      'Allah bize yeter, O ne güzel vekildir. Zorluk anlarında Allah’a tam teslimiyet ve güveni ifade eder.',
    count: 100,
  },
  {
    name: 'Ya Hayyu Ya Kayyum',
    description:
      'Ey daima diri olan (Hayy) ve her şeyi ayakta tutan (Kayyum) Allah’ım. Esma-ül Hüsna zikirlerindendir.',
    count: 99,
  },
];

export const DEFAULT_ZIKHR = ZIKHR_ITEMS[0];


