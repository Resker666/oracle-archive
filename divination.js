const divination = (() => {
  const ranks = [
    { name: "鸿运", total: 3 },
    { name: "大吉", total: 4 },
    { name: "吉", total: 6 },
    { name: "小吉", total: 6 },
    { name: "顺", total: 4 },
    { name: "平", total: 3 },
  ];

  const faces = {
    sun: { name: "日", label: "日曜" },
    flame: { name: "炎", label: "离火" },
    light: { name: "光", label: "灵光" },
    moon: { name: "月", label: "月轮" },
    ice: { name: "冰", label: "玄冰" },
    thunder: { name: "雷", label: "震雷" },
  };

  const entries = [
    {
      id: "radiant-world", rank: "鸿运", title: "煌天耀世", rolls: [["sun", "sun", "sun"]],
      verse: "三曜同辉，天光大开。心中所愿，正逢其时。",
      health: "阳气正盛，循序而行，留心暑热。", wealth: "财路渐明，积少成多，不必贪急。", social: "坦诚相待，自有同道并肩。",
    },
    {
      id: "eternal-flame", rank: "鸿运", title: "离火常明", rolls: [["flame", "flame", "flame"]],
      verse: "三火相承，明意照途。行事果决，亦要记得收锋。",
      health: "心火勿亢，饮食有节，动静相宜。", wealth: "机缘向好，做好准备便可把握。", social: "以热忱聚友，言语仍需留有余地。",
    },
    {
      id: "void-mystery", rank: "鸿运", title: "太虚洞玄", rolls: [["light", "light", "light"]],
      verse: "虚中藏妙，玄理渐显。看似无形之处，或有新机。",
      health: "静心养神，规律作息，勿使思虑过劳。", wealth: "深入探寻，旧线索也能带来新收获。", social: "与可信之人同行，彼此皆有所助。",
    },
    {
      id: "sun-flame-aid", rank: "大吉", title: "曦炎相济", rolls: [["sun", "sun", "light"], ["sun", "sun", "flame"]],
      verse: "日火相扶，虚实相生。眼前之事，宜趁势推进。",
      health: "松解肩颈，调和作息，让心火归平。", wealth: "稳步经营，意料之外亦有收获。", social: "言辞温和些，热心自会换来回应。",
    },
    {
      id: "void-sun-glory", rank: "大吉", title: "太虚耀华", rolls: [["light", "light", "sun"], ["light", "light", "flame"]],
      verse: "虚空得照，云开见华。按部就班，自能见到成果。",
      health: "晨起舒展，夜间静养，照看脾胃。", wealth: "机会可期，量力接事，切莫过满。", social: "与旧友叙谈，或能解开一桩心事。",
    },
    {
      id: "double-bright-flame", rank: "大吉", title: "重明叠焰", rolls: [["flame", "flame", "sun"], ["flame", "flame", "light"]],
      verse: "双明叠起，刚柔并济。把握分寸，锋芒便能成为助力。",
      health: "精神充沛，也要安排片刻休息。", wealth: "财势向上，适合推进已准备好的计划。", social: "热情待人，合作中更容易彼此成就。",
    },
    {
      id: "bright-void-flame", rank: "大吉", title: "煌虚燃明", rolls: [["sun", "flame", "light"]],
      verse: "明光穿透迷雾，借势而行，前路逐渐清楚。",
      health: "避免昼夜颠倒，午间稍作休息。", wealth: "三方助力渐齐，细察身边的好机会。", social: "遇到难题不必独扛，伙伴就在近处。",
    },
    {
      id: "sun-embraces-moon", rank: "吉", title: "煌阳涵阴", rolls: [["sun", "sun", "moon"], ["sun", "sun", "ice"], ["sun", "sun", "thunder"]],
      verse: "双阳映月，刚柔相照。只要不躁进，事情自会顺开。",
      health: "心气旺时记得放松，静坐片刻即可。", wealth: "利于整理账目、稳步经营，少做冲动决定。", social: "先听后言，误会容易消散。",
    },
    {
      id: "flame-gathers-shadow", rank: "吉", title: "炎光敛影", rolls: [["flame", "flame", "moon"], ["flame", "flame", "ice"], ["flame", "flame", "thunder"]],
      verse: "双炎敛华，月影藏锋。看清边界，再将热望付诸行动。",
      health: "少些熬夜，给身心留出恢复的空隙。", wealth: "来得快的机会要多核实，不义之财莫留。", social: "伸手相助会有回响，勿因一时误解疏远。",
    },
    {
      id: "true-in-illusion", rank: "吉", title: "幻中守真", rolls: [["light", "light", "moon"], ["light", "light", "ice"], ["light", "light", "thunder"]],
      verse: "幻象虽多，本心不移。等一等，答案会从纷扰中浮现。",
      health: "注意劳逸交替，少让杂事扰乱睡眠。", wealth: "稳住手头事务，远方的机会尚待分辨。", social: "谨慎听取传言，真诚沟通更有用。",
    },
    {
      id: "melted-gold-jade", rank: "吉", title: "熔金淬玉", rolls: [["sun", "light", "moon"], ["sun", "light", "ice"], ["sun", "light", "thunder"]],
      verse: "烈日淬金，清辉磨玉。暂露锋芒之后，仍以谦和为贵。",
      health: "饮食均衡，三餐规律，气力自然回升。", wealth: "先守后进，谨慎检查每一笔支出。", social: "不必刻意出头，关键时刻再出手即可。",
    },
    {
      id: "sun-flame-void-thunder", rank: "吉", title: "日曜虚霆", rolls: [["sun", "flame", "moon"], ["sun", "flame", "ice"], ["sun", "flame", "thunder"]],
      verse: "日火交映，阴阳相激。变化虽快，同行之人可作依凭。",
      health: "减少奔波劳累，先把精神养足。", wealth: "机缘会起也会落，见好便收更稳妥。", social: "困难宜共同面对，切勿把情绪留给亲近之人。",
    },
    {
      id: "woven-flame-net", rank: "吉", title: "空焰织网", rolls: [["light", "flame", "moon"], ["light", "flame", "ice"], ["light", "flame", "thunder"]],
      verse: "无形之火照路，细密之网藏珠。耐心寻觅，会有所得。",
      health: "心烦时先缓一缓，清淡饮食有益。", wealth: "机会藏在细节里，避免被表面声势牵着走。", social: "话语不必太重，给彼此留一点余地。",
    },
    {
      id: "frost-blade-sun", rank: "小吉", title: "霜刃映日", rolls: [["moon", "ice", "sun"], ["moon", "ice", "light"], ["moon", "ice", "flame"]],
      verse: "霜刃映日，枯枝将断。清理旧事之后，春意自会回来。",
      health: "注意手足保暖，早晚舒展筋骨。", wealth: "眼下求财费力，按计划慢慢来更合适。", social: "独处不妨，记得回应关心你的人。",
    },
    {
      id: "candle-dark-room", rank: "小吉", title: "暗室秉烛", rolls: [["moon", "thunder", "sun"], ["moon", "thunder", "light"], ["moon", "thunder", "flame"]],
      verse: "暗处有雷，手中有烛。先照亮脚下的一步，迷惘便会散开。",
      health: "规律活动，别让久坐与劳累积成不适。", wealth: "核对账目和期限，月底尤其留心。", social: "少说气话，多一点暖意便能打开僵局。",
    },
    {
      id: "thunder-lock-dragon", rank: "小吉", title: "雷池锁蛟", rolls: [["thunder", "ice", "sun"], ["thunder", "ice", "light"], ["thunder", "ice", "flame"]],
      verse: "玄冰锁蛟，雷声待发。时机未至时，强求反而添乱。",
      health: "留意筋骨疲劳，适量活动、好好休息。", wealth: "暂缓高风险投入，等待局势明朗。", social: "言语放缓，能省去不必要的争执。",
    },
    {
      id: "overload-reaction", rank: "小吉", title: "超载反应", rolls: [["thunder", "thunder", "sun"], ["thunder", "thunder", "light"], ["thunder", "thunder", "flame"]],
      verse: "双雷震耳，能量过盛。稍作停歇，反而更容易抓住重点。",
      health: "别让压力持续堆积，短暂小憩很有必要。", wealth: "收支需谨慎，稳扎稳打胜过一时冲动。", social: "与伙伴分担事务，协作会比单打独斗顺畅。",
    },
    {
      id: "twin-jades-seal-flame", rank: "小吉", title: "双珏镇炎", rolls: [["ice", "ice", "sun"], ["ice", "ice", "light"], ["ice", "ice", "flame"]],
      verse: "双玉镇火，静候冰消。眼下收敛锋芒，正为下一步蓄力。",
      health: "睡眠宜充足，莫让小毛病拖成疲惫。", wealth: "冷热交替，财务先守后动，不宜急于求成。", social: "主动表达善意，旧日隔阂有望融开。",
    },
    {
      id: "dark-yin-welcomes-light", rank: "小吉", title: "玄阴纳曦", rolls: [["moon", "moon", "sun"], ["moon", "moon", "light"], ["moon", "moon", "flame"]],
      verse: "阴盛而阳微，转机正在靠近。把心放宽，别急着定论。",
      health: "早些休息，清晨接触日光，精神会更安稳。", wealth: "机会渐露，细小得失不必过度计较。", social: "流言不值得追逐，静待几日便能看清。",
    },
    {
      id: "jade-plate-thunder", rank: "顺", title: "玉盘化震", rolls: [["moon", "moon", "ice"], ["moon", "moon", "thunder"]],
      verse: "玉盘映影，雷动云开。旧有困局开始松动，循序即可。",
      health: "避免过劳受寒，照顾好日常起居。", wealth: "守住已有收获，细水长流便是好势头。", social: "真心相待，关系会在平常往来中加深。",
    },
    {
      id: "moon-frost-lightning", rank: "顺", title: "月凝霜电", rolls: [["moon", "ice", "thunder"]],
      verse: "月凝寒霜，雷伏深处。先稳住步调，再等变化转机。",
      health: "注意保暖与休息，活动筋骨不宜过猛。", wealth: "先核实消息来源，暂不宜凭感觉下注。", social: "柔和表达立场，误会可在沟通中解开。",
    },
    {
      id: "cold-soul-double", rank: "顺", title: "寒魄双凝", rolls: [["ice", "ice", "moon"], ["ice", "ice", "thunder"]],
      verse: "寒魄凝舟，静候旭日。短暂的停滞并非坏事，蓄力再行。",
      health: "适度晒太阳、活动身体，心绪也会舒展。", wealth: "不必羡慕横财，稳妥经营更适合当下。", social: "一句真诚的问候，能让关系回暖。",
    },
    {
      id: "thunder-shatters-jade", rank: "顺", title: "惊雷碎玉", rolls: [["thunder", "thunder", "moon"], ["thunder", "thunder", "ice"]],
      verse: "双雷破坚冰，旧壳渐裂。顺势调整，新的空间已经出现。",
      health: "留意磕碰与疲劳，天气不佳时少去高处。", wealth: "检查日常开支，避免不知不觉的浪费。", social: "面对纷扰先求证，再请可信的人一道判断。",
    },
    {
      id: "dark-depths", rank: "平", title: "玄冥凝渊", rolls: [["ice", "ice", "ice"]],
      verse: "九重寒渊，不必沉心。静候冰消，赤鸟自会鸣响。",
      health: "睡好吃好，稍作运动，以散沉滞之气。", wealth: "开源节流，日拱一卒，切莫急于求成。", social: "遇事不妨问问可靠的朋友，彼此守望。",
    },
    {
      id: "thunder-calms-delusion", rank: "平", title: "震霆殛妄", rolls: [["thunder", "thunder", "thunder"]],
      verse: "雷鸣不争，锋刃暂藏。沉住气，等待更合适的时机。",
      health: "保持规律作息，清晨与夜间都给自己留些安宁。", wealth: "来得快的财也可能去得快，提防过分好听的承诺。", social: "别把自己隔绝太久，可信的伙伴能陪你破局。",
    },
    {
      id: "dark-yin-devours-moon", rank: "平", title: "玄阴噬月", rolls: [["moon", "moon", "moon"]],
      verse: "重轮掩月，孤凤待飞。暂且守静，前路会重新显现。",
      health: "留心作息颠倒，逐步调整比强行熬夜更好。", wealth: "计划之外的收益不易久留，量入为出即可。", social: "别因独处而错过善意，主动联络旧友吧。",
    },
  ];

  let found = new Set();
  let selectedRank = ranks[0].name;
  let selectedId = null;

  function iconMarkup(face, className = "") {
    return `<svg class="face-art ${className}" viewBox="0 0 100 100" aria-hidden="true"><use href="#face-${face}"></use></svg>`;
  }

  function renderDice(container, roll, sizeClass = "mini-die") {
    container.replaceChildren();
    roll.forEach((face) => {
      const die = document.createElement("span");
      die.className = sizeClass;
      die.innerHTML = iconMarkup(face);
      die.title = faces[face].label;
      container.appendChild(die);
    });
  }

  function renderResult(entry, roll) {
    document.querySelector("#result-seal").textContent = entry.rank;
    document.querySelector("#result-title").textContent = entry.title;
    document.querySelector("#result-verse").textContent = entry.verse;
    renderDice(document.querySelector("#result-dice"), roll, "result-die");
    document.querySelector("#reading-title").textContent = entry.title;
    document.querySelector("#reading-verse").textContent = entry.verse;
    document.querySelector("#reading-health").textContent = entry.health;
    document.querySelector("#reading-wealth").textContent = entry.wealth;
    document.querySelector("#reading-social").textContent = entry.social;
  }

  function makeUnknownDice(count = 3) {
    return Array.from({ length: count }, () => {
      const die = document.createElement("span");
      die.className = "mini-die unknown-die";
      die.textContent = "?";
      return die;
    });
  }

  function renderArchiveDetail(entry) {
    const stamp = document.querySelector("#detail-stamp");
    const rank = document.querySelector("#detail-rank");
    const title = document.querySelector("#detail-title");
    const verse = document.querySelector("#detail-verse");
    const dice = document.querySelector("#detail-dice");
    const analysis = document.querySelector("#detail-analysis");

    if (!entry || !found.has(entry.id)) {
      stamp.textContent = "?";
      rank.textContent = "卦象待启";
      title.textContent = "未收录";
      verse.textContent = "此卦尚未入册。再摇一次龟壳，或许便能相见。";
      dice.replaceChildren(...makeUnknownDice());
      analysis.hidden = true;
      return;
    }

    stamp.textContent = entry.rank.slice(0, 1);
    rank.textContent = entry.rank;
    title.textContent = entry.title;
    verse.textContent = entry.verse;
    const roll = entry.rolls[0];
    renderDice(dice, roll);
    document.querySelector("#detail-health").textContent = entry.health;
    document.querySelector("#detail-wealth").textContent = entry.wealth;
    document.querySelector("#detail-social").textContent = entry.social;
    analysis.hidden = false;
  }

  function renderArchive(ids) {
    found = new Set(ids);
    const totalFound = found.size;
    document.querySelector("#archive-count").textContent = `${totalFound} / ${entries.length}`;
    document.querySelectorAll(".fortune-filter").forEach((button) => {
      const rank = button.dataset.rank;
      const rankEntries = entries.filter((entry) => entry.rank === rank);
      const discovered = rankEntries.filter((entry) => found.has(entry.id)).length;
      button.querySelector("strong").textContent = `${discovered} / ${rankEntries.length}`;
      button.classList.toggle("is-selected", rank === selectedRank);
    });

    const selected = entries.find((entry) => entry.id === selectedId && entry.rank === selectedRank)
      || entries.find((entry) => entry.rank === selectedRank && found.has(entry.id));
    selectedId = selected?.id || null;

    const list = document.querySelector("#catalog-list");
    list.replaceChildren();
    entries.filter((entry) => entry.rank === selectedRank).forEach((entry) => {
      const known = found.has(entry.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `catalog-entry${known ? "" : " is-locked"}${entry.id === selectedId ? " is-selected" : ""}`;
      button.dataset.entryId = entry.id;
      button.setAttribute("aria-label", known ? `${entry.rank}，${entry.title}` : `${entry.rank}，未收录`);

      const dice = document.createElement("span");
      dice.className = "entry-dice";
      if (known) renderDice(dice, entry.rolls[0]);
      else dice.replaceChildren(...makeUnknownDice());

      const copy = document.createElement("span");
      copy.className = "entry-copy";
      const name = document.createElement("span");
      name.className = "entry-title";
      name.textContent = known ? entry.title : "未收录";
      const label = document.createElement("span");
      label.className = "entry-rank";
      label.textContent = entry.rank;
      copy.append(name, label);

      const status = document.createElement("span");
      status.className = "entry-status";
      status.textContent = known ? "已入册" : "EMPTY";
      button.append(dice, copy, status);
      list.appendChild(button);
    });

    renderArchiveDetail(selected);
  }

  document.querySelectorAll(".fortune-filter").forEach((button) => {
    button.addEventListener("click", () => {
      selectedRank = button.dataset.rank;
      selectedId = null;
      renderArchive(found);
    });
  });

  document.querySelector("#catalog-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-entry-id]");
    if (!button) return;
    selectedId = button.dataset.entryId;
    renderArchive(found);
  });

  const shakeScreen = document.querySelector("#screen-shake");
  const shakeTarget = document.querySelector("#shake-target");
  const shakeButton = document.querySelector("#tap-shake");
  const shakePercent = document.querySelector("#shake-percent");
  const shakeFill = document.querySelector("#shake-fill");
  let shakeProgress = 0;
  let lastPointer = null;

  function stopShaking() {
    lastPointer = null;
    shakeScreen.classList.remove("is-shaking");
  }

  function resetShake() {
    stopShaking();
    shakeProgress = 0;
    shakeButton.disabled = false;
    shakePercent.textContent = "0%";
    shakeFill.style.width = "0%";
  }

  function bindShake(onFinish) {
    function addProgress(amount) {
      if (!shakeScreen.classList.contains("is-active") || shakeProgress === 100) return;
      shakeProgress = Math.min(100, shakeProgress + amount);
      shakePercent.textContent = Math.round(shakeProgress) + "%";
      shakeFill.style.width = shakeProgress + "%";
      if (shakeProgress === 100) {
        stopShaking();
        shakeButton.disabled = true;
        onFinish();
      }
    }

    shakeButton.addEventListener("click", () => addProgress(13));
    shakeTarget.addEventListener("pointerdown", (event) => {
      if (lastPointer || shakeProgress === 100 || event.button !== 0) return;
      lastPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      shakeTarget.setPointerCapture(event.pointerId);
      shakeScreen.classList.add("is-shaking");
    });
    shakeTarget.addEventListener("pointermove", (event) => {
      if (lastPointer?.id !== event.pointerId) return;
      const distance = Math.abs(event.clientX - lastPointer.x) + Math.abs(event.clientY - lastPointer.y);
      lastPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      addProgress(distance / 7);
    });
    shakeTarget.addEventListener("lostpointercapture", (event) => {
      if (lastPointer?.id === event.pointerId) stopShaking();
    });
    shakeTarget.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        addProgress(13);
      }
    });
  }

  return { entries, renderArchive, renderDice, renderResult, resetShake, bindShake };
})();
