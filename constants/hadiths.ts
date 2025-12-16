export type Hadith = {
  text: string;
  source: string;
};

// Simple hadith pool to rotate daily
// constants/hadiths.ts

export const DAILY_HADITHS: Hadith[] = [
  {
    text: 'Müminler birbirlerini sevmede, birbirlerine merhamet ve şefkat göstermede tıpkı bir bedenin organları gibidir. Bedenin bir organı rahatsızlandığında diğer organlar da uykusuzluk ve yüksek ateşle bu acıya ortak olurlar.',
    source: 'Buhârî, Edeb 27; Müslim, Birr 66',
  },
  {
    text: 'Kim Allah’a güvenir ve O\'na tevekkül ederse, O, ona yeter. Şüphesiz Allah, emrini yerine getirendir. Allah her şey için bir ölçü tayin etmiştir.',
    source: 'Talâk Suresi, 3. Ayet',
  },
  {
    text: 'En faziletli sadaka, sağlığın yerindeyken, malına düşkün olduğun, zengin olmayı umup fakirlikten korktuğun bir haldeyken verdiğin sadakadır.',
    source: 'Buhârî, Vesâyâ 21',
  },
  {
    text: 'Emanete riayet etmeyenin (gerçek anlamda) imanı yoktur; sözünde durmayanın da dini yoktur.',
    source: 'Ahmed b. Hanbel, Müsned, III, 135',
  },
  {
    text: 'Gerçek mücahit, Yüce Allah\'a itaat yolunda nefsinin arzularına karşı cihad eden (nefsiyle mücadele eden) kimsedir.',
    source: 'Tirmizî, Fedâilü\'l-Cihad 2',
  },
  {
    text: 'Münafığın alameti üçtür: Konuştuğu zaman yalan söyler, kendisine bir şey emanet edildiğinde hainlik eder ve söz verdiği zaman sözünde durmaz.',
    source: 'Buhârî, Îman 24',
  },
  {
    text: 'Her meşru ve güzel iş bir sadakadır. Kardeşine güler yüzle bakman sadakadır. İnsanlara yol göstermen sadakadır.',
    source: 'Buhârî, Edeb 33',
  },
  {
    text: 'Hiçbir baba, çocuğuna güzel ahlak ve terbiyeden daha üstün ve kıymetli bir hediye veremez.',
    source: 'Tirmizî, Birr 33',
  },
  {
    text: 'Dünya, mümin için bir zindan (kadar sıkıntılı), kâfir için ise (adeta) bir cennettir.',
    source: 'Müslim, Zühd 1',
  },
  {
    text: 'Şüphesiz Allah güzeldir ve güzelliği sever. Kibir ise hakkı inkar etmek ve insanları küçümsemektir.',
    source: 'Müslim, Îman 147',
  },
  {
    text: 'İnsanların en hayırlısı, ömrü uzun olan ve ameli güzel olandır. İnsanların en şerlisi ise ömrü uzun, ameli kötü olandır.',
    source: 'Tirmizî, Zühd 22',
  },
  {
    text: 'Kim bir kardeşinin ihtiyacını giderirse Allah da onun ihtiyacını giderir. Kim bir Müslümanın sıkıntısını giderirse Allah da kıyamet günü onun sıkıntılarından birini giderir.',
    source: 'Müslim, Zikir 38',
  },
  {
    text: 'Kim istiğfara devam ederse, Allah ona her darlıktan bir çıkış, her üzüntüden bir kurtuluş yolu gösterir ve onu beklemediği yerden rızıklandırır.',
    source: 'Ebû Dâvûd, Vitir 26',
  },
  {
    text: 'Hiç kimseye sabırdan daha hayırlı ve daha geniş bir ihsanda bulunulmamıştır. Kim sabretmeye gayret ederse, Allah ona sabır verir.',
    source: 'Buhârî, Zekât 50',
  },
  {
    text: 'Hoşlanmadığın şeylere sabretmekte büyük hayır vardır; ve şüphesiz sabrın karşılığı cennettir.',
    source: 'Müsned, I, 307',
  },
  {
    text: 'Dünya malı tatlıdır ve çekicidir. Kim onu haksız yolla alırsa, yiyip de doymayan kimse gibi olur.',
    source: 'Müslim, Zekât 122',
  },
  {
    text: 'Kim bir hayra vesile olursa, o hayrı işleyen kimse gibi sevap kazanır.',
    source: 'Müslim, İmare 133',
  },
  {
    text: 'İyilikle kötülük bir olmaz. Sen kötülüğü en güzel olan şeyle sav. O zaman seninle arasında düşmanlık bulunan kimse, sanki sıcak bir dost oluverir.',
    source: 'Fussilet Suresi, 34. Ayet',
  },
  {
    text: 'Müminin niyeti amelinden hayırlıdır. Çünkü niyet kalbin, amel ise bedenin işidir.',
    source: 'Taberânî, el-Mu’cemü’l-Kebîr',
  },
  {
    text: 'Dua ibadetin özüdür. Allah katında duadan daha kıymetli bir şey yoktur.',
    source: 'Tirmizî, Daavât 1',
  },
  {
    text: 'Sizden biriniz, kendisi için arzu edip istediği şeyi, din kardeşi için de istemedikçe (gerçek anlamda) iman etmiş olmaz.',
    source: 'Buhârî, Îman 7',
  },
  {
    text: 'Kulun Rabbine en yakın olduğu an, secde hâlidir. Öyleyse secdede duayı çokça yapın.',
    source: 'Müslim, Salât 215',
  },
  {
    text: 'Müslüman, dilinden ve elinden diğer Müslümanların emin olduğu kimsedir.',
    source: 'Buhârî, Îman 4',
  },
  {
    text: 'Haksızlık karşısında susan, dilsiz şeytandır.',
    source: 'Risâle-i Kuşeyrî',
  },
  {
    text: 'Bir Müslümanın, din kardeşine üç günden fazla küsmesi helal değildir. Onların en hayırlısı, önce selam verendir.',
    source: 'Buhârî, Edeb 62',
  },
  {
    text: 'Şüphesiz Allah, sizden biriniz bir iş yaptığı zaman, onu sağlam ve güzel yapmasını sever.',
    source: 'Beyhakî, Şuabu’l-İman',
  },
  {
    text: 'Müslüman Müslümanın kardeşidir. Ona zulmetmez, onu (düşmanına) teslim etmez.',
    source: 'Buhârî, Mezâlim 3',
  },
  {
    text: 'Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.',
    source: 'Buhârî, İlim 11',
  },
  {
    text: 'Elbette zorluğun yanında bir kolaylık vardır. Gerçekten, zorlukla beraber bir kolaylık daha vardır.',
    source: 'İnşirah Suresi, 5-6. Ayetler',
  },
  {
    text: 'İki nimet vardır ki, insanların çoğu bunların kıymetini bilmeyerek aldanmıştır: Sağlık ve boş vakit.',
    source: 'Buhârî, Rikak 1',
  },
  {
    text: 'İlim talep etmek her Müslümana farzdır. Allah, ilim için yola koyulana cennet yolunu kolaylaştırır.',
    source: 'İbn Mâce, Mukaddime 17',
  },
  {
    text: 'Kıyamet günü insanoğlu ömrünü nerede tükettiğinden ve gençliğini nerede yıprattığından sorguya çekilmedikçe yerinden ayrılamaz.',
    source: 'Tirmizî, Kıyamet 1',
  },
  {
    text: 'Amellerin Allah\'a en sevimli geleni, az da olsa devamlı olanıdır.',
    source: 'Müslim, Müsafirin 218',
  },
  {
    text: 'Mümin, aynı delikten iki defa ısırılmaz (aynı hataya iki kez düşmez).',
    source: 'Buhârî, Edeb 83',
  },
  {
    text: 'Nerede olursan ol, Allah’tan kork (takvalı ol). Kötülüğün ardından hemen bir iyilik yap ki onu silsin.',
    source: 'Tirmizî, Birr 55',
  },
  {
    text: 'Gücü yettiği hâlde öfkesini yenen kimseyi Allah kıyamet günü herkesin önünde çağırır ve onu dilediği mükafatla ödüllendirir.',
    source: 'Tirmizî, Birr 74',
  },
  {
    text: 'İki kişinin arasını bulup düzeltmek sadakadır; kişiye yükünü yüklerken yardım etmek de sadakadır.',
    source: 'Buhârî, Cihad 72',
  },
  {
    text: 'İman etmedikçe cennete giremezsiniz; birbirinizi sevmedikçe de (gerçek manada) iman etmiş olmazsınız.',
    source: 'Müslim, Îman 93',
  },
  {
    text: 'Aranızda selamı yayınız. Zira selam, sevgiyi artıran en güzel sebeplerdendir.',
    source: 'Müslim, Îman 93',
  },
  {
    text: 'Allah katında amellerin en sevimlisi, vaktinde kılınan namaz, ana babaya iyilik ve Allah yolunda cihattır.',
    source: 'Buhârî, Mevâkît 5',
  },
  {
    text: 'Kim "Sübhanallahi ve bihamdihi" (Allah\'ı hamd ile tesbih ederim) derse, günahları deniz köpüğü kadar da olsa affedilir.',
    source: 'Buhârî, Daavât 65',
  },
  {
    text: 'Kim Allah için sever, Allah için nefret eder, Allah için verir ve Allah için engel olursa, imanını kemale erdirmiştir.',
    source: 'Ebû Dâvûd, Sünnet 15',
  },
  {
    text: 'Kötülüğün peşinden hemen bir iyilik yap ki onu yok etsin. İnsanlara da güzel ahlakla muamele et.',
    source: 'Tirmizî, Birr 55',
  },
  {
    text: 'Zarar vermek de yoktur, zarara zararla karşılık vermek de yoktur.',
    source: 'İbn Mâce, Ahkâm 17',
  },
  {
    text: 'İnsanlara merhamet etmeyene Allah da merhamet etmez. Merhamet edin ki merhamet olunasınız.',
    source: 'Buhârî, Edeb 18',
  },
  {
    text: 'Sizden kim bir kötülük görürse onu eliyle düzeltsin; buna gücü yetmezse diliyle düzeltsin; buna da gücü yetmezse kalbiyle buğzetsin.',
    source: 'Müslim, Îman 49',
  },
  {
    text: 'Hiç kimse elinin emeğinden daha hayırlı bir yemek yememiştir. Allah\'ın peygamberi Dâvûd (a.s.) da kendi elinin emeğini yerdi.',
    source: 'Buhârî, Büyû 15',
  },
  {
    text: 'Müminin durumu ne hoştur! Her hâli kendisi için hayırlıdır. Şükrederse sevap kazanır, sabrederse yine sevap kazanır.',
    source: 'Müslim, Zühd 64',
  },
  {
    text: 'Kim başkalarına muhtaç olmamak, ailesini geçindirmek ve komşusuna yardım etmek için çalışırsa, Allah’ın huzuruna yüzü dolunay gibi parlayarak çıkar.',
    source: 'Taberânî',
  },
  {
    text: 'Allah, merhametli olanlara rahmet eder. Siz yeryüzündekilere merhamet edin ki, gökyüzündekiler de size merhamet etsin.',
    source: 'Tirmizî, Birr 16',
  },
  {
    text: 'Rıfk (yumuşak huyluluk) bir şeye girdi mi onu mutlaka güzelleştirir; bir şeyden çıkarıldı mı onu mutlaka çirkinleştirir.',
    source: 'Müslim, Birr 78',
  },
  {
    text: 'Şüphesiz Rabbiniz hayâ sahibidir, cömerttir. Kulu ellerini O\'na açtığı zaman, o elleri boş çevirmekten hayâ eder.',
    source: 'Ebû Dâvûd, Vitir 23',
  },
  {
    text: 'Gıybetten sakınınız; zira gıybet, (etkisi ve günahı bakımından) zinadan daha şiddetlidir.',
    source: 'Deylemî',
  },
  {
    text: 'Sizden biriniz öfkelendiğinde sussun. (Çünkü öfke anında söylenen söz, pişmanlığa yol açabilir.)',
    source: 'Ahmed b. Hanbel, Müsned',
  },
  {
    text: 'Kim Allah için alçak gönüllü olursa, Allah onu yüceltir. Kim de böbürlenirse, Allah onu alçaltır.',
    source: 'Müslim, Birr 69',
  },
  {
    text: 'Şüphesiz İslam temizdir, temizliği sever. Öyleyse temizlenin, çünkü cennete temiz olandan başkası giremez.',
    source: 'Taberânî',
  },
  {
    text: 'Cömert kişi; Allah\'a yakındır, cennete yakındır, insanlara yakındır. Cimri kişi ise; Allah\'tan uzaktır, cennetten uzaktır, insanlardan uzaktır.',
    source: 'Tirmizî, Birr 40',
  },
  {
    text: 'Mümin kardeşinin yüzüne tebessüm etmen senin için bir sadakadır.',
    source: 'Tirmizî, Birr 36',
  },
  {
    text: 'Kıyamet günü müminin terazisinde güzel ahlaktan daha ağır basan bir şey yoktur.',
    source: 'Tirmizî, Birr 62',
  },
  {
    text: 'Benim dünya ile ne ilgim olabilir ki? Ben bu dünyada, bir ağacın altında gölgelenip sonra da bırakıp giden bir yolcu gibiyim.',
    source: 'Tirmizî, Zühd 44',
  },
  {
    text: 'Gerçek zenginlik mal çokluğu değil, gönül zenginliğidir (göz tokluğudur).',
    source: 'Buhârî, Rikak 15',
  },
  {
    text: 'İnsanoğlu öldüğü zaman amel defteri kapanır; ancak üç şey hariç: Sadaka-i cariye, faydalanılan ilim ve kendisine dua eden hayırlı evlat.',
    source: 'Müslim, Vasiyet 14',
  },
  {
    text: 'Her zorlukla beraber bir kolaylık vardır; bir zorluk iki kolaylığı asla yenemez.',
    source: 'Muvatta, Cihad 6',
  },
  {
    text: 'Helalinden kazanan, Allah’ın sevgili kuludur. İbadet on kısımdır, dokuzu helal rızık aramaktır.',
    source: 'Deylemî',
  },
  
  {
    text: 'Kullarıma söyle: Sözün en güzelini söylesinler. Çünkü şeytan aralarını bozmak ister.',
    source: 'İsrâ Suresi, 53. Ayet',
  },
  {
    text: 'Ruhlarım, toplu askerler gibidir; (ezelde) tanışanlar (dünyada) kaynaşır, tanışmayanlar ise anlaşamaz, ayrılırlar.',
    source: 'Buhârî, Enbiya 2',
  },
  {
    text: 'Kimin son sözü "Lâ ilâhe illallah" olursa, o kişi cennete girer.',
    source: 'Ebû Dâvûd, Cenâiz 20',
  },
  {
    text: 'Ameller (başka değil) ancak niyetlere göredir; herkesin niyeti ne ise eline geçecek olan odur.',
    source: 'Buhârî, Bed’ü’l-Vahy 1',
  },
  {
    text: 'Aç olanı doyurun, hastayı ziyaret edin ve esiri (borçluyu/tutsağı) kurtarın.',
    source: 'Buhârî, Cihad 171',
  },
  {
    text: 'Kalbinin yumuşamasını istersen; yoksulu doyur ve yetimin başını okşa.',
    source: 'Ahmed b. Hanbel, Müsned',
  },
  {
    text: 'Allah kullarına asla zulmedici değildir; fakat insanlar (kendi tercihleriyle) kendilerine zulmederler.',
    source: 'Yunus Suresi, 44. Ayet',
  },
  {
    text: 'Yiyiniz, içiniz, fakat israf etmeyiniz. Çünkü Allah israf edenleri sevmez.',
    source: 'Araf Suresi, 31. Ayet',
  },
  {
    text: 'İnsanların Allah katında en hayırlısı (ve en makbulü), onlara önce selam verendir.',
    source: 'Ebû Dâvûd, Edeb 133',
  },
  {
    text: 'İyi arkadaşla kötü arkadaşın misali, misk taşıyanla körük çeken gibidir. Misk taşıyan ya sana koku verir ya da güzel kokusundan faydalanırsın.',
    source: 'Buhârî, Büyû 38',
  },
  {
    text: 'Kim ilim tahsili yolunda iken eceli gelir vefat ederse, onunla peygamberler arasında sadece bir peygamberlik derecesi farkı vardır.',
    source: 'Taberânî',
  },
  {
    text: 'Sizin en hayırlınız, ahlakı en güzel olanınızdır.',
    source: 'Buhârî, Edeb 38',
  },
  {
    text: 'Şüphesiz din kolaylıktır. Kim dini (aşırı giderek) zorlaştırırsa, din ona galip gelir.',
    source: 'Buhârî, İman 29',
  },
  {
    text: 'Hayâ imandandır, iman ise cennettedir. Çirkin söz ve davranış ise kabalıktandır, kabalık ise cehennemdedir.',
    source: 'Tirmizî, Birr 65',
  },
  {
    text: 'Mümin, kendisiyle ülfet edilen (iyi geçinilen) kimsedir. İnsanlarla iyi geçinmeyen ve kendisiyle iyi geçinilmeyen kimsede hayır yoktur.',
    source: 'Ahmed b. Hanbel, Müsned',
  },
  {
    text: 'Yalandan sakının! Çünkü yalan kötülüğe, kötülük de cehenneme götürür.',
    source: 'Buhârî, Edeb 69',
  },
  {
    text: 'Cennet zorluklarla ve nefsin hoşuna gitmeyen şeylerle, cehennem ise şehvetler ve nefsin arzularıyla çevrilmiştir.',
    source: 'Müslim, Cennet 1',
  },
  {
    text: 'Sadakanın en faziletlisi, (verenin) gizli verdiği sadakadır; öyle ki sağ elinin verdiğini sol eli bilmesin.',
    source: 'Taberânî',
  },
  {
    text: 'Dikkat edin! Vücutta öyle bir et parçası vardır ki, o düzelirse bütün vücut düzelir, o bozulursa bütün vücut bozulur. Dikkat edin! O, kalptir.',
    source: 'Buhârî, Îman 39',
  },
  {
    text: 'Kim zerre miktarı hayır işlerse onun karşılığını görür; kim de zerre miktarı şer işlerse onun karşılığını görür.',
    source: 'Zilzal Suresi, 7-8. Ayetler',
  },
  {
    text: 'Allah her işte rıfkı (yumuşaklığı, nezaketi ve kolaylığı) sever.',
    source: 'Buhârî, Edeb 35',
  },
  {
    text: 'Ben ve yetimi himaye eden kimse, cennette şöylece (işaret ve orta parmağını göstererek) yan yana olacağız.',
    source: 'Buhârî, Talâk 25',
  },
  {
    text: 'Kalbinde zerre kadar kibir bulunan kimse cennete giremez.',
    source: 'Müslim, Îman 147',
  },
  {
    text: 'Allah, kendisine dua edip güveneni asla yarı yolda bırakmaz; O, en hayırlı vekildir.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Nerede olursanız olun, O sizinle beraberdir. Allah yaptıklarınızı hakkıyla görendir.',
    source: 'Hadîd Suresi, 4. Ayet',
  },
  {
    text: 'Kıyamet günü kulun hesaba çekileceği ilk ameli namazdır. Eğer namazı tam ise kurtuluşa erer, değilse hüsrana uğrar.',
    source: 'Tirmizî, Salât 188',
  }
];

