/* Небосвод: общие астрономические расчёты для калькуляторов.
   Эфемериды: Astronomy Engine (MIT). Айянамша Лахири — та же формула, что в боте. */
(function () {
  var A = window.Astronomy;
  var SIGNS = ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'];
  var SIGNS_PREP = ['Овне', 'Тельце', 'Близнецах', 'Раке', 'Льве', 'Деве', 'Весах', 'Скорпионе', 'Стрельце', 'Козероге', 'Водолее', 'Рыбах'];
  var GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

  function norm(x) { x = x % 360; return x < 0 ? x + 360 : x; }
  function jd(date) { return date.getTime() / 86400000 + 2440587.5; }
  function ayanamsa(date) { return 23.8531 + ((jd(date) - 2451545.0) / 36525) * 100 * (50.2388475 / 3600); }

  function sunTrop(d) { return A.SunPosition(d).elon; }
  function moonTrop(d) { return A.EclipticGeoMoon(d).lon; }
  function saturnTrop(d) { return A.Ecliptic(A.GeoVector(A.Body.Saturn, d, true)).elon; }
  function sid(trop, d) { return norm(trop - ayanamsa(d)); }

  /* смещение часового пояса (в минутах) для IANA-зоны в заданный момент */
  function tzOffsetMin(tz, date) {
    var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    var p = {}; f.formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
    var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    return (asUTC - date.getTime()) / 60000;
  }
  /* местное время рождения в городе -> момент UTC */
  function localToUTC(y, m, d, hh, mm, tz) {
    var guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
    var off = tzOffsetMin(tz, guess);
    var t = new Date(guess.getTime() - off * 60000);
    var off2 = tzOffsetMin(tz, t);
    if (off2 !== off) t = new Date(guess.getTime() - off2 * 60000);
    return t;
  }

  var NAK = [
    ['Ашвини', 'Кету', 'голова коня', 'скорость, смелые начинания, дар исцелять'],
    ['Бхарани', 'Венера', 'лоно', 'сила жизни, страсть и ответственность за свой выбор'],
    ['Криттика', 'Солнце', 'пламя и лезвие', 'огонь, прямота, умение отсекать лишнее'],
    ['Рохини', 'Луна', 'колесница', 'красота, притяжение, умение растить и сохранять'],
    ['Мригашира', 'Марс', 'голова оленя', 'любопытство, вечный поиск, мягкость'],
    ['Ардра', 'Раху', 'слеза', 'буря чувств, перемены, глубина переживаний'],
    ['Пунарвасу', 'Юпитер', 'колчан стрел', 'возвращение, восстановление, неисчерпаемый оптимизм'],
    ['Пушья', 'Сатурн', 'цветок', 'забота, опора для других, мудрость'],
    ['Ашлеша', 'Меркурий', 'змея', 'проницательность, магнетизм, сильная интуиция'],
    ['Магха', 'Кету', 'трон', 'достоинство, связь с родом, врождённое лидерство'],
    ['Пурва Пхалгуни', 'Венера', 'передние ножки ложа', 'любовь, удовольствие, творчество'],
    ['Уттара Пхалгуни', 'Солнце', 'задние ножки ложа', 'верность, прочные союзы, щедрость'],
    ['Хаста', 'Луна', 'ладонь', 'мастерство рук, ловкость, практичность'],
    ['Читра', 'Марс', 'сверкающая жемчужина', 'красота формы, талант создавать, яркость'],
    ['Свати', 'Раху', 'росток на ветру', 'независимость, гибкость, дар договариваться'],
    ['Вишакха', 'Юпитер', 'триумфальная арка', 'цель, упорство, амбиции'],
    ['Анурадха', 'Сатурн', 'лотос', 'дружба, преданность, успех вдали от дома'],
    ['Джйештха', 'Меркурий', 'амулет', 'старшинство, ответственность, внутренняя сила'],
    ['Мула', 'Кету', 'корни', 'докопаться до сути, разобрать старое и начать заново'],
    ['Пурва Ашадха', 'Венера', 'веер', 'непобедимость, вдохновение, очищение'],
    ['Уттара Ашадха', 'Солнце', 'бивень слона', 'окончательная победа, честность, стойкость'],
    ['Шравана', 'Луна', 'ухо', 'умение слушать, учиться и передавать знание'],
    ['Дхаништха', 'Марс', 'барабан', 'ритм, музыкальность, достаток'],
    ['Шатабхиша', 'Раху', 'пустой круг', 'целительство, тайны, независимость'],
    ['Пурва Бхадрапада', 'Юпитер', 'меч', 'страсть к идее, радикальные перемены'],
    ['Уттара Бхадрапада', 'Сатурн', 'змей глубин', 'глубина, мудрость, выдержка'],
    ['Ревати', 'Меркурий', 'рыба', 'забота, путь домой, завершение циклов']
  ];
  var SPAN = 360 / 27;
  function nakshatra(sidLon) {
    var i = Math.floor(sidLon / SPAN), pos = sidLon - i * SPAN;
    return { index: i, name: NAK[i][0], lord: NAK[i][1], symbol: NAK[i][2], key: NAK[i][3], pada: Math.floor(pos / (SPAN / 4)) + 1, pos: pos };
  }

  /* сидерический знак Сатурна на дату и поиск следующей смены знака */
  function saturnSign(d) { return Math.floor(sid(saturnTrop(d), d) / 30); }
  function saturnChanges(from, years) {
    var out = [], prev = saturnSign(from), t = from.getTime(), end = t + years * 365.25 * 86400000, step = 5 * 86400000;
    while (t < end) {
      t += step; var s = saturnSign(new Date(t));
      if (s !== prev) {
        var lo = t - step, hi = t;
        while (hi - lo > 3600000) { var mid = (lo + hi) / 2; if (saturnSign(new Date(mid)) === prev) lo = mid; else hi = mid; }
        out.push({ date: new Date(hi), from: prev, to: s }); prev = s;
      }
    }
    return out;
  }

  function fmtDate(d) { return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/\s?г\.?$/, '') + ' года'; }

  /* заполнение списка городов и чтение формы */
  function fillCities(sel) {
    (window.NB_CITIES || []).forEach(function (c) { var o = document.createElement('option'); o.value = c[1]; o.textContent = c[0]; sel.appendChild(o); });
    var o = document.createElement('option'); o.value = 'manual'; o.textContent = 'Другой город: указать часовой пояс'; sel.appendChild(o);
  }
  function readBirth(form, needTime) {
    var dv = form.querySelector('[name=date]').value;
    if (!dv) return { error: 'Укажи дату рождения.' };
    var p = dv.split('-').map(Number);
    var tv = form.querySelector('[name=time]') ? form.querySelector('[name=time]').value : '';
    var known = !!tv, hh = 12, mm = 0;
    if (known) { var q = tv.split(':').map(Number); hh = q[0]; mm = q[1]; }
    var tz = 'Europe/Moscow', citySel = form.querySelector('[name=city]');
    var utc;
    if (citySel && citySel.value === 'manual') {
      var off = parseFloat(form.querySelector('[name=offset]').value || '3');
      utc = new Date(Date.UTC(p[0], p[1] - 1, p[2], hh, mm) - off * 3600000);
    } else {
      if (citySel) tz = citySel.value;
      utc = localToUTC(p[0], p[1], p[2], hh, mm, tz);
    }
    return { utc: utc, timeKnown: known, y: p[0], m: p[1], d: p[2] };
  }

  window.NB = {
    SIGNS: SIGNS, SIGNS_PREP: SIGNS_PREP, GLYPHS: GLYPHS, NAK: NAK,
    ayanamsa: ayanamsa, sunTrop: sunTrop, moonTrop: moonTrop, saturnTrop: saturnTrop, sid: sid,
    nakshatra: nakshatra, saturnSign: saturnSign, saturnChanges: saturnChanges,
    fmtDate: fmtDate, fillCities: fillCities, readBirth: readBirth, norm: norm
  };
})();
