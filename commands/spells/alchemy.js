'use strict'

import Bot from '../../main.js'
import Discord from 'discord.js'

import {
    // Global things related strictly to the server
    TOKEN,
    OWNER,
    GUILD,
    CHANNEL,

    // Rarities
    SPELL_RARITIES,
    ARTICLE_RARITIES,

    // Embed colors
    GHOST_BLUE,
    BOOK_CREAM,

    // Special channel ids
    LOGS_CHANNEL_ID,
    WAXHEAD_CHANNEL_ID,
    SPELLS_SPECIAL_CHANNEL_ID,
    LABYRINTH_OF_KNOWLEDGE_ID,
    ARTICLES_SPECIAL_CHANNEL_ID,

    // Special category ids
    SPELLS,
    ARTICLES,
    SAGE_ONLY_CATEGORY,

    // Special message ids
    WAXHEAD_MESSGE_ID,

    // Role ids
    SAGE,
    WAXHEAD,
    GRAND_LIBRARIAN,
    LOREKEEPER,
    MAGUS,
    ARCHIVIST,
    SCHOLAR,
    ACOLYTE,
    ENTRANT,
    NEOPHYTE,

    ghostWords,
    roleMapping,
    commandSynonyms,
    serverRanksRanked,
    entitiesToExecute,
    spellIncantations,
    commandsToExecute,

    // Bot responses
    responsesDeny,
    sageResponses,
    acceptQuestion,
    responsesAccept,
    rankChangeMessages,
    duplicateResponses,
    nicknameChangeLogs,
    sageNoSpellResponses,
    unknownSpellResponses,
    sageNoArticleResponses,

    // Global widely used functions
    info,
    getUser,
    determineRank,
    getMemberRank,
    levelUpMessages,
    getRankDescriptor,
    getRandomResponse,
    setMemberNickname,
    calculateExperience,

    // Rarely used functions
    pickArticles,
    handleContent,
    searchArticles,
    setPermissions,
    detectRoleInString,
    generateDescription,
    organizeCollectables,
    getRandomResponseAndCheckRoles
} from '../../constants.js'

var knownSupportedEmoji = [
    "1fa84", // 🪄
    "1f600", // 😀
    "1f603", // 😃
    "1f604", // 😄
    "1f601", // 😁
    "1f606", // 😆
    "1f605", // 😅
    "1f602", // 😂
    "1f923", // 🤣
    "1f62d", // 😭
    "1f609", // 😉
    "1f617", // 😗
    "1f619", // 😙
    "1f61a", // 😚
    "1f618", // 😘
    "1f970", // 🥰
    "1f60d", // 😍
    "1f929", // 🤩
    "1f973", // 🥳
    "1f643", // 🙃
    "1f642", // 🙂
    "1f972", // 🥲
    "1f979", // 🥹
    "1f60b", // 😋
    "1f61b", // 😛
    "1f61d", // 😝
    "1f61c", // 😜
    "1f92a", // 🤪
    "1f607", // 😇
    "1f60a", // 😊
    "263a-fe0f", // ☺️
    "1f60f", // 😏
    "1f60c", // 😌
    "1f614", // 😔
    "1f611", // 😑
    "1f610", // 😐
    "1f636", // 😶
    "1fae1", // 🫡
    "1f914", // 🤔
    "1f92b", // 🤫
    "1fae2", // 🫢
    "1f92d", // 🤭
    "1f971", // 🥱
    "1f917", // 🤗
    "1fae3", // 🫣
    "1f631", // 😱
    "1f928", // 🤨
    "1f9d0", // 🧐
    "1f612", // 😒
    "1f644", // 🙄
    "1f62e-200d-1f4a8", // 😮‍💨
    "1f624", // 😤
    "1f620", // 😠
    "1f621", // 😡
    "1f92c", // 🤬
    "1f97a", // 🥺
    "1f61f", // 😟
    "1f625", // 😥
    "1f622", // 😢
    "2639-fe0f", // ☹️
    "1f641", // 🙁
    "1fae4", // 🫤
    "1f615", // 😕
    "1f910", // 🤐
    "1f630", // 😰
    "1f628", // 😨
    "1f627", // 😧
    "1f626", // 😦
    "1f62e", // 😮
    "1f62f", // 😯
    "1f632", // 😲
    "1f633", // 😳
    "1f92f", // 🤯
    "1f62c", // 😬
    "1f613", // 😓
    "1f61e", // 😞
    "1f616", // 😖
    "1f623", // 😣
    "1f629", // 😩
    "1f62b", // 😫
    "1f635", // 😵
    "1fae5", // 🫥
    "1f634", // 😴
    "1f62a", // 😪
    "1f924", // 🤤
    "1f31b", // 🌛
    "1f31c", // 🌜
    "1f31a", // 🌚
    "1f31d", // 🌝
    "1f31e", // 🌞
    "1fae0", // 🫠
    "1f636-200d-1f32b-fe0f", // 😶‍🌫️
    "1f974", // 🥴
    "1f975", // 🥵
    "1f976", // 🥶
    "1f922", // 🤢
    "1f92e", // 🤮
    "1f927", // 🤧
    "1f912", // 🤒
    "1f915", // 🤕
    "1f637", // 😷
    "1f920", // 🤠
    "1f911", // 🤑
    "1f60e", // 😎
    "1f913", // 🤓
    "1f978", // 🥸
    "1f925", // 🤥
    "1f921", // 🤡
    "1f47b", // 👻
    "1f4a9", // 💩
    "1f47d", // 👽
    "1f916", // 🤖
    "1f383", // 🎃
    "1f608", // 😈
    "1f47f", // 👿
    "1f525", // 🔥
    "1f4ab", // 💫
    "2b50", // ⭐
    "1f31f", // 🌟
    "1f4a5", // 💥
    "1f4af", // 💯
    "1fae7", // 🫧
    "1f573-fe0f", // 🕳️
    "1f38a", // 🎊
    "1fa77", // 🩷
    "2764-fe0f", // ❤️
    "1f9e1", // 🧡
    "1f49b", // 💛
    "1f49a", // 💚
    "1fa75", // 🩵
    "1f499", // 💙
    "1f49c", // 💜
    "1f90e", // 🤎
    "1fa76", // 🩶
    "1f5a4", // 🖤
    "1f90d", // 🤍
    "2665-fe0f", // ♥️
    "1f498", // 💘
    "1f49d", // 💝
    "1f496", // 💖
    "1f497", // 💗
    "1f493", // 💓
    "1f49e", // 💞
    "1f495", // 💕
    "1f48c", // 💌
    "1f49f", // 💟
    "2763-fe0f", // ❣️
    "2764-fe0f-200d-1fa79", // ❤️‍🩹
    "1f494", // 💔
    "1f48b", // 💋
    "1f9e0", // 🧠
    "1fac0", // 🫀
    "1fac1", // 🫁
    "1fa78", // 🩸
    "1f9a0", // 🦠
    "1f9b7", // 🦷
    "1f9b4", // 🦴
    "1f480", // 💀
    "1f440", // 👀
    "1f441-fe0f", // 👁️
    "1fae6", // 🫦
    "1f44d", // 👍
    "1f937", // 🤷
    "1f490", // 💐
    "1f339", // 🌹
    "1f33a", // 🌺
    "1f337", // 🌷
    "1f338", // 🌸
    "1f4ae", // 💮
    "1f3f5-fe0f", // 🏵️
    "1f33b", // 🌻
    "1f33c", // 🌼
    "1f341", // 🍁
    "1f344", // 🍄
    "1f331", // 🌱
    "1f33f", // 🌿
    "1f343", // 🍃
    "1f340", // 🍀
    "1fab4", // 🪴
    "1f335", // 🌵
    "1f334", // 🌴
    "1f333", // 🌳
    "1f332", // 🌲
    "1fab9", // 🪹
    "1fab5", // 🪵
    "1faa8", // 🪨
    "26c4", // ⛄
    "1f30a", // 🌊
    "1f32c-fe0f", // 🌬️
    "1f300", // 🌀
    "1f32a-fe0f", // 🌪️
    "1f30b", // 🌋
    "1f3d6-fe0f", // 🏖️
    "26c5", // ⛅
    "2601-fe0f", // ☁️
    "1f327-fe0f", // 🌧️
    "1f329-fe0f", // 🌩️
    "1f4a7", // 💧
    "2602-fe0f", // ☂️
    "26a1", // ⚡
    "1f308", // 🌈
    "2604-fe0f", // ☄️
    "1fa90", // 🪐
    "1f30d", // 🌍
    "1f648", // 🙈
    "1f435", // 🐵
    "1f981", // 🦁
    "1f42f", // 🐯
    "1f431", // 🐱
    "1f436", // 🐶
    "1f43a", // 🐺
    "1f43b", // 🐻
    "1f428", // 🐨
    "1f43c", // 🐼
    "1f42d", // 🐭
    "1f430", // 🐰
    "1f98a", // 🦊
    "1f99d", // 🦝
    "1f437", // 🐷
    "1f984", // 🦄
    "1f422", // 🐢
    "1f429", // 🐩
    "1f410", // 🐐
    "1f98c", // 🦌
    "1f999", // 🦙
    "1f9a5", // 🦥
    "1f994", // 🦔
    "1f987", // 🦇
    "1f989", // 🦉
    "1f426", // 🐦
    "1f414", // 🐔
    "1fabf", // 🪿
    "1f54a-fe0f", // 🕊️
    "1f9a9", // 🦩
    "1f427", // 🐧
    "1f41f", // 🐟
    "1f99e", // 🦞
    "1f980", // 🦀
    "1f419", // 🐙
    "1fab8", // 🪸
    "1f982", // 🦂
    "1f577-fe0f", // 🕷️
    "1f41a", // 🐚
    "1f40c", // 🐌
    "1f997", // 🦗
    "1fab2", // 🪲
    "1fab3", // 🪳
    "1f41d", // 🐝
    "1f41e", // 🐞
    "1f98b", // 🦋
    "1f43e", // 🐾
    "1f353", // 🍓
    "1f352", // 🍒
    "1f349", // 🍉
    "1f34a", // 🍊
    "1f96d", // 🥭
    "1f34d", // 🍍
    "1f34c", // 🍌
    "1f34b", // 🍋
    "1f348", // 🍈
    "1f350", // 🍐
    "1f95d", // 🥝
    "1fad2", // 🫒
    "1fad0", // 🫐
    "1f347", // 🍇
    "1f965", // 🥥
    "1f345", // 🍅
    "1f336-fe0f", // 🌶️
    "1f955", // 🥕
    "1f360", // 🍠
    "1f9c5", // 🧅
    "1f33d", // 🌽
    "1f966", // 🥦
    "1f952", // 🥒
    "1fad1", // 🫑
    "1f951", // 🥑
    "1f9c4", // 🧄
    "1f954", // 🥔
    "1fad8", // 🫘
    "1f330", // 🌰
    "1f95c", // 🥜
    "1f35e", // 🍞
    "1fad3", // 🫓
    "1f950", // 🥐
    "1f96f", // 🥯
    "1f95e", // 🥞
    "1f373", // 🍳
    "1f9c0", // 🧀
    "1f969", // 🥩
    "1f356", // 🍖
    "1f354", // 🍔
    "1f32d", // 🌭
    "1f96a", // 🥪
    "1f968", // 🥨
    "1f35f", // 🍟
    "1fad4", // 🫔
    "1f32e", // 🌮
    "1f32f", // 🌯
    "1f959", // 🥙
    "1f9c6", // 🧆
    "1f958", // 🥘
    "1f35d", // 🍝
    "1f96b", // 🥫
    "1fad5", // 🫕
    "1f963", // 🥣
    "1f957", // 🥗
    "1f372", // 🍲
    "1f35b", // 🍛
    "1f35c", // 🍜
    "1f363", // 🍣
    "1f364", // 🍤
    "1f35a", // 🍚
    "1f371", // 🍱
    "1f359", // 🍙
    "1f358", // 🍘
    "1f365", // 🍥
    "1f960", // 🥠
    "1f367", // 🍧
    "1f368", // 🍨
    "1f366", // 🍦
    "1f370", // 🍰
    "1f382", // 🎂
    "1f9c1", // 🧁
    "1f36c", // 🍬
    "1f36b", // 🍫
    "1f369", // 🍩
    "1f36a", // 🍪
    "1f9c2", // 🧂
    "1f37f", // 🍿
    "1f9cb", // 🧋
    "1f37c", // 🍼
    "1f375", // 🍵
    "2615", // ☕
    "1f9c9", // 🧉
    "1f379", // 🍹
    "1f37d-fe0f", // 🍽️
    "1f6d1", // 🛑
    "1f6a8", // 🚨
    "1f6df", // 🛟
    "2693", // ⚓
    "1f697", // 🚗
    "1f3ce-fe0f", // 🏎️
    "1f695", // 🚕
    "1f68c", // 🚌
    "1f682", // 🚂
    "1f6f8", // 🛸
    "1f680", // 🚀
    "2708-fe0f", // ✈️
    "1f3a2", // 🎢
    "1f3a1", // 🎡
    "1f3aa", // 🎪
    "1f3db-fe0f", // 🏛️
    "1f3df-fe0f", // 🏟️
    "1f3e0", // 🏠
    "1f3d5-fe0f", // 🏕️
    "1f307", // 🌇
    "1f3dd-fe0f", // 🏝️
    "1f388", // 🎈
    "1f380", // 🎀
    "1f381", // 🎁
    "1faa9", // 🪩
    "1f397-fe0f", // 🎗️
    "1f947", // 🥇
    "1f948", // 🥈
    "1f949", // 🥉
    "1f3c5", // 🏅
    "1f396-fe0f", // 🎖️
    "1f3c6", // 🏆
    "26bd", // ⚽
    "26be", // ⚾
    "1f94e", // 🥎
    "1f3c0", // 🏀
    "1f3d0", // 🏐
    "1f3c8", // 🏈
    "1f3c9", // 🏉
    "1f3be", // 🎾
    "1f945", // 🥅
    "1f3f8", // 🏸
    "1f94d", // 🥍
    "1f3cf", // 🏏
    "1f3d1", // 🏑
    "1f3d2", // 🏒
    "1f94c", // 🥌
    "1f6f7", // 🛷
    "1f3bf", // 🎿
    "26f8-fe0f", // ⛸️
    "1f6fc", // 🛼
    "1fa70", // 🩰
    "1f6f9", // 🛹
    "26f3", // ⛳
    "1f3af", // 🎯
    "1f3f9", // 🏹
    "1f94f", // 🥏
    "1fa83", // 🪃
    "1fa81", // 🪁
    "1f93f", // 🤿
    "1f3bd", // 🎽
    "1f94b", // 🥋
    "1f94a", // 🥊
    "1f3b1", // 🎱
    "1f3d3", // 🏓
    "1f3b3", // 🎳
    "265f-fe0f", // ♟️
    "1fa80", // 🪀
    "1f9e9", // 🧩
    "1f3ae", // 🎮
    "1f3b2", // 🎲
    "1f3b0", // 🎰
    "1f3b4", // 🎴
    "1f004", // 🀄
    "1f0cf", // 🃏
    "1f4f7", // 📷
    "1f3a8", // 🎨
    "1f58c-fe0f", // 🖌️
    "1f58d-fe0f", // 🖍️
    "1faa1", // 🪡
    "1f9f5", // 🧵
    "1f9f6", // 🧶
    "1f3b9", // 🎹
    "1f3b7", // 🎷
    "1f3ba", // 🎺
    "1f3b8", // 🎸
    "1fa95", // 🪕
    "1f3bb", // 🎻
    "1fa98", // 🪘
    "1f941", // 🥁
    "1fa97", // 🪗
    "1f3a4", // 🎤
    "1f3a7", // 🎧
    "1f399-fe0f", // 🎙️
    "1f4fa", // 📺
    "1f39e-fe0f", // 🎞️
    "1f3ac", // 🎬
    "1f3ad", // 🎭
    "1f39f-fe0f", // 🎟️
    "1f4f1", // 📱
    "260e-fe0f", // ☎️
    "1f50b", // 🔋
    "1faab", // 🪫
    "1f4be", // 💾
    "1f4bf", // 💿
    "1f4b8", // 💸
    "2696-fe0f", // ⚖️
    "1f4a1", // 💡
    "1f9fc", // 🧼
    "1f9e6", // 🧦
    "1f451", // 👑
    "1f48e", // 💎
    "1f6e0-fe0f", // 🛠️
    "26d3-fe0f", // ⛓️
    "1f5d1-fe0f", // 🗑️
    "1f58a-fe0f", // 🖊️
    "2712-fe0f", // ✒️
    "270f-fe0f", // ✏️
    "1f4da", // 📚
    "1f5c3-fe0f", // 🗃️
    "1f4f0", // 📰
    "1f4e3", // 📣
    "1f50e", // 🔎
    "1f52e", // 🔮
    "1f9ff", // 🧿
    "1f5dd-fe0f", // 🗝️
    "1f512", // 🔒
    "2648", // ♈
    "2649", // ♉
    "264a", // ♊
    "264b", // ♋
    "264c", // ♌
    "264d", // ♍
    "264e", // ♎
    "264f", // ♏
    "2650", // ♐
    "2651", // ♑
    "2652", // ♒
    "2653", // ♓
    "26ce", // ⛎
    "2757", // ❗
    "2753", // ❓
    "2049-fe0f", // ⁉️
    "1f198", // 🆘
    "1f4f4", // 📴
    "1f508", // 🔈
    "26a0-fe0f", // ⚠️
    "267b-fe0f", // ♻️
    "2705", // ✅
    "1f195", // 🆕
    "1f193", // 🆓
    "1f199", // 🆙
    "1f197", // 🆗
    "1f192", // 🆒
    "1f6ae", // 🚮
    "262e-fe0f", // ☮️
    "262f-fe0f", // ☯️
    "267e-fe0f", // ♾️
    "2716-fe0f", // ✖️
    "2795", // ➕
    "2796", // ➖
    "2797", // ➗
    "27b0", // ➰
    "27bf", // ➿
    "3030-fe0f", // 〰️
    "00a9-fe0f", // ©️
    "00ae-fe0f", // ®️
    "2122-fe0f", // ™️
    "2660-fe0f", // ♠️
    "1f5ef-fe0f", // 🗯️
    "1f4ac", // 💬
]

