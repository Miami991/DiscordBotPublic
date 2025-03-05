const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Antwortet mit Pong!'),

    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Zeigt Infos über einen User')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Wähle einen Benutzer')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Zeigt Infos über den Server'),

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kickt einen User')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('User zum Kicken')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('grund')
                .setDescription('Grund für den Kick')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // Kick-Berechtigung erforderlich

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannt einen User')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('User zum Bannen')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('grund')
                .setDescription('Grund für den Bann')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Bann-Berechtigung erforderlich

    new SlashCommandBuilder()
        .setName('join')
        .setDescription('Lässt den Bot dem Voice-Channel beitreten'),

    new SlashCommandBuilder()
        .setName('play')
        .setDescription('Spielt einen Song von YouTube oder Spotify')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('Gib den Songnamen oder einen YouTube-Link ein')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('Lautstärke in Prozent (1-100)')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Überspringt den aktuellen Song'),

    new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stoppt die Wiedergabe und leert die Warteschlange'),

    new SlashCommandBuilder()
        .setName('clean')
        .setDescription('Löscht eine bestimmte Anzahl von Nachrichten (max. 100).')
        .addIntegerOption(option =>
            option.setName('anzahl')
                .setDescription('Anzahl der zu löschenden Nachrichten (1-100)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Nachrichten verwalten Berechtigung erforderlich

    new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Stellt die Lautstärke der Musik ein')
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('Lautstärke in Prozent (1-100)')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Zeigt die aktuelle Warteschlange an'),

    new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausiert die Wiedergabe der Musik'),

    new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Setzt die pausierte Musik fort'),
];

module.exports = commands;
