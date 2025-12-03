export type Hadith = {
  text: string;
  source: string;
};

// Simple hadith pool to rotate daily
export const DAILY_HADITHS: Hadith[] = [
    {
    text: 'Mümin, kardeşini sevmede, merhamette ve şefkatte bir beden gibidir.',
    source: 'Buhârî, Edeb 27',
  },
  {
    text: 'Her kim Allah’a tevekkül ederse O, ona yeter.',
    source: 'Talâk 3 (Ayet, sık kullanılan bir ilke)',
  },
  {
    text: 'En hayırlı sadaka, sağlam ve ihtiyaç sahibi iken verilen sadakadır.',
    source: 'Buhârî, Vesâyâ 21',
  },
  {
    text: 'Sözünde durmayanın imanı olgun değildir.',
    source: 'Buhârî, Îman 24',
  },
  {
    text: 'Gerçek mücahit, nefsine karşı cihad eden kimsedir.',
    source: 'Tirmizî, Fedâil 2',
  },
  {
    text: 'Münafığın alameti üçtür: Konuştuğunda yalan söyler, söz verdiğinde sözünde durmaz, emanet edildiğinde ihanet eder.',
    source: 'Buhârî, Îman 24',
  },
  {
    text: 'Her iyilik sadakadır.',
    source: 'Buhârî, Edeb 35',
  },
  {
    text: 'Hiçbir baba çocuğuna güzel terbiyeden daha üstün bir hediye veremez.',
    source: 'Tirmizî, Birr 33',
  },
  {
    text: 'Dünya müminin zindanı, kâfirin cennetidir.',
    source: 'Müslim, Zühd 1',
  },
  {
    text: 'Allah güzeldir, güzelliği sever.',
    source: 'Müslim, Îman 147',
  },
  {
    text: 'İnsanların en hayırlısı ömrü uzun, ameli güzel olandır.',
    source: 'Tirmizî, Zühd 22',
  },
  {
    text: 'Kul kardeşinin yardımında olduğu sürece Allah da kulun yardımındadır.',
    source: 'Müslim, Zikir 37',
  },
  {
    text: 'İstiğfar eden kişinin sıkıntısını Allah giderir.',
    source: 'Ebû Dâvûd, Vitir 26',
  },
  {
    text: 'Her kim sabrederse Allah ona sabır verir.',
    source: 'Buhârî, Zekât 9',
  },
  {
    text: 'Sabrın karşılığı cennettir.',
    source: 'Tirmizî, Sabır 9',
  },
  {
    text: 'Dünya malı tatlıdır ve çekicidir.',
    source: 'Müslim, Zekât 32',
  },
  {
    text: 'Bir iyiliğe vesile olan, onu yapan gibidir.',
    source: 'Müslim, İmare 133',
  },
  {
    text: 'Kötülükleri güzellikle sav.',
    source: 'Fussilet 34 (ayet)',
  },
  {
    text: 'Müminin niyeti amelinden hayırlıdır.',
    source: 'Taberânî, Kebîr',
  },
  {
    text: 'Dua ibadetin özüdür.',
    source: 'Tirmizî, Dua 1',
  },
  {
    text: 'Kime iyilik yapılırsa o da yapsın.',
    source: 'Nesâî, Zekât 66',
  },
  {
    text: 'Kulun Rabbine en yakın olduğu an secde hâlidir.',
    source: 'Müslim, Salât 215',
  },
  {
    text: 'En üstün iman, müminleri incitmemektir.',
    source: 'Taberânî, Kebîr',
  },
  {
    text: 'Haksızlık karşısında susan dilsiz şeytandır.',
    source: 'Beyhakî, Şuab',
  },
  {
    text: 'Mümin kardeşinle üç günden fazla dargın durma.',
    source: 'Buhârî, Edeb 62',
  },
  {
    text: 'Allah işini güzel yapanı sever.',
    source: 'Buhârî, Cihad 129',
  },
  {
    text: 'Mümin, mümin kardeşinin kardeşidir; ona yardım eder.',
    source: 'Buhârî, Mezâlim 3',
  },
  {
    text: 'Zorlaştırmayın, kolaylaştırın.',
    source: 'Buhârî, İlim 11',
  },
  {
    text: 'Şüphesiz her güçlükle beraber bir kolaylık vardır.',
    source: 'İnşirah 6 (ayet)',
  },
  {
    text: 'İnsanların çoğu iki nimetin kıymetini bilmez: Sağlık ve boş vakit.',
    source: 'Buhârî, Rikak 1',
  },
  {
    text: 'İlim öğrenmek her Müslümana farzdır.',
    source: 'İbn Mâce, Mukaddime 17',
  },
  {
    text: 'Kıyamet günü insanların en çok pişman olanı, boşa geçirdiği zamandır.',
    source: 'Tirmizî, Zühd 63',
  },
  {
    text: 'Amellerin en faziletlisi, küçük de olsa devamlı olandır.',
    source: 'Müslim, Müsafirin 215',
  },
  {
    text: 'Bir mümin, bir delikten iki kez ısırılmaz.',
    source: 'Buhârî, Edeb 83',
  },
  {
    text: 'Sizden biriniz kendisi için istediğini kardeşi için de istemedikçe iman etmiş olmaz.',
    source: 'Buhârî, Îman 7',
  },
  {
    text: 'Nerede olursan ol, Allah’tan kork.',
    source: 'Tirmizî, Birr 55',
  },
  {
    text: 'Gücü yettiği hâlde öfkesini yenen kimseyi Allah kıyamet günü herkesin önünde çağırır ve onu cennette dilediği huriden seçtirir.',
    source: 'Tirmizî, Birr 79',
  },
  {
    text: 'İki kişi arasını düzeltmek sadakadır.',
    source: 'Tirmizî, Birr 45',
  },
  {
    text: 'Müminlerin birbirini sevmesinde en faziletli iş, selam vermektir.',
    source: 'Müslim, Selam 1',
  },
  {
    text: 'Selamı yayın.',
    source: 'Müslim, Îman 93',
  },
  {
    text: 'Allah katında amellerin en sevimlisi vaktinde kılınan namazdır.',
    source: 'Buhârî, Mevâkît 5',
  },
  {
    text: 'Sübhanallahi ve bihamdihi diyenin günahları deniz köpüğü kadar da olsa affedilir.',
    source: 'Müslim, Zikir 31',
  },
  {
    text: 'Allah için seven ve Allah için nefret eden imanını kemale erdirmiştir.',
    source: 'Ebû Dâvûd, Sünnet 15',
  },
  {
    text: 'İyilik kötülüğü siler.',
    source: 'Tirmizî, Birr 55',
  },
  {
    text: 'Kim bir mümine sıkıntı verirse, o da sıkıntı görür.',
    source: 'Tirmizî, Birr 47',
  },
  {
    text: 'İnsanlara merhamet etmeyene Allah da merhamet etmez.',
    source: 'Buhârî, Tevhid 2',
  },
  {
    text: 'Sizden kim bir kötülük görürse eliyle düzeltsin.',
    source: 'Müslim, Îman 49',
  },
  {
    text: 'Helal rızık aramak farzdır.',
    source: 'Beyhakî, Şuab',
  },
  {
    text: 'Her nimet bir imtihandır.',
    source: 'Taberânî, Kebîr',
  },
  {
    text: 'Kim Allah’ın rızasını gözetirse Allah ona yeter.',
    source: 'Tirmizî, Zühd 9',
  },
  {
    text: 'Allah, kuluna merhamet eder; kul da kullara merhamet etmeli.',
    source: 'Tirmizî, Birr 16',
  },
  {
    text: 'Yumuşaklık, bulunduğu şeyi güzelleştirir.',
    source: 'Müslim, Birr 78',
  },
  {
    text: 'Allah utangaçtır, kullarının kendisine ellerini boş döndürmekten hayâ eder.',
    source: 'Ebû Dâvûd, Vitir 23',
  },
  {
    text: 'Gıybet zinadan daha kötüdür.',
    source: 'Beyhakî, Şuab',
  },
  {
    text: 'Bir kimse öfkelendiğinde susmalıdır.',
    source: 'Ahmed b. Hanbel, Müsned',
  },
  {
    text: 'Alçak gönüllü olun; Allah sizi yükseltir.',
    source: 'Müslim, Birr 69',
  },
  {
    text: 'Mümin temizdir; temizliği sever.',
    source: 'Tirmizî, Taharet 1',
  },
  {
    text: 'Cömertlik cennete, cimrilik cehenneme yaklaştırır.',
    source: 'Tirmizî, Birr 40',
  },
  {
    text: 'Mümin kardeşine tebessüm etmek sadakadır.',
    source: 'Tirmizî, Birr 36',
  },
  {
    text: 'Güzel ahlak en ağır ameldir.',
    source: 'Tirmizî, Birr 62',
  },
  {
    text: 'Dünya bir yolcunun gölgesidir.',
    source: 'Tirmizî, Zühd 44',
  },
  {
    text: 'Zenginlik mal çokluğu değil, gönül zenginliğidir.',
    source: 'Buhârî, Rikak 15',
  },
  {
    text: 'İnsan öldüğünde amel defteri kapanır; ancak sadaka, faydalı ilim veya hayırlı evlat müstesna.',
    source: 'Müslim, Vasiyet 14',
  },
  {
    text: 'Her acının sonunda bir kolaylık vardır.',
    source: 'Tirmizî, Zühd 58',
  },
  {
    text: 'Bir lokma helal, bin gece ibadetten hayırlıdır.',
    source: 'Deylemî, Müsned',
  },
  {
    text: 'Allah kimseye zulmetmez.',
    source: 'Müslim, Birr 56',
  },
  {
    text: 'Müminlerin sevgisi Allah içindir.',
    source: 'Tirmizî, Zühd 53',
  },
  {
    text: 'Her şeyin bir anahtarı vardır; cennetin anahtarı kelime-i tevhiddir.',
    source: 'Ahmed b. Hanbel, Müsned',
  },
  {
    text: 'Ameller niyetlere göredir.',
    source: 'Buhârî, Bed’ü’l-Vahy 1',
  },
  {
    text: 'Hastaları ziyaret edin.',
    source: 'Müslim, Selam 12',
  },
  {
    text: 'Yetimin başını okşayın.',
    source: 'Ahmed b. Hanbel, Müsned',
  },
  {
    text: 'Allah kuluna zulmetmez; kul kendine zulmeder.',
    source: 'Âl-i İmrân 117 (ayet)',
  },
  {
    text: 'İsraf etmeyiniz.',
    source: 'Araf 31 (ayet)',
  },
  {
    text: 'Selamı önce siz verin.',
    source: 'Tirmizî, İsti’zan 1',
  },
  {
    text: 'Kötü arkadaş, körükçüye benzer.',
    source: 'Buhârî, Büyû 38',
  },
  {
    text: 'İlim öğrenirken ölen kimse şehittir.',
    source: 'Dârimî, Mukaddime 33',
  },
  {
    text: 'Kıyamet günü terazide güzel ahlaktan daha ağır bir şey yoktur.',
    source: 'Tirmizî, Birr 62',
  },
  {
    text: 'Din kolaylıktır.',
    source: 'Buhârî, İman 29',
  },
  {
    text: 'Haya imandandır.',
    source: 'Buhârî, Îman 16',
  },
  {
    text: 'Kişinin kendine hayrı olmayanın başkasına faydası olmaz.',
    source: 'Taberânî, Evsat',
  },
  {
    text: 'Yalan söylemek bütün kötülüklerin anahtarıdır.',
    source: 'Beyhakî, Şuab',
  },
  {
    text: 'Allah’ın en çok sevdiği amel, az da olsa devamlı olandır.',
    source: 'Müslim, Müsafirîn 215',
  },
  {
    text: 'Cennet kolaylıkla değil, zorluk ve sabırla kazanılır.',
    source: 'Tirmizî, Cennet 2',
  },
  {
    text: 'Allah’a en sevimli amel, gizli yapılan ameldir.',
    source: 'Beyhakî, Şuab',
  },
  {
    text: 'Kalbin düzelmesiyle bütün beden düzelir.',
    source: 'Buhârî, Îman 39',
  },
  {
    text: 'Kötülük yapan, kendine yapar.',
    source: 'Fâtır 18 (ayet)',
  },
  {
    text: 'Allah bütün işlerde yumuşaklığı sever.',
    source: 'Buhârî, Edeb 76',
  },
  {
    text: 'Yetimi koruyan kimse, benimle cennette yanyana olacaktır.',
    source: 'Buhârî, Edeb 24',
  },
  {
    text: 'Kibre giren cennete giremez.',
    source: 'Müslim, Îman 147',
  },
  {
    text: 'Allah, kendisine güveneni asla yarı yolda bırakmaz.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Nerede olursanız olun Allah sizinle beraberdir.',
    source: 'Hadid 4 (ayet)',
  },
  {
    text: 'Kıyamet günü kişinin ilk sorgulanacağı amel namazdır.',
    source: 'Tirmizî, Salât 9',
  }
];

