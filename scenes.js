const DAILY_QUOTA_GROUP = "daily-activity";

const scenes = [
  {
    id: "suibian-temple", name: "随便观", area: "卫非地", activity: "问机算卜",
    interaction: "shake", theme: "temple", mark: "卜", poolId: "divination",
    collectionId: "divination", quotaGroup: DAILY_QUOTA_GROUP,
  },
  {
    id: "sixth-street-newsstand", name: "六分街报刊亭", area: "六分街", activity: "报刊亭刮刮卡",
    interaction: "scratch", theme: "sixth-street", mark: "✶", poolId: "newsstand",
    quotaGroup: DAILY_QUOTA_GROUP,
  },
  {
    id: "lumina-square-newsstand", name: "光映广场报刊亭", area: "光映广场", activity: "报刊亭刮刮卡",
    interaction: "scratch", theme: "lumina-square", mark: "✶", poolId: "newsstand",
    quotaGroup: DAILY_QUOTA_GROUP,
  },
  {
    id: "roarin-brekkies", name: "吼吼饼铺", area: "罗斯凯利法", activity: "零食盲盒",
    interaction: "box", theme: "bakery", mark: "✦", poolId: "snack-box",
    collectionId: "snack-box", quotaGroup: DAILY_QUOTA_GROUP,
  },
];

const sceneById = Object.fromEntries(scenes.map((scene) => [scene.id, scene]));

// The ticket and box pools contain original, local simulation rewards.
const drawPools = {
  divination: divination.entries,
  newsstand: [
    { id: "spare-change", title: "晨报零钱", mark: "◈", weight: 55, rewards: [{ name: "丁尼", amount: 3000 }] },
    { id: "street-supply", title: "街角补给", mark: "✦", weight: 25, rewards: [{ name: "丁尼", amount: 6000 }] },
    { id: "lamplight", title: "灯下好彩", mark: "☼", weight: 12, rewards: [{ name: "菲林", amount: 10 }] },
    { id: "neon", title: "霓虹星章", mark: "✷", weight: 6, rewards: [{ name: "菲林", amount: 20 }] },
    { id: "golden-edition", title: "金边特刊", mark: "✹", weight: 2, rewards: [{ name: "菲林", amount: 50 }] },
  ],
  "snack-box": [
    { id: "morning-recipe", title: "晨光食谱", mark: "☼", tier: "普通", weight: 28, rewards: [{ name: "丁尼", amount: 2400 }] },
    { id: "sky-ticket", title: "云上车票", mark: "◒", tier: "普通", weight: 26, rewards: [{ name: "丁尼", amount: 3200 }] },
    { id: "crisp-lesson", title: "松脆练习", mark: "◇", tier: "普通", weight: 23, rewards: [{ name: "丁尼", amount: 4000 }] },
    { id: "letter-from-orbit", title: "轨道来信", mark: "✧", tier: "稀有", weight: 12, rewards: [{ name: "菲林", amount: 10 }] },
    { id: "night-stall", title: "月下摊位", mark: "☾", tier: "稀有", weight: 8, rewards: [{ name: "菲林", amount: 15 }] },
    { id: "gilded-recipe", title: "金边秘方", mark: "✹", tier: "珍藏", weight: 3, rewards: [{ name: "菲林", amount: 30 }] },
  ],
};

function drawFromPool(poolId, random = Math.random) {
  const pool = drawPools[poolId];
  let remaining = random() * pool.reduce((total, entry) => total + (entry.weight ?? 1), 0);
  const entry = pool.find((item) => {
    remaining -= item.weight ?? 1;
    return remaining < 0;
  }) ?? pool[pool.length - 1];

  return {
    entryId: entry.id,
    title: entry.title,
    mark: entry.mark,
    tier: entry.tier,
    roll: entry.rolls?.[Math.floor(random() * entry.rolls.length)],
    rewards: entry.rewards ?? [],
  };
}