const EMOJIS = {
    "100": "💯",
    "1234": "🔢",
    "grinning": "😀",
    "smiley": "😃",
    "smile": "😄",
    "grin": "😁",
    "laughing": "😆",
    "satisfied": "😆",
    "sweat_smile": "😅",
    "joy": "😂",
    "rofl": "🤣",
    "rolling_on_the_floor_laughing": "🤣",
    "relaxed": "☺️",
    "blush": "😊",
    "innocent": "😇",
    "slight_smile": "🙂",
    "slightly_smiling_face": "🙂",
    "upside_down": "🙃",
    "upside_down_face": "🙃",
    "wink": "😉",
    "relieved": "😌",
    "heart_eyes": "😍",
    "smiling_face_with_3_hearts": "🥰",
    "kissing_heart": "😘",
    "kissing": "😗",
    "kissing_smiling_eyes": "😙",
    "kissing_closed_eyes": "😚",
    "yum": "😋",
    "stuck_out_tongue": "😛",
    "stuck_out_tongue_closed_eyes": "😝",
    "stuck_out_tongue_winking_eye": "😜",
    "zany_face": "🤪",
    "face_with_raised_eyebrow": "🤨",
    "face_with_monocle": "🧐",
    "nerd": "🤓",
    "nerd_face": "🤓",
    "sunglasses": "😎",
    "star_struck": "🤩",
    "partying_face": "🥳",
    "smirk": "😏",
    "unamused": "😒",
    "disappointed": "😞",
    "pensive": "😔",
    "worried": "😟",
    "confused": "😕",
    "slight_frown": "🙁",
    "slightly_frowning_face": "🙁",
    "frowning2": "☹️",
    "white_frowning_face": "☹️",
    "persevere": "😣",
    "confounded": "😖",
    "tired_face": "😫",
    "weary": "😩",
    "pleading_face": "🥺",
    "cry": "😢",
    "sob": "😭",
    "triumph": "😤",
    "angry": "😠",
    "rage": "😡",
    "face_with_symbols_over_mouth": "🤬",
    "exploding_head": "🤯",
    "flushed": "😳",
    "hot_face": "🥵",
    "cold_face": "🥶",
    "scream": "😱",
    "fearful": "😨",
    "cold_sweat": "😰",
    "disappointed_relieved": "😥",
    "sweat": "😓",
    "hugging": "🤗",
    "hugging_face": "🤗",
    "thinking": "🤔",
    "thinking_face": "🤔",
    "face_with_hand_over_mouth": "🤭",
    "yawning_face": "🥱",
    "shushing_face": "🤫",
    "lying_face": "🤥",
    "liar": "🤥",
    "no_mouth": "😶",
    "neutral_face": "😐",
    "expressionless": "😑",
    "grimacing": "😬",
    "rolling_eyes": "🙄",
    "face_with_rolling_eyes": "🙄",
    "hushed": "😯",
    "frowning": "😦",
    "anguished": "😧",
    "open_mouth": "😮",
    "astonished": "😲",
    "sleeping": "😴",
    "drooling_face": "🤤",
    "drool": "🤤",
    "sleepy": "😪",
    "dizzy_face": "😵",
    "zipper_mouth": "🤐",
    "zipper_mouth_face": "🤐",
    "woozy_face": "🥴",
    "nauseated_face": "🤢",
    "sick": "🤢",
    "face_vomiting": "🤮",
    "sneezing_face": "🤧",
    "sneeze": "🤧",
    "mask": "😷",
    "thermometer_face": "🤒",
    "face_with_thermometer": "🤒",
    "head_bandage": "🤕",
    "face_with_head_bandage": "🤕",
    "money_mouth": "🤑",
    "money_mouth_face": "🤑",
    "cowboy": "🤠",
    "face_with_cowboy_hat": "🤠",
    "smiling_imp": "😈",
    "imp": "👿",
    "japanese_ogre": "👹",
    "japanese_goblin": "👺",
    "clown": "🤡",
    "clown_face": "🤡",
    "poop": "💩",
    "shit": "💩",
    "hankey": "💩",
    "poo": "💩",
    "ghost": "👻",
    "skull": "💀",
    "skeleton": "💀",
    "skull_crossbones": "☠️",
    "skull_and_crossbones": "☠️",
    "alien": "👽",
    "space_invader": "👾",
    "robot": "🤖",
    "robot_face": "🤖",
    "jack_o_lantern": "🎃",
    "smiley_cat": "😺",
    "smile_cat": "😸",
    "joy_cat": "😹",
    "heart_eyes_cat": "😻",
    "smirk_cat": "😼",
    "kissing_cat": "😽",
    "scream_cat": "🙀",
    "crying_cat_face": "😿",
    "pouting_cat": "😾",
    "palms_up_together": "🤲",
    "open_hands": "👐",
    "raised_hands": "🙌",
    "clap": "👏",
    "handshake": "🤝",
    "shaking_hands": "🤝",
    "thumbsup": "👍",
    "+1": "👍",
    "thumbup": "👍",
    "thumbsdown": "👎",
    "-1": "👎",
    "thumbdown": "👎",
    "punch": "👊",
    "fist": "✊",
    "left_facing_fist": "🤛",
    "left_fist": "🤛",
    "right_facing_fist": "🤜",
    "right_fist": "🤜",
    "fingers_crossed": "🤞",
    "hand_with_index_and_middle_finger_crossed": "🤞",
    "v": "✌️",
    "love_you_gesture": "🤟",
    "metal": "🤘",
    "sign_of_the_horns": "🤘",
    "ok_hand": "👌",
    "pinching_hand": "🤏",
    "point_left": "👈",
    "point_right": "👉",
    "point_up_2": "👆",
    "point_down": "👇",
    "point_up": "☝️",
    "raised_hand": "✋",
    "raised_back_of_hand": "🤚",
    "back_of_hand": "🤚",
    "hand_splayed": "🖐️",
    "raised_hand_with_fingers_splayed": "🖐️",
    "vulcan": "🖖",
    "raised_hand_with_part_between_middle_and_ring_fingers": "🖖",
    "wave": "👋",
    "call_me": "🤙",
    "call_me_hand": "🤙",
    "muscle": "💪",
    "mechanical_arm": "🦾",
    "middle_finger": "🖕",
    "reversed_hand_with_middle_finger_extended": "🖕",
    "writing_hand": "✍️",
    "pray": "🙏",
    "foot": "🦶",
    "leg": "🦵",
    "mechanical_leg": "🦿",
    "lipstick": "💄",
    "kiss": "💋",
    "lips": "👄",
    "tooth": "🦷",
    "bone": "🦴",
    "tongue": "👅",
    "ear": "👂",
    "ear_with_hearing_aid": "🦻",
    "nose": "👃",
    "footprints": "👣",
    "eye": "👁️",
    "eyes": "👀",
    "brain": "🧠",
    "speaking_head": "🗣️",
    "speaking_head_in_silhouette": "🗣️",
    "bust_in_silhouette": "👤",
    "busts_in_silhouette": "👥",
    "baby": "👶",
    "girl": "👧",
    "child": "🧒",
    "boy": "👦",
    "woman": "👩",
    "adult": "🧑",
    "man": "👨",
    "woman_curly_haired": "👩\u200d🦱",
    "man_curly_haired": "👨\u200d🦱",
    "woman_red_haired": "👩\u200d🦰",
    "man_red_haired": "👨\u200d🦰",
    "blond_haired_woman": "👱\u200d♀️",
    "blond_haired_person": "👱",
    "person_with_blond_hair": "👱",
    "blond_haired_man": "👱\u200d♂️",
    "woman_white_haired": "👩\u200d🦳",
    "man_white_haired": "👨\u200d🦳",
    "woman_bald": "👩\u200d🦲",
    "man_bald": "👨\u200d🦲",
    "bearded_person": "🧔",
    "older_woman": "👵",
    "grandma": "👵",
    "older_adult": "🧓",
    "older_man": "👴",
    "man_with_chinese_cap": "👲",
    "man_with_gua_pi_mao": "👲",
    "person_wearing_turban": "👳",
    "man_with_turban": "👳",
    "woman_wearing_turban": "👳\u200d♀️",
    "man_wearing_turban": "👳\u200d♂️",
    "woman_with_headscarf": "🧕",
    "police_officer": "👮",
    "cop": "👮",
    "woman_police_officer": "👮\u200d♀️",
    "man_police_officer": "👮\u200d♂️",
    "construction_worker": "👷",
    "woman_construction_worker": "👷\u200d♀️",
    "man_construction_worker": "👷\u200d♂️",
    "guard": "💂",
    "guardsman": "💂",
    "woman_guard": "💂\u200d♀️",
    "man_guard": "💂\u200d♂️",
    "detective": "🕵️",
    "spy": "🕵️",
    "sleuth_or_spy": "🕵️",
    "woman_detective": "🕵️\u200d♀️",
    "man_detective": "🕵️\u200d♂️",
    "woman_health_worker": "👩\u200d⚕️",
    "man_health_worker": "👨\u200d⚕️",
    "woman_farmer": "👩\u200d🌾",
    "man_farmer": "👨\u200d🌾",
    "woman_cook": "👩\u200d🍳",
    "man_cook": "👨\u200d🍳",
    "woman_student": "👩\u200d🎓",
    "man_student": "👨\u200d🎓",
    "woman_singer": "👩\u200d🎤",
    "man_singer": "👨\u200d🎤",
    "woman_teacher": "👩\u200d🏫",
    "man_teacher": "👨\u200d🏫",
    "woman_factory_worker": "👩\u200d🏭",
    "man_factory_worker": "👨\u200d🏭",
    "woman_technologist": "👩\u200d💻",
    "man_technologist": "👨\u200d💻",
    "woman_office_worker": "👩\u200d💼",
    "man_office_worker": "👨\u200d💼",
    "woman_mechanic": "👩\u200d🔧",
    "man_mechanic": "👨\u200d🔧",
    "woman_scientist": "👩\u200d🔬",
    "man_scientist": "👨\u200d🔬",
    "woman_artist": "👩\u200d🎨",
    "man_artist": "👨\u200d🎨",
    "woman_firefighter": "👩\u200d🚒",
    "man_firefighter": "👨\u200d🚒",
    "woman_pilot": "👩\u200d✈️",
    "man_pilot": "👨\u200d✈️",
    "woman_astronaut": "👩\u200d🚀",
    "man_astronaut": "👨\u200d🚀",
    "woman_judge": "👩\u200d⚖️",
    "man_judge": "👨\u200d⚖️",
    "bride_with_veil": "👰",
    "man_in_tuxedo": "🤵",
    "princess": "👸",
    "prince": "🤴",
    "superhero": "🦸",
    "woman_superhero": "🦸\u200d♀️",
    "man_superhero": "🦸\u200d♂️",
    "supervillain": "🦹",
    "woman_supervillain": "🦹\u200d♀️",
    "man_supervillain": "🦹\u200d♂️",
    "mrs_claus": "🤶",
    "mother_christmas": "🤶",
    "santa": "🎅",
    "mage": "🧙",
    "woman_mage": "🧙\u200d♀️",
    "man_mage": "🧙\u200d♂️",
    "elf": "🧝",
    "woman_elf": "🧝\u200d♀️",
    "man_elf": "🧝\u200d♂️",
    "vampire": "🧛",
    "woman_vampire": "🧛\u200d♀️",
    "man_vampire": "🧛\u200d♂️",
    "zombie": "🧟",
    "woman_zombie": "🧟\u200d♀️",
    "man_zombie": "🧟\u200d♂️",
    "genie": "🧞",
    "woman_genie": "🧞\u200d♀️",
    "man_genie": "🧞\u200d♂️",
    "merperson": "🧜",
    "mermaid": "🧜\u200d♀️",
    "merman": "🧜\u200d♂️",
    "fairy": "🧚",
    "woman_fairy": "🧚\u200d♀️",
    "man_fairy": "🧚\u200d♂️",
    "angel": "👼",
    "pregnant_woman": "🤰",
    "expecting_woman": "🤰",
    "breast_feeding": "🤱",
    "person_bowing": "🙇",
    "bow": "🙇",
    "woman_bowing": "🙇\u200d♀️",
    "man_bowing": "🙇\u200d♂️",
    "person_tipping_hand": "💁",
    "information_desk_person": "💁",
    "woman_tipping_hand": "💁\u200d♀️",
    "man_tipping_hand": "💁\u200d♂️",
    "person_gesturing_no": "🙅",
    "no_good": "🙅",
    "woman_gesturing_no": "🙅\u200d♀️",
    "man_gesturing_no": "🙅\u200d♂️",
    "person_gesturing_ok": "🙆",
    "ok_woman": "🙆",
    "woman_gesturing_ok": "🙆\u200d♀️",
    "man_gesturing_ok": "🙆\u200d♂️",
    "person_raising_hand": "🙋",
    "raising_hand": "🙋",
    "woman_raising_hand": "🙋\u200d♀️",
    "man_raising_hand": "🙋\u200d♂️",
    "deaf_person": "🧏",
    "deaf_woman": "🧏\u200d♀️",
    "deaf_man": "🧏\u200d♂️",
    "person_facepalming": "🤦",
    "face_palm": "🤦",
    "facepalm": "🤦",
    "woman_facepalming": "🤦\u200d♀️",
    "man_facepalming": "🤦\u200d♂️",
    "person_shrugging": "🤷",
    "shrug": "🤷",
    "woman_shrugging": "🤷\u200d♀️",
    "man_shrugging": "🤷\u200d♂️",
    "person_pouting": "🙎",
    "person_with_pouting_face": "🙎",
    "woman_pouting": "🙎\u200d♀️",
    "man_pouting": "🙎\u200d♂️",
    "person_frowning": "🙍",
    "woman_frowning": "🙍\u200d♀️",
    "man_frowning": "🙍\u200d♂️",
    "person_getting_haircut": "💇",
    "haircut": "💇",
    "woman_getting_haircut": "💇\u200d♀️",
    "man_getting_haircut": "💇\u200d♂️",
    "person_getting_massage": "💆",
    "massage": "💆",
    "woman_getting_face_massage": "💆\u200d♀️",
    "man_getting_face_massage": "💆\u200d♂️",
    "person_in_steamy_room": "🧖",
    "woman_in_steamy_room": "🧖\u200d♀️",
    "man_in_steamy_room": "🧖\u200d♂️",
    "nail_care": "💅",
    "selfie": "🤳",
    "dancer": "💃",
    "man_dancing": "🕺",
    "male_dancer": "🕺",
    "people_with_bunny_ears_partying": "👯",
    "dancers": "👯",
    "women_with_bunny_ears_partying": "👯\u200d♀️",
    "men_with_bunny_ears_partying": "👯\u200d♂️",
    "levitate": "🕴️",
    "man_in_business_suit_levitating": "🕴️",
    "person_walking": "🚶",
    "walking": "🚶",
    "woman_walking": "🚶\u200d♀️",
    "man_walking": "🚶\u200d♂️",
    "person_running": "🏃",
    "runner": "🏃",
    "woman_running": "🏃\u200d♀️",
    "man_running": "🏃\u200d♂️",
    "person_standing": "🧍",
    "woman_standing": "🧍\u200d♀️",
    "man_standing": "🧍\u200d♂️",
    "person_kneeling": "🧎",
    "woman_kneeling": "🧎\u200d♀️",
    "man_kneeling": "🧎\u200d♂️",
    "woman_with_probing_cane": "👩\u200d🦯",
    "man_with_probing_cane": "👨\u200d🦯",
    "woman_in_motorized_wheelchair": "👩\u200d🦼",
    "man_in_motorized_wheelchair": "👨\u200d🦼",
    "woman_in_manual_wheelchair": "👩\u200d🦽",
    "man_in_manual_wheelchair": "👨\u200d🦽",
    "people_holding_hands": "🧑\u200d🤝\u200d🧑",
    "couple": "👫",
    "two_women_holding_hands": "👭",
    "two_men_holding_hands": "👬",
    "couple_with_heart": "💑",
    "couple_with_heart_woman_man": "👩\u200d❤️\u200d👨",
    "couple_ww": "👩\u200d❤️\u200d👩",
    "couple_with_heart_ww": "👩\u200d❤️\u200d👩",
    "couple_mm": "👨\u200d❤️\u200d👨",
    "couple_with_heart_mm": "👨\u200d❤️\u200d👨",
    "couplekiss": "💏",
    "kiss_woman_man": "👩\u200d❤️\u200d💋\u200d👨",
    "kiss_ww": "👩\u200d❤️\u200d💋\u200d👩",
    "couplekiss_ww": "👩\u200d❤️\u200d💋\u200d👩",
    "kiss_mm": "👨\u200d❤️\u200d💋\u200d👨",
    "couplekiss_mm": "👨\u200d❤️\u200d💋\u200d👨",
    "family": "👪",
    "family_man_woman_boy": "👨\u200d👩\u200d👦",
    "family_mwg": "👨\u200d👩\u200d👧",
    "family_mwgb": "👨\u200d👩\u200d👧\u200d👦",
    "family_mwbb": "👨\u200d👩\u200d👦\u200d👦",
    "family_mwgg": "👨\u200d👩\u200d👧\u200d👧",
    "family_wwb": "👩\u200d👩\u200d👦",
    "family_wwg": "👩\u200d👩\u200d👧",
    "family_wwgb": "👩\u200d👩\u200d👧\u200d👦",
    "family_wwbb": "👩\u200d👩\u200d👦\u200d👦",
    "family_wwgg": "👩\u200d👩\u200d👧\u200d👧",
    "family_mmb": "👨\u200d👨\u200d👦",
    "family_mmg": "👨\u200d👨\u200d👧",
    "family_mmgb": "👨\u200d👨\u200d👧\u200d👦",
    "family_mmbb": "👨\u200d👨\u200d👦\u200d👦",
    "family_mmgg": "👨\u200d👨\u200d👧\u200d👧",
    "family_woman_boy": "👩\u200d👦",
    "family_woman_girl": "👩\u200d👧",
    "family_woman_girl_boy": "👩\u200d👧\u200d👦",
    "family_woman_boy_boy": "👩\u200d👦\u200d👦",
    "family_woman_girl_girl": "👩\u200d👧\u200d👧",
    "family_man_boy": "👨\u200d👦",
    "family_man_girl": "👨\u200d👧",
    "family_man_girl_boy": "👨\u200d👧\u200d👦",
    "family_man_boy_boy": "👨\u200d👦\u200d👦",
    "family_man_girl_girl": "👨\u200d👧\u200d👧",
    "yarn": "🧶",
    "thread": "🧵",
    "coat": "🧥",
    "lab_coat": "🥼",
    "safety_vest": "🦺",
    "womans_clothes": "👚",
    "shirt": "👕",
    "jeans": "👖",
    "shorts": "🩳",
    "necktie": "👔",
    "dress": "👗",
    "bikini": "👙",
    "one_piece_swimsuit": "🩱",
    "kimono": "👘",
    "sari": "🥻",
    "womans_flat_shoe": "🥿",
    "high_heel": "👠",
    "sandal": "👡",
    "boot": "👢",
    "ballet_shoes": "🩰",
    "mans_shoe": "👞",
    "athletic_shoe": "👟",
    "hiking_boot": "🥾",
    "briefs": "🩲",
    "socks": "🧦",
    "gloves": "🧤",
    "scarf": "🧣",
    "tophat": "🎩",
    "billed_cap": "🧢",
    "womans_hat": "👒",
    "mortar_board": "🎓",
    "helmet_with_cross": "⛑️",
    "helmet_with_white_cross": "⛑️",
    "crown": "👑",
    "ring": "💍",
    "pouch": "👝",
    "purse": "👛",
    "handbag": "👜",
    "briefcase": "💼",
    "school_satchel": "🎒",
    "luggage": "🧳",
    "eyeglasses": "👓",
    "dark_sunglasses": "🕶️",
    "goggles": "🥽",
    "diving_mask": "🤿",
    "closed_umbrella": "🌂",
    "dog": "🐶",
    "cat": "🐱",
    "mouse": "🐭",
    "hamster": "🐹",
    "rabbit": "🐰",
    "fox": "🦊",
    "fox_face": "🦊",
    "bear": "🐻",
    "panda_face": "🐼",
    "koala": "🐨",
    "tiger": "🐯",
    "lion_face": "🦁",
    "lion": "🦁",
    "cow": "🐮",
    "pig": "🐷",
    "pig_nose": "🐽",
    "frog": "🐸",
    "monkey_face": "🐵",
    "see_no_evil": "🙈",
    "hear_no_evil": "🙉",
    "speak_no_evil": "🙊",
    "monkey": "🐒",
    "chicken": "🐔",
    "penguin": "🐧",
    "bird": "🐦",
    "baby_chick": "🐤",
    "hatching_chick": "🐣",
    "hatched_chick": "🐥",
    "duck": "🦆",
    "eagle": "🦅",
    "owl": "🦉",
    "bat": "🦇",
    "wolf": "🐺",
    "boar": "🐗",
    "horse": "🐴",
    "unicorn": "🦄",
    "unicorn_face": "🦄",
    "bee": "🐝",
    "bug": "🐛",
    "butterfly": "🦋",
    "snail": "🐌",
    "shell": "🐚",
    "beetle": "🐞",
    "ant": "🐜",
    "mosquito": "🦟",
    "cricket": "🦗",
    "spider": "🕷️",
    "spider_web": "🕸️",
    "scorpion": "🦂",
    "turtle": "🐢",
    "snake": "🐍",
    "lizard": "🦎",
    "t_rex": "🦖",
    "sauropod": "🦕",
    "octopus": "🐙",
    "squid": "🦑",
    "shrimp": "🦐",
    "lobster": "🦞",
    "oyster": "🦪",
    "crab": "🦀",
    "blowfish": "🐡",
    "tropical_fish": "🐠",
    "fish": "🐟",
    "dolphin": "🐬",
    "whale": "🐳",
    "whale2": "🐋",
    "shark": "🦈",
    "crocodile": "🐊",
    "tiger2": "🐅",
    "leopard": "🐆",
    "zebra": "🦓",
    "gorilla": "🦍",
    "orangutan": "🦧",
    "elephant": "🐘",
    "hippopotamus": "🦛",
    "rhino": "🦏",
    "rhinoceros": "🦏",
    "dromedary_camel": "🐪",
    "camel": "🐫",
    "giraffe": "🦒",
    "kangaroo": "🦘",
    "water_buffalo": "🐃",
    "ox": "🐂",
    "cow2": "🐄",
    "racehorse": "🐎",
    "pig2": "🐖",
    "ram": "🐏",
    "llama": "🦙",
    "sheep": "🐑",
    "goat": "🐐",
    "deer": "🦌",
    "dog2": "🐕",
    "guide_dog": "🦮",
    "service_dog": "🐕\u200d🦺",
    "poodle": "🐩",
    "cat2": "🐈",
    "rooster": "🐓",
    "turkey": "🦃",
    "peacock": "🦚",
    "parrot": "🦜",
    "swan": "🦢",
    "flamingo": "🦩",
    "dove": "🕊️",
    "dove_of_peace": "🕊️",
    "rabbit2": "🐇",
    "sloth": "🦥",
    "otter": "🦦",
    "skunk": "🦨",
    "raccoon": "🦝",
    "badger": "🦡",
    "mouse2": "🐁",
    "rat": "🐀",
    "chipmunk": "🐿️",
    "hedgehog": "🦔",
    "feet": "🐾",
    "paw_prints": "🐾",
    "dragon": "🐉",
    "dragon_face": "🐲",
    "cactus": "🌵",
    "christmas_tree": "🎄",
    "evergreen_tree": "🌲",
    "deciduous_tree": "🌳",
    "palm_tree": "🌴",
    "seedling": "🌱",
    "herb": "🌿",
    "shamrock": "☘️",
    "four_leaf_clover": "🍀",
    "bamboo": "🎍",
    "tanabata_tree": "🎋",
    "leaves": "🍃",
    "fallen_leaf": "🍂",
    "maple_leaf": "🍁",
    "mushroom": "🍄",
    "ear_of_rice": "🌾",
    "bouquet": "💐",
    "tulip": "🌷",
    "rose": "🌹",
    "wilted_rose": "🥀",
    "wilted_flower": "🥀",
    "hibiscus": "🌺",
    "cherry_blossom": "🌸",
    "blossom": "🌼",
    "sunflower": "🌻",
    "sun_with_face": "🌞",
    "full_moon_with_face": "🌝",
    "first_quarter_moon_with_face": "🌛",
    "last_quarter_moon_with_face": "🌜",
    "new_moon_with_face": "🌚",
    "full_moon": "🌕",
    "waning_gibbous_moon": "🌖",
    "last_quarter_moon": "🌗",
    "waning_crescent_moon": "🌘",
    "new_moon": "🌑",
    "waxing_crescent_moon": "🌒",
    "first_quarter_moon": "🌓",
    "waxing_gibbous_moon": "🌔",
    "crescent_moon": "🌙",
    "earth_americas": "🌎",
    "earth_africa": "🌍",
    "earth_asia": "🌏",
    "ringed_planet": "🪐",
    "dizzy": "💫",
    "star": "⭐",
    "star2": "🌟",
    "sparkles": "✨",
    "zap": "⚡",
    "comet": "☄️",
    "boom": "💥",
    "fire": "🔥",
    "flame": "🔥",
    "cloud_tornado": "🌪️",
    "cloud_with_tornado": "🌪️",
    "rainbow": "🌈",
    "sunny": "☀️",
    "white_sun_small_cloud": "🌤️",
    "white_sun_with_small_cloud": "🌤️",
    "partly_sunny": "⛅",
    "white_sun_cloud": "🌥️",
    "white_sun_behind_cloud": "🌥️",
    "cloud": "☁️",
    "white_sun_rain_cloud": "🌦️",
    "white_sun_behind_cloud_with_rain": "🌦️",
    "cloud_rain": "🌧️",
    "cloud_with_rain": "🌧️",
    "thunder_cloud_rain": "⛈️",
    "thunder_cloud_and_rain": "⛈️",
    "cloud_lightning": "🌩️",
    "cloud_with_lightning": "🌩️",
    "cloud_snow": "🌨️",
    "cloud_with_snow": "🌨️",
    "snowflake": "❄️",
    "snowman2": "☃️",
    "snowman": "⛄",
    "wind_blowing_face": "🌬️",
    "dash": "💨",
    "droplet": "💧",
    "sweat_drops": "💦",
    "umbrella": "☔",
    "umbrella2": "☂️",
    "ocean": "🌊",
    "fog": "🌫️",
    "green_apple": "🍏",
    "apple": "🍎",
    "pear": "🍐",
    "tangerine": "🍊",
    "lemon": "🍋",
    "banana": "🍌",
    "watermelon": "🍉",
    "grapes": "🍇",
    "strawberry": "🍓",
    "melon": "🍈",
    "cherries": "🍒",
    "peach": "🍑",
    "mango": "🥭",
    "pineapple": "🍍",
    "coconut": "🥥",
    "kiwi": "🥝",
    "kiwifruit": "🥝",
    "tomato": "🍅",
    "eggplant": "🍆",
    "avocado": "🥑",
    "broccoli": "🥦",
    "leafy_green": "🥬",
    "cucumber": "🥒",
    "hot_pepper": "🌶️",
    "corn": "🌽",
    "carrot": "🥕",
    "onion": "🧅",
    "garlic": "🧄",
    "potato": "🥔",
    "sweet_potato": "🍠",
    "croissant": "🥐",
    "bagel": "🥯",
    "bread": "🍞",
    "french_bread": "🥖",
    "baguette_bread": "🥖",
    "pretzel": "🥨",
    "cheese": "🧀",
    "cheese_wedge": "🧀",
    "egg": "🥚",
    "cooking": "🍳",
    "pancakes": "🥞",
    "waffle": "🧇",
    "bacon": "🥓",
    "cut_of_meat": "🥩",
    "poultry_leg": "🍗",
    "meat_on_bone": "🍖",
    "hotdog": "🌭",
    "hot_dog": "🌭",
    "hamburger": "🍔",
    "fries": "🍟",
    "pizza": "🍕",
    "sandwich": "🥪",
    "falafel": "🧆",
    "stuffed_flatbread": "🥙",
    "stuffed_pita": "🥙",
    "taco": "🌮",
    "burrito": "🌯",
    "salad": "🥗",
    "green_salad": "🥗",
    "shallow_pan_of_food": "🥘",
    "paella": "🥘",
    "canned_food": "🥫",
    "spaghetti": "🍝",
    "ramen": "🍜",
    "stew": "🍲",
    "curry": "🍛",
    "sushi": "🍣",
    "bento": "🍱",
    "dumpling": "🥟",
    "fried_shrimp": "🍤",
    "rice_ball": "🍙",
    "rice": "🍚",
    "rice_cracker": "🍘",
    "fish_cake": "🍥",
    "fortune_cookie": "🥠",
    "moon_cake": "🥮",
    "oden": "🍢",
    "dango": "🍡",
    "shaved_ice": "🍧",
    "ice_cream": "🍨",
    "icecream": "🍦",
    "pie": "🥧",
    "cupcake": "🧁",
    "cake": "🍰",
    "birthday": "🎂",
    "custard": "🍮",
    "pudding": "🍮",
    "flan": "🍮",
    "lollipop": "🍭",
    "candy": "🍬",
    "chocolate_bar": "🍫",
    "popcorn": "🍿",
    "doughnut": "🍩",
    "cookie": "🍪",
    "chestnut": "🌰",
    "peanuts": "🥜",
    "shelled_peanut": "🥜",
    "honey_pot": "🍯",
    "butter": "🧈",
    "milk": "🥛",
    "glass_of_milk": "🥛",
    "baby_bottle": "🍼",
    "coffee": "☕",
    "tea": "🍵",
    "mate": "🧉",
    "cup_with_straw": "🥤",
    "beverage_box": "🧃",
    "ice_cube": "🧊",
    "sake": "🍶",
    "beer": "🍺",
    "beers": "🍻",
    "champagne_glass": "🥂",
    "clinking_glass": "🥂",
    "wine_glass": "🍷",
    "tumbler_glass": "🥃",
    "whisky": "🥃",
    "cocktail": "🍸",
    "tropical_drink": "🍹",
    "champagne": "🍾",
    "bottle_with_popping_cork": "🍾",
    "spoon": "🥄",
    "fork_and_knife": "🍴",
    "fork_knife_plate": "🍽️",
    "fork_and_knife_with_plate": "🍽️",
    "bowl_with_spoon": "🥣",
    "takeout_box": "🥡",
    "chopsticks": "🥢",
    "salt": "🧂",
    "soccer": "⚽",
    "basketball": "🏀",
    "football": "🏈",
    "baseball": "⚾",
    "softball": "🥎",
    "tennis": "🎾",
    "volleyball": "🏐",
    "rugby_football": "🏉",
    "flying_disc": "🥏",
    "8ball": "🎱",
    "ping_pong": "🏓",
    "table_tennis": "🏓",
    "badminton": "🏸",
    "hockey": "🏒",
    "field_hockey": "🏑",
    "lacrosse": "🥍",
    "cricket_game": "🏏",
    "cricket_bat_ball": "🏏",
    "goal": "🥅",
    "goal_net": "🥅",
    "golf": "⛳",
    "bow_and_arrow": "🏹",
    "archery": "🏹",
    "fishing_pole_and_fish": "🎣",
    "boxing_glove": "🥊",
    "boxing_gloves": "🥊",
    "martial_arts_uniform": "🥋",
    "karate_uniform": "🥋",
    "running_shirt_with_sash": "🎽",
    "skateboard": "🛹",
    "sled": "🛷",
    "parachute": "🪂",
    "ice_skate": "⛸️",
    "curling_stone": "🥌",
    "ski": "🎿",
    "skier": "⛷️",
    "snowboarder": "🏂",
    "person_lifting_weights": "🏋️",
    "lifter": "🏋️",
    "weight_lifter": "🏋️",
    "woman_lifting_weights": "🏋️\u200d♀️",
    "man_lifting_weights": "🏋️\u200d♂️",
    "people_wrestling": "🤼",
    "wrestlers": "🤼",
    "wrestling": "🤼",
    "women_wrestling": "🤼\u200d♀️",
    "men_wrestling": "🤼\u200d♂️",
    "person_doing_cartwheel": "🤸",
    "cartwheel": "🤸",
    "woman_cartwheeling": "🤸\u200d♀️",
    "man_cartwheeling": "🤸\u200d♂️",
    "person_bouncing_ball": "⛹️",
    "basketball_player": "⛹️",
    "person_with_ball": "⛹️",
    "woman_bouncing_ball": "⛹️\u200d♀️",
    "man_bouncing_ball": "⛹️\u200d♂️",
    "person_fencing": "🤺",
    "fencer": "🤺",
    "fencing": "🤺",
    "person_playing_handball": "🤾",
    "handball": "🤾",
    "woman_playing_handball": "🤾\u200d♀️",
    "man_playing_handball": "🤾\u200d♂️",
    "person_golfing": "🏌️",
    "golfer": "🏌️",
    "woman_golfing": "🏌️\u200d♀️",
    "man_golfing": "🏌️\u200d♂️",
    "horse_racing": "🏇",
    "person_in_lotus_position": "🧘",
    "woman_in_lotus_position": "🧘\u200d♀️",
    "man_in_lotus_position": "🧘\u200d♂️",
    "person_surfing": "🏄",
    "surfer": "🏄",
    "woman_surfing": "🏄\u200d♀️",
    "man_surfing": "🏄\u200d♂️",
    "person_swimming": "🏊",
    "swimmer": "🏊",
    "woman_swimming": "🏊\u200d♀️",
    "man_swimming": "🏊\u200d♂️",
    "person_playing_water_polo": "🤽",
    "water_polo": "🤽",
    "woman_playing_water_polo": "🤽\u200d♀️",
    "man_playing_water_polo": "🤽\u200d♂️",
    "person_rowing_boat": "🚣",
    "rowboat": "🚣",
    "woman_rowing_boat": "🚣\u200d♀️",
    "man_rowing_boat": "🚣\u200d♂️",
    "person_climbing": "🧗",
    "woman_climbing": "🧗\u200d♀️",
    "man_climbing": "🧗\u200d♂️",
    "person_mountain_biking": "🚵",
    "mountain_bicyclist": "🚵",
    "woman_mountain_biking": "🚵\u200d♀️",
    "man_mountain_biking": "🚵\u200d♂️",
    "person_biking": "🚴",
    "bicyclist": "🚴",
    "woman_biking": "🚴\u200d♀️",
    "man_biking": "🚴\u200d♂️",
    "trophy": "🏆",
    "first_place": "🥇",
    "first_place_medal": "🥇",
    "second_place": "🥈",
    "second_place_medal": "🥈",
    "third_place": "🥉",
    "third_place_medal": "🥉",
    "medal": "🏅",
    "sports_medal": "🏅",
    "military_medal": "🎖️",
    "rosette": "🏵️",
    "reminder_ribbon": "🎗️",
    "ticket": "🎫",
    "tickets": "🎟️",
    "admission_tickets": "🎟️",
    "circus_tent": "🎪",
    "person_juggling": "🤹",
    "juggling": "🤹",
    "juggler": "🤹",
    "woman_juggling": "🤹\u200d♀️",
    "man_juggling": "🤹\u200d♂️",
    "performing_arts": "🎭",
    "art": "🎨",
    "clapper": "🎬",
    "microphone": "🎤",
    "headphones": "🎧",
    "musical_score": "🎼",
    "musical_keyboard": "🎹",
    "drum": "🥁",
    "drum_with_drumsticks": "🥁",
    "saxophone": "🎷",
    "trumpet": "🎺",
    "banjo": "🪕",
    "guitar": "🎸",
    "violin": "🎻",
    "game_die": "🎲",
    "chess_pawn": "♟️",
    "dart": "🎯",
    "kite": "🪁",
    "yo_yo": "🪀",
    "bowling": "🎳",
    "video_game": "🎮",
    "slot_machine": "🎰",
    "jigsaw": "🧩",
    "red_car": "🚗",
    "taxi": "🚕",
    "blue_car": "🚙",
    "bus": "🚌",
    "trolleybus": "🚎",
    "race_car": "🏎️",
    "racing_car": "🏎️",
    "police_car": "🚓",
    "ambulance": "🚑",
    "fire_engine": "🚒",
    "minibus": "🚐",
    "truck": "🚚",
    "articulated_lorry": "🚛",
    "tractor": "🚜",
    "auto_rickshaw": "🛺",
    "motor_scooter": "🛵",
    "motorbike": "🛵",
    "motorcycle": "🏍️",
    "racing_motorcycle": "🏍️",
    "scooter": "🛴",
    "bike": "🚲",
    "motorized_wheelchair": "🦼",
    "manual_wheelchair": "🦽",
    "rotating_light": "🚨",
    "oncoming_police_car": "🚔",
    "oncoming_bus": "🚍",
    "oncoming_automobile": "🚘",
    "oncoming_taxi": "🚖",
    "aerial_tramway": "🚡",
    "mountain_cableway": "🚠",
    "suspension_railway": "🚟",
    "railway_car": "🚃",
    "train": "🚋",
    "mountain_railway": "🚞",
    "monorail": "🚝",
    "bullettrain_side": "🚄",
    "bullettrain_front": "🚅",
    "light_rail": "🚈",
    "steam_locomotive": "🚂",
    "train2": "🚆",
    "metro": "🚇",
    "tram": "🚊",
    "station": "🚉",
    "airplane": "✈️",
    "airplane_departure": "🛫",
    "airplane_arriving": "🛬",
    "airplane_small": "🛩️",
    "small_airplane": "🛩️",
    "seat": "💺",
    "satellite_orbital": "🛰️",
    "rocket": "🚀",
    "flying_saucer": "🛸",
    "helicopter": "🚁",
    "canoe": "🛶",
    "kayak": "🛶",
    "sailboat": "⛵",
    "speedboat": "🚤",
    "motorboat": "🛥️",
    "cruise_ship": "🛳️",
    "passenger_ship": "🛳️",
    "ferry": "⛴️",
    "ship": "🚢",
    "anchor": "⚓",
    "fuelpump": "⛽",
    "construction": "🚧",
    "vertical_traffic_light": "🚦",
    "traffic_light": "🚥",
    "busstop": "🚏",
    "map": "🗺️",
    "world_map": "🗺️",
    "moyai": "🗿",
    "statue_of_liberty": "🗽",
    "tokyo_tower": "🗼",
    "european_castle": "🏰",
    "japanese_castle": "🏯",
    "stadium": "🏟️",
    "ferris_wheel": "🎡",
    "roller_coaster": "🎢",
    "carousel_horse": "🎠",
    "fountain": "⛲",
    "beach_umbrella": "⛱️",
    "umbrella_on_ground": "⛱️",
    "beach": "🏖️",
    "beach_with_umbrella": "🏖️",
    "island": "🏝️",
    "desert_island": "🏝️",
    "desert": "🏜️",
    "volcano": "🌋",
    "mountain": "⛰️",
    "mountain_snow": "🏔️",
    "snow_capped_mountain": "🏔️",
    "mount_fuji": "🗻",
    "camping": "🏕️",
    "tent": "⛺",
    "house": "🏠",
    "house_with_garden": "🏡",
    "homes": "🏘️",
    "house_buildings": "🏘️",
    "house_abandoned": "🏚️",
    "derelict_house_building": "🏚️",
    "construction_site": "🏗️",
    "building_construction": "🏗️",
    "factory": "🏭",
    "office": "🏢",
    "department_store": "🏬",
    "post_office": "🏣",
    "european_post_office": "🏤",
    "hospital": "🏥",
    "bank": "🏦",
    "hotel": "🏨",
    "convenience_store": "🏪",
    "school": "🏫",
    "love_hotel": "🏩",
    "wedding": "💒",
    "classical_building": "🏛️",
    "church": "⛪",
    "mosque": "🕌",
    "hindu_temple": "🛕",
    "synagogue": "🕍",
    "kaaba": "🕋",
    "shinto_shrine": "⛩️",
    "railway_track": "🛤️",
    "railroad_track": "🛤️",
    "motorway": "🛣️",
    "japan": "🗾",
    "rice_scene": "🎑",
    "park": "🏞️",
    "national_park": "🏞️",
    "sunrise": "🌅",
    "sunrise_over_mountains": "🌄",
    "stars": "🌠",
    "sparkler": "🎇",
    "fireworks": "🎆",
    "city_sunset": "🌇",
    "city_sunrise": "🌇",
    "city_dusk": "🌆",
    "cityscape": "🏙️",
    "night_with_stars": "🌃",
    "milky_way": "🌌",
    "bridge_at_night": "🌉",
    "foggy": "🌁",
    "watch": "⌚",
    "iphone": "📱",
    "calling": "📲",
    "computer": "💻",
    "keyboard": "⌨️",
    "desktop": "🖥️",
    "desktop_computer": "🖥️",
    "printer": "🖨️",
    "mouse_three_button": "🖱️",
    "three_button_mouse": "🖱️",
    "trackball": "🖲️",
    "joystick": "🕹️",
    "compression": "🗜️",
    "minidisc": "💽",
    "floppy_disk": "💾",
    "cd": "💿",
    "dvd": "📀",
    "vhs": "📼",
    "camera": "📷",
    "camera_with_flash": "📸",
    "video_camera": "📹",
    "movie_camera": "🎥",
    "projector": "📽️",
    "film_projector": "📽️",
    "film_frames": "🎞️",
    "telephone_receiver": "📞",
    "telephone": "☎️",
    "pager": "📟",
    "fax": "📠",
    "tv": "📺",
    "radio": "📻",
    "microphone2": "🎙️",
    "studio_microphone": "🎙️",
    "level_slider": "🎚️",
    "control_knobs": "🎛️",
    "compass": "🧭",
    "stopwatch": "⏱️",
    "timer": "⏲️",
    "timer_clock": "⏲️",
    "alarm_clock": "⏰",
    "clock": "🕰️",
    "mantlepiece_clock": "🕰️",
    "hourglass": "⌛",
    "hourglass_flowing_sand": "⏳",
    "satellite": "📡",
    "battery": "🔋",
    "electric_plug": "🔌",
    "bulb": "💡",
    "flashlight": "🔦",
    "candle": "🕯️",
    "fire_extinguisher": "🧯",
    "oil": "🛢️",
    "oil_drum": "🛢️",
    "money_with_wings": "💸",
    "dollar": "💵",
    "yen": "💴",
    "euro": "💶",
    "pound": "💷",
    "moneybag": "💰",
    "credit_card": "💳",
    "gem": "💎",
    "scales": "⚖️",
    "toolbox": "🧰",
    "wrench": "🔧",
    "hammer": "🔨",
    "hammer_pick": "⚒️",
    "hammer_and_pick": "⚒️",
    "tools": "🛠️",
    "hammer_and_wrench": "🛠️",
    "pick": "⛏️",
    "nut_and_bolt": "🔩",
    "gear": "⚙️",
    "bricks": "🧱",
    "chains": "⛓️",
    "magnet": "🧲",
    "gun": "🔫",
    "bomb": "💣",
    "firecracker": "🧨",
    "axe": "🪓",
    "razor": "🪒",
    "knife": "🔪",
    "dagger": "🗡️",
    "dagger_knife": "🗡️",
    "crossed_swords": "⚔️",
    "shield": "🛡️",
    "smoking": "🚬",
    "coffin": "⚰️",
    "urn": "⚱️",
    "funeral_urn": "⚱️",
    "amphora": "🏺",
    "diya_lamp": "🪔",
    "crystal_ball": "🔮",
    "prayer_beads": "📿",
    "nazar_amulet": "🧿",
    "barber": "💈",
    "alembic": "⚗️",
    "telescope": "🔭",
    "microscope": "🔬",
    "hole": "🕳️",
    "probing_cane": "🦯",
    "stethoscope": "🩺",
    "adhesive_bandage": "🩹",
    "pill": "💊",
    "syringe": "💉",
    "drop_of_blood": "🩸",
    "dna": "🧬",
    "microbe": "🦠",
    "petri_dish": "🧫",
    "test_tube": "🧪",
    "thermometer": "🌡️",
    "chair": "🪑",
    "broom": "🧹",
    "basket": "🧺",
    "roll_of_paper": "🧻",
    "toilet": "🚽",
    "potable_water": "🚰",
    "shower": "🚿",
    "bathtub": "🛁",
    "bath": "🛀",
    "soap": "🧼",
    "sponge": "🧽",
    "squeeze_bottle": "🧴",
    "bellhop": "🛎️",
    "bellhop_bell": "🛎️",
    "key": "🔑",
    "key2": "🗝️",
    "old_key": "🗝️",
    "door": "🚪",
    "couch": "🛋️",
    "couch_and_lamp": "🛋️",
    "bed": "🛏️",
    "sleeping_accommodation": "🛌",
    "teddy_bear": "🧸",
    "frame_photo": "🖼️",
    "frame_with_picture": "🖼️",
    "shopping_bags": "🛍️",
    "shopping_cart": "🛒",
    "shopping_trolley": "🛒",
    "gift": "🎁",
    "balloon": "🎈",
    "flags": "🎏",
    "ribbon": "🎀",
    "confetti_ball": "🎊",
    "tada": "🎉",
    "dolls": "🎎",
    "izakaya_lantern": "🏮",
    "wind_chime": "🎐",
    "red_envelope": "🧧",
    "envelope": "✉️",
    "envelope_with_arrow": "📩",
    "incoming_envelope": "📨",
    "e_mail": "📧",
    "email": "📧",
    "love_letter": "💌",
    "inbox_tray": "📥",
    "outbox_tray": "📤",
    "package": "📦",
    "label": "🏷️",
    "mailbox_closed": "📪",
    "mailbox": "📫",
    "mailbox_with_mail": "📬",
    "mailbox_with_no_mail": "📭",
    "postbox": "📮",
    "postal_horn": "📯",
    "scroll": "📜",
    "page_with_curl": "📃",
    "page_facing_up": "📄",
    "bookmark_tabs": "📑",
    "receipt": "🧾",
    "bar_chart": "📊",
    "chart_with_upwards_trend": "📈",
    "chart_with_downwards_trend": "📉",
    "notepad_spiral": "🗒️",
    "spiral_note_pad": "🗒️",
    "calendar_spiral": "🗓️",
    "spiral_calendar_pad": "🗓️",
    "calendar": "📆",
    "date": "📅",
    "wastebasket": "🗑️",
    "card_index": "📇",
    "card_box": "🗃️",
    "card_file_box": "🗃️",
    "ballot_box": "🗳️",
    "ballot_box_with_ballot": "🗳️",
    "file_cabinet": "🗄️",
    "clipboard": "📋",
    "file_folder": "📁",
    "open_file_folder": "📂",
    "dividers": "🗂️",
    "card_index_dividers": "🗂️",
    "newspaper2": "🗞️",
    "rolled_up_newspaper": "🗞️",
    "newspaper": "📰",
    "notebook": "📓",
    "notebook_with_decorative_cover": "📔",
    "ledger": "📒",
    "closed_book": "📕",
    "green_book": "📗",
    "blue_book": "📘",
    "orange_book": "📙",
    "books": "📚",
    "book": "📖",
    "bookmark": "🔖",
    "safety_pin": "🧷",
    "link": "🔗",
    "paperclip": "📎",
    "paperclips": "🖇️",
    "linked_paperclips": "🖇️",
    "triangular_ruler": "📐",
    "straight_ruler": "📏",
    "abacus": "🧮",
    "pushpin": "📌",
    "round_pushpin": "📍",
    "scissors": "✂️",
    "pen_ballpoint": "🖊️",
    "lower_left_ballpoint_pen": "🖊️",
    "pen_fountain": "🖋️",
    "lower_left_fountain_pen": "🖋️",
    "black_nib": "✒️",
    "paintbrush": "🖌️",
    "lower_left_paintbrush": "🖌️",
    "crayon": "🖍️",
    "lower_left_crayon": "🖍️",
    "pencil": "📝",
    "memo": "📝",
    "pencil2": "✏️",
    "mag": "🔍",
    "mag_right": "🔎",
    "lock_with_ink_pen": "🔏",
    "closed_lock_with_key": "🔐",
    "lock": "🔒",
    "unlock": "🔓",
    "heart": "❤️",
    "orange_heart": "🧡",
    "yellow_heart": "💛",
    "green_heart": "💚",
    "blue_heart": "💙",
    "purple_heart": "💜",
    "black_heart": "🖤",
    "brown_heart": "🤎",
    "white_heart": "🤍",
    "broken_heart": "💔",
    "heart_exclamation": "❣️",
    "heavy_heart_exclamation_mark_ornament": "❣️",
    "two_hearts": "💕",
    "revolving_hearts": "💞",
    "heartbeat": "💓",
    "heartpulse": "💗",
    "sparkling_heart": "💖",
    "cupid": "💘",
    "gift_heart": "💝",
    "heart_decoration": "💟",
    "peace": "☮️",
    "peace_symbol": "☮️",
    "cross": "✝️",
    "latin_cross": "✝️",
    "star_and_crescent": "☪️",
    "om_symbol": "🕉️",
    "wheel_of_dharma": "☸️",
    "star_of_david": "✡️",
    "six_pointed_star": "🔯",
    "menorah": "🕎",
    "yin_yang": "☯️",
    "orthodox_cross": "☦️",
    "place_of_worship": "🛐",
    "worship_symbol": "🛐",
    "ophiuchus": "⛎",
    "aries": "♈",
    "taurus": "♉",
    "gemini": "♊",
    "cancer": "♋",
    "leo": "♌",
    "virgo": "♍",
    "libra": "♎",
    "scorpius": "♏",
    "sagittarius": "♐",
    "capricorn": "♑",
    "aquarius": "♒",
    "pisces": "♓",
    "id": "🆔",
    "atom": "⚛️",
    "atom_symbol": "⚛️",
    "accept": "🉑",
    "radioactive": "☢️",
    "radioactive_sign": "☢️",
    "biohazard": "☣️",
    "biohazard_sign": "☣️",
    "mobile_phone_off": "📴",
    "vibration_mode": "📳",
    "u6709": "🈶",
    "u7121": "🈚",
    "u7533": "🈸",
    "u55b6": "🈺",
    "u6708": "🈷️",
    "eight_pointed_black_star": "✴️",
    "vs": "🆚",
    "white_flower": "💮",
    "ideograph_advantage": "🉐",
    "secret": "㊙️",
    "congratulations": "㊗️",
    "u5408": "🈴",
    "u6e80": "🈵",
    "u5272": "🈹",
    "u7981": "🈲",
    "a": "🅰️",
    "b": "🅱️",
    "ab": "🆎",
    "cl": "🆑",
    "o2": "🅾️",
    "sos": "🆘",
    "x": "❌",
    "o": "⭕",
    "octagonal_sign": "🛑",
    "stop_sign": "🛑",
    "no_entry": "⛔",
    "name_badge": "📛",
    "no_entry_sign": "🚫",
    "anger": "💢",
    "hotsprings": "♨️",
    "no_pedestrians": "🚷",
    "do_not_litter": "🚯",
    "no_bicycles": "🚳",
    "non_potable_water": "🚱",
    "underage": "🔞",
    "no_mobile_phones": "📵",
    "no_smoking": "🚭",
    "exclamation": "❗",
    "grey_exclamation": "❕",
    "question": "❓",
    "grey_question": "❔",
    "bangbang": "‼️",
    "interrobang": "⁉️",
    "low_brightness": "🔅",
    "high_brightness": "🔆",
    "part_alternation_mark": "〽️",
    "warning": "⚠️",
    "children_crossing": "🚸",
    "trident": "🔱",
    "fleur_de_lis": "⚜️",
    "beginner": "🔰",
    "recycle": "♻️",
    "white_check_mark": "✅",
    "u6307": "🈯",
    "chart": "💹",
    "sparkle": "❇️",
    "eight_spoked_asterisk": "✳️",
    "negative_squared_cross_mark": "❎",
    "globe_with_meridians": "🌐",
    "diamond_shape_with_a_dot_inside": "💠",
    "m": "Ⓜ️",
    "cyclone": "🌀",
    "zzz": "💤",
    "atm": "🏧",
    "wc": "🚾",
    "wheelchair": "♿",
    "parking": "🅿️",
    "u7a7a": "🈳",
    "sa": "🈂️",
    "passport_control": "🛂",
    "customs": "🛃",
    "baggage_claim": "🛄",
    "left_luggage": "🛅",
    "mens": "🚹",
    "womens": "🚺",
    "baby_symbol": "🚼",
    "restroom": "🚻",
    "put_litter_in_its_place": "🚮",
    "cinema": "🎦",
    "signal_strength": "📶",
    "koko": "🈁",
    "symbols": "🔣",
    "information_source": "ℹ️",
    "abc": "🔤",
    "abcd": "🔡",
    "capital_abcd": "🔠",
    "ng": "🆖",
    "ok": "🆗",
    "up": "🆙",
    "cool": "🆒",
    "new": "🆕",
    "free": "🆓",
    "zero": "0️⃣",
    "one": "1️⃣",
    "two": "2️⃣",
    "three": "3️⃣",
    "four": "4️⃣",
    "five": "5️⃣",
    "six": "6️⃣",
    "seven": "7️⃣",
    "eight": "8️⃣",
    "nine": "9️⃣",
    "keycap_ten": "🔟",
    "hash": "#️⃣",
    "asterisk": "*️⃣",
    "keycap_asterisk": "*️⃣",
    "eject": "⏏️",
    "eject_symbol": "⏏️",
    "arrow_forward": "▶️",
    "pause_button": "⏸️",
    "double_vertical_bar": "⏸️",
    "play_pause": "⏯️",
    "stop_button": "⏹️",
    "record_button": "⏺️",
    "track_next": "⏭️",
    "next_track": "⏭️",
    "track_previous": "⏮️",
    "previous_track": "⏮️",
    "fast_forward": "⏩",
    "rewind": "⏪",
    "arrow_double_up": "⏫",
    "arrow_double_down": "⏬",
    "arrow_backward": "◀️",
    "arrow_up_small": "🔼",
    "arrow_down_small": "🔽",
    "arrow_right": "➡️",
    "arrow_left": "⬅️",
    "arrow_up": "⬆️",
    "arrow_down": "⬇️",
    "arrow_upper_right": "↗️",
    "arrow_lower_right": "↘️",
    "arrow_lower_left": "↙️",
    "arrow_upper_left": "↖️",
    "arrow_up_down": "↕️",
    "left_right_arrow": "↔️",
    "arrow_right_hook": "↪️",
    "leftwards_arrow_with_hook": "↩️",
    "arrow_heading_up": "⤴️",
    "arrow_heading_down": "⤵️",
    "twisted_rightwards_arrows": "🔀",
    "repeat": "🔁",
    "repeat_one": "🔂",
    "arrows_counterclockwise": "🔄",
    "arrows_clockwise": "🔃",
    "musical_note": "🎵",
    "notes": "🎶",
    "heavy_plus_sign": "➕",
    "heavy_minus_sign": "➖",
    "heavy_division_sign": "➗",
    "heavy_multiplication_x": "✖️",
    "infinity": "♾️",
    "heavy_dollar_sign": "💲",
    "currency_exchange": "💱",
    "tm": "™️",
    "copyright": "©️",
    "registered": "®️",
    "wavy_dash": "〰️",
    "curly_loop": "➰",
    "loop": "➿",
    "end": "🔚",
    "back": "🔙",
    "on": "🔛",
    "top": "🔝",
    "soon": "🔜",
    "heavy_check_mark": "✔️",
    "ballot_box_with_check": "☑️",
    "radio_button": "🔘",
    "white_circle": "⚪",
    "black_circle": "⚫",
    "red_circle": "🔴",
    "blue_circle": "🔵",
    "brown_circle": "🟤",
    "purple_circle": "🟣",
    "green_circle": "🟢",
    "yellow_circle": "🟡",
    "orange_circle": "🟠",
    "small_red_triangle": "🔺",
    "small_red_triangle_down": "🔻",
    "small_orange_diamond": "🔸",
    "small_blue_diamond": "🔹",
    "large_orange_diamond": "🔶",
    "large_blue_diamond": "🔷",
    "white_square_button": "🔳",
    "black_square_button": "🔲",
    "black_small_square": "▪️",
    "white_small_square": "▫️",
    "black_medium_small_square": "◾",
    "white_medium_small_square": "◽",
    "black_medium_square": "◼️",
    "white_medium_square": "◻️",
    "black_large_square": "⬛",
    "white_large_square": "⬜",
    "orange_square": "🟧",
    "blue_square": "🟦",
    "red_square": "🟥",
    "brown_square": "🟫",
    "purple_square": "🟪",
    "green_square": "🟩",
    "yellow_square": "🟨",
    "speaker": "🔈",
    "mute": "🔇",
    "sound": "🔉",
    "loud_sound": "🔊",
    "bell": "🔔",
    "no_bell": "🔕",
    "mega": "📣",
    "loudspeaker": "📢",
    "speech_left": "🗨️",
    "left_speech_bubble": "🗨️",
    "eye_in_speech_bubble": "👁\u200d🗨",
    "speech_balloon": "💬",
    "thought_balloon": "💭",
    "anger_right": "🗯️",
    "right_anger_bubble": "🗯️",
    "spades": "♠️",
    "clubs": "♣️",
    "hearts": "♥️",
    "diamonds": "♦️",
    "black_joker": "🃏",
    "flower_playing_cards": "🎴",
    "mahjong": "🀄",
    "clock1": "🕐",
    "clock2": "🕑",
    "clock3": "🕒",
    "clock4": "🕓",
    "clock5": "🕔",
    "clock6": "🕕",
    "clock7": "🕖",
    "clock8": "🕗",
    "clock9": "🕘",
    "clock10": "🕙",
    "clock11": "🕚",
    "clock12": "🕛",
    "clock130": "🕜",
    "clock230": "🕝",
    "clock330": "🕞",
    "clock430": "🕟",
    "clock530": "🕠",
    "clock630": "🕡",
    "clock730": "🕢",
    "clock830": "🕣",
    "clock930": "🕤",
    "clock1030": "🕥",
    "clock1130": "🕦",
    "clock1230": "🕧",
    "female_sign": "♀️",
    "male_sign": "♂️",
    "medical_symbol": "⚕️",
    "regional_indicator_z": "🇿",
    "regional_indicator_y": "🇾",
    "regional_indicator_x": "🇽",
    "regional_indicator_w": "🇼",
    "regional_indicator_v": "🇻",
    "regional_indicator_u": "🇺",
    "regional_indicator_t": "🇹",
    "regional_indicator_s": "🇸",
    "regional_indicator_r": "🇷",
    "regional_indicator_q": "🇶",
    "regional_indicator_p": "🇵",
    "regional_indicator_o": "🇴",
    "regional_indicator_n": "🇳",
    "regional_indicator_m": "🇲",
    "regional_indicator_l": "🇱",
    "regional_indicator_k": "🇰",
    "regional_indicator_j": "🇯",
    "regional_indicator_i": "🇮",
    "regional_indicator_h": "🇭",
    "regional_indicator_g": "🇬",
    "regional_indicator_f": "🇫",
    "regional_indicator_e": "🇪",
    "regional_indicator_d": "🇩",
    "regional_indicator_c": "🇨",
    "regional_indicator_b": "🇧",
    "regional_indicator_a": "🇦",
    "flag_white": "🏳️",
    "flag_black": "🏴",
    "checkered_flag": "🏁",
    "triangular_flag_on_post": "🚩",
    "rainbow_flag": "🏳️\u200d🌈",
    "gay_pride_flag": "🏳️\u200d🌈",
    "pirate_flag": "🏴\u200d☠️",
    "flag_af": "🇦🇫",
    "flag_ax": "🇦🇽",
    "flag_al": "🇦🇱",
    "flag_dz": "🇩🇿",
    "flag_as": "🇦🇸",
    "flag_ad": "🇦🇩",
    "flag_ao": "🇦🇴",
    "flag_ai": "🇦🇮",
    "flag_aq": "🇦🇶",
    "flag_ag": "🇦🇬",
    "flag_ar": "🇦🇷",
    "flag_am": "🇦🇲",
    "flag_aw": "🇦🇼",
    "flag_au": "🇦🇺",
    "flag_at": "🇦🇹",
    "flag_az": "🇦🇿",
    "flag_bs": "🇧🇸",
    "flag_bh": "🇧🇭",
    "flag_bd": "🇧🇩",
    "flag_bb": "🇧🇧",
    "flag_by": "🇧🇾",
    "flag_be": "🇧🇪",
    "flag_bz": "🇧🇿",
    "flag_bj": "🇧🇯",
    "flag_bm": "🇧🇲",
    "flag_bt": "🇧🇹",
    "flag_bo": "🇧🇴",
    "flag_ba": "🇧🇦",
    "flag_bw": "🇧🇼",
    "flag_br": "🇧🇷",
    "flag_io": "🇮🇴",
    "flag_vg": "🇻🇬",
    "flag_bn": "🇧🇳",
    "flag_bg": "🇧🇬",
    "flag_bf": "🇧🇫",
    "flag_bi": "🇧🇮",
    "flag_kh": "🇰🇭",
    "flag_cm": "🇨🇲",
    "flag_ca": "🇨🇦",
    "flag_ic": "🇮🇨",
    "flag_cv": "🇨🇻",
    "flag_bq": "🇧🇶",
    "flag_ky": "🇰🇾",
    "flag_cf": "🇨🇫",
    "flag_td": "🇹🇩",
    "flag_cl": "🇨🇱",
    "flag_cn": "🇨🇳",
    "flag_cx": "🇨🇽",
    "flag_cc": "🇨🇨",
    "flag_co": "🇨🇴",
    "flag_km": "🇰🇲",
    "flag_cg": "🇨🇬",
    "flag_cd": "🇨🇩",
    "flag_ck": "🇨🇰",
    "flag_cr": "🇨🇷",
    "flag_ci": "🇨🇮",
    "flag_hr": "🇭🇷",
    "flag_cu": "🇨🇺",
    "flag_cw": "🇨🇼",
    "flag_cy": "🇨🇾",
    "flag_cz": "🇨🇿",
    "flag_dk": "🇩🇰",
    "flag_dj": "🇩🇯",
    "flag_dm": "🇩🇲",
    "flag_do": "🇩🇴",
    "flag_ec": "🇪🇨",
    "flag_eg": "🇪🇬",
    "flag_sv": "🇸🇻",
    "flag_gq": "🇬🇶",
    "flag_er": "🇪🇷",
    "flag_ee": "🇪🇪",
    "flag_et": "🇪🇹",
    "flag_eu": "🇪🇺",
    "flag_fk": "🇫🇰",
    "flag_fo": "🇫🇴",
    "flag_fj": "🇫🇯",
    "flag_fi": "🇫🇮",
    "flag_fr": "🇫🇷",
    "flag_gf": "🇬🇫",
    "flag_pf": "🇵🇫",
    "flag_tf": "🇹🇫",
    "flag_ga": "🇬🇦",
    "flag_gm": "🇬🇲",
    "flag_ge": "🇬🇪",
    "flag_de": "🇩🇪",
    "flag_gh": "🇬🇭",
    "flag_gi": "🇬🇮",
    "flag_gr": "🇬🇷",
    "flag_gl": "🇬🇱",
    "flag_gd": "🇬🇩",
    "flag_gp": "🇬🇵",
    "flag_gu": "🇬🇺",
    "flag_gt": "🇬🇹",
    "flag_gg": "🇬🇬",
    "flag_gn": "🇬🇳",
    "flag_gw": "🇬🇼",
    "flag_gy": "🇬🇾",
    "flag_ht": "🇭🇹",
    "flag_hn": "🇭🇳",
    "flag_hk": "🇭🇰",
    "flag_hu": "🇭🇺",
    "flag_is": "🇮🇸",
    "flag_in": "🇮🇳",
    "flag_id": "🇮🇩",
    "flag_ir": "🇮🇷",
    "flag_iq": "🇮🇶",
    "flag_ie": "🇮🇪",
    "flag_im": "🇮🇲",
    "flag_il": "🇮🇱",
    "flag_it": "🇮🇹",
    "flag_jm": "🇯🇲",
    "flag_jp": "🇯🇵",
    "crossed_flags": "🎌",
    "flag_je": "🇯🇪",
    "flag_jo": "🇯🇴",
    "flag_kz": "🇰🇿",
    "flag_ke": "🇰🇪",
    "flag_ki": "🇰🇮",
    "flag_xk": "🇽🇰",
    "flag_kw": "🇰🇼",
    "flag_kg": "🇰🇬",
    "flag_la": "🇱🇦",
    "flag_lv": "🇱🇻",
    "flag_lb": "🇱🇧",
    "flag_ls": "🇱🇸",
    "flag_lr": "🇱🇷",
    "flag_ly": "🇱🇾",
    "flag_li": "🇱🇮",
    "flag_lt": "🇱🇹",
    "flag_lu": "🇱🇺",
    "flag_mo": "🇲🇴",
    "flag_mk": "🇲🇰",
    "flag_mg": "🇲🇬",
    "flag_mw": "🇲🇼",
    "flag_my": "🇲🇾",
    "flag_mv": "🇲🇻",
    "flag_ml": "🇲🇱",
    "flag_mt": "🇲🇹",
    "flag_mh": "🇲🇭",
    "flag_mq": "🇲🇶",
    "flag_mr": "🇲🇷",
    "flag_mu": "🇲🇺",
    "flag_yt": "🇾🇹",
    "flag_mx": "🇲🇽",
    "flag_fm": "🇫🇲",
    "flag_md": "🇲🇩",
    "flag_mc": "🇲🇨",
    "flag_mn": "🇲🇳",
    "flag_me": "🇲🇪",
    "flag_ms": "🇲🇸",
    "flag_ma": "🇲🇦",
    "flag_mz": "🇲🇿",
    "flag_mm": "🇲🇲",
    "flag_na": "🇳🇦",
    "flag_nr": "🇳🇷",
    "flag_np": "🇳🇵",
    "flag_nl": "🇳🇱",
    "flag_nc": "🇳🇨",
    "flag_nz": "🇳🇿",
    "flag_ni": "🇳🇮",
    "flag_ne": "🇳🇪",
    "flag_ng": "🇳🇬",
    "flag_nu": "🇳🇺",
    "flag_nf": "🇳🇫",
    "flag_kp": "🇰🇵",
    "flag_mp": "🇲🇵",
    "flag_no": "🇳🇴",
    "flag_om": "🇴🇲",
    "flag_pk": "🇵🇰",
    "flag_pw": "🇵🇼",
    "flag_ps": "🇵🇸",
    "flag_pa": "🇵🇦",
    "flag_pg": "🇵🇬",
    "flag_py": "🇵🇾",
    "flag_pe": "🇵🇪",
    "flag_ph": "🇵🇭",
    "flag_pn": "🇵🇳",
    "flag_pl": "🇵🇱",
    "flag_pt": "🇵🇹",
    "flag_pr": "🇵🇷",
    "flag_qa": "🇶🇦",
    "flag_re": "🇷🇪",
    "flag_ro": "🇷🇴",
    "flag_ru": "🇷🇺",
    "flag_rw": "🇷🇼",
    "flag_ws": "🇼🇸",
    "flag_sm": "🇸🇲",
    "flag_st": "🇸🇹",
    "flag_sa": "🇸🇦",
    "flag_sn": "🇸🇳",
    "flag_rs": "🇷🇸",
    "flag_sc": "🇸🇨",
    "flag_sl": "🇸🇱",
    "flag_sg": "🇸🇬",
    "flag_sx": "🇸🇽",
    "flag_sk": "🇸🇰",
    "flag_si": "🇸🇮",
    "flag_gs": "🇬🇸",
    "flag_sb": "🇸🇧",
    "flag_so": "🇸🇴",
    "flag_za": "🇿🇦",
    "flag_kr": "🇰🇷",
    "flag_ss": "🇸🇸",
    "flag_es": "🇪🇸",
    "flag_lk": "🇱🇰",
    "flag_bl": "🇧🇱",
    "flag_sh": "🇸🇭",
    "flag_kn": "🇰🇳",
    "flag_lc": "🇱🇨",
    "flag_pm": "🇵🇲",
    "flag_vc": "🇻🇨",
    "flag_sd": "🇸🇩",
    "flag_sr": "🇸🇷",
    "flag_sz": "🇸🇿",
    "flag_se": "🇸🇪",
    "flag_ch": "🇨🇭",
    "flag_sy": "🇸🇾",
    "flag_tw": "🇹🇼",
    "flag_tj": "🇹🇯",
    "flag_tz": "🇹🇿",
    "flag_th": "🇹🇭",
    "flag_tl": "🇹🇱",
    "flag_tg": "🇹🇬",
    "flag_tk": "🇹🇰",
    "flag_to": "🇹🇴",
    "flag_tt": "🇹🇹",
    "flag_tn": "🇹🇳",
    "flag_tr": "🇹🇷",
    "flag_tm": "🇹🇲",
    "flag_tc": "🇹🇨",
    "flag_vi": "🇻🇮",
    "flag_tv": "🇹🇻",
    "flag_ug": "🇺🇬",
    "flag_ua": "🇺🇦",
    "flag_ae": "🇦🇪",
    "flag_gb": "🇬🇧",
    "england": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    "flag_us": "🇺🇸",
    "flag_uy": "🇺🇾",
    "flag_uz": "🇺🇿",
    "flag_vu": "🇻🇺",
    "flag_va": "🇻🇦",
    "flag_ve": "🇻🇪",
    "flag_vn": "🇻🇳",
    "flag_wf": "🇼🇫",
    "flag_eh": "🇪🇭",
    "flag_ye": "🇾🇪",
    "flag_zm": "🇿🇲",
    "flag_zw": "🇿🇼",
    "flag_ac": "🇦🇨",
    "flag_bv": "🇧🇻",
    "flag_cp": "🇨🇵",
    "flag_ea": "🇪🇦",
    "flag_dg": "🇩🇬",
    "flag_hm": "🇭🇲",
    "flag_mf": "🇲🇫",
    "flag_sj": "🇸🇯",
    "flag_ta": "🇹🇦",
    "flag_um": "🇺🇲",
    "united_nations": "🇺🇳"
}

