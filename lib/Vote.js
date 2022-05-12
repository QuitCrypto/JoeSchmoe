const ChannelUtils = require("../utils/channel-utils")
const REACTIONS = ["0️⃣", "1️⃣", "2️⃣","3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
const { MessageActionRow, MessageButton } = require('discord.js');

class Vote {
  static async getVoteResultString(guild, memberResults) {
    let string = "";
    for (let i = 0; i < Object.entries(memberResults).length; i++) {
      const [userId, votesArray] = Object.entries(memberResults)[i];
      const member = await guild.members.fetch(userId);
      const username = member.user.username;
      string = string.concat(`**${username}**: ${Vote.getAverageVote(votesArray) || "0"}\n`);
    }

    return string;
  }

  static getAverageVote(votesArray) {
    return votesArray.reduce((a,b) => a + b, 0) / votesArray.length 
  }

  constructor(client, guild, roleId, periodLength) {
    this.roleId = roleId;
    this.guild = guild;
    this.client = client;
    this.periodLength = periodLength;
    this.channels = [];
    this.results = {};
    this.qualifiedVoters = [];
    this.voteMessages = [];
    this.resultMessages = [];
    this.channelToUserMapping = {};
    this.members = null;
    this.initialize = this.initialize.bind(this);
    this.createChannelFor = this.createChannelFor.bind(this);
    this.end = this.end.bind(this);
    this.listen = this.listen.bind(this);
    this.remindAll = this.remindAll.bind(this);
    this.initiateSelfDestruct = this.initiateSelfDestruct.bind(this);
    this.numParticipants = 0;
  }

  async initialize() {
    let members = await this.guild.members.fetch()
    this.members = members.filter(member => member.roles.cache.get(this.roleId))

    this.members.forEach(member =>{
      this.createChannelFor(member, this.members);
      this.numParticipants += 1;
    })

    this.client.on("messageReactionAdd", this.listen)
    this.client.on("interactionCreate", this.initiateSelfDestruct)
  }

  async createChannelFor(member, members) {
    let channel = await ChannelUtils.createChannelFor(this.guild, member, this.client);
    this.channels.push(channel);

    await channel.send(`**Voting Period Open** - ${new Date().toUTCString()}\n\nYou have ${this.periodLength} minutes to submit a vote.  You MUST submit your vote using the button below.  If you don't, you will be marked non-participatory and receive a rating of 0 for the period regardless of how people mark your participation.`)

    this.channelToUserMapping[channel.id] = member.id;

    members.forEach(async roleMember => {
      if (roleMember.id === member.id) return;

      this.results[member.id] ||= {};
      this.results[member.id][roleMember.id] = [5];

      let voteMessage = await channel.send(`Please submit your vote for ${roleMember} by reacting below:`);
      this.voteMessages.push(voteMessage)

      await this.reactWithAll(voteMessage);
    })

    const resultMessage = await channel.send({
      content: await this.getResultMessageText(member.id),
      components: [
        new MessageActionRow()
                    .addComponents(
                      new MessageButton()
                        .setCustomId(member.id)
                        .setLabel("SUBMIT")
                        .setStyle('SUCCESS')
                    )
      ]
    });
    resultMessage.pin();
    this.resultMessages.push(resultMessage);
  }

  async reactWithAll(message) {
    for (let i = 1; i < REACTIONS.length; i++) {
      const reaction = REACTIONS[i];
      
      await message.react(reaction);
    }
  }

  async getResultMessageText(memberId) {
    const results = this.results[memberId];
    const voteResultString = await Vote.getVoteResultString(this.guild, results)

    return `<@${memberId}>, **Your current votes are**:\n\n${voteResultString}\n*Hit submit below to finalize this vote.*`
  }

  async listen(reaction, user) {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot || !reaction.message.guild ) return

    if (this.voteMessages.includes(reaction.message) && REACTIONS.includes(reaction.emoji.name)) {
      this.results[user.id][reaction.message.mentions.users.first().id] = [REACTIONS.indexOf(reaction.emoji.name)];
      reaction.users.remove(user);
      this.resultMessages.filter(rm => rm.mentions.users.first().id === user.id)[0].edit(await this.getResultMessageText(user.id));
    } 
  }

  remindAll() {
    this.channels.forEach(channel => {
      channel.send(`<@${this.channelToUserMapping[channel.id]}> 10 minutes remaining!  **Reminder:** If you do not submit a vote, you will be marked non-participatory and be given a rating of 0 for this period, regardless of how people mark your participation.`)
    })
  }

  async initiateSelfDestruct(interaction) {
    if (!interaction.isButton() || !this.channels.includes(interaction.channel)) return;
    this.qualifiedVoters.push(interaction.customId);
    await interaction.reply({ content:"Thank you, your vote has been recorded. This channel will self destruct in 5 seconds.", ephemeral: true });
    const index = this.channels.indexOf(interaction.channel);
    this.channels.splice(index, 1);

    setTimeout(() => interaction.channel.delete(), 5000);
  }

  end() {
    this.client.off("messageReactionAdd", this.listen)
    this.client.off("interactionCreate", this.initiateSelfDestruct)

    this.channels.forEach(channel => {
      channel.delete();
    })

    let voteScores = {};

    let memberVotes = Object.entries(this.results);
    for (let i = 0; i < memberVotes.length; i++) {
      const [memberId, votesHash] = memberVotes[i];
      if (!this.qualifiedVoters.includes(memberId)) {
        voteScores[memberId] = Array(this.numParticipants - 1).fill(0);
        continue;
      }

      let votes = Object.entries(votesHash);
      for (let j = 0; j < votes.length; j++) {
        const [memberIdVotedOn, vote] = votes[j];

        voteScores[memberIdVotedOn] ||= [];

        if (!this.qualifiedVoters.includes(memberIdVotedOn)) continue;
        voteScores[memberIdVotedOn] = voteScores[memberIdVotedOn].concat(vote);
      }
    }

    this.members.forEach(member => {
      voteScores[member.id] ||= Array(this.numParticipants - 1).fill(0);
    })

    return voteScores;
  }
}

module.exports = Vote;