
const { EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
    try {
        console.log("🚀 Lancement acces.js");

        console.log("📌 CHANNEL ID:", process.env.ACCESS_CHANNEL_ID);

        const channel = await client.channels.fetch(process.env.ACCESS_CHANNEL_ID);

        if (!channel) {
            console.log("❌ Salon introuvable");
            return;
        }

        console.log("✅ Salon trouvé :", channel.id);

        const embed = new EmbedBuilder()
            .setColor("#7b2cff")
            .setTitle("🔎・Zyra Back #2K26")
            .setDescription(`
Pour débloquer l’accès au salon gratuit, c’est simple :

**1. Mets le statut suivant sur Discord :**  
👉 **.gg/ZyraBack**

**2. Garde-le actif quelques minutes**

**3. L’accès te sera automatiquement donné** ✅
            `)
            .setImage("attachment://zyra.jpg");

        await channel.send({
            embeds: [embed],
            files: [{
                attachment: "./zyra.jpg",
                name: "zyra.jpg"
            }]
        });

        console.log("📨 Message envoyé avec succès");

    } catch (err) {
        console.error("❌ ERREUR acces.js:", err);
    }
};