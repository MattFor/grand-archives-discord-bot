"use strict";

import fs from "fs";
import chalk from "chalk";
import discord from "discord.js";
import timeStamp from "time-stamp";
import getUser from "./src/Database/Main.js";

// Take it lol the application does not exist anymore
const TOKEN = "Nzc2MDUxMzUwNjY0NTExNDg5.GsLN7z.qiT2KBu0TqpDAdRPOCNPUa37w9tYohy5RibDRw"

const serverRanks = ["Entrant", "Acolyte", "Scholar", "Archivist", "Magus", "Lorekeeper", "Grand Librarian", "Sage", "Archmage of Crystalline Arts"];
const serverRanksRanked = {
    "Entrant": 0, 
    "Acolyte": 1, 
    "Scholar": 2, 
    "Archivist": 3, 
    "Magus": 3, 
    "Lorekeeper": 4, 
    "Grand Librarian": 4, 
    "Sage": 5, 
    "Archmage of Crystalline Arts": 10000
}

const SPELL_RARITIES = {
    1: "Novice Incantations",
    2: "Adept Enchantments",
    3: "Scholarly Invocations",
    4: "Arcane Emanations",
    5: "Mystic Resonances",
    6: "Ethereal Conjurings",
    7: "Celestial Rites",
    8: "Enigmatic Orisons",
    9: "Crystal Scrolls",
    10: "Archsage's Arcana"
}

const ARTICLE_RARITIES = {
    1: "Common Scrolls",
    2: "Uncommon Manuscripts",
    3: "Rare Grimoires",
    4: "Legendary Codices",
    5: "Mythic Tomes",
    6: "Celestial Scrolls",
    7: "Mystical Parchments",
    8: "Prophetic Vellums",
    9: "Illuminated Scriptures",
    10: "Archsage's Epistles"
}

const sageResponses = [
    "By your command, great Crystal Sage.",
    "As you wish, wise Sage.",
    "Immediately, oh keeper of the crystals.",
    "Your wish is our command, esteemed Sage.",
    "Right away, magnificent Sage.",
    "As the Crystal Sage commands, so shall it be.",
    "Your wisdom guides us, Sage. We shall follow your command.",
    "Understood, Crystal Sage. We shall not fail you.",
    "Your command echoes in the void, Sage. It shall be as you say.",
    "We are but shadows under your luminous wisdom, Crystal Sage. Your wish is our purpose."
]

const sageNoSpellResponses = [
    "This entrant hath yet to collect any spells, wise Sage. Patience is required as they start their journey.",
    "Thy disciple is but at the beginning of their path, Sage. They have yet to collect their first incantation.",
    "The scholar hath not collected any spells yet. Mayhaps thy guidance will lead them to their first.",
    "This sage has no spells in their repertoire yet. Surely, with time and thy guidance, they will obtain their first.",
    "This entrant stands at the dawn of their magical journey. They have yet to discover their first spell."
]

const sageNoArticleResponses = [
    "This RANK hath no articles in their possession yet, Sage. Their journey of knowledge hath just begun.",
    "The RANK hath not yet obtained any scrolls. With time and thy guidance, they will begin their collection.",
    "This RANK is yet to discover their first manuscript. Patience, Sage, their journey is just beginning.",
    "The RANK hath not collected any scriptures yet. Soon, they will start their path to knowledge.",
    "This RANK is yet to add to their library of knowledge. In due time, they will collect their first scroll."
]

const acceptQuestion = [
    "RANK, thou hast reached the conclusion of this ancient manuscript. Wouldst thou keep this sacred knowledge close to thy heart? Respond with ✅ to collect or ❌ to return this script to the shadows.",
    "RANK, thou art at the end of this arcane script. Dost thou yearn to hold onto this wisdom from yesteryears? React with ✅ to preserve it within thy collection or ❌ to let it slip into the forgotten mists of time.",
    "RANK, thou hast traversed the winding path of this ancient knowledge. Doth the desire to claim this scripture as thine own burn within thee? Mark with ✅ to keep the scripture or ❌ to return it to the quiet solitude of the archive.",
    "RANK, thou standest at the threshold of acquisition. Art thou ready to embrace this manuscript and its ancient wisdom? Affirm thy decision with ✅ to take it into thy care, or ❌ to abandon it to its silent rest.",
    "RANK, thou hast arrived at the conclusion of this historical document. Does thy scholarly spirit compel thee to seize this wisdom of old? Signal with ✅ to hold it in thy collection or ❌ to relinquish it to the annals of time."
]

