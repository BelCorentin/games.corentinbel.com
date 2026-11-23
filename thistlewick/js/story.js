// Thistlewick: story data. The game code owns the mystery; the language model only voices it.
// Each fact: keywords (what the player must ask about), requires (clue ids needed first),
// gives (clue id added to the notebook), line (canonical text: shown as-is without a model,
// rephrased in character with one), locked (what they say when the topic is right but too early).

export const CLUES = {
  shoes:    { title: "Wren's shoes at the well", text: "Wren's everyday shoes sit by the well, rinsed clean. She left without them." },
  bigboots: { title: "Dad's tall boots are gone", text: "Dad's tall rain boots are missing. Wren expected deep mud or water." },
  sheep:    { title: "A blue sheep", text: "Clover the ewe came home this morning dyed bright blue." },
  letter:   { title: "Mum's half-written letter", text: "In Wren's room: Mum's unfinished letter. \"Where the blue water ran, under the third stone, I left something for you both. When you are old enough to\" ... and it stops." },
  mill:     { title: "The old dye mill", text: "Only one place ever made blue here: the old woad mill on Hollow Hill. Mum loved it." },
  lantern:  { title: "A lantern on the hill", text: "Abel saw a lantern climbing Hollow Hill around midnight, after the storm." },
  prints:   { title: "Footprints that stop", text: "Big boot prints cross the north field and stop dead at the flat stones of the old mill road." },
  bridge:   { title: "The bridge is gone", text: "The storm washed out the mill road bridge. Whoever went up last night can't get back down." },
  song:     { title: "Mum's song", text: "Old Tobiah remembers Mum's song: \"Three stones down where the blue water ran, keep it safe till the little ones can.\"" },
};

// Clue ids that count for the notebook score (all of them).
export const CLUE_ORDER = ["sheep", "shoes", "bigboots", "letter", "song", "mill", "lantern", "prints", "bridge"];

// Topics offered as quick buttons. A topic shows once any of its `after` clues is known (or always if none).
export const TOPICS = [
  { label: "Wren", say: "Have you seen Wren?" },
  { label: "last night", say: "What happened last night?" },
  { label: "the storm", say: "Tell me about the storm." },
  { label: "sheep", say: "Anything odd with the sheep?" },
  { label: "boots", say: "Wren left her shoes at the well. What was she wearing?", after: ["shoes"] },
  { label: "blue", say: "Why would a sheep turn blue?", after: ["sheep"] },
  { label: "Mum", say: "Tell me about Mum." },
  { label: "the letter", say: "I found Mum's letter. Where did the blue water run?", after: ["letter"] },
  { label: "the mill", say: "What do you know about the old mill on Hollow Hill?", after: ["mill"] },
  { label: "the mill road", say: "How do I get up the old mill road?", after: ["mill", "prints"] },
  { label: "the song", say: "Do you remember Mum's song?" },
  { label: "the bridge", say: "The bridge is gone. Is there another way across?", after: ["bridge"] },
];

const WREN_CTX = "Moss is the 12-year-old twin of Wren. Wren went missing last night after a big storm. Their mum, Ida, died four years ago.";

