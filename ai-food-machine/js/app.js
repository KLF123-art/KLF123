/* ============================================================
 * AI 食光机 - 主逻辑
 * 推荐引擎：四维加权打分 + 忌口硬性过滤
 * ============================================================ */

// ---------- 全局状态 ----------
const state = {
  ingredients: new Set(),
  spicy: '',
  flavor: '',
  difficulty: '',
  meal: '',
  servings: 2,
  restrictions: new Set(),
  currentResults: [],
  shuffleSeed: 0,
  favorites: loadLS('sgj_favorites', []),
  weekMenu: loadLS('sgj_week', null)
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function loadLS(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch (e) { return def; }
}
function saveLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}

// ---------- 初始化 ----------
function init() {
  $('#statRecipes').textContent = RECIPES.length;
  $('#statIngredients').textContent = INGREDIENT_CATEGORIES.reduce((n, c) => n + c.items.length, 0);
  renderIngredientGroups();
  renderOptionRows();
  renderRestrictions();
  bindEvents();
  updateSummary();
  renderFavorites();
  if (state.weekMenu) renderWeekMenu();
}

// ---------- 渲染：食材选择 ----------
function renderIngredientGroups(keyword = '') {
  const kw = keyword.trim();
  const container = $('#ingredientGroups');
  container.innerHTML = '';
  INGREDIENT_CATEGORIES.forEach(cat => {
    const items = cat.items.filter(i => !kw || i.includes(kw));
    if (!items.length) return;
    const group = document.createElement('div');
    group.className = 'ingredient-group';
    group.innerHTML = `<div class="ingredient-group-title">${cat.icon} ${cat.name}</div>
      <div class="ingredient-chips"></div>`;
    const chips = group.querySelector('.ingredient-chips');
    items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'ing-chip' + (state.ingredients.has(item) ? ' selected' : '');
      btn.textContent = item;
      btn.dataset.ing = item;
      btn.addEventListener('click', () => toggleIngredient(item, btn));
      chips.appendChild(btn);
    });
    container.appendChild(group);
  });
  if (!container.children.length) {
    container.innerHTML = '<p class="empty-hint">没有找到匹配的食材</p>';
  }
}

function toggleIngredient(item, btn) {
  if (state.ingredients.has(item)) { state.ingredients.delete(item); btn.classList.remove('selected'); }
  else { state.ingredients.add(item); btn.classList.add('selected'); }
  updateSummary();
  updateCookButton();
}

// ---------- 渲染：选项行 ----------
function renderOptionRows() {
  buildChips('#spicyOptions', SPICY_LEVELS, 'spicy');
  buildChips('#flavorOptions', FLAVORS, 'flavor');
  buildChips('#difficultyOptions', DIFFICULTIES, 'difficulty');
  $('#mealOptions').innerHTML = MEALS.map(m =>
    `<button class="opt-chip" data-meal="${m.key}">${m.icon} ${m.label}</button>`).join('');
  $$('#mealOptions .opt-chip').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.meal;
    state.meal = state.meal === key ? '' : key;
    $$('#mealOptions .opt-chip').forEach(b => b.classList.toggle('selected', b.dataset.meal === state.meal));
    updateSummary();
  }));
}

function buildChips(sel, list, stateKey) {
  $(sel).innerHTML = list.map(x => `<button class="opt-chip" data-val="${x}">${x}</button>`).join('');
  $$(sel + ' .opt-chip').forEach(btn => btn.addEventListener('click', () => {
    const v = btn.dataset.val;
    state[stateKey] = state[stateKey] === v ? '' : v;
    $$(sel + ' .opt-chip').forEach(b => b.classList.toggle('selected', b.dataset.val === state[stateKey]));
    updateSummary();
  }));
}

// ---------- 渲染：忌口 ----------
function renderRestrictions() {
  $('#restrictionOptions').innerHTML = RESTRICTIONS.map(r =>
    `<button class="restrict-chip" data-key="${r.key}"><span class="ri">${r.icon}</span>${r.label}</button>`).join('');
  $$('#restrictionOptions .restrict-chip').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.key;
    if (state.restrictions.has(key)) { state.restrictions.delete(key); btn.classList.remove('selected'); }
    else { state.restrictions.add(key); btn.classList.add('selected'); }
    updateSummary();
  }));
}