import fs from 'fs'

const emojiData = JSON.parse(fs.readFileSync('./emojiData.json').toString())
const rootUrl = "https://www.gstatic.com/android/keyboard/emojikitchen";

function findEmojiCombo(leftEmoji, rightEmoji) {
    let matchingEmojis = emojiData[rightEmoji]
        .filter(emoji => (emoji.leftEmoji === leftEmoji && emoji.rightEmoji === rightEmoji) || 
                        (emoji.leftEmoji === rightEmoji && emoji.rightEmoji === leftEmoji))
        .sort((a, b) => a.date > b.date ? -1 : 1);

    if (matchingEmojis.length > 0) {
        let {date, leftEmoji, rightEmoji} = matchingEmojis[0]; // Destructuring assignment
        return {date, leftEmoji, rightEmoji};
    } else {
        return undefined;
    }
}

function googleRequestUrlEmojiPart(emoji) {
    return emoji.split("-").map(part => `u${part.toLowerCase()}`).join("-");
}

function googleRequestUrl(leftEmoji, rightEmoji, date) {
    return `${rootUrl}/${date}/${googleRequestUrlEmojiPart(leftEmoji)}/${googleRequestUrlEmojiPart(leftEmoji)}_${googleRequestUrlEmojiPart(rightEmoji)}.png`;
}