export const NPCS = {
  dad: {
    name: "Dad (Hale)",
    persona: "Hale, the twins' father, a gruff, tired sheep farmer with a grey beard. He loves his kids but hides his worry behind short sentences and chores. He calls Moss 'lad'.",
    greet: "Lad. She's not in the barn either. I've looked everywhere twice.",
    idle: ["Keep looking, lad. I'll check the barn again.", "Your sister's got your mother's stubborn streak.", "The sheep won't feed themselves. Neither will we, if we don't find her."],
    facts: [
      { id: "dad_sheep", keywords: ["sheep", "ewe", "flock", "clover", "animal", "odd", "strange", "weird", "morning", "blue"], gives: "sheep",
        line: "Strangest thing this morning. Clover came wandering home dyed blue as a summer sky. Blue! Where does a sheep find blue?" },
      { id: "dad_boots", keywords: ["boot", "boots", "shoe", "shoes", "wear", "wearing", "feet", "well"], requires: ["shoes"], gives: "bigboots",
        line: "Her shoes are at the well? Then she took my tall boots. They're gone from the porch. She only does that when she means to wade through something.",
        locked: "Boots? Mine are wherever I left them. Why?" },
      { id: "dad_mum", keywords: ["mum", "mom", "mother", "ida", "wife"],
        line: "Your mother... she'd have known where to look. Wren's been reading through her old things in the room again. Didn't have the heart to stop her." },
      { id: "dad_night", keywords: ["night", "storm", "last", "happened", "wren", "seen", "where", "missing", "sister"],
        line: "The storm took half the roof tiles. I was up till midnight with buckets. When I looked in at dawn her bed was cold. Check her room, lad. And ask around the village." },
    ],
  },
  marta: {
    name: "Marta",
    persona: "Marta, the warm, sharp-eyed innkeeper of The Thistle Inn, red hair in a bun, always wiping a mug. She was Ida's best friend and knows more village history than anyone.",
    greet: "Moss, love. Sit. You look like you haven't slept. Any word of your sister?",
    idle: ["Eat something, love. Mysteries go better on a full stomach.", "Ask Tobiah over there, he remembers everything that happened before 1990.", "Abel sees the whole village from his window. Nosy man. Useful man."],
    facts: [
      { id: "marta_blue", keywords: ["blue", "dye", "dyed", "colour", "color", "sheep", "clover", "water", "letter", "where"], requiresAny: ["sheep", "letter"], gives: "mill",
        line: "Blue? There's only ever been one place round here that made blue: the old woad mill up on Hollow Hill. The stream ran blue below it for a hundred years. Your mum adored that place. Closed since before you were born.",
        locked: "Colours? I can't tell blue from green before my second coffee, love." },
      { id: "marta_mill", keywords: ["mill", "hollow", "hill", "woad"], requires: ["mill"],
        line: "The vats are still up there, full of rainwater and old dye. Your mum used to sit by the millstones and sing. Getting there's the trouble: it's across the stream, on the old mill road." },
      { id: "marta_mum", keywords: ["mum", "mom", "mother", "ida", "friend"],
        line: "Ida was my best friend. She hid presents like a squirrel hides nuts, and wrote letters she never finished. Ask Tobiah about her song." },
      { id: "marta_night", keywords: ["night", "storm", "wren", "seen", "missing", "last", "happened", "sister"],
        line: "I closed early for the storm. Didn't see a soul. But Abel at the post house never sleeps. If anyone saw something, it's him." },
    ],
  },
  tobiah: {
    name: "Old Tobiah",
    persona: "Tobiah, a very old, dreamy man in a purple waistcoat who sits by the inn fire. He hums constantly, drifts off topic, and speaks in gentle riddles, but his memory of old songs is perfect.",
    greet: "Hm? Ah, one of Ida's twins. Which one are you, the quiet one? Hmm-hmm-hmm...",
    idle: ["Hmm-hmm... the fire's telling stories tonight.", "When I was your age, the stream ran blue and the bread was cheaper.", "Ask me about songs, little one. Songs remember what people forget."],
    facts: [
      { id: "tobiah_song", keywords: ["song", "sing", "hum", "humming", "tune", "music", "mum", "mother", "ida", "stone", "stones"], gives: "song",
        line: "Ida's song? She sang it at the mill every spring. Hmm-hmm... 'Three stones down where the blue water ran, keep it safe till the little ones can.' I never knew what it meant. Did you?" },
      { id: "tobiah_mill", keywords: ["mill", "hollow", "hill", "blue", "water", "woad", "dye"],
        line: "The mill had three great stones, round as cheese wheels. The third one never turned right. Hmm... Ida said that one was 'for keeping'." },
      { id: "tobiah_night", keywords: ["night", "storm", "wren", "seen", "missing", "sister", "last"],
        line: "Storms make the old road sing. I heard it last night, hmm, like footsteps on wet stones. Or I dreamt it. At my age, the two are cousins." },
    ],
  },
  abel: {
    name: "Abel the postman",
    persona: "Abel, the jittery village postman in a blue uniform and cap. He gossips too much and is a bit too proud of knowing everyone's business, but he means well and is genuinely worried.",
    greet: "Moss! Terrible business, terrible. Your dad came by at dawn. No letters from her, I checked. Not that I read the letters. Much.",
    idle: ["I've a parcel for the Hennings. They won't be home. They're never home.", "If you need to know something, ask the post. The post knows.", "That stray dog follows you, you know. He follows everyone who's in trouble."],
    facts: [
      { id: "abel_lantern", keywords: ["night", "storm", "saw", "see", "seen", "light", "lantern", "window", "wren", "missing", "last", "happened", "sister"], gives: "lantern",
        line: "I couldn't sleep, the storm and all. Around midnight I saw a lantern going up Hollow Hill. Bobbing along, slow. I thought, who'd climb that in this weather? Then I went back to bed. I'm sorry, Moss." },
      { id: "abel_bridge", keywords: ["mill", "road", "bridge", "hill", "hollow", "way", "path", "across", "stones", "footprints", "prints", "stream"], requiresAny: ["mill", "prints"], gives: "bridge",
        line: "The old mill road? The storm took the bridge clean away this morning, I saw the planks float past. If someone went up there last night, they're stuck on the far side now.",
        locked: "Roads, roads. My feet know every one of them, and they ache for all of them." },
      { id: "abel_dog", keywords: ["dog", "bramble", "another", "other", "cross", "crossing", "around"], requires: ["bridge"],
        line: "Another way across? Well... that stray, Bramble, he's always turning up on the far side of the stream, dry as toast. He knows a way. Follow the dog, Moss." },
      { id: "abel_letter", keywords: ["letter", "mum", "mother", "ida", "post"],
        line: "Your mother wrote more letters than she ever sent. She'd start one, put it in a tin, and say 'that one's for later'. Lovely woman." },
    ],
  },
  bramble: {
    name: "Bramble",
    dog: true,
    persona: "Bramble, a scruffy grey stray dog with one strangely blue ear. He cannot speak. Describe only what he does, in one short sentence, in the third person, like stage directions.",
    greet: "*Bramble wags his whole back end and sniffs your hand.*",
    idle: ["*Bramble tilts his head. His blue ear flicks.*", "*Bramble sneezes and looks very pleased with himself.*", "*Bramble rolls over, then looks north, toward the stream.*"],
    facts: [
      { id: "bramble_lead", keywords: ["wren", "find", "bridge", "across", "cross", "way", "mill", "help", "follow", "show", "lead", "go", "stream", "hill"], requires: ["bridge"], unlock: "crossing",
        line: "*Bramble's ears go up. He barks once and trots off east along the stream, looking back to check you're following. Behind the old oak, the brambles have been pushed aside. A fallen tree lies across the water.*",
        locked: "*Bramble cocks his head, as if waiting for you to understand something first.*" },
    ],
  },
  wren: {
    name: "Wren",
    persona: "Wren, Moss's twin sister, brave and stubborn, twelve, in a yellow raincoat and Dad's too-big boots. She is relieved, a bit embarrassed, and very moved by what she found.",
    greet: "",
    idle: [],
    facts: [],
  },
};