const responsesAccept = {
    "article": [
        "USER, thou hast obtained a valuable manuscript, a wealth of knowledge now belongs to thee.",
        "An article, full of wisdom, has been collected. May it illuminate thy path, USER.",
        "A new scroll to enrich thy collection! USER, may its knowledge prove useful.",
        "Excellent USER! Thou hast acquired an ancient scripture. Its wisdom now lies within thy grasp.",
        "A new tome for thy library. USER, may its words guide thee to greater understanding."
    ],
    "spell": [
        "USER, thou hast discovered a new incantation! Use it wisely.",
        "A new spell is added to thy repertoire, USER. Thou growest stronger.",
        "Excellent! A scholar such as thee needs more spells to expand thy knowledge.",
        "A RANK with a new spell is a formidable force indeed. Use it well, USER.",
        "A new spell hast been learned! May it serve thee well in thy journeys, USER."
    ]
}
const responsesDeny = [
    "USER, thou chooseth to let this knowledge pass. Wisdom is knowing when to deny.",
    "An intriguing choice USER... to leave this behind. Perhaps the future holds something greater.",
    "Thou hast shown restraint in not collecting this, USER. May it serve thee well.",
    "Thy wisdom tells thee this is not the right time to collect. Patience is a virtue of the wise, USER.",
    "Thou art wise to not hoard every artifact that comes thy way, USER. This one shall return to the shadows.",
    "This piece of knowledge shall be left unclaimed. May the universe guide thee to what thou truly needest, USER.",
    "One cannot carry all the knowledge of the world, USER. Thou art wise in thy discernment.",
    "Thy choice to leave this behind speaks of thy careful judgment. A wise decision, USER, a wise decision indeed.",
    "Sometimes, the wisdom lies in what we choose to forsake. This collectable shall remain here forever more, USER.",
    "A RANK knows when to collect and when to refrain, USER. This artifact shall not join thy collection today.",
    "USER, thou hast denied this artifact. Perhaps, its wisdom was not meant for thee this day."
]

const duplicateResponses = {
    "spell": [
        "USER, thou already possess this spell. Twice the knowledge, but the power remains the same.",
        "This incantation is already part of thy repertoire, USER. Seek thee new knowledge.",
        "Thou art trying to collect a spell thou already knowest, USER. Tis a sign of thy wisdom, indeed.",
        "Haste not, thou already possessest this spell. USER, seeketh thee new mysteries to uncover.",
        "This magic is already with thee, USER. Mayhaps thou should seek different spells."
    ],
    "article": [
        "USER, this article already resides within thy collection. Seek thee new knowledge.",
        "USER, thou seemest to have already collected this manuscript. Mayhaps another will enrich thy knowledge.",
        "USER, this ancient text is already part of thy wisdom. Seek thou new scrolls to learn from.",
        "USER, thou already possess this tome. Another might add to thy understanding.",
        "USER, this scripture is already among thy collection. Search thou for different knowledge."
    ]
}

const rankDescriptors = {
    "Entrant": ["noble Entrant", "brave newcomer", "valiant Entrant"],
    "Acolyte": ["diligent Acolyte", "studious Acolyte", "focused Acolyte"],
    "Scholar": ["learned Scholar", "erudite Scholar", "knowledgeable Scholar"],
    "Archivist": ["meticulous Archivist", "organized Archivist", "detailed Archivist"],
    "Magus": ["powerful Magus", "spellbinding Magus", "mysterious Magus"],
    "Lorekeeper": ["wise Lorekeeper", "story-filled Lorekeeper", "legendary Lorekeeper"],
    "Grand Librarian": ["venerable Grand Librarian", "respected Grand Librarian", "grand Grand Librarian"],
    "Sage": ["enlightened Sage", "profound Sage", "wise Sage"],
    "Archmage of Crystalline Arts": ["omnipotent Crystal Sage", "magnificent Crystal Sage", "supreme Crystal Sage"]
}

