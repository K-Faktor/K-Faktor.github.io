/*
 * FAQ tab.
 *
 * Everything here was checked against the CoD4 sources rather than written from
 * memory: dvar names, defaults and ranges come from the same extraction that
 * feeds the dvars tab, the console commands from Cmd_AddCommandInternal, the
 * profile path from Com_BuildPlayerProfilePath, and the set / seta / sets /
 * setu flags from Dvar_SetA_f and its siblings.
 */
(function ()
{
	"use strict";

	var COPIED_RESET_MS = 1200;
	var HINT_RESET_MS = 3000;

	// KeyboardEvent.code mapped to the name CoD4 binds under, from the keynames
	// table in cl_keys.cpp. Only keys that produce no character are listed:
	// those cannot be typed into the field, so the field catches them instead.
	// Printable keys, Tab, Escape, Backspace and the modifiers are left alone,
	// so ordinary typing and Shift for capitals keep working.
	var CAPTURED_KEYS = {
		F1: "F1", F2: "F2", F3: "F3", F4: "F4", F5: "F5", F6: "F6",
		F7: "F7", F8: "F8", F9: "F9", F10: "F10", F11: "F11", F12: "F12",
		ArrowUp: "UPARROW", ArrowDown: "DOWNARROW",
		ArrowLeft: "LEFTARROW", ArrowRight: "RIGHTARROW",
		Insert: "INS", Delete: "DEL", PageUp: "PGUP", PageDown: "PGDN",
		Home: "HOME", End: "END", Pause: "PAUSE", CapsLock: "CAPSLOCK",
		Enter: "ENTER", Space: "SPACE",
		NumLock: "KP_NUMLOCK", Numpad0: "KP_INS", Numpad1: "KP_END",
		Numpad2: "KP_DOWNARROW", Numpad3: "KP_PGDN", Numpad4: "KP_LEFTARROW",
		Numpad5: "KP_5", Numpad6: "KP_RIGHTARROW", Numpad7: "KP_HOME",
		Numpad8: "KP_UPARROW", Numpad9: "KP_PGUP", NumpadDecimal: "KP_DEL",
		NumpadDivide: "KP_SLASH", NumpadMultiply: "KP_STAR",
		NumpadSubtract: "KP_MINUS", NumpadAdd: "KP_PLUS",
		NumpadEnter: "KP_ENTER", NumpadEqual: "KP_EQUALS"
	};

	var ENTRIES = [
		/* ---------- Начало работы ---------- */
		{
			group: "Начало работы",
			q: "У меня игра на диске. Что устанавливать и в каком порядке?",
			a: "Четыре вещи, и порядок важен: каждый патч рассчитывает на предыдущий.",
			steps: [
				{ text: "Установите Call of Duty 4 с дисков." },
				{ text: "Поставьте патч 1.6." },
				{ text: "Поверх него поставьте патч 1.7." },
				{ text: "Установите клиент CoD4X 21.3.", link: "https://cod4x.ovh/t/cod4x-client-and-server-files/24",
					linkText: "cod4x.ovh" }
			]
		},
		{
			group: "Начало работы",
			q: "Я купил игру в Steam. Что ещё нужно?",
			a: "Только последний шаг. Steam сам держит игру на версии 1.7, так что официальные " +
				"патчи уже стоят к моменту окончания установки.",
			steps: [
				{ text: "Купите и установите Call of Duty 4: Modern Warfare через Steam." },
				{ text: "Установите клиент CoD4X 21.3.", link: "https://cod4x.ovh/t/cod4x-client-and-server-files/24",
					linkText: "cod4x.ovh" }
			]
		},
		/*{
			group: "Начало работы",
			q: "Что нужно, чтобы играть на FPS Challenge?",
			a: "Рабочая установка версии 1.7, затем два ID в вашем профиле и три загрузки. " +
				"Античит должен понимать, кто вы, прежде чем пустить вас на сервер, — для этого " +
				"и нужны ID.",
			steps: [
				{ text: "Зарегистрируйтесь на FPS Challenge и войдите.", link: "https://fpschallenge.eu/",
					linkText: "fpschallenge.eu" },
				{ text: "Укажите свой Steam ID и TeamSpeak 3 ID в разделе Identifiers " +
					"вашего профиля. Без них вы не попадёте ни на игровые серверы, ни в " +
					"TeamSpeak, который находится по адресу fpschallenge." },
				{ text: "Установите клиент CoD4X 21.4.",
					link: "https://fpschallenge.b-cdn.net/public/gamefiles/cod4/cod4x_client_21_4.zip",
					linkText: "cod4x_client_21_4.zip",
					sub: [
						"Распакуйте архив.",
						"Скопируйте папку cod4-client-manualinstall_21.4 в вашу папку CoD4.",
						"Откройте эту папку и запустите install.cmd.",
						"Запустите игру один раз. Клиент CoD4X обновится сам."
					] },
				{ text: "Поверх поставьте хотфикс 21.5.",
					link: "https://fpschallenge.b-cdn.net/public/gamefiles/cod4/cod4x_client_21_5.zip",
					linkText: "cod4x_client_21_5.zip",
					sub: [
						"Распакуйте архив и возьмите из него cod4x_021.dll.",
						"Замените файл с тем же именем в папке bin ниже."
					] },
				{ text: "Установите античит FPS Challenge.",
					link: "https://dl.fpschallenge.eu/anticheat/FPSCACInstaller.msi",
					linkText: "FPSCACInstaller.msi",
					sub: ["Запустите установщик и следуйте его указаниям."] }
			],
			rows: [
				{ label: "hotfix", desc: "целевая папка", text: "%localappdata%\\CallofDuty4MW\\bin\\cod4x_021" }
			]
		},*/

		/* ---------- HUD и отображение ---------- */
		{
			group: "HUD и отображение",
			q: "Как включить и выключить счётчик FPS?",
			a: "Это не простой переключатель: у cg_drawFPS четыре режима. 0 скрывает его, 1 — " +
				"простое число, которое нужно большинству.",
			cfg: 'seta cg_drawFPS "1"',
			cmd: "/cg_drawFPS 1",
			note: "0 выкл., 1 простое, 2 простое с диапазонами, 3 подробное. По умолчанию 1. " +
				"cg_drawFPSLabels 0 убирает подпись рядом с числом."
		},
		{
			group: "HUD и отображение",
			q: "Как включить и выключить лагометр?",
			a: "Обычный переключатель для двух графиков в правом нижнем углу: поток " +
				"снимков сверху, пинг снизу.",
			cfg: 'seta cg_drawLagometer "1"',
			cmd: "/cg_drawLagometer 1",
			note: "По умолчанию 0."
		},
		{
			group: "HUD и отображение",
			q: "Как изменить угол обзора?",
			a: "cg_fov задаётся в градусах. Игра ограничивает его диапазоном 65–120, поэтому " +
				"большее число молча игнорируется, а не применяется. cg_fovScale умножает то, " +
				"что получилось в cg_fov, так что они складываются: 65 при масштабе 1.25 даёт 81.25.",
			cfg: 'seta cg_fov "80"\nseta cg_fovScale "1"',
			cmd: "/cg_fov 80",
			note: "cg_fov по умолчанию 65 и работает в диапазоне 65–120. cg_fovScale по умолчанию 1 " +
				"и работает в диапазоне 0.2–2. Оба — защищённые клиентские настройки, поэтому " +
				"сервер не может их перезаписать."
		},
		{
			group: "HUD и отображение",
			q: "Как убрать прицел?",
			a: "Есть два двара прицела: один для игры, другой пишет меню. " +
				"Если после перезапуска он возвращается, задайте оба.",
			cfg: 'seta cg_drawCrosshair "0"\nseta ui_drawCrosshair "0"',
			cmd: "/cg_drawCrosshair 0",
			note: "Оба по умолчанию 1."
		},
		{
			group: "HUD и отображение",
			q: "Как скрыть имена врагов под прицелом?",
			a: "cg_drawCrosshairNames управляет именем, которое появляется при наведении на кого-либо.",
			cfg: 'seta cg_drawCrosshairNames "0"',
			cmd: "/cg_drawCrosshairNames 0",
			note: "По умолчанию 1."
		},
		{
			group: "HUD и отображение",
			q: "Как отключить кровь и гильзы?",
			a: "Два отдельных переключателя. Оба — в основном дело вкуса, хотя меньше гильз " +
				"означает чуть меньше отрисовки.",
			cfg: 'seta cg_blood "0"\nseta cg_brass "0"',
			cmd: "/cg_blood 0",
			note: "Оба по умолчанию 1."
		},
		{
			group: "HUD и отображение",
			q: "Как включить маленький консольный оверлей?",
			a: "con_minicon держит последние несколько строк консоли на экране, не открывая " +
				"полную консоль.",
			cfg: 'seta con_minicon "1"',
			cmd: "/con_minicon 1",
			note: "По умолчанию 0."
		},

		/* ---------- Графика и производительность ---------- */
		{
			group: "Графика и производительность",
			q: "Как ограничить частоту кадров?",
			a: "com_maxfps задаёт потолок. Следите за написанием: com, а не con.",
			cfg: 'seta com_maxfps "250"',
			cmd: "/com_maxfps 250",
			note: "По умолчанию 85, диапазон 0–1000. Чаще всего встречаются 125, 250 и 333."
		},
		{
			group: "Графика и производительность",
			q: "Почему r_picmip ничего не делает?",
			a: "Потому что он доступен только для чтения, пока вы не возьмёте его под ручное " +
				"управление. Сначала r_picmip_manual должен быть 1, иначе игра сама выбирает " +
				"уровень и игнорирует ваш.",
			cfg: 'seta r_picmip_manual "1"\nseta r_picmip "3"',
			cmd: "/r_picmip_manual 1",
			note: "r_picmip работает в диапазоне 0–3, где 3 — самый размытый и самый дешёвый."
		},
		{
			group: "Графика и производительность",
			q: "Как изменить яркость?",
			a: "r_gamma — это внутриигровая яркость. Она переживает перезапуск, в отличие от " +
				"ползунка в меню на некоторых системах.",
			cfg: 'seta r_gamma "1.4"',
			cmd: "/r_gamma 1.4",
			note: "По умолчанию 0.8, диапазон 0.5–3."
		},
		{
			group: "Графика и производительность",
			q: "Нужно ли перезапускать игру после изменения видео-настройки?",
			a: "Не всю игру. vid_restart перезагружает рендерер — этого достаточно для " +
				"разрешения, picmip и большинства r_-дваров.",
			cmd: "/vid_restart"
		},

		/* ---------- Мышь, обзор и звук ---------- */
		{
			group: "Мышь, обзор и звук",
			q: "Как точно задать чувствительность мыши?",
			a: "Ползунок в меню округляет; ввод числа — нет. Любое значение в диапазоне " +
				"сохраняется так, как вы его ввели.",
			cfg: 'seta sensitivity "2.75"',
			cmd: "/sensitivity 2.75",
			note: "По умолчанию 5, диапазон 0.01–100."
		},
		{
			group: "Мышь, обзор и звук",
			q: "Как отключить сглаживание мыши?",
			a: "m_filter усредняет движение мыши по кадрам, что ощущается как небольшая " +
				"задержка. По умолчанию выключено, так что проверьте, если прицеливание " +
				"кажется «плавающим».",
			cfg: 'seta m_filter "0"',
			cmd: "/m_filter 0",
			note: "По умолчанию 0."
		},
		{
			group: "Мышь, обзор и звук",
			q: "Как изменить громкость игры из конфига?",
			a: "snd_volume — это общая громкость в виде дроби, а не в процентах.",
			cfg: 'seta snd_volume "0.6"',
			cmd: "/snd_volume 0.6",
			note: "По умолчанию 0.8, диапазон 0–1."
		},

		/* ---------- Файл конфига ---------- */
		{
			group: "Файл конфига",
			q: "Где находится config_mp.cfg?",
			a: "В двух разных местах, в зависимости от того, какой клиент вы используете. " +
				"Оригинальная игра держит его внутри своей папки установки; CoD4X выносит его " +
				"в ваш профиль пользователя. Папка профиля названа по имени созданного вами " +
				"профиля, а не по вашему игровому имени.",
			rows: [
				{ label: "stock", text: "<папка установки CoD4>\\players\\profiles\\<профиль>\\config_mp.cfg", copy: false },
				{ label: "CoD4X", text: "%localappdata%\\CallofDuty4MW\\players\\profiles\\" }
			],
			note: "Строку CoD4X можно вставить прямо в адресную строку Проводника: он " +
				"развернёт %localappdata% за вас и откроет вас рядом с папками профилей. " +
				"Игра сама строит этот путь и выполняет файл при запуске, поэтому правка " +
				"не той копии ничего не меняет."
		},
		{
			group: "Файл конфига",
			q: "Почему мои правки пропадают после выхода из игры?",
			a: "Потому что CoD4 перезаписывает config_mp.cfg при выходе, затирая всё, что вы " +
				"изменили, пока игра была запущена. Три способа обойти это: редактировать файл " +
				"при закрытой игре, держать свои настройки в собственном файле и загружать его, " +
				"либо защитить config_mp.cfg от записи, чтобы игра вообще не могла его перезаписать.",
			cfg: 'exec mysettings.cfg',
			cmd: "/exec mysettings.cfg",
			note: "Чтобы защитить от записи: щёлкните config_mp.cfg правой кнопкой, Свойства, " +
				"поставьте галочку «Только чтение», ОК. Тогда ваши настройки переживут каждый " +
				"перезапуск, но и ничего из изменённого в игровых меню тоже не сохранится. " +
				"Положите свой .cfg рядом с config_mp.cfg."
		},
		{
			group: "Файл конфига",
			q: "В чём разница между set, seta, sets и setu?",
			a: "Все они задают значение; различаются флагом, который добавляют после. seta " +
				"помечает его для архивации — именно это возвращает его в config_mp.cfg при " +
				"следующей записи. Обычный set действует до выхода. sets и setu помечают " +
				"значение как server info или user info и относятся к серверам, а не к вашему " +
				"конфигу.",
			cfg: 'seta cg_fov "80"',
			note: "Именно поэтому почти каждая строка в конфиге игрока начинается с seta."
		},
		{
			group: "Файл конфига",
			q: "Как загрузить конфиг во время работы игры?",
			a: "exec выполняет файл из той же папки, где лежит config_mp.cfg. Удобно для " +
				"отдельного матчевого конфига или набора биндов.",
			cmd: "/exec match.cfg"
		},
		{
			group: "Файл конфига",
			q: "Как сохранить текущие настройки в файл?",
			a: "writeconfig выгружает каждый архивированный двар и каждый бинд в файл с " +
				"указанным вами именем.",
			cmd: "/writeconfig backup.cfg",
			note: "Пишет рядом с config_mp.cfg."
		},

		/* ---------- Бинды и скрипты ---------- */
		{
			group: "Бинды и скрипты",
			q: "Как привязать клавишу?",
			a: "bind принимает сначала клавишу, затем команду. Заключайте команду в кавычки, " +
				"как только в ней появляется пробел.",
			cfg: 'bind F "+melee"',
			cmd: '/bind F "+melee"',
			note: "bindlist выводит всё, что сейчас привязано, unbind F очищает одну клавишу, " +
				"unbindall очищает всё."
		},
		{
			group: "Бинды и скрипты",
			q: "Как поместить несколько команд на одну клавишу?",
			a: "Разделите их точками с запятой внутри кавычек. Они выполняются по порядку, " +
				"слева направо.",
			cfg: 'bind X "say Nice one; +smoke"',
			note: "Это тот же приём, который используют вкладки килфида и табло, чтобы " +
				"переприменить цвета, сбрасываемые модом."
		},
		{
			group: "Бинды и скрипты",
			q: "Как сделать клавишу-переключатель между двумя настройками?",
			a: "Двумя способами. toggle переключает один двар между значениями, а для " +
				"чего-то более длинного вы сохраняете обе половины как двары и переходите " +
				"между ними через vstr.",
			cfg: 'bind N "toggle cg_drawFPS 0 1"\n' +
				'seta fovOn "cg_fov 80; seta fovSwap vstr fovOff"\n' +
				'seta fovOff "cg_fov 65; seta fovSwap vstr fovOn"\n' +
				'seta fovSwap "vstr fovOn"\n' +
				'bind M "vstr fovSwap"',
			note: "Осторожно: vstr входит в большинство лигских списков запрещённого " +
				"содержимого, потому что именно из него строятся читерские меню. Проверка " +
				"конфига его помечает."
		},

		/* ---------- Меню Promod ---------- */
		{
			group: "Меню Promod",
			q: "Что скрывается за B4 в Promod?",
			a: "B открывает меню быстрых сообщений. 1–3 — стандартные страницы CoD4, 4 — " +
				"собственная страница Promod, 5 — её графическая страница. То есть B45 " +
				"означает: B, затем 4, затем 5. Каждая строка — это ещё и консольная команда, " +
				"которую вы привязываете к клавише. Щёлкните поле клавиши и нажмите нужную " +
				"клавишу либо введите её имя.",
			rows: [
				{ label: "B41", desc: "Timeout", text: "openscriptmenu quickpromod 1", bind: true },
				{ label: "B42", desc: "Drop Bomb", text: "openscriptmenu quickpromod 2", bind: true },
				{ label: "B43", desc: "Suicide", text: "openscriptmenu quickpromod 3", bind: true },
				{ label: "B44", desc: "Spectate Team", text: "openscriptmenu quickpromod killspec", bind: true },
				{ label: "B45", desc: "Automatic record", text: "openscriptmenu quickpromod 4", bind: true },
				{ label: "B46", desc: "Velocity meter", text: "openscriptmenu quickpromod velocity", bind: true },
				{ label: "B47", desc: "Statistics", text: "openscriptmenu quickpromod 5", bind: true }
			],
			note: "Timeout работает только когда вы в команде, а Drop Bomb — не во время " +
				"закладки. Spectate Team убивает вас, освобождает слот класса и держит вне " +
				"игры, пока вы снова не выберете класс. В старых сборниках биндов указаны " +
				"другие номера, потому что порядок менялся между версиями Promod — эти из " +
				"Promod X."
		},
		{
			group: "Меню Promod",
			q: "Что скрывается за B5 в Promod?",
			a: "Графическая страница. Каждая строка переключает или циклически меняет одну " +
				"клиентскую настройку, а меню показывает текущее значение. Щёлкните поле " +
				"клавиши и нажмите нужную клавишу либо введите её имя.",
			rows: [
				{ label: "B51", desc: "Lighting", text: "openscriptmenu quickpromodgfx 1", bind: true },
				{ label: "B52", desc: "Film Tweaks", text: "openscriptmenu quickpromodgfx 2", bind: true },
				{ label: "B53", desc: "Texture Filtering", text: "openscriptmenu quickpromodgfx 3", bind: true },
				{ label: "B54", desc: "Normal Map", text: "openscriptmenu quickpromodgfx 4", bind: true },
				{ label: "B55", desc: "FOV Scale", text: "openscriptmenu quickpromodgfx 5", bind: true },
				{ label: "B56", desc: "Gun X", text: "openscriptmenu quickpromodgfx 6", bind: true },
				{ label: "B57", desc: "Sound Faction", text: "openscriptmenu quickpromodgfx 7", bind: true }
			],
			note: "Lighting проходит 1.2, Stock, Off и пишет r_lighttweaksunlight. Film Tweaks — " +
				"это r_filmusetweaks, Texture Filtering — r_texfilterdisable, так что On в меню " +
				"означает, что фильтрация включена. FOV Scale перебирает 1, 1.05, 1.1 и 1.125, " +
				"а меню показывает результат cg_fov, умноженного на масштаб. Gun X двигает " +
				"cg_gun_x шагами по 0.2 до 1. Sound Faction циклически меняет Default, United " +
				"Kingdom, United States, Russia, Arab."
		},

		/* ---------- Демо и скриншоты ---------- */
		{
			group: "Демо и скриншоты",
			q: "Как записать и воспроизвести демо?",
			a: "record начинает запись, stoprecord завершает её, demo воспроизводит. Без имени " +
				"игра сама пронумерует файл.",
			cfg: 'bind F9 "record"\nbind F10 "stoprecord"',
			cmd: "/record match1",
			note: "Демо попадают в ту же папку, что и ваш конфиг. Воспроизвести: /demo match1."
		},
		{
			group: "Демо и скриншоты",
			q: "Как сделать скриншот?",
			a: "Две команды: несжатая и гораздо меньший JPEG.",
			cfg: 'bind F12 "screenshotJpeg"',
			cmd: "/screenshotJpeg"
		}
	];

	var list = null, search = null, count = null, empty = null, hint = null;
	var items = [];
	var defaultHint = "", hintTimer = null;

	/* ---------- helpers ---------- */

	function el(tag, className, text)
	{
		var node = document.createElement(tag);
		if (className) { node.className = className; }
		if (text !== undefined) { node.textContent = text; }
		return node;
	}

	function setHint(message, isError)
	{
		if (hint === null) { return; }
		window.clearTimeout(hintTimer);
		hint.textContent = message;
		hint.classList.toggle("is-error", isError === true);
		hintTimer = window.setTimeout(function ()
		{
			hint.textContent = defaultHint;
			hint.classList.remove("is-error");
		}, HINT_RESET_MS);
	}

	function copyText(text)
	{
		if (navigator.clipboard && navigator.clipboard.writeText)
		{
			return navigator.clipboard.writeText(text);
		}

		return new Promise(function (resolve, reject)
		{
			var helper = document.createElement("textarea");
			helper.value = text;
			helper.setAttribute("readonly", "");
			helper.style.position = "fixed";
			helper.style.opacity = "0";
			document.body.appendChild(helper);
			helper.select();

			var ok = false;
			try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
			document.body.removeChild(helper);
			if (ok) { resolve(); } else { reject(new Error("copy rejected")); }
		});
	}

	/* ---------- rendering ---------- */

	// A row is { label, text, desc, bind, copy }. desc is the middle column the
	// menu tables need. bind adds a key field: type a key and the line turns
	// into the bind you can paste into a config. copy: false drops the button
	// for lines not worth copying, such as a path full of placeholders.
	function commandRow(spec)
	{
		var row = el("div", "fq-cmd");
		row.appendChild(el("span", "fq-kind", spec.label));

		if (spec.desc) { row.appendChild(el("span", "fq-desc", spec.desc)); }

		var key = null;
		if (spec.bind)
		{
			key = el("input", "fq-key");
			key.type = "text";
			key.placeholder = "клавиша";
			key.spellcheck = false;
			key.autocomplete = "off";
			key.setAttribute("aria-label", "Клавиша бинда для " + (spec.desc || spec.text));
			row.appendChild(key);
		}

		var code = el("code", "fq-code", spec.text);
		row.appendChild(code);

		var button = null;
		if (spec.copy !== false)
		{
			button = el("button", "btn btn-sm fq-copy", "Копировать");
			button.type = "button";
			button.setAttribute("data-command", spec.text);
			button.setAttribute("aria-label", "Копировать " + spec.text);
			row.appendChild(button);
		}
		else
		{
			// holds the button's place so the code field keeps the same width
			var spacer = el("span", "fq-copy-space");
			spacer.setAttribute("aria-hidden", "true");
			row.appendChild(spacer);
		}

		if (key !== null)
		{
			var refresh = function ()
			{
				// with no key there is nothing to bind to, so show the bare command
				var typed = key.value.trim();
				var line = typed === "" ? spec.text : 'bind ' + typed + ' "' + spec.text + '"';
				code.textContent = line;
				if (button !== null)
				{
					button.setAttribute("data-command", line);
					button.setAttribute("aria-label", "Копировать " + line);
				}
			};

			key.addEventListener("input", refresh);

			// F-keys, the arrows and the numpad type nothing, and the browser
			// has its own plans for some of them, so take them here by name.
			key.addEventListener("keydown", function (event)
			{
				var name = CAPTURED_KEYS[event.code];
				if (name === undefined) { return; }
				event.preventDefault();
				key.value = name;
				refresh();
			});
		}

		return row;
	}

	function makeItem(entry)
	{
		var item = el("div", "fq-item");
		item.appendChild(el("h3", "fq-q", entry.q));
		item.appendChild(el("p", "fq-a", entry.a));

		if (entry.cfg) { item.appendChild(commandRow({ label: "конфиг", text: entry.cfg })); }
		if (entry.cmd) { item.appendChild(commandRow({ label: "консоль", text: entry.cmd })); }

		// a few answers are a procedure rather than a setting
		var stepText = [];
		if (entry.steps)
		{
			var list = el("ol", "fq-steps");
			for (var st = 0; st < entry.steps.length; st++)
			{
				var step = entry.steps[st];
				var li = el("li", null, step.text);
				stepText.push(step.text);

				if (step.link)
				{
					li.appendChild(document.createTextNode(" "));
					var link = el("a", "fq-link", step.linkText || "скачать");
					link.href = step.link;
					link.target = "_blank";
					link.rel = "noopener noreferrer";
					li.appendChild(link);
				}

				if (step.sub)
				{
					var subs = el("ul", "fq-substeps");
					for (var sb = 0; sb < step.sub.length; sb++)
					{
						subs.appendChild(el("li", null, step.sub[sb]));
						stepText.push(step.sub[sb]);
					}
					li.appendChild(subs);
				}

				list.appendChild(li);
			}
			item.appendChild(list);
		}

		// some answers are neither: a list of paths or a menu table, each row
		// carrying its own label and, where it helps, a description
		var extra = [];
		if (entry.rows)
		{
			for (var r = 0; r < entry.rows.length; r++)
			{
				item.appendChild(commandRow(entry.rows[r]));
				extra.push(entry.rows[r].label, entry.rows[r].desc, entry.rows[r].text);
			}
		}

		if (entry.note) { item.appendChild(el("p", "fq-note", entry.note)); }

		 // one lowercased haystack per entry, so filtering stays a substring test
		var haystack = [entry.q, entry.a, entry.cfg, entry.cmd, entry.note]
			.concat(stepText).concat(extra).filter(Boolean).join(" ").toLowerCase();

		return { node: item, text: haystack };
	}

	function render()
	{
		var groups = [];
		for (var i = 0; i < ENTRIES.length; i++)
		{
			if (groups.indexOf(ENTRIES[i].group) === -1) { groups.push(ENTRIES[i].group); }
		}

		for (var g = 0; g < groups.length; g++)
		{
			var section = el("section", "rc-group fq-group");
			section.appendChild(el("h2", "rc-title", groups[g]));

			for (var e = 0; e < ENTRIES.length; e++)
			{
				if (ENTRIES[e].group !== groups[g]) { continue; }
				var made = makeItem(ENTRIES[e]);
				made.section = section;
				items.push(made);
				section.appendChild(made.node);
			}

			list.appendChild(section);
		}
	}

	function filter()
	{
		var term = search.value.trim().toLowerCase();
		var shown = 0;

		for (var i = 0; i < items.length; i++)
		{
			var match = term === "" || items[i].text.indexOf(term) !== -1;
			items[i].node.hidden = !match;
			if (match) { shown++; }
		}

		// a group with nothing left in it should go too
		var sections = list.querySelectorAll(".fq-group");
		for (var s = 0; s < sections.length; s++)
		{
			var visible = sections[s].querySelectorAll(".fq-item:not([hidden])").length;
			sections[s].hidden = visible === 0;
		}

		count.textContent = shown === ENTRIES.length
			? ENTRIES.length + " вопросов"
			: shown + " из " + ENTRIES.length;

		empty.hidden = shown !== 0;
		if (shown === 0) { empty.textContent = "Ничего не найдено по «" + search.value.trim() + "»."; }
	}

	function onCopyClick(event)
	{
		var button = event.target.closest ? event.target.closest(".fq-copy") : null;
		if (button === null) { return; }

		var command = button.getAttribute("data-command");
		copyText(command).then(function ()
		{
			window.clearTimeout(button.resetTimer);
			button.textContent = "Скопировано";
			button.classList.add("is-copied");
			button.resetTimer = window.setTimeout(function ()
			{
				button.textContent = "Копировать";
				button.classList.remove("is-copied");
			}, COPIED_RESET_MS);
		}, function ()
		{
			setHint("Не удалось скопировать — выделите команду и скопируйте вручную.", true);
		});
	}

	function init()
	{
		list = document.getElementById("fq-list");
		search = document.getElementById("fq-search");
		count = document.getElementById("fq-count");
		empty = document.getElementById("fq-empty");
		hint = document.getElementById("fq-hint");

		if (list === null || search === null) { return; }
		if (hint !== null) { defaultHint = hint.textContent; }

		render();
		filter();

		search.addEventListener("input", filter);
		list.addEventListener("click", onCopyClick);
	}

	if (document.readyState === "loading")
	{
		document.addEventListener("DOMContentLoaded", init);
	}
	else
	{
		init();
	}
})();