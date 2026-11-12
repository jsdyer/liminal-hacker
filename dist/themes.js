// Edit a theme here, or copy one and add its image. Counts and navigation update automatically.
// Set enabled: false to hide a public theme. See docs/CUSTOMIZING.md.
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
  }
];
