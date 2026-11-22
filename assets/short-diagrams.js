(() => {
    const latest = document.querySelector("#latest-short-diagrams");
    const archive = document.querySelector("#short-diagram-archive");
    if (!latest && !archive) return;
    const status = document.querySelector("#short-diagram-status");
    // 2026-11-19: 12月から4枠（7時・12時・19時・21時）。同じ日の中はこの順に並べる
    const slots = ["am", "noon", "evening", "night"];
    // 2026-11-22 本人決定: 12月からは週1つの薬を角度で分けた呼び名を出す。11月分は中身が薬の話ではないため「朝・昼」のまま
    const angleStart = "2026-12-01";
    const slotLabels = { am: "7時・薬の説明", noon: "12時・現場の目線", evening: "19時・体の中で", night: "21時・今日のまとめ" };
    const legacyLabels = { am: "朝", noon: "昼" };
    const labelFor = (date, slot) => (date < angleStart ? legacyLabels[slot] : null) || slotLabels[slot];

    function dateLabel(date, includeYear = false) {
        const [year, month, day] = date.split("-").map(Number);
        return (includeYear ? year + "年" : "") + month + "月" + day + "日";
    }

    function dateElement(date, includeYear = false) {
        const time = document.createElement("time");
        time.dateTime = date;
        time.textContent = dateLabel(date, includeYear);
        return time;
    }

    function createRow(entry, showDate) {
        const [date, slot] = entry.key.split("_");
        const li = document.createElement("li");
        const link = document.createElement("a");
        const metadata = document.createElement("span");
        const title = document.createElement("span");
        const action = document.createElement("span");
        const arrow = document.createElement("span");

        link.href = "https://substack.com/@earthkey/note/c-" + entry.note;
        metadata.className = "video-resources-date";
        if (showDate) metadata.append(dateElement(date), " ");
        metadata.append(labelFor(date, slot));
        title.className = "video-resources-name";
        title.textContent = entry.title;
        action.className = "video-resources-action";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        action.append("図解を見る ", arrow);
        link.append(metadata, title, action);
        li.append(link);
        return li;
    }

    function publishedEntries(index) {
        if (!Array.isArray(index?.entries)) throw new Error("Invalid diagram index");
        const entries = new Map();
        for (const entry of index.entries) {
            if (!entry || !/^\d{4}-\d{2}-\d{2}_(am|noon|evening|night)$/.test(entry.key)
                || typeof entry.note !== "string" || !/^[1-9]\d*$/.test(entry.note)
                || typeof entry.title !== "string" || !entry.title.trim() || entry.title.length > 100) {
                continue;
            }
            entries.set(entry.key, entry);
        }
        return [...entries.values()].sort((a, b) => b.key.slice(0, 10).localeCompare(a.key.slice(0, 10))
            || slots.indexOf(a.key.slice(11)) - slots.indexOf(b.key.slice(11)));
    }

    function renderArchive(entries) {
        const days = new Map();
        for (const entry of entries) {
            const date = entry.key.slice(0, 10);
            if (!days.has(date)) days.set(date, []);
            days.get(date).push(entry);
        }
        const result = document.createDocumentFragment();
        for (const [date, rows] of days) {
            const section = document.createElement("section");
            const heading = document.createElement("h2");
            const list = document.createElement("ul");

            section.className = "diagram-archive-day";
            heading.append(dateElement(date, true));
            list.className = "video-resources-list";
            list.append(...rows.map(entry => createRow(entry, false)));
            section.append(heading, list);
            result.append(section);
        }
        archive.replaceChildren(result);
        status.textContent = entries.length ? "" : "公開済みの図解はまだありません。";
    }

    fetch("/api/short-diagrams")
        .then(response => {
            if (!response.ok) throw new Error("Diagram index unavailable");
            return response.json();
        })
        .then(publishedEntries)
        .then(entries => {
            if (latest && entries.length) {
                const rows = slots.map(slot => entries.find(entry => entry.key.endsWith("_" + slot))).filter(Boolean);
                latest.replaceChildren(...rows.map(entry => createRow(entry, true)));
            }
            if (archive) renderArchive(entries);
        })
        .catch(() => {
            if (status) status.textContent = "図解一覧を読み込めませんでした。時間をおいて再読み込みしてください。";
        });
})();
