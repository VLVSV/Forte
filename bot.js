const Discord = require("discord.js");
const client = new Discord.Client();

const prefix = "/";

//Object that keeps track of servers and their invite links
var servers = {
  DawnbreakersEsports: "https://discord.gg/BjeFkVS",
  BotTest: "TEST SERVER",
  TeamOmnibus: "https://discord.gg/7NPwyPr",
  TeamRevelation: "https://discord.gg/5nmVDsV",
  TeamTwilightKnights: "https://discord.gg/uqms9he",
  TeamDisastra: "https://discord.gg/jwKybw6",
  CpVirtuosos: "https://discord.gg/q5jJv2t",
  ManaSurge: "https://discord.gg/nWNmF2R",
  HallowedSkySV: "https://discord.gg/bbkhZfU",
  KoreGaming: "https://discord.gg/PJX3HJs",
  ShadowverseNewbies: "https://discord.gg/BrJehpA",
  CộngĐồngShadowverseVietnam: "https://discord.gg/9g8HKaC",
  KurumiMasterRace: "https://discord.gg/zAxyBuA"
}

var lawMode = false;

//List of server IDs
var serverIDs = ["398346811020017684", "364185073165008897", "110072744938307584", "366052303943237642", "410922043819819008", "327603763009290240",
                 "267186445121355787", "270432049599348737", "302976037929746442", "451851155556007966", "434815985028038686", "311798981598642177",
                 "454132855740694528"];

//Object that keeps track of user ids and their LFS info
var board = new Object();

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity(`/help for commands`);
});

//Detect when people go offline/afk/dnd and remove them from the board
client.on("presenceUpdate", (oldMember, newMember) => {
  //If they're not on the board, we don't care
  if(Object.keys(board).indexOf(newMember.id) === -1) {
    return;
  }
  //Get them off the board if their presence is not online
  if(newMember.presence.status != "online") {
    delete board[newMember.id];
  }
});

client.on("message", (message) => {
  if(message.channel.type == "dm") {
    message.channel.send(message.content.toLowerCase().indexOf("lawmode"));
    if(message.content.toLowerCase().indexOf("lawmode") !== -1) {
      lawMode = !lawMode; 
      message.channel.send("Got it");
    }
  }
  if(message.content.toLowerCase().indexOf(" anne ") !== -1 && message.author.id.indexOf("211603633286938624") !== -1) {
    message.channel.send("You're gonna see what I'm made of!", {files: ["https://shadowverse-portal.com/image/card/en/C_900334040.png"]});
  }
  if(lawMode && message.author.id.indexOf("232040363957813248") !== -1) {
    message.channel.send("Bad law", {files : ["https://i.imgur.com/Iquo8NI.png"]}); 
  }
  if (!message.content.startsWith(prefix)) return;
  if (message.author.bot) return;
  if (message.channel.type !== "text") return;

  //Display the current people who are LFS along with their info
  if (message.content.startsWith(prefix + "board")) {
    var msg = "";
    for(var userID in board) {
      msg += client.users.get(userID).username + board[userID] + "\n";
    }
    if(msg === "") {
      message.author.send("Sorry, it doesn't look like anybody else is looking for a scrim right now. How about you put yourself up there with /lfs");
    }
    else {
      message.author.send(msg);
    }
  }

  //Put the author of the message on the LFS board
  else if(message.content.startsWith(prefix + "lfs")) {
    if(Object.keys(board).indexOf(message.author.id) != -1) {
      message.channel.send(message.author + " is already on the board");
      return;
    }

    var serverName = message.guild.name;
    var prop = serverName.replace(/ /g, "");
    var inviteLink = servers[prop];

    var notes = "none";

    //If the message contains a space, take everything after the first space to be the extra notes
    if(message.content.indexOf(" ") != -1) {
      notes = message.content.substring(message.content.indexOf(" "));
    }

    board[message.author.id] = " from the " + serverName + " discord server (<" + inviteLink + ">) is looking for a scrim! Notes: " + notes;
    message.channel.send(message.author + " is currently looking for a scrim! To see other people who are looking for a scrim, type /board");
  }

  //Remove yourself from the list manually
  else if(message.content.startsWith(prefix + "cya")) {
    //Make sure they were LFS in the first place!
    if(Object.keys(board).indexOf(message.author.id) === -1) {
      message.channel.send("You don't appear to even be on the board. If you would like to be added, please type /lfs");
    }
    else {
      delete board[message.author.id];
      message.channel.send(message.author + " is no longer looking for a scrim!");
    }
  }

  //Announce something in all the channels that the bot is in
  else if(message.content.startsWith(prefix + "announce")) {
    if(message.author.id === "261678719511429120") {
      var msg = message.content.substring(message.content.indexOf(" "));
      for(var i = 0; i < serverIDs.length; i++) {
        var guild = client.guilds.get(serverIDs[i]);
        guild.channels.find("name", "public_scrim").send(msg);
      }
    }
  }
  
  else if(message.content.startsWith(prefix + "dbtime")) {
     var d = new Date();
     message.channel.send("DB time is currently: " + (d.getHours() + 16) % 24 + ":" + d.getMinutes());      
  }

  //Displays all relevant commands and their usage
  else if(message.content.startsWith(prefix + "help")) {
    var helper = "/lfs [notes]: Add yourself to the board along with any notes, such as format (3D1B, BO3, etc), rotation or unlimited, decks you want to play, decks you want to face, etc.\n";
    helper += "/board: Check what people are currently LFS and are online. Also displays what server they made the request from and the invite link, as well as any notes they added.\n";
    helper += "/cya: Remove yourself from the board. Please note that if you go afk/do not disturb/offline you will be removed automatically.";
    message.channel.send(helper);
  }
});

client.login(process.env.BOT_TOKEN);
