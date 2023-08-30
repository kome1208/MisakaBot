const { default: axios } = require("axios");

module.exports = {
    name: 'faq',
    execute: async (interaction, client) => {
        const focused = interaction.options.getFocused(true);
        if (focused.name === 'title') {
            const { data } = await axios.get('https://raw.githubusercontent.com/shimajiron/Misaka_Network/main/FAQ.json');
            const list = Object.keys(data)
            .map((id) => {
                return { name: data[id].title, value:id }
            })
            .filter((faq) => (faq.name.includes(focused.value) || faq.value.includes(focused.value)));
            await interaction.respond(list.slice(0, 25));
        }
    }
}