const {
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionsBitField
} = require("discord.js");

const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
try {
console.log("🚀 Lancement ticket.js");

const channel = await client.channels.fetch(process.env.TICKET_CHANNEL_ID);
if (!channel) return console.log("❌ Channel ticket introuvable");

let message;

if (process.env.TICKET_MESSAGE_ID) {
try {
message = await channel.messages.fetch(process.env.TICKET_MESSAGE_ID);
console.log("♻️ Message ticket récupéré");
} catch {}
}

if (!message) {
const embed = new EmbedBuilder()
.setColor("#7b2cff")
.setTitle("🔎・Zyra Back #2K26")
.setDescription("🎫 Choisis le type de ticket")
.setImage("attachment://zyra.jpg");

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.setPlaceholder("Choisir...")
.addOptions([
{ label: "Achat", value: "achat", emoji: "💰" },
{ label: "Aide", value: "aide", emoji: "🛠️" },
{ label: "Bug", value: "bug", emoji: "🐛" }
]);

const row = new ActionRowBuilder().addComponents(menu);

message = await channel.send({
embeds: [embed],
components: [row],
files: [{ attachment: "./zyra.jpg", name: "zyra.jpg" }]
});

console.log("📨 Message ticket créé :", message.id);
console.log(`TICKET_MESSAGE_ID=${message.id}`);
}

} catch (err) {
console.error("❌ ERREUR ticket.js:", err);
}
};



// 🎯 HANDLER
module.exports.handleTicket = async (interaction, client) => {
try {

// ===== MENU =====
if (interaction.isStringSelectMenu() && interaction.customId === "ticket_menu") {

await interaction.deferReply({ flags: 64 });

const type = interaction.values[0];
const guild = interaction.guild;
const user = interaction.user;

// 🔒 Vérif ticket existant
const existing = guild.channels.cache.find(c =>
c.topic === user.id
);

if (existing) {
await interaction.editReply({ content: "❌ Tu as déjà un ticket ouvert" });
return true;
}

const staffRole = guild.roles.cache.get(process.env.STAFF_ROLE_ID);
if (!staffRole) {
await interaction.editReply({ content: "❌ ROLE STAFF NON CONFIG" });
return true;
}

// 🎫 CREATE
const channel = await guild.channels.create({
name: `${type}-${user.username}`,
topic: user.id, // 🔥 important
type: ChannelType.GuildText,
parent: process.env.TICKET_CATEGORY_ID,
permissionOverwrites: [
{
id: guild.roles.everyone.id,
deny: [PermissionsBitField.Flags.ViewChannel]
},
{
id: user.id,
allow: [PermissionsBitField.Flags.ViewChannel],
deny: [PermissionsBitField.Flags.SendMessages] // 🔒 bloqué
},
{
id: staffRole.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}
]
});

const embed = new EmbedBuilder()
.setColor("#7b2cff")
.setTitle("🔎・Zyra Back #2K26")
.setDescription(`🎫 Ticket **${type}** ouvert par ${user}`);

const buttons = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("claim")
.setLabel("Prendre")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("close")
.setLabel("Fermer")
.setStyle(ButtonStyle.Danger)
);

await channel.send({
content: `<@${user.id}>`,
embeds: [embed],
components: [buttons]
});

await interaction.editReply({ content: "✅ Ticket créé !" });
return true;
}


// ===== BOUTONS =====
if (interaction.isButton()) {

await interaction.deferReply({ flags: 64 });

const member = interaction.member;
const staffRoleId = process.env.STAFF_ROLE_ID;

if (!member.roles.cache.has(staffRoleId)) {
await interaction.editReply({ content: "❌ Staff uniquement" });
return true;
}

const channel = interaction.channel;

// ===== CLAIM =====
if (interaction.customId === "claim") {

const userId = channel.topic;
if (!userId) return;

await channel.permissionOverwrites.edit(userId, {
SendMessages: true
});

await channel.send(`✅ Ticket pris en charge par ${interaction.user}`);
await channel.send(`<@${userId}> tu peux maintenant parler.`);

await interaction.editReply({ content: "✔️ Ticket pris" });
return true;
}

// ===== CLOSE =====
if (interaction.customId === "close") {

const messages = await channel.messages.fetch({ limit: 100 });

let content = "";

const sorted = Array.from(messages.values())
.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

for (const msg of sorted) {
content += `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content || "[embed/attachment]"}\n`;
}

const filePath = path.join(__dirname, `transcript-${channel.id}.txt`);
fs.writeFileSync(filePath, content);

const userId = channel.topic;
const user = await client.users.fetch(userId).catch(() => null);

if (user) {
await user.send({
content: `📁 Ton ticket a été fermé par ${interaction.user}\n📌 Serveur: ${interaction.guild.name}`,
files: [filePath]
}).catch(() => {});
}

const logs = await client.channels.fetch(process.env.TICKET_LOGS_ID);
if (logs) {
await logs.send({
content: `📁 Ticket fermé par ${interaction.user} (${channel.name})`,
files: [filePath]
});
}

fs.unlinkSync(filePath);

await channel.delete();

await interaction.editReply({ content: "🗑️ Ticket fermé" });
return true;
}
}

} catch (err) {
console.error("❌ ERREUR TICKET:", err);
}
};