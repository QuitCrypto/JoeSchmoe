// const { 
//   Client, 
//   SnowflakeUtil, 
//   Intents, 
//   Guild, 
//   Channel, 
//   GuildChannel, 
//   TextChannel, 
//   User, 
//   GuildMember, 
//   Message, 
//   Permissions 
// } = require("discord.js");

// module.exports = class MockDiscord {
//   constructor() {
//     this.mockClient();
//     this.mockGuild();
//     this.mockChannel();
//     this.mockGuildChannel();
//     this.mockTextChannel();
//     this.mockUser();
//     this.mockGuildMember();
//     this.guild.members.add(this.guildMember.id, []);
//     this.mockMessage();
//     this.mockRole();
//   }
//   getClient() {
//     return this.client;
//   }
//   getGuild() {
//     return this.guild;
//   }
//   getChannel() {
//     return this.channel;
//   }
//   getGuildChannel() {
//     return this.guildChannel;
//   }
//   getTextChannel() {
//     return this.textChannel;
//   }
//   getUser() {
//     return this.user;
//   }
//   getGuildMember() {
//     return this.guildMember;
//   }
//   getMessage() {
//     return this.message;
//   }
//   mockClient() {
//     this.client = new Client({
//       intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
//       partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
//     });
//   }
//   mockGuild() {
//     this.guild = new Guild(this.client, {
//         unavailable: false,
//         id: "889934830928801833",
//         name: "mocked js guild",
//         icon: "mocked guild icon url",
//         splash: "mocked guild splash url",
//         region: "eu-west",
//         member_count: 42,
//         large: false,
//         features: [],
//         application_id: SnowflakeUtil.generate(),
//         afkTimeout: 1000,
//         afk_channel_id: SnowflakeUtil.generate(),
//         system_channel_id: SnowflakeUtil.generate(),
//         embed_enabled: true,
//         verification_level: 2,
//         explicit_content_filter: 3,
//         mfa_level: 8,
//         joined_at: new Date("2018-01-01").getTime(),
//         owner_id: SnowflakeUtil.generate(),
//         channels: [],
//         roles: [],
//         presences: [],
//         voice_states: [],
//         emojis: [],
//     });
//   }
//   mockChannel() {
//     this.channel = new Channel(this.client, {
//         id: "904223265097138197",
//     });
//   }
//   mockGuildChannel() {
//     this.guildChannel = new GuildChannel(this.guild, Object.assign(Object.assign({}, this.channel), { name: "guild-channel", position: 1, parent_id: "123456789", permission_overwrites: [] }));
//   }
//   mockTextChannel() {
//     this.textChannel = new TextChannel(this.guild, Object.assign(Object.assign({}, this.guildChannel), { topic: "topic", nsfw: false, last_message_id: "123456789", lastPinTimestamp: new Date("2019-01-01").getTime(), rate_limit_per_user: 0 }));
//   }
//   mockUser() {
//     this.user = new User(this.client, {
//         id: "716464268702384219",
//         username: "user username",
//         discriminator: "user#0000",
//         avatar: "user avatar url",
//         bot: false,
//     });
//   }
//   mockGuildMember() {
//     this.guildMember = new GuildMember(this.client, {
//         deaf: false,
//         mute: false,
//         self_mute: false,
//         self_deaf: false,
//         session_id: SnowflakeUtil.generate(),
//         channel_id: SnowflakeUtil.generate(),
//         nick: "nick",
//         joined_at: new Date("2020-01-01").getTime(),
//         user: this.user,
//         roles: [],
//     }, this.guild);
//   }
//   mockMessage() {
//     this.message = new Message(this.client, {
//         id: "960011562343624724",
//         type: "DEFAULT",
//         content: "this is the message content",
//         author: this.user,
//         webhook_id: null,
//         member: this.guildMember,
//         pinned: false,
//         tts: false,
//         nonce: "nonce",
//         embeds: [],
//         attachments: [],
//         edited_timestamp: null,
//         reactions: [],
//         mentions: [],
//         mention_roles: [],
//         mention_everyone: [],
//         hit: false,
//     }, this.textChannel);
//   }

//   mockRole() {
//     this.guild.roles.create({ name: 'Mod', permissions: [Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.KICK_MEMBERS] });
//   }
// }