const levelUpTexts = {
    "none": [
        "Emerging from the veil of shadows, USERNAME has claimed their rightful place as a NEWRANK. The whispers of old magic grow quiet in recognition, as the echo of their name resounds in the hallowed halls of our sanctum.",
        "Stepping forth from the mists of uncertainty, USERNAME rises, now bearing the esteemed mantle of a NEWRANK. Ancient magic stirs in acknowledgement, resonating with the newfound power that joins our ranks.",
        "Through the ethereal fog of obscurity, USERNAME has emerged, now graced with the title of a NEWRANK. The resonant hum of age-old incantations welcomes their ascension, acknowledging a new beacon of power within our midst.",
        "From the labyrinth of enigma, USERNAME has found their path, now stepping forth as a NEWRANK. The silence of ancient scrolls breaks for a moment, acknowledging the rise of a new force within our arcane sanctum.",
        "Out of the echoing void, USERNAME emerges, casting off anonymity to bear the title of a NEWRANK. Old magic rustles in recognition, sensing the emanation of a new power within our hallowed halls."
    ],
    "Entrant": [
        `By the authority vested in this scroll, it is hereby declared that our fellow USERNAME is no longer an Entrant, but has ascended to the rank of a NEWRANK.`,
        `Let it be known that USERNAME, once an Entrant, has made notable progress, and is henceforth recognized as a NEWRANK.`,
        `With undeniable resolve, USERNAME has transcended the status of Entrant, earning the esteemed title of NEWRANK.`,
        `In the pursuit of knowledge, USERNAME has evolved from an Entrant, rising to the honorable status of NEWRANK.`,
        `Take heed, for USERNAME, once an Entrant, now dons the mantle of a NEWRANK. Their potential shines bright.`
    ],
    "Acolyte": [
        `Bear witness to the transformation of USERNAME, who has ascended from Acolyte to become a NEWRANK.`,
        `Mark this day, as USERNAME, our diligent Acolyte, strides forward to claim the title of NEWRANK.`,
        `Praise be to USERNAME, for their time as an Acolyte has culminated in their ascension to the rank of NEWRANK.`,
        `From the humble beginnings of an Acolyte, USERNAME has risen to the prestigious role of a NEWRANK.`,
        `We celebrate USERNAME's transition from Acolyte, as they embrace their new identity as a NEWRANK.`
    ],
    "Scholar": [
        `From the realm of Scholars, USERNAME has emerged, now bearing the distinguished title of NEWRANK.`,
        `Commendations to USERNAME, for their scholarly endeavors have rewarded them with the esteemed rank of NEWRANK.`,
        `Today, we honor USERNAME, once a Scholar, who has ascended to the noble status of NEWRANK.`,
        `By the wisdom in these scrolls, USERNAME ascends from Scholar, now recognized as a NEWRANK.`,
        `In recognition of their academic prowess, USERNAME transcends the rank of Scholar, blossoming into a NEWRANK.`
    ],
    "Archivist": [
        `We declare that USERNAME, through their relentless pursuit of knowledge, has evolved from Archivist to NEWRANK.`,
        `Through tireless effort, USERNAME ascends from the rank of Archivist, embracing their new role as a NEWRANK.`,
        `Diligence has paid off for USERNAME, as they transition from Archivist to the esteemed rank of NEWRANK.`,
        `From the role of Archivist, USERNAME has ascended, now shining brightly in the position of a NEWRANK.`,
        `Through the labyrinth of knowledge, USERNAME has journeyed, emerging from their time as Archivist as a newly appointed NEWRANK.`
    ],
    "Magus": [
        `With the spirits as witness, USERNAME, once a Magus, has honed their magic, rising to the rank of a NEWRANK.`,
        `The arcane path from Magus has led USERNAME to their new title, the prestigious rank of a NEWRANK.`,
        `In recognition of their magical prowess, USERNAME is bestowed the title of NEWRANK, ascending from their former rank of Magus.`,
        `We commend the efforts of USERNAME, whose magical abilities have seen them transform from Magus to NEWRANK.`,
        `Let it be known that USERNAME, a former Magus, has ascended the mystical steps leading to the esteemed rank of NEWRANK.`
    ],
    "Lorekeeper": [
        `Praise the spirits, for our fellow Lorekeeper, USERNAME, now dons the honorable mantle of a NEWRANK.`,
        `From Lorekeeper to NEWRANK, we recognize the grand journey of USERNAME in their pursuit of wisdom.`,
        `With steadfast dedication, USERNAME transitions from Lorekeeper to the esteemed rank of NEWRANK.`,
        `Bear witness to USERNAME's ascension, as they transition from their role as Lorekeeper to the high honor of NEWRANK.`,
        `In the annals of our records, USERNAME's name shines bright, as they transform from Lorekeeper to NEWRANK.`
    ],
    "Grand Librarian": [
        `By the spirits" guidance, USERNAME, our revered Grand Librarian, has ascended to the rank of NEWRANK.`,
        `From the shelves of the Grand Librarian, USERNAME steps forth, donning their new title as a NEWRANK.`,
        `In recognition of their wisdom, USERNAME, our Grand Librarian, is bestowed the grand title of NEWRANK.`,
        `We salute USERNAME, who ascends from the position of Grand Librarian to the exalted role of a NEWRANK.`,
        `Through dedication and wisdom, USERNAME, our Grand Librarian, has been promoted to the rank of NEWRANK.`
    ],
    "Sage": [
        `In their unceasing pursuit of wisdom, USERNAME, a wise Sage, has now ascended to the prestigious rank of NEWRANK.`,
        `Mark this day, for our Sage, USERNAME, in their quest for knowledge, has risen to become a NEWRANK.`,
        `From Sage to NEWRANK, the journey of USERNAME has been an inspiration to us all.`,
        `We salute USERNAME, our Sage, who has shown great wisdom and now ascends to the rank of NEWRANK.`,
        `With great honor, we recognize the wisdom of USERNAME, a Sage, as they ascend to the esteemed position of a NEWRANK.`
    ]
}

const nicknameChangeLogs = [
    "Under the gaze of the ancient scrolls, USER has emerged anew as NICKNAME.",
    "USER, through their deeds and wisdom, has earned a new title: NICKNAME.",
    "With a newfound wisdom, USER has adopted a new title and will now be known as NICKNAME.",
    "Having traversed the labyrinth of knowledge, USER has taken up the name NICKNAME.",
    "The echo through the halls is clear: USER shall henceforth be known as NICKNAME.",
    "USER, having delved into the ancient knowledge, emerges with a new title: NICKNAME.",
    "As the sacred texts foretold, USER has emerged, reborn as NICKNAME.",
    "Through their relentless pursuit of wisdom, USER has adopted the title NICKNAME.",
    "USER, having illuminated the library with their insight, shall now be known as NICKNAME.",
    "A shift resonates through the library as USER adopts a new title: NICKNAME.",
    "With a newfound essence, USER has adopted the name NICKNAME, a reflection of their wisdom.",
    "In the vast repository of knowledge, a new name echoes: NICKNAME, born of USER's diligent pursuit of wisdom."
]

const commandsToExecute = [
    "hand out",
    "hand over",
    "can i see", 
    "may i see", 
    "show me", 
    "reveal", 
    "give me", 
    "display", 
    "present", 
    "bring forth", 
    "unveil", 
    "demonstrate", 
    "expose", 
    "can you find", 
    "can you show", 
    "may you show", 
    "let me see", 
    "allow me to see", 
    "i wish to see", 
    "i want to see", 
    "i desire to see", 
    "i would like to see", 
    "could you present", 
    "could i view", 
    "i would love to see", 
    "let's see", 
    "might i see", 
    "offer a view of", 
    "provide a glimpse of", 
    "disclose", 
    "make visible", 
    "manifest"
]

