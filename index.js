require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { DisTube } = require("distube");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");
process.env.FFMPEG_PATH = require("ffmpeg-static");

// ✅ Erstelle den Discord-Client mit allen benötigten Intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

// ✅ Initialisiere DisTube mit den benötigten Plugins
const distube = new DisTube(client, {
    emitNewSongOnly: true,
    nsfw: true,
    emitAddSongWhenCreatingQueue: true,
    plugins: [
        new SpotifyPlugin(),
        new SoundCloudPlugin(),
        new YtDlpPlugin()
    ]
});

// ✅ Event-Handling für den Start des Bots
client.once('ready', () => {
    console.log(`✅ Bot ist online als ${client.user.tag}`);

    client.user.setPresence({
        status: 'online',
        activities: [
            {
                name: "denkt nach...💫",
                type: 0,
                url: null
            }
        ]
    });
});

// ✅ Event-Handling für Befehle
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    await interaction.deferReply();

    const { commandName, options, member, guild } = interaction;

    try {
        if (commandName === "ping") {
            await interaction.editReply("🏓 Pong!");
        }
        else if (commandName === "userinfo") {
            const user = options.getUser("target") || interaction.user;
            await interaction.editReply(`👤 Benutzer: ${user.tag}\n🆔 ID: ${user.id}`);
        }
        else if (commandName === "serverinfo") {
            await interaction.editReply(`📌 Servername: ${guild.name}\n👥 Mitglieder: ${guild.memberCount}`);
        }
        else if (commandName === "join") {
            if (!member.voice.channel) {
                return interaction.editReply("❌ Du musst in einem Voice-Channel sein!");
            }

            let connection = getVoiceConnection(guild.id);
            if (connection && connection.joinConfig.channelId === member.voice.channel.id) {
                return interaction.editReply("✅ Der Bot ist bereits in diesem Voice-Channel.");
            }

            if (connection) connection.destroy();

            joinVoiceChannel({
                channelId: member.voice.channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator
            });

            try {
                await interaction.editReply("🔊 Bot ist dem Voice-Channel beigetreten!");
            } catch (error) {
                if (error.code === 10008) {
                    console.error("Message no longer exists or is invalid");
                } else {
                    console.error("Unexpected error occurred while editing message:", error);
                }
            }
        }
        else if (commandName === "play") {
            if (!member.voice.channel) {
                return interaction.editReply("❌ Du musst in einem Voice-Channel sein!");
            }

            const song = options.getString("song").trim();
            let connection = getVoiceConnection(guild.id);

            if (connection && !distube.voices.has(guild.id)) {
                connection.destroy();
            }

            try {
                await distube.play(member.voice.channel, song, {
                    member: member,
                    textChannel: interaction.channel
                });

                await interaction.editReply(`🎶 Der Song **${song}** wird jetzt abgespielt!`);
            } catch (error) {
                console.error("Fehler beim Abspielen:", error);
                let errorMessage = "❌ Fehler beim Abspielen des Songs.";

                if (error.errorCode === "NOT_SUPPORTED_URL") {
                    errorMessage += " Diese URL wird nicht unterstützt. Bitte benutze einen YouTube- oder SoundCloud-Link.";
                } else if (error.message.includes("No result")) {
                    errorMessage += " Es wurde kein passender Song gefunden.";
                }

                try {
                    await interaction.editReply(errorMessage);
                } catch (err) {
                    console.error("Fehler beim Bearbeiten der Antwort:", err);
                    await interaction.followUp("❌ Etwas ist schiefgelaufen. Bitte versuche es später noch einmal.");
                }
            }
        }
        else if (commandName === "skip") {
            const queue = distube.getQueue(guild.id);
            if (!queue) return interaction.editReply("❌ Es läuft gerade keine Musik!");

            await distube.skip(guild.id);
            await interaction.editReply("⏭ Song übersprungen!");
        }
        else if (commandName === "stop") {
            const queue = distube.getQueue(guild.id);
            if (!queue) return interaction.editReply("❌ Es läuft gerade keine Musik!");

            distube.stop(guild.id);
            await interaction.editReply("⏹ Musik gestoppt und Warteschlange geleert!");
        }
        else if (commandName === "clean") {
            if (!member.permissions.has("ManageMessages")) {
                return interaction.editReply("❌ Du hast keine Berechtigung, um Nachrichten zu löschen!");
            }

            const amount = options.getInteger("anzahl");
            if (amount < 1 || amount > 100) {
                return interaction.editReply("❌ Bitte gib eine Zahl zwischen 1 und 100 ein.");
            }

            try {
                const deletedMessages = await interaction.channel.bulkDelete(amount, true);

                if (deletedMessages.size === 0) {
                    return interaction.editReply("❌ Keine Nachrichten zum Löschen gefunden.");
                }

                await interaction.editReply(`✅ ${deletedMessages.size} Nachrichten wurden gelöscht.`);
            } catch (err) {
                console.error("Fehler beim Löschen der Nachrichten:", err);
                
                if (err.code === 10008) {
                    await interaction.editReply("❌ Die angeforderten Nachrichten existieren nicht mehr oder sind zu alt zum Löschen.");
                } else {
                    await interaction.editReply("❌ Ein Fehler ist beim Löschen der Nachrichten aufgetreten.");
                }
            }
        }
        // 🎶 Lautstärkeregler
        else if (commandName === "volume") {
            const volume = options.getInteger("volume");
            const queue = distube.getQueue(guild.id);

            if (!queue) {
                return interaction.editReply("❌ Keine Musik wird gerade abgespielt.");
            }

            if (volume < 1 || volume > 100) {
                return interaction.editReply("❌ Gib eine Lautstärke zwischen 1 und 100 ein.");
            }

            queue.setVolume(volume);
            await interaction.editReply(`🔊 Lautstärke wurde auf **${volume}** gesetzt.`);
        }

        // 🎶 Warteschlange anzeigen
        else if (commandName === "queue") {
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                return interaction.editReply("❌ Es gibt keine Warteschlange.");
            }

            let queueMessage = "🎶 Aktuelle Warteschlange:\n";
            queue.songs.forEach((song, index) => {
                queueMessage += `**${index + 1}.** ${song.name}\n`;
            });

            await interaction.editReply(queueMessage);
        }

        // 🎶 Pause und Fortsetzen
        else if (commandName === "pause") {
            const queue = distube.getQueue(guild.id);
            if (!queue) return interaction.editReply("❌ Es läuft gerade keine Musik!");

            if (queue.paused) {
                return interaction.editReply("❌ Die Musik ist bereits pausiert.");
            }

            queue.pause();
            await interaction.editReply("⏸ Musik pausiert.");
        }
        else if (commandName === "resume") {
            const queue = distube.getQueue(guild.id);
            if (!queue || !queue.paused) return interaction.editReply("❌ Es läuft gerade keine pausierte Musik!");

            queue.resume();
            await interaction.editReply("▶ Musik fortgesetzt.");
        }

    } catch (err) {
        console.error("Fehler bei der Bearbeitung der Interaktion:", err);
        try {
            await interaction.editReply("❌ Etwas ist schiefgelaufen.");
        } catch (error) {
            console.error("Fehler beim Bearbeiten der Antwort:", error);
            try {
                await interaction.followUp("❌ Etwas ist schiefgelaufen, versuche es später erneut.");
            } catch (finalError) {
                console.error("Fehler bei followUp:", finalError);
            }
        }
    }
});