// ---------- 摘要 & 按钮状态 ----------
function updateSummary() {
  $('#selectedCount').textContent = state.ingredients.size;
  const lines = [];
  if (state.ingredients.size) {
    lines.push(`<div class="summary-line"><b>食材</b><div class="summary-tags">${[...state.ingredients].map(i => `<span>${i}</span>`).join('')}</div></div>`);
  }
  const prefs = [];
  if (state.spicy) prefs.push('辣度：' + state.spicy);
  if (state.flavor) prefs.push('口味：' + state.flavor);
  if (state.difficulty) prefs.push('难度：' + state.difficulty);
  if (state.meal) prefs.push(MEALS.find(m => m.key === state.meal).label);
  prefs.push(`份量：${state.servings} 人`);
  lines.push(`<div class="summary-line"><b>偏好</b><span>${prefs.join(' · ')}</span></div>`);
  if (state.restrictions.size) {
    const labels = [...state.restrictions].map(k => RESTRICTIONS.find(r => r.key === k).label);
    lines.push(`<div class="summary-line"><b>忌口</b><span style="color:#A32D2D">${labels.join('、')}</span></div>`);
  }
  $('#summaryBody').innerHTML = lines.length ? lines.join('') : '<p class="empty-hint">还没有选择食材，左侧勾选后这里会显示你的偏好摘要。</p>';
  updateCookButton();
}

function updateCookButton() {
  const ok = state.ingredients.size > 0;
  $('#cookBtn').disabled = !ok;
  $('#cookHint').textContent = ok ? `将基于 ${state.ingredients.size} 种食材为你智能配菜` : '请先至少选择 1 种食材';
}

// ---------- 推荐引擎 ----------
function recommend() {
  // 1) 忌口硬性过滤
  const filtered = RECIPES.filter(r => {
    const rs = state.restrictions;
    if (rs.has('vegetarian') && r.main && !r.is.includes('vegetarian')) {
      // 素食：允许纯素/含蛋奶的素食食谱，通过 is 标记判断
      if (!r.is.includes('vegetarian')) return false;
    }
    if (rs.has('lowfat') && !r.is.includes('lowfat')) return false;
    if (rs.has('noSpicy') && r.spicy > 0) return false;
    if (rs.has('noSeafood') && r.contains.includes('seafood')) return false;
    if (rs.has('noPeanut') && r.contains.includes('peanut')) return false;
    if (rs.has('noDairy') && r.contains.includes('dairy')) return false;
    return true;
  });

  // 2) 四维打分
  const scored = filtered.map(r => {
    // 食材匹配度 (40)：已有食材命中食谱所需食材的比例
    const hit = r.ingredients.filter(i => state.ingredients.has(i)).length;
    const ingredientScore = r.ingredients.length ? (hit / r.ingredients.length) * 40 : 0;
    // 食材缺失惩罚：完全没命中直接降为低分
    const baseIngredient = hit === 0 ? 0 : ingredientScore;

    // 口味契合度 (25)
    let flavorScore = 0;
    if (state.flavor) flavorScore = r.flavors.includes(state.flavor) ? 25 : 8;
    else flavorScore = 15;
    if (state.spicy) {
      const sIdx = SPICY_LEVELS.indexOf(state.spicy);
      const diff = Math.abs(r.spicy - sIdx);
      flavorScore = Math.max(0, flavorScore - diff * 6);
    }

    // 营养均衡度 (20)：有蛋白质来源 + 蔬菜 + 低油偏高
    let nutritionScore = 10;
    const hasProtein = r.tags.some(t => t.includes('高蛋白')) || r.nutrition.protein >= 15;
    const hasVeg = r.ingredients.some(i => INGREDIENT_CATEGORIES[0].items.includes(i));
    if (hasProtein) nutritionScore += 5;
    if (hasVeg) nutritionScore += 3;
    if (r.is.includes('lowfat')) nutritionScore += 2;
    nutritionScore = Math.min(20, nutritionScore);

    // 难度/时长匹配 (15)
    let diffScore = 12;
    if (state.difficulty) {
      const target = DIFFICULTIES.indexOf(state.difficulty);
      const actual = DIFFICULTIES.indexOf(r.difficulty);
      diffScore = Math.max(0, 15 - Math.abs(target - actual) * 7);
    }
    // 时间偏好：时间越短略微加分（快手场景）
    if (r.time <= 15) diffScore += 0; else if (r.time > 40) diffScore -= 3;
    diffScore = Math.max(0, Math.min(15, diffScore));

    // 餐次匹配（作为小幅加成）
    let mealBonus = 0;
    if (state.meal && r.meal.includes(state.meal)) mealBonus = 4;

    // 换一批种子带来的轻微扰动（ +/- 3 分）
    const jitter = state.shuffleSeed ? ((r.id * 37 + state.shuffleSeed * 13) % 7) - 3 : 0;

    let rawTotal = baseIngredient + flavorScore + nutritionScore + diffScore + mealBonus + jitter;
    // 完全没用到任何所选食材的食谱降权，避免无关推荐冒头
    if (hit === 0) rawTotal *= 0.55;
    const total = Math.max(0, Math.min(100, rawTotal));
    return {
      recipe: r, total: Math.round(total),
      detail: { ingredient: Math.round(baseIngredient), flavor: Math.round(flavorScore), nutrition: Math.round(nutritionScore), difficulty: Math.round(diffScore) },
      hit, missing: r.ingredients.filter(i => !state.ingredients.has(i))
    };
  });

  // 3) 排序 + 同批主食材去重 + 取 Top 5
  scored.sort((a, b) => b.total - a.total);
  const seenMain = new Set();
  const top = [];
  for (const item of scored) {
    if (item.total < 12) continue;              // 过滤掉匹配度极低的
    if (seenMain.has(item.recipe.main)) continue; // 主食材去重
    seenMain.add(item.recipe.main);
    top.push(item);
    if (top.length >= 5) break;
  }
  return top;
}