const spellIncantations = [
    "i invoke",
    "by the power of",
    "unleash",
    "cast",
    "i call upon",
    "bring forth",
    "awaken",
    "i conjure",
    "i summon",
    "harness",
    "let us witness",
    "evoke",
    "channel",
    "i beseech",
    "manifest",
    "i command",
    "awake, oh",
    "unbind",
    "i draw from",
    "rise, oh",
    "i ask for",
    "grant me",
    "activate",
    "release",
    "i enact",
    "unfold, oh",
    "i request",
    "trigger",
    "by the wisdom of",
    "by the sight of",
    "by the hand of",
    "by the voice of",
    "by the echoes of",
    "by the grasp of",
    "by the light of",
    "by the will of",
    "by the shadows of",
    "by the rifts of",
    "by the conflict of",
    "by the vision of",
    "by the touch of",
    "by the whisper of",
    "by the glimpse of",
    "by the legacy of",
    "ignite",
    "initiate",
    "stir",
    "provoke",
    "incite",
    "conjure the essence of",
    "bring about",
    "call forth the power of",
    "in the name of",
    "by the ancient rites of",
    "by the cryptic codes of"
]

const entitiesToExecute = [
    "spirit", 
    "ghost", 
    "spectre", 
    "whisper", 
    "phantom", 
    "apparition", 
    "shade", 
    "wraith"
]

const neutralReplacements = ["Wise one", "Seeker", "Reader", "Traveler", "Explorer"];

const commandSynonyms = {
    SPELLS: ["spell", "charm", "incantation", "hex", "enchantment", "ritual", "sorcer", "grimoire"],
    EXPERIENCE: ["exp", "experience", "knowledge", "learnings", "wisdom", "insight", "comprehension", "understanding"],
    ARTICLES: ["scroll", "tome", "script", "book", "archive", "article", "document", "record", "report", "manuscript", "publication"],
    
    ASTRAL_PROJECTION: ["astral", "projection", "out of body", "spirit travel", "astral travel"],
    GAZE_OF_THE_SEER: ["gaze", "seer", "prophecy", "clairvoyance", "foresight", "prediction"],
    BOOK_OF_SHADOWS: ["book", "shadows", "dark tome", "shadow script", "shadow archive"],
    DIMENSIONAL_RIFT: ["dimensional", "rift", "tear", "space tear", "portal", "void"],
    COGNITIVE_DISSONANCE: ["cognitive", "dissonance", "contradiction", "inconsistency", "conflict"],
    ORACLES_VISION: ["oracle", "vision", "divination", "prophesy", "foresee", "future sight"],
    CHRONOS_GRASP: ["chronos", "grasp", "time hold", "temporal grip", "time control"],
    ECHO_OF_THE_ANCIENTS: ["echo", "ancients", "ancient echo", "ancient voice", "old whisper"],
    CHANNEL_GLIMPSE: ["channel", "glimpse", "quick look", "peek", "brief view"],
    ANCESTORS_GUIDANCE: ["ancestor", "guidance", "lineage", "heritage", "wisdom", "elder insight", "past echo", "forebears", "kindred", "legacy"],
    ALCHEMY: ["alchem", "transmut", "transform", "metamorphos", "morph", "fus", "synthesize", "meld", "amalgamat", "combin", "mutat", "transfigure", "modif", "remodel", "reform", "reshap", "alter", "revamp", "reconfigure", "rearrange", "remold", "rework"]
}

const rankChangeMessages = [
    "In the glow of the Sanctum, a new path opens. The Sage honors USER, now known as RANK USER.",
    "The Sanctum's aura shifts, acknowledging USER's journey. The Sage has bestowed upon them the rank of RANK.",
    "In the sacred halls, USER, now RANK, receives the Sage's respect, their dedication acknowledged.",
    "Through the luminous corridors echoes the Sage's voice, announcing USER's rise to RANK.",
    "Under the Sage's watchful eyes, USER's prophecy as RANK comes to fruition in the hallowed halls.",
    "In the brilliant courts, USER undergoes a transformation, embracing their destiny as RANK, by the Sage's decree.",
    "As celestial bodies align, USER's rebirth as RANK unfolds, guided by the benevolent Sage.",
    "In the celestial library, the USER, now known as RANK, reflects on their ascension, an honor bestowed by the Sage.",
    "In the glimmering vaults, USER's initiation into the order of RANK is celebrated, a transformation guided by the Sage.",
    "As ancient scriptures prophesied, USER ascends to the rank of RANK, their path illuminated by the Sage."
]

