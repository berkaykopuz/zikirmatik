export type ZikhrItem = {
  name: string;
  arabicName?: string;
  description: string;
  count: number;
};

export const ZIKHR_ITEMS: ZikhrItem[] = [
  {
    name: 'Subhanallah',
    arabicName: 'سبحان الله',
    description: 'Subhanallah, Allah\'ın her türlü eksiklikten münezzeh olduğunu hatırlamak için söylenir.',
    count: 99,
  },
  {
    name: 'Elhamdülillah',
    arabicName: 'الحمد لله',
    description:
      'Elhamdülillah, tüm övgülerin yalnızca Allah\'a ait olduğunu kalpte tazelemek için söylenir.',
    count: 99,
  },
  {
    name: 'Allahu Ekber',
    arabicName: 'الله أكبر',
    description:
      'Allahu Ekber, Allah\'ın en yüce olduğunu idrak etmek ve kalbi diriltmek için söylenir.',
    count: 99,
  },
  {
    name: 'La ilahe illallah',
    arabicName: 'لا إله إلا الله',
    description:
      'Kelime-i Tevhid; Allah\'tan başka ilah olmadığını ikrar etmek ve imanı tazelemek için söylenir.',
    count: 100,
  },
  {
    name: 'Estağfirullah',
    arabicName: 'أستغفر الله',
    description:
      'İstiğfar; günahlardan pişmanlık duyup Allah\'tan bağışlanma dilemek ve manevi arınma için söylenir.',
    count: 100,
  },
  {
    name: 'Allahümme Salli Ala Seyyidina Muhammed',
    arabicName: 'اللهم صل على سيدنا محمد',
    description:
      'Salavat; Peygamber Efendimiz\'e (s.a.v.) selam göndermek ve şefaatine nail olmak ümidiyle söylenir.',
    count: 100,
  },
  {
    name: 'La havle ve la kuvvete illa billah',
    arabicName: 'لا حول ولا قوة إلا بالله',
    description:
      'Güç ve kuvvetin yalnız Allah\'tan geldiğini hatırlatır; sıkıntı anlarında huzur verir.',
    count: 100,
  },
  {
    name: 'Subhanallahi ve bihamdihi',
    arabicName: 'سبحان الله وبحمده',
    description:
      'Dile hafif ama mizanda (sevap tartısında) ağır gelen, Allah\'ı hamd ile tesbih eden faziletli bir zikirdir.',
    count: 100,
  },
  {
    name: 'Hasbunallahu ve ni\'mel vekil',
    arabicName: 'حسبنا الله ونعم الوكيل',
    description:
      'Allah bize yeter, O ne güzel vekildir. Zorluk anlarında Allah\'a tam teslimiyet ve güveni ifade eder.',
    count: 100,
  },
  {
    name: 'Ya Hayyu Ya Kayyum',
    arabicName: 'يا حي يا قيوم',
    description:
      'Ey daima diri olan (Hayy) ve her şeyi ayakta tutan (Kayyum) Allah\'ım. Esma-ül Hüsna zikirlerinden.',
    count: 99,
  },
];

export const DEFAULT_ZIKHR = ZIKHR_ITEMS[0];


