/*
 * CoD4 Config Checker
 * Сканирует вставленный конфиг на запрещённые имена DVAR'ов и запрещённое содержимое биндов/DVAR'ов.
 */
(function ()
{
	"use strict";

	// Точные имена DVAR'ов, которые запрещены. Читерские меню объявляют их как
	// алиасы через set, поэтому достаточно простого имени, чтобы их поймать.
	var DISALLOWED_DVARS = [
		"con_maxfps", "j_lodBiasRigid", "j_lodBiasSkinned", "j_lodScaleRigid", "j_lodScaleSkinned",
		"j_polygonOffsetBias", "aim.autoaim", "aimbot", "chams", "hax_aimbot", "hax_autoshoot",
		"hax_distesp", "hax_killsounds", "hax_killspam", "hax_nameesp", "hax_radar", "hax_stats",
		"hax_wallhack", "Mom_aimbot", "Mom_autoshoot", "Mom_distesp", "Mom_killspam", "Mom_nameesp",
		"Mom_radar", "Mom_stats", "Mom_wallhack", "nameesp", "norecoil", "recoil", "wallhack", "wh",
		"_aimbot", "_autoshoot", "_crosshair", "_crosshairhealth", "_infoenemy", "_killsounds",
		"_killspam", "_nameesp", "_radar", "_simpletrace", "_stats", "_wallhack", "3rdp0", "3rdp1",
		"aaaa", "aaim", "aaim1", "aaoff", "aaon", "aburst", "aburst1", "aburst2", "aburst3",
		"aburst4", "aburst5", "aburst6", "aburst7", "aburst8", "aburst9", "afire", "afov", "afov1",
		"aim", "aimkey", "aimvec", "aim_predict", "aim_speed", "aim_point", "aim_fire", "aim_burst",
		"aim_key", "aim_fov", "akburst", "akburst2", "alias", "anrecoil", "autoaim", "autofire",
		"av2chest", "av2head", "av2neck", "av3chest", "av3head", "av3neck", "avchest", "avex0",
		"avex1", "avexc", "avexh", "avhead", "avneck", "bbbb", "bothelp", "bot_radar", "bot_wallhack",
		"box", "box1", "box2", "box3", "bull", "bull1", "bun", "bun1", "bunny", "c0", "c0f", "c1",
		"c10", "c11", "c12", "c13", "c14", "c15", "c16", "c17", "c18", "c19", "c2", "c20", "c3", "c4",
		"c5", "c6", "c7", "c8", "c9", "cccc", "cheats", "com_cameraMode", "com_dropsim", "con",
		"con1", "cu_aimbot", "cu_norecoil", "cu_wallhack", "cu_nameesp", "cu_distanceesp",
		"cu_autoshoot", "dance0", "dance1", "dance2", "dddd", "dev1", "deva", "devb", "eeee", "esp",
		"esp_all", "esp_names", "esp_off", "esp_weapons", "fb", "fb1", "fb2", "fb3", "ff", "ff+",
		"ffff", "fire", "fog", "fog1", "fov", "fov_135", "fov_15", "fov_180", "fov_25", "fov_35",
		"fov_360", "fov_45", "fov_5", "fov_90", "fov_off", "fov160", "fov80", "fw", "fw1", "gggg",
		"glow", "gre", "gre1", "guid", "gun", "gun1", "help", "hhhh", "ignorewalls", "iiii", "jjjj",
		"key", "key1", "key2", "key3", "m0", "m1", "m10", "m11", "m12", "m13", "m14", "m15", "m16",
		"m17", "m18", "m19", "m2", "m20", "m3", "m4", "m4burst", "m4burst2", "m5", "m6", "m60burst",
		"m60burst2", "m7", "m8", "m9", "melee", "mode", "mom_KillSounds", "names", "nofx", "ogc_aim",
		"ogc_bot", "ogc_fov", "ogc_glow", "ogc_mode", "ogc_names", "ogc_trans", "ogc_wall",
		"ogc_weapons", "pesp", "pINgpredict", "pistolburst", "pistolburst2", "por", "por1", "predict",
		"predict_33", "predict_40", "predict_45", "predict_50", "predict_55", "predict_60",
		"predict_65", "predict_off", "quiet", "radar", "radarconf", "recoil1", "rfog", "rscope",
		"safe", "script1", "sesp0", "sesp1", "shoot", "sky", "sky1", "smok0", "smok1", "spIN",
		"spIN1", "spIN2", "stopspIN", "team", "team0", "team1", "teamcheck", "thirdp", "thirdpcfg",
		"thrd", "thrd1", "thrd2", "thrd3", "thrd4", "thrd5", "tp", "tp1", "tp2", "tp3", "tq", "tq1",
		"tq2", "tq3", "tree", "tree1", "trigger", "vec", "vec_crouch", "vec_prone", "vec_stand",
		"vec1", "w_bot", "w_chams", "w_cross", "w_fog", "w_pbss", "w_recoil", "w_scope", "w_wallhack",
		"w_walls", "wall", "wallsm", "weapons", "wf", "wf1", "wf2", "wf3", "wh1", "wh2", "wh3",
		"winamp", "wwall", "wwall1", "_aimkey", "_aim_key"
	];

	// Подстроки, которые запрещены внутри действия бинда или значения DVAR'а.
	var DISALLOWED_CONTENTS = [
		"aim", "chams", "esp", "health", "info", "key", "kill", "radar", "recoil",
		"trace", "tracker", "vstr", "wall", "wait"
	];

	// Защищённые DVAR'ы: клиентские настройки, которые сервер не имеет права
	// перезаписывать. В конфиге они всегда допустимы, поэтому перед проверкой
	// подстрок они вырезаются из строки. Иначе cg_debugInfoCornerOffset
	// срабатывал бы на правило "info" просто из-за букв в своём имени.
	var PROTECTED_DVARS = [
		"cg_chatHeight", "cg_chatTime", "cg_debugInfoCornerOffset", "cg_drawBreathHint",
		"cg_drawFPS", "cg_drawLagometer", "cg_drawMantleHint", "cg_fov", "cg_fovScale",
		"cg_hudChatPosition", "cg_hudProneY", "cg_hudSayPosition", "cg_teamChatsOnly",
		"cl_mouseAccel", "com_maxfps", "compassFriendlyHeight", "compassFriendlyWidth",
		"compassObjectiveHeight", "compassObjectiveWidth", "compassObjectiveIconHeight",
		"compassObjectiveIconWidth", "compassPlayerHeight", "compassPlayerWidth",
		"r_aspectRatio", "r_displayRefresh", "r_gamma", "r_inGameVideo", "r_mode",
		"r_vsync", "snd_volume", "ui_connectScreenTextGlowColor", "waypointIconHeight",
		"waypointIconWidth"
	];

	// Обычные вызовы меню Promod, которые читаются как запрещённое слово: пункт
	// killspec в меню B4 содержит "kill" в имени. Маскируется так же, как
	// защищённые DVAR'ы, и намеренно узко — "killspec" сам по себе всё ещё
	// проверяется правилами подстрок, только вызов меню освобождён.
	var PROTECTED_PATTERNS = [
		/quickpromod\s+killspec/g
	];

	// Заранее приведённые к нижнему регистру списки, чтобы не делать этого в цикле.
	var DVARS_LOWER = DISALLOWED_DVARS.map(function (v) { return v.toLowerCase(); });
	var CONTENTS_LOWER = DISALLOWED_CONTENTS.map(function (v) { return v.toLowerCase(); });
	var PROTECTED_LOWER = PROTECTED_DVARS.map(function (v) { return v.toLowerCase(); });
	var BLANKS = PROTECTED_LOWER.map(function (v) { return new Array(v.length + 1).join(" "); });

	var BIND_RE = /^bind\s+(\S+)\s+(.+)$/i;
	var SET_RE = /^set[aus]?\s+(\S+)\s+(.+)$/i;

	var MAX_SNIPPET = 300;
	var MAX_FILE_BYTES = 2 * 1024 * 1024;
	var DOWNLOAD_FILE_NAME = "config_mp.cfg";
	var HINT_RESET_MS = 3000;
	var HIGHLIGHT_DEBOUNCE_MS = 120;

	var HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

	var input = null;
	var output = null;
	var gutter = null;
	var gutterBox = null;
	var highlights = null;
	var hint = null;
	var fileInput = null;
	var uploadBtn = null;
	var copyBtn = null;
	var downloadBtn = null;

	var defaultHint = "";
	var hintTimer = null;
	var gutterLines = -1;
	var highlightsOn = false;
	var highlightTimer = null;

	/* ---------- сканирование ---------- */

	function escapeHtml(text)
	{
		return String(text).replace(/[&<>"']/g, function (ch) { return HTML_ESCAPES[ch]; });
	}

	function snippet(line)
	{
		var text = line.length > MAX_SNIPPET ? line.slice(0, MAX_SNIPPET) + " …" : line;
		return escapeHtml(text);
	}

	// Снимает один слой парных кавычек и завершающий строчный комментарий.
	function normalizeToken(token)
	{
		var value = token.replace(/\s*\/\/.*$/, "").trim();
		if (value.length > 1 && ((value.charAt(0) === '"' && value.slice(-1) === '"') ||
			(value.charAt(0) === "'" && value.slice(-1) === "'")))
		{
			value = value.slice(1, -1);
		}
		return value;
	}

	// Затирает все защищённые имена DVAR'ов, сохраняя длину, чтобы ничего не
	// сдвинулось, и правилам подстрок подвергалась только остальная часть строки.
	function maskProtected(lower)
	{
		for (var i = 0; i < PROTECTED_LOWER.length; i++)
		{
			var name = PROTECTED_LOWER[i];
			var at = lower.indexOf(name);
			while (at !== -1)
			{
				lower = lower.slice(0, at) + BLANKS[i] + lower.slice(at + name.length);
				at = lower.indexOf(name, at + name.length);
			}
		}

		for (var p = 0; p < PROTECTED_PATTERNS.length; p++)
		{
			lower = lower.replace(PROTECTED_PATTERNS[p], function (hit)
			{
				return new Array(hit.length + 1).join(" ");
			});
		}

		return lower;
	}

	function findDisallowedContent(value)
	{
		var lower = maskProtected(value.toLowerCase());
		for (var i = 0; i < CONTENTS_LOWER.length; i++)
		{
			if (lower.indexOf(CONTENTS_LOWER[i]) !== -1)
			{
				return DISALLOWED_CONTENTS[i];
			}
		}
		return null;
	}

	function isProtected(lower)
	{
		for (var i = 0; i < PROTECTED_LOWER.length; i++)
		{
			if (lower === PROTECTED_LOWER[i]) { return true; }
		}
		return false;
	}

	function findDisallowedDvar(name)
	{
		var lower = name.toLowerCase();
		if (isProtected(lower)) { return null; }   // защищённый приоритетнее чёрного списка

		for (var i = 0; i < DVARS_LOWER.length; i++)
		{
			if (lower === DVARS_LOWER[i])
			{
				return DISALLOWED_DVARS[i];
			}
		}
		return null;
	}

	function splitLines(text)
	{
		return text.split(/\r\n|\r|\n/);
	}

	function lineActions(lineNumber)
	{
		return '<div class="line-actions">' +
			'<a href="#" class="line-action jump-line" data-line="' + lineNumber +
			'">Перейти к строке</a>' +
			'<a href="#" class="line-action remove-line" data-line="' + lineNumber +
			'">Удалить строку</a>' +
			"</div>";
	}

	// Возвращает находки как данные, чтобы список результатов и слой подсветки
	// всегда управлялись одним и тем же сканированием.
	function scan(lines)
	{
		var findings = [];

		for (var i = 0; i < lines.length; i++)
		{
			var line = lines[i].trim();
			var lineNumber = i + 1;

			// Пропускаем пустые строки и строки-комментарии целиком.
			if (line === "" || line.indexOf("//") === 0)
			{
				continue;
			}

			var match = BIND_RE.exec(line);
			if (match !== null)
			{
				var badAction = findDisallowedContent(normalizeToken(match[2]));
				if (badAction !== null)
				{
					findings.push({
						line: lineNumber,
						severity: "orange",
						label: "Запрещённое содержимое BIND",
						term: badAction,
						text: line
					});
				}
				continue;
			}

			match = SET_RE.exec(line);
			if (match !== null)
			{
				var badName = findDisallowedDvar(normalizeToken(match[1]));
				if (badName !== null)
				{
					findings.push({
						line: lineNumber,
						severity: "red",
						label: "Запрещённое имя DVAR",
						term: badName,
						text: line
					});
				}

				var badValue = findDisallowedContent(normalizeToken(match[2]));
				if (badValue !== null)
				{
					findings.push({
						line: lineNumber,
						severity: "orange",
						label: "Запрещённое содержимое DVAR",
						term: badValue,
						text: line
					});
				}
			}
		}

		return findings;
	}

	function renderFindings(findings)
	{
		var items = [];

		for (var i = 0; i < findings.length; i++)
		{
			var f = findings[i];
			items.push('<li class="' + f.severity + '">Строка ' + f.line + ": " + f.label +
				" <em>" + escapeHtml(f.term) + "</em><pre>" + snippet(f.text) + "</pre>" +
				lineActions(f.line) + "</li>");
		}

		return items.join("");
	}

	/* ---------- нумерация строк ---------- */

	// Textarea не переносит строки (wrap="off"), поэтому одна визуальная строка —
	// это одна строка конфига.
	function renderGutter()
	{
		if (gutter === null || input === null)
		{
			return;
		}

		var count = splitLines(input.value).length;
		if (count !== gutterLines)
		{
			var numbers = new Array(count);
			for (var i = 0; i < count; i++)
			{
				numbers[i] = i + 1;
			}
			gutter.textContent = numbers.join("\n");
			gutterLines = count;

			if (gutterBox !== null)
			{
				// Расширяем желоб, когда количество строк требует ещё одну цифру.
				gutterBox.style.width = "calc(" + String(count).length + "ch + 24px)";
			}
		}

		syncScroll();
	}

	function syncScroll()
	{
		if (input === null)
		{
			return;
		}

		if (gutter !== null)
		{
			gutter.style.transform = "translateY(" + (-input.scrollTop) + "px)";
		}

		if (highlights !== null)
		{
			highlights.style.transform = "translate(" + (-input.scrollLeft) + "px, " +
				(-input.scrollTop) + "px)";
		}
	}

	/* ---------- слой подсветки ---------- */

	// Строка, помеченная и красным, и оранжевым, красится в более серьёзный цвет.
	function severityByLine(findings)
	{
		var map = {};

		for (var i = 0; i < findings.length; i++)
		{
			var f = findings[i];
			if (map[f.line] !== "red")
			{
				map[f.line] = f.severity;
			}
		}

		return map;
	}

	function renderHighlights(lines, findings)
	{
		if (highlights === null)
		{
			return;
		}

		if (!highlightsOn)
		{
			highlights.innerHTML = "";
			return;
		}

		var map = severityByLine(findings);
		var rows = new Array(lines.length);

		for (var i = 0; i < lines.length; i++)
		{
			var severity = map[i + 1];
			// Нулевой пробел держит пустые строки высотой в одну строку.
			var text = lines[i] === "" ? "&#8203;" : escapeHtml(lines[i]);
			rows[i] = severity
				? '<div class="hl-' + severity + '">' + text + "</div>"
				: "<div>" + text + "</div>";
		}

		highlights.innerHTML = rows.join("");
		syncScroll();
	}

	// Поддерживает цвета в актуальном состоянии при редактировании после сканирования.
	function refreshHighlights()
	{
		if (input === null || !highlightsOn)
		{
			return;
		}

		var lines = splitLines(input.value);
		renderHighlights(lines, scan(lines));
	}

	function queueHighlightRefresh()
	{
		window.clearTimeout(highlightTimer);
		highlightTimer = window.setTimeout(refreshHighlights, HIGHLIGHT_DEBOUNCE_MS);
	}

	// При вставке целого конфига каретка оказывается в самом конце, и вид
	// прокручивается вниз файла. Возвращаемся к началу строки 1.
	function scrollToStart()
	{
		if (input === null)
		{
			return;
		}

		if (input.setSelectionRange)
		{
			input.setSelectionRange(0, 0);
		}
		input.scrollTop = 0;
		input.scrollLeft = 0;
		syncScroll();
	}

	/* ---------- строка состояния ---------- */

	function setHint(message, isError)
	{
		if (hint === null)
		{
			return;
		}

		window.clearTimeout(hintTimer);
		hint.textContent = message;
		hint.classList.toggle("is-error", isError === true);

		hintTimer = window.setTimeout(function ()
		{
			hint.textContent = defaultHint;
			hint.classList.remove("is-error");
		}, HINT_RESET_MS);
	}

	function showResultTools(show)
	{
		if (copyBtn !== null)
		{
			copyBtn.hidden = !show;
		}
		if (downloadBtn !== null)
		{
			downloadBtn.hidden = !show;
		}
	}

	/* ---------- действия ---------- */

	function checkCfg()
	{
		if (input === null || output === null)
		{
			return;
		}

		renderGutter();

		if (input.value.trim() === "")
		{
			output.innerHTML = "";
			output.hidden = true;
			showResultTools(false);
			highlightsOn = false;
			renderHighlights([], []);
			return;
		}

		var lines = splitLines(input.value);
		var findings = scan(lines);

		output.innerHTML = findings.length > 0
			? renderFindings(findings)
			: '<li class="green">Ваш конфиг чист. Поздравляем!</li>';
		output.hidden = false;
		showResultTools(true);

		// Подсветка включается при первом сканировании и затем следит за правками.
		highlightsOn = true;
		renderHighlights(lines, findings);
	}

	// Смещения символов одной строки внутри значения textarea.
	function lineRange(lineNumber)
	{
		var value = input.value;
		var start = 0;
		var newline;

		for (var i = 1; i < lineNumber; i++)
		{
			newline = value.indexOf("\n", start);
			if (newline === -1)
			{
				return null;
			}
			start = newline + 1;
		}

		newline = value.indexOf("\n", start);
		return { start: start, end: newline === -1 ? value.length : newline };
	}

	function jumpToLine(lineNumber)
	{
		if (input === null || lineNumber < 1)
		{
			return;
		}

		var range = lineRange(lineNumber);
		if (range === null)
		{
			return;
		}

		// Фокус возвращает редактор в поле зрения, если он был прокручен.
		input.focus();
		if (input.setSelectionRange)
		{
			input.setSelectionRange(range.start, range.end);
		}

		var style = window.getComputedStyle(input);
		var lineHeight = parseFloat(style.lineHeight) || 0;
		var paddingTop = parseFloat(style.paddingTop) || 0;
		var centred = paddingTop + (lineNumber - 1) * lineHeight -
			(input.clientHeight - lineHeight) / 2;

		input.scrollTop = centred > 0 ? centred : 0;
		input.scrollLeft = 0;
		syncScroll();
	}

	function removeLine(lineNumber)
	{
		if (input === null)
		{
			return;
		}

		var index = lineNumber - 1;
		// Перечитываем textarea вместо доверия кэшу, чтобы не потерять ручные правки.
		var lines = splitLines(input.value);
		if (index < 0 || index >= lines.length)
		{
			return;
		}

		lines.splice(index, 1);
		input.value = lines.join("\n");
		checkCfg();
	}

	function loadFile(file)
	{
		if (!file)
		{
			return;
		}

		if (!/\.cfg$/i.test(file.name))
		{
			setHint("Можно загружать только файлы .cfg.", true);
			return;
		}

		if (file.size > MAX_FILE_BYTES)
		{
			setHint("Этот файл слишком большой для конфига (максимум 2 МБ).", true);
			return;
		}

		var reader = new FileReader();

		reader.onload = function ()
		{
			input.value = String(reader.result);
			checkCfg();
			scrollToStart();
			setHint("Загружен " + file.name + ".");
		};

		reader.onerror = function ()
		{
			setHint("Не удалось прочитать этот файл.", true);
		};

		reader.readAsText(file);
	}

	function copyText(text)
	{
		if (navigator.clipboard && navigator.clipboard.writeText)
		{
			return navigator.clipboard.writeText(text);
		}

		// Запасной вариант для браузеров, ограничивающих асинхронный clipboard API.
		return new Promise(function (resolve, reject)
		{
			var helper = document.createElement("textarea");
			helper.value = text;
			helper.setAttribute("readonly", "");
			helper.style.position = "fixed";
			helper.style.top = "-1000px";
			document.body.appendChild(helper);
			helper.select();

			var copied = false;
			try
			{
				copied = document.execCommand("copy");
			}
			catch (err)
			{
				copied = false;
			}

			document.body.removeChild(helper);

			if (copied)
			{
				resolve();
			}
			else
			{
				reject(new Error("copy command rejected"));
			}
		});
	}

	function copyConfig()
	{
		copyText(input.value).then(function ()
		{
			setHint("Конфиг скопирован в буфер обмена.");
		}, function ()
		{
			setHint("Не удалось скопировать — выделите текст и скопируйте вручную.", true);
		});
	}

	function downloadConfig()
	{
		var blob = new Blob([input.value], { type: "text/plain;charset=utf-8" });
		var url = URL.createObjectURL(blob);
		var link = document.createElement("a");

		link.href = url;
		link.download = DOWNLOAD_FILE_NAME;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Даём браузеру момент на старт загрузки, прежде чем освободить blob.
		window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
		setHint("Скачано: " + DOWNLOAD_FILE_NAME + ".");
	}

	/* ---------- инициализация ---------- */

	function init()
	{
		input = document.getElementById("cfg");
		output = document.getElementById("violations");
		gutter = document.getElementById("gutter");
		gutterBox = document.querySelector(".gutter-box");
		highlights = document.getElementById("highlights");
		hint = document.getElementById("hint");
		fileInput = document.getElementById("file");
		uploadBtn = document.getElementById("upload");
		copyBtn = document.getElementById("copy");
		downloadBtn = document.getElementById("download");

		if (input === null || output === null)
		{
			return;
		}

		if (hint !== null)
		{
			defaultHint = hint.textContent;
		}

		renderGutter();
		input.addEventListener("input", function ()
		{
			renderGutter();
			queueHighlightRefresh();
		});
		input.addEventListener("scroll", syncScroll);

		input.addEventListener("paste", function ()
		{
			// Вставленный текст появляется только после этого события, поэтому
			// откатываемся на следующий тик.
			window.setTimeout(scrollToStart, 0);
		});

		var form = document.querySelector("form");
		if (form !== null)
		{
			form.addEventListener("submit", function (event)
			{
				event.preventDefault();
				checkCfg();
			});
		}

		// Делегированный обработчик: без inline onclick, поэтому номер строки
		// не может быть внедрён.
		output.addEventListener("click", function (event)
		{
			var link = event.target.closest ? event.target.closest("a.line-action") : null;
			if (link === null)
			{
				return;
			}

			event.preventDefault();
			var lineNumber = parseInt(link.getAttribute("data-line"), 10);

			if (link.className.indexOf("jump-line") !== -1)
			{
				jumpToLine(lineNumber);
			}
			else
			{
				removeLine(lineNumber);
			}
		});

		if (uploadBtn !== null && fileInput !== null)
		{
			uploadBtn.addEventListener("click", function ()
			{
				fileInput.click();
			});

			fileInput.addEventListener("change", function ()
			{
				loadFile(fileInput.files[0]);
				// Сбрасываем, чтобы выбор того же файла снова вызвал change.
				fileInput.value = "";
			});
		}

		if (copyBtn !== null)
		{
			copyBtn.addEventListener("click", copyConfig);
		}

		if (downloadBtn !== null)
		{
			downloadBtn.addEventListener("click", downloadConfig);
		}
	}

	if (document.readyState === "loading")
	{
		document.addEventListener("DOMContentLoaded", init);
	}
	else
	{
		init();
	}

	// Оставлено на window для inline-обработчиков в старых копиях index.html.
	window.checkCfg = checkCfg;
	window.removeLine = removeLine;
})();