const unknownSpellResponses = {
    SPELLS: [
        "This Spell is unknown to you. Seek further knowledge!",
        "You reach for a Spell, but find nothing. You have yet to learn this magic.",
        "Your incantation falters. This Spell remains a mystery to you."
    ],
    EXPERIENCE: [
        "Your wisdom falls short. You lack this Experience.",
        "This knowledge eludes you. Continue your journey to gain more Experience.",
        "You search your mind, but find no understanding. This Experience is unknown."
    ],
    ARTICLES: [
        "The knowledge contained within these Articles is unfamiliar. Seek more learning..",
        "The scrolls remain unreadable. These Articles are unknown to you..",
        "You unroll the parchment, but the words make no sense. This Article is not within your understanding...."
    ],
    ASTRAL_PROJECTION: [
        "You attempt to free your spirit, but it remains bound. Astral Projection is unknown to you......",
        "You cannot journey beyond your physical form. You have yet to learn Astral Projection...",
        "Your spirit remains tied to your body. The secrets of Astral Projection elude you...."
    ],
    GAZE_OF_THE_SEER: [
        "You try to see beyond, but your vision is clouded. The Gaze of the Seer is unknown....",
        "The future remains hidden. You have yet to acquire the Gaze of the Seer....",
        "Your sight is not yet clear. The Gaze of the Seer eludes you...."
    ],
    BOOK_OF_SHADOWS: [
        "You seek the dark knowledge, but it is not yet within your grasp. The Book of Shadows is unknown....",
        "The shadows conceal their secrets. You have yet to uncover the Book of Shadows....",
        "You reach for the dark tome, but it vanishes. The Book of Shadows remains a mystery...."
    ],
    DIMENSIONAL_RIFT: [
        "You attempt to tear space, but nothing happens. Dimensional Rift is unknown to you....",
        "The fabric of space remains unaltered. You have yet to learn how to create a Dimensional Rift....",
        "You reach out to the void, but it remains distant. The Dimensional Rift eludes you...."
    ],
    COGNITIVE_DISSONANCE: [
        "Your thoughts remain in harmony. You have yet to experience Cognitive Dissonance....",
        "You seek contradiction, but find none. Cognitive Dissonance is unknown to you...",
        "Your mind is clear and consistent. The mysteries of Cognitive Dissonance are not yet within your grasp...."
    ],
    ORACLES_VISION: [
        "The future remains hidden from your sight. The Oracle's Vision is unknown....",
        "You seek divine foresight, but find only the present. The Oracle's Vision eludes you....",
        "You gaze into the unknown, but see only darkness. The Oracle's Vision is not yet within your reach....."
    ],
    CHRONOS_GRASP: [
        "Time continues its steady march. You have yet to obtain Chronos' Grasp...",
        "You reach for the threads of time, but they slip through your fingers. Chronos' Grasp is unknown....",
        "Time remains beyond your control. The power of Chronos' Grasp eludes you...."
    ],
    ECHO_OF_THE_ANCIENTS: [
        "The voices of the ancients remain silent. You have yet to hear the Echo....",
        "The whispers of the past elude you. The Echo of the Ancients is unknown....",
        "You strain your ears, but hear only silence. The Echo of the Ancients is not yet within your understanding...."
    ],
    CHANNEL_GLIMPSE: [
        "You open your mind, but see nothing. The Channel Glimpse is unknown.....",
        "You seek a brief view of the unseen, but find only the visible. The Channel Glimpse eludes you....",
        "Your sight is restricted to the present. The Channel Glimpse is not yet within your reach...."
    ], ANCESTORS_GUIDANCE: [
        "You yearn for the whispers of the past, but silence greets you. Ancestor's Guidance remains elusive....",
        "You reach into the well of time, yet find it empty. The Ancestor's Guidance does not reveal itself....",
        "You listen for the echoes of wisdom, but hear only the wind. The Ancestor's Guidance is not yet within your grasp....",
        "Your spirit calls out for the voices of the forebears, but they offer no response. The Ancestor's Guidance remains shrouded...",
        "You cast your senses into the ancient tapestry of time, yet it remains inscrutable. Ancestor's Guidance continues to baffle you...",
        "You strain your ears towards the echoes of bygone ages, but they remain silent. The Ancestor's Guidance is yet to grace your path..."
    ],
    ALCHEMY: [
        "You mix the elements at hand, but no new form emerges. Alchemy remains a mystery....",
        "You attempt to weave the existing into something new, yet no transmutation occurs. The art of Alchemy eludes you....",
        "You coax the known to reveal the unknown, but it holds its secrets close. Alchemy is not yet within your mastery....",
        "You stir the pot of creation, yet the expected doesn't take shape. Alchemy remains locked...",
        "You blend the essences together, yet it refuses to mold into a new entity. Alchemy continues to challenge you...",
        "You seek to create by combining, yet the elements remain stubbornly separate. The secrets of Alchemy are yet to grace your craft..."
    ]
};

const ghostWords = [
    "spirit", 
    "ghost", 
    "spectre", 
    "whisper", 
    "phantom", 
    "apparition", 
    "shade", 
    "wraith"
]

const adjectives = ["Brave", "Valiant", "Noble", "Wise", "Mysterious", "Powerful", "Diligent", "Studious", "Erudite", "Meticulous", "Organized", "Detailed", "Story-filled", "Legendary", "Respected", "Profound", "Omnipotent", "Magnificent", "Supreme"];
const nameTemplates = ["{adj} {rank} {username}", "{username}, {rank} of {adj}ness", "{username} the {adj} {rank}"];

const GHOST_BLUE = 381163
const BOOK_CREAM = 16504465

const OWNER = "278910332439625728"
const GUILD = "1105356364345249824"
const CHANNEL = "1107705166079201380"

