/* ============================================================
 * AI 食光机 - 数据文件
 * 食材库 + 食谱库（纯前端静态数据，无网络请求）
 * 字段说明见 README.md
 * ============================================================ */

// 食材库：6 大类，共 46 种
const INGREDIENT_CATEGORIES = [
  { name: '蔬菜类', icon: '🥬', items: ['西红柿', '黄瓜', '胡萝卜', '土豆', '青椒', '西兰花', '菠菜', '白菜', '茄子', '蘑菇', '洋葱', '生菜', '玉米', '南瓜', '冬瓜'] },
  { name: '肉禽蛋类', icon: '🥩', items: ['鸡蛋', '鸡胸肉', '猪肉', '牛肉', '鸡翅', '培根'] },
  { name: '水产类', icon: '🐟', items: ['虾', '鲈鱼', '三文鱼', '金枪鱼'] },
  { name: '主食豆类', icon: '🍚', items: ['米饭', '面条', '馒头', '吐司', '豆腐', '燕麦'] },
  { name: '乳品坚果', icon: '🥛', items: ['牛奶', '酸奶', '奶酪', '花生', '核桃', '杏仁'] },
  { name: '调味果蔬', icon: '🧄', items: ['大蒜', '生姜', '小葱', '辣椒', '柠檬', '苹果', '香蕉', '草莓'] }
];

// 辣度枚举
const SPICY_LEVELS = ['不辣', '微辣', '中辣', '重辣'];
// 口味倾向
const FLAVORS = ['清淡', '咸鲜', '酸甜', '香辣'];
// 难度
const DIFFICULTIES = ['简单', '中等', '进阶'];
// 忌口/过敏原（用于硬性过滤）
const RESTRICTIONS = [
  { key: 'vegetarian', label: '素食', icon: '🌱' },
  { key: 'lowfat', label: '低脂', icon: '🪶' },
  { key: 'noSpicy', label: '忌辣', icon: '🚫🌶️' },
  { key: 'noSeafood', label: '海鲜过敏', icon: '🦐' },
  { key: 'noPeanut', label: '花生过敏', icon: '🥜' },
  { key: 'noDairy', label: '乳制品过敏', icon: '🥛' }
];

// 餐次
const MEALS = [
  { key: 'breakfast', label: '早餐', icon: '🌅' },
  { key: 'lunch', label: '午餐', icon: '☀️' },
  { key: 'dinner', label: '晚餐', icon: '🌙' },
  { key: 'snack', label: '加餐', icon: '🍪' }
];

/*
 * 食谱库：25 条
 * 每条字段：
 *  id, name, emoji, desc, ingredients:[主食材], missingHint(自动算),
 *  steps:[步骤], time(分钟), difficulty, spicy, flavors:[标签],
 *  meal:[适用餐次], tags:[标签], nutrition:{calories,protein,fat,carbs},
 *  restrictions:[不含/冲突标记] 用于过滤：
 *    - vegetarian: 该食谱是素食
 *    - seafood/peanut/dairy: 含过敏原
 *    - spicy: 含辣
 *    - lowfat: 属于低脂
 *  main: 主食材（用于同批去重）
 */
