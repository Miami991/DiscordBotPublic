require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const { DISCORD_CLIENT_ID, GUILD_ID, DISCORD_BOT_TOKEN } = process.env;

if (!DISCORD_CLIENT_ID || !DISCORD_BOT_TOKEN) {
    console.error("❌ Fehler: Fehlende Umgebungsvariablen (DISCORD_CLIENT_ID oder DISCORD_BOT_TOKEN).");
    process.exit(1);
}

// Definiere die Slash-Commands
const commands = [
    new SlashCommandBuilder().setName("ping").setDescription("🏓 Antwortet mit Pong!"),
    new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Zeigt Infos über einen User")
        .addUserOption(option =>
            option.setName("target")
                .setDescription("Wähle einen Benutzer")
                .setRequired(false)
        ),
    new SlashCommandBuilder().setName("serverinfo").setDescription("Zeigt Infos über den Server"),
    new SlashCommandBuilder().setName("join").setDescription("🔊 Bot tritt einem Voice-Channel bei"),
    new SlashCommandBuilder()
        .setName("play")
        .setDescription("🎶 Spielt einen Song ab")
        .addStringOption(option => 
            option.setName("song")
                .setDescription("Der Song oder die URL")
                .setRequired(true)
        ),
    new SlashCommandBuilder().setName("skip").setDescription("⏭ Überspringt den aktuellen Song"),
    new SlashCommandBuilder().setName("stop").setDescription("⏹ Stoppt die Wiedergabe und leert die Warteschlange"),
    new SlashCommandBuilder()
        .setName("clean")
        .setDescription("🧹 Löscht eine bestimmte Anzahl von Nachrichten (max. 100).")
        .addIntegerOption(option =>
            option.setName("anzahl")
                .setDescription("Anzahl der zu löschenden Nachrichten (1-100)")
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Stellt die Lautstärke der Musik ein")
        .addIntegerOption(option =>
            option.setName("volume")
                .setDescription("Lautstärke in Prozent (1-100)")
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Zeigt die aktuelle Warteschlange an"),
    new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pausiert die Wiedergabe der Musik"),
    new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Setzt die pausierte Musik fort"),
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log("🚀 Lösche alle bisherigen Slash-Commands...");

        if (GUILD_ID) {
            await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GUILD_ID), { body: [] });
            console.log("✅ Alle Guild-Slash-Commands gelöscht.");
        } else {
            await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: [] });
            console.log("✅ Alle globalen Slash-Commands gelöscht.");
        }

        console.log("🚀 Registriere neue Slash-Commands...");
        
        if (GUILD_ID) {
            await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GUILD_ID), { body: commands });
            console.log("✅ Erfolgreich als Guild-Commands registriert!");
        } else {
            await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
            console.log("✅ Erfolgreich als globale Commands registriert!");
        }

        console.log("📜 Registrierte Commands:", commands.map(cmd => cmd.name).join(", "));
    } catch (error) {
        console.error("❌ Fehler beim Registrieren der Commands:", error);
    }
})();
