'use strict';

// Utils
const { link } = require('../../utils/tg');

// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

// DB
const { isAdmin, isBanned } = require('../../stores/user');

// Actions
const ban = require('../../actions/ban');

const banHandler = async ({ chat, message, reply, telegram, me, state }) => {
	if (!state.isAdmin) return null;

	const userToBan = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: null;
	const reason = message.text.split(' ').slice(1).join(' ').trim();

	if (!userToBan) {
		return reply('ℹ️ <b>Reply to a message or mention a user.</b>',
			replyOptions);
	}

	if (message.chat.type === 'private' || userToBan.username === me) {
		return null;
	}

	if (await isAdmin(userToBan)) {
		return reply('ℹ️ <b>Can\'t ban other admins.</b>', replyOptions);
	}

	if (reason.length === 0) {
		return reply('ℹ️ <b>Need a reason to ban.</b>', replyOptions);
	}

	if (message.reply_to_message) {
		bot.telegram.deleteMessage(
			chat.id,
			message.reply_to_message.message_id);
	}

	if (await isBanned(userToBan)) {
		return reply(`🚫 ${link(userToBan)} <b>is already banned.</b>`,
			replyOptions);
	}

	await ban(userToBan, reason);

	return reply(`🚫 ${link(state.user)} <b>banned</b> ${link(userToBan)} ` +
		`<b>for:</b>\n\n${reason}`, replyOptions);
};

module.exports = banHandler;
