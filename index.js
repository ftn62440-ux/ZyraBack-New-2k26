require("dotenv").config();

// 🌐 WEB SERVER (obligatoire pour Render)
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
res.send("Zyra Bot ONLINE 🚀");
});

app.listen(PORT, () => {
console.log(`🌐 Serveur web lancé sur le port ${PORT}`);
});


// 📦 DISCORD
const {
Client,
GatewayIntentBits,
Partials,
EmbedBuilder
} = require("discord.js");


// ✅ IMPORTS
const acces = require("./acces");
const statut = require("./statut");
const premium = require("./premium");
const inviteTracker = require("./inviteTracker");
const ticket = require("./ticket");


// 🤖 CLIENT
const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMessageReactions,
GatewayIntentBits.GuildPresences // 🔥 important pour statut
],
partials: [
Partials.Message,
Partials.Channel,
Partials.Reaction
]
});

const EMOJI = "✅";


// 🚀 READY
client.once("ready", async () => {
console.log(`✅ Connecté en tant que ${client.user.tag}`);

// 🔴 STATUT BOT
client.user.setPresence({
activities: [
{
name: "Zyra Back #2K26",
type: 3 // WATCHING
},
],
status: "dnd"
});

try {
// 🔥 MODULES
await acces(client);
await premium(client);
statut(client); // ⚠️ NE PAS ENLEVER
await inviteTracker(client);
await ticket(client);

// 📜 MESSAGE RÈGLEMENT
const channel = await client.channels.fetch(process.env.CHANNEL_ID);

if (!channel) {
console.log("❌ CHANNEL_ID invalide");
return;
}

let message;

// 🔁 récupérer message existant
if (process.env.RULES_MESSAGE_ID) {
try {
message = await channel.messages.fetch(process.env.RULES_MESSAGE_ID);
console.log("♻️ Message récupéré :", message.id);
} catch {
console.log("⚠️ Message introuvable → recréation");
}
}

// 🆕 créer message si absent
if (!message) {
const embed = new EmbedBuilder()
.setColor("#7b2cff")
.setTitle("🔎・Zyra Back #2K26")
.setDescription(`
📜 **Règlement du serveur**

➜ Respect obligatoire
➜ Pas de spam
➜ Pas de contenu illégal
➜ Respect de la vie privée

⚠️ Toute infraction = sanction

✅ Réagis avec ${EMOJI} pour accéder au serveur
`)
.setImage("attachment://zyra.jpg")
.setFooter({ text: "Zyra Security • 2026" });

message = await channel.send({
embeds: [embed],
files: [{
attachment: "./zyra.jpg",
name: "zyra.jpg"
}]
});

console.log("📨 Message créé :", message.id);

await message.react(EMOJI);

console.log("⚠️ Ajoute dans ton .env :");
console.log(`RULES_MESSAGE_ID=${message.id}`);
}

global.RULES_MESSAGE_ID = message.id;

} catch (err) {
console.error("❌ ERREUR READY:", err);
}
});


// ➕ AJOUT ROLE
client.on("messageReactionAdd", async (reaction, user) => {
try {
if (user.bot) return;
if (reaction.partial) await reaction.fetch();

if (reaction.message.id !== global.RULES_MESSAGE_ID) return;
if (reaction.emoji.name !== EMOJI) return;

const member = await reaction.message.guild.members.fetch(user.id);
await member.roles.add(process.env.ROLE_ID);

console.log(`✅ Rôle ajouté à ${user.tag}`);

} catch (err) {
console.error("❌ ERREUR ADD ROLE:", err);
}
});


// ➖ RETRAIT ROLE
client.on("messageReactionRemove", async (reaction, user) => {
try {
if (user.bot) return;
if (reaction.partial) await reaction.fetch();

if (reaction.message.id !== global.RULES_MESSAGE_ID) return;
if (reaction.emoji.name !== EMOJI) return;

const member = await reaction.message.guild.members.fetch(user.id);
await member.roles.remove(process.env.ROLE_ID);

console.log(`❌ Rôle retiré à ${user.tag}`);

} catch (err) {
console.error("❌ ERREUR REMOVE ROLE:", err);
}
});


// 🎫 INTERACTIONS (TICKET)
client.on("interactionCreate", async (interaction) => {
try {
if (ticket.handleTicket) {
await ticket.handleTicket(interaction, client);
}
} catch (err) {
console.error("❌ ERREUR INTERACTION:", err);
}
});


// 🔐 LOGIN
client.login(process.env.TOKEN);