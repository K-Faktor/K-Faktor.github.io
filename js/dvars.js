/*
 * Справочник дваров CoD4.
 *
 * 1196 записей, отсортированы по имени без учёта регистра. Одна строка на двар:
 *
 *   имя|описание|тип|по умолчанию|мин|макс|значения enum
 *
 * Описания взяты из CSV-экспорта. Тип, значение по умолчанию, диапазон и имена
 * значений enum были извлечены из исходников KisakCOD путём разбора вызовов
 * Dvar_Register*, структур домена, в которых некоторые из них хранят свои
 * границы, границ, которые некоторые упаковывают в один 64-битный литерал,
 * и массивов const char *, на которые указывают enum. Если имя определено
 * дважды, побеждает многопользовательская версия, потому что это
 * многопользовательский инструмент: cg_fov, например, равен 1–160 в
 * одиночной игре, но 65–120 в многопользовательской. Из 1196 найдено 1163.
 *
 * FLT_MAX и INT_MAX показаны как отсутствие ограничения, а не как число;
 * bool хранит только значение по умолчанию, потому что true или false уже
 * описывают домен; enum с известным списком ограничен этим списком.
 *
 * "|" и "," не нуждаются в экранировании: ни один из них не встречается
 * ни в одном поле, как и обратная кавычка или "${".
 */