// ---------- 推荐理由生成 ----------
function makeReason(item) {
  const r = item.recipe;
  const parts = [];
  if (item.hit > 0) parts.push(`用到了你 ${item.hit} 样食材`);
  if (r.time <= 15) parts.push(`${r.time} 分钟出锅`);
  if (r.tags.includes('高蛋白')) parts.push('高蛋白');
  if (r.is.includes('lowfat')) parts.push('低脂');
  if (r.tags.includes('快手菜')) parts.push('快手');
  if (state.flavor && r.flavors.includes(state.flavor)) parts.push(`符合你的${state.flavor}口味`);
  if (!parts.length) parts.push('营养均衡，值得一试');
  return parts.slice(0, 4).join(' · ');
}

// ---------- 渲染推荐结果 ----------
function runRecommend() {
  $('#selectionSummary').classList.add('hidden');
  $('#results').classList.add('hidden');
  $('#thinking').classList.remove('hidden');
  $('#thinking').scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    state.currentResults = recommend();
    $('#thinking').classList.add('hidden');
    $('#results').classList.remove('hidden');
    renderResults();
  }, 850);
}

function renderResults() {
  const list = $('#recipeList');
  const items = state.currentResults;
  $('#noResult').classList.toggle('hidden', items.length > 0);
  list.innerHTML = '';

  $('#resultsMeta').textContent = items.length
    ? `基于 ${state.ingredients.size} 种食材 · 为你精选 ${items.length} 道菜`
    : '';

  items.forEach((item, idx) => {
    const r = item.recipe;
    const isFav = state.favorites.includes(r.id);
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.style.animationDelay = (idx * 0.06) + 's';
    card.innerHTML = `
      <div class="recipe-emoji">${r.emoji}</div>
      <div class="recipe-info">
        <div class="recipe-title-row">
          <span class="recipe-name">${r.name}</span>
          <span class="match-badge">匹配度 ${item.total}%</span>
        </div>
        <div class="recipe-reason">✨ ${makeReason(item)}</div>
        <div class="recipe-desc">${r.desc}</div>
        <div class="recipe-meta">
          <span>⏱️ ${r.time} 分钟</span>
          <span>📊 ${r.difficulty}</span>
          <span>🔥 ${Math.round(r.nutrition.calories * state.servings / 2)} kcal</span>
          ${r.tags.slice(0,2).map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="recipe-actions">
          <button class="btn btn-primary btn-sm detail-btn">查看做法</button>
          <button class="btn btn-sm fav-heart ${isFav ? 'active' : ''}" title="收藏">${isFav ? '♥ 已收藏' : '♡ 收藏'}</button>
          <button class="btn btn-sm why-btn">📈 为什么推荐</button>
        </div>
        <div class="why-box hidden"></div>
      </div>`;

    card.querySelector('.detail-btn').addEventListener('click', () => openDetail(r));
    const favBtn = card.querySelector('.fav-heart');
    favBtn.addEventListener('click', () => { toggleFavorite(r.id); renderResults(); });
    const whyBtn = card.querySelector('.why-btn');
    const whyBox = card.querySelector('.why-box');
    whyBtn.addEventListener('click', () => {
      const open = whyBox.classList.toggle('hidden');
      if (!open) {
        const d = item.detail;
        const max = { ingredient: 40, flavor: 25, nutrition: 20, difficulty: 15 };
        whyBox.innerHTML = `
          <div class="why-row"><span>食材匹配</span><div class="why-bar"><i style="width:${d.ingredient/max.ingredient*100}%"></i></div><b>${d.ingredient}/40</b></div>
          <div class="why-row"><span>口味契合</span><div class="why-bar"><i style="width:${d.flavor/max.flavor*100}%"></i></div><b>${d.flavor}/25</b></div>
          <div class="why-row"><span>营养均衡</span><div class="why-bar"><i style="width:${d.nutrition/max.nutrition*100}%"></i></div><b>${d.nutrition}/20</b></div>
          <div class="why-row"><span>难度时长</span><div class="why-bar"><i style="width:${d.difficulty/max.difficulty*100}%"></i></div><b>${d.difficulty}/15</b></div>
          <p style="margin-top:8px;color:var(--ink-3);font-size:11px">${item.missing.length ? '还需补充：' + item.missing.join('、') : '食材齐全，可以直接开做！'}</p>`;
      }
    });
    list.appendChild(card);
  });
}

