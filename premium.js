const { EmbedBuilder } = require("discord.js");

const EMOJI = "✨";

module.exports = async (client) => {
try {
console.log("🚀 Lancement premium.js");

const channel = await client.channels.fetch(process.env.PREMIUM_CHANNEL_ID);

if (!channel) {
console.log("❌ Salon premium introuvable");
return;
}

let message;

// 🔁 récupérer message existant
if (process.env.PREMIUM_MESSAGE_ID) {
try {
message = await channel.messages.fetch(process.env.PREMIUM_MESSAGE_ID);
console.log("♻️ Message premium récupéré :", message.id);
} catch {
console.log("⚠️ Message introuvable → recréation");
}
}

// 🆕 création
if (!message) {
const embed = new EmbedBuilder()
.setColor("#7b2cff")
.setTitle("🔎・Zyra Back #2K26")
.setDescription(`
💎 **Envie de passer au niveau supérieur ?** 👀

**Accès Premium = contenu exclusif + accès privé 🔒**

**Comment rejoindre :**

➤ **@Prenium**

🎁 **Récompenses :**

• 20 invites = 1 mois
• 50 invites = lifetime

• Boost 1 = 1 mois
• Boost 3 = lifetime ⚡

⚠️ *Aucun autre moyen n’est accepté*

🔗 **.gg/ZyraBack**
`)
.setImage("attachment://zyra.jpg")
.setFooter({ text: ".gg/ZyraBack" });

message = await channel.send({
embeds: [embed],
files: [{
attachment: "./zyra.jpg",
name: "zyra.jpg"
}]
});

console.log("📨 Message premium créé :", message.id);

await message.react(EMOJI);

console.log("✨ Réaction ajoutée");

console.log("⚠️ COPIE CET ID DANS TON .env :");
console.log(`PREMIUM_MESSAGE_ID=${message.id}`);
}

} catch (err) {
console.error("❌ ERREUR premium.js:", err);
}
};