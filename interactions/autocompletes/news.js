const axios = require('axios');

module.exports = {
    name: 'news',
    execute: async (interaction, client) => {
        const focused = interaction.options.getFocused(true);
        if (focused.name.startsWith('tweak')) {
            if (!focused.value) return;
            const { data } = await axios.get(`https://misaka-search-ydkr.koyeb.app/misaka/tweaks/search?q=${encodeURIComponent(focused.value)}`);
            const list = data.packages.map((tweak) => ({ name: tweak.Name, value:tweak.PackageID }))
            .filter((tweak) => (tweak.name.includes(focused.value) || tweak.value.includes(focused.value)));
            await interaction.respond(list.slice(0, 25));
        }
    }
}