// ✅ Willkommensnachricht für neue Mitglieder und automatische Rollenzuweisung
client.on("guildMemberAdd", (member) => {
    const welcomeChannel = member.guild.channels.cache.get("1204174214941122572"); // Channel ID hier anpassen!
    if (!welcomeChannel) return;

    // Erstellt ein schönes Embed für die Willkommensnachricht
    const welcomeEmbed = new EmbedBuilder()
        .setColor("#2b2d31") // Dunkles Discord-Grau
        .setTitle("**Willkommen!**")
        .setDescription(
            `Herzlich willkommen in der **Aristoteles-Community**, ${member.user}! 🎉\n\n` +
            "Wir freuen uns, dich bei uns zu haben. Tauche ein, teile dein Wissen und " +
            "genieße die inspirierenden Gespräche!"
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    // Nachricht mit Ping an den User + Embed senden
    welcomeChannel.send({
        content: `Welcome ${member} to **Aristoteles®**!`,
        embeds: [welcomeEmbed],
    });

    // Rolle "Neuling" automatisch zuweisen
    const role = member.guild.roles.cache.find(r => r.name === "Neuling");
    if (role) {
        member.roles.add(role).catch(err => console.error("Fehler beim Hinzufügen der Rolle:", err));
    }
});

// ✅ Bot-Login
client.login(process.env.DISCORD_BOT_TOKEN);