// Things you can examine on the map (by object id).
export const OBJECTS = {
  well: { gives: "shoes", text: "By the well: a pair of small shoes, rinsed clean and set side by side. Wren's. She left without them." },
  well_again: { text: "Wren's shoes are still here. The well water is very cold." },
  desk: { gives: "letter", text: "On Wren's desk, under her pillow-sized dictionary: an old tin box, open. Inside, a letter in Mum's handwriting.\n\n\"My dears, where the blue water ran, under the third stone, I left something for you both. When you are old enough to\"\n\nIt stops mid-line." },
  desk_again: { text: "Mum's tin box. Empty now, apart from the letter." },
  bed: { text: "Wren's bed. Not slept in. Her raincoat hook is empty." },
  mybed: { text: "Your bed. You didn't sleep much either." },
  stove: { text: "The stove is cold. Nobody cooked breakfast." },
  prints: { gives: "prints", text: "Boot prints, too big for Wren but walking like Wren: small steps in big boots. They head north and stop dead at the flat stones of the old mill road. Stones keep no prints." },
  prints_again: { text: "The prints stop at the flat stones. The old mill road climbs north from here." },
  bridge: { text: "What's left of the bridge: two posts and a rope. The stream is fast and brown. You can't cross here." },
  sheep: { text: "A sheep. It chews at you thoughtfully." },
  clover: { text: "Clover, bright blue from nose to tail. She smells of wet earth and something sharp, like old plants." },
  sign_inn: { text: "THE THISTLE INN. Rooms, soup, gossip." },
  sign_post: { text: "POST HOUSE. Knock loudly, Abel is usually asleep." },
  sign_mill: { text: "HOLLOW HILL WOAD MILL. A sign so old the letters are just shadows." },
  bush: { text: "A wall of brambles. Something has been pushing through here, low to the ground." },
  barrel: { text: "Rainwater barrel. Full to the brim after last night." },
  fire: { text: "The fire crackles. It smells of pine and soup." },
  millstone: { text: "The third millstone. It's been rolled aside, and there's a hollow underneath. Empty now." },
};

export const INTRO = [
  "Thistlewick. A farming village where everyone knows everyone.",
  "Last night a storm tore through the valley.",
  "This morning, your twin sister Wren's bed was empty.",
  "You are Moss. Find her.",
];

export const ENDING = (clues) => {
  const lines = [
    "Wren is sitting against the mill wall, one ankle wrapped in her scarf, Dad's huge boots beside her.",
    "\"Moss! I knew you'd figure it out. The bridge went right after I crossed. I twisted my foot on the way down the vats...\"",
    "In her lap: a small bundle of oilcloth from under the third millstone. Two carved wooden whistles, one shaped like a wren, one like a little tuft of moss.",
    "And a folded page: the end of Mum's letter.",
    "\"...when you are old enough to come up here on your own, blow these together, and I'll be listening. All my love, always. Mum.\"",
    "You blow the whistles together. The sound runs down the hill, over the blue stream, all the way to the village.",
    "Far below, a figure in a flat cap drops a bucket and starts running up the hill.",
  ];
  const n = Object.keys(clues).length;
  lines.push(`THE END. Clues found: ${n} / ${CLUE_ORDER.length}.`);
  return lines;
};
