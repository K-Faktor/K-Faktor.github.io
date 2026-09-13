/*
 * Тост-уведомления.
 *
 * Слушает изменения текста в элементах .hint (id="hint", "rc-hint",
 * "kf-hint", "sb-hint", "fq-hint") и показывает всплывающий тост в правом
 * нижнем углу. Существующие модули не нужно править: они по-прежнему пишут
 * в hint.textContent, а мы это перехватываем.
 */
(function ()
{
	"use strict";

	var container = null;
	var DURATION = 3200;    // мс, сколько тост виден
	var MAX_TOASTS = 4;     // больше — старые уходят раньше

	function ensureContainer()
	{
		if (container !== null)
		{
			return container;
		}

		container = document.getElementById("toasts");
		if (container === null)
		{
			// На случай, если index.html не обновлён — создаём контейнер сами.
			container = document.createElement("div");
			container.className = "toasts";
			container.id = "toasts";
			container.setAttribute("aria-live", "polite");
			container.setAttribute("aria-atomic", "false");
			document.body.appendChild(container);
		}
		return container;
	}

	function trim()
	{
		var list = ensureContainer().children;
		while (list.length > MAX_TOASTS)
		{
			list[0].classList.add("is-leaving");
			(function (node)
			{
				window.setTimeout(function ()
				{
					if (node.parentNode) { node.parentNode.removeChild(node); }
				}, 220);
			}(list[0]));
			// Единая точка выхода — избегаем бесконечного цикла.
			return;
		}
	}

	function makeToast(message, kind)
	{
		var node = document.createElement("div");
		node.className = "toast";
		if (kind === "error")
		{
			node.classList.add("is-error");
		}
		else if (kind === "success")
		{
			node.classList.add("is-success");
		}

		var icon = document.createElement("span");
		icon.className = "toast-icon";
		icon.setAttribute("aria-hidden", "true");

		var text = document.createElement("span");
		text.className = "toast-text";
		text.textContent = message;

		var close = document.createElement("button");
		close.type = "button";
		close.className = "toast-close";
		close.setAttribute("aria-label", "Закрыть");
		close.textContent = "×";

		node.appendChild(icon);
		node.appendChild(text);
		node.appendChild(close);

		close.addEventListener("click", function () { dismiss(node); });

		return node;
	}

	function dismiss(node)
	{
		if (!node.parentNode) { return; }
		node.classList.add("is-leaving");
		window.setTimeout(function ()
		{
			if (node.parentNode) { node.parentNode.removeChild(node); }
		}, 220);
	}

	function show(message, kind)
	{
		if (message === null || message === undefined)
		{
			return;
		}
		message = String(message).trim();
		if (message === "")
		{
			return;
		}

		var box = ensureContainer();

		// Не плодим дубликаты подряд.
		var last = box.lastElementChild;
		if (last !== null && last.querySelector(".toast-text") !== null &&
			last.querySelector(".toast-text").textContent === message)
		{
			return;
		}

		var node = makeToast(message, kind);
		box.appendChild(node);

		// Принудительный reflow, чтобы анимация появления сработала.
		void node.offsetWidth;
		node.classList.add("is-visible");

		window.setTimeout(function () { dismiss(node); }, DURATION);
		trim();
	}

	/* ---------- перехват изменений .hint ---------- */

	function watchHint(el)
	{
		if (el === null) { return; }

		var lastText = el.textContent;

		var observer = new MutationObserver(function ()
		{
			var next = el.textContent;
			if (next === lastText)
			{
				return;
			}
			lastText = next;

			// Стирание текста (возврат к defaultHint) — не показываем.
			if (next === null || next.trim() === "")
			{
				return;
			}

			var kind = el.classList.contains("is-error") ? "error" : "info";
			show(next, kind);
		});

		observer.observe(el, { childList: true, characterData: true, subtree: true });
	}

	function init()
	{
		ensureContainer();

		// Основные .hint-элементы во всех панелях.
		var ids = ["hint", "rc-hint", "kf-hint", "sb-hint", "fq-hint"];
		for (var i = 0; i < ids.length; i++)
		{
			watchHint(document.getElementById(ids[i]));
		}

		// Ручной API на случай, если где-то захочется показать тост напрямую.
		window.Toast = {
			show: show,
			success: function (msg) { show(msg, "success"); },
			error: function (msg) { show(msg, "error"); }
		};
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