export const FRIDAY_MESSAGES: Hadith[] = [
  {
    text: 'Üzerine güneşin doğduğu en hayırlı gün Cuma günüdür; Âdem (a.s.) o gün yaratıldı, o gün cennete girdi ve o gün cennetten çıkarıldı. Kıyamet de ancak Cuma günü kopacaktır.',
    source: 'Müslim, Cum‘a 18',
  },
  {
    text: 'Günlerin en faziletlisi Cuma günüdür. Bu sebeple o gün bana çokça salavat getirin; zira sizin salavatlarınız bana arz olunur.',
    source: 'Ebû Dâvûd, Salât 201',
  },
  {
    text: 'Bu gün (Cuma), Allah’ın Müslümanlar için belirlediği bir bayram günüdür. Cumaya gelen yıkansın, varsa güzel koku sürünsün.',
    source: 'İbn Mâce, İkâme 83',
  },
  {
    text: 'Bir kimse güzelce abdest alır, sonra Cuma namazına gelir, susup hutbeyi dinlerse, iki Cuma arasındaki ve buna ilave olarak üç günlük günahları bağışlanır.',
    source: 'Müslim, Cum‘a 26',
  },
  {
    text: 'Kim Cuma günü Kehf suresini okursa, kendisine bir dahaki Cumaya kadar parlayan bir nur verilir.',
    source: 'Hâkim, el-Müstedrek 2/399',
  },
  {
    text: 'Cuma gününde öyle bir saat vardır ki, şayet bir Müslüman kul namaz kılarken o saate rastlar da Allah\'tan bir şey isterse, Allah ona dilediğini mutlaka verir.',
    source: 'Buhârî, Cum‘a 37',
  },
  {
    text: 'Ey iman edenler! Cuma günü namaza çağrıldığınız zaman, Allah\'ı anmaya koşun ve alışverişi bırakın. Eğer bilirseniz bu sizin için daha hayırlıdır.',
    source: 'Cuma Suresi, 9. Ayet',
  },
  {
    text: 'Cuma günü gusletmek (boy abdesti almak), ergenlik çağına ermiş her Müslümana vaciptir.',
    source: 'Buhârî, Ezan 161',
  },
  {
    text: 'Müslümanlardan kim Cuma günü veya Cuma gecesi ölürse, Allah onu kabir azabından ve fitnesinden korur.',
    source: 'Tirmizî, Cenâiz 73',
  },
  {
    text: 'Cuma günü verilen sadaka, diğer günlerde verilen sadakadan daha faziletlidir. O gün yapılan iyiliklerin sevabı kat kattır.',
    source: 'İbn Kayyim, Zâdü\'l-Meâd',
  },
  {
    text: 'Cumaya gitmek, yoksulların haccıdır. (Yani Haccın sevabına benzer bir sevap kazandırır).',
    source: 'Deylemî',
  },
  {
    text: 'Cuma günü bana çokça salavat getirin. Çünkü Cuma, meleklerin şahitlik ettiği bir gündür.',
    source: 'İbn Mâce, Cenâiz 65',
  },
  {
    text: 'Kim Cuma günü erkenden mescide giderse bir deve kurban etmiş, daha sonra giden bir sığır kurban etmiş gibi sevap kazanır.',
    source: 'Buhârî, Cum‘a 4',
  },
  {
    text: 'İmam hutbe okurken arkadaşına "Sus!" desen bile, (o anki boş konuşman sebebiyle) Cuma sevabını eksiltmiş olursun.',
    source: 'Buhârî, Cum‘a 36',
  },
  {
    text: 'Allah, Cuma namazını terk edenlerin kalplerini mühürler; sonra onlar gafillerden olurlar.',
    source: 'Müslim, Cum‘a 40',
  },
  {
    text: 'Kim Cuma günü yıkanır, en güzel elbisesini giyer ve güzel koku sürünürse, bu onun için günahlarına kefaret olur.',
    source: 'Ahmed b. Hanbel, Müsned',
  },
  {
    text: 'Cuma günü, ibadetlerin ve duaların kabul edildiği, rahmet kapılarının sonuna kadar açıldığı mübarek bir zaman dilimidir.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Beş vakit namaz ve Cuma\'dan Cuma\'ya kılınan namaz, büyük günah işlenmedikçe aradaki küçük günahlara kefarettir.',
    source: 'Müslim, Taharet 16',
  },
  {
    text: 'Cuma namazı, yoksulun, çaresizin ve miskinin sığınağıdır; Allah o gün müminleri bir araya getirerek kalplerini kaynaştırır.',
    source: 'Hadis-i Şerif',
  },
  {
    text: 'Cuma günü melekler mescidin kapılarında bekler, gelenleri sırasıyla yazarlar. İmam minbere çıkınca defterleri kapatıp hutbeyi dinlerler.',
    source: 'Buhârî, Cum‘a 31',
  },
  {
    text: 'Cuma günü ikindi namazından sonra yapılan duaların kabul olunma ihtimali yüksektir.',
    source: 'Taberânî',
  },
  {
    text: 'En faziletli gününüz Cuma günüdür. O gün bana çokça salavat getirin.',
    source: 'Ebû Dâvûd, Salât 201',
  },
  {
    text: 'Rabbim! Cuma gününün bereketiyle günahlarımızı affet, dualarımızı kabul eyle ve bizi sevdiklerinle beraber haşreyle.',
    source: 'Dua',
  },
  {
    text: 'Cuma, Müslümanların kalplerinin birleştiği, safların sıklaştığı ve duaların arşa yükseldiği mukaddes bir gündür.',
    source: 'Kelam-ı Kibar',
  },
  {
    text: 'Cuma günü, haftalık manevi temizlik ve yenilenme günüdür; ruhun gıdasıdır.',
    source: 'Hikmetli Söz',
  },
  {
    text: 'Ey Rabbim! Bu mübarek Cuma günü hürmetine, bizi, ailemizi ve bütün ümmeti Muhammed\'i her türlü musibetten muhafaza eyle.',
    source: 'Dua',
  },
  {
    text: 'Cuma günü okunan Kur\'an, kalbe inen bir şifadır. Salavat ise ruhun miracıdır.',
    source: 'Hadis-i Şerif Meali',
  },
  {
    text: 'Allah\'ım! Cuma gününün yüzü suyu hürmetine, hasta kullarına şifa, dertli kullarına deva, borçlu kullarına eda nasip eyle.',
    source: 'Dua',
  },
  {
    text: 'Cuma\'nın nuru üzerinize olsun; kalbiniz imanla, gönlünüz huzurla dolsun.',
    source: 'Cuma Mesajı',
  },
  {
    text: 'Rabbim, Cuma gününü bizlere günahların affı ve rızanın kazanılması için vesile kılsın.',
    source: 'Dua',
  },
  {
    text: 'Kim Cuma günü "Yâ Rabbi" derse, Allah ona "Buyur kulum" der ve isteğini geri çevirmez (inşallah).',
    source: 'Müjde',
  },
  {
    text: 'Cuma günü rahmet rüzgarları eser, müminlerin üzerine sekine ve huzur iner.',
    source: 'Tasvir',
  },
  {
    text: 'Allah\'ım! Bizi Cuma\'nın feyzinden ve bereketinden mahrum bırakma.',
    source: 'Dua',
  },
  {
    text: 'Cuma, müminlerin manevi diriliş günüdür; gafletten uyanışın adıdır.',
    source: 'Tefekkür',
  },
  {
    text: 'Her Cuma, yeni bir başlangıç, yeni bir tövbe ve yeni bir umuttur.',
    source: 'Motivasyon',
  },
  {
    text: 'Cuma günü sevdiklerinize dua edin, zira dua müminin mümine en güzel hediyesidir.',
    source: 'Tavsiye',
  },
  {
    text: 'Cumamız mübarek, dualarımız kabul, amelimiz makbul olsun.',
    source: 'Dua',
  }
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

