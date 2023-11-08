const axios = require('axios');

module.exports = {
    name: 'news',
    execute: async (interaction, client) => {
        const focused = interaction.options.getFocused(true);
        if (focused.name.startsWith('tweak')) {
            if (focused.value.length < 2) return;
            const { data } = await axios.get(`https://misaka-search-ydkr.koyeb.app/api/v2/tweaks/search?q=${encodeURIComponent(focused.value)}`);
            const list = data.tweaks.map((tweak) => ({ name: tweak.name, value: tweak.packageid }));
            await interaction.respond(list.slice(0, 25));
        }
    }
}