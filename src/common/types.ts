export interface MessagePlayload {
    message: string; // for now
    // data: TabData[]
}

export interface TabData {
    tabId: number,
    favIcon: string | null,
    tabIndex:number
    tabTitle: string
    tabUrl: string
}