const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { YouTube } = require('youtube-sr');
const { QueueRepeatMode } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('music')
    .setDMPermission(false)
    .addSubcommand(subcommand =>
        subcommand.setName('play')
        .setDescription('play track in voice channel')
        .addStringOption(option => 
            option.setName('query')
            .setDescription('query')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName('stop')
        .setDescription('disconnect')
    )
    .addSubcommand(subcommand =>
        subcommand.setName('skip')
        .setDescription('skip current track')
    )
    .addSubcommand(subcommand =>
        subcommand.setName('remove')
        .setDescription('remove track from queue')
        .addIntegerOption(option =>
            option.setName('track')
            .setDescription('choose a track')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('repeat')
        .setDescription('repeat tracks')
        .addStringOption(option => 
            option.setName('mode')
            .setDescription('choose a repeat mode')
            .setRequired(true)
            .addChoices(
                { name: 'OFF', value: 'OFF' },
                { name: 'Track', value: 'TRACK' },
                { name: 'Queue', value: 'QUEUE' },
            )
        )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('nowplaying')
        .setDescription('show current track')
    )
    .addSubcommand(subcommand =>
        subcommand.setName('queue')
        .setDescription('show queue')
    ),
    execute: async(interaction, client) => {
        if (!interaction.member.voice.channel) return interaction.reply({ content: 'You need to join the voice channel', ephemeral: true });
        const subcommand = interaction.options.getSubcommand();
        const player = client.player;
        if (!player.queues.has(interaction.guildId)) {
            player.queues.create(interaction.guild, {
                metadata: interaction
            });
        }
        const queue = player.queues.get(interaction.guildId);
        if (subcommand === 'play') {
            await interaction.deferReply();
            if (!queue.connection) await queue.connect(interaction.member.voice.channel);
            const query = interaction.options.getString('query');
            if (YouTube.isPlaylist(query)) {
                const { tracks, playlist } = await player.search(query, {
                    searchEngine: 'youtubePlaylist',
                    requestedBy: interaction.user
                });
                if (!playlist) return interaction.editReply({ content: 'No playlist found' });
                queue.addTrack(tracks);
                const embed = new EmbedBuilder()
                .setAuthor({ name: 'Added playlist' })
                .setTitle(playlist.title)
                .setURL(playlist.url)
                .setThumbnail(playlist.thumbnail.url)
                .addFields(
                    { name: 'Tracks', value: `${playlist.tracks.length}`, inline: true },
                    { name: 'Time', value: playlist.durationFormatted, inline: true }
                )
                .setColor('ff0000');
                await interaction.editReply({ embeds: [ embed ] });
            } else {
                const { tracks } = await player.search(query, {
                    searchEngine: 'youtubeSearch',
                    requestedBy: interaction.user
                });
                if (!tracks[0]) return interaction.editReply({ content: 'No tracks found' });
                queue.addTrack(tracks[0]);
                const embed = new EmbedBuilder()
                .setAuthor({ name: 'Added to queue' })
                .setTitle(tracks[0].title)
                .setURL(tracks[0].url)
                .setThumbnail(tracks[0].thumbnail)
                .addFields(
                    { name: 'Channel', value: `[${tracks[0].raw.channel.name}](${tracks[0].raw.channel.url})`, inline: true },
                    { name: 'Time', value: tracks[0].duration, inline: true }
                )
                .setColor('ff0000');
                await interaction.editReply({ embeds: [ embed ] });
            }
            if (!queue.isPlaying()) 
                await queue.node.play();
            
        } else if (subcommand === 'stop') {
            if (!queue.tracks[0] && !queue.currentTrack) 
                return interaction.reply({ content: 'Track not playing', ephemeral: true });
            
            queue.node.stop();
            await interaction.reply({ content: '⏹️Stopped' });
        } else if (subcommand === 'skip') {
            if (!queue.tracks[0] && !queue.currentTrack) 
                return interaction.reply({ content: 'Track not playing', ephemeral: true });
            
            const track = queue.currentTrack;
            queue.node.skip();
            await interaction.reply({ content: `⏩Skipped \`${track.title}\`` });
        } else if (subcommand === 'remove') {
            if (!queue.tracks[0] && !queue.currentTrack) 
                return interaction.reply({ content: 'Track not playing', ephemeral: true });
            
            const removed = queue.removeTrack(interaction.options.getInteger('track') - 1);
            const component = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('cancel')
                .setCustomId('readd')
            );
            const reply = await interaction.reply({ content: `🚮\`${removed.title}\` removed from queue`, components: [ component ] });
            reply.awaitMessageComponent({ filter: ({ customId, user }) => (customId === 'readd' && user.id === interaction.user.id), time: 90000 })
            .then(interaction => {
                queue.addTrack(removed);
                const embed = new EmbedBuilder()
                .setAuthor({ name: 'Added to queue' })
                .setTitle(removed.title)
                .setURL(removed.url)
                .setThumbnail(removed.thumbnail)
                .addFields(
                    { name: 'Channel', value: `[${removed.raw.channel.name}](${removed.raw.channel.url})`, inline: true },
                    { name: 'Time', value: removed.duration, inline: true }
                )
                .setColor('ff0000');
                interaction.reply({ embeds: [ embed ] });
            })
            .catch(() => {});
        } else if (subcommand === 'repeat') {
            if (!queue.tracks[0] && !queue.currentTrack) 
                return interaction.reply({ content: 'Track not playing', ephemeral: true });
            
            const repeatmode = interaction.options.getString('mode');
            queue.setRepeatMode(QueueRepeatMode[repeatmode]);
            await interaction.reply({ content: `${repeatmode === 'TRACK' ? '🔂' : '🔁'}Changed repeat mode to ${repeatmode}` });
        } else if (subcommand === 'nowplaying') {
            if (!queue.currentTrack) 
                return interaction.reply({ content: 'Track not playing', ephemeral: true });
            
            const current = queue.currentTrack;
            const embed = new EmbedBuilder()
            .setAuthor({ name: 'Now Playing' })
            .setTitle(current.title)
            .setURL(current.url)
            .setThumbnail(current.thumbnail)
            .addFields(
                { name: `${queue.node.getTimestamp().progress}%`, value: queue.node.createProgressBar() }
            )
            .setFooter({ text: `Requested By ${current.requestedBy.username}`, iconURL: current.requestedBy.displayAvatarURL() })
            .setColor('ff0000');
            await interaction.reply({ embeds: [ embed ] });
        } else if (subcommand === 'queue') {
            if (!queue.tracks.at(0) && !queue.currentTrack) 
                return interaction.reply({ content: 'Track not playing', ephemeral: true });
            
            if (queue.tracks.size === 0) {
                const current = queue.currentTrack;
                const embed = new EmbedBuilder()
                .setAuthor({ name: 'Now Playing' })
                .setTitle(current.title)
                .setURL(current.url)
                .setThumbnail(current.thumbnail)
                .addFields(
                    { name: `${queue.node.getTimestamp().progress}%`, value: queue.node.createProgressBar() }
                )
                .setFooter({ text: `Requested By ${current.requestedBy.username}`, iconURL: current.requestedBy.displayAvatarURL() })
                .setColor('ff0000');
                return await interaction.reply({ embeds: [ embed ] });
            }
            const tracks = queue.tracks.slice(0, 10).map((track, i) => {
                return `${i + 1}:[${track.title}](${track.url})`;
            });
            const embed = new EmbedBuilder()
            .setAuthor({ name: 'Next Tracks' })
            .setDescription(
                `${tracks.join('\n')}${
                    queue.tracks.size > tracks.length
                        ? `\n...and ${queue.tracks.size - tracks.length === 1 ? `${queue.tracks.size - tracks.length} more` : `${queue.tracks.size - tracks.length} tracks`}`
                        : ''
                }`
            )
            .addFields(
                { name: 'Now Playing', value: `[${queue.currentTrack.title}](${queue.currentTrack.url})` }
            )
            .setColor('ff0000');
            await interaction.reply({ embeds: [ embed ] });
        }
    }
}