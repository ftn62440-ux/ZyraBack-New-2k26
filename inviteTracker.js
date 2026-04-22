const { Events, EmbedBuilder } = require("discord.js");

module.exports = async (client) => {

// 📦 stock invites
client.invites = new Map();

// 🔁 charger les invites au démarrage
client.once(Events.ClientReady, async () => {
console.log("📡 Chargement des invitations...");

client.guilds.cache.forEach(async (guild) => {
const invites = await guild.invites.fetch();
client.invites.set(guild.id, new Map(invites.map(inv => [inv.code, inv.uses])));
});

console.log("✅ Invites chargées");
});

// 👤 quand quelqu’un rejoint
client.on(Events.GuildMemberAdd, async (member) => {
try {
const logChannel = member.guild.channels.cache.get(process.env.INVITE_LOG_CHANNEL_ID);
if (!logChannel) return console.log("❌ Salon log introuvable");

const oldInvites = client.invites.get(member.guild.id);

const newInvites = await member.guild.invites.fetch();

const usedInvite = newInvites.find(inv => {
const oldUses = oldInvites.get(inv.code);
return inv.uses > oldUses;
});

// update cache
client.invites.set(member.guild.id, new Map(newInvites.map(inv => [inv.code, inv.uses])));

if (!usedInvite) {
return logChannel.send(`⚠️ ${member.user.tag} a rejoint (invitation inconnue)`);
}

const inviter = usedInvite.inviter;

const embed = new EmbedBuilder()
.setColor("#7b2cff")
.setTitle("📥 Nouveau membre")
.setDescription(`
👤 **Utilisateur :** ${member}
📨 **Invité par :** ${inviter}
🔗 **Code :** ${usedInvite.code}
📊 **Utilisations :** ${usedInvite.uses}
`)
.setTimestamp();

await logChannel.send({ embeds: [embed] });

console.log(`📥 ${member.user.tag} invité par ${inviter.tag}`);

} catch (err) {
console.error("❌ ERREUR INVITE:", err);
}
});
};