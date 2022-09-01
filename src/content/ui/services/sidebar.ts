import { SearchMode, SideBarItem } from "@common/types";
import { AiOutlineSearch } from "@react-icons/all-files/ai/AiOutlineSearch";
import { AiOutlineHistory } from "@react-icons/all-files/ai/AiOutlineHistory";
import { BiChip } from "@react-icons/all-files/bi/BiChip";

export const sideBarItems: SideBarItem[] = [
  {
    searchMode: SearchMode.TAB_SEARCH,
    icon: AiOutlineSearch,
  },

  {
    searchMode: SearchMode.TAB_ACTIONS,
    icon: BiChip,
  },
  {
    searchMode: SearchMode.TAB_HISTORY,
    icon: AiOutlineHistory,
  },
];
