import { SearchMode, SideBarItem } from "@common/types";
import { AiOutlineSearch } from "@react-icons/all-files/ai/AiOutlineSearch";
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
];
