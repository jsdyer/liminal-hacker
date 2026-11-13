// Server-side catalogue. Artwork is encrypted in content/art/<id>.json.
export const themes = [
  {
    "id": "atrium",
    "name": "The atrium",
    "level": "LEVEL 00",
    "time": "02:17",
    "subtitle": "The building forgot to close.",
    "status": "A light left on for no one.",
    "description": "The lights are still on. The network is still alive.\nSomewhere between the last train and the first light,\nthere’s a little room to be yourself.",
    "hint": "There is a note beside the terminal.",
    "frequency": 93.7,
    "sound": "hum",
    "hotspots": [
      {
        "x": 73,
        "y": 52,
        "label": "A folded note",
        "type": "fragment",
        "fragment": "atrium-note"
      },
      {
        "x": 45,
        "y": 69,
        "label": "A faint transmission",
        "type": "radio"
      },
      {
        "x": 83,
        "y": 67,
        "label": "The waiting terminal",
        "type": "terminal"
      }
    ],
    "enabled": true,
    "accent": "#b4d4bf",
    "image": "assets/atrium.webp",
    "heading": [
      "Everyone left.",
      "You stayed."
    ],
    "note": {
      "title": "For whoever is still here",
      "source": "ATRIUM / FOLDED NOTE",
      "body": "The lights on this floor are not on a timer. Someone has to turn them off.\n\nI used to wonder who kept forgetting. Now I wonder who they were leaving them on for.\n\nP.S. The receiver drifts. Try 93.7."
    },
    "signal": {
      "title": "An unlisted extension",
      "source": "ATRIUM / 93.7 MHz",
      "body": "“If you can hear this, the building has not forgotten you.\n\nThere is a room below the ground floor. The sign says maintenance. It has always meant something else.”"
    }
  },
  {
    "id": "rooftop",
    "name": "The rooftop relay",
    "level": "LEVEL 09",
    "time": "03:06",
    "subtitle": "Some signals never sleep.",
    "status": "Rain on a frequency of its own.",
    "description": "A little rain. A distant signal. A door left ajar.\nThe city has gone quiet, but something out there\nis still trying to say hello.",
    "hint": "The relay is picking up something between stations.",
    "frequency": 104.2,
    "sound": "rain",
    "hotspots": [
      {
        "x": 72,
        "y": 34,
        "label": "Tune the relay",
        "type": "radio"
      },
      {
        "x": 38,
        "y": 65,
        "label": "A waterlogged page",
        "type": "fragment",
        "fragment": "rooftop-note"
      },
      {
        "x": 84,
        "y": 57,
        "label": "The service terminal",
        "type": "terminal"
      }
    ],
    "enabled": true,
    "accent": "#b9bbdf",
    "image": "assets/rooftop.webp",
    "heading": [
      "No one above.",
      "Nothing urgent."
    ],
    "note": {
      "title": "Weather report",
      "source": "ROOFTOP / WATERLOGGED PAGE",
      "body": "03:06. Light rain. No one on the streets below.\n\nThe antenna is not broken. It is listening in a direction we no longer use.\n\n104.2. Wait for the space between the static."
    },
    "signal": {
      "title": "A station with no name",
      "source": "ROOFTOP / 104.2 MHz",
      "body": "“This is the overnight service. There are no announcements. There are no delays.\n\nWherever you are, you may remain there for a little while.”"
    }
  },
  {
    "id": "server",
    "name": "The warm machine",
    "level": "LEVEL −01",
    "time": "04:41",
    "subtitle": "Still listening. Still here.",
    "status": "The kettle has just finished.",
    "description": "Beyond the last locked door, a small light burns.\nA cup of tea. A patient cursor. The quiet company\nof things that don’t ask you to explain.",
    "hint": "The shift log has one unfinished entry.",
    "frequency": 88.4,
    "sound": "fans",
    "hotspots": [
      {
        "x": 67,
        "y": 61,
        "label": "Read the shift log",
        "type": "fragment",
        "fragment": "server-note"
      },
      {
        "x": 39,
        "y": 45,
        "label": "Listen to the rack",
        "type": "radio"
      },
      {
        "x": 81,
        "y": 53,
        "label": "Pull up a chair",
        "type": "terminal"
      }
    ],
    "enabled": true,
    "accent": "#dbc9a7",
    "image": "assets/server.webp",
    "heading": [
      "A cold world.",
      "A warm machine."
    ],
    "note": {
      "title": "The unfinished shift",
      "source": "SERVER ROOM / SHIFT LOG",
      "body": "04:41 — backups verified.\n04:42 — fan replaced.\n04:43 — tea.\n04:44 — found the old receiver. 88.4 still works.\n04:45 —\n\nThe cursor waits on the next line. It does not seem impatient."
    },
    "signal": {
      "title": "A quiet acknowledgement",
      "source": "SERVER ROOM / 88.4 MHz",
      "body": "“We received your message. No further action is required.\n\nThe machine can keep watch for a while. You have done enough for tonight.”"
    }
  },
  {
    "id": "laundromat",
    "enabled": true,
    "name": "The midnight wash",
    "level": "STREET LEVEL",
    "time": "02:42",
    "accent": "#dfb9c4",
    "sound": "drums",
    "image": "assets/laundromat.webp",
    "subtitle": "The spin cycle keeps watch.",
    "status": "One machine still has time left.",
    "heading": [
      "Round and round.",
      "Nowhere to be."
    ],
    "description": "The street is empty. The dryers keep turning.\nA little warmth behind a wall of glass,\nand all the time in the world to wait.",
    "frequency": 96.5,
    "hint": "Look for the note. Something is still listening.",
    "note": {
      "title": "The last load",
      "body": "The attendant left a mug beside the folding table.\n\nThere is no money in the change machine. There is a tiny handwritten promise: someone will be back before the clothes get cold.\n\nThe old radio is stuck at 96.5. It seems to like it there."
    },
    "signal": {
      "title": "Lost and found",
      "body": "“One blue glove. One brass button. One evening you thought you had wasted.\n\nAll are still here. Nothing needs to be claimed tonight.”"
    }
  },
  {
    "id": "platform",
    "enabled": true,
    "name": "The last platform",
    "level": "LEVEL −02",
    "time": "01:58",
    "accent": "#b5c6d6",
    "sound": "tunnel",
    "image": "assets/platform.webp",
    "subtitle": "No departures. No hurry.",
    "status": "The next arrival is unannounced.",
    "heading": [
      "The last train left.",
      "You can breathe."
    ],
    "description": "The tracks disappear into a patient dark.\nAn empty bench. A light behind the glass.\nFor once, waiting is the destination.",
    "frequency": 101.3,
    "hint": "Look for the note. Something is still listening.",
    "note": {
      "title": "An unsent timetable",
      "body": "The service ended an hour ago. The platform clock is still doing its best.\n\nSomeone wrote 101.3 on the back of the timetable. Beneath it: THE DEPARTURE — THIRD WORD.\n\nA shelf. Still water. A departure. Collect their transmissions, make tea, then knock at a terminal."
    },
    "signal": {
      "title": "The line between",
      "body": "“The third word is what a doorway has beneath your feet: the boundary you cross when outside becomes inside.\n\nOne word. Carry it after the shelf and the water.\n\nWhen the three transmissions are kept and the tea is made, type knock.”"
    }
  },
  {
    "id": "pool",
    "enabled": true,
    "name": "The still-water room",
    "level": "LOWER GROUND",
    "time": "03:33",
    "accent": "#a6d7d0",
    "sound": "water",
    "image": "assets/pool.webp",
    "subtitle": "Nothing disturbs the surface.",
    "status": "The water remembers the ceiling.",
    "heading": [
      "Nothing moves.",
      "Something settles."
    ],
    "description": "The ceiling floats upside down.\nThe room holds its breath, and for a moment,\nso does everything you brought with you.",
    "frequency": 90.8,
    "hint": "Look for the note. Something is still listening.",
    "note": {
      "title": "The lifeguard’s margin",
      "body": "Nobody swam here tonight. There are ripples anyway.\n\nThe receiver beside the maintenance door is tuned to 90.8.\n\nTHE WATER — SECOND WORD. Keep the transmission. It belongs between the shelf and the departure."
    },
    "signal": {
      "title": "Below the stillness",
      "body": "“The second word is the current beneath the surface: the pull that can carry you away from shore, even when the water above looks calm.\n\nOne word. Listen beneath what you can see.”"
    }
  },
  {
    "id": "mall",
    "enabled": true,
    "name": "The closed concourse",
    "level": "LEVEL 01",
    "time": "04:12",
    "accent": "#d3b5c9",
    "sound": "vent",
    "image": "assets/mall.webp",
    "subtitle": "The shops forgot your name.",
    "status": "The fountain has one last reflection.",
    "heading": [
      "Nothing for sale.",
      "Everything to feel."
    ],
    "description": "The shutters are down. The palms are still.\nThere is a whole city under this roof,\nand tonight it belongs to the echo.",
    "frequency": 99.1,
    "hint": "Look for the note. Something is still listening.",
    "note": {
      "title": "The directory has changed",
      "body": "The directory says YOU ARE HERE.\n\nMost of the names have been peeled away. Pale rectangles remain where the promises used to be.\n\nThe information desk radio says 99.1. Try asking it something."
    },
    "signal": {
      "title": "A message for the concourse",
      "body": "“Attention, remaining visitors.\n\nYou do not need a reason to be here. The building is more than what it used to sell.\n\nPlease take your time.”"
    }
  },
  {
    "id": "library",
    "enabled": true,
    "name": "The overnight stacks",
    "level": "LEVEL 03",
    "time": "02:56",
    "accent": "#b8c69b",
    "sound": "pages",
    "image": "assets/library.webp",
    "subtitle": "Some stories stay awake.",
    "status": "A reading lamp has been expecting you.",
    "heading": [
      "The world went quiet.",
      "The pages didn’t."
    ],
    "description": "A small circle of light in an ocean of shelves.\nA margin wide enough to get lost in.\nThere are still things worth understanding.",
    "frequency": 97.4,
    "hint": "Look for the note. Something is still listening.",
    "note": {
      "title": "A bookmark with no book",
      "body": "The bookmark is lying on the desk. The book is missing.\n\n97.4, in pencil. Then: THE SHELF — FIRST WORD.\n\nListen here, then in the still-water room, then at the last platform. Keep all three transmissions. There is a room the directory cannot remember."
    },
    "signal": {
      "title": "What the light leaves",
      "body": "“The first word is the picture your eyes keep after its source is gone: the ghost of a bright window when you close your eyes.\n\nOne word. Keep it for the unlisted door.”"
    }
  },
  {
    "id": "motel",
    "enabled": true,
    "name": "The vacancy corridor",
    "level": "OUTER WALKWAY",
    "time": "05:04",
    "accent": "#d9b5a4",
    "sound": "rain",
    "image": "assets/motel.webp",
    "subtitle": "There is still a room for you.",
    "status": "Rain softens every edge.",
    "heading": [
      "Somewhere unfamiliar.",
      "Something like home."
    ],
    "description": "A strip of light beneath a door.\nRain beyond the railing. A kettle clicking off.\nYou don’t have to keep driving tonight.",
    "frequency": 106.6,
    "hint": "Look for the note. Something is still listening.",
    "note": {
      "title": "A key without a number",
      "body": "The key has been worn smooth by a thousand temporary homes.\n\nSomeone left a terminal beside the kettle. The radio beside it remembers 106.6.\n\nThe corridor light will stay on until you come inside."
    },
    "signal": {
      "title": "No checkout time",
      "body": "“The night desk has received your request.\n\nThe room is ready. There is no checkout time in a place like this.\n\nLeave when the road feels like a possibility again.”"
    }
  },
  {
    "id": "ferry",
    "name": "The crossing",
    "level": "PASSENGER DECK",
    "time": "03:22",
    "accent": "#c7b48e",
    "sound": "water",
    "heading": [
      "No land in sight.",
      "Still somewhere warm."
    ],
    "subtitle": "The shore will return when it is ready.",
    "status": "A small light on a very dark sea.",
    "description": "Rain on the windows. A harbour falling away.\nA table, a terminal, the low sound of an engine.\nFor a little while, nowhere can reach you.",
    "frequency": 88.9,
    "note": {
      "title": "Between two shores",
      "body": "A pencilled frequency: 88.9.\n\nSomeone has folded the sailing schedule into a paper boat. It will not take you anywhere. That seems to be the point."
    },
    "signal": {
      "title": "Carry the quiet",
      "body": "The coast disappears before the crossing begins to feel real.\n\nYou do not have to know which shore you belong to tonight. Keep the little light on until one comes into view."
    },
    "enabled": true,
    "hint": "There is something left beside the terminal.",
    "image": "api/art/ferry"
  },
  {
    "id": "planetarium",
    "name": "The borrowed sky",
    "level": "DOME / ROW H",
    "time": "02:14",
    "accent": "#c6b4dd",
    "sound": "hum",
    "heading": [
      "The stars stayed on.",
      "So did you."
    ],
    "subtitle": "A whole universe, indoors.",
    "status": "The last constellation has no name.",
    "description": "The projector keeps a sky that nobody ordered.\nAn empty seat beneath a hundred quiet worlds.\nOutside, there is probably still weather.",
    "frequency": 89.6,
    "note": {
      "title": "After the last show",
      "body": "The control desk is tuned to 89.6.\n\nA note on the projector: please leave the stars on for the cleaner. Underneath, in another hand: and whoever else needs them."
    },
    "signal": {
      "title": "A ceiling with possibilities",
      "body": "You know these stars are holes in a machine.\n\nIt does not make the feeling smaller. Sometimes knowing how a thing works is another way of being amazed by it."
    },
    "enabled": true,
    "hint": "There is something left beside the terminal.",
    "image": "api/art/planetarium"
  },
  {
    "id": "bowling",
    "name": "The empty lanes",
    "level": "LANE 07",
    "time": "03:47",
    "accent": "#cdb3b4",
    "sound": "vent",
    "heading": [
      "No score to keep.",
      "Nothing to prove."
    ],
    "subtitle": "The pins can wait until morning.",
    "status": "No one is counting.",
    "description": "A polished floor going on forever.\nThe quiet after a room full of laughter.\nYou have no score to improve tonight.",
    "frequency": 91.4,
    "note": {
      "title": "An unfinished frame",
      "body": "Someone circled 91.4 on the maintenance sheet.\n\nThe scoreboard remembers a game nobody finished. It has been patient about it."
    },
    "signal": {
      "title": "A better kind of empty",
      "body": "The building was made for noise. Without it, you notice the curve of a chair, the worn edge of a counter, the time someone spent making a place for people.\n\nThey will be back. You can enjoy what they left."
    },
    "enabled": true,
    "hint": "There is something left beside the terminal.",
    "image": "api/art/bowling"
  },
  {
    "id": "parkade",
    "name": "The lower level",
    "level": "P4 / EAST",
    "time": "04:08",
    "accent": "#a9c8b5",
    "sound": "vent",
    "heading": [
      "Below the city.",
      "Outside the noise."
    ],
    "subtitle": "Four floors beneath the hurry.",
    "status": "No signal. A good connection.",
    "description": "Concrete pillars repeat into the dark.\nAbove you, an entire city has somewhere to be.\nDown here, the next command can wait.",
    "frequency": 92.8,
    "note": {
      "title": "Maintenance access",
      "body": "A small receiver on the shelf says 92.8.\n\nThe folding chair is newer than everything else. Someone decided this corner deserved a little comfort."
    },
    "signal": {
      "title": "Quiet infrastructure",
      "body": "There are rooms beneath the rooms people talk about.\n\nA pipe is warm. A fan is turning. A tiny green light is making an honest report. You find it unexpectedly reassuring."
    },
    "enabled": true,
    "hint": "There is something left beside the terminal.",
    "image": "api/art/parkade"
  },
  {
    "id": "relay",
    "name": "The hill station",
    "level": "RELAY / 812 M",
    "time": "02:38",
    "accent": "#bac7cd",
    "sound": "fans",
    "heading": [
      "A signal in the fog.",
      "A light on the hill."
    ],
    "subtitle": "The mountain keeps the night shift.",
    "status": "Carrier present. No voice required.",
    "description": "Beyond the glass, the trees have no edges.\nThe radio racks breathe warm air into the room.\nSomething is still getting through.",
    "frequency": 94.2,
    "note": {
      "title": "Antenna weather",
      "body": "Receiver check: 94.2.\n\nThe weather log says fog, then fog, then fog again. On the fourth line: tea helped."
    },
    "signal": {
      "title": "The long way home",
      "body": "Your packets take a route through places you will never see.\n\nTonight you are in one of those places. A small warm room where the distance becomes a little less impossible."
    },
    "enabled": true,
    "hint": "There is something left beside the terminal.",
    "image": "api/art/relay"
  },
  {
    "id": "campus",
    "name": "The open lab",
    "level": "SCIENCE / 204",
    "time": "02:51",
    "accent": "#a9c5c4",
    "sound": "hum",
    "heading": [
      "Class is over.",
      "Curiosity isn’t."
    ],
    "subtitle": "No one has assigned this question.",
    "status": "A cursor with no deadline.",
    "description": "The monitors are asleep. The rain is still working.\nYou opened a manual for one small thing.\nIt is three hours later, in the best possible way.",
    "frequency": 95.8,
    "note": {
      "title": "An ungraded question",
      "body": "Try the receiver at 95.8.\n\nThe margin of an old lab manual reads: what if the interesting part is the thing they did not ask us to do?"
    },
    "signal": {
      "title": "No marks for this",
      "body": "Some of the best things you learn have no certificate, no audience, and no immediate use.\n\nYou learn them because the question follows you home. Tonight, there is room to follow it back."
    },
    "enabled": true,
    "hint": "There is something left beside the terminal.",
    "image": "api/art/campus"
  },
  {
    "id": "cinema",
    "name": "The last screening",
    "level": "FOYER / SCREEN 2",
    "time": "03:16",
    "accent": "#d3af9e",
    "sound": "vent",
    "heading": [
      "The credits ended.",
      "The feeling stayed."
    ],
    "subtitle": "A little longer before the outside world.",
    "status": "The lobby is holding the silence.",
    "description": "The final audience has gone into the rain.\nA soft red glow. A warm counter.\nYou are not quite ready to leave the story.",
    "frequency": 100.6,
    "note": {
      "title": "After the credits",
      "body": "The projection-room radio is set to 100.6.\n\nOn the back of a ticket: stay until the lights come up. Then stay a little longer."
    },
    "signal": {
      "title": "The room after the room",
      "body": "A film ends twice. Once on the screen, and later, when you finally stop carrying its light around.\n\nThis lobby seems designed for the time between."
    },
    "enabled": true,
    "hint": "There is something left beside the terminal.",
    "image": "api/art/cinema"
  },
  {
    "id": "skybridge",
    "name": "The suspended passage",
    "level": "LEVEL 18 / LINK",
    "time": "03:09",
    "accent": "#c3bdd9",
    "sound": "rain",
    "heading": [
      "Neither here.",
      "Nor quite there."
    ],
    "subtitle": "A room made entirely of between.",
    "status": "The city moves without making a sound.",
    "description": "Two buildings holding a corridor above the street.\nRain makes another city on the glass.\nHalfway across, you find a reason to stop.",
    "frequency": 103.1,
    "note": {
      "title": "Halfway across",
      "body": "The little receiver catches 103.1 here.\n\nA chair faces the window instead of either door. Somebody understood the assignment differently."
    },
    "signal": {
      "title": "Suspended",
      "body": "Most days, being between things feels like a problem to solve.\n\nBut here the architects put a roof over it. They made it somewhere you could sit down."
    },
    "enabled": true,
    "hint": "There is something left beside the terminal.",
    "image": "api/art/skybridge"
  },
  {
    "id": "diner",
    "name": "The roadside light",
    "level": "BOOTH 04",
    "time": "04:32",
    "accent": "#d5b49b",
    "sound": "rain",
    "heading": [
      "The road can wait.",
      "The coffee is warm."
    ],
    "subtitle": "Open, in the way a light is open.",
    "status": "No departure time on the table.",
    "description": "The highway disappears into the trees.\nA vinyl booth, a wall socket, a cup going cold slowly.\nFor now, this is far enough.",
    "frequency": 104.8,
    "note": {
      "title": "One more refill",
      "body": "The kitchen radio has a mark at 104.8.\n\nA receipt has been used as a bookmark. There is no total on it. Just a small drawing of a house."
    },
    "signal": {
      "title": "Far enough",
      "body": "There is a kind of travel that happens when you stop moving.\n\nThe room becomes unfamiliar, then familiar, then yours for an hour. You do not have to go any farther for tonight to count."
    },
    "enabled": true,
    "hint": "There is something left beside the terminal.",
    "image": "api/art/diner"
  },
  {
    "id": "archive",
    "name": "The sleeping records",
    "level": "READING ROOM B",
    "time": "01:49",
    "accent": "#bec2a4",
    "sound": "pages",
    "heading": [
      "Nothing is lost.",
      "Only waiting."
    ],
    "subtitle": "A thousand ordinary lives, carefully kept.",
    "status": "The past is still readable.",
    "description": "Boxes of small things that mattered to someone.\nA microfilm reader. Rain against high windows.\nThe room is full of people who are not here.",
    "frequency": 107.7,
    "note": {
      "title": "Please rewind",
      "body": "The desk receiver is on 107.7.\n\nA catalogue card has no title, only the words: the things you did not know you would miss."
    },
    "signal": {
      "title": "An older kind of search",
      "body": "You find the thing beside the thing you came for.\n\nA name. A date. An ordinary afternoon someone thought to keep. For a moment the distance between then and now feels small enough to touch."
    },
    "enabled": true,
    "hint": "There is something left beside the terminal.",
    "image": "api/art/archive"
  },
  {
    "id": "basement-archive",
    "name": "The basement archive",
    "level": "LOWER GROUND / RESEARCH",
    "time": "02:08",
    "accent": "#d5bf9e",
    "sound": "hum",
    "frequency": 92.1,
    "heading": [
      "The files came in.",
      "The lamp stayed on."
    ],
    "subtitle": "A place to read what came back.",
    "status": "Two versions of the same page are on the desk.",
    "description": "A scanner, a mug, and two pages under a lamp.\nThe concrete stays cold. The desk is warm.\nSomething in the second copy catches your eye.",
    "hint": "There is a pencilled note beside the stack of releases.",
    "note": {
      "title": "Keep both copies",
      "body": "The receiver is set to 92.1.\n\nThe two copies have the same date. One has a sentence the other one is missing. Keep both, and mark the page numbers before you make another cup."
    },
    "signal": {
      "title": "A second look",
      "body": "I used to read these from the first page to the last. Now I start with the places where the pages disagree. The same paragraph can look different at two in the morning."
    },
    "enabled": true,
    "seedOnUpgrade": true,
    "image": "api/art/basement-archive",
    "hotspots": [
      {
        "x": 74,
        "y": 45,
        "label": "A pencilled comparison",
        "type": "fragment",
        "fragment": "basement-archive-note"
      },
      {
        "x": 49,
        "y": 31,
        "label": "A signal from the shelves",
        "type": "radio"
      },
      {
        "x": 88,
        "y": 55,
        "label": "The research terminal",
        "type": "terminal"
      }
    ]
  },
  {
    "id": "closed-stacks",
    "name": "The closed stacks",
    "level": "LOWER GROUND / STACKS",
    "time": "01:37",
    "accent": "#b3c9a6",
    "sound": "vent",
    "frequency": 96.2,
    "heading": [
      "An aisle opens.",
      "The shelves go on."
    ],
    "subtitle": "A cart left halfway through a retrieval.",
    "status": "One handwheel has been turned.",
    "description": "Rows of boxes slide together on steel tracks.\nOne aisle is still open. One box is already on the cart.\nThe stairs behind you are warmer than the room.",
    "hint": "Check the slip on the waiting cart.",
    "note": {
      "title": "Retrieval slip",
      "body": "The receiver on the shelf reads 96.2.\n\nSeries B, box 14. Return the folder to its original position. The photograph at the back belongs with the letter."
    },
    "signal": {
      "title": "The order of things",
      "body": "The files tell you what was kept. The order tells you who had to find it again. Some of these boxes have travelled through more offices than I have."
    },
    "enabled": true,
    "seedOnUpgrade": true,
    "image": "api/art/closed-stacks",
    "hotspots": [
      {
        "x": 62,
        "y": 57,
        "label": "The retrieval slip",
        "type": "fragment",
        "fragment": "closed-stacks-note"
      },
      {
        "x": 74,
        "y": 32,
        "label": "A carrier down the aisle",
        "type": "radio"
      },
      {
        "x": 83,
        "y": 64,
        "label": "The stacks terminal",
        "type": "terminal"
      }
    ]
  },
  {
    "id": "redaction-desk",
    "name": "The redaction desk",
    "level": "RECORDS OFFICE / REVIEW",
    "time": "02:43",
    "accent": "#dcc3a3",
    "sound": "hum",
    "frequency": 98.3,
    "heading": [
      "The page is here.",
      "Some words are gone."
    ],
    "subtitle": "A file paused between review and release.",
    "status": "The scanner has gone back to sleep.",
    "description": "A lamp, a date stamp, and a page with two black bars.\nThrough the ribbed glass, the rest of the office is dark.\nThere is enough left on the page to keep reading.",
    "hint": "Look for the note clipped to the release.",
    "note": {
      "title": "Review copy",
      "body": "Tune the receiver to 98.3.\n\nThe cover letter lists the grounds for withholding. Check which pages each one applies to. The attachment starts on page six."
    },
    "signal": {
      "title": "The surviving lines",
      "body": "Sometimes the useful thing is a date or an innocuous line in a covering email. Read what is there. Leave a little room for what you still have to ask."
    },
    "enabled": true,
    "seedOnUpgrade": true,
    "image": "api/art/redaction-desk",
    "hotspots": [
      {
        "x": 69,
        "y": 68,
        "label": "The clipped review copy",
        "type": "fragment",
        "fragment": "redaction-desk-note"
      },
      {
        "x": 45,
        "y": 38,
        "label": "A signal behind the glass",
        "type": "radio"
      },
      {
        "x": 62,
        "y": 48,
        "label": "The review terminal",
        "type": "terminal"
      }
    ]
  },
  {
    "id": "microfilm",
    "name": "Microfilm after midnight",
    "level": "LIBRARY / MICROFORMS",
    "time": "00:52",
    "accent": "#b6ceda",
    "sound": "pages",
    "frequency": 99.8,
    "heading": [
      "A little light.",
      "A whole day comes back."
    ],
    "subtitle": "The last reader is still on.",
    "status": "A reel is waiting to be rewound.",
    "description": "Beige readers stand along the oak counter.\nOne screen is still showing yesterday from a long time ago.\nThe card catalogue is just visible in the reflection.",
    "hint": "The reel box has a handwritten index card.",
    "note": {
      "title": "One frame further",
      "body": "The alcove receiver is set to 99.8.\n\nThe article continues on the next reel. The frame after it shows the building before anyone put the new entrance in."
    },
    "signal": {
      "title": "The other column",
      "body": "I came for a council decision and stayed for the notices in the column beside it. Someone was selling a radio. Someone wanted a ride west. For a moment it was their evening again."
    },
    "enabled": true,
    "seedOnUpgrade": true,
    "image": "api/art/microfilm",
    "hotspots": [
      {
        "x": 72,
        "y": 56,
        "label": "The index card",
        "type": "fragment",
        "fragment": "microfilm-note"
      },
      {
        "x": 57,
        "y": 33,
        "label": "A frequency in the alcove",
        "type": "radio"
      },
      {
        "x": 85,
        "y": 43,
        "label": "The glowing reader",
        "type": "terminal"
      }
    ]
  },
  {
    "id": "archive-reading-room",
    "name": "The reading room",
    "level": "PUBLIC ARCHIVE / READING ROOM",
    "time": "03:24",
    "accent": "#bac9a7",
    "sound": "rain",
    "frequency": 102.6,
    "heading": [
      "A box on the table.",
      "The rain can wait."
    ],
    "subtitle": "One lamp in a room built for dozens.",
    "status": "A request slip marks your place.",
    "description": "Rain gathers on the tall windows.\nA green lamp lights a request slip and a grey box.\nThe far end of the room is almost out of sight.",
    "hint": "A request slip sits just under the lamp.",
    "note": {
      "title": "Table by the window",
      "body": "The desk receiver is tuned to 102.6.\n\nRequest the next folder under the previous department name. The catalogue still has it filed there."
    },
    "signal": {
      "title": "The older name",
      "body": "Departments change names faster than the boxes do. Try the one in the letterhead. That was how I found the rest of the file."
    },
    "enabled": true,
    "seedOnUpgrade": true,
    "image": "api/art/archive-reading-room",
    "hotspots": [
      {
        "x": 74,
        "y": 71,
        "label": "The request slip",
        "type": "fragment",
        "fragment": "archive-reading-room-note"
      },
      {
        "x": 54,
        "y": 48,
        "label": "A quiet receiver",
        "type": "radio"
      },
      {
        "x": 62,
        "y": 59,
        "label": "The catalogue terminal",
        "type": "terminal"
      }
    ]
  },
  {
    "id": "museum-storage",
    "name": "Below the museum",
    "level": "COLLECTIONS / SERVICE LEVEL",
    "time": "02:29",
    "accent": "#b7cbcd",
    "sound": "vent",
    "frequency": 105.3,
    "heading": [
      "The gallery closed.",
      "The collection stayed."
    ],
    "subtitle": "A row of quiet cages beneath the galleries.",
    "status": "One crate is under a work light.",
    "description": "Wrapped frames and a crated object wait behind wire mesh.\nThe service corridor runs on past the last light.\nEach shelf has a place in the inventory.",
    "hint": "A condition report rests by the open cage.",
    "note": {
      "title": "Condition on arrival",
      "body": "The workroom radio is set to 105.3.\n\nThe crate arrived with two labels. Photograph them both before replacing the protective wrap."
    },
    "signal": {
      "title": "The reverse of the frame",
      "body": "The public label is upstairs. Down here, the back of the frame still has the freight label, an old inventory number, and a repair dated in pencil."
    },
    "enabled": true,
    "seedOnUpgrade": true,
    "image": "api/art/museum-storage",
    "hotspots": [
      {
        "x": 79,
        "y": 61,
        "label": "The condition report",
        "type": "fragment",
        "fragment": "museum-storage-note"
      },
      {
        "x": 50,
        "y": 39,
        "label": "A carrier in the corridor",
        "type": "radio"
      },
      {
        "x": 74,
        "y": 38,
        "label": "The collection terminal",
        "type": "terminal"
      }
    ]
  },
  {
    "id": "last-gallery",
    "name": "The last gallery",
    "level": "UPPER GALLERY / WORKS ON PAPER",
    "time": "01:16",
    "accent": "#c5c1dc",
    "sound": "hum",
    "frequency": 106.1,
    "heading": [
      "One case still lit.",
      "One page still open."
    ],
    "subtitle": "A document under glass after closing.",
    "status": "The far doors are holding a little blue light.",
    "description": "The paintings barely lift out of the dark.\nAt the end of the room, a single folder is open under glass.\nTomorrow the floor will fill with footsteps again.",
    "hint": "Someone left a caption draft beside the case.",
    "note": {
      "title": "Caption draft",
      "body": "The gallery receiver is tuned to 106.1.\n\nThe folder is open to page three. Its cover has three filing numbers crossed out. Leave room on the label for the one that stuck."
    },
    "signal": {
      "title": "In the display case",
      "body": "All week the paper was handled with gloves. This morning someone leaned over the glass and recognized the address. Their family had lived two doors down."
    },
    "enabled": true,
    "seedOnUpgrade": true,
    "image": "api/art/last-gallery",
    "hotspots": [
      {
        "x": 80,
        "y": 60,
        "label": "The caption draft",
        "type": "fragment",
        "fragment": "last-gallery-note"
      },
      {
        "x": 61,
        "y": 38,
        "label": "A signal by the far doors",
        "type": "radio"
      },
      {
        "x": 72,
        "y": 48,
        "label": "The exhibit terminal",
        "type": "terminal"
      }
    ]
  },
  {
    "id": "release-envelope",
    "name": "The release envelope",
    "level": "MUNICIPAL RECORDS / PICKUP",
    "time": "00:39",
    "accent": "#d7bd9a",
    "sound": "rain",
    "frequency": 107.1,
    "heading": [
      "The counter is empty.",
      "Your envelope is here."
    ],
    "subtitle": "A reply on the public side of the glass.",
    "status": "The clerk’s lamp is still on.",
    "description": "Rain reflects off the wired glass.\nA thick envelope is waiting in the pickup tray.\nFor weeks the request was a number. Now it has weight.",
    "hint": "Look in the tray beneath the glass.",
    "note": {
      "title": "Ready for pickup",
      "body": "The receiver behind the counter reads 107.1.\n\nThe cover letter lists three enclosures. Open the envelope flat so the loose index sheet doesn’t slide behind the tray."
    },
    "signal": {
      "title": "Received",
      "body": "The reply fits in a single envelope. The next question is pencilled on the back of the one you sent. Take them both home."
    },
    "enabled": true,
    "seedOnUpgrade": true,
    "image": "api/art/release-envelope",
    "hotspots": [
      {
        "x": 80,
        "y": 77,
        "label": "The release package",
        "type": "fragment",
        "fragment": "release-envelope-note"
      },
      {
        "x": 51,
        "y": 40,
        "label": "A signal behind the counter",
        "type": "radio"
      },
      {
        "x": 72,
        "y": 56,
        "label": "The request terminal",
        "type": "terminal"
      }
    ]
  }
];
