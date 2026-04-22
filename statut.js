const { Events, EmbedBuilder } = require("discord.js");

module.exports = (client) => {

client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
try {
if (!newPresence) return;

const member = newPresence.member;
if (!member || member.user.bot) return;

const role = member.guild.roles.cache.get(process.env.STATUS_ROLE_ID);
const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);

if (!role) return console.log("❌ Rôle statut introuvable");
if (!logChannel) return console.log("❌ Salon log introuvable");

// 🔍 récupérer le statut personnalisé uniquement
const customStatus = newPresence.activities.find(
activity => activity.type === 4
);

const statusText = customStatus?.state || "";

// ✅ MATCH EXACT (.gg/ZyraBack uniquement)
const hasExactStatus = statusText.trim() === process.env.STATUS_TEXT;

console.log(`🔎 ${member.user.tag} statut: "${statusText}"`);

// 📦 fonction log
const createLog = (type) => {
return new EmbedBuilder()
.setColor(type === "add" ? "#00ff88" : "#ff4444")
.setTitle("📊 Zyra Status Log")
.setDescription(
type === "add"
? `✅ ${member} a mis le bon statut\n🎭 Rôle attribué`
: `❌ ${member} a retiré/modifié le statut\n🚫 Rôle retiré`
)
.addFields(
{ name: "👤 Utilisateur", value: member.user.tag, inline: true },
{ name: "📝 Statut", value: statusText || "Aucun", inline: true }
)
.setTimestamp();
};

// ➕ AJOUT ROLE
if (hasExactStatus && !member.roles.cache.has(role.id)) {
await member.roles.add(role);

console.log(`✅ ${member.user.tag} → rôle ajouté`);

await logChannel.send({
embeds: [createLog("add")]
});
}

// ➖ RETRAIT ROLE
if (!hasExactStatus && member.roles.cache.has(role.id)) {
await member.roles.remove(role);

console.log(`❌ ${member.user.tag} → rôle retiré`);

await logChannel.send({
embeds: [createLog("remove")]
});
}

} catch (err) {
console.error("❌ ERREUR STATUT:", err);
}
});

};