(function ()
{
	"use strict";

	var HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

	var entries = [];
	var rows = [];
	var listBox = null;
	var searchBox = null;
	var countBox = null;
	var emptyBox = null;

	var DVAR_TABLE = `
actionSlotsHide|Скрыть слоты действий.|bool|false|||
activeAction|Действие, выполняемое в первом кадре|string|""|||
aim_accel_turnrate_debug|Включить отладочную информацию для ускорения|bool|false|||
aim_accel_turnrate_enabled|Включить/выключить ускорение скорости поворота|bool|true|||
aim_accel_turnrate_lerp|Ускорение скорости поворота|float|1200|0|4000|
aim_autoaim_debug|Включить отладку автоприцеливания|bool|false|||
aim_autoaim_enabled|Включить автоприцеливание|bool|false|||
aim_autoaim_lerp|Скорость в градусах в секунду, с которой автоприцеливание сходится к цели|float|40|0|100|
aim_autoaim_region_height|Высота области автоприцеливания в виртуальных экранных координатах (0–480)|float|120|0|480|
aim_autoaim_region_width|Ширина области автоприцеливания в виртуальных экранных координатах (0–640)|float|160|0|640|
aim_automelee_debug|Включить отладку автоудара|bool|false|||
aim_automelee_enabled|Включить автоудар|bool|true|||
aim_automelee_lerp|Скорость в градусах в секунду, с которой автоудар сходится к цели|float|40|0|100|
aim_automelee_range|Дальность автоудара|float|128|0|255|
aim_automelee_region_height|Высота области автоудара в виртуальных экранных координатах (0–480)|float|240|0|480|
aim_automelee_region_width|Ширина области автоудара в виртуальных экранных координатах (0–640)|float|320|0|640|
aim_input_graph_debug|Отладка графов ввода обзора|bool|false|||
aim_input_graph_enabled|Использовать граф для настройки ввода обзора|bool|true|||
aim_input_graph_index|Какой граф ввода использовать|int|3|0|3|
aim_lockon_debug|Включить отладочную информацию для захвата цели|bool|false|||
aim_lockon_deflection|Величина отклонения стика для активации захвата|float|0.05|0|1|
aim_lockon_enabled|Захват цели помогает игроку оставаться на цели|bool|true|||
aim_lockon_region_height|Высота области автоприцеливания в виртуальных экранных координатах (0–480)|float|90|0|480|
aim_lockon_region_width|Ширина области автоприцеливания в виртуальных экранных координатах (0–640)|float|90|0|640|
aim_lockon_strength|Величина помощи в прицеливании, даваемая захватом цели|float|0.6|0|1|
aim_scale_view_axis|Масштабировать влияние каждой оси ввода так, чтобы главная ось сильнее влияла на управление|bool|true|||
aim_slowdown_debug|Включить отладочную информацию для замедления прицеливания|bool|false|||
aim_slowdown_enabled|Замедлять скорость поворота, когда прицел проходит над целью|bool|true|||
aim_slowdown_pitch_scale|Коэффициент замедления вертикальной помощи при прицеливании от бедра|float|0.4|0|1|
aim_slowdown_pitch_scale_ads|Коэффициент замедления вертикальной помощи при прицеливании через прицел|float|0.5|0|1|
aim_slowdown_region_height|Высота области замедления помощи при прицеливании|float|90|0|480|
aim_slowdown_region_width|Ширина области замедления помощи при прицеливании|float|90|0|640|
aim_slowdown_yaw_scale|Коэффициент замедления горизонтальной помощи при прицеливании от бедра|float|0.4|0|1|
aim_slowdown_yaw_scale_ads|Коэффициент замедления горизонтальной помощи при прицеливании через прицел|float|0.5|0|1|
aim_target_sentient_radius|Радиус, используемый для расчёта границ цели для существа (актёра или игрока)|float|10|0|128|
aim_turnrate_pitch|Вертикальная скорость поворота для помощи при прицеливании от бедра|float|90|0|1080|
aim_turnrate_pitch_ads|Скорость поворота вверх-вниз для помощи при прицеливании через прицел|float|55|0|1080|
aim_turnrate_yaw|Горизонтальная скорость поворота для помощи при прицеливании от бедра|float|260|0|1080|
aim_turnrate_yaw_ads|Горизонтальная скорость поворота для помощи при прицеливании через прицел|float|90|0|1080|
ammoCounterHide|Скрыть счётчик боеприпасов|bool|false|||
authPort|Порт сервера аутентификации|int|20800|0|65535|
authServerName|Имя сервера аутентификации для отображения публичных интернет-игр|string|cod4master.activision.com|||
bg_aimSpreadMoveSpeedThreshold|Когда игрок движется быстрее этой скорости, разброс при прицеливании увеличивается|float|11|0|300|
bg_bobAmplitudeDucked|Множитель к скорости игрока для получения амплитуды покачивания в приседе|vec2|0.0075 0.0075|0|1|
bg_bobAmplitudeProne|Множитель к скорости игрока для получения амплитуды покачивания в положении лёжа|vec2|0.02 0.005|0|1|
bg_bobAmplitudeSprinting|Множитель к скорости игрока для получения амплитуды покачивания при спринте|vec2|0.02 0.014|0|1|
bg_bobAmplitudeStanding|Множитель к скорости игрока для получения амплитуды покачивания стоя|vec2|0.007 0.007|0|1|
bg_bobMax|Максимально допустимая амплитуда покачивания|float|8|0|36|
bg_fallDamageMaxHeight|Высота, с которой игрок получит максимальный урон при падении|float|300|1||
bg_fallDamageMinHeight|Высота, с которой игрок начнёт получать минимальный урон при падении|float|128|1||
bg_foliagesnd_fastinterval|Время между звуками листвы при быстром движении|int|500|0||
bg_foliagesnd_maxspeed|Скорость, при которой игрок производит максимальный шум, двигаясь через листву|float|180|0||
bg_foliagesnd_minspeed|Скорость, при которой игрок производит минимальный шум, двигаясь через листву|float|40|0||
bg_foliagesnd_resetinterval|Интервал времени до сброса звуков листвы после остановки игрока|int|500|0||
bg_foliagesnd_slowinterval|Время между звуками листвы при медленном движении|int|1500|0||
bg_ladder_yawcap|Максимальный угол, на который игрок может осмотреться на лестнице|float|100|0|360|
bg_legYawTolerance|Насколько поворот ног игрока может отличаться от поворота корпуса до подстройки|float|20|0|180|
bg_maxGrenadeIndicatorSpeed|Максимальная скорость гранаты, которая отобразится в индикаторе и может быть отброшена обратно.|float|20|0|1000|
bg_prone_yawcap|Максимальный угол, на который игрок может быстро осмотреться лёжа|float|85|0|360|
bg_shock_lookControl|Изменять управление игроком во время контузии|bool|true|||
bg_shock_lookControl_fadeTime|Время затухания управления игроком при контузии в секундах|float|2|0.001|1000|
bg_shock_lookControl_maxpitchspeed|Максимальная скорость движения по тангажу при контузии в градусах в секунду|float|90|0||
bg_shock_lookControl_maxyawspeed|Максимальная скорость движения по рысканию при контузии в градусах в секунду|float|90|0||
bg_shock_lookControl_mousesensitivityscale|Масштаб чувствительности, применяемый к контуженному игроку|float|0.5|0|2|
bg_shock_movement|Влиять на скорость движения игрока во время контузии|bool|true|||
bg_shock_screenBlurBlendFadeTime|Время в секундах затухания эффекта контузии|float|1|0.001|1000|
bg_shock_screenBlurBlendTime|Время в секундах смешивания эффекта контузии|float|0.4|0.001|10|
bg_shock_screenFlashShotFadeTime|В секундах, как скоро от конца эффекта начать смешивание слоя screengrab.|float|1|0|1000|
bg_shock_screenFlashWhiteFadeTime|В секундах, как скоро от конца эффекта начать смешивание слоя whiteout.|float|1|0|1000|
bg_shock_screenType|Тип экранного эффекта контузии|enum|0|0|2|blurred,flashed,none
bg_shock_sound|Проигрывать звук контузии|bool|true|||
bg_shock_soundDryLevel|Уровень сухого звука контузии|float|1|0|1|
bg_shock_soundEnd|Алиас звука окончания контузии|string|shellshock_end|||
bg_shock_soundEndAbort|Алиас звука прерванного окончания контузии|string|shellshock_end_abort|||
bg_shock_soundFadeInTime|Время нарастания звука контузии в секундах|float|0.25|0.001|1000|
bg_shock_soundFadeOutTime|Время затухания звука контузии в секундах|float|2.5|0.001|1000|
bg_shock_soundLoop|Алиас цикла контузии|string|shellshock_loop|||
bg_shock_soundLoopEndDelay|Смещение конца звукового цикла от конца контузии в секундах|float|-3|-10|1000|
bg_shock_soundLoopFadeTime|Время затухания цикла звука контузии в секундах|float|1.5|0.001|1000|
bg_shock_soundLoopSilent|Звук, который смешивается с алиасом цикла контузии|string|shellshock_loop_silent|||
bg_shock_soundModEndDelay|Задержка от конца контузии до конца модификации звука|float|2|-1000|1000|
bg_shock_soundRoomType|Тип помещения для звука контузии|enum|0|0|24|generic,paddedcell,room,bathroom,livingroom,stoneroom,auditorium,concerthall,cave,arena,hangar,carpetedhallway,stonecorridor,alley,forest,city,mountains,quarry,plain,parkinglot,sewerpipe,underwater,drugged,dizzy,psychotic
bg_shock_soundWetLevel|Уровень влажного звука контузии|float|0.5|0|1|
bg_shock_viewKickFadeTime|Время затухания эффекта толчка обзора при контузии|float|3|0.001|1000|
bg_shock_viewKickPeriod|Период эффекта толчка обзора при контузии|float|0.75|0.001|1000|
bg_shock_viewKickRadius|Радиус толчка при контузии|float|0.05|0|1|
bg_shock_volume_%s||||||
bg_swingSpeed|Скорость, с которой ноги игрока качаются при стрейфе (только мультиплеер)|float|0.2|0|1|
bg_viewKickMax|Максимальный толчок обзора|float|90|0|90|
bg_viewKickMin|Минимальный толчок обзора|float|5|0|90|
bg_viewKickRandom|Случайное направление толчка обзора|float|0.4|0|1|
bg_viewKickScale|Масштаб, применяемый к нанесённому урону для расчёта толчка обзора|float|0.2|0|10|
bullet_penetrationEnabled|Включить/выключить пробитие пуль.|bool|true|||
bullet_penetrationMinFxDist|Минимальное расстояние, которое должна пройти пробившая пуля до срабатывания эффектов|float|30|0|1024|
cg_airstrikeKillCamCloseXYDist|Ближайшее расстояние камеры убийства авиаудара перед бомбой.|float|24|0||
cg_airstrikeKillCamCloseZDist|Ближайшее расстояние камеры убийства авиаудара над целью.|float|24|0||
cg_airstrikeKillCamDist|Расстояние камеры убийства авиаудара.|float|200|0||
cg_airstrikeKillCamFarBlur|Задаёт радиус гауссова размытия, используемого глубиной резкости, в пикселях при 640x480|float|2|0|10|
cg_airstrikeKillCamFarBlurDist|Расстояние камеры убийства авиаудара над самолётом.|float|300|0||
cg_airstrikeKillCamFarBlurStart|Расстояние камеры убийства авиаудара над самолётом.|float|100|0||
cg_airstrikeKillCamFov|Угол обзора камеры убийства авиаудара.|float|80|0.1|160|
cg_airstrikeKillCamNearBlur|Задаёт радиус гауссова размытия, используемого глубиной резкости, в пикселях при 640x480|float|4|4|10|
cg_airstrikeKillCamNearBlurEnd|Расстояние камеры убийства авиаудара над самолётом.|float|100|0|10000|
cg_airstrikeKillCamNearBlurStart|Расстояние камеры убийства авиаудара над самолётом.|float|0|0||
cg_blood|Показывать кровь|bool|true|||
cg_brass|Оружие выбрасывает гильзы|bool|true|||
cg_centertime|Время затухания сообщения, выводимого по центру|float|5|0||
cg_chatHeight|Высота шрифта сообщения чата|int|8|0|8|
cg_chatTime|Время, в течение которого видно сообщение чата|int|12000|0|60000|
cg_connectionIconSize|Размер значка соединения|float|0|0|100|
cg_constantSizeHeadIcons|Значки над головой одинакового размера независимо от расстояния до игрока|bool|false|||
cg_crosshairAlpha|Значение альфы прицела|float|1|0|1|
cg_crosshairAlphaMin|Минимальное значение альфы прицела при его появлении|float|0.5|0|1|
cg_crosshairDynamic|Динамический прицел|bool|false|||
cg_crosshairEnemyColor|Цвет прицела при наведении на врага|bool|true|||
cg_cursorHints|Рисовать подсказки курсора, где: 0 — без подсказок; 1 — пульсация размера по синусу; 2 — односторонняя пульсация размера; 3 — пульсация альфы; 4 — статичное изображение|int|4|0|4|
cg_debug_overlay_viewport|Убрать снайперский оверлей, чтобы проверить правильность окна отсечения.|bool|false|||
cg_debugevents|Выводить отладочную информацию о событиях|bool|false|||
cg_debugInfoCornerOffset|Смещение от правого верхнего угла для cg_drawFPS и т.п.|vec2|5 -5|-200|640|
cg_debugposition|Выводить отладочную информацию о позиции|bool|false|||
cg_descriptiveText|Рисовать описательные сообщения наблюдателя|bool|true|||
cg_draw2D|Рисовать 2D-элементы экрана|bool|true|||
cg_drawBreathHint|Рисовать подсказку «задержите дыхание для стабилизации»|bool|true|||
cg_drawCrosshair|Включить прицел оружия|bool|true|||
cg_drawCrosshairNames|Рисовать имя врага под прицелом|bool|true|||
cg_drawCrosshairNamesPosX|Позиция имени под прицелом в виртуальных экранных координатах|int|300|0|640|
cg_drawCrosshairNamesPosY|Позиция имени под прицелом в виртуальных экранных координатах|int|180|0|480|
cg_drawFPS|Рисовать кадры в секунду|enum|1|0|3|Off,Simple,SimpleRanges,Verbose
cg_drawFPSLabels|Рисовать подписи информации FPS|bool|true|||
cg_drawFriendlyNames|Показывать имена союзников в игре|bool|true|||
cg_drawGun|Рисовать модель оружия от первого лица|bool|true|||
cg_drawHealth|Рисовать полосу здоровья|bool|false|||
cg_drawLagometer|Включить «лагометр»|bool|false|||
cg_drawMantleHint|Рисовать подсказку «нажмите клавишу для подъёма»|bool|true|||
cg_drawMaterial|Рисовать отладочную информацию для материалов|enum|0|0|3|Off,CONTENTS_SOLID,MASK_SHOT,MASK_PLAYERSOLID
cg_drawpaused|Рисовать экран паузы|bool|true|||
cg_drawScriptUsage|Рисовать отладочную информацию для скриптов|bool|false|||
cg_drawShellshock|Рисовать экранные эффекты контузии и световой гранаты.|bool|true|||
cg_drawSnapshot|Рисовать отладочную информацию для снимков|bool|false|||
cg_drawSpectatorMessages|Включает отрисовку HUD-сообщений наблюдателя.|bool|true|||
cg_drawTalk|Управляет тем, какие значки рисует ownerdraw CG_TALKER|enum|1|0|3|NONE,ALL,FRIENDLY,ENEMY
cg_drawThroughWalls|Рисовать имена союзников сквозь стены или нет|bool|false|||
cg_drawTurretCrosshair|Рисовать прицел при использовании турели|bool|true|||
cg_dumpAnims|Выводить информацию об анимациях для указанного id сущности|int|-1|-1|1023|
cg_enemyNameFadeIn|Время в миллисекундах для появления имён врагов|int|250|0||
cg_enemyNameFadeOut|Время в миллисекундах для затухания имён врагов|int|250|0||
cg_errordecay|Затухание предсказанной ошибки|float|100|0||
cg_firstPersonTracerChance|Вероятность того, что ваша пуля будет трассером|float|0.5|0|1|
cg_footsteps|Проигрывать звуки шагов|bool|true|||
cg_fov|Угол обзора в градусах|float|65|65|120|
cg_fovMin|Минимально возможный угол обзора|float|10|1|160|
cg_fovScale|Масштаб, применяемый к углу обзора|float|1|0.2|2|
cg_friendlyNameFadeIn|Время в миллисекундах для появления имён союзников|int|0|0||
cg_friendlyNameFadeOut|Время в миллисекундах для затухания имён союзников|int|1500|0||
cg_gameBoldMessageWidth|Максимальная ширина в символах жирных игровых сообщений|int|390|130|1664|
cg_gameMessageWidth|Максимальная ширина в символах игровых сообщений|int|455|130|1664|
cg_gun_move_f|Движение оружия вперёд из-за движения игрока|float|0|||
cg_gun_move_minspeed|Минимальная скорость движения оружия|float|0|||
cg_gun_move_r|Движение оружия вправо из-за движения игрока|float|0|||
cg_gun_move_rate|Базовая скорость движения оружия|float|0|||
cg_gun_move_u|Движение оружия вверх из-за движения игрока|float|0|||
cg_gun_ofs_f|Смещение оружия вперёд в положении лёжа/приседе|float|0|||
cg_gun_ofs_r|Смещение оружия вправо в положении лёжа/приседе|float|0|||
cg_gun_ofs_u|Смещение оружия вверх в положении лёжа/приседе|float|0|||
cg_gun_x|Позиция x модели оружия от первого лица|float|0|||
cg_gun_y|Позиция y модели оружия от первого лица|float|0|||
cg_gun_z|Позиция z модели оружия от первого лица|float|0|||
cg_headIconMinScreenRadius|Минимальный радиус значка над головой на экране|float|0.02|0|1|
cg_heliKillCamDist|Расстояние камеры убийства вертолёта от вертолёта.|float|1000|0||
cg_heliKillCamFarBlur|Задаёт радиус гауссова размытия, используемого глубиной резкости, в пикселях при 640x480|float|2|0|10|
cg_heliKillCamFarBlurDist|Расстояние камеры убийства вертолёта над вертолётом.|float|300|0||
cg_heliKillCamFarBlurStart|Расстояние камеры убийства вертолёта над вертолётом.|float|100|0||
cg_heliKillCamFov|Угол обзора камеры убийства вертолёта.|float|15|0.1|160|
cg_heliKillCamNearBlur|Задаёт радиус гауссова размытия, используемого глубиной резкости, в пикселях при 640x480|float|4|4|10|
cg_heliKillCamNearBlurEnd|Расстояние камеры убийства вертолёта над вертолётом.|float|100|0|10000|
cg_heliKillCamNearBlurStart|Расстояние камеры убийства вертолёта над вертолётом.|float|0|0||
cg_heliKillCamZDist|Расстояние камеры убийства вертолёта над вертолётом.|float|50|0||
cg_hintFadeTime|Время в миллисекундах для затухания подсказки курсора|int|100|0||
cg_hudChatIntermissionPosition|Позиция окна чата HUD во время перерыва|vec2|5 110|0|640|
cg_hudChatPosition|Позиция окна чата HUD|vec2|5 204|0|640|
cg_hudDamageIconHeight|Высота значка урона|float|64|0|512|
cg_hudDamageIconInScope|Рисовать значки урона при прицеливании через оптику|bool|false|||
cg_hudDamageIconOffset|Смещение от центра значка урона|float|128|0|512|
cg_hudDamageIconTime|Время, в течение которого значок урона остаётся на экране после получения урона|int|2000|0||
cg_hudDamageIconWidth|Ширина значка урона|float|128|0|512|
cg_hudGrenadeIconEnabledFlash|Показывать индикатор гранаты для световых гранат|bool|false|||
cg_hudGrenadeIconHeight|Высота значка индикатора гранаты|float|25|0|512|
cg_hudGrenadeIconInScope|Показывать индикатор гранаты при прицеливании через оптику|bool|false|||
cg_hudGrenadeIconMaxHeight|Минимальная разница высот между игроком и гранатой для отображения гранаты в индикаторе|float|104|0|1000|
cg_hudGrenadeIconMaxRangeFlash|Минимальное расстояние от световой гранаты до игрока для её отображения в индикаторе|float|500|0|2000|
cg_hudGrenadeIconMaxRangeFrag|Минимальное расстояние от гранаты до игрока для её отображения в индикаторе|float|250|0|1000|
cg_hudGrenadeIconOffset|Смещение от центра экрана для значка гранаты|float|50|0|512|
cg_hudGrenadeIconWidth|Ширина значка индикатора гранаты|float|25|0|512|
cg_hudGrenadePointerHeight|Высота указателя индикатора гранаты|float|12|0|512|
cg_hudGrenadePointerPivot|Точка привязки указателя индикатора гранаты|vec2|12 27|0|512|
cg_hudGrenadePointerPulseFreq|Число миганий индикатора гранаты в секунду, в герцах|float|1.7|0.1|50|
cg_hudGrenadePointerPulseMax|Максимальная альфа пульсации индикатора гранаты. Значения выше 1 заставят индикатор дольше оставаться на полной яркости|float|1.85|0|3|
cg_hudGrenadePointerPulseMin|Минимальная альфа пульсации индикатора гранаты. Значения ниже 0 заставят индикатор дольше оставаться полностью прозрачным|float|0.3|-3|1|
cg_hudGrenadePointerWidth|Ширина указателя индикатора гранаты|float|25|0|512|
cg_hudMapBorderWidth|Размер рамки полной карты, заполняемой ownerdraw CG_PLAYER_FULLMAP_BORDER|float|2|0||
cg_hudMapFriendlyHeight|Размер значка союзника на полной карте|float|15|0||
cg_hudMapFriendlyWidth|Размер значка союзника на полной карте|float|15|0||
cg_hudMapPlayerHeight|Размер значка игрока на полной карте|float|20|0||
cg_hudMapPlayerWidth|Размер значка игрока на полной карте|float|20|0||
cg_hudMapRadarLineThickness|Толщина радарной текстуры, пробегающей по полноэкранной карте, относительно ширины карты|float|0.15|0.01|10|
cg_hudProneY|Виртуальная экранная координата y сообщения о запрете ложиться|float|-160|-10000|10000|
cg_hudSayPosition|Позиция окна say в HUD|vec2|5 180|0|640|
cg_hudStanceFlash|Цвет фона вспышки при смене стойки|color|1 1 1 1|0|1|
cg_hudStanceHintPrints|Рисовать пояснительный текст о том, как менять стойку|bool|false|||
cg_hudVotePosition|Позиция окна голосования HUD|vec2|5 220|0|640|
cg_invalidCmdHintBlinkInterval|Частота мигания подсказки о неверной команде|int|600|1||
cg_invalidCmdHintDuration|Длительность подсказки о неверной команде|int|1800|0||
cg_laserEndOffset|Насколько конец луча отстоит от точки столкновения.|float|0.5|||
cg_laserFlarePct|Процент расширения лазера с расстоянием от наблюдателя.|float|0.2|0||
cg_laserForceOn|Принудительно включить лазерные прицелы везде, где возможно (для отладки).|bool|false|||
cg_laserLight|Рисовать ли свет, испускаемый лазером (не сам лазер)|bool|true|||
cg_laserLightBeginOffset|Насколько свет в начале луча отстоит от истинного начала луча.|float|13|||
cg_laserLightBodyTweak|Добавка к длине луча для света, когда лазер попадает в тело (для хитбоксов).|float|15|||
cg_laserLightEndOffset|Насколько свет в конце луча отстоит от истинного конца луча.|float|-3|||
cg_laserLightRadius|Радиус света на дальнем конце лазерного луча|float|3|0.001||
cg_laserRadius|Размер (радиус) лазерного луча|float|0.8|0.001||
cg_laserRange|Максимальная дальность лазерного луча|float|1500|1||
cg_laserRangePlayer|Максимальная дальность лазерного луча игрока|float|1500|1||
cg_mapLocationSelectionCursorSpeed|Скорость курсора при выборе места на карте|float|0.6|0.001|1|
cg_marks_ents_player_only|Метки на сущностях только от пуль игроков.|bool|false|||
cg_nopredict|Не выполнять предсказание на стороне клиента|bool|false|||
cg_overheadIconSize|Максимальный размер значков над головой, таких как «звание»|float|0.7|0|100|
cg_overheadNamesFarDist|Дальнее расстояние, на котором размеры имён масштабируются на cg_overheadNamesFarScale|float|1024|0||
cg_overheadNamesFarScale|Величина масштабирования размеров имён на cg_overheadNamesFarDist|float|0.6|0||
cg_overheadNamesFont|Шрифт для имён над головой (см. menudefinition.h)|int|2|0|6|
cg_overheadNamesGlow|Цвет свечения для имён над головой|color|0 0 0 1|0|1|
cg_overheadNamesMaxDist|Максимальное расстояние отображения имён союзников|float|10000|0||
cg_overheadNamesNearDist|Ближнее расстояние, на котором имена имеют полный размер|float|256|0||
cg_overheadNamesSize|Максимальный размер отображения имён над головой|float|0.5|0|100|
cg_overheadRankSize|Размер отображения текста звания|float|0.5|0||
cg_predictItems|Включить предсказание на стороне клиента для подбора предметов|bool|true|||
cg_scoreboardBannerHeight|Высота баннера табло|int|35|1|100|
cg_scoreboardFont|Перечисление шрифтов табло (см. menudefinition.h)|int|0|0|6|
cg_scoreboardHeaderFontScale|Масштаб шрифта заголовка табло|float|0.35|0||
cg_scoreboardHeight|Высота табло|float|435|0||
cg_scoreboardItemHeight|Высота каждого элемента|int|18|1|1000|
cg_scoreboardMyColor|Цвет шрифта локального игрока при отображении в табло|color|1 0.8 0.4 1|0|1|
cg_scoreboardPingGraph|Показывать ли графический пинг|bool|false|||
cg_scoreboardPingHeight|Высота графика пинга в % от высоты строки табло|float|0.7|0|1|
cg_scoreboardPingText|Показывать ли числовое значение пинга|bool|true|||
cg_scoreboardPingWidth|Ширина графика пинга в % от табло|float|0.036|0|1|
cg_scoreboardRankFontScale|Масштаб шрифта звания|float|0.25|0||
cg_scoreboardScrollStep|Шаг прокрутки табло|int|3|1|8|
cg_scoreboardTextOffset|Смещение текста табло|float|0.5|0||
cg_scoreboardWidth|Ширина табло|float|500|0||
cg_ScoresPing_BgColor|Цвет фона пинга|color|0.25 0.25 0.25 0.5|0|1|
cg_ScoresPing_HighColor|Цвет для высокого пинга|color|0.8 0 0 1|0|1|
cg_ScoresPing_Interval|Число миллисекунд, представляемых каждой полоской|int|100|1|500|
cg_ScoresPing_LowColor|Цвет для низкого пинга|color|0 0.75 0 1|0|1|
cg_ScoresPing_MaxBars|Число полосок в графике пинга|int|4|1|10|
cg_ScoresPing_MedColor|Цвет для среднего пинга|color|0.8 0.8 0 1|0|1|
cg_scriptIconSize|Размер значков, задаваемых скриптом|float|0|0|100|
cg_showmiss|Показывать ошибки предсказания|int|0|0|2|
cg_sprintMeterDisabledColor|Цвет индикатора спринта, когда спринт отключён|vec4|0.8 0.1 0.1 0.2|0|1|
cg_sprintMeterEmptyColor|Цвет индикатора спринта, когда спринт пуст|vec4|0.7 0.5 0.2 0.8|0|1|
cg_sprintMeterFullColor|Цвет индикатора спринта, когда спринт полон|vec4|0.8 0.8 0.8 0.8|0|1|
cg_subtitleMinTime|Минимальное время отображения субтитров на экране в секундах|float|3|0||
cg_subtitles|Показывать субтитры|bool|true|||
cg_subtitleWidthStandard|Ширина субтитров в неширокоэкранном режиме|int|520|130|1664|
cg_subtitleWidthWidescreen|Ширина субтитров в широкоэкранном режиме|int|520|130|1664|
cg_teamChatsOnly|Разрешить чат только внутри команды|bool|false|||
cg_thirdPerson|Использовать вид от третьего лица|bool|false|||
cg_thirdPersonAngle|Угол камеры от игрока в виде от третьего лица|float|0|-180|360|
cg_thirdPersonRange|Дистанция камеры от игрока в виде от третьего лица|float|120|0|1024|
cg_tracerchance|Вероятность того, что пуля будет трассером|float|0.2|0|1|
cg_tracerlength|Длина трассера|float|160|0||
cg_tracerScale|Масштабировать трассер на расстоянии, чтобы он был виден|float|1|1||
cg_tracerScaleDistRange|Расстояние, на котором трассер масштабируется до максимальной величины|float|25000|0||
cg_tracerScaleMinDist|Минимальное расстояние для масштабирования трассера|float|5000|0||
cg_tracerScrewDist|Длина, которую проходит трассер за один полный оборот спирали|float|100|0||
cg_tracerScrewRadius|Радиус спирального движения трассера|float|0.5|0||
cg_tracerSpeed|Скорость трассера в юнитах в секунду|float|7500|0||
cg_tracerwidth|Ширина трассера|float|4|0||
cg_viewZSmoothingMax|Порог максимального расстояния сглаживания, которое мы будем делать|float|16|0||
cg_viewZSmoothingMin|Порог минимального расстояния, которое нужно пройти для сглаживания|float|1|0||
cg_viewZSmoothingTime|Время, за которое распределяется сглаживание|float|0.1|0||
cg_voiceIconSize|Размер значка «голос»|float|0|0|100|
cg_weaponCycleDelay|Задержка после переключения на новое оружие, чтобы удержание кнопки переключения не приводило к слишком быстрому перебору|int|0|0||
cg_weaponHintsCoD1Style|Рисовать подсказки оружия в стиле CoD1: с названием оружия и значком под ним|bool|true|||
cg_weaponleftbone|Имя кости оружия в левой руке|string|tag_weapon_left|||
cg_weaponrightbone|Имя кости оружия в правой руке|string|tag_weapon_right|||
cg_youInKillCamSize|Размер значка «вы» в камере убийства|float|6|0|100|
cl_allowDownload|Разрешить клиентские загрузки с сервера|bool|true|||
cl_analog_attack_threshold|Порог до выстрела|float|0.8|0.0001|1|
cl_anglespeedkey|Множитель максимальной угловой скорости для геймпада и клавиатуры|float|1.5|0||
cl_anonymous|Разрешить анонимный вход|||||
cl_avidemo|Частота кадров AVI-демо|int|0|0||
cl_bypassMouseInput|Обходить ввод мыши UI и отправлять напрямую в игру|bool|false|||
cl_connectionAttempts|Максимальное число попыток подключения до прерывания|int|10|0||
cl_connectTimeout|Тайм-аут в секундах при подключении к серверу|float|200|0|3600|
cl_forceavidemo|Записывать AVI-демо, даже если клиент неактивен|bool|false|||
cl_freelook|Включить обзор мышью|bool|true|||
cl_freezeDemo|cl_freezeDemo используется для фиксации демо на месте для покадрового продвижения|bool|false|||
cl_hudDrawsBehindUI|Должен ли HUD рисоваться, когда открыт UI?|bool|true|||
cl_ingame|Истина, если игра активна|bool|false|||
cl_maxpackets|Максимальное число пакетов, отправляемых за кадр|int|30|15|100|
cl_maxPing|Максимальный пинг для клиента|int|800|20|2000|
cl_maxppf|Максимальное число серверов для пинга за кадр в браузере серверов|||||
cl_motdString|Сообщение дня|string|""|||
cl_mouseAccel|Ускорение мыши|float|0|0|100|
cl_nodelta|Сервер не отправляет дельты снимков|bool|false|||
cl_noprint|Ничего не выводить в консоль|bool|false|||
cl_packetdup|Включить дублирование пакетов|int|1|0|5|
cl_paused|Пауза игры|int|0|0|2|
cl_pitchspeed|Максимальная скорость тангажа в градусах для геймпада|float|140|||
cl_punkbuster|Определяет, включён ли PunkBuster|bool|true|||
cl_serverStatusResendTime|Время в миллисекундах для повторной отправки сообщения о статусе сервера|int|750|0|3600|
cl_showmouserate|Выводить отладочную информацию о частоте мыши в консоль|bool|false|||
cl_shownet|Отображать отладочную информацию о сети|int|0|-2|4|
cl_shownuments|Показывать число сущностей|bool|false|||
cl_showSend|Включить отладочную информацию для отправленных команд|bool|false|||
cl_showServerCommands|Включить отладочную информацию для серверных команд|bool|false|||
cl_showTimeDelta|Включить отладочную информацию для дельты времени|bool|false|||
cl_stanceHoldTime|Время удержания кнопки стойки до перехода в положение лёжа|int|300|0|1000|
cl_talking|Клиент говорит|bool|false|||
cl_timeout|Секунды без получения пакетов до тайм-аута|float|40|0|3600|
cl_updateavailable|Истина, если доступно обновление|bool|false|||
cl_updatefiles|Файл, который обновляется|string|""|||
cl_updateoldversion|Версия до обновления|string|""|||
cl_updateversion|Обновлённая версия|string|""|||
cl_voice|Использовать голосовую связь|bool|true|||
cl_wwwDownload|Загружать файлы по HTTP|bool|true|||
cl_yawspeed|Максимальная скорость рыскания в градусах для геймпада и клавиатуры|float|140|||
clientSideEffects|Разрешить загрузку файлов _fx.gsc на клиенте|bool|true|||
codkey||||||
com_animCheck|Проверять дерево анимаций|bool|false|||
com_errorMessage|Последнее сообщение об ошибке|string||||
com_errorTitle|Заголовок последнего сообщения об ошибке|string||||
com_filter_output|Использовать фильтры консоли для фильтрации вывода.|bool|false|||
com_introPlayed|Вступительный ролик был проигран|bool|false|||
com_maxfps|Ограничение кадров в секунду|int|85|0|1000|
com_maxFrameTime|Время замедляется, если кадр длится дольше этого числа миллисекунд|int|100|50|5000|
com_playerProfile|Профиль игрока|string||||
com_recommendedSet|Использовать рекомендуемые настройки|bool|false|||
com_statmon|Рисовать монитор статистики|bool|false|||
com_timescale|Масштаб времени каждого кадра|float|1|0.001|1000|
compass||bool|true|||
compassClampIcons|Если true, союзники и враги прижимаются к краю радара. Если false, они исчезают за краем.|bool|true|||
compassCoords|x = базовое значение координаты север-юг, y = базовое значение координаты восток-запад, z = масштаб (игровых юнитов на единицу координаты)|vec3|740 3590 400|0||
compassECoordCutoff|Левый отсекающий порог для прокручиваемых координат восток-запад|float|37|0||
compassEnemyFootstepEnabled|Включает появление врагов на компасе из-за быстрого движения рядом.|bool|false|||
compassEnemyFootstepMaxRange|Максимальное расстояние, на котором враг может появиться на компасе из-за «шагов»|float|500|0||
compassEnemyFootstepMaxZ|Максимальное вертикальное расстояние, на котором враг может находиться от игрока и появляться на компасе из-за «шагов»|float|100|0||
compassEnemyFootstepMinSpeed|Минимальная скорость, с которой должен двигаться враг, чтобы появиться на компасе из-за «шагов»|float|140|0||
compassFriendlyHeight|Размер значка союзника на компасе|float|18.75|0||
compassFriendlyWidth|Размер значка союзника на компасе|float|18.75|0||
compassMaxRange|Максимальное расстояние от игрока в мировом пространстве, на котором объекты будут показаны на компасе|float|2500|0.0001||
compassMinRadius|Минимальный радиус от центра компаса, на котором появятся объекты.|float|0.0001|0.0001||
compassMinRange|Минимальное расстояние от игрока в мировом пространстве, на котором объекты появятся на компасе|float|0.0001|0.0001||
compassObjectiveArrowHeight|Размер стрелки цели на компасе|float|20|0||
compassObjectiveArrowOffset|Смещение стрелки цели внутрь от края карты компаса|float|2|0||
compassObjectiveArrowRotateDist|Расстояние от угла карты компаса, на котором стрелка цели поворачивается на 45 градусов|float|5|0||
compassObjectiveArrowWidth|Размер стрелки цели на компасе|float|20|0||
compassObjectiveDetailDist|Когда цель ближе этого расстояния (в метрах), значок не будет рисоваться на тикерной ленте.|float|10|0.01||
compassObjectiveDrawLines|Рисовать горизонтальные и вертикальные линии к активной цели, если она в границах мини-карты|bool|true|||
compassObjectiveHeight|Размер цели на компасе|float|20|0||
compassObjectiveIconHeight|Размер цели на полной карте|float|16|0||
compassObjectiveIconWidth|Размер цели на полной карте|float|16|0||
compassObjectiveMaxHeight|Максимальная высота, на которой цель считается находящейся на этом уровне|float|70|0||
compassObjectiveMaxRange|Максимальное расстояние, на котором цель видна на компасе|float|2048|0||
compassObjectiveMinAlpha|Минимальная альфа цели на краю компаса|float|1|0|1|
compassObjectiveMinDistRange|Расстояние, на котором проигрываются эффекты перехода цели, с центром на compassObjectiveNearbyDist.|float|1|0.01||
compassObjectiveMinHeight|Минимальная высота, на которой цель считается находящейся на этом уровне|float|-70||0|
compassObjectiveNearbyDist|Когда цель ближе этого расстояния (в метрах), показывается индикатор типа «цель рядом».|float|4|0.01||
compassObjectiveNumRings|Число колец при появлении новой цели|int|10|0|20|
compassObjectiveRingSize|Максимальный размер кольца цели при появлении новой цели на компасе|float|80|0||
compassObjectiveRingTime|Время между кольцами при появлении цели|int|10000|0||
compassObjectiveTextHeight|Высота текста цели|float|18|1e-05||
compassObjectiveTextScale|Масштаб, применяемый к целям HUD|float|0.3|1e-05||
compassObjectiveWidth|Размер цели на компасе|float|20|0||
compassPlayerHeight|Размер значка игрока на компасе|float|25|0||
compassPlayerWidth|Размер значка игрока на компасе|float|25|0||
compassRadarLineThickness|Толщина радарной текстуры, пробегающей по карте, относительно размера компаса|float|0.4|0.01|10|
compassRadarPingFadeTime|Как долго враг виден на компасе после обнаружения радаром|float|4|0.01|60|
compassRadarUpdateTime|Время между обновлениями радара|float|4|0.01|60|
compassRotation|Стиль компаса|bool|true|||
compassSize|Масштаб компаса|float|1|0||
compassSoundPingFadeTime|Время в секундах затухания звукового оверлея на компасе|float|2|0|10|
compassTickertapeStretch|Насколько тикерная лента должна растягиваться от своего центра.|float|0.5|0.01|1|
con_default_console_filter|Фильтр канала по умолчанию для назначения консоли.|string|*|||
con_errormessagetime|Время отображения сообщений об ошибках на экране в секундах|float|8|0||
con_gameMsgWindow%dFadeInTime|Время появления новых сообщений в окне игровых сообщений %d|||||
con_gameMsgWindow%dFadeOutTime|Время затухания старых сообщений в окне игровых сообщений %d|||||
con_gameMsgWindow%dLineCount|Максимальное число строк текста, видимых одновременно в окне игровых сообщений %d|||||
con_gameMsgWindow%dMsgTime|Время отображения игровых сообщений на экране в секундах в окне игровых сообщений %d|||||
con_gameMsgWindow%dScrollTime|Время прокрутки сообщений при удалении самого старого сообщения в окне игровых сообщений %d|||||
con_gameMsgWindow%dSplitscreenScale|Масштабирование окна игровых сообщений %d в режиме разделённого экрана|||||
con_inputBoxColor|Цвет поля ввода консоли|vec4|0.25 0.25 0.2 1|0|1|
con_inputHintBoxColor|Цвет поля подсказки ввода консоли|vec4|0.4 0.4 0.35 1|0|1|
con_matchPrefixOnly|Сопоставлять только префикс при выводе списка подходящих Dvar|bool|true|||
con_minicon|Отображать мини-консоль на экране|bool|false|||
con_miniconlines|Число строк в окне сообщений мини-консоли|int|5|0|100|
con_minicontime|Время отображения сообщений мини-консоли на экране в секундах|float|4|0||
con_outputBarColor|Цвет полосы вывода консоли|vec4|1 1 0.95 0.6|0|1|
con_outputSliderColor|Цвет ползунка консоли|vec4|0.15 0.15 0.1 0.6|0|1|
con_outputWindowColor|Цвет вывода консоли|vec4|0.35 0.35 0.3 0.75|0|1|
con_typewriterColorBase|Базовый цвет печатаемого текста цели.|vec3|1 1 1|0|1|
con_typewriterColorGlowCheckpoint|Цвет печатаемого текста цели.|vec4|0.6 0.5 0.6 1|0|1|
con_typewriterColorGlowCompleted|Цвет печатаемого текста цели.|vec4|0 0.3 0.8 1|0|1|
con_typewriterColorGlowFailed|Цвет печатаемого текста цели.|vec4|0.8 0 0 1|0|1|
con_typewriterColorGlowUpdated|Цвет печатаемого текста цели.|vec4|0 0.6 0.18 1|0|1|
con_typewriterDecayDuration|Время (в миллисекундах), затрачиваемое на растворение строки.|int|700|0||
con_typewriterDecayStartTime|Время (в миллисекундах) между фазами набора и растворения.|int|6000|0||
con_typewriterPrintSpeed|Время (в миллисекундах) на печать каждой буквы строки.|int|50|0||
createserver_maps||||||
debug_protocol||||||
dedicated|Выделенный сервер|enum|2|0|2|listen server,dedicated LAN server,dedicated internet server
developer|Включить опции разработки|int|0|0|2|
developer_script|Включить комментарии отладочного скрипта|bool|false|||
dynEnt_active|Отключить/включить реакции динамических сущностей|bool|true|||
dynEnt_bulletForce|Сила, применяемая при попадании пули|float|1000|0|1e+06|
dynEnt_explodeForce|Сила, применяемая при взрыве|float|12500|0|1e+06|
dynEnt_explodeMaxEnts|Максимальное число динамических сущностей, которые может разбудить один взрыв|int|20|0|4096|
dynEnt_explodeMinForce|Сила, ниже которой динамические сущности даже не пробуждаются|float|40|0||
dynEnt_explodeSpinScale|Масштаб случайного смещения от центра масс для сил взрыва.|float|3|0|100|
dynEnt_explodeUpbias|Смещение вверх, применяемое к направлениям сил от взрывов|float|0.5|0|2|
dynEntPieces_angularVelocity|Начальная угловая скорость разлетающихся осколков|vec3|0 0 0|-180|180|
dynEntPieces_impactForce|Сила, применяемая при разрушении объекта|float|1000|0|1e+06|
dynEntPieces_velocity|Начальная скорость разлетающихся осколков|vec3|0 0 0|-1000|1000|
fixedtime|Использовать фиксированную скорость времени на каждый кадр|int|0|0|1000|
friction|Трение игрока|float|5.5|0|100|
fs_basegame|Имя базовой игры|string||||
fs_basepath|Базовый путь игры|string||||
fs_cdpath|Путь к CD|string||||
fs_copyfiles|Копировать все используемые файлы в другое место|bool|false|||
fs_debug|Включить отладочную информацию файловой системы|int|0|0|2|
fs_game|имя игры|string|""|||
fs_homepath|Домашний путь игры|string||||
fs_ignoreLocalized|Игнорировать локализованные ресурсы|bool|false|||
fs_restrict|Ограничить доступ к файлам для демо и т.п.|bool|false|||
fs_usedevdir|Использовать каталоги разработки.|||||
fx_count|Отладка: подсчёт эффектов|bool|false|||
fx_cull_effect_spawn|Отсекать целые эффекты при создании|bool|false|||
fx_cull_elem_draw|Отсекать элементы эффектов при отрисовке|bool|true|||
fx_cull_elem_spawn|Отсекать элементы эффектов при создании|bool|true|||
fx_debugBolt|Отладка болтов эффектов|float|0|0|100|
fx_draw|Переключает отрисовку эффектов после обработки|bool|true|||
fx_drawClouds|Переключает отрисовку облаков частиц|bool|true|||
fx_enable|Переключает всю обработку эффектов|bool|true|||
fx_freeze|Заморозить эффекты|bool|false|||
fx_mark_profile|Включить профилирование FX для меток (укажите локального клиента, «1» — первый.)|int|0|0|1|
fx_marks|Переключает, оставляют ли попадания пуль метки|bool|true|||
fx_marks_ents|Переключает, оставляют ли попадания пуль метки на сущностях|bool|true|||
fx_marks_smodels|Переключает, оставляют ли попадания пуль метки на статических моделях|bool|true|||
fx_profile|Включить профилирование FX (укажите локального клиента, «1» — первый.)|int|0|0|1|
fx_visMinTraceDist|Минимальный размер трассировки видимости|float|80|0|1000|
g_allowVote|Включить голосование на этом сервере|bool|true|||
g_allowvote||bool|true|||
g_antilag|Включить проверки антилага для попаданий оружия|bool|true|||
g_banIPs|IP-адреса, которым запрещено играть|string||||
g_clonePlayerMaxVelocity|Максимальная скорость по каждой оси клонированного игрока (для анимаций смерти)|float|80|0||
g_compassShowEnemies|Всегда ли враги видны на компасе|bool|false|||
g_deadChat|Разрешить мёртвым игрокам общаться с живыми|bool|false|||
g_debugBullets|Показывать отладочную информацию о пулях|int|0|-3|6|
g_debugDamage|Показывать отладочную информацию об уроне|bool|false|||
g_debugLocDamage|Включить отладочную информацию о локационном уроне|bool|false|||
g_dropForwardSpeed|Скорость вперёд выпавшего предмета|float|10|0|1000|
g_dropHorzSpeedRand|Случайная составляющая начальной горизонтальной скорости выпавшего предмета|float|100|0|1000|
g_dropUpSpeedBase|Базовая составляющая начальной вертикальной скорости выпавшего предмета|float|10|0|1000|
g_dropUpSpeedRand|Случайная составляющая начальной вертикальной скорости выпавшего предмета|float|5|0|1000|
g_dumpAnims|Отладочная информация об анимациях для указанного номера персонажа|int|-1|-1|1023|
g_entinfo|Отображать информацию о сущностях|enum|0|0|1|off,all ents
g_fogColorReadOnly|Цвет тумана, установленный при последнем вызове "setexpfog"|color|1 0 0 1|0|1|
g_fogHalfDistReadOnly|Начальное расстояние тумана, установленное при последнем вызове "setexpfog"|float|0.1|0||
g_fogStartDistReadOnly|Начальное расстояние тумана, установленное при последнем вызове "setexpfog"|float|0|0||
g_friendlyfireDist|Максимальное расстояние отключения огня по союзнику|float|256|0|15000|
g_friendlyNameDist|Максимальное расстояние для отображения имени союзника|float|15000|0|15000|
g_gametype|Установка состояния в CA_LOADING в CL_DownloadsComplete|string|war|||
g_gravity|Гравитация игры в дюймах в секунду за секунду|float|800|1||
g_inactivity|Задержка до кика игрока за неактивность|int|0|0||
g_knockback|Максимальный отброс|float|1000|||
g_listEntity|Вывести список сущностей|bool|false|||
g_log|Имя файла журнала|string|games_mp.log|||
g_logSync|Включить синхронное журналирование|bool|false|||
g_mantleBlockTimeBuffer|Время задержки клиентского think после подъёма|int|500|0|60000|
g_maxDroppedWeapons|Максимальное число выпавших оружий|int|16|2|32|
g_minGrenadeDamageSpeed|Минимальная скорость, при которой попадание гранатой наносит урон (не урон от взрыва гранаты)|float|400|0||
g_motd|Сообщение дня|string||||
g_no_script_spam|Отключить отладочную информацию скриптов|bool|false|||
g_oldVoting|Использовать старый метод голосования|bool|true|||
g_password||string||||
g_playerCollisionEjectSpeed|Скорость, с которой сталкивающиеся игроки отталкиваются друг от друга|int|25|0|32000|
g_redCrosshairs|Включены ли красные прицелы|bool|true|||
g_ScoresColor_Allies|Цвет команды союзников в табло|color|0.09 0.46 0.07 1|0|1|
g_ScoresColor_Axis|Цвет команды оси в табло|color|0.69 0.07 0.05 1|0|1|
g_ScoresColor_EnemyTeam|Цвет вражеской команды в табло|color|0.69 0.07 0.05 1|0|1|
g_ScoresColor_Free|Цвет свободной команды в табло|color|0.76 0.78 0.1 1|0|1|
g_ScoresColor_MyTeam|Цвет команды игрока в табло|color|0.25 0.72 0.25 1|0|1|
g_ScoresColor_Spectator|Цвет команды наблюдателей в табло|color|0.25 0.25 0.25 1|0|1|
g_smoothClients|Включить экстраполяцию между состояниями клиентов|bool|true|||
g_speed|Скорость игрока|int|190|||
g_synchronousClients|Клиент синхронизирован с сервером — позволяет плавные демо|bool|false|||
g_TeamColor_Allies|Цвет команды союзников|color|0.6 0.64 0.69 1|0|1|
g_TeamColor_Axis|Цвет команды оси|color|0.65 0.57 0.41 1|0|1|
g_TeamColor_EnemyTeam|Цвет вражеской команды|color|0.75 0.25 0.25 1|0|1|
g_TeamColor_Free|Цвет свободной команды|color|0.75 0.25 0.25 1|0|1|
g_TeamColor_MyTeam|Цвет команды игрока|color|0.4 0.6 0.85 1|0|1|
g_TeamColor_Spectator|Цвет команды наблюдателей|color|0.25 0.25 0.25 1|0|1|
g_TeamIcon_Allies|Имя шейдера для баннера счёта союзников|string|faction_128_usmc|||
g_TeamIcon_Axis|Имя шейдера для баннера счёта оси|string|faction_128_arab|||
g_TeamIcon_Free|Имя шейдера для счёта игроков без команды|string||||
g_TeamIcon_Spectator|Имя шейдера для счёта игроков-наблюдателей|string||||
g_TeamName_Allies|Имя команды союзников|string|GAME_ALLIES|||
g_TeamName_Axis|Имя команды оси|string|GAME_AXIS|||
g_useholdspawndelay|Время в миллисекундах, в течение которого игрок не может «использовать» после возрождения|int||0|1000|
g_useholdtime|Время удержания кнопки «использовать» для активации|int|0|0||
g_voiceChatTalkingDuration|Время после последнего полученного talk-пакета, в течение которого сервер считает игрока говорящим, в миллисекундах|int|500|0|10000|
g_voteAbstainWeight|Насколько воздержавшийся голос считается голосом «против»|float|0.5|0|1|
gamedate|1 мая 2018|string||||
gamename|Call of Duty 4|string|KisakCoD4|||
heli_barrelMaxVelocity||float|1250|-360||
heli_barrelRotation|Насколько поворачивать ствол турели, когда вертолёт стреляет|float|70|-360|360|
heli_barrelSlowdown||float|360|-360||
hiDef|Истина, если игровое видео работает в высоком разрешении.|bool|true|||
hud_deathQuoteFadeTime|Время затухания цитаты о смерти|int|1000|0|100000|
hud_enable|Включить элементы HUD|bool|true|||
hud_fade_ammodisplay|Время появления индикатора боеприпасов в секундах|float|0|0|30|
hud_fade_compass|Время появления компаса в секундах|float|0|0|30|
hud_fade_healthbar|Время появления полосы здоровья в секундах|float|2|0|30|
hud_fade_offhand|Время появления вспомогательного оружия в секундах|float|0|0|30|
hud_fade_sprint|Время появления индикатора спринта в секундах|float|1.7|0|30|
hud_fade_stance|Время появления индикатора стойки в секундах|float|1.7|0|30|
hud_fadeout_speed|Скорость затухания HUD|float|0.1|0|1|
hud_flash_period_offhand|Период вспышки вспомогательного оружия при смене оружия|float|0.5|0|30|
hud_flash_time_offhand|Длительность вспышки вспомогательного оружия при смене оружия|float|2|0|30|
hud_health_pulserate_critical|Частота пульсации эффекта «критического» состояния|float|0.5|0.1|3|
hud_health_pulserate_injured|Частота пульсации эффекта «раненого» состояния|float|1|0.1|3|
hud_health_startpulse_critical|Уровень здоровья, при котором начинается пульсация «критического» эффекта|float|0.33|0|1.1|
hud_health_startpulse_injured|Уровень здоровья, при котором начинается пульсация эффекта «раненого»|float|1|0|1.1|
hud_healthOverlay_phaseEnd_pulseDuration|Время в миллисекундах для затухания оверлея здоровья после окончания мигания|int|700|0|1000|
hud_healthOverlay_phaseEnd_toAlpha|Множитель альфы, до которого нужно затухнуть перед отключением оверлея (процент от пика пульсации)|float|0|0|1|
hud_healthOverlay_phaseOne_pulseDuration|Время в миллисекундах для нарастания до первого значения альфы (пика пульсации)|int|150|0|1000|
hud_healthOverlay_phaseThree_pulseDuration|Время в миллисекундах для затухания альфы до hud_healthOverlay_phaseThree_toAlphaMultiplier|int|400|0|1000|
hud_healthOverlay_phaseThree_toAlphaMultiplier|Множитель альфы для третьей фазы оверлея здоровья (процент от пика пульсации)|float|0.6|0|1|
hud_healthOverlay_phaseTwo_pulseDuration|Время в миллисекундах для затухания альфы до hud_healthOverlay_phaseTwo_toAlphaMultiplier|int|320|0|1000|
hud_healthOverlay_phaseTwo_toAlphaMultiplier|Множитель альфы для второй фазы оверлея здоровья (процент от пика пульсации)|float|0.7|0|1|
hud_healthOverlay_pulseStart|Процент от полного здоровья, при котором начинает мигать предупреждающий оверлей низкого здоровья|float|0.55|0|1|
hud_healthOverlay_regenPauseTime|Время в миллисекундах до начала регенерации здоровья|int|8000|0|10000|
hudElemPausedBrightness|Яркость элементов HUD, когда игра на паузе.|float|0.4|0|1|
in_mouse|Инициализировать драйверы мыши|bool|true|||
inertiaAngle|Косинус угла, при котором возникает инерция|float|0|-1|1|
inertiaDebug|Показывать отладочную информацию об инерции|bool|false|||
inertiaMax|Максимальная инерция игрока|float|50|0|1000|
jump_height|Максимальная высота прыжка игрока|float|39|0|1000|
jump_ladderPushVel|Скорость прыжка с лестницы|float|128|0|1024|
jump_slowdownEnable|Замедлять движение игрока после прыжка|bool|true|||
jump_spreadAdd|Величина добавляемого разброса как побочный эффект прыжка|float|64|0|512|
jump_stepSize|Максимальный шаг вверх до вершины дуги прыжка|float|18|0|64|
loc_forceEnglish|Принудительно использовать английские локализованные строки|bool|false|||
loc_language|Текущая языковая локаль|int|0|0|14|
loc_translate|Включить перевод строк|bool|true|||
loc_warnings|Включить предупреждения локализации|bool|false|||
loc_warningsAsErrors|Выдавать ошибку для любой нелокализованной строки|bool|false|||
logfile|Запись в файл журнала — 0 = отключено, 1 = асинхронная запись, 2 = синхронно каждую запись|int|1|0|2|
lowAmmoWarningColor1|Цвет 1 из 2 для колебания между ними|color|0.9 0.9 0.9 0.8|0|1|
lowAmmoWarningColor2|Цвет 2 из 2 для колебания между ними|color|1 1 1 1|0|1|
lowAmmoWarningNoAmmoColor1|Как lowAmmoWarningColor1, но при отсутствии боеприпасов.|color|0.8 0 0 0.8|0|1|
lowAmmoWarningNoAmmoColor2|lowAmmoWarningColor2, но при отсутствии боеприпасов.|color|1 0 0 1|0|1|
lowAmmoWarningNoReloadColor1|Как lowAmmoWarningColor1, но при отсутствии боеприпасов для перезарядки.|color|0.7 0.7 0 0.8|0|1|
lowAmmoWarningNoReloadColor2|lowAmmoWarningColor2, но при отсутствии боеприпасов для перезарядки.|color|1 1 0 1|0|1|
lowAmmoWarningPulseFreq|Частота пульсации (колебание между 2 цветами)|float|1.7|0||
lowAmmoWarningPulseMax|Минимум диапазона колебания: 0 — цвет1, 1.0 — цвет2. Может быть < 0, и волна обрежется на 0.|float|1.5|0||
lowAmmoWarningPulseMin|Максимум диапазона колебания: 0 — цвет1, 1.0 — цвет2. Может быть > 1.0, и волна обрежется на 1.0.|float|0||1|
m_filter|Разрешить сглаживание движения мыши|bool|false|||
m_forward|Скорость вперёд в юнитах в секунду|float|0.25|-1|1|
m_pitch|Внешний Dvar|float|0.022|-1|1|
m_side|Боковое движение в юнитах в секунду|float|0.25|-1|1|
m_yaw|Рыскание по умолчанию|float|0.022|-1|1|
mantle_check_angle|Минимальный угол от игрока до поверхности подъёма для разрешения подъёма|float|60|0|180|
mantle_check_radius|Радиус игрока для проверки при подъёме|float|0.1|0|15|
mantle_check_range|Минимальное расстояние от игрока до поверхности подъёма для разрешения подъёма|float|20|0|128|
mantle_debug|Показывать отладочную информацию о подъёме|bool|false|||
mantle_enable|Включить подъём игрока|bool|true|||
mantle_view_yawcap|Угол, на который ограничивается боковой поворот во время подъёма|float|60|0|180|
mapname|Текущее имя карты|string||||
masterPort|Порт мастер-сервера|int|20810|0|65535|
masterServerName|Имя мастер-сервера для отображения публичных интернет-игр|string|cod4master.activision.com|||
melee_debug|Включить отладочные линии для трассировок удара|bool|false|||
missileDebugAttractors|Рисовать аттракторы и репульсоры. Аттракторы зелёные, репульсоры жёлтые.|bool|false|||
missileDebugDraw|Рисовать траектории управляемых ракет.|bool|false|||
missileDebugText|Выводить отладочную информацию о ракетах в консоль.|bool|false|||
missileHellfireMaxSlope|Это ограничивает крутизну подъёма ракеты Hellfire.|float|0.5|0||
missileHellfireUpAccel|Скорость, с которой ракета Hellfire изгибается вверх|float|1000|0.1||
missileJavAccelClimb|Ускорение ракеты при подъёме.|float|300|0||
missileJavAccelDescend|Ускорение ракеты при снижении к цели.|float|3000|0||
missileJavClimbAngleDirect|В режиме прямого огня минимальный угол между ракетой и целью, при котором ракета прекращает подъём. Меньшие углы дают больший подъём.|float|85|0||
missileJavClimbAngleTop|В режиме верхнего огня минимальный угол между ракетой и целью, при котором ракета прекращает подъём. Меньшие углы дают больший подъём.|float|50|0||
missileJavClimbCeilingDirect|В режиме прямого огня, какой высоты должна достичь ракета перед снижением.|float|0|0||
missileJavClimbCeilingTop|В режиме верхнего огня, какой высоты должна достичь ракета перед снижением.|float|3000|0||
missileJavClimbHeightDirect|В режиме прямого огня, насколько выше цели ракета будет целиться при подъёме.|float|10000|0||
missileJavClimbHeightTop|В режиме верхнего огня, насколько выше цели ракета будет целиться при подъёме.|float|15000|0||
missileJavClimbToOwner||float|700|0||
missileJavSpeedLimitClimb|Ограничение скорости ракеты при подъёме.|float|1000|0||
missileJavSpeedLimitDescend|Ограничение скорости ракеты при снижении к цели.|float|6000|0||
missileJavTurnDecel||float|0.05|0|1|
missileJavTurnRateDirect|В режиме прямого огня, насколько резко ракета может поворачивать, в углах/сек.|float|60|0||
missileJavTurnRateTop|В режиме верхнего огня, насколько резко ракета может поворачивать, в углах/сек.|float|100|0||
missileWaterMaxDepth|Если ракета взрывается глубже под водой, чем это, эффект/звук взрыва не проигрывается.|float|60|0||
mod|----- Инициализация рендерера ----|||||
monkeytoy|Ограничить доступ к консоли|bool|true|||
motd|Сообщение дня|string|""|||
msg_dumpEnts|Выводить информацию о сущностях из снимка|bool|false|||
msg_hudelemspew|Отладка изменения полей элементов HUD|bool|false|||
msg_printEntityNums|Выводить номера сущностей|bool|false|||
name|Имя игрока|string|""|||
net_ip|Сетевой IP-адрес|string|localhost|||
net_lanauthorize|Авторизовать CD-ключи при использовании LAN|bool|false|||
net_noipx|Отключить IPX|bool|false|||
net_noudp|Отключить UDP|bool|false|||
net_port|Сетевой порт|int|28960|0|65535|
net_profile|Профилирование сетевой производительности|int|0|0|2|
net_showprofile|Показывать дисплей сетевого профилирования|int|0|0|3|
net_socksEnabled|Включить сетевые сокеты|bool|false|||
net_socksPassword|Пароль сетевого сокета|string|""|||
net_socksPort|Порт сетевого сокета|int|1080|0|65535|
net_socksServer|Сервер сетевого сокета|string|""|||
net_socksUsername|Имя пользователя сетевого сокета|string|""|||
nextdemo|Следующее демо для воспроизведения|string|""|||
nextmap|Следующая карта для игры|string||||
nightVisionDisableEffects||bool|false|||
nightVisionFadeInOutTime|Как долго длится затухание в/из чёрного при надевании или снятии ПНВ.|float|0.1|0|10000|
nightVisionPowerOnTime|Как долго длится переход из чёрного в режим ПНВ при включении прибора.|float|0.3|0|10000|
onlinegame|Текущая игра — сетевая игра со статистикой, кастомными классами и разблокировками|bool|true|||
overrideNVGModelWithKnife|Если true, анимации ПНВ будут прикреплять модель ножа из weapDef вместо ПНВ.|bool|false|||
packetDebug|Включить отладочную информацию о пакетах|bool|false|||
password||string|""|||
perk_bulletPenetrationMultiplier|Множитель дополнительного пробития пуль|float|2|0|30|
perk_extraBreath|Число дополнительных секунд, которые игрок может задерживать дыхание|float|5|0||
perk_grenadeDeath|Имя гранатного оружия, выпадающего при смерти|string|frag_grenade_short_mp|||
perk_parabolicAngle|Эффективный угол обзора перка «подслушивание»|float|180|0|180|
perk_parabolicIcon|Значок подслушивания для отображения подслушанных голосовых чатов|string|specialty_parabolic|||
perk_parabolicRadius|Эффективный радиус перка «подслушивание»|float|400|0||
perk_sprintMultiplier|Множитель для player_sprinttime|float|2|0||
perk_weapRateMultiplier|Процент скорости стрельбы оружия|float|0.75|0|1|
perk_weapReloadMultiplier|Процент времени перезарядки оружия|float|0.5|0|1|
perk_weapSpreadMultiplier|Процент разброса оружия|float|0.65|0|1|
phys_autoDisableAngular|Тело должно иметь угловую скорость меньше этой, чтобы считаться бездействующим.|float|1|0||
phys_autoDisableLinear|Тело должно иметь линейную скорость меньше этой, чтобы считаться бездействующим.|float|20|0||
phys_autoDisableTime|Время, в течение которого тело должно бездействовать, чтобы заснуть.|float|0.9|0||
phys_bulletSpinScale|Масштаб эффективного смещения от центра масс для попаданий пуль.|float|3|-1|100|
phys_bulletUpBias|Смещение вверх для направления попадания пули.|float|0.5|0|2|
phys_cfm|Магический параметр смешивания сил физических ограничений.|float|0.0001|0|1|
phys_collUseEntities|Отключите, чтобы выключить проверку столкновений с сущностями|bool|false|||
phys_contact_cfm|Магический параметр смешивания сил физических ограничений для контактов.|float|1e-05|0|1|
phys_contact_cfm_ragdoll|Магический параметр смешивания сил физических ограничений для контактов.|float|0.001|0|1|
phys_contact_erp|Магический параметр снижения ошибки физики для контактов.|float|0.8|0|1|
phys_contact_erp_ragdoll|Магический параметр снижения ошибки физики для контактов.|float|0.3|0|1|
phys_csl|Магический параметр уровня контактной поверхности физики.|float|1|||
phys_dragAngular|Величина углового сопротивления, применяемая глобально|float|0.5|0||
phys_dragLinear|Величина линейного сопротивления, применяемая глобально|float|0.03|0||
phys_drawAwake|Отладочно рисовать рамку, показывающую, какие тела отключены|bool|false|||
phys_drawAwakeTooLong|Рисовать индикатор, показывающий объекты, которые были активны слишком долго.|bool|false|||
phys_drawCollisionObj|Отладочно рисовать геометрию столкновений для каждого физического объекта|bool|false|||
phys_drawCollisionWorld|Отладочно рисовать коллизионные браши и треугольники рельефа|bool|false|||
phys_drawcontacts|Отладочно рисовать точки контакта|bool|false|||
phys_drawDebugInfo|Выводить информацию о физических объектах|bool|false|||
phys_dumpcontacts|Установите true, чтобы выгрузить все ограничения в следующем физическом кадре.|bool|false|||
phys_erp|Магический параметр снижения ошибки физики.|float|0.8|0|1|
phys_frictionScale|Глобально масштабирует величину физического трения.|float|1|0||
phys_gravity|Гравитация физики в юнитах/сек^2.|float|-800|||
phys_gravityChangeWakeupRadius|Радиус вокруг игрока, в пределах которого объекты пробуждаются при изменении гравитации|float|120|0||
phys_interBodyCollision|Отключите, чтобы выключить все столкновения между телами|bool|false|||
phys_jitterMaxMass|Максимальная масса для дрожания — дрожание будет спадать до этой массы|float|200|0.1||
phys_joint_cfm|Магический параметр смешивания сил физических ограничений для соединений.|float|0.0001|0|1|
phys_joint_stop_cfm|Магический параметр смешивания сил физических ограничений для соединений на их пределах.|float|0.0001|0|1|
phys_joint_stop_erp|Магический параметр снижения ошибки физики для соединений на их пределах.|float|0.8|0|1|
phys_mcv|Магический параметр максимальной корректирующей скорости физики.|float|20|||
phys_mcv_ragdoll|Магический параметр максимальной корректирующей скорости физики (для ragdoll).|float|1000|||
phys_minImpactMomentum|Минимальный импульс, необходимый для запуска звуков удара|float|250|0||
phys_narrowObjMaxLength|Если у геома есть размер меньше этого, будет выполнена дополнительная работа, чтобы он не провалился в щели (например, между стеной и полом)|float|4|0||
phys_noIslands|Сделать все контакты соединениями между объектом и миром: без контактов объект-объект|bool|false|||
phys_qsi|Число итераций, выполняемых QuickStep за шаг.|int|15|1||
phys_reorderConst|Переупорядочивание ограничений решателем ODE|bool|true|||
phys_visibleTris|Видимые треугольники используются для столкновений|bool|false|||
pickupPrints|Выводить сообщение в игровое окно при подборе боеприпасов и т.п.|bool|false|||
player_adsExitDelay|Задержка перед выходом из прицеливания|int|0|0|1000|
player_backSpeedScale|Масштаб, применяемый к скорости игрока при движении назад|float|0.7|0|20|
player_breath_fire_delay|Время, вычитаемое из оставшегося времени дыхания игрока при выстреле|float|0|0|30|
player_breath_gasp_lerp|Скорость интерполяции целевой амплитуды колебания при вздохе|float|6|0|50|
player_breath_gasp_scale|Значение масштаба, применяемое к целевой амплитуде колебания при вздохе|float|4.5|0|50|
player_breath_gasp_time|Время, в течение которого игрок будет задыхаться, как только снова сможет дышать|float|1|0|30|
player_breath_hold_lerp|Скорость интерполяции целевой амплитуды колебания при задержке дыхания|float|1|0|50|
player_breath_hold_time|Максимальное время, которое игрок может задерживать дыхание|float|4.5|0|30|
player_breath_snd_delay|Задержка перед проигрыванием звука вдоха|float|1|0|2|
player_breath_snd_lerp|Скорость интерполяции звука задержки дыхания|float|2|0|100|
player_burstFireCooldown|Секунды после очереди до возможности снова стрелять.|float|0.2|0|60|
player_debugHealth|Включить отладочную информацию о здоровье игрока|bool|false|||
player_dmgtimer_flinchTime|Максимальное время проигрывания анимаций вздрагивания|int|500|0|2000|
player_dmgtimer_maxTime|Максимальное время, в течение которого игрок замедлен из-за урона|float|750|0||
player_dmgtimer_minScale|Минимальное значение масштаба замедления игрока при уроне|float|0|0|1|
player_dmgtimer_stumbleTime|Максимальное время проигрывания анимаций спотыкания|int|500|0|2000|
player_dmgtimer_timePerPoint|Время в миллисекундах, на которое игрок замедляется за единицу урона|float|100|0||
player_footstepsThreshhold|Минимальная скорость, при которой игрок издаёт громкие звуки шагов|float|0|0|50000|
player_lean_rotate_crouch_left|Величина поворота модели игрока от 3-го лица при наклоне влево в приседе|float|1.25|0|3|
player_lean_rotate_crouch_right|Величина поворота модели игрока от 3-го лица при наклоне вправо в приседе|float|1|0|3|
player_lean_rotate_left|Величина поворота модели игрока от 3-го лица при наклоне влево|float|1.25|0|3|
player_lean_rotate_right|Величина поворота модели игрока от 3-го лица при наклоне вправо|float|1.25|0|3|
player_lean_shift_crouch_left|Величина смещения модели игрока от 3-го лица при наклоне влево в приседе|float|12.5|0|20|
player_lean_shift_crouch_right|Величина смещения модели игрока от 3-го лица при наклоне вправо в приседе|float|13|0|20|
player_lean_shift_left|Величина смещения модели игрока от 3-го лица при наклоне влево|float|5|0|20|
player_lean_shift_right|Величина смещения модели игрока от 3-го лица при наклоне вправо|float|2.5|0|20|
player_meleeChargeFriction|Трение, используемое при подготовке удара|float|1200|1|5000|
player_meleeHeight|Высота удара игрока|float|10|0|1000|
player_meleeRange|Максимальная дальность удара игрока|float|64|0|1000|
player_meleeWidth|Ширина удара игрока|float|10|0|1000|
player_MGUseRadius|Радиус, в пределах которого игрок может установить пулемёт|float|128|0||
player_move_factor_on_torso|Вклад направления движения в направление корпуса игрока (только мультиплеер)|float|0|0|1|
player_moveThreshhold|Скорость, при которой игрок считается движущимся для целей покачивания модели и движения модели в мультиплеере|float|10|1e-08|20|
player_scopeExitOnDamage|Выходить из прицела, если игрок получает урон|bool|false|||
player_spectateSpeedScale|Масштаб, применяемый к скорости игрока при наблюдении|float|1|0|20|
player_sprintCameraBob|Скорость покачивания камеры при спринте|float|0.5|0|2|
player_sprintForwardMinimum|Минимальное отклонение вперёд, необходимое для поддержания спринта|int|105|0|255|
player_sprintMinTime|Минимальное время спринта, необходимое для начала спринта|float|1|0|12.8|
player_sprintRechargePause|Длительность паузы индикатора перед началом перезарядки после спринта|float|0|0|9000|
player_sprintSpeedScale|Масштаб, применяемый к скорости игрока при спринте|float|1.5|0|5|
player_sprintStrafeSpeedScale|Скорость, с которой можно стрейфить при спринте|float|0.667|0|5000|
player_sprintTime|Базовая длительность спринта игрока|float|4|0|12.8|
player_strafeAnimCosAngle|Косинус угла, при котором игрок начинает использовать анимации стрейфа|float|0.5|0|1|
player_strafeSpeedScale|Масштаб, применяемый к скорости игрока при стрейфе|float|0.8|0|20|
player_sustainAmmo|Стрельба из оружия не уменьшает боеприпасы в магазине.|bool|false|||
player_throwbackInnerRadius|Радиус до живой гранаты, в пределах которого игрок изначально должен находиться для отброса|float|90|0||
player_throwbackOuterRadius|Радиус, в пределах которого игрок может отбросить гранату после того, как побывал во внутреннем радиусе|float|160|0||
player_turnAnims|Использовать анимации для поворота модели игрока в мультиплеере|bool|false|||
player_view_pitch_down|Максимальный угол, на который игрок может смотреть вниз|float|85|0|90|
player_view_pitch_up|Максимальный угол, на который игрок может смотреть вверх|float|85|0|90|
profile_delete_fail_popmenu|Не удалось найти меню '%s'|||||
profile_exists_popmenu|Не удалось найти меню '%s'|||||
protocol|Версия протокола|int|1|1|1|
r_aaAlpha|Метод сглаживания прозрачности|enum|1|0|2|off,dither (fast),supersample (nice)
r_aaSamples|Число выборок сглаживания; 1 отключает сглаживание|int|1|1|16|
r_altModelLightingUpdate|Использовать альтернативный метод обновления освещения моделей|bool|true|||
r_aspectRatio|Соотношение сторон экрана. Большинство широкоэкранных мониторов имеют 16:10 вместо 16:9.|enum||||
r_autopriority|Автоматически устанавливать приоритет процесса Windows при сворачивании игры|bool|false|||
r_blur|Отладочная настройка размытия экрана|float|0|0|32|
r_brightness|Регулировка яркости|float|0|-1|1|
r_cacheModelLighting|Ускорить освещение моделей путём кэширования предыдущих результатов|bool|true|||
r_cacheSModelLighting|Ускорить освещение статических моделей путём кэширования предыдущих результатов|bool|true|||
r_clear|Управляет тем, как очищается цветовой буфер|enum|1|0|4|never,dev-only blink,blink,steady,fog color
r_clearColor|Цвет, в который очищается экран при очистке кадрового буфера|color|0.5 0.75 1 1|0|1|
r_clearColor2|Цвет, в который очищается каждый второй кадр (для использования при разработке)|color|1 0.5 0 1|0|1|
r_colorMap|Заменить все цветовые карты на чисто чёрный или чисто белый|enum|1|0|3|Black,Unchanged,White,Gray
r_contrast|Регулировка контраста|float|1|0|4|
r_customMode|Специальный режим разрешения для удалённого отладчика|string||||
r_debugLineWidth|Ширина отладочных линий на стороне сервера|float|1|0|16|
r_debugShader|Включить отладочную информацию о шейдерах|enum|0|0|4|none,normal,basisTangent,basisBinormal,basisNormal
r_depthPrepass|Включить предварительный проход глубины (обычно повышает производительность)|bool|false|||
r_desaturation|Регулировка обесцвечивания|float|1|0|4|
r_detail|Позволяет шейдерам использовать детализирующие текстуры|bool|true|||
r_diffuseColorScale|Глобально масштабировать диффузный цвет всех точечных источников света|float|1|0|100|
r_displayRefresh|Частота обновления|enum||||
r_distortion|Включить искажение|bool|true|||
r_dlightLimit|Максимальное число динамических источников света, отрисовываемых одновременно|int|4|0|4|
r_dof_bias|Смещение глубины резкости как степенная функция (наподобие гаммы); меньше 1 — резче|float|0.5|0.1|3|
r_dof_enable|Включить эффект глубины резкости|bool|true|||
r_dof_farBlur|Задаёт радиус гауссова размытия, используемого глубиной резкости, в пикселях при 640x480|float|1.8|0|10|
r_dof_farEnd|Дальний конец глубины резкости, в дюймах|float|7000|0|20000|
r_dof_farStart|Начало дальнего конца глубины резкости, в дюймах|float|1000|0|20000|
r_dof_nearBlur|Задаёт радиус гауссова размытия, используемого глубиной резкости, в пикселях при 640x480|float|6|4|10|
r_dof_nearEnd|Ближний конец глубины резкости, в дюймах|float|60|0|1000|
r_dof_nearStart|Начало ближнего конца глубины резкости, в дюймах|float|10|0|1000|
r_dof_tweak|Использовать двары для настройки эффекта глубины резкости; переопределяет r_dof_enable|bool|false|||
r_dof_viewModelEnd|Дальний конец глубины резкости модели оружия, в дюймах|float|8|0|128|
r_dof_viewModelStart|Начало глубины резкости модели оружия, в дюймах|float|2|0|128|
r_drawDecals|Включить отрисовку декалей мира|bool|true|||
r_drawSun|Включить эффекты солнца|bool|true|||
r_drawWater|Включить анимацию воды|bool|true|||
r_envMapExponent|Показатель отражения.|float|5|0.05|20|
r_envMapMaxIntensity|Максимальная интенсивность отражения в зависимости от угла скольжения.|float|0.5|0.01|2|
r_envMapMinIntensity|Минимальная интенсивность отражения в зависимости от угла скольжения.|float|0.2|0|2|
r_envMapOverride|Минимальная интенсивность отражения в зависимости от угла скольжения.|bool|false|||
r_envMapSpecular|Включает зеркальное освещение карты окружения|bool|true|||
r_envMapSunIntensity|Максимальная интенсивность зеркального отражения солнца с материалами карты окружения.|float|2|0|4|
r_fastSkin|Включить быстрое скиннингование моделей|bool|false|||
r_filmTweakBrightness|Отладочная настройка; яркость плёночного цвета|float|0|-1|1|
r_filmTweakContrast|Отладочная настройка; контраст плёночного цвета|float|1.4|0|4|
r_filmTweakDarkTint|Отладочная настройка; тёмный оттенок плёночного цвета|vec3|0.7 0.85 1|0|2|
r_filmTweakDesaturation|Отладочная настройка; обесцвечивание, применяемое после всей 3D-отрисовки|float|0.2|0|1|
r_filmTweakEnable|Отладочная настройка; включить эффекты плёночного цвета|bool|false|||
r_filmTweakInvert|Отладочная настройка; включить инвертированное видео|bool|false|||
r_filmTweakLightTint|Отладочная настройка; светлый оттенок плёночного цвета|vec3|1.1 1.05 0.85|0|2|
r_filmUseTweaks|Переопределить плёночные эффекты значениями tweak-дваров.|bool|false|||
r_floatz|Выделить float z-буфер (требуется для таких эффектов, как floatz, dof и лазерный свет)|bool|true|||
r_fog|Установите 0, чтобы отключить туман|bool|true|||
r_forceLod|Принудительно установить уровень детализации на этот|enum|4|0|4|high,medium,low,lowest,none
r_fullbright|Переключает отрисовку без освещения|bool|false|||
r_fullscreen|Отображать игру в полноэкранном режиме|bool|false|||
r_gamma|Значение гаммы|float|0.8|0.5|3|
r_glow|Включить свечение.|bool|true|||
r_glow_allowed|Разрешить свечение.|bool|true|||
r_glow_allowed_script_forced|Принудительно считать «разрешить свечение» истиной скриптом.|bool|false|||
r_glowTweakBloomCutoff|Отладочная настройка; порог отсечения bloom-свечения|float|0.5|0|1|
r_glowTweakBloomDesaturation|Отладочная настройка; обесцвечивание bloom-свечения|float|0|0|1|
r_glowTweakBloomIntensity0|Отладочная настройка; интенсивность bloom-свечения|float|1|0|20|
r_glowTweakEnable|Отладочная настройка; включить свечение|bool|false|||
r_glowTweakRadius0|Отладочная настройка; радиус свечения в пикселях при 640x480|float|5|0|32|
r_glowUseTweaks|Переопределить свечение значениями tweak-дваров.|bool|false|||
r_gpuSync|Тип синхронизации GPU (используется для улучшения отзывчивости мыши)|enum|1|0|2|off,adaptive,aggressive
r_highLodDist|Расстояние для высокого уровня детализации|float|-1|-1||
r_ignore|используется для отладки чего угодно|int|0|||
r_ignorehwgamma|Игнорировать аппаратную гамму|bool|false|||
r_inGameVideo|Разрешить внутриигровые ролики|bool|true|||
r_lightMap|Заменить все лайтмапы на чисто чёрный или чисто белый|enum|1|0|3|Black,Unchanged,White,Gray
r_lightTweakAmbient|Сила окружающего света|float|0.1|0|4|
r_lightTweakAmbientColor|Цвет окружающего света|color|1 0 0 1|0|1|
r_lightTweakDiffuseFraction|доля диффузного света|float|0.5|0|1|
r_lightTweakSunColor|Цвет солнца|color|0 1 0 1|0|1|
r_lightTweakSunDiffuseColor|Диффузный цвет солнца|color|0 0 1 1|0|1|
r_lightTweakSunDirection|Направление солнца в градусах|vec3|0 0 0|-360|360|
r_lightTweakSunLight|Сила солнечного света|float|1|0|4|
r_loadForRenderer|Установите false, чтобы отключить выделения dx (для режима выделенного сервера)|bool|true|||
r_lockPvs|Заблокировать точку обзора, используемую для определения видимого, на текущее положение и направление|bool|false|||
r_lodBiasRigid|Смещение расстояния уровня детализации для жёстких моделей (отрицательное увеличивает детализацию)|float|0|||
r_lodBiasSkinned|Смещение расстояния уровня детализации для скелетных моделей (отрицательное увеличивает детализацию)|float|0|||
r_lodScaleRigid|Масштаб расстояния уровня детализации для жёстких моделей (большее уменьшает детализацию)|float|1|0||
r_lodScaleSkinned|Масштаб расстояния уровня детализации для скелетных моделей (большее уменьшает детализацию)|float|1|0||
r_logFile|Записать все вызовы графического оборудования за это число кадров в файл журнала|int|0|0||
r_lowestLodDist|Расстояние для самого низкого уровня детализации|float|-1|-1||
r_lowLodDist|Расстояние для низкого уровня детализации|float|-1|-1||
r_mediumLodDist|Расстояние для среднего уровня детализации|float|-1|-1||
r_mode|Режим разрешения Direct X|enum||||
r_modelVertColor|Установите 0, чтобы заменить все вершинные цвета моделей на белый при загрузке|bool|true|||
r_monitor|Индекс монитора для использования в многомониторной системе; 0 выбирает автоматически.|int|0|0|8|
r_multiGpu|Использовать несколько GPU|bool|false|||
r_norefresh|Пропускает всю отрисовку. Полезно для бенчмаркинга.|bool|false|||
r_normal|Позволяет шейдерам использовать карты нормалей|bool|true|||
r_normalMap|Заменить все карты нормалей на плоскую карту нормалей|enum|1|0|1|Flat,Unchanged
r_outdoor|Не даёт снегу идти в помещении|bool|true|||
r_outdoorAwayBias|Влияет на выборку карты высот, чтобы снег не шёл в помещении|float|32|||
r_outdoorDownBias|Влияет на выборку карты высот, чтобы снег не шёл в помещении|float|0|||
r_outdoorFeather|Значение z-перьев для открытого пространства|float|8|||
r_picmip|Уровень picmip для цветовых карт. Если r_picmip_manual равен 0, это только для чтения.|int|0|0|3|
r_picmip_bump|Уровень picmip для карт нормалей. Если r_picmip_manual равен 0, это только для чтения.|int|0|0|3|
r_picmip_manual|Если 0, picmip устанавливается автоматически. Если 1, picmip устанавливается на основе других дваров r_picmip.|bool|false|||
r_picmip_spec|Уровень picmip для карт зеркальности. Если r_picmip_manual равен 0, это только для чтения.|int|0|0|3|
r_picmip_water|Уровень picmip для карт воды.|int|0|0|1|
r_polygonOffsetBias|Смещение для полигонов декалей; большие значения меньше z-fight, но сильнее пробивают стены|float|-1|-16|0|
r_polygonOffsetScale|Масштаб смещения для полигонов декалей; большие значения меньше z-fight, но сильнее пробивают стены|float|-1|-4|0|
r_portalBevels|Помогает отсекать геометрию по углам порталов, которые острые при проецировании на экран; значение — косинус угла|float|0.7|0|1|
r_portalBevelsOnly|Использовать ограничивающую рамку порталов в экранном пространстве вместо фактической формы портала, проецируемой на экран|bool|false|||
r_portalMinClipArea|Не отсекать дочерние порталы родительским порталом меньше этой доли площади экрана.|float|0.02|0|1|
r_portalMinRecurseDepth|Игнорировать r_portalMinClipArea для порталов с меньшим числом родительских порталов.|int|2|0|100|
r_portalWalkLimit|Остановить рекурсию порталов после этого числа итераций. Полезно для отладки ошибок порталов.|int|0|0|100|
r_preloadShaders|Заставить D3D нарисовать фиктивную геометрию всеми шейдерами во время загрузки уровня; может исправить длинные паузы в начале уровня.|bool|false|||
r_pretess|Пакетировать поверхности для уменьшения числа примитивов|bool|true|||
r_reflectionProbeGenerate|Генерировать кубические карты для зондов отражения.|bool|false|||
r_reflectionProbeGenerateExit|Выйти после генерации кубических карт отражения.|bool|false|||
r_reflectionProbeRegenerateAll|Перегенерировать кубические карты для всех зондов отражения.|bool|false|||
r_rendererInUse|Текущий используемый рендерер|enum|2|0|2|Shader Model 2.0,Shader Model 3.0,Default
r_rendererPreference|Предпочитаемый рендерер; неподдерживаемые рендереры никогда не будут использоваться.|enum|2|0|2|Shader Model 2.0,Shader Model 3.0,Default
r_resampleScene|Масштабировать кадровый буфер с помощью фильтра повышения резкости и цветокоррекции.|bool|true|||
r_scaleViewport|Масштабировать 3D-вьюпорты на эту долю. Используйте, чтобы проверить, ограничена ли частота кадров пиксельным шейдером.|float|1|0|1|
r_showFbColorDebug|Показывать отладочную информацию о цвете фронтального буфера|enum|0|0|2|None,Screen,Feedback
r_showFloatZDebug|Показывать float z-буфер, используемый для устранения жёстких краёв у частиц рядом с геометрией|bool|false|||
r_showLightGrid|Показывать отладочную информацию о сетке света|bool|false|||
r_showMissingLightGrid|Использовать радужные цвета для сущностей за пределами сетки света|bool|true|||
r_showPixelCost|Показывает, насколько дорого рисовать каждый пиксель на экране|enum|0|0|3|off,timing,use depth,ignore depth
r_showPortals|Показывать порталы для отладки|int|0|0|3|
r_singleCell|Рисовать только то, что в той же ячейке, что и камера. Полезно для оценки размера текущей ячейки.|bool|false|||
r_skinCache|Включить кэш вершин анимированных моделей|bool|true|||
r_skipPvs|Пропустить определение того, что входит в потенциально видимый набор (отключает большую часть отрисовки)|bool|false|||
r_smc_enable|Включить кэш статических моделей|bool|true|||
r_smp_backend|Обрабатывать бэкенд рендерера в отдельном потоке|bool|true|||
r_smp_worker|Обрабатывать фронтенд рендерера в отдельном потоке|bool|true|||
r_specular|Позволяет шейдерам использовать зеркальное освещение по Фонгу|bool|true|||
r_specularColorScale|Установите больше 1, чтобы усилить зеркальные блики|float|1|0|100|
r_specularMap|Заменить все карты зеркальности на чисто чёрный (выкл.) или чисто белый (супер-блестящий)|enum|1|0|3|Black,Unchanged,White,Gray
r_spotLightBrightness|Масштаб яркости прожектора для получения перeяркости из диапазона цвета частиц 0–1.|float|14|0|16|
r_spotLightEndRadius|Радиус круга в конце прожектора в дюймах.|float|196|1|1200|
r_spotLightEntityShadows|Включить тени сущностей для прожекторов.|bool|true|||
r_spotLightFovInnerFraction|Относительный внутренний угол FOV для динамического прожектора. 0 — полное затухание, 0.99 — почти без затухания.|float|0.7|0|0.99|
r_spotLightShadows|Включить тени для прожекторов.|bool|true|||
r_spotLightSModelShadows|Включить тени статических моделей для прожекторов.|bool|true|||
r_spotLightStartRadius|Радиус круга в начале прожектора в дюймах.|float|36|0|1200|
r_sse_skinning|Использовать Streaming SIMD Extensions для скиннингования|bool|true|||
r_sun_from_dvars|Устанавливать значения солнечного блика из дваров, а не из уровня|bool|false|||
r_sun_fx_position|Позиция в градусах эффекта солнца|vec3|0 0 0|-360|360|
r_sunblind_fadein|время в секундах для нарастания ослепления с 0% до 100%|float|0.5|0|60|
r_sunblind_fadeout|время в секундах для затухания ослепления с 100% до 0%|float|3|0|60|
r_sunblind_max_angle|угол от солнца в градусах, внутри которого ослепление максимально|float|5|0|90|
r_sunblind_max_darken|доля 0–1 того, насколько чёрным становится мир при максимальном ослеплении|float|0.75|0|1|
r_sunblind_min_angle|угол от солнца в градусах, вне которого ослепление равно 0|float|30|0|90|
r_sunflare_fadein|время в секундах для нарастания альфы с 0% до 100%|float|1|0|60|
r_sunflare_fadeout|время в секундах для затухания альфы с 100% до 0%|float|1|0|60|
r_sunflare_max_alpha|вершинный цвет и альфа солнца 0–1 при максимальном эффекте|float|1|0|1|
r_sunflare_max_angle|угол от солнца в градусах, внутри которого эффект максимален|float|2|0|90|
r_sunflare_max_size|наибольший размер эффекта блика в пикселях при 640x480|float|2500|0|10000|
r_sunflare_min_angle|угол от солнца в градусах, вне которого эффект равен 0|float|45|0|90|
r_sunflare_min_size|наименьший размер эффекта блика в пикселях при 640x480|float|0|0|10000|
r_sunflare_shader|имя для эффекта блика; может быть любым материалом|string|sun_flare|||
r_sunglare_fadein|время в секундах для нарастания блика с 0% до 100%|float|0.5|0|60|
r_sunglare_fadeout|время в секундах для затухания блика с 100% до 0%|float|3|0|60|
r_sunglare_max_angle|угол от солнца в градусах, внутри которого блик минимален|float|5|0|90|
r_sunglare_max_lighten|доля 0–1 того, насколько белым становится мир при максимальном блике|float|0.75|0|1|
r_sunglare_min_angle|угол от солнца в градусах, внутри которого блик максимален|float|30|0|90|
r_sunsprite_shader|имя для статичного спрайта; может быть любым материалом|string|sun|||
r_sunsprite_size|диаметр в пикселях при 640x480 и 80 fov|float|16|1|1000|
r_texFilterAnisoMax|Максимальная анизотропия для фильтрации текстур|int|16|1|16|
r_texFilterAnisoMin|Минимальная анизотропия для фильтрации текстур (переопределяется максимумом)|int|1|1|16|
r_texFilterDisable|Отключает всю фильтрацию текстур (использует только nearest.)|bool|false|||
r_texFilterMipBias|Изменяет смещение мипмапа|float|0|-16|15.99|
r_texFilterMipMode|Заставляет все мипмапы использовать определённое смешивание между уровнями (или отключает миппинг.)|enum|0|0|3|Unchanged,Force Trilinear,Force Bilinear,Force MipMaps Off
r_useLayeredMaterials|Установите true, чтобы использовать слоистые материалы на оборудовании с шейдерной моделью 3|bool|false|||
r_vc_compile||||||
r_vc_makelog|Включить журналирование точек сетки света для vis-кэша. 1 начинает с нуля, 2 добавляет.|int|0|0|2|
r_vc_showlog|Показывать это число строк точек сетки света для vis-кэша|int|0|0|1024|
r_vsync|Включить v-sync перед отрисовкой следующего кадра, чтобы избежать артефактов «разрыва».|bool|true|||
r_warningRepeatDelay|Число секунд после показа предупреждения «на кадр» до его повторного показа|float|5|0|30|
r_zfar|Изменить расстояние, на котором отсекающий туман достигает 100% непрозрачности; 0 — выключено|float|0|0||
r_zFeather|Включить z-перья (исправляет врезание частиц в геометрию)|bool|true|||
r_znear|Объекты ближе этого не рисуются. Уменьшение увеличивает z-fighting вдали.|float|4|0.001|10000|
r_znear_depthhack|Ближняя плоскость отсечения для модели оружия от первого лица|float|0.1|0.001|16|
radius_damage_debug|Включить отладочные линии для трассировок радиального урона|bool|false|||
ragdoll_baselerp_time|Время по умолчанию, за которое базовые кости ragdoll достигают базовой позы|int|1000|100|6000|
ragdoll_bullet_force|Сила пули, применяемая к ragdoll|float|500|0|10000|
ragdoll_bullet_upbias|Смещение вверх, применяемое к эффектам пуль на ragdoll|float|0.5|0|10000|
ragdoll_debug|Рисовать отладочную информацию ragdoll (битовые флаги)|int|0|0||
ragdoll_dump_anims|Выгружать данные анимаций при сбое ragdoll|bool|false|||
ragdoll_enable|Включить анимации смерти ragdoll|bool|true|||
ragdoll_explode_force|Сила взрыва, применяемая к ragdoll|float|18000|0|60000|
ragdoll_explode_upbias|Смещение вверх, применяемое к эффектам взрыва на ragdoll|float|0.8|0|2|
ragdoll_fps|Частота обновления ragdoll в кадрах в секунду|int|20|0|100|
ragdoll_jitter_scale|Увеличить или уменьшить эффект физического дрожания на ragdoll|float|1|0|10|
ragdoll_jointlerp_time|Время по умолчанию для lerp-снижения трения соединений ragdoll|int|3000|100|6000|
ragdoll_max_life|Максимальное время жизни системы ragdoll в мс|int|4500|0||
ragdoll_max_simulating|Максимальное число одновременно активных ragdoll|int|16|0|32|
ragdoll_rotvel_scale|Масштаб оценки угловой скорости ragdoll|float|1|0|2000|
ragdoll_self_collision_scale|Масштаб размера коллизионных капсул, используемых для предотвращения взаимопроникновения конечностей ragdoll|float|1.2|0.1|10|
rate|Предпочитаемая скорость передачи игрока|int|25000|1000|25000|
rcon_password|Пароль для команды rcon|string||||
sc_blur|Включить размытие теневых куки|int|2|0|4|
sc_count|Число теневых куки|int|24|0|24|
sc_debugCasterCount|Показывать отладочную информацию о числе отбрасывающих теневые куки|int|24|0|24|
sc_debugReceiverCount|Показывать отладочную информацию о числе принимающих теневые куки|int|24|0|24|
sc_enable|Включить теневые куки|bool|false|||
sc_fadeRange|Диапазон затухания теневых куки|float|0.25|0|1|
sc_length|Длина теневых куки|float|400|1|2000|
sc_offscreenCasterLodBias|Смещение уровня детализации заэкранного отбрасывающего теневые куки|float|0|||
sc_offscreenCasterLodScale|Масштаб уровня детализации заэкранного отбрасывающего теневые куки|float|20|0||
sc_shadowInRate|Скорость, с которой горизонт теневых куки движется внутрь|float|2|0|20|
sc_shadowOutRate|Скорость, с которой горизонт теневых куки движется наружу|float|5|0|20|
sc_showDebug|Показывать отладочную информацию о теневых куки|bool|false|||
sc_showOverlay|Показывать теневой оверлей для теневых куки|bool|false|||
sc_wantCount|Желаемое число теней|int|12|0|24|
sc_wantCountMargin|Допустимая погрешность числа желаемых теней|int|1|0|24|
scr_%s_roundlimit||||||
scr_%s_scorelimit||||||
scr_friendlyfire||||||
scr_game_allowkillcam||||||
scr_hardcore||||||
scr_oldschool||||||
scr_team_fftype||||||
sensitivity|Чувствительность мыши|float|5|0.01|100|
server1|Отображение сервера|string||||
server10|Отображение сервера|string||||
server11|Отображение сервера|string||||
server12|Отображение сервера|string||||
server13|Отображение сервера|string||||
server14|Отображение сервера|string||||
server15|Отображение сервера|string||||
server16|Отображение сервера|string||||
server2|Отображение сервера|string||||
server3|Отображение сервера|string||||
server4|Отображение сервера|string||||
server5|Отображение сервера|string||||
server6|Отображение сервера|string||||
server7|Отображение сервера|string||||
server8|Отображение сервера|string||||
server9|Отображение сервера|string||||
shortversion|Короткая версия игры|string|1.0|||
showdrop|Показывать потерянные пакеты|bool|false|||
showpackets|Показывать пакеты|int|0|0|2|
sm_enable|Включить карты теней|bool|true|||
sm_fastSunShadow|Быстрая тень солнца|bool|true|||
sm_lightScore_eyeProjectDist|При выборе теней для первичных источников света измерять расстояние от точки на таком расстоянии перед камерой.|float|64|0|1024|
sm_lightScore_spotProjectFrac|При выборе теней для первичных источников света измерять расстояние до точки на этой доле радиуса источника вдоль его теневого направления.|float|0.125|0|1|
sm_maxLights|Ограничивает число первичных источников света, которые могут иметь карты теней|int|4|0|4|
sm_polygonOffsetBias|Смещение карты теней|float|0.5|0|32|
sm_polygonOffsetScale|Масштаб смещения карты теней|float|2|0|8|
sm_qualitySpotShadow|Быстрая тень прожектора|bool|true|||
sm_spotEnable|Включить карту теней прожектора из скрипта|bool|true|||
sm_spotShadowFadeTime|Сколько секунд занимает появление или исчезновение карты теней первичного источника света|float|1|0.01|5|
sm_strictCull|Строгое отсечение карты теней|bool|true|||
sm_sunEnable|Включить карту теней солнца из скрипта|bool|true|||
sm_sunSampleSizeNear|Размер выборки тени|float|0.25|0.0625|32|
sm_sunShadowCenter|Центр тени солнца; 0 0 0 означает не переопределять|vec3|0 0 0|||
sm_sunShadowScale|Оптимизация масштаба тени солнца|float|1|0.25|1|
snaps|Частота снимков|int|20|1|30|
snd_cinematicVolumeScale|Масштабирует громкость Bink-видео.|float|0.85|0|1|
snd_draw3D|Рисовать позицию и информацию мировых звуков|enum|0|0|3|Off,Targets,Names,Verbose
snd_drawInfo|Рисовать отладочную информацию о звуках|enum|0|0|3|None,3D,Stream,2D
snd_enable2D|Включить 2D-звуки|bool|true|||
snd_enable3D|Включить 3D-звуки|bool|true|||
snd_enableEq|Включить эквалайзер|bool|false|||
snd_enableReverb|Включить реверберацию звука|bool|true|||
snd_enableStream|Включить потоковые звуки|bool|true|||
snd_errorOnMissing|Вызывать Com_Error при отсутствии звукового файла.|bool|false|||
snd_khz|Частота игрового звука.|int|44|11|44|
snd_levelFadeTime|Время в миллисекундах для нарастания всего звука в начале уровня|int|250|0|5000|
snd_outputConfiguration|Конфигурация звукового вывода|enum|0|0|4|Windows default,Mono,Stereo,4 speakers,5.1 speakers
snd_slaveFadeTime|Время в миллисекундах для затухания громкости «ведомого» звука, когда ведущий звук начинается или останавливается|int|500|0|5000|
snd_touchStreamFilesOnLoad|Проверять наличие потоковых звуковых файлов при загрузке|bool|false|||
snd_volume|Общая громкость игрового звука|float|0.8|0|1|
stat_version|Номер версии статистики|int|10|0|255|
stopspeed|Замедление игрока|float|100|0|1000|
sv_allowAnonymous|Разрешить анонимный доступ|bool|false|||
sv_allowDownload|Разрешить автоматическую загрузку файлов|bool|true|||
sv_allowedClan1|Разрешить этому клану присоединяться к серверу|string||||
sv_allowedClan2|Разрешить этому клану присоединяться к серверу|string||||
sv_botsPressAttackBtn|Разрешить тестовым клиентам нажимать кнопку атаки|bool|true|||
sv_cheats|Включить читы|bool|true|||
sv_clientArchive|Клиенты архивируют данные для экономии трафика сервера|bool|true|||
sv_clientSideBullets|Если true, клиенты синтезируют трассеры и попадания пуль|bool|true|||
sv_connectTimeout|секунд без сообщений, пока клиент загружается|int|45|0|1800|
sv_debugRate|Включить отладочную информацию о частоте снимков|bool|false|||
sv_debugReliableCmds|Включить отладочную информацию для «надёжных» команд|bool|false|||
sv_disableClientConsole|Запретить удалённым клиентам доступ к консоли|bool|false|||
sv_FFCheckSums|Контрольные суммы Fast File сервера|string||||
sv_FFNames|Имена Fast File, используемых сервером|string||||
sv_floodprotect|Предотвращает злонамеренные лаги путём заваливания сервера командами. Это число клиентских команд, которые сервер обработает за 800 мс. 0 означает отсутствие защиты от флуда.|||||
sv_fps|Кадры сервера в секунду|int|20|10|1000|
sv_hostname|Имя хоста сервера|string|CoD4Host|||
sv_iwdNames|Имена IWD-файлов, используемых сервером|string||||
sv_iwds|Контрольные суммы IWD сервера|string||||
sv_keywords|Ключевые слова сервера|string||||
sv_kickBanTime|Время в секундах, на которое игрок будет забанен на сервере после кика|float|300|0|3600|
sv_mapname|Текущее имя карты|string||||
sv_mapRotation|Список карт для игры на сервере|string||||
sv_mapRotationCurrent|Текущая карта в ротации карт|string||||
sv_maxclients|Максимальное число клиентов, которые могут подключиться к серверу|int|32|||
sv_maxPing|Максимальный пинг, разрешённый на сервере|int|0|0|999|
sv_maxRate|Максимальная скорость передачи|int|5000|0|25000|
sv_minPing|Минимальный пинг, разрешённый на сервере|int|0|0|999|
sv_packet_info|Включить отладочную информацию о пакетах|bool|false|||
sv_padPackets|добавлять nop-байты к сообщениям|int|0|0||
sv_paused|Пауза сервера|int|0|0|2|
sv_privateClients|Максимальное число приватных клиентов, разрешённых на сервере|int|0|0|64|
sv_privatePassword|пароль для слотов privateClient|string||||
sv_punkbuster|Включить PunkBuster на этом сервере|bool|true|||
sv_pure|Нельзя использовать изменённые IWD-файлы|bool|false|||
sv_reconnectlimit|минимальное число секунд между сообщениями о подключении|int|3|0|1800|
sv_referencedFFCheckSums|Контрольная сумма всех используемых Fast File|string||||
sv_referencedFFNames|Имена всех используемых Fast File|string||||
sv_referencedIwdNames|Имена всех используемых IWD-файлов|string||||
sv_referencedIwds|Контрольная сумма всех используемых IWD-файлов|string||||
sv_running|Сервер запущен|bool|false|||
sv_serverId||||||
sv_serverid|Идентификация сервера|int|0|||
sv_showAverageBPS|Показывать средние байты в секунду для отладки сети|bool|false|||
sv_showCommands|Выводить клиентские команды в файл журнала|bool|false|||
sv_timeout|секунд без каких-либо сообщений|int|240|0|1800|
sv_voice|Использовать серверную голосовую связь|bool|false|||
sv_voiceQuality|Качество голоса|int|3|0|9|
sv_wwwBaseURL|Базовый URL для файлов, загружаемых по http|string||||
sv_wwwDlDisconnected|Должны ли клиенты оставаться подключёнными во время загрузки?|bool|false|||
sv_wwwDownload|Включить http-загрузки|bool|false|||
sv_zombietime|секунд для синхронизации сообщений после отключения|int|2|0|1800|
sys_configSum|Контрольная сумма конфигурации|int|0|||
sys_configureGHz|Нормализованная общая мощность CPU на основе типа, числа и скорости; используется в автонастройке|float|0|||
sys_cpuGHz|Измеренная скорость CPU|float||||
sys_cpuName|Описание имени CPU|string||||
sys_gpu|Описание GPU|string|""|||
sys_lockThreads|Запрещает указанным потокам менять CPU; улучшает профилирование и может исправить некоторые баги, но может снизить производительность|enum|0|0|2|none,minimal,all
sys_smp_allowed|Разрешить многопоточность|bool|false|||
sys_SSE|Операционная система поддерживает Streaming SIMD Extensions|bool|false|||
sys_sysMB|Физическая память в системе|int|0|||
timescale|Масштаб времени каждого кадра|float|1|0.001|1000|
ui_allow_classchange|Должен ли UI разрешать смену класса|bool|false|||
ui_allow_teamchange|Должен ли UI разрешать смену команды|bool|false|||
ui_bigFont|Масштаб большого шрифта|float|0.4|0|1|
ui_borderLowLightScale|Масштабирует цвет рамки для цвета низкого освещения на некоторых границах UI|float|0.6|0|1|
ui_browserFriendlyfire|Огонь по своим активен|int|-1|||
ui_browserHardcore|Режим hardcore|||||
ui_browserKillcam|Камера убийства активна|int|-1|||
ui_browserMod|Значение UI Mod|int|0|-1|1|
ui_browserOldSchool|Режим oldschool|||||
ui_browserShowDedicated|Показывать только выделенные серверы|bool|false|||
ui_browserShowEmpty|Показывать пустые серверы|bool|true|||
ui_browserShowFull|Показывать полные серверы|bool|true|||
ui_browserShowPassword|Показывать серверы, защищённые паролем|int|-1|-1|1|
ui_browserShowPunkBuster|Показывать только серверы с PunkBuster?|int|-1|||
ui_browserShowPure|Показывать только чистые серверы|bool|true|||
ui_buildLocation|Где рисовать номер сборки|vec2|-100 52|-10000|10000|
ui_buildSize|Размер шрифта для номера сборки|float|0.3|0|1|
ui_cinematicsTimestamp|Показывает метку времени роликов на элементах UI субтитров.|bool|false|||
ui_connectScreenTextGlowColor|Цвет свечения, применяемый к строкам режима и имени карты на экране подключения.|vec4|0.3 0.6 0.3 1|0|1|
ui_currentMap|Индекс текущей карты|int|0|0||
ui_currentNetMap|Текущая запущенная карта|int|0|0||
ui_customClassName|Имя кастомного класса|string||||
ui_customModeEditName|Имя, которое нужно присвоить редактируемому кастомному игровому режиму по завершении редактирования|string||||
ui_customModeName|Имя кастомного игрового режима|string||||
ui_dedicated|Истина, если это выделенный сервер|int|0|0|2|
ui_drawCrosshair|Рисовать ли прицелы.|bool|true|||
ui_extraBigFont|Масштаб очень большого шрифта|float|0.55|0|1|
ui_gametype|Тип игры|int|3|0||
ui_hud_hardcore|Должен ли HUD подавляться для режима hardcore|bool|false|||
ui_joinGametype|Тип присоединения к игре|int|0|0||
ui_language||||||
ui_languagechanged|Внешний Dvar|||||
ui_lastServerRefresh_%i||||||
ui_maxclients|Максимальное число клиентов, которые могут подключиться к серверу|||||
ui_multiplayer|Истина, если игра многопользовательская|bool|true|||
ui_Name||||||
ui_netGametype|Тип игры|int|0|||
ui_netGametypeName|Отображаемое имя типа игры|string||||
ui_netSource|Сетевой источник, где: 0 — локальный, 1 — интернет, 2 — избранное|int|1|0|2|
ui_playerProfileAlreadyChosen|true, если профиль игрока уже выбран.|int|0|0|1|
ui_playerProfileCount|Число профилей игрока|int|0|||
ui_playerProfileNameNew|Имя нового профиля игрока|string||||
ui_playerProfileSelected|Имя выбранного профиля игрока|string||||
ui_serverStatusTimeOut|Время в миллисекундах до тайм-аута запроса статуса сервера|int|7000|0||
ui_showEndOfGame|Сейчас показывается меню конца игры.|bool|false|||
ui_showList|Показывать экранный список текущих видимых меню|bool|false|||
ui_showMenuOnly|Если задано, будут рисоваться только меню с этим именем.|string||||
ui_smallFont|Масштаб маленького шрифта|float|0.25|0|1|
ui_uav_allies|Должен ли UI показывать UAV союзникам|bool|false|||
ui_uav_axis|Должен ли UI показывать UAV оси|bool|false|||
ui_uav_client|Должен ли UI показывать UAV этому клиенту|bool|false|||
uiscript_debug|спам отладочной информации для ui-скрипта|int|0|0|2|
useFastFile|Включает загрузку данных из fast-файлов. Только инструменты могут работать без fast-файлов.|bool|true|||
vehDebugClient|Включить отладочную информацию для транспортных средств|bool|false|||
vehDebugServer|Включить отладочную информацию для транспортных средств|bool|false|||
vehDriverViewDist|Как далеко обзор водителя от точки фокуса|float|300|1|1000|
vehDriverViewFocusRange|Как далеко фокус обзора водителя перемещается по вертикали|float|50|0|1000|
vehDriverViewHeightMax|Максимальная высота орбиты для обзора водителя|float|50|-80|80|
vehDriverViewHeightMin|Минимальная высота орбиты для обзора водителя|float|-15|-80|80|
vehHelicopterDecelerationFwd|Задаёт замедление вертолёта игрока (как долю ускорения) в направлении, куда смотрит вертолёт. Так 1.0 делает его равным ускорению.|float|0.5|0||
vehHelicopterDecelerationSide|Задаёт боковое замедление вертолёта игрока (как долю ускорения). Так 1.0 делает его равным ускорению.|float|1|0||
vehHelicopterHeadSwayDontSwayTheTurret|Если задано, турель не будет стрелять через прицел, а прямо перед транспортом, когда игрок не свободно смотрит.|bool|true|||
vehHelicopterHoverSpeedThreshold|Скорость, ниже которой вертолёт игрока начинает дрожать наклоном для зависания|float|400|0.01||
vehHelicopterInvertUpDown|Инвертировать управление высотой на вертолёте игрока.|bool|false|||
vehHelicopterJitterJerkyness|Задаёт, насколько резким должно быть дрожание наклона|float|0.3|0.0001||
vehHelicopterLookaheadTime|Насколько вперёд (в секундах) смотрит вертолёт игрока, чтобы избежать жёстких столкновений. (Как при езде по шоссе, следует держать 2 секунды дистанции до впереди идущего транспорта)|float|1|0.01||
vehHelicopterMaxAccel|Максимальное горизонтальное ускорение вертолёта игрока (в MPH в секунду)|float|45|0.01||
vehHelicopterMaxAccelVertical|Максимальное вертикальное ускорение вертолёта игрока (в MPH в секунду)|float|30|0.01||
vehHelicopterMaxPitch|Максимальный тангаж вертолёта игрока|float|35|0.01||
vehHelicopterMaxRoll|Максимальный крен вертолёта игрока|float|35|0.01||
vehHelicopterMaxSpeed|Максимальная горизонтальная скорость вертолёта игрока (в MPH)|float|150|0.01||
vehHelicopterMaxSpeedVertical|Максимальная вертикальная скорость вертолёта игрока (в MPH)|float|65|0.01||
vehHelicopterMaxYawAccel|Максимальное ускорение рыскания вертолёта игрока|float|90|0.01||
vehHelicopterMaxYawRate|Максимальная скорость рыскания вертолёта игрока|float|120|0.01||
vehHelicopterRightStickDeadzone|Мёртвая зона для осей правого стика. Помогает лучше управлять двумя осями раздельно.|float|0.3|0.01|1|
vehHelicopterScaleMovement|Уменьшает меньшую из осей левого стика.|bool|true|||
vehHelicopterSoftCollisions|У вертолётов игрока мягкие столкновения (замедляются перед столкновением).|bool|false|||
vehHelicopterStrafeDeadzone|Мёртвая зона, чтобы можно было легко лететь прямо вперёд, случайно не стрейфя (и, следовательно, не кренясь).|float|0.3|0.01|1|
vehHelicopterTiltFromAcceleration|Величина наклона, вызванного ускорением|float|2|0.01||
vehHelicopterTiltFromControllerAxes|Величина наклона, вызванного желаемой скоростью (т.е. величиной отклонения стика контроллера)|float|0|0||
vehHelicopterTiltFromDeceleration|Величина наклона, вызванного замедлением|float|2|0||
vehHelicopterTiltFromFwdAndYaw|Величина крена, вызванного рысканием во время движения вперёд.|float|0|0||
vehHelicopterTiltFromFwdAndYaw_VelAtMaxTilt|Скорость вперёд (как доля максимальной скорости), при которой наклон из-за рыскания достигает максимального значения.|float|1|0||
vehHelicopterTiltFromVelocity|Величина наклона, вызванного текущей скоростью|float|1|0||
vehHelicopterTiltMomentum|Величина вращательного импульса вертолёта в отношении наклона.|float|0.4|0.0001||
vehHelicopterTiltSpeed|Скорость, с которой реагирует наклон вертолёта игрока|float|1.2|0.01||
vehHelicopterYawOnLeftStick|Скорость рыскания, создаваемая левым стиком при диагональном нажатии (например, движение вперёд с лёгким стрейфом).|float|5|0||
vehTestHorsepower||float|200|0||
vehTestMaxMPH||float|40|0||
vehTestWeight||float|5200|0||
vehTextureScrollScale|Масштабировать прокрутку текстуры транспорта на эту величину (только для отладки)|float|0|0||
version|Версия игры|string|""|||
vid_xpos|Горизонтальное положение игрового окна|int|3|-4096|4096|
vid_ypos|вертикальное положение игрового окна|int|22|-4096|4096|
voice_deadChat|Разрешить мёртвым игрокам говорить с живыми|bool|false|||
voice_global|Отправлять голосовые сообщения всем|bool|false|||
voice_localEcho|Возвращать голосовой чат обратно игроку|bool|false|||
waypointDebugDraw|Событие %s (%i)|bool|false|||
waypointDistScaleRangeMax|Расстояние от игрока, на котором заканчивается масштабирование значка по расстоянию.|float|3000|0||
waypointDistScaleRangeMin|Расстояние от игрока, на котором начинается масштабирование значка по расстоянию.|float|1000|0||
waypointDistScaleSmallest|Наименьший масштаб, используемый эффектом расстояния.|float|0.8|0||
waypointIconHeight|Высота заэкранного указателя.|float|36|1.17549e-38||
waypointIconWidth|Ширина заэкранного указателя.|float|36|1.17549e-38||
waypointOffscreenCornerRadius|Размер закруглённых углов.|float|105|0||
waypointOffscreenDistanceThresholdAlpha|Расстояние от порога, свыше которого заэкранные значки цели интерполируют свою альфу.|float|30|0||
waypointOffscreenPadBottom|Смещение от края.|float|30|0||
waypointOffscreenPadLeft|Смещение от края.|float|103|0||
waypointOffscreenPadRight|Смещение от края.|float|0|0||
waypointOffscreenPadTop|Смещение от края.|float|0|0||
waypointOffscreenPointerDistance|Расстояние от центра заэкранного значка цели до центра его стрелки.|float|30|1.17549e-38||
waypointOffscreenPointerHeight|Высота заэкранного указателя.|float|12|1.17549e-38||
waypointOffscreenPointerWidth|Ширина заэкранного указателя.|float|25|1.17549e-38||
waypointOffscreenRoundedCorners|Заэкранные значки имеют закруглённые углы при true. Прямые углы при false.|bool|true|||
waypointOffscreenScaleLength|Насколько далеко масштаб заэкранного значка проходит от полного до наименьшего.|float|500|1.17549e-38||
waypointOffscreenScaleSmallest|Наименьший масштаб, используемый заэкранным эффектом.|float|1|0||
waypointPlayerOffsetCrouch|Для указателей на игроков, насколько высоко смещать от их начала, когда они в приседе.|float|56|0||
waypointPlayerOffsetProne|Для указателей на игроков, насколько высоко смещать от их начала, когда они лежат.|float|30|0||
waypointPlayerOffsetStand|Для указателей на игроков, насколько высоко смещать от их начала, когда они стоят.|float|74|0||
waypointSplitscreenScale|Масштаб, применяемый к значкам указателей в режиме разделённого экрана.|float|1.8|0.1||
waypointTweakY||float|-17|||
wideScreen|Истина, если игровое видео работает в формате 16x9, ложь — если 4x3.|bool|true|||
winvoice_mic_mute|Отключить микрофон|bool|true|||
winvoice_mic_reclevel|Уровень записи микрофона|float|65535|0|65535|
winvoice_mic_scaler|Значение масштабирования микрофона|float|1|0.25|2|
winvoice_save_voice|Записывать голосовые данные в файл|bool|false|||
`;

	function escapeHtml(text)
	{
		return String(text).replace(/[&<>"']/g, function (ch) { return HTML_ESCAPES[ch]; });
	}

	function parseTable()
	{
		var lines = DVAR_TABLE.split("\n");

		for (var i = 0; i < lines.length; i++)
		{
			if (lines[i] === "")
			{
				continue;
			}

			var f = lines[i].split("|");

			var values = f[6] ? f[6].split(",") : [];

			entries.push({
				name: f[0],
				desc: f[1] || "",
				type: f[2] || "",
				def: f[3] || "",
				min: f[4] || "",
				max: f[5] || "",
				values: values,
				haystack: (f[0] + " " + (f[1] || "") + " " + (f[6] || "")).toLowerCase()
			});
		}
	}

	// Тип, значение по умолчанию и диапазон — то, что удалось получить из
	// исходников. Диапазон с одним концом означает, что другой конец неограничен.
	function metaHtml(entry)
	{
		var parts = [];

		if (entry.type !== "")
		{
			parts.push('<span class="dv-type">' + escapeHtml(entry.type) + "</span>");
		}

		if (entry.def !== "")
		{
			// Для enum значение по умолчанию — это индекс, поэтому называем его.
			var named = entry.values[Number(entry.def)];
			parts.push("по умолчанию <b>" + escapeHtml(entry.def) + "</b>" +
				(named === undefined ? "" : " (" + escapeHtml(named) + ")"));
		}

		if (entry.min !== "" && entry.max !== "")
		{
			parts.push("диапазон <b>" + escapeHtml(entry.min) + "</b>–<b>" + escapeHtml(entry.max) + "</b>");
		}
		else if (entry.min !== "")
		{
			parts.push("мин. <b>" + escapeHtml(entry.min) + "</b>");
		}
		else if (entry.max !== "")
		{
			parts.push("макс. <b>" + escapeHtml(entry.max) + "</b>");
		}

		var html = parts.length === 0 ? "" : '<p class="dv-meta">' + parts.join(" &middot; ") + "</p>";

		if (entry.values.length > 0)
		{
			var list = [];
			for (var i = 0; i < entry.values.length; i++)
			{
				list.push("<b>" + i + "</b> " + escapeHtml(entry.values[i]));
			}
			html += '<p class="dv-meta dv-values">' + list.join(" &middot; ") + "</p>";
		}

		return html;
	}

	function render()
	{
		var html = [];

		for (var i = 0; i < entries.length; i++)
		{
			html.push('<div class="dv-row"><code class="dv-name">' + escapeHtml(entries[i].name) +
				'</code><div class="dv-body"><p class="dv-desc">' +
				(entries[i].desc === "" ? "&mdash;" : escapeHtml(entries[i].desc)) +
				"</p>" + metaHtml(entries[i]) + "</div></div>");
		}

		listBox.innerHTML = html.join("");
		rows = listBox.querySelectorAll(".dv-row");
	}

	function setCount(shown)
	{
		if (countBox === null)
		{
			return;
		}

		countBox.textContent = shown === entries.length
			? entries.length + " дваров"
			: shown + " из " + entries.length + " дваров";
	}

	// Строки только скрываются и показываются, но никогда не перестраиваются,
	// поэтому ввод остаётся быстрым даже с 1196 записями.
	function applyFilter()
	{
		var query = searchBox === null ? "" : searchBox.value.trim().toLowerCase();
		var shown = 0;

		for (var i = 0; i < rows.length; i++)
		{
			var match = query === "" || entries[i].haystack.indexOf(query) !== -1;
			rows[i].hidden = !match;
			if (match)
			{
				shown++;
			}
		}

		setCount(shown);

		if (emptyBox !== null)
		{
			emptyBox.hidden = shown !== 0;
			if (shown === 0)
			{
				emptyBox.textContent = 'Ни один dvar не соответствует "' + query + '".';
			}
		}
	}

	function init()
	{
		listBox = document.getElementById("dv-list");
		searchBox = document.getElementById("dv-search");
		countBox = document.getElementById("dv-count");
		emptyBox = document.getElementById("dv-empty");

		if (listBox === null)
		{
			return;
		}

		parseTable();
		render();
		setCount(entries.length);

		if (searchBox !== null)
		{
			searchBox.addEventListener("input", applyFilter);
			searchBox.addEventListener("search", applyFilter);
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
})();