export const FRIDAY_MESSAGES: Hadith[] = [
  {
    text: 'Cuma günü, üzerinde güneşin doğduğu en hayırlı gündür.',
    source: 'Müslim, Cum‘a 18',
  },
  {
    text: 'Cuma günü bol bol salavat getiriniz; zira bana sunulur.',
    source: 'Ebû Dâvûd, Salât 207',
  },
  {
    text: 'Cuma, müminlerin bayramıdır.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Bir kimse güzelce abdest alır, sonra cuma namazına gelir, susar ve hutbeyi dikkatle dinlerse geçmiş cuma ile bu cuma arasındaki küçük günahları bağışlanır.',
    source: 'Buhârî, Cum‘a 6',
  },

  {
    text: 'Kim cuma günü Kehf suresini okursa, iki cuma arasını aydınlatan bir nur hâsıl olur.',
    source: 'Hâkim, el-Müstedrek 2/368',
  },
  {
    text: 'Cuma günü yapılan dua, güneşin zevalinden ikindiye kadar kabul olunur.',
    source: 'Tirmizî, Cum‘a 2',
  },
  {
    text: 'Cuma günü, duaların kabul edildiği bir saat vardır.',
    source: 'Buhârî, Cum‘a 37',
  },
  {
    text: 'Cuma günü gusletmek her mükellef üzerine vaciptir.',
    source: 'Buhârî, Gusl 2',
  },
  {
    text: 'Kim cuma günü ölürse, şehitlik hükmünde olur.',
    source: 'Tirmizî, Cenâiz 75',
  },
  {
    text: 'Cuma günü sadaka vermek diğer günlerden daha faziletlidir.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma gününde öyle bir saat vardır ki, o saatte yapılan dua geri çevrilmez.',
    source: 'Müslim, Cum‘a 13',
  },
  {
    text: 'Cuma günü bana çokça salavat getiriniz; çünkü salavatlarınız bana arz olunur.',
    source: 'Nesâî, Sehv 55',
  },
  {
    text: 'Cuma günü mescide erken gelen, bir deve kurban etmiş gibi sevap kazanır.',
    source: 'Buhârî, Cum‘a 14',
  },
  {
    text: 'Cuma günü hutbe okunurken susmak farzdır.',
    source: 'Buhârî, Cum‘a 26',
  },
  {
    text: 'Cuma namazı müminlerin haftalık buluşma günüdür.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Kim cuma günü güzel elbisesini giyer, güzelce temizlenirse Allah ona rahmet eder.',
    source: 'İbn Mâce, İkâme 78',
  },
  {
    text: 'Cuma günü yapılan ibadetlerin sevabı diğer günlere göre kat kat fazladır.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü günahlara kefaret olan bir gündür.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma namazı Allah’ın müminlere bir hediyesidir.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü sevinç günüdür; Allah müminleri affetmek ister.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü açılan rahmet kapıları güneş batıncaya kadar kapanmaz.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü müminlerin dua günüdür.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü zillet değil, izzet günüdür.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma namazı, Müslümanların kalplerini birleştirir.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü, Ramazan ayındaki gecelerin fazileti gibidir.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü salavat getirenin derecesi yükselir.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma gününde yapılan zikirler diğer günlere göre daha değerlidir.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü Kur’an okumak, kulun kalbini nurlandırır.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma gününün bereketi sabahın ilk saatleriyle başlar.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma gününde müminlerin kalbi huzur bulur.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü yapılan iyilikler kat kat yazılır.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü rahmet melekleri insanların üstüne kanat gerer.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü Müslüman’ın yüzünde nur olur.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma, müminlerin arınma günüdür.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü tefekkür etmek, ibadetin nurudur.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü sevgi, kardeşlik ve selamlaşma günüdür.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü kalplerin yumuşadığı gündür.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma namazı, ümmetimin izzetidir.',
    source: 'Hadis-i Şerif',
  },
];



// Daily / Friday selector
export const getDailyHadith = (): Hadith => {
  // Handle empty list edge cases safely
  const hasDaily = DAILY_HADITHS.length > 0;
  const hasFriday = FRIDAY_MESSAGES.length > 0;

  const now = new Date();
  const isFriday = now.getDay() === 5; // 0 = Sunday, 5 = Friday

  // If today is Friday and we have Friday messages, or there are no daily hadiths, use Friday list
  const sourceList: Hadith[] =
    (isFriday && hasFriday) || !hasDaily ? FRIDAY_MESSAGES : DAILY_HADITHS;

  if (sourceList.length === 0) {
    return {
      text: '',
      source: '',
    };
  }

  // Deterministic index that is stable for that calendar day
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayKey = today.getTime();
  const index = Math.abs(dayKey) % sourceList.length;

  return sourceList[index];
};

