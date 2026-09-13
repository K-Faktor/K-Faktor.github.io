/*
 * Promod rcon reference.
 *
 * Sources, per entry:
 *   - promod_commands.txt (the file in this folder)
 *   - help.fshost.me/games/cod4/mods/promodlive  (preset modes, extra examples)
 * The preset mode names were cross-checked against promod_x-master/promod/modes.gsc.
 *
 * Map and game mode lists are sorted by display name.
 */
(function ()
{
	"use strict";

	var COPIED_RESET_MS = 1500;
	var HINT_RESET_MS = 3000;

	var GROUPS = [
		{
			title: "Аутентификация и сервер",
			items: [
				{ cmd: "/rcon login [пароль]", desc: "Вход в качестве администратора." },
				{ cmd: "/rcon status", desc: "Показывает подключённых игроков, их ID, GUID и IP." },
				{ cmd: "/rcon say [сообщение]", desc: "Отправляет глобальное текстовое сообщение всем активным игрокам." }
			]
		},
		{
			title: "Режимы Promod",
			note: "Двар promod_mode следует особому синтаксису. Игра принимает части " +
				"между знаками подчёркивания ( _ ) в любом порядке, так что match_mr12_knife " +
				"и knife_mr12_match — одно и то же.",
			tokens: [
				{ name: "match", desc: "Стандартный матчевый режим, нельзя использовать вместе с knockout. Лимит раундов = mr#*2" },
				{ name: "knockout", desc: "Нокаут-режим, нельзя использовать вместе со стандартным match. Лимит счёта = mr#+1" },
				{ name: "mr#", desc: "Maxrounds, например mr10, mr12 или mr15. По умолчанию 10. Работает только в Search & Destroy и Sabotage." },
				{ name: "lan", desc: "LAN-режим — g_antilag 0, сообщения PunkBuster отключены, нельзя использовать вместе с режимом pb." },
				{ name: "pb", desc: "Вариант с PunkBuster, нельзя комбинировать с lan. В исходниках он встречается только в примерах вроде match_mr12_pb и отдельно не определён." },
				{ name: "hc", desc: "Hardcore (отключает часть элементов HUD и снижает здоровье до 30)." },
				{ name: "knife", desc: "Ножевой раунд — добавляет ножевой раунд и дополнительный режим готовности к матчам Search & Destroy." },
				{ name: "1v1 / 2v2", desc: "Используется для матчей 1v1 и 2v2, отключает классы Demolitions и Sniper." },
				{ name: "#:#", desc: "Задаёт счёт матча в S&D в формате A:D — полезно при рестарте, нельзя использовать вместе с режимом knife." },
				{ name: "strat", desc: "Режим стратегии для тренировок." }
			],
			blocks: [
				{
					label: "Примеры",
					items: [
						{ cmd: "/rcon promod_mode match_mr12", desc: "Стандартный матч, 12 maxrounds." },
						{ cmd: "/rcon promod_mode knockout_mr12_knife", desc: "Нокаут, 12 maxrounds, с ножевым раундом." },
						{ cmd: "/rcon promod_mode 1v1_mr10", desc: "Матч 1v1, 10 maxrounds." },
						{ cmd: "/rcon promod_mode 2v2_mr10", desc: "Матч 2v2, 10 maxrounds." },
						{ cmd: "/rcon promod_mode strat", desc: "Режим стратегии для тренировок." }
					]
				}
			]
		},
		{
			title: "Игровые режимы",
			note: "Смена режима: /rcon g_gametype [режим].",
			grid: [
				{ name: "Domination", cmd: "/rcon g_gametype dom" },
				{ name: "Free For All / Deathmatch", cmd: "/rcon g_gametype dm" },
				{ name: "Headquarters", cmd: "/rcon g_gametype koth" },
				{ name: "Sabotage", cmd: "/rcon g_gametype sab" },
				{ name: "Search & Destroy", cmd: "/rcon g_gametype sd" },
				{ name: "Team Deathmatch", cmd: "/rcon g_gametype war" }
			]
		},
		{
			title: "Управление матчем",
			items: [
				{ cmd: "/rcon map_restart", desc: "Перезапускает текущий раунд или карту." },
				{ cmd: "/rcon fast_restart", desc: "Перезапускает текущий раунд или карту." }
			]
		},
		{
			title: "Карты",
			note: "Смена карты: /rcon map [имя_карты] \u2014 переключает текущую карту.",
			grid: [
				{ name: "Ambush", cmd: "/rcon map mp_convoy" },
				{ name: "Backlot", cmd: "/rcon map mp_backlot" },
				{ name: "Bloc", cmd: "/rcon map mp_bloc" },
				{ name: "Bog", cmd: "/rcon map mp_bog" },
				{ name: "Broadcast", cmd: "/rcon map mp_broadcast" },
				{ name: "China Town", cmd: "/rcon map mp_carentan" },
				{ name: "Countdown", cmd: "/rcon map mp_countdown" },
				{ name: "Crash", cmd: "/rcon map mp_crash" },
				{ name: "Creek", cmd: "/rcon map mp_creek" },
				{ name: "Crossfire", cmd: "/rcon map mp_crossfire" },
				{ name: "District", cmd: "/rcon map mp_citystreets" },
				{ name: "Downpour", cmd: "/rcon map mp_farm" },
				{ name: "Killhouse", cmd: "/rcon map mp_killhouse" },
				{ name: "Overgrown", cmd: "/rcon map mp_overgrown" },
				{ name: "Pipeline", cmd: "/rcon map mp_pipeline" },
				{ name: "Shipment", cmd: "/rcon map mp_shipment" },
				{ name: "Showdown", cmd: "/rcon map mp_showdown" },
				{ name: "Strike", cmd: "/rcon map mp_strike" },
				{ name: "Vacant", cmd: "/rcon map mp_vacant" },
				{ name: "Wet Work", cmd: "/rcon map mp_cargoship" },
				{ name: "Winter Crash", cmd: "/rcon map mp_crash_snow" }
			]
		}
	];

	var list = null;
	var hint = null;
	var defaultHint = "";
	var hintTimer = null;

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

	// The button confirms on itself, so feedback stays where the eye already is.
	function makeCopyButton(command)
	{
		var button = document.createElement("button");
		button.type = "button";
		button.className = "btn btn-sm rc-copy";
		button.textContent = "Копировать";
		button.setAttribute("data-command", command);
		button.setAttribute("aria-label", "Копировать " + command);
		return button;
	}

	function onCopyClick(event)
	{
		var button = event.target.closest ? event.target.closest(".rc-copy") : null;
		if (button === null)
		{
			return;
		}

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
			setHint("Не удалось скопировать \u2014 выделите команду и скопируйте вручную.", true);
		});
	}

	/* ---------- rendering ---------- */

	function el(tag, className, text)
	{
		var node = document.createElement(tag);
		if (className)
		{
			node.className = className;
		}
		if (text !== undefined)
		{
			node.textContent = text;
		}
		return node;
	}

	function makeItem(item)
	{
		var row = el("div", "rc-item");
		var text = el("div", "rc-item-text");

		text.appendChild(el("code", "rc-code", item.cmd));
		if (item.desc)
		{
			text.appendChild(el("p", "rc-desc", item.desc));
		}

		row.appendChild(text);
		row.appendChild(makeCopyButton(item.cmd));
		return row;
	}

	function makeItems(items)
	{
		var box = el("div", "rc-items");
		for (var i = 0; i < items.length; i++)
		{
			box.appendChild(makeItem(items[i]));
		}
		return box;
	}

	function makeTokens(tokens)
	{
		var box = el("dl", "rc-tokens");

		for (var i = 0; i < tokens.length; i++)
		{
			box.appendChild(el("dt", null, tokens[i].name));
			box.appendChild(el("dd", null, tokens[i].desc));
		}

		return box;
	}

	// Uniform short entries (maps, game modes) read better as a grid.
	function makeGrid(entries)
	{
		var grid = el("div", "rc-grid");

		for (var i = 0; i < entries.length; i++)
		{
			var cell = el("div", "rc-cell");
			var text = el("div", "rc-item-text");

			text.appendChild(el("span", "rc-cell-name", entries[i].name));
			text.appendChild(el("code", "rc-code", entries[i].cmd));

			cell.appendChild(text);
			cell.appendChild(makeCopyButton(entries[i].cmd));
			grid.appendChild(cell);
		}

		return grid;
	}

	function makeGroup(group)
	{
		var section = el("section", "rc-group");

		section.appendChild(el("h2", "rc-title", group.title));

		if (group.note)
		{
			section.appendChild(el("p", "rc-note", group.note));
		}

		if (group.tokens)
		{
			section.appendChild(makeTokens(group.tokens));
		}

		if (group.items)
		{
			section.appendChild(makeItems(group.items));
		}

		if (group.blocks)
		{
			for (var i = 0; i < group.blocks.length; i++)
			{
				section.appendChild(el("h3", "rc-sub", group.blocks[i].label));
				section.appendChild(makeItems(group.blocks[i].items));
			}
		}

		if (group.grid)
		{
			section.appendChild(makeGrid(group.grid));
		}

		return section;
	}

	function init()
	{
		list = document.getElementById("rc-list");
		hint = document.getElementById("rc-hint");

		if (list === null)
		{
			return;
		}

		if (hint !== null)
		{
			defaultHint = hint.textContent;
		}

		for (var i = 0; i < GROUPS.length; i++)
		{
			list.appendChild(makeGroup(GROUPS[i]));
		}

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