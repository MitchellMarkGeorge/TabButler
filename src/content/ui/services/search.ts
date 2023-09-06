import { Message, SearchPayload,  SearchResponse } from "@common/types";
import { sendMessageToBackground } from "../utils";

export function search(query: string) {
    const messagePaylod: SearchPayload = { message: Message.SEARCH, query };
    return sendMessageToBackground<SearchResponse>(messagePaylod);
}