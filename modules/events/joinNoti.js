const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "join",
  eventType: ["log:subscribe"],
  version: "1.0.1",
  credits: "Mirai Team",
  description: "Thông báo bot hoặc người vào nhóm",
  dependencies: {
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Threads }) {
  const { join } = require("path");
  const { threadID } = event;
  const data = (await Threads.getData(event.threadID)).data || {};
  const checkban = data.banOut || [];
  
  if (checkban.includes(checkban[0])) return;

  const currentUserID = api.getCurrentUserID();
  
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == currentUserID)) {
    api.changeNickname(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? " <3" : global.config.BOTNAME}`, threadID, currentUserID);
    const messageID = await api.sendMessage(
      `Kết nối thành công với bot ${(!global.config.BOTNAME) ? " <3" : global.config.BOTNAME} của ${global.config.AMDIN_NAME}, vui lòng sử dụng ${global.config.PREFIX}menu để xem toàn bộ lệnh của bot <3`,
      threadID
    );

    setTimeout(() => {
      api.unsendMessage(messageID.messageID);
    }, 10000); // 10000ms = 10s

  } else {
    try {
      const { createReadStream, existsSync, mkdirSync } = require("fs-extra");
      let { threadName, participantIDs } = await api.getThreadInfo(threadID);
      const threadData = global.data.threadData.get(parseInt(threadID)) || {};
      const cachePath = path.join(__dirname, "cache", "joinGif");
      const pathGif = path.join(cachePath, `hi.gif`);

      var mentions = [], nameArray = [], memLength = [], i = 0;

      for (const participant of event.logMessageData.addedParticipants) {
        const userName = participant.fullName;
        const userId = participant.userFbId;
        nameArray.push(userName);
        mentions.push({ tag: userName, id: userId }); // Tagging the user
        memLength.push(participantIDs.length - i++);
      }
      memLength.sort((a, b) => a - b);

      const joinDate = new Date().toLocaleDateString('vi-VN'); // Format join date
      const defaultMsg = "[ Welcome ]\n👋Xin chào {name}.\n🥁Chào mừng đã đến với {threadName}.\n💁Bạn {name} (ngày tham gia: {joinDate}) là thành viên thứ {soThanhVien} của nhóm\n🦑Tương tác đầy đủ nếu không muốn ra đảo chơi với cá mập";
      let msg = threadData.customJoin || defaultMsg;

      // Replace placeholders with actual data
      msg = msg
        .replace(/\{name}/g, nameArray.map((_, index) => mentions[index].tag).join(', ')) // Tag members
        .replace(/\{joinDate}/g, joinDate) 
        .replace(/\{type}/g, (memLength.length > 1) ? 'các bạn' : 'bạn')
        .replace(/\{soThanhVien}/g, memLength.join(', '))
        .replace(/\{threadName}/g, threadName);

      if (!existsSync(cachePath)) mkdirSync(cachePath, { recursive: true });

      let formPush;
      if (existsSync(pathGif)) {
        formPush = { body: msg, attachment: createReadStream(pathGif), mentions };
      } else {
        formPush = { body: msg, mentions };
      }

      // Using global.khanhdayr for attachments
      //const sentMessage = await api.sendMessage({
        //body: msg,
        //attachment: createReadStream(pathGif)
      //}, threadID);

    } catch (e) {
      return console.log(e);
    }
  }
};