// ---------- 食谱详情弹窗 ----------
function openDetail(r) {
  const missing = r.ingredients.filter(i => !state.ingredients.has(i));
  const nutri = r.nutrition;
  const factor = state.servings / 2;
  $('#detailContent').innerHTML = `
    <div class="detail-hero">
      <div class="detail-emoji">${r.emoji}</div>
      <div>
        <h2>${r.name}</h2>
        <p style="color:var(--ink-2)">${r.desc}</p>
        <div class="detail-tags">
          <span class="tag">⏱️ ${r.time} 分钟</span>
          <span class="tag">📊 ${r.difficulty}</span>
          ${r.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="detail-section">
      <h4>🛒 用料（${state.servings} 人份）</h4>
      <div class="ing-list">
        ${r.ingredients.map(i => `<span class="${missing.includes(i) ? 'missing' : ''}">${i}${missing.includes(i) ? ' · 需购买' : ' · 已有'}</span>`).join('')}
      </div>
    </div>
    <div class="detail-section">
      <h4>👨‍🍳 做法步骤</h4>
      <ol class="step-list">${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>
    </div>
    <div class="detail-section">
      <h4>💡 AI 小贴士</h4>
      <div class="tip-box">${r.tip}</div>
    </div>
    <div class="detail-section">
      <h4>📊 营养分析（每 2 人份参考值）</h4>
      <div class="nutri-mini">
        <div><b>${Math.round(nutri.calories*factor)}</b><span>热量 kcal</span></div>
        <div><b>${(nutri.protein*factor).toFixed(1)}</b><span>蛋白质 g</span></div>
        <div><b>${(nutri.fat*factor).toFixed(1)}</b><span>脂肪 g</span></div>
        <div><b>${(nutri.carbs*factor).toFixed(1)}</b><span>碳水 g</span></div>
      </div>
    </div>`;
  $('#detailModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  $('#detailModal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ---------- 收藏 ----------
function toggleFavorite(id) {
  const i = state.favorites.indexOf(id);
  if (i >= 0) { state.favorites.splice(i, 1); toast('已取消收藏'); }
  else { state.favorites.push(id); toast('已加入收藏 ❤️'); }
  saveLS('sgj_favorites', state.favorites);
  updateFavCount();
  renderFavorites();
}

function updateFavCount() { $('#favCount').textContent = state.favorites.length; }

function renderFavorites() {
  updateFavCount();
  const items = state.favorites.map(id => RECIPES.find(r => r.id === id)).filter(Boolean);
  $('#favEmpty').classList.toggle('hidden', items.length > 0);
  $('#favContent').classList.toggle('hidden', items.length === 0);
  const grid = $('#favGrid');
  grid.innerHTML = '';
  items.forEach(r => {
    const card = document.createElement('div');
    card.className = 'fav-card';
    card.innerHTML = `
      <button class="fav-remove" title="移除">✕</button>
      <div class="fav-emoji">${r.emoji}</div>
      <h4>${r.name}</h4>
      <p>⏱️ ${r.time} 分钟 · ${r.difficulty}</p>`;
    card.querySelector('.fav-remove').addEventListener('click', () => toggleFavorite(r.id));
    card.addEventListener('click', (e) => { if (!e.target.classList.contains('fav-remove')) openDetail(r); });
    grid.appendChild(card);
  });
}

// ---------- 一周菜单 ----------
function generateWeekMenu() {
  const favRecipes = state.favorites.map(id => RECIPES.find(r => r.id === id)).filter(Boolean);
  if (!favRecipes.length) { toast('请先收藏至少一道菜'); return; }

  // 循环填充 7 天，尽量不重复主食材
  const pool = [...favRecipes];
  const menu = [];
  const usedMain = new Set();
  for (let d = 0; d < 7; d++) {
    let pick = pool.find(r => !usedMain.has(r.main));
    if (!pick) pick = pool[d % pool.length];
    usedMain.add(pick.main);
    menu.push(pick.id);
  }
  state.weekMenu = menu;
  saveLS('sgj_week', menu);
  renderWeekMenu();
  $('#weekSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  toast('一周菜单已生成 📅');
}

function renderWeekMenu() {
  if (!state.weekMenu) return;
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const recipes = state.weekMenu.map(id => RECIPES.find(r => r.id === id)).filter(Boolean);

  $('#weekGrid').innerHTML = recipes.map((r, i) => `
    <div class="day-card">
      <div class="day-name">${days[i]}</div>
      <div class="day-emoji">${r.emoji}</div>
      <div class="day-dish">${r.name}</div>
      <div class="day-kcal">${Math.round(r.nutrition.calories)} kcal</div>
    </div>`).join('');

  // 营养汇总平均
  const avg = recipes.reduce((a, r) => ({
    calories: a.calories + r.nutrition.calories / 7,
    protein: a.protein + r.nutrition.protein / 7,
    fat: a.fat + r.nutrition.fat / 7,
    carbs: a.carbs + r.nutrition.carbs / 7
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
  const targets = { calories: 2000, protein: 75, fat: 70, carbs: 300 };
  const bars = [
    { label: '日均热量', val: avg.calories, max: targets.calories, unit: 'kcal', color: 'var(--orange)' },
    { label: '蛋白质', val: avg.protein, max: targets.protein, unit: 'g', color: 'var(--green)' },
    { label: '脂肪', val: avg.fat, max: targets.fat, unit: 'g', color: 'var(--yellow)' },
    { label: '碳水', val: avg.carbs, max: targets.carbs, unit: 'g', color: '#8B5CF6' }
  ];
  $('#nutritionSummary').innerHTML = `<h4>📈 一周营养概览（每日平均）</h4><div class="nutri-bars">${bars.map(b => `
    <div class="nutri-bar-item">
      <span>${b.label}</span>
      <div class="track"><i style="width:${Math.min(100,b.val/b.max*100)}%;background:${b.color}"></i></div>
      <b>${Math.round(b.val)} ${b.unit}</b>
    </div>`).join('')}</div>`;

  // 购物清单：汇总所有食谱中用户没有的食材
  const need = new Set();
  recipes.forEach(r => r.ingredients.forEach(i => { if (!state.ingredients.has(i)) need.add(i); }));
  $('#shoppingList').innerHTML = `<h4>🛒 购物清单（还需购买 ${need.size} 样）</h4>
    <div class="shopping-items">${need.size ? [...need].map(i => `<span>${i}</span>`).join('') : '<span style="background:var(--green-light)">食材齐全，无需购买 🎉</span>'}</div>`;

  $('#weekSection').classList.remove('hidden');
}

// ---------- 导出 ----------
function copyShoppingList() {
  if (!state.weekMenu) { toast('请先生成一周菜单'); return; }
  const recipes = state.weekMenu.map(id => RECIPES.find(r => r.id === id)).filter(Boolean);
  const need = new Set();
  recipes.forEach(r => r.ingredients.forEach(i => { if (!state.ingredients.has(i)) need.add(i); }));
  const text = `【AI 食光机 · 一周菜单】\n` +
    recipes.map((r, i) => `${['周一','周二','周三','周四','周五','周六','周日'][i]}：${r.name}`).join('\n') +
    `\n\n【购物清单】\n${need.size ? [...need].join('、') : '食材齐全，无需购买'}`;
  navigator.clipboard.writeText(text).then(() => toast('购物清单已复制 📋'))
    .catch(() => toast('复制失败，请手动选择文本'));
}

function printMenu() {
  if (!state.weekMenu) { toast('请先生成一周菜单'); return; }
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const recipes = state.weekMenu.map(id => RECIPES.find(r => r.id === id)).filter(Boolean);
  $('#printArea').innerHTML = `
    <div class="print-head">
      <h1>🍳 AI 食光机 · 一周菜单</h1>
      <p>《人工智能基础与应用》课程大作业</p>
    </div>
    <table class="print-week">
      <tr><th>星期</th><th>菜品</th><th>用时</th><th>难度</th><th>热量</th></tr>
      ${recipes.map((r, i) => `<tr><td>${days[i]}</td><td>${r.emoji} ${r.name}</td><td>${r.time} 分钟</td><td>${r.difficulty}</td><td>${r.nutrition.calories} kcal</td></tr>`).join('')}
    </table>
    <h3>购物清单</h3>
    <div class="print-list">${recipes.map(r => r.ingredients.join('、')).join('；')}</div>`;
  window.print();
}

// ---------- 事件绑定 ----------
function bindEvents() {
  $('#ingredientSearch').addEventListener('input', e => renderIngredientGroups(e.target.value));
  $('#servingPlus').addEventListener('click', () => { state.servings = Math.min(6, state.servings + 1); $('#servingValue').textContent = state.servings; updateSummary(); });
  $('#servingMinus').addEventListener('click', () => { state.servings = Math.max(1, state.servings - 1); $('#servingValue').textContent = state.servings; updateSummary(); });
  $('#resetBtn').addEventListener('click', resetAll);
  $('#cookBtn').addEventListener('click', () => { state.shuffleSeed = 0; runRecommend(); });
  $('#shuffleBtn').addEventListener('click', () => { state.shuffleSeed++; runRecommend(); });
  $$('[data-close]').forEach(el => el.addEventListener('click', closeDetail));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });
  $('#genWeekBtn').addEventListener('click', generateWeekMenu);
  $('#clearFavBtn').addEventListener('click', () => {
    if (!state.favorites.length) { toast('收藏夹已经是空的'); return; }
    state.favorites = []; state.weekMenu = null;
    saveLS('sgj_favorites', []); saveLS('sgj_week', null);
    $('#weekSection').classList.add('hidden');
    renderFavorites();
    if (!$('#results').classList.contains('hidden')) renderResults();
    toast('已清空收藏');
  });
  $('#copyListBtn').addEventListener('click', copyShoppingList);
  $('#printBtn').addEventListener('click', printMenu);
}

function resetAll() {
  state.ingredients.clear(); state.spicy = state.flavor = state.difficulty = state.meal = '';
  state.servings = 2; state.restrictions.clear(); state.shuffleSeed = 0;
  $$('.ing-chip').forEach(b => b.classList.remove('selected'));
  $$('.opt-chip').forEach(b => b.classList.remove('selected'));
  $$('.restrict-chip').forEach(b => b.classList.remove('selected'));
  $('#servingValue').textContent = '2';
  $('#ingredientSearch').value = '';
  renderIngredientGroups();
  $('#results').classList.add('hidden');
  $('#selectionSummary').classList.remove('hidden');
  updateSummary();
  window.scrollTo({ top: $('#input').offsetTop, behavior: 'smooth' });
  toast('已重置选择');
}

// ---------- 启动 ----------
document.addEventListener('DOMContentLoaded', init);
