module.exports = {
    name: 'music',
    execute: async (interaction, client) => {
        if (!interaction.member.voice.channel) return;
        const focused = interaction.options.getFocused(true);
        const queue = client.player.queues.get(interaction.guildId);
        if (focused.name === "track") {
            if (!queue) return;
            const tracks = queue.tracks.map((track, i) => ({ name: `${i+1}:${track.title}`, value: `${i+1}` }));
            const filtered = tracks.filter(track => 
                (track.name.toLowerCase().startsWith(focused.value.toLowerCase()) || track.value.startsWith(focused.value))
            );
            await interaction.respond(filtered.slice(0, 25));
        }
    }
}