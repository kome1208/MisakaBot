const { EmbedBuilder } = require('discord.js');

module.exports = {
    tweakEmbed: (packageData) => {
        return new EmbedBuilder()
        .setAuthor({ name:`${packageData.Repository.Name}`, iconURL:packageData.Repository.Icon})
        .setTitle(packageData.Name)
        .setDescription(packageData.Description || null)
        .addFields(
            { name:'Author', value:packageData?.Author?.Label || packageData.Repository.Default.Author.Label, inline:true },
            { name:'Version', value:packageData.Releases.at(-1).Version, inline:true },
            { name:'PackageID', value:packageData.PackageID, inline:true },
            { name:'Repository', value:`[${packageData.Repository.Name}](${packageData.Repository.Link})`, inline:true },
            { name:'Tweak Page', value:`[Open](https://straight-tamago.github.io/misaka/?repo=${packageData.Repository.Link}&tweak=${packageData.PackageID})`, inline:true }
        )
        .setThumbnail(packageData.Icon || null)
        .setImage(packageData?.Screenshot?.at(0) || null)
        .setColor('Random');
    }
}