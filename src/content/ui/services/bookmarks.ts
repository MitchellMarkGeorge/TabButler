import { BookmarkData, Message, OpenNewTabWithUrlPayload } from "@common/types";
import { sendMessageToBackground } from "../utils";

export const onBookmarkItemClick = (bookmarkData: BookmarkData) => {
    const messagePayload: OpenNewTabWithUrlPayload = {
        message: Message.OPEN_NEW_TAB_WITH_URL,
        url: bookmarkData.url,
    } 
    sendMessageToBackground(messagePayload);
}