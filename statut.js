const { Events, EmbedBuilder } = require("discord.js");

module.exports = (client) => {

const checkStatus = async (member) => {
if (!member || member.user.bot) return;

const role = member.guild.roles.cache.get(process.env.STATUS_ROLE_ID);
const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);

if (!role || !logChannel) return;

const presence = member.presence;
if (!presence) return;

const customStatus = presence.activities.find(a => a.type === 4);
const statusText = customStatus?.state || "";

const hasStatus = statusText.includes(process.env.STATUS_TEXT);

const embed = new EmbedBuilder()
.setColor(hasStatus ? "#00ff88" : "#ff4444")
.setTitle("📊 Zyra Status Log")
.addFields(
{ name: "👤 User", value: member.user.tag },
{ name: "📝 Status", value: statusText || "Aucun" }
)
.setTimestamp();

// ➕ ADD ROLE
if (hasStatus && !member.roles.cache.has(role.id)) {
await member.roles.add(role);
embed.setDescription(`✅ ${member} a le statut → rôle ajouté`);
await logChannel.send({ embeds: [embed] });
}

// ➖ REMOVE ROLE
if (!hasStatus && member.roles.cache.has(role.id)) {
await member.roles.remove(role);
embed.setDescription(`❌ ${member} a retiré le statut → rôle retiré`);
await logChannel.send({ embeds: [embed] });
}
};


// 🔥 EVENT LIVE
client.on(Events.PresenceUpdate, async (_, newPresence) => {
if (!newPresence?.member) return;
await checkStatus(newPresence.member);
});


// 🔥 SCAN AU DÉMARRAGE (ULTRA IMPORTANT POUR RENDER)
client.once("ready", async () => {
console.log("🔎 Scan des statuts...");

client.guilds.cache.forEach(async (guild) => {
const members = await guild.members.fetch();

members.forEach(member => {
checkStatus(member);
});
});
});

};