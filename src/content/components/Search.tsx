import React, {
  useEffect,
  useState,
} from "react";
import createCache from "@emotion/cache";
import { CacheProvider, css, Global } from "@emotion/react";
import { Input } from "./Input";
import { Container } from "./Container";
import { TabList } from "./TabList";
import { Empty } from "./Empty";
import { Heading } from "./Heading";
import { ChangeTabMessagePayload, Message, TabData } from "../../common/types";
import { TabListItem } from "./TabListItem";

interface Props {
  shadowRoot: ShadowRoot;
  currentTabs: TabData[];
}

export const Search = (props: Props) => {
  const [value, setValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const customCache = createCache({
    key: "tab-butler",
    container: props.shadowRoot,
  });


  const filterTabs = () => {
    if (value) {
      return props.currentTabs.filter(
        (tabData) =>
          // try to filter based on the tab title and the tab url
          tabData.tabTitle.toLowerCase().includes(value.toLowerCase()) ||
          tabData.tabUrl.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      return props.currentTabs;
    }
  };

  const onTabItemSelect = (tabData: TabData) => {
    const messagePayload: ChangeTabMessagePayload = {
      message: Message.CHANGE_TAB,
      tabId: tabData.tabId,
    };
    chrome.runtime.sendMessage(messagePayload);
  };

  const onSubmit = (event: any) => {
    event.preventDefault();
    const selectedTab = filteredTabs[selectedIndex];
    if (selectedTab) {
      const messagePayload: ChangeTabMessagePayload = {
        message: Message.CHANGE_TAB,
        tabId: selectedTab.tabId,
      };
      chrome.runtime.sendMessage(messagePayload);
    }
  };

  const onKeyPress = (event: any) => {
    if (event.key === "ArrowUp") {
      if (selectedIndex !== 0) {
        setSelectedIndex((selectectedIndex) => selectectedIndex - 1);
      } else {
        setSelectedIndex(filteredTabs.length - 1); // scroll to the buttom
      }
    } else if (event.key === "ArrowDown") {
      if (selectedIndex !== filteredTabs.length - 1) {
        setSelectedIndex((selectectedIndex) => selectectedIndex + 1);
      } else {
        setSelectedIndex(0); // scroll up to the start
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);

    return () => {
      window.removeEventListener("keydown", onKeyPress);
    };
  });

  const filteredTabs = filterTabs();

  return (
    <CacheProvider value={customCache}>
      <Global
        styles={css`
          * {
            box-sizing: border-box;
            font-family: system-ui, sans-serif;
          }
        `}
      />
      <Container>
        {/* this onsubmit only works if the inputr is focused... what if the input isnt focused???        */}
        <form onSubmit={onSubmit}>
          <Input
            placeholder="Search Tabs..."
            type="text"
            value={value}
            autoFocus
            onChange={(e) => {
              setSelectedIndex(0);
              setValue(e.target.value);
            }}
          />
        </form>
        {filteredTabs.length === 0 ? (
          <Empty>
            <Heading color="rgba(255, 255, 255, 0.36)">No tabs to show</Heading>
          </Empty>
        ) : (
          <TabList>
            {filteredTabs.map((tabData, index) => (
              // use text elipsis is name is too long
              // <div onClick={() => console.log(tabData)} key={tabData.tabId}>{tabData.tabTitle}</div>
              <TabListItem
                onClick={onTabItemSelect}
                tabData={tabData}
                selected={selectedIndex === index}
                // should this component have an onclick listener??
                key={tabData.tabId}
              />
            ))}
          </TabList>
        )}
      </Container>
    </CacheProvider>
  );
};