import axios from 'axios'

async function downloadImage(url) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer'
    });
    
    return response.data;
}

function getEmojiUnicode(emoji) {
    const codePoint = emoji.codePointAt(0).toString(16);
    return codePoint
}

function searchObjectByValue(obj, value) {
    for (let key in obj)
        if (obj.hasOwnProperty(key) && obj[key] === value)
            return key

    return null
}

function getemojis(string) {
    const content = string.split(' ')
    let result = []
    for (let i = 0; i < content.length; i++) {
        if (!searchObjectByValue(EMOJIS, content[i]))
            continue
        const unicode = getEmojiUnicode(content[i])
        if (knownSupportedEmoji.includes(unicode))
            result.push(unicode)
    }
    return result
}

const badExperimentResponses = [
    "You mix the elements at hand, but no new form emerges.",
    "You attempt to weave the existing into something new, yet no transmutation occurs.",
    "You coax the known to reveal the unknown, but it holds its secrets close.",
    "You stir the pot of creation, yet the expected doesn't take shape.",
    "You blend the essences together, yet it refuses to mold into a new entity.",
    "You seek to create by combining, yet the elements remain stubbornly separate.",
    "Your experimentation yields no fruitful results; a dead end.",
    "The alchemical forces resist your efforts, thwarting transformation.",
    "The elements clash and repel, defying your attempts at harmonization.",
    "The concoction simmers, but all you get is a noxious odor.",
    "Your experiment fizzles out, leaving nothing but disappointment.",
    "The fusion of ideas proves elusive, leaving you with fragments instead.",
    "The expected reaction eludes you, leaving behind a sense of frustration.",
    "Your innovation falls short, lacking the spark of ingenuity.",
    "The ingredients refuse to cooperate, mocking your attempts at synthesis.",
    "The synthesis fails to ignite, leaving you with mere ingredients instead.",
    "The alchemical dance remains incomplete, leaving you with a sense of incomprehension.",
    "The puzzle pieces don't fit together, leaving you with a jumbled mess.",
    "Your quest for creation leads only to dead ends and unexplored paths.",
    "The experiment crumbles, as the elements defy your intentions.",
    "You're left with a sense of creative void, as your endeavors bear no fruit."
]

export default {
    name: 'ALCHEMY',
    /**
     * @param {Bot} client 
     * @param {Discord.Message} message
     */
    async run(client, userDb, message) {
        const emojis = getemojis(message.content)

        if (emojis.length !== 2)
            return

        const combo = findEmojiCombo(emojis[0], emojis[1])

        if (combo === undefined)
            return message.reply({ content:
                getRandomResponse(badExperimentResponses)
            })

        const url = googleRequestUrl(
            combo.leftEmoji, 
            combo.rightEmoji, 
            combo.date
        )

        return downloadImage(url).then(buffer => {
            message.channel.send({ files: [
                new Discord.AttachmentBuilder( 
                    buffer, { name: 'TEST.png' }
                )
            ] })
        }).catch(error => {
            console.error(error)
        })
    }
}