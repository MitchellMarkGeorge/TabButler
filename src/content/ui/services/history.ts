import { HistoryData, Message, OpenNewTabWithUrlPayload } from "@common/types";
import { sendMessageToBackground } from "../utils";

export const onHistoryItemClick = (historyData: HistoryData) => {
    const messagePayload: OpenNewTabWithUrlPayload = {
        message: Message.OPEN_NEW_TAB_WITH_URL,
        url: historyData.url,
    } 
    sendMessageToBackground(messagePayload);
}