const RECIPES = [
  {
    id: 1, name: '番茄炒蛋', emoji: '🍅', desc: '国民家常菜，酸甜开胃，10 分钟搞定',
    ingredients: ['西红柿', '鸡蛋', '小葱'], time: 12, difficulty: '简单', spicy: 0,
    flavors: ['酸甜', '咸鲜'], meal: ['lunch', 'dinner'], tags: ['快手菜', '高蛋白', '下饭'],
    main: '鸡蛋', contains: [], is: ['lowfat'],
    nutrition: { calories: 220, protein: 13, fat: 14, carbs: 10 },
    steps: ['西红柿切块，鸡蛋打散加少许盐', '热油炒蛋至凝固盛出', '爆香葱花，下西红柿炒出汁', '倒入鸡蛋翻炒均匀，加盐糖调味即可'],
    tip: '加一小勺糖能中和西红柿的酸味，味道更柔和。'
  },
  {
    id: 2, name: '蒜蓉西兰花', emoji: '🥦', desc: '清爽低脂，健身餐常客',
    ingredients: ['西兰花', '大蒜'], time: 10, difficulty: '简单', spicy: 0,
    flavors: ['清淡', '咸鲜'], meal: ['lunch', 'dinner'], tags: ['素食', '低脂', '快手菜'],
    main: '西兰花', contains: [], is: ['vegetarian', 'lowfat'],
    nutrition: { calories: 120, protein: 6, fat: 5, carbs: 12 },
    steps: ['西兰花掰小朵，焯水 2 分钟', '热油爆香蒜末', '下西兰花大火快炒', '加盐调味，勾薄芡出锅'],
    tip: '焯水时加几滴油，西兰花会更翠绿。'
  },
  {
    id: 3, name: '香煎鸡胸肉', emoji: '🍗', desc: '高蛋白低脂，增肌减脂首选',
    ingredients: ['鸡胸肉', '柠檬', '大蒜'], time: 18, difficulty: '简单', spicy: 0,
    flavors: ['清淡', '咸鲜'], meal: ['lunch', 'dinner'], tags: ['高蛋白', '低脂', '健身餐'],
    main: '鸡胸肉', contains: [], is: ['lowfat'],
    nutrition: { calories: 260, protein: 38, fat: 8, carbs: 3 },
    steps: ['鸡胸肉切片，用盐、黑胡椒、柠檬汁腌 10 分钟', '平底锅刷薄油', '中火煎至两面金黄', '静置 3 分钟后切条'],
    tip: '煎好后静置再切，肉汁不会流失，口感更嫩。'
  },
  {
    id: 4, name: '酸汤肥牛', emoji: '🥩', desc: '酸辣过瘾，米饭杀手',
    ingredients: ['牛肉', '西红柿', '辣椒', '小葱'], time: 25, difficulty: '中等', spicy: 2,
    flavors: ['香辣', '酸甜'], meal: ['lunch', 'dinner'], tags: ['下饭', '重口味'],
    main: '牛肉', contains: [], is: [],
    nutrition: { calories: 420, protein: 28, fat: 28, carbs: 14 },
    steps: ['肥牛卷焯水去沫', '西红柿炒出汁，加辣椒煮开', '下肥牛煮 2 分钟', '加盐调味，撒葱花'],
    tip: '用金汤酸菜代替西红柿，就是另一道经典酸汤肥牛。'
  },
  {
    id: 5, name: '清蒸鲈鱼', emoji: '🐟', desc: '鲜嫩清淡，低脂高蛋白',
    ingredients: ['鲈鱼', '生姜', '小葱'], time: 20, difficulty: '中等', spicy: 0,
    flavors: ['清淡', '咸鲜'], meal: ['lunch', 'dinner'], tags: ['低脂', '高蛋白', '宴客'],
    main: '鲈鱼', contains: ['seafood'], is: ['lowfat'],
    nutrition: { calories: 180, protein: 30, fat: 5, carbs: 2 },
    steps: ['鲈鱼处理干净，两面划刀', '铺姜片葱段，水开后蒸 8 分钟', '倒掉盘中腥水，换新葱丝', '淋热油和蒸鱼豉油'],
    tip: '蒸的时间别超过 10 分钟，鱼肉才嫩。'
  },
  {
    id: 6, name: '金枪鱼沙拉', emoji: '🥗', desc: '轻食代餐，清爽无负担',
    ingredients: ['金枪鱼', '生菜', '黄瓜', '西红柿'], time: 10, difficulty: '简单', spicy: 0,
    flavors: ['清淡'], meal: ['lunch', 'snack'], tags: ['低脂', '高蛋白', '轻食'],
    main: '金枪鱼', contains: ['seafood'], is: ['lowfat'],
    nutrition: { calories: 210, protein: 24, fat: 8, carbs: 12 },
    steps: ['生菜洗净撕小块', '黄瓜西红柿切丁', '金枪鱼沥干水分', '所有材料拌匀，淋油醋汁'],
    tip: '用橄榄油+柠檬汁+黑胡椒调汁，比沙拉酱更健康。'
  },
  {
    id: 7, name: '麻婆豆腐', emoji: '🌶️', desc: '麻辣鲜香，川菜经典',
    ingredients: ['豆腐', '猪肉', '辣椒', '小葱'], time: 20, difficulty: '中等', spicy: 3,
    flavors: ['香辣', '咸鲜'], meal: ['lunch', 'dinner'], tags: ['下饭', '重口味'],
    main: '豆腐', contains: [], is: [],
    nutrition: { calories: 290, protein: 18, fat: 18, carbs: 12 },
    steps: ['豆腐切块焯水', '肉末炒散，下豆瓣酱和辣椒炒红油', '加水煮开，下豆腐', '勾芡收汁，撒花椒粉葱花'],
    tip: '豆腐焯水后不易碎，且能去豆腥味。'
  },
  {
    id: 8, name: '酸奶水果杯', emoji: '🍓', desc: '5 分钟早餐，颜值与营养并存',
    ingredients: ['酸奶', '草莓', '香蕉', '杏仁'], time: 5, difficulty: '简单', spicy: 0,
    flavors: ['酸甜'], meal: ['breakfast', 'snack'], tags: ['快手菜', '素食', '早餐'],
    main: '酸奶', contains: ['dairy'], is: ['vegetarian'],
    nutrition: { calories: 230, protein: 10, fat: 8, carbs: 30 },
    steps: ['草莓香蕉切块', '杯中铺一层酸奶', '加入水果和杏仁碎', '重复层次，顶部点缀草莓'],
    tip: '用希腊酸奶蛋白质更高，饱腹感更强。'
  },
  {
    id: 9, name: '西红柿鸡蛋面', emoji: '🍜', desc: '一碗暖心汤面，简单又满足',
    ingredients: ['面条', '西红柿', '鸡蛋', '小葱'], time: 15, difficulty: '简单', spicy: 0,
    flavors: ['酸甜', '咸鲜'], meal: ['breakfast', 'lunch'], tags: ['快手菜', '暖胃'],
    main: '面条', contains: [], is: [],
    nutrition: { calories: 380, protein: 15, fat: 12, carbs: 52 },
    steps: ['西红柿炒出汁，加水煮开', '下面条煮熟', '淋入蛋液成蛋花', '加盐调味，撒葱花'],
    tip: '面条煮到刚断生就关火，口感更筋道。'
  },
  {
    id: 10, name: '凉拌黄瓜', emoji: '🥒', desc: '清爽解腻，3 分钟上桌',
    ingredients: ['黄瓜', '大蒜', '辣椒'], time: 5, difficulty: '简单', spicy: 1,
    flavors: ['清淡', '咸鲜'], meal: ['lunch', 'dinner', 'snack'], tags: ['素食', '低脂', '快手菜'],
    main: '黄瓜', contains: [], is: ['vegetarian', 'lowfat'],
    nutrition: { calories: 70, protein: 2, fat: 4, carbs: 6 },
    steps: ['黄瓜拍碎切段', '加蒜末、辣椒、盐、醋', '淋热油激香', '拌匀腌制 5 分钟'],
    tip: '拍比切更入味，这是凉拌黄瓜好吃的关键。'
  },
  {
    id: 11, name: '土豆炖牛肉', emoji: '🥘', desc: '软烂入味，经典炖菜',
    ingredients: ['土豆', '牛肉', '胡萝卜', '洋葱'], time: 45, difficulty: '中等', spicy: 0,
    flavors: ['咸鲜'], meal: ['lunch', 'dinner'], tags: ['高蛋白', '下饭'],
    main: '牛肉', contains: [], is: [],
    nutrition: { calories: 460, protein: 32, fat: 22, carbs: 32 },
    steps: ['牛肉切块焯水', '洋葱炒香，下牛肉翻炒', '加开水没过牛肉，炖 30 分钟', '加土豆胡萝卜再炖 15 分钟，收汁调味'],
    tip: '炖肉一定加开水，冷水会让肉质收缩变柴。'
  },
  {
    id: 12, name: '牛奶燕麦粥', emoji: '🥣', desc: '饱腹早餐，暖胃又营养',
    ingredients: ['燕麦', '牛奶', '香蕉'], time: 8, difficulty: '简单', spicy: 0,
    flavors: ['酸甜'], meal: ['breakfast'], tags: ['素食', '快手菜', '早餐', '低脂'],
    main: '燕麦', contains: ['dairy'], is: ['vegetarian', 'lowfat'],
    nutrition: { calories: 300, protein: 12, fat: 6, carbs: 48 },
    steps: ['牛奶加燕麦小火煮 5 分钟', '不断搅拌防粘锅', '香蕉切片铺面', '可加少许蜂蜜调味'],
    tip: '用隔夜燕麦法：燕麦+牛奶冷藏一夜，早上直接吃，更省时。'
  },
  {
    id: 13, name: '蒜香虾', emoji: '🍤', desc: '鲜香弹牙，宴客硬菜',
    ingredients: ['虾', '大蒜', '柠檬'], time: 15, difficulty: '简单', spicy: 0,
    flavors: ['咸鲜'], meal: ['lunch', 'dinner'], tags: ['高蛋白', '低脂', '快手菜'],
    main: '虾', contains: ['seafood'], is: ['lowfat'],
    nutrition: { calories: 200, protein: 30, fat: 7, carbs: 4 },
    steps: ['虾去壳开背去虾线', '大量蒜末爆香', '下虾煎至变色卷曲', '挤柠檬汁，加盐调味'],
    tip: '虾变色卷曲就熟了，久炒会老。'
  },
  {
    id: 14, name: '手撕包菜', emoji: '🥬', desc: '脆爽微辣，家常下饭菜',
    ingredients: ['白菜', '辣椒', '大蒜'], time: 12, difficulty: '简单', spicy: 1,
    flavors: ['咸鲜', '香辣'], meal: ['lunch', 'dinner'], tags: ['素食', '低脂', '快手菜'],
    main: '白菜', contains: [], is: ['vegetarian', 'lowfat'],
    nutrition: { calories: 110, protein: 4, fat: 6, carbs: 10 },
    steps: ['包菜手撕成片洗净沥干', '爆香蒜末干辣椒', '大火下包菜快炒', '加盐和少许醋炒匀'],
    tip: '手撕比刀切断面粗糙，更容易入味。'
  },
  {
    id: 15, name: '虾仁滑蛋', emoji: '🍳', desc: '嫩滑鲜香，粤式经典',
    ingredients: ['虾', '鸡蛋', '小葱'], time: 12, difficulty: '中等', spicy: 0,
    flavors: ['清淡', '咸鲜'], meal: ['lunch', 'dinner'], tags: ['高蛋白', '快手菜'],
    main: '鸡蛋', contains: ['seafood'], is: [],
    nutrition: { calories: 240, protein: 22, fat: 15, carbs: 5 },
    steps: ['虾仁用盐和淀粉抓匀', '鸡蛋加少许水打散', '虾仁炒至变色盛出', '倒入蛋液半凝固时回锅虾仁，轻推成型'],
    tip: '蛋液加水会更嫩滑，小火慢推是滑蛋的精髓。'
  },
  {
    id: 16, name: '南瓜小米粥', emoji: '🎃', desc: '香甜软糯，养胃佳品',
    ingredients: ['南瓜', '米饭', '燕麦'], time: 30, difficulty: '简单', spicy: 0,
    flavors: ['酸甜'], meal: ['breakfast', 'dinner'], tags: ['素食', '低脂', '暖胃'],
    main: '南瓜', contains: [], is: ['vegetarian', 'lowfat'],
    nutrition: { calories: 190, protein: 5, fat: 2, carbs: 40 },
    steps: ['南瓜去皮切块', '加水煮至软烂', '加入燕麦和米饭同煮', '搅至浓稠即可'],
    tip: '小米取代燕麦更传统，煮前浸泡 20 分钟更易开花。'
  },
  {
    id: 17, name: '三文鱼牛油果饭', emoji: '🍣', desc: '高颜值轻食，优质油脂',
    ingredients: ['三文鱼', '米饭', '黄瓜', '柠檬'], time: 20, difficulty: '中等', spicy: 0,
    flavors: ['清淡'], meal: ['lunch', 'dinner'], tags: ['高蛋白', '轻食'],
    main: '三文鱼', contains: ['seafood'], is: [],
    nutrition: { calories: 520, protein: 30, fat: 24, carbs: 48 },
    steps: ['三文鱼切丁用柠檬汁腌 10 分钟', '米饭铺底', '摆上三文鱼和黄瓜片', '淋酱油芥末汁'],
    tip: '选可生食级别三文鱼，介意生食可煎至表面微焦。'
  },
  {
    id: 18, name: '宫保鸡丁', emoji: '🥜', desc: '酸甜微辣，经典川菜',
    ingredients: ['鸡胸肉', '花生', '辣椒', '小葱'], time: 25, difficulty: '中等', spicy: 2,
    flavors: ['香辣', '酸甜'], meal: ['lunch', 'dinner'], tags: ['下饭', '重口味'],
    main: '鸡胸肉', contains: ['peanut'], is: [],
    nutrition: { calories: 390, protein: 28, fat: 22, carbs: 18 },
    steps: ['鸡胸肉切丁腌制', '调碗汁：糖醋酱油淀粉', '爆香辣椒，下鸡丁炒散', '加花生米翻匀，淋碗汁收汁'],
    tip: '花生米最后放，保持酥脆口感。'
  },
  {
    id: 19, name: '香菇滑鸡', emoji: '🍄', desc: '鲜香嫩滑，蒸出来的美味',
    ingredients: ['蘑菇', '鸡胸肉', '生姜', '小葱'], time: 25, difficulty: '简单', spicy: 0,
    flavors: ['咸鲜'], meal: ['lunch', 'dinner'], tags: ['高蛋白', '低脂'],
    main: '鸡胸肉', contains: [], is: ['lowfat'],
    nutrition: { calories: 250, protein: 32, fat: 9, carbs: 8 },
    steps: ['鸡胸肉切块用生抽淀粉腌 15 分钟', '香菇切片', '拌匀后铺盘，水开蒸 15 分钟', '撒葱花淋热油'],
    tip: '腌制时加一点油锁住水分，蒸出来更滑嫩。'
  },
  {
    id: 20, name: '草莓奶昔', emoji: '🍹', desc: '甜蜜下午茶，3 分钟搞定',
    ingredients: ['草莓', '牛奶', '香蕉'], time: 5, difficulty: '简单', spicy: 0,
    flavors: ['酸甜'], meal: ['snack', 'breakfast'], tags: ['快手菜', '素食'],
    main: '草莓', contains: ['dairy'], is: ['vegetarian'],
    nutrition: { calories: 210, protein: 8, fat: 5, carbs: 34 },
    steps: ['草莓香蕉切块', '放入搅拌机', '倒入牛奶', '搅打 1 分钟至顺滑'],
    tip: '加几块冰块搅打，口感更像冰沙。'
  },
  {
    id: 21, name: '红烧茄子', emoji: '🍆', desc: '软糯入味，素菜也下饭',
    ingredients: ['茄子', '大蒜', '辣椒'], time: 20, difficulty: '中等', spicy: 1,
    flavors: ['咸鲜', '香辣'], meal: ['lunch', 'dinner'], tags: ['素食', '下饭'],
    main: '茄子', contains: [], is: ['vegetarian'],
    nutrition: { calories: 260, protein: 5, fat: 16, carbs: 22 },
    steps: ['茄子切条，撒盐腌 10 分钟挤水', '煎至表面金黄', '爆香蒜末，下茄子', '加生抽糖调味收汁'],
    tip: '腌过去掉多余水分，能少吸很多油。'
  },
  {
    id: 22, name: '鸡蛋三明治', emoji: '🥪', desc: '便携早餐，营养均衡',
    ingredients: ['吐司', '鸡蛋', '生菜', '奶酪'], time: 10, difficulty: '简单', spicy: 0,
    flavors: ['咸鲜'], meal: ['breakfast', 'snack'], tags: ['快手菜', '早餐'],
    main: '吐司', contains: ['dairy'], is: [],
    nutrition: { calories: 340, protein: 18, fat: 16, carbs: 32 },
    steps: ['鸡蛋煎成荷包蛋', '吐司烤至微脆', '铺生菜、奶酪、鸡蛋', '对角切开'],
    tip: '用全麦吐司更健康，饱腹感更强。'
  },
  {
    id: 23, name: '玉米排骨汤', emoji: '🌽', desc: '清甜滋补，家常靓汤',
    ingredients: ['玉米', '猪肉', '胡萝卜', '生姜'], time: 50, difficulty: '简单', spicy: 0,
    flavors: ['清淡', '咸鲜'], meal: ['lunch', 'dinner'], tags: ['高蛋白', '暖胃'],
    main: '猪肉', contains: [], is: [],
    nutrition: { calories: 320, protein: 26, fat: 18, carbs: 18 },
    steps: ['排骨焯水去沫', '玉米胡萝卜切段', '所有材料加姜片炖 40 分钟', '出锅前加盐'],
    tip: '盐要最后放，早放会让肉质变紧、汤不鲜。'
  },
  {
    id: 24, name: '杏仁牛奶', emoji: '🥛', desc: '香浓顺滑，睡前一杯',
    ingredients: ['杏仁', '牛奶'], time: 8, difficulty: '简单', spicy: 0,
    flavors: ['酸甜'], meal: ['breakfast', 'snack'], tags: ['素食', '快手菜', '早餐'],
    main: '牛奶', contains: ['dairy', 'peanut'], is: ['vegetarian'],
    nutrition: { calories: 200, protein: 9, fat: 10, carbs: 18 },
    steps: ['杏仁提前泡 10 分钟', '与牛奶一起倒入搅拌机', '搅打 2 分钟', '过滤后饮用'],
    tip: '加一点蜂蜜和肉桂粉，风味更佳。'
  },
  {
    id: 25, name: '清炒时蔬', emoji: '🥬', desc: '少油少盐，回归食材本味',
    ingredients: ['菠菜', '大蒜'], time: 8, difficulty: '简单', spicy: 0,
    flavors: ['清淡'], meal: ['lunch', 'dinner'], tags: ['素食', '低脂', '快手菜'],
    main: '菠菜', contains: [], is: ['vegetarian', 'lowfat'],
    nutrition: { calories: 90, protein: 5, fat: 4, carbs: 8 },
    steps: ['菠菜洗净沥干', '蒜末爆香', '大火下菠菜快炒', '加盐炒至断生立刻出锅'],
    tip: '菠菜含草酸，焯水 30 秒再炒更健康。'
  }
];
