(() => {
  const $ = (selector) => document.querySelector(selector);
  const screens = [...document.querySelectorAll(".screen")];
  const modeInputs = [...document.querySelectorAll('input[name="draw-mode"]')];
  const reading = $("#reading-panel");
  const startLabel = $("#start-draw span");
  const rewardItems = $("#reward-items");
  const historyFilter = $("#history-scene");
  const dateFormat = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const activityInstructions = {
    scratch: "划开银膜。刮开三格后就能看到完整票面。",
    box: "点一下盒盖，揭晓里面的数据卡片。",
    wish: "好运瓶盖可以在数据卡册领取。",
  };
  const snackCards = drawPools["snack-box"];
  const claimsInFlight = new Set();
  const state = {
    screen: "hub",
    saved: archiveStore.read(),
    scene: null,
    session: null,
    result: null,
    archiveReturn: "home",
    recordsReturn: "hub",
    recordsTab: "history",
  };

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function setReading(open, focus = true) {
    reading.classList.toggle("is-open", open);
    reading.inert = !open;
    reading.setAttribute("aria-hidden", String(!open));
    if (focus) $(open ? "#close-reading" : "#interpret-result").focus();
  }

  function setScreen(name) {
    const screenChanged = state.screen !== name;
    state.screen = name;
    setReading(false, false);
    $("#app").dataset.screen = name;
    for (const screen of screens) {
      const active = screen.id === "screen-" + name;
      screen.classList.toggle("is-active", active);
      screen.inert = !active;
      screen.setAttribute("aria-hidden", String(!active));
    }
    if (!screenChanged) return;
    const active = $("#screen-" + name);
    active.scrollTop = 0;
    const heading = active.querySelector("h1[tabindex]");
    const focusTarget = heading ?? active.querySelector("#start-draw, #shake-target, [data-back]");
    focusTarget?.focus({ preventScroll: true });
  }

  function usedToday(quotaGroup) {
    return state.saved.mode === "daily" ? archiveStore.dailyResult(state.saved, quotaGroup) : null;
  }

  function usedTodayText(record) {
    return "今日次数已用 · " + (sceneById[record.sceneId]?.name ?? record.sceneId);
  }

  function renderHub() {
    for (const input of modeInputs) input.checked = input.value === state.saved.mode;
    const used = usedToday(DAILY_QUOTA_GROUP);
    $("#mode-status").textContent = used ? usedTodayText(used) : state.saved.mode === "daily"
      ? "占卜、刮卡和拆盒共用今日 1 次。"
      : "可重复占卜、刮卡和拆盒。";
    $("#today-hub").hidden = !used;
  }

  function renderTemple() {
    const ids = archiveStore.collection(state.saved, state.scene.collectionId);
    $("#home-count").textContent = ids.length + " / " + drawPools[state.scene.poolId].length;
    const used = usedToday(state.scene.quotaGroup);
    $(".home-kicker").textContent = used ? usedTodayText(used) : "卦象集录 · 已收录 " + ids.length + " 种";
    startLabel.textContent = used ? "查看今日结果" : "开始占卜";
  }

  function renderActivity() {
    const scene = state.scene;
    const { interaction } = scene;
    const used = usedToday(scene.quotaGroup);
    $("#screen-activity").dataset.theme = scene.theme;
    $("#activity-place").textContent = scene.area;
    $("#activity-title").textContent = interaction === "scratch" ? scene.area + "刮刮卡" : scene.name;
    $("#activity-instructions").textContent = activityInstructions[interaction];
    $("#activity-archive").textContent = interaction === "box" ? "数据卡册" : "开奖记录";
    if (interaction === "scratch") $("#ticket-name").textContent = scene.name;
    for (const play of ["scratch", "box", "wish"]) {
      $("#" + play + "-play").hidden = Boolean(used) || play !== interaction;
    }
    $("#activity-locked").hidden = !used;
    $("#activity-lock-message").textContent = used ? usedTodayText(used) : "";

    if (interaction === "wish") {
      const button = $("#make-wish");
      const hasEnoughCaps = state.saved.bottleCaps >= scene.bottleCapCost;
      $("#wish-balance").textContent = state.saved.bottleCaps + " 枚";
      button.textContent = hasEnoughCaps
        ? "投入 " + scene.bottleCapCost + " 枚许愿"
        : "需要 " + scene.bottleCapCost + " 枚瓶盖";
      button.disabled = Boolean(state.session) || !hasEnoughCaps;
    }
  }

  function refresh() {
    state.saved = archiveStore.read();
    $("#storage-warning").hidden = !archiveStore.isTemporary();
    if (state.screen === "hub") renderHub();
    if (state.screen === "home") renderTemple();
    if (state.screen === "activity") renderActivity();
    if (state.screen === "archive") renderDivinationArchive();
    if (state.screen === "records") renderRecords();
  }

  function cancelDraw() {
    if (!state.session) return;
    window.clearTimeout(state.session.timer);
    if (state.session.scene.interaction === "shake") divination.resetShake();
    state.session = null;
  }

  function resetActivity() {
    if (state.scene.interaction === "scratch") scratchTicket.reset();
    $("#scratch-reveal").disabled = false;
    $("#open-box").disabled = false;
    $("#sealed-box").classList.remove("is-opening");
    $("#wish-fountain").classList.remove("is-wishing");
  }

  function setLocation(scene) {
    cancelDraw();
    state.scene = scene;
    state.result = null;
    state.saved = archiveStore.read();
    if (!scene) {
      renderHub();
      setScreen("hub");
    } else if (scene.interaction === "shake") {
      renderTemple();
      setScreen("home");
    } else {
      resetActivity();
      renderActivity();
      setScreen("activity");
    }
  }

  function showDailyResult(quotaGroup = DAILY_QUOTA_GROUP) {
    const record = usedToday(quotaGroup);
    if (record) showResult(record);
    return Boolean(record);
  }

  function startDivination() {
    if (state.screen !== "home") return;
    refresh();
    if (showDailyResult(state.scene.quotaGroup)) return;
    state.session = { scene: state.scene, mode: state.saved.mode };
    divination.resetShake();
    setScreen("shake");
  }

  function startActivityDraw() {
    if (state.screen !== "activity" || state.session) return;
    refresh();
    const scene = state.scene;
    if (scene.quotaGroup && showDailyResult(scene.quotaGroup)) return;
    if (state.saved.bottleCaps < (scene.bottleCapCost ?? 0)) return;
    state.session = { scene, mode: state.saved.mode };
    switch (scene.interaction) {
      case "box":
        $("#open-box").disabled = true;
        $("#sealed-box").classList.add("is-opening");
        finishDraw(350);
        break;
      case "wish":
        $("#make-wish").disabled = true;
        $("#wish-fountain").classList.add("is-wishing");
        finishDraw(560);
        break;
      default:
        $("#scratch-reveal").disabled = true;
        finishDraw(0);
    }
  }

  function finishDraw(delay) {
    const session = state.session;
    if (!session || session.finishing) return;
    session.finishing = true;
    session.timer = window.setTimeout(() => settleDraw(session), delay);
  }

  function makeRecord(scene, mode, date) {
    return {
      ...drawFromPool(scene.poolId),
      sceneId: scene.id,
      poolId: scene.poolId,
      mode,
      drawnAt: date.toISOString(),
    };
  }

  async function settleDraw(session) {
    if (state.session !== session) return;
    const { scene, mode } = session;
    if (mode === "free" && scene.interaction === "shake") {
      showResult(makeRecord(scene, mode, new Date()), true);
      return;
    }

    let record;
    state.saved = await archiveStore.update((data) => {
      if (state.session !== session) return false;
      const now = new Date();
      const daily = mode === "daily" && Boolean(scene.quotaGroup);
      record = daily ? archiveStore.dailyResult(data, scene.quotaGroup, now) : null;
      if (record) return false;
      const cost = scene.bottleCapCost ?? 0;
      if (data.bottleCaps < cost) return false;
      record = makeRecord(scene, mode, now);
      if (scene.interaction === "box") {
        record.isNewCard = !archiveStore.collection(data, scene.collectionId).includes(record.entryId);
      }
      if (cost) {
        record.bottleCapsSpent = cost;
        data.bottleCaps -= cost;
      }
      if (daily) archiveStore.addDailyRecord(data, scene, record, now);
      else archiveStore.addRecord(data, scene, record);
      return true;
    });
    if (state.session === session) {
      if (record) showResult(record);
      else {
        cancelDraw();
        resetActivity();
        refresh();
      }
    }
    $("#storage-warning").hidden = !archiveStore.isTemporary();
  }

  function showResult(record, pendingConfirmation = false) {
    cancelDraw();
    state.result = { record, pendingConfirmation };
    const scene = sceneById[record.sceneId];
    if (scene.interaction === "shake") {
      const entry = drawPools[record.poolId].find((item) => item.id === record.entryId);
      divination.renderResult(entry, record.roll);
      $("#confirm-result").disabled = false;
      setScreen("result");
      return;
    }

    const box = scene.interaction === "box";
    $("#screen-reward").dataset.theme = scene.theme;
    $("#screen-reward").dataset.tier = record.tier ?? "";
    const rewardArt = $("#reward-art");
    rewardArt.dataset.interaction = scene.interaction;
    rewardArt.dataset.card = box ? record.entryId : "";
    const artMark = $("#reward-mark");
    if (scene.interaction === "scratch") {
      artMark.replaceChildren(...Array.from({ length: 3 }, () => element("span", "reward-symbol", record.mark)));
    } else {
      artMark.textContent = record.mark;
    }
    $("#reward-place").textContent = scene.name;
    $("#reward-title").textContent = record.title;
    $("#reward-tier").textContent = record.tier ?? "";
    $("#reward-tier").hidden = !record.tier;
    $("#reward-new").hidden = !record.isNewCard;
    $("#reward-tags").hidden = !record.tier && !record.isNewCard;
    $("#reward-archive").textContent = box ? "数据卡册" : "开奖记录";
    rewardItems.replaceChildren(...record.rewards.map((reward) => element("li", null, rewardText(reward))));
    setScreen("reward");
  }

  async function confirmResult() {
    const result = state.result;
    if (!result || result.saving) return;
    if (result.pendingConfirmation) {
      result.saving = true;
      $("#confirm-result").disabled = true;
      state.saved = await archiveStore.update((data) => {
        archiveStore.addRecord(data, sceneById[result.record.sceneId], result.record);
        return true;
      });
      result.pendingConfirmation = false;
      result.saving = false;
      $("#confirm-result").disabled = false;
      refresh();
    }
    if (state.result === result && (state.screen === "result" || state.screen === "reward")) setLocation(state.scene);
  }

  function renderDivinationArchive() {
    divination.renderArchive(archiveStore.collection(state.saved, "divination"));
  }

  async function clearDivinationArchive() {
    const saved = state.saved;
    if (!archiveStore.collection(saved, "divination").length && !saved.history.some((item) => item.poolId === "divination")) return;
    if (!window.confirm("清空本机保存的卦象集录和卦象历史？")) return;
    state.saved = await archiveStore.update((data) => {
      delete data.collections.divination;
      data.history = data.history.filter((item) => item.poolId !== "divination");
      return true;
    });
    refresh();
  }

  function openDivinationArchive() {
    state.archiveReturn = state.screen;
    setScreen("archive");
    refresh();
  }

  function rewardText(reward) {
    return reward.name + " × " + reward.amount.toLocaleString("zh-CN");
  }

  function renderHistory() {
    const list = $("#history-list");
    const selected = historyFilter.value;
    const records = state.saved.history.filter((record) => !selected || record.sceneId === selected);
    $("#history-empty").hidden = records.length > 0;
    list.replaceChildren();
    for (const record of records) {
      const item = element("li", "history-item");
      const label = element("div", "history-label");
      const place = sceneById[record.sceneId]?.name ?? record.sceneId;
      const activity = record.bottleCapsSpent
        ? "消耗 " + record.bottleCapsSpent + " 枚瓶盖"
        : (record.mode === "daily" ? "日常" : "试玩");
      label.append(element("strong", null, record.title), element("span", null, place + " · " + activity));
      const date = record.drawnAt ? dateFormat.format(new Date(record.drawnAt)) : record.legacyTime;
      const time = element("time", "history-time", date);
      if (record.drawnAt) time.dateTime = record.drawnAt;
      const detail = element("div", "history-detail");
      if (record.roll) {
        divination.renderDice(detail, record.roll);
      } else {
        detail.textContent = record.rewards.map(rewardText).join(" · ");
      }
      item.append(label, detail, time);
      list.append(item);
    }
  }

  function unlockedSnackCards(data) {
    const owned = archiveStore.collection(data, "snack-box");
    return new Set(snackCards.filter((card) => owned.includes(card.id)).map((card) => card.id));
  }

  function renderMilestones(cardCount) {
    $("#card-cap-balance").textContent = state.saved.bottleCaps + " 枚";
    for (const { milestone, button } of milestoneControls) {
      const claimed = state.saved.claimedMilestones.includes(milestone.id);
      const waiting = claimsInFlight.has(milestone.id);
      const remaining = milestone.cards - cardCount;
      button.disabled = claimed || waiting || remaining > 0;
      if (claimed) button.textContent = "已领取";
      else if (waiting) button.textContent = "领取中…";
      else if (remaining > 0) button.textContent = "还差 " + remaining + " 张";
      else button.textContent = "领取 1 枚";
      button.setAttribute("aria-label", "收集 " + milestone.cards + " 张卡片，" + button.textContent);
    }
  }

  async function claimMilestone(milestone) {
    if (claimsInFlight.has(milestone.id)) return;
    claimsInFlight.add(milestone.id);
    renderMilestones(unlockedSnackCards(state.saved).size);
    try {
      await archiveStore.update((data) => {
        if (data.claimedMilestones.includes(milestone.id) || unlockedSnackCards(data).size < milestone.cards) return false;
        data.claimedMilestones.push(milestone.id);
        data.bottleCaps += 1;
        return true;
      });
    } finally {
      claimsInFlight.delete(milestone.id);
      refresh();
    }
  }

  function renderCards() {
    const list = $("#card-list");
    const unlocked = unlockedSnackCards(state.saved);
    $("#card-count").textContent = "已收录 " + unlocked.size + " / " + snackCards.length;
    renderMilestones(unlocked.size);
    list.replaceChildren();
    for (const card of snackCards) {
      const known = unlocked.has(card.id);
      const item = element("li", known ? "data-card" : "data-card is-locked");
      if (known) {
        item.dataset.tier = card.tier;
        item.dataset.card = card.id;
      }
      const mark = element("span", "data-card-mark", known ? card.mark : "？");
      mark.setAttribute("aria-hidden", "true");
      item.append(mark, element("strong", null, known ? card.title : "未收录"));
      if (known) item.append(element("span", "data-card-tier", card.tier));
      list.append(item);
    }
  }

  function renderRecords() {
    const history = state.recordsTab === "history";
    $("#tab-history").setAttribute("aria-pressed", String(history));
    $("#tab-cards").setAttribute("aria-pressed", String(!history));
    $("#history-panel").hidden = !history;
    $("#cards-panel").hidden = history;
    if (history) renderHistory();
    else renderCards();
  }

  function openRecords(tab, sceneId = "") {
    if (state.screen === "activity") {
      cancelDraw();
      resetActivity();
    }
    state.recordsReturn = state.screen;
    state.recordsTab = tab;
    historyFilter.value = sceneId;
    setScreen("records");
    refresh();
  }

  function openActivityArchive(scene) {
    if (scene.interaction === "box") openRecords("cards");
    else openRecords("history", scene.id);
  }

  function goBack() {
    if (state.screen === "records" || state.screen === "archive") {
      setScreen(state.screen === "records" ? state.recordsReturn : state.archiveReturn);
      refresh();
    } else if (["result", "reward", "shake"].includes(state.screen)) {
      setLocation(state.scene);
    } else if (state.screen !== "hub") {
      setLocation(null);
    }
  }

  for (const scene of scenes) {
    const button = element("button", "scene-card");
    button.type = "button";
    button.dataset.theme = scene.theme;
    button.dataset.scene = scene.id;
    const copy = element("span", "scene-card-copy");
    copy.append(element("strong", null, scene.name), element("span", null, scene.activity));
    button.append(copy);
    button.addEventListener("click", () => setLocation(scene));
    $("#scene-list").append(button);
    historyFilter.add(new Option(scene.name, scene.id));
  }
  historyFilter.add(new Option("所有地点", "", true, true), 0);

  const milestoneControls = cardMilestones.map((milestone) => {
    const item = element("li", "card-milestone");
    const button = element("button", "journal-button");
    button.type = "button";
    button.dataset.milestone = milestone.id;
    button.addEventListener("click", () => claimMilestone(milestone));
    item.append(element("strong", null, "收集 " + milestone.cards + " 张"), button);
    $("#card-milestones").append(item);
    return { milestone, button };
  });

  for (const input of modeInputs) {
    input.addEventListener("change", async () => {
      state.saved = await archiveStore.update((data) => {
        data.mode = input.value;
        return true;
      });
      refresh();
    });
  }

  for (const button of document.querySelectorAll("[data-back]")) button.addEventListener("click", goBack);
  $("#start-draw").addEventListener("click", startDivination);
  $("#interpret-result").addEventListener("click", () => setReading(true));
  $("#close-reading").addEventListener("click", () => setReading(false));
  $("#confirm-result").addEventListener("click", confirmResult);
  $("#confirm-reward").addEventListener("click", confirmResult);
  $("#open-archive-home").addEventListener("click", openDivinationArchive);
  $("#open-archive-result").addEventListener("click", openDivinationArchive);
  $("#clear-archive").addEventListener("click", clearDivinationArchive);
  $("#today-hub").addEventListener("click", () => {
    refresh();
    showDailyResult();
  });
  $("#today-activity").addEventListener("click", () => {
    refresh();
    showDailyResult(state.scene.quotaGroup);
  });
  $("#scratch-reveal").addEventListener("click", startActivityDraw);
  $("#open-box").addEventListener("click", startActivityDraw);
  $("#make-wish").addEventListener("click", startActivityDraw);
  $("#wish-card-book").addEventListener("click", () => openRecords("cards"));
  $("#open-fountain").addEventListener("click", () => setLocation(sceneById[FOUNTAIN_SCENE_ID]));
  $("#open-history-hub").addEventListener("click", () => openRecords("history"));
  $("#activity-archive").addEventListener("click", () => openActivityArchive(state.scene));
  $("#reward-archive").addEventListener("click", () => openActivityArchive(sceneById[state.result.record.sceneId]));
  $("#tab-history").addEventListener("click", () => {
    state.recordsTab = "history";
    renderRecords();
  });
  $("#tab-cards").addEventListener("click", () => {
    state.recordsTab = "cards";
    renderRecords();
  });
  historyFilter.addEventListener("change", renderHistory);
  divination.bindShake(() => finishDraw(520));
  scratchTicket.bind(startActivityDraw);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    if (reading.classList.contains("is-open")) setReading(false);
    else goBack();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === archiveStore.key || event.key === null) refresh();
  });
  window.addEventListener("focus", refresh);
  let visibleDay = new Date().toDateString();
  window.setInterval(() => {
    const today = new Date().toDateString();
    if (today === visibleDay) return;
    visibleDay = today;
    refresh();
  }, 30_000);

  setScreen("hub");
  refresh();
})();