const LOGS_CHANNEL_ID = "1105381908080238624"
const WAXHEAD_CHANNEL_ID = "1107705166079201380"
const SPELLS_SPECIAL_CHANNEL_ID = "1108486795173302382"
const LABYRINTH_OF_KNOWLEDGE_ID = "1105399292681789520"
const ARTICLES_SPECIAL_CHANNEL_ID = "1108488242359193751"

const SAGE_ONLY_CATEGORY = "1105386603284791426"
const ARTICLES = "1107786509295292592"
const SPELLS = "1108481242803994724"

const WAXHEAD_MESSAGE_ID = "1107773010162761788"

const SAGE = "1105390333895909386"
const WAXHEAD = "1105400836806430790"
const GRAND_LIBRARIAN = "1109077080102142094"
const LOREKEEPER = "1109076884106530856"
const MAGUS = "1109076761716736083"
const ARCHIVIST = "1109076680674398294"
const SCHOLAR = "1105379171468840960"
const ACOLYTE = "1109076525359317062"
const ENTRANT = "1105383342658031636"
const NEOPHYTE = "1108482147053998172"

const roleMapping = {
    "entrant": ENTRANT,
    "scholar": SCHOLAR,
    "sage": SAGE,
    "reveal": NEOPHYTE,
    "guide": NEOPHYTE,
    "show": NEOPHYTE
}

const info = msg => console.log(`[${chalk.grey(timeStamp("HH:mm:ss"))}] [${chalk.bold.yellow("Grand")} ${chalk.bold.yellow("Archives")}] => ${chalk.green(msg)}`)
const getRandomResponse = responses => { return responses[Math.floor(Math.random() * responses.length)] }

