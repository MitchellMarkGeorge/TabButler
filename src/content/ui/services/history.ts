import { HistoryData, Message, OpenHistoryItemPayload } from "@common/types";
import { sendMessageToBackground } from "../utils";

export function getHistoryData() {
  return sendMessageToBackground<HistoryData[]>({
    message: Message.GET_HISTORY_DATA,
  });
}

const historyMatches = (searchValue: string, historyData: HistoryData) =>
  historyData.title.toLowerCase().includes(searchValue.toLowerCase()) ||
  historyData.url.toLowerCase().includes(searchValue.toLowerCase());

export const searchHistory = (searchValue: string, data: HistoryData[]) => {
  if (searchValue) {
    return data.filter((historyData) =>
      historyMatches(searchValue, historyData),
    );
  } else {
    return data;
  }
};

export const onHistoryItemClick = (historyData: HistoryData) => {
    const messagePayload: OpenHistoryItemPayload = {
        message: Message.OPEN_HISTORY_ITEM,
        url: historyData.url,
    } 
    sendMessageToBackground(messagePayload);
}
