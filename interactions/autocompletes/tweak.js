const axios = require('axios');

module.exports = {
    name: 'tweak',
    execute: async (interaction) => {
        const focused = interaction.options.getFocused(true);
        if (focused.name.startsWith('query')) {
            if (focused.value.length < 2) return;
            const { data } = await axios.get(`https://misaka-search-ydkr.koyeb.app/api/v1/tweaks/search?q=${encodeURIComponent(focused.value)}`);
            const list = data.tweaks.map((tweak) => ({ name: tweak.Name, value: tweak.PackageID }));
            await interaction.respond(list.slice(0, 25));
        }
    }
}