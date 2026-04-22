const { Events, EmbedBuilder } = require("discord.js");

module.exports = (client) => {

console.log("🚀 statut.js chargé");

// 🔁 FONCTION PRINCIPALE (réutilisable)
const checkMemberStatus = async (member) => {
try {
if (!member || member.user.bot) return;

const role = member.guild.roles.cache.get(process.env.STATUS_ROLE_ID);
const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);

if (!role) return console.log("❌ Rôle statut introuvable");
if (!logChannel) return console.log("❌ Salon log introuvable");

const presence = member.presence;
if (!presence) return;

const customStatus = presence.activities.find(a => a.type === 4);
const statusText = customStatus?.state || "";

const hasExactStatus = statusText.trim() === process.env.STATUS_TEXT;

console.log(`🔎 ${member.user.tag} → "${statusText}"`);

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

await logChannel.send({ embeds: [createLog("add")] });
}

// ➖ RETRAIT ROLE
if (!hasExactStatus && member.roles.cache.has(role.id)) {
await member.roles.remove(role);
console.log(`❌ ${member.user.tag} → rôle retiré`);

await logChannel.send({ embeds: [createLog("remove")] });
}

} catch (err) {
console.error("❌ ERREUR checkMemberStatus:", err);
}
};

// ⚡ EVENT LIVE (peut bug sur Render → fallback en dessous)
client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
try {
if (!newPresence) return;

console.log("📡 PresenceUpdate déclenché");

const guild = newPresence.guild;

// 🔥 FIX IMPORTANT
const member = await guild.members.fetch(newPresence.userId);

await checkMemberStatus(member);

} catch (err) {
console.error("❌ ERREUR PresenceUpdate:", err);
}
});

// 🔁 FALLBACK (ANTI BUG RENDER)
client.once(Events.ClientReady, () => {
console.log("🔁 Lancement du scan automatique des statuts");

setInterval(async () => {
try {
const guilds = client.guilds.cache;

for (const guild of guilds.values()) {

const members = await guild.members.fetch();

for (const member of members.values()) {
await checkMemberStatus(member);
}
}

console.log("🔄 Scan statut terminé");

} catch (err) {
console.error("❌ ERREUR scan interval:", err);
}
}, 30000); // ⏱️ toutes les 30 secondes
});

};