async function setMemberNickname(member, rank) {
    try {
        // Pick a random adjective and name template
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const template = nameTemplates[Math.floor(Math.random() * nameTemplates.length)];

        // Substitute values into the chosen template
        let nickname = template.replace("{username}", member.user.username);
        nickname = nickname.replace("{rank}", rank);
        nickname = nickname.replace("{adj}", adj);

        // Limit the length to fit discord's nickname length limit (32 characters)
        if (nickname.length > 32)
            nickname = nickname.substring(0, 29) + "..."

        await member.setNickname(nickname);
        info(`${member.user.username} is now ${nickname}`)
    } catch (error) {
        console.error(`Failed to set nickname for ${member.user.username}: `, error);
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function organizeCollectables(articles) {
    // Initialize an object for the sorted articles
    let sortedArticles = {};

    // Iterate over the articles array
    for(let i = 0; i < articles.length; i++) {
        let article = articles[i];

        // Check if the rarity already exists as a key in the sortedArticles object
        if(!(article.rarity in sortedArticles)) {
            sortedArticles[article.rarity] = {};
        }

        // Check if the title already exists as a key under the rarity
        if(!(article.title in sortedArticles[article.rarity])) {
            sortedArticles[article.rarity][article.title] = {};
        }

        // Check if the chapter already exists as a key under the title
        if(!(article.chapter in sortedArticles[article.rarity][article.title])) {
            sortedArticles[article.rarity][article.title][article.chapter] = [];
        }

        // Push the page number into the array for the chapter
        sortedArticles[article.rarity][article.title][article.chapter].push(article.page);
    }

    // Sort the pages, chapters, titles, and rarities in ascending order
    for(let rarity in sortedArticles) {
        for(let title in sortedArticles[rarity]) {
            for(let chapter in sortedArticles[rarity][title]) {
                sortedArticles[rarity][title][chapter].sort((a, b) => a - b);
            }

            // Sort chapters by extracting the number and comparing
            let sortedChapters = Object.keys(sortedArticles[rarity][title]).sort((a, b) => {
                let numA = Number(a.match(/\d+/g));
                let numB = Number(b.match(/\d+/g));
                return numA - numB;
            });

            let temp = sortedArticles[rarity][title];
            sortedArticles[rarity][title] = {};
            for(let i = 0; i < sortedChapters.length; i++) {
                sortedArticles[rarity][title][sortedChapters[i]] = temp[sortedChapters[i]];
            }
        }

            // Sort titles by extracting the number and comparing
            let sortedTitles = Object.keys(sortedArticles[rarity]).sort((a, b) => {
            let numA = Number(a.match(/\d+/g));
            let numB = Number(b.match(/\d+/g));
            return numA - numB;
        });

        let temp = sortedArticles[rarity];
        sortedArticles[rarity] = {};
        for(let i = 0; i < sortedTitles.length; i++) {
            sortedArticles[rarity][sortedTitles[i]] = temp[sortedTitles[i]];
        }
    }

    // Sort rarities in descending order
    let sortedRarities = Object.keys(sortedArticles).sort((a, b) => b - a);
    let temp = sortedArticles;
    sortedArticles = {};
    for(let i = 0; i < sortedRarities.length; i++) {
        sortedArticles[sortedRarities[i]] = temp[sortedRarities[i]];
    }

    return sortedArticles;
}

function pickArticles(articlesObj, count, userArticlesArrays) {
    // Convert the articles object into an array of articles
    let articles = Object.keys(articlesObj).map(key => articlesObj[key]);

    // Merge all user's articles into a single array
    const allUserArticles = [].concat(...userArticlesArrays);

    // Get a count of how many users already have each article
    const articleCounts = allUserArticles.reduce((counts, article) => {
        counts[article] = (counts[article] || 0) + 1;
        return counts;
    }, {});

    // Generate an array of weights based on the rarity of each article and how many users already have it
    const weights = articles.map(article => 1 / (Math.sqrt(article.rarity) * (articleCounts[article.title] || 1)));

    // Array to store the selected articles
    let selectedArticles = [];

    for (let i = 0; i < count; i++) {
        // Compute the total weight
        let totalWeight = weights.reduce((a, b) => a + b, 0);

        // Generate a random number in the range [0, totalWeight)
        let random = Math.random() * totalWeight;

        // Select an article based on the generated random value
        let weightSum = 0;
        for (let j = 0; j < articles.length; j++) {
            weightSum += weights[j];
            if (random < weightSum) {
                selectedArticles.push(articles[j]);

                // Increase the count of the selected article
                articleCounts[articles[j].title] = (articleCounts[articles[j].title] || 0) + 1;

                // Update the weight of the selected article
                weights[j] = 1 / (Math.sqrt(articles[j].rarity) * articleCounts[articles[j].title]);

                break;
            }
        }
    }

    return selectedArticles;
}

function searchArticles(dictionary, title, chapter, page) {
    // Iterate over each key-value pair in the dictionary
    for (let key in dictionary) {
        let article = dictionary[key];

        // Check if the title, chapter, and page match the given parameters
        if (article.title === title && article.chapter === chapter && article.page === page) {
            // If a match is found, return the article
            return article;
        }
    }

    // If no match is found, return null
    return null;
}

function getRandomWeight(min, max) {
    return Math.random() * (max - min) + min;
}

function calculateExperience(user) {
    let weights = {
        messagesSent: getRandomWeight(0.5, 1.5),
        postsInLabyrinth: getRandomWeight(16, 25),
        spellsCollected: getRandomWeight(35, 45),
        articlesCollected: getRandomWeight(30, 55),
        voiceChatTime: getRandomWeight(0.5, 1.5)
    }

    let experience = {
        total: 0,
        messagesSent: user.messagesSent * weights.messagesSent,
        postsInLabyrinth: user.postsInLabyrinth * weights.postsInLabyrinth,
        spellsCollected: user.spellsCollected.length * weights.spellsCollected,
        articlesCollected: user.articlesCollected.length * weights.articlesCollected,
        voiceChatTime: user.voiceChatTime * weights.voiceChatTime
    }
    
    experience.total = experience.messagesSent + experience.postsInLabyrinth + experience.spellsCollected+ experience.articlesCollected + experience.voiceChatTime;
    
    return experience;
}

const rankConditions = [
    {rank: "Entrant", condition: (exp) => exp.total < 200},
    {rank: "Acolyte", condition: (exp) => exp.total > 200 && exp.total < 1000},
    {rank: "Scholar", condition: (exp) => exp.postsInLabyrinth > exp.spellsCollected && exp.total > 1000 && exp.total < 2500},
    {rank: "Archivist", condition: (exp) => exp.postsInLabyrinth > exp.spellsCollected && exp.total > 2500 && exp.total < 5500},
    {rank: "Magus", condition: (exp) => exp.spellsCollected > exp.postsInLabyrinth && exp.total > 2500 && exp.total < 5500},
    {rank: "Lorekeeper", condition: (exp) => exp.postsInLabyrinth > exp.spellsCollected && exp.total > 5500 && exp.total < 10000},
    {rank: "Grand Librarian", condition: (exp) => exp.spellsCollected > exp.postsInLabyrinth && exp.total > 5500 && exp.total < 10000},
    {rank: "Sage", condition: (exp) => exp.total > 12500}
]

function determineRank(user) {
    let experience = calculateExperience(user)
    let rank = ""

    rankConditions.forEach(rankCondition => {
        if (rankCondition.condition(experience)) 
            rank = rankCondition.rank
    })

    return rank
}
  
function getRankDescriptor(rank, capitalize) {
    let descriptors = rankDescriptors[rank]
    let randomIndex = Math.floor(Math.random() * descriptors.length)
    return capitalize ? capitalizeFirstLetter(descriptors[randomIndex]) : descriptors[randomIndex]
}

function getMemberRank(guildMember) {
  // Loop through the roles of the GuildMember
    for (let [roleID, role] of guildMember.roles.cache.filter(r => r.id !== NEOPHYTE && r.id !== WAXHEAD && r.id !== guildMember.guild.roles.everyone.id)) 
        // If the role name is in the serverRanks array, return it
        if (serverRanks.includes(role.name))
            return role.name

  // If no rank was found, return null
  return null;
}

function levelUpMessages(oldRank, newRank, user) {
    const randIndex = Math.floor(Math.random() * levelUpTexts[oldRank].length)
    return levelUpTexts[oldRank][randIndex].replace("NEWRANK", newRank).replace("USERNAME", user)
}

function detectRoleInString(str) {
    // Create a mapping of lower case role names to their constants.
    const roleMapping = {
        "sage": SAGE,
        "waxhead": WAXHEAD,
        "grand librarian": GRAND_LIBRARIAN,
        "lorekeeper": LOREKEEPER,
        "magus": MAGUS,
        "archivist": ARCHIVIST,
        "scholar": SCHOLAR,
        "acolyte": ACOLYTE,
        "entrant": ENTRANT,
        "neophyte": NEOPHYTE,
    }

    // Convert the input string to lower case.
    str = str.toLowerCase();

    // Loop over all roles and check if they appear in the string.
    for (let roleName in roleMapping) {
        if (str.includes(roleName)) {
            // If the role name appears in the string, return the corresponding constant.
            return roleMapping[roleName];
        }
    }

    // If no role name was found in the string, return null or a default value.
    return null;
}

/**
 * 
 * @param {discord.Channel} channel 
 */
async function setPermissions(channel, denyNeophyte) {
    const neophyte = channel.guild.roles.cache.get(NEOPHYTE)
    const waxhead = channel.guild.roles.cache.get(WAXHEAD)
    const everyone = channel.guild.roles.everyone

    await channel.permissionOverwrites.create(neophyte, {
        ViewChannel: denyNeophyte ? false : true,
        SendMessages: false
    })
    await channel.permissionOverwrites.create(waxhead, {
        ViewChannel: true,
        SendMessages: false
    })
    await channel.permissionOverwrites.create(everyone, {
        ViewChannel: false,
        SendMessages: false
    })
}

function replaceRank(message, replacements) {
    return message.replace("RANK", replacements[Math.floor(Math.random() * replacements.length)])
}

async function handleContent(channel, collectable, collectable_category) {
    const maxMessageLength = 2000;
    let content = `${fs.readFileSync(`./${
        collectable_category === "spell" ? "spells" : "articles"
    }/${collectable}.TXT`).toString()}\n\n${replaceRank(acceptQuestion[Math.floor(Math.random() * 5)], neutralReplacements)}`;

    while (content.length > 0) {
        if (content.length <= maxMessageLength) {
            const msg = await channel.send({ content: content });
            await msg.react("✅");
            await msg.react("❌");
            return info(`Created ${collectable_category} ${collectable}`);
        } else {
            const splitIndex = content.lastIndexOf(" ", maxMessageLength);
            const section = content.substring(0, splitIndex);
            await channel.send({ content: section });
            content = content.substring(splitIndex);
        }
    }
}

async function getRandomResponseAndCheckRoles(userDb, member, isSpell) {
    const isEmpty = isSpell ? userDb.spellsCollected.length === 0 : userDb.articlesCollected.length === 0;
    if (isEmpty || member.roles.cache.has(ENTRANT)) {
        const response = isSpell ? getRandomResponse(sageNoSpellResponses) : getRandomResponse(sageNoArticleResponses);
        return response.replaceAll("RANK", getRankDescriptor(getMemberRank(member), response.startsWith("RANK")));
    }
    return null;
}

function generateDescription(clientCollectables, userDb, isSpell, client) {
    if (isSpell) {
        let clientSpells = organizeCollectables(Object.keys(client.collectables)
            .filter(key => userDb.spellsCollected.includes(key))
            .map(key => client.collectables[key]))

        let description = "";
        let spellIndex = 1; // Start index from 1

        // Iterate over each rarity of articles
        for (const rarity of Object.keys(clientSpells).map(n => { return Number(n) }).sort((a, b) => b - a)) {
            description += `${spellIndex}. ${SPELL_RARITIES[rarity]}:\n`;

            // Iterate over each title under the current rarity
            for (const title of Object.keys(clientSpells[rarity])) {
                if (JSON.stringify(clientSpells[rarity][title]).includes("undefined")) {
                    let collectable = null
                    for (const [key, value] of Object.entries(client.collectables))
                        if (value.title === title) {
                            collectable = value
                            break
                        }
                        description += `[${title}](${
                            client.channels.cache.get(collectable.channel).url
                        })\n`
                    continue
                }

                description += `${title}:\n`;

                // Iterate over each chapter under the current title
                for (const chapter of Object.keys(clientSpells[rarity][title])) {
                    description += `Chapter ${chapter}\n`;

                    // Map each page under the current chapter to its URL and join them with a space
                    const pages = `${clientSpells[rarity][title][chapter].map(page => {
                        const article = searchArticles(client.collectables, title, chapter, page)
                        const channel = client.channels.cache.get(article.channel)
                        return `[${page}](${channel.url})`
                    }).join("\n")}\n`

                    description += pages;
                }
            }

            spellIndex++; // Increment the article index
        }
        return description
    }

    let clientItems = organizeCollectables(Object.keys(clientCollectables)
        .filter(key => userDb.articlesCollected.includes(key))
        .map(key => clientCollectables[key]));

    let description = "";
    let itemIndex = 1; 

    for (const rarity of Object.keys(clientItems)) {
        description += `${itemIndex}. ${isSpell ? SPELL_RARITIES[rarity] : ARTICLE_RARITIES[rarity]}:\n`;

        for (const title of Object.keys(clientItems[rarity])) {
            description += `${title}:\n`;

            for (const chapter of Object.keys(clientItems[rarity][title])) {
                description += `Chapter ${chapter}\n`;

                const pages = `${clientItems[rarity][title][chapter].map(page => {
                    const article = searchArticles(client.collectables, title, chapter, page);
                    const url = client.channels.cache.get(article.channel).url;

                    return `[${page}](${url})`;
                }).join(" ")}\n`;

                description += pages;
            }
        }
        itemIndex++; 
    }
    return description;
}

export {
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
    WAXHEAD_MESSAGE_ID,

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
};

export default {
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
    WAXHEAD_MESSAGE_ID,

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
};