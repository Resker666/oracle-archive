const archiveStore = (() => {
  const key = "oracle-archive-v3";
  const oldKey = "zzz-divination-local-v2";
  const historyLimit = 40;
  const divinationEntries = new Map(divination.entries.map((entry) => [entry.id, entry]));
  const empty = () => ({ version: 3, mode: "free", history: [], collections: {}, dailyUsage: {} });
  let snapshot = empty();
  let temporary = false;

  function parse(json) {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function migrate(saved) {
    const data = empty();
    if (!saved) return data;
    if (Array.isArray(saved.found)) {
      data.collections.divination = [...new Set(saved.found.filter((id) => divinationEntries.has(id)))];
    }
    if (Array.isArray(saved.history)) {
      data.history = saved.history.filter((item) => divinationEntries.has(item?.id)).slice(0, historyLimit).map((item) => {
        const entry = divinationEntries.get(item.id);
        const savedRoll = Array.isArray(item.roll) && entry.rolls.find((roll) =>
          roll.length === item.roll.length && roll.every((face, index) => face === item.roll[index]));
        return {
          sceneId: "suibian-temple",
          poolId: "divination",
          entryId: entry.id,
          title: entry.title,
          roll: savedRoll || entry.rolls[0],
          legacyTime: item.time,
          mode: "free",
          rewards: [],
        };
      });
    }
    return data;
  }

  function read() {
    if (temporary) return snapshot;
    try {
      const saved = parse(localStorage.getItem(key));
      snapshot = saved?.version === 3 && Array.isArray(saved.history) && saved.collections && saved.dailyUsage
        ? { ...saved, mode: saved.mode === "daily" ? "daily" : "free" }
        : migrate(parse(localStorage.getItem(oldKey)));
    } catch {
      temporary = true;
    }
    return snapshot;
  }

  async function update(change) {
    const commit = () => {
      const data = read();
      if (!change(data)) return data;
      snapshot = data;
      if (!temporary) {
        try {
          localStorage.setItem(key, JSON.stringify(data));
        } catch {
          temporary = true;
        }
      }
      return data;
    };

    // Keep a daily claim and its record in the same update across tabs.
    if (!temporary && navigator.locks) {
      let acquired = false;
      try {
        return await navigator.locks.request(key, () => {
          acquired = true;
          return commit();
        });
      } catch (error) {
        if (acquired) throw error;
      }
    }
    return commit();
  }

  function collection(data, collectionId) {
    return data.collections[collectionId] ?? [];
  }

  function addRecord(data, scene, record) {
    data.history.unshift(record);
    data.history.length = Math.min(data.history.length, historyLimit);
    if (scene.collectionId) {
      const unlocked = collection(data, scene.collectionId);
      data.collections[scene.collectionId] = [...new Set([...unlocked, record.entryId])];
    }
  }

  function dayKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
  }

  function dailyResult(data, quotaGroup, date = new Date()) {
    const usage = quotaGroup && data.dailyUsage[quotaGroup];
    return usage?.day === dayKey(date) ? usage.record : null;
  }

  function addDailyRecord(data, scene, record, date) {
    if (scene.quotaGroup) data.dailyUsage[scene.quotaGroup] = { day: dayKey(date), record };
    addRecord(data, scene, record);
  }

  return { key, read, update, collection, addRecord, dailyResult, addDailyRecord, isTemporary: () => temporary };
})();
