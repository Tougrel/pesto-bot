import "dotenv/config";
import {GatewayIntentBits, ActivityType, GuildMemberFlags} from "discord-api-types/v10";
import {Client, Partials, Events, Collection} from "discord.js";
import {readFile, readdir} from "node:fs/promises";

const client = new Client({
	partials: [Partials.User, Partials.GuildMember],
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
	presence: {
		activities: [
			{
				name: "Biting Abba, Watching Vihi die in Celeste and Listening to Frank's talk about feet",
				type: ActivityType.Custom,
			}
		],
	},
});
const commands = new Collection();

client.once(Events.ClientReady, async () => {
	console.log("Nya");
	
	const files = await readdir("./commands/");
	for (const file of files) {
		const command = await import((`./commands/${file}`));
		commands.set(command.name, command);
	}
});

client.on(Events.GuildMemberAdd, async (member) => {
	// Get the config
	const config = JSON.parse((await readFile("configs/config.json")).toString());
	
	// If the system is not enabled, the member has the bypass verification flag and the member is not kickable then stop here
	if (!config.enabled || member.user.bot || member.flags.has(GuildMemberFlags.BypassesVerification) || !member.kickable) return;
	
	// If the mode in the config is set to kick then kick the user
	if (config.mode === "kick") await member.kick("Yunya lockdown system");
	// else just drop the ban hammer on him :D
	else await member.ban({reason: "Yunya lockdown system"});
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
		if (commands.has(interaction.commandName)) {
			const command = commands.get(interaction.commandName);
			
			try {
				command.run(client, interaction);
			} catch (err) {
				await interaction.reply({
					content: "Something went wrong! Please contact the developer for more info!",
					ephemeral: true
				});
			}
		} else {
			await interaction.reply({
				content: "Invalid command!",
				ephemeral: true,
			});
		}
	}
});

client.login(process.env.BOT_TOKEN).catch(console.error);
