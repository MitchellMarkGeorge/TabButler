import React, { useState } from "react";
import createCache from "@emotion/cache";
import { CacheProvider, css, Global } from "@emotion/react";
import { Input } from "./Input";
import { Container } from "./Container";
import { TabList } from "./TabList";
import { Empty } from "./Empty";
import { Heading } from "./Heading";
import { TabData } from "../../common/types";

interface Props {
  shadowRoot: ShadowRoot;
  currentTabs: TabData[];
}

// bug: when the component is unmounted, the style tags remain behind
export const Search = (props: Props) => {
  const [value, setValue] = useState("");
  const customCache = createCache({
    key: "tab-butler",
    container: props.shadowRoot,
  });

  // NOTE: default selected tab should be the first one

  const filterTabs = () => {
    if (value) {
      return props.currentTabs.filter(
        (tabData) =>
        // try to filter based on the tab title and the tab url
        // should I just do by one?
          tabData.tabTitle.toLowerCase().includes(value.toLowerCase()) ||
          tabData.tabUrl.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      return props.currentTabs;
    }
  };

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
        <Input
          placeholder="Search Tabs..."
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {filteredTabs.length === 0 ? (
          <Empty>
            <Heading color="rgba(255, 255, 255, 0.36)">No tabs to show</Heading>
          </Empty>
        ) : (
          <TabList>
              {filteredTabs.map((tabData) => (
                // use text elipsis is name is too long
                <div onClick={() => console.log(tabData)} key={tabData.tabId}>{tabData.tabTitle}</div>
              ))}
          </TabList>
        )}
      </Container>
    </CacheProvider>
  );
};
